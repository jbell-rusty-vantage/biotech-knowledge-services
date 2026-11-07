#!/usr/bin/env node
// Seeds a FRESH disposable database for one arm of the write-recovery pass (protocol section 10): the fixture round
// (schema/program/final/fixtures-v2/ROUND.json order) MINUS write-seed-exclusions.json, through the executor HTTP
// plan -> admit -> apply path (local-dev executor with a throwaway witness key). Synthetic fixture data only.
//
//   node evals/v2/write-recovery/seed-write-pass.mjs --out <armRunDir> --arm A|B [--base http://127.0.0.1:4140]
//
// Stops with an error when a seed effectKey was already applied (the database is not fresh): one fresh database per
// arm. Writes <armRunDir>/write-seed-rows.json and write-seed-report.json. The executor's custody (plans, receipts)
// must live under <armRunDir>/executor so `derive-gold-seeded.mjs --compare` can check arm equivalence.
import crypto from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const out = resolve(opt("--out") ?? "");
const arm = opt("--arm");
const base = opt("--base", "http://127.0.0.1:4140");
if (!opt("--out") || !["A", "B"].includes(arm)) { console.error("usage: --out <armRunDir> --arm A|B [--base url]"); process.exit(2); }
const ex = JSON.parse(readFileSync("evals/v2/write-recovery/write-seed-exclusions.json", "utf8"));
const roundBytes = readFileSync("schema/program/final/fixtures-v2/ROUND.json");
const sha = (b) => `sha256:${crypto.createHash("sha256").update(b).digest("hex")}`;
if (sha(roundBytes) !== ex.roundSha256) throw new Error("ROUND.json changed since the exclusions were recorded");
for (const e of ex.exclude) if (sha(readFileSync(e.path)) !== e.sha256) throw new Error(`${e.path} changed since the exclusions were recorded`);
const excluded = new Set(ex.exclude.map((e) => e.path));
const round = JSON.parse(roundBytes.toString("utf8"));
const post = async (p, body) => { const r = await fetch(base + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json().catch(() => null) }; };
const describe = await (await fetch(`${base}/describe`)).json();
mkdirSync(out, { recursive: true });
const rows = [];
const t0 = Date.now();
for (const [i, path] of round.order.entries()) {
  if (excluded.has(path)) { rows.push({ i, path, excluded: true }); continue; }
  const intent = JSON.parse(readFileSync(resolve(path), "utf8"));
  const row = { i, path, intentId: intent.intentId };
  const pl = await post("/kg/plan", intent);
  const plan = pl.body?.plan;
  row.planHttp = pl.status; row.planOutcome = plan?.outcome ?? pl.body?.code; row.planRef = pl.body?.planRef;
  if (plan && (plan.outcome === "applicable" || plan.outcome === "partial")) {
    const admitted = plan.proposals.filter((p) => p.disposition === "admitted").map((p) => p.proposalId);
    const effectKey = `ek-write-${arm}-seed-${String(i).padStart(2, "0")}-${intent.intentId}`.slice(0, 200);
    const partialPolicy = plan.outcome === "applicable" ? "all" : { include: admitted };
    const ad = await post("/kg/admit", { planRef: plan.planRef, effectKey, partialPolicy });
    if (ad.status !== 200) row.admit = ad.body;
    else {
      const ap = await post("/kg/apply", { schemaVersion: "biotech-knowledge-apply.v2", planRef: plan.planRef, expectedPlanDigest: plan.planDigest, intentDigest: plan.binding.intentDigest, effectKey, partialPolicy, witness: ad.body });
      row.effectKey = effectKey; row.applyHttp = ap.status; row.applied = ap.body?.outcome ?? ap.body?.code;
      if (row.applied === "BKS_EFFECT_CONFLICT") throw new Error(`database is not fresh: ${effectKey} already applied (one fresh database per arm)`);
    }
  }
  rows.push(row);
  process.stdout.write(`${i} ${row.planOutcome} ${row.applied ?? "-"}\n`);
}
const tally = (k) => rows.filter((r) => !r.excluded).reduce((a, r) => ((a[String(r[k])] = (a[String(r[k])] ?? 0) + 1), a), {});
writeFileSync(resolve(out, "write-seed-rows.json"), JSON.stringify({ arm, base, elapsedMs: Date.now() - t0, rows }, null, 2));
const report = { format: "bks-eval-write-seed.v1", arm, releaseId: describe.releaseId, schemaReleaseDigest: describe.schemaReleaseDigest, exclusions: ex.exclude.map((e) => ({ path: e.path, intentId: e.intentId })), intents: rows.length, excluded: rows.filter((r) => r.excluded).length, planOutcome: tally("planOutcome"), applied: tally("applied") };
writeFileSync(resolve(out, "write-seed-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

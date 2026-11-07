#!/usr/bin/env node
// Re-derives the native-read gold from a SEEDED eval environment's own evidence (protocol section 9; lead-authorized
// 2026-10-12). Never reads any arm's answers.
//
//   node evals/v2/derive-gold-seeded.mjs --seed <evalRunDir> [--out evals/v2/native-read/gold.seeded.json]
//   node evals/v2/derive-gold-seeded.mjs --compare <evalRunDirA> <evalRunDirB>    # same seeded graph? (counts + uid sets)
//
// Inputs (seed evidence only): the run's stored plans and receipts (`executor/{plans,receipts}` or
// `seed-custody/{plans,receipts}`), the fixtures-v2 intents they were compiled from (matched by intentId), and, for the
// question each task asks, the original native-read gold (v1 fixture rows: predicate and subject/object/asserter uids).
//
// Rules:
//   fixtureAssertion  the v1 row's triple (predicate, subject, object) is located in the seeded intents by predicate and
//                     by the uid SEGMENT of subject and object (hu:<type>:<segment>; the writer may mint another type
//                     prefix). Positive gold when a matching proposal's receipt outcome is `applied` AND its minted
//                     assertion uid is among the receipt's created nodes: objectUid / subjectUid / asserterUid from the
//                     plan's subject uids, assertionUid from the plan mints, snapshotContentHashes from the intent sources
//                     holding the evidence locators. Otherwise NEGATIVE gold {status: "empty"} with the reason.
//   fixtureEntity     the v1 entity's uid segment is located among the plan subjects carrying the prompt's identifier.
//                     Positive gold {uid, nodeType, basis} when a receipt created a HAS_IDENTIFIER from that uid;
//                     otherwise NEGATIVE gold {status: "empty"}.
//   other kinds       (status, literal, manifest pointers) are copied unchanged.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const FX2 = path.join(REPO, "schema", "program", "final", "fixtures-v2");
const load = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sha = (b) => `sha256:${crypto.createHash("sha256").update(b).digest("hex")}`;
const seg = (uid) => (typeof uid === "string" ? uid.split(":").slice(2).join(":") : null);
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };

function custodyOf(runDir) {
  for (const c of ["executor", "seed-custody", "custody"]) {
    const d = path.join(runDir, c);
    if (fs.existsSync(path.join(d, "receipts")) && fs.existsSync(path.join(d, "plans"))) return d;
  }
  throw new Error(`${runDir}: no executor/ or seed-custody/ with plans and receipts`);
}

function intentsById() {
  const out = new Map();
  const walk = (d) => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".json")) { let i; try { i = load(p); } catch { continue; } if (i?.schemaVersion !== "biotech-knowledge-intent.v2" || !i.intentId) continue; if (out.has(i.intentId)) throw new Error(`duplicate intentId ${i.intentId}`); out.set(i.intentId, { intent: i, path: path.relative(REPO, p).replace(/\\/g, "/"), fixture: path.relative(FX2, path.dirname(p)).replace(/\\/g, "/") }); }
    }
  };
  walk(FX2);
  return out;
}

function loadSeed(runDir) {
  const c = custodyOf(runDir);
  // --seed-only: keep only seed receipts (effect keys containing "-seed-"), so a write-pass arm's own task writes are excluded.
  const seedOnly = argv.includes("--seed-only");
  const receipts = fs.readdirSync(path.join(c, "receipts")).filter((f) => f.endsWith(".json")).map((f) => ({ file: f, r: load(path.join(c, "receipts", f)) })).filter((x) => !seedOnly || /-seed-/.test(x.r.effect?.effectKey ?? ""));
  const plans = new Map(fs.readdirSync(path.join(c, "plans")).filter((f) => f.endsWith(".json")).map((f) => { const p = load(path.join(c, "plans", f)); const plan = p.plan ?? p; return [plan.planRef, plan]; }));
  const intents = intentsById();
  const applied = [];
  for (const { file, r } of receipts) {
    if (!["applied", "partial"].includes(r.outcome)) continue;
    const plan = plans.get(r.plan.planRef);
    if (!plan) throw new Error(`receipt ${file}: plan ${r.plan.planRef} missing`);
    const it = intents.get(r.intent.intentId);
    if (!it) throw new Error(`receipt ${file}: intent ${r.intent.intentId} not in fixtures-v2`);
    applied.push({ file, receipt: r, plan, ...it });
  }
  return { custody: path.relative(REPO, c).replace(/\\/g, "/"), receipts, plans, applied, intents };
}

const predicateOf = (p) => p.relationshipType ?? p.assertion?.predicate ?? null;
const endsOf = (p) => ({ from: p.fromRef ?? p.subjectRef ?? null, to: p.toRef ?? p.objectRef ?? null });

function deriveAssertion(seed, g) {
  const want = { predicate: g.predicate, s: seg(g.subjectUid), o: seg(g.objectUid) };
  const candidates = [];
  for (const a of seed.applied) {
    const uidOfRef = new Map(a.plan.subjects.map((s) => [s.ref, s.uid]));
    for (const p of a.intent.proposals) {
      if (!["edge.assert", "assertion.relate"].includes(p.kind) || predicateOf(p) !== want.predicate) continue;
      const e = endsOf(p);
      if (seg(uidOfRef.get(e.from)) !== want.s || seg(uidOfRef.get(e.to)) !== want.o) continue;
      const pp = a.plan.proposals.find((x) => x.proposalId === p.proposalId);
      const rp = a.receipt.proposals.find((x) => x.proposalId === p.proposalId);
      const assertionUid = pp?.mints?.assertion ?? null;
      const created = assertionUid && a.receipt.effects.nodes.some((n) => n.uid === assertionUid);
      candidates.push({ fixture: a.fixture, intentId: a.intent.intentId, receipt: a.file, proposalId: p.proposalId, disposition: pp?.disposition ?? null, receiptOutcome: rp?.outcome ?? null, receiptReason: rp?.reason ?? null, assertionUid, created: Boolean(created), p, uidOfRef, intent: a.intent });
    }
  }
  const hit = candidates.find((c) => c.receiptOutcome === "applied" && c.created);
  const trail = candidates.map(({ p, uidOfRef, intent, ...c }) => c);
  if (!hit) {
    const reason = candidates.length ? `matching proposal(s) not applied: ${trail.map((c) => `${c.fixture}#${c.proposalId} ${c.receiptOutcome ?? c.disposition}${c.receiptReason ? ` (${c.receiptReason.slice(0, 120)})` : ""}`).join("; ")}` : "no seeded intent proposes this triple (v1 run-record row absent from fixtures-v2, or its plan was held and never applied)";
    return { gold: { answer: { status: "empty", negative: true, reason } }, trail };
  }
  const locRefs = (hit.p.evidence ?? []).map((e) => (typeof e === "string" ? e : e.locator ?? e.ref)).filter(Boolean);
  const snapshotContentHashes = [...new Set(hit.intent.sources.filter((s) => (s.locators ?? []).some((l) => locRefs.includes(l.ref))).map((s) => s.snapshot?.contentHash).filter(Boolean))];
  const e = endsOf(hit.p);
  return {
    gold: { answer: { predicate: want.predicate, subjectUid: hit.uidOfRef.get(e.from), objectUid: hit.uidOfRef.get(e.to), asserterUid: hit.p.asserterRef ? hit.uidOfRef.get(hit.p.asserterRef) ?? null : null, assertionUid: hit.assertionUid, locatorRefs: locRefs, snapshotContentHashes }, seeded: { fixture: hit.fixture, intentId: hit.intentId, proposalId: hit.proposalId, receipt: hit.receipt } },
    trail,
  };
}

function deriveEntity(seed, g, prompt) {
  const s = seg(g.uid);
  const trail = [];
  for (const a of seed.applied) {
    for (const sub of a.plan.subjects) {
      if (seg(sub.uid) !== s) continue;
      const decl = a.intent.subjects.find((x) => x.ref === sub.ref);
      const ids = [...(decl?.identifiers ?? []), ...a.intent.proposals.filter((p) => p.kind === "identifier.attach" && p.subjectRef === sub.ref).map((p) => p.identifier)];
      const promptIds = ids.filter((i) => i?.value && prompt.includes(i.value));
      const hasId = a.receipt.effects.relationships.some((r) => r.type === "HAS_IDENTIFIER" && r.fromUid === sub.uid);
      trail.push({ fixture: a.fixture, intentId: a.intent.intentId, receipt: a.file, ref: sub.ref, uid: sub.uid, nodeType: sub.nodeType, promptIdentifierDeclared: promptIds.length > 0, hasIdentifierCreated: hasId });
    }
  }
  const hit = trail.find((t) => t.promptIdentifierDeclared && t.hasIdentifierCreated);
  if (!hit) return { gold: { answer: { status: "empty", negative: true, reason: trail.length ? "the node was seeded but no receipt created the prompt's identifier on it" : "the node was never seeded (plan held, or entity absent from fixtures-v2)" } }, trail };
  return { gold: { answer: { uid: hit.uid, nodeType: hit.nodeType, basis: g.basis }, seeded: { fixture: hit.fixture, intentId: hit.intentId, receipt: hit.receipt } }, trail };
}

if (argv[0] === "--compare") {
  const [A, B] = [argv[1], argv[2]].map((d) => loadSeed(path.resolve(d)));
  const view = (s) => {
    const nodes = new Set(), rels = new Set(), props = [];
    for (const a of s.applied) {
      for (const n of a.receipt.effects.nodes) nodes.add(`${n.label}|${n.uid}`);
      for (const r of a.receipt.effects.relationships) rels.add(r.key ?? `${r.type}|${r.fromUid}|${r.toUid}`);
      for (const p of a.receipt.proposals) props.push(`${a.intent.intentId}|${p.proposalId}|${p.outcome}`);
    }
    return { receipts: s.receipts.length, applied: s.applied.length, outcomes: s.receipts.reduce((m, x) => ((m[x.r.outcome] = (m[x.r.outcome] ?? 0) + 1), m), {}), nodes, rels, props: new Set(props) };
  };
  const [a, b] = [view(A), view(B)];
  const diff = (x, y) => [...x].filter((k) => !y.has(k));
  const res = {
    a: { custody: A.custody, receipts: a.receipts, outcomes: a.outcomes, nodes: a.nodes.size, relationships: a.rels.size, proposalOutcomes: a.props.size },
    b: { custody: B.custody, receipts: b.receipts, outcomes: b.outcomes, nodes: b.nodes.size, relationships: b.rels.size, proposalOutcomes: b.props.size },
    onlyA: { nodes: diff(a.nodes, b.nodes).slice(0, 10), rels: diff(a.rels, b.rels).slice(0, 10), props: diff(a.props, b.props).slice(0, 10) },
    onlyB: { nodes: diff(b.nodes, a.nodes).slice(0, 10), rels: diff(b.rels, a.rels).slice(0, 10), props: diff(b.props, a.props).slice(0, 10) },
    digests: { a: { nodes: sha([...a.nodes].sort().join("\n")), rels: sha([...a.rels].sort().join("\n")), props: sha([...a.props].sort().join("\n")) }, b: { nodes: sha([...b.nodes].sort().join("\n")), rels: sha([...b.rels].sort().join("\n")), props: sha([...b.props].sort().join("\n")) } },
  };
  res.identical = res.digests.a.nodes === res.digests.b.nodes && res.digests.a.rels === res.digests.b.rels && res.digests.a.props === res.digests.b.props;
  console.log(JSON.stringify(res, null, 2));
  process.exit(res.identical ? 0 : 1);
}

const seedDir = path.resolve(opt("--seed") ?? "");
const out = path.resolve(opt("--out") ?? path.join(HERE, "native-read", "gold.seeded.json"));
const seed = loadSeed(seedDir);
const spec = load(path.join(HERE, "native-read", "gold-spec.json")).gold;
const original = load(path.join(HERE, "native-read", "gold.json")).gold;
const tasks = load(path.join(HERE, "native-read", "tasks.json")).tasks;
const gold = {};
const log = [];
for (const t of tasks) {
  const s = spec[t.id];
  const g = original[t.id];
  let r;
  if (s.kind === "fixtureAssertion") r = deriveAssertion(seed, g.answer);
  else if (s.kind === "fixtureEntity") r = deriveEntity(seed, g.answer, t.prompt);
  else r = { gold: g, trail: [], unchanged: true };
  gold[t.id] = r.gold;
  log.push({ id: t.id, kind: s.kind, result: r.unchanged ? "unchanged" : r.gold.answer.negative ? "negative" : "positive", original: g.answer, seeded: r.gold.answer, trail: r.trail });
}
const receiptDigest = sha(seed.receipts.map((x) => `${x.file}:${sha(JSON.stringify(x.r))}`).sort().join("\n"));
const doc = {
  format: "bks-eval-gold.v1",
  suite: "native-read",
  variant: "seeded",
  derivedFrom: { method: "evals/v2/derive-gold-seeded.mjs", seedRun: path.relative(REPO, seedDir).replace(/\\/g, "/"), custody: seed.custody, receipts: seed.receipts.length, appliedReceipts: seed.applied.length, receiptSetDigest: receiptDigest, originalGold: sha(fs.readFileSync(path.join(HERE, "native-read", "gold.json"))), goldSpec: sha(fs.readFileSync(path.join(HERE, "native-read", "gold-spec.json"))), tasks: sha(fs.readFileSync(path.join(HERE, "native-read", "tasks.json"))) },
  gold,
};
const text = JSON.stringify(doc, null, 2) + "\n";
fs.writeFileSync(out, text);
const logFile = out.replace(/\.json$/, ".derivation-log.json");
fs.writeFileSync(logFile, JSON.stringify({ format: "bks-eval-gold-derivation-log.v1", goldFile: path.relative(REPO, out).replace(/\\/g, "/"), goldDigest: sha(Buffer.from(text)), entries: log }, null, 2) + "\n");
const tally = log.reduce((m, e) => ((m[e.result] = (m[e.result] ?? 0) + 1), m), {});
console.log(JSON.stringify({ out: path.relative(REPO, out), log: path.relative(REPO, logFile), goldDigest: sha(Buffer.from(text)), tally, receipts: seed.receipts.length, applied: seed.applied.length }, null, 2));

#!/usr/bin/env node
// Scores paired evaluation runs against the frozen v2 gold (no LLM here).
//
//   node evals/v2/score.mjs --run <runDir> --bindings <bindings.json> [--manifest <migration-manifest.json>] [--report md|json] [--seed 20261011]
//   node evals/v2/score.mjs --self-test      # SYNTHETIC arms built from gold; proves the scorer and gate logic only
//
// Run layout: <runDir>/<arm>/<suite>/<taskId>/answer.json and trace.json ({toolCalls, inputTokens, outputTokens, elapsedMs, paidUsd?}).
// bindings.json binds the ${PLACEHOLDERS} (RELEASE_ID, SCHEMA_RELEASE_DIGEST, ...). A missing answer is a failure, never skipped.
// Gates (IMPLEMENTATION section 3; never weakened here): 100% pin-valid citations and exact-ID lookups; zero critical failures;
// discovery Recall@10 >= 0.95; end-to-end supported-task success >= 0.90; hybrid default only if paraphrase Recall@10 +5 pp or
// median discovery tokens -15% without success regression. Bootstrap 95% CIs (percentile, 10,000 resamples, seeded).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUITES = ["schema-discovery", "native-read", "write-recovery", ...fs.readdirSync(path.dirname(fileURLToPath(import.meta.url))).filter((n) => n.startsWith("schema-discovery-certify") && fs.existsSync(path.join(path.dirname(fileURLToPath(import.meta.url)), n, "gold.json"))).sort()];
const load = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const args = {};
for (let i = 2; i < process.argv.length; i++) if (process.argv[i].startsWith("--")) args[process.argv[i].slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : true;

const tasksOf = (suite) => load(path.join(HERE, suite, "tasks.json")).tasks;
// --gold native-read=gold.seeded.json scores a suite against a recorded alternative gold (protocol section 9).
const goldOverride = Object.fromEntries(String(args.gold ?? "").split(",").filter(Boolean).map((kv) => kv.split("=")));
const goldOf = (suite) => load(path.join(HERE, suite, goldOverride[suite] ?? "gold.json")).gold;
// --adapter trace-evidence: structural only (protocol section 9): native-read trace.snapshotContentHashes from trace.evidence[].snapshotContentHash.
function adapt(suite, ans) {
  if (args.adapter !== "trace-evidence" || suite !== "native-read" || !ans) return ans;
  const a = JSON.parse(JSON.stringify(ans));
  const t = (a.answer ?? a).trace;
  if (t && !t.snapshotContentHashes && Array.isArray(t.evidence)) t.snapshotContentHashes = [...new Set(t.evidence.map((e) => e.snapshotContentHash).filter(Boolean))];
  return a;
}
const eqSet = (a, b) => JSON.stringify([...(a ?? [])].map(String).sort()) === JSON.stringify([...(b ?? [])].map(String).sort());
const subset = (a, b) => (a ?? []).every((x) => (b ?? []).map(String).includes(String(x)));
const ptr = (obj, p) => p.split("/").slice(1).reduce((o, k) => (o == null ? undefined : o[k.replace(/~1/g, "/").replace(/~0/g, "~")]), obj);

function judge(suite, task, gold, ans, ctx) {
  const out = { pass: false, recall10: null, pinValid: null, reasons: [] };
  if (!ans) {
    out.reasons.push("missing answer.json");
    return out;
  }
  const a = ans.answer ?? ans;
  if (suite.startsWith("schema-discovery")) {
    const hits = (ans.hits ?? []).slice(0, 10);
    out.recall10 = gold.cardIds.some((c) => hits.includes(c)) ? 1 : 0;
    const cites = ans.citations ?? [];
    out.pinValid = cites.length > 0 && cites.every((c) => c.releaseDigest === ctx.bindings.SCHEMA_RELEASE_DIGEST) ? 1 : 0;
    const g = gold.answer;
    let ok;
    if (g.exists === false) ok = a.exists === false && subset(g.replacementTypes, a.replacementTypes);
    else if (g.hops) ok = Array.isArray(a.hops) && a.hops.length === g.hops.length && g.hops.every((h, i) => a.hops[i]?.type === h.type && a.hops[i]?.from === h.from && a.hops[i]?.to === h.to);
    else if (g.enum) ok = eqSet(a.values, g.values) && !(g.mustNotContain ?? []).some((v) => (a.values ?? []).includes(v));
    else if (g.predicate) ok = a.predicate === g.predicate && g.rows.some((row) => Object.entries(row).every(([k, v]) => JSON.stringify(a[k]) === JSON.stringify(v) || (Array.isArray(v) && eqSet(a[k], v))));
    else if (g.rows) ok = a.type === g.type && g.rows.some((row) => Object.entries(row).every(([k, v]) => k === "module" || JSON.stringify(a[k]) === JSON.stringify(v) || (Array.isArray(v) && eqSet(a[k], v))));
    else ok = a.type === g.type && Object.entries(g).every(([k, v]) => k === "type" || JSON.stringify(a[k]) === JSON.stringify(v) || (Array.isArray(v) && eqSet(a[k], v)));
    if (!ok) out.reasons.push("answer differs from gold");
    if (!out.pinValid) out.reasons.push("citation not pinned to the bound release");
    out.pass = Boolean(ok && out.pinValid);
    return out;
  }
  if (suite === "native-read") {
    const g = gold.answer;
    let ok = false;
    if (g.objectUid !== undefined) {
      const tr = a.trace ?? {};
      ok = a.uids?.object === g.objectUid && (g.asserterUid == null || a.uids?.asserter === g.asserterUid) && subset(g.snapshotContentHashes, tr.snapshotContentHashes);
    } else if (g.uid !== undefined) ok = a.uids?.node === g.uid && a.basis === g.basis;
    else if (gold.deferred) {
      const want = ctx.manifest ? ptr(ctx.manifest, gold.deferred.pointer) : undefined;
      if (want === undefined) out.reasons.push("deferred gold needs --manifest");
      ok = want !== undefined && JSON.stringify(a.value) === JSON.stringify(want) && (g.status == null || a.status === g.status) && (g.sourceKind == null || a.sourceKind === g.sourceKind);
    } else if (g.status !== undefined) ok = a.status === g.status;
    else if (g.value !== undefined) ok = JSON.stringify(a.value) === JSON.stringify(g.value);
    if (!ok) out.reasons.push("answer differs from gold");
    out.pass = ok;
    return out;
  }
  // write-recovery
  const g = gold.answer;
  const inv = (names) => (names ?? []).every((n) => a.invariants?.[n] === true);
  const one = (gg, aa) => {
    if (gg.error) return aa.error === gg.error;
    if (gg.outcome) return aa.outcome === gg.outcome && (gg.invariants ?? []).every((n) => aa.invariants?.[n] === true);
    if (gg.status) return aa.status === gg.status && (gg.invariants ?? []).every((n) => aa.invariants?.[n] === true);
    if (gg.markerStatus) return aa.markerStatus === gg.markerStatus && (gg.invariants ?? []).every((n) => aa.invariants?.[n] === true);
    if (gg.oneOf) return Array.isArray(aa.outcomes) && aa.outcomes.some((o) => gg.oneOf.includes(o)) && aa.outcomes.some((o) => gg.otherOneOf.includes(o)) && (gg.invariants ?? []).every((n) => aa.invariants?.[n] === true);
    if (gg.invariants) return (gg.invariants ?? []).every((n) => aa.invariants?.[n] === true);
    return false;
  };
  const ok = g.sequence ? Array.isArray(a.sequence) && g.sequence.length === a.sequence.length && g.sequence.every((s, i) => one(s, a.sequence[i])) : one(g, a);
  void inv;
  if (!ok) out.reasons.push("outcome differs from gold");
  out.pass = ok;
  return out;
}

function rng(seed) {
  let x = seed >>> 0 || 1;
  return () => ((x = (Math.imul(x ^ (x >>> 15), 2246822519) + 0x9e3779b9) >>> 0) / 2 ** 32);
}
function bootstrap(values, seed, n = 10000) {
  if (!values.length) return { mean: null, lo: null, hi: null, n: 0 };
  const r = rng(seed);
  const means = [];
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < values.length; j++) s += values[Math.floor(r() * values.length)];
    means.push(s / values.length);
  }
  means.sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return { mean, lo: means[Math.floor(0.025 * n)], hi: means[Math.floor(0.975 * n)], n: values.length };
}
const median = (xs) => {
  const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null;
};

export function score(runDir, { bindings, manifest = null, seed = 20261011 }) {
  const arms = fs.readdirSync(runDir).filter((d) => fs.statSync(path.join(runDir, d)).isDirectory()).sort();
  const result = { format: "bks-eval-score.v1", seed, bindings, arms: {}, paired: {} };
  const perTask = {};
  for (const arm of arms) {
    const armRes = { suites: {}, gates: {} };
    for (const suite of SUITES) {
      const dir = path.join(runDir, arm, suite);
      if (!fs.existsSync(dir)) continue;
      const tasks = tasksOf(suite);
      const gold = goldOf(suite);
      const rows = tasks.map((t) => {
        const f = path.join(dir, t.id, "answer.json");
        const tf = path.join(dir, t.id, "trace.json");
        const ans = adapt(suite, fs.existsSync(f) ? load(f) : null);
        const trace = fs.existsSync(tf) ? load(tf) : {};
        const j = judge(suite, t, gold[t.id], ans, { bindings, manifest });
        return { id: t.id, module: t.module ?? null, category: t.category, critical: Boolean(t.critical), ...j, tokens: (trace.inputTokens ?? 0) + (trace.outputTokens ?? 0), elapsedMs: trace.elapsedMs ?? null, paidUsd: trace.paidUsd ?? 0 };
      });
      for (const r of rows) (perTask[`${suite}:${r.id}`] ??= {})[arm] = r;
      const success = bootstrap(rows.map((r) => (r.pass ? 1 : 0)), seed);
      const recall = suite.startsWith("schema-discovery") ? bootstrap(rows.map((r) => r.recall10 ?? 0), seed + 1) : null;
      const paraRecall = suite.startsWith("schema-discovery") ? bootstrap(rows.filter((r) => r.category === "paraphrase").map((r) => r.recall10 ?? 0), seed + 2) : null;
      const byModule = {};
      for (const r of rows) {
        const k = r.module ?? r.category;
        (byModule[k] ??= { tasks: 0, failures: [] }).tasks++;
        if (!r.pass) byModule[k].failures.push(r.id);
      }
      armRes.suites[suite] = {
        tasks: rows.length,
        success,
        recall10: recall,
        paraphraseRecall10: paraRecall,
        pinValidCitations: suite.startsWith("schema-discovery") ? rows.filter((r) => r.pinValid).length / rows.length : null,
        criticalFailures: rows.filter((r) => r.critical && !r.pass).map((r) => r.id),
        byModule,
        medianTokens: median(rows.map((r) => r.tokens)),
        p95ElapsedMs: (() => {
          const s = rows.map((r) => r.elapsedMs).filter(Number.isFinite).sort((a, b) => a - b);
          return s.length ? s[Math.min(s.length - 1, Math.ceil(0.95 * s.length) - 1)] : null;
        })(),
        paidUsd: rows.reduce((a, r) => a + (r.paidUsd || 0), 0),
        failures: rows.filter((r) => !r.pass).map((r) => ({ id: r.id, reasons: r.reasons })),
      };
    }
    const sd = armRes.suites["schema-discovery"];
    const allRows = SUITES.flatMap((s) => (armRes.suites[s] ? Object.values(perTask).map((p) => p[arm]).filter((r) => r && perTaskSuite(perTask, r, s)) : []));
    const e2e = bootstrap(allRows.map((r) => (r.pass ? 1 : 0)), seed + 3);
    armRes.gates = {
      pinValidCitations: sd ? { value: sd.pinValidCitations, required: 1, pass: sd.pinValidCitations === 1 } : null,
      discoveryRecall10: sd ? { value: sd.recall10.mean, ci: [sd.recall10.lo, sd.recall10.hi], required: 0.95, pass: sd.recall10.mean >= 0.95 } : null,
      endToEndSuccess: { value: e2e.mean, ci: [e2e.lo, e2e.hi], required: 0.9, pass: e2e.mean >= 0.9 },
      criticalFailures: { value: SUITES.flatMap((s) => armRes.suites[s]?.criticalFailures ?? []), required: 0, pass: SUITES.every((s) => !(armRes.suites[s]?.criticalFailures ?? []).length) },
    };
    armRes.gates.allPass = Object.values(armRes.gates).filter((g) => g && typeof g === "object").every((g) => g.pass);
    result.arms[arm] = armRes;
  }
  // paired differences (same tasks, same order) for every arm pair
  for (let i = 0; i < arms.length; i++)
    for (let j = i + 1; j < arms.length; j++) {
      const [A, B] = [arms[i], arms[j]];
      const diffs = Object.values(perTask).filter((p) => p[A] && p[B]).map((p) => (p[B].pass ? 1 : 0) - (p[A].pass ? 1 : 0));
      const rd = Object.entries(perTask).filter(([k, p]) => k.startsWith("schema-discovery") && p[A] && p[B] && p[A].category === "paraphrase").map(([, p]) => (p[B].recall10 ?? 0) - (p[A].recall10 ?? 0));
      const tokA = median(Object.entries(perTask).filter(([k, p]) => k.startsWith("schema-discovery") && p[A]).map(([, p]) => p[A].tokens));
      const tokB = median(Object.entries(perTask).filter(([k, p]) => k.startsWith("schema-discovery") && p[B]).map(([, p]) => p[B].tokens));
      const succDiff = bootstrap(diffs, seed + 7);
      const paraDiff = bootstrap(rd, seed + 11);
      result.paired[`${A}->${B}`] = {
        pairedTasks: diffs.length,
        successDifference: succDiff,
        paraphraseRecall10Difference: paraDiff,
        medianDiscoveryTokens: { [A]: tokA, [B]: tokB, relativeChange: tokA ? (tokB - tokA) / tokA : null },
        hybridDefaultRule: { paraphraseGainPp: paraDiff.mean == null ? null : paraDiff.mean * 100, tokenReduction: tokA ? (tokA - tokB) / tokA : null, noSuccessRegression: succDiff.mean == null ? null : succDiff.mean >= 0, earnsDefault: paraDiff.mean != null && ((paraDiff.mean >= 0.05) || (tokA && (tokA - tokB) / tokA >= 0.15)) && succDiff.mean >= 0 },
      };
    }
  return result;
}
function perTaskSuite(perTask, row, suite) {
  return Object.entries(perTask).some(([k, p]) => k.startsWith(`${suite}:`) && Object.values(p).includes(row));
}

function toMarkdown(res) {
  const L = [`# Evaluation score (${res.format})`, "", `Seed ${res.seed}. Release ${res.bindings.RELEASE_ID ?? "?"} / ${res.bindings.SCHEMA_RELEASE_DIGEST ?? "?"}.`, "", "| arm | suite | tasks | success (95% CI) | Recall@10 (95% CI) | critical failures | median tokens |", "| --- | --- | ---: | --- | --- | --- | ---: |"];
  const f = (b) => (b && b.mean != null ? `${b.mean.toFixed(3)} (${b.lo.toFixed(3)}-${b.hi.toFixed(3)})` : "n/a");
  for (const [arm, a] of Object.entries(res.arms)) for (const [s, v] of Object.entries(a.suites)) L.push(`| ${arm} | ${s} | ${v.tasks} | ${f(v.success)} | ${f(v.recall10)} | ${v.criticalFailures.join(", ") || "0"} | ${v.medianTokens ?? "n/a"} |`);
  L.push("", "| arm | gates all pass |", "| --- | --- |");
  for (const [arm, a] of Object.entries(res.arms)) L.push(`| ${arm} | ${a.gates.allPass} |`);
  return L.join("\n") + "\n";
}

function selfTest() {
  // SYNTHETIC: answers are constructed from gold; this proves the scorer/gate logic, not any agent capability.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bks-eval-selftest-"));
  const bindings = { RELEASE_ID: "synthetic-release", SCHEMA_RELEASE_DIGEST: "sha256:" + "0".repeat(64) };
  const manifest = { expected: { assertionsByPredicate: { HOLDS_ROLE: 39 }, v2NodesByLabel: { LegalStatus: 1 } }, source: { exportDigest: "sha256:" + "1".repeat(64) } };
  const perfectAnswer = (suite, id, gold) => {
    const g = gold.answer;
    if (suite.startsWith("schema-discovery")) {
      const answer = g.exists === false ? { exists: false, replacementTypes: g.replacementTypes } : g.hops ? { hops: g.hops } : g.enum ? { values: g.values } : g.predicate ? { predicate: g.predicate, ...g.rows[0] } : g.rows ? { type: g.type, ...g.rows[0] } : { ...g };
      return { answer, hits: gold.cardIds, citations: gold.cardIds.map((c) => ({ cardId: c, releaseDigest: bindings.SCHEMA_RELEASE_DIGEST })) };
    }
    if (suite === "native-read") {
      if (g.objectUid !== undefined) return { uids: { object: g.objectUid, asserter: g.asserterUid }, trace: { snapshotContentHashes: g.snapshotContentHashes } };
      if (g.uid !== undefined) return { uids: { node: g.uid }, basis: g.basis };
      if (gold.deferred) return { value: ptr(manifest, gold.deferred.pointer), status: g.status, sourceKind: g.sourceKind };
      if (g.status !== undefined) return { status: g.status };
      return { value: g.value };
    }
    const mk = (gg) => (gg.error ? { error: gg.error } : gg.oneOf ? { outcomes: [gg.oneOf[0], gg.otherOneOf[0]], invariants: Object.fromEntries(gg.invariants.map((n) => [n, true])) } : { outcome: gg.outcome, status: gg.status, markerStatus: gg.markerStatus, invariants: Object.fromEntries((gg.invariants ?? []).map((n) => [n, true])) });
    return g.sequence ? { sequence: g.sequence.map(mk) } : mk(g);
  };
  for (const arm of ["synthetic-perfect", "synthetic-degraded"]) {
    for (const suite of SUITES) {
      const gold = goldOf(suite);
      tasksOf(suite).forEach((t, i) => {
        const d = path.join(tmp, arm, suite, t.id);
        fs.mkdirSync(d, { recursive: true });
        let ans = perfectAnswer(suite, t.id, gold[t.id]);
        if (arm === "synthetic-degraded" && i % 7 === 0) ans = { answer: { wrong: true }, hits: [], citations: [] };
        fs.writeFileSync(path.join(d, "answer.json"), JSON.stringify(ans));
        fs.writeFileSync(path.join(d, "trace.json"), JSON.stringify({ inputTokens: arm === "synthetic-perfect" ? 900 : 1200, outputTokens: 100, elapsedMs: 1000 + i }));
      });
    }
  }
  const res = score(tmp, { bindings, manifest });
  const p = res.arms["synthetic-perfect"];
  const dgr = res.arms["synthetic-degraded"];
  const checks = [
    ["perfect arm passes every gate", p.gates.allPass === true],
    ["perfect arm success = 1 in every suite", SUITES.every((s) => p.suites[s].success.mean === 1)],
    ["degraded arm fails a gate", dgr.gates.allPass === false],
    ["degraded arm reports critical failures", dgr.gates.criticalFailures.value.length > 0],
    ["paired difference computed", Object.keys(res.paired).length === 1],
  ];
  fs.rmSync(tmp, { recursive: true, force: true });
  const ok = checks.every(([, v]) => v);
  console.log(JSON.stringify({ ok, synthetic: true, checks: checks.map(([name, pass]) => ({ name, pass })), perfect: { e2e: p.gates.endToEndSuccess.value, recall10: p.gates.discoveryRecall10.value }, degraded: { e2e: dgr.gates.endToEndSuccess.value, ci: dgr.gates.endToEndSuccess.ci, critical: dgr.gates.criticalFailures.value.length } }, null, 2));
  process.exit(ok ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (args["self-test"]) selfTest();
  else {
    if (!args.run || !args.bindings) {
      console.error("usage: score.mjs --run <runDir> --bindings <bindings.json> [--manifest <file>] [--report md|json] | --self-test");
      process.exit(2);
    }
    const res = score(path.resolve(args.run), { bindings: load(args.bindings), manifest: args.manifest ? load(args.manifest) : null, seed: Number(args.seed ?? 20261011) });
    if (args.report === "md") process.stdout.write(toMarkdown(res));
    else console.log(JSON.stringify(res, null, 2));
    process.exit(Object.values(res.arms).every((a) => a.gates.allPass) ? 0 : 1);
  }
}

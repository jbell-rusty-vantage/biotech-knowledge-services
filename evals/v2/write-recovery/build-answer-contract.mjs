#!/usr/bin/env node
// Builds the write-recovery ANSWER CONTRACT (proposal DEV-3, protocol section 11): for every task, the exact answer
// fields the scorer reads, and the invariant keys it checks, each phrased as a neutral yes/no question. The runner hands
// the contract entry to the agent next to `prompt` and `answerShape`, identically for every arm. It never reveals an
// expected value: outcome/error/status are named as fields to fill, and every invariant asks for true/false.
//
//   node evals/v2/write-recovery/build-answer-contract.mjs [--check]
//
// Frozen task files are not changed. Keys come mechanically from gold.json; the question text comes from QUESTIONS.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const load = (f) => JSON.parse(fs.readFileSync(path.join(HERE, f), "utf8"));
const sha = (b) => `sha256:${crypto.createHash("sha256").update(b).digest("hex")}`;

/** Neutral yes/no questions. `true` must mean "the statement in the key holds"; nothing here says which answer is expected. */
const QUESTIONS = {
  assertedEdgeBacked: "Is every asserted relationship your write created backed by an Assertion node?",
  "assertion.evidence": "Does every Assertion your write created have HAS_EVIDENCE to the cited locator(s)?",
  "receipt.complete": "Did the effect readback (verify-effects, all pages) confirm every declared effect of the receipt?",
  "receipt.sameId": "Did both apply calls return the same receiptId?",
  noNewEffects: "Did the graph stay without any new effect from the call(s) in question (no extra nodes, relationships or graph revision)?",
  "identity.single": "After both calls, is there exactly one node carrying the contested identity?",
  "episodes.bothRetained": "Are both episodes present in the graph after the second write?",
  "marker.attemptsAppended": "Does the effect marker record every attempt (attempt history appended)?",
  "marker.notOverwritten": "Did the failed attempt leave the committed marker's recorded state unchanged (not overwritten)?",
  "receipt.lookupFirst": "Did you obtain the outcome by receipt lookup before considering any re-apply?",
  noNewIntentId: "Did recovery reuse the original intentId (no new intent identity created)?",
  "readback.allPages": "Did you read every readback page until the service reported no further page?",
  "readback.complete": "Did the readback cover every declared effect?",
  "payloadDigest.equal": "Is the native payload digest identical before and after the envelope wrapper?",
  "verification.distinctFromAdmission": "Does the result report verification state separately from graph admission state?",
  "receipt.effectReported": "Does the receipt report the committed effect despite the cancellation?",
  "recovery.retained": "Can the effect still be recovered by receipt lookup after the cancellation?",
  notEmpty: "Did the service return a reason or explanation (not an empty body)?",
  "evidence.gdsInstalledNotAdmitted": "Does the evidence show the analytics library is present on the server but not admitted for this service?",
  noGraphWrites: "Did the graph stay unchanged by the request?",
  "verify.allChecks": "Did every restore verification check pass?",
  "elementIds.notPreserved": "Do restored elements carry elementIds different from the source export (true if NOT preserved)?",
  "legacyKey.preserved": "Is each restored element matchable to the export by its durable legacy key?",
  "dryRun.allInvariants": "Did every migration invariant pass in the dry run?",
  "accounting.reconciles": "Do the migration accounting totals reconcile to the export counts?",
  "held.notVisible": "Is every held record absent from v2 reads (not presented as a v2 fact)?",
  "retryBuffer.reset": "Did each retry attempt start with an empty result buffer?",
  "legacy.nodesRetained": "Are all legacy nodes still present after the migration?",
  "legacy.relationshipsRetained": "Are all legacy relationships still present after the migration?",
  "nodesDeleted.zero": "Did the migration delete zero nodes?",
};

const tasks = load("tasks.json").tasks;
const gold = load("gold.json").gold;
const contract = {};
const missing = new Set();
for (const t of tasks) {
  const g = gold[t.id].answer;
  const step = (s) => {
    // Neutral: every task names all three result fields, so the contract never hints whether an error is expected.
    const fields = ["outcome | error | status (fill whichever the service returned; error is the BKS_* code)"];
    if (s.markerStatus !== undefined) fields.push("markerStatus");
    if (s.oneOf !== undefined) fields.push("outcomes[] (one entry per concurrent intent: its outcome or error code)");
    const inv = (s.invariants ?? []).map((k) => { if (!QUESTIONS[k]) missing.add(k); return { key: k, question: QUESTIONS[k] ?? null }; });
    return { fields, invariants: inv };
  };
  const entry = g.sequence
    ? { form: "sequence", note: "answer.sequence[] has one object per step, in the order the prompt names them", steps: g.sequence.map(step) }
    : { form: "single", ...step(g) };
  entry.always = ["receiptIds[] (when a receipt exists)", "effectKey (when you called apply)"];
  entry.encoding = "fields are top-level in answer.json (or under answer.answer); error is the service code string (e.g. BKS_...); invariants is an object {key: true|false} with exactly the keys listed";
  contract[t.id] = entry;
}
if (missing.size) throw new Error(`no neutral question for: ${[...missing].join(", ")}`);
// Leak check (DEV-3 condition): no gold value may appear in the contract. Invariant KEYS are field names and allowed;
// every other gold leaf (outcomes, error codes, statuses, marker states, deferred sources, numbers) must be absent,
// matched case-insensitively on word boundaries anywhere in the serialized contract.
const goldValues = new Set();
const collect = (v, inInvariants) => {
  if (Array.isArray(v)) { for (const x of v) collect(x, inInvariants); return; }
  if (v && typeof v === "object") { for (const [k, x] of Object.entries(v)) collect(x, k === "invariants"); return; }
  if ((typeof v === "string" || typeof v === "number") && !inInvariants && String(v).trim()) goldValues.add(String(v));
};
for (const g of Object.values(gold)) collect(g, false);
const leakText = JSON.stringify(contract);
const esc = (s) => s.replace(/[.*+?^${}()|[]\]/g, "\if (missing.size) throw new Error(`no neutral question for: ${[...missing].join(", ")}`);");
const leaks = [...goldValues].filter((v) => new RegExp(`(^|[^A-Za-z0-9_])${esc(v)}([^A-Za-z0-9_]|$)`, "i").test(leakText));
if (leaks.length) { console.error(`LEAK: gold value(s) present in the contract: ${leaks.join(", ")}`); process.exit(3); }
const doc = { format: "bks-eval-answer-contract.v1", suite: "write-recovery", status: "IN FORCE (DEV-3, lead-approved 2026-10-12): hand contract[taskId] to the agent with the prompt, identically for every arm", leakCheck: { goldValuesChecked: goldValues.size, leaks: 0 }, tasks: sha(fs.readFileSync(path.join(HERE, "tasks.json"))), gold: sha(fs.readFileSync(path.join(HERE, "gold.json"))), contract };
const text = JSON.stringify(doc, null, 2) + "\n";
const out = path.join(HERE, "answer-contract.json");
if (process.argv.includes("--check")) { if (!fs.existsSync(out) || fs.readFileSync(out, "utf8") !== text) { console.error("drift: answer-contract.json"); process.exit(1); } console.log("ok"); }
else { fs.writeFileSync(out, text); console.log(JSON.stringify({ out: path.relative(process.cwd(), out), sha256: sha(Buffer.from(text)), tasks: Object.keys(contract).length, invariantKeys: Object.keys(QUESTIONS).length })); }

#!/usr/bin/env node
// Planner check (03-SYNTHESIS step 8) without changing packages/: runs the unmodified kg-ops planner (packages/kg-ops/dist/plan.js)
// over every fixture intent twice, read-only, against the disposable Neo4j given in NEO4J_* (empty graph):
//   pinned    = SchemaModel.fromWorkspace()  (what `node packages/kg-ops/dist/cli.js kg plan` uses: workspace/ built from schema/pinned)
//   candidate = new SchemaModel(final/schema/final_biotech_schema_v2.ir.json, loadSidecars(), ...)  (in-process injection; the CLI
//               has no flag for another IR, and the sidecars + validation params it reads are still the pinned ones)
// planIntent only opens READ transactions, so nothing is written.
//   BKS_BIOTECH_GRAPH_URI=bolt://localhost:7691 BKS_BIOTECH_GRAPH_USERNAME=neo4j BKS_BIOTECH_GRAPH_PASSWORD=... BKS_BIOTECH_GRAPH_DATABASE=neo4j \
//     node schema/program/final/_work/plan-candidate.mjs   -> final/_work/plan-candidate-results.json
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PROGRAM = resolve(here, "../..");
const REPO = resolve(PROGRAM, "../..");
const FINAL = join(PROGRAM, "final");
const imp = (p) => import(pathToFileURL(join(REPO, p)).href);
const { planIntent, EXECUTOR_VERSION } = await imp("packages/kg-ops/dist/plan.js");
const { SchemaModel } = await imp("packages/kg-ops/dist/schema-access.js");
const { GraphClient } = await imp("packages/kg-ops/dist/neo4j.js");
const ws = await imp("packages/schema-workspace/dist/index.js");

const candidateIr = JSON.parse(readFileSync(join(FINAL, "schema/final_biotech_schema_v2.ir.json"), "utf8"));
// What-if model: the candidate IR with two in-memory shims taken from final/node-register.yaml, to get past the subject stage and
// expose the proposal-level checks. S1 (R-03): creatability comes from the register's `mutations.executor` (GraphQL @mutation is
// operations: [] on every type, R-02), so allowedMutations.create = true (54 types say "create"; 15 D3/D7/D9 types state none). S2: uidToken from the register
// (the IR takes tokens from the pinned validation-params, which lack the candidate's new types). Nothing else is shimmed.
const req = (await import("node:module")).createRequire(join(REPO, "packages/schema-workspace/package.json"));
const nodeRegister = req("yaml").parse(readFileSync(join(FINAL, "node-register.yaml"), "utf8"));
const shimIr = JSON.parse(JSON.stringify(candidateIr));
const shimLog = { creatableFromRegister: 0, creatableUnstated: [], tokensAdded: 0 };
for (const n of shimIr.nodes) {
  const reg = nodeRegister.nodes.find((x) => x.name === n.name);
  if (!reg) continue;
  const exec = String(reg.mutations?.executor ?? "");
  // register gap: 15 D3/D7/D9 types carry the packet's GraphQL-style { create: false, ... } or executor "unstated"; treated as creatable too
  if (!n.allowedMutations.create) { n.allowedMutations = { ...n.allowedMutations, create: true }; if (/\bcreate/i.test(exec)) shimLog.creatableFromRegister++; else shimLog.creatableUnstated.push(n.name); }
  if (!n.uidToken && reg.uidToken) { n.uidToken = reg.uidToken; shimLog.tokensAdded++; }
}
const models = {
  pinned: SchemaModel.fromWorkspace(),
  candidate: new SchemaModel(candidateIr, ws.loadSidecars(), "candidate-ir-injected"),
  candidateShimmed: new SchemaModel(shimIr, ws.loadSidecars(), "candidate-ir-injected+register-shims"),
};
const client = GraphClient.fromEnv();
const server = await client.verify();
// the disposable database is shared with the other S agents: record what is in it when planning starts
const graphAtStart = await client.read(async (tx) => {
  const r = await tx.run("MATCH (n) RETURN count(n) AS c, count(CASE WHEN n.uid STARTS WITH 'hu:' AND n.uid CONTAINS ':xfx-' THEN 1 END) AS xfx");
  return { nodes: Number(r.records[0].get("c")), xfxUidNodes: Number(r.records[0].get("xfx")) };
});

const intents = [];
const FX = join(FINAL, "fixtures");
for (const p of readdirSync(FX).filter((p) => /^(K|D\d{1,2})$/.test(p))) {
  for (const d of readdirSync(join(FX, p), { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    for (const f of readdirSync(join(FX, p, d.name))) if (/^intent.*\.json$/.test(f)) intents.push({ packet: p, folder: d.name, file: f, path: join(FX, p, d.name, f) });
  }
}
intents.sort((a, b) => a.path.localeCompare(b.path));

const code = (s) => String(s).split(":")[0].trim();
const norm = (s) => String(s).replace(/hu:[^\s,;)]+/g, "<uid>").slice(0, 220);
const TOKENS = ["mongoResearchRunId", "SUPPORTED_BY", "agentRunUid", "lastWriterRunId", "HAS_EVIDENCE", "WAS_GENERATED_BY"];
const results = [];
for (const it of intents) {
  const raw = JSON.parse(readFileSync(it.path, "utf8"));
  const row = { packet: it.packet, folder: it.folder, file: it.file, proposals: raw.proposals.length };
  for (const [name, model] of Object.entries(models)) {
    const t0 = Date.now();
    try {
      const plan = await planIntent(client, model, raw, { agentUid: "hu:agent:bks-executor", executorVersion: EXECUTOR_VERSION });
      const disp = {};
      const reasons = {};
      const details = {};
      for (const pp of plan.proposals) {
        disp[pp.disposition] = (disp[pp.disposition] ?? 0) + 1;
        for (const r of pp.reasons) { reasons[code(r)] = (reasons[code(r)] ?? 0) + 1; const k = `${pp.kind} ${norm(r)}`; details[k] = (details[k] ?? 0) + 1; }
      }
      const subj = {};
      const subjReasons = {};
      for (const s of plan.subjects) {
        subj[s.disposition] = (subj[s.disposition] ?? 0) + 1;
        for (const r of s.reasons) { subjReasons[code(r)] = (subjReasons[code(r)] ?? 0) + 1; const k = `subject ${s.nodeType} ${norm(r)}`; details[k] = (details[k] ?? 0) + 1; }
      }
      const errors = {};
      for (const e of plan.errors) { errors[e.code] = (errors[e.code] ?? 0) + 1; const k = `error ${e.code}: ${norm(e.message.replace(/^[^:]+: /, ""))}`; details[k] = (details[k] ?? 0) + 1; }
      row[name] = { outcome: plan.outcome, schemaDigest: plan.schemaDigest, proposalDispositions: disp, proposalReasons: reasons, subjectDispositions: subj, subjectReasons: subjReasons, reasonDetails: details, errors, errorSamples: plan.errors.slice(0, 3).map((e) => `${e.code}: ${e.message}`.slice(0, 240)), statements: plan.statements.length, statementTokens: Object.fromEntries(TOKENS.map((k) => [k, plan.statements.filter((s) => s.cypher.includes(k) || JSON.stringify(s.params).includes(k)).length])), ms: Date.now() - t0 };
    } catch (err) {
      row[name] = { outcome: "threw", error: `${err.code ?? err.name}: ${err.message}`.slice(0, 300), ms: Date.now() - t0 };
    }
  }
  results.push(row);
  process.stderr.write(`${it.packet}/${it.folder}/${it.file}: pinned ${row.pinned.outcome}, candidate ${row.candidate.outcome}, candidate+shims ${row.candidateShimmed.outcome}\n`);
}
await client.close();

// aggregate
const agg = {};
for (const name of Object.keys(models)) {
  const a = { outcomes: {}, threw: {}, errors: {}, proposalDispositions: {}, proposalReasons: {}, subjectDispositions: {}, subjectReasons: {}, reasonDetails: {} };
  for (const r of results) {
    const x = r[name];
    a.outcomes[x.outcome] = (a.outcomes[x.outcome] ?? 0) + 1;
    if (x.outcome === "threw") { const k = x.error.replace(/ for .*$/, "").replace(/(unknown node type) \S+/, "$1 <T>").slice(0, 120); a.threw[x.error.slice(0, 160)] = (a.threw[x.error.slice(0, 160)] ?? 0) + 1; continue; }
    for (const k of ["errors", "proposalDispositions", "proposalReasons", "subjectDispositions", "subjectReasons", "reasonDetails"]) for (const [kk, v] of Object.entries(x[k])) a[k][kk] = (a[k][kk] ?? 0) + v;
  }
  a.statements = results.reduce((s, r) => s + (r[name].statements ?? 0), 0);
  a.statementTokens = {};
  for (const r of results) for (const [k, v] of Object.entries(r[name].statementTokens ?? {})) a.statementTokens[k] = (a.statementTokens[k] ?? 0) + v;
  agg[name] = a;
}
const out = { generatedBy: "final/_work/plan-candidate.mjs", executorVersion: EXECUTOR_VERSION, graphAtStart, shims: shimLog, neo4j: { agent: server.agent, address: server.address }, digests: { pinned: models.pinned.schemaDigest, candidate: models.candidate.schemaDigest }, intents: results.length, aggregate: agg, results };

// ---- summary (rendered into final/fixtures/README.md by repath-fixtures.mjs --index)
const relReg = req("yaml").parse(readFileSync(join(FINAL, "relationship-register.yaml"), "utf8"));
const candPreds = new Set([...(relReg.predicateOnly ?? []).map((p) => p.predicate), ...(relReg.authorizingPredicates ?? []).map((p) => p.predicate ?? p.name)].filter(Boolean));
const A = agg;
const S = A.candidateShimmed;
const grab = (re) => [...new Set(Object.keys(S.reasonDetails).map((k) => re.exec(k)?.[1]).filter(Boolean))];
const unreg = grab(/UNREGISTERED_PREDICATE: (\S+)/);
const unregInCandidate = unreg.filter((p) => candPreds.has(p));
const unregNowhere = unreg.filter((p) => !candPreds.has(p));
const notInSchema = grab(/RELATIONSHIP_NOT_IN_SCHEMA: (\S+)/);
const notInSchemaRegistered = notInSchema.filter((p) => candPreds.has(p));
const det = (m, re) => Object.entries(A[m].reasonDetails).filter(([k]) => re.test(k)).reduce((s, [, v]) => s + v, 0);
const fmt = (o) => Object.entries(o).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${v}`).join(", ");
const threwMention = S.threw["UNKNOWN_NODE_TYPE: unknown node type Mention"] ?? 0;
const threwIsList = Object.entries(S.threw).filter(([k]) => k.includes("isList")).reduce((s, [, v]) => s + v, 0);
const md = [];
const matchRows = (m) => (A[m].subjectReasons.MATCH_ADOPTED ?? 0) + (A[m].subjectReasons.MATCH_REVIEW ?? 0) + (A[m].subjectReasons.MATCH_EXISTS ?? 0);
md.push(`**Verdict: planning the fixture intents against the candidate is not feasible without kg-ops changes.** Measured on ${results.length} intent files (all 75 fixtures), executor ${EXECUTOR_VERSION}, Neo4j ${server.agent} at ${server.address}. The planner opens read transactions only; this run wrote nothing. The disposable database is shared: at the start of this run it held ${graphAtStart.nodes} nodes (${graphAtStart.xfxUidNodes} with \`xfx-\` uids, written by the cross-domain fixture authors), against which ${matchRows("candidateShimmed")} candidate+shims subject rows matched by name or identifier (${matchRows("candidate")} for the unshimmed candidate); those rows, and the proposals that depend on them, can plan differently on an empty graph. The failure classes below do not depend on graph content except SUBJECT_UNKNOWN / SUBJECT_MISSING.`);
md.push("");
md.push("What was run:");
md.push("");
md.push(`1. The step-8 command, \`node packages/kg-ops/dist/cli.js kg plan <final intent.json> --out <scratch>\` (NEO4J_* set to the disposable container). \`ping\` reports schemaDigest ${models.pinned.schemaDigest}: the CLI always loads \`workspace/\` (built from \`schema/pinned\`) through \`SchemaModel.fromWorkspace()\`, has no flag for another SDL or IR, and \`bks-schema build\` only parses the pinned SDL. It plans against the pinned proposal, never the candidate (digest ${models.candidate.schemaDigest}).`);
md.push(`2. \`final/_work/plan-candidate.mjs\`: the unmodified \`planIntent\` from \`packages/kg-ops/dist\` with three schema models injected in process (no file under packages/ changed): **pinned** (the CLI's model), **candidate** (\`final/schema/final_biotech_schema_v2.ir.json\` + the pinned sidecars and validation params, the only ones the executor can load) and **candidate+shims**, a what-if that makes every node type creatable and fills the 20 missing uid tokens from \`final/node-register.yaml\`, to reach the proposal-level checks.`);
md.push("");
md.push("| model | plan outcomes | proposals admitted / held / rejected | subjects create / review / conflict / missing |");
md.push("| --- | --- | --- | --- |");
for (const m of ["pinned", "candidate", "candidateShimmed"]) {
  const a = A[m]; const pd = a.proposalDispositions; const sd = a.subjectDispositions;
  md.push(`| ${m === "candidateShimmed" ? "candidate+shims" : m} | ${fmt(a.outcomes)} | ${pd.admitted ?? 0} / ${pd.held ?? 0} / ${pd.rejected ?? 0} | ${sd.create ?? 0} / ${sd.review_required ?? 0} / ${sd.conflict ?? 0} / ${sd.missing ?? 0} |`);
}
md.push("");
md.push(`- **pinned**: ${A.pinned.outcomes.threw ?? 0} of ${results.length} throw "Cannot run query in this transaction…"; the first error is \`db.index.fulltext.queryNodes\` on \`CompoundSearch\`, a pinned fulltext index that only \`kg ensure-operations\` creates (not run: it would write the pinned operations file into the shared disposable database). The one intent that plans is rejected (${fmt(A.pinned.errors)}). The pinned run is not a target; it shows what the CLI actually checks.`);
md.push(`- **candidate**: ${fmt(A.candidate.outcomes)}; 0 applicable. Every new subject is held (TYPE_NOT_CREATABLE ${A.candidate.subjectReasons.TYPE_NOT_CREATABLE ?? 0}) because the planner gates creation on GraphQL \`@mutation\`, which is \`operations: []\` on every candidate type (R-02), and ${det("candidate", /no registered uid token/)} subject rows have no uid token; so no proposal is admitted (${A.candidate.proposalDispositions.rejected ?? 0} rejected, SUBJECT_CONFLICT ${A.candidate.proposalReasons.SUBJECT_CONFLICT ?? 0}).`);
md.push(`- **candidate+shims** (S1: ${shimLog.creatableFromRegister} types creatable per the register's \`mutations.executor\`, plus ${shimLog.creatableUnstated.length} whose register entry states no executor creatability: ${shimLog.creatableUnstated.join(", ")}; S2: ${shimLog.tokensAdded} uid tokens): ${fmt(S.outcomes)}; ${S.proposalDispositions.admitted ?? 0} of ${(S.proposalDispositions.admitted ?? 0) + (S.proposalDispositions.held ?? 0) + (S.proposalDispositions.rejected ?? 0)} planned proposals admitted. The ${S.statements} statements of the plans that compile still write \`mongoResearchRunId\` (${S.statementTokens.mongoResearchRunId ?? 0} statements) and \`SUPPORTED_BY\` (${S.statementTokens.SUPPORTED_BY ?? 0}); neither exists in the candidate, and \`kg plan\` does not check statement text.`);
md.push("");
md.push("Failure classes (counts from candidate+shims unless marked) and the change each needs. P-numbers are K's executor list in `packets/K/11-open-questions.md` (P1–P19, plus P20–P21 from the adversarial review); N-numbers are needs P1–P21 do not cover.");
md.push("");
md.push("| failure (planner code) | count | cause in the candidate | change needed |");
md.push("| --- | --- | --- | --- |");
const rows = [
  ["CLI loads the pinned workspace", `${results.length} of ${results.length} CLI plans would carry the pinned digest`, "`SchemaModel.fromWorkspace()`; `bks-schema build` reads `schema/pinned` only; sidecars and validation params are pinned", "**N1** re-pin: build `workspace/`, sidecars and validation params from the candidate (handoff re-pin steps), or a schema-IR option on `kg plan`"],
  ["TYPE_NOT_CREATABLE (candidate)", A.candidate.subjectReasons.TYPE_NOT_CREATABLE ?? 0, "R-02 L2 `@mutation(operations: [])` on every type; the planner reads creatability from `@mutation`", `**N2** read creatability from the node register's \`mutations.executor\` (R-03); ${shimLog.creatableUnstated.length} D3/D7/D9 register entries still carry \`{create:false,…}\` or \`unstated\``],
  ["no registered uid token (candidate)", det("candidate", /no registered uid token/), "uid tokens come from the pinned validation params; 20 candidate types are new", "**N3** uid tokens from the node register (all 69 entries carry `uidToken`)"],
  ["threw UNKNOWN_NODE_TYPE Mention", `${threwMention} intents`, "`mention.stage` writes a Mention node; the kernel cut Mention (R-09, R-27)", "**P8** (amended): register the surface-form locator, queue entity linking, no node"],
  ["INVALID_ACTIVITY_KIND", S.errors.INVALID_ACTIVITY_KIND ?? 0, "intents send pinned kinds (EXTRACTION …); kernel ActivityKind is RESEARCH, INGESTION, VETTING, EVIDENCE_MISSION, VERIFICATION, PROJECTION, ANSWER", "**P3** (and intents re-keyed to the kernel kinds)"],
  ["RELATIONSHIP_ENDPOINTS_INVALID (… has no HAS_IDENTIFIER field)", det("candidateShimmed", /HAS_IDENTIFIER field/), "identifier.attach requires a declared HAS_IDENTIFIER OUT field; the candidate declares `Identifier.identifies` to the Subjectable interface", "**P6**"],
  ["STATE_TARGET_NOT_VERSIONED", S.proposalReasons.STATE_TARGET_NOT_VERSIONED ?? 0, "state.attach expects a VersionedState label and StateEpisodeProperties; R-10 retired both (AssertedEdgeProperties + register `exclusive: true`)", "**N4** state.attach = asserted episode with exclusivity enforced from the register"],
  ["UNREGISTERED_PREDICATE", S.proposalReasons.UNREGISTERED_PREDICATE ?? 0, `the registry is the pinned validation params; ${unregInCandidate.length} of the ${unreg.length} flagged names are registered in the candidate register (${unregInCandidate.join(", ")}); in neither: ${unregNowhere.join(", ") || "none"}`, "**N5** load the candidate predicate registry (R-52); register or re-key the rest"],
  ["RELATIONSHIP_NOT_IN_SCHEMA", S.proposalReasons.RELATIONSHIP_NOT_IN_SCHEMA ?? 0, `predicate-only relations sent as edge.assert (${notInSchema.join(", ")}); ${notInSchemaRegistered.length} of them are registered predicates in the candidate`, "contract: an Assertion with an entity object and no typed edge (K 08 tool:kg-executor gap; contracts v2 is owner decision R-40)"],
  ["threw TypeError (reading 'isList')", `${threwIsList} intents`, "assertion.literal `quantityBasis` / `massBasis` / `amountReferent`: the candidate Assertion has none of these properties (qualifiers now) and the planner dereferences the missing property", "**N6** contract v2 qualifiers + a planner guard"],
  ["LITERAL_VALUE_REQUIRED", S.proposalReasons.LITERAL_VALUE_REQUIRED ?? 0, "v1 literals take exactly one value: D13 event clocks (value only in validity), D10/D4/D5 ranges and paired numbers, D9 object-valued predicates", "contract v2 (R-40)"],
  ["INVALID_EDGE_PROPERTY", S.proposalReasons.INVALID_EDGE_PROPERTY ?? 0, "R-30 verbatim edge fields (stakeClassVerbatim, roleTitleVerbatim, reasonsVerbatim) and one missing FoodContentProperties.statementKind", "fixture edits (pending, R-30); not an executor change"],
  ["ASSERTION_REQUIRED (RENDITION_OF)", det("candidateShimmed", /ASSERTION_REQUIRED/), "R-43 made RENDITION_OF asserted; the intent sends edge.structural", "fixture edit (pending, R-43)"],
  ["INVALID_SOURCE_PROPERTY", S.errors.INVALID_SOURCE_PROPERTY ?? 0, "intents put `tool` on Source; the candidate records the tool in `SourceSnapshot.captureMethod` (R-39)", "intent re-key (fixture owners)"],
  ["REQUIRED_PROPERTY_MISSING / INVALID_PROPERTY (subjects)", `${S.subjectReasons.REQUIRED_PROPERTY_MISSING ?? 0} / ${S.subjectReasons.INVALID_PROPERTY ?? 0}`, "candidate-required properties absent from the intents (Organization.entityKind, Product.productKind …); `searchText` written although derived; values outside the candidate enums (e.g. ComparisonKind BETWEEN_GROUP, already outside D3's own enum)", "intent content (fixture owners)"],
  ["SUBJECT_UNKNOWN / SUBJECT_MISSING / EPISODE_NOT_FOUND", `${S.subjectReasons.SUBJECT_UNKNOWN ?? 0} / ${S.proposalReasons.SUBJECT_MISSING ?? 0} / ${S.proposalReasons.EPISODE_NOT_FOUND ?? 0}`, "resolved subjects and relationshipUids written by other fixtures' intents (or a step-1 receipt) are absent from the empty graph", "none: needs an ordered apply of the fixture set"],
  ["writes `mongoResearchRunId`", `${S.statementTokens.mongoResearchRunId ?? 0} statements`, "not validated by `kg plan`; the candidate property is `lastWriterRunId`", "**P1**"],
  ["writes `SUPPORTED_BY`", `${S.statementTokens.SUPPORTED_BY ?? 0} statements`, "the candidate has no SUPPORTED_BY; evidence is HAS_EVIDENCE {role, origin} (0 statements write HAS_EVIDENCE)", "**P4**"],
  ["writes `agentRunUid`", `${S.statementTokens.agentRunUid ?? 0} statements`, "the candidate Assertion has no agentRunUid (lineage is WAS_GENERATED_BY) and the planner sets no assertionKind", "**P5**"],
];
for (const r of rows) md.push(`| ${r[0]} | ${r[1]} | ${String(r[2]).replace(/\|/g, "/")} | ${r[3]} |`);
md.push("");
md.push("Not exercised by `kg plan` (apply-time, or no fixture intent reaches it): P2/P14 Activity run fields, P7 TradeItemIdentifier (no GTIN-family identifier reached planning), P9 WAS_GENERATED_BY on update, P10 supersedesUid, P11 selector kinds (no INVALID_SELECTOR_KIND against the candidate), P12, P13 indexes, P15–P19 (v1 has no claim / assessment / adjudication / report proposal kinds, so those records exist only in assertions.yaml), P20 Channel asserters, P21 segmentKind (accepted in AssertionCore; not validated against Assertion).");
out.summaryMarkdown = md.join("\n");
out.unregisteredInCandidate = unregInCandidate;
out.unregisteredNowhere = unregNowhere;
out.notInSchema = notInSchema;
writeFileSync(join(FINAL, "_work", "plan-candidate-results.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log(JSON.stringify({ intents: results.length, digests: out.digests, neo4j: out.neo4j, pinned: agg.pinned.outcomes, candidate: agg.candidate.outcomes, candidateShimmed: agg.candidateShimmed.outcomes, shims: shimLog }, null, 1));

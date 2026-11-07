// Check final/vocabularies/*.yaml against the assembled SDL facts and each other; extract Cypher for EXPLAIN.
// usage: node check-vocab.mjs <worktree> <sdl-facts.json> <answer-kind-counts.json> <cypher-out-dir>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const [wt, factsPath, akPath, cyDir] = process.argv.slice(2);
const facts = JSON.parse(readFileSync(factsPath, "utf8"));
const ak = JSON.parse(readFileSync(akPath, "utf8"));
const require = createRequire(resolve(wt, "packages/schema-workspace/package.json"));
const YAML = require("yaml");
const V = (f) => resolve(wt, "schema/program/final/vocabularies", f);
const FILES = ["targets.yaml", "frontiers.yaml", "identifier-schemes.yaml", "verdict-lattice.yaml", "goal-polarity.yaml", "claim-lifecycle.yaml", "answer-kinds.yaml"];
const docs = {};
const report = { files: {}, problems: [], enumBlocksChecked: 0, enumsChecked: [], cypher: [] };
const bad = (m) => report.problems.push(m);
for (const f of FILES) {
  const text = readFileSync(V(f), "utf8");
  try { docs[f] = YAML.parse(text); } catch (e) { bad(`${f}: YAML parse error ${e.message}`); continue; }
  report.files[f] = { bytes: Buffer.byteLength(text), sha256: createHash("sha256").update(text).digest("hex") };
}
const E = facts.enums;
const nodeTypes = new Set(Object.entries(facts.types).filter(([, t]) => t.labels).map(([n]) => n));
const allTypes = new Set(Object.keys(facts.types));
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
// 1. every sdlEnums block equals the SDL
const checkEnumBlock = (f, blk) => {
  report.enumBlocksChecked++;
  for (const [name, vals] of Object.entries(blk)) {
    if (!E[name]) { bad(`${f}: enum ${name} not in SDL`); continue; }
    if (!eq(vals, E[name])) bad(`${f}: enum ${name} differs from SDL: file [${vals}] sdl [${E[name]}]`);
    report.enumsChecked.push(`${f}:${name}`);
  }
};
for (const [f, d] of Object.entries(docs)) {
  if (d.sdlEnums) checkEnumBlock(f, d.sdlEnums);
  if (d.synthesis?.sdlEnums) checkEnumBlock(f, d.synthesis.sdlEnums);
}
const inEnum = (f, name, v, where) => { if (v !== null && v !== undefined && !E[name].includes(v)) bad(`${f}: ${where}: ${v} not in ${name}`); };
// 2. verdict lattice
{
  const f = "verdict-lattice.yaml", d = docs[f];
  if (!eq(d.verdicts.map((v) => v.value), E.SemanticVerdict)) bad(`${f}: verdicts list != SemanticVerdict`);
  for (const v of d.verdicts) { if (v.v1 !== v.value.toLowerCase()) bad(`${f}: v1 spelling ${v.v1}`); if (!d.groups[v.group]) bad(`${f}: group ${v.group}`); }
  const seen = {};
  for (const r of d.captureFidelityMapping.rows) {
    for (const v of r.verdicts) { inEnum(f, "SemanticVerdict", v, "mapping row"); seen[v] = (seen[v] || 0) + 1; }
    for (const st of Object.values(r.status)) inEnum(f, "AssertionStatus", st, "mapping status");
    if (Object.keys(r.status).sort().join() !== Object.keys(d.captureFidelityMapping.columns).sort().join()) bad(`${f}: row status columns`);
    for (const v of r.verdicts) { const g = d.verdicts.find((x) => x.value === v).group; const firstOfGroup = d.captureFidelityMapping.rows.find((rr) => rr.verdicts.some((x) => d.verdicts.find((y) => y.value === x).group === g)); if (firstOfGroup !== r) bad(`${f}: group ${g} spans rows`); }
  }
  for (const v of E.SemanticVerdict) if (seen[v] !== 1) bad(`${f}: verdict ${v} appears ${seen[v] || 0} times in the mapping`);
  const cols = Object.values(d.captureFidelityMapping.columns).flat();
  if (cols.slice().sort().join() !== E.PolicyOutcome.slice().sort().join()) bad(`${f}: mapping columns do not cover PolicyOutcome exactly once`);
  if (!eq(d.policyOutcomes.map((p) => p.value), E.PolicyOutcome)) bad(`${f}: policyOutcomes`);
  for (const p of d.policyOutcomes) if (p.v1 !== p.value.toLowerCase()) bad(`${f}: policy v1 ${p.v1}`);
  if (Object.keys(d.assertionStatus).join() !== E.AssertionStatus.join()) bad(`${f}: assertionStatus keys`);
  if (Object.keys(d.humanDecision).filter((k) => k !== "decisionProvenance").sort().join() !== E.AdjudicationDecision.slice().sort().join()) bad(`${f}: humanDecision keys`);
  if (!eq(d.propertyStatus, E.PropertyStatus)) bad(`${f}: propertyStatus`);
  if (!eq(d.judgeKinds, E.JudgeKind)) bad(`${f}: judgeKinds`);
  for (const [k, en] of [["role", "EvidenceRole"], ["origin", "EvidenceOrigin"], ["authority", "EvidenceAuthority"], ["independence", "EvidenceIndependence"], ["facet", "EvidenceFacet"]]) if (!eq(d.evidenceEdge[k], E[en])) bad(`${f}: evidenceEdge.${k}`);
  for (const v of d.projectionGate.admittingVerdicts) inEnum(f, "SemanticVerdict", v, "admittingVerdicts");
  if (Object.keys(d.adjudicationKinds).join() !== E.AdjudicationKind.join()) bad(`${f}: adjudicationKinds`);
  for (const c of d.carriers) { const [t, fl] = c.field.split("."); if (!facts.types[t]?.fields[fl]) bad(`${f}: carrier ${c.field} missing`); else if (facts.types[t].fields[fl].type !== "SemanticVerdict") bad(`${f}: carrier ${c.field} type ${facts.types[t].fields[fl].type}`); }
  for (const p of d.orthogonalProperties) { const [t, fl] = p.field.split("."); if (facts.types[t]?.fields[fl]?.type !== "PropertyStatus") bad(`${f}: ${p.field} not PropertyStatus`); }
  for (const fld of ["Adjudication.mechanicalStatus", "Adjudication.decisionProvenance"]) { const [t, fl] = fld.split("."); if (facts.types[t]?.fields[fl]?.type !== "String") bad(`${f}: ${fld} not String`); }
}
// 3. claim lifecycle
{
  const f = "claim-lifecycle.yaml", d = docs[f];
  if (!eq(d.lifecycleStates.map((s) => s.value), E.ClaimLifecycleState)) bad(`${f}: lifecycleStates`);
  const vet = d.stages.find((s) => s.stage === "vetting");
  if (!eq(vet.dispositions.map((x) => x.value), E.ClaimDisposition)) bad(`${f}: dispositions`);
  for (const t of d.transitions) for (const s of [].concat(t.from, t.to)) inEnum(f, "ClaimLifecycleState", s, "transition");
  for (const r of d.relationshipTypesUsed) if (!facts.relTypes[r]) bad(`${f}: relationship ${r} not in SDL`);
  for (const n of d.nodeTypesUsed) if (!nodeTypes.has(n)) bad(`${f}: node type ${n} not in SDL`);
  for (const k of Object.keys(d.assessmentKindsUsed)) inEnum(f, "AssessmentKind", k, "assessmentKindsUsed");
  for (const s of d.stages.find((x) => x.stage === "evidenceReport").skeletonSections) inEnum(f, "ReportSectionKind", s, "skeletonSections");
  for (const c of d.caches) { const [t, fl] = c.field.split("."); if (!facts.types[t]?.fields[fl]) bad(`${f}: cache ${c.field}`); else if (c.enum && facts.types[t].fields[fl].type !== c.enum) bad(`${f}: cache ${c.field} type`); }
  for (const [q, txt] of Object.entries(d.questions)) { const kind = /\((retrieved|materialized|assessment|published)/.exec(txt)?.[1]; const row = ak.kindById[`K:${q}`]; if (!row) bad(`${f}: ${q} not in table`); if (kind && row && row !== kind) bad(`${f}: ${q} kind ${kind} vs table ${row}`); }
  for (const fld of ["Claim.propositionHash", "Claim.lifecycleState", "Claim.latestVerdict", "Claim.refinesClaimUid", "Assessment.disposition", "Activity.missionId", "Activity.runId", "Report.skeletonKey", "Report.worldCorrectness", "Report.bundleDigest", "Report.policyVersion", "Report.bodyDigest"]) { const [t, fl] = fld.split("."); if (!facts.types[t]?.fields[fl]) bad(`${f}: field ${fld} missing`); }
}
// 4. goal polarity
{
  const f = "goal-polarity.yaml", d = docs[f];
  if (!eq(d.effectDirection.values.map((v) => v.value), E.EffectDirection)) bad(`${f}: effectDirection values`);
  for (const k of d.effectDirection.assessmentKinds) inEnum(f, "AssessmentKind", k, "effectDirection.assessmentKinds");
  for (const g of d.goalPredicates) inEnum(f, "EffectDirection", g.effectDirection, `goal predicate ${g.predicate}`);
  if (!eq(d.polarity.values.map((v) => v.value), E.Polarity)) bad(`${f}: polarity values`);
  for (const k of Object.keys(d.speechActsThatCarryDirection)) inEnum(f, "SpeechAct", k, "speechActs");
  for (const n of d.neutralDirections) if (!E[n.enum]) bad(`${f}: neutral enum ${n.enum}`);
  const q = d.questionPolarity; const sum = q.totals.benefit + q.totals.harm + q.totals.neutral;
  if (sum !== q.rows || q.rows !== ak.rows) bad(`${f}: questionPolarity totals ${sum} vs ${q.rows} vs table ${ak.rows}`);
  for (const p of ["benefit", "harm", "neutral"]) if (q.totals[p] !== ak.byPolarity[p].rows) bad(`${f}: polarity ${p} ${q.totals[p]} vs ${ak.byPolarity[p].rows}`);
  let rows = 0; for (const [p, r] of Object.entries(q.byPacket)) { rows += r.rows; if (r.harm + r.benefit + r.neutral !== r.rows) bad(`${f}: ${p} polarity sum`); if (r.rows !== ak.byPacket[p].rows) bad(`${f}: ${p} rows`); if (r.harm * 3 < r.rows) bad(`${f}: ${p} harm share < 1/3`); }
  if (rows !== ak.rows) bad(`${f}: byPacket rows ${rows}`);
  for (const fld of ["Assessment.effectDirection", "Assertion.polarity", "Assertion.speechAct", "StudyResult.direction", "DecisionCriterion.direction", "Event.primaryEndpointStatement", "ProtocolStep.statedLevel"]) { const [t, fl] = fld.split("."); if (!facts.types[t]?.fields[fl]) bad(`${f}: field ${fld} missing`); }
}
// 5. answer kinds
{
  const f = "answer-kinds.yaml", d = docs[f];
  const c = d.counts;
  for (const k of ["retrieved", "materialized", "assessment", "published"]) {
    if (c.final[k] !== ak.ruling[k]) bad(`${f}: final ${k} ${c.final[k]} vs ${ak.ruling[k]}`);
    if (c.declaredByPackets[k] !== ak.declared[k]) bad(`${f}: declared ${k}`);
  }
  if (c.rows !== ak.rows || c.distinctIds !== ak.distinctIds || c.sharedIds !== ak.sharedIds) bad(`${f}: row/id counts`);
  for (const [p, r] of Object.entries(c.byPacket)) for (const k of Object.keys(r)) if (r[k] !== ak.byPacket[p][k]) bad(`${f}: byPacket ${p}.${k} ${r[k]} vs ${ak.byPacket[p][k]}`);
  for (const [a, r] of Object.entries(c.byAudience)) for (const k of Object.keys(r)) if (r[k] !== ak.byAudience[a][k]) bad(`${f}: byAudience ${a}.${k}`);
  for (const [p, r] of Object.entries(c.byPolarity)) for (const k of Object.keys(r)) if (r[k] !== ak.byPolarity[p][k]) bad(`${f}: byPolarity ${p}.${k}`);
  for (const [v, r] of Object.entries(c.byValue)) for (const k of Object.keys(r)) if (r[k] !== ak.byValue[v][k]) bad(`${f}: byValue ${v}.${k}`);
  const dis = d.disagreementsAdopted.map((x) => `${x.packet}:${x.id} ${x.declared}->${x.final}`).sort().join("|");
  if (dis !== ak.disagreements.slice().sort().join("|")) bad(`${f}: disagreements differ from table`);
  if (c.publishedVariants.slice().sort().join() !== ak.publishedVariants.map((x) => x.split(":")[1]).sort().join()) bad(`${f}: publishedVariants`);
  if (!eq(d.kinds.map((k) => k.value), ["published", "assessment", "materialized", "retrieved"])) bad(`${f}: kind order`);
  for (const [, types] of Object.entries(d.recordsByKind)) for (const t of types) if (!nodeTypes.has(t)) bad(`${f}: node type ${t}`);
  if (!facts.types.Report.fields.queryDigest) bad(`${f}: Report.queryDigest missing`);
}
// 6. targets
{
  const f = "targets.yaml", d = docs[f];
  const sy = d.synthesis;
  for (const fl of sy.sdl.node.fields) if (!facts.types.Target.fields[fl]) bad(`${f}: Target.${fl} missing`);
  if (!eq(facts.unions.TargetMeasure, sy.sdl.union.TargetMeasure)) bad(`${f}: TargetMeasure ${facts.unions.TargetMeasure}`);
  const rel = facts.relTypes.OPERATIONALIZED_BY;
  if (rel.length !== 1 || rel[0].properties !== sy.sdl.relationship.properties || rel[0].to !== "TargetMeasure") bad(`${f}: OPERATIONALIZED_BY ${JSON.stringify(rel)}`);
  if (d.node.measuresSeam.edgeProperties !== rel[0].properties) bad(`${f}: measuresSeam.edgeProperties`);
  const members = d.node.measuresSeam.to.map((x) => x.split(".")[1]);
  if (members.slice().sort().join() !== facts.unions.TargetMeasure.slice().sort().join()) bad(`${f}: measuresSeam.to`);
  for (const h of sy.targetKeysHolders) { const [t, fl] = h.split("."); if (!facts.types[t]?.fields[fl]) bad(`${f}: ${h} missing`); }
  for (const t of d.targets) if (!/^target:[a-z0-9-]+$/.test(t.id)) bad(`${f}: key ${t.id}`);
  if (d.targets.length !== sy.counts.targets || d.deferredTargets.length !== sy.counts.deferred) bad(`${f}: counts`);
  const popText = d.polarityRule.requiredQualifiers.population;
  for (const tok of popText.match(/\b[A-Z][A-Z_]{3,}\b/g) || []) if (!E.PopulationGroup.includes(tok) && !["USE_CONSTRAINED_IN"].includes(tok)) bad(`${f}: population token ${tok} not in PopulationGroup`);
  if (!eq(Object.values(d.polarityRule.assessmentDirection.mapping).concat(), ["BENEFIT", "HARM", "NO_EFFECT", "MIXED"])) bad(`${f}: assessmentDirection.mapping`);
  for (const v of Object.values(d.polarityRule.assessmentDirection.mapping)) inEnum(f, "EffectDirection", v, "assessmentDirection.mapping");
  // goal-polarity agrees with targets
  const gp = docs["goal-polarity.yaml"].goalPredicates;
  if (gp.map((g) => g.predicate).join() !== d.polarityRule.predicates.map((p) => p.value).join()) bad(`goal-polarity vs targets predicates`);
  for (const g of gp) { const m = d.polarityRule.assessmentDirection.mapping[g.predicate] ?? null; if (m !== g.effectDirection) bad(`goal-polarity ${g.predicate} effectDirection ${g.effectDirection} vs targets ${m}`); }
}
// 7. frontiers
{
  const f = "frontiers.yaml", d = docs[f];
  for (const fl of d.synthesis.sdl.node.fields) if (!facts.types.Frontier.fields[fl]) bad(`${f}: Frontier.${fl} missing`);
  for (const r of d.synthesis.sdl.relationships) { const got = facts.relTypes[r.type]; if (!got) { bad(`${f}: rel ${r.type} missing`); continue; } if (got.length !== r.pairs.length) bad(`${f}: rel ${r.type} pairs ${got.length} vs ${r.pairs.length}`); for (const g of got) if (g.properties !== r.properties) bad(`${f}: rel ${r.type} properties ${g.properties}`); }
  for (const fl of ["approvalPathway", "designationType"]) if (facts.types.Event.fields[fl]?.type !== "RegulatoryPathway") bad(`${f}: Event.${fl} type ${facts.types.Event.fields[fl]?.type}`);
  if (!eq(d.eventKinds.map((e) => e.value), E.EventKind)) bad(`${f}: eventKinds order/set vs SDL`);
}
// 8. identifier schemes
{
  const f = "identifier-schemes.yaml", d = docs[f];
  const codes = d.schemes.map((s) => s.code);
  if (new Set(codes).size !== codes.length) bad(`${f}: duplicate codes`);
  if (codes.length !== d.counts.schemes) bad(`${f}: count`);
  for (const s of d.schemes) { if (!/^[A-Z][A-Z0-9_]+$/.test(s.code)) bad(`${f}: code ${s.code}`); if (s.pattern) { try { new RegExp(s.pattern); } catch { bad(`${f}: pattern ${s.code}`); } } if (!s.normalization?.rule) bad(`${f}: ${s.code} no rule id`); for (const u of s.usedByNodeTypes) if (!nodeTypes.has(u.split(".")[1])) bad(`${f}: ${s.code} usedBy ${u}`); }
  for (const fl of ["scheme", "issuer", "value", "normalizationRule", "validFrom", "validTo"]) if (!facts.types.Identifier.fields[fl]) bad(`${f}: Identifier.${fl}`);
  if (facts.types.Identifier.fields.scheme.type !== "String") bad(`${f}: Identifier.scheme not String`);
}
// 9. Cypher: token check + extract for EXPLAIN
mkdirSync(cyDir, { recursive: true });
const cyphers = [
  ["targets.QP-TARGET-01", docs["targets.yaml"].queryPattern.cypher, { targetKey: "target:sleep", directions: ["IMPROVES_TARGET"], pop: null, asOf: "2026-10-09T00:00:00Z", validAt: null }],
  ["targets.whatIsThisFor", docs["targets.yaml"].queryPattern.variants.whatIsThisFor, { meansUid: "hu:x", asOf: "2026-10-09T00:00:00Z" }],
  ...docs["frontiers.yaml"].queryShapes.filter((q) => q.cypher).map((q) => [`frontiers.${q.id}`, q.cypher, { frontierKey: "frontier:senolytics-in-humans", asOf: "2026-10-09T00:00:00Z", days: 90, compoundUid: "hu:x", targetKey: "target:longevity" }]),
];
const relEdgeFields = new Set(); for (const t of Object.values(facts.types)) if (!t.labels) for (const k of Object.keys(t.fields)) relEdgeFields.add(k);
const nodeFields = new Set(); for (const t of Object.values(facts.types)) if (t.labels) for (const k of Object.keys(t.fields)) nodeFields.add(k);
for (const [id, cy, params] of cyphers) {
  const body = cy.replace(/\/\/.*$/gm, "");
  const labels = [...body.matchAll(/\(\s*\w*\s*:\s*([A-Za-z|]+)/g)].flatMap((m) => m[1].split("|"));
  const rels = [...body.matchAll(/\[\s*\w*\s*:\s*([A-Z_|]+)/g)].flatMap((m) => m[1].split("|"));
  const props = [...new Set([...body.matchAll(/\b[a-z]\w*\.([a-zA-Z]\w*)\b/g)].map((m) => m[1]))];
  const unknownLabels = [...new Set(labels.filter((l) => !facts.labels.includes(l)))];
  const unknownRels = [...new Set(rels.filter((r) => !facts.relTypes[r]))];
  const unknownProps = props.filter((p) => !nodeFields.has(p) && !relEdgeFields.has(p));
  report.cypher.push({ id, unknownLabels, unknownRels, unknownProps });
  for (const x of unknownLabels) bad(`cypher ${id}: label ${x} not in SDL`);
  for (const x of unknownRels) bad(`cypher ${id}: relationship ${x} not in SDL`);
  for (const x of unknownProps) bad(`cypher ${id}: property ${x} not on any SDL type`);
  writeFileSync(resolve(cyDir, `${id}.cypher`), "EXPLAIN " + cy.trim() + "\n");
  writeFileSync(resolve(cyDir, `${id}.params`), JSON.stringify(params));
}
console.log(JSON.stringify(report, null, 1));
process.exitCode = report.problems.length ? 1 : 0;

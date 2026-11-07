// packets/D5/vocab-targets.yaml@0.2.2 -> final/vocabularies/targets.yaml (final names, synthesis rulings). Text edits, each asserted.
// usage: node build-targets.mjs <worktree>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const wt = process.argv[2];
const P = (p) => resolve(wt, "schema/program", p);
const require = createRequire(resolve(wt, "packages/schema-workspace/package.json"));
const YAML = require("yaml");
const srcPath = P("packets/D5/vocab-targets.yaml");
let s = readFileSync(srcPath, "utf8").replace(/\r\n/g, "\n");
const srcSha = createHash("sha256").update(readFileSync(srcPath)).digest("hex");
const edits = [];
const rep = (from, to, why) => {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`edit '${why}': expected 1 match, found ${n}: ${from.slice(0, 80)}`);
  s = s.replace(from, to);
  edits.push(why);
};

rep("consumers: [K, D1, D2, D3, D4, D6, D7, D8, D9, D10, D11, D12, D13]",
  "consumers: [K, D1, D2, D3, D4, D6, D7, D8, D9, D10, D12, D13]   # synthesis: D11 removed (R-85)", "R-85 consumers");
rep(`    to: [D4.Biomarker, D4.Metric, D2.Outcome]   # union TargetMeasure (3); 0.1.0 [D2.Outcome, D4.Biomarker]; 0.2.0 [D4.Biomarker, D4.Metric]
    class: structural (curated vocabulary mapping, not a claim of effect)
    edgeProperties: StructuralEdgeProperties`,
`    to: [D4.Biomarker, D4.Metric, D2.Outcome, D2.Condition]   # union TargetMeasure (4; synthesis R-70 added D2.Condition: incidence of the condition measures the target); 0.1.0 [D2.Outcome, D4.Biomarker]; 0.2.0 [D4.Biomarker, D4.Metric]; 0.2.1 [+ D2.Outcome]
    class: "asserted, recorded time only (synthesis R-26: a curator states the mapping; the authorizing Assertion carries basisKind CURATOR_CLASSIFICATION, R-25); a curated vocabulary mapping, not a claim of effect"
    edgeProperties: AssertedRecordedProperties   # synthesis (final SDL Target.operationalizedBy); was StructuralEdgeProperties`, "R-70/R-26/R-25 measures seam");
rep(`purpose: "Lets study evidence reach a target: StudyResult -RESULT_FOR-> OutcomeDefinition -MEASURES-> Metric|Biomarker|Outcome <-OPERATIONALIZED_BY- Target,`,
  `purpose: "Lets study evidence reach a target: StudyResult -RESULT_FOR-> OutcomeDefinition -MEASURES-> Metric|Biomarker|Outcome|Condition <-OPERATIONALIZED_BY- Target (D3 union OutcomeMeasureTarget, R-70),`, "R-70 purpose");
rep("  sdl: packets/D5/04-schema-proposal.graphql (type Target)",
  "  sdl: final/schema/D5.graphql (type Target, union TargetMeasure); assembled in final/schema/final_biotech_schema_v2.graphql   # was packets/D5/04-schema-proposal.graphql", "final SDL path");
rep(`    outcome: "optional \`outcome:<D4 Metric | D4 Biomarker | D2 Outcome uid>\` naming the measure the direction refers to (keeps MIXED explainable)"`,
  `    outcome: "optional \`outcome:<D4 Metric | D4 Biomarker | D2 Outcome | D2 Condition uid>\` naming the measure the direction refers to (keeps MIXED explainable). Synthesis note: the final D5 register (final/_work/registers/D5.relationship.yaml) lists this qualifier as \`outcomeUid\` and adds \`duration\`; the predicate registry fixes one spelling (goal-polarity.yaml open item 2)"`, "qualifier spelling note");
rep("    (t)-[:OPERATIONALIZED_BY]->(m:Metric|Biomarker|Outcome)<-[:MEASURES]-(od:OutcomeDefinition)<-[:RESULT_FOR]-(r:StudyResult)",
  "    (t)-[:OPERATIONALIZED_BY]->(m:Metric|Biomarker|Outcome|Condition)<-[:MEASURES]-(od:OutcomeDefinition)<-[:RESULT_FOR]-(r:StudyResult)", "R-70 study branch");
rep("    through one curated structural edge Target-[OPERATIONALIZED_BY]->(Biomarker|Metric|Outcome) owned by D5; study",
  "    through one curated asserted (recorded-time) edge Target-[OPERATIONALIZED_BY]->(Biomarker|Metric|Outcome|Condition) owned by D5 (R-26, R-70); study", "R-26/R-70 seam rule");
rep("    - \"list `targets: packets/D5/vocab-targets.yaml@0.2.2` (0.2.0 and 0.2.1 also accepted)",
  "    - \"list `targets: final/vocabularies/targets.yaml@0.2.2` (synthesis R-60 / R-09: references point at final/vocabularies/; was packets/D5/vocab-targets.yaml@0.2.2; 0.2.0 and 0.2.1 also accepted)", "R-60 pin path");
rep("Not goal predicates: RECOMMENDS_AGAINST (D10, valid without a Target object) and REPORTS_ADVERSE_EXPERIENCE (adverse effects are CAUSES_ADVERSE_EFFECT with a D2 Condition object)\"",
  "Not goal predicates: RECOMMENDS_AGAINST and RECOMMENDS_USE (registrar D9, R-83: the means is the subject, never a Target object; a goal goes in the qualifier target:<key>) and REPORTS_ADVERSE_EXPERIENCE (retired, R-84: adverse effects are CAUSES_ADVERSE_EFFECT with a D2 Condition object). The one other predicate with a Target object is D2's MEDIATES_TARGET (subject a D2 Mechanism, not a means; admitted by R-83, OQ-D5-37)\"", "R-83/R-84 consumer obligation");
rep("    - \"D4: accept the incoming curated OPERATIONALIZED_BY seam from Target to Biomarker and Metric (owner D5); D2: the same into Outcome\"",
  "    - \"D4: accept the incoming curated OPERATIONALIZED_BY seam from Target to Biomarker and Metric (owner D5); D2: the same into Outcome and Condition (R-70)\"", "R-70 consumer obligation");
rep("  predicates:                         # closed list; values of Assertion.predicate (kernel field), owner D5",
  "  predicates:                         # closed list; values of Assertion.predicate (kernel field), owner D5 (sole registrar, R-52); subjects include D12.FoodCategory (R-85), see final/_work/registers/D5.relationship.yaml predicateOnly", "R-52/R-85 predicates");

const header = `# Targets vocabulary — FINAL (synthesis, VOCABULARIES stage, 2026-10-09).
# GENERATED from packets/D5/vocab-targets.yaml@0.2.2 (sha256 ${srcSha}) by scratch synth/vocab/build-targets.mjs
# (final/_runlog/vocabularies.md): the packet text with ${edits.length} asserted edits that bring it to the final names and the
# synthesis rulings (R-25, R-26, R-52, R-60, R-70, R-83, R-84, R-85), plus the \`synthesis\` block at the end. Version stays
# 0.2.2: no target id, key, value or predicate changed, so consumers pinned @0.2.2 (R-60) stay valid.
# ---- original packet header follows ----
`;
const finalBlock = `
# ---------------------------------------------------------------------------------------------
# 6. Synthesis (S, 2026-10-09): what changed against the packet, and the binding to the final SDL
# ---------------------------------------------------------------------------------------------
synthesis:
  publishedAs: final/vocabularies/targets.yaml@0.2.2
  source: packets/D5/vocab-targets.yaml@0.2.2
  rulings:
    - {ruling: R-60, change: "published here as targets@0.2.2; consumers reference final/vocabularies/ (R-09)"}
    - {ruling: R-61, change: "node name Target confirmed"}
    - {ruling: R-70, change: "TargetMeasure = Biomarker | Metric | Outcome | Condition (4 members); condition-coded outcomes reach a Target through the typed member, not a shared Identifier (R-42)"}
    - {ruling: R-26, change: "OPERATIONALIZED_BY is asserted, recorded time only (AssertedRecordedProperties), not structural"}
    - {ruling: R-25, change: "the curator's OPERATIONALIZED_BY Assertion carries basisKind CURATOR_CLASSIFICATION"}
    - {ruling: R-52, change: "D5 is the sole registrar of the five goal predicates (and CAUSES_ADVERSE_EFFECT, HAS_UPPER_LIMIT, HAS_AUTHORIZED_DOSE_RANGE, USE_CONSTRAINED_IN, INTERACTS_WITH); registry final/vocabularies/predicates.yaml"}
    - {ruling: R-83, change: "RECOMMENDS_USE / RECOMMENDS_AGAINST registered by D9, never with a Target object; D2 MEDIATES_TARGET admitted"}
    - {ruling: R-84, change: "REPORTS_ADVERSE_EXPERIENCE retired; CAUSES_ADVERSE_EFFECT (object D2 Condition)"}
    - {ruling: R-85, change: "goal predicates admit D12.FoodCategory subjects; D11 removed from consumers"}
    - {ruling: R-28, change: "ProtocolStep STEP_USES targets the kernel interface Subjectable (admissible types listed in the D5 register, executor-enforced; D12 DietaryPattern and FoodCategory admissible, R-63)"}
  targetKeysHolders:   # the only records allowed to carry target keys as a property (seamRule.exception); all three exist in the final SDL
    - ProtocolStep.targetKeys
    - Frontier.targetKeys
    - DecisionCriterion.targetKeys
  sdl:
    node: {type: Target, labels: [Target, Entity], implements: [Entity, Subjectable], fields: [key, label, definition, parentKey, level, synonyms, vocabVersion, status, replacedBy, operationalizedBy]}
    union: {TargetMeasure: [Biomarker, Metric, Outcome, Condition]}
    relationship: {type: OPERATIONALIZED_BY, from: Target, field: operationalizedBy, direction: OUT, properties: AssertedRecordedProperties}
  sdlEnums:
    TargetStatus: [ACTIVE, DEPRECATED]
    EffectDirection: [BENEFIT, HARM, MIXED, NO_EFFECT, UNKNOWN]
    PopulationGroup: [UNSPECIFIED, GENERAL_ADULTS, OLDER_ADULTS, ADOLESCENTS, CHILDREN, INFANTS, PREGNANT, LACTATING, TRYING_TO_CONCEIVE, ATHLETES, PRE_SURGERY, IMMUNOSUPPRESSED, ON_PRESCRIPTION_MEDICATION, OTHER]
  counts: {targets: 15, topLevel: 12, children: 3, deferred: 6, goalPredicates: 5}
  checks: "final/_runlog/vocabularies.md: keys, parents and levels checked; every enum value and field compared with the assembled SDL; QP-TARGET-01 and the whatIsThisFor variant EXPLAINed on Neo4j 5.26 (the other variants are prose)"
`;
s = header + s.trimEnd() + "\n" + finalBlock;
const doc = YAML.parse(s);
// structural checks
const keys = doc.targets.map((t) => t.id);
const top = doc.targets.filter((t) => t.parent === null).length;
const kids = doc.targets.filter((t) => t.parent !== null);
const badParents = kids.filter((t) => !keys.includes(t.parent) || doc.targets.find((x) => x.id === t.parent).parent !== null).map((t) => t.id);
writeFileSync(P("final/vocabularies/targets.yaml"), s);
console.log(JSON.stringify({ edits: edits.length, version: doc.version, targets: keys.length, top, children: kids.length, deferred: doc.deferredTargets.length, badParents, predicates: doc.polarityRule.predicates.map((p) => p.value), consumers: doc.consumers }));

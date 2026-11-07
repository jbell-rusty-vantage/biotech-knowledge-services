// packets/D13/vocab-frontiers.yaml@0.2.1 -> final/vocabularies/frontiers.yaml (final names, synthesis rulings). Text edits, each asserted,
// then structural checks against final/vocabularies/targets.yaml and the assembled SDL facts.
// usage: node build-frontiers.mjs <worktree> <sdl-facts.json>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const wt = process.argv[2];
const facts = JSON.parse(readFileSync(process.argv[3], "utf8"));
const P = (p) => resolve(wt, "schema/program", p);
const require = createRequire(resolve(wt, "packages/schema-workspace/package.json"));
const YAML = require("yaml");
const srcPath = P("packets/D13/vocab-frontiers.yaml");
let s = readFileSync(srcPath, "utf8").replace(/\r\n/g, "\n");
const srcSha = createHash("sha256").update(readFileSync(srcPath)).digest("hex");
const edits = [];
const rep = (from, to, why) => {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`edit '${why}': expected 1 match, found ${n}: ${from.slice(0, 90)}`);
  s = s.replace(from, to);
  edits.push(why);
};
const repAll = (from, to, why, expect) => {
  const n = s.split(from).length - 1;
  if (n !== expect) throw new Error(`edit '${why}': expected ${expect} matches, found ${n}`);
  s = s.split(from).join(to);
  edits.push(`${why} (x${n})`);
};

// pins and paths (R-60, R-09)
rep("  targets: packets/D5/vocab-targets.yaml@0.1.0      # read from the A5 worktree 2026-10-08; target keys below are A5's",
  "  targets: final/vocabularies/targets.yaml@0.2.2      # synthesis R-60 re-pin (was packets/D5/vocab-targets.yaml@0.1.0; target ids unchanged since 0.1.0)\n  regulatory-pathways: final/schema/D8.graphql enum RegulatoryPathway   # synthesis R-66: Event.approvalPathway / designationType are typed by D8's RegulatoryPathway (mapping in synthesis.regulatoryPathwayMapping)",
  "R-60 targets pin; R-66 regulatory pathways");
rep("#    targetKeys: D5 vocab-targets.yaml@0.1.0 keys.", "#    targetKeys: D5 target keys (final/vocabularies/targets.yaml@0.2.2; ids unchanged since 0.1.0).", "R-60 comment");
rep("    - \"list `frontiers: packets/D13/vocab-frontiers.yaml@0.2.1` (any @0.2.x)",
  "    - \"list `frontiers: final/vocabularies/frontiers.yaml@0.2.1` (synthesis R-60 / R-09; was packets/D13/vocab-frontiers.yaml@0.2.1; any @0.2.x)", "R-60 frontiers pin");
// R-44: PUBLICATION is no longer an event kind
rep("        - {date: 2026-07-23, kind: PUBLICATION, what: \"RASolute 302 published in NEJM\", cite: C42}",
  "        - {date: 2026-07-23, record: D3.Publication, what: \"RASolute 302 published in NEJM\", cite: C42, note: \"synthesis R-44: a publication is a D3 Publication, not an Event (event kind PUBLICATION removed)\"}", "R-44 example");
{
  const start = s.indexOf("  - {value: PUBLICATION, family: SCIENTIFIC_RECORD,");
  const end = s.indexOf("\n", start);
  if (start < 0) throw new Error("PUBLICATION row not found");
  s = s.slice(0, start) + "  # synthesis R-44: event kind PUBLICATION removed (a publication is a D3 Publication; see retiredEventKinds)" + s.slice(end);
  edits.push("R-44 remove PUBLICATION event kind");
}
{
  const start = s.indexOf("  - {value: RETRACTION, family: SCIENTIFIC_RECORD, definition: \"");
  const dstart = s.indexOf("definition: \"", start) + "definition: \"".length;
  const dend = s.indexOf("\", typicalSources", dstart);
  s = s.slice(0, dstart) + "A curated frontier milestone only (synthesis R-44): EVENT_ABOUT → D3 Publication; its clock cites the retraction notice's locator and no second date Assertion is written; the revision itself is D3 REVISES (or K HAS_REVISION_STATUS without an identified notice; SourceRevisionKind is the one revision vocabulary); authors and publisher are reached through the Publication. Was: retraction, expression of concern or major correction of a publication, the Event as its frontier-milestone view citing the same notice locators" + s.slice(dend);
  edits.push("R-44 RETRACTION definition");
}
rep("droppedPinnedCategories:", "retiredEventKinds:\n  - {value: PUBLICATION, ruling: R-44, reason: \"a peer-reviewed publication is a D3 Publication (on a kernel Source), never an Event; milestone timelines read D3 Publication dates; RETRACTION stays as a curated milestone\"}\ndroppedPinnedCategories:", "R-44 retiredEventKinds");
// R-66: pathway values from D8 RegulatoryPathway
rep("Qualifier approvalPathway (FULL | ACCELERATED | CONDITIONAL | SUPPLEMENTAL | CLEARANCE_510K | DE_NOVO | PMA | EMERGENCY_USE).",
  "Qualifier approvalPathway, typed by D8 RegulatoryPathway (synthesis R-66; e.g. US_DRUG_NDA, US_BLA, US_ACCELERATED_APPROVAL, EU_CONDITIONAL_MA, US_DEVICE_510K, US_DEVICE_DE_NOVO, US_DEVICE_PMA, US_EUA; mapping from the retired ApprovalPathway values in synthesis.regulatoryPathwayMapping).", "R-66 APPROVAL");
rep("expedited or special designation granted: Breakthrough Therapy (C01), Fast Track, RMAT, PRIME, Orphan, priority review voucher\"",
  "expedited or special designation granted: Breakthrough Therapy (C01), Fast Track, RMAT, PRIME, Orphan, priority review voucher. Qualifier designationType, typed by D8 RegulatoryPathway (synthesis R-66: US_BREAKTHROUGH_THERAPY, US_FAST_TRACK, US_RMAT, US_PRIORITY_REVIEW, US_PRIORITY_REVIEW_VOUCHER, EU_PRIME, JP_SAKIGAKE, US_ORPHAN_DESIGNATION, EU_ORPHAN_DESIGNATION)\"", "R-66 REGULATORY_DESIGNATION");
rep("(approvalPathway CLEARANCE_510K, DE_NOVO, PMA)\", ladderRank: 7}", "(approvalPathway US_DEVICE_510K, US_DEVICE_DE_NOVO, US_DEVICE_PMA; synthesis R-66)\", ladderRank: 7}", "R-66 ms:diagnostic-clearance");
rep("(device clearance; approvalPathway CLEARANCE_510K)", "(device clearance; approvalPathway US_DEVICE_510K, synthesis R-66)", "R-66 example");
rep("with designationType BREAKTHROUGH_THERAPY | RMAT | PRIME | SAKIGAKE (regulator's own definition, C01).",
  "with designationType US_BREAKTHROUGH_THERAPY | US_RMAT | EU_PRIME | JP_SAKIGAKE (D8 RegulatoryPathway values, synthesis R-66; regulator's own definition, C01).", "R-66 BC-DESIGNATION");
rep("(approvalPathway not CLEARANCE_510K unless the frontier is diagnostic)", "(approvalPathway not US_DEVICE_510K unless the frontier is diagnostic; synthesis R-66)", "R-66 BC-FIRST-APPROVAL");
// claim occurrences are kernel Assertions (K), containers D9
rep("press language ('unprecedented', 'breakthrough') is a ClaimOccurrence (D9), never this",
  "press language ('unprecedented', 'breakthrough') is a claim occurrence (kernel Assertion, assertionKind CLAIM; container D9 MediaWork), never this", "K claim occurrence BC-ANALYST");
rep("press 'breakthrough' language is listed separately from D9 ClaimOccurrences so the two are never conflated",
  "press 'breakthrough' language is listed separately from claim occurrences (kernel Assertions, assertionKind CLAIM) so the two are never conflated", "K claim occurrence QF-04");
rep("pattern: \"ClaimOccurrences (D9) whose claim subject/object is F or E's subjects,",
  "pattern: \"claim occurrences (kernel Assertions, assertionKind CLAIM, OCCURRENCE_OF a Claim; containers D9) whose claim subject/object is F or E's subjects,", "K claim occurrence QF-06");
rep("    Claim / ClaimOccurrence: \"kernel subject/object = Frontier,", "    Claim / claim occurrence (kernel Assertion, assertionKind CLAIM): \"kernel subject/object = Frontier,", "K claim occurrence attachment");
rep("they reach it through the events they are INVOLVED in / ABOUT and the studies they sponsor or test",
  "they reach it through the events they are INVOLVED in / the subject of (predicate EVENT_ABOUT) and the studies they sponsor or test", "EVENT_ABOUT wording");
rep("\"indirect: Event ABOUT subject (D1/D6/D5 seams; kernel subject pattern),", "\"indirect: EVENT_ABOUT Assertion (subject the Event, object the entity; D1/D6/D5 seams; kernel subject pattern),", "EVENT_ABOUT attachment");
rep("    - \"NOT a NarrativeArc: an arc is an assessment", "    - \"NOT a narrative arc (no NarrativeArc type in the final SDL): an arc is an assessment", "NarrativeArc note");
// ON_FRONTIER basis (R-25)
rep("      evidenceRequired: \"the classified entity's own located evidence + qualifier frontierVocabVersion=<semver> on the Assertion;",
  "      evidenceRequired: \"the classified entity's own located evidence + qualifier frontierVocabVersion=<semver> on the Assertion, basisKind CURATOR_CLASSIFICATION (synthesis R-25);", "R-25 ON_FRONTIER basis");
// Frontier has no label property; name holds the label
rep("      RETURN f.key, f.label, collect(e)[0..5] AS recentEvents", "      RETURN f.key, f.name AS label, collect(e)[0..5] AS recentEvents   // synthesis: the label is Entity.name (no label property)", "QF-09 f.name");

const header = `# Frontiers vocabulary — FINAL (synthesis, VOCABULARIES stage, 2026-10-09).
# GENERATED from packets/D13/vocab-frontiers.yaml@0.2.1 (sha256 ${srcSha}) by scratch synth/vocab/build-frontiers.mjs
# (final/_runlog/vocabularies.md): the packet text with asserted edits to final names and the synthesis rulings (R-09, R-22, R-25,
# R-44, R-60, R-65, R-66, R-91, R-92) plus the \`synthesis\` block at the end. Version stays 0.2.1: no frontier id, key or milestone id
# changed, so consumers pinned @0.2.1 (R-60) stay valid. Event-kind values follow the final SDL: PUBLICATION was removed (R-44);
# ApprovalPathway / DesignationType were replaced by D8 RegulatoryPathway (R-66).
# ---- original packet header follows ----
`;
const ek = facts.enums.EventKind;
const er = facts.enums.EventRole;
const finalBlock = `
# ---------------------------------------------------------------------------------------------
# 11. Synthesis (S, 2026-10-09): what changed against the packet, and the binding to the final SDL
# ---------------------------------------------------------------------------------------------
synthesis:
  publishedAs: final/vocabularies/frontiers.yaml@0.2.1
  source: packets/D13/vocab-frontiers.yaml@0.2.1
  rulings:
    - {ruling: R-60, change: "published here as frontiers@0.2.1; targets re-pinned to final/vocabularies/targets.yaml@0.2.2"}
    - {ruling: R-44, change: "event kind PUBLICATION removed; RETRACTION only as a curated frontier milestone (EVENT_ABOUT → D3 Publication); EventRole loses AUTHOR and PUBLISHER"}
    - {ruling: R-66, change: "enums ApprovalPathway and DesignationType removed; Event.approvalPathway / designationType typed by D8 RegulatoryPathway; breakthroughCriteria and milestone qualifiers remapped (regulatoryPathwayMapping); REGULATOR / APPLICANT / ISSUER event roles only while no DOCUMENTED_BY_RECORD exists (executor-enforced)"}
    - {ruling: R-25, change: "ON_FRONTIER classification Assertions carry basisKind CURATOR_CLASSIFICATION"}
    - {ruling: R-22, change: "LEADS_TO and RESPONDS_TO are projectionGate SUPPORT: a SUPPORT Adjudication DIRECTLY_SUPPORTED or SUPPORTED_WITH_QUALIFICATION before the edge exists (verdict-lattice.yaml)"}
    - {ruling: R-91, change: "confirmed: only Event and Study attach to a Frontier"}
    - {ruling: R-92, change: "FINANCING_AMOUNT (and DATE_OF_FIRST_SALE, INVESTOR_COUNT) registered by D13 (subject the Event); qualifier amountKind adds ROUND_TOTAL, amountBasis adds REMAINING; D7 FINANCING_AMOUNT_SOLD retired"}
    - {ruling: R-65, change: "PRESENTED_AT_CONFERENCE registered by D13, object a D9 Channel (EVENT_SERIES)"}
  regulatoryPathwayMapping:   # retired D13 value -> D8 RegulatoryPathway (packets/D8/11-open-questions.md OQ-D8-02; R-66)
    approvalPathway:
      FULL: "US_DRUG_NDA or US_BLA (by application type)"
      ACCELERATED: US_ACCELERATED_APPROVAL
      CONDITIONAL: EU_CONDITIONAL_MA
      SUPPLEMENTAL: "no pathway value: the D8 RegulatoryRecord recordKind DRUG_APPLICATION_ACTION with the supplement in recordNumber"
      CLEARANCE_510K: US_DEVICE_510K
      DE_NOVO: US_DEVICE_DE_NOVO
      PMA: US_DEVICE_PMA
      EMERGENCY_USE: US_EUA
    designationType:
      BREAKTHROUGH_THERAPY: US_BREAKTHROUGH_THERAPY
      FAST_TRACK: US_FAST_TRACK
      RMAT: US_RMAT
      PRIORITY_REVIEW: US_PRIORITY_REVIEW
      PRIORITY_REVIEW_VOUCHER: US_PRIORITY_REVIEW_VOUCHER
      PRIME: EU_PRIME
      SAKIGAKE: JP_SAKIGAKE
      ORPHAN: "US_ORPHAN_DESIGNATION or EU_ORPHAN_DESIGNATION (by jurisdiction)"
      OTHER: OTHER
  sdl:
    node: {type: Frontier, labels: [Frontier, Entity], implements: [Entity, Subjectable], fields: [key, definition, level, parentKey, granularity, synonyms, targetKeys, curationStatus, replacedBy, vocabVersion, studies], label: "Entity.name"}
    relationships:
      - {type: ON_FRONTIER, pairs: ["Event.frontiers -> Frontier (OUT)", "Frontier.studies <- Study (IN)"], properties: AssertedRecordedProperties}
      - {type: LEADS_TO, pairs: ["Event.leadsTo -> Event"], properties: AssertedRecordedProperties}
      - {type: RESPONDS_TO, pairs: ["Event.respondsTo -> Event"], properties: AssertedRecordedProperties}
      - {type: INVOLVES, pairs: ["Event.involvedOrganizations -> Organization", "Event.involvedPeople -> Person"], properties: EventRoleEdgeProperties}
      - {type: DOCUMENTED_BY_RECORD, pairs: ["Event.regulatoryRecords -> RegulatoryRecord"], properties: AssertedRecordedProperties}
  sdlEnums:
    EventKind: [${ek.join(", ")}]
    EventStatus: [${facts.enums.EventStatus.join(", ")}]
    ReadoutStage: [${facts.enums.ReadoutStage.join(", ")}]
    EndpointStatement: [${facts.enums.EndpointStatement.join(", ")}]
    DiscontinuationScope: [${facts.enums.DiscontinuationScope.join(", ")}]
    EventRole: [${er.join(", ")}]
    FrontierGranularity: [${facts.enums.FrontierGranularity.join(", ")}]
    FrontierCurationStatus: [${facts.enums.FrontierCurationStatus.join(", ")}]
  checks: "final/_runlog/vocabularies.md: frontier keys, parents, levels, granularity, milestone ids, example event kinds and targetKeys checked; eventKinds equal the SDL EventKind; pathway values checked against RegulatoryPathway; QF-01, QF-02, QF-03, QF-05, QF-07, QF-09 EXPLAINed on Neo4j 5.26 (QF-04, QF-06, QF-08 are prose patterns)"
  sizeConsequenceFinal: "enums in the final D13 fragment: EventKind (${ek.length}), EventStatus (${facts.enums.EventStatus.length}), ReadoutStage (${facts.enums.ReadoutStage.length}), EndpointStatement (${facts.enums.EndpointStatement.length}), DiscontinuationScope (${facts.enums.DiscontinuationScope.length}), EventRole (${er.length}), FrontierGranularity (${facts.enums.FrontierGranularity.length}), FrontierCurationStatus (${facts.enums.FrontierCurationStatus.length}); ApprovalPathway and DesignationType removed (R-66); counted from the assembled SDL. Section 10 keeps the packet's numbers as history."
`;
s = header + s.trimEnd() + "\n" + finalBlock;
const doc = YAML.parse(s);
const targets = YAML.parse(readFileSync(P("final/vocabularies/targets.yaml"), "utf8"));
const targetKeys = new Set(targets.targets.map((t) => t.id));
const fkeys = doc.frontiers.map((f) => f.id);
const msIds = new Set(doc.milestoneKinds.map((m) => m.id));
const problems = [];
for (const f of doc.frontiers) {
  if (!facts.enums.FrontierGranularity.includes(f.granularity)) problems.push(`${f.id} granularity ${f.granularity}`);
  for (const t of f.targetKeys || []) if (!targetKeys.has(t)) problems.push(`${f.id} targetKey ${t}`);
  if (f.parent && (!fkeys.includes(f.parent) || doc.frontiers.find((x) => x.id === f.parent).level !== 1)) problems.push(`${f.id} parent ${f.parent}`);
  if ((f.level === 1) !== (f.parent === null)) problems.push(`${f.id} level/parent mismatch`);
  for (const m of f.milestoneKinds || []) if (!msIds.has(m)) problems.push(`${f.id} milestone ${m}`);
  for (const e of f.examples?.events || []) if (e.kind && !ek.includes(e.kind)) problems.push(`${f.id} example event kind ${e.kind}`);
}
for (const m of doc.milestoneKinds) for (const k of m.eventKinds) if (!ek.includes(k)) problems.push(`milestone ${m.id} eventKind ${k}`);
const vocabKinds = doc.eventKinds.map((e) => e.value);
const missingInVocab = ek.filter((k) => !vocabKinds.includes(k));
const missingInSdl = vocabKinds.filter((k) => !ek.includes(k));
const families = new Set(doc.eventFamilies);
for (const e of doc.eventKinds) if (!families.has(e.family)) problems.push(`event kind ${e.value} family ${e.family}`);
const regPath = facts.enums.RegulatoryPathway;
const mapVals = [...Object.values(doc.synthesis.regulatoryPathwayMapping.approvalPathway), ...Object.values(doc.synthesis.regulatoryPathwayMapping.designationType)].flatMap((v) => String(v).match(/\b(?:US|EU|JP|UK|CA|AU)_[A-Z0-9_]+\b|^OTHER$/g) || []);
const badPath = [...new Set(mapVals.filter((v) => !regPath.includes(v)))];
const textPathVals = [...new Set((s.match(/\b(?:US|EU|JP)_[A-Z0-9_]+\b/g) || []))].filter((v) => !regPath.includes(v));
writeFileSync(P("final/vocabularies/frontiers.yaml"), s);
console.log(JSON.stringify({ edits: edits.length, version: doc.version, frontiers: fkeys.length, themes: doc.frontiers.filter((f) => f.level === 1).length, milestoneKinds: doc.milestoneKinds.length, eventKindsVocab: vocabKinds.length, eventKindsSdl: ek.length, missingInVocab, missingInSdl, problems, badPathwayValues: badPath, pathwayTokensNotInEnum: textPathVals, breakthroughCriteria: doc.breakthroughCriteria.length, queryShapes: doc.queryShapes.length }));

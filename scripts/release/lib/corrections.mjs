/**
 * Recorded source corrections applied at promotion (SPECIFICATION 2.4 and the S0/S1 decisions of DECISIONS.md).
 * Every edit is exact (anchor must match once) and logged with its decision id in reports/corrections.json.
 *
 * applyCorrections(files: Map<releasePath,string>, { finalDir, releaseDir })
 *   -> { files: Map<releasePath,string>, log: Array<{ id, decision, path, what }> }
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BASELINE_SCHEMA_DIGEST, graphql, prettyJson, readText, replaceOnce, sha256Hex, toYaml, YAML } from "./common.mjs";

const libDir = dirname(fileURLToPath(import.meta.url));

export async function applyCorrections(input, ctx) {
  const files = new Map(input);
  const log = [];
  const edit = (path, id, decision, what, fn) => {
    const before = files.get(path);
    if (before === undefined) throw new Error(`correction ${id}: missing ${path}`);
    const after = fn(before);
    if (after === before) throw new Error(`correction ${id}: no change in ${path}`);
    files.set(path, after);
    log.push({ id, decision, path, what });
  };

  // ------------------------------------------------------------------------------------------------
  // 1. SDL source corrections (docstrings to accepted vocabulary; MD-D10-06 provenance stamps)
  // ------------------------------------------------------------------------------------------------
  edit("sdl/modules/kernel.graphql", "C-SDL-01", "SPEC 2.4 / MD-X-02 / FU-13", "Assertion.predicate docstring names the release predicate registry and its rejection rule", (t) =>
    replaceOnce(t, `  "Registered predicate; equals the edge type for an asserted edge."\n  predicate: String!`,
      `  "Registered predicate (release vocabularies/predicates.yaml, status registered; an alias-of name is re-keyed to its target before ingest, a retired or unknown name is rejected, R-52, MD-X-02); equals the edge type for an asserted edge."\n  predicate: String!`, "C-SDL-01"));
  edit("sdl/modules/kernel.graphql", "C-SDL-02", "SPEC 2.4 / FU-14 (a) / MD-D12-02 / R-83", "Assertion.qualifiers docstring: registered prefixes include target:<key>, comparatorArm:, comparator:; grammar authority is vocabularies/qualifiers.yaml", (t) =>
    replaceOnce(t,
      "registered prefixes such as `segment:<KIND>` (D9 segment of a media work: SPONSOR_READ, EDITORIAL, ...), `population:<code>`, `rendition:<source uid>`, `asserterBasis:PUBLISHER_DEFAULT|INFERRED` (R-16), `sourceRecordRemovedAt:<date>` (the source's own record time, R-24).\"",
      "registered prefixes such as `segment:<KIND>` (D9 segment of a media work: SPONSOR_READ, EDITORIAL, ...), `population:<code>`, `rendition:<source uid>`, `target:<key>` (a D5 Target key, R-83), `comparatorArm:<arm uid>` and `comparator:<QuantityComparator>` (MD-D12-02), `asserterBasis:PUBLISHER_DEFAULT|INFERRED` (R-16), `sourceRecordRemovedAt:<date>` (the source's own record time, R-24). The name, separator and value grammar of every registered qualifier is the release qualifier registry vocabularies/qualifiers.yaml (bks-qualifier-grammar.v1); an unregistered qualifier name is rejected by the executor.\"", "C-SDL-02"));
  edit("sdl/modules/kernel.graphql", "C-SDL-03", "SPEC 2.4 / R-52", "Kernel predicate-convention docstring points at the release registry path", (t) =>
    replaceOnce(t, "Kernel predicate conventions, registered once by K in final/vocabularies/predicates.yaml (R-52;", "Kernel predicate conventions, registered once by K in the release registry vocabularies/predicates.yaml (R-52;", "C-SDL-03"));
  edit("sdl/modules/D10.graphql", "C-SDL-04", "MD-X-03 (d) / MD-X-02", "DecisionCriterion.inputPredicates docstring: retired DECLARES_AMOUNT replaced by DECLARES_COMPONENT", (t) =>
    replaceOnce(t, `"Assertion.predicate values the criterion reads (e.g. DECLARES_AMOUNT, IMPROVES_TARGET, HAS_UPPER_LIMIT)."`,
      `"Registered Assertion.predicate values the criterion reads (e.g. DECLARES_COMPONENT, IMPROVES_TARGET, HAS_UPPER_LIMIT; vocabularies/predicates.yaml)."`, "C-SDL-04"));
  edit("sdl/modules/D10.graphql", "C-SDL-05", "MD-D10-06 / R-45 condition 3 / R-46", "DecisionCriterion.publisherUid retained only with generated provenance stamps: publisherUidMethodVersion, publisherUidDerivedAt, publisherUidAuthorityUid", (t) =>
    replaceOnce(t,
      `  "Cache only (R-45, R-46): uid of the Organization or Agent that defines the criterion (BellLabs, or a third-party ranker). The authority is the criterion set's authorizing Assertion (ASSERTED_BY the publisher) or, for BellLabs criteria, WAS_GENERATED_BY the BellLabs Activity; answers cite that, never this property."\n  publisherUid: String\n`,
      `  "Cache only (R-45, R-46, MD-D10-06): uid of the Organization or Agent that defines the criterion (BellLabs, or a third-party ranker). The authority is the criterion set's authorizing Assertion (ASSERTED_BY the publisher) or, for BellLabs criteria, WAS_GENERATED_BY the BellLabs Activity; answers cite that, never this property. Written only together with publisherUidMethodVersion, publisherUidDerivedAt and publisherUidAuthorityUid; a value without all three stamps is unproven and is not projected (rules/projection-rules.yaml)."\n  publisherUid: String\n  "Provenance stamp of the publisherUid cache (MD-D10-06): versioned derivation method that computed it (e.g. bl-cache/decision-criterion-publisher@1)."\n  publisherUidMethodVersion: String\n  "Provenance stamp of the publisherUid cache (MD-D10-06): when the executor derived it from its authority."\n  publisherUidDerivedAt: DateTime\n  "Provenance stamp of the publisherUid cache (MD-D10-06): uid of the authorizing Assertion (third-party criterion) or Activity (BellLabs criterion) the cache was derived from."\n  publisherUidAuthorityUid: String\n`, "C-SDL-05"));
  edit("sdl/modules/D1.graphql", "C-SDL-06", "SPEC 2.4 / R-57", "QuantityComparator docstring: retired-enum mapping lives in migration/v1-map.yaml", (t) =>
    replaceOnce(t, "EQUALS -> EQ, ABSENT_IN -> ABSENT; mapping in final/vocabularies); D12.", "EQUALS -> EQ, ABSENT_IN -> ABSENT; mapping in the release migration/v1-map.yaml enums.valueMappings); D12.", "C-SDL-06"));
  edit("sdl/modules/D8.graphql", "C-SDL-07", "SPEC 2.4 / R-57", "D8 module comment: SpecComparator mapping lives in migration/v1-map.yaml", (t) =>
    replaceOnce(t, "NOT_MORE_THAN->LTE, RANGE->BETWEEN, EQUALS->EQ, ABSENT_IN->ABSENT; mapping recorded in final/vocabularies).", "NOT_MORE_THAN->LTE, RANGE->BETWEEN, EQUALS->EQ, ABSENT_IN->ABSENT; mapping recorded in migration/v1-map.yaml).", "C-SDL-07"));
  edit("sdl/modules/D8.graphql", "C-SDL-08", "SPEC 2.4 / R-56 / R-66", "Regulatory pathway enum docstring: OQ-D8-02 mapping lives in migration/v1-map.yaml", (t) =>
    replaceOnce(t, "this enum through the OQ-D8-02 mapping published in final/vocabularies.", "this enum through the OQ-D8-02 mapping published in the release migration/v1-map.yaml (enums.valueMappings).", "C-SDL-08"));

  edit("sdl/modules/D13.graphql", "C-SDL-09", "SPEC 2.4 / FU-14 (a)", "D13 docstrings and module comment: qualifier roleText:<label> (registered spelling; roleText= is a migration alias in vocabularies/qualifiers.yaml)", (t) => {
    let s = replaceOnce(t, "# as roleText=<label>);", "# as roleText:<label>);", "C-SDL-09a");
    s = replaceOnce(s, "is the authorizing Assertion's qualifier roleText=<label>, never an edge field (kernel rule M11(3)).", "is the authorizing Assertion's qualifier roleText:<label>, never an edge field (kernel rule M11(3)).", "C-SDL-09b");
    return replaceOnce(s, "qualifier `roleText=<label>` (kernel rule M11(3):", "qualifier `roleText:<label>` (kernel rule M11(3):", "C-SDL-09c");
  });

  // ------------------------------------------------------------------------------------------------
  // 2. Register stamps and the DecisionCriterion property count
  // ------------------------------------------------------------------------------------------------
  for (const path of ["registers/node-register.yaml", "registers/relationship-register.yaml", "registers/seams.yaml"]) {
    edit(path, `C-REG-STAMP-${path.split("/")[1]}`, "SPEC 2.4 (no baseline hash reuse)", "sdl.sha256 marked as the parent baseline; the release binds the register to sdl/assembled.graphql through release.json", (t) =>
      replaceOnce(t, `  sha256: ${BASELINE_SCHEMA_DIGEST.slice(7)}\n`, `  sha256: ${BASELINE_SCHEMA_DIGEST.slice(7)}  # parent baseline (candidate); release binding: release.json identities.schemaDigest\n`, path));
  }
  edit("registers/node-register.yaml", "C-REG-01", "MD-D10-06", "DecisionCriterion otherProperties 11 -> 14 (three publisherUid provenance stamps)", (t) =>
    replaceOnce(t, "      - publisherUid\n      - recordedTo\n    otherProperties: 11\n", "      - publisherUid\n      - recordedTo\n    otherProperties: 14\n    otherPropertiesNote: publisherUidMethodVersion, publisherUidDerivedAt and publisherUidAuthorityUid stamp the publisherUid cache (MD-D10-06, release correction C-SDL-05)\n", "C-REG-01"));

  // OD-03 / R-03: executor permissions explicit for every type ({graphql: none, executor: [...]}); the packet-format
  // GraphQL booleans and "unstated" rows never grant or deny executor writes.
  for (const [name, ops, basis] of EXECUTOR_EXPLICIT) {
    edit("registers/node-register.yaml", `C-REG-EXEC-${name}`, "OD-03 / R-03", `${name}: executor permissions made explicit (${ops.join(", ")})`, (t) => {
      const anchor = t.indexOf(`\n    name: ${name}\n`);
      if (anchor < 0) throw new Error(`C-REG-EXEC: node ${name} not found`);
      const end = t.indexOf("\n  - module:", anchor + 1);
      const entry = t.slice(anchor, end < 0 ? undefined : end);
      const m = /\n    mutations:\n(?:      .*\n|        .*\n)+/.exec(`${entry}\n`);
      if (!m) throw new Error(`C-REG-EXEC: ${name} has no mutations block`);
      const block = `\n    mutations:\n      graphql: none\n      executor:\n${ops.map((o) => `        - ${o}`).join("\n")}\n      executorBasis: "${basis}"\n      packetGraphqlFlagsIgnored: true\n`;
      const newEntry = `${entry}\n`.replace(m[0], block).replace(/\n$/, "");
      return t.slice(0, anchor) + newEntry + (end < 0 ? "" : t.slice(end));
    });
  }

  // ------------------------------------------------------------------------------------------------
  // 3. Predicate registry dispositions (MD-X-02, MD-X-03, FU-13, FU-14 f)
  // ------------------------------------------------------------------------------------------------
  const sdlFields = fieldsByType(files);
  const predPath = "vocabularies/predicates.yaml";
  const preds = YAML.parse(files.get(predPath));
  const predLog = applyPredicateDispositions(preds, sdlFields);
  files.set(predPath, toYaml(preds, predicateHeader(sha256Hex(readText(resolve(ctx.finalDir, "vocabularies", "predicates.yaml"))))));
  log.push({ id: "C-PRED", decision: "MD-X-02 / MD-X-03 / FU-13 / FU-14 (f)", path: predPath, what: `${predLog.length} predicate dispositions applied (see reports/predicate-registry-report.json)` });

  // ------------------------------------------------------------------------------------------------
  // 4. Identifier scheme activation (KN-06, MD-X-01, OD-12)
  // ------------------------------------------------------------------------------------------------
  const idPath = "vocabularies/identifier-schemes.yaml";
  const schemes = YAML.parse(files.get(idPath));
  const usage = fixtureSchemeUsage(ctx.finalDir);
  const idReport = activateIdentifierSchemes(schemes, usage);
  files.set(idPath, toYaml(schemes, identifierHeader(sha256Hex(readText(resolve(ctx.finalDir, "vocabularies", "identifier-schemes.yaml"))))));
  log.push({ id: "C-IDS", decision: "KN-06 / MD-X-01 / OD-12", path: idPath, what: `${idReport.active.length} schemes active, ${idReport.disabled.length} disabled (write capability withheld; registry history retained)` });

  // ------------------------------------------------------------------------------------------------
  // 5. Promotion-time registries and maps from the role libraries (qualifiers, assessments, rules, capture methods, v1 map)
  // ------------------------------------------------------------------------------------------------
  const libs = [];
  const optional = async (name) => {
    const path = resolve(libDir, `${name}.mjs`);
    if ((process.env.BKS_RELEASE_SKIP_LIBS ?? "").split(",").includes(name)) return null;
    if (!existsSync(path)) throw new Error(`promotion library missing: scripts/release/lib/${name}.mjs`);
    libs.push(name);
    return import(pathToFileURL(path).href);
  };
  const registries = await optional("registries");
  if (registries) {
    const r = await registries.buildRegistries({ finalDir: ctx.finalDir, files });
    for (const [p, c] of r.files) files.set(p, c);
    for (const entry of r.log ?? []) log.push(entry);
  }
  const capture = await optional("capture-methods");
  if (capture) {
    const r = await capture.buildCaptureMethodRegistry({ finalDir: ctx.finalDir, actionSpaceText: files.get("tooling/action-space.yaml") });
    for (const [p, c] of r.files) files.set(p, c);
    log.push({ id: "C-FU06", decision: "FU-06", path: "vocabularies/capture-methods.yaml", what: JSON.stringify(r.report?.counts ?? {}) });
  }
  const v1map = await optional("v1map");
  if (v1map && typeof v1map.buildV1Map === "function") {
    const r = await v1map.buildV1Map({ finalDir: ctx.finalDir });
    files.set("migration/v1-map.yaml", r.text);
    if (typeof v1map.buildLegacyMapPlaceholder === "function") files.set("migration/legacy-map.yaml", v1map.buildLegacyMapPlaceholder());
    log.push({ id: "C-V1MAP", decision: "S1 / seven unmapped edges (DECISIONS)", path: "migration/v1-map.yaml", what: JSON.stringify(r.report?.counts ?? {}) });
  }

  files.set("reports/corrections.json", prettyJson({ format: "bks-release-corrections.v1", corrections: log, predicateDispositions: predLog, identifierSchemes: idReport, libraries: libs }));
  return { files, log };
}

/** OD-03: explicit executor operations for the register rows whose executor permission was unstated (packet booleans). */
const ENTITY_RW = "create; update descriptive fields and FIELD-Assertion caches; never delete (kernel: the intent executor is the only writer, ADR 0003; OD-03)";
const EXECUTOR_EXPLICIT = [
  ["Study", ["create", "update"], ENTITY_RW],
  ["StudyArm", ["create", "update"], ENTITY_RW],
  ["InterventionComponent", ["create", "update"], ENTITY_RW],
  ["StudyPopulation", ["create", "update"], ENTITY_RW],
  ["OutcomeDefinition", ["create", "update"], ENTITY_RW],
  ["Publication", ["create", "update"], ENTITY_RW],
  ["Organization", ["create", "update"], ENTITY_RW],
  ["Person", ["create", "update"], ENTITY_RW],
  ["Brand", ["create", "update"], ENTITY_RW],
  ["Award", ["create", "update"], ENTITY_RW],
  ["Channel", ["create", "update"], "create + update through intents; nothing is deleted (D9 mutationsNote; OD-03)"],
  ["MediaWork", ["create", "update"], "executor writes through intents; never delete (D9 mutationsNote; OD-03)"],
  ["RegistrationVersion", ["create"], "create only: immutable registry version (identity includes versionNumber or payloadHash; SDL docstring 'Immutable'); OD-03"],
  ["StudyResult", ["create"], "create only: identity includes payloadHash, so a changed result is a new record (KN-13 analogue); OD-03"],
  ["Chunk", ["create", "delete"], "projection job only: the chunking/embedding projection Activity creates chunks and a rebuild deletes the superseded chunks (derived structure, no recordedTo); never a knowledge-agent write; OD-03"],
];

// ==================================================================================================
// SDL field index (per object/interface type) from the module sources
// ==================================================================================================
function fieldsByType(files) {
  const out = new Map();
  for (const [path, text] of files) {
    if (!path.startsWith("sdl/modules/")) continue;
    const doc = graphql.parse(text.replace(/^#.*$/gm, ""), { noLocation: true });
    for (const def of doc.definitions) {
      if (!def.name) continue;
      if (def.fields) out.set(def.name.value, new Set(def.fields.map((f) => f.name.value)));
      else out.set(def.name.value, new Set());
    }
  }
  return out;
}

// ==================================================================================================
// Predicates
// ==================================================================================================

/** MD-X-03 (a): disposition of each of the 35 proposed-new predicates. */
const PROPOSED = {
  // FIELD predicates of actual SDL fields (MD-X-03: "register required FIELD predicates from actual fields").
  DOSAGE_FORM: { action: "register-field" },
  DURATION_ISO: { action: "register-field" },
  QUANTITY: { action: "register-field" },
  INPUT_FEATURE_COUNT: { action: "register-field" },
  INPUT_PLATFORMS: { action: "register-field" },
  MAX_DAILY_SERVINGS: { action: "register-field" },
  MOLECULAR_FORMULA: { action: "register-field" },
  MOLECULAR_WEIGHT: { action: "register-field" },
  // Fixture-backed literal statements with no modeled alternative: register under the rule-3 registrar.
  CHARACTERIZES_ABSORPTION: { action: "register-literal", why: "fixture-backed source statement about a material's absorption; no typed path models it; literal only, never an efficacy edge" },
  INTERPRETS_RESULT: { action: "register-literal", why: "fixture-backed author interpretation of a result; literal, separate from a BellLabs Assessment" },
  REPORTS_CONCLUSION: { action: "register-literal", why: "fixture-backed source conclusion statement; literal" },
  REPORTS_DOSE_RANGE_STUDIED: { action: "register-literal", why: "fixture-backed statement of the dose range a source studied; literal (dose basis via qualifiers)" },
  STATES_ATTRIBUTION_CAVEAT: { action: "register-literal", why: "fixture-backed source caveat about attribution of a material effect; literal" },
  STATES_METHOD_CAVEAT: { action: "register-literal", why: "fixture-backed ranker or organization method caveat; literal" },
  WELL_TOLERATED_AT_DOSE: { action: "register-literal", why: "fixture-backed tolerability statement about an intervention component; literal, never a safety verdict" },
  DOSE_EXCEEDS_LABEL_RECOMMENDATION: { action: "register-literal", kindFrom: "relationship", why: "fixture-backed statement with no observed object type; kind corrected relationship -> literal (no endpoint can be validated)" },
  IS_MOST_ADVANCED_AGING_TEST: { action: "register-literal", kindFrom: "relationship", why: "seller superlative claim with no object type; kind corrected relationship -> literal (a CLAIM occurrence, never a typed edge)" },
  // Names with a modeled alternative: rejected, re-keyed by the fixture owner (S3 / FU-03); no blanket promotion.
  ADJUSTED_MEAN_DIFFERENCE: { action: "reject", replacedBy: ["StudyResult.estimate (FIELD predicate of the D3 result model)"] },
  CHANGE_DIFFERENCE: { action: "reject", replacedBy: ["StudyResult.estimate (FIELD predicate of the D3 result model)"] },
  REPORTS_EFFECT_SIZE: { action: "reject", replacedBy: ["StudyResult.estimate (FIELD predicate of the D3 result model)"] },
  BLOOD_NAD_CMAX_ABOVE_BASELINE_DAY14: { action: "reject", replacedBy: ["D3 StudyResult record (METRIC literals on a Publication bypass the result model)"] },
  SERUM_NAD_CONCENTRATION: { action: "reject", replacedBy: ["D3 StudyResult record"] },
  WITHIN_GROUP_CV_OF_NAD_CHANGE: { action: "reject", replacedBy: ["D3 StudyResult record"] },
  CLAIMS_THERAPEUTIC_EFFECT: { action: "reject", replacedBy: ["IMPROVES_TARGET", "INTENDED_FOR_TARGET"], note: "with claimClass DISEASE_CLAIM (R-83); the fixture owner picks per occurrence" },
  PRECONDITIONS_HEART: { action: "reject", replacedBy: ["IMPROVES_TARGET"], note: "with a cardioprotection Target (R-83)" },
  REDUCES_RISK_OF: { action: "reject", replacedBy: ["IMPROVES_TARGET", "INTENDED_FOR_TARGET", "DECREASES_RISK_OF"], note: "R-83; DECREASES_RISK_OF only for Mechanism | MolecularEntity | Condition subjects" },
  DECLARED_VIABLE_COUNT: { action: "reject", replacedBy: ["DECLARES_COMPONENT"], note: "line amount with unit {CFU}" },
  DISCLAIMS_ENDORSEMENT: { action: "reject", replacedBy: ["RECOMMENDS_USE"], note: "polarity NEGATIVE with a means subject" },
  HAS_OFF_TARGET_ACTIVITY: { action: "reject", replacedBy: ["INHIBITS", "ACTIVATES", "BINDS"], note: "D2 mechanism predicate per named target" },
  INDEXED_AS_PUBLICATION_TYPE: { action: "reject", replacedBy: ["PUBLICATION_KIND"], note: "FIELD predicate of Publication.publicationKind when the indexer's type is the work's kind" },
  QUALIFIES: { action: "reject", replacedBy: ["HAS_EVIDENCE {role: QUALIFIES} plus a registered qualifier"], note: "EvidenceRole QUALIFIES is an edge role, not a predicate" },
  SAFETY_FINDING_REPORTED: { action: "reject", replacedBy: ["CAUSES_ADVERSE_EFFECT"], note: "D5, with a Condition object" },
  SERIOUS_ADVERSE_EVENT_REPORTED: { action: "reject", replacedBy: ["CAUSES_ADVERSE_EFFECT"], note: "D5, with a Condition object" },
  STATES_LIMITATION: { action: "reject", replacedBy: ["INTERPRETATION_CAVEAT"], note: "D3; subject StudyResult" },
  STATES_STUDY_DESIGN: { action: "reject", replacedBy: ["MASKING_STATED"], note: "D3 design-statement family" },
};

/** MD-X-03 (b): registrar flags. Default registrar is the subject owner; explicit semantic-family exceptions. */
const D2_FAMILY = "D2 mechanism semantic family (MD-X-03 explicit exception)";
const D10_FAMILY = "D10 evidence-statement semantic family (MD-X-03 explicit exception)";
const REGISTRAR = {
  ACTIVATES: { keep: D2_FAMILY },
  BINDS: { keep: D2_FAMILY },
  INHIBITS: { keep: D2_FAMILY },
  INCREASES_ACTIVITY_OF: { keep: D2_FAMILY },
  DECREASES_ACTIVITY_OF: { keep: D2_FAMILY },
  ATTENUATES_INDUCTION_OF: { keep: D2_FAMILY },
  ASSIGNS_LIKELIHOOD_SCORE: { keep: D10_FAMILY },
  CHARACTERIZES_EVIDENCE_STRENGTH: { keep: D10_FAMILY },
  CHARACTERIZES_INCIDENCE: { keep: D10_FAMILY },
  RANKS_OPTION: { keep: D10_FAMILY },
  REPORTS_ASSOCIATION_SCORE: { keep: D10_FAMILY },
  REPORTS_DISPROPORTIONALITY_SIGNAL: { keep: D10_FAMILY },
  REPORTS_REPORT_COUNT: { keep: D10_FAMILY },
  REQUIRES_QUALIFIED_CLAIM_WORDING: { keep: D10_FAMILY },
  HAS_ACTION_LEVEL: { keep: "D8 owns action-level and claim-condition predicates (FU-14 f)" },
  HAS_APPROVED_INDICATION: { keep: "R-52 rule 3: subjects span D1 and D6; the existing registrar D8 keeps it" },
  AUTHORIZES_CHANNEL: { move: "D7" },
  COMMISSIONED_TEST: { move: "D7" },
  CONTAINS_UNDECLARED_SUBSTANCE: { move: "D6" },
  DECLARATION_STOICHIOMETRY_CHECK: { move: "D6" },
  DISCLOSES_INTERESTS_OF: { move: "K" },
  DOCUMENT_DATE_INCONSISTENT: { move: "K" },
  FORMS_DURING_PREPARATION: { move: "D1" },
  HAS_CAPABILITY_STAGE: { move: "D7", note: "OD-34 keeps manufacturing capability as predicate-only facts; the registrar follows the Organization subject" },
  LISTING_LOT_SCOPE: { move: "D8" },
  LISTING_PACKAGE_SIZES: { move: "D8" },
  MARKED_WITH_PATENT: { move: "D6" },
  MEASURED_CONTENT_IN_PRODUCT: { move: "D6", note: "OD-10 option A keeps the predicate; only the registrar follows the Product subject" },
  MOIETY_EQUIVALENT_AMOUNT: { move: "D3" },
  STOREFRONT_CATALOG_ITEM_COUNT: { move: "D7" },
  ORGANIZATION_RENAMED: { dup: "MD-X-03 (c)" },
  PER_MAX_DAILY_DOSE_AMOUNT: { dup: "MD-X-03 (c)" },
};

function predicateHeader(sourceSha) {
  return `# Predicate registry (R-52), release biotech-schema-v2.0.0.
# PROMOTED from schema/program/final/vocabularies/predicates.yaml (BKS 431c8a7, sha256 ${sourceSha}) by
# scripts/release/promote.mjs with the MD-X-02 / MD-X-03 / FU-13 / FU-14 (f) dispositions of scripts/release/lib/corrections.mjs
# (every changed entry carries \`release\` with its decision id). Statuses: registered | alias-of:<predicate> | retired-by:<ruling>.
# No entry is proposed-new in the release: each of the 35 candidates is registered (fixture-backed, field exists) or rejected
# with a re-key target; reports/predicate-registry-report.json accounts for all 35 and every registrar flag.
# The executor accepts only status registered; alias names are re-keyed before ingest; retired and unknown names are rejected.
`;
}

function applyPredicateDispositions(doc, sdlFields) {
  const out = [];
  const byName = new Map(doc.predicates.map((p) => [p.predicate, p]));
  const mark = (p, decision, what, extra = {}) => {
    p.release = { decision, change: what, ...extra };
    out.push({ predicate: p.predicate, decision, change: what, ...extra });
  };
  // (a) proposed-new
  for (const p of doc.predicates.filter((x) => x.status === "proposed-new")) {
    const d = PROPOSED[p.predicate];
    if (!d) throw new Error(`MD-X-03: no disposition for proposed-new ${p.predicate}`);
    if (d.action === "register-field") {
      const [type, field] = String(p.field ?? "").split(".");
      if (!type || !field || !sdlFields.get(type)?.has(field)) {
        p.status = "retired-by:MD-X-03";
        p.kind = "retired";
        mark(p, "MD-X-03 (a)", "rejected: FIELD predicate names no existing SDL field", { field: p.field ?? null });
      } else {
        p.status = "registered";
        p.registrarBasis = `R-52 rule 3 (owner of the subject type); MD-X-03 registers the FIELD predicate of the existing SDL field ${p.field}`;
        mark(p, "MD-X-03 (a)", `registered FIELD predicate of ${p.field}`, { registrar: p.registrar, fixtureUses: p.observed?.fixtureUses ?? 0 });
      }
    } else if (d.action === "register-literal") {
      if (d.kindFrom && p.kind !== d.kindFrom) throw new Error(`MD-X-03: ${p.predicate} kind is ${p.kind}, expected ${d.kindFrom}`);
      if (d.kindFrom) p.kind = "literal";
      for (const t of p.subjectTypes ?? []) if (!sdlFields.has(t)) throw new Error(`MD-X-03: ${p.predicate} subject ${t} not in SDL`);
      p.status = "registered";
      p.registrarBasis = `R-52 rule 3 (owner of the subject type); MD-X-03 registers a fixture-backed literal: ${d.why}`;
      mark(p, "MD-X-03 (a)", d.kindFrom ? `registered literal (kind corrected from ${d.kindFrom})` : "registered fixture-backed literal", { registrar: p.registrar, fixtureUses: p.observed?.fixtureUses ?? 0 });
    } else {
      p.status = "retired-by:MD-X-03";
      p.kind = "retired";
      p.replacedBy = d.replacedBy;
      p.fixtureEdit = `S3 fixture round (FU-03): re-key ${p.observed?.fixtureUses ?? 0} fixture use(s) to ${d.replacedBy.join(" | ")}${d.note ? ` (${d.note})` : ""}`;
      mark(p, "MD-X-03 (a)", "rejected: a modeled alternative exists (no blanket promotion)", { replacedBy: d.replacedBy, fixtureUses: p.observed?.fixtureUses ?? 0 });
    }
  }
  // (b) registrar flags
  for (const p of doc.predicates.filter((x) => x.registrarCheck && /names|outside/.test(x.registrarCheck))) {
    const d = REGISTRAR[p.predicate];
    if (!d) throw new Error(`MD-X-03: no registrar disposition for ${p.predicate} (${p.registrarCheck})`);
    if (d.dup) continue;
    if (d.keep) {
      p.registrarException = d.keep;
      mark(p, "MD-X-03 (b)", `registrar ${p.registrar} kept: ${d.keep}`, { registrar: p.registrar, registrarCheck: p.registrarCheck });
    } else {
      const from = p.registrar;
      const check = p.registrarCheck;
      p.registrar = d.move;
      p.registrarBasis = `R-52 rule 3 (owner of the subject type), MD-X-03 moved from ${from}${d.note ? `; ${d.note}` : ""}`;
      p.registrarCheck = "rule 3";
      mark(p, "MD-X-03 (b)", `registrar moved ${from} -> ${d.move}`, { from, to: d.move, registrarCheck: check });
    }
  }
  // (c) duplicates and (e) MEASURES
  const calc = byName.get("CALCULATED_DAILY_MAX_INTAKE");
  const perMax = byName.get("PER_MAX_DAILY_DOSE_AMOUNT");
  calc.kind = "computation";
  calc.objectTypes = [...new Set([...(calc.objectTypes ?? []), ...(perMax.objectTypes ?? [])])].sort();
  calc.questions = [...new Set([...(calc.questions ?? []), ...(perMax.questions ?? [])])].sort();
  calc.notes = [...(calc.notes ?? []), "MD-X-03 (c): consolidates D1 PER_MAX_DAILY_DOSE_AMOUNT (now its alias); the object is optional: the substance, constituent or material the daily maximum is computed for"];
  mark(calc, "MD-X-03 (c)", "consolidated dose duplicate: the one computation predicate for the per-label daily maximum", { absorbed: "PER_MAX_DAILY_DOSE_AMOUNT" });
  perMax.status = "alias-of:CALCULATED_DAILY_MAX_INTAKE";
  perMax.kind = "retired";
  perMax.replacedBy = ["CALCULATED_DAILY_MAX_INTAKE"];
  mark(perMax, "MD-X-03 (c)", "alias-of D6 CALCULATED_DAILY_MAX_INTAKE (same subject LabelVersion; objects merged)", { registrarCheck: perMax.registrarCheck });
  const renamed = byName.get("ORGANIZATION_RENAMED");
  renamed.status = "alias-of:FORMER_NAME";
  renamed.kind = "retired";
  renamed.replacedBy = ["FORMER_NAME"];
  mark(renamed, "MD-X-03 (c)", "alias-of D7 FORMER_NAME (name episodes belong to D7; OQ-D8-26 hand-over)", { registrarCheck: renamed.registrarCheck });
  const omw = byName.get("OUTCOME_MEASURED_WITH");
  omw.objectTypes = (omw.objectTypes ?? []).filter((t) => t !== "Metric");
  omw.notes = [...(omw.notes ?? []), "MD-X-03 (c): a true outcome-to-metric relationship is the typed asserted MEASURES edge (OutcomeDefinition -> Metric); OUTCOME_MEASURED_WITH keeps only the AssayVersion / AlgorithmVersion objects and the unresolved clock-name case"];
  mark(omw, "MD-X-03 (c)", "Metric object removed (a true outcome/metric relationship uses MEASURES)");
  const measures = byName.get("MEASURES");
  measures.notes = [...(measures.notes ?? []), "MD-X-03 (e): asserted (AssertedRecordedProperties); validation-params lists it under assertedTypes only (FU-08)"];
  mark(measures, "MD-X-03 (e)", "classification asserted confirmed (the v1 params' derived flag is gone)");
  const hcc = byName.get("HAS_CLAIM_CONDITION");
  hcc.subjectTypes = [...new Set([...(hcc.subjectTypes ?? []), "Claim"])].sort();
  hcc.registrarException = "D8 owns action-level and claim-condition predicates (FU-14 f)";
  hcc.notes = [...(hcc.notes ?? []), "FU-14 (f): subject the authorizing RegulatoryRecord or the Claim it conditions; literal (valueString, or valueNumber + unitCode), no object type (Q-D12-18 binds $conditionSubjectUids, FU-14 j)"];
  mark(hcc, "FU-14 (f)", "legal subject forms RegulatoryRecord | Claim; literal semantics stated");
  // Alias chains: an alias whose target became an alias is re-pointed at the registered end of the chain (MD-X-02).
  for (const p of doc.predicates) {
    if (!p.status.startsWith("alias-of:")) continue;
    let target = p.status.slice("alias-of:".length);
    const chain = [target];
    while (byName.get(target)?.status.startsWith("alias-of:")) {
      target = byName.get(target).status.slice("alias-of:".length);
      if (chain.includes(target)) throw new Error(`alias cycle at ${p.predicate}`);
      chain.push(target);
    }
    if (chain.length > 1) {
      p.status = `alias-of:${target}`;
      p.replacedBy = [target];
      mark(p, "MD-X-02 / MD-X-03 (c)", `alias chain ${p.predicate} -> ${chain.join(" -> ")} re-pointed at ${target}`);
    }
    if (byName.get(target)?.status !== "registered") throw new Error(`alias ${p.predicate} -> ${target} does not end at a registered predicate`);
  }
  // Recount.
  const byStatus = {};
  const byKind = {};
  for (const p of doc.predicates) {
    const s = p.status.startsWith("alias-of") ? "alias-of" : p.status.startsWith("retired-by") ? "retired-by" : p.status;
    byStatus[s] = (byStatus[s] ?? 0) + 1;
    byKind[p.kind] = (byKind[p.kind] ?? 0) + 1;
  }
  if (byStatus["proposed-new"]) throw new Error("MD-X-03: proposed-new entries remain");
  const candidateCounts = doc.counts;
  doc.registry = "R-52 predicate registry (release biotech-schema-v2.0.0)";
  doc.generatedBy = "scripts/release/promote.mjs (lib/corrections.mjs) from the candidate registry";
  doc.sdl = { file: "sdl/assembled.graphql", baselineSchemaDigest: BASELINE_SCHEMA_DIGEST, releaseBinding: "release.json identities.schemaDigest" };
  doc.counts = { entries: doc.predicates.length, byStatus, byKind, candidate: candidateCounts };
  doc.rules = { ...doc.rules, status: "registered | alias-of:<predicate> (re-key, same subject/object) | retired-by:<ruling> (replacedBy + fixtureEdit / patternEdit); proposed-new is not a release status (MD-X-03)" };
  return out;
}

// ==================================================================================================
// Identifier schemes
// ==================================================================================================

/** OD-12: providers whose identifier values or lookups need licence rights this installation does not hold. */
const RESTRICTED = {
  CPT: "AMA CPT codes are licensed content (OD-12: no assumed commercial licence)",
  UMLS_CUI: "UMLS Metathesaurus licence required (OD-12)",
  SNOMEDCT: "SNOMED CT affiliate licence required (OD-12)",
  DRUGBANK: "DrugBank data licence required for provider lookup (OD-12)",
  CAS_RN: "CAS Registry is proprietary; provider lookup needs CAS rights (OD-12); a source-stated value may be kept only as quoted text",
};

function identifierHeader(sourceSha) {
  return `# Identifier scheme register, release biotech-schema-v2.0.0.
# PROMOTED from schema/program/final/vocabularies/identifier-schemes.yaml (BKS 431c8a7, sha256 ${sourceSha}) by
# scripts/release/promote.mjs (lib/corrections.mjs): KN-06 / MD-X-01 / OD-12 activation. A scheme is write-active only when it has
# a namespace and issuer, a normalization rule, the R-42 uniqueness rule, public rights and an exercised capture route
# (fixture evidence plus an authority route of readiness >= 2). Every other row stays in the register as history with
# writeStatus: disabled and its reasons; disabled schemes are not advertised as write capabilities.
`;
}

function fixtureSchemeUsage(finalDir) {
  const usage = new Map();
  const root = resolve(finalDir, "fixtures");
  const walk = (dir) => {
    for (const e of readdirSync(dir).sort()) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(json|ya?ml)$/.test(e)) {
        let data;
        try {
          const text = readText(p);
          data = e.endsWith(".json") ? JSON.parse(text) : YAML.parse(text);
        } catch {
          continue;
        }
        const rel = relative(root, dir).split(sep).join("/");
        const visit = (v) => {
          if (Array.isArray(v)) v.forEach(visit);
          else if (v && typeof v === "object") {
            if (typeof v.scheme === "string" && /^[A-Z][A-Z0-9_]+$/.test(v.scheme)) {
              const u = usage.get(v.scheme) ?? { uses: 0, fixtures: new Set() };
              u.uses++;
              u.fixtures.add(rel);
              usage.set(v.scheme, u);
            }
            Object.values(v).forEach(visit);
          }
        };
        visit(data);
      }
    }
  };
  walk(root);
  return usage;
}

function activateIdentifierSchemes(doc, usage) {
  const active = [];
  const disabled = [];
  const known = new Set(doc.schemes.map((s) => s.code));
  for (const s of doc.schemes) {
    const u = usage.get(s.code);
    const routes = s.authorityRoutes ?? [];
    const readiness = typeof s.bestRouteReadiness === "number" ? s.bestRouteReadiness : null;
    const reasons = [];
    if (!s.authority) reasons.push("no issuer/authority");
    if (!s.normalization?.rule) reasons.push("no normalization rule");
    if (RESTRICTED[s.code]) reasons.push(`rights: ${RESTRICTED[s.code]}`);
    if (!u) reasons.push("no exercised capture route: no fixture uses the scheme");
    if (!routes.length) reasons.push("no authority route");
    else if (readiness === null || readiness < 2) reasons.push(`best authority route readiness ${readiness ?? "unknown"} < 2`);
    const ok = reasons.length === 0;
    s.writeStatus = ok ? "active" : "disabled";
    s.activation = {
      namespace: `${s.code} (${s.name})`,
      issuer: s.authority ?? null,
      normalization: s.normalization?.rule ?? null,
      uniqueness: "R-42: one (scheme, issuer, normalized value) identifies at most one Subjectable",
      rights: RESTRICTED[s.code] ? "restricted" : "public-identifier",
      exercisedRoute: u ? { routes, bestRouteReadiness: readiness, fixtureUses: u.uses, fixtures: [...u.fixtures].sort() } : null,
      decision: ok ? "KN-06 / MD-X-01: active" : "KN-06 / MD-X-01: disabled (registry history retained; not an advertised write capability)",
      ...(ok ? {} : { reasons }),
    };
    (ok ? active : disabled).push(s.code);
  }
  const unknownFixtureSchemes = [...usage.entries()].filter(([k]) => !known.has(k)).map(([k, v]) => ({ scheme: k, uses: v.uses, fixtures: [...v.fixtures].sort() })).sort((a, b) => a.scheme.localeCompare(b.scheme));
  doc.status = "release";
  doc.release = {
    releaseId: "biotech-schema-v2.0.0",
    decisions: ["KN-06", "MD-X-01", "OD-12"],
    activeSchemes: active.length,
    disabledSchemes: disabled.length,
    unregisteredFixtureSchemes: unknownFixtureSchemes,
    rule: "active = issuer + normalization rule + R-42 uniqueness + public rights + exercised route (fixture use and authority route readiness >= 2)",
  };
  return { active: active.sort(), disabled: disabled.sort(), unregisteredFixtureSchemes: unknownFixtureSchemes };
}

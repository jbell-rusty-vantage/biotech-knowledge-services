/**
 * Promotion-time registry and rules emitters for the schema release (S1, fork C).
 *
 *   buildRegistries({ finalDir, files }) -> { files: Map<releasePath, string>, log: [{id, decision, path, what}], summary }
 *
 * finalDir: frozen candidate (schema/program/final at BKS 431c8a7), read-only. Also reads the frozen packet patterns
 * (schema/program/packets/<P>/03-retrieval-patterns.md) next to it. files: the promoted release sources
 * (Map<releasePath, string>); SDL modules are read from there when present (so S1 corrections are seen), else from
 * finalDir/schema.
 *
 * Emits (new release sources; YAML, LF, deterministic: no clock, sorted maps, inputs listed with sha256):
 *   vocabularies/qualifiers.yaml   bks-qualifier-grammar.v1   (FU-14 a, MD-D12-02, MD-D5-02, OD-29, R-83)
 *   vocabularies/assessments.yaml  bks-assessment-vocabulary.v1 (R-54, R-55, KN-01, MD-D3-02, MD-D4-03, MD-D7-06, MD-D9-03 b, FU-14 c/g)
 *   rules/identity-rules.yaml      bks-rules.v1
 *   rules/projection-rules.yaml    bks-rules.v1
 *   rules/temporal-rules.yaml      bks-rules.v1
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { graphql, readText, sha256Hex, toYaml, YAML } from "./common.mjs";

export const REGISTRIES_GENERATOR = "scripts/release/lib/registries.mjs";
export const REGISTRIES_VERSION = "1.0.0";

const MODULES = ["kernel", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)];
const moduleId = (m) => (m === "kernel" ? "K" : m);

// ---------------------------------------------------------------------------------------------------------------
// Input loading
// ---------------------------------------------------------------------------------------------------------------

function posix(p) {
  return p.split(sep).join("/");
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

class Inputs {
  constructor(finalDir, files) {
    this.finalDir = resolve(finalDir);
    this.programDir = resolve(finalDir, "..");
    this.files = files ?? new Map();
    this.used = new Map(); // label -> sha256
  }
  /** Reads a file under finalDir (relative) and records its digest. */
  text(rel) {
    const t = readText(resolve(this.finalDir, rel));
    this.used.set(`final/${rel}`, sha256Hex(t));
    return t;
  }
  yaml(rel) {
    return YAML.parse(this.text(rel));
  }
  /** SDL module text: promoted (corrected) copy when present, else the frozen candidate. */
  sdl(mod) {
    const releasePath = `sdl/modules/${mod}.graphql`;
    if (this.files.has(releasePath)) {
      const t = this.files.get(releasePath).replace(/\r\n/g, "\n");
      this.used.set(`release/${releasePath}`, sha256Hex(t));
      return t;
    }
    return this.text(`schema/${mod}.graphql`);
  }
  /** Packet retrieval patterns (frozen, read-only). */
  packetPatterns() {
    const out = [];
    const dir = resolve(this.programDir, "packets");
    if (!existsSync(dir)) return out;
    for (const p of readdirSync(dir).sort()) {
      const f = resolve(dir, p, "03-retrieval-patterns.md");
      if (!existsSync(f)) continue;
      const t = readText(f);
      this.used.set(`packets/${p}/03-retrieval-patterns.md`, sha256Hex(t));
      out.push({ path: `packets/${p}/03-retrieval-patterns.md`, text: t });
    }
    return out;
  }
  /** A frozen packet file (packets/<P>/<name>), when present. */
  packetFiles(name) {
    const out = [];
    const dir = resolve(this.programDir, "packets");
    if (!existsSync(dir)) return out;
    for (const p of readdirSync(dir).sort()) {
      const f = resolve(dir, p, name);
      if (!existsSync(f)) continue;
      const t = readText(f);
      this.used.set(`packets/${p}/${name}`, sha256Hex(t));
      out.push({ packet: p, path: `packets/${p}/${name}`, text: t });
    }
    return out;
  }
  /** Final patterns (patterns-by-question + query-patterns). */
  finalPatterns() {
    const out = [];
    for (const f of walk(resolve(this.finalDir, "patterns-by-question")).filter((f) => f.endsWith(".md"))) {
      const rel = posix(relative(this.finalDir, f));
      out.push({ path: `final/${rel}`, text: this.text(rel) });
    }
    out.push({ path: "final/query-patterns.md", text: this.text("query-patterns.md") });
    return out;
  }
  /** Fixture records: assertions.yaml (multi-document) and intent*.json, with one aggregate digest. */
  fixtures() {
    if (this._fixtures) return this._fixtures;
    const root = resolve(this.finalDir, "fixtures");
    const list = walk(root).filter((f) => /[\\/]assertions\.yaml$|[\\/]intent[^\\/]*\.json$/.test(f));
    const records = [];
    const digestLines = [];
    for (const f of list) {
      const rel = posix(relative(this.finalDir, f));
      const t = readText(f);
      digestLines.push(`${rel}\0${sha256Hex(t)}`);
      let docs = [];
      try {
        docs = f.endsWith(".json") ? [JSON.parse(t)] : YAML.parseAllDocuments(t).map((d) => d.toJS());
      } catch {
        docs = [];
      }
      records.push({ path: rel, dir: rel.replace(/\/[^/]+$/, ""), docs });
    }
    this.used.set(`final/fixtures (${list.length} assertions.yaml / intent*.json files, aggregate)`, sha256Hex(digestLines.join("\n")));
    this._fixtures = records;
    return records;
  }
  inputList() {
    return [...this.used.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([path, sha256]) => ({ path, sha256 }));
  }
}

// ---------------------------------------------------------------------------------------------------------------
// SDL model (light: types, fields, enums, docstrings)
// ---------------------------------------------------------------------------------------------------------------

function loadSdl(inputs) {
  const types = new Map(); // name -> {name, module, kind, description, fields:[{name, type, description}], interfaces, labels}
  const enums = new Map(); // name -> {module, values, description}
  const texts = [];
  for (const mod of MODULES) {
    const text = inputs.sdl(mod);
    texts.push({ module: moduleId(mod), path: `sdl/modules/${mod}.graphql`, text });
    const doc = graphql.parse(text, { noLocation: true });
    for (const def of doc.definitions) {
      const name = def.name?.value;
      if (!name) continue;
      if (def.kind === "EnumTypeDefinition") {
        enums.set(name, { module: moduleId(mod), values: def.values.map((v) => v.name.value), description: def.description?.value ?? "" });
        continue;
      }
      if (def.kind !== "ObjectTypeDefinition" && def.kind !== "InterfaceTypeDefinition" && def.kind !== "UnionTypeDefinition") continue;
      const nodeDir = (def.directives ?? []).find((d) => d.name.value === "node");
      const isEdge = (def.directives ?? []).some((d) => d.name.value === "relationshipProperties");
      const fields = (def.fields ?? []).map((f) => ({ name: f.name.value, type: graphql.print(f.type), description: (f.description?.value ?? "").replace(/\s+/g, " ").trim(), isRelationship: (f.directives ?? []).some((d) => d.name.value === "relationship") }));
      types.set(name, {
        name,
        module: moduleId(mod),
        kind: def.kind === "InterfaceTypeDefinition" ? "interface" : def.kind === "UnionTypeDefinition" ? "union" : isEdge ? "edge-properties" : nodeDir ? "node" : "object",
        description: (def.description?.value ?? "").replace(/\s+/g, " ").trim(),
        fields,
        interfaces: (def.interfaces ?? []).map((i) => i.name.value),
        members: (def.types ?? []).map((t) => t.name.value),
      });
    }
  }
  const nodeTypes = [...types.values()].filter((t) => t.kind === "node").map((t) => t.name).sort();
  return { types, enums, texts, nodeTypes, nodeTypeSet: new Set(nodeTypes), typeSet: new Set(types.keys()) };
}

/** Strips a module prefix (`D7.Organization` -> Organization) and keeps only SDL type names. */
function sdlTypeName(sdl, raw) {
  if (typeof raw !== "string") return null;
  const name = raw.trim().replace(/^(K|D\d+)\./, "").replace(/\s*\(.*$/, "");
  return sdl.typeSet.has(name) ? name : null;
}

// ---------------------------------------------------------------------------------------------------------------
// Qualifier grammar
// ---------------------------------------------------------------------------------------------------------------

/** Curated registry. key = prefix as written (name + separator). */
function qualifierTable(sdl) {
  const e = (name) => {
    if (!sdl.enums.has(name)) throw new Error(`qualifier grammar names unknown enum ${name}`);
    return `enum:${name}`;
  };
  const inline = (values) => `enum:[${values.join("|")}]`;
  /** [prefix, owner, valueGrammar, description, sources[], extra] */
  const rows = [
    // Kernel (Assertion.qualifiers docstring, R-16, R-24, R-31)
    ["segment:", "D9", inline(["SPONSOR_READ", "EDITORIAL", "SHOW_NOTES", "CORRECTION_NOTE"]), "D9 segment of a media work the assertion was made in (kernel-registered prefix; D9 extends the value list by registry update).", ["sdl/modules/kernel.graphql Assertion.qualifiers"], {}],
    ["population:", "D5", `${e("PopulationGroup")} | uid`, "Population the statement is scoped to: a D5 PopulationGroup code or a D3 StudyPopulation uid. Required qualifier of the D5 target/limit/harm predicates. Source wording goes to populationVerbatim:.", ["sdl/modules/kernel.graphql Assertion.qualifiers", "relationship-register moduleExtras.D12.qualifierGrammar", "predicates.yaml requiredQualifiers"], {}],
    ["populationVerbatim:", "D5", "text", "Source wording of the population (free text; never filtered).", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["rendition:", "K", "uid", "Source uid of the rendition that carried the statement (D9 re-cuts, R-43).", ["sdl/modules/kernel.graphql Assertion.qualifiers", "sdl/modules/D9.graphql CONTENT_SPONSORED_BY"], {}],
    ["asserterBasis:", "K", inline(["PUBLISHER_DEFAULT", "INFERRED"]), "How the asserter of a work that names nobody was set (R-16).", ["sdl/modules/kernel.graphql Assertion.qualifiers"], {}],
    ["sourceRecordRemovedAt:", "K", "iso-date", "The source's own record-removal time (R-24); not recorded time.", ["sdl/modules/kernel.graphql Assertion.qualifiers"], {}],
    ["scale=", "K", "text", "Rating scale of a third-party verdict (RATES_CLAIM, R-31); the mapping to the verdict lattice is a versioned D10 query-time rule (OD-19).", ["sdl/modules/kernel.graphql RATES_CLAIM docstring"], {}],
    // D9 (R-83)
    ["target:", "D5", "key:targets", "D5 Target key (targets.yaml) a D9 recommendation is aimed at (RECOMMENDS_USE / RECOMMENDS_AGAINST goal, R-83).", ["patterns-by-question/D9.md", "decision-report R-83"], {}],
    // D6 (R-30 verbatim line text)
    ["declaredName:", "D6", "text", "Declared name of a label line as printed (R-30: verbatim wording lives on the line Assertion, not on ComponentLineProperties).", ["sdl/modules/D6.graphql ComponentLineProperties", "patterns-by-question/D6.md"], {}],
    ["form:", "D6", "text", "Declared form of a label line as printed (R-30).", ["sdl/modules/D6.graphql", "patterns-by-question/D6.md"], {}],
    ["statement:", "D6", "text", "Per-component statement as printed (R-30).", ["sdl/modules/D6.graphql", "patterns-by-question/D6.md", "patterns-by-question/D12.md"], {}],
    ["quantity=", "D6", "text", "Quantity scope of a listing/offer statement as printed.", ["packets/D6/03-retrieval-patterns.md"], {}],
    ["sellerClass=", "D6", "code:D6.seller-class", "Seller class of a market tracker aggregate (e.g. THIRD_PARTY_NEW).", ["packets/D6/03-retrieval-patterns.md"], {}],
    // D3 / D7 (R-30 role / stake wording)
    ["roleText:", "D7", "text", "Role or funder statement as printed (D3 HAS_STUDY_ROLE / FUNDED_BY, D7 HOLDS_ROLE, D13 INVOLVES). R-30: printed wording stays on the authorizing Assertion.", ["sdl/modules/D3.graphql", "sdl/modules/D7.graphql", "relationship-register predicateOnly FUNDED_BY"], {}],
    ["roleText=", "D13", "text", "D13 spelling of roleText: (INVOLVES / EVENT_ABOUT authorizing Assertions). Re-key to roleText:.", ["sdl/modules/D13.graphql INVOLVES docstring"], { status: "alias-of:roleText:" }],
    ["stakeClass:", "D7", "text", "Stake class as printed (R-30; StakeEdgeProperties.stakeClassVerbatim retired).", ["sdl/modules/D7.graphql"], {}],
    ["reason:", "D3", "text", "The asserter's stated reasons (D3 REVISES / retraction reasons). Corrupted reason strings are quarantined, never repaired by guess (MD-D11-02).", ["sdl/modules/D3.graphql", "patterns-by-question/D3.md"], {}],
    // D7 commerce / manufacturing (relationship-register predicateOnly)
    ["product=", "D7", "uid", "D6 Product uid a contract-manufacturing statement names, when stated (CONTRACT_MANUFACTURES_FOR).", ["relationship-register predicateOnly CONTRACT_MANUFACTURES_FOR", "patterns-by-question/D8.md"], {}],
    ["exclusivity=", "D7", inline(["SOLE", "EXCLUSIVE", "NON_EXCLUSIVE", "UNSTATED"]), "Supply or licence exclusivity as stated (SUPPLIES_MATERIAL; D8 licence statements use EXCLUSIVE).", ["relationship-register predicateOnly SUPPLIES_MATERIAL", "patterns-by-question/D8.md"], {}],
    ["buyer=", "D7", "uid", "Organization uid of the buyer in a supply statement (SUPPLIES_MATERIAL).", ["relationship-register predicateOnly SUPPLIES_MATERIAL", "patterns-by-question/D8.md"], {}],
    ["manufacturingKind=", "D7", inline(["CONTRACT", "INGREDIENT", "PACKAGING"]), "Kind of unnamed manufacturer (MANUFACTURER_UNNAMED).", ["relationship-register predicateOnly MANUFACTURER_UNNAMED"], {}],
    // D5 (predicateOnly qualifiers)
    ["dose:", "D5", "text", "Dose as stated by the source (D5 target, harm and composition statements).", ["relationship-register predicateOnly IMPROVES_TARGET / CAUSES_ADVERSE_EFFECT"], {}],
    ["schedule:", "D5", "text", "Dosing schedule as stated.", ["relationship-register predicateOnly CAUSES_ADVERSE_EFFECT"], {}],
    ["route:", "D5", "text", "Route of administration as stated.", ["relationship-register predicateOnly CAUSES_ADVERSE_EFFECT / USE_CONSTRAINED_IN"], {}],
    ["window:", "D5", "iso-duration", "Separation window of an interaction or constraint (e.g. window:PT2H).", ["sdl/modules/D5.graphql UseConstraint", "relationship-register predicateOnly INTERACTS_WITH"], {}],
    ["severity:", "D5", "code:<scheme>:<grade> (scheme CTCAE_V5 | CTCAE_V6 | LABEL_TEXT | SOURCE_TEXT)", "Severity of an adverse effect as <scheme>:<grade>.", ["relationship-register predicateOnly CAUSES_ADVERSE_EFFECT"], {}],
    ["context:", "D5", inline(["OVERDOSE", "ACCIDENTAL_INGESTION", "THERAPEUTIC"]), "Exposure context of an adverse-effect report. OD-29: the accepted enum shape is kept; a source-stated high intake is NOT an overdose and uses intakeContext:.", ["relationship-register predicateOnly CAUSES_ADVERSE_EFFECT", "DECISIONS OD-29"], {}],
    ["intakeContext:", "D5", inline(["HIGH_INTAKE_SOURCE_STATED", "UNSPECIFIED"]), "OD-29: source-stated high-intake context ('high doses can cause diarrhea') for reference-source effect statements; UNSPECIFIED when the source gives no structured context. Never inferred, never relabeled as overdose.", ["DECISIONS OD-29", "open-questions OD-29 / OQ-D5-28"], {}],
    ["sourceKind:", "D5", inline(["LABEL", "TRIAL_ARM", "CASE_REPORT", "SPONTANEOUS_REPORT", "REFERENCE_MONOGRAPH", "PROTOCOL_AUTHOR", "COMMUNITY"]), "Kind of source an adverse-effect statement comes from (R-85 adds REFERENCE_MONOGRAPH).", ["relationship-register predicateOnly CAUSES_ADVERSE_EFFECT"], {}],
    ["claimClass:", "D5", inline(["STRUCTURE_FUNCTION", "DISEASE_CLAIM", "APPROVED_INDICATION", "PERMITTED_NHP_CLAIM", "NONE_STATED"]), "Regulatory class of an intended-use claim (INTENDED_FOR_TARGET).", ["relationship-register predicateOnly INTENDED_FOR_TARGET"], {}],
    ["coExposure:", "D5", "uid", "Intervention uid co-administered in the statement (target-effect predicates).", ["relationship-register predicateOnly WORSENS_TARGET"], {}],
    ["outcomeUid:", "D5", "uid", "Metric / Biomarker / Outcome / Condition uid the target-effect statement measured (KN-15: entity identity uses outcomeUid).", ["relationship-register predicateOnly IMPROVES_TARGET", "DECISIONS KN-15"], {}],
    ["outcome:", "D12", "uid", "D4 Metric | D4 Biomarker | D2 Outcome uid (named text goes to outcomeVerbatim:, KN-15).", ["relationship-register moduleExtras.D12.qualifierGrammar", "DECISIONS KN-15"], {}],
    ["outcomeVerbatim:", "D12", "text", "Outcome as the source names it, when it is not resolved to a uid (KN-15 separate grammar).", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["section:", "D5", "code:D5.label-section (CONTRAINDICATIONS | WARNINGS | PRECAUTIONS | CAUTIONS | BOXED_WARNING | PROTOCOL_TEXT | DRUG_INTERACTIONS ...)", "Label or protocol section the constraint was stated in (USE_CONSTRAINED_IN).", ["relationship-register predicateOnly USE_CONSTRAINED_IN"], {}],
    ["jurisdiction:", "D5", "code:ISO-3166-1-alpha-2", "Jurisdiction of a constraint, authorized dose range or claim.", ["relationship-register predicateOnly USE_CONSTRAINED_IN / HAS_AUTHORIZED_DOSE_RANGE"], {}],
    ["jurisdiction=", "D1", "code:ISO-3166-1-alpha-2", "D1 packet spelling of jurisdiction:. Re-key to jurisdiction:.", ["packets/D1/03-retrieval-patterns.md"], { status: "alias-of:jurisdiction:" }],
    ["exposureChange:", "D5", inline(["INCREASES_EXPOSURE", "DECREASES_EXPOSURE", "REDUCES_ABSORPTION", "ADDITIVE_EFFECT", "ANTAGONIZES_EFFECT", "UNKNOWN"]), "Direction of an interaction, per asserter (never a UseConstraint property).", ["relationship-register predicateOnly INTERACTS_WITH"], {}],
    ["mechanism:", "D5", "text", "Interaction mechanism as stated (e.g. CYP3A4).", ["relationship-register predicateOnly INTERACTS_WITH"], {}],
    ["stance:", "D5", inline(["AVOID", "DELIBERATE_USE"]), "Whether the interaction statement advises avoidance or deliberate use.", ["relationship-register predicateOnly INTERACTS_WITH"], {}],
    ["ageBand:", "D5", "text", "Age band of an upper limit (<low>-<high> years as printed).", ["predicates.yaml HAS_UPPER_LIMIT"], { pattern: "^\\d+(-\\d+)?\\+?$" }],
    ["intakeScope:", "D5", e("IntakeScope"), "Whether a limit covers supplemental or total intake.", ["relationship-register predicateOnly HAS_UPPER_LIMIT"], {}],
    ["limitKind:", "D5", inline(["UL", "MONOGRAPH_MAX", "LABEL_MAX", "PROTOCOL_MAX", "SCHEDULING_THRESHOLD", "LABEL_WARNING_THRESHOLD"]), "Kind of upper limit (PROTOCOL_MAX = a protocol author's own ceiling).", ["relationship-register predicateOnly HAS_UPPER_LIMIT"], {}],
    ["use:", "D5", "text", "Use scope of an authorized dose range as stated.", ["relationship-register predicateOnly HAS_AUTHORIZED_DOSE_RANGE"], {}],
    // MD-D5-02 dose basis / referent
    ["basis:", "D1", e("MassBasis"), "MD-D5-02: mass basis of a stated amount (salt form, active moiety, nutrient equivalent, material as is, unspecified). Never inferred; ambiguous basis is UNSPECIFIED plus notReportedFields where the type has them. No elemental-mass inference.", ["DECISIONS MD-D5-02", "seams providedVocabularies D1 MassBasis (R-56)"], {}],
    ["referent:", "D6", e("AmountReferent"), "MD-D5-02: what a stated amount refers to (as named, as nutrient, extract mass, marker constituent, blend total, not declared).", ["DECISIONS MD-D5-02", "sdl/modules/D6.graphql AmountReferent"], {}],
    // D4
    ["direction:", "D12", `${inline(["INCREASE", "DECREASE", "NO_CHANGE"])} | text`, "Direction of a preparation-driven content change (D12); D4 INTERFERES_WITH uses it for the source-stated bias direction (text).", ["relationship-register moduleExtras.D12.qualifierGrammar", "relationship-register predicateOnly INTERFERES_WITH"], {}],
    ["threshold:", "D4", "text", "Interference threshold as stated (INTERFERES_WITH).", ["relationship-register predicateOnly INTERFERES_WITH"], {}],
    // D12 grammar (relationship-register moduleExtras.D12.qualifierGrammar) and MD-D12-02
    ["preparationMethod:", "D12", e("PreparationMethod"), "Preparation method; repeat the key for several values.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["preparationVerbatim:", "D12", "text", "Source wording of a preparation (free text; never filtered).", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["temperatureC:", "D12", "number", "Preparation temperature in degrees Celsius.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["duration:", "D12", "iso-duration", "ISO 8601 duration (D12 preparation; D5 target-effect statements).", ["relationship-register moduleExtras.D12.qualifierGrammar", "relationship-register predicateOnly IMPROVES_TARGET"], {}],
    ["cycles:", "D12", "number", "Number of preparation cycles; `<=N` for 'up to N'.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["changeLow:", "D12", "number", "Signed percent change, low bound.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["changeHigh:", "D12", "number", "Signed percent change, high bound.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["comparator:", "D1", e("QuantityComparator"), "MD-D12-02 / R-57: a comparison OPERATOR from the D1 QuantityComparator enum (GTE, LTE, ...; absent = EQ). Never a uid: a comparator arm is comparatorArm:.", ["DECISIONS MD-D12-02", "relationship-register moduleExtras.D12.qualifierGrammar", "sdl/modules/D12.graphql"], {}],
    ["comparatorArm:", "D3", "uid", "MD-D12-02: uid of the comparator StudyArm a result or claim is stated against (the PREDIMED / UPF fixtures wrote it as comparator:hu:...).", ["DECISIONS MD-D12-02"], {}],
    ["range:", "D12", "text", "<low>-<high> numeric range as stated.", ["relationship-register moduleExtras.D12.qualifierGrammar", "sdl/modules/D12.graphql"], { pattern: "^-?\\d+(\\.\\d+)?-\\d+(\\.\\d+)?$" }],
    ["portion:", "D12", "text", "Portion label, spaces as '_' (medium_serving).", ["relationship-register moduleExtras.D12.qualifierGrammar"], { pattern: "^\\S+$" }],
    ["derivation:", "D12", "code:<system>:<code> (e.g. FDC:A, FDC:NC)", "Source derivation code of a food composition value.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["dataPoints:", "D12", "number", "Number of data points behind a composition value.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["min:", "D12", "number", "Minimum of a composition value.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["max:", "D12", "number", "Maximum of a composition value.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["dataType:", "D12", inline(["FOUNDATION", "SR_LEGACY", "SURVEY", "ANALYTICAL_DB"]), "Food composition data type.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["role:", "D12", `${inline(["INCLUDES", "EMPHASIZES", "LIMITS", "EXCLUDES"])} | text`, "Role of a component in a dietary pattern statement (D12); D5 INTERVENTION_INCLUDES role as stated (text).", ["relationship-register moduleExtras.D12.qualifierGrammar", "relationship-register predicateOnly INTERVENTION_INCLUDES"], {}],
    ["frequency:", "D12", inline(["PER_DAY", "PER_WEEK"]), "Frequency of a dietary-pattern component.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["species:", "D12", `uid | ${inline(["HUMAN", "LABORATORY_ANIMALS"])}`, "Species of an adverse-effect finding (NCBI taxon uid or HUMAN | LABORATORY_ANIMALS).", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["doseContext:", "D12", inline(["ABOVE_DIETARY_EXPOSURE", "AT_DIETARY_EXPOSURE", "NOT_STATED"]), "Dose context of a food-constituent harm statement.", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["issueDate:", "K", "iso-date", "Print issue date of a notice (HAS_REVISION_STATUS flag with no identified notice, R-44).", ["relationship-register moduleExtras.D12.qualifierGrammar"], {}],
    ["reportingLimit:", "D12", "text", "Reporting limit of a measured content value as stated (number + unit).", ["patterns-by-question/D12.md"], {}],
    // D13 (EVENT_ABOUT / INVOLVES / financing)
    ["role=", "D13", e("EventRole"), "Role of an organization or person in an Event (authorizing Assertion of INVOLVES).", ["sdl/modules/D13.graphql INVOLVES / EventRole"], {}],
    ["primary=", "D13", inline(["true"]), "Marks the one EVENT_ABOUT Assertion naming the primary subject of an Event.", ["sdl/modules/D13.graphql Event identity"], {}],
    ["amountKind=", "D13", "code:D13.amount-kind", "Kind of a financing amount (e.g. GROSS_PROCEEDS, BORROWING_CAPACITY).", ["packets/D13/03-retrieval-patterns.md"], {}],
    ["amountBasis=", "D13", "code:D13.amount-basis", "Basis of a financing amount (e.g. COMMITTED, AVAILABLE, SOLD).", ["packets/D13/03-retrieval-patterns.md"], {}],
    ["edition=", "D13", "text", "Edition of a frontier-classification input as stated.", ["packets/D13/03-retrieval-patterns.md"], {}],
    ["derivedFrom=", "D13", "uid", "Input record a D13 classification statement was derived from.", ["packets/D13/03-retrieval-patterns.md"], {}],
    ["frontierVocabVersion=", "D13", "text", "Version of frontiers.yaml a frontier classification used (pin R-60).", ["packets/D13/03-retrieval-patterns.md"], { pattern: "^\\d+\\.\\d+\\.\\d+$" }],
    ["classificationRule=", "D13", "text", "Versioned frontier classification rule id (e.g. frontier-classification/v1).", ["final/fixtures D13"], {}],
    ["milestoneKind=", "D13", "key:frontiers", "Frontier milestone id (ms:<slug>) from frontiers.yaml.", ["final/fixtures D13"], {}],
  ];
  return rows;
}

/** Words that predicates.yaml lists as qualifiers only because its generator split prose on commas. */
const PREDICATE_LIST_FRAGMENTS = {
  scheme: "the <scheme> part of severity:<scheme>:<grade> (CAUSES_ADVERSE_EFFECT)",
  never: "prose fragment of the INTERACTS_WITH exposureChange note ('never a UseConstraint property')",
};

const VALUE_CHECK = {
  uid: (v) => /^hu:[a-z0-9-]+:\S+$/.test(v),
  "iso-date": (v) => /^\d{4}(-\d{2}(-\d{2}(T[\d:.]+Z?)?)?)?$/.test(v),
  "iso-duration": (v) => /^P(?=\d|T\d)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/.test(v),
  number: (v) => /^(<=|>=|<|>)?-?\d+(\.\d+)?%?$/.test(v),
  text: (v) => v.length > 0,
};

function atomCheck(atom, sdl) {
  atom = atom.trim();
  if (VALUE_CHECK[atom]) return VALUE_CHECK[atom];
  let m = /^enum:\[(.+)\]$/.exec(atom);
  if (m) {
    const set = new Set(m[1].split("|"));
    return (v) => set.has(v);
  }
  m = /^enum:(\w+)$/.exec(atom);
  if (m) {
    const set = new Set(sdl.enums.get(m[1])?.values ?? []);
    return (v) => set.has(v);
  }
  if (atom.startsWith("key:")) return (v) => /^[a-z][a-z0-9:_-]*$/i.test(v) && !/\s/.test(v);
  if (atom.startsWith("code:")) return (v) => /^\S+$/.test(v);
  return () => true;
}

/** Splits a grammar at top-level " | " (not inside [...] or (...)). */
function grammarAtoms(grammar) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < grammar.length; i++) {
    const ch = grammar[i];
    if (ch === "[" || ch === "(") depth++;
    if (ch === "]" || ch === ")") depth--;
    if (depth === 0 && grammar.startsWith(" | ", i)) {
      out.push(cur);
      cur = "";
      i += 2;
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function splitQualifier(s) {
  const m = /^([a-z][A-Za-z0-9_]*)([:=])(.*)$/s.exec(s);
  if (!m) return null;
  return { name: m[1], sep: m[2], prefix: m[1] + m[2], raw: m[3], value: m[3].trim(), spaced: /^\s/.test(m[3]) };
}

/** Walks every fixture record and collects qualifier strings and assessment records. */
function mineFixtures(inputs) {
  const qualifiers = []; // {file, dir, text}
  const assessments = []; // {file, dir, rec}
  const visit = (v, rec, parentKey) => {
    if (Array.isArray(v)) {
      if (parentKey === "qualifiers") for (const s of v) if (typeof s === "string") qualifiers.push({ ...rec, text: s });
      for (const x of v) visit(x, rec, parentKey === "qualifiers" ? null : parentKey);
      return;
    }
    if (v && typeof v === "object") {
      if (typeof v.assessmentKind === "string" || typeof v.assessmentSubkind === "string") assessments.push({ ...rec, rec: v });
      for (const [k, x] of Object.entries(v)) visit(x, rec, k);
    }
  };
  for (const f of inputs.fixtures()) for (const d of f.docs) visit(d, { file: f.path, dir: f.dir }, null);
  return { qualifiers, assessments };
}

/** Pattern prefixes used as qualifier filters (`q STARTS WITH 'x:'` on a line that reads qualifiers). */
function minePatternPrefixes(inputs) {
  const out = new Map(); // prefix -> {qualifier:Set(paths), facet:Set(paths)}
  for (const { path, text } of [...inputs.finalPatterns(), ...inputs.packetPatterns()]) {
    for (const line of text.split("\n")) {
      for (const m of line.matchAll(/STARTS WITH '([A-Za-z][A-Za-z0-9_]*[:=])/g)) {
        const ctx = /facet/i.test(line) ? "facet" : /qualif/i.test(line) ? "qualifier" : "unknown";
        const e = out.get(m[1]) ?? { qualifier: new Set(), facet: new Set(), unknown: new Set() };
        e[ctx].add(path);
        out.set(m[1], e);
      }
      for (const m of line.matchAll(/'([A-Za-z][A-Za-z0-9_]*[:=])' *\+/g)) {
        if (!/qualif/i.test(line)) continue;
        const e = out.get(m[1]) ?? { qualifier: new Set(), facet: new Set(), unknown: new Set() };
        e.qualifier.add(path);
        out.set(m[1], e);
      }
    }
  }
  return out;
}

function buildQualifiers(inputs, sdl, mined, predicates) {
  const rows = qualifierTable(sdl);
  const patternPrefixes = minePatternPrefixes(inputs);
  const registry = {};
  for (const [prefix, owner, valueGrammar, description, sources, extra] of rows) {
    if (registry[prefix]) throw new Error(`duplicate qualifier ${prefix}`);
    const sp = splitQualifier(prefix + "x");
    registry[prefix] = {
      name: sp.name,
      separator: sp.sep,
      valueGrammar,
      ...(extra.pattern ? { pattern: extra.pattern } : {}),
      owner,
      description,
      status: extra.status ?? "registered",
      usedByPredicates: [],
      requiredByPredicates: [],
      filteredByPatterns: [],
      sources: [...sources].sort(),
      observed: { count: 0, fixtures: 0, conforming: 0, nonconforming: 0, spaceAfterSeparator: 0, nonconformingExamples: [], observedValues: [] },
    };
  }
  // Predicate usage (predicates.yaml qualifiers / requiredQualifiers name only the key).
  const byName = new Map();
  for (const [prefix, entry] of Object.entries(registry)) {
    if (!entry.status.startsWith("alias-of")) {
      const list = byName.get(entry.name) ?? [];
      list.push(prefix);
      byName.set(entry.name, list);
    }
  }
  const predicateQualifierGaps = [];
  for (const p of predicates) {
    for (const [field, target] of [["qualifiers", "usedByPredicates"], ["requiredQualifiers", "requiredByPredicates"]]) {
      for (const raw of p[field] ?? []) {
        const name = String(raw).replace(/[:=].*$/, "").trim();
        if (!/^[a-z][A-Za-z0-9_]*$/.test(name)) continue; // prose fragments of the generated list ("e.g.")
        if (PREDICATE_LIST_FRAGMENTS[name]) continue;
        const prefixes = byName.get(name);
        if (!prefixes) {
          predicateQualifierGaps.push(`${p.predicate}.${field}: ${name}`);
          continue;
        }
        for (const prefix of prefixes) if (!registry[prefix][target].includes(p.predicate)) registry[prefix][target].push(p.predicate);
      }
    }
  }
  for (const [prefix, ctx] of patternPrefixes) {
    if (!registry[prefix]) continue;
    for (const path of [...ctx.qualifier, ...ctx.unknown]) if (!registry[prefix].filteredByPatterns.includes(path)) registry[prefix].filteredByPatterns.push(path);
  }
  // Fixture observations.
  const unregistered = new Map(); // prefix -> {count, fixtures:Set, examples:[]}
  const noKey = { count: 0, fixtures: new Set(), examples: [] };
  const checks = new Map();
  for (const q of mined.qualifiers) {
    const sp = splitQualifier(q.text);
    if (!sp || sp.raw.startsWith("//")) {
      noKey.count++;
      noKey.fixtures.add(q.dir);
      if (noKey.examples.length < 5 && !noKey.examples.includes(q.text.slice(0, 80))) noKey.examples.push(q.text.slice(0, 80));
      continue;
    }
    const entry = registry[sp.prefix];
    if (!entry) {
      const u = unregistered.get(sp.prefix) ?? { count: 0, fixtures: new Set(), examples: [] };
      u.count++;
      u.fixtures.add(q.dir);
      const ex = sp.value.slice(0, 60);
      if (u.examples.length < 2 && !u.examples.includes(ex)) u.examples.push(ex);
      unregistered.set(sp.prefix, u);
      continue;
    }
    const o = entry.observed;
    o.count++;
    (o._fixtures ??= new Set()).add(q.dir);
    if (sp.spaced) o.spaceAfterSeparator++;
    let check = checks.get(sp.prefix);
    if (!check) {
      const atoms = grammarAtoms(entry.valueGrammar).map((a) => atomCheck(a, sdl));
      const re = entry.pattern ? new RegExp(entry.pattern) : null;
      check = (v) => (re ? re.test(v) : true) && atoms.some((f) => f(v));
      checks.set(sp.prefix, check);
    }
    const ok = !sp.spaced && check(sp.value);
    if (ok) o.conforming++;
    else {
      o.nonconforming++;
      const ex = `${sp.prefix}${sp.raw}`.slice(0, 70);
      if (o.nonconformingExamples.length < 3 && !o.nonconformingExamples.includes(ex)) o.nonconformingExamples.push(ex);
    }
    if (/^[A-Z][A-Z0-9_]*$/.test(sp.value) && !o.observedValues.includes(sp.value)) o.observedValues.push(sp.value);
  }
  for (const entry of Object.values(registry)) {
    entry.observed.fixtures = entry.observed._fixtures?.size ?? 0;
    delete entry.observed._fixtures;
    entry.observed.observedValues.sort();
    entry.usedByPredicates.sort();
    entry.requiredByPredicates.sort();
    entry.filteredByPatterns.sort();
    for (const k of ["usedByPredicates", "requiredByPredicates", "filteredByPatterns"]) if (!entry[k].length) delete entry[k];
    if (!entry.observed.nonconformingExamples.length) delete entry.observed.nonconformingExamples;
    if (!entry.observed.observedValues.length) delete entry.observed.observedValues;
  }
  const unregisteredObserved = {};
  for (const [prefix, u] of [...unregistered.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    unregisteredObserved[prefix] = { count: u.count, fixtures: [...u.fixtures].sort(), examples: u.examples };
  }
  // Pattern-filtered prefixes that are facets (not qualifiers) are reported so the assessment registry owns them.
  const patternFacetPrefixes = [...patternPrefixes.entries()].filter(([p, c]) => c.facet.size && !registry[p]).map(([p]) => p).sort();
  const patternUnregistered = [...patternPrefixes.entries()].filter(([p, c]) => (c.qualifier.size || c.unknown.size) && !c.facet.size && !registry[p]).map(([p]) => p).sort();

  const migrations = [
    { from: "comparator:GE", to: "comparator:GTE", decision: "MD-D12-02", rule: "R-57 spelling; explicit, not silent" },
    { from: "comparator:LE", to: "comparator:LTE", decision: "MD-D12-02", rule: "R-57 spelling; explicit, not silent" },
    { from: "comparator:hu:<arm uid>", to: "comparatorArm:hu:<arm uid>", decision: "MD-D12-02", rule: "a uid after comparator: is an arm, not an operator (PREDIMED / UPF fixtures)" },
    { from: "comparator:<free text>", to: "explicit fixture edit (FU-03): operator into comparator:, wording into the locator", decision: "MD-D12-02", rule: "ambiguous values are migrated by hand, never guessed" },
    { from: "roleText=<label>", to: "roleText:<label>", decision: "FU-14 a", rule: "one spelling per key; D13 docstrings and fixtures re-keyed" },
    { from: "jurisdiction=<code>", to: "jurisdiction:<code>", decision: "FU-14 a", rule: "one spelling per key" },
    { from: "context:OVERDOSE on a reference-source high-intake statement", to: "intakeContext:HIGH_INTAKE_SOURCE_STATED (context: omitted)", decision: "OD-29", rule: "high intake is not an overdose; fixture D5/pregnancy-magnesium-upper-limit is the known case (FU-03 edit)" },
    { from: "<key>: <free text with a space> on a key whose grammar is a code/uid/duration", to: "<key>Verbatim:<text> or the locator's exact text", decision: "FU-14 a", rule: "D12 grammar rule: no space after the separator; free text only under *Verbatim keys" },
  ];

  const counts = {
    registered: Object.values(registry).filter((e) => e.status === "registered").length,
    aliases: Object.values(registry).filter((e) => e.status.startsWith("alias-of")).length,
    unregisteredObservedPrefixes: Object.keys(unregisteredObserved).length,
    unregisteredObservedUses: Object.values(unregisteredObserved).reduce((a, u) => a + u.count, 0),
    freeTextUses: noKey.count,
    fixtureQualifierStrings: mined.qualifiers.length,
    registeredUses: Object.values(registry).reduce((a, e) => a + e.observed.count, 0),
    nonconformingUses: Object.values(registry).reduce((a, e) => a + e.observed.nonconforming, 0),
    predicateQualifierGaps: predicateQualifierGaps.length,
  };
  const doc = {
    format: "bks-qualifier-grammar.v1",
    version: "1.0.0",
    closes: ["FU-14 (a)", "MD-D12-02", "MD-D5-02", "OD-29", "R-83 (target: prefix)"],
    grammar: {
      form: "Each Assertion.qualifiers entry is `<name><separator><value>`; registry keys are the prefix as written (name plus separator), so `q STARTS WITH '<key>'` matches exactly.",
      separators: { ":": "kernel convention (Assertion.qualifiers docstring, D12 grammar rule)", "=": "D7 / D8 / D13 commerce and event keys registered with '=' (exclusivity=, buyer=, product=, role=, primary=, ...)" },
      noSpaceAfterSeparator: "No space after the separator; a value with a leading space is nonconforming (D12 grammar rule).",
      enumValues: "When valueGrammar names an enum the value is exactly one enum value, so `('<key>' + $value) IN a.qualifiers` matches; repeat the key for several values.",
      freeText: "Source wording goes under a `*Verbatim:` key (populationVerbatim:, preparationVerbatim:, outcomeVerbatim:) or a registered text key; no pattern filters on free text.",
      valueGrammarAtoms: ["uid", "enum:<SDL enum>", "enum:[A|B|...]", "ucum-unit", "iso-date", "iso-duration", "text", "key:<vocabulary file>", "number", "code:<scheme>"],
      valueGrammarUnion: "atoms joined by ' | ' (any one matches)",
      facetsAreNotQualifiers: "Assessment.facets `<facet>=<value>` are registered per subkind in vocabularies/assessments.yaml, not here.",
      enforcement: "The executor rejects an unregistered prefix and a nonconforming value of a registered prefix on new writes; the observed counts below are the frozen fixtures' state (FU-03 re-keys them).",
    },
    counts,
    qualifiers: registry,
    migrations,
    unregisteredObserved,
    freeTextQualifiers: { count: noKey.count, fixtures: noKey.fixtures.size, examples: noKey.examples, rule: "Key-less natural-language verification.v1 qualifiers (kernel Assertion.qualifiers docstring: population, dose, condition wording that must survive any retelling) are permitted; they carry no prefix, are never filtered on, and are not registry entries. A string that starts with a lowerCamel name followed by ':' or '=' is a keyed qualifier and must be registered." },
    patternPrefixesOwnedByAssessments: patternFacetPrefixes,
    patternPrefixesUnregistered: patternUnregistered,
    predicateQualifierGaps,
  };
  return { doc, counts };
}

// ---------------------------------------------------------------------------------------------------------------
// Assessment vocabulary
// ---------------------------------------------------------------------------------------------------------------

const SUBKIND_RE = /\b((?:K|D\d{1,2})\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.(?:[a-z][a-z0-9-]*|[A-Z][A-Z0-9_]*|\*))?)/g;
const NOT_SUBKIND = /\.(graphql|yaml|md|json|seams|node|relationship|mjs|cypher)$|^(K|D\d+)\.(seams|node|relationship|graphql|yaml)$/;

function factory(kinds) {
  return {
    kinds,
    entries: new Map(), // key `${kind}/${subkind}` -> entry
    get(kind, subkind) {
      const key = `${kind ?? "UNRESOLVED"}/${subkind}`;
      let e = this.entries.get(key);
      if (!e) {
        e = { kind: kind ?? null, subkind, registrar: subkind.split(".")[0], requestedBy: new Set(), members: new Set(), conclusionCodes: new Set(), gradeSchemes: new Set(), facets: new Map(), admissibleSubjects: new Set(), methodVersions: new Set(), effectDirections: new Set(), questions: new Set(), sources: new Set(), evidence: new Set(), notes: [] };
        this.entries.set(key, e);
      }
      return e;
    },
  };
}

/**
 * `D9.x (requested)` -> {subkind: D9.x, requested}; `D1.identity-level.SAME_SUBSTANCE` -> family `D1.identity-level.*`
 * with member SAME_SUBSTANCE (the pre-closeout encoding of a level inside the subkind string).
 */
function normalizeSubkind(raw) {
  let s = raw.trim();
  const requested = /\(requested\)\s*$/i.test(s);
  s = s.replace(/\s*\(.*\)\s*$/, "");
  const fam = /^((?:K|D\d+)\.[a-z][a-z0-9-]*)\.([A-Z][A-Z0-9_]*)$/.exec(s);
  if (fam) return { subkind: `${fam[1]}.*`, member: fam[2], requested };
  return { subkind: s, member: null, requested };
}

/** Splits a markdown table row into cells, honouring `\|` escapes. */
function tableCells(line) {
  const cells = [];
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    if (line[i] === "\\" && line[i + 1] === "|") {
      cur += "|";
      i++;
      continue;
    }
    if (line[i] === "|") {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += line[i];
  }
  cells.push(cur.trim());
  return cells.slice(1, -1);
}

/** Packet assessment-vocabulary tables (09-reasoning.md): header names assessmentSubkind. */
function minePacketTables(inputs, sdl, kindSet) {
  const rows = [];
  for (const { packet, path, text } of inputs.packetFiles("09-reasoning.md")) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (!/^\|.*assessmentSubkind.*\|\s*$/.test(lines[i]) || !/^\|\s*-/.test(lines[i + 1] ?? "")) continue;
      const head = tableCells(lines[i]).map((h) => h.toLowerCase());
      const col = (re) => head.findIndex((h) => re.test(h));
      const cSub = col(/subkind/);
      const cKind = head.findIndex((h, j) => /assessmentkind/.test(h) && (!/subkind/.test(h) || j === cSub));
      const cCodes = col(/conclusioncode/);
      const cGrade = col(/gradescheme/);
      const cFacets = col(/^facets/);
      const cAbout = col(/^assesses/);
      const cQ = col(/^questions|used by/);
      for (let j = i + 2; j < lines.length && lines[j].startsWith("|"); j++) {
        const cells = tableCells(lines[j]);
        const subCell = cells[cSub] ?? "";
        const subs = [...subCell.matchAll(/\b((?:K|D\d+)\.[a-z][a-z0-9.-]*[a-z0-9*])/g)].map((m) => m[1]);
        if (!subs.length) continue;
        const kindCell = cells[cKind] ?? "";
        const kind = [...kindCell.matchAll(/\b([A-Z][A-Z_]{3,})\b/g)].map((m) => m[1]).find((k) => kindSet.has(k)) ?? null;
        const codes = cCodes >= 0 ? [...(cells[cCodes] ?? "").replace(/\([^)]*\)/g, "").matchAll(/`?\b([A-Z][A-Z0-9_]{2,})\b`?/g)].map((m) => m[1]).filter((c) => !kindSet.has(c) && !/^(none|NONE)$/.test(c) && !sdl.typeSet.has(c)) : [];
        const facets = [];
        for (const fm of (cFacets >= 0 ? cells[cFacets] ?? "" : "").matchAll(/`([a-zA-Z]+)=<([^`]*)>`/g)) {
          const values = fm[2].includes("|") || /^[A-Z][A-Z0-9_]*$/.test(fm[2].trim()) ? fm[2].split("|").map((v) => v.trim()).filter((v) => v && !/[<>…]|\s/.test(v)) : [];
          facets.push({ name: fm[1], values, valueKind: values.length ? null : fm[2].trim() });
        }
        const grades = cGrade >= 0 ? [...(cells[cGrade] ?? "").matchAll(/\b([A-Z][A-Z0-9_-]+(?:@<version>|-<name>@<version>)?)/g)].map((m) => m[1]).filter((g) => !/^SOURCE_TEXT$/.test(g) || true) : [];
        const about = cAbout >= 0 ? [...(cells[cAbout] ?? "").matchAll(/\b([A-Z][A-Za-z]+)\b/g)].map((m) => m[1]).filter((t) => sdl.nodeTypeSet.has(t)) : [];
        const questions = cQ >= 0 ? [...(cells[cQ] ?? "").matchAll(/\b((?:Q-[A-Z0-9]+-\d+|CQ-[A-Z]+-\d+[a-z]?))\b/g)].map((m) => m[1]) : [];
        for (const sub of subs) rows.push({ packet, path, line: j + 1, sub, kind, codes, facets, grades, about, questions, kindCell });
      }
    }
  }
  return rows;
}

function addFacet(e, name, value, owner) {
  const f = e.facets.get(name) ?? { values: new Set(), valueKinds: new Set(), owner: owner ?? e.registrar, aliases: new Map() };
  if (value !== undefined && value !== null) {
    const v = String(value).trim();
    const code = /^([A-Z][A-Z0-9_]*)(?:\b|$)/.exec(v);
    if (code && (v.length === code[1].length || /^[A-Z][A-Z0-9_]*[\s(:;,]/.test(v))) f.values.add(code[1]);
    else if (/^-?\d+(\.\d+)?$/.test(v)) f.valueKinds.add("number");
    else if (/^(true|false)$/i.test(v)) f.valueKinds.add("boolean");
    else if (/^hu:/.test(v)) f.valueKinds.add("uid");
    else f.valueKinds.add("text");
  }
  e.facets.set(name, f);
  return f;
}

function kindNear(text, index, kinds) {
  // Nearest AssessmentKind token before the mention in the same clause (no sentence break), else first after.
  const before = text.slice(Math.max(0, index - 220), index);
  const clause = before.split(/(?<=[.;])\s|\n/).pop() ?? before;
  let best = null;
  for (const k of kinds) {
    const i = clause.lastIndexOf(k);
    if (i >= 0 && (!best || i > best.i) && !/[A-Z_]/.test(clause[i + k.length] ?? "") && !/[A-Z_]/.test(clause[i - 1] ?? "")) best = { k, i };
  }
  if (best) return best.k;
  const after = text.slice(index, index + 120).split(/(?<=[.;])\s|\n/)[0] ?? "";
  for (const k of kinds) {
    const re = new RegExp(`\\b${k}\\b`);
    if (re.test(after)) return k;
  }
  return null;
}

function buildAssessments(inputs, sdl, mined) {
  const kindEnum = sdl.enums.get("AssessmentKind");
  if (!kindEnum) throw new Error("kernel AssessmentKind enum not found");
  const kinds = kindEnum.values;
  const kindSet = new Set(kinds);
  const reg = factory(kinds);
  const seams = inputs.yaml("seams.yaml");
  const relReg = inputs.yaml("relationship-register.yaml");
  const nodeReg = inputs.yaml("node-register.yaml");
  const unresolvedKind = [];
  const ignoredValues = [];
  const kindLevel = new Map(); // kind -> {facets, evidence, sources}

  // (1) Fixture records (structured).
  for (const { rec, dir } of mined.assessments) {
    const kind = typeof rec.assessmentKind === "string" ? rec.assessmentKind : null;
    let subkind = typeof rec.assessmentSubkind === "string" ? rec.assessmentSubkind.trim() : null;
    if (!subkind) {
      // A kind-only assessment needs no subkind entry (only OTHER requires one); its facets are kind-level facets.
      if (kind && kindSet.has(kind)) {
        const holder = kindLevel.get(kind) ?? { facets: new Map(), evidence: new Set(), registrar: "K", sources: new Set() };
        for (const f of Array.isArray(rec.facets) ? rec.facets : []) {
          if (typeof f !== "string") continue;
          const m = /^([A-Za-z][A-Za-z0-9_]*?)\s*=\s*(.*)$/s.exec(f);
          if (m) addFacet(holder, m[1], m[2], "K");
        }
        holder.evidence.add(`fixture:${dir}`);
        kindLevel.set(kind, holder);
      }
      continue;
    }
    if (!/^(K|D\d+)\./.test(subkind)) {
      ignoredValues.push(`${dir}: assessmentSubkind ${JSON.stringify(subkind)}`);
      continue;
    }
    if (kind && !kindSet.has(kind)) {
      ignoredValues.push(`${dir}: assessmentKind ${kind} (not in AssessmentKind)`);
      continue;
    }
    const norm = normalizeSubkind(subkind);
    const e = reg.get(kind, norm.subkind);
    if (norm.requested) e.requestedBy.add(`fixture:${dir}`);
    if (norm.member) e.members.add(norm.member);
    e.evidence.add(`fixture:${dir}`);
    e.sources.add("final/fixtures");
    if (typeof rec.conclusionCode === "string" && /^[A-Z][A-Z0-9_]*$/.test(rec.conclusionCode)) e.conclusionCodes.add(rec.conclusionCode);
    if (typeof rec.gradeScheme === "string") e.gradeSchemes.add(rec.gradeScheme);
    if (typeof rec.methodVersion === "string" && !/^fixture/.test(rec.methodVersion)) e.methodVersions.add(rec.methodVersion);
    if (typeof rec.effectDirection === "string") e.effectDirections.add(rec.effectDirection);
    for (const f of Array.isArray(rec.facets) ? rec.facets : []) {
      if (typeof f !== "string") continue;
      const m = /^([A-Za-z][A-Za-z0-9_:<>-]*?)\s*=\s*(.*)$/s.exec(f);
      if (m && !m[1].includes("<")) addFacet(e, m[1].replace(/:.*$/, ""), m[2]);
    }
    const about = Array.isArray(rec.about) ? rec.about : rec.about ? [rec.about] : [];
    for (const a of about) {
      const t = sdlTypeName(sdl, typeof a === "string" ? null : a?.type);
      if (t) e.admissibleSubjects.add(t);
    }
  }

  // (1b) Packet assessment-vocabulary tables (09-reasoning.md).
  for (const row of minePacketTables(inputs, sdl, kindSet)) {
    const norm = normalizeSubkind(row.sub);
    const e = reg.get(row.kind, norm.subkind);
    e.sources.add(`${row.path}:${row.line} (table)`);
    if (norm.member) e.members.add(norm.member);
    for (const c of row.codes) e.conclusionCodes.add(c);
    for (const g of row.grades) e.gradeSchemes.add(g);
    for (const t of row.about) e.admissibleSubjects.add(t);
    for (const q of row.questions) e.questions.add(q);
    for (const f of row.facets) {
      const fe = addFacet(e, f.name, undefined, row.packet);
      for (const v of f.values) fe.values.add(v);
      if (f.valueKind && !/^…$/.test(f.valueKind)) fe.valueKinds.add(f.valueKind.replace(/^<|>$/g, ""));
    }
    if (/effectDirection HARM/.test(row.kindCell)) e.effectDirections.add("HARM");
  }

  // (2) Structured seam registrations.
  const d4 = seams.moduleExtras?.D4?.registeredValues?.assessmentSubkinds ?? [];
  for (const s of d4) {
    const e = reg.get(s.assessmentKind, s.subkind);
    e.sources.add("registers/seams.yaml moduleExtras.D4.registeredValues.assessmentSubkinds");
    if (Array.isArray(s.conclusionCodes)) for (const c of s.conclusionCodes) e.conclusionCodes.add(c);
    else if (s.conclusionCodes) e.notes.push(`conclusionCodes: ${s.conclusionCodes}`);
    if (s.effectDirection) e.effectDirections.add(s.effectDirection);
    for (const q of s.questions ?? []) e.questions.add(q);
    for (const m of String(s.about ?? "").matchAll(/\b([A-Z][A-Za-z]+)\b/g)) if (sdl.nodeTypeSet.has(m[1])) e.admissibleSubjects.add(m[1]);
    if (s.ruling) e.notes.push(`ruling ${s.ruling}`);
    if (s.conclusionCodesRegistrar) e.notes.push(`conclusionCodes registrar ${s.conclusionCodesRegistrar}`);
  }
  for (const sv of seams.sharedVocabularies ?? []) {
    if (sv.assessmentSubkind && sv.assessmentKind) {
      const e = reg.get(sv.assessmentKind, sv.assessmentSubkind);
      e.sources.add(`registers/seams.yaml sharedVocabularies ${sv.name}`);
      for (const c of sv.conclusionCode ?? []) e.conclusionCodes.add(c);
      for (const [fname, fdef] of Object.entries(sv.facets ?? {})) {
        const f = addFacet(e, fname, undefined, fdef.owner ?? fdef.contributor ?? e.registrar);
        const vals = fdef.values ?? [...(fdef.d7Values ?? []), ...(fdef.d9Values ?? [])];
        if (Array.isArray(vals)) for (const v of vals) f.values.add(v);
        if (fdef.contributor) f.contributor = fdef.contributor;
        if (fdef.rule) f.rule = fdef.rule;
      }
    }
    if (sv.name === "other-d7-subkinds" && sv.values) {
      for (const [sub, desc] of Object.entries(sv.values)) {
        const kind = /^([A-Z_]+)/.exec(String(desc))?.[1];
        const e = reg.get(kindSet.has(kind) ? kind : null, sub);
        e.sources.add("registers/seams.yaml sharedVocabularies other-d7-subkinds");
        const cc = /conclusionCode ([A-Z_| ]+?)(?:;|$)/.exec(String(desc));
        if (cc) for (const c of cc[1].split("|")) if (c.trim()) e.conclusionCodes.add(c.trim());
        for (const fm of String(desc).matchAll(/([a-zA-Z]+)=<([A-Z_|]+)>/g)) {
          const f = addFacet(e, fm[1]);
          for (const v of fm[2].split("|")) f.values.add(v);
        }
        const mv = /methodVersion ([a-z0-9/.-]+)/.exec(String(desc));
        if (mv) e.methodVersions.add(mv[1]);
      }
    }
  }
  for (const fs of seams.facetSeams ?? []) {
    const m = /^([a-zA-Z]+)=/.exec(fs.facet ?? "");
    const kind = /\b(SAFETY_SIGNAL|[A-Z_]{4,})\b/.exec(fs.assessment ?? "")?.[1];
    if (!m) continue;
    const e = reg.get(kindSet.has(kind) ? kind : null, "D5.safety-signal");
    e.sources.add("registers/seams.yaml facetSeams");
    const f = addFacet(e, m[1], undefined, fs.module);
    const en = /<D\d+ ([A-Za-z]+)>/.exec(fs.facet);
    if (en && sdl.enums.has(en[1])) {
      f.enum = en[1];
      for (const v of sdl.enums.get(en[1]).values) f.values.add(v);
    }
    for (const t of fs.targets ?? []) {
      const n = sdlTypeName(sdl, t);
      if (n) e.admissibleSubjects.add(n);
    }
    for (const q of fs.questions ?? []) e.questions.add(q);
    if (fs.ruling) e.notes.push(`facet ${m[1]}=: ${fs.ruling} (${fs.note ?? ""})`.trim());
  }

  // (3) Text mentions (SDL docstrings, registers, seams) where no structured entry exists for that subkind.
  const structured = new Set([...reg.entries.values()].map((e) => e.subkind));
  const textSources = [
    ...sdl.texts.map((t) => ({ path: t.path, text: t.text })),
    { path: "registers/node-register.yaml", text: inputs.text("node-register.yaml") },
    { path: "registers/relationship-register.yaml", text: inputs.text("relationship-register.yaml") },
    { path: "registers/seams.yaml", text: inputs.text("seams.yaml") },
    ...inputs.finalPatterns(),
    ...inputs.packetFiles("09-reasoning.md"),
    ...inputs.packetFiles("03-retrieval-patterns.md"),
    ...inputs.packetFiles("11-open-questions.md"),
  ];
  const textMentions = new Map(); // subkind -> {kinds: Map(kind->count), paths:Set}
  const codeLists = []; // "D6.change-kind (OTHER): A | B | C" statements
  const facetLists = []; // "facets `errorKind=OCR|ASR|...`" in the sentence of a subkind mention
  for (const { path, text } of textSources) {
    for (const m of text.matchAll(SUBKIND_RE)) {
      const rawSub = m[1].replace(/[.-]+$/, "");
      if (NOT_SUBKIND.test(rawSub) || /\.(?:[A-Z][a-z])/.test(rawSub)) continue;
      const sub = normalizeSubkind(rawSub).subkind;
      for (const cl of text.slice(m.index, m.index + 400).matchAll(/^((?:K|D\d+)\.[a-z][a-z0-9.-]*[a-z0-9]) \(([A-Z_]+)(?:, [^)]*)?\): ([A-Z][A-Z_]+(?: \| [A-Z][A-Z_]+)+)/g)) {
        if (cl[1] !== rawSub || !kindSet.has(cl[2])) continue;
        codeLists.push({ sub, kind: cl[2], codes: cl[3].split(" | "), path });
      }
      const window = text.slice(Math.max(0, m.index - 260), m.index + 200);
      if (!/ubkind|Assessment|assessment|conclusionCode|facet/.test(window)) continue;
      const sentence = text.slice(m.index, m.index + 300).split(/\n|(?<=\.)\s/)[0] ?? "";
      for (const fx of sentence.matchAll(/facets?[^`]{0,20}`([a-zA-Z]+)=([A-Z][A-Z_]*(?:\|[A-Z][A-Z_]*)+)`/g)) facetLists.push({ sub, name: fx[1], values: fx[2].split("|"), path });
      const paren = /^`?\s*\(([A-Z][A-Z_]+)[,)]/.exec(text.slice(m.index + m[1].length, m.index + m[1].length + 40));
      const k = paren && kindSet.has(paren[1]) ? paren[1] : kindNear(text, m.index, kinds);
      const t = textMentions.get(sub) ?? { kinds: new Map(), paths: new Set(), requested: false, retired: false };
      if (k) t.kinds.set(k, (t.kinds.get(k) ?? 0) + (paren && kindSet.has(paren[1]) ? 10 : 1));
      if (/\bdropped\b|\bwas drop/.test(text.slice(m.index, m.index + 80))) t.retired = true;
      if (/request/i.test(text.slice(Math.max(0, m.index - 80), m.index + 90))) t.requested = true;
      t.paths.add(path);
      textMentions.set(sub, t);
    }
  }
  for (const [sub, t] of [...textMentions.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (structured.has(sub)) {
      for (const e of reg.entries.values()) if (e.subkind === sub) for (const p of t.paths) e.sources.add(`${p} (mention)`);
      continue;
    }
    const ranked = [...t.kinds.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const kind = codeLists.find((c) => c.sub === sub)?.kind ?? ranked[0]?.[0] ?? null;
    const e = reg.get(kind, sub);
    for (const p of t.paths) e.sources.add(`${p} (mention)`);
    if (t.requested) e.requestedBy.add("text mention (requested)");
    if (t.retired) e.status = "retired";
    e.notes.push(kind ? `kind from the docstring/register text (${ranked.map(([k, n]) => `${k}:${n}`).join(", ")})` : "no AssessmentKind named next to the mention");
    if (!kind) unresolvedKind.push(sub);
  }

  // (3b) "subkind (KIND): A | B | C" code lists stated by the registering module (seams `use` strings, packets).
  for (const cl of codeLists) {
    const e = reg.get(cl.kind, cl.sub);
    e.sources.add(`${cl.path} (code list)`);
    for (const c of cl.codes) e.conclusionCodes.add(c);
  }
  for (const fl of facetLists) {
    for (const e of reg.entries.values()) {
      if (e.subkind !== fl.sub) continue;
      const f = addFacet(e, fl.name);
      for (const v of fl.values) f.values.add(v);
      e.sources.add(`${fl.path} (facet list)`);
    }
  }
  // (3c) Fold a bare family name into its `.*` entry (D1.identity-level -> D1.identity-level.*).
  for (const [key, e] of [...reg.entries.entries()]) {
    const fam = reg.entries.get(`${e.kind ?? "UNRESOLVED"}/${e.subkind}.*`);
    if (!fam || e.subkind.endsWith(".*")) continue;
    for (const s of e.sources) fam.sources.add(s);
    for (const c of e.conclusionCodes) fam.conclusionCodes.add(c);
    for (const t of e.admissibleSubjects) fam.admissibleSubjects.add(t);
    reg.entries.delete(key);
  }
  // (4) Curated decisions.
  const curated = [];
  const cur = (kind, sub, patch, decision) => {
    const e = reg.get(kind, sub);
    e.sources.add(`DECISIONS ${decision}`);
    patch(e);
    curated.push(`${kind}/${sub} (${decision})`);
    return e;
  };
  cur("OTHER", "D3.dose-translation", (e) => {
    e.methodVersions.add("D3.dose-translation@1");
    e.result = {
      artifact: "structured numeric result artifact, sealed and digest-referenced from the Assessment method/result artifact: heqPoint, heqLow, heqHigh (numbers), unit (UCUM, validated; mg/kg or mg/kg/d), method (the facet value), speciesFrom, speciesTo, inputs (uids)",
      validation: "bounds checked (0 < heqLow <= heqPoint <= heqHigh when present); a number without a unit is rejected; method is required",
      rule: "KN-01: no generic new Assessment fields; Assessment.score keeps the point estimate; the typed bounds live only in the versioned result artifact; only the declared facet keys are searchable; untyped prose numbers are never used as computable values",
    };
    e.status = "registered";
  }, "KN-01");
  cur("OTHER", "D3.endpoint-classification", (e) => {
    e.methodVersions.add("D3.endpoint-classification@1");
    addFacet(e, "contextOfUse");
    e.scope = "MD-D3-02: the BEST (FDA-NIH Biomarkers, EndpointS, and other Tools) category is versioned endpoint-classification Assessment vocabulary scoped to one intended use (facet contextOfUse required with bestCategory); it is not an intrinsic universal class of a Biomarker or OutcomeDefinition";
  }, "MD-D3-02");
  const tas = cur("CONFLICT_RELEVANCE", "D4.test-and-sell", (e) => {
    e.status = "alias-of:CONFLICT_RELEVANCE/D7.conflict-relevance";
    e.aliasRule = "MD-D4-03: task/use-case alias (measurement-side test-and-sell conflict) of the single D7.conflict-relevance method; it adds no codes and is not a duplicate subkind; writes use D7.conflict-relevance with the D4 task route";
  }, "MD-D4-03");
  void tas;
  cur("EVIDENCE_SYNTHESIS", "D7.role-agreement", (e) => {
    e.methodVersions.add("D7.role-agreement@1");
    e.method = {
      kind: "synthesis heuristic",
      precedence: "role-specific source precedence (e.g. issuer filings over press releases for officer roles; registry over press for study roles) applied as a HEURISTIC only",
      rule: "competing assertions are preserved; the documented conflict outcome is one of the conclusionCodes; precedence never overwrites contrary evidence (MD-D7-06)",
    };
  }, "MD-D7-06");
  cur("EVIDENCE_SYNTHESIS", "D2.evidence-aggregate", (e) => {
    e.methodVersions.add("bl-assoc/evidence-aggregate@1");
    e.note = "FU-14 (c): method version of the Q-D2-18 support score (Association.methodVersion); computed, never a stored verdict";
    for (const t of ["Mechanism", "MolecularEntity", "ChemicalSubstance"]) if (sdl.nodeTypeSet.has(t)) e.admissibleSubjects.add(t);
  }, "FU-14 c");
  for (const sub of ["D9.independence", "D9.claim-spread"]) {
    cur("OTHER", sub, (e) => {
      e.status = "requested";
      e.requestedBy.add("packets/D9/03-retrieval-patterns.md");
      e.note = "D9 requested kind DISCOURSE_METRIC, which is not in AssessmentKind; the packet's interim kind is OTHER. A materialized discourse metric (score, methodVersion, inputSetDigest, DERIVED_FROM the occurrences) about a Claim; computed on demand until the materialization trigger (OD-23) is met. Writes stay rejected until the registrar accepts the subkind.";
      if (sdl.nodeTypeSet.has("Claim")) e.admissibleSubjects.add("Claim");
    }, "R-54 / FX-11");
  }
  // FU-14 (g) / R-55: canonical disclosureFinding values.
  const cr = reg.get("CONFLICT_RELEVANCE", "D7.conflict-relevance");
  cr.sources.add("DECISIONS FU-14 g");
  const df = addFacet(cr, "disclosureFinding", undefined, "D7");
  df.contributor = "D9";
  for (const v of ["DISCLOSED_IN_CONTAINER", "DISCLOSED_IN_LATER_REVISION", "DISCLOSED_ELSEWHERE", "DISCLOSED_ELSEWHERE_AT_TIME", "DISCLOSED_ELSEWHERE_LATER_ONLY", "INADEQUATE_DISCLOSURE_PER_REGULATOR", "NOT_DISCLOSED", "NOT_FOUND_IN_PARTIAL_CAPTURE", "NOT_FOUND_IN_COMPLETE_CAPTURE", "NOT_FOUND_IN_CONTAINER"]) df.values.add(v);
  df.values.delete("INADEQUATE_PER_REGULATOR");
  df.aliases.set("INADEQUATE_PER_REGULATOR", "INADEQUATE_DISCLOSURE_PER_REGULATOR");
  df.rule = "R-55 union of the D7 and D9 lists; FU-14 (g) standardizes INADEQUATE_DISCLOSURE_PER_REGULATOR (D9 INADEQUATE_PER_REGULATOR is an explicit alias, re-keyed on write); values change only with D9's agreement";
  // R-54 named facets: D3 dimension=/missing=, D13 impactDomain=, K.claim-relation REFINES (KN-02).
  const kcr = reg.get("EQUIVALENCE", "K.claim-relation");
  kcr.sources.add("decision-report R-54 / DECISIONS KN-02");
  kcr.conclusionCodes.add("REFINES");
  kcr.note = "KN-02: EQUIVALENCE with REFINES conclusion; governed Claim.refinesClaimUid cache updated atomically with the authoritative assessment; no REFINES edge";
  if (sdl.nodeTypeSet.has("Claim")) kcr.admissibleSubjects.add("Claim");

  // A text-only entry whose kind could not be read next to it but which another source bound is dropped.
  for (const [key, e] of [...reg.entries.entries()]) {
    if (e.kind) continue;
    const bound = [...reg.entries.values()].some((o) => o !== e && o.kind && o.subkind === e.subkind);
    if (bound) reg.entries.delete(key);
  }
  for (const s of [...unresolvedKind]) if ([...reg.entries.values()].some((o) => o.kind && o.subkind === s)) unresolvedKind.splice(unresolvedKind.indexOf(s), 1);

  // Normalize, validate and emit.
  const subkinds = {};
  const problems = [];
  const keyFor = (e) => `${e.kind ?? "UNRESOLVED"}/${e.subkind}`;
  const byKind = {};
  for (const e of [...reg.entries.values()].sort((a, b) => keyFor(a).localeCompare(keyFor(b)))) {
    const reg2 = e.subkind.split(".")[0];
    if (!/^(K|D\d+)$/.test(reg2)) problems.push(`${keyFor(e)}: registrar prefix ${reg2}`);
    const facets = {};
    for (const [n, f] of [...e.facets.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      facets[n] = {
        owner: f.owner,
        ...(f.contributor ? { contributor: f.contributor } : {}),
        ...(f.enum ? { enum: f.enum } : {}),
        values: [...f.values].sort(),
        ...(f.valueKinds.size ? { valueKinds: [...f.valueKinds].sort() } : {}),
        ...(f.aliases.size ? { aliases: Object.fromEntries([...f.aliases.entries()].sort()) } : {}),
        ...(f.rule ? { rule: f.rule } : {}),
      };
      if (!facets[n].values.length) delete facets[n].values;
    }
    const registeredBySource = [...e.sources].some((src) => /\(table\)|\(code list\)|moduleExtras|sharedVocabularies|facetSeams|DECISIONS/.test(src));
    const requested = e.requestedBy.size > 0 && !registeredBySource;
    const status = e.status ?? (!e.kind ? "kind-unresolved" : requested ? "requested" : "registered");
    const out = {
      kind: e.kind,
      subkind: e.subkind,
      registrar: reg2,
      status,
      conclusionCodes: [...e.conclusionCodes].sort(),
      ...(e.members.size ? { members: [...e.members].sort() } : {}),
      ...(requested ? { requestedBy: [...e.requestedBy].sort() } : {}),
      ...(e.gradeSchemes.size ? { gradeSchemes: [...e.gradeSchemes].sort() } : {}),
      facets,
      admissibleSubjects: [...e.admissibleSubjects].sort(),
      ...(e.methodVersions.size ? { methodVersions: [...e.methodVersions].sort() } : {}),
      ...(e.effectDirections.size ? { effectDirections: [...e.effectDirections].sort() } : {}),
      ...(e.questions.size ? { questions: [...e.questions].sort() } : {}),
      ...(e.result ? { result: e.result } : {}),
      ...(e.scope ? { scope: e.scope } : {}),
      ...(e.method ? { method: e.method } : {}),
      ...(e.aliasRule ? { aliasRule: e.aliasRule } : {}),
      ...(e.note ? { note: e.note } : {}),
      ...(e.notes.length ? { notes: [...new Set(e.notes)].sort() } : {}),
      evidence: [...e.evidence].sort(),
      sources: [...e.sources].sort(),
    };
    if (!out.evidence.length) delete out.evidence;
    subkinds[keyFor(e)] = out;
    const kk = e.kind ?? "UNRESOLVED";
    byKind[kk] = (byKind[kk] ?? 0) + 1;
  }
  // Same subkind under several kinds is reported (one method has one kind; the owner picks).
  const kindsPerSubkind = new Map();
  for (const v of Object.values(subkinds)) kindsPerSubkind.set(v.subkind, [...(kindsPerSubkind.get(v.subkind) ?? []), v.kind ?? "UNRESOLVED"]);
  const kindConflicts = [...kindsPerSubkind.entries()].filter(([, ks]) => ks.length > 1).map(([s, ks]) => `${s}: ${ks.sort().join(", ")}`).sort();

  // Kind-level facets (any subkind or none): kernel conventions plus kind-only fixture records.
  const kindFacetSeed = {
    RETELLING_FIDELITY: { decision: "R-20 / F-05", names: ["retelling", "original", "occurrence"], valueKind: "uid", note: "kernel convention: the Assessment ASSESSES the Claim, is DERIVED_FROM the judged occurrences and names them in these facets (sdl/modules/kernel.graphql Assessment docstring)" },
    RESOLUTION: { decision: "R-09 / R-94", names: ["surfaceForm", "normalizedForm", "typeHint"], valueKind: "text", note: "a surface form awaiting resolution is a SourceLocator cited with role CONTEXT; these facets replace the removed Mention node" },
    EVIDENCE_SYNTHESIS: { decision: "R-34", names: ["input:<uid>"], values: ["SUPPORTS", "CONTRADICTS", "QUALIFIES"], note: "interim facets input:<uid>=SUPPORTS|CONTRADICTS|QUALIFIES naming which inputs support or contradict the synthesis; located support stays HAS_EVIDENCE {role}" },
  };
  const kindsDoc = {};
  for (const k of kinds) {
    const holder = kindLevel.get(k) ?? { facets: new Map(), evidence: new Set() };
    const seed = kindFacetSeed[k];
    if (seed) {
      for (const n of seed.names) {
        const f = addFacet(holder, n, undefined, "K");
        if (seed.valueKind) f.valueKinds.add(seed.valueKind);
        for (const v of seed.values ?? []) f.values.add(v);
      }
    }
    const facets = {};
    for (const [n, f] of [...holder.facets.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const seeded = seed?.names.includes(n) ?? false;
      facets[n] = { owner: f.owner, status: seeded ? "registered" : "observed", ...(f.values.size ? { values: [...f.values].sort() } : {}), ...(f.valueKinds.size ? { valueKinds: [...f.valueKinds].sort() } : {}) };
    }
    kindsDoc[k] = {
      subkinds: Object.values(subkinds).filter((s) => s.kind === k).map((s) => s.subkind).sort(),
      subkindRequired: k === "OTHER",
      ...(Object.keys(facets).length ? { facets } : {}),
      ...(seed ? { facetRule: `${seed.decision}: ${seed.note}` } : {}),
      ...(holder.evidence.size ? { evidence: [...holder.evidence].sort() } : {}),
    };
  }
  const counts = { kinds: kinds.length, subkinds: Object.keys(subkinds).length, byKind: Object.fromEntries(Object.entries(byKind).sort()), kindUnresolved: Object.values(subkinds).filter((s) => s.status === "kind-unresolved").length, retired: Object.values(subkinds).filter((s) => s.status === "retired").length, requested: Object.values(subkinds).filter((s) => s.status === "requested").length, kindConflicts: kindConflicts.length, curated: curated.length, fixtureAssessmentRecords: mined.assessments.length };
  const doc = {
    format: "bks-assessment-vocabulary.v1",
    version: "1.0.0",
    closes: ["R-54", "R-55", "KN-01", "KN-02 (K.claim-relation)", "MD-D3-02", "MD-D4-03", "MD-D7-06", "MD-D9-03 (b)", "FU-14 (c)", "FU-14 (g)"],
    rules: {
      key: "<AssessmentKind>/<registrar module>.<slug>; the registrar is the module prefix of the subkind",
      registration: "The executor rejects an unregistered (kind, subkind) pair; OTHER is allowed only with a registered subkind (R-54). kind-unresolved entries are mentions the owner must bind to one kind before writes are accepted.",
      facets: "Assessment.facets entries are `<facet>=<value>`; only the facet keys declared for the subkind are searchable; values listed are closed code lists unless valueKinds says otherwise.",
      conclusionCodes: "Assessment.conclusionCode values of the subkind; a verdict (SemanticVerdict) is a separate field, never a conclusion code.",
      admissibleSubjects: "SDL node types an Assessment of the subkind ASSESSES (observed in fixtures or named by the registering module); others need a registry update.",
      aliases: "status alias-of:<kind>/<subkind> names a task/use-case alias that writes as its target.",
      kindLevelFacets: "kinds.<KIND>.facets with status registered are kernel conventions usable with any subkind of the kind (or none); status observed lists facets of kind-only fixture records, which are NOT registered: a write must name a registered subkind that declares them (fixture re-key, FU-03).",
      statuses: "registered | requested (named by a module, not yet accepted: writes rejected) | retired (dropped by its module) | alias-of:<key> | kind-unresolved",
    },
    counts,
    kinds: kindsDoc,
    subkinds,
    kindConflicts,
    kindUnresolved: Object.values(subkinds).filter((s) => s.status === "kind-unresolved").map((s) => s.subkind).sort(),
    ignoredFixtureValues: ignoredValues.sort(),
    problems,
  };
  void nodeReg;
  void relReg;
  return { doc, counts };
}

// ---------------------------------------------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------------------------------------------

function buildIdentityRules(inputs) {
  const nodeReg = inputs.yaml("node-register.yaml");
  inputs.yaml("vocabularies/identifier-schemes.yaml"); // referenced by ID-02; digest recorded
  const types = {};
  for (const n of [...nodeReg.nodes].sort((a, b) => a.name.localeCompare(b.name))) {
    const declared = (n.identifierSchemes ?? []).map((s) => String(s));
    types[n.name] = {
      module: n.module,
      uidToken: n.uidToken,
      uidPattern: `hu:${n.uidToken}:<opaque>`,
      archetype: n.archetype,
      identityKeys: n.identityKeys ?? [],
      identifierSchemes: declared.map((s) => s.replace(/\s*\(.*\)$/, "")),
      ...(declared.some((s) => /\(requested\)/.test(s)) ? { requestedSchemes: declared.filter((s) => /\(requested\)/.test(s)).map((s) => s.replace(/\s*\(.*\)$/, "")) } : {}),
      ...(n.identityRule ? { identityRule: n.identityRule } : {}),
      ...(n.identityNote ? { identityNote: n.identityNote } : {}),
      ...(n.identityFallback ? { identityFallback: n.identityFallback } : {}),
    };
  }
  const rules = [
    { id: "ID-01", decision: "R-42", rule: "One (scheme, issuer, normalized value) identifies at most one Subjectable; no join through a shared Identifier. Enforced by the identifier_key uniqueness constraint (Identifier scheme, issuer, value); an issuer-less match is reported as ambiguous." },
    { id: "ID-02", decision: "KN-06 / MD-X-01", rule: "An identifier scheme is writable only when vocabularies/identifier-schemes.yaml marks it active with namespace, issuer, normalization, uniqueness and rights definitions and an exercised capture route; requested schemes stay disabled for writes and keep their registry history." },
    { id: "ID-03", decision: "EX-04", rule: "Source identity is a versioned canonical-URI digest (canonical-uri/v1): lowercase scheme and host, default port dropped, fragment dropped, semantic query keys preserved and sorted (e.g. YouTube `v`), only documented tracking keys stripped (utm_*, fbclid, gclid, mc_cid, mc_eid), per-host rules versioned. The canonical URI is retained; a digest collision with a different canonical URI is quarantined, never merged; legacy slug identities are migrated with collision checks." },
    { id: "ID-04", decision: "MD-D1-03", rule: "compositionDigest (D6 LabelVersion and D1 material composition) is computed over resolved D1 uids, normalized quantity/basis/unit and explicit unknown markers, sorted canonically; provisional names never establish cross-source equivalence; a spelling variant with the same resolved uids has the same digest, a changed formula a different one." },
    { id: "ID-05", decision: "MD-D5-04 / OD-27", rule: "ProtocolEdition identity hashes the normalized instruction payload per logical edition/section set, not the whole page; the page capture is preserved separately; sponsor/disclosure-only changes are excluded from the hash and do not mint an edition (D7 temporal interest assertions capture them); changed instructions or doses mint a new edition." },
    { id: "ID-06", decision: "MD-D5-07", rule: "A DOI or ISBN identifies the Publication; Protocol / ProtocolEdition link to their publication. No second identifier holder for the same namespace key." },
    { id: "ID-07", decision: "BM-06", rule: "ProtocolStep stepKey = section slug + normalized action-text hash with stepKeyAlignmentVersion; a changed or ambiguous alignment preserves the prior step identity and requires a recorded mapping decision (rename fixtures)." },
    { id: "ID-08", decision: "BM-01", rule: "Equivalence scale and material boundaries per D1 (identity levels); a supplier-only change under the same evidenced specification does not create a new material; unresolved specification equivalence is held." },
    { id: "ID-09", decision: "BM-03", rule: "An extract is not equated to a plant-part UNII because a label database does; record Taxon, plant part and preparation; REALIZES_SUBSTANCE only when the exact source scope supports it." },
    { id: "ID-10", decision: "BM-05 / MD-D4-02", rule: "A vendor algorithm implementation is a distinct AlgorithmVersion until an accepted EQUIVALENCE assessment says otherwise; published algorithm identity and trademark/name stay separate." },
    { id: "ID-11", decision: "KN-13", rule: "A QualityResult is reused only when its stable semantic identity and source measurement are unchanged; a new snapshot/locator is retained; re-anchoring alone is not an identity proof; a changed result becomes a new or superseding sourced record." },
    { id: "ID-12", decision: "MD-D6-02", rule: "Two GTINs may identify one Package only when format, count and market equivalence is evidenced; otherwise separate candidates are retained and resolved; never split solely on sales channel." },
    { id: "ID-13", decision: "MD-D6-03", rule: "Differently named enforcement products stay distinct until an EQUIVALENCE Assessment supports merging; observed names and their source are stored." },
    { id: "ID-14", decision: "OD-43", rule: "A listing maps to a single evidenced Package only; ambiguous mappings become held resolution work." },
    { id: "ID-15", decision: "MD-D7-10 / MD-D11-04", rule: "A rename does not create a new Organization; sponsor names resolve through kernel RESOLUTION with time-aware aliases; no module-owned competing alias database." },
    { id: "ID-16", decision: "EX-03", rule: "Every capture attempt has a canonical request digest over method, normalized URI, body digest and behavior-affecting non-secret headers; secrets are referenced by credential identity/version, never by value." },
  ];
  const doc = {
    format: "bks-rules.v1",
    ruleSet: "identity",
    version: "1.0.0",
    closes: ["R-42", "EX-04", "MD-D1-03", "MD-D5-04", "MD-D5-07", "BM-01", "BM-06", "KN-13", "MD-D6-02", "MD-D6-03"],
    references: ["vocabularies/identifier-schemes.yaml", "registers/node-register.yaml"],
    rules,
    types,
  };
  return { doc, counts: { types: Object.keys(types).length, rules: rules.length } };
}

function buildProjectionRules(inputs, sdl) {
  const nodeReg = inputs.yaml("node-register.yaml");
  // Cache fields: SDL field docstrings that call the field a cache.
  const caches = {};
  for (const t of [...sdl.types.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    if (t.kind !== "node" && t.kind !== "edge-properties" && t.kind !== "interface") continue;
    const fieldNames = new Set(t.fields.map((f) => f.name));
    const STAMP = /(MethodVersion|DerivedAt|AuthorityUid)$|^projection(MethodVersion|DerivedAt|Of[A-Z]\w*)$/;
    const stamps = [...fieldNames].filter((n) => STAMP.test(n)).sort();
    for (const f of t.fields) {
      if (f.isRelationship || STAMP.test(f.name) || !/\bcache\b|\bcached\b|projection cache/i.test(f.description)) continue;
      const family = stamps.filter((s) => {
        const stem = s.replace(STAMP, "");
        return stem && f.name.startsWith(stem);
      });
      const generic = stamps.filter((s) => /^projection/.test(s));
      const stampCandidates = family.length ? family : generic;
      const authority = /authority (?:is|=|stays (?:on|with)|remains) ([^.;]+)/i.exec(f.description)?.[1] ?? /(?:of|from) (?:the |its )?([A-Z][A-Za-z]+ (?:Assertion|Assessment|Adjudication)s?[^.;]*)/.exec(f.description)?.[1] ?? null;
      const methodVersion = /\b([a-z0-9-]+\/v\d+|[a-z0-9-]+@\d+)\b/.exec(f.description)?.[1] ?? null;
      caches[`${t.name}.${f.name}`] = {
        module: t.module,
        type: f.type,
        description: f.description,
        authority: authority ? authority.trim() : "named in the field docstring; the cache never answers alone",
        ...(methodVersion ? { methodVersion } : {}),
        stampFieldsOnType: stampCandidates,
        requirement: stampCandidates.length ? "write only with the stamp fields set by the projecting Activity (methodVersion/derivedAt and input or authority reference)" : "rewritten only by the authorized writer named in the docstring (FIELD Assertion, projection job or atomic assessment update); answers cite the authority, never the cache",
      };
    }
  }
  // MD-D10-06 DecisionCriterion.publisherUid stamps.
  const dc = sdl.types.get("DecisionCriterion");
  const stampFields = ["publisherUidMethodVersion", "publisherUidDerivedAt", "publisherUidAuthorityUid"];
  const present = dc ? stampFields.filter((s) => dc.fields.some((f) => f.name === s)) : [];
  const publisherRule = {
    decision: "MD-D10-06",
    field: "DecisionCriterion.publisherUid",
    rule: "Retained ONLY with generated stamps: publisherUidMethodVersion (String), publisherUidDerivedAt (DateTime) and publisherUidAuthorityUid (String: uid of the authorizing Assertion or the BellLabs Activity it was derived from). Without all three stamps in the SDL the cache is omitted from the product projection and the publisher is resolved directly through the authorizing Assertion (Q-D10-10).",
    stampFields,
    stampFieldsPresentInSdl: present,
    effective: present.length === stampFields.length ? "retained-with-stamps" : "omitted-from-product-projection",
  };
  // Register projections (node-register `projection`).
  const registerProjections = {};
  for (const n of nodeReg.nodes) if (n.projection) registerProjections[n.name] = n.projection;
  // OD-25 notReported per type: SDL fields named notReported / notReportedFields.
  const notReported = {};
  for (const t of [...sdl.types.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    if (t.kind !== "node") continue;
    for (const f of t.fields) {
      if (!/^notReported(Fields)?$/.test(f.name)) continue;
      const enumName = f.type.replace(/[[\]!]/g, "");
      notReported[t.name] = {
        module: t.module,
        field: f.name,
        itemType: enumName,
        ...(sdl.enums.has(enumName) ? { values: sdl.enums.get(enumName).values } : { values: "field names of the type (strings)" }),
      };
    }
  }
  const policies = [
    {
      id: "PR-01",
      decision: "MD-D10-05",
      name: "status-nonimplication/v1",
      owner: "D8 (meanings); D10 consumes for answers",
      rule: "One versioned status non-implication policy. A status fact never implies another without its own sourced record.",
      negativeCases: [
        { decision: "MD-D8-02", premise: "licence valid (LegalStatus family EXCLUSIVITY / MARKET_ACCESS licence)", notImplied: "product marketed", rule: "licence validity and market presence are distinct sourced status families" },
        { decision: "MD-D8-03", premise: "EFSA scientific opinion", notImplied: "EU authorization", rule: "requires a captured operative Commission act for that jurisdiction and date; until then status is unknown/unverified" },
        { decision: "MD-D10-05", premise: "patent granted or listed", notImplied: "product approved, marketed or effective", rule: "IP status is not market or efficacy status" },
        { decision: "MD-D10-05", premise: "regulatory approval for one indication/jurisdiction", notImplied: "approval for another indication, jurisdiction or form", rule: "approval is scoped to its record" },
        { decision: "MD-D10-05", premise: "registration / listing / GRAS notice filed", notImplied: "approval", rule: "only statusKind APPROVAL is approval" },
        { decision: "MD-D10-05", premise: "market withdrawal or no current listing", notImplied: "licence revoked", rule: "absence of market presence is not a licence status" },
      ],
    },
    {
      id: "PR-02",
      decision: "OD-37",
      name: "goal-polarity/v1",
      rule: "Harm, risk, avoidance and disconfirmed benefit are harm-facing; workflow queues, misstatement audits and ranking differences remain neutral.",
      examples: [
        { statement: "WORSENS_TARGET / CAUSES_ADVERSE_EFFECT", polarity: "harm" },
        { statement: "USE_CONSTRAINED_IN / INTERACTS_WITH stance AVOID", polarity: "harm (avoidance)" },
        { statement: "EVIDENCE_SYNTHESIS concluding NOT_SUPPORTED for a benefit claim", polarity: "harm (disconfirmed benefit)" },
        { statement: "re-review queue item after a rule change", polarity: "neutral (workflow)" },
        { statement: "RETELLING_FIDELITY misstatement audit", polarity: "neutral (audit)" },
        { statement: "two products ranked differently", polarity: "neutral (ranking difference)" },
      ],
    },
    {
      id: "PR-03",
      decision: "OD-19",
      name: "external-rating-mapping/v1",
      rule: "Third-party text and scale are preserved. A rating maps to the verdict lattice only through a registered exact (provider, rubric version) row, as that provider's interpretation; it is never a BellLabs adjudication. Unknown rubric versions stay unmapped. Applied at query time (R-31), never stored.",
      mappings: [{ provider: "Science Feedback", rubricVersion: "registered at capture; must match exactly", rating: "Unsupported", maps: "NOT_SUPPORTED (provider interpretation only)" }],
    },
    {
      id: "PR-04",
      decision: "KN-15",
      name: "claim-lifecycle-decision-table/v1",
      rule: "Frozen decision table for Assertion status and current-per-asserter projection.",
      table: [
        { state: "EXTRACTED", meaning: "captured but unadjudicated" },
        { event: "mechanical CAPTURE_FIDELITY failure", effect: "the assertion is not accepted; no human decision overrides a mechanical failure" },
        { event: "human REJECT of a held assertion", effect: "prevents acceptance only through an attributed superseding adjudication (asserter, time, locator)" },
        { event: "conflicting asserters", effect: "disagreement is preserved; there is no scalar highest-verdict ranking; each asserter has its own current projection" },
        { event: "admissible positive verdicts", effect: "DIRECTLY_SUPPORTED and SUPPORTED_WITH_QUALIFICATION admit support; ties between asserters stay a disagreement" },
      ],
      identity: "outcomeUid is the entity identity of an outcome; outcome / outcomeVerbatim carries named text under a separate grammar (vocabularies/qualifiers.yaml)",
    },
    {
      id: "PR-05",
      decision: "OD-25 / OD-24",
      name: "not-reported/v1",
      rule: "A value, a missing value and an explicitly inapplicable value are distinct. Types with a notReported list (below) record checked-and-not-reported fields there; other types use the kernel FIELD_NOT_REPORTED Assertion on a COMPLETE snapshot. NOT_APPLICABLE is never inferred from absence; where material it is a registered qualifier/assessment, otherwise the answer is unknown. Unreported assay/instrument/software details stay explicit UNKNOWN (OD-24).",
    },
    {
      id: "PR-06",
      decision: "MD-D10-01",
      name: "nutrient-conversion-tables",
      rule: "Nutrient and mass-basis conversion rules are versioned, source-backed calculation tables distributed with the projection rules, not graph nodes; every derived value cites the rule/table version (rule:mw-ratio.v1, rule:nutrient-equivalent.v1, rule:daily-max.v1, rule:extract-ratio-dhe.v1 named by D1).",
      tablesShipped: [],
      status: "contract only in this release: no table content is shipped; a derived value whose table is absent is not computed",
    },
    {
      id: "PR-07",
      decision: "MD-D10-02 / MD-D10-03",
      name: "decision-criterion-rules",
      rule: "Numeric thresholds live in a versioned typed DecisionCriterion rule artifact (value, unit, comparator, scope); query templates load allowed rules and never parse prose; the exact criteria set is bound by digest/version in the Assessment method/result artifact (no APPLIES_CRITERION edge).",
    },
    {
      id: "PR-08",
      decision: "MD-D10-04",
      name: "ci-excludes-null",
      rule: "A derived ciExcludesNull is allowed only with interval, scale, null value and derivation evidence; it is not an unreported p-value nor a study-quality judgment.",
    },
    {
      id: "PR-09",
      decision: "MD-D13-01",
      name: "frontier-anchors",
      rule: "Frontier anchors live in versioned frontier curation config keyed to Mechanism ids (frontiers.yaml); queries resolve the configured mapping and cite its version; no anchorMechanismKeys property.",
    },
    {
      id: "PR-10",
      decision: "OD-23 / FU-01 / FU-11",
      name: "materialization",
      rule: "Compute first; materialize only when repeated whole-graph work or a measured p95 > 200 ms justifies it, with semantic-equivalence and invalidation proof. Each retained cache has authority, method version, input digest and freshness policy. Per-frontier influence is a versioned D10 ranking Report, not a property per frontier.",
    },
    {
      id: "PR-11",
      decision: "OD-42",
      name: "hallmark-mapping-authority",
      rule: "A versioned curation Source is authoritative for hallmark mappings; a Report view cites that source and exact mapping version and is not a second authority.",
    },
  ];
  const doc = {
    format: "bks-rules.v1",
    ruleSet: "projection",
    version: "1.0.0",
    closes: ["MD-D10-06", "MD-D10-05", "MD-D8-02", "MD-D8-03", "OD-37", "OD-19", "KN-15", "OD-25", "MD-D10-01", "MD-D13-01", "FU-01"],
    policies,
    decisionCriterionPublisherUid: publisherRule,
    caches,
    registerProjections,
    notReported,
  };
  return { doc, counts: { caches: Object.keys(caches).length, notReportedTypes: Object.keys(notReported).length, policies: policies.length, publisherUid: publisherRule.effective } };
}

function buildTemporalRules(inputs) {
  const relReg = inputs.yaml("relationship-register.yaml");
  const types = {};
  for (const r of relReg.relationships) {
    const t = types[r.type] ?? { modules: [], class: r.class, temporal: r.temporal, edgeProperties: r.edgeProperties, exclusive: false };
    t.modules.push(r.module);
    if (t.class !== r.class) t.classConflict = [...new Set([t.class, r.class])].sort();
    if (r.exclusive === true) t.exclusive = true;
    if (r.exclusiveNote) t.exclusiveNote = r.exclusiveNote;
    if (r.temporalNote) t.temporalNote = r.temporalNote;
    if (r.projectionGate) t.projectionGate = r.projectionGate;
    if (t.temporal !== r.temporal) t.temporalVariants = [...new Set([t.temporal, r.temporal])].sort();
    types[r.type] = t;
  }
  const sorted = {};
  for (const k of Object.keys(types).sort()) {
    const t = types[k];
    t.modules = [...new Set(t.modules)].sort();
    if (t.exclusive) t.exclusivityScope = "(subject, relationship type, asserter)";
    sorted[k] = t;
  }
  const temporalCounts = {};
  for (const t of Object.values(sorted)) temporalCounts[t.temporal] = (temporalCounts[t.temporal] ?? 0) + 1;
  const definitions = {
    "AS-OF(x, $asOf)": "x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion)",
    "EPISODE-AT(r, $asOf)": "r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf) on an asserted edge",
    "VALID-AT(x, $V)": "(x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged",
    "recorded-only": "edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid",
    episode: "edge carries valid time (validFrom/validTo with basis/precision) and recorded time",
  };
  const rules = [
    { id: "TM-01", decision: "OD-05 / KN-05", rule: "Exclusive (non-overlapping) episodes are scoped to (subject, relationship/predicate slot, asserter): same-asserter overlap is rejected; different asserters coexist and cross-source disagreement is preserved. Separately defined global identity constraints are not weakened. K owns CQ-TM-05 and the exclusivity contract; module register rows supply slot policies (exclusive: true)." },
    { id: "TM-02", decision: "MD-D8-05", rule: "Each source date is retained with its semantic role and locator (e.g. article-effective date vs annex authorization date); no single event clock is chosen silently." },
    { id: "TM-03", decision: "MD-D11-01", rule: "Provider cache age and fetch metadata are recorded; fetched time is never called observed content time; stale or unknown content clocks remain explicit." },
    { id: "TM-04", decision: "EX-02", rule: "event-clock/v1 deterministically rematerializes accepted event clocks/status after assertion changes; SUPPORT gates causal edges (LEADS_TO / RESPONDS_TO projectionGate); accepted equivalence is required for event merging." },
    { id: "TM-05", decision: "OD-16", rule: "Registry history starts at the first retained observation; older versions are imported only from trustworthy captures; coverage start and unavailable historical intervals are shown, never implied complete." },
    { id: "TM-06", decision: "R-24", rule: "validObservedAt / source record times are the source's own clocks; recordedAt/recordedFrom are BellLabs recording times; the two are never interchanged." },
  ];
  const doc = {
    format: "bks-rules.v1",
    ruleSet: "temporal",
    version: "1.0.0",
    closes: ["OD-05", "KN-05", "MD-D8-05"],
    definitions,
    rules,
    counts: { relationshipTypes: Object.keys(sorted).length, byTemporal: Object.fromEntries(Object.entries(temporalCounts).sort()), exclusive: Object.values(sorted).filter((t) => t.exclusive).length },
    relationshipTypes: sorted,
  };
  return { doc, counts: doc.counts };
}

// ---------------------------------------------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------------------------------------------

function header(title, closes, inputs) {
  const lines = [
    `# ${title}`,
    `# GENERATED at promotion by ${REGISTRIES_GENERATOR} ${REGISTRIES_VERSION} (S1 schema authority) from the frozen candidate`,
    "# (biotech-knowledge-services schema/program/final @ 431c8a7) and the promoted release sources. Upstream authority after",
    "# promotion: edit here through a release revision; re-running promotion on the same frozen inputs reproduces these bytes.",
    `# Closes: ${closes.join(", ")}.`,
    "# Inputs (sha256):",
    ...inputs.map((i) => `#   ${i.path}  ${i.sha256}`),
    "# Research only, not medical advice.",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

export function buildRegistries({ finalDir, files }) {
  const out = new Map();
  const log = [];
  const summary = {};

  // Each document gets its own input list (fresh Inputs), so its header names exactly what it mined.
  const qIn = new Inputs(finalDir, files);
  const qSdl = loadSdl(qIn);
  const qMined = mineFixtures(qIn);
  const predicates = qIn.yaml("vocabularies/predicates.yaml").predicates ?? [];
  qIn.yaml("relationship-register.yaml");
  const q = buildQualifiers(qIn, qSdl, qMined, predicates);
  out.set("vocabularies/qualifiers.yaml", toYaml(q.doc, header("Qualifier grammar registry (bks-qualifier-grammar.v1)", q.doc.closes, qIn.inputList())));
  summary.qualifiers = q.counts;
  log.push({ id: "REG-QUALIFIERS", decision: "FU-14 a; MD-D12-02; MD-D5-02; OD-29; R-83", path: "vocabularies/qualifiers.yaml", what: `qualifier grammar: ${q.counts.registered} registered, ${q.counts.aliases} aliases, ${q.counts.unregisteredObservedPrefixes} unregistered observed prefixes (${q.counts.unregisteredObservedUses} uses), ${q.counts.freeTextUses} key-less free-text (verification.v1) uses` });

  const aIn = new Inputs(finalDir, files);
  const aSdl = loadSdl(aIn);
  const aMined = mineFixtures(aIn);
  const a = buildAssessments(aIn, aSdl, aMined);
  out.set("vocabularies/assessments.yaml", toYaml(a.doc, header("Assessment vocabulary (bks-assessment-vocabulary.v1)", a.doc.closes, aIn.inputList())));
  summary.assessments = a.counts;
  log.push({ id: "REG-ASSESSMENTS", decision: "R-54; R-55; KN-01; MD-D3-02; MD-D4-03; MD-D7-06; MD-D9-03 b; FU-14 c; FU-14 g", path: "vocabularies/assessments.yaml", what: `assessment vocabulary: ${a.counts.kinds} kinds, ${a.counts.subkinds} subkinds (${a.counts.kindUnresolved} kind-unresolved, ${a.counts.kindConflicts} kind conflicts)` });

  const iIn = new Inputs(finalDir, files);
  const id = buildIdentityRules(iIn);
  out.set("rules/identity-rules.yaml", toYaml(id.doc, header("Identity rules (bks-rules.v1)", id.doc.closes, iIn.inputList())));
  summary.identity = id.counts;
  log.push({ id: "RULES-IDENTITY", decision: id.doc.closes.join("; "), path: "rules/identity-rules.yaml", what: `identity rules: ${id.counts.rules} rules, ${id.counts.types} node types` });

  const pIn = new Inputs(finalDir, files);
  const pSdl = loadSdl(pIn);
  const pr = buildProjectionRules(pIn, pSdl);
  out.set("rules/projection-rules.yaml", toYaml(pr.doc, header("Projection rules (bks-rules.v1)", pr.doc.closes, pIn.inputList())));
  summary.projection = pr.counts;
  log.push({ id: "RULES-PROJECTION", decision: pr.doc.closes.join("; "), path: "rules/projection-rules.yaml", what: `projection rules: ${pr.counts.policies} policies, ${pr.counts.caches} cache fields, ${pr.counts.notReportedTypes} notReported types, publisherUid ${pr.counts.publisherUid}` });

  const tIn = new Inputs(finalDir, files);
  const tm = buildTemporalRules(tIn);
  out.set("rules/temporal-rules.yaml", toYaml(tm.doc, header("Temporal rules (bks-rules.v1)", tm.doc.closes, tIn.inputList())));
  summary.temporal = tm.counts;
  log.push({ id: "RULES-TEMPORAL", decision: tm.doc.closes.join("; "), path: "rules/temporal-rules.yaml", what: `temporal rules: ${tm.counts.relationshipTypes} relationship types, ${tm.counts.exclusive} exclusive` });

  return { files: out, log, summary };
}

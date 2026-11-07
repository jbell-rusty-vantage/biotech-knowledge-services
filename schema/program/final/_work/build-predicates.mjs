#!/usr/bin/env node
/**
 * Builds final/vocabularies/predicates.yaml, the one predicate registry of R-52 (closes MD-X-02 and FU-13).
 *
 *   node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/build-predicates.mjs [--check]
 *
 * Deterministic: no timestamps; entries sorted by name; inputs listed with sha256. --check exits 1 when the written file
 * differs from what the inputs produce (nothing is written).
 *
 * One entry per Assertion.predicate value used anywhere:
 *   - every predicateOnly / authorizingPredicates row of final/_work/registers/<M>.relationship.yaml (cross-checked
 *     against the merged final/relationship-register.yaml), multi-name rows ("A | B", "A, B") split;
 *   - the authorizing predicate of every asserted relationship type of the candidate IR (Assertion.predicate "equals the
 *     edge type for an asserted edge", kernel docstring; R-53 allows it);
 *   - predicates and retired names in final/_work/rulings.yaml (global.names.predicates, retiredNames, module
 *     register/rename/remove/extend-predicate ops) and named in decision-report.md R-52 / R-53;
 *   - names read by patterns (packets/<P>/03-retrieval-patterns.md, final/query-patterns.md): predicate contexts
 *     (`predicate: 'X'`, `.predicate IN [...]`, `= 'X'`) plus quoted tokens that are already known predicate names;
 *   - names written by fixtures (final/fixtures/**\/assertions.yaml and intent*.json: `predicate`, `inputPredicates`,
 *     `predicateOnly` map keys, intent assertion.predicate, assertion.literal predicate, predicate-only edge.assert
 *     relationshipType).
 * A name that none of the registers covers gets its status from CLOSEOUT below (each row cites the item it closes and
 * the ruling it follows). A used name with no CLOSEOUT row is emitted as proposed-new with `unresolved: true` and makes
 * the script exit 1, so the registry never silently admits a name.
 *
 * Subject and object types are SDL names only: tokens of the register text (structured fields first; for prose rows
 * the "X → Y" / "subject … object …" windows) that are node, interface or union names of the candidate IR. Types seen
 * in fixtures are reported apart (`observed`), and are the declared types only for closeout rows that say so.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const FINAL = resolve(here, "..");
const PROGRAM = resolve(FINAL, "..");
const require = createRequire(resolve(PROGRAM, "../../packages/schema-workspace/package.json"));
const YAML = require("yaml");
const CHECK = process.argv.includes("--check");
const OUT = join(FINAL, "vocabularies", "predicates.yaml");
const MODULES = ["K", ...Array.from({ length: 13 }, (_, i) => `D${i + 1}`)];
const sha = (t) => createHash("sha256").update(t).digest("hex");
const rel = (p) => relative(PROGRAM, p).split(sep).join("/");
const read = (p) => readFileSync(p, "utf8");
const inputs = [];
function load(p) { const t = read(p); inputs.push({ file: rel(p), sha256: sha(t) }); return t; }
const uniq = (a) => [...new Set(a.filter((x) => x !== undefined && x !== null && x !== ""))];
const sortU = (a) => uniq(a).sort();
const SCREAM = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;
const QID = /\b(?:CQ-[A-Z]{2}-\d{2}[a-z]?|Q-(?:K|D\d{1,2})-\d{2,3})\b/g;

// ------------------------------------------------------------------------------------------------ candidate SDL (IR)
const ir = JSON.parse(load(join(FINAL, "schema", "final_biotech_schema_v2.ir.json")));
const NODE_OWNER = Object.fromEntries(ir.nodes.map((n) => [n.name, n.fragment]));
for (const i of ir.interfaces) NODE_OWNER[i.name] = i.fragment;
for (const u of ir.unions) NODE_OWNER[u.name] = u.fragment;
const SDL_TYPES = new Set(Object.keys(NODE_OWNER));
const UNION_MEMBERS = Object.fromEntries(ir.unions.map((u) => [u.name, u.members]));
const RELS = Object.fromEntries(ir.relationshipTypes.map((r) => [r.type, r]));
// Module-qualified lowercase phrases the registers use for an SDL type ("D1 substance" = D1's ChemicalSubstance).
const PHRASES = [[/\bD1 (?:substance|compound|metabolite)s?\b/g, "ChemicalSubstance"], [/\bD6 products?\b/g, "Product"], [/\bD5 protocols?\b/g, "Protocol"], [/\bD4 devices?\b/g, "Device"], [/\bD12 foods?\b/g, "FoodItem"], [/\bD3 arms?\b/g, "StudyArm"]];
const typesIn = (text) => { let t = String(text ?? "").replace(/\b(?:never|not|no)\s+(?:an?\s+|the\s+)?(?:K\.|D\d{1,2}\.?\s?)?[A-Z][A-Za-z]+/g, ""); for (const [re, to] of PHRASES) t = t.replace(re, to); return sortU(t.match(/[A-Za-z][A-Za-z0-9]*/g)?.filter((x) => SDL_TYPES.has(x)) ?? []); };

// ------------------------------------------------------------------------------------------------ registers
const merged = YAML.parse(load(join(FINAL, "relationship-register.yaml")));
const fragments = {};
for (const m of MODULES) fragments[m] = YAML.parse(load(join(FINAL, "_work", "registers", `${m}.relationship.yaml`)));
const fragNames = MODULES.flatMap((m) => (fragments[m].predicateOnly ?? []).map((p) => `${m}:${p.predicate}`));
const mergedNames = (merged.predicateOnly ?? []).map((p) => `${p.module}:${p.predicate}`);
const registerDrift = [...fragNames.filter((x) => !mergedNames.includes(x)).map((x) => `fragment only ${x}`), ...mergedNames.filter((x) => !fragNames.includes(x)).map((x) => `merged only ${x}`)];
const rulings = YAML.parse(load(join(FINAL, "_work", "rulings.yaml")));
const decision = load(join(FINAL, "decision-report.md"));
const catalogIds = new Set(load(join(FINAL, "questions-catalog.md")).match(QID) ?? []);

// ------------------------------------------------------------------------------------------------ R-52 registrar rule
const RULE1_K = new Set(rulings.global.names.predicates.kernelConventions.names);
const RULE2 = {
  D5: ["INTENDED_FOR_TARGET", "IMPROVES_TARGET", "WORSENS_TARGET", "NO_EFFECT_ON_TARGET", "MIXED_EFFECT_ON_TARGET", "HAS_UPPER_LIMIT", "HAS_AUTHORIZED_DOSE_RANGE", "USE_CONSTRAINED_IN", "INTERACTS_WITH", "CAUSES_ADVERSE_EFFECT"],
  D7: ["MANUFACTURES", "CONTRACT_MANUFACTURES_FOR", "SUPPLIES_MATERIAL", "MANUFACTURER_UNNAMED", "DISTRIBUTES"],
  D9: ["RECOMMENDS_USE", "RECOMMENDS_AGAINST"],
};
const RULE2_OF = Object.fromEntries(Object.entries(RULE2).flatMap(([m, ns]) => ns.map((n) => [n, m])));

// ------------------------------------------------------------------------------------------------ closeout rows (2026-10-09)
// status: registered | alias-of:<P> | retired-by:<ruling> | proposed-new. `edit` = what the fixture editors apply,
// `patternEdit` = what the pattern owners apply. Types listed here are SDL names (checked below).
const CLOSEOUT = {
  // ---- MD-X-02: pattern names no packet registers (D10 Q-D10-07, Q-D10-11; D10 DecisionCriterion docstring)
  FORM_OF: { item: "MD-X-02", status: "retired-by:R-52", replacedBy: ["REALIZES_SUBSTANCE", "HAS_ACTIVE_MOIETY"], patternEdit: "D10 03 Q-D10-07 and Q-D10-11: read the D1 typed edges (IngredientMaterial -REALIZES_SUBSTANCE-> ChemicalSubstance -HAS_ACTIVE_MOIETY-> ChemicalSubstance); their authorizing predicates are the type names, so `p.predicate IN ['REALIZES_SUBSTANCE','HAS_ACTIVE_MOIETY']` keeps the pattern shape", why: "no registrar; the 'form of' fact is D1's typed material → substance → moiety chain" },
  PREPARATION_OF: { item: "MD-X-02", status: "retired-by:R-52", replacedBy: ["MATERIAL_CONTAINS", "FOOD_CONTAINS"], patternEdit: "D10 03 Q-D10-07: a preparation that contains X is IngredientMaterial -MATERIAL_CONTAINS-> X or FoodItem -FOOD_CONTAINS-> X (R-64 union [:MATERIAL_CONTAINS|FOOD_CONTAINS])", why: "no registrar; D1 / D12 typed content edges carry the fact" },
  CONTAINS_INGREDIENT: { item: "MD-X-02", status: "retired-by:R-52", replacedBy: ["DECLARES_COMPONENT"], patternEdit: "D10 03 Q-D10-07: a product that contains X is Product → ProductVariant → Package -HAS_LABEL_VERSION-> LabelVersion -DECLARES_COMPONENT-> IngredientMaterial | Constituent | FoodItem", why: "no registrar; D6's typed label line carries the fact" },
  DECLARES_AMOUNT: { item: "MD-X-02", status: "retired-by:R-52", replacedBy: ["DECLARES_COMPONENT"], patternEdit: "D10 DecisionCriterion.inputPredicates examples and fixtures name DECLARES_COMPONENT (the declared amount is on ComponentLineProperties). The SDL docstring of DecisionCriterion.inputPredicates still names DECLARES_AMOUNT: docstring-only edit deferred (SDL frozen this round; open-questions MD-X-03)", why: "no registrar; a declared amount is a DECLARES_COMPONENT line property" },
  // ---- MD-X-02: D3-subject literals used by D1, D11 and the cross-domain fixtures (R-52 rule 3: D3 owns the subject)
  UNIT_DOSE_AMOUNT: { item: "MD-X-02", status: "registered", registrar: "D3", contributors: ["D1"], subjectTypes: ["InterventionComponent"], literal: { valueFields: ["valueNumber"], unit: "UCUM mass per unit (e.g. mg)" }, questions: ["Q-D1-08", "CQ-ST-02"], promoteWhen: "never as an edge (a literal of the component)", why: "R-52 rule 3: subject D3.InterventionComponent; the per-unit amount beside the per-day one (one component carries one cached quantity)" },
  ADMINISTERED_AMOUNT: { item: "MD-X-02", status: "registered", registrar: "D3", contributors: ["D1", "D11"], subjectTypes: ["InterventionComponent"], literal: { valueFields: ["valueNumber"], unit: "UCUM amount per period (e.g. mg/d)" }, questions: ["Q-D1-08", "Q-D11-02"], promoteWhen: "never as an edge (a literal of the component)", why: "R-52 rule 3: subject D3.InterventionComponent; D11 Q-D11-02 pattern reads it beside ADMINISTERS" },
  REGISTRY_ID_AS_PRINTED: { item: "MD-X-02", status: "registered", registrar: "D3", contributors: ["D1"], subjectTypes: ["Publication"], literal: { valueFields: ["valueString"], unit: null }, questions: ["CQ-ID-06", "Q-D3-15"], promoteWhen: "never (kept as printed, never corrected; the resolved registration is an Identifier)", why: "R-52 rule 3: subject D3.Publication (the registry id a paper prints, malformed or not)" },
  // ---- MD-X-02: registrar no ruling assigned → R-52 rule 3 (owner of the subject type); the old registrar contributes
  PROSPECTIVE_REGISTRATION_FLAG: { item: "MD-X-02", status: "registered", registrar: "D3", contributors: ["D11"], why: "R-52 rule 3: subject D3.Study (D11 kept it as registrar in its packet)" },
  RECORD_LAST_UPDATED: { item: "MD-X-02", status: "registered", registrar: "K", contributors: ["D11"], subjectTypes: ["Source"], why: "R-52 rule 3: subject kernel Source (registry or aggregator record); D11 keeps the convention text" },
  OUTCOME_MEASURED_WITH: { item: "MD-X-02", status: "registered", registrar: "D3", contributors: ["D4"], why: "R-52 rule 3: subject D3.OutcomeDefinition; D4 contributes the AssayVersion | AlgorithmVersion | Metric objects. A Metric object duplicates D3's derived MEASURES (OutcomeDefinition → Metric); D3 to confirm (MD-X-03)" },
  USED_FOOD_CLASSIFICATION: { item: "MD-X-02", status: "registered", registrar: "D3", contributors: ["D12"], why: "R-52 rule 3: subject D3.Study (OQ-D12-27: D12 held it until D3 takes it)" },
  USED_COMPOSITION_DATABASE: { item: "MD-X-02", status: "registered", registrar: "D3", contributors: ["D12"], why: "R-52 rule 3: subject D3.Study (OQ-D12-27)" },
  EXCEEDS_DOSE_THRESHOLD: { item: "MD-X-02", status: "registered", registrar: "D1", storage: "report-only", why: "confirmed: registered by D1, never stored as a graph Assertion (R-85); written only inside a published Report", edit: "D1/vitamin-b6-threshold-harm: c10a–c10d move from stored COMPUTATION Assertions into the published Report (R-85, FU-03 pending row)" },

  // ---- FU-13: the nine edge.assert predicates
  DIRECTLY_ACTIVATES: { item: "FU-13", status: "alias-of:ACTIVATES", ruling: "R-52", edit: "K hubbard-2013, resveratrol-sirt1, retracted-sah-2017, seller-claim-occurrences, two-run-lineage: re-key predicate and relationshipType DIRECTLY_ACTIVATES → ACTIVATES (D2: D1 substance → MolecularEntity); the claims whose propositionHashInput carries the predicate get a recomputed propositionHash (claim-hash@0); 'directly' stays in the proposition text", why: "D2 ACTIVATES is the registered substance → molecular-entity activation predicate (Q-D2-08); a second spelling would duplicate it" },
  MAY_IMPROVE_PROGNOSIS_OF: { item: "FU-13", status: "retired-by:R-83", replacedBy: ["IMPROVES_TARGET"], edit: "K retracted-sah-2017: the occurrence becomes IMPROVES_TARGET with object a D5.Target operationalized by the SAH Condition (OPERATIONALIZED_BY Target → Condition; D5 adds the target key if targets 0.2.2 lacks one), required qualifier population:<code>, speechAct SPECULATES kept (the 'may'); recompute claim-sah propositionHash", why: "a benefit for a goal is one of D5's five goal predicates with a Target object (R-83); modality belongs to speechAct, not the name" },
  OFFERS_FOR_SALE: { item: "FU-13", status: "alias-of:DISTRIBUTES", ruling: "R-68", edit: "K seller-claim-occurrences a-mr-offers: re-key OFFERS_FOR_SALE → DISTRIBUTES (D7, Organization → D6 Product, non-label source). When a fixture captures the offer itself, the typed D6 form is Offer -SELLER_OF_RECORD-> Organization", why: "placeholder in the fixture ('D6 owns the typed edge'); the registered non-label seller/distributor statement is D7 DISTRIBUTES (R-68 role set)" },
  DECLARES_INGREDIENT_FORM: { item: "FU-13", status: "retired-by:R-52", replacedBy: ["DECLARES_COMPONENT"], edit: "D10 mg-rankings-criteria-comparison: each DSLD label read becomes a D6 LabelVersion (Package -HAS_LABEL_VERSION->) with typed DECLARES_COMPONENT → the IngredientMaterial form (authorizing predicate DECLARES_COMPONENT, ComponentLineProperties); the criterion's inputPredicates name DECLARES_COMPONENT", why: "a label's declared ingredient form is D6's typed label line, not a Product → material predicate" },
  HIGHER_BIOAVAILABILITY_THAN: { item: "FU-13", status: "registered", registrar: "D1", contributors: ["D10"], subjectTypes: ["IngredientMaterial"], objectTypes: ["IngredientMaterial"], questions: ["Q-D10-11"], promoteWhen: "never as an edge (a comparative statement read as evidence for a ranking criterion)", why: "R-52 rule 3: subject D1.IngredientMaterial; no registered comparative predicate exists; Q-D10-11 reads it through $evidencePredicates" },
  ASSOCIATED_WITH_ADVERSE_EFFECT: { item: "FU-13", status: "alias-of:CAUSES_ADVERSE_EFFECT", ruling: "R-85", edit: "D10 livertox-green-tea-extract-harm: re-key to CAUSES_ADVERSE_EFFECT (D5; D12.FoodItem subject admitted by R-85) with qualifier sourceKind:REFERENCE_MONOGRAPH; keep polarity/speechAct (DENIES / NEGATIVE where LiverTox says not associated)", why: "R-84/R-85: CAUSES_ADVERSE_EFFECT is the one harm-to-condition predicate, monograph sources admitted" },
  DISCLOSES_ROLE_AT: { item: "FU-13", status: "retired-by:R-82", replacedBy: ["HOLDS_ROLE"], edit: "D10 mg-bisglycinate-rct-unstructured: edge.assert relationshipType and predicate HOLDS_ROLE (D7 typed, Person → Organization) with edgeProperties.roleKind EXECUTIVE_OFFICER; 'managing director' moves to the authorizing Assertion qualifier roleText: (R-30); the CRO-funding text stays a qualifier", why: "a stated role at an organization is D7's typed HOLDS_ROLE; the disclosure statement itself is DISCLOSES_INTEREST (R-82)" },
  MATERIAL_MANUFACTURED_BY: { item: "FU-13", status: "retired-by:R-68", replacedBy: ["MANUFACTURES"], edit: "D10 mg-bisglycinate-rct-unstructured: replace StudyArm -MATERIAL_MANUFACTURED_BY-> Organization with Organization (Biogena) -MANUFACTURES-> the administered D1 IngredientMaterial (reached from the arm's InterventionComponent -ADMINISTERS->); StudyArm is not an admitted subject", why: "R-68: one manufacturing name set, registrar D7 (subject the maker)" },
  INDICATED_FOR: { item: "FU-13", status: "alias-of:HAS_APPROVED_INDICATION", ruling: "R-88", edit: "D10 opentargets-association-signal: re-key to HAS_APPROVED_INDICATION (D8; subject D1.ChemicalSubstance, object D2.Condition); asserter the regulator whose approved label is cited (R-88), the label holder stays in qualifiers or as the label's issuer", why: "R-88: approved indications have one predicate" },

  // ---- other fixture-only names (no register row), resolved here so the lint can say what to apply
  HOLDS_EQUITY_IN: { item: "closeout", status: "alias-of:HOLDS_STAKE", ruling: "R-89", edit: "D2/nr-muscle-unstructured A-nr-06: re-key to HOLDS_STAKE (D7 typed, Person → Organization; stakeKind EQUITY on StakeEdgeProperties when written as an edge)", patternEdit: "D2 03 Q-D2-21: (who)-[r:HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM]->(org) with stakeKind EQUITY (R-89)" },
  CONSULTS_FOR: { item: "closeout", status: "retired-by:R-89", replacedBy: ["HOLDS_ROLE"], patternEdit: "D2 03 Q-D2-21: HOLDS_ROLE with roleKind ADVISOR | CONSULTANT (R-89)" },
  INVENTOR_OF_PATENT_LICENSED_TO: { item: "closeout", status: "retired-by:R-89", replacedBy: ["RECEIVES_VALUE_FROM"], patternEdit: "D2 03 Q-D2-21: RECEIVES_VALUE_FROM with valueKind INVENTOR_ON_LICENSED_IP (R-89)" },
  SUPPLIES: { item: "closeout", status: "alias-of:SUPPLIES_MATERIAL", ruling: "R-68", patternEdit: "D2 03 Q-D2-21: {predicate: 'SUPPLIES_MATERIAL'} (R-68 role set)" },
  SUPPLIED_INGREDIENT: { item: "closeout", status: "alias-of:SUPPLIES_MATERIAL", ruling: "R-68", patternEdit: "D12 03 (supplier roles): supRole.predicate IN ['SUPPLIES_MATERIAL','MANUFACTURES'] (R-68 role set, registrar D7)" },
  PROCESSED_INGREDIENT: { item: "closeout", status: "alias-of:MANUFACTURES", ruling: "R-68", patternEdit: "D12 03 (supplier roles): the processor of a material is its maker, MANUFACTURES (Organization → IngredientMaterial; R-68)" },
  DEVELOPS_THERAPY_TARGETING: { item: "closeout", status: "registered", registrar: "D7", contributors: ["D2"], why: "R-52 rule 3: subject D7 Organization only (the D2 register flagged it for the registry editor); D2 keeps the Mechanism | MolecularEntity objects" },
  INCREASES_LEVEL: { item: "closeout", status: "alias-of:INCREASES_LEVEL_OF", ruling: "R-52", edit: "D9/hl-essentials-recut-nmncom-retelling: re-key to INCREASES_LEVEL_OF (D2)" },
  STATES_REGULATORY_STATUS: { item: "closeout", status: "alias-of:RATES_CLAIM", ruling: "R-31", edit: "D10/fda-qhc-magnesium-disconfirmation: re-key to RATES_CLAIM (K; subject the Claim, asserter the regulator, valueString the status)" },
  DISCLOSES_AFFILIATE_COMMISSION: { item: "closeout", status: "alias-of:DISCLOSES_INTEREST", ruling: "R-82", edit: "D10/mg-rankings-criteria-comparison: re-key to DISCLOSES_INTEREST (D9; the one interest-disclosure predicate, subject the discloser); the commission text stays valueString" },
  REPORTS_ADVERSE_EVENT_RATE: { item: "closeout", status: "alias-of:CHARACTERIZES_INCIDENCE", ruling: "R-52", edit: "D10/livertox-green-tea-extract-harm: re-key to CHARACTERIZES_INCIDENCE (D10)" },
  MAX_DAILY_SUPPLEMENTAL_AMOUNT: { item: "closeout", status: "alias-of:PER_MAX_DAILY_DOSE_AMOUNT", ruling: "R-85", edit: "D10/mg-rankings-criteria-comparison: re-key the COMPUTATION Assertions to PER_MAX_DAILY_DOSE_AMOUNT (D1, rule:daily-max.v1); criterion inputPredicates likewise" },
  CONDITIONS_CLAIM_USE_ON_MAX_AMOUNT: { item: "closeout", status: "retired-by:R-93", replacedBy: ["HAS_CLAIM_CONDITION"], edit: "D10/fda-qhc-magnesium-disconfirmation: HAS_CLAIM_CONDITION (D8) with subject the kernel Claim and qualifier productClass=dietary supplements (R-93), condition text in valueString, amount in valueNumber + unitCode" },
  ARM_DAILY_DOSE: { item: "closeout", status: "retired-by:R-52", replacedBy: ["ADMINISTERED_AMOUNT"], edit: "D10/mg-bisglycinate-rct-unstructured: ADMINISTERED_AMOUNT (D3) with subject the arm's InterventionComponent, not the StudyArm" },
  LABEL_DECLARED_AMOUNT: { item: "closeout", status: "retired-by:R-52", replacedBy: ["DECLARES_COMPONENT"], edit: "D10/mg-rankings-criteria-comparison: the declared amount is the DECLARES_COMPONENT line (LabelVersion → material) property, with the DECLARES_INGREDIENT_FORM edit above" },
  LABEL_SERVING_DIRECTIONS: { item: "closeout", status: "retired-by:R-14", replacedBy: ["MAX_DAILY_SERVINGS"], edit: "D10/mg-rankings-criteria-comparison: the serving directions are LabelVersion fields (directionsText; maxDailyServings under FIELD predicate MAX_DAILY_SERVINGS) on the LabelVersion of the DECLARES_INGREDIENT_FORM edit" },
  STATES_METHOD_MAY_CHANGE: { item: "closeout", status: "alias-of:STATES_METHOD_CAVEAT", ruling: "R-52", edit: "D10/mg-rankings-criteria-comparison: re-key to STATES_METHOD_CAVEAT (one method-caveat name)" },
  "AlgorithmVersion.inputFeatureCount": { item: "closeout", status: "alias-of:INPUT_FEATURE_COUNT", ruling: "R-52", edit: "D4/dunedinpace-paper-unstructured a04: FIELD predicate in SCREAMING_SNAKE without the type prefix (R-52)" },
  "AlgorithmVersion.inputPlatforms": { item: "closeout", status: "alias-of:INPUT_PLATFORMS", ruling: "R-52", edit: "D4/dunedinpace-paper-unstructured: FIELD predicate in SCREAMING_SNAKE without the type prefix (R-52)" },
  // FIELD predicates named after an SDL property of the subject type (R-14 FIELD Assertion; D13 / D1 naming: the
  // property in SCREAMING_SNAKE). Proposed until the owner of the type registers them (R-52 rule 3).
  INPUT_FEATURE_COUNT: { item: "closeout", status: "proposed-new", registrar: "D4", field: "AlgorithmVersion.inputFeatureCount" },
  INPUT_PLATFORMS: { item: "closeout", status: "proposed-new", registrar: "D4", field: "AlgorithmVersion.inputPlatforms" },
  MOLECULAR_WEIGHT: { item: "closeout", status: "proposed-new", registrar: "D1", field: "ChemicalSubstance.molecularWeight" },
  MOLECULAR_FORMULA: { item: "closeout", status: "proposed-new", registrar: "D1", field: "ChemicalSubstance.molecularFormula" },
  MAX_DAILY_SERVINGS: { item: "closeout", status: "proposed-new", registrar: "D6", field: "LabelVersion.maxDailyServings" },
  DOSAGE_FORM: { item: "closeout", status: "proposed-new", registrar: "D3", field: "InterventionComponent.dosageForm" },
  DURATION_ISO: { item: "closeout", status: "proposed-new", registrar: "D3", field: "InterventionComponent.durationIso" },
  QUANTITY: { item: "closeout", status: "proposed-new", registrar: "D3", field: "InterventionComponent.quantity" },
  // Fixture-only statement / claim / metric predicates with no registered equivalent: proposed to the owner of the
  // subject type (R-52 rule 3); `candidate` names what the registrar may choose instead.
  STATES_METHOD_CAVEAT: { item: "closeout", status: "proposed-new", registrar: "D7", why: "ranker / platform method caveat (subject the publishing Organization)" },
  DISCLAIMS_ENDORSEMENT: { item: "closeout", status: "proposed-new", registrar: "D7", candidate: "RECOMMENDS_USE polarity NEGATIVE (needs a means subject)" },
  CHARACTERIZES_ABSORPTION: { item: "closeout", status: "proposed-new", registrar: "D1", why: "evidence statement read by Q-D10-11 $evidencePredicates" },
  REPORTS_DOSE_RANGE_STUDIED: { item: "closeout", status: "proposed-new", registrar: "D1" },
  STATES_ATTRIBUTION_CAVEAT: { item: "closeout", status: "proposed-new", registrar: "D1" },
  INDEXED_AS_PUBLICATION_TYPE: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "FIELD PUBLICATION_KIND (Publication.publicationKind) when the indexer's type is the work's kind" },
  STATES_STUDY_DESIGN: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "MASKING_STATED family (D3 design statements)" },
  STATES_LIMITATION: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "INTERPRETATION_CAVEAT (D3; subject StudyResult)" },
  REPORTS_EFFECT_SIZE: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "StudyResult.estimate under a FIELD predicate" },
  ADJUSTED_MEAN_DIFFERENCE: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "StudyResult.estimate under a FIELD predicate" },
  CHANGE_DIFFERENCE: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "StudyResult.estimate under a FIELD predicate" },
  INTERPRETS_RESULT: { item: "closeout", status: "proposed-new", registrar: "D3" },
  WELL_TOLERATED_AT_DOSE: { item: "closeout", status: "proposed-new", registrar: "D3" },
  DOSE_EXCEEDS_LABEL_RECOMMENDATION: { item: "closeout", status: "proposed-new", registrar: "D3" },
  PRECONDITIONS_HEART: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "IMPROVES_TARGET with a cardioprotection Target (R-83)" },
  BLOOD_NAD_CMAX_ABOVE_BASELINE_DAY14: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "a D3 StudyResult (METRIC literals on a Publication bypass the result model)" },
  SERUM_NAD_CONCENTRATION: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "a D3 StudyResult" },
  WITHIN_GROUP_CV_OF_NAD_CHANGE: { item: "closeout", status: "proposed-new", registrar: "D3", candidate: "a D3 StudyResult" },
  DECLARED_VIABLE_COUNT: { item: "closeout", status: "proposed-new", registrar: "D6", candidate: "DECLARES_COMPONENT line amount with unit {CFU}" },
  CLAIMS_THERAPEUTIC_EFFECT: { item: "closeout", status: "proposed-new", registrar: "D6", candidate: "IMPROVES_TARGET / INTENDED_FOR_TARGET with claimClass DISEASE_CLAIM (R-83)" },
  IS_MOST_ADVANCED_AGING_TEST: { item: "closeout", status: "proposed-new", registrar: "D6" },
  HAS_OFF_TARGET_ACTIVITY: { item: "closeout", status: "proposed-new", registrar: "D1", candidate: "D2 INHIBITS / ACTIVATES / BINDS per named target" },
  SAFETY_FINDING_REPORTED: { item: "closeout", status: "proposed-new", registrar: "D1", candidate: "CAUSES_ADVERSE_EFFECT (D5) with a Condition object" },
  SERIOUS_ADVERSE_EVENT_REPORTED: { item: "closeout", status: "proposed-new", registrar: "D1", candidate: "CAUSES_ADVERSE_EFFECT (D5) with a Condition object" },
  REPORTS_CONCLUSION: { item: "closeout", status: "proposed-new", registrar: "D1" },
  QUALIFIES: { item: "closeout", status: "proposed-new", registrar: "D7", candidate: "a qualifier of the qualified occurrence (EvidenceRole QUALIFIES is an edge role, not a predicate)" },
  REDUCES_RISK_OF: { item: "closeout", status: "proposed-new", registrar: "D1", candidate: "IMPROVES_TARGET / INTENDED_FOR_TARGET (R-83) or D2 DECREASES_RISK_OF (subjects Mechanism | MolecularEntity | Condition only)" },
};

// Retired names the rulings list without an alias row (rulings.yaml retiredNames, repath-fixtures RESIDUAL).
const RETIRED = {
  SPEAKS_AT: { ruling: "R-81", replacedBy: ["INVOLVES"], edit: "use D13 INVOLVES {PRESENTER}" },
  HAS_INTEREST_IN: { ruling: "R-78", replacedBy: ["HOLDS_ROLE", "HOLDS_STAKE", "RECEIVES_VALUE_FROM"], edit: "the D7 typed interest edges" },
  CONTRACT_MANUFACTURING_UNNAMED: { ruling: "R-68", aliasOf: "MANUFACTURER_UNNAMED" },
  SOLE_SOURCE_SUPPLIER_DEPENDENCE: { ruling: "R-68", aliasOf: "SUPPLIES_MATERIAL", edit: "qualifier exclusivity=SOLE" },
  FINANCING_AMOUNT_SOLD: { ruling: "R-92", aliasOf: "FINANCING_AMOUNT", edit: "amountKind / amountBasis qualifiers" },
  UPPER_LIMIT_FOR_POPULATION: { ruling: "R-52", aliasOf: "HAS_UPPER_LIMIT" },
};

// ------------------------------------------------------------------------------------------------ entries
const E = new Map();
const entry = (name) => {
  if (!E.has(name)) E.set(name, { predicate: name, kinds: new Set(), registrars: [], contributors: new Set(), texts: [], subj: [], obj: [], literal: null, qualifiers: new Set(), requiredQualifiers: new Set(), questions: new Set(), promoteWhen: [], aliases: new Map(), src: { registers: new Set(), rulings: new Set(), patterns: new Set(), fixtures: new Set(), decisionReport: new Set() }, notes: new Set(), storage: null, assertionKinds: new Set(), obs: { subj: new Set(), obj: new Set(), units: new Set(), valueFields: new Set(), assertionKinds: new Set(), proposalKinds: new Set() } });
  return E.get(name);
};
const splitNames = (s) => String(s).split(/\s*(?:\||,)\s*/).map((x) => x.trim()).filter((x) => SCREAM.test(x));
const aliasName = (s) => { const m = String(s).match(/^\s*([A-Z][A-Z0-9_]*)\s*(\((.*)\))?/); return m ? { name: m[1], note: m[3] ?? null } : null; };

function windowTypes(text, word) {
  const out = [];
  const re = new RegExp(`\\b${word}s?\\b\\s*(?:=|:|is|are)?\\s*(?:the\\s+)?([^;.]*?)(?=,\\s*(?:object|subject|value|asserter|qualifier)|;|\\.\\s|$)`, "gi");
  for (const m of String(text).matchAll(re)) out.push(...typesIn(m[1]));
  return out;
}
function arrowTypes(text) {
  const m = String(text).match(/([^.;:]*?)\s*(?:→|->)\s*([^.;]*)/);
  return m ? { s: typesIn(m[1]), o: typesIn(m[2]) } : null;
}
const LIT = /\bliteral\b|valueString|valueNumber|valueBoolean|\btyped literal\b|valueNumber \+ unitCode/i;

const lastSO = {};
for (const m of MODULES) {
  for (const p of fragments[m].predicateOnly ?? []) {
    const names = splitNames(p.predicate);
    let s = p.subject ?? p.subjects, o = p.object ?? p.objects;
    if (s === "same") s = lastSO[m]?.s; if (o === "same") o = lastSO[m]?.o;
    if (p.subject && p.subject !== "same") lastSO[m] = { ...(lastSO[m] ?? {}), s: p.subject };
    if (p.object && p.object !== "same") lastSO[m] = { ...(lastSO[m] ?? {}), o: p.object };
    for (const n of names) {
      const e = entry(n);
      e.kinds.add("predicate-only");
      e.registrars.push({ registrar: p.registrar ?? m, module: m, basis: p.registrar ? "register" : "register (registrar field absent; the registering module)" });
      e.src.registers.add(m);
      const prose = [p.use, p.meaning, p.note, p.carries, p.value].filter(Boolean).join(" ");
      e.texts.push(prose);
      if (p.assertionKind) e.assertionKinds.add(p.assertionKind);
      if (p.storage) e.storage = p.storage;
      // subject / object types: structured fields, then subjectObject / pairs, then prose windows
      let st = typesIn(Array.isArray(s) ? s.join(" ") : s), ot = typesIn(Array.isArray(o) ? o.join(" ") : o);
      const so = p.subjectObject ? arrowTypes(p.subjectObject) : null;
      if (so) { st.push(...so.s); ot.push(...so.o); }
      if (!st.length && !ot.length) {
        const a = arrowTypes(prose);
        if (a) { st.push(...a.s); ot.push(...a.o); }
        st.push(...windowTypes(prose, "subject")); ot.push(...windowTypes(prose, "object"));
      }
      e.subj.push(...st); e.obj.push(...ot);
      const objText = [Array.isArray(o) ? o.join(" ") : o, p.value, p.subjectObject?.split(/→|->/)[1], p.carries].filter(Boolean).join(" ");
      if (LIT.test(objText) || (!ot.length && LIT.test(prose)) || ["FIELD", "COMPUTATION"].includes(p.assertionKind)) {
        const vf = sortU((`${objText} ${prose}`.match(/value(?:String|Number|Boolean)/g) ?? []));
        const u = (`${objText} ${prose}`.match(/unitCode[^,;)]*|UCUM[^,;)]*|\{[a-z]+\}/) ?? [null])[0];
        e.literal = { valueFields: vf, unit: u ? u.trim() : null };
      }
      for (const q of p.qualifiers ?? []) e.qualifiers.add(String(q).split(/[ :(=]/)[0]);
      for (const q of p.requiredQualifiers ?? []) e.requiredQualifiers.add(String(q));
      for (const q of p.questions ?? []) e.questions.add(q);
      for (const q of prose.match(QID) ?? []) e.questions.add(q);
      if (p.promoteWhen) e.promoteWhen.push(String(p.promoteWhen));
      for (const a of [...(p.aliases ?? []), ...(p.renamedFrom ? [p.renamedFrom] : [])]) { const x = aliasName(a); if (x) e.aliases.set(x.name, { note: x.note, ruling: p.ruling ?? null, from: `register ${m}` }); }
    }
  }
  for (const p of fragments[m].authorizingPredicates ?? []) {
    const e = entry(p.predicate);
    e.kinds.add("authorizing");
    e.registrars.push({ registrar: p.registrar ?? m, module: m, basis: "register (authorizingPredicates)" });
    e.src.registers.add(m);
    e.texts.push([p.meaning, p.note].filter(Boolean).join(" "));
    if (p.promoteWhen) e.promoteWhen.push(String(p.promoteWhen));
  }
  for (const [k, rows] of Object.entries({ removedPredicates: fragments[m].removedPredicates, mergedInto: fragments[m].mergedInto, removedRegistrations: fragments[m].removedRegistrations, registeredElsewhere: fragments[m].registeredElsewhere })) {
    for (const r of rows ?? []) {
      for (const n of splitNames(r.predicate)) {
        const target = r.into ?? (String(r.now ?? "").match(/alias of ([A-Z_]+)/) ?? [])[1];
        if (target && target !== n) entry(target).aliases.set(n, { note: null, ruling: r.ruling ?? null, from: `register ${m} ${k}` });
        if (k === "registeredElsewhere") { const e = entry(n); e.contributors.add(m); for (const a of r.aliases ?? []) { const x = aliasName(a); if (x) e.aliases.set(x.name, { note: x.note, ruling: r.ruling ?? null, from: `register ${m} registeredElsewhere` }); } }
      }
    }
  }
}

// asserted relationship types: their authorizing predicate (kernel: "equals the edge type for an asserted edge")
const relRegister = {};
for (const r of merged.relationships) (relRegister[r.type] ??= []).push(r);
// asserted = relClass asserted, or a declaring field says class: asserted (IR `classes`; e.g. MEASURES, flag derived-registry)
for (const r of ir.relationshipTypes.filter((x) => x.relClass === "asserted" || (x.classes ?? []).includes("asserted"))) {
  const e = entry(r.type);
  e.kinds.add("authorizing");
  const rr = relRegister[r.type] ?? [];
  const reg = rr.find((x) => x.registrar)?.registrar ?? rr[0]?.module ?? r.fragments[0];
  if (!e.registrars.length) e.registrars.push({ registrar: reg, module: reg, basis: rr[0]?.kernelMeaning || r.fragments.length > 1 ? "relationship register (kernel-meaning type, declared by several modules)" : "relationship register (owner of the typed edge)" });
  e.src.registers.add(rr[0]?.module ?? r.fragments[0]);
  for (const t of r.triples) { e.subj.push(t.from); e.obj.push(t.to); }
  for (const x of rr) for (const q of x.questions ?? []) e.questions.add(q);
  e.promoteWhen.push("already typed: the predicate is the authorization record of the typed edge");
  e.typedAs = r.type;
}

// rulings.yaml: global names (registrar, aliases, qualifiers, subjects/objects), module ops, retired names
const RP = rulings.global.names.predicates;
for (const [n, v] of Object.entries(RP)) {
  if (n === "kernelConventions") { for (const k of v.names) { const e = entry(k); e.src.rulings.add(v.ruling); e.rulingRegistrar = "K"; } continue; }
  const e = entry(n);
  e.src.rulings.add(v.ruling);
  if (v.registrar) e.rulingRegistrar = v.registrar;
  for (const a of v.aliases ?? []) { const x = aliasName(a); if (x && x.name !== n) e.aliases.set(x.name, { note: x.note, ruling: v.ruling, from: "rulings.yaml" }); }
  for (const q of v.qualifiers ?? []) e.qualifiers.add(String(q).split(/[ :(=]/)[0]);
  const s = [v.subject, ...(v.subjects ?? [])].filter(Boolean).join(" "), o = [v.object, ...(v.objects ?? [])].filter(Boolean).join(" ");
  e.subj.push(...typesIn(s)); e.obj.push(...typesIn(o));
  if (v.contributors) for (const c of Object.keys(v.contributors)) e.contributors.add(c);
}
const OPS = [];
for (const [m, ops] of Object.entries(rulings.modules ?? {})) for (const op of ops) if (/predicate/.test(op.op)) OPS.push({ module: m, ...op });
for (const op of OPS) {
  const names = [op.name, ...(op.names ?? [])].filter((x) => x && SCREAM.test(x));
  if (op.op === "rename-predicate" && SCREAM.test(op.from ?? "") && SCREAM.test(op.to ?? "") && op.from !== op.to) { entry(op.to).aliases.set(op.from, { note: op.qualifier ?? null, ruling: op.ruling, from: `rulings.yaml ${op.module} rename-predicate` }); entry(op.to).src.rulings.add(op.ruling); }
  for (const n of names) {
    const e = entry(n);
    e.src.rulings.add(op.ruling);
    if (op.op === "extend-predicate") { e.subj.push(...typesIn((op.subjects ?? []).join(" ") + " " + (op.subject ?? ""))); e.obj.push(...typesIn((op.objects ?? []).join(" ") + " " + (op.object ?? ""))); if (op.qualifier) e.qualifiers.add(String(op.qualifier).split(/[ :(=]/)[0]); }
    if (op.op === "register-predicate") { e.subj.push(...typesIn((op.subjects ?? []).join(" ") + " " + (op.subject ?? ""))); e.obj.push(...typesIn((op.objects ?? []).join(" ") + " " + (op.object ?? ""))); }
    if (op.op === "remove-predicate") e.notes.add(`${op.module} removed its registration (${op.ruling}${op.note ? `: ${op.note}` : ""})`);
  }
}
const retiredNames = (rulings.global.noModuleEdit?.retiredNames ?? []).filter((x) => SCREAM.test(x));

// decision-report R-52 / R-53: names the two rulings mention
function rulingSection(id) {
  const i = decision.indexOf(`#### ${id} `);
  const j = decision.indexOf("\n#### ", i + 5);
  return i < 0 ? "" : decision.slice(i, j < 0 ? undefined : j);
}
const rulingText = { "R-52": rulingSection("R-52"), "R-53": rulingSection("R-53") };

// ------------------------------------------------------------------------------------------------ patterns
const patternFiles = [...MODULES.map((m) => join(PROGRAM, "packets", m, "03-retrieval-patterns.md")), join(FINAL, "query-patterns.md")].filter(existsSync);
const PRED_CTX = /predicate\s*(?::|=|<>|\bIN\b)\s*(\[[^\]]*\]|'[^']*'|"[^"]*")/g;
const patternUses = []; // { name, file, section, questions, ctx }
for (const f of patternFiles) {
  const text = load(f);
  const lines = text.split(/\r?\n/);
  const sections = [];
  let cur = { heading: "(preamble)", body: [] };
  for (const l of lines) { if (/^#{1,4}\s/.test(l)) { sections.push(cur); cur = { heading: l.replace(/^#+\s*/, ""), body: [] }; } else cur.body.push(l); }
  sections.push(cur);
  for (const s of sections) {
    const lines = s.body.map((l) => l.replace(/(^|[^:])\/\/.*$/, "$1")); // Cypher line comments are not executed patterns (URLs kept)
    const body = lines.join("\n");
    const headingIds = s.heading.match(QID) ?? [];
    const ql = body.match(/^Questions?:.*$/m);
    const sectionIds = (ql ? ql[0].match(QID) : null) ?? body.match(QID) ?? [];
    // question ids of a line: the heading's ids (03 files: one question per heading); else the line's own ids; else the
    // nearest line above in the section that names ids (a G-xx / P-xxa lead-in); else the section's Questions: line
    // (a preamble or conventions section with no Questions: line attributes only ids on the same line)
    const idsAt = (i) => { if (headingIds.length) return headingIds; if (!ql) return lines[i].match(QID) ?? []; for (let k = i; k >= 0; k--) { const m = lines[k].match(QID); if (m) return m; } return sectionIds; };
    const found = new Map(); // name -> { ctx, ids:Set }
    const note = (n, ctx, i) => { if (n.endsWith("_")) return; const f0 = found.get(n) ?? { ctx, ids: new Set() }; if (ctx === "predicate-context") f0.ctx = ctx; idsAt(i).forEach((q) => f0.ids.add(q)); found.set(n, f0); };
    lines.forEach((l, i) => {
      for (const m of l.matchAll(PRED_CTX)) for (const t of m[1].match(/'([A-Z][A-Z0-9_]*)'|"([A-Z][A-Z0-9_]*)"/g) ?? []) note(t.replace(/['"]/g, ""), "predicate-context", i);
      for (const m of l.matchAll(/[`'"]([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)[`'"]/g)) note(m[1], "quoted", i);
    });
    for (const [n, v] of found) patternUses.push({ name: n, file: rel(f), section: s.heading.slice(0, 80), questions: [...v.ids], ctx: v.ctx });
  }
}

// ------------------------------------------------------------------------------------------------ fixtures
const FIX = join(FINAL, "fixtures");
const fixtureUses = []; // { name, fixture, file, where, subj, obj, unit, valueFields, assertionKind, proposalKind }
const fixtureFiles = []; // aggregated into one inputs row
const stripMod = (t) => (typeof t === "string" ? t.replace(/^(?:K|D\d{1,2})\./, "") : undefined);
function walkFixtures(dir) {
  for (const f of readdirSync(dir).sort()) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { walkFixtures(p); continue; }
    const fx = relative(FIX, dir).split(sep).join("/");
    const fixRead = () => { const t = read(p); fixtureFiles.push(`${fx}/${f} ${sha(t)}`); return t; };
    if (f === "assertions.yaml") scanAssertions(YAML.parse(fixRead(), { maxAliasCount: -1 }), fx, f);
    if (/^intent.*\.json$/.test(f)) scanIntent(JSON.parse(fixRead()), fx, f);
  }
}
function scanAssertions(doc, fx, file) {
  const refType = {};
  (function idx(n) { if (Array.isArray(n)) n.forEach(idx); else if (n && typeof n === "object") { const t = stripMod(n.type); if ((n.ref || n.id || n.uid) && t && SDL_TYPES.has(t)) for (const k of [n.ref, n.id, n.uid]) if (typeof k === "string") refType[k] = t; Object.values(n).forEach(idx); } })(doc);
  const typeOf = (x) => (x && typeof x === "object" ? stripMod(x.type) ?? refType[x.ref] ?? refType[x.uid] : refType[x]);
  (function w(n, path) {
    if (Array.isArray(n)) { n.forEach((x, i) => w(x, `${path}[${i}]`)); return; }
    if (!n || typeof n !== "object") return;
    for (const [k, v] of Object.entries(n)) {
      if (k === "predicate" && typeof v === "string") {
        const val = n.value && typeof n.value === "object" ? n.value : n;
        fixtureUses.push({ name: v, fixture: fx, file, where: `${path}.predicate`, subj: typeOf(n.subject), obj: typeOf(n.object), unit: val.unitCode, valueFields: ["valueString", "valueNumber", "valueBoolean"].filter((x) => val[x] !== undefined && val[x] !== null), assertionKind: n.assertionKind });
      } else if (k === "inputPredicates" && Array.isArray(v)) {
        for (const x of v) if (typeof x === "string") fixtureUses.push({ name: x, fixture: fx, file, where: `${path}.inputPredicates`, valueFields: [] });
      } else if (k === "predicateOnly" && v && typeof v === "object" && !Array.isArray(v)) {
        for (const x of Object.keys(v)) fixtureUses.push({ name: x, fixture: fx, file, where: `${path}.predicateOnly`, valueFields: [] });
      }
      w(v, path ? `${path}.${k}` : k);
    }
  })(doc, "");
}
function scanIntent(j, fx, file) {
  const nodeType = Object.fromEntries((j.subjects ?? []).map((s) => [s.ref, s.nodeType]));
  (j.proposals ?? []).forEach((pr, i) => {
    const where = `proposals[${i}](${pr.proposalId})`;
    const names = uniq([pr.predicate, pr.assertion?.predicate]);
    if (pr.kind === "edge.assert" && !RELS[pr.relationshipType]) names.push(pr.relationshipType);
    for (const n of uniq(names)) {
      if (typeof n !== "string") continue;
      fixtureUses.push({ name: n, fixture: fx, file, where, subj: nodeType[pr.subjectRef ?? pr.fromRef ?? pr.stateRef], obj: nodeType[pr.toRef], unit: pr.unitCode, valueFields: ["valueString", "valueNumber", "valueBoolean"].filter((x) => pr[x] !== undefined && pr[x] !== null), proposalKind: pr.kind });
    }
    for (const x of pr.properties?.inputPredicates ?? []) fixtureUses.push({ name: x, fixture: fx, file, where: `${where}.properties.inputPredicates`, valueFields: [] });
  });
  for (const s of j.subjects ?? []) for (const x of s.properties?.inputPredicates ?? []) fixtureUses.push({ name: x, fixture: fx, file, where: `subjects(${s.ref}).properties.inputPredicates`, valueFields: [] });
}
walkFixtures(FIX);
inputs.push({ file: `final/fixtures (${fixtureFiles.length} assertions.yaml / intent*.json files)`, sha256: sha(fixtureFiles.sort().join("|")) });

// ------------------------------------------------------------------------------------------------ alias / retired entries
const aliasTarget = new Map(); // alias name -> { target, note, ruling, from }
for (const [n, e] of E) for (const [a, info] of e.aliases) {
  if (a === n || RELS[a] || (E.has(a) && E.get(a).kinds.size)) { e.notes.add(`alias ${a} not given its own row: ${RELS[a] ? "it is a typed relationship type" : "it is a registered name"}${info.note ? ` (${info.note})` : ""}`); continue; }
  if (!aliasTarget.has(a)) aliasTarget.set(a, { target: n, ...info });
}

// ------------------------------------------------------------------------------------------------ assemble
const usedNames = new Set([...fixtureUses.map((u) => u.name), ...patternUses.filter((u) => u.ctx === "predicate-context").map((u) => u.name)]);
const known = (n) => E.has(n) || aliasTarget.has(n) || RETIRED[n] || CLOSEOUT[n];
for (const u of patternUses) if (u.ctx === "quoted" && !known(u.name)) u.drop = true;
const allNames = sortU([...E.keys(), ...aliasTarget.keys(), ...Object.keys(RETIRED), ...Object.keys(CLOSEOUT), ...retiredNames, ...usedNames].filter((n) => !(RELS[n] && RELS[n].relClass !== "asserted" && !E.has(n))));
const problems = [];
const out = [];
for (const n of allNames) {
  const e = E.get(n) ?? entry(n);
  const co = CLOSEOUT[n];
  const fx = fixtureUses.filter((u) => u.name === n);
  const pu = patternUses.filter((u) => u.name === n && !u.drop);
  for (const u of fx) { e.src.fixtures.add(`final/fixtures/${u.fixture}`); if (SDL_TYPES.has(u.subj)) e.obs.subj.add(u.subj); if (SDL_TYPES.has(u.obj)) e.obs.obj.add(u.obj); if (u.unit) e.obs.units.add(u.unit); u.valueFields?.forEach((x) => e.obs.valueFields.add(x)); if (u.assertionKind) e.obs.assertionKinds.add(u.assertionKind); if (u.proposalKind) e.obs.proposalKinds.add(u.proposalKind); }
  for (const u of pu) { e.src.patterns.add(`${u.file}#${u.section}`); u.questions.forEach((q) => e.questions.add(q)); }
  for (const [r, t] of Object.entries(rulingText)) if (new RegExp(`\\b${n}\\b`).test(t)) e.src.decisionReport.add(r);

  // status
  let status, registrar = null, registrarBasis = null, replacedBy = null, edit = co?.edit ?? null, patternEdit = co?.patternEdit ?? null, closes = co?.item ?? null, unresolved = false;
  const regs = e.registrars;
  if (co) {
    status = co.status;
    if (co.registrar) { registrar = co.registrar; registrarBasis = co.status === "proposed-new" ? "R-52 rule 3 (owner of the subject type), proposed" : `closeout: ${co.why ?? "R-52 rule 3"}`; }
    if (co.replacedBy) replacedBy = co.replacedBy;
    if (co.status.startsWith("alias-of:")) replacedBy = [co.status.slice(9)];
    for (const c of co.contributors ?? []) e.contributors.add(c);
    if (co.storage) e.storage = co.storage;
    for (const q of co.questions ?? []) e.questions.add(q);
    if (co.subjectTypes) e.subjDeclared = co.subjectTypes;
    if (co.objectTypes) e.objDeclared = co.objectTypes;
    if (co.literal) e.literal = co.literal;
    if (co.promoteWhen) e.promoteWhen.push(co.promoteWhen);
    if (co.field) { const [t, f] = co.field.split("."); const node = ir.nodes.find((x) => x.name === t); const prop = node?.properties.find((x) => x.name === f); if (!prop) problems.push(`${n}: field ${co.field} is not in the SDL`); e.field = co.field; e.subjDeclared = [t]; e.literal = { valueFields: [prop?.kind === "scalar" && /Float|Int/.test(prop.namedType) ? "valueNumber" : prop?.namedType === "Boolean" ? "valueBoolean" : "valueString"], unit: null }; e.assertionKinds.add("FIELD"); e.promoteWhen.push("never as an edge (FIELD Assertion authorizing a node property, R-14)"); }
    if (!regs.length && co.status === "registered" && !co.registrar) problems.push(`${n}: registered by closeout without a registrar`);
    if (regs.length && co.status === "registered" && !co.registrar) { registrar = regs[0].registrar; registrarBasis = regs[0].basis; }
  } else if (regs.length) {
    status = "registered";
    const distinct = uniq(regs.map((r) => r.registrar));
    registrar = e.rulingRegistrar && distinct.includes(e.rulingRegistrar) ? e.rulingRegistrar : distinct[0];
    registrarBasis = RULE1_K.has(n) ? "R-52 rule 1 (kernel convention)" : RULE2_OF[n] ? `R-52 rule 2 (controlled family, ${RULE2_OF[n]})` : regs.find((r) => r.registrar === registrar).basis;
    if (distinct.length > 1) problems.push(`${n}: registered by ${distinct.join(", ")} (duplicate registration)`);
    if (e.rulingRegistrar && e.rulingRegistrar !== registrar) problems.push(`${n}: rulings.yaml names registrar ${e.rulingRegistrar}, register says ${registrar}`);
  } else if (aliasTarget.has(n)) {
    const a = aliasTarget.get(n);
    status = `alias-of:${a.target}`; replacedBy = [a.target];
    edit = `re-key ${n} → ${a.target}${a.note ? ` (${a.note})` : ""}`;
    e.src.rulings.add(a.ruling ?? "R-52");
    e.aliasFrom = a.from;
  } else if (RETIRED[n]) {
    const r = RETIRED[n];
    if (r.aliasOf) { status = `alias-of:${r.aliasOf}`; replacedBy = [r.aliasOf]; } else { status = `retired-by:${r.ruling}`; replacedBy = r.replacedBy; }
    edit = r.edit ?? `re-key ${n} → ${replacedBy.join(" | ")}`;
    e.src.rulings.add(r.ruling);
  } else if (retiredNames.includes(n)) {
    status = "retired-by:R-52"; edit = "retired name (rulings.yaml retiredNames) with no alias row";
  } else if (RELS[n]) {
    continue;
  } else {
    status = "proposed-new"; unresolved = true;
    problems.push(`${n}: used (${fx.length} fixture uses, ${pu.length} pattern uses) but no register row and no CLOSEOUT row`);
  }

  // subject / object types (SDL only)
  const subjectTypes = sortU(e.subjDeclared ?? e.subj).filter((t) => SDL_TYPES.has(t));
  const objectTypes = sortU(e.objDeclared ?? e.obj).filter((t) => SDL_TYPES.has(t));
  let typesBasis = e.subjDeclared ? "closeout" : e.typedAs ? "candidate SDL (relationship triples)" : subjectTypes.length || objectTypes.length ? "register text (SDL names only)" : null;
  let st = subjectTypes, ot = objectTypes;
  if (!st.length && !ot.length && e.obs.subj.size) { st = sortU([...e.obs.subj]); ot = sortU([...e.obs.obj]); typesBasis = "fixtures (observed SDL types)"; }
  for (const t of [...(e.subjDeclared ?? []), ...(e.objDeclared ?? [])]) if (!SDL_TYPES.has(t)) problems.push(`${n}: closeout type ${t} is not an SDL type`);
  let literal = e.typedAs ? null : e.literal;
  if (!literal && !e.typedAs && !ot.length && e.obs.valueFields.size) literal = { valueFields: sortU([...e.obs.valueFields]), unit: null };
  if (literal) literal = { valueFields: literal.valueFields ?? [], unit: literal.unit ?? null, ...(e.obs.units.size ? { observedUnits: sortU([...e.obs.units]) } : {}) };

  // promotion
  const pw = uniq(e.promoteWhen).join(" | ") || null;
  const never = !pw || /^\s*never/i.test(pw);
  const promotesTo = e.typedAs ? e.typedAs : status === "registered" && !never ? n : null;
  const promotingQuestions = e.typedAs ? [] : sortU((pw ?? "").match(QID) ?? []);

  // registrar check (R-52 rule 3)
  let registrarCheck = null;
  if (registrar && status !== "proposed-new") {
    const owners = sortU(st.filter((t) => t !== "Subjectable" && t !== "Entity").flatMap((t) => (UNION_MEMBERS[t] ?? [t]).map((x) => NODE_OWNER[x])));
    if (RULE1_K.has(n)) registrarCheck = "rule 1";
    else if (RULE2_OF[n]) registrarCheck = RULE2_OF[n] === registrar ? "rule 2" : `rule 2 names ${RULE2_OF[n]}`;
    else if (e.typedAs) registrarCheck = "owner of the typed edge";
    else if (!owners.length) registrarCheck = "rule 3 not computable (no SDL subject type)";
    else if (owners.includes(registrar)) registrarCheck = owners.length > 1 ? "rule 3 (subjects span modules; registrar among them)" : "rule 3";
    else registrarCheck = owners.length === 1 ? `rule 3 names ${owners[0]}` : `subjects span ${owners.join(", ")}; registrar outside them (existing registrar keeps it)`;
  }

  const questions = sortU([...e.questions].filter((q) => catalogIds.has(q)));
  const row = {
    predicate: n,
    status,
    kind: e.typedAs ? "authorizing" : e.field ? "field" : e.assertionKinds.has("COMPUTATION") ? "computation" : e.assertionKinds.has("FIELD") ? "field" : literal ? "literal" : status.startsWith("alias-of") || status.startsWith("retired-by") ? "retired" : "relationship",
    registrar,
    ...(registrarBasis ? { registrarBasis } : {}),
    ...(registrarCheck ? { registrarCheck } : {}),
    ...(e.contributors.size ? { contributors: sortU([...e.contributors].filter((c) => c !== registrar)) } : {}),
    subjectTypes: st,
    objectTypes: ot,
    ...(typesBasis ? { typesBasis } : {}),
    literal: literal ?? null,
    ...(e.field ? { field: e.field } : {}),
    ...(e.storage ? { storage: e.storage } : {}),
    ...(e.requiredQualifiers.size ? { requiredQualifiers: sortU([...e.requiredQualifiers]) } : {}),
    ...(e.qualifiers.size ? { qualifiers: sortU([...e.qualifiers]) } : {}),
    questions,
    promotesTo,
    promotingQuestions,
    ...(pw ? { promoteWhen: pw } : {}),
    ...([...e.aliases.keys()].filter((a) => aliasTarget.get(a)?.target === n).length ? { aliases: sortU([...e.aliases.keys()].filter((a) => aliasTarget.get(a)?.target === n)) } : {}),
    ...(replacedBy ? { replacedBy } : {}),
    ...(closes ? { closes } : {}),
    ...(co?.why ? { why: co.why } : {}),
    ...(co?.candidate ? { candidate: co.candidate } : {}),
    ...(edit ? { fixtureEdit: edit } : {}),
    ...(patternEdit ? { patternEdit } : {}),
    ...(unresolved ? { unresolved: true } : {}),
    observed: { subjectTypes: sortU([...e.obs.subj]), objectTypes: sortU([...e.obs.obj]), assertionKinds: sortU([...e.obs.assertionKinds]), proposalKinds: sortU([...e.obs.proposalKinds]), fixtureUses: fx.length, patternUses: pu.length },
    sources: { registers: sortU([...e.src.registers]), rulings: sortU([...e.src.rulings]), decisionReport: sortU([...e.src.decisionReport]), patterns: sortU([...e.src.patterns]), fixtures: sortU([...e.src.fixtures]) },
    ...(e.notes.size ? { notes: sortU([...e.notes]) } : {}),
  };
  out.push(row);
}

// alias targets must exist and be registered or proposed (no alias chains to retired names)
const byName = Object.fromEntries(out.map((r) => [r.predicate, r]));
for (const r of out) for (const t of r.replacedBy ?? []) { if (!byName[t] && !RELS[t]) problems.push(`${r.predicate}: replacement ${t} is neither an entry nor a relationship type`); else if (byName[t] && !["registered", "proposed-new"].includes(byName[t].status)) problems.push(`${r.predicate}: replacement ${t} is ${byName[t].status}`); }
// R-53: no predicate-only name equals a relationship type
for (const r of out) if (r.kind !== "authorizing" && RELS[r.predicate]) problems.push(`${r.predicate}: predicate-only entry equals a relationship type (R-53)`);
for (const c of Object.keys(CLOSEOUT)) if (!byName[c]) problems.push(`CLOSEOUT row ${c} produced no entry`);

const counts = {};
for (const r of out) { const k = r.status.split(":")[0]; counts[k] = (counts[k] ?? 0) + 1; }
const kindCounts = {};
for (const r of out) kindCounts[r.kind] = (kindCounts[r.kind] ?? 0) + 1;
const closeoutCounts = {};
for (const r of out.filter((x) => x.closes)) { const k = `${r.closes} ${r.status.split(":")[0]}`; closeoutCounts[k] = (closeoutCounts[k] ?? 0) + 1; }
const mismatch = out.filter((r) => r.registrarCheck && /names|outside/.test(r.registrarCheck)).map((r) => `${r.predicate}: registrar ${r.registrar}; ${r.registrarCheck}`);

const doc = {
  version: 1,
  registry: "R-52 predicate registry (candidate v2)",
  generatedBy: "final/_work/build-predicates.mjs",
  sdl: { file: "final/schema/final_biotech_schema_v2.graphql", schemaDigest: ir.schemaDigest },
  rules: {
    naming: "SCREAMING_SNAKE, no module prefix (R-52)",
    registrar: "1. K for kernel conventions; 2. the owner of a controlled family (D5 goal/limit/constraint/interaction/harm, D7 manufacturer roles, D9 recommendations); 3. else the owner of the subject type, the existing registrar keeping it when subjects span modules (R-52)",
    authorizing: "an asserted relationship type's authorizing Assertion carries the type name as predicate; that is not a predicate-only entry (R-53)",
    status: "registered | alias-of:<predicate> (re-key, same subject/object) | retired-by:<ruling> (replacedBy + fixtureEdit / patternEdit) | proposed-new (used, not yet accepted by the registrar named; lint warns)",
    types: "subjectTypes / objectTypes are candidate SDL names only; `observed` lists the SDL types the fixtures use",
    executor: "rejects predicates that are not registered (R-52); alias and retired names are re-keyed before ingest",
  },
  counts: { entries: out.length, byStatus: counts, byKind: kindCounts, closeout: closeoutCounts },
  inputs: inputs.sort((a, b) => a.file.localeCompare(b.file)),
  predicates: out,
};
const header = `# Predicate registry (R-52), candidate v2. GENERATED by final/_work/build-predicates.mjs; do not edit by hand.
# Edit a register fragment (final/_work/registers/<M>.relationship.yaml), rulings.yaml or the CLOSEOUT table of the
# script, then re-run:  node ${resolve(here, "build-predicates.mjs").split(sep).join("/")}
# Research only, not medical advice.
`;
const text = header + YAML.stringify(doc, { lineWidth: 0 });
const report = { entries: out.length, byStatus: counts, byKind: kindCounts, closeout: closeoutCounts, registerDrift, problems, registrarRule3Mismatches: mismatch };
if (CHECK) {
  const same = existsSync(OUT) && read(OUT) === text;
  console.log(JSON.stringify({ ...report, upToDate: same }, null, 2));
  process.exit(same && !problems.length ? 0 : 1);
}
writeFileSync(OUT, text);
console.log(JSON.stringify(report, null, 2));
process.exit(problems.length || registerDrift.length ? 1 : 0);

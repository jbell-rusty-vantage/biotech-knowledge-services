# Cross-domain fixture 1: compound profile (nicotinamide riboside) - the walk

This file shows how a question about nicotinamide riboside (NR) travels through the assembled candidate schema `final/schema/final_biotech_schema_v2.graphql`
(IR digest `sha256:d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705`). The path joins D1 identity, D2 mechanism, D3 trials and D6 labels,
and each answer row ends in the provenance trace. The query shapes are the ones in `final/query-patterns.md` (file sha256 `ed6ab40c…`).
Research, not medical advice.

## How it was checked (2026-10-09, all commands in `_runlog/xfx-compound.md`)

1. The fixture (`assertions.yaml` + `locators.yaml`) was type-checked against the final IR, with 0 errors. The check covered every node type, every
   (from, to) triple of every typed edge, every edge-property key and enum value, every required property, and ASSERTED_BY / HAS_SUBJECT / HAS_OBJECT targets.
2. The fixture was loaded into the disposable Neo4j 5.26 (`bks-neo4j-synth`) as 370 nodes and 1,203 relationships, all tagged `fixtureTag: 'xfx-cp'`.
3. Queries run on that graph:
   - the fixture walk W0–W10: 12 statements, each with EXPLAIN and a real run;
   - 14 statements of `final/query-patterns.md`, run unchanged with fixture parameters (P-01b, P-01c, P-02a, P-02b, P-03, P-04b, P-04d, P-04e, P-10a … P-10a.4, P-10b, P-12);
   - the GraphQL form G1–G4, validated with graphql-js against both printed executable schemas (deployed options and L3) and executed through the repo's own
     `createNeo4jGraphQL` over the final SDL. The schema build took 1,335 ms; G1 ran in 245 ms, G2 in 139 ms, G3 in 2,794 ms and G4 in 1,083 ms.
4. The fixture graph was then deleted (`remainingFixtureNodes 0`).

The synth database is shared with another S fixture. The walk statements that enter on a value rather than a uid (W1, W7a, W7d) carry a `fixtureTag` filter
for this run only, marked in the text. Drop it in production.

## The join map

```
                                   (Identifier UNII:0I8H2M0L7N) <-[:HAS_IDENTIFIER]-
 D1  (ChemicalSubstance NR, cation) <-[:HAS_ACTIVE_MOIETY]- (ChemicalSubstance NR chloride) <-[:REALIZES_SUBSTANCE]- (IngredientMaterial NIAGEN)
                                                                                                    ^          ^             ^
 D6  (Product)-[:HAS_VARIANT]->(ProductVariant)-[:HAS_PACKAGE]->(Package)-[:HAS_LABEL_VERSION]->(LabelVersion)-[:DECLARES_COMPONENT]-+          |             |
 D3  (Study)-[:HAS_ARM]->(StudyArm)-[:HAS_COMPONENT]->(InterventionComponent)-[:ADMINISTERS]----------------------------------------+             |
       (StudyResult)-[:RESULT_FOR_ARM]->(StudyArm); (StudyResult)-[:RESULT_FOR]->(OutcomeDefinition); (StudyResult)-[:STATED_IN]->(Publication)     |
 D2  (MechanismEvidenceContext)-[:EXPOSED_TO {TESTED}]-------------------------------------------------------------------------------------------+
       (MechanismEvidenceContext)-[:IN_STUDY_ARM]->(StudyArm)        <- D2 to D3 seam: the dose of record is the arm's InterventionComponent
       (Assertion)-[:OBSERVED_IN_CONTEXT]->(MechanismEvidenceContext); (Assertion)-[:HAS_SUBJECT]->(NR); (Assertion)-[:HAS_OBJECT]->(Mechanism | NAD+ | NAAD)
       (NR)-[:AFFECTS_MECHANISM {derived, score null}]->(Mechanism protein deacetylation)
 D7  (LabelVersion)-[:NAMES_RESPONSIBLE_PARTY]->(Organization ChromaDex, Inc.)<-[:HAS_STUDY_ROLE]-(Study);  (Person)-[:HOLDS_STAKE | HOLDS_ROLE]->(Organization)
 K   every typed asserted edge carries assertionUid -> (Assertion)-[:HAS_EVIDENCE]->(SourceLocator)<-[:HAS_LOCATOR]-(SourceSnapshot)<-[:HAS_SNAPSHOT]-(Source)
     (Adjudication CAPTURE_FIDELITY)-[:ASSESSES]->(Assertion); (Assertion)-[:WAS_GENERATED_BY]->(Activity {missionId, runId})
 D9  (Chunk)-[:CHUNK_OF]->(SourceSnapshot); (Chunk)-[:MENTIONS]->(entity); (Chunk)-[:COVERS_LOCATOR]->(SourceLocator)   (retrieval only, never cited)
```

All three branches meet at one node, `IngredientMaterial NIAGEN`. The label declares NIAGEN, both trials administered NIAGEN, and both mechanism contexts were exposed
to NIAGEN. The D2 assertions take the cation as their subject, which the material reaches through REALIZES_SUBSTANCE → HAS_ACTIVE_MOIETY.

## Which pattern answers which part

| part of the profile | statement | `query-patterns.md` shape | result on the fixture graph |
| --- | --- | --- | --- |
| whole profile in one statement | W0 | (compound-first walk; P-12 hop 0 resolution) | 1 row: 1 label, 4 trial rows, 4 mechanism findings |
| D1 identity | W1 | entry by identifier; TRACE per row (P-01b) | 8 identifier rows for the two substances, all asserted by FDA GSRS |
| D6 label at date V | W2, P-02b | P-02 VALID-AT on HAS_LABEL_VERSION | V12.3 valid from 2025-04-24 (PUBLICATION_PROXY); 300 mg SALT_FORM; 900 / 790.24 mg/d CALCULATED |
| D3 trials and results | W3, P-02a | P-02a (valid window on ADMINISTERS) | NCT02712593 1000 mg/d (+142 % day 14; 95 AEs / 0 serious); NCT02950441 1 g/d |
| D2 mechanism | W4, W4b, P-12 | P-12 hop 0 → hop 1 | 4 findings in 2 contexts; AFFECTS_MECHANISM NO_CHANGE, humanMeasured, compartment UBERON:0001379 |
| interests behind the evidence | W6 | P-09 interest edges (R-89) | ChromaDex: FUNDER, COLLABORATOR, MATERIAL_PROVIDER; Brenner ADVISOR ×2, EQUITY |
| disconfirmation and harm | W7 | — | printed id 404; NAD+ up in blood vs flat in muscle; tablet vs capsule; AEs 95 / 0 serious |
| applicability of the trial to the product | P-03 | P-03 | parent UNKNOWN_MISSING_FACTS; dimensions outcome, duration UNKNOWN; population WITH_ADJUSTMENT; dose (1.11), material APPLIES |
| unstructured to entity (3.8) | P-04b, P-04e, W9 | P-04 | chunk Sec6 → 8 accepted assertions; chunk Par26 → 4 locator-assertion pairs; all `aboutX = false` (they are about the arm component) |
| provenance trace | P-01b, P-04d, W5, G4 | P-01b / P-04d | 5 spans for `a-sr-nad-d14`, each with `expectedSelectedContentDigest`; adjudication DIRECTLY_SUPPORTED / PASS |
| mission lineage | P-10a … P-10a.4, P-10b, W10 | P-10 | 3 runs; per-label created counts; 13 asserted edge types; 3 derived edge types |
| chain audit | P-01c | P-01c | 82 rows: 79 `irreproducible` (no storageUri), 3 `noLocator` (the CALCULATED assertions) |

## W0: the profile in one statement (D1 → D6, D3, D2)

```cypher
MATCH (nr:ChemicalSubstance {uid: 'hu:substance:xfx-cp-sub-nr'})<-[:HAS_ACTIVE_MOIETY]-(salt:ChemicalSubstance)<-[:REALIZES_SUBSTANCE]-(mat:IngredientMaterial)
WITH DISTINCT nr, salt, mat  // REALIZES_SUBSTANCE has one episode per asserter (DSLD and Conze 2019): de-duplicate before fanning out
CALL {
  WITH mat
  OPTIONAL MATCH (prod:Product)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[:HAS_LABEL_VERSION]->(lv:LabelVersion)-[dc:DECLARES_COMPONENT]->(mat)
  RETURN collect(DISTINCT prod.marketedName + ' ' + lv.labelVersionCode + ': ' + toString(dc.amount) + ' ' + dc.unitCode + ' ' + dc.massBasis + ' x max ' + toString(lv.maxDailyServings) + '/day') AS labels
}
CALL {
  WITH mat
  OPTIONAL MATCH (mat)<-[:ADMINISTERS]-(ic:InterventionComponent)<-[:HAS_COMPONENT]-(arm:StudyArm)<-[:HAS_ARM]-(:Study)-[:HAS_IDENTIFIER]->(nct:Identifier {scheme: 'NCT'})
  OPTIONAL MATCH (sr:StudyResult)-[:RESULT_FOR_ARM]->(arm)
  RETURN collect(DISTINCT nct.value + ' ' + arm.armKey + ' ' + toString(ic.quantity) + ' ' + ic.unitCode + '/d' + coalesce(' -> ' + sr.name, '')) AS trials
}
CALL {
  WITH nr
  OPTIONAL MATCH (nr)<-[:HAS_SUBJECT]-(a:Assertion)-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext), (a)-[:HAS_OBJECT]->(o)
  RETURN collect(a.predicate + ' ' + o.name + ' [' + ctx.compartmentLabel + ']') AS mechanism
}
RETURN nr.name AS compound, salt.name AS form, mat.name AS material, labels, trials, mechanism;
```

Result (1 row):

```
compound  "NICOTINAMIDE RIBOSIDE"   form "NICOTINAMIDE RIBOSIDE CHLORIDE"   material "NIAGEN (crystalline nicotinamide riboside chloride)"
labels    ["Tru Niagen 300 mg V12.3: 300 mg SALT_FORM x max 3/day"]
trials    ["NCT02950441 Nicotinamide Riboside 1 g/d",
           "NCT02712593 Niagen™ 1000 1000 mg/d -> Serious adverse events, all arms (ITT): none",
           "NCT02712593 Niagen™ 1000 1000 mg/d -> Adverse events, all arms (ITT): 95 AEs in 61 participants",
           "NCT02712593 Niagen™ 1000 1000 mg/d -> Whole blood NAD+ at day 14, 1000 mg NIAGEN arm, % change from baseline"]
mechanism ["INCREASES_LEVEL_OF NAD(+) [whole blood]", "NO_CHANGE_IN NAD(+) [vastus lateralis muscle biopsy]",
           "INCREASES_LEVEL_OF deamido-NAD(+) (NAAD) [vastus lateralis muscle biopsy]", "NO_CHANGE_IN protein deacetylation [vastus lateralis muscle biopsy]"]
```

Without the `WITH DISTINCT`, the first run returned the row twice. REALIZES_SUBSTANCE has two episodes (NIH ODS and Conze 2019, one per asserter, R-22), and any
traversal through an asserted edge with several asserters multiplies rows. Patterns that fan out after such a hop need DISTINCT.

## D1: identity (W1)

```cypher
MATCH (idn:Identifier {scheme: 'UNII', value: '0I8H2M0L7N'})<-[:HAS_IDENTIFIER]-(nr:ChemicalSubstance)
WHERE idn.fixtureTag = 'xfx-cp'  // harness scope: the synth DB is shared with other fixtures; drop in production
MATCH (salt:ChemicalSubstance)-[:HAS_ACTIVE_MOIETY]->(nr)
MATCH (mat:IngredientMaterial)-[rs:REALIZES_SUBSTANCE]->(salt)
MATCH (ra:Assertion {uid: rs.assertionUid})-[:ASSERTED_BY]->(rwho)
WITH nr, salt, mat, collect(rwho.name) AS realizesAsserters
MATCH (x:ChemicalSubstance)-[hi:HAS_IDENTIFIER]->(i:Identifier) WHERE x IN [nr, salt]
MATCH (ia:Assertion {uid: hi.assertionUid})-[:ASSERTED_BY]->(iwho)
RETURN x.name AS substance, x.molecularWeight AS mw, i.scheme + ':' + i.value AS identifier, iwho.name AS identifierAsserter, mat.name AS material, realizesAsserters
ORDER BY substance, identifier;
```

Result: 8 rows. NR (MW 255.2476) has CAS_RN 1341-23-7, CHEBI:15927, DRUGBANK DB14933, PUBCHEM_CID 439924 and UNII 0I8H2M0L7N. NR chloride (MW 290.7006)
has CAS_RN 23111-00-4, PUBCHEM_CID 90480033 and UNII 8XM2XT8VWI. Every identifier is asserted by FDA GSRS. REALIZES_SUBSTANCE is asserted by Conze 2019 and by NIH ODS.
Without the harness filter, the first run also returned the other S fixture's NR nodes, because both fixtures mint an Identifier for UNII 0I8H2M0L7N.
With the K constraint `identifier_key (scheme, issuer, value)` (R-42), the two would have to be one node, and that one node would join the fixtures.

## D6: the label at a date (W2, P-02b)

```cypher
MATCH (nr:ChemicalSubstance {uid: 'hu:substance:xfx-cp-sub-nr'})<-[:HAS_ACTIVE_MOIETY]-(salt:ChemicalSubstance)<-[:REALIZES_SUBSTANCE]-(mat:IngredientMaterial)
MATCH (lv:LabelVersion)-[dc:DECLARES_COMPONENT]->(mat) WHERE dc.recordedTo IS NULL
MATCH (prod:Product)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(pkg:Package)-[hlv:HAS_LABEL_VERSION]->(lv)
WHERE hlv.recordedTo IS NULL AND (hlv.validFrom IS NULL OR hlv.validFrom <= datetime('2026-10-09T00:00:00Z'))
MATCH (pkg)-[:HAS_IDENTIFIER]->(gtin:Identifier {scheme: 'GTIN'})
OPTIONAL MATCH (cmax:Assertion {predicate: 'PER_MAX_DAILY_DOSE_AMOUNT'})-[:HAS_SUBJECT]->(lv)
OPTIONAL MATCH (cmo:Assertion {predicate: 'MOIETY_EQUIVALENT_AMOUNT'})-[:HAS_SUBJECT]->(lv)
RETURN DISTINCT prod.marketedName AS product, gtin.value AS gtin, lv.labelVersionCode AS label, hlv.validFrom AS labelValidFrom, hlv.validFromBasis AS basis,
       dc.amount AS perServing, dc.unitCode AS unit, dc.massBasis AS massBasis, dc.amountReferent AS referent, lv.maxDailyServings AS maxServings,
       cmax.valueNumber AS maxDailySaltMgPerDay, cmo.valueNumber AS maxDailyCationMgPerDay, cmo.derivationRule AS rule;
```

Result: `"Tru Niagen 300 mg", "00850015311116", "V12.3", 2025-04-24T00:00Z, "PUBLICATION_PROXY", 300, "mg", "SALT_FORM", "AS_NAMED", 3, 900, 790.24, "rule:mw-ratio.v1"`.
P-02b on the package (`$R` = 2026-10-09T23:59:59Z, window [2025-01-01, 2026-10-10)) returns two BITEMPORAL episodes. HAS_LABEL_VERSION runs from 2025-04-24, basis PUBLICATION_PROXY.
HAS_IDENTIFIER (GTIN) has validity UNKNOWN. Each episode carries `assertionUid` and `lastWriterRunId`.

## D3: trials of the same material, their arms and results (W3, P-02a)

```cypher
MATCH (mat:IngredientMaterial {uid: 'hu:material:xfx-cp-mat-niagen'})<-[adm:ADMINISTERS]-(ic:InterventionComponent)<-[:HAS_COMPONENT]-(arm:StudyArm)<-[:HAS_ARM]-(st:Study)
MATCH (st)-[:HAS_IDENTIFIER]->(nct:Identifier {scheme: 'NCT'})
MATCH (aa:Assertion {uid: adm.assertionUid})-[:ASSERTED_BY]->(who)
WITH st, nct, arm, ic, collect(DISTINCT who.name) AS administeredPerAsserters
OPTIONAL MATCH (sr:StudyResult)-[:RESULT_FOR_ARM]->(arm)
OPTIONAL MATCH (sr)-[:RESULT_FOR]->(od:OutcomeDefinition)
RETURN nct.value AS trial, st.overallStatus AS status, arm.armKey AS arm, ic.quantity AS qty, ic.unitCode AS unit, ic.quantityBasis AS per, ic.massBasis AS massBasis,
       ic.durationIso AS duration, administeredPerAsserters, od.outcomeKey AS outcome, od.priority AS priority, sr.resultKind AS kind, sr.comparisonKind AS comparison,
       sr.estimate AS estimate, sr.unitCode AS estUnit, sr.dispersionKind AS dispersion, sr.dispersionValue AS dispersionValue, sr.statisticalConclusion AS conclusion,
       sr.seriousness AS aeSeriousness, sr.eventCount AS events, sr.participantsAffected AS affected
ORDER BY trial, outcome;
```

Result: 4 rows.

| trial | status | arm | dose | massBasis | duration | administered per | outcome | result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NCT02712593 | COMPLETED | Niagen™ 1000 | 1000 mg PER_DAY | UNSPECIFIED (as printed; SALT_FORM by `ap-dose-basis`) | P56D | KGK Science Inc. (registry), Conze 2019 | adverse-events (SAFETY) | ADVERSE_EVENT_COUNT, SERIOUS, 0 |
| NCT02712593 | | | | | | | adverse-events (SAFETY) | ADVERSE_EVENT_COUNT, ANY, 95 events, 61 affected |
| NCT02712593 | | | | | | | whole-blood-nad-change (SECONDARY) | PERCENT_CHANGE, WITHIN_ARM_CHANGE, 142 %, STANDARD_ERROR 14, SIGNIFICANT |
| NCT02950441 | UNKNOWN | Nicotinamide Riboside | 1 g PER_DAY | UNSPECIFIED | P21D | Elhassan 2019 | — | (no D3 result; its findings are D2 mechanism assertions) |

P-02a on `ic-cz-1000` (window [2016-01-01, 2018-01-01)) returns 6 assertions. Two are ADMINISTERS episodes: the paper's runs 2016-03-01 to 2017-03-17 (INFERRED from the study period)
and the registry's starts 2016-03-21 with no end. The other four are recorded-only FIELD and CALCULATED assertions with validity unknown, flagged `validityPartlyUnknown`.

## D2: mechanism, with context and the D3 seam (W4, W4b, P-12)

```cypher
MATCH (nr:ChemicalSubstance {uid: 'hu:substance:xfx-cp-sub-nr'})<-[:HAS_SUBJECT]-(a:Assertion)-[:OBSERVED_IN_CONTEXT]->(ctx:MechanismEvidenceContext)
WHERE a.recordedTo IS NULL AND a.predicate IN ['INCREASES_LEVEL_OF', 'DECREASES_LEVEL_OF', 'NO_CHANGE_IN']
MATCH (a)-[:HAS_OBJECT]->(o)
MATCH (a)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (ctx)-[:EXPOSED_TO {exposureRole: 'TESTED'}]->(x)
OPTIONAL MATCH (ctx)-[:IN_STUDY_ARM]->(arm:StudyArm)<-[:HAS_ARM]-(st:Study)-[:HAS_IDENTIFIER]->(nct:Identifier {scheme: 'NCT'})
OPTIONAL MATCH (arm)-[:HAS_COMPONENT]->(ic:InterventionComponent)
RETURN a.predicate AS predicate, o.name AS object, [l IN labels(o) WHERE l <> 'Entity'][0] AS objectType, ctx.compartmentLabel AS compartment, ctx.setting AS setting,
       x.name AS testedExposure, nct.value AS trial, toString(ic.quantity) + ' ' + ic.unitCode + ' ' + coalesce(ic.quantityBasis, '') AS doseOfRecord, who.name AS asserter, a.qualifiers AS qualifiers
ORDER BY object, compartment;
```

Result: 4 rows.

| predicate | object | compartment | trial | dose of record | asserter | qualifier |
| --- | --- | --- | --- | --- | --- | --- |
| NO_CHANGE_IN | NAD(+) | vastus lateralis muscle biopsy | NCT02950441 | 1 g PER_DAY | Elhassan 2019 | NR 210 vs 197 pmol/mg; p = 0.22 (muscle) |
| INCREASES_LEVEL_OF | NAD(+) | whole blood | NCT02712593 | 1000 mg PER_DAY | Conze 2019 | 142 ± 14 % vs baseline at day 14 |
| INCREASES_LEVEL_OF | deamido-NAD(+) (NAAD) | vastus lateralis muscle biopsy | NCT02950441 | 1 g PER_DAY | Elhassan 2019 | 2-fold vs placebo; p = 0.004 |
| NO_CHANGE_IN | protein deacetylation | vastus lateralis muscle biopsy | NCT02950441 | 1 g PER_DAY | Elhassan 2019 | western blot pan-acetylation (proxy) |

In every row the tested exposure is NIAGEN, the HUMAN_INTERVENTIONAL setting holds, and the asserter is the Publication (R-15).
W4b reads the derived shortcut: `protein deacetylation`, GO:0006476, direction NO_CHANGE, bestBasis DIRECT_MEASUREMENT, setting HUMAN_INTERVENTIONAL, humanMeasured true,
nContexts 1, score null, rule `d2.affects-mechanism/v1`, derived from `m-el-deacetylation`.
P-12 was run unchanged with `startUid` = NIAGEN and `humanOnly` = true. It resolved via `realizes+moiety` to NR → protein deacetylation (NO_CHANGE, contexts
`[{compartment: "UBERON:0001379", organism: HUMAN, setting: HUMAN_INTERVENTIONAL}]`), with `biomarker` null and `tests` `[]`. This fixture has no D4 records.

## Interests behind the evidence (W6, D6 → D7 → D3)

```cypher
MATCH (lv:LabelVersion {uid: 'hu:label-version:xfx-cp-lv-tn-v12-3'})-[:NAMES_RESPONSIBLE_PARTY]->(org:Organization)
MATCH (lv)-[:DECLARES_COMPONENT]->(mat:IngredientMaterial)<-[:ADMINISTERS]-(:InterventionComponent)<-[:HAS_COMPONENT]-(:StudyArm)<-[:HAS_ARM]-(st:Study)
MATCH (st)-[r:HAS_STUDY_ROLE]->(org)
MATCH (st)-[:HAS_IDENTIFIER]->(nct:Identifier {scheme: 'NCT'})
MATCH (ra:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(who)
RETURN DISTINCT 'study role' AS kind, org.name AS org, nct.value AS subject, r.roleKind AS role, who.name AS assertedBy
UNION
MATCH (lv:LabelVersion {uid: 'hu:label-version:xfx-cp-lv-tn-v12-3'})-[:NAMES_RESPONSIBLE_PARTY]->(org:Organization)
MATCH (p:Person)-[r:HOLDS_STAKE|HOLDS_ROLE]->(org)
MATCH (ra:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(who)
RETURN 'interest' AS kind, org.name AS org, p.name AS subject, coalesce(r.stakeKind, r.roleKind) AS role, who.name AS assertedBy;
```

Result: 6 rows. ChromaDex, Inc. is MATERIAL_PROVIDER on NCT02950441 (Elhassan 2019), FUNDER on NCT02712593 (Conze 2019) and COLLABORATOR on NCT02712593 (KGK Science Inc.).
Charles Brenner is ADVISOR (Conze 2019), ADVISOR (Elhassan 2019) and EQUITY (Elhassan 2019). The "ChromaDex" of the papers is bound to the label's "ChromaDex, Inc"
only through `r-chromadex` (SUPPORTED_WITH_QUALIFICATION: the parent/subsidiary question stays open). "C.B." is bound to Charles Brenner only through `r-cb`.

## Disconfirmation and harm (W7)

```cypher
MATCH (pa:Assertion {predicate: 'REGISTRY_ID_AS_PRINTED', fixtureTag: 'xfx-cp'})-[:HAS_SUBJECT]->(pub:Publication)
MATCH (r:Assessment {assessmentKind: 'RESOLUTION'})-[:DERIVED_FROM]->(pa)
MATCH (r)-[e:HAS_EVIDENCE {role: 'CONTRADICTS'}]->(loc:SourceLocator)
RETURN 'a printed id' AS item, pa.valueString AS value, r.verdict AS verdict, loc.exact AS evidence
UNION
MATCH (nr:ChemicalSubstance {uid: 'hu:substance:xfx-cp-sub-nr'})<-[:HAS_SUBJECT]-(a:Assertion)-[:HAS_OBJECT]->(o:ChemicalSubstance {uid: 'hu:substance:xfx-cp-sub-nad'})
MATCH (a)-[:OBSERVED_IN_CONTEXT]->(ctx)
RETURN 'b NAD+ by compartment' AS item, a.predicate AS value, ctx.compartmentLabel AS verdict, a.qualifiers[0] AS evidence
UNION
MATCH (ic:InterventionComponent {uid: 'hu:intervention-component:xfx-cp-ic-el-nr'})<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DOSAGE_FORM'})-[:ASSERTED_BY]->(who)
RETURN 'c dosage form' AS item, a.valueString AS value, who.name AS verdict, a.qualifiers[0] AS evidence
UNION
MATCH (sr:StudyResult {fixtureTag: 'xfx-cp'})-[:RESULT_FOR]->(:OutcomeDefinition {measureKind: 'ADVERSE_EVENT'})
RETURN 'd safety' AS item, sr.seriousness + ': ' + toString(sr.eventCount) AS value, sr.analysisPopulation AS verdict, sr.resultText AS evidence;
```

Result (7 rows):

```
"a printed id",          "NCT0271593",         "SUPPORTED_WITH_QUALIFICATION", "NCT number NCT0271593 not found"
"b NAD+ by compartment", "NO_CHANGE_IN",       "vastus lateralis muscle biopsy", "NR 210 vs 197 pmol/mg; p = 0.22 (muscle)"
"b NAD+ by compartment", "INCREASES_LEVEL_OF", "whole blood",                    "whole blood, 1000 mg arm: 142 ± 14% vs baseline at day 14"
"c dosage form",         "tablet",             "University of Birmingham",       "printed:1000mg (2x250mg tablets twice daily)"
"c dosage form",         "capsule",            "Elhassan 2019",                  "printed:250-mg capsules"
"d safety",              "ANY: 95",            "INTENTION_TO_TREAT",             "Ninety-five AEs were reported by 61 participants"
"d safety",              "SERIOUS: 0",         "INTENTION_TO_TREAT",             "There were no serious AEs or reports of flushing."
```

## Applicability of the trial to the product (P-03, run unchanged)

Parameters: `studyUid` = `study-cz`, `useContextUid` = `var-tn-300` (ProductVariant). The pattern returns 5 rows, weakest first. The parent `ap-label-vs-trial` is
UNKNOWN_MISSING_FACTS with contextOfUse `product-on-sale` and useKind ProductVariant.

| dimension | verdict | ratio | missing |
| --- | --- | --- | --- |
| outcome | UNKNOWN_MISSING_FACTS | — | use-outcome |
| duration | UNKNOWN_MISSING_FACTS | — | use-duration |
| population | APPLIES_WITH_ADJUSTMENT | — | age-range |
| dose | APPLIES | 1.11 (study 1000 / use 900 mg/d NR chloride) | — |
| material | APPLIES | — | lot |

Each dimension row carries its input assertion uids and its located evidence (`exact`). The dose dimension also DERIVES_FROM `ap-dose-basis`,
the D1 judgment that the trial's "mg NR" is salt mass.

## Unstructured to entity, directive 3.8 (P-04b, P-04e, W9)

- **P-04b** (`entityUid` = NR chloride): chunk `chunk-cz-sec6` (Methods › Study product, code points 28532–30482). The MENTIONS edge is licensed by `entity-link/v1` and by RESOLUTION
  `r-mention-nrcl` on the surface form "NR chloride" (l-cz-mention-nrcl). The chunk covers l-cz-capsule and l-cz-arms, which lead to 8 accepted assertions:
  ADMINISTERS ×2, ADMINISTERED_MATERIAL_PURITY, QUANTITY and arm STATED_IN ×4. All have `aboutX = false`, because they describe the intervention component rather than the substance,
  as `query-patterns.md` P-04b notes. `snap.contentHash` is sha256:ae7b5a42….
- **P-04e** (`chunkUid` = `chunk-cz-par26`, Results › Blood NAD+): the span-overlap fallback finds l-cz-day14 and l-cz-significance. They reach `m-cz-nad-blood`
  (INCREASES_LEVEL_OF), `a-sr-nad-d14` (STATED_IN) and `a-od-cz-blood-pub`. The chunk's `textVersionHash` equals the snapshot's contentHash, because the chunker cut raw code points.
- **W9** joins both chunks to their MENTIONS targets (NR chloride and NAD(+)) and returns the same 11 locator-assertion pairs. The chunk is never cited: the citation is the
  SourceLocator plus `SourceSnapshot.contentHash`.

## Provenance trace (P-01b, P-04d, G4)

P-01b with `assertionUid` = `a-sr-nad-d14` returns 5 rows: asserterKind Publication, container null, roles CONTEXT / QUALIFIES / SUPPORTS ×3.

| role | selector | span | quote (start) | snapshot |
| --- | --- | --- | --- | --- |
| SUPPORTS | TEXT_QUOTE | 6140–6331 | "Consumption of 100, 300 and 1000 mg NR dose-dependently and significantly increased whole blood NAD<sup>+</sup> …" | sha256:ae7b5a42… |
| CONTEXT | TEXT_QUOTE | 47977–48235 | "In contrast, daily doses of 300 mg and 1000 mg NIAGEN significantly (p &lt; 0.05) …" | sha256:ae7b5a42… |
| SUPPORTS (estimate), SUPPORTS (dispersionValue) | TEXT_QUOTE | 48667–48867 | "At day 14, the blood NAD<sup>+</sup> levels of the 100 mg, 300 mg and 1000 mg participants were increased by …" | sha256:ae7b5a42… |
| QUALIFIES (dispersionKind) | TEXT_QUOTE | 50059–50107 | "Error bars represent standard error of the mean." | sha256:ae7b5a42… |

Every row returns the CAPTURE_FIDELITY adjudication (DIRECTLY_SUPPORTED, PASS) and the producing run `run:ft-S-xfx-compound-ingest` of mission `mission:ft-S-xfx-fixtures`.
P-04d returns the verifier's re-selection request for the same five edges, each with `selectorJson` (basis `raw-utf8-codepoints@1`), `selectorDigest` and
`expectedSelectedContentDigest`. `storageUri` and `archiveUri` are null, because raw captures are not stored durably in this run.

## Mission lineage (P-10a … P-10a.4, P-10b) and chain audit (P-01c)

- **P-10a:** ingest run `run:ft-S-xfx-compound-ingest` created 79 Assertions, 12 Assessments, 22 Identifiers, 13 Sources, 13 SourceSnapshots, 99 SourceLocators and all
  domain nodes (updatedCount 0 everywhere). Projection run created 3 Assertions and 2 Chunks. Verify run created 82 Adjudications.
- **P-10a.2** (asserted edges authorized by the mission's assertions): ADMINISTERS 3, DECLARES_COMPONENT 1, HAS_ACTIVE_MOIETY 1, HAS_LABEL_VERSION 1, HAS_REGISTRATION_VERSION 2,
  HAS_STUDY_ROLE 5, HOLDS_ROLE 2, HOLDS_STAKE 1, NAMES_RESPONSIBLE_PARTY 1, REALIZES_SUBSTANCE 2, RENDITION_OF 2, REPORTS_ON 2, STATED_IN 16.
  HAS_IDENTIFIER episodes are not counted, because their authorizing Assertion has a literal object, not HAS_OBJECT. See "What the walk found" below. Fix stage (2026-10-09, F-06): P-10a.2 now has a HAS_IDENTIFIER branch, and on this graph it counts the 22 episodes (`_runlog/fix.md` section 6). The fixture's run clocks were also corrected (F-07): ingestion now starts at the first capture, 04:16:57Z, so the walk's created/updated split per run uses those clocks.
- **P-10a.4** (derived edges by `lastWriterRunId`): AFFECTS_MECHANISM 1, MENTIONS 3, COVERS_LOCATOR 5.
- **P-10b** (`uid` = NR): `run:ft-S-xfx-compound-ingest` has roles WROTE and ASSERTED_ABOUT; `run:ft-S-xfx-compound-projection` has role ASSERTED_ABOUT.
- **P-01c** returns 82 rows. 79 are `irreproducible`: no snapshot has a `storageUri`, because the raw captures live in scratch and are not committed.
  3 are `noLocator`: the CALCULATED assertions `c-moiety-trial`, `c-label-max-salt` and `c-label-max-moiety`, which cite DERIVED_FROM inputs by design.

## GraphQL form (G1–G4)

The final SDL declares most joins in one direction only. For example, `IngredientMaterial` has no inverse field for ADMINISTERS or DECLARES_COMPONENT, `ChemicalSubstance` has
no inverse for REALIZES_SUBSTANCE or HAS_ACTIVE_MOIETY, and entities have no inverse for HAS_SUBJECT. So the compound-first walk cannot start at `chemicalSubstances` in GraphQL.
Each GraphQL query starts at the record that owns the edge and filters down to the compound through nested relationship filters. All four documents are valid against both printed
schemas (deployed and L3) and returned data when executed:

```graphql
query G1LabelsDeclaringNR($nr: String!) {
  labelVersions(where: { components: { some: { IngredientMaterial: { substances: { some: { activeMoieties: { some: { uid: { eq: $nr } } } } } } } } }) {
    uid labelVersionCode maxDailyServings responsiblePartyRole responsibleParty { name }
    componentsConnection { edges { properties { amount unitCode massBasis amountBasis amountReferent lineRole assertionUid }
                                   node { ... on IngredientMaterial { name substances { name activeMoieties { name } } } } } }
  }
}
query G2TrialsOfNR($nr: String!) {
  studies(where: { arms: { some: { components: { some: { administers: { some: { IngredientMaterial: { substances: { some: { activeMoieties: { some: { uid: { eq: $nr } } } } } } } } } } } } }) {
    uid overallStatus
    arms { armKey components { materialTextVerbatim quantity unitCode quantityBasis massBasis
                               administersConnection { edges { properties { assertionUid } node { ... on IngredientMaterial { name } } } } } }
    outcomes { outcomeKey priority measureKind timepoint }
  }
  studyResults(where: { arms: { some: { components: { some: { administers: { some: { IngredientMaterial: { substances: { some: { activeMoieties: { some: { uid: { eq: $nr } } } } } } } } } } } } }) {
    name resultKind comparisonKind estimate unitCode dispersionKind dispersionValue statisticalConclusion seriousness eventCount outcome { outcomeKey } arms { armKey }
  }
}
query G3MechanismOfNR($nr: String!) {
  mechanismEvidenceContexts(where: { assertions: { some: { subject: { some: { uid: { eq: $nr } } } } } }) {
    compartmentLabel setting sampleSize
    assertions { predicate qualifiers object { uid name } }
    exposuresConnection { edges { properties { exposureRole } node { ... on IngredientMaterial { name } ... on ChemicalSubstance { name } } } }
    studyArm { armKey }
  }
}
query G4Trace($assertionUid: String!) {
  assertions(where: { uid: { eq: $assertionUid } }) {
    predicate status assertedBy { uid name }
    evidenceConnection { edges { properties { role origin } node { selectorKind exact startOffset endOffset quoteHash snapshot { contentHash retrievedAt source { canonicalUri } } } } }
    adjudications { adjudicationKind verdict policyOutcome }
    generatedBy { missionId runId activityKind }
  }
}
```

Results (variables `nr` = `hu:substance:xfx-cp-sub-nr`, `assertionUid` = `hu:assertion:xfx-cp-a-sr-nad-d14`):

- **G1** returns label V12.3 with line `{amount 300, unitCode mg, massBasis SALT_FORM, amountBasis PER_SERVING, amountReferent AS_NAMED, lineRole DIETARY_INGREDIENT}`.
  The line's node is NIAGEN → NR chloride → NR. The responsible party is ChromaDex, Inc. with role DISTRIBUTED_BY.
- **G2** returns both studies with all arms. The ADMINISTERS edges show two `assertionUid`s on the 1000 mg component (registry and paper) and one on the Elhassan component.
  The studyResults are the day-14 NAD+ result and the two AE results.
- **G3** returns two contexts (vastus lateralis, n 12, 3 assertions; whole blood, 1 assertion). In both, the TESTED exposure is NIAGEN, and each context has its arm.
  The Assertion type has no field for its context, so G3 enters at `mechanismEvidenceContexts`.
- **G4** returns the same 5 evidence edges as P-01b. Each carries role and origin, the exact quote and offsets, and snapshot → source.
  The query also returns the adjudication (CAPTURE_FIDELITY / DIRECTLY_SUPPORTED / PASS) and the run.

The library returns single-cardinality relationship fields (`responsibleParty`, `assertedBy`, `snapshot`, `studyArm`, `object`) as lists. The SDL leaves cardinality to the executor.

## What the walk found (for the owner and the S finalizer)

1. **The cross-domain join works on the final names.** NIAGEN is the one hub where D1, D3, D6 and D2 meet (DECLARES_COMPONENT, ADMINISTERS, EXPOSED_TO). D2 reaches D3 through IN_STUDY_ARM.
   The label reaches D7 interests through NAMES_RESPONSIBLE_PARTY and HAS_STUDY_ROLE.
2. **GraphQL needs target-first queries.** No inverse fields are declared on IngredientMaterial / ChemicalSubstance for these joins, and no entity → Assertion field exists.
   The compound-first walk is therefore Cypher (or the executor). In GraphQL it is several owner-first queries with nested `some` filters, which do execute.
3. **Multi-asserter episodes multiply rows.** REALIZES_SUBSTANCE (2 asserters) and ADMINISTERS (2) duplicate rows unless the query de-duplicates. Patterns that fan out after an asserted hop need `DISTINCT`.
4. **HAS_IDENTIFIER authorizations are invisible to P-10a.2.** Identifier is Entity-only (not Subjectable), so the HAS_IDENTIFIER Assertion has a literal object. P-10a.2 binds `HAS_OBJECT`,
   so it does not count those 22 episodes. Mission lineage should add a branch matching `(s)-[r:HAS_IDENTIFIER]->(:Identifier) WHERE r.assertionUid = a.uid`.
5. **P-01c flags CALCULATED assertions as `noLocator`.** By design they cite DERIVED_FROM inputs, not spans. The audit could exempt `basisKind = 'CALCULATED'` rows that have DERIVED_FROM edges.
6. **There is no field for "one locator per reported number".** `EvidenceEdgeProperties` has `facet` (VALUE | UNIT | IDENTITY | PERIOD_START | PERIOD_END) but no field name. When estimate and dispersion share one
   locator (l-cz-day14), the two HAS_EVIDENCE edges are identical in the graph. The `reportsField` mapping lives only in `assertions.yaml`.
7. **Identifier identity across fixtures.** Two fixtures minted separate Identifier nodes for UNII 0I8H2M0L7N. Under `identifier_key` (R-42) they must merge, and merging them would join this
   compound profile to the product-comparison fixture.

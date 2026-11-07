---
id: "vocab:qualifiers"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/qualifiers.yaml"]
aliases: ["qualifiers","qualifiers"]
capabilities: ["get"]
cardDigest: "sha256:62b3edaebbdde3f9b52424e0e680e8bf1deed4eb63ad15d2e1f98efc4bb66af3"
---
# Vocabulary qualifiers

Release vocabulary `vocabularies/qualifiers.yaml` (sha256 `c56c1c85a65acfc0…`).

| qualifier | grammar | owner | status | description |
| --- | --- | --- | --- | --- |
| `ageBand:` | text | D5 | registered | Age band of an upper limit (<low>-<high> years as printed). |
| `amountBasis=` | code:D13.amount-basis | D13 | registered | Basis of a financing amount (e.g. COMMITTED, AVAILABLE, SOLD). |
| `amountKind=` | code:D13.amount-kind | D13 | registered | Kind of a financing amount (e.g. GROSS_PROCEEDS, BORROWING_CAPACITY). |
| `asserterBasis:` | enum:[PUBLISHER_DEFAULT\|INFERRED] | K | registered | How the asserter of a work that names nobody was set (R-16). |
| `basis:` | enum:MassBasis | D1 | registered | MD-D5-02: mass basis of a stated amount (salt form, active moiety, nutrient equivalent, material as is, unspecified). Never inferred; ambiguous basis is UNSPEC… |
| `buyer=` | uid | D7 | registered | Organization uid of the buyer in a supply statement (SUPPLIES_MATERIAL). |
| `changeHigh:` | number | D12 | registered | Signed percent change, high bound. |
| `changeLow:` | number | D12 | registered | Signed percent change, low bound. |
| `claimClass:` | enum:[STRUCTURE_FUNCTION\|DISEASE_CLAIM\|APPROVED_INDICATION\|PERMITTED_NHP_CLAIM\|NONE_STATED] | D5 | registered | Regulatory class of an intended-use claim (INTENDED_FOR_TARGET). |
| `classificationRule=` | text | D13 | registered | Versioned frontier classification rule id (e.g. frontier-classification/v1). |
| `coExposure:` | uid | D5 | registered | Intervention uid co-administered in the statement (target-effect predicates). |
| `comparator:` | enum:QuantityComparator | D1 | registered | MD-D12-02 / R-57: a comparison OPERATOR from the D1 QuantityComparator enum (GTE, LTE, ...; absent = EQ). Never a uid: a comparator arm is comparatorArm:. |
| `comparatorArm:` | uid | D3 | registered | MD-D12-02: uid of the comparator StudyArm a result or claim is stated against (the PREDIMED / UPF fixtures wrote it as comparator:hu:...). |
| `context:` | enum:[OVERDOSE\|ACCIDENTAL_INGESTION\|THERAPEUTIC] | D5 | registered | Exposure context of an adverse-effect report. OD-29: the accepted enum shape is kept; a source-stated high intake is NOT an overdose and uses intakeContext:. |
| `cycles:` | number | D12 | registered | Number of preparation cycles; `<=N` for 'up to N'. |
| `dataPoints:` | number | D12 | registered | Number of data points behind a composition value. |
| `dataType:` | enum:[FOUNDATION\|SR_LEGACY\|SURVEY\|ANALYTICAL_DB] | D12 | registered | Food composition data type. |
| `declaredName:` | text | D6 | registered | Declared name of a label line as printed (R-30: verbatim wording lives on the line Assertion, not on ComponentLineProperties). |
| `derivation:` | code:<system>:<code> (e.g. FDC:A, FDC:NC) | D12 | registered | Source derivation code of a food composition value. |
| `derivedFrom=` | uid | D13 | registered | Input record a D13 classification statement was derived from. |
| `direction:` | enum:[INCREASE\|DECREASE\|NO_CHANGE] \| text | D12 | registered | Direction of a preparation-driven content change (D12); D4 INTERFERES_WITH uses it for the source-stated bias direction (text). |
| `dose:` | text | D5 | registered | Dose as stated by the source (D5 target, harm and composition statements). |
| `doseContext:` | enum:[ABOVE_DIETARY_EXPOSURE\|AT_DIETARY_EXPOSURE\|NOT_STATED] | D12 | registered | Dose context of a food-constituent harm statement. |
| `duration:` | iso-duration | D12 | registered | ISO 8601 duration (D12 preparation; D5 target-effect statements). |
| `edition=` | text | D13 | registered | Edition of a frontier-classification input as stated. |
| `exclusivity=` | enum:[SOLE\|EXCLUSIVE\|NON_EXCLUSIVE\|UNSTATED] | D7 | registered | Supply or licence exclusivity as stated (SUPPLIES_MATERIAL; D8 licence statements use EXCLUSIVE). |
| `exposureChange:` | enum:[INCREASES_EXPOSURE\|DECREASES_EXPOSURE\|REDUCES_ABSORPTION\|ADDITIVE_EFFECT\|ANTAGONIZES_EFFECT\|UNKNOWN] | D5 | registered | Direction of an interaction, per asserter (never a UseConstraint property). |
| `form:` | text | D6 | registered | Declared form of a label line as printed (R-30). |
| `frequency:` | enum:[PER_DAY\|PER_WEEK] | D12 | registered | Frequency of a dietary-pattern component. |
| `frontierVocabVersion=` | text | D13 | registered | Version of frontiers.yaml a frontier classification used (pin R-60). |
| `intakeContext:` | enum:[HIGH_INTAKE_SOURCE_STATED\|UNSPECIFIED] | D5 | registered | OD-29: source-stated high-intake context ('high doses can cause diarrhea') for reference-source effect statements; UNSPECIFIED when the source gives no structu… |
| `intakeScope:` | enum:IntakeScope | D5 | registered | Whether a limit covers supplemental or total intake. |
| `issueDate:` | iso-date | K | registered | Print issue date of a notice (HAS_REVISION_STATUS flag with no identified notice, R-44). |
| `jurisdiction:` | code:ISO-3166-1-alpha-2 | D5 | registered | Jurisdiction of a constraint, authorized dose range or claim. |
| `jurisdiction=` | code:ISO-3166-1-alpha-2 | D1 | alias-of:jurisdiction: | D1 packet spelling of jurisdiction:. Re-key to jurisdiction:. |
| `legacy:extractedAt=` | iso-datetime (source-stated legacy extraction time, verbatim) | operational (S8 migration) | registered | Legacy extraction time stated by the legacy record; never a v2 observation or valid time. |
| `legacy:recordedFrom=` | iso-datetime (source-stated legacy record time, verbatim) | operational (S8 migration) | registered | Legacy system record time of the migrated element, kept verbatim; v2 recordedFrom is the migration commit time. |
| `legacy:runId=` | text (legacy mongoResearchRunId, verbatim) | operational (S8 migration) | registered | Legacy research run id (mongoResearchRunId) of the migrated element; the v2 lineage is the legacy research Activity (WAS_INFORMED_BY). |
| `limitKind:` | enum:[UL\|MONOGRAPH_MAX\|LABEL_MAX\|PROTOCOL_MAX\|SCHEDULING_THRESHOLD\|LABEL_WARNING_THRESHOLD] | D5 | registered | Kind of upper limit (PROTOCOL_MAX = a protocol author's own ceiling). |
| `manufacturingKind=` | enum:[CONTRACT\|INGREDIENT\|PACKAGING] | D7 | registered | Kind of unnamed manufacturer (MANUFACTURER_UNNAMED). |
| `max:` | number | D12 | registered | Maximum of a composition value. |
| `mechanism:` | text | D5 | registered | Interaction mechanism as stated (e.g. CYP3A4). |
| `milestoneKind=` | key:frontiers | D13 | registered | Frontier milestone id (ms:<slug>) from frontiers.yaml. |
| `min:` | number | D12 | registered | Minimum of a composition value. |
| `outcome:` | uid | D12 | registered | D4 Metric \| D4 Biomarker \| D2 Outcome uid (named text goes to outcomeVerbatim:, KN-15). |
| `outcomeUid:` | uid | D5 | registered | Metric / Biomarker / Outcome / Condition uid the target-effect statement measured (KN-15: entity identity uses outcomeUid). |
| `outcomeVerbatim:` | text | D12 | registered | Outcome as the source names it, when it is not resolved to a uid (KN-15 separate grammar). |
| `population:` | enum:PopulationGroup \| uid | D5 | registered | Population the statement is scoped to: a D5 PopulationGroup code or a D3 StudyPopulation uid. Required qualifier of the D5 target/limit/harm predicates. Source… |
| `populationVerbatim:` | text | D5 | registered | Source wording of the population (free text; never filtered). |
| `portion:` | text | D12 | registered | Portion label, spaces as '_' (medium_serving). |
| `preparationMethod:` | enum:PreparationMethod | D12 | registered | Preparation method; repeat the key for several values. |
| `preparationVerbatim:` | text | D12 | registered | Source wording of a preparation (free text; never filtered). |
| `primary=` | enum:[true] | D13 | registered | Marks the one EVENT_ABOUT Assertion naming the primary subject of an Event. |
| `product=` | uid | D7 | registered | D6 Product uid a contract-manufacturing statement names, when stated (CONTRACT_MANUFACTURES_FOR). |
| `quantity=` | text | D6 | registered | Quantity scope of a listing/offer statement as printed. |
| `range:` | text | D12 | registered | <low>-<high> numeric range as stated. |
| `reason:` | text | D3 | registered | The asserter's stated reasons (D3 REVISES / retraction reasons). Corrupted reason strings are quarantined, never repaired by guess (MD-D11-02). |
| `referent:` | enum:AmountReferent | D6 | registered | MD-D5-02: what a stated amount refers to (as named, as nutrient, extract mass, marker constituent, blend total, not declared). |
| `rendition:` | uid | K | registered | Source uid of the rendition that carried the statement (D9 re-cuts, R-43). |
| `reportingLimit:` | text | D12 | registered | Reporting limit of a measured content value as stated (number + unit). |
| `role:` | enum:[INCLUDES\|EMPHASIZES\|LIMITS\|EXCLUDES] \| text | D12 | registered | Role of a component in a dietary pattern statement (D12); D5 INTERVENTION_INCLUDES role as stated (text). |
| `role=` | enum:EventRole | D13 | registered | Role of an organization or person in an Event (authorizing Assertion of INVOLVES). |
| `roleText:` | text | D7 | registered | Role or funder statement as printed (D3 HAS_STUDY_ROLE / FUNDED_BY, D7 HOLDS_ROLE, D13 INVOLVES). R-30: printed wording stays on the authorizing Assertion. |
| `roleText=` | text | D13 | alias-of:roleText: | D13 spelling of roleText: (INVOLVES / EVENT_ABOUT authorizing Assertions). Re-key to roleText:. |
| `route:` | text | D5 | registered | Route of administration as stated. |
| `scale=` | text | K | registered | Rating scale of a third-party verdict (RATES_CLAIM, R-31); the mapping to the verdict lattice is a versioned D10 query-time rule (OD-19). |
| `schedule:` | text | D5 | registered | Dosing schedule as stated. |
| `section:` | code:D5.label-section (CONTRAINDICATIONS \| WARNINGS \| PRECAUTIONS \| CAUTIONS \| BOXED_WARNING \| PROTOCOL_TEXT \| DRUG_INT… | D5 | registered | Label or protocol section the constraint was stated in (USE_CONSTRAINED_IN). |
| `segment:` | enum:[SPONSOR_READ\|EDITORIAL\|SHOW_NOTES\|CORRECTION_NOTE] | D9 | registered | D9 segment of a media work the assertion was made in (kernel-registered prefix; D9 extends the value list by registry update). |
| `sellerClass=` | code:D6.seller-class | D6 | registered | Seller class of a market tracker aggregate (e.g. THIRD_PARTY_NEW). |
| `severity:` | code:<scheme>:<grade> (scheme CTCAE_V5 \| CTCAE_V6 \| LABEL_TEXT \| SOURCE_TEXT) | D5 | registered | Severity of an adverse effect as <scheme>:<grade>. |
| `sourceKind:` | enum:[LABEL\|TRIAL_ARM\|CASE_REPORT\|SPONTANEOUS_REPORT\|REFERENCE_MONOGRAPH\|PROTOCOL_AUTHOR\|COMMUNITY] | D5 | registered | Kind of source an adverse-effect statement comes from (R-85 adds REFERENCE_MONOGRAPH). |
| `sourceRecordRemovedAt:` | iso-date | K | registered | The source's own record-removal time (R-24); not recorded time. |
| `species:` | uid \| enum:[HUMAN\|LABORATORY_ANIMALS] | D12 | registered | Species of an adverse-effect finding (NCBI taxon uid or HUMAN \| LABORATORY_ANIMALS). |
| `stakeClass:` | text | D7 | registered | Stake class as printed (R-30; StakeEdgeProperties.stakeClassVerbatim retired). |
| `stance:` | enum:[AVOID\|DELIBERATE_USE] | D5 | registered | Whether the interaction statement advises avoidance or deliberate use. |
| `statement:` | text | D6 | registered | Per-component statement as printed (R-30). |
| `target:` | key:targets | D5 | registered | D5 Target key (targets.yaml) a D9 recommendation is aimed at (RECOMMENDS_USE / RECOMMENDS_AGAINST goal, R-83). |
| `temperatureC:` | number | D12 | registered | Preparation temperature in degrees Celsius. |
| `threshold:` | text | D4 | registered | Interference threshold as stated (INTERFERES_WITH). |
| `use:` | text | D5 | registered | Use scope of an authorized dose range as stated. |
| `window:` | iso-duration | D5 | registered | Separation window of an interaction or constraint (e.g. window:PT2H). |

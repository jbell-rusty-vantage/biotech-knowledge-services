---
id: "rule:temporal-rules"
kind: "rule"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:rules/temporal-rules.yaml"]
aliases: ["temporal-rules","temporal rules"]
capabilities: ["get","slice"]
cardDigest: "sha256:ee90908538141e5d9a566c8827097a3ed01ab3eea99e72c367c637708ca60993"
---
# Temporal rules

Authority: `rules/temporal-rules.yaml` of the pinned release. Valid time is the author-declared time a fact holds; recorded time is when BellLabs recorded it (service-assigned). They are never interchanged (TM-06).

## Definitions

| term | definition |
| --- | --- |
| `AS-OF(x, $asOf)` | x.recordedAt <= $asOf AND (x.recordedTo IS NULL OR x.recordedTo > $asOf); current = x.recordedTo IS NULL (records with recordedAt/recordedTo: Assertion, Adjudication, Assessment, Report, Association, DecisionCriterion) |
| `EPISODE-AT(r, $asOf)` | r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf) on an asserted edge |
| `VALID-AT(x, $V)` | (x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V); half-open; a null bound is unknown, never ongoing, and is returned flagged |
| `recorded-only` | edge carries recorded time only (recordedFrom/recordedTo); valid time, when needed, is read from the authorizing Assertion via r.assertionUid |
| `episode` | edge carries valid time (validFrom/validTo with basis/precision) and recorded time |

## Rules

| id | decision | rule |
| --- | --- | --- |
| `TM-01` | OD-05 / KN-05 | Exclusive (non-overlapping) episodes are scoped to (subject, relationship/predicate slot, asserter): same-asserter overlap is rejected; different asserters coexist and cross-source disagreement is preserved. Separately defined global identity constraints are not weakened. K owns CQ-TM-05 and the exclusivity contract; module register rows supply slot policies (exclusive: true). |
| `TM-02` | MD-D8-05 | Each source date is retained with its semantic role and locator (e.g. article-effective date vs annex authorization date); no single event clock is chosen silently. |
| `TM-03` | MD-D11-01 | Provider cache age and fetch metadata are recorded; fetched time is never called observed content time; stale or unknown content clocks remain explicit. |
| `TM-04` | EX-02 | event-clock/v1 deterministically rematerializes accepted event clocks/status after assertion changes; SUPPORT gates causal edges (LEADS_TO / RESPONDS_TO projectionGate); accepted equivalence is required for event merging. |
| `TM-05` | OD-16 | Registry history starts at the first retained observation; older versions are imported only from trustworthy captures; coverage start and unavailable historical intervals are shown, never implied complete. |
| `TM-06` | R-24 | validObservedAt / source record times are the source's own clocks; recordedAt/recordedFrom are BellLabs recording times; the two are never interchanged. |

## Relationship types (106)

| type | temporal | exclusive | exclusivity note |
| --- | --- | --- | --- |
| [ADDRESSED_TO](../relationships/ADDRESSED_TO.md) | recorded-only |  |  |
| [ADMINISTERS](../relationships/ADMINISTERS.md) | recorded-only |  |  |
| [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md) | recorded-only |  |  |
| [APPEARS_IN](../relationships/APPEARS_IN.md) | recorded-only |  |  |
| [ASSERTED_BY](../relationships/ASSERTED_BY.md) | recorded-only |  |  |
| [ASSESSES](../relationships/ASSESSES.md) | recorded-only |  |  |
| [ASSIGNED_TO](../relationships/ASSIGNED_TO.md) | episode |  |  |
| [ASSOCIATES](../relationships/ASSOCIATES.md) | recorded-only |  |  |
| [AWARDED_BY](../relationships/AWARDED_BY.md) | recorded-only |  |  |
| [AWARDED_TO](../relationships/AWARDED_TO.md) | recorded-only |  |  |
| [BLOCKED_BY](../relationships/BLOCKED_BY.md) | recorded-only |  |  |
| [BRANDED_AS](../relationships/BRANDED_AS.md) | episode |  |  |
| [CHUNK_OF](../relationships/CHUNK_OF.md) | recorded-only |  |  |
| [CONCERNS](../relationships/CONCERNS.md) | recorded-only |  |  |
| [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) | episode |  |  |
| [COUNTS_TOWARD_NUTRIENT](../relationships/COUNTS_TOWARD_NUTRIENT.md) | recorded-only |  |  |
| [COVERS](../relationships/COVERS.md) | episode |  |  |
| [COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md) | recorded-only |  |  |
| [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) | recorded-only |  |  |
| [DELIVERS](../relationships/DELIVERS.md) | recorded-only |  |  |
| [DERIVED_FROM](../relationships/DERIVED_FROM.md) | recorded-only |  |  |
| [DERIVED_FROM_ALGORITHM_VERSION](../relationships/DERIVED_FROM_ALGORITHM_VERSION.md) | recorded-only |  |  |
| [DERIVED_FROM_TAXON](../relationships/DERIVED_FROM_TAXON.md) | recorded-only |  |  |
| [DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md) | recorded-only |  |  |
| [EXPOSED_TO](../relationships/EXPOSED_TO.md) | recorded-only |  |  |
| [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) | recorded-only |  |  |
| [HAS_ACTIVE_MOIETY](../relationships/HAS_ACTIVE_MOIETY.md) | recorded-only |  |  |
| [HAS_ANALYTE](../relationships/HAS_ANALYTE.md) | recorded-only |  |  |
| [HAS_ARM](../relationships/HAS_ARM.md) | recorded-only |  |  |
| [HAS_COMPONENT](../relationships/HAS_COMPONENT.md) | recorded-only |  |  |
| [HAS_EDITION](../relationships/HAS_EDITION.md) | episode | yes |  |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | recorded-only |  |  |
| [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) | episode |  |  |
| [HAS_ITEM](../relationships/HAS_ITEM.md) | recorded-only |  |  |
| [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) | episode | yes | R-10 sets exclusive: true (StateEpisodeProperties retired). The packet had declared this type NON-EXCLUSIVE: several open episodes coexist,… |
| [HAS_LOCATOR](../relationships/HAS_LOCATOR.md) | recorded-only |  |  |
| [HAS_OBJECT](../relationships/HAS_OBJECT.md) | recorded-only |  |  |
| [HAS_OFFER](../relationships/HAS_OFFER.md) | recorded-only |  |  |
| [HAS_OUTCOME](../relationships/HAS_OUTCOME.md) | recorded-only |  |  |
| [HAS_PACKAGE](../relationships/HAS_PACKAGE.md) | recorded-only |  |  |
| [HAS_POPULATION](../relationships/HAS_POPULATION.md) | recorded-only |  |  |
| [HAS_REFERENCE_FOOD](../relationships/HAS_REFERENCE_FOOD.md) | episode |  |  |
| [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md) | episode | yes |  |
| [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) | recorded-only |  |  |
| [HAS_STEP](../relationships/HAS_STEP.md) | recorded-only |  |  |
| [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) | episode |  |  |
| [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) | recorded-only |  |  |
| [HAS_VARIANT](../relationships/HAS_VARIANT.md) | recorded-only |  |  |
| [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) | episode |  |  |
| [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) | episode |  |  |
| [INCLUDES_TEST](../relationships/INCLUDES_TEST.md) | episode |  |  |
| [INTERVAL_FOR](../relationships/INTERVAL_FOR.md) | recorded-only |  |  |
| [INVESTIGATES](../relationships/INVESTIGATES.md) | recorded-only |  |  |
| [INVOLVES](../relationships/INVOLVES.md) | recorded-only |  |  |
| [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md) | episode |  |  |
| [IN_STUDY_ARM](../relationships/IN_STUDY_ARM.md) | recorded-only |  |  |
| [ISSUED_BY](../relationships/ISSUED_BY.md) | recorded-only |  |  |
| [LEADS_TO](../relationships/LEADS_TO.md) | recorded-only |  |  |
| [LICENSED_TO](../relationships/LICENSED_TO.md) | episode |  |  |
| [LISTING_FOR](../relationships/LISTING_FOR.md) | episode |  |  |
| [LOT_OF](../relationships/LOT_OF.md) | recorded-only |  |  |
| [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) | episode |  |  |
| [MEASURES](../relationships/MEASURES.md) | recorded-only |  |  |
| [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) | recorded-only |  |  |
| [MEASURES_METRIC](../relationships/MEASURES_METRIC.md) | episode |  |  |
| [MENTIONS](../relationships/MENTIONS.md) | recorded-only |  |  |
| [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md) | recorded-only |  |  |
| [OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md) | recorded-only |  |  |
| [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md) | recorded-only |  |  |
| [OCCURS_IN](../relationships/OCCURS_IN.md) | recorded-only |  |  |
| [ON_FRONTIER](../relationships/ON_FRONTIER.md) | recorded-only |  |  |
| [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) | recorded-only |  |  |
| [OUTPUTS_METRIC](../relationships/OUTPUTS_METRIC.md) | recorded-only |  |  |
| [OWNS_BRAND](../relationships/OWNS_BRAND.md) | episode |  |  |
| [PARENT_OF](../relationships/PARENT_OF.md) | episode |  |  |
| [PARENT_TAXON](../relationships/PARENT_TAXON.md) | episode |  |  |
| [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md) | recorded-only |  |  |
| [PART_OF_MECHANISM](../relationships/PART_OF_MECHANISM.md) | recorded-only |  |  |
| [PATTERN_COMPONENT](../relationships/PATTERN_COMPONENT.md) | recorded-only |  |  |
| [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md) | recorded-only |  |  |
| [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) | episode |  |  |
| [PUBLISHES](../relationships/PUBLISHES.md) | recorded-only |  |  |
| [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) | recorded-only |  |  |
| [QUANTIFIES](../relationships/QUANTIFIES.md) | recorded-only |  |  |
| [REALIZES_SUBSTANCE](../relationships/REALIZES_SUBSTANCE.md) | recorded-only |  |  |
| [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md) | episode |  |  |
| [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md) | recorded-only |  |  |
| [RENDITION_OF](../relationships/RENDITION_OF.md) | recorded-only |  |  |
| [REPORTS_ON](../relationships/REPORTS_ON.md) | recorded-only |  |  |
| [REQUIRES_INPUT_METRIC](../relationships/REQUIRES_INPUT_METRIC.md) | recorded-only |  |  |
| [RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md) | recorded-only |  |  |
| [RESPONDS_TO](../relationships/RESPONDS_TO.md) | recorded-only |  |  |
| [RESULT_FOR](../relationships/RESULT_FOR.md) | recorded-only |  |  |
| [RESULT_FOR_ARM](../relationships/RESULT_FOR_ARM.md) | recorded-only |  |  |
| [REVISES](../relationships/REVISES.md) | recorded-only |  |  |
| [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md) | episode |  |  |
| [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) | episode |  |  |
| [STATED_IN](../relationships/STATED_IN.md) | recorded-only |  |  |
| [STATES_CONSTRAINT](../relationships/STATES_CONSTRAINT.md) | recorded-only (derivedAt) |  |  |
| [STATUS_FROM](../relationships/STATUS_FROM.md) | recorded-only |  |  |
| [STATUS_OF](../relationships/STATUS_OF.md) | episode |  |  |
| [STEP_USES](../relationships/STEP_USES.md) | recorded-only |  |  |
| [USES_CRITERION](../relationships/USES_CRITERION.md) | recorded-only |  |  |
| [WAS_ASSOCIATED_WITH](../relationships/WAS_ASSOCIATED_WITH.md) | recorded-only |  |  |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | recorded-only |  |  |
| [WAS_INFORMED_BY](../relationships/WAS_INFORMED_BY.md) | recorded-only |  |  |

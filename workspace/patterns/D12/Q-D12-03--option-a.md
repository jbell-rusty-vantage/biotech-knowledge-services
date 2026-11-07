---
id: "pattern:D12/Q-D12-03#option-a"
kind: "pattern"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D12/Q-D12-03#option-a"]
aliases: ["d12/q-d12-03#option-a","Q-D12-03"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:31358e4c11b874ab372f388350d5f3cb12f7b9440b1372770c2edf2ad068e8e7"
---
# Pattern D12/Q-D12-03#option-a

| | |
| --- | --- |
| id | `pattern:D12/Q-D12-03#option-a` |
| module | [D12](../../modules/D12.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `Q-D12-03` ([D12 question set](../questions/D12.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:a03be3b75ebeba5040c918236502623bfa80aa8a892cc5ea89be3173183746da` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `assertion_predicate`, `assertion_recorded`, `assertion_recorded_to`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id Q-D12-03#option-a
// @param asOf:datetime
// @param validAt:datetime
// @param prep:string
MATCH (h:Assertion {predicate: 'FORMS_DURING_PREPARATION'})-[:HAS_SUBJECT]->(cmp:ChemicalSubstance)
MATCH (h)-[:HAS_OBJECT]->(food)                                                    // FoodItem | FoodCategory
WHERE h.recordedAt <= $asOf AND (h.recordedTo IS NULL OR h.recordedTo > $asOf)
  AND ($prep IS NULL OR ('preparationMethod:' + $prep) IN h.qualifiers)
CALL (cmp) {
  // lot-identified results (D8, R-73)
  MATCH (qr:QualityResult)-[ma:MEASURES_ANALYTE]->(cmp)
  MATCH (qr)-[rf:QUALITY_RESULT_FOR]->(lot:Lot)-[lo:LOT_OF]->(p)
  WHERE ma.recordedTo IS NULL AND rf.recordedTo IS NULL AND lo.recordedTo IS NULL
  MATCH (rfa:Assertion {uid: rf.assertionUid})
  RETURN p, 'LOT_RESULT' AS basis, qr.value AS value, qr.unitCode AS unit, qr.reportingLimit AS reportingLimit,
         lot.lotCode AS lot, rfa.validFrom AS sampledFrom, rfa.validTo AS sampledTo, rfa.uid AS cites
  UNION
  // survey row with no lot (D1 MEASURED_CONTENT_IN_PRODUCT, R-73 fallback; OD-10 option a)
  MATCH (m:Assertion {predicate: 'MEASURED_CONTENT_IN_PRODUCT'})-[:HAS_OBJECT]->(cmp)
  WHERE m.recordedTo IS NULL AND m.status <> 'REJECTED'
  MATCH (m)-[:HAS_SUBJECT]->(p)
  RETURN p, 'SURVEY_ROW' AS basis, m.valueNumber AS value, m.unitCode AS unit,
         toFloat([q IN m.qualifiers WHERE q STARTS WITH 'reportingLimit:' | trim(substring(q, 15))][0]) AS reportingLimit,
         null AS lot, m.validFrom AS sampledFrom, m.validTo AS sampledTo, m.uid AS cites
}
OPTIONAL MATCH (p)-[hr:HAS_REFERENCE_FOOD]->(fi:FoodItem)
WHERE hr.recordedFrom <= $asOf AND (hr.recordedTo IS NULL OR hr.recordedTo > $asOf)
  AND ($validAt IS NULL OR ((hr.validFrom IS NULL OR hr.validFrom <= $validAt) AND (hr.validTo IS NULL OR hr.validTo > $validAt)))
WITH h, cmp, food, collect(DISTINCT {product: p.uid, productName: p.name, basis: basis, value: value, unit: unit, reportingLimit: reportingLimit,
                                     lot: lot, sampledFrom: sampledFrom, sampledTo: sampledTo, cites: cites, referenceFood: fi.descriptionVerbatim}) AS levels
OPTIONAL MATCH (hz:Assertion {predicate: 'CAUSES_ADVERSE_EFFECT'})-[:HAS_SUBJECT]->(cmp)
WHERE hz.recordedAt <= $asOf AND (hz.recordedTo IS NULL OR hz.recordedTo > $asOf)
OPTIONAL MATCH (hz)-[:HAS_OBJECT]->(effect)
RETURN cmp.name AS compound, [l IN labels(food) WHERE l <> 'Entity'][0] AS formedIn, food.name AS food, h.uid AS formation,
       [q IN h.qualifiers WHERE q STARTS WITH 'preparationMethod:'] AS preparation, levels,
       collect(DISTINCT CASE WHEN hz IS NULL THEN null ELSE {effect: effect.name, qualifiers: hz.qualifiers, assertion: hz.uid} END) AS hazard
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `asOf` | string (DateTime) |  | @param hint |
| `prep` | string |  | @param hint |
| `validAt` | string (DateTime) |  | @param hint |

## Output contract

Columns: `compound`, `formedIn`, `food`, `formation`, `preparation`, `levels`, `hazard`

## Temporal notes

- bitemporal episode needed on: HAS_REFERENCE_FOOD (an episode already); the sampling window is valid time on the authorizing Assertion.

## Evidence and provenance notes

- trace: `cites` is the lot result or the survey Assertion; each cites its FDA table-row or openFDA locator. Under option (a), acr-03's four locators (row, LOQ, restaurants, caveat) move to the `MEASURED_CONTENT_IN_PRODUCT` Assertion unchanged.

## Notes

(none)

## Source

- `release:query-catalog/catalog.json#D12/Q-D12-03#option-a` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D12/Q-D12-03#option-a --json`)

---
id: "pattern:D12/Q-D12-06#option-a"
kind: "pattern"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D12/Q-D12-06#option-a"]
aliases: ["d12/q-d12-06#option-a","Q-D12-06"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:fe07af7a0673898c8bb11f3e8ccf5b607686d94c5ab8f4c3302170a88b62c286"
---
# Pattern D12/Q-D12-06#option-a

| | |
| --- | --- |
| id | `pattern:D12/Q-D12-06#option-a` |
| module | [D12](../../modules/D12.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `Q-D12-06` ([D12 question set](../questions/D12.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:7a63891e07d7e6a5824763ce9f1fef93355f134f5482415fa469e6d33de22c07` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `assertion_predicate`, `uid_ChemicalSubstance`, `uid_exists_ChemicalSubstance`, `uid_type_ChemicalSubstance` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher

// @id Q-D12-06#option-a
// @param asOf:datetime
// @param contaminantUids:strings
// @param contaminants:strings
CALL () {
  MATCH (qr:QualityResult)-[:MEASURES_ANALYTE]->(an)
  WHERE an.uid IN $contaminantUids OR qr.analyteVerbatim IN $contaminants
  MATCH (qr)-[rf:QUALITY_RESULT_FOR]->(lot:Lot)-[lo:LOT_OF]->(p)
  WHERE rf.recordedTo IS NULL AND lo.recordedTo IS NULL
  RETURN p, an, 'LOT_RESULT' AS basis, qr.value AS value, qr.unitCode AS unit, toString(qr.sampleKind) AS sampleKind, lot.lotCode AS lot, qr.uid AS cites
  UNION
  MATCH (m:Assertion {predicate: 'MEASURED_CONTENT_IN_PRODUCT'})-[:HAS_OBJECT]->(an:ChemicalSubstance)
  WHERE an.uid IN $contaminantUids AND m.recordedTo IS NULL AND m.status <> 'REJECTED'
  MATCH (m)-[:HAS_SUBJECT]->(p)
  RETURN p, an, 'SURVEY_ROW' AS basis, m.valueNumber AS value, m.unitCode AS unit, null AS sampleKind, null AS lot, m.uid AS cites
}
WITH p, an, basis, value, unit, sampleKind, lot, cites,
     CASE WHEN p:Product THEN p ELSE COLLECT { MATCH (pv:ProductVariant)<-[:HAS_VARIANT]-(vp:Product) WHERE pv = p RETURN vp }[0] END AS prod   // a ProductVariant row reports under its Product
OPTIONAL MATCH (org:Organization)-[ob:OWNS_BRAND]->(:Brand)<-[ba:BRANDED_AS]-(prod)
WHERE ob.recordedTo IS NULL AND ba.recordedTo IS NULL
OPTIONAL MATCH (prod)-[hr:HAS_REFERENCE_FOOD]->(f:FoodItem)
WHERE hr.recordedFrom <= $asOf AND (hr.recordedTo IS NULL OR hr.recordedTo > $asOf)
OPTIONAL MATCH (lvl:Assertion {predicate: 'HAS_ACTION_LEVEL'})-[:HAS_SUBJECT]->(an) WHERE lvl.recordedTo IS NULL
RETURN p.uid AS product, p.name AS productName, org.name AS brandOwner, f.descriptionVerbatim AS referenceFood, an.name AS contaminant,
       basis, value, unit, sampleKind, lot, cites,
       collect(DISTINCT CASE WHEN lvl IS NULL THEN null ELSE {level: lvl.valueNumber, unit: lvl.unitCode, authorityAndStatus: lvl.qualifiers, assertion: lvl.uid} END) AS referenceLevels
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `asOf` | string (DateTime) |  | @param hint |
| `contaminantUids` | array<string> |  | @param hint |
| `contaminants` | array<string> |  | @param hint |

## Output contract

Columns: `product`, `productName`, `brandOwner`, `referenceFood`, `contaminant`, `basis`, `value`, `unit`, `sampleKind`, `lot`, `cites`, `referenceLevels`

## Temporal notes

- bitemporal episode needed on: HAS_REFERENCE_FOOD (an episode already); the sampling window is valid time on the authorizing Assertion.

## Evidence and provenance notes

- trace: `cites` is the lot result or the survey Assertion; each cites its FDA table-row or openFDA locator. Under option (a), acr-03's four locators (row, LOQ, restaurants, caveat) move to the `MEASURED_CONTENT_IN_PRODUCT` Assertion unchanged.

## Notes

(none)

## Source

- `release:query-catalog/catalog.json#D12/Q-D12-06#option-a` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D12/Q-D12-06#option-a --json`)

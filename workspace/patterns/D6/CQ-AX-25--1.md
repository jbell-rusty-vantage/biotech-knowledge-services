---
id: "pattern:D6/CQ-AX-25#1"
kind: "pattern"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D6/CQ-AX-25#1"]
aliases: ["d6/cq-ax-25#1","CQ-AX-25"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:52660a3abea2ee198c4029e93e62035986f90b4a97ceba708039928b60a41552"
---
# Pattern D6/CQ-AX-25#1

| | |
| --- | --- |
| id | `pattern:D6/CQ-AX-25#1` |
| module | [D6](../../modules/D6.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-AX-25` ([D6 question set](../questions/D6.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:05fdb8919582f0ff16a35a2492f848242190c37813cd3e55189180fc9f8525ef` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `uid_Assertion`, `uid_ChemicalSubstance`, `uid_exists_Assertion`, `uid_exists_ChemicalSubstance`, `uid_type_Assertion`, `uid_type_ChemicalSubstance` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-AX-25#1
MATCH (sub:ChemicalSubstance {uid: $compound})
CALL (sub) {                                                         // line targets that declare C, anchored on C (no label scan)
  MATCH (t:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(sub)
  RETURN t, false AS viaActiveMoiety
  UNION
  MATCH (t:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(:ChemicalSubstance)-[:HAS_ACTIVE_MOIETY]->(sub)   // salt or ester form -> moiety
  WHERE NOT EXISTS { (t)-[:REALIZES_SUBSTANCE]->(sub) }
  RETURN t, true AS viaActiveMoiety
  UNION
  MATCH (sub)-[:COUNTS_TOWARD_NUTRIENT]->(t:Constituent)
  RETURN t, false AS viaActiveMoiety
}
MATCH (lv:LabelVersion)-[c:DECLARES_COMPONENT]->(t)
WHERE c.recordedTo IS NULL
MATCH (p:Product)-[:HAS_VARIANT]->(v:ProductVariant)-[:HAS_PACKAGE]->(pk:Package)-[r:HAS_LABEL_VERSION]->(lv)
WHERE r.recordedTo IS NULL AND (r.validFrom IS NULL OR r.validFrom <= $V) AND (r.validTo IS NULL OR r.validTo > $V)
OPTIONAL MATCH (la:Assertion {uid: c.assertionUid})                 // R-30: printed line name
RETURN DISTINCT p.uid, p.name, v.uid, pk.uid, lv.uid,
       head([q IN coalesce(la.qualifiers, []) WHERE q STARTS WITH 'declaredName:' | trim(substring(q, size('declaredName:')))]) AS declaredNameVerbatim,
       c.amount, c.unitCode, c.amountReferent, c.massBasis, viaActiveMoiety,
       c.lineRole = 'BLEND_MEMBER' AND c.amount IS NULL AS blendOnly, c.assertionUid AS lineAssertion, r.assertionUid AS labelEpisode
ORDER BY blendOnly, p.name
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `V` | string (DateTime) |  | temporal name |
| `compound` | string | `^hu:` | uid lookup |

## Output contract

Columns: `p.uid`, `p.name`, `v.uid`, `pk.uid`, `lv.uid`, `declaredNameVerbatim`, `c.amount`, `c.unitCode`, `c.amountReferent`, `c.massBasis`, `viaActiveMoiety`, `blendOnly`, `lineAssertion`, `labelEpisode`

## Temporal notes

- bitemporal episode needed on: `HAS_LABEL_VERSION`.

## Evidence and provenance notes

- trace: per row, TRACE (CQ-PF-01#2) on `lineAssertion` and `labelEpisode`, and D1's REALIZES_SUBSTANCE / HAS_ACTIVE_MOIETY / COUNTS_TOWARD_NUTRIENT Assertions.

## Notes

- rulings: **R-30** (the declared line name is the line Assertion's `declaredName:` qualifier).
- status: rewritten. The D1 seam edges (REALIZES_SUBSTANCE, HAS_ACTIVE_MOIETY, COUNTS_TOWARD_NUTRIENT) are final-SDL edges as written; never filtered on a stored product→compound shortcut. The three target branches are a scoped UNION anchored on C (the packet form, an unanchored `DECLARES_COMPONENT` scan joined to C, planned a CartesianProduct); `viaActiveMoiety` is now returned by the branch.

## Source

- `release:query-catalog/catalog.json#D6/CQ-AX-25#1` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D6/CQ-AX-25#1 --json`)

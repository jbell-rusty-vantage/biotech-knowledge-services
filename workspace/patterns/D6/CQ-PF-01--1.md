---
id: "pattern:D6/CQ-PF-01#1"
kind: "pattern"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D6/CQ-PF-01#1"]
aliases: ["d6/cq-pf-01#1","CQ-PF-01"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:53cd23ed88b3fa68a0cb546d507d34010dd77d3eba257e5f8e08cc4ef12b6b87"
---
# Pattern D6/CQ-PF-01#1

| | |
| --- | --- |
| id | `pattern:D6/CQ-PF-01#1` |
| module | [D6](../../modules/D6.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-PF-01` ([D1 question set](../questions/D1.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:94e6d4b8af439ebd190dbd1c111e6a105506dfe975c899919625f69ff8327571` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `uid_Assertion`, `uid_LabelVersion`, `uid_exists_Assertion`, `uid_exists_LabelVersion`, `uid_type_Assertion`, `uid_type_LabelVersion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-PF-01#1
MATCH (lv:LabelVersion {uid: $label})-[c:DECLARES_COMPONENT]->(t)
WHERE c.recordedTo IS NULL
OPTIONAL MATCH (la:Assertion {uid: c.assertionUid})                 // R-30: line Assertion (declaredName:, form:; panel-row locator)
OPTIONAL MATCH (calc:Assertion {basisKind: 'CALCULATED'})-[:DERIVED_FROM]->(la)
WHERE calc.recordedTo IS NULL
WITH c, t, la, collect({predicate: calc.predicate, rule: calc.derivationRule, value: calc.valueNumber, unit: calc.unitCode}) AS calculated
RETURN c.orderIndex,
       head([q IN coalesce(la.qualifiers, []) WHERE q STARTS WITH 'declaredName:' | trim(substring(q, size('declaredName:')))]) AS declaredNameVerbatim,
       head([q IN coalesce(la.qualifiers, []) WHERE q STARTS WITH 'form:' | trim(substring(q, size('form:')))]) AS formVerbatim,
       COLLECT { MATCH (la)-[:HAS_EVIDENCE]->(loc:SourceLocator) RETURN loc.exact } AS panelRowText,
       c.amount, c.unitCode, c.amountReferent, c.massBasis, c.amountBasis,
       labels(t)[0] AS targetType, t.uid, c.assertionUid AS lineAssertion, calculated
ORDER BY c.orderIndex
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `label` | string | `^hu:` | uid lookup |

## Output contract

Columns: `c.orderIndex`, `declaredNameVerbatim`, `formVerbatim`, `panelRowText`, `c.amount`, `c.unitCode`, `c.amountReferent`, `c.massBasis`, `c.amountBasis`, `targetType`, `t.uid`, `lineAssertion`, `calculated`

## Temporal notes

(none)

## Evidence and provenance notes

(none)

## Notes

- rulings: **R-30** (`declaredNameVerbatim` and `formVerbatim` leave ComponentLineProperties; read the line Assertion's `declaredName:` and `form:` qualifiers and the panel-row locator).
- status: rewritten. The CALCULATED join is unchanged in meaning: a calculated amount cites the line's own Assertion through `DERIVED_FROM`; it now joins on the bound `la` instead of a second `{uid: c.assertionUid}` lookup. Statement 2 is the kernel TRACE for a line Assertion (or any Assertion uid the D6 patterns return).

## Source

- `release:query-catalog/catalog.json#D6/CQ-PF-01#1` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D6/CQ-PF-01#1 --json`)

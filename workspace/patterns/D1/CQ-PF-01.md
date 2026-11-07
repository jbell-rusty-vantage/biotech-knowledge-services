---
id: "pattern:D1/CQ-PF-01"
kind: "pattern"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D1/CQ-PF-01"]
aliases: ["d1/cq-pf-01","CQ-PF-01"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:6b22ed9233c019871697949f095e6489ff7310c8a6da928031cca81ad2bab6b0"
---
# Pattern D1/CQ-PF-01

| | |
| --- | --- |
| id | `pattern:D1/CQ-PF-01` |
| module | [D1](../../modules/D1.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-PF-01` ([D1 question set](../questions/D1.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:38f8cecd27f5ed30de1420f63f8b8beacf3171cca9fd7ea28a0ecdce8d8c5bdc` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `uid_Assertion`, `uid_LabelVersion`, `uid_exists_Assertion`, `uid_exists_LabelVersion`, `uid_type_Assertion`, `uid_type_LabelVersion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-PF-01
// @param rt:datetime
MATCH (lv:LabelVersion {uid: $labelVersionUid})-[d:DECLARES_COMPONENT]->(target)   // D6 asserted line; target IngredientMaterial|Constituent|FoodItem
WHERE d.recordedFrom <= $rt AND (d.recordedTo IS NULL OR d.recordedTo > $rt)
OPTIONAL MATCH (target:IngredientMaterial)-[rs:REALIZES_SUBSTANCE]->(form:ChemicalSubstance)
WHERE rs.recordedFrom <= $rt AND (rs.recordedTo IS NULL OR rs.recordedTo > $rt)
OPTIONAL MATCH (form)-[hm:HAS_ACTIVE_MOIETY]->(moiety:ChemicalSubstance)
WHERE hm.recordedFrom <= $rt AND (hm.recordedTo IS NULL OR hm.recordedTo > $rt)
OPTIONAL MATCH (form)-[cn:COUNTS_TOWARD_NUTRIENT]->(nut:Constituent)
WHERE cn.recordedFrom <= $rt AND (cn.recordedTo IS NULL OR cn.recordedTo > $rt)
// the line's own Assertion: R-30 verbatim qualifiers, and the projection's DERIVED_FROM input for this line
MATCH (decl:Assertion {uid: d.assertionUid})
OPTIONAL MATCH (calc:Assertion {basisKind: 'CALCULATED'})-[:DERIVED_FROM]->(decl)
WHERE calc.recordedTo IS NULL AND (calc)-[:HAS_SUBJECT]->(lv)
WITH lv, d, target, form, moiety, nut, decl,
     collect(DISTINCT calc {.uid, .predicate, value: calc.valueNumber, unit: calc.unitCode, rule: calc.derivationRule}) AS calculated
CALL (decl, calculated) {
  UNWIND [decl.uid] + [c IN calculated | c.uid] AS tu
  MATCH (ta:Assertion {uid: tu})
  MATCH (ta)-[:DERIVED_FROM*0..4]->(tleaf:Assertion) WHERE tleaf.basisKind IS NULL OR tleaf.basisKind <> 'CALCULATED'
  OPTIONAL MATCH (tleaf)-[tev:HAS_EVIDENCE]->(tloc:SourceLocator)<-[:HAS_LOCATOR]-(tsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tsrc:Source)
  OPTIONAL MATCH (tleaf)-[:ASSERTED_BY]->(twho)
  OPTIONAL MATCH (tadj:Adjudication)-[:ASSESSES]->(tleaf) WHERE tadj.recordedTo IS NULL
  RETURN collect(DISTINCT {assertion: ta.uid, rule: ta.derivationRule, leaf: tleaf.uid, status: tleaf.status, asserter: twho.uid,
                           role: tev.role, selectorKind: tloc.selectorKind, exact: tloc.exact, start: tloc.startOffset, end: tloc.endOffset,
                           page: tloc.page, snapshot: tsnap.uid, contentHash: tsnap.contentHash, retrievedAt: tsnap.retrievedAt,
                           source: tsrc.canonicalUri, adjudicationKind: tadj.adjudicationKind, verdict: tadj.verdict}) AS citations
}
RETURN [q IN decl.qualifiers WHERE q STARTS WITH 'declaredName:' | substring(q, 13)][0] AS declaredAs,   // R-30 (was d.declaredNameVerbatim)
       [q IN decl.qualifiers WHERE q STARTS WITH 'form:' | substring(q, 5)][0] AS formAsPrinted,         // R-30 (was d.formVerbatim)
       [l IN labels(target) WHERE l <> 'Entity'][0] AS targetKind, target.uid AS targetUid, target.name AS targetName,
       d.orderIndex AS orderIndex, d.amount AS amount, d.unitCode AS unitCode, d.amountReferent AS amountReferent,
       d.massBasis AS massBasis, d.amountBasis AS amountBasis, d.lineRole AS lineRole, d.dailyValuePercent AS dailyValuePercent,
       form.name AS form, moiety.name AS moiety, nut.name AS nutrient, decl.uid AS declaration, decl.status AS declarationStatus,
       calculated, citations
ORDER BY orderIndex
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `labelVersionUid` | string | `^hu:` | uid lookup |
| `rt` | string (DateTime) |  | @param hint |

## Output contract

Columns: `declaredAs`, `formAsPrinted`, `targetKind`, `targetUid`, `targetName`, `orderIndex`, `amount`, `unitCode`, `amountReferent`, `massBasis`, `amountBasis`, `lineRole`, `dailyValuePercent`, `form`, `moiety`, `nutrient`, `declaration`, `declarationStatus`, `calculated`, `citations`

## Temporal notes

- bitemporal episode needed on: none in D1. The line is recorded-only inside a LabelVersion that D6 attaches with the `HAS_LABEL_VERSION` state episode.

## Evidence and provenance notes

- trace: `citations` covers the line Assertion (the DSLD JSON_POINTER row, e.g. `/ingredientRows/0/quantity/0`, whose `exact` is the printed name) and each CALCULATED amount through its `DERIVED_FROM` inputs (GSRS `structure.mwt` FIELD Assertions with the record version, HAS_ACTIVE_MOIETY / COUNTS_TOWARD_NUTRIENT Assertions, NUTRIENT_EXPRESSED_AS, MAX_DAILY_SERVINGS).

## Notes

- **Ruling: R-30.** D6 `ComponentLineProperties.declaredNameVerbatim` and `.formVerbatim` are removed. The printed name and form move to the line Assertion's qualifiers `declaredName:` and `form:`, and to the locator's exact text.
- **How the question is answered now:** in full. Nothing is lost.

## Source

- `release:query-catalog/catalog.json#D1/CQ-PF-01` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D1/CQ-PF-01 --json`)

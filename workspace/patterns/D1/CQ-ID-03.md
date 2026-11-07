---
id: "pattern:D1/CQ-ID-03"
kind: "pattern"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D1/CQ-ID-03"]
aliases: ["d1/cq-id-03","CQ-ID-03"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:cda149126686a2b3536aa9f0580a3bb264840cf5491d8c3a1d2a0a38d746974c"
---
# Pattern D1/CQ-ID-03

| | |
| --- | --- |
| id | `pattern:D1/CQ-ID-03` |
| module | [D1](../../modules/D1.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-ID-03` ([D1 question set](../questions/D1.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:8d8c5eadc444d8f792b93a246f6511be793a9c779dd77c31b8d8233fe7528918` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `uid_Assertion`, `uid_LabelVersion`, `uid_exists_Assertion`, `uid_exists_LabelVersion`, `uid_type_Assertion`, `uid_type_LabelVersion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-ID-03
// @param rt:datetime
// @param vt:datetime
MATCH (lv:LabelVersion {uid: $lvUid})-[d:DECLARES_COMPONENT]->(t)
WHERE d.recordedFrom <= $rt AND (d.recordedTo IS NULL OR d.recordedTo > $rt)
MATCH (decl:Assertion {uid: d.assertionUid})                        // R-30: the line's own Assertion holds the verbatim text
OPTIONAL MATCH (t:IngredientMaterial)-[rs:REALIZES_SUBSTANCE]->(s:ChemicalSubstance)
WHERE rs.recordedFrom <= $rt AND (rs.recordedTo IS NULL OR rs.recordedTo > $rt)
OPTIONAL MATCH (t:IngredientMaterial)-[c:MATERIAL_CONTAINS]->(k)
WHERE c.recordedFrom <= $rt AND (c.recordedTo IS NULL OR c.recordedTo > $rt)
  AND (c.validFrom IS NULL OR c.validFrom <= $vt) AND (c.validTo IS NULL OR c.validTo > $vt)
WITH lv, d, t, decl, s, rs,
     collect(DISTINCT CASE WHEN c IS NULL THEN null ELSE
       {target: k.name, targetKind: [l IN labels(k) WHERE l <> 'Entity'][0], kind: c.statementKind, q: c.quantity,
        cmp: c.comparator, unit: c.unitCode, uid: c.assertionUid} END) AS contents
CALL (decl, rs, contents) {
  UNWIND [decl.uid, rs.assertionUid] + [x IN contents | x.uid] AS tu
  WITH tu WHERE tu IS NOT NULL
  MATCH (ta:Assertion {uid: tu})
  OPTIONAL MATCH (ta)-[tev:HAS_EVIDENCE]->(tloc:SourceLocator)<-[:HAS_LOCATOR]-(tsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tsrc:Source)
  OPTIONAL MATCH (ta)-[:ASSERTED_BY]->(twho)
  OPTIONAL MATCH (tadj:Adjudication)-[:ASSESSES]->(ta) WHERE tadj.recordedTo IS NULL
  RETURN collect(DISTINCT {assertion: ta.uid, predicate: ta.predicate, status: ta.status, asserter: twho.uid, role: tev.role,
                           selectorKind: tloc.selectorKind, exact: tloc.exact, snapshot: tsnap.uid, contentHash: tsnap.contentHash,
                           retrievedAt: tsnap.retrievedAt, source: tsrc.canonicalUri,
                           adjudicationKind: tadj.adjudicationKind, verdict: tadj.verdict}) AS citations
}
RETURN [l IN labels(t) WHERE l <> 'Entity'][0] AS declares, t.uid AS declaredUid, t.name AS declaredRecord,
       s.name AS realizes, contents,
       [q IN decl.qualifiers WHERE q STARTS WITH 'declaredName:' | substring(q, 13)][0] AS declaredAs,   // R-30 (was d.declaredNameVerbatim)
       [q IN decl.qualifiers WHERE q STARTS WITH 'form:' | substring(q, 5)][0] AS formAsPrinted,
       d.lineRole AS lineRole, d.assertionUid AS line, rs.assertionUid AS realizesAssertion, citations
ORDER BY d.orderIndex
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `lvUid` | string | `^hu:` | uid lookup |
| `rt` | string (DateTime) |  | @param hint |
| `vt` | string (DateTime) |  | @param hint |

## Output contract

Columns: `declares`, `declaredUid`, `declaredRecord`, `realizes`, `contents`, `declaredAs`, `formAsPrinted`, `lineRole`, `line`, `realizesAssertion`, `citations`

## Temporal notes

- bitemporal episode needed on: MATERIAL_CONTAINS (`ContentEdgeProperties`, already an episode).

## Evidence and provenance notes

- trace: `citations` covers the label line (`d.assertionUid`; DSLD row), `rs.assertionUid` (DSLD form `uniiCode` / GSRS) and each content `uid` (DSLD notes span).

## Notes

- **Ruling: R-30.** `ComponentLineProperties.declaredNameVerbatim` is removed. The declared name is the `declaredName:` qualifier of the line Assertion (`d.assertionUid`) and the exact text of its locator.
- **How the question is answered now:** in full. Nothing is lost.

## Source

- `release:query-catalog/catalog.json#D1/CQ-ID-03` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D1/CQ-ID-03 --json`)

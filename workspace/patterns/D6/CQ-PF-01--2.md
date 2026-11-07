---
id: "pattern:D6/CQ-PF-01#2"
kind: "pattern"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D6/CQ-PF-01#2"]
aliases: ["d6/cq-pf-01#2","CQ-PF-01"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:aa1a476ada4fc5004216b113ed5c25d9ddb641335d9c99bc9a5de6300ea3b201"
---
# Pattern D6/CQ-PF-01#2

| | |
| --- | --- |
| id | `pattern:D6/CQ-PF-01#2` |
| module | [D6](../../modules/D6.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-PF-01` ([D1 question set](../questions/D1.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:51a83d094e4d83cc6788fbfd2bea6c101d1c840a55b40359a28b4fbe3101583f` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-PF-01#2
// TRACE(a) for a line Assertion (or any Assertion uid returned by the D6 patterns): kernel provenance chain, asserter, run, adjudications
MATCH (a:Assertion {uid: $assertion})
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
RETURN a.uid, a.predicate, a.status, a.qualifiers, collect(DISTINCT who.uid) AS asserters,
       collect(DISTINCT {role: ev.role, selector: loc.selectorKind, exact: loc.exact, start: loc.startOffset, end: loc.endOffset, page: loc.page,
                         contentHash: snap.contentHash, retrievedAt: snap.retrievedAt, observedAt: snap.observedAt, source: src.canonicalUri}) AS evidence,
       collect(DISTINCT act.runId) AS runs, collect(DISTINCT adj.uid) AS adjudications
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `assertion` | string | `^hu:` | uid lookup |

## Output contract

Columns: `a.uid`, `a.predicate`, `a.status`, `a.qualifiers`, `asserters`, `evidence`, `runs`, `adjudications`

## Temporal notes

- bitemporal episode needed on: none (lines carry recorded time only; valid time is the label episode).

## Evidence and provenance notes

- trace: statement 2 on `lineAssertion` (panel-row locator) and on the label's HAS_LABEL_VERSION episode Assertion; calculated values cite the line Assertion through kernel `DERIVED_FROM` plus their `derivationRule` (D1's moiety rule traces in D1).

## Notes

- rulings: **R-30** (`declaredNameVerbatim` and `formVerbatim` leave ComponentLineProperties; read the line Assertion's `declaredName:` and `form:` qualifiers and the panel-row locator).
- status: rewritten. The CALCULATED join is unchanged in meaning: a calculated amount cites the line's own Assertion through `DERIVED_FROM`; it now joins on the bound `la` instead of a second `{uid: c.assertionUid}` lookup. Statement 2 is the kernel TRACE for a line Assertion (or any Assertion uid the D6 patterns return).

## Source

- `release:query-catalog/catalog.json#D6/CQ-PF-01#2` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D6/CQ-PF-01#2 --json`)

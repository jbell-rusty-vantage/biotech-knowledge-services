---
id: "pattern:D3/CQ-EV-05#2"
kind: "pattern"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D3/CQ-EV-05#2"]
aliases: ["d3/cq-ev-05#2","CQ-EV-05"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:a0544d9e797bacce7d34f0bed2ff0a2897681396db2387657f9eec8b23a6be27"
---
# Pattern D3/CQ-EV-05#2

| | |
| --- | --- |
| id | `pattern:D3/CQ-EV-05#2` |
| module | [D3](../../modules/D3.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-EV-05` ([D3 question set](../questions/D3.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:46f5259df7126013acdedb4ef9d41b67232b781b41be4303b23ba073bc4df15c` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `uid_Assertion`, `uid_Publication`, `uid_exists_Assertion`, `uid_exists_Publication`, `uid_type_Assertion`, `uid_type_Publication` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher

// @id CQ-EV-05#2
// downstream: assertions, assessments and reports citing a locator on any rendition of p, plus the D3 elements p states
MATCH (p:Publication {uid: $publication})<-[ro:RENDITION_OF]-(src:Source)
      -[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(dep)
WHERE ro.recordedFrom <= $recAt AND (ro.recordedTo IS NULL OR ro.recordedTo > $recAt)
  AND (dep:Assertion OR dep:Assessment OR dep:Report)
OPTIONAL MATCH (up)-[:DERIVED_FROM]->(dep) WHERE up:Assessment OR up:Report
RETURN labels(dep)[0] AS kind, dep.uid AS uid, dep.predicate AS predicate, dep.recordedAt AS recordedAt,
       src.uid AS rendition, collect(DISTINCT up.uid) AS dependants
UNION
MATCH (e)-[st:STATED_IN]->(p:Publication {uid: $publication})
OPTIONAL MATCH (up)-[:DERIVED_FROM]->(:Assertion {uid: st.assertionUid})
RETURN labels(e)[0] AS kind, e.uid AS uid, 'STATED_IN' AS predicate, st.recordedFrom AS recordedAt,
       null AS rendition, collect(DISTINCT up.uid) AS dependants
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `publication` | string | `^hu:` | uid lookup |
| `recAt` | string (DateTime) |  | temporal name |

## Output contract

Columns: `kind`, `uid`, `predicate`, `recordedAt`, `rendition`, `dependants`

## Temporal notes

- bitemporal episode needed on: none (RENDITION_OF and REVISES are recorded-time only).

## Evidence and provenance notes

- trace: each REVISES Assertion carries the notice locator (PubMed `CommentsCorrections RefType="RetractionOf"`; Crossref `updated-by[i]` JSON pointer with `source`). Each HAS_REVISION_STATUS Assertion carries its flag locator (OpenAlex `/is_retracted`). Historical assertions are kept and listed, never deleted. Statement 2 reaches the evidence through the rendition's snapshots and locators and keeps the full set of downstream items, as in the packet: no as-of filter on STATED_IN, `ASOF` on the new RENDITION_OF edge.

## Notes

- rulings: **R-42** (one (scheme, issuer, normalized value) identifies at most one Subjectable; no cross-type joins through a shared Identifier); **R-43** (RENDITION_OF has kernel meaning: Source → Publication, declared on `Publication.renditions`, direction IN, `AssertedRecordedProperties`, asserted with recorded time only); **R-44** (REVISES when the revising work is identified, `revisionKind` ty…
- what changed: the packet reached the status-flag Source (statement 1, branch 2) and the captured renditions (statement 2, branch 1) through `(p:Publication)-[:HAS_IDENTIFIER]->(:Identifier)<-[:HAS_IDENTIFIER]-(src:Source)`. Under R-42 the DOI or PMID Identifier belongs to the Publication only, so that join returns nothing. Both joins now read `(p)<-[ro:RENDITION_OF]-(src:Source)` through `ASOF(ro…
- how the question is answered now: in full; nothing is lost. A status-only flag (OpenAlex `is_retracted`, a PubMed flag) is found only when its Source has a `RENDITION_OF` edge to the Publication. Writers must therefore assert that edge for every scholarly record Source they flag. Fixture coverage of `RENDITION_OF` Source → Publication is still open: FX-10 (K rows) and FU-03 (D9 rows' class).

## Source

- `release:query-catalog/catalog.json#D3/CQ-EV-05#2` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D3/CQ-EV-05#2 --json`)

---
id: "pattern:D3/CQ-EV-05#1"
kind: "pattern"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D3/CQ-EV-05#1"]
aliases: ["d3/cq-ev-05#1","CQ-EV-05"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:bd5c9fe7d9edce2c0c44d11561018c52ed6edf1cc4c5ee64404a88a865ebaf5b"
---
# Pattern D3/CQ-EV-05#1

| | |
| --- | --- |
| id | `pattern:D3/CQ-EV-05#1` |
| module | [D3](../../modules/D3.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-EV-05` ([D3 question set](../questions/D3.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:e0476f0e6033e26f14e111f64cf7ee9d96a6f1f3e98217707a438956c0a6dae9` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `assertion_predicate`, `assertion_recorded`, `assertion_recorded_to`, `uid_Assertion`, `uid_Publication`, `uid_exists_Assertion`, `uid_exists_Publication`, `uid_type_Assertion`, `uid_type_Publication` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-EV-05#1
// revisions of publication p per asserter: identified notices (D3 REVISES) UNION status-only flags (kernel HAS_REVISION_STATUS on a rendition Source)
MATCH (p:Publication {uid: $publication})<-[rv:REVISES]-(n:Publication)
WHERE rv.recordedFrom <= $recAt AND (rv.recordedTo IS NULL OR rv.recordedTo > $recAt)
MATCH (a:Assertion {uid: rv.assertionUid})-[:ASSERTED_BY]->(who)
CALL (a) {
  MATCH (a)-[tev:HAS_EVIDENCE]->(tloc:SourceLocator)<-[:HAS_LOCATOR]-(tsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tsrc:Source)
  WHERE tev.role = 'SUPPORTS'
  OPTIONAL MATCH (a)-[:ASSERTED_BY]->(twho)
  OPTIONAL MATCH (tadj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(a) WHERE tadj.recordedTo IS NULL
  RETURN collect({assertion: a.uid, status: a.status, asserter: twho.uid, selectorKind: tloc.selectorKind,
                  selector: tloc.selectorJson, exact: tloc.exact, start: tloc.startOffset, end: tloc.endOffset,
                  page: tloc.page, snapshot: tsnap.contentHash, retrievedAt: tsnap.retrievedAt,
                  uri: tsrc.canonicalUri, verdict: tadj.verdict}) AS trace
}
RETURN 'REVISES' AS mechanism, n.uid AS notice, n.publicationKind AS publicationKind, n.publishedAt AS publishedAt,
       null AS flaggedSource, who.uid AS asserterUid, who.name AS asserter, rv.revisionKind AS revisionKind,
       [q IN a.qualifiers WHERE q STARTS WITH 'reason:' | substring(q, 7)] AS reasons,
       p.revisionStatus AS cachedRevisionStatus, p.revisionStatusMethodVersion AS cacheMethod, trace
UNION
MATCH (p:Publication {uid: $publication})<-[ro:RENDITION_OF]-(src:Source)
      <-[:HAS_SUBJECT]-(hs:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:ASSERTED_BY]->(who)
WHERE ro.recordedFrom <= $recAt AND (ro.recordedTo IS NULL OR ro.recordedTo > $recAt)
  AND hs.status = 'ACCEPTED' AND hs.recordedAt <= $recAt AND (hs.recordedTo IS NULL OR hs.recordedTo > $recAt)
CALL (hs) {
  MATCH (hs)-[tev:HAS_EVIDENCE]->(tloc:SourceLocator)<-[:HAS_LOCATOR]-(tsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tsrc:Source)
  WHERE tev.role = 'SUPPORTS'
  OPTIONAL MATCH (hs)-[:ASSERTED_BY]->(twho)
  OPTIONAL MATCH (tadj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(hs) WHERE tadj.recordedTo IS NULL
  RETURN collect({assertion: hs.uid, status: hs.status, asserter: twho.uid, selectorKind: tloc.selectorKind,
                  selector: tloc.selectorJson, exact: tloc.exact, start: tloc.startOffset, end: tloc.endOffset,
                  page: tloc.page, snapshot: tsnap.contentHash, retrievedAt: tsnap.retrievedAt,
                  uri: tsrc.canonicalUri, verdict: tadj.verdict}) AS trace
}
RETURN 'HAS_REVISION_STATUS' AS mechanism, null AS notice, null AS publicationKind, null AS publishedAt,
       src.uid AS flaggedSource, who.uid AS asserterUid, who.name AS asserter, hs.valueString AS revisionKind,
       [q IN hs.qualifiers WHERE q STARTS WITH 'reason:' | substring(q, 7)] AS reasons,
       p.revisionStatus AS cachedRevisionStatus, p.revisionStatusMethodVersion AS cacheMethod, trace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `publication` | string | `^hu:` | uid lookup |
| `recAt` | string (DateTime) |  | temporal name |

## Output contract

Columns: `mechanism`, `notice`, `publicationKind`, `publishedAt`, `flaggedSource`, `asserterUid`, `asserter`, `revisionKind`, `reasons`, `cachedRevisionStatus`, `cacheMethod`, `trace`

## Temporal notes

- bitemporal episode needed on: none (RENDITION_OF and REVISES are recorded-time only).

## Evidence and provenance notes

- trace: each REVISES Assertion carries the notice locator (PubMed `CommentsCorrections RefType="RetractionOf"`; Crossref `updated-by[i]` JSON pointer with `source`). Each HAS_REVISION_STATUS Assertion carries its flag locator (OpenAlex `/is_retracted`). Historical assertions are kept and listed, never deleted. Statement 2 reaches the evidence through the rendition's snapshots and locators and keeps the full set of downstream items, as in the packet: no as-of filter on STATED_IN, `ASOF` on the new RENDITION_OF edge.

## Notes

- rulings: **R-42** (one (scheme, issuer, normalized value) identifies at most one Subjectable; no cross-type joins through a shared Identifier); **R-43** (RENDITION_OF has kernel meaning: Source → Publication, declared on `Publication.renditions`, direction IN, `AssertedRecordedProperties`, asserted with recorded time only); **R-44** (REVISES when the revising work is identified, `revisionKind` ty…
- what changed: the packet reached the status-flag Source (statement 1, branch 2) and the captured renditions (statement 2, branch 1) through `(p:Publication)-[:HAS_IDENTIFIER]->(:Identifier)<-[:HAS_IDENTIFIER]-(src:Source)`. Under R-42 the DOI or PMID Identifier belongs to the Publication only, so that join returns nothing. Both joins now read `(p)<-[ro:RENDITION_OF]-(src:Source)` through `ASOF(ro…
- how the question is answered now: in full; nothing is lost. A status-only flag (OpenAlex `is_retracted`, a PubMed flag) is found only when its Source has a `RENDITION_OF` edge to the Publication. Writers must therefore assert that edge for every scholarly record Source they flag. Fixture coverage of `RENDITION_OF` Source → Publication is still open: FX-10 (K rows) and FU-03 (D9 rows' class).

## Source

- `release:query-catalog/catalog.json#D3/CQ-EV-05#1` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D3/CQ-EV-05#1 --json`)

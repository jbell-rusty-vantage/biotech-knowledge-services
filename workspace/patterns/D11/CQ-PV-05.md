---
id: "pattern:D11/CQ-PV-05"
kind: "pattern"
module: "D11"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D11/CQ-PV-05"]
aliases: ["d11/cq-pv-05","CQ-PV-05"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:fb439418b803ed64cbedb79d1b96f30e34b18374beaf207b44ccd5942e9fd01b"
---
# Pattern D11/CQ-PV-05

| | |
| --- | --- |
| id | `pattern:D11/CQ-PV-05` |
| module | [D11](../../modules/D11.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-PV-05` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:dace9c5dd431e7f896edb08f4c3d1baeadc77a9f17fec17cbf4153d33c1d86fb` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `assertion_predicate`, `identifier_key`, `identifier_scheme_value` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-PV-05
// the holder of the record identifier (R-42: one holder per (scheme, issuer, value); several issuers give several holders)
MATCH (holder)-[hl:HAS_IDENTIFIER]->(:Identifier {scheme: $scheme, value: $value})
WHERE hl.recordedTo IS NULL
CALL (holder) {
  // R-43: the typed rendition grouping (Publication or MediaWork)
  MATCH (src:Source)-[ro:RENDITION_OF]->(holder) WHERE ro.recordedTo IS NULL
  RETURN src, 'RENDITION_OF' AS grouping
  UNION
  // no typed grouping for registry records (Study) and drug labels (LabelVersion): the Sources that evidence current assertions about the holder
  MATCH (holder)<-[:HAS_SUBJECT]-(ha:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  WHERE ha.recordedTo IS NULL
  RETURN src, 'EVIDENCE_OF_ASSERTIONS' AS grouping
  UNION
  // an endpoint identifier held by a Source itself
  MATCH (src:Source) WHERE src = holder
  RETURN src, 'IDENTIFIER_HOLDER' AS grouping
}
WITH holder, src, collect(DISTINCT grouping) AS groupings
MATCH (src)-[:HAS_SNAPSHOT]->(snap:SourceSnapshot)
OPTIONAL MATCH (fresh:Assertion {predicate: 'RECORD_LAST_UPDATED'})-[:HAS_SUBJECT]->(src) WHERE fresh.recordedTo IS NULL
WITH holder, src, groupings, max(snap.retrievedAt) AS lastRetrieved, max(fresh.valueString) AS lastUpdatedPerSource,
     collect(DISTINCT fresh.uid) AS freshnessRecords,
     [m IN collect(DISTINCT snap.captureMethod) WHERE m IS NOT NULL | split(m, '/')[0]] AS toolIds
RETURN [l IN labels(holder) WHERE l <> 'Entity'][0] AS recordKind, holder.uid AS record, src.canonicalUri AS rendition, src.genre AS genre,
       groupings, toolIds, lastRetrieved, lastUpdatedPerSource, freshnessRecords
ORDER BY record, lastUpdatedPerSource DESC
// client side: JOIN toolIds -> CONFIG registry (primary vs aggregator); lag = primary.lastUpdated - aggregator.lastUpdated
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `scheme` | string |  | default |
| `value` | string |  | default |

## Output contract

Columns: `recordKind`, `record`, `rendition`, `genre`, `groupings`, `toolIds`, `lastRetrieved`, `lastUpdatedPerSource`, `freshnessRecords`

## Temporal notes

- bitemporal episode needed on: kernel `HAS_IDENTIFIER` (an episode already; a rendition endpoint can be re-pointed) and `RENDITION_OF` (recorded time only).

## Evidence and provenance notes

- trace: TRACE of each `RECORD_LAST_UPDATED` Assertion (`freshnessRecords`; FC-8: ICTRP HTML `span#DataList3_ctl01_Last_updatedLabel` "12 December 2016" vs CT.gov `/protocolSection/statusModule/lastUpdatePostDateStruct`; FC-3: openFDA flattens the SPL boxed-warning section and loses its id), and of the assertions that put each Source in the `EVIDENCE_OF_ASSERTIONS` group.

## Notes

- **Rulings: R-42, R-43.** The packet found the renditions of one record as "two Sources that share an identifier (NCT, SPL_SET_ID, DOI)". Under R-42 one (scheme, issuer, value) identifies at most one Subjectable, so two Sources can no longer hold the same Identifier node. Its holder is the record itself: a D3 Publication for a DOI, a D3 Study for an NCT, a D6 LabelVersion for an SPL_SET_ID. R-43 g…
- **How the question is answered now:** in full for scholarly records. For registry records and drug labels it is answered through the evidence grouping. That grouping finds a rendition only after some assertion about the record cites it, so a captured copy that nothing cites yet is not listed. A typed rendition grouping for drug labels and registry records needs an owner or K ruling, and the SDL i…

## Source

- `release:query-catalog/catalog.json#D11/CQ-PV-05` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D11/CQ-PV-05 --json`)

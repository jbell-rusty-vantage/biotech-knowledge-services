---
id: "pattern:D9/CQ-PV-05"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-PV-05"]
aliases: ["d9/cq-pv-05","CQ-PV-05"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:0694b695b586840f4232cff95260cf52ca5e2066595d50342d8d6867da96990f"
---
# Pattern D9/CQ-PV-05

| | |
| --- | --- |
| id | `pattern:D9/CQ-PV-05` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-PV-05` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:bc9d6a5fe98c576ea3ea70c96c06628115bbdc26065a4792db9394df7e07637b` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-PV-05
MATCH path = (o:Assertion {uid: $occUid, assertionKind: 'CLAIM'})-[:DERIVED_FROM*0..4]->(root:Assertion)
WHERE NOT (root)-[:DERIVED_FROM]->(:Assertion)
WITH o, root, length(path) AS hops
OPTIONAL MATCH (root)-[:OCCURS_IN]->(rw:MediaWork)
OPTIONAL MATCH (rw)<-[:PUBLISHES]-(rch:Channel)
RETURN CASE hops WHEN 0 THEN 'PRIMARY' ELSE 'RETELLING' END AS position, hops, o.basisKind, root.uid AS root, root.basisKind AS rootBasis,
       rw.uid AS rootContainer, rw.workKind, rch.channelKind, COLLECT { MATCH (root)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(root) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS rootTrace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `occUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `position`, `hops`, `o.basisKind`, `root`, `rootBasis`, `rootContainer`, `rw.workKind`, `rch.channelKind`, `rootTrace`

## Temporal notes

- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: the root's TRACE (FC-4: Attia → RAPA-EX-01 results span; FC-8: Topol → Nature DOI).

## Notes

- **Ruling: F-05** (label), **R-21** (the retelling chain is the kernel `DERIVED_FROM`, basisKind CITED_FROM_PRIOR_WORK), **R-43** (source family: the OCCURS_IN work, else the RENDITION_OF work, else the Source). The root's container and channel kind tell an aggregator; TRACE gives the root's source genre.

## Source

- `release:query-catalog/catalog.json#D9/CQ-PV-05` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-PV-05 --json`)

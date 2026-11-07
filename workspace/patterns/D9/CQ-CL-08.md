---
id: "pattern:D9/CQ-CL-08"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CL-08"]
aliases: ["d9/cq-cl-08","CQ-CL-08"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:22b2c7e3f8e8bbcfdc1ea5c10c46992d3db5c647b9a6e5f29e69c791f4232de6"
---
# Pattern D9/CQ-CL-08

| | |
| --- | --- |
| id | `pattern:D9/CQ-CL-08` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-08` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:762dac1996e5b03354048eb9cc61965a561c77666c16c9846064bad81dc75599` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CL-08
MATCH (o:Assertion {uid: $occUid, assertionKind: 'CLAIM'})-[:OCCURS_IN]->(w:MediaWork)
OPTIONAL MATCH (o)-[:ASSERTED_BY]->(reader)
OPTIONAL MATCH (w)<-[ap:APPEARS_IN]-(host:Person) WHERE ap.appearanceRole IN ['HOST', 'READER'] AND ap.recordedTo IS NULL
OPTIONAL MATCH (w)-[sp:CONTENT_SPONSORED_BY]->(sponsor) WHERE sp.recordedTo IS NULL
OPTIONAL MATCH (spa:Assertion {uid: sp.assertionUid})-[:HAS_EVIDENCE]->(sloc:SourceLocator)<-[:HAS_EVIDENCE]-(o)
RETURN 'segment:SPONSOR_READ' IN coalesce(o.qualifiers, []) AS sponsorRead, reader.name AS reader, host.name AS host, ap.appearanceRole,
       sponsor.name AS sponsor, sp.validFrom, sp.validTo, sloc IS NOT NULL AS sameSpan, COLLECT { MATCH (o)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(o) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS trace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `occUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `sponsorRead`, `reader`, `host`, `ap.appearanceRole`, `sponsor`, `sp.validFrom`, `sp.validTo`, `sameSpan`, `trace`

## Temporal notes

- bitemporal episode needed on: **CONTENT_SPONSORED_BY** (the read belongs to a rendition window).

## Evidence and provenance notes

- trace: TRACE(o) gives the rendition and observation time; the sponsor episode gives the observed window.

## Notes

- **Ruling: F-05.** Label replaced. The segment stays the qualifier `segment:SPONSOR_READ`; the final `Assertion.qualifiers` docstring registers the `segment:<KIND>` prefix (K-5 interim kept, no `segmentKind` field). Current APPEARS_IN and CONTENT_SPONSORED_BY episodes only.

## Source

- `release:query-catalog/catalog.json#D9/CQ-CL-08` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CL-08 --json`)

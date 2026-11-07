---
id: "pattern:D9/CQ-CM-04"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CM-04"]
aliases: ["d9/cq-cm-04","CQ-CM-04"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:e75b1b984e9df1eaf6e8a7917b828f4b8a3a47b539ad7b5228a402bdc03da99b"
---
# Pattern D9/CQ-CM-04

| | |
| --- | --- |
| id | `pattern:D9/CQ-CM-04` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CM-04` ([D6 question set](../questions/D6.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:22096181328911eb43b7caf5fbb90100d0c33b6c64c3340f673c24a2cb411cfa` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `assertion_predicate`, `assertion_speech_act`, `uid_MediaWork`, `uid_exists_MediaWork`, `uid_type_MediaWork` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CM-04
MATCH (w:MediaWork {uid: $workUid})<-[:HAS_SUBJECT]-(l:Assertion {predicate: 'LINKS_TO_OFFER'})-[:HAS_OBJECT]->(offer)
WHERE l.recordedTo IS NULL AND (offer:Offer OR offer:MerchantListing)
OPTIONAL MATCH (w)<-[:OCCURS_IN]-(o:Assertion {assertionKind: 'CLAIM', speechAct: 'RECOMMENDS'})-[:HAS_SUBJECT]->(item)
  WHERE o.recordedTo IS NULL
RETURN offer.uid AS offer, l.qualifiers, l.validFrom, o.uid AS recommendation, o.predicate, item.name AS item,
       EXISTS { MATCH (item)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)<-[:LISTING_FOR]-(ml:MerchantListing)
                WHERE ml = offer OR (ml)-[:HAS_OFFER]->(offer) } AS aboutLinkedProduct,
       COLLECT { MATCH (l)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(l) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS linkTrace, COLLECT { MATCH (o)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(o) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} } AS recommendationTrace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `workUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `offer`, `l.qualifiers`, `l.validFrom`, `recommendation`, `o.predicate`, `item`, `aboutLinkedProduct`, `linkTrace`, `recommendationTrace`

## Temporal notes

- bitemporal episode needed on: none in D9 (the Assertion carries its own valid time).

## Evidence and provenance notes

- trace: the link assertion's locator on the show-notes rendition (FC-3 quote 4 "insidetracker.com/sinclair") and the recommendation's TRACE.

## Notes

- **Ruling: F-05** (label). LINKS_TO_OFFER is registered (D9, subject MediaWork, object Offer | MerchantListing). The packet promised the join "about the offer's product" but did not write it; the rewrite adds it as a flag through the D6 chain `Product -HAS_VARIANT-> ProductVariant -HAS_PACKAGE-> Package <-LISTING_FOR- MerchantListing (-HAS_OFFER-> Offer)`.

## Source

- `release:query-catalog/catalog.json#D9/CQ-CM-04` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CM-04 --json`)

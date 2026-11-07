---
id: "pattern:D9/CQ-CL-07"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CL-07"]
aliases: ["d9/cq-cl-07","CQ-CL-07"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:c14f456ba7cfb48a96f11721c7ec97166de56ef1f41b8b0c01e04004a4ee6cc2"
---
# Pattern D9/CQ-CL-07

| | |
| --- | --- |
| id | `pattern:D9/CQ-CL-07` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-07` ([D7 question set](../questions/D7.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:65b7872a66acccb5cd58169372871eef5f0972f995d6bfde20d46a4a92128dae` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `assessment_kind`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CL-07
MATCH (acct:Channel {channelKind: 'ACCOUNT'})<-[:ASSERTED_BY]-(o:Assertion {uid: $occUid, assertionKind: 'CLAIM'})
OPTIONAL MATCH (h:Assessment {assessmentKind: 'RESOLUTION'})-[:ASSESSES]->(acct)
  WHERE h.recordedTo IS NULL
OPTIONAL MATCH (h)-[:ASSESSES]->(cand:Person)
RETURN acct.uid AS account, acct.handle, acct.platform, acct.homeUrl, acct.isPseudonymous,
       h.uid AS hypothesis, h.status, h.score, h.verdict, h.methodVersion, cand.uid AS candidate, cand.name,
       COLLECT { MATCH (h)-[hev:HAS_EVIDENCE]->(hloc:SourceLocator) RETURN {role: hev.role, exact: hloc.exact} } AS hypothesisEvidence,
       COLLECT { MATCH (o)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
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

Columns: `account`, `acct.handle`, `acct.platform`, `acct.homeUrl`, `acct.isPseudonymous`, `hypothesis`, `h.status`, `h.score`, `h.verdict`, `h.methodVersion`, `candidate`, `cand.name`, `hypothesisEvidence`, `trace`

## Temporal notes

- bitemporal episode needed on: none (an OPERATED_BY Assertion is written only once a source asserts an operator).

## Evidence and provenance notes

- trace: the occurrence's TRACE (handle and profile from the forum snapshot); hypotheses cite their own evidence locators.

## Notes

- **Ruling: F-05.** Label replaced. ASSERTED_BY → D9 Channel ACCOUNT is in the final SDL (`Assertion>Channel`), and RESOLUTION Assessments `ASSESS` both the Channel and the Person; nothing else changed. Only current hypotheses are returned (`h.recordedTo IS NULL`). MD-D7-01 (does a person's track record include resolved accounts?) stays open.

## Source

- `release:query-catalog/catalog.json#D9/CQ-CL-07` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CL-07 --json`)

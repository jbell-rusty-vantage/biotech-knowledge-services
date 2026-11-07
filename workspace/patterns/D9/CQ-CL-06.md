---
id: "pattern:D9/CQ-CL-06"
kind: "pattern"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D9/CQ-CL-06"]
aliases: ["d9/cq-cl-06","CQ-CL-06"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:0da01340e948f8b240e43ad636f51d50794c2b935211bb2cb358871880705330"
---
# Pattern D9/CQ-CL-06

| | |
| --- | --- |
| id | `pattern:D9/CQ-CL-06` |
| module | [D9](../../modules/D9.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-06` ([D9 question set](../questions/D9.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:dd2c357ba8892d4388e8c448626eadfb2a04257f07f6232a81395863fc1d4eb0` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `adjudication_kind`, `assessment_kind`, `uid_Claim`, `uid_exists_Claim`, `uid_type_Claim` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-CL-06
MATCH (c:Claim {uid: $claimUid})<-[:OCCURRENCE_OF]-(o:Assertion {assertionKind: 'CLAIM'})-[:OCCURS_IN]->(w:MediaWork)
WHERE o.recordedTo IS NULL
MATCH (o)-[:ASSERTED_BY]->(a)
WITH c, o, w, a,
     EXISTS { (o)-[:DERIVED_FROM]->(:Assertion) } AS explicitRetelling,                       // R-21
     EXISTS { MATCH (fa:Assessment {assessmentKind: 'RETELLING_FIDELITY'})-[:DERIVED_FROM]->(o)
              WHERE fa.recordedTo IS NULL AND ('retelling=' + o.uid) IN coalesce(fa.facets, []) } AS matchedRetelling,   // R-20
     w.republicationKind IS NOT NULL AS recut
WITH c, o, w, a, explicitRetelling, matchedRetelling, recut, NOT (explicitRetelling OR matchedRetelling OR recut) AS firstHand
RETURN c.uid AS claim, c.proposition,
       count(DISTINCT CASE WHEN firstHand THEN a END) AS independentAsserters,
       count(DISTINCT CASE WHEN firstHand THEN o END) AS firstHandOccurrences,
       count(DISTINCT CASE WHEN explicitRetelling OR matchedRetelling THEN o END) AS retellings,
       count(DISTINCT CASE WHEN recut THEN o END) AS recuts,
       min(w.publishedAt) AS firstOccurrenceAt,
       c.discourseIndependentCount AS cachedIndependent, c.discourseFirstHandCount AS cachedFirstHand,
       c.discourseMethodVersion AS cachedMethod, c.discourseDerivedAt AS cachedAt,
       collect(DISTINCT CASE WHEN firstHand THEN {occurrence: o.uid, asserter: a.uid, trace: COLLECT { MATCH (o)-[tEv:HAS_EVIDENCE]->(tLoc:SourceLocator)<-[:HAS_LOCATOR]-(tSnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tSrc:Source)
      WHERE tEv.role IN ['SUPPORTS', 'QUALIFIES']
      OPTIONAL MATCH (tSrc)-[:RENDITION_OF]->(tRw:MediaWork)
      RETURN {role: tEv.role, selectorKind: tLoc.selectorKind, exact: tLoc.exact, startOffset: tLoc.startOffset, endOffset: tLoc.endOffset,
              mediaStartSeconds: tLoc.mediaStartSeconds, mediaEndSeconds: tLoc.mediaEndSeconds, speakerLabel: tLoc.speakerLabelInSource,
              contentHash: tSnap.contentHash, retrievedAt: tSnap.retrievedAt, captureCompleteness: tSnap.captureCompleteness,
              uri: tSrc.canonicalUri, genre: tSrc.genre, renditionOfWork: tRw.uid,
              captureFidelity: COLLECT { MATCH (tAdj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(o) WHERE tAdj.recordedTo IS NULL
                                         RETURN tAdj {.uid, .verdict, .policyOutcome} }} }} END)[..25] AS firstHandTrace
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `claimUid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `claim`, `c.proposition`, `independentAsserters`, `firstHandOccurrences`, `retellings`, `recuts`, `firstOccurrenceAt`, `cachedIndependent`, `cachedFirstHand`, `cachedMethod`, `cachedAt`, `firstHandTrace`

## Temporal notes

- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: `firstHandTrace` (up to 25 counted occurrences with their TRACE); the full input set is the occurrence list of the projection run.

## Notes

- **Ruling: F-05** (label). **R-21**: an explicit retelling is the kernel edge `DERIVED_FROM` (basisKind CITED_FROM_PRIOR_WORK); the `derivedFrom=` qualifier is not registered. **R-20**: a BellLabs-matched retelling is the RETELLING_FIDELITY Assessment with `retelling=<uid>`.

## Source

- `release:query-catalog/catalog.json#D9/CQ-CL-06` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D9/CQ-CL-06 --json`)

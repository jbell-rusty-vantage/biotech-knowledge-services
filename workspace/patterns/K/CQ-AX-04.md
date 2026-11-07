---
id: "pattern:K/CQ-AX-04"
kind: "pattern"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#K/CQ-AX-04"]
aliases: ["k/cq-ax-04","CQ-AX-04"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:3af63f18c7126935e79c8f961d309fb367a8404e2b1b91f083a1ef5e88a7c381"
---
# Pattern K/CQ-AX-04

| | |
| --- | --- |
| id | `pattern:K/CQ-AX-04` |
| module | [K](../../modules/K.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-AX-04` ([K question set](../questions/K.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:cfbab149fb0826e2f867a5786624ed1442e2e6e1d153232aa6614aba72db22cc` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `activity_kind`, `assertion_predicate`, `capture_subject`, `entity_uid`, `uid_Activity`, `uid_Adjudication`, `uid_Assertion`, `uid_Assessment`, `uid_Association`, `uid_CaptureAttempt`, `uid_Chunk`, `uid_MechanismEvidenceContext`, `uid_Report`, `uid_ReportItem`, `uid_SourceLocator`, `uid_SourceSnapshot`, `uid_exists_Activity`, `uid_exists_Adjudication`, `uid_exists_Assertion`, `uid_exists_Assessment`, `uid_exists_Association`, `uid_exists_CaptureAttempt`, `uid_exists_Chunk`, `uid_exists_MechanismEvidenceContext`, `uid_exists_Report`, `uid_exists_ReportItem`, `uid_exists_SourceLocator`, `uid_exists_SourceSnapshot`, `uid_type_Activity`, `uid_type_Adjudication`, `uid_type_Assertion`, `uid_type_Assessment`, `uid_type_Association`, `uid_type_CaptureAttempt`, `uid_type_Chunk`, `uid_type_MechanismEvidenceContext`, `uid_type_Report`, `uid_type_ReportItem`, `uid_type_SourceLocator`, `uid_type_SourceSnapshot` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-AX-04
// @param label:string
// @param absencePredicates:strings
CALL {
  MATCH (x:Entity {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:Activity {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:Adjudication {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:Assertion {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:Assessment {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:Association {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:CaptureAttempt {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:Chunk {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:MechanismEvidenceContext {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:Report {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:ReportItem {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:SourceLocator {uid: $uid}) WHERE $label IN labels(x) RETURN x
  UNION
  MATCH (x:SourceSnapshot {uid: $uid}) WHERE $label IN labels(x) RETURN x
}
WITH x,
  EXISTS { (x)<-[:HAS_SUBJECT]-(a:Assertion) WHERE a.predicate = $predicate AND a.recordedTo IS NULL } AS hasAnswer,
  EXISTS { (x)<-[:HAS_SUBJECT]-(a:Assertion) WHERE a.predicate IN $absencePredicates AND a.polarity = 'POSITIVE' AND a.recordedTo IS NULL } AS measuredAbsent,
  COLLECT { MATCH (x)<-[:HAS_SUBJECT]-(f:Assertion {predicate: 'FIELD_NOT_REPORTED'})
            WHERE f.valueString = $field AND f.recordedTo IS NULL RETURN f.uid } AS notReportedBy,
  COLLECT { MATCH (x)<-[:ASSESSES]-(act:Activity {activityKind: 'RESEARCH'}) RETURN act.uid } AS searchedBy,
  // R-09 / R-41: a CaptureAttempt (PARTIAL or FAILED) only ever means "blocked"; D11 property join on subjectUid
  COLLECT { MATCH (ca:CaptureAttempt {subjectUid: x.uid}) WHERE ca.outcome IN ['FAILED', 'PARTIAL']
            RETURN ca {.uid, .toolId, .outcome, .failureKind, .httpStatus, .attemptedAt} } AS blockedAttempts
RETURN x.uid AS subject, hasAnswer, measuredAbsent, notReportedBy, searchedBy, blockedAttempts,
       CASE WHEN hasAnswer THEN 'ANSWERED'
            WHEN measuredAbsent THEN 'MEASURED_ABSENT'
            WHEN size(notReportedBy) > 0 THEN 'NOT_REPORTED'
            WHEN size(blockedAttempts) > 0 THEN 'BLOCKED'
            WHEN size(searchedBy) > 0 THEN 'SEARCHED_NOTHING_FOUND'
            ELSE 'UNKNOWN' END AS emptyAnswerKind
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `absencePredicates` | array<string> |  | @param hint |
| `field` | string |  | default |
| `label` | string |  | @param hint |
| `predicate` | string |  | default |
| `uid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `subject`, `hasAnswer`, `measuredAbsent`, `notReportedBy`, `searchedBy`, `blockedAttempts`, `emptyAnswerKind`

## Temporal notes

- as-of: the packet's predicate on the assertions; `ca.attemptedAt <= $R` for the attempts.
- bitemporal episode needed on: none.

## Evidence and provenance notes

- trace: the FIELD_NOT_REPORTED Assertion cites the section read (or WHOLE_SNAPSHOT); "searched" cites the Activity; "blocked" cites the attempt (`requestDigest`, `responseHash`, `httpStatus`; no snapshot when the response was hashed and not kept).

## Notes

- **Ruling: R-09** (with R-41). Read "not reported" through the FIELD_NOT_REPORTED branch, and read CaptureAttempt (PARTIAL or FAILED) only for "blocked". Drop EMPTY_RESULT. R-41 keeps CaptureAttempt for FAILED and PARTIAL attempts only. The final `CaptureOutcome` enum is `PARTIAL | FAILED`.
- **How the question is answered now:** in full. Nothing is lost: an empty search is the RESEARCH Activity with no answer, and a capture that returned nothing is a COMPLETE snapshot with a FIELD_NOT_REPORTED Assertion, not an attempt record.

## Source

- `release:query-catalog/catalog.json#K/CQ-AX-04` (machine form: `patterns/catalog.json`, `bks-schema pattern --template K/CQ-AX-04 --json`)

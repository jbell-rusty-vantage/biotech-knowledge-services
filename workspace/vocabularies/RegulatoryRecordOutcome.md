---
id: "enum:RegulatoryRecordOutcome"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L115-L147"]
aliases: ["regulatory record outcome"]
capabilities: ["get"]
cardDigest: "sha256:2b803db0bd6d289035fa0e9706b36b5af1d2b8510fd52309696188a22021f4ea"
---
# Enum RegulatoryRecordOutcome

What the issuer decided or did in this record, as the record states it (verbatim wording stays in outcomeVerbatim).

Id `enum:RegulatoryRecordOutcome` · module [D8](../modules/D8.md) · 31 values · used by 1 fields · raw SDL [sdl:RegulatoryRecordOutcome](../sdl/RegulatoryRecordOutcome.graphql)

## Values (31)

| value | description |
| --- | --- |
| `FILED` |  |
| `ACKNOWLEDGED_WITHOUT_OBJECTION` |  |
| `OBJECTION` |  |
| `INCOMPLETE` |  |
| `NO_QUESTIONS` |  |
| `NO_BASIS` |  |
| `CEASED_AT_NOTIFIER_REQUEST` |  |
| `EXCLUDED_FROM_DEFINITION` |  |
| `NOT_EXCLUDED_FROM_DEFINITION` |  |
| `GRANTED` |  |
| `GRANTED_IN_PART` |  |
| `DENIED` |  |
| `AUTHORISED` |  |
| `LICENSED` |  |
| `APPROVED` |  |
| `COMPLETE_RESPONSE` |  |
| `FAVOURABLE_OPINION` |  |
| `UNFAVOURABLE_OPINION` |  |
| `VIOLATIONS_CITED` |  |
| `RECALL_INITIATED` |  |
| `CLOSED_OUT` |  |
| `CLAIMS_HELD_INVALID` |  |
| `CLAIMS_NOT_INVALID` |  |
| `INFRINGED` |  |
| `NOT_INFRINGED` |  |
| `AFFIRMED` |  |
| `REVERSED` |  |
| `VACATED` |  |
| `NOT_INSTITUTED` |  |
| `NOT_STATED` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`outcome`

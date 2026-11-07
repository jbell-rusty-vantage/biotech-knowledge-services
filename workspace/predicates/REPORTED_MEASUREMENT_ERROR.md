---
id: "pred:REPORTED_MEASUREMENT_ERROR"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTED_MEASUREMENT_ERROR"]
aliases: ["reported measurement error"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:bfe293f18ea77df7cf42284695f4041c98ccecabb8cc1bf886ac125e4c9f2d5c"
---
# Predicate REPORTED_MEASUREMENT_ERROR

| | |
| --- | --- |
| id | `pred:REPORTED_MEASUREMENT_ERROR` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AssayVersion](../nodes/AssayVersion.md), [Device](../nodes/Device.md) |
| object types | (none) |
| literal forms |  |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D4-09` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (value fields) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTED_MEASUREMENT_ERROR`

---
id: "pred:INTERFERES_WITH"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INTERFERES_WITH"]
aliases: ["interferes with"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:3adb5441b2e4026570f316aa612ada09bb10a6a4efd131bd5358cd6a7da24691"
---
# Predicate INTERFERES_WITH

| | |
| --- | --- |
| id | `pred:INTERFERES_WITH` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AssayVersion](../nodes/AssayVersion.md), [Device](../nodes/Device.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms |  |
| qualifiers | `direction`, `threshold` |
| aliases | (none) |
| questions | `Q-D4-11` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (value fields) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INTERFERES_WITH`

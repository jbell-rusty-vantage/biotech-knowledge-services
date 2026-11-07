---
id: "pred:REGISTRY_NOT_MAINTAINED_NOTE"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REGISTRY_NOT_MAINTAINED_NOTE"]
aliases: ["registry not maintained note"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:d6af051d2425a934b1a6fbbe9ac4ec57a6ef7b35a7625e1c5e0694722294abea"
---
# Predicate REGISTRY_NOT_MAINTAINED_NOTE

| | |
| --- | --- |
| id | `pred:REGISTRY_NOT_MAINTAINED_NOTE` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [RegistrationVersion](../nodes/RegistrationVersion.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-08`, `Q-D3-18` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REGISTRY_NOT_MAINTAINED_NOTE`

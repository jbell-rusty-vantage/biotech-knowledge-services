---
id: "pred:MEASURED_DELIVERY_FRACTION"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MEASURED_DELIVERY_FRACTION"]
aliases: ["measured delivery fraction"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:2b04730bcc75ee3b8e2a867282d359aadda2690af8a6e9b0d804e4fb892716ea"
---
# Predicate MEASURED_DELIVERY_FRACTION

| | |
| --- | --- |
| id | `pred:MEASURED_DELIVERY_FRACTION` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | (none) |
| literal forms | `valueNumber` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-02`, `Q-D3-06` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MEASURED_DELIVERY_FRACTION`

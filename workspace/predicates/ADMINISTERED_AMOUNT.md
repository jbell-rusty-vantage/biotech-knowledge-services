---
id: "pred:ADMINISTERED_AMOUNT"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ADMINISTERED_AMOUNT"]
aliases: ["administered amount"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:82c6f8bce89b80119b5c1a0c932d72b74d22e9832b6476fe729983fb7eb638ec"
---
# Predicate ADMINISTERED_AMOUNT

| | |
| --- | --- |
| id | `pred:ADMINISTERED_AMOUNT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | (none) |
| literal forms | `valueNumber` (UCUM amount per period (e.g. mg/d)) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-08`, `Q-D11-02` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, unit UCUM amount per period (e.g. mg/d)) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ADMINISTERED_AMOUNT`

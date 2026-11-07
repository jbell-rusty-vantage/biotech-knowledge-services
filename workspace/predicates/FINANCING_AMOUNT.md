---
id: "pred:FINANCING_AMOUNT"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#FINANCING_AMOUNT"]
aliases: ["financing amount","FINANCING_AMOUNT_SOLD","financing amount sold"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:98c48c641aacdbc3af9d29d9514920350ed8796872953bdbfdc37d3a651a9eef"
---
# Predicate FINANCING_AMOUNT

| | |
| --- | --- |
| id | `pred:FINANCING_AMOUNT` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | (none) |
| literal forms | `valueNumber` (unitCode iso4217:<CODE> (kernel convention) |
| qualifiers | (none) |
| aliases | [FINANCING_AMOUNT_SOLD](FINANCING_AMOUNT_SOLD.md) |
| questions | `Q-D13-06`, `Q-D13-23`, `Q-D7-04` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueNumber`, unit unitCode iso4217:<CODE> (kernel convention) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#FINANCING_AMOUNT`

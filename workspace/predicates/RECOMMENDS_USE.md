---
id: "pred:RECOMMENDS_USE"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RECOMMENDS_USE"]
aliases: ["recommends use","ENDORSES_PRODUCT","RECOMMENDS_FOR","endorses product","recommends for"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:4d6dd58d61408361fcf3f4d5ff8d98813a4df2bbf8a63631fb5761454ac66707"
---
# Predicate RECOMMENDS_USE

| | |
| --- | --- |
| id | `pred:RECOMMENDS_USE` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Device](../nodes/Device.md), [FoodItem](../nodes/FoodItem.md), [Product](../nodes/Product.md), [Protocol](../nodes/Protocol.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | [ENDORSES_PRODUCT](ENDORSES_PRODUCT.md), [RECOMMENDS_FOR](RECOMMENDS_FOR.md) |
| questions | `CQ-CL-05`, `CQ-CL-08`, `Q-D10-21`, `Q-D9-01`, `Q-K-15` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RECOMMENDS_USE`

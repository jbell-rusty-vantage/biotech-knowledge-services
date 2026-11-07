---
id: "pred:PHYSICAL_FORM"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PHYSICAL_FORM"]
aliases: ["physical form"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:8218886c6fa5e8aea91ca9133e4e62cc12b657165f2a205b020ea7aba99e1522"
---
# Predicate PHYSICAL_FORM

| | |
| --- | --- |
| id | `pred:PHYSICAL_FORM` |
| kind | **field** |
| route | **field** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

FIELD predicate: an Assertion certifying a node field; the value is written to the node and the Assertion carries its evidence.

## Write route

Proposal kinds: `node.upsert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PHYSICAL_FORM`

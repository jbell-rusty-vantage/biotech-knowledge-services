---
id: "pred:MATERIAL_GRADE"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MATERIAL_GRADE"]
aliases: ["material grade"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:38dcbb6e79d99135fd78b601ee90412c31d713a563c677a4fbb51b06ac714f33"
---
# Predicate MATERIAL_GRADE

| | |
| --- | --- |
| id | `pred:MATERIAL_GRADE` |
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

- `release:vocabularies/predicates.yaml#MATERIAL_GRADE`

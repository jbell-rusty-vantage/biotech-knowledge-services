---
id: "pred:EXTRACT_RATIO"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#EXTRACT_RATIO"]
aliases: ["extract ratio"]
capabilities: ["get","propose:node.upsert"]
cardDigest: "sha256:4588ec4def2975f9fd5d90324fea19e7bd0d50f19b7c36d073b4fd09a5b6c0ed"
---
# Predicate EXTRACT_RATIO

| | |
| --- | --- |
| id | `pred:EXTRACT_RATIO` |
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

- `release:vocabularies/predicates.yaml#EXTRACT_RATIO`

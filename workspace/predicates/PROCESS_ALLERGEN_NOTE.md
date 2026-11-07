---
id: "pred:PROCESS_ALLERGEN_NOTE"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#PROCESS_ALLERGEN_NOTE"]
aliases: ["process allergen note"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:0e27ea2aecb2def2e0603afbc9fbb4a6ba1581f0f7e84ebd230e0bafcf3f370e"
---
# Predicate PROCESS_ALLERGEN_NOTE

| | |
| --- | --- |
| id | `pred:PROCESS_ALLERGEN_NOTE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | (none) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-27` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'PROCESS_ALLERGEN_NOTE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named PROCESS_ALLERGEN_NOTE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#PROCESS_ALLERGEN_NOTE`

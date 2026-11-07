---
id: "pred:HIGHER_BIOAVAILABILITY_THAN"
kind: "predicate"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HIGHER_BIOAVAILABILITY_THAN"]
aliases: ["higher bioavailability than"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:b1da1d72415fdeec1f22d2bcedb5757ac7bcebc02e2ab8c13024156b34ab82f5"
---
# Predicate HIGHER_BIOAVAILABILITY_THAN

| | |
| --- | --- |
| id | `pred:HIGHER_BIOAVAILABILITY_THAN` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D1](../modules/D1.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-11` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'HIGHER_BIOAVAILABILITY_THAN'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named HIGHER_BIOAVAILABILITY_THAN.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HIGHER_BIOAVAILABILITY_THAN`

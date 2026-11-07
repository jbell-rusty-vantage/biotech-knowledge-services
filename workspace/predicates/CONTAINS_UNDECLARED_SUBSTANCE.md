---
id: "pred:CONTAINS_UNDECLARED_SUBSTANCE"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CONTAINS_UNDECLARED_SUBSTANCE"]
aliases: ["contains undeclared substance"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:a3d327f03cbb042e1288c3db3f76fd84e80e4045dade0e7d2c351c63885d52d3"
---
# Predicate CONTAINS_UNDECLARED_SUBSTANCE

| | |
| --- | --- |
| id | `pred:CONTAINS_UNDECLARED_SUBSTANCE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-10` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CONTAINS_UNDECLARED_SUBSTANCE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CONTAINS_UNDECLARED_SUBSTANCE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CONTAINS_UNDECLARED_SUBSTANCE`

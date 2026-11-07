---
id: "pred:MEASURED_CONTENT_IN_PRODUCT"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MEASURED_CONTENT_IN_PRODUCT"]
aliases: ["measured content in product"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:87b0ce00c04e78a17ef9ccf8b5e70fb15b4d3342448919a25f63c314f1d81002"
---
# Predicate MEASURED_CONTENT_IN_PRODUCT

| | |
| --- | --- |
| id | `pred:MEASURED_CONTENT_IN_PRODUCT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-09` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MEASURED_CONTENT_IN_PRODUCT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MEASURED_CONTENT_IN_PRODUCT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MEASURED_CONTENT_IN_PRODUCT`

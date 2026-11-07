---
id: "pred:HAS_APPROVED_INDICATION"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_APPROVED_INDICATION"]
aliases: ["has approved indication","INDICATED_FOR","indicated for"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:a201d77e0efaaf5ac08fa6fa134648132c8b4036cec1eda8ed2aac9600d085b5"
---
# Predicate HAS_APPROVED_INDICATION

| | |
| --- | --- |
| id | `pred:HAS_APPROVED_INDICATION` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Product](../nodes/Product.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [INDICATED_FOR](INDICATED_FOR.md) |
| questions | `Q-D5-16` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'HAS_APPROVED_INDICATION'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named HAS_APPROVED_INDICATION.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_APPROVED_INDICATION`

---
id: "pred:CLAIMS_TO_MEASURE"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CLAIMS_TO_MEASURE"]
aliases: ["claims to measure"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:6c060bf14daac32bf8db3807185e5630fdf26f0b0a213e54a4ddc6de93fd3a17"
---
# Predicate CLAIMS_TO_MEASURE

| | |
| --- | --- |
| id | `pred:CLAIMS_TO_MEASURE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [Device](../nodes/Device.md), [LabTest](../nodes/LabTest.md), [Product](../nodes/Product.md) |
| object types | [Metric](../nodes/Metric.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D4-08`, `Q-D4-18` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CLAIMS_TO_MEASURE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CLAIMS_TO_MEASURE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CLAIMS_TO_MEASURE`

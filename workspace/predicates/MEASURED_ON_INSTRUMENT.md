---
id: "pred:MEASURED_ON_INSTRUMENT"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MEASURED_ON_INSTRUMENT"]
aliases: ["measured on instrument"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:74e98bee11c9cfd029a2af9b9efa81989e12ad2ef850d97b0c4df7fcee16bcf6"
---
# Predicate MEASURED_ON_INSTRUMENT

| | |
| --- | --- |
| id | `pred:MEASURED_ON_INSTRUMENT` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AssayVersion](../nodes/AssayVersion.md) |
| object types | [Device](../nodes/Device.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-01`, `Q-D4-09` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MEASURED_ON_INSTRUMENT'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MEASURED_ON_INSTRUMENT.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MEASURED_ON_INSTRUMENT`

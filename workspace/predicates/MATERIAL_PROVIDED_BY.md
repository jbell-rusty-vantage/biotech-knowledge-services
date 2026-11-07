---
id: "pred:MATERIAL_PROVIDED_BY"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MATERIAL_PROVIDED_BY"]
aliases: ["material provided by"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:429ea12de1b4678bcd8a3ee73650d952a73bfb2d3eabf9d4f95248a626334610"
---
# Predicate MATERIAL_PROVIDED_BY

| | |
| --- | --- |
| id | `pred:MATERIAL_PROVIDED_BY` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [InterventionComponent](../nodes/InterventionComponent.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-01`, `Q-D3-08` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MATERIAL_PROVIDED_BY'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MATERIAL_PROVIDED_BY.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MATERIAL_PROVIDED_BY`

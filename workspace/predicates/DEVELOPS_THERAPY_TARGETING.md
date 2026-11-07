---
id: "pred:DEVELOPS_THERAPY_TARGETING"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DEVELOPS_THERAPY_TARGETING"]
aliases: ["develops therapy targeting"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:5d4b727abf7cf9ebb40bb9dac34a6df0b7d9818050aa10c61d56f76c3a40a15b"
---
# Predicate DEVELOPS_THERAPY_TARGETING

| | |
| --- | --- |
| id | `pred:DEVELOPS_THERAPY_TARGETING` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [Mechanism](../nodes/Mechanism.md), [MolecularEntity](../nodes/MolecularEntity.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D2-17` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'DEVELOPS_THERAPY_TARGETING'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named DEVELOPS_THERAPY_TARGETING.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DEVELOPS_THERAPY_TARGETING`

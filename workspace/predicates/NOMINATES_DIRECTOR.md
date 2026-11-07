---
id: "pred:NOMINATES_DIRECTOR"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#NOMINATES_DIRECTOR"]
aliases: ["nominates director"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:7594a14b34198b6ff8b3708327f4c9678d06b182bad2b0d8de6abda85b05f925"
---
# Predicate NOMINATES_DIRECTOR

| | |
| --- | --- |
| id | `pred:NOMINATES_DIRECTOR` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [Person](../nodes/Person.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D7-02` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'NOMINATES_DIRECTOR'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named NOMINATES_DIRECTOR.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#NOMINATES_DIRECTOR`

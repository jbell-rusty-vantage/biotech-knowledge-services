---
id: "pred:INVENTOR_ON_PATENT_ASSIGNED_TO"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INVENTOR_ON_PATENT_ASSIGNED_TO"]
aliases: ["inventor on patent assigned to"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:4d543217495fb2541efc4133fd181ef5d61135fb7c93b644ae6bd6ee9f6399dd"
---
# Predicate INVENTOR_ON_PATENT_ASSIGNED_TO

| | |
| --- | --- |
| id | `pred:INVENTOR_ON_PATENT_ASSIGNED_TO` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Person](../nodes/Person.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INVENTOR_ON_PATENT_ASSIGNED_TO'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named INVENTOR_ON_PATENT_ASSIGNED_TO.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INVENTOR_ON_PATENT_ASSIGNED_TO`

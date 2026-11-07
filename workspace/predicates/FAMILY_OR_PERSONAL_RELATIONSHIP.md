---
id: "pred:FAMILY_OR_PERSONAL_RELATIONSHIP"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#FAMILY_OR_PERSONAL_RELATIONSHIP"]
aliases: ["family or personal relationship"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:53890759f6c33fda84dd270a700b296a845f7f45990d2d5027a33ce35f3e7ba6"
---
# Predicate FAMILY_OR_PERSONAL_RELATIONSHIP

| | |
| --- | --- |
| id | `pred:FAMILY_OR_PERSONAL_RELATIONSHIP` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Person](../nodes/Person.md) |
| object types | [Person](../nodes/Person.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'FAMILY_OR_PERSONAL_RELATIONSHIP'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named FAMILY_OR_PERSONAL_RELATIONSHIP.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#FAMILY_OR_PERSONAL_RELATIONSHIP`

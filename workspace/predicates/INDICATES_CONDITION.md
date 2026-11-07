---
id: "pred:INDICATES_CONDITION"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#INDICATES_CONDITION"]
aliases: ["indicates condition"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:fd96283fe45085052a454ae5346190603949d4be2d716a0be49c978bd34be467"
---
# Predicate INDICATES_CONDITION

| | |
| --- | --- |
| id | `pred:INDICATES_CONDITION` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [Biomarker](../nodes/Biomarker.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D4-11` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'INDICATES_CONDITION'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named INDICATES_CONDITION.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#INDICATES_CONDITION`

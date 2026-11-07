---
id: "pred:REPORTS_ASSOCIATION_SCORE"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTS_ASSOCIATION_SCORE"]
aliases: ["reports association score"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:996952bb6c77fb5ecbb1c1523c0cc1b288cff08b91baf6943fa70f95209ea5fa"
---
# Predicate REPORTS_ASSOCIATION_SCORE

| | |
| --- | --- |
| id | `pred:REPORTS_ASSOCIATION_SCORE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | [MolecularEntity](../nodes/MolecularEntity.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-05` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'REPORTS_ASSOCIATION_SCORE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named REPORTS_ASSOCIATION_SCORE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTS_ASSOCIATION_SCORE`

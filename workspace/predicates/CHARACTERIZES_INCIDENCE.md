---
id: "pred:CHARACTERIZES_INCIDENCE"
kind: "predicate"
module: "D10"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CHARACTERIZES_INCIDENCE"]
aliases: ["characterizes incidence","REPORTS_ADVERSE_EVENT_RATE","reports adverse event rate"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:4043f2e475d3f910cff2364706d46d92610dbe1ee9d0faece65e7761407723c4"
---
# Predicate CHARACTERIZES_INCIDENCE

| | |
| --- | --- |
| id | `pred:CHARACTERIZES_INCIDENCE` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D10](../modules/D10.md) |
| subject types | [IngredientMaterial](../nodes/IngredientMaterial.md) |
| object types | [Condition](../nodes/Condition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [REPORTS_ADVERSE_EVENT_RATE](REPORTS_ADVERSE_EVENT_RATE.md) |
| questions | (none) |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'CHARACTERIZES_INCIDENCE'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named CHARACTERIZES_INCIDENCE.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CHARACTERIZES_INCIDENCE`

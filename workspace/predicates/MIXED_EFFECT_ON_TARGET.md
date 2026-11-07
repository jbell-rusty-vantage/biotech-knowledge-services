---
id: "pred:MIXED_EFFECT_ON_TARGET"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MIXED_EFFECT_ON_TARGET"]
aliases: ["mixed effect on target"]
capabilities: ["get","neighbors","propose:assertion.relate"]
cardDigest: "sha256:f16f136d44f970d7580236d49bbfce47744bf220882cd53ea983180a2d3928a2"
---
# Predicate MIXED_EFFECT_ON_TARGET

| | |
| --- | --- |
| id | `pred:MIXED_EFFECT_ON_TARGET` |
| kind | **relationship** |
| route | **assertion-only** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [FoodCategory](../nodes/FoodCategory.md) |
| object types | [Target](../nodes/Target.md) |
| literal forms | (none) |
| qualifiers | `coExposure`, `dose`, `outcomeUid`, `population` · required `population` |
| aliases | (none) |
| questions | `CQ-RC-05`, `CQ-RC-06`, `Q-D10-03`, `Q-D10-08`, `Q-D10-24`, `Q-D12-13`, `Q-D12-26`, `Q-D5-01`, `Q-D5-02`, `Q-D5-03`, `Q-D5-06`, `Q-D5-07`, `Q-D5-14`, `Q-D5-15` |

## Typed edge or Assertion only

No typed edge. The fact is an Assertion only: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MIXED_EFFECT_ON_TARGET'})-[:HAS_OBJECT]->(o)` with evidence `(a)-[:HAS_EVIDENCE]->(:SourceLocator)`. Do not invent an edge named MIXED_EFFECT_ON_TARGET.

## Write route

Proposal kinds: `assertion.relate`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MIXED_EFFECT_ON_TARGET`

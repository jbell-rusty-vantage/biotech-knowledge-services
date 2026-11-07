---
id: "pred:STATED_IN"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#STATED_IN"]
aliases: ["stated in"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:fcd3cad2be362a748337465b3772048dec05b085cfb2d79b461cb1c8bd14bd83"
---
# Predicate STATED_IN

| | |
| --- | --- |
| id | `pred:STATED_IN` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [OutcomeDefinition](../nodes/OutcomeDefinition.md), [StudyArm](../nodes/StudyArm.md), [StudyPopulation](../nodes/StudyPopulation.md), [StudyResult](../nodes/StudyResult.md) |
| object types | [Publication](../nodes/Publication.md), [RegistrationVersion](../nodes/RegistrationVersion.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EV-04`, `CQ-EV-05`, `CQ-RC-02`, `CQ-ST-01`, `CQ-ST-04`, `CQ-ST-05`, `CQ-ST-06`, `Q-D3-01`, `Q-D3-07`, `Q-D3-09`, `Q-D3-13`, `Q-D3-15`, `Q-D3-16`, `Q-D3-17`, `Q-K-04`, `Q-K-07` |

## Typed edge or Assertion only

A typed edge exists: [STATED_IN](../relationships/STATED_IN.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'STATED_IN'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#STATED_IN`

---
id: "pred:MEASURES"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MEASURES"]
aliases: ["measures"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:e097de648e729f8fe41ec2ef2f1ddc5c3340cbb8568ffa515d6090371d2073e3"
---
# Predicate MEASURES

| | |
| --- | --- |
| id | `pred:MEASURES` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [OutcomeDefinition](../nodes/OutcomeDefinition.md) |
| object types | [Biomarker](../nodes/Biomarker.md), [Condition](../nodes/Condition.md), [Metric](../nodes/Metric.md), [Outcome](../nodes/Outcome.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-03`, `CQ-ST-06`, `Q-D3-04`, `Q-D3-05` |

## Typed edge or Assertion only

A typed edge exists: [MEASURES](../relationships/MEASURES.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'MEASURES'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MEASURES`

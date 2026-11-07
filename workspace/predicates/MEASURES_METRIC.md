---
id: "pred:MEASURES_METRIC"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#MEASURES_METRIC"]
aliases: ["measures metric"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:4d9b84854c81aa0b36ffea72f13f0deabcb0334fa04db7cfd2bbe1734cc9ee3a"
---
# Predicate MEASURES_METRIC

| | |
| --- | --- |
| id | `pred:MEASURES_METRIC` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [LabTest](../nodes/LabTest.md) |
| object types | [Metric](../nodes/Metric.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-01`, `Q-D1-08`, `Q-D2-02`, `Q-D2-03`, `Q-D4-01`, `Q-D4-03`, `Q-D4-17`, `Q-D4-25` |

## Typed edge or Assertion only

A typed edge exists: [MEASURES_METRIC](../relationships/MEASURES_METRIC.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'MEASURES_METRIC'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#MEASURES_METRIC`

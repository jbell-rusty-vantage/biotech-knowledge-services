---
id: "pred:OPERATIONALIZED_BY"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OPERATIONALIZED_BY"]
aliases: ["operationalized by"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:7584152f8304fce45dd68bd0f6f4c7e968115f72cf0d8ad5e8c1ab8c0041ed40"
---
# Predicate OPERATIONALIZED_BY

| | |
| --- | --- |
| id | `pred:OPERATIONALIZED_BY` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [Target](../nodes/Target.md) |
| object types | [Biomarker](../nodes/Biomarker.md), [Condition](../nodes/Condition.md), [Metric](../nodes/Metric.md), [Outcome](../nodes/Outcome.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D3-04`, `Q-D5-01`, `Q-D5-14`, `Q-D5-20` |

## Typed edge or Assertion only

A typed edge exists: [OPERATIONALIZED_BY](../relationships/OPERATIONALIZED_BY.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'OPERATIONALIZED_BY'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#OPERATIONALIZED_BY`

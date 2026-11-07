---
id: "pred:RUNS_ON_DEVICE"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RUNS_ON_DEVICE"]
aliases: ["runs on device"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:c8540231dcadd5595ceb53500b345e462ce698bc5c4d295c535873a89e1d30b5"
---
# Predicate RUNS_ON_DEVICE

| | |
| --- | --- |
| id | `pred:RUNS_ON_DEVICE` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [AlgorithmVersion](../nodes/AlgorithmVersion.md) |
| object types | [Device](../nodes/Device.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-DX-09`, `Q-D4-07`, `Q-D4-09`, `Q-D4-17`, `Q-D4-23` |

## Typed edge or Assertion only

A typed edge exists: [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'RUNS_ON_DEVICE'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RUNS_ON_DEVICE`

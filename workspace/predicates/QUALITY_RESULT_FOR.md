---
id: "pred:QUALITY_RESULT_FOR"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#QUALITY_RESULT_FOR"]
aliases: ["quality result for"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:7ade5ecc9b0fdf3835a64c3ce7e339488e2073cd4f3848902672c440c035b778"
---
# Predicate QUALITY_RESULT_FOR

| | |
| --- | --- |
| id | `pred:QUALITY_RESULT_FOR` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [QualityResult](../nodes/QualityResult.md) |
| object types | [Lot](../nodes/Lot.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-19`, `CQ-MF-06`, `Q-D8-02`, `Q-D8-03`, `Q-D8-05`, `Q-D8-06`, `Q-D8-08`, `Q-D8-09`, `Q-D8-16`, `Q-D8-18`, `Q-D8-19`, `Q-D8-21`, `Q-D8-23` |

## Typed edge or Assertion only

A typed edge exists: [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'QUALITY_RESULT_FOR'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#QUALITY_RESULT_FOR`

---
id: "pred:RECEIVES_VALUE_FROM"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RECEIVES_VALUE_FROM"]
aliases: ["receives value from"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:dde352f7d5ef1df1963896e4985cffa4a153a8a74806e89c3914e49c6de5bf37"
---
# Predicate RECEIVES_VALUE_FROM

| | |
| --- | --- |
| id | `pred:RECEIVES_VALUE_FROM` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Person](../nodes/Person.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-18`, `CQ-CL-05`, `CQ-EC-03`, `CQ-EC-04`, `Q-D2-21`, `Q-D5-13`, `Q-D7-06`, `Q-D7-07`, `Q-D7-16`, `Q-D7-18` |

## Typed edge or Assertion only

A typed edge exists: [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'RECEIVES_VALUE_FROM'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RECEIVES_VALUE_FROM`

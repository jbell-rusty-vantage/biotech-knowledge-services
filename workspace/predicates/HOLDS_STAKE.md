---
id: "pred:HOLDS_STAKE"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HOLDS_STAKE"]
aliases: ["holds stake","HOLDS_EQUITY_IN","holds equity in"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:91589f33b1ff0948c928fe985102cd8d86edbb53d27ee1373225941b571eb3cc"
---
# Predicate HOLDS_STAKE

| | |
| --- | --- |
| id | `pred:HOLDS_STAKE` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | [HOLDS_EQUITY_IN](HOLDS_EQUITY_IN.md) |
| questions | `CQ-AX-18`, `CQ-CL-05`, `CQ-EC-01`, `CQ-EC-03`, `Q-D2-21`, `Q-D5-13`, `Q-D7-01`, `Q-D7-03`, `Q-D7-06`, `Q-D7-11`, `Q-D7-12`, `Q-D7-13`, `Q-D7-14`, `Q-D7-16` |

## Typed edge or Assertion only

A typed edge exists: [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HOLDS_STAKE'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HOLDS_STAKE`

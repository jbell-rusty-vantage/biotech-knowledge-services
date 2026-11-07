---
id: "pred:ON_FRONTIER"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ON_FRONTIER"]
aliases: ["on frontier"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:4a350ab4d59d9a8eabfa1d0e9603c78d6f872b3c6c98ba06e9a236a8ae965dd5"
---
# Predicate ON_FRONTIER

| | |
| --- | --- |
| id | `pred:ON_FRONTIER` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md), [Study](../nodes/Study.md) |
| object types | [Frontier](../nodes/Frontier.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-20`, `Q-D10-22`, `Q-D13-01`, `Q-D13-02`, `Q-D13-03`, `Q-D13-04`, `Q-D13-08`, `Q-D13-09`, `Q-D13-16`, `Q-D13-23`, `Q-D13-28`, `Q-D13-29`, `Q-D3-10`, `Q-D9-18` |

## Typed edge or Assertion only

A typed edge exists: [ON_FRONTIER](../relationships/ON_FRONTIER.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'ON_FRONTIER'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ON_FRONTIER`

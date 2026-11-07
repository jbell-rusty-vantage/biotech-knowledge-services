---
id: "pred:LEADS_TO"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LEADS_TO"]
aliases: ["leads to"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:0f62578c1d10fc4c7f49be88084ae14bee257305fb6dedf0cdfec7deca3e1dc5"
---
# Predicate LEADS_TO

| | |
| --- | --- |
| id | `pred:LEADS_TO` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | [Event](../nodes/Event.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-22`, `Q-D13-01`, `Q-D13-02`, `Q-D13-03`, `Q-D13-05`, `Q-D13-06` |

## Typed edge or Assertion only

A typed edge exists: [LEADS_TO](../relationships/LEADS_TO.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'LEADS_TO'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#LEADS_TO`

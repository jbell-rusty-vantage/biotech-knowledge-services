---
id: "pred:RESPONDS_TO"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#RESPONDS_TO"]
aliases: ["responds to"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:62f63d999632790a8b18403dde532e0b34d64caa7f4da59cfaad1ae1732e8ddf"
---
# Predicate RESPONDS_TO

| | |
| --- | --- |
| id | `pred:RESPONDS_TO` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | [Event](../nodes/Event.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D10-22`, `Q-D13-01`, `Q-D13-02`, `Q-D13-03`, `Q-D13-08`, `Q-D13-14`, `Q-D13-15`, `Q-D13-26` |

## Typed edge or Assertion only

A typed edge exists: [RESPONDS_TO](../relationships/RESPONDS_TO.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'RESPONDS_TO'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#RESPONDS_TO`

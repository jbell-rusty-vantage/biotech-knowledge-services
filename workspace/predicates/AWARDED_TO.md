---
id: "pred:AWARDED_TO"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#AWARDED_TO"]
aliases: ["awarded to"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:18ae8208adf3b00f85ef4348c368c9db3b8d01b73c2b190fa6f47c08b9d84c5f"
---
# Predicate AWARDED_TO

| | |
| --- | --- |
| id | `pred:AWARDED_TO` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Award](../nodes/Award.md) |
| object types | [Organization](../nodes/Organization.md), [Person](../nodes/Person.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EC-04`, `Q-D7-05`, `Q-D7-15`, `Q-D7-16`, `Q-D7-25` |

## Typed edge or Assertion only

A typed edge exists: [AWARDED_TO](../relationships/AWARDED_TO.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'AWARDED_TO'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#AWARDED_TO`

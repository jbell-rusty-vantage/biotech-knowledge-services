---
id: "pred:HAS_EDITION"
kind: "predicate"
module: "D5"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_EDITION"]
aliases: ["has edition"]
capabilities: ["get","neighbors","propose:state.attach"]
cardDigest: "sha256:19a4c9a4d8b391013d825fa12d75f0550784da7a727f98e20c7163f52ff88cbf"
---
# Predicate HAS_EDITION

| | |
| --- | --- |
| id | `pred:HAS_EDITION` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D5](../modules/D5.md) |
| subject types | [Protocol](../nodes/Protocol.md) |
| object types | [ProtocolEdition](../nodes/ProtocolEdition.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-PR-01`, `Q-D5-10`, `Q-D5-13`, `Q-D5-24` |

## Typed edge or Assertion only

A typed edge exists: [HAS_EDITION](../relationships/HAS_EDITION.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HAS_EDITION'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `state.attach`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_EDITION`

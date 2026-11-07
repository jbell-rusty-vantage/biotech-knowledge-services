---
id: "pred:TITLE_AS_DEPOSITED"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#TITLE_AS_DEPOSITED"]
aliases: ["title as deposited"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:22c24dfc6406a34e5dad77bdbc7e20917149fb7cb0948ce64fb28ef178835a16"
---
# Predicate TITLE_AS_DEPOSITED

| | |
| --- | --- |
| id | `pred:TITLE_AS_DEPOSITED` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Publication](../nodes/Publication.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EV-05`, `Q-D3-15` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#TITLE_AS_DEPOSITED`

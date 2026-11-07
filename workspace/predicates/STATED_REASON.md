---
id: "pred:STATED_REASON"
kind: "predicate"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#STATED_REASON"]
aliases: ["stated reason"]
capabilities: ["get","propose:assertion.literal"]
cardDigest: "sha256:2fc15f1005e3a1b53931f91084c0273d295e7f74059acfff9c861c64466ebfd0"
---
# Predicate STATED_REASON

| | |
| --- | --- |
| id | `pred:STATED_REASON` |
| kind | **literal** |
| route | **literal** |
| status | registered |
| registrar | [D13](../modules/D13.md) |
| subject types | [Event](../nodes/Event.md) |
| object types | (none) |
| literal forms | `valueString` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D13-08`, `Q-D13-15` |

## Typed edge or Assertion only

No object node. The fact is an Assertion with a literal value (`valueString`) about the subject.

## Write route

Proposal kinds: `assertion.literal`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#STATED_REASON`

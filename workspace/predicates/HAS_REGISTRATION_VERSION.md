---
id: "pred:HAS_REGISTRATION_VERSION"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_REGISTRATION_VERSION"]
aliases: ["has registration version"]
capabilities: ["get","neighbors","propose:state.attach"]
cardDigest: "sha256:1817cc6529ce0acde0ebbd52151de5eb480ffe10632d698739842cdede679964"
---
# Predicate HAS_REGISTRATION_VERSION

| | |
| --- | --- |
| id | `pred:HAS_REGISTRATION_VERSION` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Study](../nodes/Study.md) |
| object types | [RegistrationVersion](../nodes/RegistrationVersion.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-ST-04`, `CQ-ST-08`, `Q-D11-06`, `Q-D11-07`, `Q-D3-02`, `Q-D3-10`, `Q-D3-16`, `Q-D3-18` |

## Typed edge or Assertion only

A typed edge exists: [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'HAS_REGISTRATION_VERSION'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `state.attach`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_REGISTRATION_VERSION`

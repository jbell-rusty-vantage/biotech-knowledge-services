---
id: "pred:REVISES"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REVISES"]
aliases: ["revises"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:03ce52c7124ca8aba6ad70d3f48d8a85f3386e510a9a9e6e26964ff6cf0ef4bd"
---
# Predicate REVISES

| | |
| --- | --- |
| id | `pred:REVISES` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Publication](../nodes/Publication.md) |
| object types | [Publication](../nodes/Publication.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-EV-05`, `Q-D3-03`, `Q-D3-11`, `Q-D3-12` |

## Typed edge or Assertion only

A typed edge exists: [REVISES](../relationships/REVISES.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'REVISES'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REVISES`

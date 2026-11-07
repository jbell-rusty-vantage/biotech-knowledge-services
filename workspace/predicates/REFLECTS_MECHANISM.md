---
id: "pred:REFLECTS_MECHANISM"
kind: "predicate"
module: "D4"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REFLECTS_MECHANISM"]
aliases: ["reflects mechanism"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:eebbe050eb68be6165296ae80b00405cc1da425be22c7b969e7d763c8de0a40a"
---
# Predicate REFLECTS_MECHANISM

| | |
| --- | --- |
| id | `pred:REFLECTS_MECHANISM` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D4](../modules/D4.md) |
| subject types | [Biomarker](../nodes/Biomarker.md) |
| object types | [Mechanism](../nodes/Mechanism.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-08`, `Q-D2-02`, `Q-D2-03`, `Q-D4-01`, `Q-D4-17` |

## Typed edge or Assertion only

A typed edge exists: [REFLECTS_MECHANISM](../relationships/REFLECTS_MECHANISM.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'REFLECTS_MECHANISM'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REFLECTS_MECHANISM`

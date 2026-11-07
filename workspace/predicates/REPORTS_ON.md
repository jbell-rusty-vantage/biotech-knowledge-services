---
id: "pred:REPORTS_ON"
kind: "predicate"
module: "D3"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#REPORTS_ON"]
aliases: ["reports on"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:8f3c1e1a2d7ae5b8511e485d7f43189b3f5811c5133fa36ecf897bfa83a0a36a"
---
# Predicate REPORTS_ON

| | |
| --- | --- |
| id | `pred:REPORTS_ON` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D3](../modules/D3.md) |
| subject types | [Publication](../nodes/Publication.md) |
| object types | [Study](../nodes/Study.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-04`, `CQ-ST-04`, `CQ-ST-07`, `Q-D11-02`, `Q-D3-02`, `Q-D3-03`, `Q-D3-18` |

## Typed edge or Assertion only

A typed edge exists: [REPORTS_ON](../relationships/REPORTS_ON.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'REPORTS_ON'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#REPORTS_ON`

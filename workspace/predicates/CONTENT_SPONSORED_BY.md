---
id: "pred:CONTENT_SPONSORED_BY"
kind: "predicate"
module: "D9"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#CONTENT_SPONSORED_BY"]
aliases: ["content sponsored by"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:1cb27ef12d437800ba172c1e102cc40c2e8a2dd87c961d4d0713b73b72f76dc5"
---
# Predicate CONTENT_SPONSORED_BY

| | |
| --- | --- |
| id | `pred:CONTENT_SPONSORED_BY` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D9](../modules/D9.md) |
| subject types | [MediaWork](../nodes/MediaWork.md) |
| object types | [Brand](../nodes/Brand.md), [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CL-05`, `CQ-CL-08`, `Q-D9-06` |

## Typed edge or Assertion only

A typed edge exists: [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'CONTENT_SPONSORED_BY'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#CONTENT_SPONSORED_BY`

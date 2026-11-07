---
id: "pred:ISSUED_BY"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#ISSUED_BY"]
aliases: ["issued by"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:d361e90cfe1f00249d9dba953f34f10c1f70b5e7813dd3c830baef55cf49e9cb"
---
# Predicate ISSUED_BY

| | |
| --- | --- |
| id | `pred:ISSUED_BY` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [CertificationListing](../nodes/CertificationListing.md), [QualityResult](../nodes/QualityResult.md), [RegulatoryRecord](../nodes/RegulatoryRecord.md) |
| object types | [Organization](../nodes/Organization.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-19`, `CQ-MF-02`, `CQ-PF-03a`, `Q-D8-02`, `Q-D8-05`, `Q-D8-06`, `Q-D8-12`, `Q-D8-22` |

## Typed edge or Assertion only

A typed edge exists: [ISSUED_BY](../relationships/ISSUED_BY.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'ISSUED_BY'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#ISSUED_BY`

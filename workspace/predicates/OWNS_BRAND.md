---
id: "pred:OWNS_BRAND"
kind: "predicate"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#OWNS_BRAND"]
aliases: ["owns brand"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:1c1eaec52ed791dc0b4356a1543cbb006f0e841d19ba5a23398b6c3c840f26c5"
---
# Predicate OWNS_BRAND

| | |
| --- | --- |
| id | `pred:OWNS_BRAND` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D7](../modules/D7.md) |
| subject types | [Organization](../nodes/Organization.md) |
| object types | [Brand](../nodes/Brand.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CL-05`, `CQ-EC-02`, `CQ-RC-06`, `Q-D5-01`, `Q-D5-04`, `Q-D5-06`, `Q-D5-08`, `Q-D5-13`, `Q-D5-14`, `Q-D5-20`, `Q-D5-22`, `Q-D5-23`, `Q-D7-06`, `Q-D7-10`, `Q-D7-11`, `Q-D7-19`, `Q-D9-02` |

## Typed edge or Assertion only

A typed edge exists: [OWNS_BRAND](../relationships/OWNS_BRAND.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'OWNS_BRAND'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#OWNS_BRAND`

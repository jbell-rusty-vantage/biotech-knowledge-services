---
id: "pred:BRANDED_AS"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#BRANDED_AS"]
aliases: ["branded as"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:fa3edd5e4aa80e3f5659de2a7fe05340171b2e06874b266937e8a1e97899d3f4"
---
# Predicate BRANDED_AS

| | |
| --- | --- |
| id | `pred:BRANDED_AS` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Product](../nodes/Product.md) |
| object types | [Brand](../nodes/Brand.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-CM-04`, `CQ-RC-06`, `Q-D5-01`, `Q-D5-04`, `Q-D5-06`, `Q-D5-08`, `Q-D5-13`, `Q-D5-14`, `Q-D5-20`, `Q-D5-22`, `Q-D5-23`, `Q-D6-06`, `Q-D6-11`, `Q-D6-12`, `Q-D6-16`, `Q-D6-20`, `Q-D9-02` |

## Typed edge or Assertion only

A typed edge exists: [BRANDED_AS](../relationships/BRANDED_AS.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'BRANDED_AS'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#BRANDED_AS`

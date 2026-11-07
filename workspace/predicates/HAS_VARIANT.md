---
id: "pred:HAS_VARIANT"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#HAS_VARIANT"]
aliases: ["has variant"]
capabilities: ["get","neighbors","propose:edge.structural"]
cardDigest: "sha256:ec21d1141a1321a26f8e6975f70d1806ad772271bec3c90e827f5de17f32137d"
---
# Predicate HAS_VARIANT

| | |
| --- | --- |
| id | `pred:HAS_VARIANT` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [Product](../nodes/Product.md) |
| object types | [ProductVariant](../nodes/ProductVariant.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-25`, `CQ-RC-06`, `Q-D5-01`, `Q-D5-04`, `Q-D5-06`, `Q-D5-08`, `Q-D5-13`, `Q-D5-14`, `Q-D5-20`, `Q-D5-22`, `Q-D5-23`, `Q-D6-02`, `Q-D6-16` |

## Typed edge or Assertion only

A typed edge exists: [HAS_VARIANT](../relationships/HAS_VARIANT.md) (structural). Each stored edge is authorized by one Assertion with `predicate: 'HAS_VARIANT'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.structural`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#HAS_VARIANT`

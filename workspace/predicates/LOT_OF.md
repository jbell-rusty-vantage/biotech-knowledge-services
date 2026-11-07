---
id: "pred:LOT_OF"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LOT_OF"]
aliases: ["lot of"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:3a22127c4aec8af2a78b379fa54a6fe8aee8d906b028883b9308ea1c9b2b65ea"
---
# Predicate LOT_OF

| | |
| --- | --- |
| id | `pred:LOT_OF` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [Lot](../nodes/Lot.md) |
| object types | [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-19`, `CQ-MF-06`, `Q-D8-02`, `Q-D8-03`, `Q-D8-04`, `Q-D8-05`, `Q-D8-06`, `Q-D8-08`, `Q-D8-16`, `Q-D8-18`, `Q-D8-21`, `Q-D8-23` |

## Typed edge or Assertion only

A typed edge exists: [LOT_OF](../relationships/LOT_OF.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'LOT_OF'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#LOT_OF`

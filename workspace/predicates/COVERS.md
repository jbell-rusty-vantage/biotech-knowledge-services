---
id: "pred:COVERS"
kind: "predicate"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#COVERS"]
aliases: ["covers"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:82a20c42b9c7cb30ed7078b10b2e82a3512797787c53e2373c8c8b8578ba6d65"
---
# Predicate COVERS

| | |
| --- | --- |
| id | `pred:COVERS` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D8](../modules/D8.md) |
| subject types | [CertificationListing](../nodes/CertificationListing.md) |
| object types | [Lot](../nodes/Lot.md), [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-PF-03a`, `Q-D8-08`, `Q-D8-19` |

## Typed edge or Assertion only

A typed edge exists: [COVERS](../relationships/COVERS.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'COVERS'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#COVERS`

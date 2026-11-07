---
id: "pred:LISTING_FOR"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#LISTING_FOR"]
aliases: ["listing for"]
capabilities: ["get","neighbors","propose:edge.assert"]
cardDigest: "sha256:bdff1959846451d2c49c94f0b38ba5c9eeb994663a32797c646a5ab4ca11a88b"
---
# Predicate LISTING_FOR

| | |
| --- | --- |
| id | `pred:LISTING_FOR` |
| kind | **authorizing** |
| route | **typed-edge** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [MerchantListing](../nodes/MerchantListing.md) |
| object types | [Package](../nodes/Package.md) |
| literal forms | (none) |
| qualifiers | (none) |
| aliases | (none) |
| questions | `CQ-AX-17`, `CQ-CM-02`, `CQ-CM-04`, `CQ-PF-02`, `CQ-RC-06`, `Q-D5-01`, `Q-D5-04`, `Q-D5-06`, `Q-D5-08`, `Q-D5-13`, `Q-D5-14`, `Q-D5-20`, `Q-D5-22`, `Q-D5-23`, `Q-D6-02`, `Q-D6-05`, `Q-D6-06`, `Q-D6-13`, `Q-D6-15`, `Q-D6-19`, `Q-D6-20`, `Q-D6-21` |

## Typed edge or Assertion only

A typed edge exists: [LISTING_FOR](../relationships/LISTING_FOR.md) (asserted). Each stored edge is authorized by one Assertion with `predicate: 'LISTING_FOR'` (`r.assertionUid`), which carries status, validity and evidence.

## Write route

Proposal kinds: `edge.assert`. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#LISTING_FOR`

---
id: "task:record-price-observation"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#record-price-observation"]
aliases: ["record-price-observation","record price observation"]
capabilities: ["get","slice","propose:node.upsert","propose:edge.structural","propose:edge.assert","propose:assertion.literal","propose:identifier.attach"]
cardDigest: "sha256:2be60adc2b5bf5a23fe959a3af954f87728afd0cc168480e4df5675df2bb36de"
---
# Task: Record an observed price for a listing

Id `task:record-price-observation` · phase **ingestion** · domains [products-and-commerce](../domains/products-and-commerce.md) · write route

A MerchantListing (host domain + host item id) is LISTING_FOR a Package and HAS_OFFER Offers; each captured price is a typed-literal Assertion on the Offer at a located capture; the seller of record is an asserted SELLER_OF_RECORD edge.

## Elements

- Node types: [MerchantListing](../nodes/MerchantListing.md), [Offer](../nodes/Offer.md), [Package](../nodes/Package.md), [Organization](../nodes/Organization.md), [Identifier](../nodes/Identifier.md)
- Relationship types: [LISTING_FOR](../relationships/LISTING_FOR.md), [HAS_OFFER](../relationships/HAS_OFFER.md), [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md), [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md)
- Read operations (`bks kg read`): `node.resolve`, `node.neighbors`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `edge.structural`, `edge.assert`, `assertion.literal`, `identifier.attach`
- Pending proposal kinds: (none)

## Steps

1. Resolve the listing by (hostDomain, hostItemId) or ASIN; create it when absent.
2. Each capture is a new literal Assertion (price value, currency in qualifiers) with HAS_EVIDENCE to the capture's locator; never overwrite an earlier observation.

## Pitfalls

- A listing absent in a later capture is not a withdrawn listing.
- Hosting a listing is not being the seller of record; no store-specific menu pricing in v2 (OD-30).

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks record-price-observation --out <dir>`.

## v1 navigation aliases

(none)

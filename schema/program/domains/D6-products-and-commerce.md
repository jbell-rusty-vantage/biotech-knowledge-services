# D6 — Consumer products and commerce

Lens: economics. Current fragments: W04 Products, formulations and labels (10 node types: Product, ProductVariant, PackageConfiguration, ProductSnapshot, FormulationVersion, IngredientComponent, LabelSnapshot, LabelDeclaration, QuantityDeclaration, ServingDefinition), W15 Commerce and access (10: MerchantListing, Offer, PriceObservation, SubscriptionPlan, Bundle, BundleComponent, InventoryItem, IndividualUnit, AffiliateLink, CommerceMatch).

## Scope

The product as sold: product, variant, package, formulation versions and ingredient components, label snapshots and declarations; listings, offers, price observations, subscriptions, bundles, affiliate links, and the match between a commerce record and a reference identity. This is the domain the owner named first ("Consumer Supplements and their Compounds"), together with D1. Out of scope: the chemistry (D1), lot testing (D8), the seller as an organization (D7 seam), medical devices as regulated objects (D8).

## Ecosystem to survey

Brands and direct-to-consumer operations (Elysium, ChromaDex/Tru Niagen, Thorne, Momentous, Blueprint, AG1, Timeline/Mitopure), marketplaces and their data models (Amazon ASIN parent/child, Walmart, iHerb, Shopify variants, Fullscript), subscription and affiliate economics (Amazon Associates, impact.com, podcast promo codes), label regulation that shapes the data (21 CFR 101.36, DSLD), price-tracking practice (Keepa, CamelCamelCamel), product identity practice (GTIN/UPC, ASIN merges, reformulation without relabel), testing organizations that buy off the shelf (ConsumerLab, Labdoor, NSF), recalls.

## Seed questions

- What does the current label of this variant declare per serving, since when, and what did the previous label say?
- Which merchants list this variant, at what observed price and availability, who is the seller of record, and which is the authorized channel?
- Did the formulation change between the study material and the product on sale today (seams D3, D1)?
- What is the price per effective dose of compound X across products (joins D1 amounts and D6 prices)?
- Which products are bundles or multipacks of which packages, and what identifiers tie them together?
- Which affiliate links and promo codes point at this product, from which sources (seams D9, D7)?
- Which listing is a counterfeit, gray-market or merged page (CommerceMatch), and on what evidence?

## Retrieval patterns to consider

Product → variant → package → listing → offer → price as-of; label snapshot diffs; commerce matches as assessments; price per dose computed at query time (never stored as a fact); GDS: similarity of products by formulation (node similarity over components), seller networks.

## Sources and tools to score (with D11)

Amazon Product Advertising API (constraints), Keepa, Shopify storefront JSON, brand sites (Firecrawl with change tracking), NIH DSLD (labels), GS1 GTIN lookup, Walmart and iHerb APIs, impact.com, FDA recalls and enforcement reports.

## Known problems and open questions

Open Priority-0 item 1 (what creates a new ProductVariant versus FormulationVersion versus PackageConfiguration) still needs six fixtures; recalled, expired and counterfeit inventory; shipping, tax and cancellation stay text; the live `LISTS_PRODUCT` legacy edge; the `ProductSnapshot` compatibility type (keep or drop under R1).

## Deliverables

`../packets/D6/` per PLAN 5.1, with the six variant-boundary fixtures from real captures.

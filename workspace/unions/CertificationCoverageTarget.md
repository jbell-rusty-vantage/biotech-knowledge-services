---
id: "union:CertificationCoverageTarget"
kind: "union"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L352-L352"]
aliases: ["certification coverage target"]
capabilities: ["get","neighbors"]
cardDigest: "sha256:851bccfe984880f3c3d7fc509e1b004ba4ef7a60cf163c9824ffbe93eb49004e"
---
# Union CertificationCoverageTarget

What a certification listing covers. 3 members. A facility-level listing (GMP registration) covers no typed target until Facility is promoted (OQ-D8-03): its facility stays in scopeVerbatim and the operator is predicate-only LISTING_COVERS_FACILITY_OF (05 predicateOnly).

Id `union:CertificationCoverageTarget` · module [D8](../modules/D8.md) · 3 members · raw SDL [sdl:CertificationCoverageTarget](../sdl/CertificationCoverageTarget.graphql)

## Members

- [Product](../nodes/Product.md) — Purpose: the enduring marketed concept behind every variant, package and listing ("Tru Niagen", "AG1", "Big Mac"): what…
- [ProductVariant](../nodes/ProductVariant.md) — Purpose: a consumer-distinguishable realization of a Product — strength per unit, dosage form, flavor or jurisdiction (…
- [Lot](../nodes/Lot.md) — Purpose: one production lot (batch) of one product or variant — the join key for "is the thing I hold real and lawful":…

## Used by

- [CertificationListing](../nodes/CertificationListing.md).`covers`

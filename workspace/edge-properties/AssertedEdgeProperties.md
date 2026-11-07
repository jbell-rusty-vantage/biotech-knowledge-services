---
id: "edge:AssertedEdgeProperties"
kind: "edge-properties"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L79-L91"]
aliases: ["asserted edge properties"]
capabilities: ["get"]
cardDigest: "sha256:396a058dc2e6f3ec8e087039197e14310e8ab854d2548ede05a01cb8ee42ba5c"
---
# Edge properties AssertedEdgeProperties

Asserted edge episode (bitemporal). One relationship per recorded-time episode, authorized by exactly one Assertion (`assertionUid`; its predicate equals the edge type, its subject/object equal the endpoints). Valid bounds, precisions and bases are copied from the Assertion (half-open; null = unknown, never 'ongoing'); `recordedFrom` is service-assigned at commit; `recordedTo` is written once when the episode closes; nothing is deleted. Every field is executor-set. `lastWriterRunId` names the writing Mission Control run. An edge is projected only from a current POSITIVE Assertion (types registered with `projectionGate: SUPPORT` also need a SUPPORT Adjudication); one episode per (from, to, type, asserter), other Assertions corroborate (R-22). Entity → versioned-state attachments (formulation, label version, protocol edition, registration version) use this type; a relationship type registered with `exclusive: true` may not overlap in valid and recorded time (an open episode is closed before the next opens), enforced by the executor per relationship type (R-10).

| | |
| --- | --- |
| id | `edge:AssertedEdgeProperties` · raw SDL [sdl:AssertedEdgeProperties](../sdl/AssertedEdgeProperties.graphql) |
| module | [K](../modules/K.md) |
| used by relationship types | [ASSIGNED_TO](../relationships/ASSIGNED_TO.md), [BRANDED_AS](../relationships/BRANDED_AS.md), [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md), [COVERS](../relationships/COVERS.md), [HAS_EDITION](../relationships/HAS_EDITION.md), [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md), [HAS_REFERENCE_FOOD](../relationships/HAS_REFERENCE_FOOD.md), [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md), [INCLUDES_TEST](../relationships/INCLUDES_TEST.md), [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md), [LICENSED_TO](../relationships/LICENSED_TO.md), [LISTING_FOR](../relationships/LISTING_FOR.md), [MEASURES_METRIC](../relationships/MEASURES_METRIC.md), [OWNS_BRAND](../relationships/OWNS_BRAND.md), [PARENT_TAXON](../relationships/PARENT_TAXON.md), [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md), [RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md), [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md), [STATUS_OF](../relationships/STATUS_OF.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Properties (11)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | kernel.graphql:L80 |
| `assertionUid` | `String!` | yes | create+update |  | kernel.graphql:L81 |
| `validFrom` | `DateTime` |  | create+update |  | kernel.graphql:L82 |
| `validTo` | `DateTime` |  | create+update |  | kernel.graphql:L83 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | kernel.graphql:L84 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | kernel.graphql:L85 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | kernel.graphql:L86 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | kernel.graphql:L87 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | kernel.graphql:L88 |
| `recordedTo` | `DateTime` |  | create+update |  | kernel.graphql:L89 |
| `lastWriterRunId` | `String` |  | create+update |  | kernel.graphql:L90 |

## Declared on (21 fields)

- [Taxon](../nodes/Taxon.md).`parents` ([PARENT_TAXON](../relationships/PARENT_TAXON.md))
- [Study](../nodes/Study.md).`registrationVersions` ([HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md))
- [LabTest](../nodes/LabTest.md).`metrics` ([MEASURES_METRIC](../relationships/MEASURES_METRIC.md))
- [LabTest](../nodes/LabTest.md).`assayVersions` ([PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md))
- [LabTest](../nodes/LabTest.md).`algorithmVersions` ([PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md))
- [LabTest](../nodes/LabTest.md).`components` ([INCLUDES_TEST](../relationships/INCLUDES_TEST.md))
- [AlgorithmVersion](../nodes/AlgorithmVersion.md).`devices` ([RUNS_ON_DEVICE](../relationships/RUNS_ON_DEVICE.md))
- [Protocol](../nodes/Protocol.md).`editions` ([HAS_EDITION](../relationships/HAS_EDITION.md))
- [Product](../nodes/Product.md).`brand` ([BRANDED_AS](../relationships/BRANDED_AS.md))
- [Package](../nodes/Package.md).`labelVersions` ([HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md))
- [MerchantListing](../nodes/MerchantListing.md).`listingFor` ([LISTING_FOR](../relationships/LISTING_FOR.md))
- [Offer](../nodes/Offer.md).`sellerOfRecord` ([SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md))
- [Brand](../nodes/Brand.md).`owners` ([OWNS_BRAND](../relationships/OWNS_BRAND.md))
- [LegalStatus](../nodes/LegalStatus.md).`statusOf` ([STATUS_OF](../relationships/STATUS_OF.md))
- [CertificationListing](../nodes/CertificationListing.md).`covers` ([COVERS](../relationships/COVERS.md))
- [Patent](../nodes/Patent.md).`assignees` ([ASSIGNED_TO](../relationships/ASSIGNED_TO.md))
- [Patent](../nodes/Patent.md).`licensees` ([LICENSED_TO](../relationships/LICENSED_TO.md))
- [MediaWork](../nodes/MediaWork.md).`sponsors` ([CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md))
- [FoodItem](../nodes/FoodItem.md).`categories` ([IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md))
- [FoodItem](../nodes/FoodItem.md).`referencedByProducts` ([HAS_REFERENCE_FOOD](../relationships/HAS_REFERENCE_FOOD.md))
- [FoodCategory](../nodes/FoodCategory.md).`memberProducts` ([IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md))

## Source definition

- `release:sdl/modules/kernel.graphql#L79-L91`

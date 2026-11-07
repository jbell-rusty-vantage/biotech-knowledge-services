---
id: "enum:OrganizationKind"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L148-L164"]
aliases: ["organization kind"]
capabilities: ["get"]
cardDigest: "sha256:8f68dbee98057ada9b9cd77f51bfe94e38485f4dc640993bdcd0eb5ea93470ba"
---
# Enum OrganizationKind

Coarse, filterable kind of organization (trimmed from the pinned 37-value OrganizationType). Never a role (pinned INV-009): what an organization does for a product, study or event is an edge in the domain that asks.

Id `enum:OrganizationKind` · module [D7](../modules/D7.md) · 15 values · used by 1 fields · raw SDL [sdl:OrganizationKind](../sdl/OrganizationKind.graphql)

## Values (15)

| value | description |
| --- | --- |
| `BIOTECH_OR_PHARMA` |  |
| `SUPPLEMENT_OR_CONSUMER_HEALTH` |  |
| `FOOD_OR_BEVERAGE` |  |
| `DIAGNOSTICS_OR_DEVICE` |  |
| `CONTRACT_SERVICE_PROVIDER` |  |
| `TESTING_OR_CERTIFICATION_BODY` |  |
| `CLINIC_OR_HEALTHCARE_PROVIDER` |  |
| `RETAILER_OR_MARKETPLACE` |  |
| `MEDIA_OR_CREATOR_BUSINESS` |  |
| `INVESTOR_OR_FUND` |  |
| `ACADEMIC_OR_RESEARCH_INSTITUTE` |  |
| `NONPROFIT_OR_FOUNDATION` |  |
| `GOVERNMENT_OR_REGULATOR` |  |
| `TRADE_OR_PROFESSIONAL_ASSOCIATION` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Organization](../nodes/Organization.md).`organizationKind`

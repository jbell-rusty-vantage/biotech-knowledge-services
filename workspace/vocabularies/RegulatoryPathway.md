---
id: "enum:RegulatoryPathway"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L78-L112"]
aliases: ["regulatory pathway"]
capabilities: ["get"]
cardDigest: "sha256:cf621749c4989eda915f7b7a26e0c5773ca68139367f036bf3bd788f0b519871"
---
# Enum RegulatoryPathway

Regulatory programme, approval route or designation programme a record or status sits under (replaces pinned RegulatoryPathway, RegulatoryPathwayVersion, RegulatoryStep node types). D8 owns this vocabulary for the assembled schema (R-56, R-66): D13 deletes ApprovalPathway and DesignationType and retypes Event.approvalPathway / Event.designationType to this enum through the OQ-D8-02 mapping published in the release migration/v1-map.yaml (enums.valueMappings). A designation is LegalStatus statusKind DESIGNATED with its programme here.

Id `enum:RegulatoryPathway` · module [D8](../modules/D8.md) · 33 values · used by 4 fields · raw SDL [sdl:RegulatoryPathway](../sdl/RegulatoryPathway.graphql)

## Values (33)

| value | description |
| --- | --- |
| `US_DIETARY_SUPPLEMENT` |  |
| `US_NDI` |  |
| `US_GRAS` |  |
| `US_FOOD_ADDITIVE` |  |
| `US_DRUG_NDA` |  |
| `US_DRUG_ANDA` |  |
| `US_BLA` |  |
| `US_ACCELERATED_APPROVAL` |  |
| `US_EUA` |  |
| `US_COMPOUNDING_503A` |  |
| `US_COMPOUNDING_503B` |  |
| `US_DEVICE_510K` |  |
| `US_DEVICE_DE_NOVO` |  |
| `US_DEVICE_PMA` |  |
| `US_ORPHAN_DESIGNATION` |  |
| `US_BREAKTHROUGH_THERAPY` |  |
| `US_FAST_TRACK` |  |
| `US_RMAT` |  |
| `US_PRIORITY_REVIEW` |  |
| `US_PRIORITY_REVIEW_VOUCHER` |  |
| `US_FOOD_FACILITY_REGISTRATION` |  |
| `EU_NOVEL_FOOD` |  |
| `EU_FOOD_SUPPLEMENT` |  |
| `EU_MEDICINAL_PRODUCT` |  |
| `EU_CONDITIONAL_MA` |  |
| `EU_ORPHAN_DESIGNATION` |  |
| `EU_PRIME` |  |
| `JP_SAKIGAKE` |  |
| `UK_NOVEL_FOOD` |  |
| `CA_NATURAL_HEALTH_PRODUCT` |  |
| `AU_ARTG` |  |
| `PATENT` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [RegulatoryRecord](../nodes/RegulatoryRecord.md).`pathway`
- [LegalStatus](../nodes/LegalStatus.md).`pathway`
- [Event](../nodes/Event.md).`approvalPathway`
- [Event](../nodes/Event.md).`designationType`

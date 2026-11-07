---
id: "enum:AmountBasis"
kind: "enum"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L208-L226"]
aliases: ["amount basis"]
capabilities: ["get"]
cardDigest: "sha256:83d9a65b2d3726e12c4426cb9a008117f123fd9869fc63a102f7d91ce3d677a9"
---
# Enum AmountBasis

Basis of a stated amount. The one program-wide amount-basis enum (R-58), owned by D6: declared label lines (D6 ComponentLineProperties.amountBasis), administered doses (D3; replaces QuantityBasis), protocol and constraint doses (D5; replaces DosePeriod), food amounts (D12), and cell-free exposure contexts (D2, MEDIUM_CONCENTRATION). Consumers reference it and never re-declare it (R-56). Salt-vs-moiety mass basis is a separate dimension (D1 MassBasis).

Id `enum:AmountBasis` · module [D6](../modules/D6.md) · 16 values · used by 6 fields · raw SDL [sdl:AmountBasis](../sdl/AmountBasis.graphql)

## Values (16)

| value | description |
| --- | --- |
| `PER_SERVING` |  |
| `PER_UNIT` |  |
| `PER_100G` |  |
| `PER_100ML` |  |
| `PER_PACKAGE` |  |
| `PER_ITEM` |  |
| `PER_DOSE` |  |
| `PER_DAY` |  |
| `PER_WEEK` |  |
| `PER_CYCLE` |  |
| `PER_KG_BODY_WEIGHT_PER_DAY` |  |
| `PER_KG_DIET` |  |
| `SINGLE_DOSE` |  |
| `MEDIUM_CONCENTRATION` | Concentration in a culture or assay medium (D2 cell-free contexts, route IN_MEDIUM). |
| `NOT_STATED` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md).`exposureBasis`
- [InterventionComponent](../nodes/InterventionComponent.md).`quantityBasis`
- [ProtocolStep](../nodes/ProtocolStep.md).`dosePeriod`
- [UseConstraint](../nodes/UseConstraint.md).`dosePeriod`
- `ComponentLineProperties`.`amountBasis`
- `FoodContentProperties`.`amountBasis`

---
id: "enum:ValueTransferKind"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L229-L242"]
aliases: ["value transfer kind"]
capabilities: ["get"]
cardDigest: "sha256:7d72f059d381297e684265aa66290ae78a807e580c299e25aa1cc7781093bacb"
---
# Enum ValueTransferKind

What was received on RECEIVES_VALUE_FROM (ICMJE items, FTC material-connection kinds, Sinclair's IP/L codes, NIH FCOI kinds). A family or personal relationship is never stored (privacy rule; 11-open-questions.md).

Id `enum:ValueTransferKind` · module [D7](../modules/D7.md) · 12 values · used by 1 fields · raw SDL [sdl:ValueTransferKind](../sdl/ValueTransferKind.graphql)

## Values (12)

| value | description |
| --- | --- |
| `SALARY_OR_FEES` |  |
| `HONORARIA_OR_SPEAKING` |  |
| `ROYALTY_OR_LICENSE_INCOME` |  |
| `INVENTOR_ON_LICENSED_IP` |  |
| `RESEARCH_FUNDING` |  |
| `SPONSORSHIP_PAYMENT` |  |
| `PAID_ENDORSEMENT` |  |
| `AFFILIATE_COMMISSION` |  |
| `FREE_OR_DISCOUNTED_PRODUCT` |  |
| `TRAVEL_OR_MEETING_SUPPORT` |  |
| `EXPERT_TESTIMONY` |  |
| `UNSPECIFIED_PAYMENT` |  |

Any value not listed here is not allowed in this release.

## Used by

- `ValueEdgeProperties`.`valueKind`

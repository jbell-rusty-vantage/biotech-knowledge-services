---
id: "enum:StakeKind"
kind: "enum"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D7.graphql#L192-L199"]
aliases: ["stake kind"]
capabilities: ["get"]
cardDigest: "sha256:c9c931aeca51ddf32a26a2790121a7947ee1dfcf69eb26ae261ee9d15399fe0a"
---
# Enum StakeKind

Kind of holding on HOLDS_STAKE. INVESTOR_UNSPECIFIED keeps 'investor' (no instrument stated) apart from EQUITY (pinned rule: INVESTED_IN does not imply HOLDS_EQUITY_IN).

Id `enum:StakeKind` · module [D7](../modules/D7.md) · 6 values · used by 1 fields · raw SDL [sdl:StakeKind](../sdl/StakeKind.graphql)

## Values (6)

| value | description |
| --- | --- |
| `EQUITY` |  |
| `INVESTOR_UNSPECIFIED` |  |
| `OPTIONS_OR_WARRANTS` |  |
| `CONVERTIBLE_OR_SAFE` |  |
| `LIMITED_PARTNER_INTEREST` |  |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- `StakeEdgeProperties`.`stakeKind`

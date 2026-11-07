---
id: "enum:PatentDateBasis"
kind: "enum"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D8.graphql#L318-L324"]
aliases: ["patent date basis"]
capabilities: ["get"]
cardDigest: "sha256:ecf2e0a122168ca4d141f1378481a4243a3af87409ff622d4c39f7a52ef952eb"
---
# Enum PatentDateBasis

Where a patent date (expiry) comes from: the office, an aggregator's estimate (Google Patents says its status 'is an assumption'), a company filing, a court.

Id `enum:PatentDateBasis` · module [D8](../modules/D8.md) · 5 values · used by 1 fields · raw SDL [sdl:PatentDateBasis](../sdl/PatentDateBasis.graphql)

## Values (5)

| value | description |
| --- | --- |
| `OFFICE_RECORD` |  |
| `AGGREGATOR_ESTIMATE` |  |
| `COMPANY_DISCLOSURE` |  |
| `COURT_RECORD` |  |
| `NOT_STATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Patent](../nodes/Patent.md).`expiryBasis`

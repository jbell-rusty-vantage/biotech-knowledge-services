---
id: "edge:ContentEdgeProperties"
kind: "edge-properties"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D1.graphql#L45-L65"]
aliases: ["content edge properties"]
capabilities: ["get"]
cardDigest: "sha256:6827fb482476847f28b30be0d85f30c86cf9a07af186b52f7b18a6e68741f196"
---
# Edge properties ContentEdgeProperties

Asserted, bitemporal episode of MATERIAL_CONTAINS: the eleven AssertedEdgeProperties fields verbatim (executor-set, copied from the one authorizing Assertion; half-open valid interval; nothing deleted) plus the four qualifiers Q-D1-11 filters on ("preparations of taxon T standardized to at least X % of marker M": statementKind = STANDARDIZATION_CLAIM, comparator in GTE/GT/EQ/APPROX, quantity >= X, unitCode = '%'). The same number is the Assertion's valueNumber/unitCode (copied by the executor). QUALITATIVE_PROVIDES statements carry no quantity (non-inference rule: "provides" never implies an amount); a BETWEEN statement keeps quantity null and its bounds in the Assertion qualifier "range:<low>-<high>"; content basis (w/w, v/v) and mass basis are Assertion qualifiers ("contentBasis:MASS_FRACTION_W_W"). D12 FoodContentProperties uses the same statementKind / quantity / unitCode names.

| | |
| --- | --- |
| id | `edge:ContentEdgeProperties` · raw SDL [sdl:ContentEdgeProperties](../sdl/ContentEdgeProperties.graphql) |
| module | [D1](../modules/D1.md) |
| used by relationship types | [MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Properties (15)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D1.graphql:L46 |
| `assertionUid` | `String!` | yes | create+update |  | D1.graphql:L47 |
| `validFrom` | `DateTime` |  | create+update |  | D1.graphql:L48 |
| `validTo` | `DateTime` |  | create+update |  | D1.graphql:L49 |
| `validFromPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D1.graphql:L50 |
| `validToPrecision` | [TimePrecision](../vocabularies/TimePrecision.md) |  | create+update |  | D1.graphql:L51 |
| `validFromBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D1.graphql:L52 |
| `validToBasis` | [ValidTimeBasis](../vocabularies/ValidTimeBasis.md) | yes | create+update |  | D1.graphql:L53 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D1.graphql:L54 |
| `recordedTo` | `DateTime` |  | create+update |  | D1.graphql:L55 |
| `lastWriterRunId` | `String` |  | create+update |  | D1.graphql:L56 |
| `statementKind` | [ContentStatementKind](../vocabularies/ContentStatementKind.md) | yes | create+update | Filter: Q-D1-11 (STANDARDIZATION_CLAIM), CQ-ID-03 / Q-D1-13 (declared vs measured vs qualitative). | D1.graphql:L58 |
| `quantity` | `Float` |  | create+update | Point value for EQ, APPROX, GTE, GT, LTE, LT; null for BETWEEN and QUALITATIVE_PROVIDES (filter: Q-D1-11 quantity >= X). | D1.graphql:L60 |
| `comparator` | [QuantityComparator](../vocabularies/QuantityComparator.md) |  | create+update | Filter: Q-D1-11 (a minimum or point claim satisfies 'at least X'; LT/LTE limits never do). | D1.graphql:L62 |
| `unitCode` | `String` |  | create+update | UCUM unit ('%', 'mg/g', '{CFU}/g'); null only for QUALITATIVE_PROVIDES (filter: Q-D1-11 unitCode = '%'). | D1.graphql:L64 |

## Declared on (2 fields)

- [IngredientMaterial](../nodes/IngredientMaterial.md).`containsSubstances` ([MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md))
- [IngredientMaterial](../nodes/IngredientMaterial.md).`containsConstituents` ([MATERIAL_CONTAINS](../relationships/MATERIAL_CONTAINS.md))

## Source definition

- `release:sdl/modules/D1.graphql#L45-L65`

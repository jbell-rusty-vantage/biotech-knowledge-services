---
id: "edge:FoodContentProperties"
kind: "edge-properties"
module: "D12"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D12.graphql#L41-L55"]
aliases: ["food content properties"]
capabilities: ["get"]
cardDigest: "sha256:53982d376533dbe5051b1f1bc69e5bcdaeab54b75da173d9359fa9ef48cdf92f"
---
# Edge properties FoodContentProperties

Asserted, recorded-time-only FOOD_CONTAINS line: the five AssertedRecordedProperties fields verbatim (executor-set, copied from the one authorizing Assertion; nothing deleted, a revised value supersedes through recordedTo), then `statementKind` (D1's enum, the same tail D1's ContentEdgeProperties keeps), then the three fields a D12 question filters on: `quantity` + `unitCode` (Q-D12-19/21 "at least A of C") and `amountBasis` (Q-D12-01/21 per 100 g vs per serving). `quantity` is set only for a point value (FDC and Phenol-Explorer amounts); a bounded or ranged statement leaves it null and carries `comparator:<GTE|GT|LTE|LT>` (D1 QuantityComparator values, R-57) / `range:<low>-<high>` in Assertion.qualifiers, as D1 does, so a threshold filter never matches a "< LOQ" or a range by accident. The authorizing Assertion carries the same number in valueNumber/unitCode, any source-stated valid time, n / min / max / derivation code (qualifiers; no question filters on them) and the verbatim text through its locator. No valid-time fields: no reference-composition source read in this packet states a sampling period per value (adversarial review, 2026-10-08).

| | |
| --- | --- |
| id | `edge:FoodContentProperties` · raw SDL [sdl:FoodContentProperties](../sdl/FoodContentProperties.graphql) |
| module | [D12](../modules/D12.md) |
| used by relationship types | [FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |

## Properties (9)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D12.graphql:L42 |
| `assertionUid` | `String!` | yes | create+update |  | D12.graphql:L43 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D12.graphql:L44 |
| `recordedTo` | `DateTime` |  | create+update |  | D12.graphql:L45 |
| `lastWriterRunId` | `String` |  | create+update |  | D12.graphql:L46 |
| `statementKind` | [ContentStatementKind](../vocabularies/ContentStatementKind.md) | yes | create+update | D1 ContentStatementKind: MEASURED_IN_SAMPLE (FDC derivation A), CALCULATED (FDC NC), TYPICAL_COMPOSITION_REPORTED (Phenol-Explorer content value), QU… | D12.graphql:L48 |
| `quantity` | `Float` |  | create+update | Point amount per amountBasis; null for bounded, ranged or qualitative statements (filter: Q-D12-19, Q-D12-21 >= A). | D12.graphql:L50 |
| `unitCode` | `String` |  | create+update | UCUM unit of quantity ('mg', 'kcal', 'ug'); null only for QUALITATIVE_PROVIDES (filter: Q-D12-21). | D12.graphql:L52 |
| `amountBasis` | [AmountBasis](../vocabularies/AmountBasis.md) |  | create+update | D6 AmountBasis (the single amount-basis enum, R-58); D12 writes PER_100G \| PER_100ML \| PER_SERVING (a named portion; its label is the Assertion quali… | D12.graphql:L54 |

## Declared on (1 fields)

- [FoodItem](../nodes/FoodItem.md).`components` ([FOOD_CONTAINS](../relationships/FOOD_CONTAINS.md))

## Source definition

- `release:sdl/modules/D12.graphql#L41-L55`

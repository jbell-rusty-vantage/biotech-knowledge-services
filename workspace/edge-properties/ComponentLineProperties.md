---
id: "edge:ComponentLineProperties"
kind: "edge-properties"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D6.graphql#L53-L74"]
aliases: ["component line properties"]
capabilities: ["get"]
cardDigest: "sha256:b2a97f4eb40cbcbd234c4e78df4e5f4c839d918e5c81e1ec067adf8839cf74f7"
---
# Edge properties ComponentLineProperties

Asserted line of a label's declared composition (one Supplement Facts / Nutrition Facts / ingredient-statement row). Each line is authorized by its own Assertion (predicate DECLARES_COMPONENT, subject the LabelVersion, object the line target, asserter the transcribing source, locator the panel row): the resolution of the printed row to a D1/D12 record is attributable, can be adjudicated, keeps recorded-time history when D1 merges or splits materials, and is the input a D1 CALCULATED amount cites in DERIVED_FROM (adversarial-review stage; closes OQ-D6-24(2)). Superset of the kernel AssertedRecordedProperties: its five fields come first, verbatim and in kernel order (A1 rule M11); the label version's HAS_LABEL_VERSION episode carries valid time, so the line carries recorded time only. The qualifiers after the base fields are the ones CQ-AX-25, CQ-PF-01, Q-D6-02, Q-D6-08 and Q-D6-12 filter on. Amounts are declarations, never measurements (measured content is D8). The row as printed ('Niagen (as Nicotinamide Riboside Chloride)'), the form statement ('as pyridoxine HCl') and a per-component allergen or preparation statement are not edge fields (M11: a field that only reproduces the source's wording stays with the Assertion): they are the authorizing Assertion's locator exact text and its qualifiers `declaredName:`, `form:` and `statement:` (R-30).

| | |
| --- | --- |
| id | `edge:ComponentLineProperties` · raw SDL [sdl:ComponentLineProperties](../sdl/ComponentLineProperties.graphql) |
| module | [D6](../modules/D6.md) |
| used by relationship types | [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) |
| set by the executor | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |

## Properties (14)

| property | type | required | writable | description | source |
| --- | --- | --- | --- | --- | --- |
| `relationshipUid` | `String!` | yes | create+update |  | D6.graphql:L54 |
| `assertionUid` | `String!` | yes | create+update |  | D6.graphql:L55 |
| `recordedFrom` | `DateTime!` | yes | create+update |  | D6.graphql:L56 |
| `recordedTo` | `DateTime` |  | create+update |  | D6.graphql:L57 |
| `lastWriterRunId` | `String` |  | create+update |  | D6.graphql:L58 |
| `orderIndex` | `Int` |  | create+update | Panel order of this line (0-based); siblings under one parent are ordered by it. | D6.graphql:L60 |
| `parentOrderIndex` | `Int` |  | create+update | orderIndex of the parent line (proprietary blend total, prepared-food sub-component such as 'Big Mac Sauce'); null at top level. | D6.graphql:L62 |
| `lineRole` | [ComponentLineRole](../vocabularies/ComponentLineRole.md) | yes | create+update |  | D6.graphql:L63 |
| `amount` | `Float` |  | create+update | Declared amount; null when the label states none (blend member, 'NP'). | D6.graphql:L65 |
| `unitCode` | `String` |  | create+update | UCUM unit of amount (mg, ug, g, mL, kcal, {CFU}). | D6.graphql:L67 |
| `amountReferent` | [AmountReferent](../vocabularies/AmountReferent.md) |  | create+update |  | D6.graphql:L68 |
| `massBasis` | [MassBasis](../vocabularies/MassBasis.md) |  | create+update | Mass basis of a declared chemical amount (D1 shared vocabulary MassBasis: SALT_FORM, ACTIVE_MOIETY, NUTRIENT_EQUIVALENT, MATERIAL_AS_IS, UNSPECIFIED)… | D6.graphql:L70 |
| `amountBasis` | [AmountBasis](../vocabularies/AmountBasis.md) |  | create+update |  | D6.graphql:L71 |
| `dailyValuePercent` | `Float` |  | create+update | Percent Daily Value as printed; null when not stated. | D6.graphql:L73 |

## Declared on (1 fields)

- [LabelVersion](../nodes/LabelVersion.md).`components` ([DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md))

## Source definition

- `release:sdl/modules/D6.graphql#L53-L74`

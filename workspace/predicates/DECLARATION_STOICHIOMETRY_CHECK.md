---
id: "pred:DECLARATION_STOICHIOMETRY_CHECK"
kind: "predicate"
module: "D6"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/predicates.yaml#DECLARATION_STOICHIOMETRY_CHECK"]
aliases: ["declaration stoichiometry check"]
capabilities: ["get"]
cardDigest: "sha256:0031708d8a7a6e46d5c4dceb7613d4577f0c0b70cdee5527eccb7c046c029135"
---
# Predicate DECLARATION_STOICHIOMETRY_CHECK

| | |
| --- | --- |
| id | `pred:DECLARATION_STOICHIOMETRY_CHECK` |
| kind | **computation** |
| route | **computation** |
| status | registered |
| registrar | [D6](../modules/D6.md) |
| subject types | [LabelVersion](../nodes/LabelVersion.md) |
| object types | [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Constituent](../nodes/Constituent.md), [Taxon](../nodes/Taxon.md) |
| literal forms | `valueBoolean` |
| qualifiers | (none) |
| aliases | (none) |
| questions | `Q-D1-20` |

## Typed edge or Assertion only

Computation predicate: produced by a registered derivation rule / trusted job, never by an ordinary proposal; it is not source evidence.

## Write route

No ordinary proposal writes this predicate. Rules: [ingestion-rules](../rules/ingestion-rules.md).

## Source definition

- `release:vocabularies/predicates.yaml#DECLARATION_STOICHIOMETRY_CHECK`

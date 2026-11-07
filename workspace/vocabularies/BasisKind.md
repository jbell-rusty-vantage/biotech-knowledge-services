---
id: "enum:BasisKind"
kind: "enum"
module: "K"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/kernel.graphql#L261-L274"]
aliases: ["basis kind"]
capabilities: ["get"]
cardDigest: "sha256:c4d9f5f4f9088a3914b11f3750467b03fb82e04ae5e1872ddf6099a1ce6dcd94"
---
# Enum BasisKind

Epistemic basis of a proposition; CALCULATED needs derivationRule and DERIVED_FROM inputs. THIRD_PARTY_ANECDOTE: the asserter reports another person's experience; MECHANISM_REASONING: argued from a mechanism, not measured (D9 request K-7); CURATOR_CLASSIFICATION: a curator's classification against a versioned curation Source (frontier, hallmark mapping, target operationalization, curator attachment; R-25). One basis per Assertion (split mixed-basis statements); projections rank bases by the one published kernel order (09-reasoning).

Id `enum:BasisKind` · module [K](../modules/K.md) · 12 values · used by 2 fields · raw SDL [sdl:BasisKind](../sdl/BasisKind.graphql)

## Values (12)

| value | description |
| --- | --- |
| `DIRECT_MEASUREMENT` |  |
| `INFERRED_FROM_MEASUREMENT` |  |
| `CITED_FROM_PRIOR_WORK` |  |
| `PERSONAL_EXPERIENCE` |  |
| `THIRD_PARTY_ANECDOTE` |  |
| `MANUFACTURER_CLAIM` |  |
| `EXPERT_OPINION` |  |
| `HYPOTHESIS` |  |
| `MECHANISM_REASONING` |  |
| `CALCULATED` |  |
| `CURATOR_CLASSIFICATION` |  |
| `UNSTATED` |  |

Any value not listed here is not allowed in this release.

## Used by

- [Assertion](../nodes/Assertion.md).`basisKind`
- `MechanismProjectionProperties`.`bestBasis`

---
id: "task:ingest-product-label"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#ingest-product-label"]
aliases: ["ingest-product-label","ingest product label"]
capabilities: ["get","slice","propose:node.upsert","propose:edge.structural","propose:edge.assert","propose:assertion.literal","propose:identifier.attach"]
cardDigest: "sha256:d21d4d58ee2ea5be6c4c2a43e0f2107847431cd632027b5b9534b55bf5e01797"
---
# Task: Ingest a product label (supplement facts) as a label version with its component lines

Id `task:ingest-product-label` · phase **ingestion** · domains [products-and-commerce](../domains/products-and-commerce.md), [substances-and-biology](../domains/substances-and-biology.md) · write route

One Product, one ProductVariant, one Package; the observed label content is a LabelVersion attached by a HAS_LABEL_VERSION episode; each label line is a DECLARES_COMPONENT edge to an IngredientMaterial, Constituent or FoodItem.

## Elements

- Node types: [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md), [Package](../nodes/Package.md), [LabelVersion](../nodes/LabelVersion.md), [IngredientMaterial](../nodes/IngredientMaterial.md), [Constituent](../nodes/Constituent.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Brand](../nodes/Brand.md)
- Relationship types: [HAS_VARIANT](../relationships/HAS_VARIANT.md), [HAS_PACKAGE](../relationships/HAS_PACKAGE.md), [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md), [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md), [BRANDED_AS](../relationships/BRANDED_AS.md), [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md), [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md)
- Read operations (`bks kg read`): `node.resolve`, `node.card`, `state.asOf`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `edge.structural`, `edge.assert`, `assertion.literal`, `identifier.attach`
- Pending proposal kinds: (none)

## Steps

1. Declare the label page as a Source + SourceSnapshot (retrievedAt, observedAt) + one SourceLocator per panel row quoted.
2. Resolve Product / Variant / Package (GTIN as Identifier on the Package); create the LabelVersion as a `mode: new` subject (identity: responsible party, panelKind, jurisdiction, labelVersionCode or contentDigest).
3. `edge.assert` Package -[HAS_LABEL_VERSION]-> LabelVersion with validFrom = observedAt, basis OBSERVATION_ONLY and its evidence locator (biotech-knowledge-intent.v2 has no state.attach; the slot exclusivity comes from the relationship register); the episode is exclusive per (package, slot, asserter).
4. For each label line: `edge.assert` DECLARES_COMPONENT with ComponentLineProperties (orderIndex, amount, unitCode, amountReferent, massBasis, amountBasis); the printed wording goes on the line Assertion as qualifiers declaredName:, form:, statement:.
5. A line you cannot map to a material becomes `mention.stage` on its locator.

## Pitfalls

- The label states amounts per serving; a per-day maximum is the computation predicate CALCULATED_DAILY_MAX_INTAKE with a derivation rule, never a rewrite of the line.
- A listed ingredient amount is not the active-moiety amount (massBasis); a packaging-only change is not a new composition (compositionDigest).

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks ingest-product-label --out <dir>`.

## v1 navigation aliases

(none)

---
id: "task:measured-versus-declared-content"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#measured-versus-declared-content"]
aliases: ["measured-versus-declared-content","measured versus declared content"]
capabilities: ["get","slice","propose:node.upsert","propose:edge.assert","propose:assertion.relate","propose:assessment.record"]
cardDigest: "sha256:87f810d182019586ccd0ad2c69c6f2348b53c4762e6bdb46cf15beae9b6a5b7e"
---
# Task: Compare measured content of a sold product with its label declaration (OD-10 option A)

Id `task:measured-versus-declared-content` · phase **ingestion** · domains [manufacturing-quality-regulatory-ip](../domains/manufacturing-quality-regulatory-ip.md), [products-and-commerce](../domains/products-and-commerce.md) · write route

A lab result on a lot is a QualityResult (QUALITY_RESULT_FOR the Lot, MEASURES_ANALYTE the analyte); a measurement of a purchased product without a lot is the registered MEASURED_CONTENT_IN_PRODUCT predicate with provenance; the declaration stays a DECLARES_COMPONENT line on the LabelVersion.

## Elements

- Node types: [QualityResult](../nodes/QualityResult.md), [Lot](../nodes/Lot.md), [Product](../nodes/Product.md), [ProductVariant](../nodes/ProductVariant.md), [LabelVersion](../nodes/LabelVersion.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Organization](../nodes/Organization.md)
- Relationship types: [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md), [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md), [LOT_OF](../relationships/LOT_OF.md), [ISSUED_BY](../relationships/ISSUED_BY.md), [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md), [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md)
- Read operations (`bks kg read`): `node.resolve`, `node.neighbors`, `state.asOf`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `edge.assert`, `assertion.relate`, `assessment.record`
- Pending proposal kinds: `assertion.relate`, `assessment.record` — new or changed in v2; they need the S3 executor-v2 planner before they plan against the v2 IR

## Steps

1. With a lot: create the QualityResult (identity: issuer, report number, analyte, lot, testedAt) and `edge.assert` QUALITY_RESULT_FOR, MEASURES_ANALYTE, ISSUED_BY.
2. Without a lot (survey rows): `assertion.relate` MEASURED_CONTENT_IN_PRODUCT (subject Product or ProductVariant, object the analyte) with the measured value, unit and the survey locator.
3. A conformance judgment (measured versus declared) is a QUALITY Assessment that is DERIVED_FROM both, never a rewrite of either.

## Pitfalls

- A lab measurement never becomes a label declaration and a declaration never proves content (FX-05).
- QualityResult.statedVerdict is the lab's statement, not BellLabs' conclusion (OD-32); Product is not a QUALITY_RESULT_FOR target.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks measured-versus-declared-content --out <dir>`.

## v1 navigation aliases

(none)

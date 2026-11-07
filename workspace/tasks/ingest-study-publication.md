---
id: "task:ingest-study-publication"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#ingest-study-publication"]
aliases: ["ingest-study-publication","ingest study publication"]
capabilities: ["get","slice","propose:node.upsert","propose:identifier.attach","propose:edge.assert","propose:edge.structural","propose:assertion.literal"]
cardDigest: "sha256:0916c869eb4a80643d2bae5565f4252eb0de1aa9c2ed1f99463f404c39ee1b67"
---
# Task: Ingest a study with its registration versions, intervention material and results

Id `task:ingest-study-publication` · phase **ingestion** · domains [studies-and-evidence](../domains/studies-and-evidence.md), [substances-and-biology](../domains/substances-and-biology.md) · write route

Study identity comes from the registry identifier (NCT, ISRCTN) or the first reporting publication (DOI / PMID); each registry state is an immutable RegistrationVersion; what an arm administered is an InterventionComponent that ADMINISTERS a material, never the commercial product by assumption.

## Elements

- Node types: [Study](../nodes/Study.md), [RegistrationVersion](../nodes/RegistrationVersion.md), [Publication](../nodes/Publication.md), [StudyArm](../nodes/StudyArm.md), [InterventionComponent](../nodes/InterventionComponent.md), [StudyPopulation](../nodes/StudyPopulation.md), [OutcomeDefinition](../nodes/OutcomeDefinition.md), [StudyResult](../nodes/StudyResult.md), [IngredientMaterial](../nodes/IngredientMaterial.md)
- Relationship types: [HAS_REGISTRATION_VERSION](../relationships/HAS_REGISTRATION_VERSION.md), [HAS_ARM](../relationships/HAS_ARM.md), [HAS_COMPONENT](../relationships/HAS_COMPONENT.md), [ADMINISTERS](../relationships/ADMINISTERS.md), [HAS_POPULATION](../relationships/HAS_POPULATION.md), [HAS_OUTCOME](../relationships/HAS_OUTCOME.md), [MEASURES](../relationships/MEASURES.md), [RESULT_FOR](../relationships/RESULT_FOR.md), [RESULT_FOR_ARM](../relationships/RESULT_FOR_ARM.md), [STATED_IN](../relationships/STATED_IN.md), [REPORTS_ON](../relationships/REPORTS_ON.md), [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md)
- Read operations (`bks kg read`): `node.resolve`, `node.card`, `node.neighbors`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `identifier.attach`, `edge.assert`, `edge.structural`, `assertion.literal`
- Pending proposal kinds: (none)

## Steps

1. Resolve by identifier first (NCT, DOI, PMID) and attach every identifier you have with `identifier.attach`.
2. Each captured registry state is a new RegistrationVersion attached by a HAS_REGISTRATION_VERSION episode (field facts cite one locator per field).
3. Arms, components, populations and outcome definitions are subjects linked by `edge.structural` (HAS_ARM, HAS_COMPONENT, HAS_POPULATION, HAS_OUTCOME); ADMINISTERS and MEASURES are `edge.assert` (curated resolutions).
4. Each reported result is a create-only StudyResult (RESULT_FOR, RESULT_FOR_ARM, STATED_IN) with its estimate, interval and p-value as stated.

## Pitfalls

- Statistically significant is not clinically meaningful; a within-arm change is not a between-arm effect.
- An abstract-only capture is captureCompleteness PARTIAL; preserve the source's salt / dose basis and unknowns (MD-D3-03).

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks ingest-study-publication --out <dir>`.

## v1 navigation aliases

(none)

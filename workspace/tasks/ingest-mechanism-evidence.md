---
id: "task:ingest-mechanism-evidence"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#ingest-mechanism-evidence"]
aliases: ["ingest-mechanism-evidence","ingest mechanism evidence"]
capabilities: ["get","slice","propose:node.upsert","propose:assertion.relate","propose:edge.structural","propose:assertion.literal"]
cardDigest: "sha256:3df5a5bd2c0b033d8d4274093c21373700d2ebe854bcd5ccd0667ffa4b13c813"
---
# Task: Record mechanism evidence (measured vs inferred) for a substance

Id `task:ingest-mechanism-evidence` · phase **ingestion** · domains [substances-and-biology](../domains/substances-and-biology.md), [studies-and-evidence](../domains/studies-and-evidence.md) · write route

A mechanism statement is an Assertion with a registered mechanism predicate (INHIBITS, ACTIVATES, INCREASES_ACTIVITY_OF ...) and basisKind, OBSERVED_IN_CONTEXT a MechanismEvidenceContext (species, setting, compartment); AFFECTS_MECHANISM is a derived projection the executor never writes from an intent.

## Elements

- Node types: [Mechanism](../nodes/Mechanism.md), [MechanismEvidenceContext](../nodes/MechanismEvidenceContext.md), [MolecularEntity](../nodes/MolecularEntity.md), [ChemicalSubstance](../nodes/ChemicalSubstance.md), [Assertion](../nodes/Assertion.md)
- Relationship types: [OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md), [PARTICIPATES_IN](../relationships/PARTICIPATES_IN.md), [PART_OF_MECHANISM](../relationships/PART_OF_MECHANISM.md), [AFFECTS_MECHANISM](../relationships/AFFECTS_MECHANISM.md), [EXPOSED_TO](../relationships/EXPOSED_TO.md)
- Read operations (`bks kg read`): `node.resolve`, `node.neighbors`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `assertion.relate`, `edge.structural`, `assertion.literal`
- Pending proposal kinds: `assertion.relate` — new or changed in v2; they need the S3 executor-v2 planner before they plan against the v2 IR

## Steps

1. Resolve the substance (UNII / InChIKey), the mechanism (key; Reactome / GO identifiers) and the molecular entity (HGNC / UniProt).
2. Write the measured statement as `assertion.relate` (subject substance, object molecular entity or mechanism) with basisKind, linked by `edge.structural` OBSERVED_IN_CONTEXT to the context subject (EXPOSED_TO names the exposure).

## Pitfalls

- AFFECTS_MECHANISM is read-only and derived; proposing it is rejected (write the assertion it is projected from).
- Measured in one species or compartment never applies to another.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks ingest-mechanism-evidence --out <dir>`.

## v1 navigation aliases

(none)

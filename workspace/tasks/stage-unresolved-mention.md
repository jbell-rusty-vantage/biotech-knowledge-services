---
id: "task:stage-unresolved-mention"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#stage-unresolved-mention"]
aliases: ["stage-unresolved-mention","stage unresolved mention"]
capabilities: ["get","slice","propose:mention.stage","propose:assessment.record"]
cardDigest: "sha256:cddca6cb9aec85bada4327fb25c5f03bf3636aa4699209eff7a5265a79cb000a"
---
# Task: Stage something you found but cannot resolve or place

Id `task:stage-unresolved-mention` · phase **ingestion** · domains [kernel-and-provenance](../domains/kernel-and-provenance.md) · write route

The surface form is the exact text of a SourceLocator; candidate identities are competing RESOLUTION Assessments that cite the locator with role CONTEXT (v1 Mention nodes are gone).

## Elements

- Node types: [SourceLocator](../nodes/SourceLocator.md), [Assessment](../nodes/Assessment.md)
- Relationship types: [HAS_LOCATOR](../relationships/HAS_LOCATOR.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [ASSESSES](../relationships/ASSESSES.md)
- Read operations (`bks kg read`): (none)
- Proposal kinds (`biotech-knowledge-intent.v2`): `mention.stage`, `assessment.record`
- Pending proposal kinds: `mention.stage`, `assessment.record` — new or changed in v2; they need the S3 executor-v2 planner before they plan against the v2 IR

## Steps

1. Use the exact surface form and the locator; name the candidate node type only when the text makes it obvious.

## Pitfalls

- A staged mention is not a node of the candidate type and never carries facts; the derived MENTIONS edge comes from Chunk projection only.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks stage-unresolved-mention --out <dir>`.

## v1 navigation aliases

(none)

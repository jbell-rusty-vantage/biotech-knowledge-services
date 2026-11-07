---
id: "task:decide-update-or-create"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#decide-update-or-create"]
aliases: ["decide-update-or-create","decide update or create"]
capabilities: ["get","slice","propose:node.upsert","propose:identifier.attach","propose:mention.stage","propose:assessment.record"]
cardDigest: "sha256:5624bff0576c2c557ba44fa29933fb40aafa9a912340722fab010e2d048a90c3"
---
# Task: Should I update an existing node or create a new one?

Id `task:decide-update-or-create` · phase **before-ingestion** · domains [kernel-and-provenance](../domains/kernel-and-provenance.md) · write route

The planner resolves every `mode: new` subject against identifiers, exact names and aliases and applies the subject's `onMatch` policy; competing identity hypotheses are RESOLUTION or EQUIVALENCE Assessments, never edges.

## Elements

- Node types: [Identifier](../nodes/Identifier.md), [Assessment](../nodes/Assessment.md), [SourceLocator](../nodes/SourceLocator.md)
- Relationship types: [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md), [ASSESSES](../relationships/ASSESSES.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md)
- Read operations (`bks kg read`): `node.resolve`, `node.card`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `identifier.attach`, `mention.stage`, `assessment.record`
- Pending proposal kinds: `mention.stage`, `assessment.record` — new or changed in v2; they need the S3 executor-v2 planner before they plan against the v2 IR

## Steps

1. Resolved from the read snapshot -> subject `mode: resolved` with the uid; property changes go in `node.upsert`, only for types whose register executorOps include update.
2. Same (scheme, issuer, normalized value) -> same node (`onMatch: use_existing`); the same value from another issuer never establishes identity (R-42).
3. Same name but no identifier -> `onMatch: review` (default). Add an identifier or record an EQUIVALENCE / RESOLUTION Assessment.
4. Known to be a different thing with the same name -> `onMatch: create_anyway` with a distinguishing `uidSegment` and the reason in `rationale`.
5. Cannot place it at all -> `mention.stage`; v2 writes the SourceLocator and queues a RESOLUTION Assessment (no Mention node).

## Pitfalls

- Similar name does not imply same identity; a shared identifier value across different issuers is not the same identity either.
- Executor creatability comes from the node register (mutations.executor), not from GraphQL; create-only types (RegistrationVersion, StudyResult, ProtocolEdition) are never updated.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks decide-update-or-create --out <dir>`.

## v1 navigation aliases

(none)

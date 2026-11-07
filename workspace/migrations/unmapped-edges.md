---
id: "migration:unmapped-edges"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:migration/v1-map.yaml#unmappedEdges"]
aliases: ["unmapped-edges","seven unmapped v1 edges"]
capabilities: ["get"]
cardDigest: "sha256:a90347053cb14b08c970c12e2a71a4e225b409aae9344a12c9b5702fb692ce02"
---
# Seven unmapped v1 edges

Navigation only: how a v1-proposal name maps to release biotech-schema-v2.2.0. This is never an execution script; data migration is owned by S8. A removed concept points here, never at a silently substituted type. Legend: [README](README.md).

Handled by DECISIONS (`decisions/DECISIONS.md`, "Seven unmapped legacy relationships"); policy for any v1-shaped import.

| v1 | handling | v2 constructs | lineage | quarantine | owner |
| --- | --- | --- | --- | --- | --- |
| `ABOUT_CONDITION` | Convert the sourced observation to an Assertion about Condition with registered predicate/context; retain old edge ID in mapping lineage. | [Assertion](../nodes/Assertion.md), [Condition](../nodes/Condition.md) | old edge id retained | no | S8 |
| `ASSESSES_CLAIM_EVIDENCE` | Map assessment to Claim through ASSESSES and link judged assertions by DERIVED_FROM; do not point Assessment at unsupported Assertion targets. | [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md) | old edge id retained | no | S8 |
| `CLAIM_EVIDENCE_BASED_ON` | Preserve the evidence dependency through DERIVED_FROM and locator-backed HAS_EVIDENCE as appropriate; no invented support verdict. | [DERIVED_FROM](../relationships/DERIVED_FROM.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | old edge id retained | no | S8 |
| `DEPENDS_ON` | Keep dependency semantics in the versioned protocol execution/step artifact until a registered v2 representation is accepted; quarantine graph-only migration, retain old edge, report unsupported traversal. Do not turn dependency into mere ordering. |  | old edge id retained | yes | S8 |
| `HOSTS_CHANNEL` | Map hosting/distribution meaning to supported Channel/platform properties or registered operator/distribution predicate only after endpoint inspection; ambiguous hosting is retained in migration quarantine. | [Channel](../nodes/Channel.md) | old edge id retained | yes | S8 |
| `PART_OF_PLAN` | Map evidenced membership to ProtocolEdition/step containment; retain unsupported runtime-plan membership externally. | [ProtocolEdition](../nodes/ProtocolEdition.md) | old edge id retained | yes | S8 |
| `USES_COMPONENT` | Map true intervention means to registered regimen/step/component representations; unresolved dose/role meaning is quarantined. | [Intervention](../nodes/Intervention.md), [InterventionComponent](../nodes/InterventionComponent.md) | old edge id retained | yes | S8 |

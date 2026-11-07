---
id: "task:correct-a-stale-fact"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#correct-a-stale-fact"]
aliases: ["correct-a-stale-fact","correct a stale fact"]
capabilities: ["get","slice","propose:edge.close","propose:edge.assert"]
cardDigest: "sha256:63459e26818c0d4855c7b30c8597744c3ba9203c32093229b7177e49ccc290f2"
---
# Task: Correct or end a fact that is no longer true

Id `task:correct-a-stale-fact` · phase **ingestion** · domains [kernel-and-provenance](../domains/kernel-and-provenance.md) · write route

Nothing is deleted or edited in place. A new Assertion by the same asserter supersedes the old one (supersedesUid), the old edge episode is closed by writing recordedTo once, and a new episode carries the corrected validity.

## Elements

- Node types: [Assertion](../nodes/Assertion.md)
- Relationship types: [HAS_SUBJECT](../relationships/HAS_SUBJECT.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md)
- Read operations (`bks kg read`): `assertion.about`, `node.neighbors`, `state.asOf`
- Proposal kinds (`biotech-knowledge-intent.v2`): `edge.close`, `edge.assert`
- Pending proposal kinds: (none)

## Steps

1. Read the current episode(s) with `node.neighbors` (the edge carries relationshipUid and assertionUid).
2. `edge.close` the stale episode with a reason; `edge.assert` the replacement with explicit validity and the new source locator; a correction occurrence is the CORRECTS predicate plus DERIVED_FROM the corrected occurrence.

## Pitfalls

- A correction is a new recorded-time episode, never a change of valid time on the old one; ingestion time never substitutes for unknown valid time.
- [object Object]

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks correct-a-stale-fact --out <dir>`.

## v1 navigation aliases

(none)

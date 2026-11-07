---
id: "task:trace-answer-to-source"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#trace-answer-to-source"]
aliases: ["trace-answer-to-source","trace answer to source"]
capabilities: ["get","slice"]
cardDigest: "sha256:a653643fd076197172e0469b9c112b603d40b5b6e8d56100a4bb239dfc393045"
---
# Task: Trace an assertion to its source span and adjudication

Id `task:trace-answer-to-source` · phase **query** · domains [kernel-and-provenance](../domains/kernel-and-provenance.md) · read route

The kernel TRACE (query catalog P-01); every sentence of an answer cites assertion uids and the trace reports gaps instead of hiding them.

## Elements

- Node types: [Assertion](../nodes/Assertion.md), [SourceLocator](../nodes/SourceLocator.md), [SourceSnapshot](../nodes/SourceSnapshot.md), [Source](../nodes/Source.md), [Adjudication](../nodes/Adjudication.md), [Activity](../nodes/Activity.md)
- Relationship types: [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [HAS_LOCATOR](../relationships/HAS_LOCATOR.md), [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md), [ASSESSES](../relationships/ASSESSES.md), [ASSERTED_BY](../relationships/ASSERTED_BY.md), [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md)
- Read operations (`bks kg read`): `assertion.trace`, `assertion.about`
- Proposal kinds (`biotech-knowledge-intent.v2`): (none)
- Pending proposal kinds: (none)

## Steps

1. Collect assertion uids from `assertion.about` on the subject, then run `assertion.trace` with the answer's recorded-as-of viewpoint; split HAS_EVIDENCE by role (SUPPORTS vs CONTRADICTS).

## Pitfalls

- An ACCEPTED status means the capture is faithful, not that the proposition is true; truth after a mission is the Report verdict.
- Answers cite SourceLocator + SourceSnapshot.contentHash, never a Chunk or an Association.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks trace-answer-to-source --out <dir>`.

## v1 navigation aliases

(none)

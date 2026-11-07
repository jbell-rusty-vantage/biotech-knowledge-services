---
id: "task:what-do-we-know-about-entity"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#what-do-we-know-about-entity"]
aliases: ["what-do-we-know-about-entity","what do we know about entity"]
capabilities: ["get","slice"]
cardDigest: "sha256:148011f9db1a7a87419eca425d5b92d0f7772191cc1999b591fa15e9efd81186"
---
# Task: What do we already know about X? (run before every research mission)

Id `task:what-do-we-know-about-entity` · phase **before-research** · domains [kernel-and-provenance](../domains/kernel-and-provenance.md) · read route

Resolve the mentions in the mission brief to existing nodes, then read their cards, assertions and evidence so research targets gaps instead of re-discovering stored facts.

## Elements

- Node types: [Identifier](../nodes/Identifier.md), [Assertion](../nodes/Assertion.md), [SourceLocator](../nodes/SourceLocator.md), [Activity](../nodes/Activity.md), [Assessment](../nodes/Assessment.md)
- Relationship types: [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md), [HAS_SUBJECT](../relationships/HAS_SUBJECT.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md), [ASSESSES](../relationships/ASSESSES.md)
- Read operations (`bks kg read`): `node.resolve`, `node.card`, `node.neighbors`, `assertion.about`, `count.relationships`
- Proposal kinds (`biotech-knowledge-intent.v2`): (none)
- Pending proposal kinds: (none)

## Steps

1. Build one `node.resolve` operation with every entity mention (name, aliases, any identifier such as UNII, NCT, DOI, ORCID, GTIN, ROR) and the node type you expect.
2. For every match with basis `uid`, `identifier` or `name_exact`, add `node.card` (with `neighbors: true`) and `assertion.about` (assertions whose HAS_SUBJECT or HAS_OBJECT is the node).
3. Record the snapshot id and digest; the ingestion intent cites it and pins `preconditions` from `touched`.
4. Gaps = mentions with no match, or cards whose relationship counts are zero for the relationship types your task writes.

## Pitfalls

- A fulltext hit is a candidate, never a resolution. Confirm with an identifier or an exact name plus a corroborating relationship.
- A node with no Assertion that has HAS_EVIDENCE {role: SUPPORTS} is weakly known; treat it as a gap, not as coverage.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks what-do-we-know-about-entity --out <dir>`.

## v1 navigation aliases

(none)

---
id: "task:interest-conflict-disclosure"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#interest-conflict-disclosure"]
aliases: ["interest-conflict-disclosure","interest conflict disclosure"]
capabilities: ["get","slice","propose:edge.assert","propose:assertion.relate","propose:assessment.record"]
cardDigest: "sha256:3fdeb3ec8dd374d2be8b6e1f74b298310137647b8780f4407c3a47c65859d8e2"
---
# Task: Record a financial interest or conflict and its disclosure

Id `task:interest-conflict-disclosure` · phase **ingestion** · domains [actors-and-institutions](../domains/actors-and-institutions.md), [sources-documents-and-media](../domains/sources-documents-and-media.md) · write route

A sourced interest is an asserted edge (HOLDS_ROLE, HOLDS_STAKE, RECEIVES_VALUE_FROM, CONTENT_SPONSORED_BY); whether it matters for a given claim occurrence is a CONFLICT_RELEVANCE Assessment (D7.conflict-relevance) with relevanceBasis, temporalOverlap and disclosureFinding facets.

## Elements

- Node types: [Person](../nodes/Person.md), [Organization](../nodes/Organization.md), [MediaWork](../nodes/MediaWork.md), [Assertion](../nodes/Assertion.md), [Assessment](../nodes/Assessment.md), [Brand](../nodes/Brand.md)
- Relationship types: [HOLDS_ROLE](../relationships/HOLDS_ROLE.md), [HOLDS_STAKE](../relationships/HOLDS_STAKE.md), [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md), [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md), [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md)
- Read operations (`bks kg read`): `node.resolve`, `node.neighbors`, `assertion.about`
- Proposal kinds (`biotech-knowledge-intent.v2`): `edge.assert`, `assertion.relate`, `assessment.record`
- Pending proposal kinds: `assertion.relate`, `assessment.record` — new or changed in v2; they need the S3 executor-v2 planner before they plan against the v2 IR

## Steps

1. `edge.assert` the interest with its source locator and validity; a disclosure or affiliate link alone is a disclosure Assertion with benefit NOT_STATED (MD-D7-05).
2. Record the relevance judgment as an Assessment that ASSESSES the speaker and the occurrence's Claim, DERIVED_FROM the occurrence and each interest Assertion; disclosureFinding uses INADEQUATE_DISCLOSURE_PER_REGULATOR (canonical spelling).

## Pitfalls

- An interest never implies a recommendation and a recommendation never implies an interest; unknown ties stay unknown until captured evidence (MD-D7-03).
- "An X company" without control evidence stays an assertion with unspecified relation scope; do not project PARENT_OF (MD-D7-07).

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks interest-conflict-disclosure --out <dir>`.

## v1 navigation aliases

(none)

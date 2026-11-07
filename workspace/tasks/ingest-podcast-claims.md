---
id: "task:ingest-podcast-claims"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#ingest-podcast-claims"]
aliases: ["ingest-podcast-claims","ingest podcast claims"]
capabilities: ["get","slice","propose:node.upsert","propose:edge.structural","propose:edge.assert","propose:assertion.relate","propose:assertion.literal","propose:mention.stage"]
cardDigest: "sha256:1e6b74b484ce015764c65801f02a32ccbaacd8682fcd6fe3f040a205ff8a8625"
---
# Task: Ingest claims made in a podcast or video episode

Id `task:ingest-podcast-claims` · phase **ingestion** · domains [sources-documents-and-media](../domains/sources-documents-and-media.md), [actors-and-institutions](../domains/actors-and-institutions.md) · write route

The episode is a MediaWork published by a Channel and captured as a Source; each spoken statement is a claim occurrence (an Assertion with assertionKind CLAIM, speechAct and basisKind) at a media-time locator, ASSERTED_BY the speaker, OCCURS_IN the work and OCCURRENCE_OF its Claim; retellings are DERIVED_FROM the prior occurrence.

## Elements

- Node types: [Channel](../nodes/Channel.md), [MediaWork](../nodes/MediaWork.md), [Source](../nodes/Source.md), [Claim](../nodes/Claim.md), [Assertion](../nodes/Assertion.md), [Person](../nodes/Person.md), [Organization](../nodes/Organization.md)
- Relationship types: [PUBLISHES](../relationships/PUBLISHES.md), [APPEARS_IN](../relationships/APPEARS_IN.md), [OCCURS_IN](../relationships/OCCURS_IN.md), [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md), [ASSERTED_BY](../relationships/ASSERTED_BY.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md), [RENDITION_OF](../relationships/RENDITION_OF.md)
- Read operations (`bks kg read`): `node.resolve`, `node.search`, `assertion.about`
- Proposal kinds (`biotech-knowledge-intent.v2`): `node.upsert`, `edge.structural`, `edge.assert`, `assertion.relate`, `assertion.literal`, `mention.stage`
- Pending proposal kinds: `assertion.relate`, `mention.stage` — new or changed in v2; they need the S3 executor-v2 planner before they plan against the v2 IR

## Steps

1. Declare the episode Source / SourceSnapshot and one MEDIA_TIME locator per quoted span; the MediaWork is RENDITION_OF only with URL / DOI evidence.
2. Resolve speakers to Person (public actors only); an inferred speaker carries asserterBasis:INFERRED plus a RESOLUTION Assessment citing the span.
3. Each claim is one occurrence per independently stated item (MD-D9-01), with the qualifiers that must survive retelling (population:, segment:).

## Pitfalls

- A speaker reporting their practice is not a recommendation; a RECOMMENDS speech act is never a BellLabs recommendation.
- Mentioning a product is not endorsing it; a sponsor read is the segment:SPONSOR_READ qualifier, not editorial content.

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks ingest-podcast-claims --out <dir>`.

## v1 navigation aliases

(none)

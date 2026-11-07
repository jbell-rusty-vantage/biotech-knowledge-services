# Biotech schema v2 and knowledge-service release

Date: 2026-10-11. Status: implementation specification under the owner's pre-authorization to select v2 and resolve its design questions. This packet is standalone; it does not create or change canonical tracker issues. It specifies the release to build, not a completed pin, database migration, deployment, or evaluation.

## Read in this order

1. [Specification](SPECIFICATION.md): decisions, architecture, contracts, search, consumer API, and native reads/writes.
2. [Decision ledger](DECISIONS.md): dispositions for all 160 current entries in the synthesis open-question file; design decisions are separated from unperformed evidence work.
3. [Implementation plan](IMPLEMENTATION.md): work packages, dependencies, owners, acceptance tests, cutover and rollback.
4. [Agent skills](AGENT-SKILLS.md): the dedicated Neo4j skill assessment, first-party skill specifications and evaluation requirements.
5. [Evidence and research](EVIDENCE.md): inspected implementation, official references and validation limits.

The release was implemented and deployed on 2026-10-12 ([STATUS](STATUS.md), [VALIDATION](VALIDATION.md), [RELEASE-MANIFEST](RELEASE-MANIFEST.md)); the one-off team kickoff prompt and the 2026-10-12 session handoff were removed before the public repository move (2026-11-07).

## Selected direction

- Adopt the supplied v2 assembly as the canonical design baseline. Publish a complete upstream release bundle, re-pin it, regenerate the workspace, migrate the data, and deploy the matching API/executor. Record each state separately.
- Preserve filesystem navigation. Extend the existing `bks-schema` executable with structured search and bounded traversal; add OpenAI Vector Store retrieval over generated schema cards. Every retrieval result resolves back to the exact local release.
- Use Neo4j GraphQL for consumer applications. Ship a measured, read-only, persisted-operation API and generated client behind a product BFF.
- Give knowledge agents native named/typed reads and parameterized Cypher read artifacts. Keep canonical writes as domain intents compiled by the trusted Biotech planner into Cypher.
- Share operation/evidence/custody/recovery contracts with Knowledge Services and Mission Control. Keep Neo4j schema meaning, query planning, concurrency and writers in this domain service.
- Retain and use the Neo4j skills selectively, with a first-party version/authority overlay. Analytics is a useful specialist capability; it is not a prerequisite for ordinary graph work.

The current candidate's SHA-256 is `c7cf1235dba876b26460c54a6510028d2dcfc65989787eacd5b446f9034b4793` (verified locally). This is a **baseline identity**, not the final release digest: approved source corrections and release metadata must be assembled and hashed before pinning.

## Scope and authority

The owner requested research and precise docs for a later implementation team. No production changes are made by this packet. It resolves the v2 selection and native-access choices previously left to owner interviews in the platform planning pack. It does not certify scientific facts, licenses, provider access or installed capabilities without evidence.

The existing Biotech rule that schema design is promoted through `biotech-meta/docs/schema` remains in force. The proposal currently lives here; the implementation team must publish its accepted modules/registers/rules upstream and pin that release back here. Do not hand-edit `schema/pinned` or `workspace`, or leave two editable authorities.

Existing dirty edits in this repository's `README.md` and `docs/deployment/graphql-api.md` were left untouched. The broader Knowledge Services sprint can use this packet as an explicit prerequisite and contract input, without waiting for unrelated licensing purchases or optional analytics infrastructure.

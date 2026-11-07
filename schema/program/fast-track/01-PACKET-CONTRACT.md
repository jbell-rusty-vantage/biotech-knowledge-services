# 01 — Packet contract: what every domain agent delivers

A packet is one directory per domain, `schema/program/packets/<id>/` (ids: `K`, `D1` … `D13`). An agent assigned two domains delivers two packets. The files are fixed so the synthesizer can merge mechanically; `node scripts/packet-check.mjs <id>` validates the structural rules. Create the skeleton with `node scripts/packet-skeleton.mjs <id>`.

## Files

| file | purpose | format rules |
| --- | --- | --- |
| `SUMMARY.md` | One page: what the domain is, headline counts (node types, relationship types, pairs), the five highest-value questions, the three biggest cuts, the three biggest risks. | ≤ 60 lines. Written last. |
| `01-ecosystem.md` | The ecosystem survey: organizations, processes, operations, artifacts they produce, which artifacts are capturable sources, what is agent-ready. Across the four lenses (science, economics, community, AI). | Every factual claim carries a citation: URL, title, retrieval date. Group by actor type. |
| `02-questions.md` | The high-value questions. | One table: `id · question · audience (biohacker/investor/researcher/agent) · value (1 essential, 2 foundational, 3 expansion) · polarity (benefit/harm/neutral) · answer kind (retrieved/materialized/assessment/published) · answer shape · sources that can answer it · fixture (yes/no)`. Ids `Q-<id>-nn`; reuse an existing `CQ-*` id when the question already exists and say so. 15–40 rows. At least a third of the rows ask about harm, risk, avoidance or disconfirmation. |
| `03-retrieval-patterns.md` | For every question: the pattern that answers it. | Per question: Cypher shape (path, as-of handling, provenance trace) **or** GDS algorithm (which, over which projection, refresh cadence, what the result is used for) **or** vector/fulltext lookup (which index, which text). State the trace: how the answer cites locators. Mark which patterns need a bitemporal episode on an edge. |
| `04-schema-proposal.graphql` | The module SDL, `@neo4j/graphql` 7.6 syntax. | Starts with the fragment banner `# ---- fragment <id> ----`. Only this module's node types; references to other modules' types only on edges listed in `10-seams.yaml`. Every `@node` type has a docstring with: purpose, identity rule, uid token, the questions it serves. Every `@relationship` field has a docstring `class: structural|asserted|derived; cardinality: …; questions: …` and the directive discipline of 00-DIRECTIVE section 2 (aggregate false, nestedOperations declared, derived read-only). Enums for controlled vocabularies. Kernel types are referenced, never re-declared. |
| `05-relationship-register.yaml` | One entry per relationship type the module declares. | Fields: `type, class, from, to, edgeProperties, cardinality, temporal (episode|recorded-only), questions: [ids], pattern: <ref into 03>, populatedBy: [source/tool ids from 08], fixture: <path>, nestedOperations, aggregate, rationale`. Plus two lists: `predicateOnly:` (predicates that stay `Assertion.predicate` values, with the question that would promote them) and `deferred:` (relationships considered and cut, one line each with the reason). |
| `06-node-register.yaml` | One entry per node type. | Fields: `name, uidToken, identityKeys, identifierSchemes, whyNode (which question needs to filter/join/traverse through it), filterProperties (properties a question filters or sorts on), otherProperties (count only), archetype, mutations (create/update/delete allowed)`. Plus `deferred:` (types considered and cut, with reason) and `mergedInto:` (proposal types this module absorbs). |
| `07-fixtures/` | At least three fixtures from real sources. | Each fixture is a folder: `source.md` (URL, title, retrieval date, snapshot digest if captured), `locators.yaml` (selector kind, exact quote, offsets/page/media time), `assertions.yaml` (the assertions, each with asserter, locator, predicate, subject, object, valid time, and `producedBy: { missionId, runId }`), `intent.json` (a `biotech-knowledge-intent.v1` shaped intent where feasible, see `examples/ingestion-intent.example.json`), `questions.md` (which Q ids this fixture lets us answer, and the expected answer). One fixture must demonstrate the unstructured-to-entity path of 00-DIRECTIVE 3.8. One must be a harm or disconfirmation case. |
| `08-sources-and-tools.md` | The sources and tools this domain needs, scored. | Table per 00-DIRECTIVE / PLAN 6.3 registry fields: `id, kind, provider, access, auth, rateLimits, identifiersEmitted, locatorKinds, readiness 0–3, gap, priority`. Say which were exercised during research (MCP, API, scrape) and what broke. This feeds `tooling/action-space.yaml`. |
| `09-reasoning.md` | The decision log. | Alternatives considered for each node and relationship decision; what was cut and why; the size estimate (node types, relationship types, pairs, widest union) and how it was computed; where the module exceeds budget and the justification; the bitemporal decision per edge; risks; what you would do with twice the budget. This is the file the owner reads to trust the packet. |
| `10-seams.yaml` | Cross-module edges. | `seams: - { type, from, to (module.Type), questions: [ids], direction, owner: this|other }`. Also `sharedVocabularies:` (goal/target, frontier, identifier schemes) this module consumes. |
| `11-open-questions.md` | What you could not decide. | Each with: the question, what evidence would decide it, who owns it (owner/kernel/other domain). Include every conflict between this contract, the directive and your findings. |

## Research standard

- Primary sources first: the organization's own pages, registries, regulators, papers, labels, filings. Secondary sources (reviews, news) only to find primaries.
- Use the tools named in `02-TEAM.md`; record which tool fetched what in `08-sources-and-tools.md`. When a page cannot be fetched by Firecrawl or Tavily, use the browser fallback and record that it was needed (that is a readiness finding).
- Interview the artifacts: for each artifact type the domain depends on (a label, a COA, a registry record, an episode, a listing), read at least two real instances end to end and list their fields in `01-ecosystem.md`.
- Never invent a number, an identifier or a quote. A fixture quote must be copied from the captured page.

## Modeling standard

- Load `.agents/skills/neo4j-modeling-skill/SKILL.md` and `.agents/skills/neo4j-graphql-skill/SKILL.md` before writing the SDL; `neo4j-gds-skill` and `neo4j-vector-index-skill` before writing GDS or vector patterns; `biotech-schema-explore` to navigate the current workspace.
- Start from the current fragment pages (`workspace/fragments/W##.md`) and the domain section of `schema/program/schema-map.md`; every proposal type you drop or merge appears in `06-node-register.yaml` under `mergedInto` or `deferred`.
- Prefer properties and enums over nodes; prefer `Assertion.predicate` over typed relationships; prefer one intermediate node over an n-ary tangle; no supernodes (if a type would collect more than ~12 relationship fields, split by role).
- Use the kernel pattern published by A1 for subject/object, identifiers and mentions. Until it is published (Wave 0, first day), write those edges against the placeholder interface `Subjectable` and note it.

## Acceptance (what `packet-check.mjs` and the synthesizer verify)

1. All files present; SDL parses; the fragment banner names the packet id.
2. Every relationship type in the SDL has a register entry with non-empty `questions`, `pattern`, `populatedBy`, `fixture`; every register entry exists in the SDL.
3. Every node type in the SDL has a register entry with non-empty `whyNode` and `identityKeys`.
4. Every question id referenced anywhere exists in `02-questions.md`; every question has an answer kind.
5. Counts within budget, or each excess element has a justification line in `09-reasoning.md` that starts with `EXCESS:`.
6. No union target wider than 6 members; every `@relationship` has `aggregate: false` and `nestedOperations`; derived fields are read-only.
7. At least three fixtures, one of them the unstructured-to-entity path, one a harm or disconfirmation case.
8. `10-seams.yaml` lists every reference to a type outside the module.

# 03 — Synthesis: from eight packets to one proposal

The synthesizer (S) starts when every packet passes `node scripts/packet-check.mjs <id>`. It writes only under `schema/program/final/`. Its job is to merge mechanically where the contract allows, decide where packets conflict, cut to the final budget, measure, and hand off. It does not re-research domains; a gap goes back to the owning agent as a numbered request in `final/requests.md`, or into `final/open-questions.md` if the run is over.

## Deliverables (`schema/program/final/`)

| file | content |
| --- | --- |
| `00-SUMMARY.md` | Two pages: what the candidate is, the headline numbers against the budget and against the pinned proposal, the ten most important design decisions, the risks, what the owner must decide. |
| `schema/kernel.graphql`, `schema/<domain>.graphql` | The accepted modules after synthesis edits (each still carries its fragment banner). |
| `schema/final_biotech_schema_v2.graphql` | The assembled SDL: shared header, kernel, modules in domain order, seam closure. Produced by `node scripts/assemble-schema.mjs` so it is reproducible. |
| `schema-map.md` | `node packages/schema-workspace/dist/cli.js map --sdl final/schema/final_biotech_schema_v2.graphql --out final/schema-map.md`. |
| `size-report.md` | `print-schema` of the assembled SDL and `scripts/schema-size.mjs` over it. The headline table of 00-SUMMARY comes from here. |
| `questions-catalog.md` | Every question from every packet, de-duplicated, with id, domain, audience, value, polarity, answer kind, the pattern reference, and fixture status. Grouped by audience as well as by domain (the owner wants to see the biohacker, investor and researcher views). |
| `query-patterns.md` | The canonical query shapes of the candidate: the provenance trace, as-of and diff, applicability, the unstructured-to-entity path (00-DIRECTIVE 3.8), ranking/comparison, target-centric ("what helps/hurts target T"), frontier-centric, recommendation-with-conflict, mission lineage (what mission M produced, which missions touched X, what depends on M, what changed between two runs); each with Cypher against the candidate schema and the GDS projections with refresh cadence. |
| `relationship-register.yaml`, `node-register.yaml` | The merged registers, each entry stamped with its module; `predicateOnly` and `deferred` merged; every relationship still has question, pattern, source, fixture. |
| `seams.yaml` and the seam matrix (in `schema-map.md`) | Every cross-module edge, accepted or cut, with the question that justifies it. |
| `vocabularies/` | targets, frontiers, identifier schemes, verdict lattice, goal polarity, claim lifecycle states, answer kinds. |
| `fixtures/` | All packet fixtures, re-pathed, plus three cross-domain fixtures the synthesizer writes: a compound profile (D1+D2+D3+D6), a product comparison (D6+D1+D8), a claim-to-mission-to-report (D9+K+D10). |
| `decision-report.md` | Every merge decision: conflicts between packets (same concept modeled twice, a seam one side declared and the other did not, a type two packets want to own), the ruling, the evidence, the size effect. Every cut made to reach budget, with the question it costs. |
| `migration-notes.md` | Pinned v1 → candidate v2: renamed, merged, removed and new node types and relationship types; property renames (`mongoResearchRunId` → `lastWriterRunId`); what the kg-ops planner, sidecars, task routes and the GraphQL API must change; what existing fixtures in `biotech-meta` still replay. |
| `tooling/action-space.yaml` | Merged from every packet's `08-sources-and-tools.md` by A8's schema; the readiness scorecard and the gap list prioritized by blocked questions. |
| `open-questions.md` | Everything unresolved, with owner and the evidence that would resolve it. |
| `handoff-to-biotech-meta.md` | How this becomes the next ontology-lab run: files to copy, the proposal-index entry, the decisions that need a round, the re-pin steps for this repo. |

## Procedure

1. **Verify inputs.** Run `packet-check` for every packet; refuse to start on a failure. Read every `SUMMARY.md` and `09-reasoning.md` first, then the registers, then the SDLs.
2. **Kernel first.** Accept A1's kernel module as the base. Confirm the subject/object/identifier/mention pattern, the verification.v1 mapping, the claim lifecycle, the Activity ↔ Mission Control linkage, the report skeleton. Any domain packet that bypasses it is sent back.
3. **Vocabulary merge.** Targets (A5), frontiers (A7), identifier schemes (A8/A1), answer kinds, verdict lattice, polarity. One file each under `final/vocabularies/`.
4. **Node merge.** Build the union of node registers. Where two packets model the same concept (expected: Product vs FoodItem vs prepared food; Event in D9 vs D13; Organization roles across D6/D7/D8; Outcome/Condition D2 vs OutcomeDefinition D3), rule once in `decision-report.md` with the question that decides it and assign one owner module.
5. **Relationship merge and seam resolution.** Union of relationship registers; every seam must appear in both modules' `10-seams.yaml` or be ruled on. Promote or demote to `predicateOnly` per the four-column test; nothing without a fixture survives.
6. **Assemble and measure.** `assemble-schema.mjs` → `map --sdl` → `print-schema` → `schema-size.mjs`. Compare with the budget (00-DIRECTIVE section 2).
7. **Cut to budget.** If over budget: first collapse unions wider than 6, then demote relationships whose only questions are value 3 (expansion), then merge node types with fewer than two filter properties into their parent as properties, then split any hub over 12 fields. Record each cut and the question it costs. Re-measure after each pass; stop when within budget or when the next cut would drop a value-1 question (then record the exception for the owner).
8. **Fixtures.** Re-path packet fixtures; write the three cross-domain fixtures; check every fixture's intent against the candidate with the planner where feasible (`node packages/kg-ops/dist/cli.js kg plan <intent>` needs the executor to read the candidate IR; if not feasible in this run, record it).
9. **Write the catalog, patterns, migration notes, summary, handoff.** The summary is written last and only from measured numbers.
10. **Handoff.** `final/RUNLOG.md` with the commands run and their outputs; stop.

## Precedence on conflict

`00-DIRECTIVE.md` → `01-PACKET-CONTRACT.md` → A1's kernel packet → the packet whose question is value 1 → the smaller model. Ties go to `decision-report.md` as an owner decision.

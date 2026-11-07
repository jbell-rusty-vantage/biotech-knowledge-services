# Schema program: from the 15k-line proposal to a slim, domain-sliced, evidence-first graph

Status: draft for owner review · opened 2026-10-08 · owner: BellLabs (John) · program folder: `schema/program/`

The pinned schema (`schema/pinned/final_biotech_schema_proposal.graphql`, run-2026-10-04-fable51-01) is deployed to prove the pipeline, not accepted as final. This document is the plan to replace it: what we are trying to achieve, the facts that constrain us, the domains we will research one by one, the process (research → interview → create → propose → finalize), and the starting positions on the three modeling problems the owner named (derived knowledge, evidence provenance, bio-medical tooling).

Companion files in this folder:

| file | what |
| --- | --- |
| `schema-map.md` | Generated. The node-edge-node map of the pinned SDL: growth tables, domain seams, per-node property and edge tables. `pnpm schema:map` |
| `size-report.md` | Generated. What the executable schema actually contains and which SDL types cause it. `pnpm --filter @bks/graphql-api print-schema <abs path>` then `node scripts/schema-size.mjs <that file> --out schema/program/size-report.md` |
| `domains/*.md` | One kickoff brief per research domain (section 4). |
| `fast-track/` | The executable agent-team run: directive, packet contract, team, synthesis, kickoff prompts. |
| `packets/`, `final/` | Agent output (one packet per domain) and the synthesized candidate. |
| `decisions/` | Program decisions as they are made (one file per decision, numbered). Empty until the first one. |

---

## 1. The problem, measured

The SDL is 15,018 lines; what `@neo4j/graphql` 7.6.3 generates from it is what the API, the agents, and every client actually carry.

| measure | SDL | executable schema |
| --- | ---: | ---: |
| size | 0.9 MB | 55 MB (693,831 lines) |
| node types / object types | 192 | 6,344 |
| relationship fields / input types | 1,082 | 38,034 |
| distinct relationship types | 393 | |
| from→to pairs after union expansion | 3,940 | |
| Query / Mutation fields | | 476 / 530 |
| schema build time | | ~30 s |

Where the executable growth comes from (see `size-report.md`, `schema-map.md`):

1. **Union-typed "any entity" edges.** One union, `AssertionSubjectTarget` (144 members), is the target of 17 fields and alone produces 2,448 of the 3,940 pairs (62%). Eight relationship types (HAS_SUBJECT, HAS_OBJECT, HAS_IDENTIFIER, ABOUT, MENTIONS_ENTITY, DEPICTS, PROPOSES_MATCH, COMPARES_IDENTITIES) produce 67% of all pairs. The library generates a full create/connect/disconnect/delete/update/where/aggregate family **per concrete member**, so every node type we add also grows every one of these 17 fields.
2. **Aggregation inputs.** `NodeAggregationWhereInput` alone is 259,039 lines (37% of the executable). Nothing in the proposal switches aggregation off. Connection filters and `Where` add another 130,000.
3. **Specializations that re-declare the union fields.** `InteractionAssertion`, `RelationshipAssertion`, `ContraindicationAssertion` and `ClaimOccurrence` each carry the subject/object union fields again: 12,000–16,000 generated lines each.
4. **Hubs.** `Organization` declares 59 relationship fields (24,912 generated lines); `Activity` 23, `Person` 22, `Product` 21.
5. **Relationship count itself.** 393 typed relationships, most of them not yet traced to a question anybody will ask the graph. Each costs ~9.7 input types per from→to pair.

The size is a symptom. The cause is that the proposal was produced fragment by fragment (W00–W23) with every fragment allowed to reach every other fragment, and relationships were admitted on plausibility rather than on a question, a retrieval pattern and a source that can populate them.

What the proposal does not yet develop, independent of size:

- **Derived knowledge** (associations, reports, insights, recommendations): no decision on what is computed at query time, what is materialized, what is an assessment node, and what is a published artifact.
- **Evidence provenance as a service contract**: the kernel (Source → SourceSnapshot → SourceLocator → Assertion → Adjudication) is sound, but it is not mapped to the verification module in `ai-engineer-knowledge-services` (`verification.v1`: capture → locate → claims → deterministic checks → semantic judge → policy → sealed bundle), which is the thing that will actually produce verified assertions.
- **Bio-medical tooling**: the graph assumes sources can be fetched, parsed and located. Most biomedical infrastructure is not agent-ready; the action space (what can be searched, fetched, parsed, resolved, and with what identifiers) is undiscovered and it determines which Identifier schemes, Source kinds and locator kinds are real.
- **Domain focus**: the proposal is a sector-neutral ontology. The product is consumer longevity and biotech intelligence; the schema has to be built outward from the domains and questions that matter, with everything else explicitly deferred.

## 2. Goals and non-goals

Goals, each with the evidence that will show it is met:

| id | goal | evidence of completion |
| --- | --- | --- |
| G1 | **Size budget.** The executable schema fits an agent's and a client's working set. | Targets (to be confirmed in Wave 1 by measurement, not asserted): ≤ 600 from→to pairs, ≤ 4,000 input types, ≤ 6 MB printed, build < 5 s. Every proposal carries its `size-report.md`. |
| G2 | **Domain sub-schemas with explicit seams.** Each domain is its own SDL module with a declared list of allowed cross-domain edges; the seam matrix in `schema-map.md` is sparse and intentional. | One module file per domain; a seam ledger; build fails on an undeclared seam. |
| G3 | **Question-driven relationships.** Every typed relationship traces to at least one high-value question, one retrieval pattern (Cypher or GDS) and one source that can populate it. Everything else is an `Assertion.predicate` value. | A relationship register with those three columns filled; no orphan rows. |
| G4 | **Evidence and provenance chain modeled end to end**, aligned with `verification.v1`, from captured bytes to Entity, EntitySnapshot, Report and Recommendation. | A mapping table (section 6.2) accepted; fixtures replayed through the verification executor into the graph. |
| G5 | **Derived knowledge model** for associations, reports, insights and recommendations: which of four kinds each is, and how each is read. | Section 6.1 decided per domain in the research packets; query shapes written for each. |
| G6 | **Bio-medical action space registry**: the universe of biomedical tools and sources, with access mode, identifiers, agent-readiness and the custom tooling we must build. | `tooling/action-space.yaml` plus a prioritized gap list. |
| G7 | **Deterministic visibility.** We can see node-edge-node and properties, and measure executable size, without reading the SDL. | Done 2026-10-08: `pnpm schema:map`, `scripts/schema-size.mjs`. |

Non-goals for this program: the User model and User API (will be a dedicated service; Postgres or Neo4j undecided); the private context store; deployment hardening; the public-tier sub-schema (follows from the slim operator schema). Users will query the graph through Agentic Graph RAG, so the schema is a user-facing feature even though the user model is out of scope here.

## 3. Design rules for the slim schema

These are the rules the research packets design against and the proposal is checked against. Each has a measurable consequence.

- **R1. Any-entity edges leave the GraphQL projection.** `HAS_SUBJECT`, `HAS_OBJECT`, `HAS_IDENTIFIER`, `ABOUT`, `MENTIONS_ENTITY`, `DEPICTS`, `PROPOSES_MATCH`, `COMPARES_IDENTITIES` stay as stored relationships, written by the intent executor (`packages/kg-ops`) and read through a small number of `@cypher` fields or interface-typed read-only fields. Options to measure in Wave 1: (a) interface target (`EntityArchetype`) with `nestedOperations: [CONNECT]` and `aggregate: false`; (b) `@cypher` read fields only, no relationship directive; (c) a thin `Subjectable` interface limited to the ~30 types that are ever subjects. Expected effect: removes most of the 2,448 pairs.
- **R2. Aggregation off by default.** `@relationship(aggregate: false)` everywhere; `@query(aggregate: false)` on every type; opt in per field when a question needs a count. Expected effect: removes the 259,039-line aggregation family.
- **R3. Nested operations are declared, not inherited.** Every `@relationship` names its `nestedOperations`. Structural edges: `[CREATE, CONNECT]`; asserted edges: `[CONNECT]` (the Assertion is created by the executor); derived edges: `[]` and `@settable(onCreate: false, onUpdate: false)`.
- **R4. Specializations do not re-declare kernel fields.** Assertion specializations and `ClaimOccurrence` inherit subject/object through the kernel pattern chosen under R1; they add only their own properties.
- **R5. One owning domain per node type; seams are a budget.** A domain module may reference another domain's types only through edges listed in its seam block. The seam matrix is reviewed as a whole; a dense row is a design smell.
- **R6. A relationship earns its type.** Admission requires: a question id, a retrieval pattern, a populating source or tool, and a fixture. Otherwise it is predicate-only (`Assertion.predicate`), which costs nothing in the executable.
- **R7. Hubs are split by role, not by adding fields.** `Organization` with 59 fields becomes Organization plus role edges that live in the domain that asks about them (sponsor in evidence, seller in commerce, manufacturer in quality).
- **R8. Derived projections are read-only and regenerable.** They never generate mutation inputs and are rebuilt from assertions plus a named method version.
- **R9. The kernel is small and boring.** Entity, identity, bitemporal time, Assertion, Source/Snapshot/Locator, Adjudication, Activity/Agent. It changes only by a recorded kernel decision.
- **R10. Measured, not argued.** A proposal without its `size-report.md` and `schema-map.md` is not reviewable.

Levers available in `@neo4j/graphql` 7 and what each removes (to be validated by the Wave 1 experiment matrix):

| lever | removes | currently used |
| --- | --- | ---: |
| `@relationship(aggregate: false)` | per-field aggregation inputs and connection aggregates | 0 of 1,082 fields |
| `@relationship(nestedOperations: [...])` | nested create/connect/disconnect/delete/update input families per from→to pair | 0 of 1,082 fields |
| `@query(read:, aggregate:)`, `@mutation(operations: [])` | root query/aggregate/mutation fields per type | mutation limits only |
| `@settable`, `@selectable`, `@filterable` | create/update inputs, selection, where inputs per field | partial |
| interface instead of union as target | per-member Where/Sort/Aggregate families (create families remain per implementer) | 0 |
| `@cypher` read field instead of `@relationship` | the whole family; read-only | few |
| removing the relationship | everything | — |

## 4. The domain roster

The ecosystem is sliced by what people and organizations do, across four lenses: science, economics, community, and AI. Each domain gets a research packet (section 5.1) and a kickoff brief in `domains/`. The current proposal's fragments are listed so the research starts from what exists.

| id | domain | lens | current fragments (node types) | lead question | brief |
| --- | --- | --- | --- | --- | --- |
| K | **Kernel: evidence, identity, time** (not a research domain; a contract) | all | W00 (13), W19 (3), W20 (4), W23 (3) | How does a verified claim become an assertion, an entity state, a report, a recommendation, and stay traceable to bytes? | `domains/K-kernel-evidence-provenance.md` |
| D1 | **Compounds and ingredients** | science | W02 (12), W05 (3) | What is actually in a consumer supplement, in what form and amount, and what is it chemically? | `domains/D1-compounds-and-ingredients.md` |
| D2 | **Mechanisms and biology of aging** | science | W03 (10) | Which mechanism does this compound act through, in which model, measured or inferred, and what outcome does that plausibly move? | `domains/D2-mechanisms-and-biology.md` |
| D3 | **Clinical and preclinical evidence** | science | W09 (13), W10 (7) | What did the studies administer, to whom, with what result, and does it apply to this use? | `domains/D3-clinical-and-preclinical-evidence.md` |
| D4 | **Diagnostics, biomarkers and measurement** | science | W07 (13), W08 (6) | Are two measurements comparable, which test measures what, and what changed? | `domains/D4-diagnostics-and-measurement.md` |
| D5 | **Interventions, protocols and safety** | science · community | W06 (2), W16 (10), W17 (5) | What does a protocol prescribe, what is contraindicated, what interacts, for whom? | `domains/D5-interventions-protocols-safety.md` |
| D6 | **Consumer products and commerce** | economics | W04 (10), W15 (10) | What is this product, what does the label declare, who sells it at what price, and did it change? | `domains/D6-products-and-commerce.md` |
| D7 | **Organizations, people and money** | economics · community | W01 (9) | Who makes, funds, sells, studies, advises and promotes, and what financial interest connects them? | `domains/D7-organizations-people-money.md` |
| D8 | **Manufacturing, quality, regulation and IP** | economics | W11 (5), W12 (13), W13 (10), W14 (7) | Is this lot what the label says, is this ingredient lawful here, who holds the rights? | `domains/D8-quality-regulation-ip.md` |
| D9 | **Sources, media and discourse** | community | W18 (5), W21 (11), W22 (8) | Who said what, where, when, retelling whom, with what authority and what conflict? | `domains/D9-sources-media-discourse.md` |
| D10 | **Derived knowledge: associations, insights, reports, recommendations** | AI | W10 (part), W23 (3), derived edges | What should the graph compute, store, or publish, and how does a user get an answer with its trace? | `domains/D10-derived-knowledge.md` |
| D11 | **Bio-medical tooling action space** | AI | none (cross-cutting) | What can an agent search, fetch, parse, resolve and verify today, with which identifiers, and what must we build? | `domains/D11-biomedical-action-space.md` |
| D12 | **Food and nutrition** (added 2026-10-08) | science · economics | W05 (part), W02 (Nutrient, Constituent) | What does this food or prepared food deliver, at this preparation, and what helps or harms which target? | `domains/D12-food-and-nutrition.md` |
| D13 | **Frontiers, breakthroughs and events** (added 2026-10-08) | economics · community | W18 (5) | What happened on frontier F, in what order, caused by what, and who is active there? | `domains/D13-frontiers-and-breakthroughs.md` |

Scope candidates deliberately outside the first pass (attachment points exist): omics and cell/gene therapy, industrial and agricultural biotech, clinical practice and EHR data, payer and market access, private personal data.

The executable run of this roster (agent assignments, packet contract, synthesis, kickoff prompts) is `fast-track/`; the owner's directive with the slimming budgets and the clarified concepts (targets, harm, food, claim lifecycle, ranking, frontiers, unstructured-to-entity, recommendations) is `fast-track/00-DIRECTIVE.md` and takes precedence over section 6 below where they differ.

## 5. Process

Five phases, run as waves. Research domains run in parallel; the kernel and D10/D11 run alongside because every other domain depends on them.

### 5.1 Research (per domain)

Inputs: the kickoff brief, the current fragment pages (`workspace/fragments/W##.md`), the domain section of `schema-map.md`, the competency-question catalog in `biotech-meta/docs/schema/ontology-lab/competency-questions.md`, and the Wave-0 measurements.

Activities, in order:

1. **Ecosystem survey.** Who the organizations are, what their processes and operations are, what artifacts they produce (labels, COAs, registrations, filings, episodes, price pages), and which of those artifacts are sources we can capture. Modern operations, not textbook ontology: what a longevity clinic, a supplement brand, a contract lab, a trial sponsor, a podcast, a testing organization actually does and publishes.
2. **High-value questions.** 15–40 questions a paying user, an analyst, or an agent will ask, each with: audience, value, answer shape, the sources that can answer it, and whether the answer is retrieved, computed or published (section 6.1). Reuse existing CQ ids where they match; otherwise mint `Q-<domain>-nn`.
3. **Retrieval patterns.** For each question: the Cypher shape (path, as-of, provenance trace) or the GDS algorithm (similarity, community detection, centrality, link prediction, path finding) with the projection it needs, and the vector or fulltext index it uses. GDS patterns must say what the projected graph is and how often it is rebuilt.
4. **Node-edge-property proposal.** Only what the questions need: node types with identity rules and properties; relationships with class, cardinality, edge properties, the question id, the retrieval pattern, the populating source or tool, and a fixture. Everything else explicitly listed under "predicate-only" or "deferred".
5. **Seams.** The edges into other domains, each justified by a question.
6. **Size estimate.** Pairs and fields counted; the module compiled alone with `print-schema` where possible.

Output: a research packet in `schema/program/packets/<id>/` with `01-ecosystem.md`, `02-questions.md`, `03-retrieval-patterns.md`, `04-schema-proposal.graphql` (module SDL), `05-seams.yaml`, `06-fixtures/`, `07-sources-and-tools.md`, `08-open-questions.md`. Exit: every relationship in 04 has a row in 02, 03 and 07.

### 5.2 Interviews

Three tracks, each with a guide written during research and run after the first packets exist:

- **People.** The owner; prospective users by persona (biohacker/consumer, clinician, researcher, brand or product operator, content producer, investor/analyst); domain experts (formulation chemist, clinical trialist, lab director, regulatory consultant, podcast producer). The guide asks for real recent questions, the sources they trust, the artifacts they handle, what they would pay for, and where they have been misled.
- **Artifacts.** Structured reading of real artifacts per domain (labels, COAs, trial records with their version histories, episodes, listings, filings): what fields exist, what is missing, what is ambiguous. This is where the proposal's property lists are confirmed or cut.
- **Agents.** Run agents (research, ingestion, question answering) against the current graph and the candidate modules, record where they fail: wrong type chosen, relationship missing, identity collision, unanswerable question. Failures are inputs to 5.3.

Output: `schema/program/interviews/<track>/<id>.md` with findings mapped to question ids and schema elements. Exit: each domain packet has at least one people interview, one artifact interview and one agent run recorded.

### 5.3 Create

Assemble the domain modules into one candidate schema:

1. Kernel module first (R9), frozen for the wave.
2. Domain modules merged by a build step that validates seams against `05-seams.yaml` and fails on undeclared cross-domain edges.
3. Sidecars rewritten for the new domains (`schema/sidecars/domains.yaml` and the task routes).
4. `pnpm schema:map`, `print-schema`, `scripts/schema-size.mjs` for the candidate; results in the packet.
5. Fixtures from 5.1 and the existing `biotech-meta` fixtures replayed on disposable Neo4j (`scripts/neo4j-test.sh up`); the kg-ops planner must plan every fixture intent.

Exit: size within budget (G1) or a recorded exception per overage; all fixtures plan and apply; seam matrix reviewed.

### 5.4 Propose

The candidate goes through the ontology-lab discipline already in `biotech-meta` (cooperative-adversarial rounds): a challenger pass per domain, a conflict ledger, decisions recorded with fixture evidence. New here: every decision cites its size effect. The output is a proposal run directory in `biotech-meta/docs/schema/ontology-lab/` and a proposed re-pin.

### 5.5 Finalize

Re-pin (`schema/pinned`, `PIN.json` digests), rebuild the workspace, rerun unit and integration suites, deploy the GraphQL API, run the baseline-comparison evals (`evals/baseline-comparison`) against the old and new schema, and record the result as the acceptance evidence. Only then is the schema "final" for this version.

## 6. Three modeling problems: starting positions

These are positions to be tested by the research, not decisions.

### 6.1 Derived knowledge: associations, insights, reports, recommendations

Four kinds, decided per answer shape by working backwards from the question:

| kind | stored? | example | how it is read | provenance |
| --- | --- | --- | --- | --- |
| **Retrieved** | no | "Which trials administered NR at ≥ 500 mg/day?" | Cypher path over asserted edges | the assertions on the path |
| **Materialized projection** | yes, regenerable (DerivedEdgeProperties, method version) | association score compound↔outcome from GDS over evidence subgraph; "related entities" | derived edge or node, read-only, rebuilt on schedule | `derivationRule`, method version, input assertion set digest |
| **Assessment** | yes, immutable, versioned, supersedable (EvidenceAssessment archetype) | evidence synthesis, safety signal, applicability, an "insight" an analyst or agent asserts | node with SUPPORTED_BY locators and CONSIDERS_ASSESSMENT inputs | the assessing Agent/Person, Activity, inputs |
| **Published artifact** | yes, insert-only skeleton in the graph; body elsewhere | report, recommendation, answer record | AnswerRecord/Report node citing assertions, assessments, locators, PolicyVersion | the policy version, the citing run, the bundle digest |

Rules that follow: an Insight is an Assessment, never a free-floating node; an Association is a materialized projection, never asserted; a Recommendation is a published artifact whose claims are assessments or assertions, never a stored edge from a person to a product (the proposal's `RECOMMENDS` derived-only ruling stands); Reports are skeleton-in-graph, body-in-store. The research must decide, per domain, which questions produce which kind and what the agent needs to show the trace.

### 6.2 Evidence provenance, aligned with `verification.v1`

The verification module in `ai-engineer-knowledge-services` is the producer of verified claims; the graph is a consumer. Proposed correspondence:

| verification.v1 | graph | note |
| --- | --- | --- |
| captured artifact (bytes, digest, storage key) | `SourceSnapshot` (`contentHash`, `storageUri`, `retrievedAt`) | one snapshot per captured representation |
| source identity and authority assessment | `Source`, `SourceAuthorityAssessment` | authority is per claim kind, never global |
| locator (selector, exact, offsets, page, media time) | `SourceLocator` | same selector vocabulary; `REANCHORS` for re-found spans |
| atomic claim | `Assertion` (`predicate`, subject/object, valid time, status) | one asserter per assertion |
| deterministic checks + semantic verdict (`directly_supported` … `unverifiable`) | `Adjudication` (kind CAPTURE_FIDELITY / SUPPORT) with the verdict lattice value and judge identity | verdict is capture fidelity, never truth |
| policy outcome (`pass`, `pass_with_warnings`, `review`, `fail`, `abstain`) | admission disposition on the ingestion receipt; `PolicyVersion` on published answers | policy is the admission authority |
| sealed audit bundle | `Activity` (`externalRunId`, bundle digest) | the graph stores the digest, not the bundle |
| mission, run, operation identity (Mission Control) | `Activity` (`missionId`, `runId`, `activationId`, `activityKind`) | the single lineage spine; "which mission produced what" is a kernel question |
| entity resolution outcome | `ResolutionHypothesis`, `EquivalenceAssessment`, `Identifier` | |
| derived numbers (unit conversion, moiety mass) | `Assertion` with `derivationRule` and `DERIVED_FROM_ASSERTION` | never a declaration |

Open: whether the graph should hold a `VerificationRun` node at all or only the bundle digest on Activity; which verdict values map to `ACCEPTED` vs `DISPUTED` status; how an Entity Snapshot (a frozen state payload) cites the assertions it was built from; the Report skeleton's minimum citation set.

### 6.3 Bio-medical tooling action space

Premise: biomedical infrastructure is largely not agent-ready (no stable APIs, no locators, rate-limited, inconsistent identifiers), and teams end up building custom search and parsing layers. We will inventory the universe, score readiness, and decide what to build, because this decides which `Source` kinds, `Identifier` schemes and `SourceLocator` kinds are real.

Registry schema (`tooling/action-space.yaml`, one entry per tool or source):

`id, domain(s), kind (search | fetch | parse | resolve | verify | compute), provider, access (api | mcp | bulk | scrape | manual), auth, rate limits, identifiers emitted (PMID, NCT, UNII, CAS, GTIN, LOINC, DOI, …), locator kinds possible, readiness (0–3: blocked, scrape-only, api-no-locators, agent-ready), gap (what custom tooling is needed), priority, owner`.

First inventory to score, by domain: PubMed/E-utilities, Europe PMC, OpenAlex, Crossref, Unpaywall, bioRxiv/medRxiv, Semantic Scholar (D3, D2); ClinicalTrials.gov v2, WHO ICTRP, EU CTR (D3); PubChem, ChEBI, FDA GSRS/UNII, CAS, NIH DSLD, NIH ODS fact sheets, USDA FoodData Central (D1); Reactome, KEGG, UniProt, Open Targets, GO, Hallmarks-of-aging curated sets (D2); LOINC, UCUM, lab vendor documentation, clock publications (D4); openFDA, DailyMed, FDA NDI/GRAS notices, warning letters, Health Canada LNHPD, EFSA, USPTO/EPO/Google Patents, NSF/USP/Informed Sport databases (D8); Amazon, Shopify, iHerb, brand sites, Labdoor/ConsumerLab (D6); podcast RSS, YouTube transcripts, Spotify/Apple catalogs, Substack (D9); OpenCorporates, SEC EDGAR, Crunchbase, NPI registry (D7). The MCP servers already attached to this workspace (PubMed, ClinicalTrials, bioRxiv, ICD-10, NPI, Firecrawl research index) are the first tier to score.

## 7. Measurement and tooling (available now)

| tool | command | use |
| --- | --- | --- |
| schema map | `pnpm schema:map` → `schema/program/schema-map.md` | read the schema as node-edge-node with properties; find growth, hubs, seams |
| executable print | `pnpm --filter @bks/graphql-api print-schema C:/abs/path/out.graphql` | what the API really exposes (~30 s) |
| size report | `node scripts/schema-size.mjs runs/executable-schema.graphql --out schema/program/size-report.md` | attribute executable size to families and node types |
| workspace | `pnpm workspace:build`, `pnpm workspace:verify` | agent navigation tree; drift check |
| per-domain map | `node packages/schema-workspace/dist/cli.js map --domains products-and-commerce --out runs/d6.md` | one domain's view |

The Wave 1 experiment matrix uses these on small synthetic SDLs to establish the actual effect of each lever in section 3 before any domain packet commits to a pattern.

## 8. Waves

| wave | what | done when |
| --- | --- | --- |
| 0 | Instrument and baseline: map, size report, this plan, kickoff briefs | 2026-10-08 |
| 1 | Lever experiment matrix (R1–R3 options measured); kernel contract draft (K); action-space registry schema and first-tier scoring (D11); size budget confirmed | numbers in `decisions/0001-size-levers.md` |
| 2 | Research packets D1–D10 in parallel (agent team, one packet per agent, the K and D11 drafts as shared inputs) | eight packet files each, exit criteria met |
| 3 | Interviews (people, artifacts, agents); packet revisions | interview records mapped to question ids |
| 4 | Create: modules assembled, sidecars rewritten, fixtures replayed, measured | within budget or exceptions recorded |
| 5 | Propose: challenger rounds, conflict ledger, proposal run in `biotech-meta` | decision report |
| 6 | Finalize: re-pin, rebuild, deploy, evals old vs new | acceptance evidence recorded |

## 9. Decision rights and where things live

- Semantic authority stays in `biotech-meta/docs/schema` (catalog, ontology-lab rounds). This repo runs the program, owns the tooling and the measurements, and consumes a pin. Packets and interviews live here under `schema/program/`; accepted schema changes are proposed to `biotech-meta` and re-pinned.
- The owner decides: the size budget, the domain roster, which questions are "high value", the derived-knowledge positions in 6.1, the verification mapping in 6.2, and the "final" call in Wave 6.
- Agents decide within a packet: properties, cardinalities, seams, fixtures, and may propose new questions; they never admit a relationship without the four R6 columns.

## 10. Questions for the owner before Wave 1

1. Size budget: is the G1 target (≤ 600 pairs, ≤ 4,000 input types, < 5 s build) the right order of magnitude, or should the operator schema be smaller still and the executor carry more?
2. Domain roster: is the D1–D11 split right? In particular, should D5 (interventions, protocols, safety) be split into protocols (community) and safety (science)?
3. Which user personas should the people interviews prioritize first?
4. Should the graph hold a `VerificationRun` node (6.2), or only the bundle digest?
5. Which bio-medical tools do we already have credentials or contracts for (D11 scoring needs this)?

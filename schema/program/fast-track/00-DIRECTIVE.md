# 00 — Directive: what the schema is for and the rules that outrank everything else

Owner directive, 2026-10-08. Every agent reads this before its brief. When a brief, a skill or a prior document conflicts with this file, this file wins; report the conflict in `11-open-questions.md` rather than choosing silently.

## 1. Mission

BellLabs Biotech is to be the go-to repository of biotech and longevity knowledge for three audiences: **biohackers** (people pursuing targets such as sleep, strength, brain fitness, longevity), **investors** (who need to see what is real, who is behind it, and what just happened), and **researchers** (who need the evidence, its provenance and its gaps). The knowledge graph is the product's core. Users will query it through Agentic Graph RAG; agents will read it, write to it through intents, and be judged on whether what they wrote can be traced to captured bytes.

## 2. The overriding directive: slim and efficient

The schema must be as small and efficient as it can be while still supporting everything we need, including bitemporal time and the evidence chain. This is prioritized above completeness, above elegance, and above fidelity to the current proposal. It serves three things at once: agents (a schema they can hold and reason over), the Neo4j GraphQL API and the machines that run it (the current executable is 55 MB, 38,034 input types, ~30 s to build), and us (a schema we can actually review).

Concretely, every agent **actively chooses** the most important nodes and edges and argues for each one. The default answer to "should this be a node type / a typed relationship" is **no**. A thing becomes a node type only when a high-value question needs to filter, join or traverse through it; a typed relationship only when a question traverses it; otherwise it is a property, an enum value, or an `Assertion.predicate` value.

Budgets (the synthesizer enforces; a module may exceed one only with a justification row per excess element):

| scope | node types | relationship types | from→to pairs | union members per target |
| --- | ---: | ---: | ---: | ---: |
| kernel module (K) | ≤ 12 | ≤ 14 | ≤ 40 | ≤ 6 |
| each domain module | ≤ 8 | ≤ 14 | ≤ 35 | ≤ 6 |
| final assembled schema | ≤ 90 | ≤ 160 | ≤ 600 | ≤ 6 |
| final executable (print-schema) | | | ≤ 4,000 input types · ≤ 6 MB · < 5 s build | |

For comparison the pinned proposal has 192 node types, 393 relationship types, 3,940 pairs, one union with 144 members.

Rules that implement the directive (from `../PLAN.md` section 3, restated as obligations):

1. **No any-entity edges in the GraphQL projection.** Nothing targets a union wider than 6 members. Subject/object of an Assertion, identifiers, mentions and depictions are carried by the pattern the kernel agent (A1) chooses in Wave 0 of this run and publishes in `../packets/K/09-reasoning.md`; domain agents use that pattern and never invent their own.
2. **Aggregation off.** Every `@relationship` carries `aggregate: false`; every type carries `@query(aggregate: false)`; opt in per field with a question id.
3. **Nested operations declared.** Every `@relationship` names `nestedOperations`: structural `[CREATE, CONNECT]`, asserted `[CONNECT]`, derived `[]` with `@settable(onCreate: false, onUpdate: false)`.
4. **No re-declared kernel fields** on specializations.
5. **One owning module per node type; seams declared** in `10-seams.yaml`; an undeclared cross-module edge fails synthesis.
6. **A relationship earns its type** with four things: question id, retrieval pattern, populating source or tool, fixture.
7. **Hubs split by role.** No node type declares more than 12 relationship fields.
8. **Derived projections are read-only and regenerable**, with a method version.
9. **Bitemporal time stays**, as the existing profile (valid time declared, recorded time service-assigned, half-open intervals, nothing deleted), but on the smallest number of edges that need an episode. Say which edges need it and why; the rest carry only recorded time.
10. **Measured.** Every module ships its own size numbers; the synthesizer ships `schema-map.md` and `size-report.md` of the assembled candidate.

## 3. Concepts the owner has clarified (model these; they were under-served by the proposal)

### 3.1 Targets: what people are trying to achieve

People have biohacking targets: sleep, strength, brain fitness, body composition, longevity, energy, mood, recovery. Protocols, supplements, compounds, devices, foods and activities are the means. The graph must answer "what helps or hurts target T, by what evidence, for whom" and "what is this product or protocol *for*". The current `FunctionalGoal` and `Target` (W16) are the seed. Owner: A5 (D5), with the goal vocabulary shared by every domain through a seam. Keep the goal set small and curated; it is a controlled vocabulary with a node per goal, not free text.

### 3.2 The bad is as important as the good

Harm, risk and avoidance are first-class: foods and prepared foods from specific organizations (a fast-food chain's product is a product with a formulation and an organization behind it), exposures, contaminants, interactions, over-dosing, fraud. Every domain lists the negative questions beside the positive ones ("what should a person with goal T avoid, by what evidence"). Nothing in the model may encode "good" or "bad" as a property of an entity; it is always an assessment or an assertion with a source and a direction of effect on a target.

### 3.3 Food

Food is hard: reference foods (USDA-style concepts), alleged longevity foods and special foods, specific branded products and prepared foods, preparation techniques (fermentation, frying, sous-vide), dietary patterns, and composition (what compounds a food delivers in what amount at what preparation). Owner: A2 as D12 (new domain), seamed to D1 (compounds), D6 (products), D7 (organizations). Decide what is a `FoodItem`, what is a `Product`, what a preparation does to composition, and keep it to the questions the three audiences ask.

### 3.4 Claims are extracted, vetted, and then attacked

We extract claims from sources. A claim goes through vetting. Some vetted claims become **evidence research missions**: missions whose purpose is to try to disqualify the claim, so that a claim that survives is one that passed the test. The outcome of a mission is an **evidence report**. This is the scientific loop and it is a core product feature. Model the lifecycle: `Claim` (the proposition) → `ClaimOccurrence` (who said it where, with locator) → vetting (an assessment with a disposition: ignore, monitor, research) → an evidence mission (an `Activity` of kind evidence-mission, run by Mission Control, with its run id) → an evidence report (a published artifact that cites the assertions, assessments and locators it rests on and states a verdict with the verdict lattice of `verification.v1`). Owner: A1 (K + D10). The mission itself lives in Mission Control; the graph holds the Activity, the report skeleton and the links.

### 3.5 Ranking, comparing and contrasting

"Rank these NMN products", "compare these two CGMs", "which magnesium form for sleep". Position to test: a comparison is **computed** (retrieved at query time or a materialized projection with a method version), never a stored fact, until it is **published**, at which point it is a published artifact (a comparison report) whose rows cite the assertions they rest on. Ranking criteria are `DecisionCriterion` records with versions. Owner: A1 (D10) decides the pattern; every domain lists its comparison questions and the properties they rank on.

### 3.6 Associations, derived insights, evidence reports

Three different things (PLAN 6.1): an **association** is a materialized projection (a score between two entities under a method version, regenerable); a **derived insight** is an assessment node asserted by an agent or analyst with inputs and supersession; an **evidence report** is a published artifact (3.4). None of them is ever a plain edge between two domain entities with a confidence number on it.

### 3.7 Breakthroughs and frontiers

We track breakthroughs in biotech: events and the relationships between them (a readout leads to an approval leads to a launch; a financing follows a result). Investors need this. The owner asks whether to model "breakthrough domains" such as "curing X type of cancer" literally. Position to test: yes, as a small curated **Frontier** node (a research or therapeutic frontier: "senolytics in humans", "partial epigenetic reprogramming", "curing pancreatic cancer") that events, studies, organizations, compounds and claims attach to, with milestones as events. A frontier is a goal-like vocabulary node (like 3.1 targets, but for the field rather than the person). Owner: A7 as D13 (new domain), seamed to D3, D7, D9.

### 3.8 Unstructured data to entities: MENTIONS, SUPPORTS, CONTRADICTS in practice

A trial excerpt or a whole trial document relates to entities and to associations. To make this work in practice rather than on paper:

- `MENTIONS` (document or chunk → entity) is a **derived retrieval projection**: cheap, regenerable, produced by entity linking with a method version, never evidence, never a mutation input. It exists to find chunks for a question, nothing more.
- `SUPPORTS` and `CONTRADICTS` are **never** document → entity edges. Support and contradiction are relations between an **Assertion or Claim** and the **located evidence** (`SourceLocator` on a `SourceSnapshot`) or between a claim and an **assessment** that weighed located evidence. The verifier (`verification.v1`) produces them; the graph records them as `Adjudication` / assessment nodes with verdict values, not as loose edges.
- A whole document is a `Source` with snapshots; an excerpt is a `SourceLocator` (selector, exact quote, offsets, page, media time). Chunks are a retrieval structure under a `DocumentTextVersion`; a chunk is never a locator.
- Effectiveness test every domain must pass: for one real document, show the path from a user question → chunks (via MENTIONS or vector index) → the assertion(s) the chunks support → the locator → the snapshot bytes, and show that the same path is what the verifier re-selects.

Owner: A1 (K) sets the pattern; every domain demonstrates it in a fixture.

### 3.9 Recommendations by people

People recommend compounds, products, protocols, devices. This is modeled, and it is attributed and verifiable: a recommendation is a `ClaimOccurrence` of kind recommendation by one asserter in one container at a located span, linked to what is recommended, with the asserter's disclosed or discovered financial interest reachable (D7 seam). A derived `RECOMMENDS` projection may exist for retrieval; it is never the record. Owner: A8 (D9) with A1.

### 3.10 Verification and attribution are critical

Every assertion traces to one asserter, one located span on one captured snapshot, and an adjudication. `verification.v1` in `ai-engineer-knowledge-services` is the producer; the graph consumes verdicts. The mapping in `../PLAN.md` section 6.2 is the starting point; A1 confirms it against the real contracts and publishes the kernel. No agent may propose a shortcut around this chain to save size: the slimming happens in the domain layers, not in provenance.

## 4. Mission Control's connection to the graph: which mission produced what

The requirement, in the owner's words: we want to know which mission produced what part of the graph. Every node, every edge, every assertion, snapshot, locator, adjudication, assessment, projection and published report must be traceable to the Mission Control mission, run and operation that produced it, and the graph must answer the reverse question too: what did mission M write, what depends on it, and which missions touched entity X.

What exists (ADR 0004 in `docs/architecture/`): Mission Control owns missions, operation intents, approvals, receipts and retries; Knowledge Services owns capture, verification, admission, query and execution. Intents are native to this repo and wrapped unchanged. Every Mission Control run becomes one `Activity` (`externalRunSystem = "mission-control"`, `externalRunId = run.runId`), the executor links everything it writes to it with `WAS_GENERATED_BY`, and the intent marker (`KsIntentMarker`) ties the receipt to the graph effects in the same transaction.

What the kernel (A1) must deliver on top of that:

1. **One lineage spine, no second mechanism.** `Activity` is the only lineage node. It carries `missionId`, `runId`, `activationId` or operation id, `activityKind` (research, ingestion, evidence-mission, projection, verification, answer), the `Agent` that ran it, `startedAt`/`endedAt`, the intent and plan digests, and the sealed bundle digest when verification.v1 produced one. Activities may chain (`INFORMED_BY` or similar, one relationship) so an evidence mission points at the vetting activity that spawned it.
2. **Everything points at its Activity.** Nodes through `WAS_GENERATED_BY`; asserted and derived edges through the edge property that names the writing run (`lastWriterRunId`, replacing `mongoResearchRunId`) resolved to the Activity; published artifacts (reports, answer records) through the Activity that composed them under a `PolicyVersion`. A projection job is an Activity with its method version, so a materialized association also says which run computed it.
3. **The four lineage questions are query patterns in the kernel packet**, each with Cypher and a fixture: what did mission M produce (nodes, edges, assertions, reports); which missions touched entity X and when; which downstream artifacts depend on something mission M produced (through `DERIVED_FROM_ASSERTION`, `CONSIDERS_ASSESSMENT`, report citations); and what changed in the graph between two runs.
4. **Evidence missions close the loop** (section 3.4): a vetted claim spawns a mission in Mission Control; the mission's run is an Activity of kind evidence-mission linked to the claim; its evidence report is a published artifact generated by that Activity. "Which mission tested this claim, with what verdict" is a kernel question.
5. **Fixtures carry it.** Every packet fixture's `assertions.yaml` names `producedBy: { missionId, runId }` so the synthesizer's cross-domain fixtures can show mission-level provenance end to end.

This is a kernel obligation and costs little size: one node type, one or two relationship types, a handful of properties. It is not negotiable under the slimming directive.

## 5. What "done" means for this run

Eight domain packets that pass `node scripts/packet-check.mjs`, each within budget or with justified excess, then one synthesized candidate schema with its map, size report, question catalog, query patterns, relationship and node registers, decision report, migration notes and fixtures, handed to `biotech-meta` as the proposal for the next pin. The owner accepts or rejects on the measurements and the fixtures, not on prose.

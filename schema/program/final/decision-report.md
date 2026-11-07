# Decision report: synthesis of the fast-track schema packets (2026-10-08)

Written by the S team's chief synthesizer. The inputs were three independent architect panels: a slim lens (43 conflicts), a coverage lens (56) and a provenance lens (57). That is 156 panel rulings in all. They are merged here into **94 rulings, R-01 to R-94**. The merge removed duplicates. Where the architects disagreed, the precedence rule of `fast-track/03-SYNTHESIS.md` decided: 00-DIRECTIVE, then 01-PACKET-CONTRACT, then K, then the packet whose question is value 1, then the smaller model. Where an architect lens was followed, the entry names it and says why. Every adopted ruling was checked against the packet files on `ft/schema-S`. The commands and outputs are in `_runlog/rulings.md`. The machine-readable edits for each module are in `_work/rulings.yaml`.

Conventions:
- Paths are relative to `schema/program/`.
- A panel reference such as "slim C-03" points to that lens's own numbering.
- **"Measured"** marks a number re-measured in this stage from the slim architect's variant artifacts (`wc -c` / `grep -c '^input '` / `pairs.mjs`). The baseline print-schema was re-run here.
- **"Packet-reported"** marks a number quoted from the named packet file. The quote was located by grep.
- **"By construction"** marks a count read off the SDL edit and not yet printed. The integrator measures it.
- **Pairs** are from→to pairs. "Collapsed" counts an interface target as 1 pair and does not double inverse fields. "Expanded" counts one pair per implementer of an interface target.

Baseline used for every delta: the assembled scratch candidate, `scratch/synth/arch-slim/assembled.graphql`. Its 14 module inputs are byte-identical to `packets/*/04-schema-proposal.graphql`, checked with `cmp`. Its numbers:
- 69 node types and 106 relationship types.
- 184 collapsed and 851 expanded pairs. Subjectable has 56 implementers and Entity has 69.
- Printed with `print-schema`: 1,735,059 B, 975 input types, 204 enums, 0 Mutation fields, built "in 2s".

## Merge rulings

### Group 1: measurement and program rules

#### R-01 · How the ≤600 pair budget is counted
- **Panel:** slim C-01 · coverage C-53 · provenance C-47.
- **Packets:** K, D3, D4, D5, D7, D10.
- **Options:**
  - (A) Collapsed count: interface targets count once, inverse fields are not doubled, and kernel-meaning relationship types (ASSESSES, DERIVED_FROM, MENTIONS, RENDITION_OF per R-43) are counted once in K.
  - (B) Expanded count, as `schema-workspace map` reports it.
- **Ruling:** Budget on (A), and print both counts in `size-report.md` and `00-SUMMARY.md`. Re-count the pinned 3,940 under the same method. If the owner chooses (B), apply these cuts in order and record each one against Q-K-04, Q-K-05 and Q-K-07:
  1. Drop the inverse `Activity.generated` (WAS_GENERATED_BY). The K Cypher patterns read it from the node side.
  2. Retarget D5 STEP_USES to a union of ≤6 members.
  3. Remove Subjectable from record types under R-18.
- **Lens followed:** slim and provenance (owner decides) over coverage (no owner decision). K 11-OQ 3 names the owner. Fix-stage note (2026-10-09): the word is less ambiguous than this entry said. 00-DIRECTIVE section 2 gives the pinned proposal as "3,940 pairs", and only the expanded count reproduces 3,940 (the collapsed count of the pinned SDL is 3,883). So the directive's own metric is (B), and (A) is a proposed reading that the owner must adopt explicitly.
- **Deciding question:** none (measurement convention); K 11-OQ 3.
- **Evidence:**
  - `packets/K/11-open-questions.md` item 3.
  - `packets/K/lever-experiments.md`: interfaces cost ≈0 per implementer in the executable, while unions do cost.
  - Measured: `pairs.mjs` over the assembled SDL gives collapsed 184 and expanded 851, with 56 Subjectable and 69 Entity implementers.
- **Size effect:**
  - (A) 184 of 600 (pass).
  - (B) 851 of 600 (fail by 251).
  - The executable is the same under both counts: 1,735,059 B, 975 inputs.
  - Re-measured on the final candidate (fix stage, `size-report.md`): (A) 181, (B) 848, over by 248 under B.
  - The three B cuts, measured in memory (fix stage, `_runlog/fix.md` section 4): cut 1 gives 783 (−65); cut 1 + cut 2 (STEP_USES to the 6-member pre-review StepMeans union) gives 733 (−50); cut 3 then needs 14 Subjectable implementers removed (55 implementers remove 10 pairs each, one removes 8), which gives 593.
- **Owner decision:** yes.

#### R-02 · Size levers beyond the directive (L1, L2, L3, excludeDeprecatedFields)
- **Panel:** slim C-36 · coverage C-54 · provenance C-46 (levers part).
- **Packets:** K and every domain module.
- **Options:**
  - Ratify L1 (`@filterable(byAggregate: false)`) and L2 (`@mutation(operations: [])`).
  - Also adopt L3 (`byValue: false` on scalars that no question filters) and/or `excludeDeprecatedFields`.
- **Ruling:**
  - L1 and L2 stay as published by the kernel pattern, and the owner ratifies them as program rules (K decision 0001).
  - L3 and `excludeDeprecatedFields` are **not** adopted by default. They are owner levers with the packet numbers attached. Adopting L3 requires a list, per module, of the fields no question filters on. Adopting `excludeDeprecatedFields` requires first grepping client queries (K 11-OQ 2).
- **Lens followed:** slim and coverage over provenance. Provenance recommended L3 everywhere. The candidate already meets the executable budget, and the directive names only `aggregate:false` and `nestedOperations`.
- **Deciding question:** none (size).
- **Evidence:**
  - `packets/K/11-open-questions.md` items 1 and 2, and `packets/K/lever-experiments.md` items 2 and 4.
  - Verified: every `@node` type in every 04 carries `@mutation(operations: [])` (`grep -c` per file), and the re-run print-schema has 0 Mutation fields.
- **Size effect:** budget met without L3: measured 1,735,059 B of 6 MB, 975 of 4,000 inputs, 2 s. Packet-reported L3 savings: D3 −38.8 KB (`packets/D3/09-reasoning.md`) and D13 −11.6 KB (`packets/D13/09-reasoning.md`).
- **Executor consequence (added by the fix stage; the owner ratifies L2 knowing it).** The kg-ops planner reads creatability from GraphQL `@mutation`, so L2 makes all 69 candidate types non-creatable for the executor. Measured in the fixtures stage (`fixtures/README.md`, "Planner check"): against the candidate, 0 of 77 fixture intents plan (rejected 63, threw 14), with TYPE_NOT_CREATABLE 791. Ratifying L2 therefore forces the executor change listed as item 1 of `migration-notes.md` section 5 and as N2 in the planner check: read creatability from the node register's `mutations.executor` (R-03), not from `@mutation`.
- **Owner decision:** yes.

#### R-03 · nestedOperations on structural edges to foreign records; reading the node-register `mutations` field
- **Panel:** slim C-37 · coverage C-55 · provenance C-46 (nestedOperations part).
- **Packets:** K, D2, D4, D5, D6, D9, D10.
- **Options:** (a) the directive text, `[CREATE, CONNECT]` everywhere; (b) `[CONNECT]` when the target is another module's record or a kernel record.
- **Ruling:**
  - (b): intra-module structural edges use `[CREATE, CONNECT]`; cross-module and kernel targets use `[CONNECT]`.
  - Two intra-module exceptions use `[CONNECT]` by design, and the owner's confirmation covers them (listed by the fix stage; their docstrings say "deviation from rule 3 recorded in 09-reasoning.md"): D3 `StudyResult.outcome` (RESULT_FOR → OutcomeDefinition) and D3 `StudyResult.arms` (RESULT_FOR_ARM → StudyArm). Both bind a record that HAS_OUTCOME or HAS_ARM already created.
  - Every node register's `mutations` field is read as `{ graphql: none, executor: … }` (K 11-OQ 23).
  - The owner confirms this reading of directive rule 3.
- **Deciding question:** none (directive rule 3 text).
- **Evidence:** `packets/K/11-open-questions.md` items 10 and 23; the `packets/D9/04-schema-proposal.graphql` header.
- **Size effect:** 0. With L2, neither choice generates inputs (0 Mutation fields measured).
- **Owner decision:** yes (confirm).

#### R-04 · Fulltext and vector indexes go in deployment DDL, not the SDL
- **Panel:** slim C-38.
- **Packets:** D4, D9, K.
- **Ruling:** No `@fulltext` or `@vector` in any module SDL. The indexes (D4 `d4_measure_names`, `Metric.embedding`, the D9 chunk vectors) are listed in the migration notes and the handoff.
- **Deciding question:** Q-D4-01 (v1) is served by a DDL index.
- **Evidence:** verified that `grep -l "@fulltext\|@vector" packets/*/04-schema-proposal.graphql` returns nothing.
- **Size effect:** 0 against the current SDLs; it avoids generated search fields.
- **Owner decision:** no.

#### R-05 · Unions with foreign members
- **Panel:** slim C-39.
- **Packets:** D12, D3, D8, D6, D2, D5.
- **Ruling:** A union is owned by the module that declares the relationship. Its members may belong to other modules, and each foreign member is listed as a seam row.
- **Deciding question:** Q-D12-01 (v1).
- **Evidence:** `grep '^union'` over the 04 files lists 18 unions, the widest being D3 AdministeredMaterial with 6 members.
- **Size effect:** 0. After R-72 the widest union has 5 members (AdministeredMaterial), by construction.
- **Owner decision:** no.

#### R-06 · Fixture rule for typed pairs (program rule derived from slim C-15 and coverage C-21)
- **Panel:** combined by the chief (slim C-15 applied it to D8; coverage C-21 needed it for TargetMeasure).
- **Packets:** all.
- **Ruling:**
  - A typed from→to pair survives synthesis only with a fixture, as 03-SYNTHESIS step 5 requires.
  - **Exception:** a pair whose deciding question is value 1 survives with a numbered fixture request in `final/requests.md`.
  - An unfixtured pair whose best question is value 2 or 3 is cut. It falls back to a predicate when a fixture still needs the fact.
- **Deciding question:** contract rule (precedence step 2).
- **Evidence:** `fast-track/03-SYNTHESIS.md` step 5; `packets/D8/11-open-questions.md` OQ-D8-32.
- **Size effect:** applied in R-70, R-72 and R-73.
- **Owner decision:** no.

#### R-07 · Value-2 cross-module edges and the step-7 demotion pass
- **Panel:** slim C-34.
- **Packets:** D3, D8, D13, D1, D2, D4, K.
- **Ruling:**
  - Keep all of them. Step 7 demotes only relationships whose questions are all value 3, and only when the candidate is over budget. Neither condition holds.
  - D3 adds Q-D2-06 to `INVESTIGATES.questions`. D2 carries that edge through its seam.
  - Record ASSIGNED_TO and LICENSED_TO (D8 → D7), MEASURES_ANALYTE (D8 → D1) and DOCUMENTED_BY_RECORD (D13 → D8) as the first demotion candidates.
- **Deciding question:** Q-D2-06 (v1).
- **Evidence:** verified that `packets/D3/05-relationship-register.yaml` INVESTIGATES lists `questions: [Q-D3-10]` only. Slim scratch `rels.mjs`: no relationship has only value-3 questions.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-08 · Shared catalog ids declared with different values (added by the chief; the panels missed the value conflicts)
- **Panel:** none. Coverage C-48 handled only the conflicts of kind, and the CQ-PF-03 split.
- **Packets:** K, D3, D5, D6, D8, D10.
- **Conflict:** four shared ids carry different **values** in different packets:
  - CQ-AX-24: D10 v1, D3 v2.
  - CQ-EV-05: D3 v1, K v2.
  - CQ-RC-06: D10 v1, D5 v2.
  - CQ-PF-03: D8 v1, D6 v2.

  The precedence step "the packet whose question is value 1" needs one value per id.
- **Ruling:**
  - A shared id gets one catalog row. The row carries the **lowest** (most essential) value declared by any packet, with each packet's patterns, and non-owners cite `<packet>:<id>`.
  - CQ-PF-03 is split: CQ-PF-03a is D8's (what a certification covers; v1, retrieved). CQ-PF-03b is D6's (whether a label's certification claim falls inside that scope; v2, assessment).
  - The rulings below that cite "v1 in D10" or "v1 in D3" apply this rule.
- **Deciding question:** none (catalog rule).
- **Evidence:**
  - `grep '^| <id> |' packets/*/02-questions.md`.
  - `packets/D10/answer-kind-table.md`, "Shared ids declared with different kinds" and line 73 (CQ-PF-03 split).
  - Slim scratch `rels.mjs` item 6 (4 ids with value conflicts).
- **Size effect:** 0.
- **Owner decision:** no.

### Group 2: kernel pattern

#### R-09 · Kernel removals that are not additive, and stale kernel text
- **Panel:** provenance C-01 · coverage C-44 (K part) · slim C-40 (K part).
- **Packets:** K, D1, D4, D5, D6, D9, D10, D11, D12, D13.
- **Ruling:** Accept K's removal of `Mention` and `Adjudication.considers`. The directive's slim rule outranks K's promise to change only additively, and no domain SDL referenced either type. Fix in the final kernel:
  - Ownership map (`09`, "Ownership map", row "Editorial containers"): Publication belongs to D3 (R-71). Drop the Mention row.
  - `04` Source docstring (line 521): name the D9 containers only.
  - `03` CQ-AX-04: read "not reported" through the FIELD_NOT_REPORTED branch, and read CaptureAttempt (PARTIAL or FAILED) only for "blocked". Drop EMPTY_RESULT.
  - `10-seams`: drop `DERIVED_FROM ReportItem → Association` and `BLOCKED_BY ReportItem → Assertion`. Point the vocabulary references at `final/vocabularies/`.
  - The owner's scripts drop Mention from the packet-check allowlist and add AssertedRecordedProperties, IdentifierLinkProperties and EvidenceEdgeProperties.
  - The owner confirms the non-additive changes. K recorded them for that confirmation.
- **Deciding question:** Q-K-14 (v1); Q-K-13 (v2) was Mention's only user.
- **Evidence:**
  - `packets/K/09-reasoning.md` item 10 ("`Mention` removed"), lines 103 and 120.
  - `packets/K/11-open-questions.md` items 22, 25 and 35, and "Conflicts recorded in the adversarial review".
  - `review-open-issues.json` K.open[3].
- **Size effect:** packet-reported −22,369 B and −13 input types (`packets/K/09-reasoning.md`). The text fixes cost 0.
- **Owner decision:** yes (confirm the non-additive changes).

#### R-10 · Remove StateEpisodeProperties, which duplicates AssertedEdgeProperties (exclusivity moves to the register)
- **Panel:** slim C-02. The chief added the exclusivity carry-over.
- **Packets:** K, D3, D5, D6.
- **Options:** (a) keep both types, honoring K's additive-only promise; (b) delete StateEpisodeProperties.
- **Ruling:** (b).
  - HAS_REGISTRATION_VERSION (D3), HAS_EDITION (D5) and HAS_LABEL_VERSION (D6) use `AssertedEdgeProperties`.
  - The only semantics carried by the deleted type's docstring is "EXCLUSIVE types may not overlap in valid and recorded time". That rule moves to a register field, `exclusive: true`, on those three entries in `05`, and the executor enforces it by relationship type.
  - K's verbatim-base list loses the name.
  - The owner confirms this together with R-09.
- **Deciding question:** Q-D6-01 (v1, the label current at $vt). It is answered unchanged.
- **Evidence:**
  - `packets/K/04-schema-proposal.graphql` lines 59–90: the two types have identical field lists (11 fields, same order).
  - `grep 'properties: "StateEpisodeProperties"'` finds exactly D3:459, D5:344 and D6:336.
- **Size effect:** measured (state variant): −6,997 B, −2 inputs, 0 pairs.
- **Owner decision:** yes (confirm, the same class of change as R-09).

#### R-11 · One DERIVED_FROM in place of the pinned citation types
- **Panel:** provenance C-02.
- **Packets:** K, D10.
- **Ruling:**
  - Keep one DERIVED_FROM (PROV wasDerivedFrom). D10 ReportItem and Association declare it with kernel meaning.
  - `migration-notes.md` maps the pinned DERIVED_FROM_ASSERTION, CONSIDERS_ASSESSMENT, CITES_ASSERTION and CITES_ASSESSMENT to DERIVED_FROM.
- **Deciding question:** Q-K-06 (v1; the blast radius is one variable-length pattern).
- **Evidence:** inventory-final "Relationship types declared by more than one module": DERIVED_FROM in K and D10 only.
- **Size effect:** the pinned 4 relationship types become 1 (packet-reported, provenance C-02).
- **Owner decision:** no.

#### R-12 · How an evidence mission links to the claim it tests
- **Panel:** provenance C-03.
- **Packets:** K, D9, D10.
- **Ruling:**
  - The EVIDENCE_MISSION Activity ASSESSES exactly one Claim, written by the executor at run start (P15).
  - WAS_INFORMED_BY stays the only chaining relationship.
  - The evidence Report is WAS_GENERATED_BY the mission.
  - The owner confirms the reading of directive 4.1, as K requests.
- **Deciding question:** Q-K-08 (v1); Q-K-19.
- **Evidence:** `packets/K/11-open-questions.md` item 12 (owner: owner).
- **Size effect:** 0 types, +1 pair (in K already).
- **Owner decision:** yes (confirm the K default).

#### R-13 · Lineage spine granularity: one Activity per Mission Control run
- **Panel:** provenance C-04.
- **Packets:** K, D10, D11.
- **Ruling:**
  - One Activity per run, identified by (externalRunSystem, runId). operationIds, intentDigests, planDigests and receiptIds are lists on it.
  - VERIFICATION is an Activity kind that carries bundleDigest; there is no VerificationRun node.
  - Retries never create an Activity.
  - `lastWriterRunId` replaces `mongoResearchRunId` everywhere.
  - WAS_GENERATED_BY is written on create and on update (P9), and the relationship-property indexes (P13) are required.
- **Deciding question:** Q-K-04 and Q-K-05 (v1).
- **Evidence:** `packets/K/11-open-questions.md` items 7, 11 and 24.
- **Size effect:** 0 new types. A per-intent Activity would double the lineage nodes.
- **Owner decision:** yes (confirm the K default; K 11-OQ 11 names the owner).

#### R-14 · Provenance of node properties: FIELD Assertions
- **Panel:** provenance C-05.
- **Packets:** K, D8, D1, D3, D6, D13.
- **Ruling:**
  - A node property that a question reads as a fact is written under an authorizing Assertion: assertionKind FIELD, with a registered field predicate, HAS_EVIDENCE to the span, and ASSERTED_BY the issuer.
  - The node value is a cache (R-45). `lastWriterRunId` means only "last touched by".
  - K adds the rule to pattern item 12.
  - **Deviation from the provenance wording:** D1's PHYSICAL_FORM, MATERIAL_GRADE, PLANT_PART and EXTRACT_RATIO are kept and registered **as the FIELD predicates** of those IngredientMaterial properties, not as separate relation predicates. A FIELD Assertion needs a registered field predicate, so dropping the names would leave the rule without one.
- **Deciding question:** Q-K-01 (v1); Q-D8-01 (v1).
- **Evidence:**
  - `packets/K/04-schema-proposal.graphql`, `enum AssertionKind { FIELD CLAIM METRIC RELATIONSHIP COMPUTATION }`.
  - `packets/D1/11-open-questions.md` OQ-D1-26.
  - D8 OQ-D8-12.
- **Size effect:** 0 schema. There are more Assertions at the data level.
- **Owner decision:** no.

#### R-15 · Asserter of a multi-author work
- **Panel:** coverage C-07 · provenance C-06 (they agree).
- **Packets:** K, D3, D2, D7, D9, D10.
- **Ruling:**
  - A multi-author work (a D3 Publication, or a D9 MediaWork with several bylines) is the asserter of what it states in its own voice.
  - A single named speaker is the Person.
  - Statements about individual authors (for example competing interests) stay asserted by the named D7 Person.
  - K widens executor P20 to accept D3.Publication and D9.MediaWork as ASSERTED_BY targets.
  - Q-K-15 and Q-K-23 add the branch asserter → AUTHORED_BY predicate → Person → D7 interest edges, and Q-K-15 adds HOLDS_ROLE.
  - A bylined web article is asserted by its single named author, otherwise by the site owner, and never by "the first of several".
  - D2 and D10 fixtures replace their first-author asserters.
- **Deciding question:** Q-K-15 (v1); Q-K-21 (v1).
- **Evidence:** `packets/D3/11-open-questions.md` #37; `packets/K/11-open-questions.md` item 29(a).
- **Size effect:** 0 (Publication and MediaWork are already Subjectable).
- **Owner decision:** no.

#### R-16 · Asserter when the document names nobody; FIELD_NOT_REPORTED; inferred speakers
- **Panel:** provenance C-07.
- **Packets:** K, D8, D11, D9, D5, D4.
- **Ruling:**
  1. The asserter is the issuer the document presents: letterhead, signatory, "Manufactured for", labeler of record, or site owner.
  2. If there is none, the Source's publisher Organization, with qualifier `asserterBasis:PUBLISHER_DEFAULT`.
  3. The BellLabs Agent asserts only BellLabs statements: curation, CALCULATED values, and FIELD_NOT_REPORTED when we read a record and find the field silent. When a source answers a query with "no items", the source asserts it. The subject of FIELD_NOT_REPORTED is the entity the field would describe (for example the Study).
  4. An inferred speaker is asserted with `asserterBasis:INFERRED`, plus a RESOLUTION Assessment that cites the span.
  5. In D4, the organizations are the asserters and the record is the subject.

  The qualifiers are registered in `predicates.yaml` (R-52).
- **Deciding question:** Q-K-01 (v1).
- **Evidence:** D8 OQ-D8-22 (`review-open-issues.json` D8.open[1]); D11 item 26 addendum (D11.open[3]).
- **Size effect:** 0.
- **Owner decision:** no.

#### R-17 · The Entity storage label
- **Panel:** provenance C-09 · coverage C-52 (Chunk part) · slim none.
- **Packets:** K, D2, D10, D11, D9.
- **Ruling:**
  - Change the labels:
    - MechanismEvidenceContext → `["MechanismEvidenceContext"]`.
    - Association → `["Association"]`.
    - CaptureAttempt → `["CaptureAttempt","Occurrence"]` (the K archetype).
  - Chunk keeps `["Chunk"]` (the exception K accepted).
  - Lineage patterns (Q-K-04, Q-K-05) traverse WAS_GENERATED_BY by type and never scan the `:Entity` label.
- **Deciding question:** Q-K-06 (v1, which lists touched entities by label).
- **Evidence:** verified `@node(labels: [..., "Entity"])` on `packets/D2/04-schema-proposal.graphql:333`, `packets/D10/04-schema-proposal.graphql:254` and `packets/D11/04-schema-proposal.graphql:83`, none of which implements Subjectable. DecisionCriterion implements Subjectable and keeps the label. `packets/K/09-reasoning.md` line 32.
- **Size effect:** 0 (labels generate no inputs).
- **Owner decision:** no.

#### R-18 · Which versioned states and records implement Subjectable
- **Panel:** slim C-20 · coverage C-42 · provenance C-08 (they agree).
- **Packets:** K, D6, D1, D3, D4, D5, D8.
- **Ruling:**
  - K adopts D6's wording additively: "A versioned state that carries a registry identifier, or that is the subject or object of an Assertion or the target of an Assessment, implements `Entity & Subjectable`; other payload and retrieval structures implement `Entity` only."
  - Each module removes Subjectable from types that no registered question uses that way.
  - Guard: the subject of an Assertion is the most specific record the source speaks about. A label sentence is about the LabelVersion; a product-wide claim is about the Product.
  - Evidence rolls up to the parent through the state episodes, never through duplicate Assertions on both.
  - LabelVersion keeps Subjectable (D1 MOIETY_EQUIVALENT_AMOUNT subject, DSLD identifiers). D6 closes OQ-D6-02.
- **Deciding question:** Q-D6-01 (v1); Q-D1-02 (v1); CQ-ID-05 (v1).
- **Evidence:** `packets/D6/11-open-questions.md` OQ-D6-02 (the requested wording); `packets/D3/11-open-questions.md` #3.
- **Size effect:**
  - Collapsed: 0.
  - Expanded: −11 pairs per removed implementer. Measured: 616 of the 851 expanded pairs come from 11 Subjectable-targeting fields × 56 implementers.
  - Re-measured by the fix stage on the final candidate (after R-01 cuts 1 and 2): −10 pairs for 55 implementers and −8 for one.
- **Status (fix stage, 2026-10-09):** the K wording is adopted, but **the per-module removal pass has not been run**. No module runlog records one (`grep -n R-18 _runlog/module-*.md` finds only the K Subjectable docstring and the D6 LabelVersion docstring and whyNode), `_work/rulings.yaml` carries no per-module removal op, and Subjectable has 56 implementers both before and after the module stage. Follow-up FU-12 in `open-questions.md`.
- **Owner decision:** no.

#### R-19 · Statement time T, the occurrence container, and the scope of OCCURS_IN
- **Panel:** coverage C-09 · provenance C-13 and C-14 (they agree).
- **Packets:** K, D9, D7.
- **Ruling:**
  - T is the `publishedAt` of the OCCURS_IN MediaWork, falling back to the snapshot only when there is no container. D7 rewrites CQ-CL-05 and Q-D7-06 to this, tests in-container disclosure through Source -RENDITION_OF-> work, and keeps its DISCLOSURE TIMING rule.
  - OVERLAP reads the authorizing Assertion's `validObservedAt` through `r.assertionUid`. No kernel edge carries `observedAt`.
  - Every Assertion whose evidence is in a MediaWork has exactly one OCCURS_IN, not only CLAIM Assertions.
  - An Assertion that authorizes a typed edge is kind RELATIONSHIP. Only propositions that enter the Claim lifecycle are CLAIM.
  - The D9 OCCURS_IN docstring and K Q-K-09 are reworded.
- **Deciding question:** CQ-CL-05 (v1).
- **Evidence:**
  - `packets/K/11-open-questions.md` item 36.
  - `review-open-issues.json` D9.open[1] (D7-5).
  - `packets/D9/04-schema-proposal.graphql:256-262` (OCCURS_IN docstring says "claim occurrences").
- **Size effect:** 0.
- **Owner decision:** no.

#### R-20 · Assessing one claim occurrence; corrections and qualifications
- **Panel:** coverage C-12 and C-14 · provenance C-15 (they agree).
- **Packets:** K, D9, D7.
- **Ruling:** These become kernel conventions, recorded in K 09:
  - The Assessment ASSESSES the Claim (and the speaker) and is DERIVED_FROM the judged occurrence, with facets `occurrence=`, `retelling=` and `original=`.
  - A correction is an occurrence with predicate CORRECTS plus DERIVED_FROM to the corrected occurrence.
  - A qualification is HAS_EVIDENCE `{role QUALIFIES}` plus qualifier prefixes.

  D9 closes K-2 and K-3, and D7 closes OQ-D7-15.
- **Deciding question:** CQ-CL-04 (v1); Q-D9-04 (v1).
- **Evidence:** `review-open-issues.json` D9.open[0] (K-2 and K-3 unanswered).
- **Size effect:** 0. This avoids +1 pair (aboutAssertions) and +2 types (typed CORRECTS / QUALIFIED_BY).
- **Owner decision:** no.

#### R-21 · Origin of relayed and re-reported records
- **Panel:** coverage C-15 · provenance C-12 (they agree).
- **Packets:** K, D13, D9.
- **Ruling:**
  - Use the kernel edge `(a)-[:DERIVED_FROM]->(primary)` with basisKind CITED_FROM_PRIOR_WORK. The `derivedFrom=<uid>` qualifier is not registered.
  - D13 converts the lesne a10/a11 and bioage fixtures and the Q-D13-22 pattern.
- **Deciding question:** Q-K-21 (v1); Q-D13-22 (v2).
- **Evidence:** `packets/D13/11-open-questions.md` #42.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-22 · Projection gate; one edge backed by several Assertions
- **Panel:** provenance C-33.
- **Packets:** K, D13, D3, D5, D7.
- **Ruling:**
  - An edge is projected only from an Assertion that is current and POSITIVE.
  - Types registered in 05 with `projectionGate: SUPPORT` (D13 LEADS_TO and RESPONDS_TO) also need a SUPPORT Adjudication of DIRECTLY_SUPPORTED or SUPPORTED_WITH_QUALIFICATION. Denials and gated-but-unadjudicated Assertions are held without an edge.
  - There is one episode per (from, to, type, asserter), authorized by that asserter's highest-verdict current Assertion. The others corroborate. Different asserters keep separate episodes.
- **Deciding question:** Q-D13-01 (v1).
- **Evidence:** D13 11 item 31 (`review-open-issues.json` D13.open[1]).
- **Size effect:** 0 (one field in 05).
- **Owner decision:** no.

#### R-23 · Supersession across asserters (coverage and provenance disagree)
- **Panel:** coverage C-04 (one clause: "the kernel adds the supersedesUid-across-asserters rule") · provenance C-34 (same asserter only).
- **Packets:** K, D8, D5.
- **Options:** (a) `supersedesUid` may link records of different asserters (a labeler change within one SPL set); (b) same asserter only.
- **Ruling:** (b).
  - `supersedesUid` links records of the same asserter only.
  - A labeler change produces new Assertions. The old ones leave "current" answers when the label-version state episode closes.
  - The asserter is the labeler of record (D8 OQ-D8-34).
  - The D5 Greenstone → Mylan fixture drops its cross-asserter `supersedesUid`.
- **Lens followed:** provenance. Directive 3.10 says every assertion traces to one asserter. The kernel already keeps one record per asserter elsewhere (HAS_REVISION_STATUS per authority; R-22 episodes per asserter), and K is silent on cross-asserter supersession. Q-D5-23 is answered either way through the open episode.
- **Deciding question:** Q-D5-23 (v1).
- **Evidence:**
  - `packets/D8/11-open-questions.md` OQ-D8-34.
  - `packets/D5/11-open-questions.md` OQ-D5-33.
  - `grep supersedesUid packets/K/09-reasoning.md` finds no cross-asserter rule.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-24 · Pending bitemporal requests to the kernel
- **Panel:** provenance C-35.
- **Packets:** K, D6, D3, D5, D13, D4, D10.
- **Ruling:**
  1. Add `Assertion.validObservedAtPrecision: TimePrecision` (additive; D6 OQ-D6-31).
  2. The source's own record time stays in the qualifier `sourceRecordRemovedAt:`.
  3. For an exclusive state with an unknown boundary: the predecessor's `validTo` is null with basis UNKNOWN, and the successor's `validFrom` is its first observation with basis OBSERVATION_ONLY. An as-of read inside the gap returns both, flagged ambiguous. `recordedTo` is never used to fake valid time.
  4. INFERRED is admissible with a `derivationRule` and is shown in answers.
  5. Source-stated payload dates are content and may be typed Date. As-of validity lives on the version's state episode.
  6. DecisionCriterion `validFrom`/`validTo` are documented as BellLabs policy validity, not world valid time.
- **Deciding question:** Q-K-02 (v1).
- **Evidence:** D6 OQ-D6-31; D3 #38; D5 OQ-D5-30; D13 #11; D4 #7.
- **Size effect:** +1 enum field on Assertion (not measured).
- **Owner decision:** no.

#### R-25 · BasisKind additions and one basis order
- **Panel:** provenance C-36.
- **Packets:** K, D13, D2, D4, D5.
- **Ruling:**
  - Add CURATOR_CLASSIFICATION, used by ON_FRONTIER, the D2 hallmark mapping, D5 OPERATIONALIZED_BY and D4 curator attachments.
  - Decline FIRST_PARTY_STATEMENT: it is computed as asserter ∈ INVOLVES.
  - Decline a basis per part of an assertion: split it into two Assertions instead.
  - K publishes one basis order that every projection uses. D2's `bestBasis` follows it.
- **Deciding question:** Q-D13-01 (v1).
- **Evidence:** D13 items 8 and 29 (`review-open-issues.json` D13.open[1]); D2 #32; D4 #27.
- **Size effect:** about 0 (one enum value).
- **Owner decision:** no.

#### R-26 · Structural vs asserted edges between independently identified records
- **Panel:** provenance C-37.
- **Packets:** K, D2, D4, D5, D9, D13.
- **Ruling:**
  - A link between independently identified records is **asserted** whenever a source or a curator states it.
  - **Structural** is reserved for parts minted with their parent from the same capture (HAS_ARM, HAS_STEP, HAS_VARIANT, HAS_ITEM, CHUNK_OF, OCCURS_IN, QUALITY_RESULT_FOR's parent record, D2 EXPOSED_TO) and for citation sets (DERIVED_FROM, BLOCKED_BY).
  - Changes:
    - D4 PERFORMED_BY_LAB becomes asserted; a curator inference uses basis CURATOR_CLASSIFICATION. This answers D4 #42.
    - D5 OPERATIONALIZED_BY becomes asserted with recorded time only.
    - D9 RENDITION_OF becomes asserted with recorded time only (R-43).
  - D4's identity-defining components stay structural only if the record's attach Assertion cites the defining span.
  - Curation files (vocab-targets, vocab-frontiers, the D2 hallmark mapping) are kernel Sources with one snapshot per version (D2 #33).
- **Deciding question:** Q-D4-01 (v1); Q-D2-03 (v1); Q-K-21 (v1, for RENDITION_OF).
- **Evidence:** `review-open-issues.json` D4.open[4] (#42), D2.open[4] (#33/#12); `packets/D9/04-schema-proposal.graphql:256-258` (RENDITION_OF StructuralEdgeProperties).
- **Size effect:** +3 edge fields per type that moves (AssertedRecordedProperties vs StructuralEdgeProperties); 0 types and pairs. Not measured.
- **Owner decision:** no.

#### R-27 · What licenses a MENTIONS edge
- **Panel:** provenance C-38.
- **Packets:** K, D9, D11.
- **Ruling:**
  - MENTIONS is a method-versioned entity-link projection (`derivationRule entity-link/vN`, optional `derivedFromAssessmentUids`). It is never evidence and never a mutation input.
  - A RESOLUTION Assessment is required only when an Assertion's subject or object binding rests on the surface form, or when Q-K-13 needs it.
  - External annotators (Europe PMC) can be part of the linking method, never asserted links.
  - COVERS_LOCATOR is never support: answers cite HAS_EVIDENCE.
- **Deciding question:** Q-K-14 (v1).
- **Evidence:** `packets/K/09-reasoning.md` item 10 (the accepted Assessment licenses MENTIONS); D11 #11; D9 C-3.
- **Size effect:** 0 schema. It avoids one Assessment and one locator per mention.
- **Owner decision:** no.

#### R-28 · Domain edges that target the Subjectable interface
- **Panel:** provenance C-39.
- **Packets:** K, D5, D10.
- **Ruling:**
  - Subjectable targets are reserved for kernel-meaning edges plus two registered domain exceptions, which K lists in its interface table: D10 ASSOCIATES (derived) and D5 STEP_USES (structural).
  - D5's 05 lists the types STEP_USES admits, and the executor enforces the list.
  - Any further domain edge to Subjectable needs a K amendment.
- **Deciding question:** Q-D5-06 (v1).
- **Evidence:** `packets/D5/09-reasoning.md` D-05.
- **Size effect:** packet-reported −2.9 KB and −8 inputs against the 6-member union.
- **Owner decision:** no.

#### R-29 · Domain edges hung on a kernel Assertion
- **Panel:** provenance C-40.
- **Packets:** K, D2, D9, D5.
- **Ruling:**
  - OCCURS_IN, OBSERVED_IN_CONTEXT and RESOLVES_TO_CONSTRAINT are allowed only when declared with direction IN on the domain type.
  - The structural ones are written in the same intent as the Assertion and are corrected only by superseding it.
  - The derived one (RESOLVES_TO_CONSTRAINT) never feeds adjudication.
  - The K verification.v1 mapping adds entityBinding roles `container` and `context`.
- **Deciding question:** Q-K-09 (v1).
- **Evidence:** provenance scratch item 7; `packets/D9/04-schema-proposal.graphql` header lines 16–19.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-30 · Domain edge-property types that break the M11 superset rule
- **Panel:** provenance C-20.
- **Packets:** K, D6, D7.
- **Ruling:**
  - Move the verbatim fields to the authorizing Assertion: the locator's exact text, or the qualifiers `declaredName:`, `form:`, `statement:`, `roleText:` and `stakeClass:`. The affected fields are D6 ComponentLineProperties `declaredNameVerbatim`, `formVerbatim` and `statementVerbatim`, and D7 `roleTitleVerbatim` and `stakeClassVerbatim`. D3 and D13 already work this way.
  - D7 ValueEdgeProperties `currency` becomes `unitCode` with the `iso4217:<CODE>` convention.
  - S checks the verbatim-base prefix mechanically (K 11-OQ 22).
- **Deciding question:** Q-D6-01 (v1); Q-D7-01 (v1).
- **Evidence:**
  - `packets/D6/04-schema-proposal.graphql` lines 53, 65, 67.
  - `packets/D7/04-schema-proposal.graphql` lines 52, 80, 102.
  - `packets/K/09-reasoning.md` line 74 (M11: "a field that only reproduces the source's wording stays in Assertion.qualifiers").
- **Size effect:** a small saving (6 filterable String fields removed). Not measured.
- **Owner decision:** no.

#### R-31 · RATES_CLAIM object slot and the mapping of ratings to the verdict lattice
- **Panel:** provenance C-43.
- **Packets:** K, D8, D4, D10.
- **Ruling:**
  - Subject = the Claim. Asserter = the rater. The rating goes in `valueString`, and its scale in qualifiers.
  - HAS_OBJECT is optional. When present it names the rating instrument record (a D8 RegulatoryRecord or a review page).
  - The lattice mapping is a versioned D10 rule applied at query time and never stored. Its values are the owner's (K 11-OQ 14).
  - Registered once, by K (R-52).
- **Deciding question:** Q-D4-08 (v1); Q-D8-16 (v2).
- **Evidence:** D8 OQ-D8-31; `packets/K/11-open-questions.md` item 14.
- **Size effect:** 0.
- **Owner decision:** no. The mapping values themselves stay with the owner under K 11-OQ 14.

#### R-32 · Vocabulary for the evidence report verdict
- **Panel:** provenance C-44.
- **Packets:** K, D10.
- **Ruling:** The verification.v1 lattice plus `worldCorrectness`. No new SURVIVED / DISQUALIFIED enum. `Report.verdict` never changes `Assertion.status`.
- **Deciding question:** Q-K-08 (v1).
- **Evidence:** directive 3.4; D10 #11.
- **Size effect:** 0 (avoids +1 enum).
- **Owner decision:** no.

#### R-33 · PolicyVersion stays a string
- **Panel:** provenance C-54.
- **Packets:** K, D10.
- **Ruling:** A string id on Report and Activity. Promote it to a node when a question traverses policies (D10 #21 trigger).
- **Deciding question:** Q-D10-17 (v1).
- **Evidence:** `packets/K/11-open-questions.md` item 6.
- **Size effect:** saves 1 type and 1 relationship type against the pinned schema (provenance C-54).
- **Owner decision:** no.

#### R-34 · Which inputs of an evidence synthesis support or contradict it
- **Panel:** provenance C-56.
- **Packets:** K, D3, D10.
- **Ruling:** Use the interim facets `input:<uid>=SUPPORTS|CONTRADICTS|QUALIFIES`, registered in assessment-vocabularies, until a value-1 question filters on them in GraphQL. Located support stays HAS_EVIDENCE `{role}`.
- **Deciding question:** Q-D10-03 (v1).
- **Evidence:** D3 #6 residual (`review-open-issues.json` D3.open[6]).
- **Size effect:** 0. The alternative is about +1 property type.
- **Owner decision:** no.

#### R-35 · `contentHashBasis` vocabulary
- **Panel:** provenance C-27.
- **Packets:** K, D5, D10, D11, D13, D7, D12, D4.
- **Ruling:** K documents five values:
  - RAW_BYTES.
  - CANONICAL_PROJECTION: a registered projection `id@version` over stored raw bytes (h2t-v1, xml-textcontent/v1, canonical-json, the EDGAR tag strip). It replaces NORMALIZED_TEXT.
  - TOOL_RENDITION: Firecrawl or Tavily output. It replaces EXTRACTOR_TEXT and EXTRACTED_TEXT_BYTES; `captureMethod` names the tool, its version and its options.
  - STORED_EXCERPT_TEXT.
  - SYNTHETIC_FIXTURE.

  The projection registry lives in the D11 action space, and S re-tags the fixtures.
- **Deciding question:** Q-K-14 (v1).
- **Evidence:** D5 OQ-D5-46; D10 #35; D13 items 32–33; D7 OQ-D7-36.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-36 · Can evidence from a tool rendition alone reach ACCEPTED?
- **Panel:** provenance C-28.
- **Packets:** K, D11, D4, D12.
- **Ruling (proposed):**
  - Accepted with PASS_WITH_WARNINGS, and flagged in answers, only where a CaptureAttempt records that issuer-byte capture is impossible.
  - Everywhere else, held at PROPOSED until a RAW_BYTES or CANONICAL_PROJECTION sibling exists.
- **Deciding question:** Q-D11-05 (v1).
- **Evidence:** directive section 1 ("traced to captured bytes").
- **Size effect:** 0.
- **Owner decision:** yes (policy).

#### R-37 · Snapshot identity vs change detection; archive copies
- **Panel:** provenance C-29.
- **Packets:** K, D1, D3, D4, D7, D8, D9, D11, D13.
- **Ruling:**
  - `contentHash` identifies the stored artifact, and `storageUri` points at a durable blob store.
  - `canonicalProjectionHash` detects change and drives re-anchoring. An equal projection hash means a new snapshot with no `revisionKind`. SILENT_CONTENT_CHANGE applies only when the projection hash changes without a notice.
  - An archive copy is admitted only when the served memento-datetime equals the requested one and the payload SHA1 equals the CDX digest. Then `observedAt` = memento-datetime and `archiveUri` = the `id_` URL.
  - No new kernel fields.
- **Deciding question:** Q-K-10 (v1).
- **Evidence:**
  - `packets/K/11-open-questions.md` items 27 and 30.
  - `packets/D1/11-open-questions.md` OQ-D1-27.
  - D13 item 40; D9 F-5.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-38 · Selector normalization basis and XML selectors
- **Panel:** provenance C-30.
- **Packets:** K, D1, D3, D4, D11, D9.
- **Ruling:**
  - TEXT_QUOTE or CHARACTER_POSITION over a registered projection named in `selectorJson.basis`, which is mandatory and holds the projection `id@version`. An HTML DOM selector over XML is allowed for element-level facts.
  - The normalization (folding U+00A0, U+2009 and U+202F; stripping `sup`) is part of the versioned projection, and the verifier implements the same projections.
  - COVERS_LOCATOR stays the chunk → locator join.
- **Deciding question:** Q-K-14 (v1).
- **Evidence:** `packets/D1/11-open-questions.md` OQ-D1-27.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-39 · Values of `captureMethod` and `populatedBy`
- **Panel:** provenance C-31.
- **Packets:** D11 and every packet.
- **Ruling:** `captureMethod` = `<action-space id>/<tool version>`, and `CaptureAttempt.toolId` = the registry id. S rewrites every 05 `populatedBy` and every fixture `captureMethod` through the registry aliases.
- **Deciding question:** Q-D11-17 (v1).
- **Evidence:** verified that `packets/D11/tooling/readiness-scorecard.md` line 7 reads "167 merged entries … under 402 packet-local aliases", and that `grep -c '^  - id:' packets/D11/tooling/action-space.yaml` = 167.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-40 · Intent contract v1 cannot write the kernel evidence chain
- **Panel:** provenance C-32.
- **Packets:** all.
- **Ruling:** Synthesis never downgrades fixtures; each fixture's `assertions.yaml` is the record of truth. Contracts v2 needs:
  - An `assertion.relate` kind.
  - On AssertionCore: assertionKind, claimType, occurrenceOf, qualifiers, values on `edge.assert`, derivationRule, derivedFrom, supersedesUid and containerRef.
  - `asserterRef` on `state.attach` and `identifier.attach`.
  - `assessment.record`, adjudication ingest, `report.publish` and `projection.write`.
  - The hold flag of R-22 and the snapshot revision fields.

  This is outside packet scope.
- **Deciding question:** Q-K-01 (v1).
- **Evidence:** `packets/K/11-open-questions.md` item 26; the same gap is open in D1, D2, D3, D4, D5, D6, D9, D10, D12 and D13 (`review-open-issues.json`).
- **Size effect:** 0 schema.
- **Owner decision:** yes.

#### R-41 · CaptureAttempt stays a graph record
- **Panel:** coverage C-52 · provenance C-26 (they agree).
- **Packets:** D11, K.
- **Ruling:**
  - Keep it, for FAILED and PARTIAL attempts only.
  - It is not a second lineage mechanism: it has no run identity of its own, and it points WAS_GENERATED_BY at the run's Activity.
  - Labels per R-17. `privacyClass` INTERNAL by default. Not Subjectable.
  - K's CQ-AX-04 pattern is fixed per R-09.
- **Deciding question:** Q-D11-17 (v1); CQ-AX-04.
- **Evidence:** `packets/K/11-open-questions.md` item 25.
- **Size effect:** packet-reported +14,028 B and +4 inputs (`packets/D11/09-reasoning.md`).
- **Owner decision:** no.

#### R-42 · Identifier uniqueness and the scheme register (adds a conflict all three panels missed)
- **Panel:** coverage C-22 · provenance C-48. The chief added the conflict with identifier joins.
- **Packets:** K, D2, D4, D11, D12, D3, D5, D7.
- **Conflict the panels missed:** coverage and provenance both adopt the rule "one (scheme, issuer, normalized value) identifies at most one Subjectable". Two other proposals would break it:
  - Coverage C-06 joins scholarly renditions by a **shared** DOI, PMID or PMCID Identifier on both the Source and the Publication.
  - D5 OQ-D5-45 (cited in provenance C-53) joins an effect Condition to a target's Outcome or Metric through a **shared** MESH, HPO or SNOMEDCT Identifier.

  Both joins need one Identifier attached to two Subjectables.
- **Ruling:**
  - K states the uniqueness rule in `identifier-schemes.yaml` and the executor enforces it.
  - Cross-type joins by a shared Identifier are therefore not a modeling pattern. The rendition join becomes R-43 and the condition-to-target join becomes R-70.
  - D2 drops LOINC from Outcome (R-70).
  - K adds SPL_SET_ID, EIN, ORG_STUDY_ID and the seven D12 food schemes as requested.
  - Patterns validate the normalized value, and the normalizationRule ids go into the register.
  - `Identifier.registrationStatus` (D11) is declined: assignment status lives on the HAS_IDENTIFIER episode, and a lapse is an Assertion.
- **Deciding question:** Q-K-12 (v1); Q-D4-17 (v1).
- **Evidence:**
  - `packets/D4/11-open-questions.md` #37.
  - `packets/D2/06-node-register.yaml` (Outcome identifierSchemes lists LOINC).
  - `packets/D5/11-open-questions.md` OQ-D5-45.
  - Verified: K fixtures attach DOI and PMID to `D3.Publication` (5 occurrences) and never to Source, so the uniqueness rule breaks no existing fixture. `grep -i "at most one" packets/K/identifier-schemes.yaml` finds no such rule today.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-43 · Grouping the renditions of a scholarly work (coverage and provenance disagree)
- **Panel:** coverage C-06 (join by shared Identifier, 0 cost) · provenance C-11 (RENDITION_OF with kernel meaning, also declared on D3 Publication) · slim C-09 (made moot by merging Publication into MediaWork, rejected in R-71).
- **Packets:** K, D3, D9, D11.
- **Options:**
  - (a) A shared-Identifier join.
  - (b) Widen D9 RENDITION_OF to a MediaWork | Publication union.
  - (c) Give RENDITION_OF kernel meaning, declared with direction IN on D9 `MediaWork.renditions` and on D3 `Publication.renditions`.
- **Ruling:** (c).
  - RENDITION_OF (Source → work) has kernel meaning and is declared by D9 and D3.
  - It is asserted with recorded time only (AssertedRecordedProperties), so regrouping is a supersession and keeps its history (R-26).
  - K's source-family rule becomes: the OCCURS_IN work; else the RENDITION_OF work (MediaWork or Publication); else the Source.
  - Q-K-21 and `Report.distinctSourceFamilyCount` use it.
- **Lens followed:** provenance.
  - K's own open question offers only typed options ("a D3 edge Source → publication with kernel-compatible meaning, or D9 RENDITION_OF widened"), and K ranks above the smaller model.
  - Coverage's 0-cost join breaks the identifier-uniqueness rule (R-42), which coverage itself adopts.
- **Deciding question:** Q-K-21 (v1).
- **Evidence:**
  - `packets/K/11-open-questions.md` item 29(b).
  - `packets/K/09-reasoning.md` line 120.
  - `packets/D9/04-schema-proposal.graphql:256-258`.
- **Size effect:** +1 pair (collapsed: RENDITION_OF Source → Publication) and +1 relationship field on Publication, by construction. The class change adds +3 edge fields to RENDITION_OF. Not measured.
- **Owner decision:** no.

#### R-44 · Retraction and correction status recorded several times
- **Panel:** slim C-08 · coverage C-13 · provenance C-10.
- **Packets:** K, D3, D13, D11, D12.
- **Options:**
  - (a) Write every mechanism.
  - (b) REVISES only.
  - (c) HAS_REVISION_STATUS only.
  - (d) Split by what is known (coverage and provenance), plus slim's enum and Event clean-up.
- **Ruling:** (d), plus slim's clean-up.
  - Mechanisms:
    - When the revising work (a notice or a new version) is identified, it is recorded as D3 REVISES: asserted per asserter, with `revisionKind` typed by K SourceRevisionKind.
    - K HAS_REVISION_STATUS is written only for non-scholarly Sources and for status flags with no identified notice (OpenAlex, PubMed), one Assertion per authority.
    - A record is never written both ways for one (asserter, notice).
  - D3 caches and enums:
    - D3 deletes `enum PublicationRevisionStatus`.
    - `Publication.revisionStatus` is typed SourceRevisionKind, with null meaning none known. It is the single work-level cache over both mechanisms (R-45).
    - `SourceSnapshot.revisionKind` stays a capture cache.
  - D13 events:
    - D13 removes `PUBLICATION` from EventKind, and AUTHOR and PUBLISHER from EventRole.
    - RETRACTION stays for a curated frontier milestone only: EVENT_ABOUT → D3.Publication, with its clock citing the notice's locator and no second date Assertion. Authors and publisher are reached through the Publication (AUTHORED_BY, R-80).
  - K patterns: Q-K-10, Q-K-17 and Q-K-22 add the branch Source -RENDITION_OF-> Publication <-REVISES- notice (needs R-43). CQ-EV-05 and Q-D11-04/05 read both branches.
  - Fixtures move to REVISES by their asserters: D13 lesne a09–a11 (and its INVOLVES PUBLISHER/AUTHOR rows), D12 PREDIMED and D11 resveratrol.
- **Deciding question:** CQ-EV-05 (v1 per R-08); Q-K-22 (v1); Q-D13-08 (v1).
- **Evidence:**
  - `packets/D3/04-schema-proposal.graphql` (`enum PublicationRevisionStatus { NONE_KNOWN CORRECTED EXPRESSION_OF_CONCERN RETRACTED WITHDRAWN }`).
  - `packets/K/04-schema-proposal.graphql` `enum SourceRevisionKind` (8 values covering them).
  - `packets/D13/04-schema-proposal.graphql` EventKind / EventRole (PUBLICATION, AUTHOR and PUBLISHER present).
  - `packets/D13/07-fixtures/lesne-2006-retraction/assertions.yaml` lines 246–349 (PUBLISHER and AUTHOR roles); no D13 fixture uses `eventKind: PUBLICATION`.
  - `packets/D3/11-open-questions.md` #33.
- **Size effect:**
  - Measured (enums variant, which removes PublicationRevisionStatus together with the R-66 and R-59 enums): −4 enums, −4 inputs, −1,583 B. Of that, PublicationRevisionStatus accounts for 1 enum and 1 input.
  - The removal of the EventKind and EventRole values is not measured (about 0).
- **Owner decision:** no.

#### R-45 · Projection caches on entity nodes
- **Panel:** slim C-42 · provenance C-24 (they agree; provenance's conditions adopted).
- **Packets:** K, D3, D5, D6, D9, D13.
- **Ruling:** A cache is allowed only when all of these hold:
  1. Its authority (an Assertion, episode, REVISES edge or RegistrationVersion) is reachable by edges.
  2. The executor or a projection maintains it; it never comes from an intent payload.
  3. It names its method version and `derivedAt`. Observation clocks take the min or max snapshot time.
  4. Answers cite the authority, never the cache.
  5. A registered question filters on it.

  The executor rewrites the cache in the same transaction as its authority, which generalizes K P18. Accepted on these terms:
  - Claim.lifecycleState.
  - D3 Study status, phase, primaryCompletionDate and resultsPosted (Q-D3-04 filters them).
  - Publication.revisionStatus, the single revision cache (R-44).
  - D13 Event clocks with `*AssertionUid`.
  - D5 and D6 first/lastObservedAt.
  - ProtocolStep.locatorUid (R-46).
  - Chunk.workUid and channelUid.
- **Deciding question:** Q-D3-04 (v1); Q-D13-05 (v1).
- **Evidence:** `packets/D3/11-open-questions.md` #15; provenance scratch item 8.
- **Size effect:** 0 (the properties exist).
- **Owner decision:** no.

#### R-46 · uid-valued properties used instead of edges
- **Panel:** slim C-41 · coverage C-50 · provenance C-25 (they agree).
- **Packets:** D10, D7, D5, D11, D12, K.
- **Ruling:**
  - A uid-valued property is allowed only as a frozen identity key (DietaryPattern.definedBySourceUid, Association.anchorUid), as an operational pointer outside the evidence chain (CaptureAttempt.subjectUid and snapshotUid), or as a cache (ProtocolStep.locatorUid, K 11-OQ 21). It is never the only path to provenance.
  - D10 `DecisionCriterion.publisherUid` becomes a cache. Q-D10-10 reaches the publisher through the criterion set's authorizing Assertion: ASSERTED_BY the publisher for a third-party criterion, or WAS_GENERATED_BY the BellLabs Activity for our own.
  - DietaryPattern's "defined by" trace is its attach Assertion's HAS_EVIDENCE.
  - Closes OQ-D7-34.
- **Deciding question:** CQ-CL-05 (v1); Q-D10-10 (v2).
- **Evidence:** inventory-final, D7 seam row "publisherUid (property reference)"; `packets/K/11-open-questions.md` items 21 and 25.
- **Size effect:** 0. This avoids +1 type for a publisher edge.
- **Owner decision:** no.

#### R-47 · D2 AFFECTS_MECHANISM vs D10 Association (scored derived edge)
- **Panel:** slim C-17 · coverage C-24 · provenance C-21. They agree on the shape and disagree on which count facets survive.
- **Packets:** D2, D10, K.
- **Options:**
  - (a) Keep the scored superset edge.
  - (b) Keep an unscored facet shortcut, with scores on Associations.
  - (c) Association only (+2 hops on value-1 Q-D2-03).
- **Ruling:** (b).
  - K adds DerivedEdgeProperties to the M11 base list (an additive change). K's `DerivedEdgeProperties.score` docstring says it is a retrieval score (entity-link confidence, span overlap) and is never set on an edge between two domain entities (directive 3.6). The executor validates that `score` stays null on AFFECTS_MECHANISM.
  - MechanismProjectionProperties keeps `direction` (retyped EstimateDirection, R-59), `bestBasis`, `highestSetting`, `humanMeasured`, `nContexts`, `nHumanContexts` and `viaParticipant`. It drops `nNoChangeContexts`.
  - Q-D2-18's ranking reads D10 Association records (EVIDENCE_AGGREGATE, one per modulator × mechanism).
  - D10 withdraws the AFFECTS_MECHANISM half of its "replaces" claim.
- **Lens followed:**
  - Coverage and provenance keep `highestSetting` and `nHumanContexts`: verified, Q-D2-02 (03 line 211) reads `highestSetting` and Q-D2-06 (v1, 03 line 335) reads `nHumanContexts`.
  - Slim drops `nNoChangeContexts`: verified, only Q-D2-18 (03 line 561) reads it, and that question moves to Association.
- **Deciding question:** Q-D2-03 = Q-D4-01 (v1); Q-D2-06 (v1); directive 3.6.
- **Evidence:**
  - `packets/D2/04-schema-proposal.graphql` lines 196–220.
  - `packets/D2/03-retrieval-patterns.md` lines 211, 335 and 561 (under Q-D2-02, Q-D2-06 and Q-D2-18).
  - `packets/K/04-schema-proposal.graphql` lines 92–107.
  - `review-open-issues.json` D2.open[0] and D10.open[2].
- **Size effect:** 0 types and pairs; −1 Int field on the edge (not measured). Association rows are added at the data level.
- **Owner decision:** no.

#### R-48 · Association lifecycle, label and duplicated score
- **Panel:** provenance C-22.
- **Packets:** D10, K.
- **Ruling:**
  - An Association is WAS_GENERATED_BY a PROJECTION Activity with its methodVersion.
  - ASSOCIATES carries no score; the score is on the node only.
  - A superseded Association is kept while any Report or ReportItem cites it. Otherwise the projection job may remove it, extending K's rule for derived edges.
  - Label `["Association"]` (R-17). `citesAssociations` stays cut, and K's seam row and pattern item 11 are updated (R-09).
- **Deciding question:** CQ-AX-08 (v2).
- **Evidence:** `packets/D10/04-schema-proposal.graphql:253-288`.
- **Size effect:** 0 schema.
- **Owner decision:** no.

#### R-49 · Form of the discourse metrics (coverage and provenance disagree)
- **Panel:** coverage C-49 (a D10 Association with 1–2 members, new kind DISCOURSE_METRIC) · provenance C-23 (retrieved now; projection-cache properties if the latency test fails).
- **Packets:** K, D9, D10.
- **Options:**
  - Assessment OTHER (the interim form).
  - A one-member Association.
  - Projection-cache properties on the measured node.
  - Retrieved at query time.
- **Ruling:**
  - The answer kind is **materialized**, as D10 ruled.
  - The form is **projection-cache properties** on the measured node (Claim as an additive kernel change; Channel or Person), with `methodVersion` and `derivedAt`, written by a PROJECTION Activity under R-45.
  - Never an Assessment and never an Association. The interim OTHER assessments leave the D9 fixtures. Closes K 11-OQ 34.
- **Lens followed:** neither as stated.
  - Provenance's "retrieved now" contradicts D10's table: D10 owns the answer-kind method (directive 3.5/3.6) and rules all three rows materialized.
  - Coverage's one-member Association contradicts directive 3.6 ("a score between two entities").
  - K 11-OQ 34 offers exactly these two forms, so the cache form remains.
- **Deciding question:** CQ-CL-06 (v2), Q-D9-08 (v2), Q-D9-19 (v3). No value-1 question; decided at the directive level.
- **Evidence:** `packets/D10/answer-kind-table.md` lines 429, 444 and 455 (declared and ruled materialized); `packets/K/11-open-questions.md` item 34.
- **Size effect:** 2–3 scalar properties per measured type (not measured). This avoids +1 enum value and a cardinality exception on Association.
- **Applied by the fix stage (F-01):** `Claim` gains `discourseFirstHandCount`, `discourseRetellingCount`, `discourseRecutCount`, `discourseIndependentCount`, `discourseFirstOccurrenceAt`, `discourseMethodVersion` and `discourseDerivedAt`. `Person` (D7) and `Channel` (D9) gain `influenceScore`, `influenceMethodVersion` and `influenceDerivedAt`. Measured: input types 960 → 960, printed 1,735,213 → 1,743,672 B, 0 pairs. Q-D9-19 asks for influence "on topic or frontier F", but one node property holds one graph-wide score, so the per-frontier form stays open (FU-11).
- **Owner decision:** no.

#### R-50 · Answer kinds: D10's rulings adopted
- **Panel:** slim C-33 · coverage C-47 and C-48 · provenance C-45 (they agree).
- **Packets:** D10, K, D1, D2, D4, D5, D6, D7, D8, D9, D11, D12.
- **Ruling:**
  - Accept D10's 17 rulings: CQ-AX-08, Q-K-24, CQ-ST-02, Q-D1-03, Q-D1-19, Q-D2-14, Q-D4-08, Q-D5-18, Q-D5-25, CQ-AX-19, Q-D6-03, Q-D6-09, Q-D6-22, Q-D7-22, Q-D8-19, CQ-CL-07 and Q-D12-08.
  - Shared ids: CQ-AX-08 retrieved, CQ-AX-19 retrieved, CQ-CL-07 assessment. CQ-PF-03 is split per R-08.
  - Q-D11-22 is materialized by a PROJECTION Activity. A Report{PROFILE} is written only when BellLabs publishes coverage.
  - Materialize only when a fixture-graph p95 exceeds 200 ms, or when the read is graph-global and reused by ≥2 questions (D10 #45). Run the latency test before any projection is made permanent.
  - K edits its 02 rows (CQ-AX-08, Q-K-24 → retrieved).
- **Deciding question:** CQ-RC-06 (v1); Q-D10-01 (v1); the directive gives D10 the method (3.5, 3.6).
- **Evidence:** `packets/D10/answer-kind-table.md` "Disagreements" (17 rows) and "Shared ids".
- **Size effect:** 0 schema; fewer projection jobs.
- **Owner decision:** no.

#### R-51 · NOVA and other rule-based classifications
- **Panel:** coverage C-51 · provenance C-57 (they agree).
- **Packets:** D12, D10, D1.
- **Ruling:**
  - A CALCULATED Assertion (basisKind CALCULATED, `derivationRule nova-markers/vN`, DERIVED_FROM its inputs) authorizes an asserted IN_FOOD_CATEGORY. It is superseded record by record when the rule changes.
  - No derived COMPUTED_FOOD_CATEGORY edge.
  - The same form serves D1 moiety amounts. Graph-global scores stay Associations.
  - Q-D12-14 and every such pattern return `basisKind` and `derivationRule`.
- **Deciding question:** Q-D12-14 (v2).
- **Evidence:** `packets/D12/09-reasoning.md` (+8,609 B measured for the derived-edge variant).
- **Size effect:** avoids +1 type and +2 pairs; packet-reported +8,609 B and +6 inputs avoided.
- **Owner decision:** no.

### Group 3: vocabularies and registers

#### R-52 · One predicate registry, the registrar rule, and duplicates the panels missed
- **Panel:** slim C-32 · coverage C-46 · provenance C-18. The chief added four duplicate registrations from a full scan.
- **Packets:** K and every domain module.
- **Ruling:** S emits `final/vocabularies/predicates.yaml`, generated from every 05 `predicateOnly` list plus the K conventions. Each entry has:
  - a SCREAMING_SNAKE name with no module prefix;
  - one registrar;
  - allowed subject and object type sets (literal where applicable);
  - required qualifiers (for example D5 `population:`);
  - the promotion trigger;
  - aliases for retired names.

  The executor rejects unregistered predicates, and a fixture using one fails S's check.

  The **registrar rule** is:
  1. K registers kernel conventions: FIELD_NOT_REPORTED, HAS_REVISION_STATUS, RATES_CLAIM, CORRECTS, HAS_IDENTIFIER, CITES_AS_SUPPORT and HAS_CREDENTIAL.
  2. The owner of a controlled predicate family registers it:
     - D5: the five target predicates; HAS_UPPER_LIMIT, HAS_AUTHORIZED_DOSE_RANGE, USE_CONSTRAINED_IN, INTERACTS_WITH and CAUSES_ADVERSE_EFFECT.
     - D7: the manufacturer-role set (R-68).
     - D9: the recommendation predicates (R-83).
  3. Otherwise the owner of the subject type registers it. When the subjects span modules, the existing registrar keeps it and the other modules add their subject/object pairs.

  **Duplicate registrations to collapse.** The full scan found 257 entries and 230 distinct names (measured). The panels listed some of these duplicates; the chief added RECORDING_OF, SUCCEEDED_BY, OFFERS_INTERVENTION and CAUSES_ADVERSE_EFFECT.

  | predicate | registered by | registrar after merge |
  | --- | --- | --- |
  | INTENDED_FOR_TARGET | D1, D12, D5, D6, D8 | D5 |
  | IMPROVES_TARGET, WORSENS_TARGET, NO_EFFECT_ON_TARGET, MIXED_EFFECT_ON_TARGET | D1, D12, D5 | D5 |
  | CAUSES_ADVERSE_EFFECT | D12, D5 | D5 |
  | MANUFACTURES | D6, D7, D8 | D7 |
  | CONTRACT_MANUFACTURES_FOR | D7, D8 | D7 |
  | SUPPLIES_MATERIAL | D1, D7 | D7 |
  | FIELD_NOT_REPORTED | D4, K | K |
  | RATES_CLAIM | D8, K | K |
  | HAS_REVISION_STATUS | D13, K | K |
  | FINANCING_AMOUNT | D13, D7 | D13 (R-92) |
  | OFFERS_INTERVENTION | D5, D6 | D6 (subject Offer; D7.Organization admitted) |
  | RECOMMENDS_AGAINST | D10, D5 | D9 (R-83) |
  | RECOMMENDS_USE | D7, D9 | D9 |
  | RECORDING_OF | D13, D9 | D9 (subject MediaWork) |
  | SUCCEEDED_BY | D6, D7 | D6, with D7's Organization → Organization pair |

  Also:
  - D8 renames its `D8.*` entries without the prefix.
  - D11 recases to SCREAMING_SNAKE.
  - D3 registers ADMINISTERED_MATERIAL_PURITY (OQ-D1-35).
  - D1 registers SOURCED_FROM_COUNTRY, the material-origin predicate D6 used provisionally (OQ-D6-27).
  - The renames of R-68, R-73, R-77, R-80, R-81 and R-83 apply.
- **Lens followed:** slim for registrar-by-subject (FINANCING_AMOUNT, DATE_OF_FIRST_SALE, INVESTOR_COUNT → D13) over coverage, which kept the last two with D7. One rule, applied uniformly.
- **Deciding question:** Q-K-28 (v1); Q-D12-08 (v1); Q-D1-03 (v1).
- **Evidence:**
  - `scratch/synth/rulings/preds.mjs` over `packets/*/05-relationship-register.yaml` (yaml@2.9.1): 257 entries, 230 distinct names, and the duplicates above.
  - `packets/K/11-open-questions.md` item 18.
- **Size effect:** 0 types. The registry shrinks by the collapsed duplicates plus the retired names of R-68 to R-83.
- **Owner decision:** no.

#### R-53 · One meaning per relationship name; no predicate-only value equals a relationship type (adds a collision the panels missed)
- **Panel:** provenance C-19. The chief added the D5 collision.
- **Packets:** K, D3, D8, D9, D1, D12, D6, D5, D7.
- **Ruling:**
  - One relationship type name has one meaning and one property schema, because Neo4j property indexes are per type.
  - D8's RESULT_FOR is QUALITY_RESULT_FOR, and D6 and D12 rename their seam rows.
  - Only kernel-meaning types are declared by more than one module: DERIVED_FROM, ASSESSES, MENTIONS and RENDITION_OF (R-43).
  - No `predicateOnly` value may equal a relationship type name. D12 uses FOOD_FROM_TAXON (D1 renames its seam row).
  - **Collision the panels missed:** D5's `predicateOnly` lists HOLDS_ROLE, HOLDS_STAKE and RECEIVES_VALUE_FROM. These are D7 **typed** relationship types; the Assertions that authorize them carry the same names. D5 removes the three from `predicateOnly` and cites D7's typed edges in its seams. HAS_IDENTIFIER also appears in both lists, but there K registers the authorizing predicate of its own typed edge, which is allowed.
  - S lints names across every 04 and 05.
- **Deciding question:** Q-D3-04 (v1); Q-D7-01 (v1).
- **Evidence:**
  - `comm -12` of relationship types in all 04 files (106 names) against registered predicate names gives HAS_IDENTIFIER, HOLDS_ROLE, HOLDS_STAKE and RECEIVES_VALUE_FROM.
  - inventory-final: only DERIVED_FROM and ASSESSES are declared by more than one module today.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-54 · Register of assessment vocabularies
- **Panel:** provenance C-17.
- **Packets:** K, D1, D3, D4, D5, D6, D7, D8, D9, D12, D13.
- **Ruling:**
  - S emits `final/vocabularies/assessment-vocabularies.yaml`. Each (assessmentKind, assessmentSubkind) entry lists its owner, conclusionCodes, gradeSchemes, and the allowed facet keys and values.
  - That includes:
    - D1 `plantPart=` on D5 SAFETY_SIGNAL (OQ-D1-33);
    - D13 `impactDomain=`;
    - the conflict facets of R-55;
    - D3 `dimension=` and `missing=`;
    - K.claim-relation REFINES;
    - the R-34 input facets.
  - The executor rejects unregistered entries. OTHER is allowed only with a registered subkind.
- **Deciding question:** Q-D10-03 (v1).
- **Evidence:** `packets/K/11-open-questions.md` item 17.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-55 · Ownership of the CONFLICT_RELEVANCE vocabulary (coverage and provenance disagree on the disclosure facets)
- **Panel:** coverage C-11 (one subkind, D7 registrar, disclosure values merged) · provenance C-16 (D9 owns the disclosure facets).
- **Packets:** D7, D9, D10, D4, K.
- **Ruling:**
  - One register entry, `D7.conflict-relevance`, under kernel AssessmentKind CONFLICT_RELEVANCE. **Registrar: D7** (one registrar per entry, R-52/R-54).
  - D7 defines `conclusionCode` DIRECT | INDIRECT | NOT_RELEVANT | UNDETERMINED and the interest facets `relevanceBasis` and `temporalOverlap`.
  - The disclosure facets `disclosureFinding`, `disclosurePlacement` and `completeness` are **contributed by D9**. Their values change only with D9's agreement.
  - `disclosureFinding` = the union of both lists: DISCLOSED_ELSEWHERE_AT_TIME, DISCLOSED_ELSEWHERE, DISCLOSED_IN_LATER_REVISION, NOT_FOUND_IN_COMPLETE_CAPTURE and NOT_FOUND_IN_PARTIAL_CAPTURE.
  - D4 test-and-sell reuses D7's codes. D10 owns none.
  - One fixture (hl52 or sinclair) must produce the same Assessment through the D7 and D9 patterns.
- **Lens followed:** coverage for the single registrar (registry rule) and provenance for D9's say over the disclosure facets. The two are compatible once the register records a contributor.
- **Deciding question:** CQ-CL-05 (v1); Q-D9-02 / Q-D7-06 (v1).
- **Evidence:** D7 OQ-D7-35; D9 D7-1 (cited by both panels).
- **Size effect:** 0.
- **Owner decision:** no.

#### R-56 · Shared enums are declared once
- **Panel:** coverage C-30 · provenance C-49 (rule part).
- **Packets:** D1, D3, D6, D2, D4, D12.
- **Ruling:**
  - MassBasis and ContentStatementKind are declared by D1, SexScope by D3, ModelOrganism by D2, AmountBasis by D6 (R-58) and RegulatoryPathway by D8. EffectDirection is kernel only.
  - Consumers list them under `sharedVocabularies`.
  - S adds an enum-name collision check to assembly, because the type-defs merge hides duplicate enums.
- **Deciding question:** Q-D1-02 (v1).
- **Evidence:**
  - Verified that `grep '^enum (MassBasis|SexScope|PartitionSex|ModelOrganism|ContentStatementKind|AmountBasis)'` over the 04 files finds exactly one declaration each.
  - The D1/D3 MassBasis duplicate in K 11-OQ 31 is already resolved on disk.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-57 · One comparator enum (coverage disagrees on D8)
- **Panel:** slim C-21 · coverage C-29 (keep D8 SpecComparator) · provenance C-49 (comparator part).
- **Packets:** D1, D5, D8, D12.
- **Ruling:**
  - One enum, `QuantityComparator`, owned by D1. The existing name is kept to minimize renames.
  - Values: EQ, APPROX, GT, GTE, LT, LTE, BETWEEN, OUTSIDE_REFERENCE_RANGE, ABSENT, CONFORMS_TO_DESCRIPTION, REFERENCE_ONLY, UNKNOWN.
  - D5 deletes ThresholdComparator. `ProtocolStep.thresholdComparator` and `UseConstraint.doseComparator` are retyped.
  - D8 deletes SpecComparator and maps NOT_LESS_THAN → GTE, NOT_MORE_THAN → LTE, RANGE → BETWEEN, EQUALS → EQ, ABSENT_IN → ABSENT. The mapping is recorded in `final/vocabularies`.
- **Lens followed:** slim and provenance, by the smaller model. No value-1 question needs a separate spec enum, and coverage's semantic argument is met by keeping the spec values in the shared enum.
- **Deciding question:** Q-D5-06 (v1); Q-D1-03 (v1).
- **Evidence:** enum dumps: D1 QuantityComparator {EQ APPROX GTE GT LTE LT BETWEEN}; D5 ThresholdComparator {GT GTE LT LTE BETWEEN OUTSIDE_REFERENCE_RANGE}; D8 SpecComparator {NOT_LESS_THAN NOT_MORE_THAN RANGE EQUALS ABSENT_IN CONFORMS_TO_DESCRIPTION REFERENCE_ONLY UNKNOWN}.
- **Size effect:** −2 enums. Inputs not measured.
- **Owner decision:** no.

#### R-58 · One amount-basis enum (includes coverage C-32's new values)
- **Panel:** slim C-22 · coverage C-30 (AmountBasis by D6) and C-32 (values D2 needs).
- **Packets:** D3, D5, D6, D12, D2.
- **Ruling:**
  - One `AmountBasis`, owned by D6. Its values are D6's six, plus D5's DosePeriod values, plus D3's QuantityBasis values, plus MEDIUM_CONCENTRATION for D2: PER_SERVING, PER_UNIT, PER_100G, PER_100ML, PER_PACKAGE, PER_ITEM, PER_DOSE, PER_DAY, PER_WEEK, PER_CYCLE, PER_KG_BODY_WEIGHT_PER_DAY, PER_KG_DIET, SINGLE_DOSE, MEDIUM_CONCENTRATION, NOT_STATED, OTHER.
  - D3 deletes QuantityBasis and D5 deletes DosePeriod.
  - D3 adds AdministrationRoute IN_MEDIUM and INTRAPERITONEAL. D2 refills its cell-free fixture contexts.
  - MassBasis (D1) stays separate: salt vs moiety is a different question.
- **Deciding question:** Q-D5-06 (v1); CQ-MX-02 (v1).
- **Evidence:** enum dumps of D3 QuantityBasis, D5 DosePeriod and D6 AmountBasis; `review-open-issues.json` D2.open[1].
- **Size effect:** −2 enums. Filter inputs not measured (slim reports that all three print EnumScalarFilters).
- **Owner decision:** no.

#### R-59 · Direction vocabularies
- **Panel:** slim C-23.
- **Packets:** D2, D3.
- **Ruling:**
  - D2 deletes MechanismDirection and types `MechanismProjectionProperties.direction` as D3 EstimateDirection (INCREASED, DECREASED, NO_CHANGE, MIXED, UNKNOWN).
  - K EffectDirection (BENEFIT, HARM) stays the only judgment vocabulary.
- **Deciding question:** CQ-MX-03 (v1).
- **Evidence:** the enum dumps; slim's variant `enums` step.
- **Size effect:** measured inside the enums variant (R-44): −1 enum and −1 input of the −4 / −4 / −1,583 B.
- **Owner decision:** no.

#### R-60 · Vocabulary pins
- **Panel:** coverage C-45.
- **Packets:** D5, D13, D10, D2, D7, D12.
- **Ruling:**
  - `final/vocabularies` publishes targets@0.2.2 and frontiers@0.2.1.
  - D10 (targets and frontiers @0.1.0), D13 (targets @0.1.0), D2 and D7 (frontiers @0.2.0) and D12 (targets @0.2.1) re-pin.
  - D10 acknowledges the `DecisionCriterion.targetKeys` exception (OQ-D5-47).
- **Deciding question:** Q-D5-01 (v1).
- **Evidence:** `grep` of `vocab-targets.yaml@` / `vocab-frontiers.yaml@` in the 10-seams files shows @0.1.0, @0.2.0 and @0.2.1 pins.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-61 · The node name `Target`
- **Panel:** coverage C-56.
- **Packets:** D5, D2.
- **Ruling:** Keep `Target` (directive 3.1). Molecular targets stay D2 MolecularEntity. An NL→query eval may reopen this.
- **Deciding question:** Q-D5-01 (v1).
- **Evidence:** D5 OQ-D5-02.
- **Size effect:** 0.
- **Owner decision:** no.

### Group 4: domain merges

#### R-62 · Product vs FoodItem vs prepared food (an expected conflict area)
- **Panel:** slim C-04 · coverage C-27 · provenance C-50 (food part) (they agree).
- **Packets:** D6, D12, D1, D8.
- **Ruling:**
  - Anything an organization sells is a D6 Product with a LabelVersion: a menu item, a packaged food, or an FDC Branded Foods record (with FDC_ID as an Identifier). That includes PREPARED_FOOD, CONVENTIONAL_FOOD and BEVERAGE.
  - Reference and survey foods are D12 FoodItem: FDC Foundation, SR Legacy, FNDDS and Phenol-Explorer.
  - The two are linked only by HAS_REFERENCE_FOOD (asserted, licensed by a RESOLUTION Assessment when a resolver chose it) and are never merged.
  - Reference composition is never copied onto the Product. Product composition comes only from DECLARES_COMPONENT lines, and FoodItem stays standalone.
  - D6 removes PREPARED_WITH. The one predicate is D12's HAS_RECIPE_INGREDIENT, whose subject is FoodItem or D6 Product.
  - Measured contaminants in a sold food follow R-73.
- **Deciding question:** Q-D12-04 (v1); Q-D12-05 (v1); Q-D6-01 (v1).
- **Evidence:** registrations of PREPARED_WITH (D6) and HAS_RECIPE_INGREDIENT (D12); `packets/D6/05-relationship-register.yaml:215`.
- **Size effect:** 0 types; −1 predicate.
- **Owner decision:** no.

#### R-63 · Diets: D12 DietaryPattern vs D5 Intervention
- **Panel:** slim C-06 · coverage C-26 · provenance C-50 (diet part) (they agree).
- **Packets:** D12, D5, D3.
- **Ruling:**
  - D12 DietaryPattern is the only node for any eating pattern defined by what, when or how much is eaten, including time-restricted eating and fasting-mimicking diets.
  - D5 removes time-restricted eating from the LIFESTYLE_PRACTICE docstrings.
  - D12 updates its DietaryPattern docstring and closes OQ-D12-03.
  - D3 AdministeredMaterial keeps both Intervention and DietaryPattern, under the identity rule that an eating pattern is administered as a DietaryPattern. STEP_USES reaches it through Subjectable.
- **Deciding question:** Q-D12-11 (v2); directive 3.3. No value-1 question is affected.
- **Evidence:** verified `packets/D5/04-schema-proposal.graphql` lines 44 and 285 ("time-restricted eating"); D5 InterventionKind has no DIETARY_PATTERN.
- **Size effect:** 0. This prevents minting the same diet twice.
- **Owner decision:** no.

#### R-64 · Composition edges: D1 MATERIAL_CONTAINS vs D12 FOOD_CONTAINS
- **Panel:** slim C-05 · coverage C-28 (they agree).
- **Packets:** D1, D12, K.
- **Ruling:**
  - Keep two types with aligned qualifier names (`statementKind` from D1 ContentStatementKind, `quantity`, `unitCode`). K's rule that a relationship name has one owning module outranks the smaller model, and the time bases differ (D1 episode, D12 recorded-only).
  - The canonical cross-module read `[:MATERIAL_CONTAINS|FOOD_CONTAINS]` goes into `query-patterns.md`.
  - A single CONTAINS type is recorded as a measured option that needs a K pattern change.
- **Deciding question:** Q-D12-21 (v2); Q-D1-22 / Q-D1-11 (v2).
- **Evidence:** `packets/K/09-reasoning.md` line 81.
- **Size effect:** 0 kept. The merge option would save 1 relationship type and 1 edge-property type, with FoodContentProperties printing 8,139 B (slim scratch item 8).
- **Owner decision:** no.

#### R-65 · Conferences and talks: D9 vs D13 (an expected conflict area)
- **Panel:** slim C-07 · coverage C-37 · provenance C-51 (Event part) (they agree).
- **Packets:** D9, D13.
- **Ruling:**
  - Neither module has a Conference or Session node, and there is no Event per edition.
  - The recurring meeting is a D9 Channel with `channelKind` EVENT_SERIES. Edition and session are qualifiers on D13's PRESENTED_AT_CONFERENCE (object D9.Channel).
  - Each presentation with a data claim is a D13 DATA_PRESENTATION Event. A talk with no data claim gets no Event.
  - A recording is a MediaWork linked by the D9 predicate RECORDING_OF → Event.
  - D9 rewrites its 06 `mergedInto` row and the 11 wording, and closes D13-2.
- **Deciding question:** Q-D13-25 (v3). No value-1 question is affected.
- **Evidence:** `packets/D9/06-node-register.yaml:119` (pinned: Conference); D13 EventKind has no CONFERENCE value.
- **Size effect:** 0. This avoids one Event node per edition.
- **Owner decision:** no.

#### R-66 · D13 Events vs D8 and D3 records; regulatory pathway vocabulary
- **Panel:** slim C-10 · coverage C-34 and C-38 · provenance C-51 (regulatory part) (they agree).
- **Packets:** D13, D8, D3.
- **Ruling:**
  - D8 owns the regulatory vocabulary. D13 deletes ApprovalPathway and DesignationType. It keeps the `Event.approvalPathway` and `Event.designationType` fields (Q-D13-04 and the identity rule filter on them), retyped to D8 RegulatoryPathway via D8's OQ-D8-02 mapping, and remaps vocab-frontiers `breakthroughCriteria` and its FIELD Assertions.
  - A regulatory act is one D8 RegulatoryRecord plus at most one D13 Event, linked by DOCUMENTED_BY_RECORD. Its date is one Assertion on one shared locator, and the Event clocks are caches (R-45).
  - D13 mints an Event only for a frontier timeline and never re-asserts a date that a D3 or D8 record already carries.
  - INVOLVES {REGULATOR, APPLICANT, ISSUER} is written only when no DOCUMENTED_BY_RECORD exists. The executor enforces this, so the path is Event → DOCUMENTED_BY_RECORD → ISSUED_BY / ADDRESSED_TO.
  - Process chains (submission → acceptance → approval) are computed from the shared D8 application identifier, not from LEADS_TO.
- **Deciding question:** Q-D13-04 (v1); Q-D13-05 (v1); CQ-MF-02 (v1).
- **Evidence:** D13 enum dumps; `review-open-issues.json` D13.open[5] (item 43) and D8.open[0].
- **Size effect:** measured inside the enums variant (R-44): ApprovalPathway and DesignationType account for −2 enums and −2 filter inputs.
- **Owner decision:** no.

#### R-67 · Organization roles, Facility and NAMES_RESPONSIBLE_PARTY (an expected conflict area)
- **Panel:** slim C-11 · coverage C-02 and C-03 · provenance C-52 (roles part) (they agree).
- **Packets:** D7, D6, D8, D3, D4, D9, D13, D1.
- **Ruling:**
  - Organization keeps 2 relationship fields and gets no new ones.
  - Every role edge lives on the asking module's type: D3 HAS_STUDY_ROLE; D6 SELLER_OF_RECORD and NAMES_RESPONSIBLE_PARTY; D8 ISSUED_BY, ADDRESSED_TO, ASSIGNED_TO and LICENSED_TO; D9 CONTENT_SPONSORED_BY; D13 INVOLVES; D4 PERFORMED_BY_LAB.
  - NAMES_RESPONSIBLE_PARTY stays typed (closes OQ-D6-29). The label's DISTRIBUTED_BY / MANUFACTURED_FOR role stays in `LabelVersion.responsiblePartyRole`.
  - No Facility node: a certified site is the operating Organization plus verbatim scope, and the facility branch uses the D8 predicate LISTING_COVERS_FACILITY_OF. D8 is the designated future owner. The promotion trigger is FDA Data Dashboard access plus a value-1 question joining two records through one FEI. Closes OQ-D7-05.
  - D7 removes its stale `COVERS → D7.Organization` seam row and its CQ-MF-01 citations on ISSUED_BY rows.
- **Deciding question:** Q-D6-16 (v1); Q-D3-08 (v1); CQ-PF-03a (v1).
- **Evidence:**
  - `packets/D7/10-seams.yaml:48` (COVERS → Organization).
  - `packets/D8/04-schema-proposal.graphql:355` (CertificationCoverageTarget = Product | ProductVariant | Lot).
  - `packets/D6/11-open-questions.md` OQ-D6-29.
  - Hub check: the largest relationship-field count on any type is 8 (Assertion).
- **Size effect:** 0. This avoids +1 node type (Facility) and about +3 pairs. Keeping NAMES_RESPONSIBLE_PARTY costs 1 type and 1 pair (D6).
- **Owner decision:** no.

#### R-68 · Manufacturer, supplier and distributor predicates (slim and coverage disagree on one mapping)
- **Panel:** slim C-12 · coverage C-01 · provenance C-52 (predicates part).
- **Packets:** D7, D1, D6, D8.
- **Ruling:**
  - These stay predicate-only, under one set registered by D7:
    - MANUFACTURES: Organization → D6.Product | D1.IngredientMaterial.
    - CONTRACT_MANUFACTURES_FOR: qualifier `product=`.
    - SUPPLIES_MATERIAL: qualifiers `exclusivity=SOLE|NON_EXCLUSIVE|UNSTATED` and `buyer=`.
    - MANUFACTURER_UNNAMED: qualifier `manufacturingKind=`.
    - DISTRIBUTES: moved from D8, for distributor statements that do not come from a label. A label's distributor is NAMES_RESPONSIBLE_PARTY.
  - Renames:
    - D1 MANUFACTURES_MATERIAL → MANUFACTURES.
    - D6 MANUFACTURER_STATEMENT → **MANUFACTURER_UNNAMED**.
    - D8 SUPPLIES_INGREDIENT → SUPPLIES_MATERIAL.
    - D8 EXCLUSIVE_SUPPLIER_OF → SUPPLIES_MATERIAL with `exclusivity=SOLE`.
  - D1, D6 and D8 delete their duplicate registrations. CQ-MF-01 is answered in Cypher over Assertions. The missing GraphQL filter is a recorded gap, and the promotion trigger stays in D7 05.
- **Lens followed:** coverage for D6 MANUFACTURER_STATEMENT. D7's register already says MANUFACTURER_UNNAMED "replaces … D6 MANUFACTURER_STATEMENT", and the D6 row describes an unnamed manufacturer. Slim's mapping to MANUFACTURES would require a named Organization.
- **Deciding question:** CQ-MF-01 (v1).
- **Evidence:**
  - `packets/D7/05-relationship-register.yaml` lines 175–178.
  - `packets/D6/05-relationship-register.yaml` lines 217, 226 and 230 (SOLE_SUPPLIER_OF already removed).
  - `packets/D8/05-relationship-register.yaml` lines 226 and 238.
- **Size effect:** 0 types. This avoids +2 relationship types; −6 duplicate predicate registrations.
- **Owner decision:** no.

#### R-69 · Awards and investors across D7 and D13
- **Panel:** slim C-13 · coverage C-36 · provenance C-52 (investors part) (they agree).
- **Packets:** D7, D13, D3.
- **Ruling:**
  - A grant, contract or prize is a D7 Award, carrying the amount, funders and recipients (with D3 HAS_STUDY_ROLE FUNDING_AWARD).
  - A D13 AWARD Event is only an announcement or milestone pointing EVENT_ABOUT → Award, with no amount.
  - Round participation is D13 INVOLVES {INVESTOR | LEAD_INVESTOR}. D7 HOLDS_STAKE is written only when a source states the holding, never inferred.
  - D13 states both rules in its 05 and 09 and lists EVENT_ABOUT → D7.Award in its 10-seams.
  - Q-D7-13 labels each row STATED_HOLDING or ROUND_PARTICIPANT. Closes OQ-D7-32 and OQ-D7-33.
- **Deciding question:** Q-D7-04 (v1); Q-D7-05 (v1); Q-D3-08 (v1).
- **Evidence:** D13 EventRole (no AWARDING_BODY or AWARDEE; verified).
- **Size effect:** 0.
- **Owner decision:** no.

#### R-70 · Outcome and Condition (D2) vs OutcomeDefinition (D3) vs Biomarker and Metric (D4) (an expected conflict area; all three lenses disagree)
- **Panel:**
  - slim C-03: merge Outcome away into Condition and Biomarker/Metric.
  - coverage C-21 and C-22: keep Outcome, add Condition to TargetMeasure, LOINC on Metric only.
  - provenance C-53 and C-48: keep Outcome, join Condition to Target through a shared Identifier, LOINC on Metric only.
- **Packets:** D2, D3, D4, D5.
- **Ruling:**
  - **Keep D2 Outcome.** D3 OutcomeDefinition is what a study declares. D2 Outcome and Condition, and D4 Metric and Biomarker, are the concepts it MEASURES.
  - **LOINC belongs to D4 Metric only.** D2 removes LOINC from `Outcome.identifierSchemes` (R-42).
  - **Condition-coded outcomes reach a Target through a typed member:** D5 `union TargetMeasure = Biomarker | Metric | Outcome | Condition`. OPERATIONALIZED_BY → Condition means "incidence of this condition measures the target", and the direction lives in D5's vocab-targets rule. The pair is unfixtured and value 1, so under R-06 it is kept with a fixture request: ASPREE hemorrhage or dementia → a target.
  - Seams and text:
    - D2 adds the seam row OPERATIONALIZED_BY D5.Target → D2.Outcome (direction IN, owner other) and updates the Outcome docstring.
    - D3 adds Outcome and Condition to its OPERATIONALIZED_BY row and drops its note that clinical-event outcomes "do not reach a target".
    - `outcomeKey` is a versioned normalizer; there is no SAME_OUTCOME_AS edge.
  - Q-D5-20 (v3) uses the same join.
- **Lens followed:** coverage.
  - Slim's merge is overruled by precedence step 4. The value-1 packets whose questions traverse this concept (D3: Q-D3-04 and Q-D3-05 with `OutcomeMeasureTarget = Metric | Biomarker | Outcome | Condition`; D5 with `TargetMeasure = … | Outcome`) both model Outcome. D5's antioxidant fixture writes OPERATIONALIZED_BY → Outcome four times. D2's own docstring separates biological proxies (D4) from endpoint concepts.
  - Provenance's shared-Identifier join is ruled out by R-42.
- **Deciding question:** Q-D3-04 (v1); Q-D3-05 (v1); Q-D5-01 (v1).
- **Evidence:**
  - `packets/D2/04-schema-proposal.graphql` lines 396–438.
  - `packets/D2/06-node-register.yaml` (Outcome).
  - `packets/D5/04-schema-proposal.graphql:229`.
  - `packets/D3/04-schema-proposal.graphql` lines 404 and 703–704.
  - `packets/D3/11-open-questions.md` #8.
  - `packets/D5/11-open-questions.md` OQ-D5-43 and OQ-D5-45.
  - `packets/D5/07-fixtures/antioxidant-exercise-disconfirmation/assertions.yaml` lines 486–516.
- **Size effect:**
  - Kept: +1 pair (collapsed) and TargetMeasure 3 → 4, by construction.
  - Slim's measured merge variant, not adopted, would have given 183 collapsed / 838 expanded pairs and −8,351 B.
- **Owner decision:** no.

#### R-71 · Who owns Publication (slim disagrees)
- **Panel:** slim C-09 (merge Publication into D9 MediaWork, citing the K map) · coverage C-05 (D3 keeps it) · provenance C-01 (D3 keeps it; K text fixed).
- **Packets:** D3, D9, K, D13, D11.
- **Ruling:**
  - D3 owns Publication. D9 MediaWork excludes scholarly works and adds no JOURNAL ChannelKind.
  - D3's `Publication.venueName` docstring reads "venue name only, no container node".
  - K corrects its ownership-map row and its 04 Source docstring (R-09).
  - D13 EVENT_ABOUT keeps naming D3.Publication.
- **Lens followed:** coverage and provenance. Slim's precedence argument rests on K's map row (`09` line 103). That row is stale: K's own later text states "scholarly records: D3 publications are not D9 works" (`09` line 120) and "scholarly publications are D3's" (11-OQ 29). D3 and D9 agree (D9 11 D3-1).
- **Deciding question:** CQ-EV-05 (v1 in D3).
- **Evidence:**
  - `packets/K/09-reasoning.md` lines 103 and 120.
  - `packets/K/11-open-questions.md` item 29.
  - `packets/D3/11-open-questions.md` #2 and #34.
- **Size effect:** 0. Slim's merge, not adopted, would have removed 1 node type (not measured).
- **Owner decision:** no.

#### R-72 · Device reached by two paths
- **Panel:** slim C-14 · coverage C-39 (device part) (they agree).
- **Packets:** D8, D4, D3, D6.
- **Ruling:**
  - One path: regulatory acts concern the D6 Product, which DELIVERS the D4 Device.
  - D8 removes Device from RegulatoryRecordTopic (5 → 4) and LegalStatusSubject (5 → 4). It answers Q-D8-23 as STATUS_OF Product -DELIVERS-> Device and closes OQ-D8-29 with this union change.
  - D3 removes Device from AdministeredMaterial (6 → 5). A device used as a trial intervention is a ProductVariant or a D5 Intervention.
  - D4 closes #12, and D6's seam notes drop "CONCERNS has Device".
- **Deciding question:** Q-D8-23 (v1) and Q-D4-08 (v1), tie broken by the smaller model; R-06 (no fixture for either Device pair).
- **Evidence:**
  - `packets/D8/04-schema-proposal.graphql:336,339`; `packets/D3/04-schema-proposal.graphql:398`.
  - `packets/D4/07-fixtures/noninvasive-glucose-cgm-recall/assertions.yaml:308` (the recall reaches the Device through Product).
  - A grep of all fixtures for CONCERNS or STATUS_OF to a Device finds 0.
  - `packets/D8/11-open-questions.md` OQ-D8-32.
- **Size effect:** measured (device variant): −3 pairs collapsed (184 → 181), −3 expanded (851 → 848), −3 inputs, −1,115 B. The widest union drops from 6 to 5.
- **Owner decision:** no.

#### R-73 · D8 union pairs without fixtures; measured content of sold products (slim and coverage disagree)
- **Panel:** slim C-15 (cut the two v2 unfixtured pairs) · coverage C-40 (QualityResult with Product members for every measured row; retire D1's predicates).
- **Packets:** D8, D6, D1, D12.
- **Ruling:**
  - **Cut** QUALITY_RESULT_FOR → Product and CONCERNS Patent → IngredientMaterial. QualityResultFor and PatentTopic are removed, and the fields are typed Lot and ChemicalSubstance.
  - **Keep** COVERS → ProductVariant (CQ-PF-03a, v1) and STATUS_OF → Product (CQ-MF-02, v1), with numbered fixture requests in `final/requests.md` (LNHPD NPN, NSF variant listing).
  - **Measured content:** a lot-identified measurement is a D8 QualityResult. A survey row that names no lot stays the D1 predicate MEASURED_CONTENT_IN_PRODUCT or CONTAINS_UNDECLARED_SUBSTANCE (subject D6 Product | ProductVariant, object D1 substance), until a survey fixture promotes the Product member. An undeclared drug is also a D8 record with `violationCategory` UNDECLARED_DRUG_INGREDIENT.
  - Slim's "PROPOSED Lot" fallback is rejected: it would mint a record no source identifies.
  - D8 registers SAMPLE_TESTED_POSITIVE_FOR (subject Product | Lot, object D1.Taxon), and D6 renames its provisional SAMPLE_POSITIVE_OUTBREAK_STRAIN fixtures to it. Taxon is not added to QualityAnalyte.
- **Lens followed:** slim for the cut. The contract rule (precedence step 2, R-06) outranks coverage's smaller-registry argument. The predicate fallback is the chief's.
- **Correction (fix stage, 2026-10-09).** This entry first said "no fixture writes QUALITY_RESULT_FOR → Product". That is false for the D12 fixture. `fixtures/D12/acrylamide-fried-potato-harm` row acr-03 (assertions.yaml line 71, intent.json proposal p03-result-for) writes QualityResult → Product for an FDA survey sample with no lot. The D8 fixtures write only Lot objects. So the cut drops the path of two value-1 questions, Q-D12-03 and Q-D12-06, whose packet patterns now return no rows (questions catalog: "pattern broken"). Under 03-SYNTHESIS step 7, a cut that drops a value-1 question is an owner exception, recorded as R-95 (OD-10).
- **Deciding question:** Q-D8-06 (v2) and Q-D8-11 (v2) are cut; CQ-PF-03a (v1) and CQ-MF-02 (v1) are kept; Q-D1-10 (v2).
- **Evidence:**
  - `packets/D8/04-schema-proposal.graphql:345,358`.
  - D8 fixtures: QUALITY_RESULT_FOR objects are all Lot (eurofins-coa); the CONCERNS Patent object is D1.ChemicalSubstance (us8197807).
  - `packets/D8/11-open-questions.md` OQ-D8-32.
  - `packets/D1/11-open-questions.md` OQ-D1-08 and OQ-D1-30 (no fixture).
  - `packets/D6/07-fixtures/recall-moringa-mogo` (SAMPLE_POSITIVE_OUTBREAK_STRAIN).
- **Size effect:** measured (d8unfix variant): −2 pairs collapsed (184 → 182) and −2 expanded (851 → 849), −2 unions, −7 inputs (975 → 968), −2,303 B (1,735,059 → 1,732,756).
- **Owner decision:** no.

#### R-74 · Requests to widen D8 unions (Package, MediaWork)
- **Panel:** slim C-16 · coverage C-39 (they agree).
- **Packets:** D6, D8, D9, D4.
- **Ruling:** Decline both.
  - Package-size scope stays in D8 verbatim fields plus D6 recall-scope and certification-scope Assessments.
  - Records that cite media use the D9 predicate CITES_CONTENT.
  - The freed slots stay free. The promotion trigger is a package-scoped recall fixture or a value-1 question that traverses MediaWork.
- **Deciding question:** CQ-PF-03b (v2 in D6); Q-D9-12; Q-D6-04 (v1, answered through Product).
- **Evidence:** D6 OQ-D6-13; D9 OQ D8-1; `packets/D8/11-open-questions.md` OQ-D8-29.
- **Size effect:** avoids up to +4 pairs.
- **Owner decision:** no.

#### R-75 · Target of BLOCKED_BY
- **Panel:** slim C-18 · coverage C-16 · provenance C-42 (they agree).
- **Packets:** D10, D5, K.
- **Ruling:**
  - BLOCKED_BY → D5.UseConstraint | K.Assessment, as in D10's SDL. A row's ASSESSES means only its option, and the row cites the resolving Assertion through DERIVED_FROM.
  - D5 reverses OQ-D5-39, changes its seam to BLOCKED_BY → D5.UseConstraint (owner other), and deletes the `K.Report ASSESSES D5.UseConstraint` row.
  - K deletes its stale rows (R-09).
- **Deciding question:** CQ-RC-06 (v1 per R-08); Q-D10-24 (v1).
- **Evidence:** `review-open-issues.json` D10.open[1]; fixture livertox-green-tea-extract-harm.
- **Size effect:** 0 (2 pairs either way).
- **Owner decision:** no.

#### R-76 · UseConstraint is not a Claim
- **Panel:** slim C-19 · coverage C-17 · provenance C-41 (they agree).
- **Packets:** D5, K, D10.
- **Ruling:**
  - Keep D5 UseConstraint as a projection-minted grouping identity (`use-constraint-key/v2`), reached by the derived RESOLVES_TO_CONSTRAINT and STATES_CONSTRAINT.
  - It carries scope descriptors only, with no level and no verdict.
  - K adds the ownership-map row "UseConstraint (D5): projection-minted grouping of safety Assertions; not a Claim; never vetted". Closes OQ-D5-38.
- **Deciding question:** Q-D5-23 (v1); Q-D5-06 (v1).
- **Evidence:** D5 OQ-D5-38.
- **Size effect:** 0. This avoids widening Claim.
- **Owner decision:** no.

#### R-77 · Role edge-property types that differ only by their role enum
- **Panel:** slim C-24.
- **Packets:** D3, D7, D9, D13.
- **Ruling:**
  - Keep the four types (StudyRoleEdgeProperties, RoleEdgeProperties, AppearanceEdgeProperties, EventRoleEdgeProperties) and their domain role enums.
  - Two shared types with one PartyRole enum are recorded as an optional lever.
- **Deciding question:** Q-D3-08 (v1); CQ-CL-05 (v1).
- **Evidence:** slim scratch item 8: StudyRoleEdgeProperties 7,302 B, AppearanceEdgeProperties 5,198 B, EventRoleEdgeProperties 4,284 B printed.
- **Size effect:** 0. The lever would save about 12.5 KB.
- **Owner decision:** no.

#### R-78 · D7 financial-interest family: Shape B kept
- **Panel:** slim C-25.
- **Packets:** D7, D5, D9.
- **Ruling:**
  - Keep HOLDS_ROLE, HOLDS_STAKE and RECEIVES_VALUE_FROM. PARENT_OF stays separate, because control is not investment.
  - D5 adopts HOLDS_* in its seams, replacing HAS_INTEREST_IN (OQ-D7-29), and in Q-D5-13.
- **Deciding question:** Q-D7-01 (v1); CQ-CL-05 (v1).
- **Evidence:** `packets/D7/09-reasoning.md` "Shape A vs Shape B": Shape B "costs 25 KB and 12 inputs more than Shape A".
- **Size effect:** 0 (Shape A is a recorded lever of about 25 KB and 12 inputs).
- **Owner decision:** no.

#### R-79 · Channel operator
- **Panel:** slim C-26 · coverage C-10 (they agree).
- **Packets:** D9, D7.
- **Ruling:**
  - OPERATED_BY and REPUBLISHES stay predicate-only, owned by D9 with subject Channel.
  - D7 deletes its typed OPERATED_BY seam row (union ChannelOperator) and its inverse predicate OPERATES_CHANNEL.
  - The promotion trigger is a measured CQ-CL-05 latency.
- **Deciding question:** CQ-CL-05 (v1); Q-D9-07 (v2).
- **Evidence:** `packets/D7/10-seams.yaml:27`; D7 registers OPERATES_CHANNEL (preds scan).
- **Size effect:** avoids +1 relationship type, +2 pairs and +1 union; −1 predicate.
- **Owner decision:** no.

#### R-80 · Authorship spelled four ways
- **Panel:** slim C-27 (D9 owns AUTHORED_BY, which assumed Publication merged into MediaWork) · coverage C-08 (D3 registers it).
- **Packets:** D3, D7, D5, D13, D9.
- **Ruling:**
  - One predicate, AUTHORED_BY, **registered by D3**: subject D3.Publication | D5.Protocol | D5.ProtocolEdition, object D7.Person | D7.Organization.
  - D9 keeps its typed APPEARS_IN {role AUTHOR} for MediaWorks.
  - D7 drops AUTHORED. D5 renames PROTOCOL_AUTHORED_BY in 05, 03 (Q-D5-13) and its fixtures. D13 drops the AUTHOR role (R-44).
  - D7 supplies author identity through RESOLUTION Assessments (K 11-OQ 29a).
- **Lens followed:** coverage. Slim's D9 ownership depended on the merge rejected in R-71, and D3 already registers AUTHORED_BY.
- **Deciding question:** Q-D5-13 (v1); Q-D3-08 (v1).
- **Evidence:** preds scan: AUTHORED_BY (D3), AUTHORED (D7), PROTOCOL_AUTHORED_BY (D5).
- **Size effect:** 0 types; −2 predicates and −2 enum values.
- **Owner decision:** no.

#### R-81 · Speaking and appearing
- **Panel:** slim C-28.
- **Packets:** D7, D13, D9.
- **Ruling:**
  - A presentation at a meeting is D13 INVOLVES {PRESENTER}. An appearance in media is D9 APPEARS_IN.
  - D7 deletes SPEAKS_AT and uses PRESENTER, not SPEAKER (D13 item 35).
- **Deciding question:** CQ-CL-05 (v1).
- **Evidence:** preds scan: SPEAKS_AT (D7).
- **Size effect:** −1 predicate.
- **Owner decision:** no.

#### R-82 · Funding and interest disclosure
- **Panel:** slim C-29.
- **Packets:** D11, D3, D7, D9, D5.
- **Ruling:**
  - Funding of a Study is the typed HAS_STUDY_ROLE {FUNDER}. A paper-level funding statement is one D3 predicate, FUNDED_BY, into which D3 folds FUNDER_ROLE_STATEMENT as qualifiers.
  - A disclosure is one predicate, DISCLOSES_INTEREST, **registered by D9**, the existing registrar. Its subject is the discloser or the work, and its object is an Organization.
  - "No competing interest" is the same predicate with polarity NEGATIVE and speechAct DENIES, which D7 accepts (OQ-D5-44).
  - D3's COMPETING_INTEREST_STATED folds into DISCLOSES_INTEREST. D11 drops FUNDED_BY, DISCLOSES_SUPPORT_FROM and DECLARES_NO_COMPETING_INTEREST.
  - D7's DISCLOSES_INTERESTS_OF stays, for third-party lists only.
- **Lens followed:** slim's merge, with one deviation. Slim named D7 as registrar, but D9 already registers DISCLOSES_INTEREST and D7 does not, so registrar rule 3 (R-52) keeps D9.
- **Deciding question:** Q-D3-08 (v1); CQ-CL-05 (v1); Q-D7-20.
- **Evidence:** preds scan: DISCLOSES_INTEREST (D9), DISCLOSES_INTERESTS_OF (D7), FUNDED_BY / DISCLOSES_SUPPORT_FROM / DECLARES_NO_COMPETING_INTEREST (D11), COMPETING_INTEREST_STATED / FUNDER_ROLE_STATEMENT (D3).
- **Size effect:** −5 predicates; 0 types.
- **Owner decision:** no.

#### R-83 · Recommendations
- **Panel:** slim C-30 · coverage C-18 · provenance C-18 (goal part) (they agree).
- **Packets:** K, D9, D7, D10, D5.
- **Ruling:**
  - A recommendation is a claim occurrence (speechAct RECOMMENDS) with predicate RECOMMENDS_USE or RECOMMENDS_AGAINST, both **registered by D9**. The subject is the recommended means, never a Target; a goal goes in the qualifier `target:<key>`.
  - Only D5's five goal predicates take a Target object.
  - D10 merges RECOMMENDS_FOR into RECOMMENDS_USE and rewrites the guideline branches of Q-D10-08 and Q-D10-03 to WORSENS_TARGET | NO_EFFECT_ON_TARGET (or USE_CONSTRAINED_IN for population guidance) with speechAct CAUTIONS | RECOMMENDS.
  - D7 drops ENDORSES_PRODUCT and its RECOMMENDS_USE registration. D5 and D10 drop their RECOMMENDS_AGAINST registrations.
  - D2's MEDIATES_TARGET (Mechanism subject) is admitted.
  - There is no stored RECOMMENDS edge (directive 3.9).
- **Deciding question:** Q-D9-01 (v1); Q-D10-08 (v1).
- **Evidence:**
  - `packets/D5/05-relationship-register.yaml` lines 241–243.
  - `packets/D7/05-relationship-register.yaml` lines 164 and 183.
  - `packets/D10/05-relationship-register.yaml` lines 171 and 174.
- **Size effect:** −2 predicates.
- **Owner decision:** no.

#### R-84 · Adverse effects
- **Panel:** slim C-31 · coverage C-23 (they agree).
- **Packets:** D5, D9, D2, D8, D13, D3.
- **Ruling:**
  - One predicate, CAUSES_ADVERSE_EFFECT (D5), with object D2 Condition (conditionKind PHENOTYPE or DISEASE). The same Condition is the object of USE_CONSTRAINED_IN, HAS_APPROVED_INDICATION, D13 EVENT_ABOUT and D3 MEASURES for adverse-event outcomes.
  - A community report carries basisKind PERSONAL_EXPERIENCE and the qualifier `sourceKind:COMMUNITY`, and is aggregated only by a D5 safety-signal Assessment.
  - D5 deletes REPORTS_ADVERSE_EXPERIENCE, which D9 has already retired.
  - No AdverseEffect node (closes OQ-D5-03). One condition resolver (D11). The MedDRA licence is a separate owner item.
- **Deciding question:** Q-D5-01/02 (v1); Q-D5-07 (v1).
- **Evidence:** preds scan: REPORTS_ADVERSE_EXPERIENCE registered by D5 only.
- **Size effect:** −1 predicate. This avoids +1 node type.
- **Owner decision:** no.

#### R-85 · Subject lists and limit kinds of the D5 predicates
- **Panel:** coverage C-19 and C-20 · slim C-32 (part) · provenance C-18 (part) (they agree).
- **Packets:** D5, D1, D12, D11, D9, D10.
- **Ruling:**
  - Subjects added:
    - D1.Constituent to HAS_UPPER_LIMIT and HAS_AUTHORIZED_DOSE_RANGE.
    - D12.FoodItem and D12.FoodCategory to CAUSES_ADVERSE_EFFECT.
    - FoodCategory to INTERACTS_WITH and to the target predicates.
  - Values added:
    - limitKind SCHEDULING_THRESHOLD and LABEL_WARNING_THRESHOLD.
    - USE_CONSTRAINED_IN section BOXED_WARNING.
    - CAUSES_ADVERSE_EFFECT sourceKind REFERENCE_MONOGRAPH. SPONTANEOUS_REPORT is confirmed for CAERS.
  - D5 removes D11 from the targets consumer list.
  - Threshold screens are computed at query time over the materialized daily amounts (Q-D1-02). EXCEEDS_DOSE_THRESHOLD is not stored and is written only inside a published Report.
- **Deciding question:** Q-D1-03 (v1); Q-D12-08 (v1).
- **Evidence:** `review-open-issues.json` D1.open[0], D12.open[1] and D11.open[1].
- **Size effect:** 0 (vocabulary only). There are fewer stored CALCULATED Assertions.
- **Owner decision:** no.

#### R-86 · D2 ContextExposure, substance or material (slim's proposal rejected)
- **Panel:** slim C-35.
- **Packets:** D2, D3, D1.
- **Options:** (a) keep `ContextExposure = ChemicalSubstance | IngredientMaterial | Intervention`; (b) apply D1's material-resolution rule and drop ChemicalSubstance.
- **Ruling:** (a), unchanged.
  - D2's contexts are mechanistic and preclinical exposures at the substance level, as is MechanismModulator. D1's UNRESOLVED_MATERIAL rule governs what a study administers (D3), not what a mechanistic context was exposed to.
  - EXPOSED_TO stays structural (R-26) and is written alongside IN_STUDY_ARM where the fixture needs single-substance reach.
- **Lens followed:** none of the panels' proposals is adopted. Precedence step 4: Q-D2-09 (v1) is D2's. D2's model and fixtures write EXPOSED_TO → D1.ChemicalSubstance (dasatinib, quercetin, metformin, NR), and the dq fixture states "single-substance questions reach the finding through EXPOSED_TO".
- **Deciding question:** Q-D2-09 (v1).
- **Evidence:** `packets/D2/04-schema-proposal.graphql:229`; `packets/D2/07-fixtures/dq-senescence-biomarker-path/assertions.yaml` lines 8, 19–22 and 101–109.
- **Size effect:** 0. Slim's option would have saved 1 pair (not measured).
- **Owner decision:** no.

#### R-87 · One Assertion per declared label line
- **Panel:** slim C-43 · coverage C-43 · provenance C-55 (they agree).
- **Packets:** D6, D1, D12, D3.
- **Ruling:**
  - DECLARES_COMPONENT lines stay asserted, one Assertion per line. Directive 3.10 puts slimming in domain layers, not in provenance, and D1's CALCULATED amounts cite each line.
  - Never use both forms.
  - D12 closes OQ-D12-32, and D6 closes OQ-D6-30.
- **Deciding question:** Q-D1-02 (v1); Q-D6-01 (v1).
- **Evidence:** D6 OQ-D6-30.
- **Size effect:** 0 schema. At the data level, about 5–30 Assertions per label version (D6 estimate).
- **Owner decision:** no.

#### R-88 · Prescription drugs
- **Panel:** coverage C-04.
- **Packets:** D6, D8, D5, D9, D11.
- **Ruling:** enum values on existing types, no new node.
  - D6 adds ProductKind PRESCRIPTION_DRUG, PanelKind PRESCRIBING_INFORMATION and ComponentLineRole ACTIVE_INGREDIENT.
  - D8 adds LegalStatusKind PRESCRIPTION_ONLY, scoped by jurisdiction.
  - The D8 predicate HAS_APPROVED_INDICATION takes subject D6.Product | D1.ChemicalSubstance and object D2.Condition.
  - A boxed warning is a D5 USE_CONSTRAINED_IN Assertion with section BOXED_WARNING (R-85).
  - The asserter of a label statement is the labeler of record. Supersession follows R-23, not coverage's cross-asserter clause.
- **Deciding question:** Q-D11-11 (v1); Q-D9-21.
- **Evidence:** enum dumps: none of the four values exists today.
- **Size effect:** +4 enum values; 0 types and pairs.
- **Owner decision:** no.

#### R-89 · Broken D2 → D7 path in Q-D2-21
- **Panel:** coverage C-25.
- **Packets:** D2, D7.
- **Ruling:** D2's 03 reads `(who)-[r:HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM]->(org)` with stakeKind EQUITY, roleKind ADVISOR | CONSULTANT and valueKind INVENTOR_ON_LICENSED_IP, filtered by episode overlap.
- **Deciding question:** Q-D2-21 (v2).
- **Evidence:** `packets/D2/03-retrieval-patterns.md:628` uses non-existent predicates (HOLDS_EQUITY_IN, CONSULTS_FOR, INVENTOR_OF_PATENT_LICENSED_TO).
- **Size effect:** 0.
- **Owner decision:** no.

#### R-90 · Species
- **Panel:** coverage C-31.
- **Packets:** D1, D2, D3.
- **Ruling:**
  - D2 contexts and D3 populations join species by `ncbiTaxonId` equality. ModelOrganism stays D2's coarse filter.
  - D1 Taxon covers source organisms only, and no study or context edge points at it.
- **Deciding question:** CQ-MX-03 (v1).
- **Evidence:** `packets/D2/04-schema-proposal.graphql` lines 67, 285 and 306.
- **Size effect:** 0 (avoids +2 pairs).
- **Owner decision:** no.

#### R-91 · What attaches to a Frontier
- **Panel:** coverage C-33.
- **Packets:** D13, D7, D1, D6.
- **Ruling:**
  - Use D13's rule: only Event and Study reach a Frontier through ON_FRONTIER, which uses basis CURATOR_CLASSIFICATION (R-25).
  - Organizations and compounds are reached through INVOLVES / EVENT_ABOUT and HAS_STUDY_ROLE / ADMINISTERS, and claims through HAS_OBJECT.
- **Deciding question:** Q-D13-03 (v1).
- **Evidence:** D7 OQ-D7-21; directive 3.7 ("position to test").
- **Size effect:** 0 (avoids about +2–3 pairs).
- **Owner decision:** no.

#### R-92 · Owner and qualifiers of FINANCING_AMOUNT
- **Panel:** coverage C-35 · slim C-32 (part).
- **Packets:** D7, D13.
- **Ruling:**
  - D13 registers FINANCING_AMOUNT, DATE_OF_FIRST_SALE and INVESTOR_COUNT, since all three have the D13 Event as subject (R-52 rule 3).
  - amountKind is D13's list plus ROUND_TOTAL. amountBasis is D13's list plus REMAINING.
  - D7 drops its registrations, retires FINANCING_AMOUNT_SOLD and re-keys its fixtures.
  - REPORTED_MARKET_MOVE has subject Event and stays with D13.
- **Lens followed:** slim's registrar rule for DATE_OF_FIRST_SALE and INVESTOR_COUNT, over coverage, which left them with D7.
- **Deciding question:** Q-D7-04 (v1); Q-D13-06 (v1).
- **Evidence:** preds scan: FINANCING_AMOUNT (D13, D7), DATE_OF_FIRST_SALE (D7), INVESTOR_COUNT (D7); D13 item 35.
- **Size effect:** 0.
- **Owner decision:** no.

#### R-93 · Regulatory thresholds (action levels, claim conditions)
- **Panel:** coverage C-41.
- **Packets:** D8, D12, D10.
- **Ruling:** Both are predicate-only, registered by D8:
  - HAS_ACTION_LEVEL: subject D1.ChemicalSubstance; object D12.FoodCategory | D12.FoodItem; `valueNumber` and `unitCode`; qualifiers `status=PROPOSED|ADOPTED`, `jurisdiction` and `basis`; asserted by the regulator.
  - HAS_CLAIM_CONDITION: subject the authorizing RegulatoryRecord, with the condition in `valueString` and qualifiers. A condition on a product class takes the Claim as subject, with the qualifier `productClass=`.

  D12 replaces its placeholders in Q-D12-06 and Q-D12-18 and closes OQ-D12-31.
- **Deciding question:** Q-D12-06 (v1).
- **Evidence:** `review-open-issues.json` D12.open[5]; neither name is registered today (preds scan).
- **Size effect:** 0.
- **Owner decision:** no.

#### R-94 · Seam hygiene and stale names
- **Panel:** slim C-40 · coverage C-44 · provenance C-19 (part).
- **Packets:** K, D1, D4, D5, D6, D7, D10, D12, D13.
- **Ruling:** mechanical. The owner's SDL wins.
  - **K:** see R-09.
  - **D1:** MENTIONS `from` is D9.Chunk; FOOD_FROM_TAXON replaces DERIVED_FROM_TAXON; drop the AFFECTS_MECHANISM → MolecularEntity row; "union StepMeans" → Subjectable; the ADMINISTERS note reads AssertedRecordedProperties (D3 #26).
  - **D4:** HAS_ITEM `from` is K.Report; drop StepMeans; the RESOLUTION note reads "surface-form SourceLocator"; Device rows per R-72; rename "RegulatoryStatus" in Q-D4-10.
  - **D5:** OFFERS_INTERVENTION is predicate-only, registered by D6; BLOCKED_BY per R-75; HAS_INTEREST_IN → HOLDS_* (R-78).
  - **D6:** RESULT_FOR → QUALITY_RESULT_FOR; COVERS has no Organization member; CONCERNS has neither Device nor Patent (R-72); drop DocumentTextVersion from 03 line 812; in 05 an image is a MediaWork, not a MediaAsset; OFFERS_INTERVENTION and CONSTRAINS_USE_OF rows (OQ-D6-25/28).
  - **D7:** R-67 and R-79.
  - **D10:** drop ASSOCIATES → D12.FoodItem and the Q-D12-20 citation (OQ-D12-29); 03 line 744 takes the container from OCCURS_IN.
  - **D12:** RESULT_FOR → QUALITY_RESULT_FOR; drop the StepMeans note; DietaryPattern and FoodCategory are admissible STEP_USES targets (OQ-D5-48).
  - **D13:** 03 line 188 drops DocumentTextVersion / Episode.

  In the final `seams.yaml`, `Assertion.predicate` rows go into a separate `predicateSeams` list, checked against the R-52 registry rather than against relationship types.
- **Deciding question:** none (contract: every seam on both sides or ruled); Q-K-14 (v1).
- **Evidence:**
  - inventory-final, "Seam entries naming relationship types or module types that do not exist".
  - Coverage scratch `seamrev.mjs`.
  - `review-open-issues.json` D9.open[2] (X-1).
  - Verified that D13 10-seams no longer names D9.Publication, D9.Conference or D1.Compound (`grep` returns no seam row), and that D10 10-seams already lists D4.LabTest (line 71).
- **Size effect:** 0.
- **Owner decision:** no.

### Tally

- 94 rulings, plus four owner-decision rulings (R-95 to R-98) and seven fix-stage rulings (F-01 to F-07), all added by the fix stage (section "Fix-stage rulings" below).
- **Owner decisions: 9** in R-01 to R-94, and **13** with R-95 to R-98:
  - R-01 pairs metric.
  - R-02 size levers.
  - R-03 the CONNECT reading of directive rule 3.
  - R-09 confirmation of the non-additive kernel removals.
  - R-10 confirmation of the StateEpisodeProperties removal.
  - R-12 the mission ↔ claim link.
  - R-13 Activity granularity.
  - R-36 tool-rendition policy.
  - R-40 contracts v2.
  - R-95 a contaminant measured in a sold product with no lot (OD-10).
  - R-96 directive rule 1 and interface targets (Entity, Subjectable).
  - R-97 the kernel module's relationship-type count under R-01 (A).
  - R-98 the scope of R-14 for versioned-state payloads (OD-11).
- **Conflicts added by the chief**, missed by all three panels:
  - R-08: value conflicts on shared ids.
  - R-42: identifier uniqueness vs identifier joins.
  - R-52: duplicate registrations of RECORDING_OF, SUCCEEDED_BY, OFFERS_INTERVENTION and CAUSES_ADVERSE_EFFECT.
  - R-53: D5 registers D7's typed relationship names as predicates.
  - R-10: exclusivity carried over to the register.
- **Rulings where the chief chose between architects:** R-01, R-02, R-23, R-43, R-47, R-49, R-55, R-57, R-68, R-70, R-71, R-73, R-80, R-82, R-86 and R-92.
- **Measured net of the adopted variants:** state (R-10) + device (R-72) + d8unfix (R-73) + enums (R-44/R-59/R-66), applied with slim's `variant.mjs` to copies of the 14 packet SDLs. Command and outputs are in `_runlog/rulings.md`.
  - Pairs: 179 collapsed, 846 expanded.
  - Printed: 1,723,061 B, 959 input types, 200 enums, built "in 2s".
  - Against the baseline: −5 pairs collapsed, −11,998 B, −16 inputs, −4 enums.
  - Not yet in that measurement:
    - R-43: +1 pair.
    - R-70: +1 pair.
    - R-57 and R-58: −4 enums.
    - R-30, R-47: fields removed.
  - The slim `all` variant is not quoted, because it includes the outcome merge that R-70 rejects. The integrator measures the final set.

### Integration rulings (integrator, 2026-10-09)

Assembly (`node scripts/assemble-schema.mjs`) succeeded on the first run: 14 modules, 300 named definitions, no duplicate type name. A reference check over the assembled SDL (every named type reference resolves to a declared type or a built-in / `@neo4j/graphql` scalar) found 0 dangling references, and `print-schema` built it with no error. So no module SDL was edited at this stage. The two rulings below fix register fragments only; neither changes the SDL or any count.

#### I-01 · Seam rows missing on the declaring side (contract rule 8)
- **Found by:** `_work/merge-registers.mjs`, which matches every cross-module from→to pair of the assembled SDL against the seam rows of every module.
- **Conflict:** six cross-module pairs had a seam row only in K.seams.yaml, not in the module that declares the field. 01-PACKET-CONTRACT rule 8 requires the declaring module's `10-seams.yaml` to list every reference to a type outside the module. The pairs:
  - D9: CHUNK_OF Chunk → K.SourceSnapshot, COVERS_LOCATOR Chunk → K.SourceLocator, MENTIONS Chunk → K.Subjectable.
  - D10: DERIVED_FROM ReportItem → K.Assertion and Association → K.Assertion. D10 had treated Assertion as "allowlisted internal".
  - D5: RESOLVES_TO_CONSTRAINT K.Assertion → D5.UseConstraint. D5 listed it only under `kernelReferences`.
- **Ruling:** add the six rows to `_work/registers/D9.seams.yaml`, `D10.seams.yaml` and `D5.seams.yaml`, with status accepted. Each row's questions are copied from that module's own relationship-register entry for the type.
- **Deciding question:** none (contract rule). The rows carry Q-D9-20, Q-D9-16, CQ-PV-04, CQ-AX-01, CQ-AX-08, CQ-RC-02, Q-D10-05, Q-D10-13, Q-D10-16 and Q-D5-03 … Q-D5-26.
- **Size effect:** 0. After the fix every one of the 86 cross-module pairs has a seam row on both sides.
- **Owner decision:** no.

#### I-02 · K register fixture paths re-pathed
- **Conflict:** the 13 K relationship entries named fixtures as `07-fixtures/<folder>` (packet-relative). Every other module names `final/fixtures/<module>/<folder>`, which is where 03-SYNTHESIS step 8 re-paths fixtures.
- **Ruling:** rewrite the 13 `fixture:` fields in `_work/registers/K.relationship.yaml` to `final/fixtures/K/<folder>`. The folder names are unchanged. `merge-registers.mjs` now warns on any fixture path outside `final/fixtures/<module>/`, and it currently reports none.
- **Size effect:** 0.
- **Owner decision:** no.

#### I-03 · Three relationship types have two register entries (recorded, not changed)
- ASSESSES (K, D10), DERIVED_FROM (K, D10) and RENDITION_OF (D3, D9 with `registrar: D3`) each have one entry per declaring module.
- They are kernel-meaning types. Under R-01 they are counted once, in K (RENDITION_OF under R-43). The merged `relationship-register.yaml` keeps both entries, each stamped with its module.
- The relationship-type count (106) and the pair counts are taken from the SDL, not from register entries, so nothing is counted twice.
- **Owner decision:** no.

### Fix-stage rulings (fix stage, 2026-10-09)

Three adversarial verifiers (numbers, contract, evidence) reviewed `final/`. The fix stage reproduced each finding and either fixed or rebutted it; the log is `_runlog/fix.md`. R-95 to R-98 are conflicts that only the owner can settle (03-SYNTHESIS: ties go here as owner decisions). F-01 to F-07 are the fix stage's own changes, with no owner decision needed.

#### R-95 · A contaminant measured in a sold product with no lot (was open-questions OD-10)
- **Found by:** module-D12 runlog issue 1, recorded as OD-10 in `open-questions.md`; the contract and evidence verifiers.
- **Conflict:** R-73 cut QUALITY_RESULT_FOR → D6.Product and typed the field Lot only. `fixtures/D12/acrylamide-fried-potato-harm` row acr-03 (assertions.yaml line 71; intent.json proposal p03-result-for) writes QualityResult → Product for the FDA 2004 survey ("one individual purchased product; no lot"). That pair is not in the candidate SDL, so acr-03 does not conform. The packet patterns of Q-D12-03 and Q-D12-06 read the pair (as `RESULT_FOR`, which is D3's StudyResult → OutcomeDefinition) and return no rows.
- **Options:**
  - (a) Re-key acr-03 to the D1 predicate MEASURED_CONTENT_IN_PRODUCT (R-73's survey fallback), and rewrite the Q-D12-03 and Q-D12-06 patterns to read it.
  - (b) Reinstate the Product member (a two-member union on `QualityResult.resultFor`) under R-06, because a fixture now writes the pair. This uses R-73's own clause "until a survey fixture promotes the Product member".
- **Deciding question:** Q-D12-03 (v1), Q-D12-06 (v1); Q-D8-06 (v2).
- **Size effect:**
  - (a) 0.
  - (b) +1 collapsed and +1 expanded pair, +1 union. R-73 measured the cut of both of its pairs together at −2 pairs, −7 input types and −2,303 B. Reinstating one pair alone has not been measured.
- **Until the owner rules:** acr-03 is flagged NON-CONFORMING in `fixtures/README.md` ("pending ruling edits"), and the questions catalog marks Q-D12-03 and Q-D12-06 "pattern broken".
- **Owner decision:** yes.

#### R-96 · Directive rule 1 and interface targets
- **Found by:** the numbers verifier.
- **Conflict:** 00-DIRECTIVE rule 1 says "No any-entity edges in the GraphQL projection" and delegates only the subject, object, identifier, mention and depiction edges to A1's kernel pattern. The candidate has 12 relationship fields that target an interface instead of a union:
  - `Activity.generated` (WAS_GENERATED_BY, direction IN) targets `Entity`, which all 69 node types implement. It is not in the delegated list, and no ruling addressed it under rule 1. R-01 mentions it only as option-B cut 1.
  - 11 fields target `Subjectable` (56 implementers): Assertion.subject, object and assertedBy; Assessment.about, Report.about, Activity.about and ReportItem.about (ASSESSES); Identifier.identifies (HAS_IDENTIFIER); Chunk.mentions (MENTIONS); and two domain edges, ProtocolStep.uses (D5 STEP_USES) and Association.members (D10 ASSOCIATES), which R-28 registers as exceptions.
- **Options:**
  - (a) The owner reads rule 1 as "no union wider than 6", and accepts interface targets as the kernel pattern (K 09) for the delegated edges, for `Activity.generated` (the lineage spine of directive 4.2), and for R-28's two exceptions.
  - (b) Apply R-01 cut 1: drop `Activity.generated`. The executor writes WAS_GENERATED_BY in Cypher (`packages/kg-ops/src/plan.ts:236, 263, 510`) and the K patterns read it from the node side, so no write path depends on the field. GraphQL clients lose the Activity → outputs traversal.
  - (c) (b), and also retarget STEP_USES and ASSOCIATES to unions of 6 or fewer members (R-01 cut 2 for STEP_USES; ASSOCIATES has no measured union form).
- **Deciding question:** Q-K-04, Q-K-05, Q-K-07 (lineage); Q-D5-06 (STEP_USES); Q-D10-05 (ASSOCIATES).
- **Size effect (measured in memory, `_runlog/fix.md` section 4):** (b) 848 → 783 expanded pairs; (b) + STEP_USES as a 6-member union 783 → 733. Collapsed pairs and input types are not measured for these variants.
- **Fix stage's view:** the fix stage did not apply (b), because it is a kernel change that R-01 deliberately made conditional on the owner's choice of metric. The size report now shows interface targets beside the union row.
- **Owner decision:** yes.

#### R-97 · The kernel module's relationship-type count under R-01 (A)
- **Found by:** the fix stage, while it applied R-01 (A) to the per-module attribution (finding N-4).
- **Conflict:** R-01 (A) counts ASSESSES, DERIVED_FROM, MENTIONS and RENDITION_OF once, in K. MENTIONS is declared only on D9 Chunk, and RENDITION_OF only on D3 Publication and D9 MediaWork. Moving both into K gives K 15 relationship types against its budget of 14. The integrator's first-declarer attribution instead gives K 13 and D3 15, also over by one. Either way one module is one type over 14.
- **Options:**
  - (a) Accept K at 15, with the EXCESS row in `size-report.md`.
  - (b) Count only the multiply-declared kernel-meaning types in K (ASSESSES, DERIVED_FROM and RENDITION_OF). Then K has 14 and D9 keeps MENTIONS (D9 6 → 7).
  - (c) Keep first-declarer attribution and justify D3's 15th type.
- **Deciding question:** none (measurement convention).
- **Size effect:** 0 on the assembled totals (106 relationship types, 181 / 848 pairs).
- **Owner decision:** yes.

#### R-98 · Scope of R-14 for versioned-state payloads (was open-questions OD-11)
- **Conflict:** R-14 says a node property read as a fact is written under a FIELD Assertion with a registered field predicate. D3 cites RegistrationVersion field facts as locators on the HAS_REGISTRATION_VERSION attach Assertion and registers no per-field predicates (module-D3 runlog item 4, "needs a chief ruling").
- **Options:**
  - (a) R-14 applies: one FIELD Assertion per registry field.
  - (b) For an immutable versioned-state payload, the attach Assertion with one locator per field is enough.
- **Deciding question:** Q-D3-04 (v1).
- **Evidence needed:** verifier re-selection of the per-field locators on `fixtures/D3/aspree-registry-history-harm`.
- **Size effect:** 0 on the SDL. Under (a), the predicate registry grows.
- **Owner decision:** yes.

#### F-01 · R-49 applied to the SDL
Applies FU-01. `Claim` (kernel, additive) gains `discourseFirstHandCount`, `discourseRetellingCount`, `discourseRecutCount`, `discourseIndependentCount` (Int), `discourseFirstOccurrenceAt`, `discourseMethodVersion` and `discourseDerivedAt`. `Person` (D7) and `Channel` (D9) gain `influenceScore` (Float), `influenceMethodVersion` and `influenceDerivedAt`. Method version and derivedAt use `@filterable(byValue: false) @sortable(byValue: false)`, as the D3 Study cache does. The node-register fragments carry them. Measured: 0 types, 0 pairs, 960 → 960 input types, +8,459 printed bytes. The per-frontier influence score of Q-D9-19 has no write target (FU-11).

#### F-02 · RENDITION_OF Source → Publication has a fixture
The D3 register entry named `fixtures/K/resveratrol-sirt1-evidence-mission`, which writes no RENDITION_OF row. It now names `fixtures/cross-domain/claim-mission-report`, which writes five Source → Publication rows (assertions.yaml lines 810–925). `merge-registers.mjs` accepts `final/fixtures/cross-domain/` paths, and the fixtures register check reads cross-domain fixtures (TYPE 109, 0 violations). This closes FX-10's first half. The D9 rows are still written `class: structural` (FU-03).

#### F-03 · populatedBy is canonical in the register fragments
`rewrite-populatedby.mjs --file --module` rewrote the 14 fragments: 347 values out, 0 unresolved. A re-merge reproduces every populatedBy list of the merged file byte for byte, so a re-merge no longer undoes R-39.

#### F-04 · Per-module attribution follows R-01 (A)
`count-schema.mjs` attributes ASSESSES, DERIVED_FROM, MENTIONS and RENDITION_OF to K, and reports expanded and declared pairs per module. Result: K 15 / 36 / 593, D3 14 / 30 / 30 (relationship types / collapsed / expanded). R-97 records the K excess.

#### F-05 · A claim occurrence carries no extra label
The kernel Assertion docstring said a claim occurrence has a "stored extra label `ClaimOccurrence`". But `@node(labels: ["Assertion"])` cannot add a label to some instances only, the IR has no such label, and `query-patterns.md` treats it as retired. Ruling: no extra label; a claim occurrence is `Assertion {assertionKind: 'CLAIM'}`. Changed: the kernel docstring, the D9 and D13 header comments, the node-register merged-into rows, the D9 register prose, and the scratch claim-fixture loader. Reloaded, the loader shows 0 `ClaimOccurrence` nodes and 8 CLAIM Assertions. The claim fixture's own files never wrote the label. Prose in some packet fixture notes (D3, D5, D9, K) still names the label; that is listed under FU-03.

#### F-06 · Mission-lineage patterns
- P-10b gains the role RECORDED_STATEMENT_BY (`(x)<-[:ASSERTED_BY]-(:Assertion)-[:WAS_GENERATED_BY]->(act)`). On the claim fixture, the Sinclair query now returns the r1-ingest, r2-evidence-mission and r2-verification runs, which record 2, 7 and 2 of his statements.
- P-10a.2 counts HAS_IDENTIFIER episodes: 22 on the compound fixture, which the old form did not count.
- P-10a.4 drops MEASURES, which the register classes asserted, so it was counted twice.
- The AllNodesScan statement in the validation summary now names the empty-store case (P-10c.2).
- `validate-patterns.mjs`: 39 of 39 statements EXPLAIN ok, both on the empty store and with the claim fixture loaded.

#### F-07 · Lineage clocks in the cross-domain fixtures
- Compound: ingestion starts at the first capture (04:16:57Z) and ends at the build time (05:01:14Z); the projection and verification runs carry an `endedAt`.
- Claim: the evidence-mission and verification runs end at 04:36:14Z, the retrieval time of the snapshot the verifier produced and the synthesis' evidenceCutoffAt (both had ended at 04:35:02Z).
- Product: the projection and comparison runs carry `startedAt` and `endedAt`, taken from the fixture's own clocks, and use `wasInformedBy` (a list), as the claim fixture does.
- Reloaded claim graph: 0 snapshots retrieved after their run ended.

## Cuts to budget

**No cut was made.** Measured by the integrator and re-measured by the fix stage on 2026-10-09 (commands in `_runlog/integrate.md` and `_runlog/fix.md`; the full table is in `size-report.md`).

| measure | candidate v2 (deployed options) | budget | status |
| --- | ---: | ---: | --- |
| node types | 69 | ≤ 90 | pass |
| relationship types | 106 | ≤ 160 | pass |
| from→to pairs, expanded (R-01 B; the method that reproduces the directive's 3,940) | 848 | ≤ 600 | **fail by 248** |
| from→to pairs, collapsed (R-01 A) | 181 | ≤ 600 | pass if the owner adopts A |
| widest union target | 5 (AdministeredMaterial) | ≤ 6 | pass (interface targets: R-96) |
| executable input types | 960 | ≤ 4,000 | pass |
| executable size | 1,743,672 B | ≤ 6 MB | pass |
| build, in-process, median of 3 | 1.46 s | < 5 s | pass |
| build, deployed recipe wall time, median of 3 | 4.98 s (one of three runs 5.14 s) | < 5 s | at the line |

The step-7 passes were checked in order. None of them required a cut:
1. **Unions wider than 6:** none. The widest is AdministeredMaterial with 5 members, out of 16 unions.
2. **Relationships whose only questions are value 3:** none. `_work/rel-values.mjs` reads every question id cited by the merged relationship register and finds a value for each of them in `packets/*/02-questions.md` (453 ids, plus CQ-PF-03a v1 and CQ-PF-03b v2 from the R-08 split). The best value is v1 for 95 types and v2 for 11; no type has v3 as its best.
   - If a future pass needs a next demotion tier, it is the 11 types whose best question is value 2: ASSIGNED_TO, LICENSED_TO and MEASURES_ANALYTE (D8); DOCUMENTED_BY_RECORD (D13); DERIVED_FROM_TAXON, MATERIAL_CONTAINS and PARENT_TAXON (D1); INCLUDES_TEST and INTERVAL_FOR (D4); PART_OF_MECHANISM (D2); WAS_ASSOCIATED_WITH (K).
   - R-07 already names ASSIGNED_TO, LICENSED_TO, MEASURES_ANALYTE and DOCUMENTED_BY_RECORD as the first candidates.
3. **Node types with fewer than two filter properties:** none in the merged node register.
4. **Hubs over 12 relationship fields:** none. The largest is Assertion with 8, then Study and ReportItem with 6.

On the expanded count (R-01 B), 848 is over 600. R-01's cuts were measured in memory by the fix stage but not applied:
1. Dropping the inverse `Activity.generated` gives 783.
2. Adding the retargeting of D5 STEP_USES to a 6-member union gives 733.
3. Removing Subjectable from 14 record types under R-18 (−10 pairs each, one −8) then gives 593.

Cut 3 needs the R-18 removal pass, which no module has run yet (FU-12). Each cut is recorded against Q-K-04, Q-K-05 and Q-K-07.

## Close-out round

Close-out of FU-03, FU-04, FU-05, FU-13 / MD-X-02 and TL-04 (2026-10-09; evidence in `_runlog/closeout-*.md`, summary in `_runlog/closeout-refresh.md`). **No new ruling, and no SDL change:** the candidate is still sha256 `c7cf1235…4793`. `scripts/assemble-schema.mjs` reproduces it byte for byte with an identical manifest, and print-schema gives 1,743,672 B, 34,492 lines and 960 input types; `schema-size.mjs` output equals `size-report.md` section A. What changed:

- **Predicate registry (MD-X-02, FU-13).** `final/vocabularies/predicates.yaml` is written by `_work/build-predicates.mjs` under R-52 and R-53: 374 entries, with 286 registered, 37 alias-of, 16 retired-by and 35 proposed-new. Proposed-new names and registrar mismatches stay open as MD-X-03.
- **Fixtures (FU-03).** The fixture editors applied every row of the fixtures README residual table in `final/fixtures/`, re-keying predicates and making the structural edits of the rulings above. The fixture lint went from 562 errors and 201 warnings to 2 errors and 153 warnings. The 2 errors are D12 QUALITY_RESULT_FOR → Product, which waits for OD-10 / R-95. All 77 intents are valid.
- **Patterns (FU-04).** The packet owners fixed every packetBug, and the pattern lint now shows 0 packetBug and 0 `CYPHER 25`. S wrote final-SDL rewrites of the blocks the rulings broke in `final/patterns-by-question/` for 13 packets (K, D11 and D12 were added by the close-out fix, `_runlog/closeout-fix.md`): 79 sections, 0 failing, 90 of 92 statements EXPLAIN ok and 2 GDS. In the questions catalog, 452 of 454 questions have a valid pattern, and 152 of 154 value-1 questions. The 2 left are Q-D12-03 and Q-D12-06, which wait for the owner's OD-10 / R-95; `patterns-by-question/D12.md` section `OD-10-option-a` shows that option (a) answers both against the unchanged SDL.
- **Close-out fix (2026-10-09).** The fixture lint now exits 1 when errors remain. The D10 `mg-rankings-criteria-comparison` label values that FU-03 added got 13 new JSON_POINTER locators, and no existing quote changed. Line endings under `final/` are LF, so the generated input digests reproduce from a clean checkout.
- **Answer kinds (FU-05).** D10's table regenerates byte-identical.
- **Tooling (TL-04).** The D11 generator now quotes flow scalars. `final/tooling/action-space.yaml` is the regenerated file, deep-equal to the hand-patched copy and clean under PyYAML.
- **New follow-ups.** FU-14 collects the residuals from the close-out runlogs, and FU-06 records its measured fixture captureMethod gap.

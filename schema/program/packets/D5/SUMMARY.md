# D5 — summary

A5, check stage, 2026-10-08; updated after the adversarial review (same day). Research is not medical advice.

## What the domain is

D5 holds the **means people use toward a goal and what can go wrong with them**: the shared **targets vocabulary** (sleep, strength, brain fitness, body composition, longevity, energy, mood, recovery … 15 curated `Target` nodes, `vocab-targets.yaml` 0.2.1), **interventions** that are not simply a substance or product (practices, procedures, named regimens: one `Intervention` with a `kind`), **public protocols** as enduring identity → immutable editions → ordered steps (dose ranges, timing, stated purpose, stated cautions, review rules), and **safety** as one shared blocking identity (`UseConstraint`) that many asserters' contraindication, interaction and upper-limit statements resolve to. What helps or hurts a target, adverse effects, interactions and limits are kernel `Assertion` predicates with a mandatory population qualifier; weighed conclusions (safety signal, applicability, target-effect synthesis) are kernel `Assessment`s. No D5 property or edge says good, bad, safe or helps.

## Headline counts (`node scripts/packet-check.mjs D5`, ok: true)

| measure | D5 | budget |
| --- | ---: | ---: |
| node types | 6 | 8 |
| relationship types | 6 | 14 |
| from→to pairs | 8 | 35 |
| widest union | 3 (TargetMeasure) | 6 |
| questions | 34 (22 harm, 11 neutral, 1 benefit; 22 with a fixture) | 15–40 |
| fixtures | 4 (unstructured-to-entity, 2 harm, disconfirmation) | ≥ 3 |
| executable cost (print-schema, vs A1 model-stage kernel + 7 stubs) | +128,989 B, +55 input types | — |

Types: Target, Intervention, Protocol, ProtocolEdition, ProtocolStep, UseConstraint. Relationships: HAS_EDITION (the only bitemporal episode edge), HAS_STEP, STEP_USES (target: kernel interface `Subjectable`, admissible types executor-validated), STATES_CONSTRAINT (derived), RESOLVES_TO_CONSTRAINT (derived, read-only), OPERATIONALIZED_BY (Target → D4 Biomarker | D4 Metric | D2 Outcome). Pinned D5 had 68 relationship types across W06/W16/W17; 19 pinned types merged, 11 deferred.

## Five highest-value questions

1. **Q-D5-01 / Q-D5-02** — what helps or hurts target T, by what evidence, for whom, as of a date (one query, direction filter; fixtures sleep-toolkit, antioxidant).
2. **Q-D5-23** — before an agent recommends means M for T, which UseConstraint identities block it and through which located assertions (empty = "no constraint recorded", never "safe"; fixture sirolimus).
3. **Q-D5-04 / Q-D5-05** — which interactions apply between X and a co-exposure, and where sources disagree (label "must not be taken" vs forum dose-boosting resolve to one INTERACTION constraint; fixture sirolimus).
4. **Q-D5-06** — does a protocol step's dose exceed an authoritative upper limit for its population (computed at query time, never stored: Blueprint magnesium 500–600 mg/day in pregnancy vs ODS UL 350 mg supplemental → ABOVE; fixture pregnancy-magnesium).
5. **Q-D5-14** — which popular "helps T" claims were nulled or reversed by a controlled study (vitamin C + E blunting training adaptations; fixture antioxidant).

## Three biggest cuts

1. **Safety specializations → kernel predicates and assessments.** ContraindicationAssertion, InteractionAssertion, AdverseEffect (→ D2 Condition as object), SafetySignal and Constraint are gone; harm is `USE_CONSTRAINED_IN | INTERACTS_WITH | HAS_UPPER_LIMIT | CAUSES_ADVERSE_EFFECT | WORSENS_TARGET` assertions plus one derived grouping edge.
2. **CONSTRAINS_USE_OF (union 8) and CONSTRAINT_SCOPE (union 10) cut.** They duplicated the resolving assertions' subject/object; constraint lookups go through RESOLVES_TO_CONSTRAINT + HAS_SUBJECT (two hops).
3. **Treatment, Procedure, Lifestyle, practice-side Exposure → one Intervention with `kind`; MeasurementPlan, ProtocolAdjustmentRule, numeric Target, step-target edge → ProtocolStep properties** (`stepKind`, thresholds, `targetKeys`).

## Three biggest risks

1. **Two-hop constraint pre-checks** (Q-D5-23) depend on the kernel `:Assertion(predicate)` index and a current use-constraint projection (RESOLVES_TO_CONSTRAINT and, since the review, STATES_CONSTRAINT); promotion path is a typed CONSTRAINS_USE_OF (+1 type, +5 pairs).
2. **Mandatory semantics carried in strings.** The population qualifier (`population:<code>` in `Assertion.qualifiers`) and the directive level (`valueString`) are executor validations, not schema types (OQ-D5-05, OQ-D5-14); the intent contract has no slot for either yet (OQ-D5-27).
3. **Cross-packet seams still one-sided.** D2 / D3 do not yet list OPERATIONALIZED_BY → Outcome (OQ-D5-43); D10 uses RECOMMENDS_AGAINST with a Target object and D9 proposes a second adverse-effect predicate (OQ-D5-40, OQ-D5-41); AdverseEffect-as-Condition depends on D2 (OQ-D5-03). STEP_USES types are now executor-enforced (the union that could not admit D12 DietaryPattern is gone; OQ-D5-06 closed).

Read next: `09-reasoning.md` (decisions D-01..D-19, registered assessment vocabulary, measurements), `11-open-questions.md` (OQ-D5-01..48), `07-fixtures/`.

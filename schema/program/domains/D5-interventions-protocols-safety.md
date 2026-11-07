# D5 — Interventions, protocols and safety

Lens: science and community. Current fragments: W06 Treatments, procedures and modalities (2 node types: Treatment, Procedure), W16 Protocols and public workflow definitions (10: Protocol, ProtocolEdition, ProtocolStep, Constraint, MeasurementPlan, ProtocolAdjustmentRule, Target, FunctionalGoal, Observation, ProtocolResult), W17 Safety and use constraints (5: AdverseEffect, SafetySignal, ContraindicationAssertion, InteractionAssertion, UseConstraint).

## Scope

What people are told to do and what they must not do: treatments and procedures as concepts (drug, supplement regimen, fasting, sauna, peptides, HRT, rapamycin), public protocols with editions, steps, doses, cadences, constraints and measurement plans (Attia, Huberman, Blueprint, clinic protocols), publicly reported observations and results; the safety layer: adverse effects, safety signals, contraindications, interactions, use constraints by population. Out of scope: personal adherence (private store), clinical trial protocols (D3), commerce of the intervention (D6).

## Ecosystem to survey

Longevity clinics and telehealth (Function, Fountain Life, AgelessRx, Lifeforce), protocol publishers (books, newsletters, apps), how protocols are versioned in place on web pages, pharmacovigilance and supplement adverse-event reporting (FAERS/CAERS, Natural Medicines, NIH ODS, Poison Control), drug–supplement interaction databases, population-specific guidance (pregnancy, CKD, anticoagulants), the practice-report versus recommendation distinction (round 0006).

## Seed questions

- What does edition N of this protocol prescribe, in what order, with which dose and cadence, and how did it change from edition N−1?
- Which contraindications or interactions apply to this substance in this population, from which source, with what strength?
- Which use constraints block or qualify a recommendation about X for a user described by Y (the shared blocking identity)?
- Which protocols include compound X, and what evidence do they cite for it (seam to D3)?
- What adverse effects are reported for X at which doses, and is there a safety signal (an assessment over results, not a rumor)?
- Is this a treatment modality, a procedure, or a lifestyle exposure, and does the distinction matter for any question?

## Retrieval patterns to consider

Protocol edition diffs by content hash; step order and dose ranges (never midpoints); constraint scope resolution over populations; safety signal as an EvidenceAssessment with inputs; GDS: co-occurrence of interventions across protocols, community structure of protocol authors (seam D9).

## Sources and tools to score (with D11)

FDA FAERS/CAERS, Natural Medicines (license), NIH ODS, DrugBank interactions (license), Stockley's, Lexicomp (license), protocol pages with dated captures (Firecrawl change tracking), clinic pages, Reddit and forum reports (community; low evidence class).

## Known problems and open questions

`stepKey` assignment across in-place editions; `SafetySignal` as an assessment over `AdverseEventResult`; whether Treatment, Procedure and Lifestyle collapse to one Intervention concept with a kind; the cutover for `assertionUid` on live RECOMMENDS edges (RECOMMENDS stays derived-only).

## Deliverables

`../packets/D5/` per PLAN 5.1. Owner question in PLAN section 10: split into protocols (community) and safety (science)?

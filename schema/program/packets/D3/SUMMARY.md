# D3 — summary

Agent A4 · clinical and preclinical evidence · 2026-10-08 (written last, check stage; updated in the adversarial-review stage). Research is not medical advice.

## What the domain is

The studies behind every evidence answer: trials, cohorts, preclinical experiments, systematic reviews; what each arm
administered (material, form, dose basis, schedule); who was eligible, enrolled, analyzed; which outcomes each registry
version declared at which priority; results and adverse events per source; the papers, preprints and notices that report
on, correct, retract or supersede each other; who sponsored, funded, supplied and ran the study. Registry and paper are
separate asserters (one arm / population / outcome / result node per stating record, `STATED_IN`), so disagreement,
outcome switching, dropped arms and per-number provenance are single traversals; result fields are neutral (direction of the
estimate, significance as stated), and benefit, harm, endpoint class, applicability and evidence strength are kernel
`Assessment`s on typed slots (`conclusionCode`, `gradeScheme` / `grade` / `certainty`, `facets`).

## Headline counts (`node scripts/packet-check.mjs D3`, ok)

| measure | value | budget |
| --- | ---: | ---: |
| node types | 8 | 8 |
| relationship types | 14 | 14 |
| from→to pairs (packet-check) | 31 | 35 |
| widest union | 6 (`AdministeredMaterial`) | 6 |
| questions | 32 (14 harm / risk / disconfirmation = 44 %; 13 value-1) | 15–40 |
| fixtures | 3 (harm, disconfirmation, unstructured-to-entity; 271 locators re-selected) | ≥ 3 |
| printed executable, D3 marginal on the current kernel (A1 b2c2b1b0) | +197,496 B · +4,147 lines · +139 input types · builds in ≈ 1.1 s | — |
| edges with a valid-time episode | 2 (HAS_REGISTRATION_VERSION, HAS_STUDY_ROLE); the rest recorded-only | — |

## Five highest-value questions

1. **Q-D3-05** (harm) — what trial evidence says X does in the harmful direction (mortality, hemorrhage, serious AEs),
   for whom, read at query time (more events on event outcomes, or an interpretation Assessment); fixture ASPREE
   (aspirin, all-cause death HR 1.14, 95% CI 1.01 to 1.29).
2. **Q-D3-04** — strongest human evidence that X changes outcome Y or target T, ranked at query time by design, n,
   outcome class and confirmatory status (never stored).
3. **CQ-ST-05** (disconfirmation) — when the primary is null, which favorable findings are secondary, subgroup,
   within-arm or post hoc, and who presents them as the main result.
4. **CQ-EV-05** (harm) — is a publication corrected, retracted or under concern, according to which asserter (NLM,
   publisher, Retraction Watch), and what rests on it; fixture resveratrol / Das, three asserters disagreeing.
5. **Q-D3-08** (risk) — who sponsored, funded, supplied, ran and investigated study S, role by role and per registry
   (ASPREE: lead sponsor differs by registry; ISRCTN removed Bayer from its record as funder on 22/08/2018 and states
   Bayer never funded the trial).

## Three biggest cuts

1. **20 pinned W09/W10 node types → 8.** The seven W10 assessment types become kernel `Assessment` kinds;
   TrialRegistration (→ kernel Identifiers + RegistrationVersion), Dataset (→ cohort Study), StudyIntervention,
   AdverseEventResult and ProtocolVersion are merged.
2. **52 pinned relationship types → 14.** Sponsor / operator / investigator / funding-award edges → one
   `HAS_STUDY_ROLE {roleKind}`; three material/device/definition edges → `ADMINISTERS`; three measure edges → `MEASURES`;
   CORRECTS / RETRACTS / version chains → `REVISES {revisionKind}`; DEFINED_IN + SUPPORTED_BY → `STATED_IN`.
3. **Properties and time.** 63 unfiltered properties made non-filterable (−38.8 KB); StudyResult duplicates cut
   (`isStatisticallySignificant`, baseline / follow-up / change); valid time only on 2 edges; edge wording → qualifiers;
   two inverse navigation fields and three duplicated enums (MassBasis → D1, revision kinds → kernel SourceRevisionKind,
   IMPROVED / WORSENED → neutral EstimateDirection) removed in the adversarial-review stage.

## Three biggest risks

1. **Per-source duplication rests on normalized keys** (`outcomeKey`, `armKey`): a bad normalizer splits or merges
   outcomes and arms, and Q-D3-01 / Q-D3-15 / Q-D3-16 inherit the error (11-open-questions #24).
2. **ClinicalTrials.gov version history is not agent-reachable** (403 to every tool): CTG history fills forward from
   our own captures; the history fixture uses ISRCTN versions reconstructed from dated prose (#1).
3. **Retraction status still needs a kernel ruling** (#33): D3 now shares the kernel's SourceRevisionKind and writes
   status-only flags as kernel `HAS_REVISION_STATUS`, but notice-based revisions live on `REVISES` between Publications,
   which kernel lineage patterns Q-K-10 / Q-K-22 do not traverse yet. Close behind: condition-coded outcomes (incident
   dementia, hemorrhage) do not reach a D5 Target (#8); the assessment vocabularies must stay registered or the typed
   slots decay into free text.

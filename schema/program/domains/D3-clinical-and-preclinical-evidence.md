# D3 — Clinical and preclinical evidence

Lens: science. Current fragments: W09 Studies, interventions and results (13 node types: Study, TrialRegistration, RegistrationVersion, ProtocolVersion, StudyArm, StudyIntervention, InterventionComponent, StudyPopulation, OutcomeDefinition, StudyResult, AdverseEventResult, Publication, Dataset), W10 Evidence assessment, applicability and synthesis (7: EvidenceApplicability, ApplicabilityDimension, UseContextProfile, EndpointClassification, ResultInterpretation, EvidenceSynthesis, EvidenceStrengthAssessment).

## Scope

What was tested on whom with what result: trials and their registry histories, preclinical studies, arms and the material actually administered, populations, outcome definitions and endpoint classification, results and adverse events, publications and their corrections, datasets; the assessment layer: applicability of a study to a use context, synthesis, strength. Out of scope: mechanisms (D2), the commercial product (D6) except the applicability seam, safety signals as constraints (D5).

## Ecosystem to survey

How trials are run and published today: sponsors (pharma, supplement brands, academic), CROs, registries and their version histories (ClinicalTrials.gov v2, WHO ICTRP, EU CTR, ISRCTN), results reporting and the gap between registered and published outcomes, preprints, systematic-review organizations (Cochrane, GRADE practice), evidence grading on consumer sites (Examine.com's approach), retraction and correction practice (Retraction Watch, Crossref), open-data practice (Vivli, YODA). Preclinical: model organisms (the ITP in mice), how dose translates.

## Seed questions

- What did the study actually administer (material, dose, schedule, form), and does it match the product on sale (CQ-ST, round 0002)?
- Which outcomes were primary, what was measured, and was the result clinically meaningful or null?
- Did the registered outcomes change between registration versions, and did the publication report them?
- Does this evidence apply to this use context (dose, population, duration), dimension by dimension, and which dimension is weakest (QS-3)?
- What is the strongest human evidence for compound X on outcome Y, and how many independent studies is that really (retellings, shared datasets)?
- Which studies were corrected, retracted or had concerns expressed, and which assertions inherit that?
- Who funded this trial and who has a financial interest in the result (seam to D7)?

## Retrieval patterns to consider

Study → arm → intervention → material chains to D1/D6; registration version diffs; applicability with the weakest dimension (QS-3); synthesis inputs with `inputRole`; GDS: citation and dataset-sharing graphs for independence counting, similarity of study designs; vector search over abstracts and outcome definitions.

## Sources and tools to score (with D11)

ClinicalTrials.gov API v2 (with history), WHO ICTRP exports, EU CTR, PubMed E-utilities, Europe PMC, OpenAlex, Crossref (with retraction metadata), Unpaywall, bioRxiv/medRxiv, Semantic Scholar, PROSPERO, Cochrane, the Retraction Watch database; the Clinical Trials and PubMed MCP servers attached to this workspace.

## Known problems and open questions

Applicability calibration bands deferred; investigational batch to commercial lot bridging; null primary with favorable secondary; `SafetySignal` as an EvidenceAssessment over AdverseEventResults (seam with D5); EvidenceSynthesis verdict-versus-inputs checks have no validator.

## Deliverables

`../packets/D3/` per PLAN 5.1. This domain will be the largest; the packet must show which StudyResult and OutcomeDefinition properties any question actually filters on.

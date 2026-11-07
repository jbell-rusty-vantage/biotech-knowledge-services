# Fixture dq-bone-trial-unstructured — source

- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=11705617&retmode=xml
- title: Farr JN et al. Effects of intermittent senolytic therapy on bone metabolism in postmenopausal women: a phase 2 randomized controlled trial. Nat Med 2024;30(9):2605-2612 (PMID 38956196; doi 10.1038/s41591-024-03096-2; PMC11705617, JATS author manuscript; human page https://pmc.ncbi.nlm.nih.gov/articles/PMC11705617/) — with registry record NCT04313634
- retrieved: 2026-10-08
- snapshot digest: sha256:67e6b9b16b32949e5ecd98f69d1f8ee195b2c9f8d660a8d3caa7482aea015338 (PMC JATS XML, 140,210 bytes; identical to the research-stage capture)
- kind: unstructured-to-entity
- also: disconfirmation (null primary, favorable secondary, exploratory subgroup, dropped arm), harm (serious adverse event in the arm the paper does not report)
- tool: curl to NCBI E-utilities efetch db=pmc (`tool:pmc-jats`) and db=pubmed (`tool:pubmed-eutils`), curl to ClinicalTrials.gov API v2 (`tool:ctgov-v2`). Every quote re-selected from these bytes by `../../../../packets/D3/_notes/tools/build_fixtures.py`; the chunk walk is in `directive-3.8-walk.yaml`.
- producedBy (fixture-scoped ids, not real Mission Control runs): mission `mission:ft-D3-fixtures`, run `run:ft-D3-dq-bone-trial-unstructured`.

## All snapshots of this fixture

| ref | url | title | digest (raw bytes) | tool |
| --- | --- | --- | --- | --- |
| s-pmc-jats | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=11705617&retmode=xml | JATS full text (abstract, sections S1–S27, competing interests, acknowledgements) | sha256:67e6b9b16b32949e5ecd98f69d1f8ee195b2c9f8d660a8d3caa7482aea015338 | tool:pmc-jats |
| s-ctg-nct04313634 | https://clinicaltrials.gov/api/v2/studies/NCT04313634 | Targeting Cellular Senescence With Senolytics to Improve Skeletal Health in Older Humans (results posted 2024-07-22) | sha256:a3c441396bc30921120a8e15a642e294c04d6ca92f395aaf51ab995ff7218eb1 | tool:ctgov-v2 |
| s-pubmed-38956196 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=38956196&retmode=xml | MEDLINE record (author list with ORCIDs) | sha256:e7879f51fafd7277ed3ef08e86d574b207bd3af00bb1e1155b68a7122d898375 | tool:pubmed-eutils |

## Description

An open-label phase 2 RCT of intermittent dasatinib plus quercetin (D + Q) in postmenopausal women, read the way an agent reads unstructured text (00-DIRECTIVE 3.8): the question "Did senolytics improve bone in older women, and were there harms?" is decomposed into three sub-queries over 72 paragraph chunks of the JATS text version; the retrieved chunks (abstract, sec#S3, sec#S5, sec#S6 …) cover locators (derived span overlap), the locators are the evidence of STATED_IN Assertions on StudyResults and OutcomeDefinitions, and every locator is re-selected from the snapshot bytes (expected verdict DIRECTLY_SUPPORTED). The paper's primary endpoint (CTx at 20 weeks) did not differ (P = 0.611); P1NP rose +16% at 2 and 4 weeks (secondary) and +34% in the highest p16 tertile (exploratory). The registry adds what the paper leaves out: a third, fisetin arm (14 started) with posted results and a serious gastric hemorrhage (1/14, systematic assessment), which the paper explains only as a design change ("because of the COVID pandemic and cost issues"). Registry and paper agree on the medians but not on their dispersion (registry full range vs paper interquartile range) nor on n analyzed (28 per arm vs all 60 randomized, intention to treat). The lead sponsor is a Person (sponsor-investigator Sundeep Khosla, M.D.); three authors declare patents held by Mayo Clinic. The Methods name the drugs as products: "Sprycel, Bristol Myers Squibb" and "Quercetin Phytosome, Thorne Research". The CTG record's point-of-contact e-mail and phone are not selected by any locator.

## What this fixture exercises (assertion refs in `assertions.yaml`)

| relationship / node | exercised by |
| --- | --- |
| directive 3.8 path (D9 Chunk → COVERS_LOCATOR → SourceLocator ← HAS_EVIDENCE Assertion → SourceSnapshot) | `directive-3.8-walk.yaml`: textVersionHash, chunk uids and offsets, BM25 ranks per sub-query, MENTIONS (derived), covered locators with their Assertions and re-selection result |
| HAS_ARM + STATED_IN (arms): registry 3 vs paper 2 | a03–a05 registry arms, a06–a07 paper arms, a08 ARM_DROPPED_REASON (predicate-only literal) |
| HAS_COMPONENT, ADMINISTERS → D1 IngredientMaterial | components dasatinib / quercetin / fisetin (registry) and D / Q (paper; the Methods name Sprycel, Bristol Myers Squibb and Quercetin Phytosome, Thorne Research, so a12 / a13 are the paper's own statements); a09–a13 |
| HAS_POPULATION + STATED_IN | a14–a17 (eligible FEMALE ≥60, enrolled 74, randomized 60 ITT, p16 enrichment) |
| HAS_OUTCOME + STATED_IN (OutcomeDefinition) | CTx 20 w PRIMARY, P1NP 2 / 4 / 20 w SECONDARY, gastric hemorrhage and serious AEs (ADVERSE_EVENT); a18–a28 |
| MEASURES → D4 Metric / D2 Condition | a29–a32 (CTx, P1NP metrics), a33 (gastric hemorrhage) |
| STATED_IN (StudyResult; one locator per number), RESULT_FOR, RESULT_FOR_ARM | registry a34–a41 (JSON pointer per value, incl. fisetin SAE 1/14), paper a42–a49 (TEXT_QUOTE per number) |
| HAS_STUDY_ROLE (Person lead sponsor, responsible party, site, funding award) | a50–a53 |
| REPORTS_ON, AUTHORED_BY (predicate-only), interests | a54–a55, a57–a61, a63 competing-interest statement, a64 funder role statement |
| HAS_REGISTRATION_VERSION (one locator per RegistrationVersion field: versionDate, masking, enrollmentCount), identifiers, masking agreement | a02, a01 / a56 / a62, a65 |

# Fixture: antioxidant-exercise-disconfirmation

- url: https://pubmed.ncbi.nlm.nih.gov/19433800/
- title: Antioxidants prevent health-promoting effects of physical exercise in humans. PNAS 2009;106(21):8665-70 (PMID 19433800, DOI 10.1073/pnas.0903485106, PMCID PMC2680430)
- retrieved: 2026-10-08
- snapshot digest: sha256:2c73c57f9861aadf8237b8413a8afdb579b56625c406a68a73b5081c8411d001
- kind: disconfirmation
- tool: curl → NCBI E-utilities efetch (`db=pubmed&retmode=xml`, no key; `tool:pubmed-eutils`); claim occurrence found with `tvly search` and captured with `tvly extract` (`tool:tavily-extract`)
- second source: https://pubmed.ncbi.nlm.nih.gov/24492839/ — Vitamin C and E supplementation hampers cellular adaptation to endurance training in humans: a double-blind, randomised, controlled trial. J Physiol 2014;592(8):1887-901 (PMID 24492839, DOI 10.1113/jphysiol.2013.267419, PMCID PMC4001759) · retrieved 2026-10-08 · snapshot digest sha256:451e9ad8aaa45cb865537ac23d959618fd1f97994acdef30b8015b5e3c63ae4a
- claim source: https://www.btsa.com/en/vitamin-e-sport-performance — "Vitamin E for athletes: recovery, performance and dosage" (BTSA, natural vitamin E manufacturer) · retrieved 2026-10-08 · snapshot digest sha256:b8dbeae3ac50fe7458d75a58e3f25692c8851a66a3370fc61889980f8241296a
- fixture stage: A5, 2026-10-08 (generator `scratch ft/D5/gen/gen_antiox.py`; captures `scratch ft/D5/fx/antiox/`; both PubMed records byte-identical to the research-stage captures)

## What the source is

Two primary human studies on the popular practice of taking antioxidant vitamins around training. Ristow 2009 (PubMed publication type Controlled Clinical Trial; previously untrained n = 19 and pretrained n = 20 healthy young men; vitamin C 1000 mg/day + vitamin E 400 IU/day; 4 weeks of exercise) reports that "Exercise increased parameters of insulin sensitivity (GIR and plasma adiponectin) only in the absence of antioxidants". Paulsen 2014 (double-blind RCT; 54 young men and women; vitamin C 1000 mg + vitamin E 235 mg daily for 11 weeks of endurance training) reports attenuated mitochondrial-biogenesis markers but "no clear interactions ... for improvements in VO2 max and running performance", and its authors "advocate caution". A manufacturer article recommends antioxidant supplements around high-intensity exercise and says vitamin E "supports muscle recovery". The fixture keeps the two studies as separate assertions and separate assessments: one means (the C + E regimen) WORSENS target:glycemic-control only together with a co-exposure (exercise), and has a MIXED effect on target:endurance; the manufacturer claim is assessed MIXED_OR_CONFLICTING because neither study measured "recovery" as worded.

## What it exercises

OPERATIONALIZED_BY (curated: target:glycemic-control → D4 Metric GIR and D4 Biomarker adiponectin; target:endurance → D4 Metric VO2max and D2 Outcome endurance running performance, the first fixture edge into the D2.Outcome member), WORSENS_TARGET and MIXED_EFFECT_ON_TARGET with `coExposure:` qualifiers and D3 StudyPopulation uids as `population:`, INTERACTS_WITH (qualifier exposureChange:ANTAGONIZES_EFFECT per asserter; level USE_WITH_CAUTION only where the authors state it) resolving to two INTERACTION UseConstraints, a claim occurrence (assertionKind CLAIM → Claim), kernel EVIDENCE_SYNTHESIS Assessments with effectDirection HARM and MIXED, and the kernel claim lifecycle (directive 3.4): a VETTING Assessment with disposition RESEARCH, an EVIDENCE_MISSION Activity that ASSESSES the Claim, and an EVIDENCE_REPORT Report with the lattice verdict MIXED_OR_CONFLICTING (adversarial review: replaces the fixtures-stage `D5.claim-disconfirmation` assessment, which put a claim verdict on a D5 assessment; fixture records, no Mission Control run took place).

Research is not medical advice.

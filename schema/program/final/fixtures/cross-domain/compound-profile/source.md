# Cross-domain fixture 1: compound profile (nicotinamide riboside) - sources

Compound: nicotinamide riboside (NR), as the chloride salt in the branded material NIAGEN. One block per captured source; all thirteen were
re-fetched with curl on 2026-10-09 (UTC) for this fixture (scratch `synth/xfx-compound/fresh/`, not committed). `snapshot digest` is sha256 over
the raw bytes (contentHashBasis RAW_BYTES). The first block is the fixture's directive-3.8 source. Research, not medical advice.

## snap-epmc-pmc6611812

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6611812/fullTextXML
- title: Conze, Brenner, Kruger 2019 Sci Rep 9:9772, JATS full text (PMID 31278280, PMC6611812, DOI 10.1038/s41598-019-46120-z)
- retrieved: 2026-10-09T04:17:00Z
- snapshot digest: sha256:ae7b5a420c48282b6604bd3c6e22ac818dcd0fc5a9fbaba0d45abf62e34661d2
- kind: unstructured-to-entity
- bytes: 146708 (application/xml); tool: tool:europepmc-rest via curl; locators: 24 in locators.yaml
- role in this fixture: D1 dose basis, D3 trial 1 (arms, results, safety), D2 blood NAD+, D7 funding/interests; directive 3.8 entry (chunks chunk-cz-sec6, chunk-cz-par26)

Conze 2019 Sci Rep, the NIAGEN dose-ranging trial (100/300/1000 mg/day, 8 weeks). Its Methods state the capsules held NR chloride (so '1000 mg NR' is salt mass), its Results give whole blood NAD+ +142 ± 14% at day 14 in the 1000 mg arm and 95 AEs in 61 participants with no serious AEs, its competing-interests note says ChromaDex funded the study, and it prints the registry id as NCT0271593, which does not resolve.

## snap-epmc-pmc6702140

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6702140/fullTextXML
- title: Elhassan et al. 2019 Cell Rep 28(7):1717, JATS full text (PMID 31412242, PMC6702140, DOI 10.1016/j.celrep.2019.07.043)
- retrieved: 2026-10-09T04:17:02Z
- snapshot digest: sha256:fb1c0ad79ed4a06783c98d48dd51e7ec0a9640f71d8233626bdbd7c245820a03
- kind: unstructured-to-entity
- bytes: 189550 (application/xml); tool: tool:europepmc-rest via curl; locators: 11 in locators.yaml
- role in this fixture: D2 mechanism (muscle NAAD up, NAD+ and protein acetylation unchanged), D3 trial 2 (material, dose), D7 interests

Elhassan 2019 Cell Rep, 12 aged men, NR chloride (Niagen) 1 g/day for 21 days, crossover. Measured the NAD+/sirtuin step in human muscle: NAAD up 2-fold, NAD+ unchanged, pan-acetylation unchanged (the disconfirming leg). Declaration of Interests: C.B. owns stock in ChromaDex and advises it.

## snap-gsrs-8xm2xt8vwi

- url: https://gsrs.ncats.nih.gov/api/v1/substances(8XM2XT8VWI)?view=full
- title: FDA GSRS substance NICOTINAMIDE RIBOSIDE CHLORIDE (UNII 8XM2XT8VWI), full view
- retrieved: 2026-10-09T04:16:57Z
- snapshot digest: sha256:1a3167f256ef0426c33d505f49e91c523392046d0edcbec97c9d36c976eab58b
- kind: other
- bytes: 16358 (application/json); tool: tool:gsrs-api via curl; locators: 8 in locators.yaml
- role in this fixture: D1 identity of the salt (UNII, CAS, PubChem, MW, formula, ACTIVE MOIETY relation)

FDA GSRS record version 18 for NICOTINAMIDE RIBOSIDE CHLORIDE.

## snap-gsrs-0i8h2m0l7n

- url: https://gsrs.ncats.nih.gov/api/v1/substances(0I8H2M0L7N)?view=full
- title: FDA GSRS substance NICOTINAMIDE RIBOSIDE (UNII 0I8H2M0L7N), full view
- retrieved: 2026-10-09T04:16:58Z
- snapshot digest: sha256:3316792f5779d6e2a6c179ae2d5956d662250736e9c35a209f678ed434a8a9ad
- kind: other
- bytes: 19145 (application/json); tool: tool:gsrs-api via curl; locators: 7 in locators.yaml
- role in this fixture: D1 identity of the cation (UNII, CAS, PubChem, ChEBI, DrugBank, MW, charge)

FDA GSRS record version 24 for NICOTINAMIDE RIBOSIDE.

## snap-ols-chebi-15846

- url: https://www.ebi.ac.uk/ols4/api/ontologies/chebi/terms?obo_id=CHEBI:15846
- title: EBI OLS4 ChEBI term CHEBI:15846
- retrieved: 2026-10-09T04:20:30Z
- snapshot digest: sha256:cd764d214432cb22a109642d1b5e34e6f472785e7cabdc930ccc9835aba12353
- kind: other
- bytes: 9115 (application/json); tool: tool:ebi-ols4 via curl; locators: 2 in locators.yaml
- role in this fixture: D1/D2 object identity: NAD(+)

EBI OLS4 ChEBI record CHEBI:15846, label NAD(+).

## snap-ols-chebi-18304

- url: https://www.ebi.ac.uk/ols4/api/ontologies/chebi/terms?obo_id=CHEBI:18304
- title: EBI OLS4 ChEBI term CHEBI:18304
- retrieved: 2026-10-09T04:20:30Z
- snapshot digest: sha256:e6c08e08954519be0e1373b8409da14543f04afec3bb30e81b1c15340d356cae
- kind: other
- bytes: 7789 (application/json); tool: tool:ebi-ols4 via curl; locators: 3 in locators.yaml
- role in this fixture: D1/D2 object identity: deamido-NAD(+) (synonym NAAD)

EBI OLS4 ChEBI record CHEBI:18304, label deamido-NAD(+), synonym NAAD.

## snap-ols-uberon-0001379

- url: https://www.ebi.ac.uk/ols4/api/ontologies/uberon/terms?obo_id=UBERON:0001379
- title: EBI OLS4 UBERON term UBERON:0001379
- retrieved: 2026-10-09T04:58:16Z
- snapshot digest: sha256:dbbd73a9f8762f0a59f9b2ecce50cccf1f4299c71042fd394b4217c4b3539dbf
- kind: other
- bytes: 7121 (application/json); tool: tool:ebi-ols4 via curl; locators: 2 in locators.yaml
- role in this fixture: D2 context compartment: vastus lateralis (Elhassan 2019 biopsies)

EBI OLS4 UBERON record UBERON:0001379, label vastus lateralis.

## snap-ols-uberon-0000178

- url: https://www.ebi.ac.uk/ols4/api/ontologies/uberon/terms?obo_id=UBERON:0000178
- title: EBI OLS4 UBERON term UBERON:0000178
- retrieved: 2026-10-09T04:58:17Z
- snapshot digest: sha256:e6a51f559811919b854cc6f88e7490e3ac7dd7d2148c0d6628386f151605252d
- kind: other
- bytes: 10596 (application/json); tool: tool:ebi-ols4 via curl; locators: 2 in locators.yaml
- role in this fixture: D2 context compartment: blood (Conze 2019 whole blood NAD+)

EBI OLS4 UBERON record UBERON:0000178, label blood.

## snap-quickgo-go0006476

- url: https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/GO:0006476
- title: QuickGO term GO:0006476
- retrieved: 2026-10-09T04:20:29Z
- snapshot digest: sha256:211c7658247aad552093bdf79dabdb185ac9c67eba96a09b658de8baf84415cc
- kind: other
- bytes: 603 (application/json); tool: tool:quickgo-api via curl; locators: 1 in locators.yaml
- role in this fixture: D2 mechanism identity: protein deacetylation

QuickGO term GO:0006476, isObsolete false.

## snap-ctgov-nct02712593

- url: https://clinicaltrials.gov/api/v2/studies/NCT02712593
- title: ClinicalTrials.gov API v2 record NCT02712593
- retrieved: 2026-10-09T04:17:00Z
- snapshot digest: sha256:b4f637f2a707990d2b651a3c926982fdbc2e78a02be6ac5488f7d4c0ab1ffdaf
- kind: other
- bytes: 8747 (application/json); tool: tool:ctgov-api-v2 via curl; locators: 17 in locators.yaml
- role in this fixture: D3 registry record of trial 1 (arms, secondary outcome, sponsor KGK, collaborator ChromaDex, Inc., dates, no results posted)

ClinicalTrials.gov API v2 record NCT02712593, last update posted 2018-04-11.

## snap-ctgov-nct0271593

- url: https://clinicaltrials.gov/api/v2/studies/NCT0271593
- title: ClinicalTrials.gov API v2 response for the id printed in Conze 2019, NCT0271593 (HTTP 404)
- retrieved: 2026-10-09T04:20:28Z
- snapshot digest: sha256:9707cbeb19b1c589560a481b948ce6a043990896f5c6402c517123bc0cbef04e
- kind: other
- bytes: 31 (text/plain); tool: tool:ctgov-api-v2 via curl; locators: 1 in locators.yaml
- role in this fixture: disconfirmation: the id printed in Conze 2019 does not exist

ClinicalTrials.gov API v2 HTTP 404 body for NCT0271593.

## snap-ctgov-nct02950441

- url: https://clinicaltrials.gov/api/v2/studies/NCT02950441
- title: ClinicalTrials.gov API v2 record NCT02950441 (NADMet)
- retrieved: 2026-10-09T04:17:02Z
- snapshot digest: sha256:79e06200c9ddbe0d461add746395259ea3995ddfee7f16bf235ee5b2c17fdf48
- kind: other
- bytes: 6822 (application/json); tool: tool:ctgov-api-v2 via curl; locators: 7 in locators.yaml
- role in this fixture: D3 registry record of trial 2 (arm description says tablets; status UNKNOWN, last known RECRUITING)

ClinicalTrials.gov API v2 record NCT02950441 (NADMet), last update posted 2017-06-07.

## snap-dsld-323170

- url: https://api.ods.od.nih.gov/dsld/v9/label/323170
- title: NIH ODS DSLD label 323170 'Tru Niagen 300 mg' (V12.3), API v9 JSON
- retrieved: 2026-10-09T04:17:03Z
- snapshot digest: sha256:d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d
- kind: other
- bytes: 4452 (application/json); tool: tool:nih-dsld-api via curl; locators: 14 in locators.yaml
- role in this fixture: D6 label: Tru Niagen 300 mg V12.3 declares Niagen 300 mg as Nicotinamide Riboside Chloride per capsule, 1-3 capsules daily, distributed by ChromaDex, Inc

NIH ODS DSLD label 323170, entered 2025-04-24.

## Reuse of packet fixtures

- D1 `nr-trial-unstructured` (Conze 2019 dose basis, printed registry id) and `nr-salt-moiety-us-canada` (GSRS salt/moiety, DSLD 323170): same captures,
  byte-identical today except NCT02712593 (8,747 bytes today; D1 recorded 8,748 bytes, sha256:120b38f3...). Every quote was re-selected in today's bytes.
- D2 `nr-muscle-unstructured` (Elhassan 2019): same JATS bytes (sha256:fb1c0ad7...) and same NCT02950441 bytes. D2's locators index a derived text
  (jats-xml2txt/v1); this fixture's locators index the raw JATS code points, so offsets differ from D2's by design.
- D6 `label-versions-truniagen-dsld`: same DSLD 323170 bytes (sha256:d9002592...). This fixture's LabelVersion digests use their own canonicalization (see assertions.yaml note).

## Ids

missionId `mission:ft-S-xfx-fixtures` and runIds `run:ft-S-xfx-compound-ingest` / `-projection` / `-verify` are fixture ids, not live Mission Control ids.

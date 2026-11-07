RULE = "python: re.sub(r'\\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', xml_utf8))) (tags -> space, entities unescaped, whitespace runs -> one space, no strip)"
MAR = {'ref': 'person-martens', 'type': 'Person'}
JIN = {'ref': 'org-jinfiniti', 'type': 'Organization'}
CUR = {'ref': 'agent-curation', 'type': 'Agent'}
BN = {'ref': 'biomarker-nad', 'type': 'Biomarker'}
BA = {'ref': 'biomarker-naad', 'type': 'Biomarker'}
SN = {'ref': 'substance-nad', 'type': 'ChemicalSubstance'}
SA = {'ref': 'substance-naad', 'type': 'ChemicalSubstance'}
ME = {'ref': 'mechanism-nicotinate', 'type': 'Mechanism'}
MP = {'ref': 'metric-nad-pbmc', 'type': 'Metric'}
MR = {'ref': 'metric-nad-rbc', 'type': 'Metric'}
LT = {'ref': 'labtest-jinfiniti', 'type': 'LabTest'}
AV = {'ref': 'av-jinfiniti', 'type': 'AssayVersion'}
RI = {'ref': 'ri-jinfiniti-optimal', 'type': 'ReferenceIntervalVersion'}
PT = {'ref': 'product-jinfiniti-test', 'type': 'Product'}
PM = {'ref': 'product-jinfiniti-membership', 'type': 'Product'}
PUB = {'validFrom': None, 'validFromBasis': 'UNKNOWN', 'statedAsOf': '2018-03-29T00:00:00Z', 'statedAsOfPrecision': 'DAY'}
OBS = {'validFrom': None, 'validFromBasis': 'OBSERVATION_ONLY', 'statedAsOf': '2026-10-08T17:40:00-04:00', 'statedAsOfPrecision': 'INSTANT'}
MD = 'Unicode code points of the UTF-8 Firecrawl markdown capture'

FX = {
 'id': 'nr-nad-compound-to-test', 'short': 'nrnad', 'kind': 'other',
 'candidate': 'FC-7 in ../../_notes/fixture-candidates.md (cross-domain D1 -> D2 -> D3 -> D4 path; harm branch NOT_COMPARABLE and test-and-sell); D2 side: ../../../D2/07-fixtures/nr-muscle-unstructured',
 'description': ("The compound -> mechanism -> biomarker -> test path of Q-D4-01 as one query pattern spanning D2 and D4, on real captures. Nicotinamide riboside "
   "(D1 ChemicalSubstance) acts on NAD+ metabolism (D2 Mechanism 'Nicotinate metabolism', Reactome R-HSA-196807; the NR -> mechanism hop is D2's AFFECTS_MECHANISM, "
   "demonstrated in the D2 fixture nr-muscle-unstructured). D4 supplies the rest: Biomarker NAD+ level and NAAD level REFLECTS_MECHANISM that mechanism "
   "(asserted by Martens et al. 2018, Nat Commun 9:1286, PMID 29599478, PMC5876407, NCT02921659), HAS_ANALYTE -> the D1 substances, and two Metrics that "
   "QUANTIFY NAD+: 'NAD+ in PBMCs, pmol/mg protein' (trial, LC-MS cited) and 'NAD+ in red blood cells, μM' (Jinfiniti Intracellular NAD® Test, finger prick, "
   "method not reported). The test is reached by MEASURES_METRIC, its procedure by PERFORMED_WITH_VERSION, the seller's 'optimal' band by INTERVAL_FOR "
   "(intervalKind VENDOR_TARGET, derivation VENDOR_DEFINED), and the purchasable items by DELIVERS (D6 Product -> LabTest). Expected answer: the test exists "
   "but is NOT_COMPARABLE with the trial measurement (compartment PBMC vs RBC, unit, method), and the test issuer sells the supplement the test is used "
   "to dose (test-and-sell). The registry record of the trial does not list NAD+ as an outcome (registry/publication divergence)."),
 'citation': ("https://doi.org/10.1038/s41467-018-03421-7 · Martens CR et al., 'Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy "
   "middle-aged and older adults', Nat Commun 2018;9:1286 (PMID 29599478, PMCID PMC5876407) · retrieved 2026-10-08 via Europe PMC fullTextXML; "
   "https://clinicaltrials.gov/api/v2/studies/NCT02921659 · ClinicalTrials.gov NCT02921659 · 2026-10-08; "
   "https://www.jinfiniti.com/product/intracellular-nad-test · Jinfiniti, Intracellular NAD® Test · 2026-10-08"),
 'snapshots': [
  {'ref': 'snap-martens', 'url': 'https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5876407/fullTextXML',
   'title': 'Martens et al. 2018, Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults, Nat Commun 9:1286 (Europe PMC JATS XML; PMID 29599478; DOI 10.1038/s41467-018-03421-7)',
   'file': 'epmc-PMC5876407.xml', 'textFile': 'epmc-PMC5876407.txt', 'textRule': RULE, 'basis': 'text',
   'offsetBasis': 'Unicode code points of the derived text (see derivedText.rule) of the XML snapshot',
   'digest': 'dd620181966f862df7030f4bb7b09811befd90e8e67c2b94fc90f9c212664794', 'researchDigest': 'dd620181966f862df7030f4bb7b09811befd90e8e67c2b94fc90f9c212664794',
   'sourceKind': 'API', 'genre': 'PEER_REVIEWED_PUBLICATION', 'retrievedAt': '2026-10-08T17:39:00-04:00', 'mime': 'application/xml', 'tool': 'curl Europe PMC REST fullTextXML (no key)'},
  {'ref': 'snap-ctgov', 'url': 'https://clinicaltrials.gov/api/v2/studies/NCT02921659?fields=protocolSection.identificationModule,protocolSection.outcomesModule',
   'title': 'ClinicalTrials.gov API v2 - NCT02921659 (identification and outcomes modules)', 'file': 'ctg-NCT02921659-fields.json', 'basis': 'json',
   'digest': 'b723914eeecf73f7f217f05bcebed23b6996f16dfabaad66943bc132a41a4a5c', 'researchDigest': 'b723914eeecf73f7f217f05bcebed23b6996f16dfabaad66943bc132a41a4a5c',
   'sourceKind': 'REGISTRY', 'genre': 'TRIAL_REGISTRY_RECORD', 'retrievedAt': '2026-10-08T17:39:00-04:00', 'mime': 'application/json', 'tool': 'curl ClinicalTrials.gov API v2 (fields filter)'},
  {'ref': 'snap-jinfiniti', 'url': 'https://www.jinfiniti.com/product/intracellular-nad-test', 'title': 'Jinfiniti - Intracellular NAD® Test: At-Home NAD+ Test Kit (product page)',
   'file': 'jinfiniti-nad.md', 'basis': 'text', 'offsetBasis': MD, 'digest': '405e28c0e82b77d68ea124b1ec5cb9d3984a80ebb026248fbb0c471bf88832f4',
   'researchDigest': 'edb294193347b80e72a64f5cf58eb2a9b419829e0982eeff43687b66255659b5', 'sourceKind': 'WEB_PAGE', 'genre': 'PRODUCT_PAGE',
   'retrievedAt': '2026-10-08T17:40:00-04:00', 'mime': 'text/markdown', 'tool': 'Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (found with Tavily CLI search in the research stage)',
   'note': 'research-stage capture (shared with the D2 packet) had sha256 edb29419...; the page changed slightly; all quotes re-verified here'},
 ],
 'locators': [
  {'ref': 'm1-pbmc-nad', 'snap': 'snap-martens', 'quote': 'Oral NR supplementation effectively elevated levels of NAD + in PBMCs by ~60% compared with placebo (mean change = 6.2 pmol per mg protein; one-sided 95% CI (0.074, ∞)).', 'section': 'Results'},
  {'ref': 'm2-compartment', 'snap': 'snap-martens', 'quote': 'measurable in circulating peripheral blood mononuclear cells (PBMCs), but undetectable in plasma and urine', 'section': 'Results'},
  {'ref': 'm3-naad-marker', 'snap': 'snap-martens', 'quote': 'NAAD is a highly sensitive and reliable biomarker of increased NAD + metabolism and a product of NR utilization in humans', 'section': 'Results'},
  {'ref': 'm4-stimulates', 'snap': 'snap-martens', 'quote': 'chronic supplementation with the NAD + precursor vitamin, nicotinamide riboside (NR), is well tolerated and effectively stimulates NAD + metabolism in healthy middle-aged and older adults', 'section': 'Abstract'},
  {'ref': 'm5-pbmc-method', 'snap': 'snap-martens', 'quote': 'we assessed the NAD + metabolome in circulating PBMCs, as previously established 34', 'section': 'Results'},
  {'ref': 'm6-lcms-ref', 'snap': 'snap-martens', 'quote': 'Targeted, LCMS-based metabolomics for quantitative measurement of NAD+ metabolites', 'section': 'References (34)'},
  {'ref': 'm7-nct', 'snap': 'snap-martens', 'quote': 'registered on clinicaltrials.gov under the identifier NCT02921659', 'section': 'Methods'},
  {'ref': 'm8-naad', 'snap': 'snap-martens', 'quote': 'NR also elevated levels of nicotinic acid adenine dinucleotide (NAAD) nearly fivefold above the placebo condition', 'section': 'Results'},
  {'ref': 'ct1-primary', 'snap': 'snap-ctgov', 'pointer': '/protocolSection/outcomesModule/primaryOutcomes/0/measure', 'quote': 'Incidence of treatment emergent adverse events'},
  {'ref': 'ct2-secondary', 'snap': 'snap-ctgov', 'pointer': '/protocolSection/outcomesModule/secondaryOutcomes/4/measure', 'quote': 'Systemic markers of oxidative stress and inflammation'},
  {'ref': 'j1-rbc', 'snap': 'snap-jinfiniti', 'quote': 'This test measures NAD+ intracellularly, meaning inside your red blood cells.', 'section': 'FAQ'},
  {'ref': 'j2-not-serum', 'snap': 'snap-jinfiniti', 'quote': 'Most NAD+ tests measure NAD in serum or plasma — the liquid part of your blood.', 'section': 'FAQ'},
  {'ref': 'j3-unit', 'snap': 'snap-jinfiniti', 'quote': 'Personalized results with your NAD+ level in μM'},
  {'ref': 'j4-clia', 'snap': 'snap-jinfiniti', 'quote': 'CLIA-certified intracellular NAD+ measurement'},
  {'ref': 'j5-fingerprick', 'snap': 'snap-jinfiniti', 'quote': 'At-home finger-prick collection kit'},
  {'ref': 'j6-optimal', 'snap': 'snap-jinfiniti', 'quote': 'optimal range (40–100 μM)', 'section': 'FAQ: dosing guidance'},
  {'ref': 'j7-price', 'snap': 'snap-jinfiniti', 'quote': 'Intracellular NAD® TestFrom $198.00'},
  {'ref': 'j8-membership', 'snap': 'snap-jinfiniti', 'quote': 'The NAD Membership includes Intracellular NAD® Test and Vitality↑® NAD+ Booster shipped quarterly', 'section': 'FAQ'},
  {'ref': 'j9-set-ranges', 'snap': 'snap-jinfiniti', 'quote': 'Jinfiniti pioneered NAD testing, established the reference ranges and guidelines and generated most of the NAD data relevant to consumers.'},
  {'ref': 'j10-own-booster', 'snap': 'snap-jinfiniti', 'quote': 'Jinfiniti’s clinical data — conducted on our own Vitality↑® NAD+ Booster — found that 85% of participants reached optimal NAD+ levels (40–100 μM) within 4 weeks when dosing was guided by testing.'},
  {'ref': 'j11-cv', 'snap': 'snap-jinfiniti', 'quote': 'A simple finger prick test with high accuracy (3.1% CV)'},
 ],
 'entities': [
  {'ref': 'substance-nr', 'type': 'ChemicalSubstance', 'module': 'D1', 'uid': 'hu:substance:nicotinamide-riboside', 'name': 'Nicotinamide riboside', 'onMatch': 'use_existing'},
  {'ref': 'substance-nad', 'type': 'ChemicalSubstance', 'module': 'D1', 'uid': 'hu:substance:nad-plus', 'name': 'NAD+ (nicotinamide adenine dinucleotide, oxidized)', 'onMatch': 'use_existing'},
  {'ref': 'substance-naad', 'type': 'ChemicalSubstance', 'module': 'D1', 'uid': 'hu:substance:naad', 'name': 'Nicotinic acid adenine dinucleotide (NAAD)', 'onMatch': 'use_existing'},
  {'ref': 'mechanism-nicotinate', 'type': 'Mechanism', 'module': 'D2', 'uid': 'hu:mechanism:reactome-r-hsa-196807', 'name': 'Nicotinate metabolism (Reactome R-HSA-196807)',
   'identifiers': [{'scheme': 'REACTOME', 'issuer': 'Reactome', 'value': 'R-HSA-196807'}], 'onMatch': 'use_existing',
   'note': 'identifier from the D2 packet capture (D2 01-ecosystem S2, Reactome ContentService, 2026-10-08); D2 owns the node'},
  {'ref': 'biomarker-nad', 'type': 'Biomarker', 'module': 'D4', 'uid': 'hu:biomarker:nad-plus-level', 'name': 'NAD+ level (cellular)', 'props': {'biomarkerKind': 'METABOLITE', 'searchText': 'NAD+, NAD, nicotinamide adenine dinucleotide level'}, 'onMatch': 'use_existing'},
  {'ref': 'biomarker-naad', 'type': 'Biomarker', 'module': 'D4', 'uid': 'hu:biomarker:naad-level', 'name': 'NAAD level', 'props': {'biomarkerKind': 'METABOLITE', 'searchText': 'NAAD, nicotinic acid adenine dinucleotide'}, 'onMatch': 'use_existing'},
  {'ref': 'metric-nad-pbmc', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:nad-plus-in-pbmc-pmol-per-mg-protein', 'name': 'NAD+ in PBMCs (pmol per mg protein), Martens 2018',
   'props': {'metricKind': 'MEASURAND', 'defaultResultKind': 'MEASURED', 'definitionSource': 'PUBLICATION', 'definitionIssuerName': 'Martens et al. 2018', 'systemText': 'PBMC',
             'methodText': 'targeted LC-MS metabolomics (cited ref 34), normalized to total protein', 'canonicalUnitCode': 'pmol/mg{protein}', 'scale': 'QUANTITATIVE',
             'notReported': ['MEASURAND_SYSTEM'], 'searchText': 'NAD+ PBMC peripheral blood mononuclear cells pmol/mg protein'}, 'onMatch': 'review',
   'note': 'systemOntologyId left null: the CL CURIE for PBMC was not looked up in this run (never invented); MEASURAND_SYSTEM in notReported refers to the ontology id only'},
  {'ref': 'metric-nad-rbc', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:nad-plus-in-rbc-umol-jinfiniti', 'name': 'Intracellular NAD+ in red blood cells (μM), Jinfiniti',
   'props': {'metricKind': 'MEASURAND', 'defaultResultKind': 'MEASURED', 'definitionSource': 'VENDOR', 'definitionIssuerName': 'Jinfiniti', 'systemText': 'RBC (finger-prick capillary blood)',
             'canonicalUnitCode': 'umol/L', 'scale': 'QUANTITATIVE', 'notReported': ['METRIC_METHOD'], 'searchText': 'NAD+ intracellular red blood cells uM NAD test'}, 'onMatch': 'review'},
  {'ref': 'labtest-jinfiniti', 'type': 'LabTest', 'module': 'D4', 'uid': 'hu:lab-test:jinfiniti-intracellular-nad-test', 'name': 'Jinfiniti Intracellular NAD® Test',
   'props': {'testKind': 'SINGLE', 'orderChannel': 'DIRECT_TO_CONSUMER', 'collectionModes': ['CAPILLARY_FINGERPRICK'], 'notReported': ['PERFORMING_LAB']}, 'onMatch': 'use_existing'},
  {'ref': 'av-jinfiniti', 'type': 'AssayVersion', 'module': 'D4', 'uid': 'hu:assay-version:jinfiniti-icnad-observed-2026-10-08', 'name': 'Jinfiniti intracellular NAD+ assay as observed on the vendor page 2026-10-08',
   'props': {'methodText': 'CLIA-certified intracellular NAD+ measurement (method not named)', 'specimenKinds': ['CAPILLARY_BLOOD', 'RED_BLOOD_CELLS'], 'reportedUnitCode': 'umol/L',
             'notReported': ['METHOD_PRINCIPLE', 'INSTRUMENT_MODEL', 'REAGENT_KIT', 'SOFTWARE_VERSION', 'CALIBRATION_TRACEABILITY', 'PERFORMING_LAB']}, 'onMatch': 'create_anyway'},
  {'ref': 'ri-jinfiniti-optimal', 'type': 'ReferenceIntervalVersion', 'module': 'D4', 'uid': 'hu:ri-version:jinfiniti-nad-optimal-40-100-umol', 'name': 'Jinfiniti "optimal" NAD+ 40–100 μM',
   'props': {'intervalKind': 'VENDOR_TARGET', 'derivation': 'VENDOR_DEFINED', 'intervalText': 'optimal range (40–100 μM)', 'lowerBound': 40, 'upperBound': 100, 'unitCode': 'umol/L',
             'sex': 'NOT_REPORTED', 'notReported': ['INTERVAL_PARTITION', 'EFFECTIVE_DATE']}, 'onMatch': 'use_existing'},
  {'ref': 'product-jinfiniti-test', 'type': 'Product', 'module': 'D6', 'uid': 'hu:product:jinfiniti-intracellular-nad-test-kit', 'name': 'Jinfiniti Intracellular NAD® Test (kit)', 'onMatch': 'use_existing'},
  {'ref': 'product-jinfiniti-membership', 'type': 'Product', 'module': 'D6', 'uid': 'hu:product:jinfiniti-nad-membership', 'name': 'Jinfiniti NAD Membership (test + Vitality↑ NAD+ Booster, quarterly)', 'onMatch': 'use_existing'},
  {'ref': 'org-jinfiniti', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:jinfiniti', 'name': 'Jinfiniti Precision Medicine', 'onMatch': 'use_existing'},
  {'ref': 'person-martens', 'type': 'Person', 'module': 'D7', 'uid': 'hu:person:martens-christopher-r', 'name': 'Christopher R. Martens (first author; asserter for the author group)', 'onMatch': 'use_existing'},
  {'ref': 'agent-curation', 'type': 'Agent', 'module': 'K', 'uid': 'hu:agent:bks-curation-d4', 'name': 'BellLabs D4 curation agent', 'props': {'agentKind': 'AUTOMATED_AGENT'}, 'onMatch': 'use_existing'},
 ],
 'assertions': [
  {'id': 'e01', 'edgeClass': 'structural', 'predicate': 'HAS_ANALYTE', 'subject': BN, 'object': SN, 'objectField': 'Biomarker.analytes', 'asserter': CUR, 'locators': ['m1-pbmc-nad'], 'rationale': 'curated: the referent of NAD+ level is the substance NAD+'},
  {'id': 'e02', 'edgeClass': 'structural', 'predicate': 'HAS_ANALYTE', 'subject': BA, 'object': SA, 'objectField': 'Biomarker.analytes', 'asserter': CUR, 'locators': ['m8-naad']},
  {'id': 'e03', 'edgeClass': 'asserted', 'predicate': 'REFLECTS_MECHANISM', 'assertionKind': 'RELATIONSHIP', 'subject': BA, 'object': ME, 'asserter': MAR, 'locators': ['m3-naad-marker'],
   'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'CITED_FROM_PRIOR_WORK', 'validTime': PUB, 'qualifiers': ['humans; PBMC metabolome; confirms a previous report (ref 26)']},
  {'id': 'e04', 'edgeClass': 'asserted', 'predicate': 'REFLECTS_MECHANISM', 'assertionKind': 'RELATIONSHIP', 'subject': BN, 'object': ME, 'asserter': MAR, 'locators': ['m4-stimulates', 'm1-pbmc-nad'],
   'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'INFERRED_FROM_MEASUREMENT', 'validTime': PUB, 'qualifiers': ['PBMC NAD+ rise under NR read by the authors as stimulated NAD+ metabolism']},
  {'id': 'e05', 'edgeClass': 'structural', 'predicate': 'QUANTIFIES', 'subject': MP, 'object': BN, 'asserter': MAR, 'locators': ['m1-pbmc-nad', 'm5-pbmc-method']},
  {'id': 'e06', 'edgeClass': 'structural', 'predicate': 'QUANTIFIES', 'subject': MR, 'object': BN, 'asserter': JIN, 'locators': ['j1-rbc', 'j3-unit']},
  {'id': 'e07', 'edgeClass': 'asserted', 'predicate': 'MEASURES_METRIC', 'assertionKind': 'RELATIONSHIP', 'subject': LT, 'object': MR, 'asserter': JIN, 'locators': ['j1-rbc', 'j3-unit', 'j5-fingerprick'],
   'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS},
  {'id': 'e08', 'edgeClass': 'asserted', 'predicate': 'PERFORMED_WITH_VERSION', 'assertionKind': 'RELATIONSHIP', 'subject': LT, 'object': AV, 'objectField': 'LabTest.assayVersions', 'asserter': JIN,
   'locators': ['j4-clia', 'j11-cv'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS},
  {'id': 'e09', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': RI, 'object': AV, 'objectField': 'ReferenceIntervalVersion.assayVersions', 'asserter': JIN, 'locators': ['j6-optimal']},
  {'id': 'e10', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': RI, 'object': MR, 'objectField': 'ReferenceIntervalVersion.metrics', 'asserter': JIN, 'locators': ['j6-optimal', 'j10-own-booster']},
  {'id': 'e11', 'edgeClass': 'asserted', 'predicate': 'DELIVERS', 'assertionKind': 'RELATIONSHIP', 'subject': PT, 'object': LT, 'objectField': 'LabTest.products (direction IN)', 'asserter': JIN, 'locators': ['j7-price'],
   'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS},
  {'id': 'e12', 'edgeClass': 'asserted', 'predicate': 'DELIVERS', 'assertionKind': 'RELATIONSHIP', 'subject': PM, 'object': LT, 'objectField': 'LabTest.products (direction IN)', 'asserter': JIN, 'locators': ['j8-membership'],
   'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS, 'qualifiers': ['the same Product also contains the Vitality↑ NAD+ Booster supplement (D6 composition)']},
  {'id': 'e13', 'edgeClass': 'literal', 'predicate': 'SETS_REFERENCE_RANGE', 'assertionKind': 'FIELD', 'subject': RI, 'value': {'valueString': 'issuer: Jinfiniti ("established the reference ranges and guidelines")'},
   'asserter': JIN, 'locators': ['j9-set-ranges', 'j6-optimal'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS,
   'note': ('subject = the interval, asserter = the organization (05 predicateOnly updated in the fixtures stage). assertionKind FIELD since the adversarial-review pass: '
            'it records who issued the interval; the self-promotional part ("pioneered NAD testing") is not asserted')},
  {'id': 'e14', 'edgeClass': 'literal', 'predicate': 'FIELD_NOT_REPORTED', 'assertionKind': 'FIELD', 'subject': AV, 'value': {'valueString': 'METHOD_PRINCIPLE, INSTRUMENT_MODEL, PERFORMING_LAB'},
   'asserter': CUR, 'locators': ['j4-clia'], 'speechAct': 'STATES', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': OBS},
 ],
 'assessments': [
  {'id': 's01', 'assessmentKind': 'COMPARABILITY', 'assessmentSubkind': 'D4.comparability', 'conclusionCode': 'NOT_COMPARABLE', 'status': 'PROPOSED', 'methodVersion': 'd4-comparability/0.1 (fixture)',
   'about': ['hu:metric:nad-plus-in-pbmc-pmol-per-mg-protein', 'hu:metric:nad-plus-in-rbc-umol-jinfiniti'],
   'differingDimensions': ['compartment: PBMC vs red blood cells (the paper: NAD+ metabolites measurable in PBMCs, undetectable in plasma and urine)', 'unit: pmol per mg protein vs μM',
                           'method: targeted LC-MS (cited) vs not reported', 'specimen: venous PBMC isolation vs finger-prick capillary blood'],
   'inputAssertions': ['e05', 'e06', 'e07', 'e08', 'e14'],
   'evidence': [{'locator': 'm1-pbmc-nad', 'role': 'CONTEXT'}, {'locator': 'm2-compartment', 'role': 'SUPPORTS'}, {'locator': 'j1-rbc', 'role': 'SUPPORTS'}, {'locator': 'j3-unit', 'role': 'SUPPORTS'}, {'locator': 'm6-lcms-ref', 'role': 'CONTEXT'}],
   'summary': 'The consumer test quantifies the same Biomarker (NAD+ level) but a different Metric: a Jinfiniti μM value cannot be read against the trial\'s +6.2 pmol/mg protein PBMC change.',
   'questions': ['Q-D4-02', 'Q-D4-01']},
  {'id': 's02', 'assessmentKind': 'CONFLICT_RELEVANCE', 'assessmentSubkind': 'D4.test-and-sell', 'status': 'PROPOSED', 'methodVersion': 'd4-test-and-sell/0.1 (fixture)',
   'about': ['hu:org:jinfiniti', 'hu:lab-test:jinfiniti-intracellular-nad-test', 'hu:ri-version:jinfiniti-nad-optimal-40-100-umol'], 'effectDirection': 'HARM',
   'inputAssertions': ['e09', 'e10', 'e11', 'e12', 'e13'],
   'evidence': [{'locator': 'j9-set-ranges', 'role': 'SUPPORTS'}, {'locator': 'j8-membership', 'role': 'SUPPORTS'}, {'locator': 'j10-own-booster', 'role': 'SUPPORTS'}, {'locator': 'j6-optimal', 'role': 'CONTEXT'}],
   'summary': 'The issuer of the test also set the "optimal" band (VENDOR_TARGET, derivation VENDOR_DEFINED, population not reported) and sells the supplement dosed to reach it, bundled with the test.',
   'questions': ['Q-D4-12', 'Q-D4-13']},
 ],
 'intentNotes': ('Fixture intent (fixture ids). Cross-module subjects (D1 substances, D2 mechanism, D6 products, D7 organizations) use onMatch use_existing; the NR -> mechanism '
                 'hop is written by the D2 fixture, not here. Assessments s01/s02 are outside intent v1. Identifier scheme REACTOME must exist in the kernel register (D2 request).'),
}

FX['questionsMd'] = """# Fixture nr-nad-compound-to-test - questions answered

Kind: other (cross-domain path D1 -> D2 -> D4, with D3 and D6/D7 seams; harm/conflict branch in s01/s02).

## Q-D4-01 as one query pattern (D2 + D4)

```cypher
// compound -> mechanism (D2) <- biomarker (D4) -> metric -> test, with the comparability verdict for each test metric
MATCH (c:ChemicalSubstance {uid: 'hu:substance:nicotinamide-riboside'})-[:AFFECTS_MECHANISM]->(m:Mechanism)   // D2 derived projection (D2 fixture)
MATCH (b:Biomarker)-[rm:REFLECTS_MECHANISM]->(m)                                                              // D4 asserted (e03, e04)
MATCH (study:Metric)-[:QUANTIFIES]->(b)<-[:QUANTIFIES]-(tm:Metric)<-[mm:MEASURES_METRIC]-(t:LabTest)           // D4 (e05, e06, e07)
WHERE study.definitionSource = 'PUBLICATION' AND tm <> study AND mm.recordedTo IS NULL
OPTIONAL MATCH (a:Assessment)-[:ASSESSES]->(study), (a)-[:ASSESSES]->(tm) WHERE a.assessmentKind = 'COMPARABILITY' AND a.assessmentSubkind = 'D4.comparability'
OPTIONAL MATCH (p:Product)-[:DELIVERS]->(t)
RETURN c.name, m.name, b.name, study.name, tm.name, t.name, coalesce(a.conclusionCode, 'UNKNOWN') AS verdict, collect(p.name) AS buy
```

Expected row: nicotinamide riboside · Nicotinate metabolism (R-HSA-196807) · NAD+ level · NAD+ in PBMCs (pmol/mg protein) · Intracellular NAD+ in RBC (μM) · Jinfiniti Intracellular NAD® Test · COMPARABILITY `D4.comparability` conclusionCode `NOT_COMPARABLE` · [Intracellular NAD® Test kit, NAD Membership]. (NAAD level also reflects the mechanism, e03, but no captured consumer test measures NAAD.)

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| Q-D4-01 | A test exists for the NR-responsive biomarker NAD+ (Jinfiniti, RBC, μM), but it is **NOT_COMPARABLE** with the trial measurement (PBMC, pmol/mg protein, LC-MS); every hop cites a locator. | e03-e07, s01 |
| Q-D4-02 | **NOT_COMPARABLE**: compartment PBMC vs RBC, unit pmol/mg protein vs μM, method LC-MS vs not reported; the paper notes NAD+ metabolites are undetectable in plasma - compartment matters. | s01; m1, m2, j1, j3 |
| Q-D4-12 | The "optimal range (40–100 μM)" is a VENDOR_TARGET, derivation VENDOR_DEFINED, set by Jinfiniti (who "established the reference ranges and guidelines"); population not reported; the seller of the booster ran the cited 85 % study on its own product. | e09, e10, e13; j6, j9, j10 |
| Q-D4-13 | Jinfiniti issues the test and sells the NAD+ booster in the same membership product -> test-and-sell (CONFLICT_RELEVANCE assessment, HARM direction for the buyer's interpretation). | s02; e11, e12 |
| Q-D4-14 | Trial NCT02921659: registry outcomes are adverse events (primary) and physiological/inflammation markers (secondary); NAD+ is not a registered outcome although the paper reports it -> registry/publication divergence for D3. | ct1-primary, ct2-secondary, m7-nct |
"""

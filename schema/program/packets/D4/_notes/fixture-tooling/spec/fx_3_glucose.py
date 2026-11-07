FDA = {'ref': 'org-fda', 'type': 'Organization'}
ABT = {'ref': 'org-abbott', 'type': 'Organization'}
CUR = {'ref': 'agent-curation', 'type': 'Agent'}
CLM = {'ref': 'claim-noninvasive-glucose', 'type': 'Claim'}
MBG = {'ref': 'metric-glucose-blood', 'type': 'Metric'}
MCG = {'ref': 'metric-glucose-cgm', 'type': 'Metric'}
DEV = {'ref': 'device-libre3-sensor', 'type': 'Device'}
PRD = {'ref': 'product-libre3-system', 'type': 'Product'}
AV = {'ref': 'av-libre3-glucose', 'type': 'AlgorithmVersion'}
FDA_DATE = {'validFrom': '2024-02-21T00:00:00Z', 'validFromPrecision': 'DAY', 'validFromBasis': 'STATED_BY_SOURCE'}
REC = {'validFrom': '2025-11-24T00:00:00Z', 'validFromPrecision': 'DAY', 'validFromBasis': 'STATED_BY_SOURCE'}
OBS = {'validFrom': None, 'validFromBasis': 'OBSERVATION_ONLY', 'statedAsOf': '2026-10-05T00:00:00Z', 'statedAsOfPrecision': 'DAY'}
R1 = '/results/1'

FX = {
 'id': 'noninvasive-glucose-cgm-recall', 'short': 'gluc', 'kind': 'harm',
 'candidate': 'FC-5 in ../../_notes/fixture-candidates.md',
 'description': ("Harm case with two branches. (1) Unauthorized measurement claim: the FDA safety communication of 2024-02-21 says no smartwatch or smart "
   "ring is authorized to measure or estimate blood glucose on its own, that these devices do not directly test blood glucose, and that wrong "
   "readings can lead to dangerous hypoglycaemia. The seller claim is a kernel Claim; the FDA statements are third-party ratings of it (kernel predicate RATES_CLAIM, asserter FDA, subject the Claim); no seller page was captured, so the Claim has no occurrence in this fixture; the verdict "
   "is a kernel SAFETY_SIGNAL Assessment (subkind D4.unauthorized-measurement, effectDirection HARM). (2) Measurement error in an authorized device: "
   "the openFDA recall record for FreeStyle Libre 3 sensors (event 98049, product Z-1020-2026, initiated 2025-11-24, status 'Open, Classified') "
   "reports carbon build-up that may give incorrect low glucose results. It exercises DELIVERS (D6 Product 'FreeStyle Libre 3 CGM System' -> Device "
   "'FreeStyle Libre 3 sensor'), RUNS_ON_DEVICE (the sensor's glucose estimation software, version not stated, versionBasis UNKNOWN) and "
   "OUTPUTS_METRIC (-> interstitial glucose estimate), plus a SAFETY_SIGNAL Assessment (subkind D4.measurement-error-recall, HARM). The recall record "
   "itself is D8's: it reaches the device through the D6 Product that DELIVERS it (D8 RegulatoryRecord -CONCERNS-> Product, no D8 union change); D4 holds the device, the algorithm version and the metric it reaches."),
 'citation': ("https://www.fda.gov/medical-devices/safety-communications/do-not-use-smartwatches-or-smart-rings-measure-blood-glucose-levels-fda-safety-communication · "
   "FDA, Do Not Use Smartwatches or Smart Rings to Measure Blood Glucose Levels: FDA Safety Communication (2024-02-21) · retrieved 2026-10-08; "
   "https://api.fda.gov/device/recall.json?search=product_description:%22FreeStyle+Libre+3%22&limit=3 · openFDA device recall (meta.last_updated 2026-10-05) · retrieved 2026-10-08"),
 'snapshots': [
  {'ref': 'snap-fda', 'url': 'https://www.fda.gov/medical-devices/safety-communications/do-not-use-smartwatches-or-smart-rings-measure-blood-glucose-levels-fda-safety-communication',
   'title': 'FDA - Do Not Use Smartwatches or Smart Rings to Measure Blood Glucose Levels: FDA Safety Communication (2024-02-21)',
   'file': 'fda-smartwatch-glucose.md', 'basis': 'text', 'offsetBasis': 'Unicode code points of the UTF-8 Firecrawl markdown capture',
   'digest': 'a406e0fb4dca30ab1f1916e417146ea39be3a2a2343f875039db9b67e98edb8f', 'researchDigest': 'a406e0fb4dca30ab1f1916e417146ea39be3a2a2343f875039db9b67e98edb8f',
   'sourceKind': 'WEB_PAGE', 'genre': 'REGULATOR_SAFETY_COMMUNICATION', 'retrievedAt': '2026-10-08T17:40:00-04:00', 'mime': 'text/markdown',
   'tool': 'Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (found with Tavily CLI search in the research stage)'},
  {'ref': 'snap-openfda', 'url': 'https://api.fda.gov/device/recall.json?search=product_description:%22FreeStyle+Libre+3%22&limit=3',
   'title': 'openFDA device recall API - FreeStyle Libre 3 (3 records; meta.last_updated 2026-10-05)', 'file': 'openfda-recall-libre3.json', 'basis': 'json',
   'digest': '4a16676ef1ddb4c15725332f830ba0fb94715a0262fcce58b84cf905d81de6bc', 'researchDigest': '4a16676ef1ddb4c15725332f830ba0fb94715a0262fcce58b84cf905d81de6bc',
   'sourceKind': 'API', 'genre': 'REGULATOR_RECORD', 'retrievedAt': '2026-10-08T17:39:00-04:00', 'mime': 'application/json', 'tool': 'curl openFDA device/recall (no API key)',
   'note': '7.26 MB for 3 records (openfda.registration_number lists are large); a narrower query res_event_number:98049 returns 4 products (8.6 MB)'},
 ],
 'locators': [
  {'ref': 'f1-date', 'snap': 'snap-fda', 'quote': 'Date Issued: February 21, 2024'},
  {'ref': 'f2-not-authorized', 'snap': 'snap-fda', 'quote': 'The FDA has not authorized, cleared, or approved any smartwatch or smart ring that is intended to measure or estimate blood glucose values on its own.'},
  {'ref': 'f3-hypoglycaemia', 'snap': 'snap-fda', 'quote': 'Taking too much of these medications can quickly lead to dangerously low glucose, leading to mental confusion, coma, or death within hours of the error.'},
  {'ref': 'f4-seller-claim', 'snap': 'snap-fda', 'quote': 'Sellers of these smartwatches and smart rings claim their devices measure blood glucose levels without requiring people to prick their finger or pierce the skin.', 'section': 'Device Description'},
  {'ref': 'f5-no-direct-test', 'snap': 'snap-fda', 'quote': 'These smartwatches and smart rings do not directly test blood glucose levels.', 'section': 'Device Description'},
  {'ref': 'f6-scope', 'snap': 'snap-fda', 'quote': 'Any smartwatch or smart ring, regardless of brand, that claims to measure blood glucose levels.', 'section': 'Affected Devices'},
  {'ref': 'o1-product', 'snap': 'snap-openfda', 'pointer': R1 + '/product_description', 'quote': 'The FreeStyle Libre 3 sensor is a component of the FreeStyle Libre 3 Continuous Glucose Monitoring System.'},
  {'ref': 'o2-udi', 'snap': 'snap-openfda', 'pointer': R1 + '/product_description', 'quote': 'UDI-DI code: 00357599818005'},
  {'ref': 'o3-reason', 'snap': 'snap-openfda', 'pointer': R1 + '/reason_for_recall', 'quote': 'Due to a manufacturing process issue that may cause carbon build up in the sensor that may result in incorrect low glucose results'},
  {'ref': 'o4-initiated', 'snap': 'snap-openfda', 'pointer': R1 + '/event_date_initiated', 'quote': '2025-11-24'},
  {'ref': 'o5-k-number', 'snap': 'snap-openfda', 'pointer': R1 + '/k_numbers/0', 'quote': 'K212132'},
  {'ref': 'o6-readings', 'snap': 'snap-openfda', 'pointer': R1 + '/action', 'quote': 'certain FreeStyle Libre 3 and FreeStyle Libre 3 Plus sensors provide incorrect low glucose readings'},
  {'ref': 'o7-root-cause', 'snap': 'snap-openfda', 'pointer': R1 + '/root_cause_description', 'quote': 'Process control'},
  {'ref': 'o8-recall-number', 'snap': 'snap-openfda', 'pointer': R1 + '/product_res_number', 'quote': 'Z-1020-2026'},
 ],
 'entities': [
  {'ref': 'claim-noninvasive-glucose', 'type': 'Claim', 'module': 'K', 'uid': 'hu:claim:smartwatch-ring-measures-blood-glucose-noninvasively',
   'name': 'Smartwatches or smart rings measure blood glucose without piercing the skin',
   'props': {'proposition': 'A smartwatch or smart ring measures blood glucose levels without piercing the skin (non-invasively, on its own).', 'claimType': 'CAPABILITY'}, 'onMatch': 'use_existing'},
  {'ref': 'metric-glucose-blood', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:glucose-in-blood', 'name': 'Glucose concentration in blood',
   'props': {'metricKind': 'MEASURAND', 'defaultResultKind': 'MEASURED', 'definitionSource': 'BELLLABS', 'systemText': 'Bld', 'scale': 'QUANTITATIVE',
             'notReported': ['UNIT'], 'searchText': 'blood glucose, blood sugar'}, 'onMatch': 'use_existing',
   'note': 'LOINC code not attached: no LOINC record for blood glucose was captured in this run (never invented)'},
  {'ref': 'metric-glucose-cgm', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:glucose-interstitial-cgm-estimate-abbott-libre3', 'name': 'Glucose reading of the FreeStyle Libre 3 sensor (interstitial, device estimate)',
   'props': {'metricKind': 'DEVICE_ESTIMATE', 'defaultResultKind': 'INFERRED', 'definitionSource': 'VENDOR', 'definitionIssuerName': 'Abbott Diabetes Care',
             'systemText': 'interstitial fluid (CGM sensor)', 'scale': 'QUANTITATIVE', 'notReported': ['UNIT', 'METRIC_METHOD']}, 'onMatch': 'review'},
  {'ref': 'device-libre3-sensor', 'type': 'Device', 'module': 'D4', 'uid': 'hu:device:abbott-freestyle-libre-3-sensor', 'name': 'FreeStyle Libre 3 Sensor (REF 72081-01)',
   'props': {'deviceKind': 'CGM_SENSOR', 'sensingModalities': ['ELECTROCHEMICAL_GLUCOSE'], 'deviceFamily': 'FreeStyle Libre', 'generationLabel': '3', 'makerName': 'Abbott Diabetes Care, Inc.'},
   'identifiers': [{'scheme': 'UDI_DI', 'issuer': 'GS1 (as printed in the FDA recall record)', 'value': '00357599818005'}, {'scheme': 'FDA_510K', 'issuer': 'FDA', 'value': 'K212132'}],
   'onMatch': 'use_existing', 'note': 'UDI_DI and FDA_510K are requested identifier schemes (11-open-questions #15); sensing modality is the curator mapping of a CGM sensor'},
  {'ref': 'product-libre3-system', 'type': 'Product', 'module': 'D6', 'uid': 'hu:product:abbott-freestyle-libre-3-cgm-system', 'name': 'FreeStyle Libre 3 Continuous Glucose Monitoring System', 'onMatch': 'use_existing'},
  {'ref': 'av-libre3-glucose', 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': 'hu:algorithm-version:abbott-libre3-glucose-estimation-unversioned',
   'name': 'FreeStyle Libre 3 sensor glucose estimation (software state not stated)',
   'props': {'algorithmFamily': 'FreeStyle Libre glucose estimation', 'familyKey': 'abbott-libre-glucose', 'algorithmKind': 'SIGNAL_PROCESSING', 'realization': 'DEVICE_SOFTWARE',
             'versionBasis': 'UNKNOWN', 'outputKind': 'FEATURE_MEASURE', 'componentLabel': 'glucose reading', 'notReported': ['VERSION_LABEL', 'SOFTWARE_VERSION', 'FIRMWARE_VERSION']}, 'onMatch': 'review'},
  {'ref': 'org-fda', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:us-fda', 'name': 'U.S. Food and Drug Administration', 'onMatch': 'use_existing'},
  {'ref': 'org-abbott', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:abbott-diabetes-care', 'name': 'Abbott Diabetes Care, Inc.', 'onMatch': 'use_existing'},
  {'ref': 'agent-curation', 'type': 'Agent', 'module': 'K', 'uid': 'hu:agent:bks-curation-d4', 'name': 'BellLabs D4 curation agent', 'props': {'agentKind': 'AUTOMATED_AGENT'}, 'onMatch': 'use_existing'},
 ],
 'assertions': [
  {'id': 'c01', 'edgeClass': 'literal', 'predicate': 'RATES_CLAIM', 'assertionKind': 'FIELD', 'subject': CLM, 'value': {'valueString': 'NOT_AUTHORIZED: not authorized, cleared, or approved (any smartwatch or smart ring, on its own)'}, 'qualifiers': ['scale: none (regulator safety communication; rating-scale mapping is D10, regulator content D8)'],
   'asserter': FDA, 'locators': ['f2-not-authorized', 'f4-seller-claim', 'f6-scope', 'f1-date'], 'speechAct': 'STATES', 'polarity': 'NEGATIVE', 'basisKind': 'EXPERT_OPINION', 'validTime': FDA_DATE},
  {'id': 'c02', 'edgeClass': 'literal', 'predicate': 'RATES_CLAIM', 'assertionKind': 'FIELD', 'subject': CLM, 'value': {'valueString': 'CAPABILITY_DENIED: these devices do not directly test blood glucose levels'}, 'qualifiers': ['scale: none (regulator safety communication; rating-scale mapping is D10, regulator content D8)'],
   'asserter': FDA, 'locators': ['f5-no-direct-test'], 'speechAct': 'STATES', 'polarity': 'NEGATIVE', 'basisKind': 'EXPERT_OPINION', 'validTime': FDA_DATE},
  {'id': 'c03', 'edgeClass': 'literal', 'predicate': 'RATES_CLAIM', 'assertionKind': 'FIELD', 'subject': CLM,
   'value': {'valueString': 'HARMFUL_IF_RELIED_ON: inaccurate readings -> wrong medication dose -> dangerously low glucose, confusion, coma or death'}, 'qualifiers': ['scale: none (regulator safety communication; rating-scale mapping is D10, regulator content D8)'],
   'asserter': FDA, 'locators': ['f3-hypoglycaemia'], 'speechAct': 'CAUTIONS', 'polarity': 'POSITIVE', 'basisKind': 'EXPERT_OPINION', 'validTime': FDA_DATE},
  {'id': 'c04', 'edgeClass': 'asserted', 'predicate': 'DELIVERS', 'assertionKind': 'RELATIONSHIP', 'subject': PRD, 'object': DEV, 'objectField': 'Device.products (direction IN)',
   'asserter': ABT, 'locators': ['o1-product'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS,
   'qualifiers': ['firm-supplied product description published by FDA in recall Z-1020-2026']},
  {'id': 'c05', 'edgeClass': 'asserted', 'predicate': 'RUNS_ON_DEVICE', 'assertionKind': 'RELATIONSHIP', 'subject': AV, 'object': DEV, 'asserter': CUR,
   'locators': ['o6-readings', 'o1-product'], 'speechAct': 'STATES', 'basisKind': 'CALCULATED', 'validTime': {'validFrom': None, 'validFromBasis': 'UNKNOWN'},
   'derivationRule': 'D4 rule: every device value is an algorithm output (Device <- RUNS_ON_DEVICE <- AlgorithmVersion -> OUTPUTS_METRIC); software state not stated -> versionBasis UNKNOWN',
   'rationale': 'Lets a recall on the device reach every glucose value the device produced (Q-D4-09).'},
  {'id': 'c06', 'edgeClass': 'structural', 'predicate': 'OUTPUTS_METRIC', 'subject': AV, 'object': MCG, 'asserter': CUR, 'locators': ['o6-readings']},
  {'id': 'c07', 'edgeClass': 'literal', 'predicate': 'REPORTED_MEASUREMENT_ERROR', 'assertionKind': 'FIELD', 'subject': DEV,
   'value': {'valueString': 'incorrect low glucose results (carbon build-up from a manufacturing process issue); root cause: Process control; recall Z-1020-2026, event 98049'},
   'asserter': ABT, 'locators': ['o3-reason', 'o4-initiated', 'o7-root-cause', 'o8-recall-number'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': REC,
   'qualifiers': ['affected: certain lots/serials of REF 72081-01 (code_info), not every sensor', 'record status Open, Classified as of openFDA meta.last_updated 2026-10-05'],
   'note': ('the recall record is a D8 record; it reaches this Device through the D6 Product that DELIVERS it (c04): D8 RegulatoryRecord -CONCERNS-> Product <-DELIVERS- ... '
            'This predicate-only assertion keeps the device-level error statement and the UDI-DI / REF for disambiguation (adversarial review: no D8 union change).')},
  {'id': 'c08', 'edgeClass': 'identifier', 'predicate': 'HAS_IDENTIFIER', 'subject': DEV, 'asserter': ABT, 'locators': ['o2-udi'],
   'identifier': {'scheme': 'UDI_DI', 'issuer': 'GS1 (as printed in the FDA recall record)', 'value': '00357599818005'}},
  {'id': 'c09', 'edgeClass': 'identifier', 'predicate': 'HAS_IDENTIFIER', 'subject': DEV, 'asserter': FDA, 'locators': ['o5-k-number'],
   'identifier': {'scheme': 'FDA_510K', 'issuer': 'FDA', 'value': 'K212132'}},
 ],
 'assessments': [
  {'id': 's01', 'assessmentKind': 'SAFETY_SIGNAL', 'assessmentSubkind': 'D4.unauthorized-measurement', 'status': 'PROPOSED', 'methodVersion': 'd4-safety-signal/0.1 (fixture)',
   'about': ['hu:claim:smartwatch-ring-measures-blood-glucose-noninvasively', 'hu:metric:glucose-in-blood'], 'effectDirection': 'HARM', 'verdict': 'CONTRADICTED',
   'inputAssertions': ['c01', 'c02', 'c03'],
   'evidence': [{'locator': 'f2-not-authorized', 'role': 'CONTRADICTS'}, {'locator': 'f5-no-direct-test', 'role': 'CONTRADICTS'}, {'locator': 'f3-hypoglycaemia', 'role': 'CONTEXT'}, {'locator': 'f6-scope', 'role': 'QUALIFIES'}],
   'summary': 'Any smartwatch or smart ring sold as measuring blood glucose without piercing the skin: claimed capability contradicted by the regulator (not authorized; does not directly test blood glucose); harm pathway = wrong dosing -> hypoglycaemia.',
   'questions': ['Q-D4-08', 'Q-D4-18']},
  {'id': 's02', 'assessmentKind': 'SAFETY_SIGNAL', 'assessmentSubkind': 'D4.measurement-error-recall', 'status': 'PROPOSED', 'methodVersion': 'd4-safety-signal/0.1 (fixture)',
   'about': ['hu:device:abbott-freestyle-libre-3-sensor', 'hu:metric:glucose-interstitial-cgm-estimate-abbott-libre3'], 'effectDirection': 'HARM',
   'inputAssertions': ['c04', 'c05', 'c06', 'c07'],
   'evidence': [{'locator': 'o3-reason', 'role': 'SUPPORTS'}, {'locator': 'o6-readings', 'role': 'SUPPORTS'}, {'locator': 'o4-initiated', 'role': 'CONTEXT'}],
   'summary': 'Glucose readings from affected FreeStyle Libre 3 sensors (REF 72081-01, listed lots) may be falsely low from 2025-11-24 (recall initiation); readings of the interstitial glucose metric from those sensors need the lot check before use.',
   'questions': ['Q-D4-09', 'Q-D4-17']},
 ],
 'intentNotes': ('Fixture intent (fixture ids). c01-c03 use the kernel predicate RATES_CLAIM (third-party verdict on a Claim; adversarial review replaced D4 regulatory_statement). Not expressible in v1: the SAFETY_SIGNAL assessments s01/s02 (assessment activity), assertionKind (c01-c03), '
                 'and the Claim node is sent as a subject with nodeType Claim (kernel type; the executor may require a claim-specific proposal kind - open). '
                 'The recall record itself is a D8 node; this intent only writes the D4 side.'),
}

FX['questionsMd'] = """# Fixture noninvasive-glucose-cgm-recall - questions answered

Kind: harm. Harm is `effectDirection: HARM` on kernel SAFETY_SIGNAL Assessments, never a property of the device or the metric.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| Q-D4-08 | Smartwatches and smart rings that claim to measure blood glucose without piercing the skin: the FDA (2024-02-21) has not authorized, cleared or approved any such device; they "do not directly test blood glucose levels"; scope: any brand. Verdict on the capability claim: CONTRADICTED, effectDirection HARM. The pattern starts from the SAFETY_SIGNAL Assessment (it ASSESSES the Claim and the Metric); claim occurrences are optional (none captured: FDA only retells the sellers' claim, f4-seller-claim). | s01; c01, c02, c03 (RATES_CLAIM by FDA); f1-date, f2-not-authorized, f5-no-direct-test, f6-scope |
| Q-D4-18 | Same communication answers "which devices marketed for glucose control are unauthorized": the whole class of non-invasive smartwatch/ring glucose claims (no named brand; brands come from D6 listings that make the claim). | s01, f6-scope |
| Q-D4-09 | Device model FreeStyle Libre 3 Sensor (REF 72081-01, UDI-DI 00357599818005, 510(k) K212132), reached by D8 through the Product that DELIVERS it (c04): recall Z-1020-2026 (event 98049), initiated 2025-11-24, reason "carbon build up ... incorrect low glucose results", root cause "Process control", status Open, Classified (openFDA as of 2026-10-05). The path device <- RUNS_ON_DEVICE <- AlgorithmVersion -> OUTPUTS_METRIC reaches the interstitial glucose metric, so values from affected sensors after 2025-11-24 are flagged. | s02; c04-c09; o1-o8 |
| Q-D4-17 | For a metabolic-health target operationalized by glucose, the CGM product that DELIVERS this device is reachable (D6 Product -> Device), and its HARM signal travels with it. | c04, s02 |
| Q-D4-10 (partial) | Regulatory identity of the device: 510(k) K212132 (identifier); clearance status records are D8's. | c09 |

Expected answer to "is my smartwatch glucose reading reliable?": no - the regulator states such devices are not authorized and do not directly test blood glucose; use an FDA-authorized glucose device (located advice, FDA 2024-02-21).
"""

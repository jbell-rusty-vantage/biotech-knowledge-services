WH = {'ref': 'org-whoop', 'type': 'Organization'}
OU = {'ref': 'org-oura', 'type': 'Organization'}
AP = {'ref': 'org-apple', 'type': 'Organization'}
FM = {'ref': 'person-forum-member', 'type': 'Person'}
CUR = {'ref': 'agent-curation', 'type': 'Agent'}
MG = {'ref': 'device-whoop-mg', 'type': 'Device'}
AW = {'ref': 'device-apple-watch', 'type': 'Device'}
HR1 = {'ref': 'av-whoop-hr-2026-02-25', 'type': 'AlgorithmVersion'}
HR2 = {'ref': 'av-whoop-hr-2026-07-06', 'type': 'AlgorithmVersion'}
FW = {'ref': 'av-whoop-fw-50-30-3-0', 'type': 'AlgorithmVersion'}
REC = {'ref': 'av-whoop-recovery-api', 'type': 'AlgorithmVersion'}
OSL = {'ref': 'av-oura-sleep-v2', 'type': 'AlgorithmVersion'}
AHR = {'ref': 'av-apple-hrv-sdnn', 'type': 'AlgorithmVersion'}
MHR = {'ref': 'metric-whoop-hr', 'type': 'Metric'}
MRM = {'ref': 'metric-whoop-hrv-rmssd', 'type': 'Metric'}
MOU = {'ref': 'metric-oura-average-hrv', 'type': 'Metric'}
MAP = {'ref': 'metric-apple-hrv-sdnn', 'type': 'Metric'}
OBS = {'validFrom': None, 'validFromBasis': 'OBSERVATION_ONLY', 'statedAsOf': '2026-10-08T17:40:00-04:00', 'statedAsOfPrecision': 'INSTANT'}
MD = 'Unicode code points of the UTF-8 Firecrawl markdown capture'
FC = 'Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0'
def av(ref, uid, name, fam, key, kind, real, basis, out, **kw):
    p = {'algorithmFamily': fam, 'familyKey': key, 'algorithmKind': kind, 'realization': real, 'versionBasis': basis, 'outputKind': out}
    p.update(kw)
    p = {k: v for k, v in p.items() if v is not None}
    return {'ref': ref, 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': uid, 'name': name, 'props': p, 'onMatch': 'review'}

FX = {
 'id': 'wearable-hrv-algorithm-changes', 'short': 'hrv', 'kind': 'other',
 'candidate': 'FC-6 in ../../_notes/fixture-candidates.md',
 'description': ("Wearable values change meaning without a version label, and one name ('HRV') covers different metrics. WHOOP's 2026 changelog announces a new "
   "heart-rate signal-processing algorithm on February 25 and a new heart-rate algorithm on July 6 (Strain may shift), with no version string: each is an "
   "AlgorithmVersion with versionBasis CHANGE_EVENT_UNLABELED pinned by its date, attached to the device model by RUNS_ON_DEVICE episodes (the second "
   "closes the first). Neither change names a hardware model: their attachment to WHOOP MG is a curator inference (only the dates are stated by WHOOP). A community member reports WHOOP MG firmware 50.30.3.0 (post dated May 20, 2025) with no vendor notes: an Assertion with a forum asserter. "
   "OUTPUTS_METRIC separates three 'HRV' metrics: WHOOP API hrv_rmssd_milli (RMSSD in milliseconds, stated in WHOOP's OpenAPI document), Apple HealthKit heartRateVariabilitySDNN (SDNN, ms) and Oura "
   "average_hrv (method and unit not stated; attributed by curator inference to the version Oura reports per record, which its OpenAPI enum calls 'Oura Sleep Staging Algorithms' v1/v2). Comparability: RMSSD vs SDNN "
   "NOT_COMPARABLE; Oura vs either UNKNOWN."),
 'citation': ("https://www.whoop.com/us/en/thelocker/2026-whats-new · WHOOP, What's new on WHOOP (2026) · 2026-10-08; https://www.community.whoop.com/t/mg-firmware-50-30-3-0/1502 · "
   "WHOOP Community, MG firmware 50.30.3.0 · 2026-10-08; https://developer.whoop.com/api · WHOOP API reference · 2026-10-08; https://api.prod.whoop.com/developer/doc/openapi.json · WHOOP API OpenAPI document · 2026-10-08; "
   "https://cloud.ouraring.com/v2/static/json/openapi-1.41.json · Oura API Documentation 2.0 (OpenAPI) · 2026-10-08; "
   "https://developer.apple.com/tutorials/data/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn.json · Apple HealthKit heartRateVariabilitySDNN · 2026-10-08"),
 'snapshots': [
  {'ref': 'snap-whoop-new', 'url': 'https://www.whoop.com/us/en/thelocker/2026-whats-new', 'title': "WHOOP - What's new on WHOOP (2026 changelog)", 'file': 'whoop-2026-whats-new.md',
   'basis': 'text', 'offsetBasis': MD, 'digest': 'd8e63d826d82836051f7884fe06adacb54203dc93a3fe34ae74666b9c29fc7ee', 'researchDigest': 'd8e63d826d82836051f7884fe06adacb54203dc93a3fe34ae74666b9c29fc7ee',
   'sourceKind': 'WEB_PAGE', 'genre': 'VENDOR_CHANGELOG', 'retrievedAt': '2026-10-08T17:40:00-04:00', 'mime': 'text/markdown', 'tool': FC + ' (found with Tavily CLI search in the research stage)'},
  {'ref': 'snap-whoop-forum', 'url': 'https://www.community.whoop.com/t/mg-firmware-50-30-3-0/1502', 'title': 'WHOOP Community - MG firmware 50.30.3.0 (forum thread)', 'file': 'whoop-community-fw.md',
   'basis': 'text', 'offsetBasis': MD, 'digest': '783ada6e54476eb9574e1af3a16f05b8f6329eb158ef86a8aae91c33e7c95499', 'researchDigest': '236deaf0694793d8da4ec2ef555d2f11521dfc0418f6667c101d1a032afdb7ce',
   'sourceKind': 'WEB_PAGE', 'genre': 'COMMUNITY_FORUM_POST', 'retrievedAt': '2026-10-08T17:41:00-04:00', 'mime': 'text/markdown', 'tool': FC},
  {'ref': 'snap-whoop-api', 'url': 'https://developer.whoop.com/api', 'title': 'WHOOP Developer - API reference', 'file': 'whoop-api.md',
   'basis': 'text', 'offsetBasis': MD, 'digest': 'ad0a088611cfa9022f17196af320d683db1b372f94c93dbd4c8c61d8969ab4aa', 'researchDigest': 'ad0a088611cfa9022f17196af320d683db1b372f94c93dbd4c8c61d8969ab4aa',
   'sourceKind': 'WEB_PAGE', 'genre': 'API_DOCUMENTATION', 'retrievedAt': '2026-10-08T17:40:00-04:00', 'mime': 'text/markdown', 'tool': FC},
  {'ref': 'snap-whoop-openapi', 'url': 'https://api.prod.whoop.com/developer/doc/openapi.json', 'title': 'WHOOP API - OpenAPI document (openapi.json, info.title "WHOOP API")',
   'file': 'whoop-openapi-a3.json', 'basis': 'json', 'digest': 'b40986e62c85067188fa01b23cbb3d5eec67c0f424b8b9d7c9e8b5bacee99892',
   'sourceKind': 'API', 'genre': 'API_DOCUMENTATION', 'retrievedAt': '2026-10-08T21:55:26-04:00', 'mime': 'application/json', 'tool': 'curl 8.2.1 (no auth)',
   'note': ('added in the adversarial-review pass. Not byte-stable: two other fetches the same evening returned sha256 d9c6147d... (same 77,417 bytes, same JSON value, '
            'different property order), so the JSON_POINTER locator is the stable reference, not the byte digest')},
  {'ref': 'snap-oura-openapi', 'url': 'https://cloud.ouraring.com/v2/static/json/openapi-1.41.json', 'title': 'Oura API Documentation 2.0 - OpenAPI document openapi-1.41.json',
   'file': 'oura-openapi-1.41.json', 'basis': 'json', 'digest': '2f960162d81034e80d3028af7dcadf56469100730c2aefaed869656f5db8486e', 'researchDigest': '2f960162d81034e80d3028af7dcadf56469100730c2aefaed869656f5db8486e',
   'sourceKind': 'API', 'genre': 'API_DOCUMENTATION', 'retrievedAt': '2026-10-08T17:39:00-04:00', 'mime': 'application/json', 'tool': 'curl (file name discovered from cloud.ouraring.com/v2/docs)'},
  {'ref': 'snap-apple-hk', 'url': 'https://developer.apple.com/tutorials/data/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn.json',
   'title': 'Apple Developer Documentation - HKQuantityTypeIdentifier.heartRateVariabilitySDNN (documentation JSON)', 'file': 'apple-hk-hrvsdnn.json', 'basis': 'json',
   'digest': '09d39d661cdb3262e6d91f76581a5d6b1e6ba926f241e9247d6271d1f11631a1', 'researchDigest': '09d39d661cdb3262e6d91f76581a5d6b1e6ba926f241e9247d6271d1f11631a1',
   'sourceKind': 'API', 'genre': 'API_DOCUMENTATION', 'retrievedAt': '2026-10-08T17:39:00-04:00', 'mime': 'application/json', 'tool': 'curl (Apple documentation JSON endpoint; the HTML page is JS-rendered)'},
 ],
 'locators': [
  {'ref': 'w1-feb-date', 'snap': 'snap-whoop-new', 'quote': '_February 25_', 'section': 'Heart rate accuracy, improved'},
  {'ref': 'w1-feb', 'snap': 'snap-whoop-new', 'quote': 'A new signal processing algorithm improves heart rate tracking across a range of conditions.', 'section': 'Heart rate accuracy, improved (February 25)'},
  {'ref': 'w1-feb-downstream', 'snap': 'snap-whoop-new', 'quote': 'You won’t see a new screen or feature, but the data behind your Recovery, Strain, and Sleep is more precise.'},
  {'ref': 'w2-jul-date', 'snap': 'snap-whoop-new', 'quote': '_July 6_', 'section': 'More accurate heart rate where it’s hardest to measure'},
  {'ref': 'w2-jul', 'snap': 'snap-whoop-new', 'quote': 'WHOOP has a new heart rate algorithm that improves accuracy across activities, with the biggest gains in weightlifting, functional fitness, HIIT, cycling, and golf.', 'section': 'July 6'},
  {'ref': 'w3-strain', 'snap': 'snap-whoop-new', 'quote': 'Because Strain is calculated from heart rate, some members may notice their Strain shift as the underlying heart rate data gets more accurate.', 'section': 'July 6'},
  {'ref': 'w4-automatic', 'snap': 'snap-whoop-new', 'quote': 'This happens automatically. No action needed.', 'section': 'July 6'},
  {'ref': 'c1-firmware', 'snap': 'snap-whoop-forum', 'quote': 'My MG just took a firmware update to 50.30.3.0 but I can not see what is fixed or addressed in the update.', 'section': 'first post'},
  {'ref': 'c2-post-date', 'snap': 'snap-whoop-forum', 'quote': 'on May 20, 2025', 'prefixChars': 0, 'section': 'first post heading (prefix context omitted so no member handle is stored)'},
  {'ref': 'wa-rmssd', 'snap': 'snap-whoop-api', 'quote': '"hrv_rmssd_milli": 31.813562', 'section': 'Recovery example response'},
  {'ref': 'wa-openapi-rmssd', 'snap': 'snap-whoop-openapi', 'pointer': '/components/schemas/RecoveryScore/properties/hrv_rmssd_milli/description',
   'quote': "The user's Heart Rate Variability measured using Root Mean Square of Successive Differences (RMSSD), in milliseconds."},
  {'ref': 'wa-scope', 'snap': 'snap-whoop-api', 'quote': 'Read Recovery data, including score, heart rate variability, and resting heart rate.', 'section': 'OAuth scopes (read:recovery)'},
  {'ref': 'o1-avg-hrv', 'snap': 'snap-oura-openapi', 'pointer': '/components/schemas/PublicModifiedSleepModel/properties/average_hrv/description', 'quote': 'Average heart rate variability during sleep.'},
  {'ref': 'o2-version-field', 'snap': 'snap-oura-openapi', 'pointer': '/components/schemas/PublicModifiedSleepModel/properties/sleep_algorithm_version/description', 'quote': 'Version of the sleep algorithm used to calculate the sleep data.'},
  {'ref': 'o3-v1', 'snap': 'snap-oura-openapi', 'pointer': '/components/schemas/PublicSleepAlgorithmVersion/description', 'quote': 'v1 = original aka legacy aka OSSA 1.0,'},
  {'ref': 'o4-v2', 'snap': 'snap-oura-openapi', 'pointer': '/components/schemas/PublicSleepAlgorithmVersion/description', 'quote': 'v2 = latest sleep algorithm'},
  {'ref': 'o5-staging', 'snap': 'snap-oura-openapi', 'pointer': '/components/schemas/PublicSleepAlgorithmVersion/description', 'quote': 'Oura Sleep Staging Algorithms.'},
  {'ref': 'a1-sdnn', 'snap': 'snap-apple-hk', 'quote': 'HealthKit uses SDNN heart rate variability, which uses the standard deviation of the inter-beat (RR) intervals between normal heartbeats (typically measured in milliseconds).'},
  {'ref': 'a2-watch', 'snap': 'snap-apple-hk', 'quote': 'The system automatically records samples on Apple Watch.'},
 ],
 'entities': [
  {'ref': 'device-whoop-mg', 'type': 'Device', 'module': 'D4', 'uid': 'hu:device:whoop-mg', 'name': 'WHOOP MG', 'props': {'deviceKind': 'WEARABLE_WRIST', 'sensingModalities': ['PPG'], 'deviceFamily': 'WHOOP', 'generationLabel': 'MG', 'makerName': 'WHOOP'}, 'onMatch': 'use_existing',
   'note': 'deviceKind and PPG modality are curator mappings (WHOOP measures heart rate optically; captured in the research-stage WHOOP Locker article)'},
  {'ref': 'device-apple-watch', 'type': 'Device', 'module': 'D4', 'uid': 'hu:device:apple-watch', 'name': 'Apple Watch (model not stated)', 'props': {'deviceKind': 'WEARABLE_WRIST', 'deviceFamily': 'Apple Watch', 'makerName': 'Apple'}, 'onMatch': 'use_existing'},
  av('av-whoop-hr-2026-02-25', 'hu:algorithm-version:whoop-heart-rate-change-2026-02-25', 'WHOOP heart-rate signal processing, change of 2026-02-25 (unlabeled)', 'WHOOP heart rate', 'whoop-heart-rate',
     'SIGNAL_PROCESSING', 'DEVICE_SOFTWARE', 'CHANGE_EVENT_UNLABELED', 'FEATURE_MEASURE', versionPinnedAt='2026-02-25', componentLabel='heart rate', notReported=['VERSION_LABEL']),
  av('av-whoop-hr-2026-07-06', 'hu:algorithm-version:whoop-heart-rate-change-2026-07-06', 'WHOOP heart-rate algorithm, change of 2026-07-06 (unlabeled)', 'WHOOP heart rate', 'whoop-heart-rate',
     'SIGNAL_PROCESSING', 'DEVICE_SOFTWARE', 'CHANGE_EVENT_UNLABELED', 'FEATURE_MEASURE', versionPinnedAt='2026-07-06', componentLabel='heart rate', notReported=['VERSION_LABEL']),
  av('av-whoop-fw-50-30-3-0', 'hu:algorithm-version:whoop-mg-firmware-50.30.3.0', 'WHOOP MG firmware 50.30.3.0', 'WHOOP MG firmware', 'whoop-mg-firmware', 'FIRMWARE', 'DEVICE_SOFTWARE',
     'VENDOR_VERSION_STRING', None, versionLabel='50.30.3.0', componentLabel='firmware'),
  av('av-whoop-recovery-api', 'hu:algorithm-version:whoop-recovery-api-unversioned', 'WHOOP Recovery as served by the WHOOP API (unversioned endpoint)', 'WHOOP Recovery', 'whoop-recovery',
     'WEARABLE_SCORE', 'SERVICE_ENDPOINT', 'SERVICE_ENDPOINT_UNVERSIONED', 'FEATURE_MEASURE', notReported=['VERSION_LABEL']),
  av('av-oura-sleep-v2', 'hu:algorithm-version:oura-sleep-algorithm-v2', 'Oura Sleep Staging Algorithm v2 (OpenAPI enum: "v2 = latest sleep algorithm")', 'Oura Sleep Staging Algorithms', 'oura-sleep', 'WEARABLE_SCORE', 'SERVICE_ENDPOINT', 'VENDOR_VERSION_STRING',
     'FEATURE_MEASURE', versionLabel='v2', componentLabel='sleep staging (as the OpenAPI enum names it)'),
  av('av-apple-hrv-sdnn', 'hu:algorithm-version:apple-healthkit-hrv-sdnn-unversioned', 'Apple Watch / HealthKit HRV (SDNN) computation (version not stated)', 'Apple HRV SDNN', 'apple-hrv-sdnn',
     'SIGNAL_PROCESSING', 'DEVICE_SOFTWARE', 'UNKNOWN', 'FEATURE_MEASURE', notReported=['VERSION_LABEL']),
  {'ref': 'metric-whoop-hr', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:whoop-heart-rate', 'name': 'WHOOP heart rate', 'props': {'metricKind': 'DEVICE_ESTIMATE', 'defaultResultKind': 'INFERRED', 'definitionSource': 'VENDOR', 'definitionIssuerName': 'WHOOP', 'notReported': ['UNIT']}, 'onMatch': 'review'},
  {'ref': 'metric-whoop-hrv-rmssd', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:whoop-hrv-rmssd-milli', 'name': 'WHOOP hrv_rmssd_milli (HRV, RMSSD, ms)',
   'props': {'metricKind': 'DEVICE_ESTIMATE', 'defaultResultKind': 'CALCULATED', 'definitionSource': 'VENDOR', 'definitionIssuerName': 'WHOOP', 'methodText': 'RMSSD (Root Mean Square of Successive Differences), per WHOOP OpenAPI', 'definitionText': "The user's Heart Rate Variability measured using Root Mean Square of Successive Differences (RMSSD), in milliseconds.", 'canonicalUnitCode': 'ms', 'searchText': 'HRV heart rate variability RMSSD WHOOP recovery'}, 'onMatch': 'review'},
  {'ref': 'metric-oura-average-hrv', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:oura-sleep-average-hrv', 'name': 'Oura average_hrv (average HRV during sleep)',
   'props': {'metricKind': 'DEVICE_ESTIMATE', 'defaultResultKind': 'CALCULATED', 'definitionSource': 'VENDOR', 'definitionIssuerName': 'Oura', 'definitionText': 'Average heart rate variability during sleep.', 'timeAspect': 'sleep period',
             'notReported': ['METRIC_METHOD', 'UNIT'], 'searchText': 'HRV heart rate variability Oura sleep average'}, 'onMatch': 'review'},
  {'ref': 'metric-apple-hrv-sdnn', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:apple-heartratevariabilitysdnn', 'name': 'Apple HealthKit heartRateVariabilitySDNN (HRV, SDNN, ms)',
   'props': {'metricKind': 'DEVICE_ESTIMATE', 'defaultResultKind': 'CALCULATED', 'definitionSource': 'VENDOR', 'definitionIssuerName': 'Apple', 'methodText': 'SDNN of normal RR intervals', 'canonicalUnitCode': 'ms', 'searchText': 'HRV heart rate variability SDNN Apple Watch HealthKit'}, 'onMatch': 'review'},
  {'ref': 'org-whoop', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:whoop', 'name': 'WHOOP', 'onMatch': 'use_existing'},
  {'ref': 'org-oura', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:oura', 'name': 'Oura', 'onMatch': 'use_existing'},
  {'ref': 'org-apple', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:apple', 'name': 'Apple', 'onMatch': 'use_existing'},
  {'ref': 'person-forum-member', 'type': 'Person', 'module': 'D7', 'uid': 'hu:person:whoop-community-thread-1502-op', 'name': 'WHOOP Community forum member (original poster, thread 1502; handle not stored)', 'onMatch': 'review'},
  {'ref': 'agent-curation', 'type': 'Agent', 'module': 'K', 'uid': 'hu:agent:bks-curation-d4', 'name': 'BellLabs D4 curation agent', 'props': {'agentKind': 'AUTOMATED_AGENT'}, 'onMatch': 'use_existing'},
 ],
 'assertions': [
  {'id': 'f01', 'edgeClass': 'asserted', 'predicate': 'RUNS_ON_DEVICE', 'assertionKind': 'RELATIONSHIP', 'subject': HR1, 'object': MG, 'asserter': CUR, 'locators': ['w1-feb', 'w1-feb-date'],
   'speechAct': 'STATES', 'basisKind': 'CALCULATED',
   'validTime': {'validFrom': '2026-02-25T00:00:00Z', 'validFromPrecision': 'DAY', 'validFromBasis': 'STATED_BY_SOURCE', 'validTo': '2026-07-06T00:00:00Z', 'validToPrecision': 'DAY', 'validToBasis': 'INFERRED'},
   'derivationRule': ('curator inference: the changelog addresses WHOOP members and names no hardware model; the episode is attached to WHOOP MG as one current WHOOP model '
                      '(device attachment INFERRED, not stated); closed by the next heart-rate change (f02). A secondary review (the5krunner, 2026-02-28, 01-ecosystem S43) '
                      'captions an image "WHOOP 5.0 and MG wearables - February 2026 heart rate algorithm accuracy update"; it is not used as evidence'),
   'qualifiers': ['change date stated by WHOOP (2026 changelog, "February 25"); year from the page (2026 changelog)', 'device model not named by the vendor',
                  'basis per part: change date STATED_BY_SOURCE; device attachment INFERRED (curator)']},
  {'id': 'f02', 'edgeClass': 'asserted', 'predicate': 'RUNS_ON_DEVICE', 'assertionKind': 'RELATIONSHIP', 'subject': HR2, 'object': MG, 'asserter': CUR, 'locators': ['w2-jul', 'w2-jul-date', 'w4-automatic'],
   'speechAct': 'STATES', 'basisKind': 'CALCULATED', 'validTime': {'validFrom': '2026-07-06T00:00:00Z', 'validFromPrecision': 'DAY', 'validFromBasis': 'STATED_BY_SOURCE'},
   'derivationRule': 'as f01 (device attachment INFERRED by the curator; the July 6 entry names no hardware model); open episode as of 2026-10-08',
   'qualifiers': ['basis per part: change date STATED_BY_SOURCE; device attachment INFERRED (curator)']},
  {'id': 'f03', 'edgeClass': 'asserted', 'predicate': 'RUNS_ON_DEVICE', 'assertionKind': 'RELATIONSHIP', 'subject': FW, 'object': MG, 'asserter': FM, 'locators': ['c1-firmware', 'c2-post-date'],
   'speechAct': 'REPORTS_PRACTICE', 'polarity': 'POSITIVE', 'basisKind': 'PERSONAL_EXPERIENCE', 'validTime': {'validFrom': '2025-05-20T00:00:00Z', 'validFromPrecision': 'DAY', 'validFromBasis': 'STATED_BY_SOURCE'},
   'qualifiers': ['community-reported; no vendor release note found', 'date = date of the first post ("on May 20, 2025"); the update happened on or before it', 'source authority to be weighed by a SOURCE_AUTHORITY assessment (11-open-questions #18)']},
  {'id': 'f04', 'edgeClass': 'structural', 'predicate': 'OUTPUTS_METRIC', 'subject': HR1, 'object': MHR, 'asserter': WH, 'locators': ['w1-feb']},
  {'id': 'f05', 'edgeClass': 'structural', 'predicate': 'OUTPUTS_METRIC', 'subject': HR2, 'object': MHR, 'asserter': WH, 'locators': ['w2-jul']},
  {'id': 'f06', 'edgeClass': 'structural', 'predicate': 'OUTPUTS_METRIC', 'subject': REC, 'object': MRM, 'asserter': WH, 'locators': ['wa-openapi-rmssd', 'wa-rmssd', 'wa-scope']},
  {'id': 'f07', 'edgeClass': 'structural', 'predicate': 'OUTPUTS_METRIC', 'subject': OSL, 'object': MOU, 'asserter': CUR, 'locators': ['o1-avg-hrv', 'o2-version-field', 'o5-staging', 'o4-v2'],
   'rationale': ('curator inference: Oura says sleep_algorithm_version is the "Version of the sleep algorithm used to calculate the sleep data" and average_hrv is a field of the '
                 'same sleep record, while the enum calls v1/v2 "Oura Sleep Staging Algorithms"; that the staging algorithm produces average_hrv is inferred. The version is per '
                 'record (v1 or v2): a v1 record links to a v1 AlgorithmVersion, never to this one.')},
  {'id': 'f08', 'edgeClass': 'structural', 'predicate': 'OUTPUTS_METRIC', 'subject': AHR, 'object': MAP, 'asserter': AP, 'locators': ['a1-sdnn']},
  {'id': 'f09', 'edgeClass': 'asserted', 'predicate': 'RUNS_ON_DEVICE', 'assertionKind': 'RELATIONSHIP', 'subject': AHR, 'object': AW, 'asserter': AP, 'locators': ['a2-watch', 'a1-sdnn'],
   'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS},
  {'id': 'f10', 'edgeClass': 'literal', 'predicate': 'DEFINITION_CHANGED', 'assertionKind': 'FIELD', 'subject': MHR, 'value': {'valueString': '2026-07-06: new heart rate algorithm; downstream Strain may shift'},
   'asserter': WH, 'locators': ['w2-jul-date', 'w3-strain'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM',
   'validTime': {'validFrom': '2026-07-06T00:00:00Z', 'validFromPrecision': 'DAY', 'validFromBasis': 'STATED_BY_SOURCE'},
   'note': 'predicate-only (05 predicateOnly: DEFINITION_CHANGED); the episode boundary itself is f01/f02'},
  {'id': 'f11', 'edgeClass': 'literal', 'predicate': 'FIELD_NOT_REPORTED', 'assertionKind': 'FIELD', 'subject': MOU, 'value': {'valueString': 'METRIC_METHOD, UNIT'},
   'asserter': CUR, 'locators': ['o1-avg-hrv'], 'speechAct': 'STATES', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': OBS},
 ],
 'assessments': [
  {'id': 's01', 'assessmentKind': 'COMPARABILITY', 'assessmentSubkind': 'D4.comparability', 'conclusionCode': 'NOT_COMPARABLE', 'status': 'PROPOSED', 'methodVersion': 'd4-comparability/0.1 (fixture)',
   'about': ['hu:metric:whoop-hrv-rmssd-milli', 'hu:metric:apple-heartratevariabilitysdnn'],
   'differingDimensions': ['method: RMSSD vs SDNN', 'aggregation window: not stated by either source'], 'inputAssertions': ['f06', 'f08'],
   'evidence': [{'locator': 'wa-openapi-rmssd', 'role': 'SUPPORTS'}, {'locator': 'a1-sdnn', 'role': 'SUPPORTS'}, {'locator': 'wa-rmssd', 'role': 'CONTEXT'}],
   'summary': 'Both are sold as "HRV" in milliseconds but are different statistics of RR intervals; values are not interchangeable and no conversion is published.', 'questions': ['Q-D4-07']},
  {'id': 's02', 'assessmentKind': 'COMPARABILITY', 'assessmentSubkind': 'D4.comparability', 'conclusionCode': 'UNKNOWN', 'status': 'PROPOSED', 'methodVersion': 'd4-comparability/0.1 (fixture)',
   'about': ['hu:metric:oura-sleep-average-hrv', 'hu:metric:whoop-hrv-rmssd-milli', 'hu:metric:apple-heartratevariabilitysdnn'],
   'differingDimensions': ['Oura method and unit not stated in the OpenAPI document'], 'inputAssertions': ['f07', 'f11'],
   'evidence': [{'locator': 'o1-avg-hrv', 'role': 'CONTEXT'}], 'summary': 'Oura average_hrv cannot be placed against RMSSD or SDNN from the published API definition.', 'questions': ['Q-D4-07']},
 ],
 'intentNotes': ('Fixture intent (fixture ids). RUNS_ON_DEVICE f01/f02: date stated by WHOOP, device attachment a curator inference (intent v1 has one basisKind per assertion). Episode bounds (validFrom/validTo with precision and basis) ride on edge.assert validity. The forum asserter is a Person '
                 'subject with onMatch review (handle deliberately not stored). Assessments s01/s02 are outside intent v1.'),
}

FX['questionsMd'] = """# Fixture wearable-hrv-algorithm-changes - questions answered

Kind: other (version-as-of and definition change; the harm angle is a silent trend break).

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| CQ-DX-09 | WHOOP heart rate on date D: before 2026-02-25 -> earlier state (unknown); 2026-02-25 to 2026-07-06 -> `whoop-heart-rate-change-2026-02-25`; from 2026-07-06 -> `whoop-heart-rate-change-2026-07-06` (both CHANGE_EVENT_UNLABELED: no version label). Dates are WHOOP's; the attachment to the WHOOP MG model is a curator inference (WHOOP names no hardware). Firmware 50.30.3.0 on WHOOP MG on or before May 20, 2025 is known only from a forum post (asserter = forum member). | f01, f02, f03; w1-feb-date, w2-jul-date, c1-firmware, c2-post-date |
| Q-D4-23 | Split any WHOOP heart-rate/Strain trend at 2026-02-25 and 2026-07-06; WHOOP says Strain may shift after the July change; no action or label is shown to the user. | f01, f02, f10; w3-strain, w4-automatic |
| Q-D4-07 | "HRV": WHOOP hrv_rmssd_milli = RMSSD in milliseconds (WHOOP OpenAPI description); Apple heartRateVariabilitySDNN = SDNN (ms); Oura average_hrv = average HRV during sleep, method/unit not stated -> RMSSD vs SDNN **NOT_COMPARABLE**; Oura vs either **UNKNOWN**. | s01, s02; f06, f07, f08; wa-openapi-rmssd, a1-sdnn |
| CQ-DX-02 | All four values are device outputs of AlgorithmVersions (OUTPUTS_METRIC), never lab-measured; Oura reports the version of its "Sleep Staging Algorithms" per record (v1 = OSSA 1.0, v2 = latest; that it also produces average_hrv is a curator inference), WHOOP's API endpoint is unversioned. | f04-f08; o2-version-field, o3-v1, o4-v2, o5-staging |
| Q-D4-17 | For a sleep/recovery target, the HRV metrics reachable from devices are three different Metrics; a target operationalized by "HRV" must name which one. | s01, s02 |
"""

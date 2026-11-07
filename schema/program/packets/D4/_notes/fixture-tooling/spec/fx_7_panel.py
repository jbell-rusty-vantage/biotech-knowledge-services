LC = {'ref': 'org-labcorp', 'type': 'Organization'}
IT = {'ref': 'org-insidetracker', 'type': 'Organization'}
CUR = {'ref': 'agent-curation', 'type': 'Agent'}
PANEL = {'ref': 'labtest-labcorp-005009', 'type': 'LabTest'}
AVI = {'ref': 'av-innerage-2', 'type': 'AlgorithmVersion'}
MIA = {'ref': 'metric-innerage', 'type': 'Metric'}
LTI = {'ref': 'labtest-innerage', 'type': 'LabTest'}
PRI = {'ref': 'product-innerage', 'type': 'Product'}
OBS = {'validFrom': None, 'validFromBasis': 'OBSERVATION_ONLY', 'statedAsOf': '2026-10-08T17:43:00-04:00', 'statedAsOfPrecision': 'INSTANT'}
MD = 'Unicode code points of the UTF-8 Firecrawl markdown capture'
FC = 'Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0'
ROW = '| 005009 | CBC With Differential/Platelet | 57021-8 | {code} | {name} | {uom} | {loinc} |'
# component: (key, result code, result name, UofM, LOINC, metric name)
COMP = [('rdw', '105007', 'RDW', '%', '788-0', 'Erythrocyte distribution width (RDW), Labcorp result 105007'),
        ('mch', '015073', 'MCH', 'pg', '785-6', 'Mean corpuscular hemoglobin (MCH), Labcorp result 015073'),
        ('mchc', '015081', 'MCHC', 'g/dL', '786-4', 'Mean corpuscular hemoglobin concentration (MCHC), Labcorp result 015081'),
        ('lymph-pct', '015123', 'Lymphs', '%', '736-9', 'Lymphocytes percent of leukocytes, Labcorp result 015123'),
        ('lymph-abs', '015917', 'Lymphs (Absolute)', 'x10E3/uL', '731-0', 'Lymphocytes absolute count, Labcorp result 015917'),
        ('rbc', '005033', 'RBC', 'x10E6/uL', '789-8', 'Erythrocytes count (RBC), Labcorp result 005033'),
        ('hct', '005058', 'Hematocrit', '%', '4544-3', 'Hematocrit, Labcorp result 005058')]
# InnerAge inputs: (key, label quote, name, matching component key or None)
INP = [('glucose', '**Glucose:**', 'InnerAge input: Glucose', None),
       ('hba1c', '**Hemoglobin A1c** (HbA1c):', 'InnerAge input: Hemoglobin A1c', None),
       ('rdw', '**Red cell distribution width (RDW) (females only):**', 'InnerAge input: RDW (females)', 'rdw'),
       ('mch', '**Mean corpuscular hemoglobin (MCH) (males only):**', 'InnerAge input: MCH (males)', 'mch'),
       ('mchc', '**Mean corpuscular hemoglobin concentration (MCHC) (males only):**', 'InnerAge input: MCHC (males)', 'mchc'),
       ('lymph-pct', '**Lymphocytes (percent of WBC for men, count for women):**', 'InnerAge input: Lymphocytes percent of WBC (males)', 'lymph-pct'),
       ('lymph-abs', '**Lymphocytes (percent of WBC for men, count for women):**', 'InnerAge input: Lymphocyte count (females)', 'lymph-abs'),
       ('rbc', '**Red blood cell count (RBC) (males only):**', 'InnerAge input: RBC count (males)', 'rbc'),
       ('hct', '**Hematocrit (HCT) (males only):**', 'InnerAge input: Hematocrit (males)', 'hct')]

locs = [
  {'ref': 'p0-title', 'snap': 'snap-labcorp-cbc', 'quote': 'Complete Blood Count (CBC) With Differential, Reflex to Peripheral Smear Review', 'section': 'page title'},
  {'ref': 'p1-method', 'snap': 'snap-labcorp-cbc', 'quote': 'Automated cell counter with mixed technologies', 'section': 'Methodology'},
] + [{'ref': f'p-{k}', 'snap': 'snap-labcorp-cbc', 'quote': ROW.format(code=c, name=n, uom=u, loinc=l), 'section': 'LOINC® Map'} for (k, c, n, u, l, _) in COMP] + [
  {'ref': 'ia-calc', 'snap': 'snap-it-blog', 'quote': 'InnerAge calculates your biological age—or how old you are internally—based on key biomarkers'},
  {'ref': 'ia-count', 'snap': 'snap-it-blog', 'quote': 'So the InnerAge 2.0 calculation analyzes 17 biomarkers for males and 13 biomarkers for females'},
  {'ref': 'ia-evolve', 'snap': 'snap-it-blog', 'quote': 'And as the data evolve, so may the inputs to the InnerAge algorithm.'},
  {'ref': 'ia-training', 'snap': 'snap-it-blog', 'quote': 'Based on scientific research and InsideTracker’s internal customer database, InsideTracker data scientists identified a group of biomarkers most correlated with aging'},
  {'ref': 'ia-years', 'snap': 'snap-it-blog', 'quote': 'Your biomarker levels then individually add or subtract years to your chronological age depending on how far they deviate from the aging trend line to estimate your biological age.'},
] + [{'ref': f'ii-{k}', 'snap': 'snap-it-blog', 'quote': q, 'section': 'What blood biomarkers does InnerAge 2.0 measure?'} for (k, q, _, _) in INP if k != 'lymph-abs'] + [
  {'ref': 'st-price', 'snap': 'snap-it-store', 'quote': '$249', 'section': 'price block'},
  {'ref': 'st-analyzes', 'snap': 'snap-it-store', 'quote': 'InnerAge 2.0 analyzes 17 biomarkers for men and 13 for women to allow us to calculate your biological age (aka your InnerAge).'},
  {'ref': 'st-retest', 'snap': 'snap-it-store', 'quote': 'Retest in 3-6 months to track how you’re aging on the inside.'},
  {'ref': 'ul-image-list', 'snap': 'snap-it-ultimate', 'quote': '![BM List]', 'note': 'the Ultimate panel biomarker list is published only as an image (alt text "BM List"); no text list of component tests'},
]

ents = [
  {'ref': 'labtest-labcorp-005009', 'type': 'LabTest', 'module': 'D4', 'uid': 'hu:lab-test:labcorp-005009', 'name': 'Labcorp Complete Blood Count (CBC) With Differential, Reflex to Peripheral Smear Review (005009)',
   'props': {'testKind': 'PANEL', 'collectionModes': ['VENIPUNCTURE']}, 'identifiers': [{'scheme': 'LAB_TEST_CODE', 'issuer': 'Labcorp', 'value': '005009'}, {'scheme': 'LOINC', 'issuer': 'Regenstrief Institute', 'value': '57021-8'}], 'onMatch': 'use_existing',
   'note': 'order LOINC 57021-8 identifies the panel order (Labcorp LOINC map)'},
] + [{'ref': f'labtest-labcorp-{k}', 'type': 'LabTest', 'module': 'D4', 'uid': f'hu:lab-test:labcorp-result-{c}', 'name': f'Labcorp {n} (result code {c}, component of 005009)',
      'props': {'testKind': 'SINGLE'}, 'identifiers': [{'scheme': 'LAB_TEST_CODE', 'issuer': 'Labcorp (result code)', 'value': c}], 'onMatch': 'use_existing'} for (k, c, n, u, l, _) in COMP] + [
     {'ref': f'metric-loinc-{l}', 'type': 'Metric', 'module': 'D4', 'uid': f'hu:metric:loinc-{l}', 'name': mn,
      'props': {'metricKind': 'MEASURAND', 'defaultResultKind': 'MEASURED', 'definitionSource': 'LOINC', 'definitionIssuerName': 'LOINC (Regenstrief Institute)', 'systemText': 'Bld', 'scale': 'QUANTITATIVE'},
      'identifiers': [{'scheme': 'LOINC', 'issuer': 'Regenstrief Institute', 'value': l}], 'onMatch': 'use_existing'} for (k, c, n, u, l, mn) in COMP] + [
     {'ref': f'metric-it-{k}', 'type': 'Metric', 'module': 'D4', 'uid': f'hu:metric:insidetracker-innerage-input-{k}', 'name': nm,
      'props': {'metricKind': 'MODEL_FEATURE', 'defaultResultKind': 'MEASURED', 'definitionSource': 'VENDOR', 'definitionIssuerName': 'InsideTracker', 'notReported': ['UNIT', 'METRIC_METHOD', 'MEASURAND_SYSTEM']}, 'onMatch': 'review'}
     for (k, q, nm, _) in INP] + [
  {'ref': 'av-innerage-2', 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': 'hu:algorithm-version:insidetracker-innerage-2.0', 'name': 'InsideTracker InnerAge 2.0',
   'props': {'algorithmFamily': 'InnerAge', 'familyKey': 'innerage', 'algorithmKind': 'BLOOD_CHEMISTRY_CLOCK', 'realization': 'VENDOR_IMPLEMENTATION', 'versionLabel': '2.0', 'versionBasis': 'VENDOR_VERSION_STRING',
             'outputKind': 'AGE_ESTIMATE', 'trainingPopulationText': 'scientific research and InsideTracker internal customer database (as stated)', 'notReported': ['RELIABILITY', 'INPUT_FEATURES']}, 'onMatch': 'use_existing',
   'note': 'INPUT_FEATURES in notReported: the full 17/13 input list is not enumerated per sex in one place; the blog lists inputs with sex qualifiers (9 sampled here)'},
  {'ref': 'metric-innerage', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:insidetracker-innerage-years', 'name': 'InnerAge (biological age estimate, years)',
   'props': {'metricKind': 'ALGORITHM_OUTPUT', 'defaultResultKind': 'INFERRED', 'definitionSource': 'VENDOR', 'definitionIssuerName': 'InsideTracker', 'canonicalUnitCode': 'a', 'searchText': 'InnerAge biological age InsideTracker'}, 'onMatch': 'review'},
  {'ref': 'labtest-innerage', 'type': 'LabTest', 'module': 'D4', 'uid': 'hu:lab-test:insidetracker-innerage-2.0', 'name': 'InsideTracker InnerAge 2.0 (blood test + analysis)',
   'props': {'testKind': 'ALGORITHM_REPORT', 'orderChannel': 'DIRECT_TO_CONSUMER', 'collectionModes': ['VENIPUNCTURE'], 'notReported': ['PERFORMING_LAB']}, 'onMatch': 'use_existing'},
  {'ref': 'product-innerage', 'type': 'Product', 'module': 'D6', 'uid': 'hu:product:insidetracker-innerage-2.0', 'name': 'InnerAge 2.0 ($249, InsideTracker store)', 'onMatch': 'use_existing'},
  {'ref': 'org-labcorp', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:labcorp', 'name': 'Laboratory Corporation of America Holdings (Labcorp)', 'onMatch': 'use_existing'},
  {'ref': 'org-insidetracker', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:insidetracker', 'name': 'InsideTracker', 'onMatch': 'use_existing'},
  {'ref': 'agent-curation', 'type': 'Agent', 'module': 'K', 'uid': 'hu:agent:bks-curation-d4', 'name': 'BellLabs D4 curation agent', 'props': {'agentKind': 'AUTOMATED_AGENT'}, 'onMatch': 'use_existing'},
  {'ref': 'claim-innerage-retest-3-6-months', 'type': 'Claim', 'module': 'K', 'uid': 'hu:claim:innerage-retest-in-3-6-months-tracks-aging',
   'name': 'Retesting InnerAge in 3-6 months tracks how you are aging on the inside',
   'props': {'proposition': 'Retesting InnerAge 2.0 after 3-6 months lets a person track changes in their biological age.', 'claimType': 'RECOMMENDATION'},
   'onMatch': 'use_existing', 'note': 'added in the adversarial-review pass so the recommendation g28 is a kernel claim occurrence (OCCURRENCE_OF)'},
]

ass = []
n = 0
for i, (k, c, nm, u, l, _) in enumerate(COMP):
    n += 1
    ass.append({'id': f'g{n:02d}', 'edgeClass': 'asserted', 'predicate': 'INCLUDES_TEST', 'assertionKind': 'RELATIONSHIP', 'subject': PANEL, 'object': {'ref': f'labtest-labcorp-{k}', 'type': 'LabTest'},
                'asserter': LC, 'locators': [f'p-{k}'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS, 'orderIndex': i})
for (k, c, nm, u, l, _) in COMP:
    n += 1
    ass.append({'id': f'g{n:02d}', 'edgeClass': 'asserted', 'predicate': 'MEASURES_METRIC', 'assertionKind': 'RELATIONSHIP', 'subject': {'ref': f'labtest-labcorp-{k}', 'type': 'LabTest'},
                'object': {'ref': f'metric-loinc-{l}', 'type': 'Metric'}, 'asserter': LC, 'locators': [f'p-{k}'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS,
                'qualifiers': [f'unit as reported: {u}']})
for i, (k, q, nm, comp) in enumerate(INP):
    n += 1
    ass.append({'id': f'g{n:02d}', 'edgeClass': 'structural', 'predicate': 'REQUIRES_INPUT_METRIC', 'subject': AVI, 'object': {'ref': f'metric-it-{k}', 'type': 'Metric'}, 'asserter': IT,
                'locators': [f"ii-{'lymph-pct' if k == 'lymph-abs' else k}", 'ia-count'], 'orderIndex': i})
n += 1
ass.append({'id': f'g{n:02d}', 'edgeClass': 'structural', 'predicate': 'OUTPUTS_METRIC', 'subject': AVI, 'object': MIA, 'asserter': IT, 'locators': ['ia-calc', 'ia-years']})
n += 1
ass.append({'id': f'g{n:02d}', 'edgeClass': 'asserted', 'predicate': 'PERFORMED_WITH_VERSION', 'assertionKind': 'RELATIONSHIP', 'subject': LTI, 'object': AVI, 'objectField': 'LabTest.algorithmVersions', 'asserter': IT,
            'locators': ['st-analyzes'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS})
n += 1
ass.append({'id': f'g{n:02d}', 'edgeClass': 'asserted', 'predicate': 'DELIVERS', 'assertionKind': 'RELATIONSHIP', 'subject': PRI, 'object': LTI, 'objectField': 'LabTest.products (direction IN)', 'asserter': IT,
            'locators': ['st-price', 'st-analyzes'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS})
n += 1
ass.append({'id': f'g{n:02d}', 'edgeClass': 'literal', 'predicate': 'REPORTS_INPUT_SET', 'assertionKind': 'FIELD', 'subject': AVI, 'value': {'valueString': '17 inputs for males, 13 for females; inputs may change as data evolve'},
            'asserter': IT, 'locators': ['ia-count', 'ia-evolve', 'st-analyzes'], 'speechAct': 'STATES', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS,
            'note': 'not a single inputFeatureCount (sex-specific); "may change" -> a changed input set is a new AlgorithmVersion'})
n += 1
ass.append({'id': f'g{n:02d}', 'edgeClass': 'literal', 'predicate': 'RECOMMENDS_RETEST_INTERVAL', 'assertionKind': 'CLAIM', 'claimType': 'RECOMMENDATION', 'subject': LTI,
            'occurrenceOf': {'ref': 'claim-innerage-retest-3-6-months', 'type': 'Claim'}, 'value': {'valueString': 'P3M/P6M (3-6 months)'},
            'asserter': IT, 'locators': ['st-retest'], 'speechAct': 'RECOMMENDS', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS})

# One RESOLUTION Assessment per candidate pair (adversarial-review pass; was one assessment over 14 Metrics with a candidatePairs list).
# conclusionCode CANDIDATE = a single name-level candidate, unit/method/LOINC not stated by the vendor (registered in 09/10).
CAND = [(k, nm, [x[4] for x in COMP if x[0] == comp][0]) for (k, q, nm, comp) in INP if comp] + [('hba1c', 'InnerAge input: Hemoglobin A1c', '4548-4')]
RES = []
for i, (k, nm, l) in enumerate(CAND, 1):
    lab = 'lymph-pct' if k == 'lymph-abs' else k
    inp = [a['id'] for a in ass if a['predicate'] == 'REQUIRES_INPUT_METRIC' and a['object']['ref'] == f'metric-it-{k}']
    mm = [a['id'] for a in ass if a['predicate'] == 'MEASURES_METRIC' and a['object']['ref'] == f'metric-loinc-{l}']
    ev = [{'locator': f'ii-{lab}', 'role': 'CONTEXT'}] + ([{'locator': f'p-{k}', 'role': 'CONTEXT'}] if k != 'hba1c' else []) + [{'locator': 'ia-evolve', 'role': 'QUALIFIES'}]
    if k == 'hba1c':
        summ = ('Vendor input "Hemoglobin A1c" -> candidate LOINC 4548-4 (the Metric of ../hba1c-two-labs-interference) by exact analyte name; the vendor states no unit '
                '(NGSP % or IFCC mmol/mol), method or lab: CANDIDATE, not identity. Through this pair the HbF interference SAFETY_SIGNAL of that fixture (s02) reaches InnerAge 2.0 (Q-D4-26).')
        qs = ['Q-D4-22', 'Q-D4-26']
    elif k in ('lymph-pct', 'lymph-abs'):
        summ = (f'Vendor input line "Lymphocytes (percent of WBC for men, count for women)" -> {nm} -> candidate LOINC {l} by name; the same vendor line maps to a different '
                'Metric for the other sex; unit/method not stated: CANDIDATE, not identity.')
        qs = ['Q-D4-03', 'Q-D4-22']
    else:
        summ = f'{nm} -> candidate LOINC {l} (Labcorp 005009 component) by exact analyte name; the vendor states no unit, method or LOINC code: CANDIDATE, not identity.'
        qs = ['Q-D4-03', 'Q-D4-22']
    RES.append({'id': f's{i:02d}', 'assessmentKind': 'RESOLUTION', 'assessmentSubkind': 'D4.measurement-name-resolution', 'conclusionCode': 'CANDIDATE', 'status': 'PROPOSED',
                'methodVersion': 'd4-name-resolution/0.1 (fixture: exact analyte-name match)',
                'about': [f'hu:metric:insidetracker-innerage-input-{k}', f'hu:metric:loinc-{l}'], 'inputAssertions': inp + mm, 'evidence': ev,
                'summary': summ, 'questions': qs})

FX = {
 'id': 'consumer-panel-and-blood-clock', 'short': 'panel', 'kind': 'other',
 'candidate': 'new in the fixtures stage (InsideTracker InnerAge 2.0 blog + store page; Labcorp 005009 panel page captured 2026-10-08)',
 'description': ("A blood-chemistry clock and a panel that can feed it. InsideTracker InnerAge 2.0 (versionLabel '2.0', vendor implementation) states that it "
   "analyzes 17 biomarkers for males and 13 for females and that its inputs may change; nine sampled inputs are recorded as REQUIRES_INPUT_METRIC (vendor "
   "Metrics, unit and method not reported), its output as OUTPUTS_METRIC (InnerAge, years), the DTC test that runs it as PERFORMED_WITH_VERSION and the $249 "
   "store item as DELIVERS. No InsideTracker page lists its panel's component tests as text (the Ultimate biomarker list is an image), so INCLUDES_TEST is "
   "exercised on Labcorp's published panel 005009 (CBC with differential), whose LOINC map lists each component result with its LOINC code: seven components "
   "-> seven LOINC Metrics. Coverage of the InnerAge inputs is recorded as one RESOLUTION assessment per candidate pair (conclusionCode CANDIDATE: a name-level match, never an identity); the HbA1c input pairs with the LOINC 4548-4 Metric of ../hba1c-two-labs-interference, which carries an HbF interference SAFETY_SIGNAL, so InnerAge 2.0 inherits that risk (Q-D4-26, traversing REQUIRES_INPUT_METRIC in reverse). The retest advice (g28) is a claim occurrence of a kernel Claim."),
 'citation': ("https://www.labcorp.com/tests/005009/complete-blood-count-cbc-with-differential-reflex-to-peripheral-smear-review · Labcorp 005009 · 2026-10-08; "
   "https://blog.insidetracker.com/the-key-biomarkers-in-innerage-2-calculation · InsideTracker, The Key Biomarkers In the InnerAge 2.0 Calculation (2023-07-25) · 2026-10-08; "
   "https://store.insidetracker.com/products/innerage · InsideTracker store, InnerAge 2.0 · 2026-10-08; https://store.insidetracker.com/products/ultimate · InsideTracker store, Ultimate test · 2026-10-08. LOINC® codes as printed by Labcorp (LOINC license)."),
 'snapshots': [
  {'ref': 'snap-labcorp-cbc', 'url': 'https://www.labcorp.com/tests/005009/complete-blood-count-cbc-with-differential-reflex-to-peripheral-smear-review',
   'title': 'Labcorp test menu - Complete Blood Count (CBC) With Differential, Reflex to Peripheral Smear Review, test 005009', 'file': 'labcorp-005009.md', 'basis': 'text', 'offsetBasis': MD,
   'digest': '2ea60309595962fa9069b892815e99b7d66e7586335bcd981357462f8151f815', 'sourceKind': 'WEB_PAGE', 'genre': 'LAB_TEST_CATALOG', 'retrievedAt': '2026-10-08T17:43:00-04:00', 'mime': 'text/markdown',
   'tool': FC + ' (requested /tests/005009/complete-blood-count-cbc-with-differential-platelet; the site canonicalizes to the URL above)', 'note': 'new capture in the fixtures stage'},
  {'ref': 'snap-it-blog', 'url': 'https://blog.insidetracker.com/the-key-biomarkers-in-innerage-2-calculation', 'title': 'InsideTracker - The Key Biomarkers In the InnerAge 2.0 Calculation (blog, July 25, 2023)',
   'file': 'insidetracker-innerage.md', 'basis': 'text', 'offsetBasis': MD, 'digest': 'f11a9ed43900615fc14771ea0c77e53d570181ddf56ac5cf559e8a8eb78fc4f6',
   'researchDigest': 'fc797415a890cac7b93892443f24346a26775ed00ad2eb0f8343e342b96e7be3', 'sourceKind': 'WEB_PAGE', 'genre': 'VENDOR_BLOG', 'retrievedAt': '2026-10-08T17:41:00-04:00', 'mime': 'text/markdown', 'tool': FC},
  {'ref': 'snap-it-store', 'url': 'https://store.insidetracker.com/products/innerage', 'title': 'InsideTracker store - InnerAge 2.0', 'file': 'insidetracker-store-innerage.md', 'basis': 'text', 'offsetBasis': MD,
   'digest': '71d71a78cb8432a19d8e39e12eea8ecfa7332348936ec920501dba12b9457e43', 'sourceKind': 'WEB_PAGE', 'genre': 'PRODUCT_PAGE', 'retrievedAt': '2026-10-08T17:42:00-04:00', 'mime': 'text/markdown',
   'tool': FC + ' --wait-for 3000 (URL found with Tavily CLI search)', 'note': 'new capture in the fixtures stage'},
  {'ref': 'snap-it-ultimate', 'url': 'https://store.insidetracker.com/products/ultimate', 'title': 'InsideTracker store - Membership + Ultimate test', 'file': 'insidetracker-store-ultimate.md', 'basis': 'text', 'offsetBasis': MD,
   'digest': '832751b9fa26b4421d765115dd91b4772b41717f3a9ab869caf6475ebed4fd84', 'sourceKind': 'WEB_PAGE', 'genre': 'PRODUCT_PAGE', 'retrievedAt': '2026-10-08T17:43:00-04:00', 'mime': 'text/markdown',
   'tool': FC + ' --wait-for 3000', 'note': 'new capture; negative finding: panel composition only as an image'},
 ],
 'locators': locs, 'entities': ents, 'assertions': ass,
 'assessments': RES,
 'intentNotes': ('Fixture intent (fixture ids). Component tests are Labcorp result codes modeled as LabTest(SINGLE) with issuer-scoped LAB_TEST_CODE identifiers (requested scheme). '
                 'REQUIRES_INPUT_METRIC orderIndex = order of the blog list. The RESOLUTION assessments (s01-s08) are outside intent v1; OCCURRENCE_OF of g28 has no intent v1 field (11-open-questions #25). The panel->InnerAge link (which panel InsideTracker actually '
                 'orders) is not stated anywhere captured and is not asserted.'),
}

FX['questionsMd'] = """# Fixture consumer-panel-and-blood-clock - questions answered

Kind: other. Readiness finding: InsideTracker publishes its panel composition only as an image ("BM List"), so the INCLUDES_TEST episodes are demonstrated on Labcorp 005009, whose LOINC map lists the component results as text.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| Q-D4-03 | Labcorp 005009 (PANEL) includes, as of 2026-10-08, components RDW (788-0), MCH (785-6), MCHC (786-4), Lymphs % (736-9), Lymphs absolute (731-0), RBC (789-8), Hematocrit (4544-3) [7 of the panel's rows sampled], each MEASURES_METRIC its LOINC Metric; coverage of the 9 sampled InnerAge inputs: 7 by name (RESOLUTION CANDIDATE, not identity), glucose and HbA1c not covered by this panel. | g01-g14, s01-s07 |
| CQ-DX-07 | InnerAge 2.0 (vendor version label "2.0"): inputs 17 (males) / 13 (females), training = "scientific research and InsideTracker’s internal customer database", inputs "may" change, reliability not reported, units/methods of inputs not reported; output InnerAge in years. | g15-g23, g27 |
| Q-D4-16 | The InnerAge output is a separate Metric (ALGORITHM_OUTPUT, INFERRED); its inputs are measured blood metrics; nothing merges it with an epigenetic clock. | g24 |
| Q-D4-22 | Each vendor input name resolves to one LOINC Metric candidate by exact analyte name (conclusionCode CANDIDATE, status PROPOSED); none is RESOLVED because the vendor states no unit, method or code; the lymphocyte line splits by sex into two Metrics. | s01-s08 |
| Q-D4-26 | InnerAge 2.0 REQUIRES_INPUT_METRIC "Hemoglobin A1c" (g16), whose CANDIDATE resolution (s08) is LOINC 4548-4; ../hba1c-two-labs-interference s02 is a HARM SAFETY_SIGNAL on that Metric (elevated HbF > 10 % -> falsely low HbA1c on Labcorp's immunoassay; NGSP: immunoassays generally). Answer: InnerAge 2.0 inherits an interference risk for people with elevated HbF; the direction and size of the effect on InnerAge are not published (input weights not reported), and which lab and method InsideTracker uses is not reported -> "risk inherited, size unknown". | g16, s08; ../hba1c-two-labs-interference s02 |
| Q-D4-25 (input) | The panel -> Metric bipartite set needed for GDS nodeSimilarity is now populated for one panel (005009: 7 sampled Metrics). | g01-g14 |
| Q-D4-05 (contrast) | InsideTracker advises retesting in 3-6 months (g28, a claim occurrence of the Claim "retesting InnerAge in 3-6 months tracks aging"); no reliability source for InnerAge is captured -> same NO_RELIABILITY_SOURCE pattern as ../clock-noise-vs-retest-advice. | g28 |
"""

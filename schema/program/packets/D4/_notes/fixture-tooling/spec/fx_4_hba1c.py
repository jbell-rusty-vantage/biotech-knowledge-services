LC = {'ref': 'org-labcorp', 'type': 'Organization'}
QD = {'ref': 'org-quest', 'type': 'Organization'}
NG = {'ref': 'org-ngsp', 'type': 'Organization'}
RG = {'ref': 'org-regenstrief', 'type': 'Organization'}
CUR = {'ref': 'agent-curation', 'type': 'Agent'}
M = {'ref': 'metric-loinc-4548-4', 'type': 'Metric'}
B = {'ref': 'biomarker-hba1c', 'type': 'Biomarker'}
TL = {'ref': 'labtest-labcorp-001453', 'type': 'LabTest'}
TQ = {'ref': 'labtest-quest-496', 'type': 'LabTest'}
AL = {'ref': 'av-labcorp-001453', 'type': 'AssayVersion'}
AQ = {'ref': 'av-quest-496', 'type': 'AssayVersion'}
DV = {'ref': 'device-cobas-c513', 'type': 'Device'}
OBS = {'validFrom': None, 'validFromBasis': 'OBSERVATION_ONLY', 'statedAsOf': '2026-10-08T17:40:00-04:00', 'statedAsOfPrecision': 'INSTANT'}
MD = 'Unicode code points of the UTF-8 Firecrawl markdown capture'
def snap(ref, url, title, f, d, genre, tool='Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0', kind='WEB_PAGE', t='2026-10-08T17:40:00-04:00', mime='text/markdown', **kw):
    s = {'ref': ref, 'url': url, 'title': title, 'file': f, 'basis': 'text', 'offsetBasis': MD, 'digest': d, 'researchDigest': d,
         'sourceKind': kind, 'genre': genre, 'retrievedAt': t, 'mime': mime, 'tool': tool}
    s.update(kw); return s
def ri(ref, uid, name, kind, deriv, text, lo, hi, loinc, hiinc, av):
    return {'ref': ref, 'type': 'ReferenceIntervalVersion', 'module': 'D4', 'uid': uid, 'name': name,
            'props': {'intervalKind': kind, 'derivation': deriv, 'intervalText': text, 'lowerBound': lo, 'upperBound': hi, 'lowerInclusive': loinc, 'upperInclusive': hiinc,
                      'unitCode': '%', 'sex': 'NOT_REPORTED', 'notReported': ['INTERVAL_DERIVATION', 'INTERVAL_PARTITION', 'EFFECTIVE_DATE']},
            'onMatch': 'use_existing', 'forAssay': av}

FX = {
 'id': 'hba1c-two-labs-interference', 'short': 'a1c', 'kind': 'harm',
 'candidate': 'FC-1 + FC-2 in ../../_notes/fixture-candidates.md',
 'description': ("One measurand, two laboratories, two methods, two kinds of 'range', and a harm branch. Labcorp test 001453 maps its result to LOINC "
   "4548-4 (Hemoglobin A1c/Hemoglobin.total in Blood, mass fraction) and names its method only as 'Roche Tina Quant'; Quest test 496 states "
   "'Turbidimetric Inhibition Immunoassay' and hides its LOINC codes and performing lab behind a service-area selector. Neither states the instrument "
   "or software version, so the comparability Assessment (COMPARABILITY, subkind D4.comparability) is UNKNOWN, never 'same test'. Labcorp lists four "
   "intervals of three kinds (reference interval, two decision limits, a guideline target); Quest prints one '<5.7 %' with a disclaimer. Harm branch: "
   "Labcorp states that high HbF (>10 %) may give lower than expected HbA1c; NGSP's interference table (updated June 2026) marks Roche Cobas c513 with "
   "'$' = immunoassays can generally be assumed to show HbF interference. A person with elevated HbF using either lab cannot exclude a falsely low "
   "result. Exercises MEASURES_METRIC, PERFORMED_WITH_VERSION (episode), PERFORMED_BY_LAB (a curator inference at organization level: no capture names the performing site), INTERVAL_FOR (both fields), QUANTIFIES, HAS_ANALYTE (Biomarker.analyteEntities -> D2 MolecularEntity) and INTERFERES_WITH assertions."),
 'citation': ("https://www.labcorp.com/tests/001453/hemoglobin-hb-a1c · Labcorp, Hemoglobin (Hb) A1c 001453 · 2026-10-08; "
   "https://files.labcorp.com/testmenu-d8/sample_reports/001453.pdf · Labcorp SAMPLE REPORT 001453 · 2026-10-08; "
   "https://testdirectory.questdiagnostics.com/test/test-detail/496/hemoglobin-a1c?cc=MASTER · Quest Test Directory, Hemoglobin A1c 496 · 2026-10-08; "
   "https://loinc.org/4548-4 · LOINC 4548-4 · 2026-10-08; https://ngsp.org/interf.asp · NGSP HbA1c Assay Interferences (updated June 2026) · 2026-10-08; "
   "https://ngsp.org/docs/methods.pdf · NGSP List of Certified Methods (updated 10/26) · 2026-10-08. LOINC content: LOINC® is copyright Regenstrief Institute, used under the LOINC license."),
 'snapshots': [
  snap('snap-labcorp', 'https://www.labcorp.com/tests/001453/hemoglobin-hb-a1c', 'Labcorp test menu - Hemoglobin (Hb) A1c, test 001453', 'labcorp-001453.md',
       '0073f5495274f0e65cea44fb39a65206b064925dc17412b4cda3743a4d50e958', 'LAB_TEST_CATALOG'),
  {'ref': 'snap-labcorp-sample', 'url': 'https://files.labcorp.com/testmenu-d8/sample_reports/001453.pdf', 'title': 'Labcorp SAMPLE REPORT, 001453 (PDF, synthetic sample patient)',
   'file': 'labcorp-001453-sample.pdf', 'textFile': 'labcorp-001453-sample.txt', 'textRule': 'pdftotext -layout (poppler); pages separated by form feed', 'basis': 'pdf',
   'offsetBasis': 'code points of the decoded pdftotext -layout output of the whole PDF', 'digest': 'a2d50898e8ab617000a7b93216304b4daba18381ff0c6e8400e12fee4241a1c9',
   'researchDigest': 'a2d50898e8ab617000a7b93216304b4daba18381ff0c6e8400e12fee4241a1c9', 'sourceKind': 'PDF', 'genre': 'SAMPLE_REPORT', 'retrievedAt': '2026-10-08T17:39:00-04:00',
   'mime': 'application/pdf', 'tool': 'curl + pdftotext -layout'},
  snap('snap-quest', 'https://testdirectory.questdiagnostics.com/test/test-detail/496/hemoglobin-a1c?cc=MASTER', 'Quest Diagnostics Test Directory - Hemoglobin A1c, test 496',
       'quest-496.md', '1816564448ca5e9165c524b1443ca05ed51ba5b25f158e07e7cf031f2b662aa6', 'LAB_TEST_CATALOG',
       tool='Firecrawl CLI 1.23.1 scrape --only-main-content --wait-for 3000 --max-age 0', completeness='PARTIAL_EXCERPT',
       note='LOINC codes and performing lab are behind a service-area selector (not rendered without a selection); capture is PARTIAL for those sections'),
  snap('snap-loinc', 'https://loinc.org/4548-4', 'LOINC 4548-4 Hemoglobin A1c/Hemoglobin.total in Blood (LOINC 2.73 page)', 'loinc-4548-4.md',
       'd15f1f233a744677aedea5c6570d279ebf5ae4e990080260ba258bad14d393b9', 'TERMINOLOGY_RECORD'),
  snap('snap-ngsp-interf', 'https://ngsp.org/interf.asp', 'NGSP - HbA1c Assay Interferences (Updated June 2026)', 'ngsp-interf.md',
       'd7498836c93ec989942fa4265d1ff675cbb10c70a5580da639caf08e41a76215', 'REFERENCE_PROGRAM_PAGE'),
  snap('snap-ngsp-methods', 'https://ngsp.org/docs/methods.pdf', 'NGSP - List of NGSP Certified Methods (updated 10/26), PDF parsed to markdown by Firecrawl', 'ngsp-methods.md',
       '21a24ece3b4dcd8f8294e57a2167d51a9ecf9fa15e78e4a3105234b8cc1dd05c', 'REFERENCE_PROGRAM_LIST', kind='PDF',
       note='snapshot digest is of the Firecrawl markdown rendition of the PDF (the PDF bytes were not stored)'),
 ],
 'locators': [
  {'ref': 'lc-method', 'snap': 'snap-labcorp', 'quote': 'Roche Tina Quant', 'section': 'Test Details / Methodology'},
  {'ref': 'lc-loinc-row', 'snap': 'snap-labcorp', 'quote': '| 001453 | Hemoglobin A1c | 4548-4 | 001481 | Hemoglobin A1c | % | 4548-4 |', 'section': 'LOINC® Map'},
  {'ref': 'lc-ri', 'snap': 'snap-labcorp', 'quote': '• Hemoglobin (Hb) A1c: 4.8% to 5.6%', 'section': 'Reference Range'},
  {'ref': 'lc-prediabetes', 'snap': 'snap-labcorp', 'quote': '• Prediabetes: 5.7% to 6.4%', 'section': 'Reference Range'},
  {'ref': 'lc-diabetes', 'snap': 'snap-labcorp', 'quote': '• Diabetes: ≥6.5%', 'section': 'Reference Range'},
  {'ref': 'lc-target', 'snap': 'snap-labcorp', 'quote': '• Glycemic control for adults with diabetes: <7.0%', 'section': 'Reference Range'},
  {'ref': 'lc-hbf', 'snap': 'snap-labcorp', 'quote': 'Specimens containing high amounts of HbF (>10 %) may result in lower than expected HbA1c values.', 'section': 'Limitations'},
  {'ref': 'lc-tubes', 'snap': 'snap-labcorp', 'quote': 'Lavender-top (EDTA) tube, green-top (lithium heparin) tube, or gray-top (sodium fluoride) tube', 'section': 'Specimen Requirements / Container'},
  {'ref': 'lc-testno', 'snap': 'snap-labcorp', 'quote': 'Test Number001453', 'section': "Labcorp test menu header (the test is on Labcorp's own menu)"},
  {'ref': 'lc-kit', 'snap': 'snap-labcorp', 'quote': 'Tina Quant Hemoglobin A1c Gen.3 - Hemolysate application \\[package insert\\]. Roche Diagnostics, Mannheim Germany. Version 1.0: 2017-06.', 'section': 'References, footnote 1 (the markdown capture escapes the brackets)'},
  {'ref': 'sr-lab', 'snap': 'snap-labcorp-sample', 'quote': '3060 S Church Street, Burlington, NC 27215', 'section': 'LAB 01 block of a synthetic sample report (placeholder, not a performing-lab statement)'},
  {'ref': 'sr-placeholder', 'snap': 'snap-labcorp-sample', 'quote': 'Testmaster Testing', 'section': 'LAB 01 block (placeholder lab name, page 1)'},
  {'ref': 'sr-director', 'snap': 'snap-labcorp-sample', 'quote': 'Dir: Report Testing, PhD', 'section': 'LAB 01 block (placeholder director, page 1)'},
  {'ref': 'sr-date', 'snap': 'snap-labcorp-sample', 'quote': 'Date reported: 08/13/2018', 'section': 'sample header (page 1)'},
  {'ref': 'sr-holder', 'snap': 'snap-labcorp-sample', 'quote': 'Laboratory Corporation of America Holdings', 'section': 'footer (copyright notice "1995-2018 ..."; names no performing lab)'},
  {'ref': 'q-method', 'snap': 'snap-quest', 'quote': 'Turbidimetric Inhibition Immunoassay', 'section': 'Methodology'},
  {'ref': 'q-ri', 'snap': 'snap-quest', 'quote': '<5.7 %', 'section': 'Reference range(s)'},
  {'ref': 'q-disclaimer', 'snap': 'snap-quest', 'quote': 'Reference ranges are provided as general guidance only. To interpret test results use the reference range in the laboratory report.'},
  {'ref': 'q-reject', 'snap': 'snap-quest', 'quote': 'Sodium fluoride/oxalate (gray-top) tube • Heparinized plasma', 'section': 'Reject criteria'},
  {'ref': 'q-hidden', 'snap': 'snap-quest', 'quote': 'Performing lab & setup schedule', 'section': 'Performing lab (service-area gated)'},
  {'ref': 'ln-name', 'snap': 'snap-loinc', 'quote': 'Hemoglobin A1c/Hemoglobin.total:MFr:Pt:Bld:Qn', 'section': 'Fully-Specified Name'},
  {'ref': 'ln-protocols', 'snap': 'snap-loinc', 'quote': 'All three protocols produce different numeric values.', 'section': 'Reference Information'},
  {'ref': 'ng-updated', 'snap': 'snap-ngsp-interf', 'quote': 'Updated June 2026'},
  {'ref': 'ng-variants', 'snap': 'snap-ngsp-interf', 'quote': 'In people who have hemoglobin variants such as HbS (sickle cell trait), some A1C tests give falsely high or low readings that can lead to the over-treatment or under-treatment of diabetes.'},
  {'ref': 'ng-c513', 'snap': 'snap-ngsp-interf', 'quote': '| Roche Cobas c513 | No | No | No | No | $ |', 'section': 'interference table (columns: HbC, HbS, HbE, HbD, elevated HbF)'},
  {'ref': 'ng-dollar', 'snap': 'snap-ngsp-interf', 'quote': '$ In the absence of specific method data, it can generally be assumed that immunoassay, boronate affinity and enzymatic methods show interference from elevated HbF levels (2,3).'},
  {'ref': 'nm-expiry', 'snap': 'snap-ngsp-methods', 'quote': 'the certificate of \ntraceability expires after 1 year.', 'section': 'header'},
  {'ref': 'nm-gen3-c513', 'snap': 'snap-ngsp-methods', 'quote': 'TQ HbA1c Gen. 3 hemolysate on cobas c513', 'section': 'Roche Diagnostics rows'},
  {'ref': 'nm-gen4-c513', 'snap': 'snap-ngsp-methods', 'quote': 'TQ HbA1c Gen. IV hemolysate on cobas c513', 'section': 'Roche Diagnostics rows'},
 ],
 'entities': [
  {'ref': 'metric-loinc-4548-4', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:loinc-4548-4', 'name': 'Hemoglobin A1c/Hemoglobin.total in Blood (LOINC 4548-4)',
   'props': {'metricKind': 'MEASURAND', 'defaultResultKind': 'MEASURED', 'definitionSource': 'LOINC', 'definitionIssuerName': 'LOINC (Regenstrief Institute)', 'propertyText': 'MFr',
             'systemText': 'Bld', 'scale': 'QUANTITATIVE', 'timeAspect': 'Pt', 'methodText': 'NGSP % (DCCT-aligned)', 'canonicalUnitCode': '%',
             'searchText': 'HbA1c A1c hemoglobin A1c glycated hemoglobin mass fraction blood'},
   'identifiers': [{'scheme': 'LOINC', 'issuer': 'Regenstrief Institute', 'value': '4548-4'}], 'onMatch': 'use_existing'},
  {'ref': 'biomarker-hba1c', 'type': 'Biomarker', 'module': 'D4', 'uid': 'hu:biomarker:hemoglobin-a1c', 'name': 'Hemoglobin A1c (glycated hemoglobin)',
   'props': {'biomarkerKind': 'PROTEIN_MODIFICATION', 'searchText': 'HbA1c, A1C, glycated hemoglobin, glycohemoglobin'}, 'onMatch': 'use_existing'},
  {'ref': 'labtest-labcorp-001453', 'type': 'LabTest', 'module': 'D4', 'uid': 'hu:lab-test:labcorp-001453', 'name': 'Labcorp Hemoglobin (Hb) A1c (001453)',
   'props': {'testKind': 'SINGLE', 'collectionModes': ['VENIPUNCTURE'], 'specimenText': 'Lavender-top (EDTA) tube, green-top (lithium heparin) tube, or gray-top (sodium fluoride) tube'},
   'identifiers': [{'scheme': 'LAB_TEST_CODE', 'issuer': 'Labcorp', 'value': '001453'}], 'onMatch': 'use_existing'},
  {'ref': 'labtest-quest-496', 'type': 'LabTest', 'module': 'D4', 'uid': 'hu:lab-test:quest-496', 'name': 'Quest Diagnostics Hemoglobin A1c (496)',
   'props': {'testKind': 'SINGLE', 'collectionModes': ['VENIPUNCTURE'], 'preAnalyticalText': 'Reject criteria: Sodium fluoride/oxalate (gray-top) tube • Heparinized plasma'},
   'identifiers': [{'scheme': 'LAB_TEST_CODE', 'issuer': 'Quest Diagnostics', 'value': '496'}], 'onMatch': 'use_existing'},
  {'ref': 'av-labcorp-001453', 'type': 'AssayVersion', 'module': 'D4', 'uid': 'hu:assay-version:labcorp-001453-observed-2026-10-08', 'name': 'Labcorp 001453 HbA1c assay as observed on the Labcorp test menu 2026-10-08 (Roche Tina Quant)',
   'props': {'methodText': 'Roche Tina Quant', 'reagentKitText': 'Tina Quant Hemoglobin A1c Gen.3 - Hemolysate application (package insert cited by Labcorp: Roche Diagnostics, Version 1.0: 2017-06; whether it is the kit in current use is not stated)',
             'specimenKinds': ['WHOLE_BLOOD'], 'reportedUnitCode': '%', 'notReported': ['METHOD_PRINCIPLE', 'INSTRUMENT_MODEL', 'SOFTWARE_VERSION', 'CALIBRATION_TRACEABILITY', 'PERFORMING_LAB']}, 'onMatch': 'create_anyway',
   'note': 'PERFORMING_LAB = no capture names the performing laboratory site; the organization-level PERFORMED_BY_LAB edge (d05) is a curator inference'},
  {'ref': 'av-quest-496', 'type': 'AssayVersion', 'module': 'D4', 'uid': 'hu:assay-version:quest-496-observed-2026-10-08', 'name': 'Quest 496 HbA1c assay as published 2026-10-08 (turbidimetric inhibition immunoassay)',
   'props': {'methodPrinciple': 'IMMUNOASSAY_TURBIDIMETRIC', 'methodText': 'Turbidimetric Inhibition Immunoassay', 'specimenKinds': ['WHOLE_BLOOD'], 'reportedUnitCode': '%',
             'notReported': ['INSTRUMENT_MODEL', 'REAGENT_KIT', 'SOFTWARE_VERSION', 'CALIBRATION_TRACEABILITY', 'PERFORMING_LAB']}, 'onMatch': 'create_anyway'},
  {'ref': 'device-cobas-c513', 'type': 'Device', 'module': 'D4', 'uid': 'hu:device:roche-cobas-c513', 'name': 'Roche cobas c513 analyzer (HbA1c method listed by NGSP)',
   'props': {'deviceKind': 'LAB_ANALYZER', 'deviceFamily': 'cobas', 'generationLabel': 'c513', 'makerName': 'Roche'}, 'onMatch': 'use_existing'},
  ri('ri-labcorp-ref', 'hu:ri-version:labcorp-001453-hba1c-ref-4.8-5.6', 'Labcorp 001453 HbA1c reference interval 4.8%-5.6%', 'REFERENCE_INTERVAL', 'NOT_REPORTED', '• Hemoglobin (Hb) A1c: 4.8% to 5.6%', 4.8, 5.6, True, True, 'av-labcorp-001453'),
  ri('ri-labcorp-prediabetes', 'hu:ri-version:labcorp-001453-hba1c-prediabetes-5.7-6.4', 'Labcorp 001453 prediabetes decision limit 5.7%-6.4%', 'DECISION_LIMIT', 'NOT_REPORTED', '• Prediabetes: 5.7% to 6.4%', 5.7, 6.4, True, True, 'av-labcorp-001453'),
  ri('ri-labcorp-diabetes', 'hu:ri-version:labcorp-001453-hba1c-diabetes-6.5', 'Labcorp 001453 diabetes decision limit >=6.5%', 'DECISION_LIMIT', 'NOT_REPORTED', '• Diabetes: ≥6.5%', 6.5, None, True, None, 'av-labcorp-001453'),
  ri('ri-labcorp-target', 'hu:ri-version:labcorp-001453-hba1c-target-7.0', 'Labcorp 001453 glycemic control target <7.0%', 'GUIDELINE_TARGET', 'NOT_REPORTED', '• Glycemic control for adults with diabetes: <7.0%', None, 7.0, None, False, 'av-labcorp-001453'),
  ri('ri-quest', 'hu:ri-version:quest-496-hba1c-lt-5.7', 'Quest 496 HbA1c reference range <5.7 % (as printed)', 'REFERENCE_INTERVAL', 'NOT_REPORTED', '<5.7 %', None, 5.7, None, False, 'av-quest-496'),
  {'ref': 'org-labcorp', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:labcorp', 'name': 'Laboratory Corporation of America Holdings (Labcorp)', 'onMatch': 'use_existing'},
  {'ref': 'org-quest', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:quest-diagnostics', 'name': 'Quest Diagnostics', 'onMatch': 'use_existing'},
  {'ref': 'org-ngsp', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:ngsp', 'name': 'NGSP (National Glycohemoglobin Standardization Program)', 'onMatch': 'use_existing'},
  {'ref': 'org-regenstrief', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:regenstrief-institute', 'name': 'Regenstrief Institute (LOINC)', 'onMatch': 'use_existing'},
  {'ref': 'me-hba1c', 'type': 'MolecularEntity', 'module': 'D2', 'uid': 'hu:molecular-entity:hemoglobin-a1c', 'name': 'Hemoglobin A1c (glycated adult hemoglobin)', 'onMatch': 'use_existing',
   'note': 'D2 owns the node (uid token molecular-entity); no UniProt accession attached: HbA1c is a glycated tetramer, not one chain, and none was captured (never invented)'},
  {'ref': 'agent-curation', 'type': 'Agent', 'module': 'K', 'uid': 'hu:agent:bks-curation-d4', 'name': 'BellLabs D4 curation agent', 'props': {'agentKind': 'AUTOMATED_AGENT'}, 'onMatch': 'use_existing'},
 ],
 'assertions': [
  {'id': 'd01', 'edgeClass': 'asserted', 'predicate': 'MEASURES_METRIC', 'assertionKind': 'RELATIONSHIP', 'subject': TL, 'object': M, 'asserter': LC, 'locators': ['lc-loinc-row'],
   'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': OBS, 'qualifiers': ['order LOINC and result LOINC both 4548-4; result code 001481; unit %']},
  {'id': 'd02', 'edgeClass': 'asserted', 'predicate': 'MEASURES_METRIC', 'assertionKind': 'RELATIONSHIP', 'subject': TQ, 'object': M, 'asserter': CUR, 'locators': ['q-ri', 'q-method', 'q-hidden'],
   'speechAct': 'STATES', 'basisKind': 'CALCULATED', 'validTime': OBS, 'status': 'PROPOSED',
   'derivationRule': 'name + unit (%) match to LOINC 4548-4; Quest LOINC codes are behind the service-area selector (not captured) -> PROPOSED, needs a capture with a service area',
   'rationale': 'curator inference: same analyte and unit (%) as LOINC 4548-4; no captured Quest text names a LOINC code (the LOINC section is service-area gated, q-hidden), so q-ri and q-method support only the analyte/unit match'},
  {'id': 'd03', 'edgeClass': 'asserted', 'predicate': 'PERFORMED_WITH_VERSION', 'assertionKind': 'RELATIONSHIP', 'subject': TL, 'object': AL, 'objectField': 'LabTest.assayVersions', 'asserter': LC,
   'locators': ['lc-method', 'lc-kit'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS,
   'qualifiers': ['episode start not stated by the lab (validFrom null, OBSERVATION_ONLY); a later capture with a different method closes it (Q-D4-23)']},
  {'id': 'd04', 'edgeClass': 'asserted', 'predicate': 'PERFORMED_WITH_VERSION', 'assertionKind': 'RELATIONSHIP', 'subject': TQ, 'object': AQ, 'objectField': 'LabTest.assayVersions', 'asserter': QD,
   'locators': ['q-method'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS},
  {'id': 'd05', 'edgeClass': 'structural', 'predicate': 'PERFORMED_BY_LAB', 'subject': AL, 'object': LC, 'asserter': CUR, 'locators': ['lc-testno'], 'basisKind': 'CALCULATED',
   'derivationRule': "curator inference (organization level): test 001453 is on Labcorp's own test menu, so the performing organization is Labcorp; no capture names the performing site",
   'rationale': 'Organization-level inference kept so the AssayVersion has its identity-bearing lab; PERFORMING_LAB stays in notReported until a real report or a CLIA record names the site.',
   'note': ('Adversarial review (2026-10-08): the Labcorp SAMPLE REPORT is not evidence for this edge. Its LAB 01 block is a 2018 placeholder ("01 $$ Testmaster Testing", '
            '"Dir: Report Testing, PhD", 3060 S Church Street, Burlington, NC 27215; dates 08/13/2018) and its footer "1995-2018 Laboratory Corporation of America Holdings" '
            'is a copyright notice. Those spans are cited only by d15 (FIELD_NOT_REPORTED PERFORMING_LAB). Quest: PERFORMING_LAB in notReported, no edge (q-hidden).')},
  {'id': 'd06', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-labcorp-ref', 'type': 'ReferenceIntervalVersion'}, 'object': AL, 'objectField': 'ReferenceIntervalVersion.assayVersions', 'asserter': LC, 'locators': ['lc-ri']},
  {'id': 'd07', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-labcorp-ref', 'type': 'ReferenceIntervalVersion'}, 'object': M, 'objectField': 'ReferenceIntervalVersion.metrics', 'asserter': LC, 'locators': ['lc-ri', 'lc-loinc-row']},
  {'id': 'd08', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-labcorp-prediabetes', 'type': 'ReferenceIntervalVersion'}, 'object': AL, 'objectField': 'ReferenceIntervalVersion.assayVersions', 'asserter': LC, 'locators': ['lc-prediabetes']},
  {'id': 'd09', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-labcorp-diabetes', 'type': 'ReferenceIntervalVersion'}, 'object': AL, 'objectField': 'ReferenceIntervalVersion.assayVersions', 'asserter': LC, 'locators': ['lc-diabetes']},
  {'id': 'd10', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-labcorp-target', 'type': 'ReferenceIntervalVersion'}, 'object': AL, 'objectField': 'ReferenceIntervalVersion.assayVersions', 'asserter': LC, 'locators': ['lc-target']},
  {'id': 'd11', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-quest', 'type': 'ReferenceIntervalVersion'}, 'object': AQ, 'objectField': 'ReferenceIntervalVersion.assayVersions', 'asserter': QD, 'locators': ['q-ri', 'q-disclaimer']},
  {'id': 'd12', 'edgeClass': 'structural', 'predicate': 'QUANTIFIES', 'subject': M, 'object': B, 'asserter': RG, 'locators': ['ln-name']},
  {'id': 'd13', 'edgeClass': 'literal', 'predicate': 'INTERFERES_WITH', 'assertionKind': 'RELATIONSHIP', 'subject': AL,
   'value': {'valueString': 'elevated HbF (>10 %) -> lower than expected HbA1c'}, 'qualifiers': ['condition: high HbF', 'direction: falsely low', 'threshold: HbF > 10 %'],
   'asserter': LC, 'locators': ['lc-hbf'], 'speechAct': 'CAUTIONS', 'polarity': 'POSITIVE', 'basisKind': 'CITED_FROM_PRIOR_WORK', 'validTime': OBS},
  {'id': 'd14', 'edgeClass': 'literal', 'predicate': 'INTERFERES_WITH', 'assertionKind': 'RELATIONSHIP', 'subject': DV,
   'value': {'valueString': "elevated HbF: '$' = no method-specific data; immunoassays can generally be assumed to show HbF interference"},
   'qualifiers': ['condition: elevated HbF', 'direction: not stated', 'HbC/HbS/HbE/HbD: No (no clinically significant interference)'],
   'asserter': NG, 'locators': ['ng-c513', 'ng-dollar', 'ng-updated'], 'speechAct': 'CAUTIONS', 'polarity': 'POSITIVE', 'basisKind': 'EXPERT_OPINION',
   'validTime': {'validFrom': None, 'validFromBasis': 'UNKNOWN', 'statedAsOf': '2026-06-01T00:00:00Z', 'statedAsOfPrecision': 'MONTH'},
   'note': "subject is the analyzer model (Device), because NGSP lists methods by instrument; register 05 predicateOnly widened to 'AssayVersion | Device'"},
  {'id': 'd15', 'edgeClass': 'literal', 'predicate': 'FIELD_NOT_REPORTED', 'assertionKind': 'FIELD', 'subject': AL, 'value': {'valueString': 'METHOD_PRINCIPLE, INSTRUMENT_MODEL, SOFTWARE_VERSION, CALIBRATION_TRACEABILITY, PERFORMING_LAB'},
   'asserter': CUR, 'locators': ['lc-method', 'sr-placeholder', 'sr-director', 'sr-date', 'sr-holder'],
   'note': 'PERFORMING_LAB: the only lab block captured is the 2018 placeholder of a synthetic sample report (sr-placeholder, sr-director, sr-date) and a copyright footer (sr-holder)', 'speechAct': 'STATES', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': OBS},
  {'id': 'd16', 'edgeClass': 'literal', 'predicate': 'FIELD_NOT_REPORTED', 'assertionKind': 'FIELD', 'subject': AQ, 'value': {'valueString': 'INSTRUMENT_MODEL, REAGENT_KIT, SOFTWARE_VERSION, CALIBRATION_TRACEABILITY, PERFORMING_LAB'},
   'asserter': CUR, 'locators': ['q-method', 'q-hidden'], 'speechAct': 'STATES', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': OBS,
   'note': 'PERFORMING_LAB is gated (service area), not absent; captureCompleteness PARTIAL_EXCERPT, so this is "not reported in this capture", never "does not exist"'},
  # added in the check stage (A3, 2026-10-08): the metrics side of INTERVAL_FOR for d08-d11 (SDL cardinality exactly_one) and the
  # HAS_ANALYTE -> D2.MolecularEntity field (Biomarker.analyteEntities), which no fixture exercised before.
  {'id': 'd17', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-labcorp-prediabetes', 'type': 'ReferenceIntervalVersion'}, 'object': M, 'objectField': 'ReferenceIntervalVersion.metrics', 'asserter': LC, 'locators': ['lc-prediabetes', 'lc-loinc-row']},
  {'id': 'd18', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-labcorp-diabetes', 'type': 'ReferenceIntervalVersion'}, 'object': M, 'objectField': 'ReferenceIntervalVersion.metrics', 'asserter': LC, 'locators': ['lc-diabetes', 'lc-loinc-row']},
  {'id': 'd19', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-labcorp-target', 'type': 'ReferenceIntervalVersion'}, 'object': M, 'objectField': 'ReferenceIntervalVersion.metrics', 'asserter': LC, 'locators': ['lc-target', 'lc-loinc-row']},
  {'id': 'd20', 'edgeClass': 'structural', 'predicate': 'INTERVAL_FOR', 'subject': {'ref': 'ri-quest', 'type': 'ReferenceIntervalVersion'}, 'object': M, 'objectField': 'ReferenceIntervalVersion.metrics', 'asserter': CUR, 'locators': ['q-ri'],
   'note': 'Quest prints the range in % next to the HbA1c test; the Metric link inherits the PROPOSED status of d02 (Quest LOINC gated)'},
  {'id': 'd21', 'edgeClass': 'structural', 'predicate': 'HAS_ANALYTE', 'subject': B, 'object': {'ref': 'me-hba1c', 'type': 'MolecularEntity'}, 'objectField': 'Biomarker.analyteEntities', 'asserter': CUR, 'locators': ['ln-name'],
   'rationale': 'curated: the LOINC component "Hemoglobin A1c" names a protein modification (glycated hemoglobin), so the analyte is a D2 MolecularEntity, not a D1 substance'},
 ],
 'assessments': [
  {'id': 's01', 'assessmentKind': 'COMPARABILITY', 'assessmentSubkind': 'D4.comparability', 'conclusionCode': 'UNKNOWN', 'status': 'PROPOSED', 'methodVersion': 'd4-comparability/0.1 (fixture)',
   'about': ['hu:assay-version:labcorp-001453-observed-2026-10-08', 'hu:assay-version:quest-496-observed-2026-10-08'],
   'differingDimensions': ['instrument: NOT_REPORTED on both', 'software: NOT_REPORTED on both', 'calibration traceability: NOT_REPORTED on both',
                           'method text: "Roche Tina Quant" vs "Turbidimetric Inhibition Immunoassay" (compatible, not shown identical)',
                           'Quest LOINC: not captured (d02 PROPOSED)', 'specimen: Labcorp accepts gray-top sodium fluoride; Quest rejects sodium fluoride/oxalate gray-top',
                           'reagent generation: Labcorp cites a Tina Quant HbA1c Gen.3 hemolysate package insert (Version 1.0: 2017-06; currency not stated) while NGSP certifies both Gen. 3 and Gen. IV cobas c513 applications; Quest kit NOT_REPORTED',
                           'performing lab: Labcorp by curator inference at organization level (site not reported); Quest NOT_REPORTED (gated)'],
   'inputAssertions': ['d01', 'd02', 'd03', 'd04', 'd15', 'd16'],
   'evidence': [{'locator': 'lc-method', 'role': 'CONTEXT'}, {'locator': 'q-method', 'role': 'CONTEXT'}, {'locator': 'lc-loinc-row', 'role': 'CONTEXT'},
                {'locator': 'ln-protocols', 'role': 'QUALIFIES'}, {'locator': 'lc-tubes', 'role': 'CONTEXT'}, {'locator': 'q-reject', 'role': 'CONTEXT'}, {'locator': 'nm-expiry', 'role': 'QUALIFIES'},
                {'locator': 'lc-kit', 'role': 'QUALIFIES'}, {'locator': 'nm-gen3-c513', 'role': 'CONTEXT'}, {'locator': 'nm-gen4-c513', 'role': 'CONTEXT'}],
   'summary': ('Same measurand (LOINC 4548-4, NGSP %) on the Labcorp side; Quest side PROPOSED. Both immunoassays, but instrument, software, certification and the '
               'reagent generation in use are not reported (Labcorp cites a 2017 Gen.3 insert; NGSP lists Gen. 3 and Gen. IV for cobas c513), and NGSP certificates expire after one year: verdict UNKNOWN. Trend across the two labs is allowed only as "unknown comparability", '
               'never as one series.'), 'questions': ['CQ-DX-03', 'CQ-AX-21', 'CQ-DX-01']},
  {'id': 's02', 'assessmentKind': 'SAFETY_SIGNAL', 'assessmentSubkind': 'D4.interference-risk', 'status': 'PROPOSED', 'methodVersion': 'd4-safety-signal/0.1 (fixture)',
   'about': ['hu:assay-version:labcorp-001453-observed-2026-10-08', 'hu:metric:loinc-4548-4'], 'effectDirection': 'HARM',
   'inputAssertions': ['d13', 'd14', 'd15'],
   'evidence': [{'locator': 'lc-hbf', 'role': 'SUPPORTS'}, {'locator': 'ng-dollar', 'role': 'SUPPORTS'}, {'locator': 'ng-variants', 'role': 'CONTEXT'}, {'locator': 'ng-c513', 'role': 'CONTEXT'}],
   'summary': ('For a person with elevated HbF (>10 %), a Labcorp 001453 result may be falsely low (lab-stated); the lab\'s instrument is not reported, so '
               'whether the NGSP table row for a specific analyzer applies cannot be decided -> risk not excludable; under-treatment is the harm direction NGSP names.'),
   'questions': ['Q-D4-11']},
 ],
 'intentNotes': ('Fixture intent (fixture ids). Assessments s01/s02 are not in intent v1. Quest MEASURES_METRIC (d02) is a curator proposal (status PROPOSED) because the '
                 'Quest LOINC section is gated. PERFORMED_BY_LAB (d05) is a curator inference (the sample report lab block is a 2018 placeholder). payloadHash of AssayVersion and ReferenceIntervalVersion is executor-computed and therefore omitted. INTERFERES_WITH on a Device '
                 'widens the 05 predicateOnly subject (recorded there).'),
}

FX['questionsMd'] = """# Fixture hba1c-two-labs-interference - questions answered

Kind: harm (with a comparability core). Expected comparability verdict: **UNKNOWN**.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| CQ-DX-01 | Labcorp 001453 measures LOINC 4548-4 (Hemoglobin A1c/Hemoglobin.total:MFr:Pt:Bld:Qn), unit %, specimen whole blood (lavender/green/gray-top), method text "Roche Tina Quant", reagent kit as cited "Tina Quant Hemoglobin A1c Gen.3 - Hemolysate application" package insert (2017-06; currency not stated), instrument NOT_REPORTED, software NOT_REPORTED, performing site NOT_REPORTED (organization Labcorp by curator inference), as observed 2026-10-08. | d01, d03, d05, d15; lc-loinc-row, lc-method, lc-kit, ln-name |
| CQ-DX-03 | Labcorp 001453 vs Quest 496: **UNKNOWN** comparability (both immunoassays; instrument, software, calibration and reagent generation in use not reported; Quest LOINC not captured). Never "same test". | s01 |
| CQ-AX-21 | The shared graph answers comparability from the two AssayVersion uids alone (s01), without any personal result. | s01 |
| CQ-DX-06 | Labcorp: reference interval 4.8-5.6 % (REFERENCE_INTERVAL, derivation NOT_REPORTED); prediabetes 5.7-6.4 % and diabetes >=6.5 % (DECISION_LIMIT); <7.0 % (GUIDELINE_TARGET). Quest: "<5.7 %" printed as a reference range with the disclaimer to use the range on the lab report. | d06-d11, d17-d20; lc-ri, lc-prediabetes, lc-diabetes, lc-target, q-ri, q-disclaimer |
| Q-D4-11 | Elevated HbF (>10 %) may give lower than expected HbA1c at Labcorp (lab-stated); NGSP: immunoassays can generally be assumed to show HbF interference ($ row, e.g. Roche Cobas c513); the lab's analyzer is not reported -> **risk not excludable**, effectDirection HARM. | s02; d13, d14 |
| Q-D4-19 | Pre-analytical difference: Labcorp accepts a gray-top (sodium fluoride) tube; Quest rejects sodium fluoride/oxalate gray-top tubes and heparinized plasma. | lc-tubes, q-reject |
| Q-D4-21 | LOINC 4548-4 exists for this metric (identifier on the Metric); LOINC itself warns that NGSP, IFCC and JDS protocols "produce different numeric values". | ln-protocols |
| Q-D4-23 | No dated method change is published by either lab; the PERFORMED_WITH_VERSION episodes are open with validFrom unknown; Labcorp cites a Gen.3 package insert of 2017-06 while NGSP certifies Gen. 3 and Gen. IV cobas c513 applications (a reagent-generation change is possible but undated); NGSP certificates expire yearly. | d03, d04, lc-kit, nm-gen3-c513, nm-gen4-c513, nm-expiry |
| Q-D4-26 (input) | The SAFETY_SIGNAL s02 (elevated HbF -> falsely low HbA1c) is about Metric LOINC 4548-4, which ../consumer-panel-and-blood-clock links to the InnerAge 2.0 HbA1c input by a RESOLUTION candidate: a clock using HbA1c inherits the risk. | s02 |
| Q-D4-16 | Metric 4548-4 QUANTIFIES Biomarker hemoglobin-a1c (other metrics such as IFCC mmol/mol or DNAm logA1C would be separate Metrics of the same Biomarker); the Biomarker's analyte is the D2 MolecularEntity hemoglobin A1c (Biomarker.analyteEntities), not a D1 substance. | d12, d21; ln-name |
"""

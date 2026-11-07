HC = {'ref': 'person-higgins-chen', 'type': 'Person'}
TDX = {'ref': 'org-trudiagnostic', 'type': 'Organization'}
ELY = {'ref': 'org-elysium', 'type': 'Organization'}
LT = {'ref': 'labtest-truage', 'type': 'LabTest'}
AVV = {'ref': 'av-truage-dunedinpace', 'type': 'AlgorithmVersion'}
AVP = {'ref': 'av-dunedinpace', 'type': 'AlgorithmVersion'}
AVH = {'ref': 'av-horvath1', 'type': 'AlgorithmVersion'}
AVG = {'ref': 'av-grimage', 'type': 'AlgorithmVersion'}
AVE = {'ref': 'av-elysium-index', 'type': 'AlgorithmVersion'}
CLR = {'ref': 'claim-truage-retest-3-months', 'type': 'Claim'}
CLE = {'ref': 'claim-elysium-index-replicate-agreement', 'type': 'Claim'}
OBS = {'validFrom': None, 'validFromBasis': 'OBSERVATION_ONLY', 'statedAsOf': '2026-10-08T17:40:00-04:00', 'statedAsOfPrecision': 'INSTANT'}
PUB = {'validFrom': None, 'validFromBasis': 'UNKNOWN'}  # Nature Aging 2022;2(7):644-661; day of publication not in the capture

FX = {
 'id': 'clock-noise-vs-retest-advice', 'short': 'noise', 'kind': 'reliability-gap',
 'candidate': 'FC-4 + FC-9 (claim side) in ../../_notes/fixture-candidates.md',
 'description': ("Reliability-gap case (relabelled from 'disconfirmation' in the adversarial-review pass: no captured source measures the noise of DunedinPACE itself, so nothing here contradicts the vendor's advice; the class-level noise of other CpG clocks only qualifies it). A consumer epigenetic-age product (TruDiagnostic TruAge) reports 'DunedinPACE™' with no version, array or "
   "replicate data and tells the user to 'retest every 3 months to track your progress'. Higgins-Chen et al. 2022 (Nature Aging; PMID 36277076; "
   "PMCID PMC9586209; DOI 10.1038/s43587-022-00248-2) documents that technical replicates of the same blood specimen give clock values that differ "
   "by years (Horvath1 median 1.8, max 4.8 years); the paper does not evaluate DunedinPACE, whose own publication reports test-retest ICC 0.96. The vendor prints '*Based on the last 2-3 months' next to the pace score, the only stated rationale near its interval. The fixture exercises PERFORMED_WITH_VERSION (LabTest -> vendor AlgorithmVersion) and the vendor "
   "-> publication side of DERIVED_FROM_ALGORITHM_VERSION, and records the verdict as kernel Assessments (QUALITY, subkind "
   "D4.change-detectability; EQUIVALENCE, subkind D4.algorithm-equivalence) - never as a property of the clock. A second vendor (Elysium Index) "
   "claims replicate agreement within 0-1.5 years: a manufacturer claim with a locator, weighed but not adopted. The paper snapshot is the NCBI "
   "BioC JSON re-fetched today (byte-capturable); the research stage used the PubMed MCP full-text response (sha256 2344777949649a9bc2656192e62fcf0afc9c24925bf5b9612602d1ee208874cc), "
   "whose text the BioC capture reproduces for every quote."),
 'citation': ("https://doi.org/10.1038/s43587-022-00248-2 · Higgins-Chen AT et al., 'A computational solution for bolstering reliability of epigenetic clocks: "
   "implications for clinical trials and longitudinal tracking', Nature Aging 2022 (PMID 36277076, PMCID PMC9586209) · retrieved 2026-10-08 via NCBI BioC API; "
   "https://shop.trudiagnostic.com/products/truage-complete-epigenetic-collection · TruDiagnostic TruAge test page · 2026-10-08; "
   "https://cdn.shopify.com/s/files/1/0269/3332/9974/files/ExampleAdvancedTruAge.pdf?v=1749717681 · TruDiagnostic sample Advanced TruAge report · 2026-10-08; "
   "https://www.elysiumhealth.com/pages/science-behind-index · Elysium Health, The Science Behind Index · 2026-10-08"),
 'snapshots': [
  {'ref': 'snap-bioc', 'url': 'https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/PMC9586209/unicode',
   'title': 'Higgins-Chen et al. 2022, A computational solution for bolstering reliability of epigenetic clocks, Nature Aging (PMID 36277076; PMC9586209; DOI 10.1038/s43587-022-00248-2) - NCBI BioC JSON',
   'file': 'bioc-PMC9586209.json', 'basis': 'json', 'digest': '0d2ed3c4b76bb512c86ed6632e29c78a7b4ea2b7d06e50addb8dbab4513deb17',
   'sourceKind': 'API', 'genre': 'PEER_REVIEWED_PUBLICATION', 'retrievedAt': '2026-10-08T17:41:00-04:00', 'mime': 'application/json',
   'tool': 'curl NCBI BioC PMC OA API (no key)', 'note': 'replaces the research-stage PubMed MCP response as the byte snapshot (MCP output cannot be hashed reproducibly); Europe PMC fullTextXML returns 150 bytes for this PMCID'},
  {'ref': 'snap-truage', 'url': 'https://shop.trudiagnostic.com/products/truage-complete-epigenetic-collection', 'title': 'TruDiagnostic - TruAge test page (shop)',
   'file': 'trudx-truage.md', 'basis': 'text', 'offsetBasis': 'Unicode code points of the UTF-8 Firecrawl markdown capture',
   'digest': 'a65fa4334eb2a8283fcde656b0d1d1fdb4e6eb961be1121e2bea93feb168cb17', 'researchDigest': 'd29bf7c63dfe09bd6d63cc5258df7c7d0cad36437bcdd1d77855a0661387a414',
   'sourceKind': 'WEB_PAGE', 'genre': 'MARKETING_PAGE', 'retrievedAt': '2026-10-08T17:40:00-04:00', 'mime': 'text/markdown',
   'tool': 'Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0'},
  {'ref': 'snap-truage-report', 'url': 'https://cdn.shopify.com/s/files/1/0269/3332/9974/files/ExampleAdvancedTruAge.pdf?v=1749717681',
   'title': 'TruDiagnostic - Advanced TruAge Report (sample PDF)', 'file': 'trudx-sample-report.pdf', 'textFile': 'trudx-sample-report.txt',
   'textRule': 'pdftotext -layout (poppler), output decoded as Latin-1; pages separated by form feed', 'basis': 'pdf',
   'offsetBasis': 'code points of the Latin-1-decoded pdftotext -layout output of the whole PDF',
   'digest': 'b5d7f9798de00dd73dd6f287f95876f0dce09cb085c701e630d99f14bd4f4ea1', 'researchDigest': 'b5d7f9798de00dd73dd6f287f95876f0dce09cb085c701e630d99f14bd4f4ea1',
   'sourceKind': 'PDF', 'genre': 'SAMPLE_REPORT', 'retrievedAt': '2026-10-08T17:39:00-04:00', 'mime': 'application/pdf', 'tool': 'curl + pdftotext -layout'},
  {'ref': 'snap-truage-report-whole', 'alias': 'snap-truage-report', 'basis': 'whole', 'url': '', 'title': ''},
  {'ref': 'snap-elysium', 'url': 'https://www.elysiumhealth.com/pages/science-behind-index', 'title': 'Elysium Health - The Science Behind Index',
   'file': 'elysium-index-science.md', 'basis': 'text', 'offsetBasis': 'Unicode code points of the UTF-8 Firecrawl markdown capture',
   'digest': 'a342e35966b79ea09eb9eccb0f48274312baf9d4e7aab16d72e7ca36f290fed7', 'researchDigest': 'a342e35966b79ea09eb9eccb0f48274312baf9d4e7aab16d72e7ca36f290fed7',
   'sourceKind': 'WEB_PAGE', 'genre': 'MARKETING_PAGE', 'retrievedAt': '2026-10-08T17:40:00-04:00', 'mime': 'text/markdown',
   'tool': 'Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0'},
 ],
 'locators': [
  {'ref': 'h1-noise', 'snap': 'snap-bioc', 'quote': 'Technical variance generates surprisingly noisy methylation values when the same biological specimens are measured multiple times.', 'section': 'Introduction'},
  {'ref': 'h2-horvath1', 'snap': 'snap-bioc', 'quote': 'The widely used Horvath1 multi-tissue clock shows a median deviation of 1.8 years between replicates, and a maximum of 4.8 years.', 'section': 'Results: technical noise reduces epigenetic clock reliability'},
  {'ref': 'h3-other-clocks', 'snap': 'snap-bioc', 'quote': 'For other clocks, median deviations range from 0.9 to 2.4 years and maxima range from 4.5 to 8.6 years.', 'section': 'Results'},
  {'ref': 'h4-grimage', 'snap': 'snap-bioc', 'quote': 'The high reliability of GrimAge (ICC = 0.989) is related to its two-step calculation from 7 DNAm-based components, age, and sex', 'section': 'Results'},
  {'ref': 't1-licensed', 'snap': 'snap-truage', 'quote': 'In our Pace of Aging report, we use the exclusively-licensed DunedinPACE™ algorithm to calculate your current speed of aging.', 'section': 'DunedinPACE™: Aging Speed'},
  {'ref': 't2-dunedin-study', 'snap': 'snap-truage', 'quote': 'This algorithm is the product of the on-going and renowned Dunedin Multidisciplinary Health and Development Study', 'section': 'DunedinPACE™: Aging Speed'},
  {'ref': 't3-report-list', 'snap': 'snap-truage', 'quote': 'Pace of Aging (DunedinPACE™)', 'section': 'report list'},
  {'ref': 't4-sites', 'snap': 'snap-truage', 'quote': 'analyzing 1,000,000+ DNA methylation sites from a simple at-home test', 'section': 'product description'},
  {'ref': 'r1-retest', 'snap': 'snap-truage-report', 'quote': 'Be sure to retest every 3 months to track your progress.', 'section': 'DunedinPACE of Aging page'},
  {'ref': 'r2-change', 'snap': 'snap-truage-report', 'quote': 'Your Rate of Aging will change based on your lifestyle interventions.', 'section': 'DunedinPACE of Aging page'},
  {'ref': 'r3-duke', 'snap': 'snap-truage-report', 'quote': 'DEVELOPED WITH DUKE', 'section': 'DunedinPACE of Aging page header'},
  {'ref': 'r4-window', 'snap': 'snap-truage-report', 'quote': '*Based on the last 2-3 months', 'section': 'DunedinPACE of Aging page, footnote beside the pace score (page 10)'},
  {'ref': 'r0-whole', 'snap': 'snap-truage-report-whole', 'note': 'absence check: the strings "version" and "Version" occur 0 times in the pdftotext output; no array, lab or replicate statement found (captureCompleteness COMPLETE)'},
  {'ref': 'e1-nine-years', 'snap': 'snap-elysium', 'quote': 'A single sample processed repeatedly can result in epigenetic age estimates that vary up to nine years.'},
  {'ref': 'e2-index-claim', 'snap': 'snap-elysium', 'quote': 'Index is the most precise and reliable among published epigenetic age measures, achieving agreement across technical replicates within zero to 1.5 years.'},
 ],
 'entities': [
  {'ref': 'labtest-truage', 'type': 'LabTest', 'module': 'D4', 'uid': 'hu:lab-test:trudiagnostic-truage', 'name': 'TruDiagnostic TruAge (epigenetic age test)',
   'props': {'testKind': 'ALGORITHM_REPORT', 'orderChannel': 'DIRECT_TO_CONSUMER', 'notReported': ['PERFORMING_LAB', 'SOFTWARE_VERSION']}, 'onMatch': 'use_existing'},
  {'ref': 'av-truage-dunedinpace', 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': 'hu:algorithm-version:dunedinpace-trudiagnostic-unversioned',
   'name': 'DunedinPACE™ as implemented in TruDiagnostic TruAge (version not stated)',
   'props': {'algorithmFamily': 'DunedinPACE', 'familyKey': 'dunedinpace', 'algorithmKind': 'EPIGENETIC_CLOCK', 'realization': 'VENDOR_IMPLEMENTATION', 'versionBasis': 'UNKNOWN',
             'outputKind': 'PACE', 'notReported': ['VERSION_LABEL', 'INPUT_PLATFORM', 'RELIABILITY', 'SOFTWARE_VERSION']}, 'onMatch': 'review'},
  {'ref': 'av-dunedinpace', 'type': 'AlgorithmVersion', 'module': 'D4', 'mode': 'resolved', 'uid': 'hu:algorithm-version:dunedinpace-belsky-2022', 'definedIn': '../dunedinpace-paper-unstructured'},
  {'ref': 'av-horvath1', 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': 'hu:algorithm-version:horvath-2013-multi-tissue', 'name': 'Horvath1 multi-tissue clock (publication version)',
   'props': {'algorithmFamily': 'Horvath multi-tissue clock', 'familyKey': 'horvath1', 'algorithmKind': 'EPIGENETIC_CLOCK', 'realization': 'PUBLICATION_REFERENCE', 'versionBasis': 'PUBLICATION_VERSION', 'outputKind': 'AGE_ESTIMATE'}, 'onMatch': 'use_existing'},
  {'ref': 'av-grimage', 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': 'hu:algorithm-version:grimage-publication', 'name': 'GrimAge (publication version, as evaluated by Higgins-Chen 2022)',
   'props': {'algorithmFamily': 'GrimAge', 'familyKey': 'grimage', 'algorithmKind': 'EPIGENETIC_CLOCK', 'realization': 'PUBLICATION_REFERENCE', 'versionBasis': 'PUBLICATION_VERSION', 'outputKind': 'AGE_ESTIMATE'}, 'onMatch': 'use_existing'},
  {'ref': 'av-elysium-index', 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': 'hu:algorithm-version:elysium-index-unversioned', 'name': 'Elysium Index (vendor algorithm, version not stated)',
   'props': {'algorithmFamily': 'Index', 'familyKey': 'elysium-index', 'algorithmKind': 'EPIGENETIC_CLOCK', 'realization': 'VENDOR_IMPLEMENTATION', 'versionBasis': 'UNKNOWN', 'outputKind': 'AGE_ESTIMATE', 'notReported': ['VERSION_LABEL']}, 'onMatch': 'review'},
  {'ref': 'org-trudiagnostic', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:trudiagnostic', 'name': 'TruDiagnostic', 'onMatch': 'use_existing'},
  {'ref': 'org-elysium', 'type': 'Organization', 'module': 'D7', 'uid': 'hu:org:elysium-health', 'name': 'Elysium Health', 'onMatch': 'use_existing'},
  {'ref': 'agent-curation', 'type': 'Agent', 'module': 'K', 'uid': 'hu:agent:bks-curation-d4', 'name': 'BellLabs D4 curation agent', 'props': {'agentKind': 'AUTOMATED_AGENT'}, 'onMatch': 'use_existing'},
  {'ref': 'claim-truage-retest-3-months', 'type': 'Claim', 'module': 'K', 'uid': 'hu:claim:truage-retest-every-3-months-tracks-progress',
   'name': 'Retesting TruAge every 3 months tracks progress in the rate of aging',
   'props': {'proposition': 'Retesting the TruAge DunedinPACE score every 3 months lets a person track changes in their rate of aging caused by lifestyle interventions.', 'claimType': 'RECOMMENDATION'},
   'onMatch': 'use_existing', 'note': 'added in the adversarial-review pass so the recommendation b03 is a kernel claim occurrence (OCCURRENCE_OF) that vetting and evidence missions can reach'},
  {'ref': 'claim-elysium-index-replicate-agreement', 'type': 'Claim', 'module': 'K', 'uid': 'hu:claim:elysium-index-replicates-agree-within-1.5-years',
   'name': 'Elysium Index agrees across technical replicates within 0-1.5 years and is the most precise published epigenetic age measure',
   'props': {'proposition': 'Elysium Index is the most precise and reliable published epigenetic age measure, with technical replicates agreeing within zero to 1.5 years.', 'claimType': 'COMPARATIVE'},
   'onMatch': 'use_existing', 'note': 'added in the adversarial-review pass (occurrence b06)'},
  {'ref': 'person-higgins-chen', 'type': 'Person', 'module': 'D7', 'uid': 'hu:person:higgins-chen-albert-t', 'name': 'Albert T. Higgins-Chen (first author; asserter for the author group)', 'onMatch': 'use_existing'},
 ],
 'assertions': [
  {'id': 'b01', 'edgeClass': 'asserted', 'predicate': 'PERFORMED_WITH_VERSION', 'assertionKind': 'RELATIONSHIP', 'subject': LT, 'object': AVV, 'objectField': 'LabTest.algorithmVersions',
   'asserter': TDX, 'locators': ['t1-licensed', 't3-report-list'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS,
   'qualifiers': ['episode open as observed 2026-10-08; start date not stated by the vendor'], 'rationale': 'The TruAge Pace of Aging report is computed with the vendor implementation of DunedinPACE.'},
  {'id': 'b02', 'edgeClass': 'asserted', 'predicate': 'DERIVED_FROM_ALGORITHM_VERSION', 'assertionKind': 'RELATIONSHIP', 'subject': AVV, 'object': AVP,
   'asserter': TDX, 'locators': ['t1-licensed', 't2-dunedin-study'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS,
   'qualifiers': ['vendor names the algorithm as exclusively licensed and from the Dunedin Study; cites no publication, version or array', 'derivation, not equivalence (see assessment s02)'],
   'rationale': 'Vendor implementation -> publication version; asserted only from the vendor text.'},
  {'id': 'b03', 'edgeClass': 'literal', 'predicate': 'RECOMMENDS_RETEST_INTERVAL', 'assertionKind': 'CLAIM', 'claimType': 'RECOMMENDATION', 'subject': LT, 'occurrenceOf': CLR,
   'value': {'valueString': 'P3M'}, 'asserter': TDX, 'locators': ['r1-retest', 'r2-change'], 'speechAct': 'RECOMMENDS', 'polarity': 'POSITIVE', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS,
   'note': 'subject = the LabTest, asserter = the Organization (05 predicateOnly updated in the fixtures stage)'},
  {'id': 'b04', 'edgeClass': 'literal', 'predicate': 'REPORTS_RELIABILITY', 'assertionKind': 'METRIC', 'subject': AVH,
   'value': {'valueNumber': 1.8, 'unitCode': 'a', 'valueString': 'median deviation between technical replicates 1.8 years; maximum 4.8 years'},
   'asserter': HC, 'locators': ['h2-horvath1', 'h1-noise'], 'speechAct': 'STATES', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': PUB},
  {'id': 'b05', 'edgeClass': 'literal', 'predicate': 'REPORTS_RELIABILITY', 'assertionKind': 'METRIC', 'subject': AVG,
   'value': {'valueNumber': 0.989, 'unitCode': '1', 'valueString': 'ICC = 0.989 across technical replicates'}, 'asserter': HC, 'locators': ['h4-grimage'],
   'speechAct': 'STATES', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': PUB},
  {'id': 'b06', 'edgeClass': 'literal', 'predicate': 'REPORTS_RELIABILITY', 'assertionKind': 'CLAIM', 'claimType': 'COMPARATIVE', 'subject': AVE, 'occurrenceOf': CLE,
   'value': {'valueString': 'agreement across technical replicates within zero to 1.5 years (vendor claim)'}, 'asserter': ELY, 'locators': ['e2-index-claim', 'e1-nine-years'],
   'speechAct': 'STATES', 'basisKind': 'MANUFACTURER_CLAIM', 'validTime': OBS},
  {'id': 'b07', 'edgeClass': 'literal', 'predicate': 'FIELD_NOT_REPORTED', 'assertionKind': 'FIELD', 'subject': AVV,
   'value': {'valueString': 'VERSION_LABEL, INPUT_PLATFORM, RELIABILITY'}, 'asserter': {'ref': 'agent-curation', 'type': 'Agent'}, 'locators': ['r0-whole', 't4-sites'],
   'speechAct': 'STATES', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': OBS,
   'note': 'kernel convention FIELD_NOT_REPORTED (accepted from D4 11-open-questions #16); site count is stated (1,000,000+), the array product is not'},
 ],
 'assessments': [
  {'id': 's01', 'assessmentKind': 'QUALITY', 'assessmentSubkind': 'D4.change-detectability', 'conclusionCode': 'NO_RELIABILITY_SOURCE', 'status': 'PROPOSED',
   'methodVersion': 'd4-change-detectability/0.1 (fixture)', 'about': ['hu:algorithm-version:dunedinpace-trudiagnostic-unversioned', 'hu:lab-test:trudiagnostic-truage'],
   'inputAssertions': ['b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', '../dunedinpace-paper-unstructured#a06'],
   'evidence': [{'locator': 'r1-retest', 'role': 'CONTEXT'}, {'locator': 'r4-window', 'role': 'CONTEXT'}, {'locator': 'h1-noise', 'role': 'QUALIFIES'}, {'locator': 'h2-horvath1', 'role': 'QUALIFIES'},
                {'locator': 'h3-other-clocks', 'role': 'QUALIFIES'}, {'locator': 'r0-whole', 'role': 'CONTEXT'}],
   'evidenceRoleNote': ('h1-h3 are QUALIFIES, not CONTRADICTS (adversarial review): Higgins-Chen 2022 measures replicate noise of other CpG clocks and never evaluates '
                        'DunedinPACE (the BioC capture contains no "Dunedin"); the h3 sentence follows "Focusing additional analyses on 6 clocks". Class-level noise '
                        'qualifies the vendor advice; it does not disconfirm it.'),
   'effectDirection': 'UNKNOWN', 'evidenceCutoffAt': '2026-10-08T17:45:00-04:00',
   'summary': ('The vendor advises retesting every 3 months to track change and notes that the pace score is "*Based on the last 2-3 months", but publishes no '
               'replicate or reliability data for its DunedinPACE™ pipeline (version, array and lab not stated). The publication version reports test-retest ICC 0.96 '
               'on 450k replicates (points toward reliability); other CpG clocks show replicate deviations of years (class-level context, not DunedinPACE). '
               'Whether a 3-month change exceeds technical noise for this pipeline is not established: a reliability gap, not a disconfirmation.'),
   'questions': ['CQ-DX-05', 'Q-D4-05', 'Q-D4-15']},
  {'id': 's02', 'assessmentKind': 'EQUIVALENCE', 'assessmentSubkind': 'D4.algorithm-equivalence', 'conclusionCode': 'UNRESOLVED', 'status': 'PROPOSED',
   'methodVersion': 'd4-algorithm-equivalence/0.1 (fixture)', 'about': ['hu:algorithm-version:dunedinpace-trudiagnostic-unversioned', 'hu:algorithm-version:dunedinpace-belsky-2022'],
   'inputAssertions': ['b02', 'b07'], 'evidence': [{'locator': 't1-licensed', 'role': 'CONTEXT'}, {'locator': 't2-dunedin-study', 'role': 'CONTEXT'}],
   'summary': 'Vendor implementation names the publication algorithm (licensed) but states no version, array or reproducibility against the reference code; same numbers not established.',
   'questions': ['Q-D4-06', 'Q-D4-20']},
 ],
 'intentNotes': ('Fixture intent (fixture ids). OCCURRENCE_OF of the claim occurrences b03 and b06 (-> the two Claim subjects) has no intent v1 field (11-open-questions #25). Assessments s01/s02 are not expressible in biotech-knowledge-intent.v1 (no assessment proposal kind; they are '
                 'written by a QUALITY/EQUIVALENCE assessment activity) and live only in assertions.yaml. assertionKind CLAIM / claimType RECOMMENDATION of b03 '
                 'and b06 have no AssertionCore field. The WHOLE_SNAPSHOT locator r0-whole is declared on the sample-report source.'),
}

FX['questionsMd'] = """# Fixture clock-noise-vs-retest-advice - questions answered

Kind: reliability-gap (relabelled from disconfirmation in the adversarial-review pass). The vendor's advice and naming are recorded as located assertions; the advice is a kernel claim occurrence (b03 OCCURRENCE_OF a Claim); the verdict is a kernel Assessment, never a clock property. No captured source measures DunedinPACE's own replicate noise, so the evidence qualifies the advice and does not contradict it.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| CQ-DX-05 | For the TruAge DunedinPACE™ pipeline: **no reliability source** (verdict NO_RELIABILITY_SOURCE). The publication version has ICC 0.96 (450k replicates; points toward reliability); other CpG clocks show replicate deviations of 0.9-2.4 years median, up to 8.6 years max (QUALIFIES, class-level); nothing ties those numbers to this pipeline. | s01; b04, b05, b07; ../dunedinpace-paper-unstructured a06 |
| Q-D4-05 | "Retest every 3 months to track your progress" (located vendor advice, b03, a claim occurrence of the Claim "retesting TruAge every 3 months tracks progress"; the vendor's only nearby rationale is "*Based on the last 2-3 months") cannot be shown to detect real change: change detectability **not established** for this pipeline. | s01, b03, r1-retest, r4-window |
| Q-D4-15 | A biological-age "improvement" between two TruAge tests rests on one vendor pipeline with unstated version and no published replicate noise -> the claim's support is incomplete (input to a D4.bio-age-claim-disconfirmation assessment; no specific claim captured here). | s01 |
| Q-D4-04 | TruAge reports DunedinPACE™ via an exclusively licensed algorithm; version: NOT_REPORTED; array: NOT_REPORTED (1,000,000+ sites stated); lab: NOT_REPORTED; reliability source: none in the captured page or sample report. | b01, b07, t4-sites, r0-whole |
| Q-D4-06 | The vendor DunedinPACE™ is a distinct AlgorithmVersion (VENDOR_IMPLEMENTATION, versionBasis UNKNOWN) DERIVED_FROM the publication version; equivalence UNRESOLVED. | b02, s02 |
| Q-D4-20 | DunedinPACE is offered by TruDiagnostic (licensed; sample report header "DEVELOPED WITH DUKE"); the publication behind it is Belsky et al. 2022. | b02, r3-duke |

Contrast (weighed, not adopted): Elysium claims (b06, a claim occurrence of its own Claim) its Index agrees across technical replicates "within zero to 1.5 years" while stating that a single sample can vary "up to nine years" on other clocks - a manufacturer claim (b06) that would need the cited replicate study to count as a reliability source.
"""

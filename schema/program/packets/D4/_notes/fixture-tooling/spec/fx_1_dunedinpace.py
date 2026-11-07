import os
RULE = "python: re.sub(r'\\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', xml_utf8))) (tags -> space, entities unescaped, whitespace runs -> one space, no strip)"
TXT = 'epmc-PMC8853656.txt'
P = {'ref': 'person-belsky', 'type': 'Person'}
AV = {'ref': 'av-dunedinpace', 'type': 'AlgorithmVersion'}
AV0 = {'ref': 'av-dunedinpoam', 'type': 'AlgorithmVersion'}
M = {'ref': 'metric-dunedinpace', 'type': 'Metric'}
B = {'ref': 'biomarker-pace', 'type': 'Biomarker'}
CUR = {'ref': 'agent-curation', 'type': 'Agent'}
VT_PUB = {'validFrom': None, 'validFromBasis': 'UNKNOWN', 'statedAsOf': '2022-01-14T00:00:00Z', 'statedAsOfPrecision': 'DAY'}

# --- question -> chunk -> assertion -> locator -> snapshot (00-DIRECTIVE 3.8), computed on the derived text
_b, _t, _e = load(TXT)
SIZE, STRIDE = 1500, 1300
def chunk_of(q):
    i = _t.find(q); j = i + len(q)
    k = max(0, (j - SIZE + STRIDE - 1) // STRIDE)
    while k * STRIDE > i: k -= 1
    while not (k * STRIDE <= i and j <= k * STRIDE + SIZE): k += 1
    s, e = k * STRIDE, min(len(_t), k * STRIDE + SIZE)
    return {'chunkIndex': k, 'uid': f'hu:chunk:ft-d4-dpace-{k:03d}', 'startOffset': s, 'endOffset': e,
            'textHash': 'sha256:' + sha(_t[s:e].encode('utf8')), 'mentionsDunedinPACE': _t[s:e].count('DunedinPACE')}
Q = {'L1': 'Using Illumina EPIC array DNA methylation data from blood collected at age 45, we developed DunedinPACE to provide a surrogate for the 20-year Pace of Aging.',
     'L2': 'The resulting algorithm included 173 CpG sites.',
     'L3': 'For DunedinPACE, reliability was excellent (ICC = 0.96 [0.93–0.98]; Figure 2 ).',
     'L4': 'It can be implemented in Illumina 450 k or in EPIC array data'}
CH = {k: chunk_of(v) for k, v in Q.items()}

FX = {
 'id': 'dunedinpace-paper-unstructured', 'short': 'dpace', 'kind': 'unstructured-to-entity',
 'candidate': 'FC-3 in ../../_notes/fixture-candidates.md',
 'description': ("Belsky et al. 2022 (eLife 11:e73420; PMID 35029144; PMCID PMC8853656; DOI 10.7554/eLife.73420), captured as Europe PMC "
   "JATS full-text XML. The fixture walks the 00-DIRECTIVE 3.8 path for one real document: the question 'which platform and inputs does "
   "DunedinPACE need, and how reliable is it?' (CQ-DX-04, Q-D4-22) is answered by finding chunks of the derived text (D9 Chunk, via the "
   "fulltext/vector index or Chunk -MENTIONS-> AlgorithmVersion), hopping Chunk -COVERS_LOCATOR-> SourceLocator <-HAS_EVIDENCE- Assertion, "
   "and verifying each locator against the snapshot bytes (sha256 of the XML; the derived text is re-made by the stated rule and re-selected "
   "by offsets and exact quote). It exercises OUTPUTS_METRIC (publication AlgorithmVersion -> Metric 'DunedinPACE pace of aging'), QUANTIFIES "
   "(Metric -> Biomarker 'pace of biological aging') and the publication side of DERIVED_FROM_ALGORITHM_VERSION (DunedinPACE -> its "
   "predecessor DunedinPoAm; the vendor -> publication side is in ../clock-noise-vs-retest-advice). Quotes are short excerpts of a CC0 article."),
 'citation': ("https://doi.org/10.7554/eLife.73420 · Belsky DW et al., 'DunedinPACE, a DNA methylation biomarker of the pace of aging', eLife 2022;11:e73420 "
   "(PMID 35029144, PMCID PMC8853656) · retrieved 2026-10-08 via https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8853656/fullTextXML"),
 'snapshots': [
  {'ref': 'snap-epmc-xml', 'url': 'https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8853656/fullTextXML',
   'title': 'Belsky et al. 2022, DunedinPACE, a DNA methylation biomarker of the pace of aging, eLife 11:e73420 (Europe PMC JATS XML; PMID 35029144; DOI 10.7554/eLife.73420)',
   'file': 'epmc-PMC8853656.xml', 'textFile': TXT, 'textRule': RULE, 'basis': 'text',
   'offsetBasis': 'Unicode code points of the derived text (see derivedText.rule) of the XML snapshot',
   'digest': 'dd24c21863993f6398cb4092d746217f145ed6080a75a950123cf0586d0200b7', 'researchDigest': 'dd24c21863993f6398cb4092d746217f145ed6080a75a950123cf0586d0200b7',
   'sourceKind': 'API', 'genre': 'PEER_REVIEWED_PUBLICATION', 'retrievedAt': '2026-10-08T17:39:00-04:00', 'mime': 'application/xml',
   'tool': 'curl Europe PMC REST fullTextXML (no key)'}],
 'locators': [
  {'ref': 'l1-epic-age45', 'snap': 'snap-epmc-xml', 'quote': Q['L1'], 'section': 'Results: DunedinPACE distills the 20-year Pace of Aging'},
  {'ref': 'l2-173-cpgs', 'snap': 'snap-epmc-xml', 'quote': Q['L2'], 'section': 'Results'},
  {'ref': 'l3-icc', 'snap': 'snap-epmc-xml', 'quote': Q['L3'], 'section': 'Results: test-retest reliability'},
  {'ref': 'l3b-replicates', 'snap': 'snap-epmc-xml', 'quote': 'We first evaluated test-retest reliability of DunedinPACE using a publicly available database of 36 replicate adult-blood-sample Illumina 450 k datasets', 'section': 'Results: test-retest reliability'},
  {'ref': 'l4-450k-epic', 'snap': 'snap-epmc-xml', 'quote': Q['L4'], 'section': 'Discussion'},
  {'ref': 'l6-unit', 'snap': 'snap-epmc-xml', 'quote': 'an average rate of 1 year of biological aging per year of chronological aging', 'section': 'Results'},
  {'ref': 'l7-predecessor', 'snap': 'snap-epmc-xml', 'quote': 'The value indicates improved fit of the DunedinPACE model to the 20-year Pace of Aging as compared to the original DunedinPoAm version’s fit to the 12-year Pace of Aging (in-sample correlation r = 0.6).', 'section': 'Results'},
  {'ref': 'l8-biomarker', 'snap': 'snap-epmc-xml', 'quote': 'DunedinPACE is a novel DNA methylation biomarker of the pace of biological aging', 'section': 'Author impact statement'},
 ],
 'entities': [
  {'ref': 'av-dunedinpace', 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': 'hu:algorithm-version:dunedinpace-belsky-2022', 'name': 'DunedinPACE (Belsky et al. 2022, eLife 11:e73420)',
   'props': {'algorithmFamily': 'DunedinPACE', 'familyKey': 'dunedinpace', 'algorithmKind': 'EPIGENETIC_CLOCK', 'realization': 'PUBLICATION_REFERENCE',
             'versionBasis': 'PUBLICATION_VERSION', 'outputKind': 'PACE', 'inputPlatforms': ['ILLUMINA_450K', 'ILLUMINA_EPIC_V1'], 'inputFeatureCount': 173,
             'trainingPopulationText': 'Dunedin Study members, blood DNA methylation (Illumina EPIC) at age 45, trained on 20-year Pace of Aging'}, 'onMatch': 'use_existing'},
  {'ref': 'av-dunedinpoam', 'type': 'AlgorithmVersion', 'module': 'D4', 'uid': 'hu:algorithm-version:dunedinpoam-belsky-2020', 'name': 'DunedinPoAm (Belsky et al. 2020, eLife e54870)',
   'props': {'algorithmFamily': 'DunedinPoAm', 'familyKey': 'dunedinpoam', 'algorithmKind': 'EPIGENETIC_CLOCK', 'realization': 'PUBLICATION_REFERENCE', 'versionBasis': 'PUBLICATION_VERSION', 'outputKind': 'PACE'}, 'onMatch': 'use_existing'},
  {'ref': 'metric-dunedinpace', 'type': 'Metric', 'module': 'D4', 'uid': 'hu:metric:dunedinpace-pace-of-aging', 'name': 'DunedinPACE pace of aging (biological years per chronological year)',
   'props': {'metricKind': 'ALGORITHM_OUTPUT', 'defaultResultKind': 'INFERRED', 'definitionSource': 'PUBLICATION', 'definitionIssuerName': 'Belsky et al. 2022',
             'definitionText': 'an average rate of 1 year of biological aging per year of chronological aging', 'systemText': 'Bld (DNA methylation in blood)',
             'scale': 'QUANTITATIVE', 'canonicalUnitCode': 'a/a', 'searchText': 'DunedinPACE pace of aging biological age speed DNA methylation'}, 'onMatch': 'use_existing'},
  {'ref': 'biomarker-pace', 'type': 'Biomarker', 'module': 'D4', 'uid': 'hu:biomarker:pace-of-biological-aging', 'name': 'Pace of biological aging',
   'props': {'biomarkerKind': 'COMPOSITE_AGING_INDEX', 'searchText': 'pace of aging, rate of biological aging, aging speed'}, 'onMatch': 'use_existing'},
  {'ref': 'person-belsky', 'type': 'Person', 'module': 'D7', 'uid': 'hu:person:belsky-daniel-w', 'name': 'Daniel W. Belsky (first author; asserter for the author group)', 'onMatch': 'use_existing'},
  {'ref': 'agent-curation', 'type': 'Agent', 'module': 'K', 'uid': 'hu:agent:bks-curation-d4', 'name': 'BellLabs D4 curation agent', 'props': {'agentKind': 'AUTOMATED_AGENT'}, 'onMatch': 'use_existing'},
 ],
 'assertions': [
  {'id': 'a01', 'edgeClass': 'asserted', 'predicate': 'DERIVED_FROM_ALGORITHM_VERSION', 'assertionKind': 'RELATIONSHIP',
   'subject': AV, 'object': AV0, 'asserter': P, 'locators': ['l7-predecessor'], 'speechAct': 'STATES', 'polarity': 'POSITIVE', 'basisKind': 'DIRECT_MEASUREMENT',
   'validTime': VT_PUB, 'qualifiers': ['successor -> predecessor (publication side): DunedinPACE refits the DunedinPoAm design to the 20-year Pace of Aging'],
   'rationale': 'Authors compare DunedinPACE with "the original DunedinPoAm version"; successor -> predecessor edge, not an equivalence.'},
  {'id': 'a02', 'edgeClass': 'structural', 'predicate': 'OUTPUTS_METRIC', 'subject': AV, 'object': M, 'asserter': P, 'locators': ['l1-epic-age45', 'l6-unit'],
   'rationale': 'Definitional: the publication version outputs the pace-of-aging metric whose unit is biological years per chronological year.'},
  {'id': 'a03', 'edgeClass': 'structural', 'predicate': 'QUANTIFIES', 'subject': M, 'object': B, 'asserter': P, 'locators': ['l8-biomarker'],
   'rationale': 'The metric quantifies the biomarker "pace of biological aging" (author impact statement).'},
  {'id': 'a04', 'edgeClass': 'field', 'predicate': 'AlgorithmVersion.inputFeatureCount', 'assertionKind': 'FIELD', 'subject': AV, 'value': {'valueNumber': 173},
   'asserter': P, 'locators': ['l2-173-cpgs'], 'speechAct': 'STATES', 'intentProperties': {'inputFeatureCount': 173}},
  {'id': 'a05', 'edgeClass': 'field', 'predicate': 'AlgorithmVersion.inputPlatforms', 'assertionKind': 'FIELD', 'subject': AV, 'value': {'valueString': 'ILLUMINA_450K, ILLUMINA_EPIC_V1'},
   'asserter': P, 'locators': ['l4-450k-epic', 'l1-epic-age45'], 'speechAct': 'STATES', 'intentProperties': {'inputPlatforms': ['ILLUMINA_450K', 'ILLUMINA_EPIC_V1']},
   'qualifiers': ['source says "EPIC" (2022, before EPIC v2); EPIC_V1 is the curator mapping of that word']},
  {'id': 'a06', 'edgeClass': 'literal', 'predicate': 'REPORTS_RELIABILITY', 'assertionKind': 'METRIC', 'subject': AV,
   'value': {'valueNumber': 0.96, 'valueString': 'ICC = 0.96 [0.93–0.98], test-retest, 36 replicate adult blood samples, Illumina 450k (GSE55763)', 'unitCode': '1'},
   'asserter': P, 'locators': ['l3-icc', 'l3b-replicates'], 'speechAct': 'STATES', 'basisKind': 'DIRECT_MEASUREMENT', 'validTime': VT_PUB,
   'qualifiers': ['population: 36 replicate adult-blood-sample datasets (Lehne et al. 2015)', 'platform: Illumina 450k']},
 ],
 'retrievalPath': {
  'question': {'id': 'CQ-DX-04', 'alsoAnswers': ['Q-D4-22', 'CQ-DX-05'], 'text': 'Which platform and inputs does DunedinPACE need, which version is it, and how reliable is it?'},
  'step1_entityLookup': {'index': 'fulltext d4_measure_names over Metric.searchText / AlgorithmVersion name (03-retrieval-patterns Q-D4-22)', 'term': 'DunedinPACE',
                         'hits': ['hu:algorithm-version:dunedinpace-belsky-2022', 'hu:metric:dunedinpace-pace-of-aging']},
  'step2_chunks': {'via': ['(c:Chunk)-[:MENTIONS]->(av) (derived entity-link projection, D9; never evidence)', 'or vector index on Chunk embedding with the question text'],
                   'chunker': f'fixed-char-window/v1 size={SIZE} stride={STRIDE} over the derived text (textVersionHash = derivedText.contentHash)',
                   'chunks': {k: v for k, v in CH.items()}},
  'step3_assertions': {'hop': '(c:Chunk)-[:COVERS_LOCATOR]->(l:SourceLocator)<-[:HAS_EVIDENCE {role: SUPPORTS}]-(a:Assertion) (COVERS_LOCATOR is D9 derived span-overlap)',
                       'chunkToLocators': {CH['L1']['uid']: ['l1-epic-age45'], CH['L2']['uid']: ['l2-173-cpgs'], CH['L3']['uid']: ['l3-icc'], CH['L4']['uid']: ['l4-450k-epic']},
                       'locatorToAssertions': {'l1-epic-age45': ['a02', 'a05'], 'l2-173-cpgs': ['a04'], 'l3-icc': ['a06'], 'l4-450k-epic': ['a05']}},
  'step4_snapshot': {'hop': '(s:SourceSnapshot {contentHash})-[:HAS_LOCATOR]->(l:SourceLocator)', 'snapshot': 'snap-epmc-xml',
                     'bytes': 'sha256:dd24c21863993f6398cb4092d746217f145ed6080a75a950123cf0586d0200b7'},
  'step5_verifierReselect': ('verification.v1 re-reads the snapshot bytes, re-derives the text with derivedText.rule, selects [startOffset, endOffset) and '
                             'compares with exact and quoteHash; a mismatch is LOCATOR_ERROR (infrastructure verdict, never rejects the record). '
                             'The same SourceLocator is the one the answer cites, so the retrieval path and the verifier path end on the same bytes.'),
  'cypher': ("CALL db.index.fulltext.queryNodes('d4_measure_names', 'DunedinPACE') YIELD node AS x\n"
             "MATCH (c:Chunk)-[:MENTIONS]->(x)\n"
             "MATCH (c)-[:COVERS_LOCATOR]->(l:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)-[:HAS_SUBJECT]->(av:AlgorithmVersion)\n"
             "WHERE a.recordedTo IS NULL AND a.status IN ['ACCEPTED','PROPOSED']\n"
             "MATCH (s:SourceSnapshot)-[:HAS_LOCATOR]->(l)\n"
             "RETURN av.uid, a.predicate, coalesce(a.valueString, toString(a.valueNumber)), l.exact, l.startOffset, l.endOffset, s.contentHash"),
  'expectedRows': [
   {'assertion': 'a05', 'answer': 'inputs: Illumina 450k or EPIC DNA methylation array data (blood)', 'locator': 'l4-450k-epic'},
   {'assertion': 'a04', 'answer': '173 CpG sites', 'locator': 'l2-173-cpgs'},
   {'assertion': 'a06', 'answer': 'test-retest ICC 0.96 [0.93-0.98] on 36 replicate 450k samples', 'locator': 'l3-icc'},
   {'assertion': 'a02', 'answer': 'outputs DunedinPACE pace of aging (years/year); version = publication version Belsky 2022', 'locator': 'l1-epic-age45'}]},
 'intentNotes': ('Fixture intent (fixture ids, not a real run). Not expressible in biotech-knowledge-intent.v1 and therefore recorded only in assertions.yaml: '
                 'assertionKind/claimType of an Assertion (no AssertionCore field), the reliability value as a typed METRIC assertion (sent as assertion.literal), '
                 'and Chunk / MENTIONS / COVERS_LOCATOR (derived retrieval projections written by the D9 chunker and entity-link jobs, never by an ingestion intent). '
                 'Structural edges carry evidence so the planner can cite the captured record. The asserter of edge.structural cannot be named in v1.'),
 'questionsMd': None,
}

FX['questionsMd'] = f"""# Fixture dunedinpace-paper-unstructured - questions answered

Kind: unstructured-to-entity (00-DIRECTIVE 3.8). The full path is in `assertions.yaml` → `retrievalPath`; chunk offsets are computed on the derived text (fixed 1,500-character windows, stride 1,300), so they are reproducible from the snapshot bytes.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| CQ-DX-04 | DunedinPACE as published is AlgorithmVersion `hu:algorithm-version:dunedinpace-belsky-2022` (realization PUBLICATION_REFERENCE, versionBasis PUBLICATION_VERSION: the version is the publication, not a vendor string); it succeeds DunedinPoAm (DERIVED_FROM_ALGORITHM_VERSION, a01) | a01, l7-predecessor |
| Q-D4-22 | the free-text name "DunedinPACE" resolves through the fulltext index to the AlgorithmVersion and its Metric; chunks {CH['L1']['chunkIndex']}, {CH['L2']['chunkIndex']}, {CH['L3']['chunkIndex']}, {CH['L4']['chunkIndex']} carry the answer spans | retrievalPath step 1-2 |
| CQ-DX-02 | the value is INFERRED (Metric.defaultResultKind; an algorithm output from DNA methylation, a surrogate for the 20-year Pace of Aging), produced by the publication AlgorithmVersion | a02, l1-epic-age45 |
| Q-D4-16 | Metric `dunedinpace-pace-of-aging` QUANTIFIES Biomarker `pace-of-biological-aging`; any other pace/age metric is a separate Metric of the same Biomarker, never merged into one series | a03, l8-biomarker |
| CQ-DX-05 (input) | reliability source for this version: test-retest ICC = 0.96 [0.93–0.98] on 36 replicate 450k blood samples — consumed by the change-detectability assessment in ../clock-noise-vs-retest-advice | a06, l3-icc, l3b-replicates |
| Q-D4-06 (publication side) | the publication version that a vendor "DunedinPACE™" is DERIVED_FROM; equivalence is not asserted here | ../clock-noise-vs-retest-advice b02 |

Expected inputs answer (CQ-DX-04 / Q-D4-22): "Illumina 450k or EPIC DNA methylation array data from blood; 173 CpG sites; trained on Dunedin Study blood at age 45; test-retest ICC 0.96 [0.93–0.98] (36 replicate 450k samples)", every clause cited to a locator whose bytes hash to the snapshot digest.
"""

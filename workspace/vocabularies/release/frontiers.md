---
id: "vocab:frontiers"
kind: "vocabulary"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:vocabularies/frontiers.yaml"]
aliases: ["frontiers","frontiers"]
capabilities: ["get"]
cardDigest: "sha256:fcbc1fc98dd92502e3b1006ec5e9e6ec3969d8f2d6903dd00ec87c531eabb41f"
---
# Vocabulary frontiers

Release vocabulary `vocabularies/frontiers.yaml` (sha256 `0ec7d348a1a05f8f…`).

- **version**: 0.2.1
- **status**: model-stage-published
- **published**: 2026-10-08

### changelog (3)

| version | date | by | summary |
| --- | --- | --- | --- |
| 0.1.0 | 2026-10-08 | A7 (Wave 0) | first publication (24 frontiers, 17 milestone kinds, 27 event kinds, event relations, seam rule, query shapes) |
| 0.2.0 | 2026-10-08 | A7 (D13 model stage) | Rebased on the published kernel pattern (A1): ON_FRONTIER carries the kernel AssertedEdgeProperties and the vocab version moves to the clas… |
| 0.2.1 | 2026-10-08 | A7 (D13 adversarial-review pass) | No id, key or value added or removed. Corrections: the Study side of ON_FRONTIER is declared by D13 (Frontier.studies, direction IN), D3 de… |

- **owner**: D13
- **agent**: A7
- **consumers** (9): K, D2, D3, D5, D7, D8, D9, D10, D11
- **sharedVocabulariesConsumed**: targets, regulatory-pathways
- **kernelPattern**: Rebased in 0.2.0 on A1's published kernel pattern (packets/K/09-reasoning.md, 2026-10-08): Event and Frontier implement Entity & Subjectable; subject/object/asserter/evidence are kernel edges (HAS_SUBJECT, HAS_OBJECT, ASSERTED_BY, HAS_EVIDENCE {role} -> SourceLocator; SUPPORTED_BY is retired); lineage is WAS_GENERATED_BY -> Activity and lastWriterRunId on edges. The executable query shapes for ev…
- **citations**: C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11, C12, C13, C14, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C28, C29, C30, C31, C32, C33, C34, C35, C36, C37, C38, C39, C40, C41, C42, C43, C44, C45, C46, C47, C48, C49, C50, C51, C52, C53, C54, C55, C56, C57, C58, C59, C60,…
- **node**: type, labels, uidPattern, idPattern, identityKeys, properties, notStoredOnFrontier, disambiguation
- **admissionRule**: mustAll, granularity, hierarchy, lifecycle, sizeTarget

### frontiers (25)

| id | label | level | parent |
| --- | --- | --- | --- |
| frontier:geroscience-in-humans | Targeting the biology of aging in humans | 1 |  |
| frontier:senolytics-in-humans | Senolytics in humans | 2 | frontier:geroscience-in-humans |
| frontier:partial-epigenetic-reprogramming | Partial epigenetic reprogramming | 2 | frontier:geroscience-in-humans |
| frontier:mtor-inhibition-healthy-aging | mTOR inhibition for healthy aging | 2 | frontier:geroscience-in-humans |
| frontier:nad-restoration | NAD+ restoration | 2 | frontier:geroscience-in-humans |
| frontier:aging-as-indication | Aging as a regulatory indication and trial endpoint | 2 | frontier:geroscience-in-humans |
| frontier:companion-animal-longevity-drugs | Lifespan-extension drugs for companion animals | 2 | frontier:geroscience-in-humans |
| frontier:gene-therapy-for-aging | Gene therapy for aging | 2 | frontier:geroscience-in-humans |
| frontier:incretin-and-metabolic-medicine | Incretin and metabolic medicine beyond weight loss | 1 |  |
| frontier:glp1-beyond-obesity | GLP-1 class beyond obesity | 2 | frontier:incretin-and-metabolic-medicine |
| frontier:oral-small-molecule-incretins | Oral small-molecule incretins | 2 | frontier:incretin-and-metabolic-medicine |
| frontier:muscle-preserving-weight-loss | Muscle-preserving weight loss | 2 | frontier:incretin-and-metabolic-medicine |
| frontier:mash-fibrosis-resolution | Resolving MASH and liver fibrosis | 2 | frontier:incretin-and-metabolic-medicine |
| frontier:curing-hard-cancers | Curing hard-to-treat cancers | 1 |  |
| frontier:curing-pancreatic-cancer | Curing pancreatic cancer | 2 | frontier:curing-hard-cancers |
| frontier:individualized-neoantigen-vaccines | Individualized neoantigen cancer vaccines | 2 | frontier:curing-hard-cancers |
| frontier:in-vivo-genetic-medicine | In vivo genetic medicine | 1 |  |
| frontier:in-vivo-gene-editing | In vivo gene editing for common disease | 2 | frontier:in-vivo-genetic-medicine |
| frontier:immune-reset-cell-therapy | Engineered cell therapy and immune reset | 1 |  |
| frontier:in-vivo-car-t | In vivo CAR-T | 2 | frontier:immune-reset-cell-therapy |
| frontier:car-t-for-autoimmune-disease | CAR-T for autoimmune disease | 2 | frontier:immune-reset-cell-therapy |
| frontier:neurodegeneration-modification | Disease modification in neurodegeneration | 1 |  |
| frontier:alzheimers-disease-modification | Alzheimer's disease modification and prevention | 2 | frontier:neurodegeneration-modification |
| frontier:organ-replacement | Organ and tissue replacement | 1 |  |
| frontier:xenotransplantation | Xenotransplantation | 2 | frontier:organ-replacement |


### milestoneKinds (18)

| id | eventKinds | qualifier | ladderRank |
| --- | --- | --- | --- |
| ms:regulatory-path-accepted | REGULATORY_ACCEPTANCE, REGULATORY_DESIGNATION | an IND/CTA clearance, a veterinary technical-section acceptance, or a regulator agreeing an endpoint/indication | 1 |
| ms:first-in-human | TRIAL_START | first participant dosed with an intervention of the frontier's modality/mechanism (firstness computed) | 2 |
| ms:expedited-designation | REGULATORY_DESIGNATION | Breakthrough Therapy, RMAT, PRIME, Fast Track, priority voucher, Orphan | 3 |
| ms:randomized-readout | READOUT | randomized controlled trial readout, any phase (design from D3 Study) | 4 |
| ms:pivotal-readout | READOUT | registrational / Phase 3 readout (D3 Study phase or the sponsor's 'registrational' statement) | 5 |
| ms:regulatory-filing-accepted | REGULATORY_SUBMISSION, REGULATORY_ACCEPTANCE | NDA/BLA/MAA submitted or accepted for review | 6 |
| ms:first-approval | APPROVAL | first marketing authorization in any major jurisdiction for an intervention on the frontier (firstness computed; jurisdiction required) | 7 |
| ms:diagnostic-clearance | APPROVAL | device clearance/approval of a test that gates treatment on the frontier (approvalPathway US_DEVICE_510K, US_DEVICE_DE_NOVO, US_DEVICE_PMA;… | 7 |
| ms:launch | LAUNCH | commercial availability after approval | 8 |
| ms:label-expansion | APPROVAL | new indication for an already-approved intervention (supplemental approval) | 8 |
| ms:major-financing | FINANCING, AWARD | a financing or prize the source quantifies (FINANCING_AMOUNT on a FINANCING Event; an AWARD Event's amount is the D7 Award it is about); si… |  |
| ms:strategic-transaction | ACQUISITION, PARTNERSHIP | a large company acquiring or partnering into the frontier |  |
| ms:policy-change | POLICY_CHANGE, REGULATORY_STATUS_CHANGE | a regulator or legislature changes the rules that govern the frontier |  |
| ms:regulatory-status-change | REGULATORY_STATUS_CHANGE, POLICY_CHANGE | lawful-status change of a substance or product class (e.g. supplement eligibility) |  |
| ms:safety-signal | SAFETY_SIGNAL, RECALL, MARKET_WITHDRAWAL | a reported serious adverse event, death, boxed warning, recall or withdrawal on the frontier |  |
| ms:clinical-hold | CLINICAL_HOLD, CLINICAL_HOLD_LIFTED | regulator hold and its resolution |  |
| ms:setback | READOUT, REJECTION, PROGRAM_DISCONTINUATION, RETRACTION, CLINICAL_HOLD, ENFORCEMENT_ACTION | READOUT only when the source states the primary endpoint was not met; otherwise the kind itself is the setback |  |
| ms:guidance-slip |  | COMPUTED lens, not an event kind (0.2.0): a PLANNED event whose latest EVENT_SCHEDULED window starts after the first stated window ends, or… |  |

- **ladderNote**: ladderRank orders the generic path regulatory-path -> first-in-human -> designation -> randomized -> pivotal -> filing -> approval -> launch/expansion. "Furthest rung reached on F as of T" is QF-02 (computed). Calling a milestone a "breakthrough" is section 6, never a rung.

### eventKinds (26)

| value | family | definition | typicalSources |
| --- | --- | --- | --- |
| TRIAL_START | CLINICAL | first participant dosed or trial opened to enrollment, as stated by sponsor or registry | press release, ClinicalTrials.gov status history |
| READOUT | CLINICAL | first public disclosure of a trial's results (topline, interim, primary analysis). Qualifiers stated by the source: readoutStage (TOPLINE \|… | press release, 8-K Item 7.01/8.01, conference abstract |
| DATA_PRESENTATION | CLINICAL | presentation of fuller data at a named conference session (predicate PRESENTED_AT_CONFERENCE → D9 Channel with channelKind EVENT_SERIES; ed… | conference abstract, slide deck, press release |
| RETRACTION | SCIENTIFIC_RECORD | A curated frontier milestone only (synthesis R-44): EVENT_ABOUT → D3 Publication; its clock cites the retraction notice's locator and no se… | Crossref update metadata, Retraction Watch, publisher notice |
| REGULATORY_SUBMISSION | REGULATORY | IND/CTA/NDA/BLA/MAA or veterinary technical section submitted (incl. rolling submission start) | press release, 8-K |
| REGULATORY_ACCEPTANCE | REGULATORY | regulator accepts a filing for review, clears an IND/CTA, or accepts a technical section (e.g. FDA CVM RXE/TAS). A PDUFA goal date announce… | regulator letter, press release |
| REGULATORY_DESIGNATION | REGULATORY | expedited or special designation granted: Breakthrough Therapy (C01), Fast Track, RMAT, PRIME, Orphan, priority review voucher. Qualifier d… | press release, regulator databases where public |
| ADVISORY_COMMITTEE | REGULATORY | advisory committee meeting and vote | FDA advisory calendar, briefing documents, minutes |
| APPROVAL | REGULATORY | marketing authorization or device clearance. Qualifier approvalPathway, typed by D8 RegulatoryPathway (synthesis R-66; e.g. US_DRUG_NDA, US… | approval letter, Drugs@FDA/openFDA, EMA EPAR, press release |
| REJECTION | REGULATORY | complete response letter, refusal to file, negative opinion, non-approval | press release, 8-K, EMA CHMP minutes |
| CLINICAL_HOLD | REGULATORY | an order issued by FDA to the sponsor to delay a proposed clinical investigation or to suspend an ongoing investigation (21 CFR 312.42, C02… | press release, 8-K |
| CLINICAL_HOLD_LIFTED | REGULATORY | regulator removes a clinical hold (full or partial) | press release, 8-K |
| REGULATORY_STATUS_CHANGE | REGULATORY | change of lawful status of a substance/product class (scheduling, supplement eligibility, GRAS) — the status record is D8 | regulator letters, Federal Register |
| ENFORCEMENT_ACTION | REGULATORY | warning letter, import alert, injunction, seizure against a party (record is D8) | FDA warning letters, DOJ releases |
| POLICY_CHANGE | POLICY | new guidance, rule, pathway or program from a regulator, legislature or payer that changes how a frontier is developed or reimbursed | Federal Register, regulator press release |
| LAUNCH | COMMERCIAL | commercial availability of an approved product in a jurisdiction. Often only PLANNED in the approval release ('expected to be available ...… | press release, earnings call |
| RECALL | SAFETY | product recall (class stated by the regulator); record is D8 | FDA enforcement reports, openFDA recall API |
| MARKET_WITHDRAWAL | SAFETY | product withdrawn from market (safety, efficacy or commercial reason stated) | regulator notice, press release |
| SAFETY_SIGNAL | SAFETY | publicly reported serious adverse event, death, dosing pause, boxed warning or safety communication. The event is the disclosure; any judgm… | press release, 8-K, FDA Drug Safety Communication, FAERS (aggregate, never an event by itself) |
| PROGRAM_DISCONTINUATION | CORPORATE | sponsor stops a program, deprioritizes an indication, terminates a trial, or winds down. Qualifier discontinuationScope TRIAL \| PROGRAM \| C… | press release, 10-Q/10-K, ClinicalTrials.gov status TERMINATED/WITHDRAWN |
| FINANCING | FINANCIAL | equity, debt, royalty or grant financing; IPO; follow-on; at-the-market sales. Amounts are FINANCING_AMOUNT Assertions (D13 predicate, unit… | press release, 8-K Item 1.01/3.02, Form D, S-1/424B |
| ACQUISITION | FINANCIAL | acquisition or merger: agreement (announcedAt/startedAt) and closing (effectiveFrom) are ONE event with two clocks, not two events | press release, 8-K Item 1.01/2.01, SC TO |
| PARTNERSHIP | FINANCIAL | license, collaboration, co-development or option deal; upfront and milestones are Assertions | press release, 8-K Item 1.01 |
| AWARD | FINANCIAL | prize or competition milestone with money attached (e.g. XPRIZE milestone awards), as a frontier-milestone occurrence only: the Event point… | organizer release |
| LEGAL_ACTION | CORPORATE | lawsuit, settlement, patent challenge outcome (patent records are D8) | court dockets, 8-K Item 8.01, PTAB |
| OTHER | OTHER | anything else; an OTHER value needs a description and is reviewed for a vocabulary bump |  |


### retiredEventKinds (1)

| value | ruling | reason |
| --- | --- | --- |
| PUBLICATION | R-44 | a peer-reviewed publication is a D3 Publication (on a kernel Source), never an Event; milestone timelines read D3 Publication dates; RETRAC… |

- **droppedPinnedCategories**: note
- **eventFamilies** (9): CLINICAL, REGULATORY, SAFETY, SCIENTIFIC_RECORD, COMMERCIAL, FINANCIAL, CORPORATE, POLICY, OTHER

### breakthroughCriteria (5)

| id | rule | computed |
| --- | --- | --- |
| BC-DESIGNATION | event kind REGULATORY_DESIGNATION with designationType US_BREAKTHROUGH_THERAPY \| US_RMAT \| EU_PRIME \| JP_SAKIGAKE (D8 RegulatoryPathway val… | true |
| BC-FIRST-IN-HUMAN | first TRIAL_START on a level-2 frontier (no earlier TRIAL_START ON_FRONTIER as of T) | true |
| BC-FIRST-APPROVAL | first APPROVAL on a level-2 frontier in a jurisdiction (approvalPathway not US_DEVICE_510K unless the frontier is diagnostic; synthesis R-6… | true |
| BC-FIRST-POSITIVE-PIVOTAL | first READOUT on the frontier with readoutStage in (TOPLINE, PRIMARY) on a registrational trial and primaryEndpointStatement = MET as state… | true |
| BC-ANALYST | a kernel Assessment (assessmentKind BREAKTHROUGH_JUDGMENT, conclusionCode MEETS_CRITERION) by a named asserter citing located evidence and… | false |


### eventRelations (3)

| kind | direction | replaces | semantics |
| --- | --- | --- | --- |
| LEADS_TO | earlier (enabling) event -> later (enabled) event | pinned CAUSED_BY (effect -> cause), direction flipped so chains read forward in time | A source states that the earlier event was a basis, precondition or input for the later one: a readout is the basis of a filing; a filing l… |
| RESPONDS_TO | responding event -> stimulus event |  | A deliberate action by an agent (regulator, sponsor, investor, payer) that a source states was taken in reaction to an earlier event: a cli… |
| FOLLOWS | later event -> earlier event within one scope (same frontier, same subject, or same organization) | pinned FOLLOWED_BY (derived) | pure temporal adjacency by the events' valid-time clocks; NEVER implies LEADS_TO or RESPONDS_TO; 'a financing followed a result' in the tem… |

- **notEventRelations** (3): CONTRADICTS: a retraction or failed readout contradicting earlier claims is kernel/D10 (Claim -> evidence Adjudication / assessment), never an event-to-event or event-to-claim edge (directive 3.8), SUPERSEDES between events: corrections are new Assertions on the same Event (pinned rule), not a new event, agreement vs closing of one deal: one ACQUISITION event with two clocks, never two events lin…
- **seamRule**: rule, edges, attachmentByType, rejected, consumerObligations

### queryShapes (9)

| id | question | answerKind | cypher |
| --- | --- | --- | --- |
| QF-01 | What happened on frontier F in the last N days, in order, and which events led to or responded to which? | retrieved | MATCH (f:Frontier) WHERE f.key = $frontierKey OR f.parentKey = $frontierKey MATCH (e:Event)-[r:ON_FRONTIER]->(f) WHERE r.recordedFrom <= $a… |
| QF-02 | How far has frontier F got (furthest milestone rung reached, first-ever events) as of T? | retrieved (or materialized projection with method frontier-ladder-v1) | MATCH (e:Event)-[r:ON_FRONTIER]->(f:Frontier {key: $frontierKey}) WHERE r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo >… |
| QF-03 | Who is active on frontier F (organizations, compounds, studies) and what is each one's latest milestone? | retrieved (optional derived ACTIVE_ON_FRONTIER) | MATCH (f:Frontier {key: $frontierKey})<-[:ON_FRONTIER]-(e:Event)-[:INVOLVES]->(o:Organization) WITH o, e ORDER BY coalesce(e.startedAt, e.a… |
| QF-04 | Which events on F were breakthroughs by a stated definition (designation, first-in-human, first approval, first positive pivotal) rather th… | retrieved (BC-DESIGNATION..BC-FIRST-POSITIVE-PIVOTAL) + assessment (BC-ANALYST) |  |
| QF-05 | What is the chain from first readout to approval for compound X, and how long did each step take? | retrieved | MATCH (x {uid: $compoundUid})<-[:HAS_OBJECT]-(:Assertion {predicate: 'EVENT_ABOUT'})-[:HAS_SUBJECT]->(start:Event {eventKind: 'READOUT'}) M… |
| QF-06 | Which claims about frontier F (or its subjects) circulated before and after event E, and which were contradicted by it? | retrieved + assessment |  |
| QF-07 | What went wrong on frontier F: safety signals, holds, failed readouts, rejections, discontinuations, retractions, enforcement — and what di… | retrieved | MATCH (e:Event)-[:ON_FRONTIER]->(:Frontier {key: $frontierKey}) WHERE e.eventKind IN ['SAFETY_SIGNAL','CLINICAL_HOLD','REJECTION','PROGRAM_… |
| QF-08 | Which financings, acquisitions or partnerships followed a readout on F within N days, and which did a source state were based on it? | retrieved |  |
| QF-09 | Which frontiers does target T depend on, and what happened on them recently? | retrieved | MATCH (f:Frontier) WHERE $targetKey IN f.targetKeys OPTIONAL MATCH (e:Event)-[:ON_FRONTIER]->(f) WITH f, e ORDER BY e.startedAt DESC RETURN… |

- **indexes** (3): range :Frontier(key) unique; range :Frontier(parentKey); fulltext FrontierSearch(name, synonyms, definition) (name holds the label), range :Event(eventKind, startedAt); range :Event(announcedAt), Frontier.targetKeys list property (IN predicate); no index needed at 25 nodes
- **sizeConsequence**: nodeTypes, relationshipTypes, pairs, measuredInSdl, removedVersusPinned, enums
- **synthesis**: publishedAs, source, rulings, regulatoryPathwayMapping, sdl, sdlEnums, checks, sizeConsequenceFinal

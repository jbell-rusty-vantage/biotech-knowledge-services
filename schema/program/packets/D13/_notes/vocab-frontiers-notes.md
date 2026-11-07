# Notes on vocab-frontiers.yaml 0.1.0 (Wave 0, A7, 2026-10-08)

These are the choices behind `../vocab-frontiers.yaml`, the alternatives considered, and how the citations were obtained. Citation ids (C01 to C73) refer to section 0 of the YAML. Nothing here is medical or investment advice.

## 1. What was published and why it has this shape

- **24 frontiers in 2 levels: 7 themes and 17 frontiers.** The brief asks for 20 to 40 and the coordinator for about 12 to 25; 24 fits both ranges. Themes exist so the timeline can be browsed and aggregated ("everything in geroscience this quarter"). Events attach to level-2 frontiers.
- **One node type, `Frontier`, with the hierarchy held as a property (`parentKey`).** This is the same choice A5 made for targets (`packets/D5/vocab-targets.yaml`, `parentKey`), so the two shared vocabularies look the same to agents. A `BROADER` edge was considered and rejected: two levels with one parent each never need a traversal, and the edge would cost a relationship type and a pair.
- **Frontier → target relevance is the list property `targetKeys`, not an edge.** A5's polarity rule bans typed edges from a *means* to a Target. A frontier is not a means, and the mapping is vocabulary to vocabulary (relevance), not an effect claim. A property costs nothing in the executable, and at 24 nodes an `IN` filter is enough. If a GDS question needs it, it can be promoted to a structural edge later.
- **Milestones are a lens over events, not a node type.** A milestone is an event kind plus a qualifier, plus "firstness" computed at query time. The investor seed questions ("latest milestone", "first-in-human", "first approval") need ordering and firstness, which come from `ORDER BY` over dated events. A `Milestone` node would duplicate Event.
- **Stage or progress is never stored on a frontier.** "How far has F got" is QF-02, computed from events (or a materialized projection with a method version). A curated "stage" property would be a judgment that goes stale with no asserter (directive 3.2 and 3.6). The same rule applies to "breakthrough": section 6 separates computed criteria (designation, first-in-human, first approval, first positive pivotal, each by a stated definition) from analyst judgments, which are D10 assessments. Press words such as "unprecedented" or "breakthrough" are D9 ClaimOccurrences. They appear in the source title of C39, which shows why the two must never be merged.
- **One event-kind enum replaces the pinned EventCategory (26 values) plus the `eventType` string.** The pinned pair had two overlapping controlled lists, with `eventType` documented only in a docstring. The 27 `eventKind` values are what the investor questions filter on. `family` is derived by lookup and is not a second stored field. Pinned values with no D13 question were dropped (HIRING, LEADERSHIP, BOARD, FACILITY, MANUFACTURING, MARKET, MEDIA, COMMERCIAL, UNKNOWN) and can be promoted again by a vocabulary bump.
- **Kinds that need a jurisdiction** (all REGULATORY family, plus POLICY) carry `requires: [jurisdiction]`. This keeps the pinned rule (contract A11) that a regulatory event must name its jurisdiction.
- **An acquisition is one event with two clocks.** The agreement date is `startedAt`/`announcedAt` and the closing date is `effectiveFrom`. The AbbVie–Capstan deal shows the problem: the agreement was announced 2025-06-30 (C54) and closed 2025-08-19 (C55). Modelling these as two events joined by LEADS_TO would double-count deals on the timeline.
- **Retraction.** Publisher revisions are already the kernel `SourceRevisionEvent` (biotech-meta OPEN-QUESTIONS item 4, closed). D13 projects a `RETRACTION` Event only when the retraction is a frontier milestone. It must point at the SourceRevisionEvent and never re-record it. "Contradicts earlier claims" is kernel/D10 adjudication (directive 3.8). It is not an event edge.

## 2. Event relations: why two asserted kinds and one computed kind

- **LEADS_TO (earlier → later) replaces pinned CAUSED_BY (effect → cause).** The direction is flipped so chains read forward in time, as investors read them ("readout leads to filing leads to approval"). The rule carries over from the pinned profile (CausalEdgeProperties): the edge exists only as the projection of one Assertion with a locator. A speculative link (SPECULATES / HYPOTHESIS) stays an Assertion and is never projected. Example: the FDA approval page for daraxonrasib says "Efficacy was evaluated in RASolute 302 (NCT06625320)" (C41, quoted from the 2026-10-08 Tavily extract). That is a stated link from the readout's trial to the approval.
- **RESPONDS_TO (response → stimulus) is new.** It carries agency: a regulator or sponsor acted because of an earlier event. The investor and harm questions ask about this separately from process links ("what did the safety signal cause the regulator or company to do"). Example: Intellia's 2026-03-02 release says the holds "were imposed by the FDA on October 29, 2025, following the observation of Grade 4 liver transaminases and increased total bilirubin in a patient who was dosed with nex-z in MAGNITUDE" (C50, Tavily search snippet of the primary page; the fixture stage must re-capture the page before quoting it).
- **Alternative: a single event-link edge with a `linkKind` property** (LEADS_TO | RESPONDS_TO). It would save one relationship type at the cost of a property filter on every chain query. I deferred the decision to the SDL stage. Each kind is only one Event→Event pair, so keeping both costs 1 type and 1 pair.
- **FOLLOWS is computed, not stored.** The pinned FOLLOWED_BY was a derived edge built by `valid-time-order-v1`. Ordering events within a frontier or subject at query time gives the same answer with no stored edges and no regeneration job. The owner's phrase "a financing follows a result" is ambiguous: it can mean temporal order or a stated basis. QF-08 therefore returns temporal pairs and stated LEADS_TO pairs in separate columns.
- **CONTRADICTS is not an event relation.** See section 1.

## 3. Seam rule: why only Event and Study attach directly

- The alternative was a FRONTIER edge from every domain type (Organization, Person, Compound, Product, Claim, Study, Event). That is at least 7 pairs, and the target would need a union or an any-entity edge, which directive rule 1 forbids. It would also store "organization X is on frontier F" as a fact with no date, which goes stale.
- Events and studies carry dates and evidence. Who is active on a frontier, and since when, can be derived from them (QF-03). A derived `ACTIVE_ON_FRONTIER` projection is allowed but not admitted in Wave 0.
- **ON_FRONTIER is an asserted classification.** The asserter is a BellLabs curation agent, and the vocab version is on the edge. This keeps classification provenance (which definition and which version) and lets a vocabulary bump supersede a classification without editing it. Frontier tags (a property) were rejected because a tag has no asserter and cannot be adjudicated.
- Claims reach a frontier through the kernel subject/object pattern. Frontier must therefore be an admissible subject/object in A1's pattern. This is an open dependency on A1.

## 4. Choosing the frontiers: what was included, merged and deferred

Included because investors and researchers track them as units, each with at least two organizations or registered trials verified on 2026-10-08:

| frontier | evidence that it is live (citations) |
| --- | --- |
| senolytics in humans | UBX1325 Phase 2 trials NCT05275205, NCT06011798 (C03, C04); Mayo D+Q NCT02848131 (C06); first-in-human IPF pilot PMID 30616998 (C07) |
| partial epigenetic reprogramming | ER-100 NCT07290244 (C08); IND clearance 2026-01-28 (C09); first patient dosed 2026-06-09 (C10); Retro and NewLimit financings (C12, C13) |
| mTOR inhibition for healthy aging | PEARL NCT04488601 / PMID 40188830 (C14, C15); resTORbio PROTECTOR 1 failure (C16, secondary source) |
| NAD+ restoration | NCT04571008, NCT03568968 (C17, C18); FDA NMN supplement-status letters of 2025-09-29 (C19, law-firm summary) |
| aging as an indication | TAME design (C21); XPRIZE Healthspan milestone awards (C20) |
| companion-animal longevity drugs | Loyal LOY-002 RXE and TAS accepted, CMC in progress (C22, C23) |
| gene therapy for aging | Minicircle follistatin (self-hosted preprint C24); Rejuvenate Bio (C25). Included mainly as a harm/risk bucket |
| GLP-1 beyond obesity | SELECT, FLOW, ESSENCE (C26–C28); Wegovy MASH approval (C29, C71); Zepbound OSA approval (C33); evoke/evoke+ negative (C30–C32) |
| oral small-molecule incretins | ATTAIN-1 NCT05869903 (C34); Foundayo approval 2026-04-01 (C35) |
| muscle-preserving weight loss | bimagrumab + semaglutide NCT05616013 (C36) |
| curing pancreatic cancer | daraxonrasib chain: BTD (C38) → RASolute 302 topline (C39) → NDA accepted (C40) → NEJM (C42, C73) → FDA approval 2026-08-26 (C41); autogene cevumeran NCT05968326 (C43, C44) |
| individualized neoantigen vaccines | INTerpath-001 NCT05933577 (C45); Phase 3 readout (C46) |
| in vivo gene editing | MAGNITUDE NCT06128629 (C47); pause, hold and lift (C48–C50); Lilly–Verve (C51, C72); VERVE-102 NCT06164730 (C52); patient-specific base editing PMID 40373211 (C53) |
| in vivo CAR-T | AbbVie–Capstan (C54, C55); CPTX2309 NCT06917742 (C56); AstraZeneca–EsoBiotec (C57) |
| CAR-T for autoimmune disease | Erlangen case series PMID 38381673 (C58); RESET-Myositis NCT06154252 (C59); KYSA-8 NCT06588491 and BLA (C60–C62) |
| Alzheimer's disease modification | Clarity AD, TRAILBLAZER-ALZ 2 (C63, C65); Leqembi traditional approval (C64); Lumipulse plasma test 510(k) (C66) |
| xenotransplantation | UKidney first EXPAND transplant (C67, C68); eGenesis RENEW NCT07429838 (C69) |

Merged or deferred (candidates for 0.2.0 if a question asks for them):

- **Metformin / repurposed geroprotectors.** Merged into `frontier:aging-as-indication`. TAME is a regulatory-path experiment, and a ClinicalTrials.gov term search on 2026-10-08 returned no TAME registration. Recorded as an open question: is TAME registered under another title?
- **Plasma and blood-factor therapies** (therapeutic plasma exchange, young-plasma). Deferred: there was not enough time in Wave 0 to verify two active registered programs.
- **Ovarian aging / reproductive longevity.** Deferred; it is a strong candidate (NMN appears in an ovarian-reserve trial, NCT05485610 in the CT.gov NMN search), but I did not verify a second program.
- **Neuroinflammation modulation** (the brief's example "brain fitness ↔ neuroinflammation modulation"). Deferred: no verified programs this stage. Brain fitness reaches `frontier:alzheimers-disease-modification` and `frontier:glp1-beyond-obesity` through `targetKeys`.
- **Aging clocks.** These are measures (D4), not a frontier. Their use as trial endpoints is inside `frontier:aging-as-indication`.
- **MASH as its own frontier.** It now has approvals (Wegovy C29/C71; the parallel research stage's resmetirom fixture). I kept it under the incretin theme and `glp1-beyond-obesity` rather than adding a node. Revisit if non-incretin MASH events dominate.
- **Wikidata identifiers for frontiers.** Not assigned. None were verified in this stage, and an unverified QID would be an invented identifier. This is a Wave 1/2 task for D11 tooling.

## 5. Granularity rule, tested against the list

- Disease goals (pancreatic cancer, Alzheimer's, autoimmune CAR-T, GLP-1 beyond obesity, muscle-preserving weight loss): milestones are disease outcomes.
- Modalities (reprogramming, in vivo CAR-T, in vivo editing, neoantigen vaccines, oral incretins, xeno, gene therapy for aging): milestones are modality firsts.
- Mechanisms (senolytics, mTOR, NAD+): the mechanism is what is being validated.
- Regulatory paths (aging as an indication, companion-animal drugs): the milestone is regulator acceptance.
- Test case for overlap: evoke/evoke+ (2025-11-24, C30) attaches to two frontiers, `glp1-beyond-obesity` and `alzheimers-disease-modification`. That is within the "1 to 2, rarely 3" rule. Autogene cevumeran attaches to `curing-pancreatic-cancer` and `individualized-neoantigen-vaccines`, joined by `related`.

## 6. Verification method and limits

- **ClinicalTrials.gov v2 API** (curl, no auth) verified every NCT id in the YAML: `studies/{nct}?fields=...` for known ids, and `studies?query.*` for searches. Titles in the citations are the registry's brief titles.
- **PubMed MCP** (`lookup_article_by_citation`, `get_article_metadata`, `search_articles`) and **NCBI E-utilities esummary** (curl) verified PMIDs and DOIs. Tool defect: `lookup_article_by_citation` returns the PMID in the `key` field and the caller's key in the `pmid` field (swapped). It is logged in tool-log.
- **Tavily CLI** `tvly search` and `tvly extract` found and captured company, FDA and regulator primaries. Dated events whose date is shown in the YAML come from the extracted primary page text or the primary's own snippet. Exceptions are marked "secondary": C16, C19, and C72 (CNBC, for the Lilly–Verve announcement date). Events with `date: null` need the date captured from the primary in the fixture stage.
- **eCFR** text of 21 CFR 312.42 was fetched through `api/versioner/v1/full/2026-09-01/title-21.xml?part=312&section=312.42` (it needs `--compressed`; the HTML page did not render through tvly extract). The FDA Breakthrough Therapy page came through `tvly extract` (C01).
- **Not verified in this stage:** exact dates for Kyverna's topline, the resTORbio failure and AstraZeneca–EsoBiotec; the EXPAND NCT id; and Loyal's RXE and TAS acceptance dates. Every one of these is marked in the YAML.

## 7. Open questions handed on (to be copied into 11-open-questions.md by the model stage)

1. **A1 kernel pattern.** Frontier and Event must be admissible subject/object types; `ABOUT` in QF-05 is a placeholder. Owner: K.
2. **ON_FRONTIER on Study.** Should D3 declare the field (seam owned by D13), or should D13 declare it inbound? Owner: D3 with D13.
3. **LEADS_TO + RESPONDS_TO as two types versus one link edge with `linkKind`.** Decided at the D13 SDL stage, on measured size and on whether the questions filter the kinds separately.
4. **`primaryEndpointMet` and `readoutStage` as Event properties.** Should they be on the Event (the sponsor's stated qualifiers, materialized from Assertions like the clocks) or only on Assertions? The proposal is materialized properties with the source assertion uid, following the pinned time-materialization rule. Owner: D13 with K.
5. **TAME registration status** (section 4). Owner: D3 research.
6. **Frontier curation authority.** Who may bump the vocabulary (owner, curator agent, or a D10 policy)? Owner: owner.

## 0.2.0 (D13 model stage, A7, 2026-10-08)

- **Added `frontier:mash-fibrosis-resolution`** (level 2 under `frontier:incretin-and-metabolic-medicine`, DISEASE_GOAL, targetKeys `target:cardiometabolic-health`). Reason: the research-stage fixtures FC1–FC3 (MAESTRO-NASH readout → financing → PDUFA → accelerated approval of resmetirom) are the packet's main readout-to-approval chain, and resmetirom is a THR-β agonist, outside the GLP-1 class that defines `frontier:glp1-beyond-obesity`. Attaching them only to the level-1 theme would make firstness (Q-D13-02, Q-D13-04: "first approval on the frontier") unanswerable at level 2. Admission check: two organizations (Madrigal, Novo Nordisk) with approvals (C75/C76, C29/C71); goal not reliably achieved (both approvals accelerated, continuation contingent on confirmatory trials, C75); milestones still open (outcome confirmation). The Wegovy MASH approval now attaches to both MASH and GLP-1-beyond-obesity (within the 1–2 rule). Header count fixed to 7 themes + 18 frontiers = 25.
- **Kernel rebase.** ON_FRONTIER uses the kernel `AssertedEdgeProperties`; the vocabulary version moves to the classification Assertion's qualifier `frontierVocabVersion=<semver>` (kernel edge-property types are not extended for one field). Event subjects use the Assertion predicate `EVENT_ABOUT`.
- **LEADS_TO evidence rule corrected.** 0.1.0 required basisKind CITED_FROM_PRIOR_WORK or DIRECT_MEASUREMENT; a sponsor's statement about its own decision or contract fits neither. The gate is now speechAct STATES + a SUPPORT adjudication that the span states a basis; temporal wording alone is CONTEXT_ONLY (FC2 shows both in one filing).
- **Added** the computed harm-channel lens `ms:guidance-slip` (Q-D13-11), the `discontinuationScope` qualifier, notes on PDUFA dates and planned launches, the BC-DESIGNATION asserter rule, worked examples C77–C79. No ids were renamed or removed.

# D13 — research notes for the model stage

Agent A7, research stage, 2026-10-08. Inputs: `01-ecosystem.md` (sources S01–S50), `02-questions.md` (32 rows), `_notes/fixture-candidates.md` (FC1–FC12), the Wave 0 vocabulary `vocab-frontiers.yaml@0.1.0` (published into this packet during this stage by the Wave 0 A7 run, with its companion `_notes/vocab-frontiers-notes.md`). Kernel pattern (A1, `packets/K/09-reasoning.md`) was still the 11-line skeleton in the A1 worktree at 2026-10-08 17:13 local; everything below that touches subject/object/identifier/mention is written against the placeholder `Subjectable` / pinned kernel names.

## 1. Headline for the modeler

1. **Two node types are enough for D13: `Event` and `Frontier`.** Every other pinned W18 type is cut, merged into D10, or handed to D9 (section 4). Budget room (≤ 8) is not a reason to keep them.
2. **Three typed relationships carry the investor questions**: `ON_FRONTIER` (Event|Study → Frontier, asserted classification), `LEADS_TO` (Event → Event, asserted, stated basis), `RESPONDS_TO` (Event → Event, asserted, agency). Plus one seam edge for participants, `INVOLVES` (Event → Organization|Person with role; D7 seam). `FOLLOWS` is computed at query time. That is 4 relationship types and ~6 pairs before seams to D8/D9 are decided.
3. **Event clocks are the hard part, not the graph shape.** The research found five clocks for one occurrence (8-K "date of earliest event", filing/acceptance time, dateline of the press release, registry start date vs sponsor "first dosed", legal effective time with time-of-day) and two statuses (PLANNED vs OCCURRED) that investors compare over time (slips). Keep the pinned rule: every time on Event is materialized from a named Assertion; history lives in assertions (recorded time), never in edits.
4. **"Led to" is usually stated by the sponsor and is ambiguous.** "as a result of the Company’s announcement" (FC2) is a stated basis; "following the disclosure of full 36-week data" (FC7) and "secured following the positive topline readout" (FC2) can be temporal or causal. The model must let the verifier adjudicate the span before an Assertion projects to `LEADS_TO`/`RESPONDS_TO`; otherwise it stays `FOLLOWS` (computed).
5. **Harm events often have no filing.** BioAge's trial halt has no 8-K (FC6); press releases are the first and sometimes only primary artifact. Do not make 8-K/regulator records a precondition for an Event.

## 2. Candidate node types (and the questions that need them)

| type | owner | why a node (filter / join / traverse) | questions | identity rule (proposal) |
| --- | --- | --- | --- | --- |
| `Event` | D13 | traversed by every timeline, chain, harm and breakthrough question; joined to frontiers, organizations, subjects, claims, assessments | Q-D13-01..08, 10–17, 21, 22, 25–27, CQ-TM-03 | `hu:event:<opaque>`; dedup key = (eventKind, primary subject, jurisdiction?, startedAt at stated precision); an 8-K, a press release and a registry change about the same occurrence are three **assertions about one Event**, never three Events (FC3 shows four artifacts for one approval) |
| `Frontier` | D13 | filter/group key for all frontier questions; target of `ON_FRONTIER`; subject of breakthrough/impact assessments and claims | Q-D13-01..04, 08, 09, 16, 23, 28–30 | `hu:frontier:<slug>`, key `frontier:<slug>` from `vocab-frontiers.yaml`; curated, ~25 nodes |

Not nodes (decide as properties/assertions): milestone kind (lens over eventKind + qualifiers, vocabulary §4), breakthrough status (computed criteria or D10 assessment), "stage of a frontier" (computed, Q-D13-02), forecasts (Source snapshot + Assertion, Q-D13-20), market moves (D7 market data / assertion, Q-D13-21), guidance/guided dates (EVENT_SCHEDULED assertions on a PLANNED Event, Q-D13-10/11), aggregate sector statistics (claims in sources, Q-D13-24).

## 3. Candidate relationships

| relationship | class | from → to | questions | populated by | fixture | temporal | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ON_FRONTIER` | asserted (classification by a BellLabs curator/agent with vocabVersion) | Event → Frontier; Study (D3) → Frontier | Q-01, 02, 03, 04, 08, 09, 16, 23, 28 | curation agent over captured events/studies | FC3, FC6, FC7, FC8, FC9 | recorded-only (reclassification = superseding assertion) | 2 pairs; D3 seam for Study |
| `LEADS_TO` | asserted (stated basis) | Event → Event | Q-01, 05, 06 | sponsor 8-K/EX-99.1, regulator approval text | FC2 (debt milestone "as a result of"), FC3 (PDUFA → approval) | recorded-only | requires a located quote naming the earlier event; time-order service check |
| `RESPONDS_TO` | asserted (agency) | Event → Event | Q-08, 14, 15, 26 | sponsor releases, 8-K Items 2.05/8.01, registry whyStopped | FC6 (discontinuation responds to transaminitis), FC7 (RIF after ASPIRE) | recorded-only | the whyStopped field is a structured locator for this |
| `INVOLVES` | asserted (role) | Event → Organization, Person (D7) | Q-03, 06, 14, 15, 21 | sponsor releases, filings | all FCs | recorded-only | role enum: SPONSOR, APPLICANT, REGULATOR, INVESTOR, LENDER, UNDERWRITER, ACQUIRER, PARTNER, PRESENTER, SPEAKER, HOST, AWARDING_BODY (merges pinned SPEAKS_AT/ATTENDS/EXHIBITS_AT/HOSTS_EVENT); Community dropped |
| Event subject (what the event is about) | kernel pattern (A1) | Event → compound, product, study, condition, publication… | Q-05, 16, 26, 27 | same | FC1, FC3, FC8 | per kernel | do NOT re-create the pinned 15-member `EventSubjectTarget` union; use A1's pattern |
| `FOLLOWS` | computed at query time | Event → Event (same scope) | Q-01, 06 | n/a | FC2 companion (2024 offering after approval: temporal only) | n/a | not stored unless a GDS/latency question needs it (then derived, read-only, method `valid-time-order-v1`) |

Candidates to keep **predicate-only** (Assertion.predicate values; promote only with a question that traverses them):
- `EVENT_OCCURRED`, `EVENT_SCHEDULED`, `EVENT_CANCELLED`, `EVENT_EFFECTIVE`, `EVENT_ANNOUNCED` — the time assertions the Event materializes (pinned names kept).
- `DOCUMENTED_BY_RECORD` (Event → D8 regulatory record / D9 publication / D3 registration) — provenance is already carried by assertions citing the record's snapshot; promote only if D8's questions traverse from an Event to a structured regulatory record (A7 owns D8 too: decide jointly).
- `PRESENTED_AT_CONFERENCE` (Event → D9 Conference) — Q-D13-25 is value 3.
- `CONTINGENT_ON` (APPROVAL Event → confirmatory Study / pending requirement) — Q-D13-12; FC3 quote 3 is the locator. Promote if Q-D13-12 is raised to value 1.
- `REPORTED_MARKET_MOVE` (Organization, with event reference, magnitude text) — Q-D13-21; D7 owns market data.
- `FORECASTS` (forecast source → PLANNED Event or Frontier milestone, value, capture time) — Q-D13-20.
- `FINANCING_AMOUNT`, `DEAL_VALUE` — D7 money pattern (amount assertions on FINANCING/PARTNERSHIP events).
- `DESIGNATION_GRANTED` qualifier assertions (designationType, jurisdiction) — stays on the REGULATORY_DESIGNATION event as qualifiers.

## 4. Pinned W18 types and relationships: merge / defer / cut

| pinned | disposition | reason |
| --- | --- | --- |
| `Event` (36 props, 17 rel fields) | **keep, D13 owner**; slim rel fields to ON_FRONTIER, LEADS_TO, RESPONDS_TO, INVOLVES + kernel subject + kernel lineage | brief + coordinator default owner; pinned clocks/assertion-uid properties survive |
| `EventCategory` (26) + `eventType` (free string) | **replace by one `eventKind` enum** (vocabulary §5, 27 values incl. OTHER) + qualifiers (readoutStage, primaryEndpointMet, approvalPathway, designationType) | research shows 8-K Items and press headlines map cleanly to one kind; two-level typing was redundant |
| `EventStatus` (7) | keep, but restate semantics: PLANNED / OCCURRED (COMPLETED) / CANCELLED / DELAYED / IN_PROGRESS; drop ANNOUNCED (legacy) and UNKNOWN | PLANNED vs OCCURRED is what Q-D13-10/11 need; DELAYED is a materialization of a later EVENT_SCHEDULED assertion with a later date |
| `CAUSED_BY` (effect → cause, CausalEdgeProperties with basisKind) | **merge into LEADS_TO / RESPONDS_TO** (direction forward in time); keep basisKind/speechAct copies on the edge or on the assertion | vocabulary §7; research found stated-basis vs agency is the useful split |
| `FOLLOWED_BY` (derived) | **computed, not stored** | vocabulary §7 |
| `NarrativeArc` | **→ D10** (published report skeleton or assessment); D13 keeps no arc node | Q-D13-29 is `published`; directive 3.6 |
| `EventImpactAssessment` + `ImpactLevel` | **→ D10** as an assessment kind (EVENT_IMPACT) with subject Event | Q-D13-31 value 3; one assessment archetype in D10, not one per domain |
| `Conference` | **defer to D9** (container, hosts episodes/recordings) or cut; D13 needs at most a predicate-only link | only Q-D13-25 (value 3) needs it |
| `Community` | **cut** | no D13 question; membership is private data |
| `HAS_EVENT`, `HOSTS_EVENT`, `SPEAKS_AT`, `ATTENDS`, `EXHIBITS_AT`, `SPONSORS_CONTENT` | cut or fold into `INVOLVES` roles; SPONSORS_CONTENT → D9/D7 financial interest | role edges multiplied pairs without questions |
| `EVENT_ABOUT` (15-member union) | **kernel subject pattern** | directive rule 1 |
| `DOCUMENTED_BY_RECORD` (5-member union) | predicate-only for now (section 3) | provenance already via assertions |
| `REPORTED_IN` (derived Event → Source) | compute from assertions → locators → snapshots → sources | Q-D13-22 counts asserters; a stored projection only if latency requires |
| `RECORDING_OF`, `PRESENTED_AT` (Document → Event) | D9 decides | media containers are D9 |
| `ARC_ABOUT`, `ARC_INCLUDES_EVENT`, `ASSESSES_EVENT`, `IMPACT_ON` | D10 / kernel citation pattern | |
| `SUPPORTED_BY`, `SUPPORTED_BY_CHUNK`, `SUPERSEDES`, `WAS_GENERATED_BY` | kernel | never re-declared |

## 5. Properties, enums, qualifiers the research says are needed

On `Event` (beyond the kernel fields):
- `eventKind` (enum, vocabulary §5) — filter for every question.
- clocks: `startedAt`, `endedAt`, `announcedAt`, `effectiveFrom` with `*Precision` and `*Basis`, and the `timeAssertionUid` / `announcementAssertionUid` / `effectiveAssertionUid` pointers (pinned). Evidence: dissolution "effective as of 5:00 p.m. Eastern Time on September 26, 2025" needs INSTANT precision + `localTimeZone` (FC7); 8-K "Date of earliest event reported" vs filing date (FC2); registry start date 2026-03-02 vs sponsor first-dosed 2026-06-09 (FC9) — two assertions by two asserters, one materialized value with its basis.
- **Precision gap:** `TimePrecision` has INSTANT, DAY, MONTH, QUARTER, YEAR, DECADE — no HALF_YEAR. Sponsors guide in halves ("In the first half of 2023 … intends to file", FC1) and "by the end of 2025" (FC10). Options: add HALF_YEAR to the kernel enum, or encode the guidance as a half-open interval [2023-01-01, 2023-07-01) with precision MONTH. Kernel decision (open question).
- `eventStatus` (PLANNED/IN_PROGRESS/COMPLETED/CANCELLED/DELAYED) materialized from EVENT_SCHEDULED/EVENT_OCCURRED/EVENT_CANCELLED assertions.
- `jurisdiction` (required for regulatory kinds).
- qualifiers: `readoutStage` (TOPLINE…), `primaryEndpointMet` (MET / NOT_MET / MIXED / NOT_STATED — sponsor's statement; FC1 "Were Met", FC7 "no statistically significant difference", FC8 "did not confirm superiority"), `approvalPathway` (FULL / ACCELERATED / CONDITIONAL / SUPPLEMENTAL / …; FC3 accelerated, FC10 veterinary XCA "conditional"), `designationType` (BREAKTHROUGH_THERAPY, PRIORITY_REVIEW, FAST_TRACK, RMAT, PRIME, ORPHAN; FC3 shows Priority Review is a review designation announced with filing acceptance), `discontinuationScope` (TRIAL / PROGRAM / COMPANY — proposal, see section 7).
- `name`, `summaryText`, search fields (pinned).
- NOT on Event: impact level, breakthrough flag, sentiment, amounts (D7 assertions), share-price change (D7), "good/bad".

On `Frontier`: as vocabulary §1 (key, label, definition, level, parentKey, granularity, synonyms, targetKeys, curationStatus, replacedBy, vocabVersion). The research adds one consideration: external close-match ids (Wikidata items exist for the anchor concepts, not for the frontiers themselves, S49) → keep `closeMatch` as kernel Identifier links on the Frontier's anchors, not on the Frontier, or as a property list of QIDs (decide with A1/A8 identifier pattern).

## 6. Seams and contested ownership

| seam | other module | what crosses | note |
| --- | --- | --- | --- |
| Event participants | D7 | `INVOLVES` → Organization, Person (role) | D7 splits Organization by role; D13 needs only this one edge into D7 |
| Financing amounts, valuations, market moves | D7 | amount assertions on FINANCING events; market data | Q-D13-06/21/23 |
| Study ↔ Frontier, trial status changes | D3 | `ON_FRONTIER` from Study (who declares the field?), registry status as event source | ask A4: does D3 model registry status changes as its own records? D13 consumes them as TRIAL_START / PROGRAM_DISCONTINUATION events |
| Regulatory records vs events | D8 (same agent A7) | APPROVAL / CLINICAL_HOLD / RECALL / ENFORCEMENT_ACTION / REGULATORY_STATUS_CHANGE events documented by D8 records | decide `DOCUMENTED_BY_RECORD` jointly; avoid a D8 "approval" node and a D13 "approval" event that duplicate dates |
| Publications, retractions, press releases, conferences, forecasts | D9 / K | revision events (kernel SourceRevisionEvent), sources and containers | RETRACTION event only when curated as a frontier milestone (vocabulary §5); otherwise the kernel record is the only record |
| Claims before/after events, breakthrough judgments, impact, narrative arcs, frontier briefs | D10 / K | assessments and published reports whose subject is an Event/Frontier | Q-D13-07, 17, 27, 29–31 |
| Safety-signal events ↔ adverse-effect concepts | D5 | event subject or assertion object = AdverseEffect (e.g. transaminase elevation) | Q-D13-26 needs it; FC6 + Insilico + Intellia |
| Targets | D5 | `Frontier.targetKeys` property | vocabulary seam rule |
| Compounds / products as event subjects | D1 / D6 | kernel subject pattern | |

## 7. Vocabulary maintenance proposals (for `vocab-frontiers.yaml`; not applied in this stage because the Wave 0 run was writing the vocabulary and its notes concurrently — apply after reading `_notes/vocab-frontiers-notes.md`)

1. **Frontier gap — MASH / liver fibrosis.** `_notes/vocab-frontiers-notes.md` deliberately keeps MASH under the incretin theme and `frontier:glp1-beyond-obesity` ("Revisit if non-incretin MASH events dominate"). The first MASH approval, however, is non-incretin: Rezdiffra (resmetirom, a THR-β agonist) is a breakthrough-designated NME approved 2024-03-14 (S17, FC3, FC4), and its whole readout → financing → PDUFA → approval chain (FC1–FC3) matches the theme `frontier:incretin-and-metabolic-medicine` (whose definition explicitly names "thyroid-receptor agonists in MASH") but no level-2 frontier (the GLP-1 frontier is defined by the GLP-1 class). Either widen the theme with a `frontier:mash-fibrosis-resolution` (DISEASE_GOAL; goal still not reliably achieved: one accelerated approval with confirmatory trials pending, FC3 quote 3) or accept that the recommended readout→approval fixture attaches only to that theme (allowed by the seam rule "attach to a level-1 theme only when no child fits", but then Q-D13-02/04 firstness on a level-2 frontier cannot be shown with it). Decision for the vocabulary owner before the fixtures stage.
   Also: the YAML section 3 header says "7 themes + 18 frontiers = 25" while the notes say 24 and the file lists 24 ids — fix the header.
2. **Add worked examples** from this stage: LEADS_TO with an explicit stated basis (FC2 quote 1: Hercules milestone "as a result of" the readout announcement); FOLLOWS-only (FC2 companion: 2024 offering after approval, no stated basis); RESPONDS_TO (FC6: discontinuation after transaminitis; FC7: RIF after ASPIRE).
3. **eventKinds:** (a) qualifier `discontinuationScope` on PROGRAM_DISCONTINUATION (TRIAL / PROGRAM / COMPANY) so restructuring and dissolution (FC7) are representable without re-adding pinned CORPORATE/LEADERSHIP categories; (b) note that a PDUFA goal date is an EVENT_SCHEDULED assertion on a PLANNED APPROVAL event, announced with REGULATORY_ACCEPTANCE (FC3); (c) note that LAUNCH is often only PLANNED in the approval release (FC3 quote 4).
4. **breakthroughCriteria BC-DESIGNATION:** FDA publishes only *approvals* of designated drugs, quarterly (S16, S17); designation grant dates come only from sponsor releases. The criterion should say which asserters can satisfy it (sponsor release for the grant; FDA BT list as later corroboration).
5. **milestoneKinds:** add a harm-channel rung for guided-milestone slips (computed: latest EVENT_SCHEDULED date later than earliest, or passed without EVENT_OCCURRED) — Q-D13-11, FC10.
6. **citations:** add S-ids from `01-ecosystem.md` where they strengthen frontier examples (Unity 2020 UBX0101, Madrigal chain, Novo evoke primary vs BioSpace copy).

## 8. Retrieval-pattern notes for file 03 (next stage)

- Q-D13-01/05/06/14 are Cypher over Event + LEADS_TO/RESPONDS_TO with as-of on `recordedFrom/recordedTo` of the edges and assertions (vocabulary QF-01, QF-05). Trace: each event's time assertion → locator → snapshot; each link's assertionUid → locator.
- Q-D13-02/04 need "first-ever" computed at query time (no earlier ON_FRONTIER event of the same milestone kind as of T); materialize only with a method version (`frontier-ladder-v1`).
- Q-D13-10/11 are over assertions, not the Event node: `EVENT_SCHEDULED` assertions for the same Event ordered by recordedFrom, compared with `EVENT_OCCURRED` (slip = later scheduled date or no occurrence by date). This is the one place D13 needs the assertion history in the answer, so the pattern must read Assertions directly.
- Q-D13-07/27 split ClaimOccurrences (D9) at `E.announcedAt` and read D10 adjudications/assessments citing E's locators; no event→claim edge.
- Q-D13-22 counts distinct asserters/source kinds per event through assertions → locators → snapshots → Source (compute; no REPORTED_IN store).
- Q-D13-23 is the only `materialized` row: a per-frontier financing aggregate with method version and input event set digest (D10 projection pattern).
- Vector/fulltext: `FrontierSearch(label, synonyms, definition)` for entity-linking frontier phrases in chunks; chunk retrieval for the 3.8 path via the kernel's text index over 8-K Item 8.01 / press-release text (FC1).
- GDS candidates (only if a question needs them): community detection over co-attachment of organizations to frontiers via events (who clusters with whom); temporal path search over LEADS_TO for "readout-to-approval" latency distributions per frontier. Neither is value 1.

## 9. Open questions (for 11-open-questions.md in the next stage)

1. **Retraction as Event:** is the kernel SourceRevisionEvent sufficient for the brief's "retraction contradicting prior claims" fixture, with D13 only classifying it ON_FRONTIER (needs a node to classify → would need the Event), or must D13 always mint a RETRACTION Event? Owner: A1 + D13. Evidence: FC5 (two asserters, EoC + retraction).
2. **D8 vs D13 for regulatory occurrences:** one APPROVAL Event plus a D8 record, or the D8 record only with an event view? Owner: A7 (D8+D13) with synthesizer. Evidence: FC3 (8-K, EX-99.1, openFDA submission, FDA BT list row — four artifacts, one occurrence).
3. **BasisKind for first-party statements:** a sponsor stating its own contractual milestone or decision ("as a result of the Company’s announcement…", "we have made the decision to discontinue…") is neither DIRECT_MEASUREMENT nor CITED_FROM_PRIOR_WORK. Does the kernel need a FIRST_PARTY_RECORD basis? Owner: A1.
4. **HALF_YEAR precision** (section 5). Owner: A1.
5. **Undated primary artifacts** (Loyal RXE post; BioPharma Dive capture) — what `announcedAt` basis applies when the date comes only from another source's relative phrase ("In February of last year")? `ValidTimeBasis` has INFERRED; is that admissible for investor answers? Owner: A1/D13.
6. **Syndicated press releases** (BioSpace, Yahoo, PRNewswire copies of the same company release): one Source with renditions, or separate Sources? Affects asserter counting in Q-D13-22. Owner: D9.
7. **Market moves:** dropped as an event kind in Wave 0; Q-D13-21 needs a home — D7 market data or a predicate-only assertion. Owner: D7.
8. **Frontier for MASH** and any further frontier proposals (section 7.1). Owner: D13 vocabulary.
9. **Conference node owner** (D9 vs cut). Owner: D9.
10. **Registry history access:** ClinicalTrials.gov history endpoint is 403 to scripts; TRIAL_START / status-change events depend on periodic snapshots unless the MCP or another path exposes history. Owner: D11 (action space) + A4.

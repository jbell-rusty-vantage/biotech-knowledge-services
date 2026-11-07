# D9 — research notes for the model stage

Agent A8, 2026-10-08, research stage. Inputs: `01-ecosystem.md` (sources S01–S32), `02-questions.md` (36 rows), `fixture-candidates.md` (FC-1…FC-9), the pinned fragments W18/W21/W22 (and W19/W20 questions), round 0006 (`biotech-meta/.../round-0006-claim-and-document-provenance.md`), directive 3.8/3.9. A1 published the kernel pattern and ownership map **during** this stage (`biotech-knowledge-services-A1/schema/program/packets/K/09-reasoning.md` §"Kernel pattern…" and §"Ownership map", `K/04-schema-proposal.graphql`, `K/domain-template.graphql`). Section 0 reconciles; sections 2–3 were drafted before it and carry the reconciled verdicts.

## 0. Reconciliation with A1's kernel map (read this first)

| topic | A1's map (K/09-reasoning.md) | consequence for D9 |
| --- | --- | --- |
| ClaimOccurrence, recommendation | **K**: `Assertion {assertionKind: CLAIM}` + label `ClaimOccurrence` + `OCCURRENCE_OF` → Claim; recommendation = `speechAct: RECOMMENDS`; any RECOMMENDS edge is a **D10** derived projection | D9 does not declare occurrence or RECOMMENDS; D9 supplies containers (`OCCURS_IN`, declared on the D9 container with `direction: IN`) and speakers' appearances |
| Assessments | **K** `Assessment` type; kinds include `RETELLING_FIDELITY`, `CONFLICT_RELEVANCE`, `SOURCE_AUTHORITY`; domains supply kind values + questions; typed properties are requested from the kernel | **cut** the proposed `DiscourseAssessment`; inputs go through kernel `DERIVED_FROM`, target through `ASSESSES`; request typed properties (`disclosureFinding`, `disclosurePlacement`, `relevanceLevel`, `relevanceBasis`, `lostQualificationKinds`, `speechActFrom/To`) in `11-open-questions.md` (owner: kernel) |
| Chunk, DocumentTextVersion, Segmentation | **D9** types; D9 declares `Chunk.mentions: [Subjectable!]!` (MENTIONS, derived) | D9 must model the retrieval structure of the 3.8 path (Q-D9-20): text version of a snapshot, chunk spans, MENTIONS; consider folding Segmentation into Chunk/TextVersion properties (`segmentationHash`, `chunkerVersion`) |
| MediaAsset, figure panel, label region | **D9**; regions are `SourceLocator` selectors (BOUNDING_BOX) | MediaAsset stays a D9 candidate (Q-D9-17); FigurePanel/MediaAnnotation/ProductLabelRegion → locators |
| Editorial containers (Publication, Episode, Channel, Platform) | **D9**, pointing at kernel `Source` (direction IN) | one generalized container type (Episode + Publication + post + article) is in scope for D9, plus Channel |
| Source authority | K type (`Assessment` SOURCE_AUTHORITY, subkind = claim kind); **register content D9** | the brief's "source-authority register for the first 50 sources" is a D9 deliverable for the model/fixtures stages |
| SourceCoverageRequirement, SourceDiscoveryRecord | deferred to D11 action-space registry (not graph) | Q-D9-15/Q-D9-16 must be answered from the D11 registry + capture-completeness on snapshots; flag if a user-facing "how complete was the search" needs a graph record |
| Asserter | `assertedBy` = "Person, Organization or Agent" | pseudonymous forum handles (FC-6) need a D7 decision: Person with `isPseudonymous`, or a PseudonymousActor type implementing Subjectable |
| Assertion fields | kernel has `speechAct`, `basisKind` (merged vocabulary: … PERSONAL_EXPERIENCE, MANUFACTURER_CLAIM, EXPERT_OPINION, CITED_FROM_PRIOR_WORK, HYPOTHESIS …), `qualifiers: [String!]`, `proposition`; **no** `segmentKind`, `reportedSpeechAct`, `utteranceText`, `speakerLabelInSource`, `retellingMode`, `linkBasis` | request `segmentKind` (CQ-CL-08 sponsor read vs editorial) and `speakerLabelInSource` (CQ-CL-01) from the kernel, or carry segment kind on the SourceLocator; `THIRD_PARTY_ANECDOTE` and `MECHANISM_REASONING` from round 0006 have no kernel value |
| Assertion → Assertion edges | kernel declares only `DERIVED_FROM` (inputs of a CALCULATED assertion, no edge properties); domains may not add fields to kernel types | **RETELLS and QUALIFIED_BY cannot be declared in D9** (both ends are kernel Assertions). Options: (a) kernel adds `RETELLS {retellingMode, linkBasis, stance}` and `QUALIFIED_BY {qualificationKind}`; (b) reuse `DERIVED_FROM` for retelling (PROV wasQuotedFrom ⊂ wasDerivedFrom) with mode/basis as Assertion properties; (c) retelling only via the RETELLING_FIDELITY Assessment (`ASSESSES` the retelling, `DERIVED_FROM` the original) — loses unassessed retellings, which CQ-CL-06 must count. Owner: kernel; D9 recommends (a) for RETELLS and folding QUALIFIED_BY into (a) as `RETELLS`-sibling or into `qualifiers` with a qualifier-locator |

Revised D9 node candidates after reconciliation: **Channel**, **MediaWork** (Episode + Publication + post + article generalized), **DocumentTextVersion**, **Chunk** (Segmentation folded in), **MediaAsset** (optional, Q-D9-17) — 4 or 5 types. Revised relationship candidates: PUBLISHES, RENDITION_OF (declared on MediaWork, direction IN from Source), OCCURS_IN (on MediaWork, IN from Assertion), REPUBLISHES, APPEARS_IN (D7 seam), SPONSORED_BY (D7 seam, asserted, episode), OPERATED_BY (D7 seam), LINKS_OFFER (D6 seam), RECORDING_OF (D13 seam), TEXT_OF (TextVersion → SourceSnapshot), HAS_CHUNK / FROM_TEXT_VERSION, MENTIONS (Chunk → Subjectable, derived, kernel meaning), DEPICTS (MediaAsset → Subjectable, asserted) — ≈ 13 types; RETELLS / QUALIFIED_BY requested from the kernel.

## 1. Findings that should shape the model (from real artifacts)

1. **Container ≠ rendition, and renditions diverge.** One episode (HL ep 52) has a publisher page with a speaker-labelled transcript, a YouTube video with a different caption wording, an RSS audio enclosure re-cut on 2025-05-21 with different sponsors, and a Spotify page; durations 2:10:42 / 7,556 s / "2 hr 5 min". Sponsor reads differ by rendition ("ROKA, InsideTracker, Magic Spoon" vs "AG1, LMNT & Waking Up"). → The work (container) is a D9 node; each rendition is a kernel `Source` with snapshots; **sponsorship, media-time locators and transcripts belong to a rendition observed at a time**, not to the work.
2. **Practice report ≠ recommendation, inside one speaker turn sequence.** "My 82 -year-old father, we take a gram of NMN every day." (practice report) vs "Go to doctorsinclair.com … get this test" (recommendation of the speaker's own product) vs "InsideTracker is one of them and you just do it a couple of times a year" (recommendation of a service where he holds roles). `speechAct` on the occurrence carries this; a stored Person→Product RECOMMENDS edge would erase it.
3. **Disclosure is time-indexed and placed.** The self-disclosure page captured 2021-12-09 has no Tally Health line; the 2026 page says "(2021-2024) F,I,E". Caudalie roles were added retroactively. FTC letters grade disclosure by placement (in video, audible, caption, platform tool) and by whether the sponsor is named. → Disclosure finding = enum + placement + the locator of the disclosure span (or the snapshot consulted) + capture completeness. Valid time of the interest (D7) and recorded time of the disclosure diverge — this is the D9 edge set that needs the bitemporal profile.
4. **Corrections and re-cuts are discourse events.** *Lifespan* ep 4's publisher correction ("1 gram" → "1-2 milligrams") sits in show notes only; HL "Essentials" re-publishes 2021 speech in 2025 under new sponsors; NMN.com retells the re-cut without a citation. → Need: a correction link (by another asserter, same container), a re-publication link between works, and retelling with link basis.
5. **Retelling fidelity must be against a span, not a document.** RAPA-EX-01's abstract says grip −1.13 kg, its results say −1.19 kg; Attia's retelling matches the results span and adds the HbA1c finding that only the results contain. A retelling-fidelity judgment must name the original span (`AGAINST_ORIGINAL` → the located assertion), and the D3 study may itself be internally inconsistent.
6. **Same person, many hats.** Trial authors run YouTube channels and supplement companies (RAPA-EX-01 COI); hosts are sponsored by companies they hold equity in (*Lifespan* sponsors InsideTracker, Levels, Athletic Greens; affiliations page lists I,A,IP / E,A / A); a founder recommends Rx products linked to a store branded with his name (Blueprint → immortals.com). → Person is D7; D9 only needs `APPEARS_IN` roles and the occurrence → interest path.
7. **Discovery infrastructure is mostly closed.** Reddit 403 (and firecrawl refuses it); Altmetric needs a key since 2025-11-10; Crossref Event Data sunset 2026-04-23; no YouTube Data / Podcast Index keys; Apple episode lookup capped at 200. Works: RSS, iTunes search, Substack JSON, Wayback CDX, firecrawl for YouTube/X/Spotify/forums. → "Not found" must always be qualified by a coverage record (Q-D9-16), never read as "absent".
8. **Text normalization is a real locator problem.** U+00A0 inside quotes (affiliations, Blueprint byline), U+2009 in JATS numbers, OCR errors in FTC PDFs ("appeai-s"), caption vs transcript wording. → Locator `exact` must be paired with the text version (and its activity: OCR, caption track, publisher transcript) and a normalization version, as the kernel already plans.

## 2. Candidate node types (D9-owned), with the questions that need them

Default answer is no; each candidate argues for itself. Budget ≤ 8 node types.

| candidate | identity | why a node (question that filters/joins/traverses through it) | merges from pinned | verdict |
| --- | --- | --- | --- | --- |
| **Channel** | (platform, platform account id or feed URL) — e.g. RSS feed URL, YouTube channel id, Substack subdomain, forum host | CQ-CL-05 (channel-level sponsorship and operator interest), Q-D9-06, Q-D9-19 (influence by channel), Q-D9-12 (cited accounts); joins works to the operating Person/Organization (D7) | W21 Channel, Series (as `channelKind` SHOW; sub-series deferred), Platform (→ `platform` enum property), W18 Community (online forums → `channelKind` FORUM) | **keep** |
| **MediaWork** (name open: `Work`, `Episode`, `MediaItem`) | (channel, platform item id) or canonical URL; RSS `guid` = Apple `episodeGuid` | The container every occurrence `OCCURS_IN` (CQ-CL-01); re-cuts (Q-D9-07); sponsorship target (CQ-CL-08, Q-D9-06); recording of a talk (Q-D9-18); cited post in a regulator letter (Q-D9-12) | W21 Episode (generalised by `workKind`: PODCAST_EPISODE, VIDEO, LIVESTREAM, NEWSLETTER_POST, ARTICLE, SOCIAL_POST, FORUM_THREAD, FORUM_POST, TALK_RECORDING, PROTOCOL_PAGE, PRESS_RELEASE, BOOK) | **keep** (scholarly Publication stays D3) |
| **DiscourseAssessment** | uid; one per (kind, assessed occurrence, inputs, methodVersion) | CQ-CL-04 / Q-D9-09 (retelling fidelity), CQ-CL-05 / Q-D9-02 (conflict relevance + disclosure finding), Q-D9-21 | W21 RetellingFidelityAssessment + ConflictRelevanceAssessment merged with `assessmentKind` (RETELLING_FIDELITY, CONFLICT_RELEVANCE) | **cut after reconciliation**: kernel `Assessment` kinds RETELLING_FIDELITY / CONFLICT_RELEVANCE (§0) |
| EpisodeSegment | (rendition, delimiting locator) | CQ-CL-08 (sponsor read vs editorial), Q-D9-06 | W21 EpisodeSegment | **defer**: carry `segmentKind` on the occurrence and on the locator (media-time / chapter selector); revisit only if a question needs to traverse a segment shared by many occurrences |
| MediaAsset | content hash of the original rendition | Q-D9-17 (value 3) only | W22 MediaAsset; FigurePanel (→ `assetKind` FIGURE_PANEL + locator region); MediaVariant (→ kernel SourceSnapshot); MediaAnnotation (→ kernel SourceLocator with region/time selector) | **defer or kernel** per A1's map; no D9 first-pass question at value ≤ 2 needs it |
| Community (offline) | — | none at value ≤ 2 | W18 Community | **defer** (online communities are Channels) |
| Conference / Event / NarrativeArc / EventImpactAssessment | — | Q-D9-18 via seam | W18 | **D13 owns** (Event, Frontier); D9 adds only `RECORDING_OF` from a work to an event |
| SourceAuthorityAssessment, SourceDiscoveryRecord, SourceCoverageRequirement | — | Q-D9-14, Q-D9-15, Q-D9-16 | W19 | **K or D11** (coverage is a kernel-level answer obligation); D9 consumes |
| GraphView, MediaSuitabilityAssessment, MediaRightsRecord, ProductLabelRegion | — | none in D9 questions at value ≤ 2 | W22 | **defer** (label regions → D6 + kernel locator; rights → properties on Source until a question needs a node) |
| Claim, ClaimOccurrence, RelationshipAssertion | — | — | W21 | **kernel (A1)**: occurrence = Assertion CLAIM + label; RelationshipAssertion merges into Assertion |
| Chunk, DocumentTextVersion, Segmentation, Document | (text version: snapshot + extraction activity; chunk: text version + char span + segmentation hash) | Q-D9-20 (3.8 path), CQ-PV-02 (re-anchoring across text versions) | W20 | **D9 per A1's map**: keep DocumentTextVersion and Chunk; fold Segmentation into properties; Document → kernel Source |

Estimated D9 node types (pre-reconciliation draft): 3. **Reconciled (§0): 4–5** — Channel, MediaWork, DocumentTextVersion, Chunk, optional MediaAsset.

## 3. Candidate relationships (with questions)

Class per directive 2.3. `temporal` = whether a valid-time episode is needed (else recorded time only).

> Superseded in part by §0: ASSESSES / CONSIDERS become kernel `ASSESSES` / `DERIVED_FROM` from a kernel `Assessment`; RETELLS and QUALIFIED_BY are Assertion→Assertion and must be requested from the kernel; the derived RECOMMENDS projection is D10's. OCCURS_IN and RENDITION_OF are declared on the D9 container with `direction: IN`.

| type | from → to | class | questions | temporal | notes |
| --- | --- | --- | --- | --- | --- |
| PUBLISHES | Channel → MediaWork | structural | CQ-CL-01, Q-D9-06, Q-D9-19 | recorded-only | from RSS/channel listing |
| RENDITION_OF | Source (K) → MediaWork | structural | CQ-CL-01, CQ-PV-02, Q-D9-06 | recorded-only | seam K; one Source per URI (publisher page, YouTube URL, RSS enclosure, Spotify) |
| REPUBLISHES | MediaWork → MediaWork | asserted | Q-D9-07, CQ-CL-06 | recorded-only | re-cuts ("Essentials"), reposts, clips; `republishKind` (RECUT, CLIP, REPOST, TRANSLATION) |
| OCCURS_IN | ClaimOccurrence (K) → MediaWork | structural | CQ-CL-01, Q-D9-01, Q-D9-20 | recorded-only | target union ≤ 2 if scholarly Publication must also be a container; otherwise MediaWork only |
| RETELLS | ClaimOccurrence (K) → Assertion (K) | structural | CQ-CL-04, CQ-CL-06, CQ-PV-05, Q-D9-09, Q-D9-10 | recorded-only | edge props `retellingMode`, `linkBasis`, `citationLocatorUid` / `hypothesisUid`, **`stance`** (ACCEPTS, QUALIFIES, CONTESTS; new, for Q-D9-10); kernel→kernel edge, owner contested (D9 proposes it owns the semantics) |
| QUALIFIED_BY | ClaimOccurrence → ClaimOccurrence | structural | CQ-CL-03, Q-D9-04 | recorded-only | `qualificationKind` gains **CORRECTION** (publisher correction in the same container, different asserter) |
| APPEARS_IN | Person / Organization / PseudonymousActor (D7) → MediaWork | asserted | CQ-CL-01, CQ-CL-08, Q-D9-18 | recorded-only | `role` (HOST, CO_HOST, GUEST, PANELIST, AUTHOR, POSTER, SPONSOR_READER); seam D7; 3 pairs |
| SPONSORED_BY | MediaWork → Organization (D7) | asserted | CQ-CL-05, CQ-CL-08, Q-D9-06 | **episode** | valid time = the rendition window in which the read was observed (publication or re-cut stamp → next re-cut); the assertion's locator is on one rendition's snapshot; member of D7's FINANCIAL_INTEREST family (round 0006 `SPONSORS_CONTENT`) — direction and owner to agree with D7 |
| OPERATED_BY | Channel → Person / Organization (D7) | asserted | CQ-CL-05, Q-D9-12 | episode | channel ownership changes (e.g. "Scicomm Media" as publisher); 2 pairs |
| LINKS_OFFER | MediaWork → Offer (D6) | asserted | CQ-CM-04, Q-D9-21 | recorded-only | `linkKind` (AFFILIATE, DISCOUNT_CODE, STORE, REFERRAL); show-note URL as locator |
| RECORDING_OF | MediaWork → Event (D13) | asserted | Q-D9-18 | recorded-only | seam D13 |
| ASSESSES | DiscourseAssessment → ClaimOccurrence (K) | structural | CQ-CL-04, CQ-CL-05, Q-D9-02, Q-D9-09, Q-D9-21 | recorded-only | the assessed occurrence |
| CONSIDERS | DiscourseAssessment → Assertion (K) | structural | same | recorded-only | edge prop `inputRole` (ORIGINAL, LOST_QUALIFIER, FINANCIAL_INTEREST, DISCLOSURE, CORRECTION); replaces pinned AGAINST_ORIGINAL, IDENTIFIES_LOST_QUALIFICATION, ASSESSES_INTEREST, FOR_OCCURRENCE |
| RECOMMENDS (derived) | Person / Organization → `Subjectable` | derived, read-only | Q-D9-01 | — | retrieval projection only (directive 3.9): rebuilt from occurrences with `speechAct = RECOMMENDS`, method version, carries `occurrenceUids`; prefer a `@cypher` read field over a stored relationship to save pairs |

Estimate: 13–14 relationship types, ~20–24 from→to pairs, widest union 3 (APPEARS_IN asserter types) — within budget if the kernel pattern absorbs "any entity" objects.

## 4. Properties, enums and Assertion.predicate values

Properties (not nodes):
- Channel: `channelKind` (SHOW, VIDEO_CHANNEL, NEWSLETTER, BLOG, SOCIAL_ACCOUNT, FORUM, CONFERENCE_SERIES), `platform` (RSS, APPLE_PODCASTS, SPOTIFY, YOUTUBE, SUBSTACK, X, INSTAGRAM, TIKTOK, REDDIT, FORUM_WEB, WEB), `feedUrl`, `platformAccountId`, `handle`, `language`.
- MediaWork: `workKind` (see §2), `title`, `publishedAt` (+ precision), `durationSeconds` (per rendition → lives on Source, not here), `episodeNumber`, `seasonNumber`, `itemGuid`, `canonicalUrl`, `reviewStatus` of transcript (publisher says "under human review") → on the text version, not the work.
- ClaimOccurrence (kernel-owned fields D9 relies on): `speechAct`, `reportedSpeechAct`, `assertionBasis`, `segmentKind` (EDITORIAL, SPONSOR_READ, INTRO, OUTRO, SHOW_NOTES, CORRECTION_NOTE, DISCLAIMER, Q_AND_A, CAPTION), `utteranceText`, `speakerLabelInSource`, quantity literal fields with `quantityBasis` (UNSPECIFIED allowed).
- DiscourseAssessment: `assessmentKind`, `methodVersion`, `status`; for RETELLING_FIDELITY: `lostQualificationKinds[]`, `speechActFrom`, `speechActTo`, `scopeBroadened`, `amountChanged`, `correctionIgnored`, `matchedOriginalSpan` (via CONSIDERS); for CONFLICT_RELEVANCE: `relevanceLevel` (DIRECT, INDIRECT, NOT_RELEVANT, UNDETERMINED), `relevanceBasis` (SAME_PRODUCT, SAME_ORGANIZATION, SAME_SERVICE_CATEGORY, SAME_SUBSTANCE_CLASS_VIA_GROUP, …), `temporalOverlap`, `disclosureFinding` (DISCLOSED_IN_CONTAINER, DISCLOSED_ELSEWHERE_AT_TIME, DISCLOSED_ELSEWHERE_LATER_ONLY, NOT_FOUND_IN_PARTIAL_CAPTURE, NOT_FOUND_IN_COMPLETE_CAPTURE, INADEQUATE_PER_REGULATOR), `disclosurePlacement` (AUDIBLE, ON_SCREEN, CAPTION_OR_DESCRIPTION, SHOW_NOTES, PLATFORM_TOOL, SELF_DISCLOSURE_PAGE, PAPER_COI), `captureCompleteness`.
- Source (kernel) fields D9 needs on renditions: `platform`, `durationSeconds`, `enclosureUpdatedAt` (from `?updated=`), `sponsorListObservedAt`.

Enum changes proposed:
- `QualificationKind` + CORRECTION.
- `RetellingMode` + CLIP, RECUT (or keep these on REPUBLISHES only — prefer REPUBLISHES).
- New `RetellingStance` (ACCEPTS, QUALIFIES, CONTESTS, UNSTATED).
- `SpeechAct` unchanged (sponsor reads are `segmentKind` SPONSOR_READ with speechAct RECOMMENDS or STATES; a sponsor read is never projected into RECOMMENDS without `segmentKind` filtering — decide in the derivation rule).

`Assertion.predicate` values that stay predicate-only (no typed edge): TAKES / PRACTISES (practice reports), USES_DOSE (quantities), AFFILIATED_WITH (verbatim role titles like "scientific lead guy"), ENDORSES_PRODUCT (never derived from sponsorship), MENTIONS_PRODUCT (no — that is MENTIONS, derived), CITES (article → paper; use RETELLS when a proposition is retold), REPORTS_ADVERSE_EXPERIENCE (community; object = D5 adverse-effect term), REVERSES_PRACTICE (Q-D9-23; promote only if Q-D9-23 rises to value 1), WARNED_BY_REGULATOR (D8 owns the action).

## 5. Pinned types: merge / defer list (for `06-node-register.yaml`)

- mergedInto: Platform → Channel.platform; Series → Channel (channelKind SHOW); Community (online) → Channel (FORUM); Episode → MediaWork; RelationshipAssertion → kernel Assertion; RetellingFidelityAssessment + ConflictRelevanceAssessment → DiscourseAssessment; MediaVariant → kernel SourceSnapshot; MediaAnnotation → kernel SourceLocator (region / time selector); FigurePanel → MediaAsset (if kept) or SourceLocator region on a figure rendition.
- deferred: EpisodeSegment (segmentKind property), Community (offline), GraphView, MediaSuitabilityAssessment, MediaRightsRecord (rights as Source properties until a question needs them), ProductLabelRegion (D6 + kernel locator), MediaAsset (unless A1 keeps it in the kernel), NarrativeArc (D13 decides).
- to other owners: ClaimEvidenceAssessment (D3/D10), Conference/Event/EventImpactAssessment (D13), SourceAuthorityAssessment / SourceDiscoveryRecord / SourceCoverageRequirement (K or D11), Document/DocumentTextVersion/Segmentation/Chunk/Claim/ClaimOccurrence (K).
- Unions retired: MediaSubjectTarget (75), EpisodeMentionableTarget (9), ClaimSpeakerTarget (4 → kernel asserter pattern), OccurrenceContainerTarget (3 → MediaWork, + Publication only if needed), SponsorableTarget, EventParticipantTarget (D13).

## 6. Retrieval patterns to write (03-retrieval-patterns.md)

- Q-D9-20 (directive 3.8): vector index on Chunk text of a rendition's text version → chunk span overlaps a SourceLocator in the same text version (offset join, or A1's derived chunk↔locator edge) → ClaimOccurrence SUPPORTED_BY the locator, status ACCEPTED → Source/snapshot digest. FC-1 is the fixture.
- Q-D9-01: `MATCH (o:ClaimOccurrence {speechAct:'RECOMMENDS'})-[:ASSERTED_BY]->(p) WHERE o.segmentKind <> 'SPONSOR_READ'` + object via kernel pattern + OCCURS_IN work + locator. The derived RECOMMENDS projection is only an index into this.
- Q-D9-02 / CQ-CL-05: occurrence → work.publishedAt = T → D7 interest assertions valid at T (asOf) → object organization relates to the recommended item (D6 product made/sold by org) → DiscourseAssessment(CONFLICT_RELEVANCE) if present; disclosure via CONSIDERS(DISCLOSURE) locator; coverage record otherwise. Needs D7 interest edges with valid-time episodes.
- Q-D9-03: two snapshots of the self-disclosure Source; role assertions grouped by `recordedAt` vs `validFrom`; bitemporal as-of query.
- Q-D9-09: retelling occurrence -[:RETELLS]-> study assertion (D3) with its locator; DiscourseAssessment(RETELLING_FIDELITY) -[:CONSIDERS {inputRole:ORIGINAL}]-> the span-specific assertion.
- Q-D9-06: work ← RENDITION_OF ← Source (per platform) ; SPONSORED_BY assertions whose locator lies in that Source's snapshot, ordered by valid time.
- Q-D9-19 (GDS): project Person→Person "retold-by" weighted graph from (p1)<-ASSERTED_BY-(o1)-[:RETELLS]->(a)-[:ASSERTED_BY]->(p2); PageRank, monthly refresh, materialized with method version (directive 3.6 association pattern).
- Q-D9-08: temporal ordering of occurrences INSTANCE_OF a Claim by work.publishedAt; optional materialized spread curve.
- Fulltext/vector indexes: chunk text (kernel), ClaimOccurrence.utteranceText (fulltext), MediaWork.title.

## 7. Seams and contested ownership

| seam | other module | what crosses | note |
| --- | --- | --- | --- |
| speaker identity, roles, financial interest | D7 | APPEARS_IN, SPONSORED_BY, OPERATED_BY targets; interest assertions read by Q-D9-02 | D7's Q-D7-06 mirrors Q-D9-02; ConflictRelevanceAssessment contested (D7 vs D9 vs K/D10) |
| offers / affiliate links / products | D6 | LINKS_OFFER → Offer; recommended item → Product | Rx status of recommended products from D8 |
| study results retold | D3 | RETELLS → assertion extracted from a Publication | the original span is a D3/K locator |
| adverse-effect terms, targets | D5 | object of REPORTS_ADVERSE_EXPERIENCE; target vocabulary for "recommended for T" | consume `vocab-targets.yaml` when published |
| events, talks, frontiers | D13 | RECORDING_OF → Event; claims about frontier F | consume `vocab-frontiers.yaml` (published by A7) |
| regulator actions about content | D8 | warning letter → cited work / asserter | D8 owns the action node |
| claim lifecycle, assessments archetype, coverage, chunks, locators | K / D10 | ClaimOccurrence, Assertion, Chunk, SourceLocator, Activity, coverage record | everything provenance-shaped |
| source/tool capability | D11 | discovery outcomes, readiness | A8 also owns D11 |

## 8. Open questions (candidates for `11-open-questions.md`)

1. Is `ClaimOccurrence` its own node type or an `Assertion` with `assertionKind = OCCURRENCE` (OQ-4.8)? D9 needs only: one asserter, one container, one located span, speechAct/basis. Owner: kernel.
2. Who owns `ConflictRelevanceAssessment` / the disclosure finding — D7 (money), D9 (occurrence and container), or K/D10 (assessments)? Evidence: whether any non-D9 question uses it. Owner: owner + A1 + A6.
3. Sponsorship direction and placement: `MediaWork -[:SPONSORED_BY]-> Organization` with rendition-window validity, or on the rendition `Source`? Evidence: Q-D9-06 needs per-rendition answers; putting it on Source creates a kernel→D7 seam. Owner: D9 with A1.
4. Re-cuts: is a re-published utterance a new ClaimOccurrence (new container, same asserter, same words) or the same occurrence located in a second container? Identity rule says one per act of asserting; the 2025 re-cut is not a new act. Evidence: CQ-CL-06 counts. Owner: kernel + D9.
5. Turn-spanning and assent assertions ("So it's a gram of resveratrol and a gram of NMN." / "Right."): does the locator span two turns with two speaker labels? Owner: kernel (locator), D9 (extraction guideline).
6. Recommendation granularity: one occurrence per recommended item in a protocol page (Blueprint lists dozens) or one per protocol with items as objects? Evidence: Q-D9-01 / Q-D9-21 answer shape. Owner: D9 with D5 (protocol).
7. Is a publisher correction a `QUALIFIED_BY {CORRECTION}` (same container, other asserter) or a kernel correction/supersession mechanism (round 0007)? Owner: kernel.
8. Do media assets (figures, lab-report images) enter the first pass? Only Q-D9-17 (value 3) needs them. Owner: owner.
9. Capture terms: X and YouTube were scraped via firecrawl without official APIs; Reddit is blocked. Is scraping acceptable for production capture? Owner: owner + D11.
10. Ownership and commercial ties of NMN.com and Immortals (legal entity) were not established. Owner: D7.
11. The Nature-paper figure reused in a newsletter: does the graph record rights at all in pass one? Owner: owner.

## 9. Fixture plan for the fixtures stage

- Unstructured-to-entity: **FC-1** (HL ep 52 transcript chunk → NMN practice-report occurrence → TextQuote locator → snapshot `3158acee…`), with the YouTube rendition as the re-anchor test.
- Harm: **FC-3** (*Lifespan* ep 4 correction; dosing error) — or FC-6 (community adverse report) / FC-5 (FTC).
- Disconfirmation: **FC-4** (RAPA-EX-01 negative result, contested retelling, abstract-vs-results inconsistency).
- Recommendation with reachable financial interest (packet direction): **FC-1 quote 5 + FC-2** (on-air promotion of own test; disclosure page as of 2021-12-09 vs now) — pairs with D7.
- Every `assertions.yaml` needs `producedBy: { missionId, runId }` (directive §4.5); this research stage ran under no Mission Control mission — the fixtures stage should use the run id the coordinator assigns.

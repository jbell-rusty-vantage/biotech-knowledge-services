# D11 — open questions

Model stage, A8, 2026-10-08. Format: question · evidence that would decide it · owner. Items 1–11 are requests to or contests with the kernel; 12–17 are owner decisions; 18–19 are cross-module; 20–24 are conflicts between the contract, the directive, the briefs and what D11 found (every one is listed, none resolved silently). Items 25–30 were added in the fixtures stage; 31–34 in the check stage; 35–44 in the adversarial review.

## Kernel (owner A1)

1. **Should `CaptureAttempt` (D11) stay in the graph, given that the kernel deferred SourceDiscoveryRecord to "D11's action-space registry (operational, not graph)"?**
   - D11 position: yes, narrowed. Q-D11-17 (D11, value 1, harm) and K:CQ-AX-04 (owner K: value 2, neutral; the earlier "value 1, harm" here was a mis-copy) filter through it, and a failed request leaves no snapshot to carry the fact. Since the adversarial review it records only FAILED / PARTIAL requests: "not reported by the source" is the kernel's FIELD_NOT_REPORTED on a COMPLETE snapshot, so the EMPTY_RESULT and CAPTURED outcomes, `resultCount` and `ToolActionKind` were dropped (item 35).
   - Measured cost: +14,028 bytes, +4 inputs against A1's current kernel (adversarial review, sha256 `b2c2b1b0…`); was +15,374 / +5 before the review.
   - Kernel response (A1 model stage, read in the check stage): K `03` CQ-AX-04 reads `CaptureAttempt` by `subjectUid`, K `10-seams.yaml` lists D11.CaptureAttempt → Activity WAS_GENERATED_BY, and K open question 25 asks only to confirm it is not a second lineage mechanism (it is not: it has no run identity of its own). Remaining decision: the owner's.
   - Fallback: alternative (a) in `09-reasoning.md`, three properties on `SourceSnapshot`, +4,030 bytes. It loses failures that returned no bytes and turns error pages into Sources.
   - Evidence that decides it: fixture `07-fixtures/capture-failures-coverage` answering CQ-AX-04 with distinct states for one subject (NOT_REPORTED_BY_SOURCE from the kernel FIELD_NOT_REPORTED f01; UNKNOWN_BLOCKED only from CaptureAttempts; REPORTED; UNKNOWN_NEVER_QUERIED).
   - Owner: **kernel** + **owner**.
2. **`captureMethod` convention.** Adopt `SourceSnapshot.captureMethod = "<action-space entry id>/<tool version>"` (e.g. `europepmc-fulltext-jats/2026-10-08`, `firecrawl-cli/1.23.1`), so captures join the registry and `CaptureAttempt.toolId`.
   - The kernel docstring's example is `firecrawl-scrape/2`.
   - Evidence: Q-D11-01 and CQ-PV-03 patterns run on the fixtures.
   - Owner: **kernel**.
3. **Hash basis for tool renditions.** Add `TOOL_RENDITION` to the `contentHashBasis` values (RAW_BYTES | NORMALIZED_TEXT | STORED_EXCERPT_TEXT | SYNTHETIC_FIXTURE), or require a RAW_BYTES capture next to every rendition.
   - The question behind it: may an assertion whose only snapshot is a Firecrawl/Tavily markdown rendition reach ACCEPTED?
   - Evidence: FC-2c (retraction notice), FC-7 (NDI letter: β dropped; sibling letter image-only), FC-9 (brand page). The verifier's behaviour on re-selection from a rendition versus issuer bytes.
   - Owner: **kernel** + **owner**.
4. **XML locators.** verification.v1 has no XML selector kind. JATS `sec@id`/`p@id`, SPL `section@ID` (with LOINC section code) and PubMed `CommentsCorrections` are written as `HTML` (a DOM selector on the markup) in D11's patterns and registry.
   - Options: confirm HTML covers XML, or add an XML kind to verification.v1.
   - Evidence: the verifier re-selecting FC-1, FC-2b and FC-3 locators.
   - Owner: **kernel** (verification.v1 contract owner).
5. **TEXT_QUOTE normalization.** The normalization named in `selectorJson` must fold U+2009, U+00A0, U+202F and hyphen variants inside quoted numbers, and drop inline markup such as `<sup>®</sup>`.
   - Evidence: FC-1 Par30 "500 mg" (thin space) re-selected with and without folding.
   - Owner: **kernel**; gap G4 builds the normalizer.
6. **New identifier scheme codes** for `packets/K/identifier-schemes.yaml`.
   - Check stage: K register v2 already lists FDA_NDI, FDA_GRN, RW_RECORD, UDI_DI and NIH_PROJECT as `status: requested`; D11 adopted those spellings (was NDI_NOTIFICATION, GRAS_NOTICE, RETRACTION_WATCH_ID, NIH_GRANT). Remaining asks: promote them to active.
   - Still missing from K, firm: SPL_SET_ID (Q-D11-11, CQ-PV-05), EIN (Q-D11-15; in EDGAR submissions), ORG_STUDY_ID with issuer = the sponsor (B04).
   - Optional, the owning domain decides: NCIT (D1/D2).
   - Evidence: `identifier-bridges.yaml` `observed` rows.
   - Owner: **kernel**.
7. **Normalization rule ids and identifier registration status.**
   - Adopt the rule ids in `identifier-bridges.yaml` (`doi-lowercase-v1`, `gtin14-v1`, `npi-v1`, `lei-upper-v1`, `casrn-v1`, …) as `Identifier.normalizationRule` values, and cite them from the K register's `normalization` column.
   - Add `Identifier.registrationStatus` (ACTIVE, LAPSED, RETIRED, MERGED, UNKNOWN) for the identifier string itself. The assignment status stays on the HAS_IDENTIFIER episode.
   - Evidence: LEI 529900OPI7B8JPXCVS70 LAPSED with a stale legal name; ICD-10-CM fiscal-year validity; GTIN check digits verified on two real UPCs.
   - Owner: **kernel**.
8. **Assessment subkind registration** `D11.quantity-basis` (kind APPLICABILITY) for the CQ-PV-04 qualification block (salt vs moiety basis, label amount vs study dose).
   - Evidence: the FC-1 + FC-4 + DSLD 323170 comparison.
   - Owner: **kernel** (register) with **D1/D6**.
9. **Default privacy of CaptureAttempt.** Should failed-attempt records be `privacyClass: INTERNAL` and hidden from the public GraphQL surface (an operational log), or public, so that end users see "blocked" coverage?
   - Evidence: product decision on CQ-AX-04 wording in answers.
   - Owner: **owner** (kernel enforces).
10. **Name-only identity attempts.** NPI homonyms and CIK↔LEI name matches: store RESOLUTION Assessments only when a question needs them, or always?
    - Evidence: B18 and B20 and the volume of homonyms per person name (3 for one public figure).
    - Owner: **kernel** / **D7**.
11. **Text-mined annotations as a MENTIONS source.** Allow Europe PMC annotations as an entity-link method (method-versioned, derived) or exclude them, given the observed mislink?
    - Evidence: precision of Europe PMC annotations on 3–5 fixture papers against GSRS/ChEBI.
    - Owner: **kernel** (3.8 pattern) / **D9** (chunk linker).

## Owner decisions

12. **Where the action-space registry lives long-term.**
    - Options: repo YAML (today), the Mission Control asset catalog, or the graph. D11 says repo/catalog; the graph only if a question traverses tool → source (none does).
    - Evidence: whether Mission Control planners need registry reads at run time.
    - Owner: **owner**.
13. **Registry history (gap G1).**
    - Option 1: accept "history from our first observation" as the product position. The CT.gov internal history API is 403 for every client tried, including browsers via Firecrawl.
    - Option 2: seek NLM access or a browser-fallback exception.
    - Evidence: `capture-failures-coverage` fixture; D3/D5/D13 tool logs.
    - Owner: **owner** + **D3**.
14. **Keys and quotas for team runs (gap G6).** Decide who holds the data.gov (FDC, regulations.gov), OpenAlex, NCBI and Semantic Scholar keys.
    - Evidence: FDC 429 on the shared DEMO_KEY, OpenAlex USD budget, Semantic Scholar unkeyed 429.
    - Owner: **owner**.
15. **Capture-attempt recorder (gap G10).** Every tool adapter and the executor must emit CaptureAttempts for non-captures. That means stripping credentials, detecting soft failures (200 with an error page) and stamping `captureMethod`.
    - This is tooling outside packet scope (Mission Control adapters, `packages/kg-ops`).
    - Evidence: an integration test writing the eight attempts of the fixture.
    - Owner: **owner**.
16. **MCP connectors.** Adopt them for discovery only and wrap the authority APIs with capture adapters (`tooling/action-space.yaml` `mcpRecommendation`).
    - Evidence: connectors drop CommentsCorrections, submission dates, retraction status and raw bytes (tool-log rows 35–36).
    - Owner: **owner**.
17. **Licensed sources** (KEGG, LOINC table, DrugBank, Natural Medicines, CAS). Decide whether to license, to store identifiers only, or to skip.
    - Evidence: registry entries with readiness 0.
    - Owner: **owner**.

## Cross-module

18. **Publication ownership (D3 `Publication` vs D9 `MediaWork`).** D11's integrity, registration-link and preprint patterns (Q-D11-02, 04, 05, 19) are written against D3 `Publication` + `REVISES` + `REPORTS_ON`. If D9 owns the scholarly work, the patterns re-point.
    - Evidence: the synthesizer's ownership decision.
    - Owner: **D3 / D9** (A4 / A8).
19. **D9 index names.** The vector index `chunk_embedding` and fulltext index `chunk_text` on Chunk are assumed by Q-D11-03.
    - Owner: **D9**.

## Conflicts between the contract, the directive, the briefs and D11's findings

20. **"Every typed relationship needs a fixture" vs a module with no relationships.** D11's fixtures exercise kernel and other modules' relationships, plus the one D11 node type. The contract's "one fixture per relationship" is vacuous here, and the five fixtures are chosen by question, not by edge. The synthesizer should not read "0 relationships" as "untested".
    - Owner: **owner** (S).
21. **The brief says D11 "decides which Source kinds, Identifier schemes and SourceLocator kinds the kernel supports".**
    - The kernel published first. It set SourceKind = verification.v1's 13 capture kinds, with the editorial kind in `Source.genre` (a D9 register). Identifier schemes are A1's register. Selector kinds are verification.v1's.
    - D11 therefore supplies evidence and requests (items 3–7) rather than decisions.
    - The research-stage SourceKind gap table (DSLD label records, label-specific kinds) now concerns D9's `genre` register.
    - Owner: **owner** (confirm the order of authority), **D9** (genre values: LABEL_DATABASE_RECORD for DSLD).
22. **The coordinator's packet direction expected an enums-only SDL; D11 ships one node type.** The research stage recommended 0 node types. Modeling CQ-AX-04 showed that the kernel cannot hold failed attempts without either a node or polluting `Source` (`09-reasoning.md` decision 2).
    - Both options are measured.
    - Owner: **owner** + **kernel**.
23. **"Collect every packet's 08-sources-and-tools.md into the action space" (02-TEAM) vs this stage's scope.**
    - The registry holds 59 entries: 45 exercised by D11 (publisher-pages added in the fixtures stage) and 14 tier-2 entries scored from sibling tool logs.
    - The cross-packet merge of the other packets' `08` tables happens in a later pass. Until then, other packets' tool ids may not match registry ids, which matters for `captureMethod` joins (item 2).
    - Owner: **owner** (S / D11 later pass).
    - **Resolved in the cross-packet pass (2026-10-08, item 45):** `tooling/action-space.yaml` now merges all fourteen packets; every packet-local id maps to a canonical id through its top-level `aliases`.
24. **Pinned catalog "Domain D11: Seam closure" vs program D11 (action space).** `schema-map.md` numbers domains differently, and its D11 is an assembly artifact (the RecommendableTarget union). It is recorded under `mergedInto` as nothing to absorb.
    - Owner: **S** (naming in the synthesized map).

## Fixtures stage (A8, 2026-10-08)

25. **Evidence for item 3 (tool renditions).** The publisher retraction notice (fixture `resveratrol-retraction-integrity`) can only be captured as a Firecrawl rendition: curl gets a Cloudflare challenge (CaptureAttempt `ca-aps-notice-curl`). Two renditions 43 minutes apart have the same length and different sha256, because one navigation anchor id is random. Quotes re-select; hashes do not.
    - Fixture choice until the kernel decides: `contentHashBasis NORMALIZED_TEXT`, `captureCompleteness UNKNOWN`, and a note that it is a tool rendition. `TOOL_RENDITION` (item 3) would be the honest value.
    - Evidence that would decide it: whether the verifier hashes a boilerplate-stripped main-content projection (`canonicalProjectionHash`) for scraped renditions.
    - Owner: **kernel**.
26. **Asserter of FIELD_NOT_REPORTED.** In fixture `nr-trial-jats-unstructured`, "PubMed has no [si] link to NCT02921659" is asserted by NLM, because the search response says "No items found." But "the CT.gov referencesModule lists no publication" is asserted by BellLabs' own Agent, because the registry is merely silent.
    - Decide whether the kernel convention fixes one asserter rule: the source when it answers a query, our Agent when we read a record and find a field empty.
    - Adversarial review addendum: with the CQ-AX-04 pattern now on K's state definitions, the subject rule matters too. a06 (CT.gov silence) has the record Source as subject, so for the Study the pattern returns UNKNOWN_NEVER_QUERIED for ctgov-v2-api although the registry was read. Proposed rule: subject = the entity the field would describe (the Study), evidence = the record section read.
    - Owner: **kernel**.
27. **Prescription labels in D6.** The sirolimus fixture needs `PanelKind` OTHER, because D6 has no prescription-label value (DRUG_FACTS is the OTC panel). It also needs a `ComponentLineRole` for an Rx active ingredient (only DIETARY_INGREDIENT, NUTRIENT and similar values exist).
    - Decide whether D6 adds PRESCRIBING_INFORMATION / ACTIVE_INGREDIENT, or whether drug labels stay out of D6.
    - Owner: **D6** (A6).
28. **requestDigest scope.** Attempts ca-01 and ca-02 differ only by User-Agent and got the same 403. The identity rule (runId, toolId, requestDigest, attemptedAt) keeps them distinct through attemptedAt.
    - Decide whether requestDigest should also cover the headers that change server behaviour (User-Agent, Accept), so identical retries are recognisable.
    - Owner: **D11** / tooling (G10 recorder).
29. **Intent contract gaps met while writing fixture intents.** biotech-knowledge-intent.v1 has no way to:
    - write a claim occurrence (assertionKind CLAIM + OCCURRENCE_OF a Claim);
    - attach an identifier to a Source declared under `sources[]`;
    - set `SourceSnapshot.revisionKind` / `revisesSnapshotUid`.
    The fixtures pass them as literals or snapshot `properties` and say so in `notes`. The capture-failures intent is partial by design: CaptureAttempts are written by the capture layer, not by intents.
    - Owner: **kernel** + contracts (`packages/contracts`).
30. **Requested schemes used in fixtures.** `SPL_SET_ID` (sirolimus) and `FDA_GRN` (GSRS GRN 635; was `GRAS_NOTICE`, renamed in the check stage to the K v2 code) appear in fixture intents. The planner rejects `SPL_SET_ID` until `packets/K/identifier-schemes.yaml` adds it, and `FDA_GRN` until its `requested` row is promoted (item 6).
    - Owner: **kernel**.

## Check stage (A8, 2026-10-08)

31. **Cross-packet question references.** D11 cites three questions other packets declare: D3:CQ-ST-08 (gap G1, Q-D11-07), D6:CQ-ID-02 (gap G7) and D6:CQ-AX-06 (gap G8). They are now written `<packet>:<id>` (`blocksOtherPackets` in `tooling/action-space.yaml`) so the contract rule "every question id referenced anywhere exists in 02" holds for unqualified ids. Two notes-only mentions (catalog:CQ-AX-27 in `_notes/tool-log.md`, catalog:CQ-PV-01 in RUNLOG) are marked as competency-catalog references.
    - Decide whether the synthesizer accepts the `<packet>:<id>` form for cross-packet references.
    - catalog:CQ-PV-01 ("five provenance states for each assertion in an answer", Essential now) is declared by no packet's 02 on 2026-10-08. It belongs to K (provenance chain + PolicyVersion); D11's CQ-PV-03 covers only the capture part.
    - Owner: **synthesizer** (form); **kernel** (catalog:CQ-PV-01).
32. **D3 sponsor edge renamed.** D11's Q-D11-08 pattern and seam named `SPONSORED_BY`, which A4's D3 SDL does not declare. D3 has `HAS_STUDY_ROLE` (Study → StudyParty union, `roleKind` LEAD_SPONSOR / COLLABORATOR / FUNDER / MATERIAL_PROVIDER …). The pattern, the seam and the `funded_by` predicate-only entry were re-pointed. The fixture already used HAS_STUDY_ROLE.
    - Owner: **D11** (done) / D3 (keep the name stable).
33. **requestDigest values.** The fixture's CaptureAttempts lacked `requestDigest` (identity component, `String!`) or carried a placeholder sentence. The check stage computed `sha256("GET " + requestUri)` over the stored, credential-free URI for all nine attempts. ca-01 and ca-02 therefore share a digest (item 28 is still open). The executor's canonical form (method, URI, body, and perhaps headers) must be fixed before G10 is built.
    - Owner: **D11** / tooling (G10 recorder).
34. **Kernel identifier register v2.** A1's register now has five of D11's requested codes under kernel spellings (FDA_NDI, FDA_GRN, RW_RECORD, UDI_DI, NIH_PROJECT). D11 adopted those spellings in `identifier-bridges.yaml`, the GSRS fixture and its intent. SPL_SET_ID, EIN and ORG_STUDY_ID are still missing (item 6).
    - Owner: **kernel**.

## Adversarial review (A8, 2026-10-08)

35. **CQ-AX-04 state definitions: D11 adopted K's.** D11's model-stage pattern counted every current assertion from a tool as REPORTED (so the fixture's FIELD_NOT_REPORTED f01 came out REPORTED), checked an EMPTY_RESULT attempt for "not reported", and called "measured absent" a NEGATIVE assertion, contradicting K `09` item 12 (measured null = POSITIVE NO_* with DIRECT_MEASUREMENT; NEGATIVE is a denial) and K `03` CQ-AX-04 (not reported = FIELD_NOT_REPORTED). The fixture query differed from the pattern (state NEVER_QUERIED, EMPTY_RESULT first). Fixed on D11's side: one pattern, identical in `03` and the fixture, states MEASURED_ABSENT / REPORTED / NOT_REPORTED_BY_SOURCE / UNKNOWN_BLOCKED / UNKNOWN_NEVER_QUERIED (+ OUT_OF_SCOPE from config).
    - Request to K: K `03` CQ-AX-04 still reads "a D11 CaptureAttempt with … outcome EMPTY_RESULT" as "searched but nothing found"; that outcome no longer exists (CaptureOutcome = PARTIAL | FAILED). Replace it with the FIELD_NOT_REPORTED branch K already has, and read attempts only for "blocked".
    - Owner: **kernel** (A1).
36. **CaptureAttempt scope.** The review showed half the outcome vocabulary duplicated kernel records (EMPTY_RESULT = COMPLETE snapshot + FIELD_NOT_REPORTED; CAPTURED = the snapshot). Dropped; the node now holds only FAILED / PARTIAL. Decide whether a systematic-search coverage record ("these N tools were queried for X on date D, all answered") is needed at all; D11 has no question that reads it beyond what FIELD_NOT_REPORTED and snapshots give.
    - Owner: **owner** + **kernel**.
37. **Shared catalog question ids.** Six ids in D11 `02` are also declared by their owners: CQ-AX-04 and CQ-AX-07 (K), CQ-ID-04 (D1), CQ-PV-02, CQ-PV-04 and CQ-PV-05 (D9). D11 had re-scored them (value, polarity, audience, text). Now copied verbatim from the owners; D11's rows contribute patterns and fixtures only. Harm share at owner polarities: 15 / 30. Decide how the synthesizer merges a shared id (one row, owner's scoring, patterns from every packet) and whether non-owners should cite `<packet>:<id>` instead of repeating the row (the form used in item 31).
    - Owner: **synthesizer**.
38. **D3 REVISES and other recorded-only edges.** D11's model stage marked REPORTS_ON, REVISES, ADMINISTERS (D3) and HAS_ACTIVE_MOIETY (D1) as valid-time episodes and Q-D11-04 read `r.validFrom` on REVISES, which `RevisionEdgeProperties` does not have. D3's docstring is right for D11: the revision date is the notice's `publishedAt`, "since when do we know" is `recordedFrom`. Fixed in D11 (`03`, `09`, `10`); Q-D11-04 now also returns `r.revisionKind`. No request to D3 or D1: D11 needs no valid time on these edges.
    - Owner: **D11** (done); D3 / D1 informed.
39. **Boxed warnings and CAERS reports belong to D5.** D11's predicate-only `has_boxed_warning` duplicated D5 `USE_CONSTRAINED_IN` and `adverse_event_report_names_product` duplicated D5 `CAUSES_ADVERSE_EFFECT`. Both dropped; Q-D11-11 and Q-D11-18 and the sirolimus fixture now use D5's predicates.
    - Request to D5: add `BOXED_WARNING` to the `section` qualifier list of USE_CONSTRAINED_IN (now CONTRAINDICATIONS | WARNINGS | PRECAUTIONS | CAUTIONS | PROTOCOL_TEXT …), and confirm `sourceKind:SPONTANEOUS_REPORT` on CAUSES_ADVERSE_EFFECT is the shape for openFDA CAERS/FAERS rows (with the disclaimer as a CAUTIONS Assertion, D5 Q-D5-20).
    - Owner: **D5** (A5).
40. **Node labels.** D11 used `["CaptureAttempt", "Occurrence"]` after the kernel's `Activity`; the kernel directive for domain types is `["<Primary>", "Entity"]` and 56 of 59 domain types follow it. Changed to `["CaptureAttempt", "Entity"]`. Decide whether domain types may carry an archetype label (K Wave 0 kept archetypes as stored labels: Entity, InformationArtifact, Occurrence, EvidenceAssessment, VersionedState) instead of, or in addition to, `Entity`.
    - Owner: **kernel**.
41. **D5 `targets` consumer list.** D5 `10-seams.yaml` lists D11 among the consumers of `vocab-targets.yaml`; D11 has no target question and does not consume it (directive 3.1). Request: D5 removes D11 from the list.
    - Owner: **D5**.
42. **Recalls and label lineage stay with D8 and D6.** `recall_names_product` (→ D8 `RegulatoryRecord {recordKind: RECALL}` CONCERNS Product | Lot) and `label_version_of` (→ D6 `HAS_LABEL_VERSION`) were dropped. D11 now depends on these names staying stable (`10-seams.yaml`).
    - Owner: **D8** / **D6** (no change requested).
43. **Predicate casing.** D11's predicate-only values were lowercase (`funded_by`, `record_last_updated`, …) while the kernel conventions and D5/D7 use SCREAMING_SNAKE. Renamed in `05`, `03` and the fixtures (PROSPECTIVE_REGISTRATION_FLAG, DISCLOSES_SUPPORT_FROM, DECLARES_NO_COMPETING_INTEREST, FUNDED_BY, RECORD_LAST_UPDATED). Request: make the casing rule explicit in the kernel pattern so the synthesizer can lint it.
    - Owner: **kernel** / **synthesizer**.
44. **Person names in capture requests.** NPPES name searches (Q-D11-16) put a person's name into `queryText` and `requestUri`. D11 now stores only `sha256:<hex>` of the name and sets `privacyClass` INTERNAL, the strictest kernel value (PrivacyClass = PUBLIC | INTERNAL). Decide whether the kernel needs a stricter class (e.g. RESTRICTED) for operational records that touch personal data.
    - Owner: **kernel**.

## Cross-packet pass (A8, 2026-10-08)

The merged registry `tooling/action-space.yaml` (167 entries, 402 aliases, 25 ranked gaps) and `tooling/readiness-scorecard.md` are generated by `_notes/action-space/build-action-space.mjs` from all fourteen packets; every judgment is a line in `_notes/action-space/merge-spec.yaml`.

45. **Rewriting `populatedBy` and `captureMethod` to registry ids.** All 343 sibling `08` rows and D11's 59 entries resolve to a canonical id (top-level `aliases`, key `<packet>:<id as written in 08>`); every `populatedBy` id of every `05` resolves (0 unresolved). Fixture `captureMethod` values are still free text in every packet (e.g. "curl (NCBI E-utilities efetch db=pubmed)", "Firecrawl CLI 1.23.1 scrape …", "curl/8 gsrs-api-v1", "ncbi-eutils-pubmed/curl-8"), and the kernel's own example is `firecrawl-scrape/2` where the registry id is `firecrawl-cli`.
    - Request: the synthesizer rewrites `populatedBy` through `aliases`, and the kernel fixes `SourceSnapshot.captureMethod` = `<registry id>/<tool version>` (D11 `CaptureAttempt.toolId` = registry id), with the free-text route kept in a note.
    - Evidence that would decide it: a lint over the assembled fixtures that every `captureMethod` prefix is a registry id.
    - Owner: **synthesizer** + **kernel**.
46. **Identifier schemes missing from the K register v2 (requests to K).** Reconciled in the generated block at the end of `identifier-bridges.yaml` (114 codes: K v2's 103, every node register's `identifierSchemes`, D11's bridge rows).
    - Firm, from D11 (carried from item 34): `SPL_SET_ID` (Q-D11-11, CQ-PV-05, fixture `sirolimus-spl-boxed-warning`; route `dailymed-spl` 3, `openfda-drug-label` 2), `EIN` (Q-D11-15; route `sec-edgar` submissions), `ORG_STUDY_ID` with issuer = sponsor (bridge B04; route `ctgov-v2-api`).
    - Firm, from D12's node register (listed there as "(requested)" but absent from K v2): `FNDDS_FOOD_CODE`, `NDB_NUMBER`, `FOODON`, `PHENOL_EXPLORER_FOOD` (D12.FoodItem); `FOODEX2`, `LANGUAL`, `WWEIA_CATEGORY` (D12.FoodCategory). Routes: `usda-fdc` (FNDDS, NDB; readiness 0 without a key, `usda-fdc-portal` 2), `foodon` and `efsa-food-composition` (unscored), `nih-dsld` (LanguaL codes, 2), none for Phenol-Explorer food ids or WWEIA.
    - Optional: `NCIT` (observed on GSRS 8XM2XT8VWI; D1/D2 may want it).
    - Owner: **kernel** (A1).
47. **Pattern differences between D11 bridge rows and K.** `MESH`: D11 `^[DCQ][0-9]{6,9}$` accepts qualifier UIs (Q…), K `^[DC][0-9]{6,9}$` does not. `SEC_CIK`: D11 validates the raw value (`^[0-9]{1,10}$`), K the left-padded one (`^[0-9]{10}$`). Request: K states whether `pattern` validates the raw or the normalized value, and whether MeSH qualifiers are identifiers.
    - Owner: **kernel**.
48. **Schemes a node register lists with no exercised authority route.** `ISBN`, `LNHPD_INGREDIENT`, `OMIM`, `ORPHANET`, `PHENOL_EXPLORER_FOOD`, `PODCAST_INDEX_FEED`, `PTAB_TRIAL`, `SNOMEDCT`, `SPOTIFY`, `SUPPLIER_CODE`, `WEB_DOMAIN`, `WIKIPATHWAYS`, `WWEIA_CATEGORY`, `X_ACCOUNT`, `X_POST`, `YOUTUBE_CHANNEL`: no packet's `08` row emits them (YouTube oEmbed returns the channel handle, a name, not the `UC…` id; `WEB_DOMAIN` is derived from any captured URL, so it needs a normalizer, not a source). The owning domains should either name a route and exercise it, or drop the scheme from `identifierSchemes` until one exists.
    - Owner: **D2** (OMIM, ORPHANET, SNOMEDCT, WIKIPATHWAYS), **D9** (ISBN, PODCAST_INDEX_FEED, SPOTIFY, X_ACCOUNT, X_POST, YOUTUBE_CHANNEL), **D1** (LNHPD_INGREDIENT, SUPPLIER_CODE), **D12** (PHENOL_EXPLORER_FOOD, WWEIA_CATEGORY), **D8** (PTAB_TRIAL), **D6/D7** (WEB_DOMAIN).
49. **`access: internal` extends the PLAN 6.3 enum.** PLAN 6.3 lists api | mcp | bulk | scrape | manual; K and D10 added `internal` for BellLabs-built writers, jobs and local parsers, and the registry keeps it (23 internal entries, scored on K's 0 not built … 3 in use scale). Request: accept the extension, or move internal tooling to a separate registry.
    - Owner: **owner** / **synthesizer**.
50. **Packets use different priority scales.** D11 uses P0–P3 (P0 = blocks a value-1 question now); most packets use P1–P3 keyed to question value; D8 writes high/medium; D1 writes "P2 (investor lens)". The merged registry recomputes `priority` from the questions that need each entry and its readiness (never less urgent than D11's own score) and keeps every packet's raw cell in `seenAs`. Request: adopt the registry rule program-wide.
    - Owner: **synthesizer**.
51. **Readiness adjudications to confirm.** Where packets disagree the registry keeps D11's score for D11-local entries and the lower median elsewhere, except six D11 overrides with reasons in `merge-spec.yaml`: `sec-edgar` 3 → 2 (EDGAR HTML raw digests do not reproduce; D7, D8, D13), `nih-ods-api` 1 → 2 (fact sheets fetchable with a browser User-Agent; D1, D5), `certification-databases` 0 → 1 (NSF and Informed Sport captured; D6, D8), `open-targets` 3 → 2 (schema drift; D2), `internet-archive-wayback` 2 (CDX outages, capture substitution), `firecrawl-cli` 2 (renditions not byte-stable). `usda-fdc` stays 0 (D12 scored 2 with a key that a team run does not have; gap G6). Section 8 of the scorecard lists every entry whose packet scores spread by 2 or more.
    - Owner: **owner**.
52. **Build order for the custom tooling.** Ranked by blocked questions (3 per value-1, 2 per value-2, 1 per value-3 question, scoped to the packets that asked for each gap): G4 capture normalizer and text-projection registry (217 questions, 82 value-1), G13 intent contract v1 extensions (136, 64), G11 selector builder and verifier (134, 55), G6 keys, quotas and service identity (116, 44), G12 byte-faithful capture and durable artifact storage (105, 36). "Blocked" here means "needs an entry the gap serves", not proof that the gap alone blocks the answer.
    - Evidence that would decide it: the synthesizer's cross-domain fixtures replayed through the executor, counting which failures each gap would have removed.
    - Owner: **owner**.

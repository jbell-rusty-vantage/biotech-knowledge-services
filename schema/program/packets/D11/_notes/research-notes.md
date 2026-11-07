# D11 — research notes for the model stage (A8, 2026-10-08)

Read with: `01-ecosystem.md`, `02-questions.md`, `tooling/action-space.yaml` (58 entries, 44 exercised), `identifier-bridges.yaml` (33 schemes, 22 bridges), `_notes/fixture-candidates.md` (FC-1…FC-9), `_notes/tool-log.md`.

## 1. Position: D11 is mostly configuration and kernel vocabulary, not graph types

The directive's default answer to "should this be a node type" is no. Walking every D11 question:

| question | traverses the graph through … | needs a D11 node? |
| --- | --- | --- |
| Q-D11-01, Q-D11-20 (which tools/sources can answer, which locator kinds) | nothing: answered from `tooling/action-space.yaml` (a versioned config artifact, like the Mission Control asset catalog) | **no** |
| Q-D11-17, CQ-AX-04 (what failed in mission M, why is the answer empty) | kernel `Activity` (capture runs) with outcome properties | no — needs Activity properties (below) |
| CQ-PV-03 (which tool made these bytes) | `SourceSnapshot` → `WAS_GENERATED_BY` → `Activity` → `Agent` (tool id + version) | no — needs the tool id from the registry as a property value |
| CQ-ID-04, Q-D11-09, CQ-AX-14, Q-D11-10, Q-D11-15 | `Identifier`, `HAS_IDENTIFIER`, `ResolutionHypothesis` (kernel) + D1 substance forms | no — needs the scheme enum and normalization rules |
| Q-D11-04, Q-D11-05, Q-D11-19 | `Source` → `SourceRevisionEvent` (kernel, pinned W00; revisionKind covers retraction/correction/EoC/reinstatement) → notice snapshot | no — reuse kernel |
| Q-D11-02, Q-D11-03, Q-D11-06, Q-D11-07, Q-D11-08 | D3 study/registration types + kernel assertions with locators | no (D3/D7 own the types) |
| Q-D11-11, Q-D11-12, Q-D11-14, Q-D11-18 | D5/D6/D8 label, regulatory status, adverse-event knowledge + kernel snapshots | no (other owners) |
| Q-D11-22 (identifier coverage) | materialized projection over Identifier assertions | no — a derived report with method version |

Recommendation for the model stage: **D11 SDL = 0 node types, 0 relationship types**, plus enum proposals handed to the kernel (A1) through `10-seams.yaml` `sharedVocabularies` and `11-open-questions.md`. If packet-check or the synthesizer requires at least one type, the only defensible candidate is a read-only `ToolCapability`/`SourceAccessProfile` vocabulary node (id = action-space entry id, readiness, access, auth) so that `Activity.usedTool` can be a traversable link for Q-D11-17; argue it with Q-D11-17 and CQ-PV-03, otherwise defer it (deferred list).

Deferred (consider and cut, one line each, for `06-node-register.yaml`):
- `ToolCapability` / `SourceAccessProfile` — registry lives in YAML; a property `toolId` on Activity covers CQ-PV-03 and Q-D11-17 without a node.
- `IdentifierScheme` node — an enum suffices; scheme metadata (authority, pattern, rule) lives in `identifier-bridges.yaml`.
- `CaptureAttempt` / `CaptureFailure` node — a failed capture is an Activity of kind capture with `outcome` = FAILED and `failureKind`; no snapshot generated.
- `IdentifierBridge` / identifier-to-identifier edge — forbidden by the kernel rule (bridges are HAS_IDENTIFIER assertions or ResolutionHypotheses).
- `TextMinedAnnotation` node — annotations are derived MENTIONS (method-versioned), never stored as nodes.
- `RegistryVersion` node — a registry version is a SourceSnapshot of the registry-record Source; diffs are derived at query time.

## 2. Proposals for kernel vocabulary (owner A1; D11 supplies evidence)

### 2.1 Identifier.scheme as an enum (≈ 32 values)
PMID, PMCID, DOI, RETRACTION_WATCH_ID, NCT, EU_CT, EUDRACT, ISRCTN, ORG_STUDY_ID, UNII, CAS_RN, INCHIKEY, PUBCHEM_CID, CHEBI, RXCUI, GRAS_NOTICE, NDI_NOTIFICATION, SPL_SET_ID, NDC, DSLD_LABEL_ID, GTIN, UDI_DI, FDC_ID, LOINC, ICD10CM, MESH_UI, CIK, LEI, NPI, EIN, ORCID, NIH_GRANT, OTHER (+ `schemeNote`). Evidence and normalization rules per scheme in `identifier-bridges.yaml`. UCUM is a unit vocabulary, not an Identifier scheme. Ticker is time-varying: a dated assertion or property, not an Identifier.

### 2.2 Identifier.normalizationRule values
`doi-lowercase-v1`, `pmid-digits-v1`, `pmcid-upper-v1`, `nct-upper-v1`, `unii-upper-v1`, `casrn-v1` (check digit), `inchikey-upper-v1`, `gtin14-v1` (pad + GS1 mod-10; verified on two real UPCs), `lei-upper-v1` (mod 97), `npi-v1` (Luhn), `cik10-v1`, `loinc-v1`. Executor applies before the (scheme, issuer, value) uniqueness check.

### 2.3 Identifier registration status
Observed: LEI 529900OPI7B8JPXCVS70 is LAPSED with a stale legal name; ICD-10 codes are fiscal-year scoped; SPL versions supersede. Use `Identifier.validFrom/validTo` + a small `registrationStatus` enum (ACTIVE, LAPSED, RETIRED, MERGED, UNKNOWN) on the Identifier; assignment status stays on `HAS_IDENTIFIER`.

### 2.4 SelectorKind / locator details
Observed locator anchors that are stable: JATS `sec@id`/`p@id`; SPL `section@ID` + LOINC section code; JSON pointers into registry, GSRS, DSLD, openFDA records; HTML element ids (ICTRP `span#DataList3_ctl01_Label1`); PDF page markers. Two options (open question for kernel):
- (a) keep `SECTION` and add one property `sectionScheme` (XML_ID, JSON_POINTER, HTML_ID, LOINC_SECTION, NAMED) — 1 property, 1 small enum; or
- (b) add `JSON_POINTER` and `XML_ID` to SelectorKind.
D11 prefers (a): it is smaller and keeps the verifier's selector set unchanged.
TEXT_QUOTE needs a declared normalization: U+2009, U+00A0, U+202F and hyphen variants occur inside quoted numbers ("500 mg") in JATS (FC-1; A3 saw the others). `normalizationVersion` must name a rule that folds them.

### 2.5 SourceSnapshot hash basis
Many captures are tool renditions, not issuer bytes: Firecrawl/Tavily markdown of PDFs and HTML (FC-2c, FC-7, FC-9). `ContentHashBasis` has RAW_BYTES, NORMALIZED_TEXT, STORED_EXCERPT_TEXT, SYNTHETIC_FIXTURE; add `TOOL_RENDITION` (hash of a third-party extraction) or require RAW_BYTES capture alongside. Lossy renditions observed: β dropped from "β-nicotinamide mononucleotide" (FC-7); image-only PDF returned no text (FDA-2022-S-0023-0068); duplicated lines in PDF extraction.

### 2.6 SourceKind coverage (pinned enum vs observed artifacts)
| observed artifact | pinned SourceKind | gap |
| --- | --- | --- |
| PubMed XML, Crossref/OpenAlex records | BIBLIOGRAPHIC_RECORD | — |
| JATS full text | PEER_REVIEWED_PUBLICATION / PREPRINT | — |
| retraction / correction notice | RETRACTION_NOTICE / CORRECTION_NOTICE | — |
| CT.gov, ICTRP, CTIS, ISRCTN records | TRIAL_REGISTRY_RECORD | ICTRP is a mirror: needs RENDITION_OF / aggregator flag (CQ-PV-05) |
| GSRS, PubChem, ChEBI, RxNorm, LOINC records | TERMINOLOGY_RECORD | acceptable; maybe SUBSTANCE_REGISTRY_RECORD for GSRS |
| SPL (DailyMed), openFDA label | REGULATORY_RECORD | label-specific kind would let Q-D11-11 filter; D5/D8 decide |
| DSLD label record | (none fits; THIRD_PARTY_DIRECTORY is closest) | add LABEL_DATABASE_RECORD (or D6 decides) |
| CAERS report, recall record | REGULATORY_RECORD | acceptable |
| NDI letter, warning letter | REGULATORY_RECORD | — |
| EDGAR filing | SECURITIES_FILING | — |
| GLEIF / NPPES record | LEGAL_RECORD / THIRD_PARTY_DIRECTORY | acceptable |
| brand product page | MARKETING_PAGE / MANUFACTURER_LABEL_PAGE | — |
| Europe PMC annotation set | none | do not make it a Source; annotations are derived MENTIONS |
Slimming note: the pinned SourceKind has 44 values (incl. REINSTATEMENT_NOTICE, LABORATORY_REPORT, DATA_REPOSITORY_RECORD, STOREFRONT_STRUCTURED_DATA candidates); D11 suggests no net growth (any addition balanced by merges such as PODCAST_TRANSCRIPT_PAGE/AUDIO_FEED_ITEM/PODCAST_DIRECTORY_RECORD/PODCAST_FEED, which D9 should judge). The NDI letter that "sets aside" earlier letters (FC-7) could be modeled as SourceRevisionEvent(s) of kind WITHDRAWAL on the 2022 letters announced in the 2025 letter, or as a D8 regulatory-status change; D8 decides.

### 2.7 Activity properties for capture runs (lineage spine, 00-DIRECTIVE §4)
`activityKind` gains or already has `capture`; add `toolId` (action-space entry id), `toolVersion`, `outcome` (SUCCEEDED, FAILED, PARTIAL), `failureKind` enum (HTTP_401, HTTP_403, HTTP_429, TIMEOUT, BOT_CHALLENGE, PARSE_LOSS, LICENSE_BLOCKED, NOT_FOUND), `requestUri`. These answer Q-D11-17 and CQ-AX-04 with zero new relationships (Activity already links to the mission run).

## 3. Assertion.predicate values (stay predicates; no typed relationships from D11)

| predicate | subject → object | evidence seen | would be promoted by |
| --- | --- | --- | --- |
| `reports_registration` | publication Source/Publication → Identifier (NCT/EU CT) | JATS ext-link pmc:clinical-trial (FC-1) | D3 if Q-D11-02 needs traversal publication→study (likely D3 owns a typed edge) |
| `discloses_support_from` / `declares_no_competing_interest` | publication → Organization | JATS ack vs notes (FC-1 quotes 5–6) | D7 financial-interest seam (Q-D11-08) |
| `prospective_registration_flag` | registry record → boolean value | ICTRP span (FC-8) | D3 property on registration, not an edge |
| `has_active_moiety`, `salt_of` | substance form → substance | GSRS relationships (FC-4) | D1 owns forms; likely a D1 structural edge |
| `label_version_of` / `same_product_as` | DSLD label → DSLD label | labelRelationships (FC-5) | D6 product/label versioning |
| `superseded_by` (regulatory document) | NDI letter → letter | FC-7 quote 3 | D8 regulatory status |
| `retracted_by`, `corrected_by` | — | Crossref updated-by, PubMed CommentsCorrections | already modeled as kernel `SourceRevisionEvent`; do not add predicates |

## 4. Properties / enums the domains will need from D11 evidence

- Quantity basis: `Assertion.quantityBasis` (pinned) must distinguish SALT / FREE_FORM_OR_MOIETY / BRANDED_INGREDIENT / UNSPECIFIED — DSLD gives the form (NR chloride, UNII 8XM2XT8VWI) but not the basis of "300 mg" (FC-5 quote 6); the trial administered the chloride (FC-1 quote 1). Seam D1/D6.
- Time on documents: label `effectiveTime` (valid) vs DailyMed publication date (observed) vs our retrievedAt (FC-3); NDI letter signature date vs regulations.gov postedDate (FC-7); registry studyFirstSubmitDate vs start date (FC-8). All map onto existing SourceSnapshot clocks (`publishedAt`, `observedAt`, `retrievedAt`) plus assertion valid time — no new properties.
- Integrity status for answers: derived flag "rests on a revised source" computed from SourceRevisionEvent (Q-D11-05), never stored on the assertion.

## 5. Seams and contested ownership

| concept | owner (suggested) | D11 role |
| --- | --- | --- |
| Identifier, HAS_IDENTIFIER, ResolutionHypothesis, SourceRevisionEvent, SelectorKind, ContentHashBasis, Activity | K (A1) | supplies scheme enum, normalization rules, selector evidence, capture-failure enum |
| Publication (work) vs Source (rendition), PubMed/Crossref records as Sources | D9 / K | bridges B01–B06 |
| Trial registration, registry versions, prospective-registration flag | D3 (A4) | blocked history (G1); FC-8 |
| Substance forms, salt/moiety | D1 (A2) | GSRS bridge B07–B08; FC-4 |
| Label versions, GTIN, DSLD | D6 (A6) | GTIN normalizer, B13–B14; FC-5 |
| Regulatory status, NDI letters, SPL | D8 (A7) / D5 (A5) | FC-3, FC-7 |
| Organization identifiers (CIK, LEI), financial interest | D7 (A6) | B18–B19, B22 |
| Adverse-event reports | D5 (A5) | FC-6 (Source + assertions, not a node) |
| Brand claims and their testing | D10 (A1) | FC-9 → evidence mission |

`10-seams.yaml` for D11 will be mostly `sharedVocabularies` (identifier schemes, selector section schemes, failure kinds, tool ids) rather than edges.

## 6. Open questions (for `11-open-questions.md`)

1. Does the kernel adopt SECTION + `sectionScheme` (D11 preference) or new SelectorKind values for JSON pointers and XML ids? Evidence: FC-3, FC-4, FC-8 locators; verifier support in `verification.v1`. Owner: kernel.
2. Is a tool-rendition hash (Firecrawl/Tavily markdown) acceptable as the SourceSnapshot of an ACCEPTED assertion, or must RAW_BYTES be captured too? Evidence: FC-2c, FC-7, FC-9 and the β loss. Owner: kernel + owner.
3. Where does the action-space registry live long-term: repo YAML, Mission Control asset catalog, or graph? D11 says catalog/YAML; graph only if a question traverses tool → source. Owner: owner.
4. Registry history: accept "history from our first observation" (self-observed snapshots) as the product position, or seek NLM access / browser-fallback exceptions? Evidence: 403 across all tools (S22, S23, D3 log). Owner: owner + D3.
5. Keys and quotas: who holds data.gov, OpenAlex, NCBI and Semantic Scholar keys for team runs (FDC 429, OpenAlex USD budget)? Owner: owner.
6. Should name-only identity attempts (NPI homonyms, CIK↔LEI) be stored as ResolutionHypothesis nodes at all, or only when a question needs them? Evidence: B18, B20. Owner: kernel/D7.
7. Text-mined annotations (Europe PMC) as a MENTIONS source: allowed with method version, or excluded because of observed mislinks? Evidence: S9. Owner: kernel (3.8 pattern).
8. Pinned SourceKind has 44 values; can D9 and D11 jointly propose a slimmer list with DSLD/label-database coverage? Owner: D9 + kernel.

## 7. What the next stage most needs to know (short)

- No D11 node types are justified by questions; deliver enums/vocab proposals and the registry. Make the case in `09-reasoning.md` with the table in §1.
- Fixtures: FC-1 (unstructured-to-entity), FC-2 (disconfirmation), FC-3 (harm) are capture-complete with raw bytes and hashes; FC-7 and FC-9 are tool renditions (flag in source.md).
- The fixture `producedBy` should name a capture Activity per tool (toolId from the action space) so CQ-PV-03 is demonstrable.
- Do not copy the CT.gov history into any fixture: it was never captured.
- `packet-check` fails "SDL does not parse: Unexpected <EOF>" on a comment-only `04-schema-proposal.graphql`: a 0-type module still needs at least one definition (e.g. the proposed enums such as `IdentifierScheme`, `SectionScheme`, `CaptureFailureKind`, marked as kernel proposals) for the SDL to parse.

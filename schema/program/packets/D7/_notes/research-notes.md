# D7 research notes for the model stage (A6, 2026-10-08)

What the research stage learned that the modeling stage needs. Question ids refer to `../02-questions.md`; S-keys to `../01-ecosystem.md`; FC-keys to `fixture-candidates.md`. The kernel pattern (A1, `packets/K` in worktree A1) was not yet published when this was written: subject/object, identifiers, mentions and states are written below against the placeholder `Subjectable` and "kernel identifier pattern".

## 1. Before numbers for the Organization hub split (measured on the pinned IR)

Computed from `workspace/schema-ir.json` (pinned digest sha256:8313a6f8…); script output in scratch `ft/D7/before_pairs.txt`.

| measure (pinned) | value |
| --- | ---: |
| Organization declared relationship fields | 59 |
| from→to pairs reachable through Organization's own fields | 61 |
| pairs with Organization as an endpoint (all relationship types) | 104 |
| of which not from any-entity relationship types (HAS_SUBJECT/OBJECT, ABOUT, MENTIONS_ENTITY, DEPICTS, …) | 81 across 60 relationship types |
| Person declared fields / pairs via own fields / pairs as endpoint (non-any-entity) | 22 / 31 / 52 across 28 types |
| LegalEntity, ConsumerBrand, Facility declared fields | 6, 3, 7 |
| pairs touching any W01 type | 305 (151 from any-entity types, 154 other) across 88 relationship types |
| generated lines attributed to Organization / Person (size-report) | 24,912 / 9,925 |

Organization's 59 fields by the domain that asks the question (the role-split map):

| family | fields | count | where the edge should live |
| --- | --- | ---: | --- |
| kernel (state, identifiers) | states, identifiers | 2 | K pattern |
| corporate structure | subsidiaries, parentOrganizations (PARENT_OF ×2), ownsBrands, operatesFacilities | 4 | D7 (Facility → D8, see §3) |
| people and financial interest | advisesOrganizations, advisors, foundedOrganizations, founders, investedIn, investors, holdsEquityIn, equityHolders, hasIpInterestIn, ipInterestHolders, receivesCompensationFrom, compensationRecipients, affiliatedWith, affiliates, boardMembers, employees | 16 | D7 |
| commerce | marketsProducts, distributesProducts, hostsListings, listsOffers, sellerOfRecordFor, fulfillsOffers, affiliateForOffers, sellsProducts, sellsProductVariants, endorsesProducts | 10 | D6 (declared on Offer/Product/Listing, pointing at Organization) |
| manufacturing, quality, IP, regulatory | manufacturesProducts, contractManufacturesFor, contractManufacturers, performsProcesses, capabilityStates, usesEquipment, ownsTrademarks, assignedPatentFamilies, assignedPatentApplications, assignedGrantedPatents, licensesPatents, grantsPatentLicenses, submittedRegulatorySubmissions | 13 | D8 |
| ingredients | suppliesIngredientMaterials | 1 | D1 or D8 (supplier) |
| evidence | sponsorsStudies, servesAsCroFor | 2 | D3 (declared on Study) |
| interventions / clinics | developsTreatments, offersTreatments, offersProcedures | 3 | D5 |
| devices / platforms | developsPlatforms, usesPlatforms | 2 | D4 |
| media | sponsorsContent, operatesChannels | 2 | D9 |
| events | hostsEvents, hostsConferences, exhibitsAt, involvedInEvents | 4 | D13 |

The split mechanism that keeps Organization under 12 fields: the other module declares the field on **its own** type pointing at Organization (`Study.sponsor`, `Offer.sellerOfRecord`, `CertificateOfAnalysis.issuer` …) and Organization declares **no inverse field**. `@neo4j/graphql` does not require both directions. A reverse "what roles does org X play" question (Q-D7-25 in spirit, CQ-EC-01) is answered by a Cypher pattern or one read-only `@cypher` field, not by 40 inverse relationship fields. The pinned schema doubled many types with IN fields (advisors/advisesOrganizations etc.); 15 of Organization's 59 fields are IN-direction views (parentOrganizations, contractManufacturers, boardMembers, employees, advisors, founders, investors, equityHolders, ipInterestHolders, compensationRecipients, affiliates, involvedInEvents, submittedRegulatorySubmissions, sponsorsStudies, servesAsCroFor); dropping them removes fields and their generated input families without losing a pair.

## 2. Candidate relationship design inside D7

Evidence from the artifacts (01-ecosystem §2) shows that every source states a tie as (holder, counterparty, kind code, interval with mixed precision, sometimes a stake), and that the kinds are open-ended across sources (Sinclair's F/I/E/A/B/IP/L codes; ICMJE's 13 items; FTC's material-connection kinds; SEC's director/officer/10 % owner/promoter; PSC's nature-of-control bands; NIH FCOI reasons). The pinned schema spent eight relationship types on this family (BOARD_MEMBER_OF, EMPLOYED_BY, ADVISES_ORGANIZATION, FOUNDED_ORGANIZATION, INVESTED_IN, HOLDS_EQUITY_IN, HAS_IP_INTEREST_IN, RECEIVES_COMPENSATION_FROM) plus AFFILIATED_WITH, with a RoleHolderTarget union.

Two shapes to measure:

- **Shape A, one typed edge.** `HAS_INTEREST_IN` (Person | Organization → Organization), asserted, with `interestKind` enum and the union of role/stake/value properties. 2 pairs. Simplest for agents ("show every tie"), CQ-CL-05 and CQ-EC-03 traverse one type. Cost: a wide edge-property type with many nulls.
- **Shape B, three typed edges by what the edge must carry.** `HOLDS_ROLE` (governance and work: director, officer, chair, employee, advisor, founder; props: title verbatim, roleKind, nominatedBy?), `HOLDS_STAKE` (equity, investor, options, GP/managing member; props: stakePercent as stated, stakeBand, deemed flag, voting/dispositive power, as-of basis), `RECEIVES_VALUE_FROM` (compensation, honoraria, sponsorship, free product, royalties, lab funding, affiliate commission; props: compensationKind, amount when stated, currency). 6 pairs. Each family's properties are filterable without nulls; Q-D7-01 filters on stake, Q-D7-02 on role, Q-D7-06 on value.

Either way: the old type names survive as `interestKind` values and as `Assertion.predicate` values (no information lost, forbidden implications such as INVESTED_IN ⇏ HOLDS_EQUITY_IN still expressible as distinct enum values). Recommendation from research: Shape B is the better fit to the sources (ownership tables, role lists and payment records are different artifacts with different properties), Shape A if the budget is tight. Whichever is chosen, register the rest under `predicateOnly`.

Other D7 relationships with question support:

| relationship | endpoints | questions | temporal | evidence |
| --- | --- | --- | --- | --- |
| PARENT_OF (control / consolidation) | Organization → Organization | Q-D7-01, Q-D7-09, Q-D7-14, Q-D7-19 | episode (GLEIF RELATIONSHIP_PERIOD start 2020-12-18 [S29]; 10-K subsidiaries list [S11]) | FC10, FC9 |
| OWNS_BRAND | Organization → Brand | CQ-EC-02, Q-D7-19, Q-D7-10 | episode (Tru Niagen brand: Healthspan Research LLC acquired 2017-03-12, dissolved 2021-01-15 [S11]) | FC9 |
| group membership ("entities affiliated with", "an EdenRoc Sciences company", "a Life Biosciences Company") | Organization → Organization | Q-D7-14, CQ-EC-03 | recorded-only unless dated | FC6, FC1 |

Group membership could be PARENT_OF with a `controlKind` enum (CONSOLIDATED, SOLE_SHAREHOLDER, GENERAL_PARTNER, BRAND_FAMILY, AFFILIATED_GROUP) instead of a separate type; the sources rarely say which kind ("an EdenRoc Sciences company" [S1] gives no ownership detail), so a kind value UNSPECIFIED_GROUP is needed.

Edges that need a **bitemporal episode** (valid time): the interest/role/stake/value family (CQ-AX-18, Q-D7-17 need overlap against a statement date), PARENT_OF, OWNS_BRAND. Everything else recorded-only. Valid-time precision observed: YEAR (self-disclosure pages [S1], ORCID [S25]), MONTH ("director since March 2017", "departed … in June 2025" [S6, S7]), DAY (Form 4, ORCID [S26], GLEIF). Basis values observed: STATED_RANGE, AS_OF_TABLE_DATE (proxy ownership "as of April 27, 2026"), FILING_DATE (Form D: role known to hold on the signature date, start unknown), PRESENT_TENSE_AT_PUBLICATION (Attia "I am a paid advisor" on 2021-06-20 [S3]). Open end ("present") means unknown end, not now.

## 3. Candidate node types (directive default: no)

| candidate | keep? | questions that filter/join/traverse through it | notes |
| --- | --- | --- | --- |
| Organization | yes | nearly all | Merge `LegalEntity` into it: same uid token `hu:org:` already; add `entityKind` enum (LEGAL_ENTITY, CORPORATE_GROUP, FUND_VEHICLE, DIVISION, PROGRAM, UNSPECIFIED), `legalForm`, `jurisdiction`, `status` (ACTIVE, DISSOLVED, MERGED, UNKNOWN). Q-D7-19 and CQ-EC-02 filter on entityKind; nothing traverses LegalEntity as a separate type. Trim `OrganizationType` (37 values) to the kinds a question filters on; it is never a role (pinned INV-009 holds). |
| Person | yes | CQ-CL-05, CQ-EC-03, Q-D7-02/03/06/08/11/17/25 | Public actors only. Identifiers via kernel: ORCID, SEC CIK (Form 4 reporting owners have one [S12]), NPI, NIH RePORTER profile id, Wikidata. |
| Brand (pinned ConsumerBrand) | yes, probably | CQ-EC-02, Q-D7-10, Q-D7-19 | Brand ≠ legal entity is the central identity confusion: "FOUNTAIN LIFE NY" is an NPPES other name of a P.A. [S30]; Tru Niagen is a brand of a subsidiary of a renamed issuer [S11]; a podcast brand's operator appears only in a privacy-policy link [S40]. Ownership contested with D6 (products are presented under brands). Suggest D7 owns Brand (who is behind it), D6 links Product → Brand. Rename to `Brand` with `brandKind` (CONSUMER_PRODUCT, CLINIC, MEDIA, SERVICE) if D9 agrees media brands are not Channels. |
| Award (grant / contract / prize) | candidate, measure | Q-D7-05, Q-D7-15, CQ-EC-04 | NIH project numbers [S24], FundRef award ids in JATS [S21, S22] and ORCID fundings [S25] are cited across sources, so an award is a join point (funder → award → recipient org + PI → study/publication). ARPA-H contracts have no public per-team amount [S36]; Hevolution lists have no ids [S37]. If it is not a node, a funding tie is a `RECEIVES_VALUE_FROM` edge with `awardId` — but then papers cannot point at the same award. Ownership contested with D3 (study funding) — suggest D7 owns Award, D3 links Study → Award. |
| OrganizationSnapshot | merge or defer | Q-D7-09 | Identity history needs former names with intervals (EDGAR `formerNames` from/to [S10]). If K publishes a generic versioned-state attach, use it; else a name episode can be an `Identifier` of scheme NAME/FORMER_NAME with validity, or predicate-only `HAS_FORMER_NAME`. A full snapshot node (ticker, stage, size, sector) is not needed by any D7 question. |
| Facility | move to D8 or defer | none in D7 | Facility questions are inspections, registrations, manufacturing sites (D8) and clinic locations (D5/D6). D7 only needs "which entity operates it", which D8 can declare on Facility. |
| PseudonymousActor | contested | CQ-CL-07 | Handles live on platforms (D9 owns platforms and channels). Suggest D9 owns it; D7 provides Person; the link is a kernel ResolutionHypothesis. |
| AnonymousActor | kernel | none in D7 | It exists so ASSERTED_BY can name a class of asserter; that is the kernel's asserter pattern. |
| CohortParticipant | D3 or defer | none in D7 | A study participant token is study data. |
| FinancialInterest (intermediate node) | no | — | Edges plus their authorizing Assertion suffice: the conflict assessment points at the Assertion (pinned `ASSESSES_INTEREST` → Assertion), so the interest never needs to be a node. Revisit only if one disclosure must attach several kinds to one interval with one value (ProPublica FCOI record carries kind + value bucket + project [S2]). |
| FinancingRound | no (D13 Event) | Q-D7-04, Q-D7-13 | Default owner map: Event → D13. Form D gives amount, first-sale date, investor count, related persons [S8, S9]; the investors are not named in Form D. D7 contributes the holder ties; D13 owns the financing Event; participation of a named investor in a round is an event-role edge owned by D13. |
| ConflictRelevanceAssessment | contested | CQ-CL-05, Q-D7-06, Q-D7-20, Q-D7-24 | Pinned in W21 (media). It is an assessment (K/D10 archetype) whose enums are D7 vocabulary (RelevanceLevel, RelevanceBasis incl. SAME_SERVICE_CATEGORY, TemporalOverlap, DisclosureFinding). Suggest: D10 owns the node as an assessment kind; D7 owns the enums and the interest edges it assesses; D9 owns the occurrence it is for. |

Likely D7 module: Organization, Person, Brand, Award (+ possibly one state node) = 4–5 node types; 4–6 relationship types; ~10–16 pairs. Organization declares ≤ 8 fields (interests in/out, parent/children one direction, brands, awards).

## 4. Properties, enums and predicate-only values

- `interestKind` (or per-shape role/stake/value kinds), drawn from the sources: FOUNDER, CO_FOUNDER, DIRECTOR, BOARD_OBSERVER, CHAIR, LEAD_INDEPENDENT_DIRECTOR, OFFICER (title verbatim), EMPLOYEE, ADVISOR, SCIENTIFIC_ADVISOR, CONSULTANT, EDITOR, INVESTOR, EQUITY_HOLDER, STOCK_OPTIONS, GENERAL_PARTNER_OR_MANAGING_MEMBER, PROMOTER (Form D), INVENTOR_ON_LICENSED_IP, ROYALTY_OR_LICENSE, HONORARIA_OR_SPEAKING, EXPERT_TESTIMONY, TRAVEL_SUPPORT, SPONSORSHIP, AFFILIATE_COMMISSION, FREE_OR_DISCOUNTED_PRODUCT, RESEARCH_FUNDING (lab), GRANT, IN_KIND_MATERIAL, FAMILY_OR_PERSONAL_RELATIONSHIP (FTC 255.5 [S19]; record only when a source states it for a public actor), OTHER. Map ICMJE items 1–13 [S20] and Sinclair's F/I/E/A/B/IP/L [S1] onto it; keep `roleTitleVerbatim`.
- Stake: `stakePercent` (as stated, never computed), `stakeBand` (PSC bands 25–50, 50–75, ≥75 [S32, S33]; ">5 %" table threshold; Open Payments "terms_of_interest" text), `beneficialOwnershipBasis` (RECORD, DEEMED [S6, S7]), `votingPower` / `dispositivePower` (SOLE, SHARED), `asOf` date.
- Scope: `scopeLevel` (GROUP, ENTITY) — the pinned V-434 rule "do not push a group role to a member" needs it ("EdenRoc Sciences companies F,I,E,A,B, IP" [S1]; "Entities affiliated with Andreessen Horowitz" [S7]).
- Value: `valueBucket` (NIH FCOI buckets, e.g., "Value cannot be readily determined" [S2]); `amount` + `currency` only when stated.
- Modality on the authorizing Assertion, not the edge: regulator hedges ("It appears that …" [S17]) and self-declared incompleteness ("may not have yet been added" [S1]).
- Predicate-only (no typed edge; record the question that would promote them): SPEAKS_AT, ATTENDS, EXHIBITS_AT, HOSTS_EVENT (D13 if anyone), USES_EQUIPMENT, USES_PLATFORM, DEVELOPS_PLATFORM, DEVELOPS_TREATMENT, OFFERS_PROCEDURE, RECORDS, POSTS_RESULT, OPERATES_CHANNEL (D9 decides), ENDORSES_PRODUCT (derived from D9 occurrences), NOMINATED_DIRECTOR (qualifier on the role edge: "director nominated by Champion River" [S6]), AFFILIATED_WITH (folded into group membership or interestKind).

## 5. Seams and contested ownership

| seam | direction and owner | questions |
| --- | --- | --- |
| D9 ClaimOccurrence asserter = Person; recommendation → reachable interest | D9 declares occurrence → Person; D7 interest edges traversed | CQ-CL-05, Q-D7-06, Q-D7-24 |
| D9 content sponsorship (sponsor reads, sponsored posts) | D9 owns `SPONSORS` Organization → container; the money tie to a Person (paid endorser) is D7 `RECEIVES_VALUE_FROM` with kind SPONSORSHIP | Q-D7-07, CQ-CL-05 |
| D3 study sponsor / collaborator / funder / investigator / author affiliation | D3 declares Study → Organization/Person (and → Award) | Q-D7-05, CQ-EC-04 |
| D6 seller of record, marketer, affiliate; Product → Brand | D6 declares | Q-D7-19, CQ-EC-02 |
| D8 manufacturer, contract manufacturer, COA issuer, patent assignee/licensee, regulatory submitter, enforcement subject, Facility operator | D8 declares | CQ-MF-01, Q-D7-21, Q-D7-13 |
| D1 ingredient supplier | D1 or D8 declares | CQ-MF-01, Q-D7-21 |
| D13 financing / M&A / safety-halt events; Frontier participants | D13 declares Event → Organization/Person | Q-D7-04, Q-D7-13 |
| D5 clinic offers protocol/treatment | D5 declares | Q-D7-10 |
| D12 organization behind a prepared food / food brand | D12 or D6 declares | (Kosterina disclosure [S4]) |
| K identifiers (CIK, LEI, ROR, ORCID, NPI, Companies House number, UEI, Ringgold, FundRef), Assertion subject/object, ResolutionHypothesis (Form D name ↔ Person; handle ↔ Person), Agent ACTED_ON_BEHALF_OF Organization, coverage/capture completeness | K | all |

## 6. Retrieval patterns the model stage should write (for 03)

- CQ-CL-05 / Q-D7-06: from a D9 occurrence (asserter Person P, container date t, subject S) → P's interest edges with valid interval overlapping t (or UNKNOWN when bounds null) → counterparty O → bounded hops (≤ 2) via PARENT_OF/group membership → O's products/brands (D6 seam) or substances (D1 seam) matching S; return paths with assertion uids and locators; relevance and disclosure are read from the assessment when one exists, never inferred.
- Q-D7-01: variable-length PARENT_OF/HOLDS_STAKE upward from the issuer, max depth 6 (the Niagen chain has 3–4 levels [S6]), keep `beneficialOwnershipBasis` per hop.
- Q-D7-03: two-hop Person pattern between two organizations with interval overlap.
- Q-D7-08: group role assertions by (P, O) and compare kind and bounds across sources; the adjudication is a kernel Adjudication/assessment.
- GDS (materialized, method-versioned, regenerable): betweenness and Louvain/Leiden over a Person–Organization projection of interest edges (Q-D7-22, Q-D7-03 discovery); link prediction for undisclosed ties as mission leads only (Q-D7-23). Never written back as interest edges.
- Query-time external reads (not stored): Form 4 transactions (Q-D7-12), Open Payments rows (Q-D7-18).

## 7. Privacy boundary (the brief's open question)

Sources mix public-role facts with personal data on the same page: Companies House shows month/year of birth and country of residence next to officer roles [S32]; proxy footnotes name trusts and the sons of an officer [S6]; NPPES shows an authorized official's name and phone [S30]; Open Payments lists physicians' practice addresses [S34]. Proposed rule for the model stage: a Person node exists only for a public actor in the role that makes them public (director/officer of an in-scope company, author, investigator, speaker, registered endorser named by a regulator, clinician who publicly discusses a product); store name, public role ties and public identifiers; never store date of birth, residence, home address, phone/email, family members, or transaction-level personal payments. `privacyClass` must be set (null fails closed, per START_HERE). FTC-named endorsers and Form D related persons are public in a government record but are not otherwise public figures: include them only when a D7 question needs them (Q-D7-07; Q-D7-04/08), and prefer the organization as the assertion subject.

## 8. Readiness findings for D11 (details in `tool-log.md`)

1. Windows shells: Tavily CLI crashes on non-cp1252 characters unless `PYTHONIOENCODING=utf-8`; Python `json.load` on API responses needs `encoding='utf-8'` or `PYTHONUTF8=1`; `python -I` ignores both env vars (use `-X utf8`).
2. FTC blocks plain HTTP clients with a fake 404; Firecrawl fetches it.
3. eCFR `full` endpoint requires `Accept-Encoding` (HTTP 406 otherwise).
4. Companies House API needs a key (free); OpenCorporates needs a token; neither held.
5. Script-gated disclosure lists (Attia) are not capturable by Firecrawl or Tavily; browser fallback would be needed.
6. Scanned PDFs carry OCR errors into quotes (FTC individual letter); NBSP inside self-disclosure entries breaks exact-match locators without normalization.
7. Form D related persons have no identifier; ClinicalTrials.gov sponsors are name strings that keep pre-rename names; Open Payments excludes supplement makers and is too large to load as edges.
8. The repo `.mcp.json` edgartools server is not loaded in this session; plain EDGAR JSON/XML endpoints with the declared User-Agent were sufficient.

## 9. Open questions to carry into 11-open-questions.md

1. Shape A (one interest edge) vs Shape B (role / stake / value) — measure both in the executable; owner: D7 with the synthesizer's size check.
2. Is `Award` a D7 node, a D3 node, or an edge property? Evidence: whether D3's questions traverse award ids from papers (FundRef) to grant records.
3. Brand ownership: D7 vs D6. Evidence: which module's questions traverse Brand → legal entity (D7: accountability) vs Brand → Product (D6).
4. ConflictRelevanceAssessment owner (D10 vs D7 vs D9) once A1 publishes the assessment archetype map.
5. Group membership as PARENT_OF kind vs its own type; whether "an X company" phrasing without ownership detail may create a PARENT_OF at all (proposal: no — UNSPECIFIED_GROUP kind or predicate-only).
6. Role conflicts across sources (OQ-4.6): which source wins for kind and bounds — filing over self-disclosure for governance roles, self-disclosure over filing for advisory/IP — needs an adjudication rule; FC1 vs FC2 is the test pair.
7. Does a family or personal relationship (FTC 255.5) ever enter the shared graph? Proposal: only when a public source states it for public actors as a material connection; otherwise never.
8. Organization identity over renames: a state/episode node (K pattern) vs FORMER_NAME identifiers; and how CT.gov's "ChromaDex, Inc." strings resolve to the renamed issuer (resolution hypotheses at ingestion).

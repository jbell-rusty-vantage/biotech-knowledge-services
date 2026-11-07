# Run log — packet D9

## Claim

- agent: A8 (research stage, Wave 1; later stages model → fixtures → check are separate agents)
- domains: D9 — Sources, media and discourse (A8 also owns D11, separate packet)
- worktree: C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services-A8 (branch ft/schema-A8)
- base commit: e484fd2
- planned fixtures (candidates; confirmed by the fixtures stage, see `_notes/fixture-candidates.md`):
  1. Huberman Lab episode 52 (guest David Sinclair) publisher transcript — unstructured-to-entity path; practice report vs recommendation; in-container disclosure.
  2. David Sinclair self-disclosure affiliations page — financial interest with year bounds (D7 seam), conflict relevance.
  3. Lifespan podcast episode with a publisher correction of a spoken quantity (spermidine "1 gram" vs 1–2 mg) — disconfirmation / harm (dosing error) case.
  4. A podcast RSS feed (episode item fields, sponsor list in show notes) — container metadata and sponsorship.
  5. FTC endorsement-guide / warning-letter material on undisclosed paid health influencer promotion — harm case for recommendations.
  6. A community forum post reporting an adverse experience — community discourse, PERSONAL_EXPERIENCE basis.

## Entries

### 2026-10-08 — research stage start

- Read 00-DIRECTIVE (full), 01-PACKET-CONTRACT, 02-TEAM, brief D9, PLAN §1/§3/§6, workspace/START_HERE.md, fragments W18/W19/W20/W21/W22, schema-map pinned "Domain D9" overview (11130–11270) and the Claim / ClaimEvidenceAssessment / ClaimOccurrence / Episode / EpisodeSegment cards; enum cards SpeechAct, AssertionBasis, ClaimType, RetellingMode, RetellingLinkBasis; edge profile RetellingProperties; task `ingest-podcast-claims`.
- Read biotech-meta competency-questions §5 (CQ-CL-01..09, CQ-PV-01..06, CQ-EC-01..04), CQ-AX-05/07/14/18/26 pointers, CQ-CM-04, CQ-RC-05; OPEN-QUESTIONS items 6–7 (OQ-4.8 ClaimOccurrence label, independence sample); round-0006 record (case packet, decisions D4–D8).
- `node scripts/packet-skeleton.mjs D9` → 16 files created. `_notes/` created. Scratch: `%TEMP%\claude\…\scratchpad\ft\D9\`.
- Kernel status: no published K pattern yet in A1 worktree at 16:5x (K files are skeleton-only). Research proceeds against the coordinator's ownership defaults; Claim / ClaimOccurrence / Chunk / MediaAsset ownership to be re-checked against A1's map at the model stage.
- Tool status: `tvly --status` authenticated (v0.1.5); `firecrawl --status` authenticated (v1.23.1, 0/5 concurrency, credits 5,228).

### 2026-10-08 — research captures (A8)

- Captured 30+ artifacts into scratch `ft/D9/cap/` (digests in `ft/D9/capture-hashes.txt`): Huberman Lab ep 52 page (firecrawl), YouTube page (firecrawl), oEmbed, Spotify page, Huberman Lab and *Lifespan* RSS feeds (curl), iTunes Search/Lookup (curl), Sinclair affiliations page (firecrawl) + Wayback CDX and 2021-12-09 raw snapshot (curl), NMN.com retelling, Topol Substack post (Substack JSON API), Crossref record, Attia article, RAPA-EX-01 (PubMed MCP metadata + Europe PMC full-text XML), Blueprint protocol page, immortals.com, an X post, FTC press release + warning-letter PDF (firecrawl; curl blocked), 16 CFR 255.5 (eCFR API, needs `--compressed`), LongeCity thread, IAB podcast ad study PDF, ARDD 2026 home.
- Blocked / retired / keyed (readiness findings, details in `_notes/tool-log.md`): Reddit JSON 403 and firecrawl refuses reddit.com; Altmetric API key required since 2025-11-10; Crossref Event Data sunset 2026-04-23; no YouTube Data / Podcast Index / Spotify keys in `.env` (key names checked only, values never printed); Apple episode lookup capped at 200; Wayback availability API returned empty while CDX listed 40 versions.
- Problems: `tvly` crashes on Windows when printing non-cp1252 characters (fixed with `PYTHONUTF8=1` and `-o file`); Python `-I` ignores PYTHON* env vars (used `sys.stdout.reconfigure`); firecrawl output carries U+00A0 / U+2009 and OCR noise that breaks naive quote matching.

### 2026-10-08 — research deliverables (A8)

- Wrote `01-ecosystem.md` (actors by type, artifact interviews for 9 artifact types, capturability/readiness table, four lenses; sources S01–S32).
- Wrote `02-questions.md` (36 rows; 22 harm/disconfirmation; 13 CQ-* reused, 23 Q-D9-nn). `node scripts/packet-check.mjs D9` parses 36 questions (other failures are expected at this stage: SDL empty, fixtures not yet built).
- Wrote `_notes/fixture-candidates.md` (FC-1 … FC-9 with URL, title, date, tool, sha256, verbatim quotes with line and offset hints; FC-1 = unstructured-to-entity; FC-3/FC-5/FC-6 harm; FC-4 disconfirmation; FC-1+FC-2 = recommendation with reachable financial interest).
- Wrote `_notes/research-notes.md` (model observations, candidate nodes/edges, enums, predicate-only list, merge/defer list, seams, open questions) and `_notes/tool-log.md` (32 entries).
- Kernel pattern published by A1 during this stage (K/09-reasoning.md). Reconciled in research-notes §0: ClaimOccurrence and assessments are kernel; Chunk/DocumentTextVersion/Segmentation, MediaAsset and editorial containers (incl. Publication) are D9; RETELLS / QUALIFIED_BY are Assertion→Assertion and must be requested from the kernel; pseudonymous asserters need a D7 decision.
- Not written in this stage: SDL, registers, fixtures, 03, 08–11, SUMMARY.

### 2026-10-08 — model stage (A8, Wave 2 part 1)

- Read: RUNLOG, `_notes/research-notes.md` (§0 first), `02-questions.md`, `_notes/fixture-candidates.md`, `_notes/tool-log.md`; 00-DIRECTIVE (full), 01-PACKET-CONTRACT, 02-TEAM row, brief D9; A1 kernel `K/09-reasoning.md` (pattern, ownership map, bitemporal table), `K/04-schema-proposal.graphql` (sha256 0ad41559…), `K/domain-template.graphql`, `K/11-open-questions.md`, `K/identifier-schemes.yaml`; fragments W18/W20/W21/W22 summaries; skills neo4j-modeling, neo4j-graphql, neo4j-vector-index (SEARCH clause), neo4j-gds (Cypher projection, PageRank); `scripts/packet-check.mjs`.
- Sibling check (read-only): D7 (A6: Person, Organization, Brand; HOLDS_ROLE / HOLDS_STAKE / RECEIVES_VALUE_FROM episodes; "pseudonymous speakers are D9 accounts"; content-sponsor edges declared by the asking domain), D6 (A6: Offer, MerchantListing), D13 (A7: Event, Frontier), D8 (A7: RegulatoryRecord CONCERNS union), D10 (A1: no RECOMMENDS edge), D3 (A4: Publication declared; SPONSORED_BY for study sponsors → D9 renamed its edge CONTENT_SPONSORED_BY). No sibling declares Channel, MediaWork, Chunk or D9 enum names.
- Wrote: `04-schema-proposal.graphql` (3 node types Channel / MediaWork / Chunk, 10 relationship types, 12 pairs, 2 two-member unions, 7 enums, AppearanceEdgeProperties), `03-retrieval-patterns.md` (36 sections + conventions, TRACE fragment, index DDL), `05-relationship-register.yaml` (10 entries, predicateOnly 10, deferred 14), `06-node-register.yaml` (3 nodes, deferred 11, mergedInto 31 pinned types, 8 unions retired), `09-reasoning.md`, `10-seams.yaml`, `11-open-questions.md` (K-1…K-11 kernel requests, 12 seam rows, 5 conflicts, 6 carried), `vocab-source-genres.yaml` (genre vocabulary for kernel Source.genre + 22-row SOURCE_AUTHORITY register seed); appended model notes to `02-questions.md` (ids unchanged).
- Fixtures: removed skeleton `07-fixtures/fixture-01`; created stubs (source.md with url / retrieved / digest / kind and the relationships to exercise; empty locators/assertions; questions list) for hl52-transcript-nmn-practice (unstructured-to-entity), sinclair-recommendation-disclosure-asof (disconfirmation), lifespan-ep4-spermidine-correction (harm), rapa-ex-01-attia-retelling (disconfirmation), hl-essentials-recut-nmncom-retelling (disconfirmation), longecity-nmn-fatigue-pseudonymous (harm).
- Compile check: scratch `ft/D9/compile.graphql` = A1 kernel + D7 stubs (Person, Organization, Brand) + module; `BKS_SCHEMA_PATH=<abs> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>`. Kernel alone 326,564 B / 6,582 lines / 185 inputs; kernel+stubs 341,624 / 6,837 / 191; kernel+stubs+D9 448,493 / 8,957 / 249 (D9 marginal +106,869 B, +58 inputs); variants measured for the unions (+2.0 KB, +7 inputs) and AppearanceEdgeProperties (+8.7 KB, +3 inputs). Build ~1 s.
- Problem: the first print-schema runs used a Windows backslash path in BKS_SCHEMA_PATH; `loadPinnedSdl` found no file and silently printed the pinned schema (57,908,217 chars, 25 s). Forward-slash paths work. Readiness note for the synthesizer: check the printed size, not only the exit code.
- `node scripts/packet-check.mjs D9`: ok (nodes 3/8, rels 10/14, pairs 12/35, 36 questions, 6 fixture folders — stubs, contents for the fixtures stage).
- Tools: none external in this stage (no new captures); Git Bash, node, pnpm.

### 2026-10-08 — fixtures stage (A8, Wave 2 part 2)

- Read: RUNLOG, 02-questions, 03 conventions, 04 SDL, 05 register, `_notes/fixture-candidates.md`, `_notes/tool-log.md`, 01-PACKET-CONTRACT, 00-DIRECTIVE 3.8/3.9; A1 kernel pattern (K/09-reasoning.md, K enums: SelectorKind, SpeechAct, BasisKind, AssessmentKind, TimePrecision, SemanticVerdict); D7 edge-property types (A6); D6/D1/D3 type names (siblings, read-only); `examples/ingestion-intent.example.json`, `packages/contracts/src/ingest.ts`, `packages/kg-ops/src/plan.ts` + `uid.ts`; `scripts/packet-check.mjs`.
- Re-fetched every fixture source into scratch `ft/D9/cap2/` (firecrawl CLI ×6 sequential: scrape ids 01a11d7c-a4e0…, -ae8b…, -b516…, -be79…, -e093…, -ebff…; curl: both RSS feeds, Europe PMC JATS, Wayback 2021-12-09 copy, CDX index, Wayback copies requested for 20211231130656 / 20220308033751 (served 20210816174031 / 20220826113401 by redirect), YouTube oEmbed, iTunes Search). Byte-identical: both feeds, JATS, Wayback copy, affiliations page, Attia article. Changed: HL ep 52 page (UV-index widget), YouTube page, NMN.com, LongeCity (session ids). PubMed MCP `get_article_metadata` 41985884 for author names behind COI initials.
- Wrote scratch generators `ft/D9/fx/spec.mjs` (locator specs), `gen.mjs` (locates each quote verbatim, offsets, 32-char prefix/suffix, quoteHash, selectorDigest/selectorJson, re-selection in the re-fetch scoped to the RSS item, fixture chunker `fixture-turn-window/v0`, span-overlap COVERS_LOCATOR, lexicon MENTIONS) and `intents.mjs` (builds intent.json, validates with the @bks/contracts zod `IngestionIntent`, checks every evidence/subject ref). Generator aborts on any quote not found; 120 locators, 120 re-selected (EXACT_WITH_CONTEXT), offsets moved only where the page bytes changed (HL −145, LongeCity +348…+476).
- Fixtures completed (6 folders, all five files each): hl52-transcript-nmn-practice (unstructured-to-entity, 3.8 path c52 → l1 → o1 → snapshot, verifier re-selection), sinclair-recommendation-disclosure-asof (disconfirmation; Tally Health absent from the 2021-12-09 copy, added by 2022-08-26 under an unchanged "Updated September 18, 2020" stamp), lifespan-ep4-spermidine-correction (harm; CORRECTS + DERIVED_FROM, OPERATED_BY, sponsors, LINKS_TO_OFFER), rapa-ex-01-attia-retelling (disconfirmation; DERIVED_FROM the results span −1.19, not the abstract −1.13; RETELLING_FIDELITY), hl-essentials-recut-nmncom-retelling (REPUBLISHES RECUT, re-cut sponsors, independence 1), longecity-nmn-fatigue-pseudonymous (harm; Channel ACCOUNT asserters).
- Resolved R-6: the original of the NMN.com "double NAD+ in two weeks" retelling is in the 2021 transcript with a basis caveat the retelling drops (o8, rf-double). Added F-1…F-7 to 11-open-questions (intent-contract gaps, kg-ops Source uid collision for query-keyed URLs, multi-author asserter, channel as value payer, Wayback redirects, inferred asserter, CLAIM vs RELATIONSHIP authorizing assertion).
- Privacy: LongeCity quote context shortened (prefix/suffix 2 chars) where 32 chars would copy a poster's location or age; contextNote recorded on those locators.
- Wrote 08-sources-and-tools.md (11 register tools + 15 other rows, readiness, gaps, exercised); appended tool-log #33–#46.
- Problems: curl with POSIX `/c/...` output paths failed (exit 23) in parallel subshells — Windows-form paths work; NBSP / thin-space / U+2010 inside quoted numbers and sponsor chapters (handled with exact code points or from/to anchors); TimePrecision has no SECOND/MINUTE (used INSTANT).
- `node scripts/packet-check.mjs D9`: ok (nodes 3/8, rels 10/14, pairs 12/35, 36 questions, 6 fixtures).

### 2026-10-08 — check and handoff stage (A8)

- `node scripts/packet-check.mjs D9` exited 0 on entry and again after every change (3 / 10 / 12, 36 questions, 6 fixtures).
- Audit beyond the script:
  - Question ids: every D9 id referenced in any packet file is a row in 02. Five foreign ids are references owned elsewhere: Q-D7-06, Q-K-08, CQ-AX-05, CQ-PV-01 and CQ-EC-01. Each exists in its owner's file. They are recorded in 11 C-8.
  - SDL docstrings: the questions in each SDL relationship docstring now equal the register's list. CHUNK_OF had dropped Q-D9-16; it is now added.
  - Patterns: every 05 entry points at a 03 section, and each section uses its relationship. RENDITION_OF → 03#Q-D9-06 did not use RENDITION_OF, so the pattern was rewritten to admit only Sources RENDITION_OF the work. Two conventions are now written in 03: the `rendition:<source uid>` qualifier the fixtures already used, and `credited-name:`.
  - populatedBy: all 11 ids are rows in 08, and every tool id in the fixtures is too.
  - Fixtures: each register fixture exercises its edge (REPUBLISHES in hl-essentials, OPERATED_BY in lifespan, the other 8 in hl52).
  - Directive discipline: no document/chunk → entity SUPPORTS or CONTRADICTS; MENTIONS and COVERS_LOCATOR are derived and read-only; no good/bad property; 22 of 36 questions are harm; no kernel type re-declared; no type or relationship name collides with sibling packets.
- Kernel moved since the model stage, from 0ad41559… to 790e7244… (A1 model stage). Changes made to align with it:
  - REPUBLISHES now uses the kernel `AssertedRecordedProperties` (M10, directive rule 9).
  - `AppearanceEdgeProperties` is rebased on AssertedRecordedProperties fields plus `appearanceRole` (M11 superset rule). `creditedNameVerbatim` was removed from it (M11.3: wording stays in Assertion qualifiers). The fixtures now carry it as the qualifier `credited-name:<verbatim>` on the 9 APPEARS_IN assertions.
  - Intents: the scratch `ft/D9/fx/intents.mjs` was patched (original kept as `intents.fixtures-stage.mjs`). Before the patch, the generator reproduced all six intent.json files byte-identically. After it, the six intents were regenerated and re-validated with the @bks/contracts zod `IngestionIntent` (exit 0). The only diff is the dropped edge property and gap note (4): AssertionCore has no qualifiers.
  - Other files updated: 10-seams (new `sharedVocabularies: kernel-types` row, per K change 9; the old "(property types)" seam row was removed; DERIVED_FROM and ASSESSES notes), 05, 03 and 09.
  - 11: K-1, K-4 and D7-3 closed; K-8 accepted; C-6, C-7, C-8 and D13-2 added. D13-2: D13's seams name D9.Publication and D9.Conference, which D9 does not declare.
- Quote spot-check (re-fetched):
  - Lifespan feed (curl): byte-identical, sha256:00a162e8…. Quote f1 (the spermidine correction) sits at [245746, 245940) with prefix and suffix, and its quoteHash matches.
  - Huberman Lab ep 52 page (firecrawl CLI `--max-age 0`, scrape 01a11d9a-3423-73f9-…): new digest sha256:ad85a3a1…. All 8 web locators were re-found with their context, and l1 is back at 71636.
  - Both results are recorded in 08.
- Compile check (scratch `ft/D9/check/`), current kernel + D7 stubs + D9:
  - Totals: 467,424 B, 9,309 lines, 258 inputs. The D9 marginal is +107,091 B and +60 inputs; build ~1 s.
  - Kernel alone gives 345,273 / 6,927 / 192, equal to A1's published numbers.
  - Variants: REPUBLISHES on AssertedEdgeProperties gives 463,361 / 256 (AssertedRecordedProperties costs +4.1 KB / +2 inputs only while D9 is its first user). APPEARS_IN on plain AssertedRecordedProperties gives 462,658 / 255 (the D9 property type costs 4.8 KB / 3 inputs, down from 8.7 KB).
  - The numbers are in 09.
- Wrote SUMMARY.md (58 lines).
- Tools: node, pnpm print-schema, curl, firecrawl CLI 1.23.1. Problems: `bc` and `/usr/bin/time` are missing in Git Bash (used the bash `time` builtin). A heredoc with Windows backslash paths inside a JS template literal failed (used forward slashes). An inline sed edit to block-style YAML produced invalid YAML in 2 files; this was caught by parsing every fixture YAML and fixed.

## Handoff

- packet-check (check stage, 2026-10-08, exit 0):

```json
{
  "ok": true,
  "packet": "D9",
  "counts": {
    "nodeTypes": 3,
    "relationshipTypes": 10,
    "pairs": 12,
    "questions": 36,
    "fixtures": 6,
    "budget": {
      "nodes": 8,
      "rels": 14,
      "pairs": 35
    }
  }
}
```

- counts vs budget: nodes 3/8, relationship types 10/14, pairs 12/35, widest union 2/6, most relationship fields on one type 6/12 (MediaWork); 36 questions (22 harm); no EXCESS lines needed. Executable: +107,091 B / +60 input types over the current kernel (790e7244…) + D7 stubs, build ~1 s.
- fixtures:
  - hl52-transcript-nmn-practice (unstructured-to-entity; 3.8 path c52 → l1 → o1 → snapshot sha256:3158ac…)
  - sinclair-recommendation-disclosure-asof (disconfirmation; Tally Health absent from the Wayback copy 18 days before ep 52)
  - lifespan-ep4-spermidine-correction (harm; publisher dosing correction)
  - rapa-ex-01-attia-retelling (disconfirmation)
  - hl-essentials-recut-nmncom-retelling (disconfirmation; REPUBLISHES; R-6 closed)
  - longecity-nmn-fatigue-pseudonymous (harm; ACCOUNT asserters)
- open questions for the owner (details in 11-open-questions.md):
  - **D10-1**: accept "no RECOMMENDS projection in pass one".
  - **C-7**: the kernel requests still open (K-2 corrections, K-3 Assessment → Assertion, K-5 segmentKind, K-6 ACCOUNT Channel as asserter, K-7, K-9, K-10, K-11).
  - **F-1**: an intent proposal for claim occurrences and assessments.
  - **D7-1**: CONFLICT_RELEVANCE ownership split with D7.
  - **R-4**: whether scraping X, YouTube and Spotify is acceptable for production capture.
  - **C-6**: the Chunk label without Entity.
  - **D13-2**: D13 seams naming D9.Publication and D9.Conference.
  - **N-1**: CONTENT_SPONSORED_BY vs D3 SPONSORED_BY.
  - **C-1 / C-2**: nestedOperations and mutations field readings.
- files changed in this stage (all under schema/program/packets/D9/; nothing committed):
  - 04-schema-proposal.graphql, 05-relationship-register.yaml, 03-retrieval-patterns.md, 09-reasoning.md, 10-seams.yaml, 11-open-questions.md, 08-sources-and-tools.md, SUMMARY.md, RUNLOG.md
  - 07-fixtures/{hl52-transcript-nmn-practice, sinclair-recommendation-disclosure-asof, lifespan-ep4-spermidine-correction, rapa-ex-01-attia-retelling, hl-essentials-recut-nmncom-retelling}/assertions.yaml (credited-name qualifier)
  - all six 07-fixtures/*/intent.json (regenerated)
- whole packet (untracked on branch ft/schema-A8, for the coordinator to commit): SUMMARY.md, 01–06, 08–11, RUNLOG.md, vocab-source-genres.yaml, _notes/ (3 files), 07-fixtures/ (6 folders × 5 files).

## Adversarial review (A8, 2026-10-08)

Two independent reviewers (evidence integrity, model discipline) examined the packet. Every finding was re-verified (sources re-fetched with `curl -D`, no `-L`; digests recomputed); none was rebutted outright. Scratch: `…/scratchpad/ft/D9/cap4/` (re-fetched captures), `ft/D9/rev/` (before/after copies, compile), `ft/D9/scripts/` (edit scripts), `ft/D9/fx/` (generator: `gen.mjs` now aborts when a Wayback copy's payload SHA1 differs from its CDX digest). Nothing committed.

### Evidence-integrity findings

- E1 (blocker) sinclair aff-20211209 was the 2021-08-16 capture → **fixed**. Confirmed: stored bytes SHA1-base32 OICSTY7X… = CDX row 20210816174031. Re-fetched 20211209003848 (HTTP 200, memento-datetime Thu, 09 Dec 2021 00:38:48 GMT, 47,428 B, SHA1 V4PBTQ6P… = CDX, sha256 ce816484…; re-fetch identical). Snapshot, w1/w2 offsets, w0 counts regenerated; new locator c0 records the misfiled CDX row. Partial rebuttal: `observedAt 2021-12-09T00:38:48Z` and "18 days before the episode" are correct for the verified copy and were kept; only the bytes and what was read from them were wrong.
- E2 (blocker) Levels was listed at T → **fixed**. New w3 / v2 locators ("Levels</a> (2021-present) E,A"); d7-levels-*-2021 assertions; "silent content change" limited to Tally Health; corrected in sinclair source/assertions/questions, lifespan cr-sponsors facet and CQ-CL-05 (now DISCLOSED_ELSEWHERE_AT_TIME via the 2021-12-31 copy), 01-ecosystem §3.3, tool-log #9 (annotated), fixture-candidates (annotated). Also corrected an error the reviewer did not raise: "Athletic Greens first seen on the 2026 copy" → first on the archived copy of 2024-08-28, absent 2024-06-22 (both digest-checked, g0/g1).
- E3 (major) Tally Health bound → **fixed**. Copies 20211231, 20220308, 20220522 served with HTTP 200, matching memento-datetime and CDX digest, no "Tally"; bound now (2022-05-22, 2022-08-26] (snapshots aff-20211231/-20220308/-20220522, locators v0/u0/u2, CDX rows c2/c4); Q-D9-03, Q-D9-16 and cr-o5 updated.
- E4 (major) NMN.com does cite the Essentials video → **fixed**. Reference verified in both captures; oEmbed of Ykvkg2Jz3X8 = "Essentials: The Biology of Slowing & Reversing Aging | Dr. David Sinclair", author Andrew Huberman; watch-page uploadDate 2025-10-30T05:01:11-07:00. Added n6 (TEXT_QUOTE of the reference), yo1/yo2 (JSON_POINTER), yw1, YouTube rendition s-ren-ess-yt (RENDITION_OF w-ess); link basis EXPLICIT_CITATION at container level; citation-metadata mismatch (year 2023, title) recorded as a facet; CQ-PV-05, CQ-CL-04, 01-ecosystem §2.1/§2.5/§3.4, tool-log #10, fixture-candidates FC-9 corrected.
- E5 (minor) 08 wayback row → **fixed**: gap rewritten (id_ can serve another capture with 200 or redirect; byte identity is not proof; check memento-datetime + CDX SHA1). The fixtures-stage 302s could not be reproduced (tool-log #38 annotated; F-5 revised).
- E6 (minor) 40 vs 43 CDX rows → **fixed**: §2.2 now cites the stored 43-row listing 2021-03-02 → 2026-08-23; the 40-row figure labelled an unstored observation.
- E7 (minor) hz-quantity HARM without a harm source → **fixed**: QUALITY / D9.dose-statement-risk, effectDirection null, conclusionCode CORRECTED_QUANTITY, facets errorKind=QUANTITY_BASIS|UNIT, about the Claim; "research only, not dosing advice" kept.

### Model-discipline findings

- M1 OCCURS_IN definition not shared → **fixed (D9 side)**. D9 10-seams lists OCCURS_IN (owner this); K's working tree already seams it and Q-K-09 reads it; 03#CQ-CL-05 adopts D7's DISCLOSURE TIMING rule; request to D7 recorded (11 D7-5).
- M2 siblings use the cut DocumentTextVersion → **fixed (D9 side)**: 11 X-1. Re-read: D2 and D8 already fixed; D13 (03 l.188), D10 (03 l.744), D6 (05 l.249) still open.
- M3 REPORTS_ADVERSE_EXPERIENCE vs D5 CAUSES_ADVERSE_EFFECT → **fixed**: longecity occurrences, intent, Q-D9-11, 05, 10 (to D2.Condition); D5-1 closed.
- M4 OPERATED_BY not earned → **fixed**: predicate-only; ChannelOperator union, 1 type and 2 pairs removed; lifespan op-ls and patterns rewritten.
- M5 REPUBLISHES typed for one value-2 question → **fixed**: predicate-only; Q-D9-07 via HAS_SUBJECT/HAS_OBJECT; rp-recut an Assertion.
- M6 null valid-time handling → **fixed**: OVERLAP rule (D7's) in 03 Conventions; CQ-CL-05, Q-D9-02, Q-D9-12 return verdicts; `temporalOverlap` facet in CONFLICT_RELEVANCE (sinclair cr-o4/cr-o5, lifespan cr-sponsors).
- M7 Q-D9-05 HARM about the compound → **fixed** (same shape as E7).
- M8 Q-D9-21 names non-existent values → **fixed (D9 side)**: CLINICIAN_PUBLIC_COMMENTATOR; seller via MerchantListing -HAS_OFFER-> Offer -SELLER_OF_RECORD->; Rx set a parameter; 02 fixture cell `no`; D8 request 11 D8-2.
- M9 K-6 unanswered → **resolved upstream**: A1's working tree admits Channel ACCOUNT in ASSERTED_BY (docstring + K 10-seams, executor P20); 11 K-6 marked accepted; K-7 accepted; K-5/K-9 answered as registered qualifier prefixes.
- M10 register question lists overstate traversals → **fixed**: lists in 05 and SDL docstrings regenerated from a mechanical scan of 03 Cypher (comments excluded); Q-D9-12 added to PUBLISHES; Q-D9-20 entity entry written as a full pattern.
- M11 authorship modelled two ways → **fixed**: AUTHORED_BY dropped from D9 predicateOnly (D3's predicate); Q-D9-13 starts from D3 Publication and joins renditions by shared Identifiers.
- M12 D13/D3 container names → **fixed (D9 side)**: 11 D13-2 extended (answer to D13 #21: no Conference/Session node; D3 venueName docstring request).
- M13 02 fixture claims and harm padding → **fixed**: Q-D9-12, Q-D9-21 `no`; unbuilt FC-7/FC-8 removed from cells; Q-D9-15 neutral; counts 21 harm / 14 neutral / 1 benefit.
- M14 CONTENT_SPONSORED_BY window semantics → **fixed**: 09, 05 and SDL docstring say the work-level window separates original-publication from re-cut sponsors; rendition carried by locator or kernel-registered `rendition:` qualifier; K-9 kept.
- M15 Chunk derived vs recordedTo → **fixed**: recordedTo removed; chunks are projection output (rebuilt or deleted per chunkerVersion); re-stamping of workUid/channelUid documented (SDL, 06, 09 Risks, 11 C-10).
- M16 Q-D9-19 ignores frontier F → **fixed**: projection restricted through D13 ON_FRONTIER / INVOLVES; marked as the D9 ranking question with criterion and method version; OTHER + subkind until K-10.
- M17 OCCURS_IN "first published" is a judgment → **fixed**: 09 convention 3 and Risks: written from the extraction capture, corrected only by supersession.

### Check-stage open issues (check-issues.json "D9")

- Kernel requests: partly resolved (K-6, K-7 accepted; K-5, K-9 as qualifier prefixes); still open K-2, K-3, K-10, K-11 (11 C-7).
- D13 seam names: still open (owner D13), extended to D3 (11 D13-2).
- Chunk label without Entity: still open (11 C-6).
- Foreign question ids: by design (11 C-8).
- Intent contract (F-1): still open.
- Compile with D7 stubs only: **resolved**: D9 now also compiles against A6's full D7 SDL (no stubs).

### Measurements

- `node scripts/packet-check.mjs D9` → ok: nodeTypes 3, relationshipTypes 8, pairs 9, questions 36, fixtures 6.
- print-schema (A1 kernel sha256 b2c2b1b0…, D9 SDL bb5d7e25…, A6 D7 d691417f…): kernel 322,904 B / 179 inputs; + stubs 337,964 / 185; + stubs + D9 436,463 / 8,603 lines / 234 (D9 +98,499 B, +49 inputs); kernel + full D7 449,924 / 241; + D9 541,023 / 10,578 lines / 287 (D9 +91,099 B, +46 inputs). Output is the scratch schema, not the pinned 55 MB one.
- Fixture YAML parse + evidence-ref resolution over all six fixtures: 0 unresolved (140 locators). Intents: six valid against the zod contract; hl52 and rapa intents and locators byte-identical to before.

### Files changed (all under schema/program/packets/D9/; nothing committed)

01-ecosystem.md, 02-questions.md, 03-retrieval-patterns.md, 04-schema-proposal.graphql, 05-relationship-register.yaml, 06-node-register.yaml, 08-sources-and-tools.md, 09-reasoning.md, 10-seams.yaml, 11-open-questions.md, SUMMARY.md, RUNLOG.md, _notes/tool-log.md (annotations + #47–#52), _notes/fixture-candidates.md (annotations); 07-fixtures/sinclair-recommendation-disclosure-asof/* (5 files), lifespan-ep4-spermidine-correction/* (5), hl-essentials-recut-nmncom-retelling/* (5), longecity-nmn-fatigue-pseudonymous/{assertions.yaml, intent.json, questions.md, source.md}.

## Close-out: pattern lint (A8, 2026-10-09)

Input: S pattern linter (`final/_work/pattern-lint.json`), D9 = 40 blocks, 30 failing (5 packetBug, 25 rulingBroken). All 5 packetBug blocks were dialect errors against Neo4j 5.26; no direction, name or property errors against the D9 SDL + K kernel.

### Fixes (03-retrieval-patterns.md only; SDL, registers and other files unchanged, none repeated the error)

- `CYPHER 25` prefix removed from 5 blocks: Conventions index DDL, CQ-CL-05, Q-D9-02, Q-D9-19, Q-D9-20 (vector entry). Header now says the shapes are Cypher 5 (also valid Cypher 25).
- Conventions DDL: `chunk_embedding` drops the 2026.01+ in-index filter clause `WITH [c.language, c.textBasis, c.workUid, c.channelUid, c.publishedAt]` (5.26 syntax error); the prose keeps it as the 2026.01+ addition.
- Q-D9-20 vector entry: `SEARCH c IN (VECTOR INDEX …)` (5.26 syntax error) → `CALL db.index.vector.queryNodes('chunk_embedding', 20, $questionEmbedding) YIELD node AS c, score` + `WITH c, score WHERE c.language = 'en'`; the SEARCH form stays as a comment for 2026.01+ (same convention as final query-patterns P-04a).
- rulingBroken blocks (`ClaimOccurrence` label, F-05; R-42 identifier join in Q-D9-13) left as the record of the packet SDL; S writes the final-SDL versions.

### Measurements

- `node …/final/_work/lint-packet-patterns.mjs --packets D9 --json <scratch> --md <scratch>` → D9: 40 total, 9 ok, 1 fragment (OVERLAP CASE), 0 packetBug, 30 rulingBroken (the 5 fixed blocks now EXPLAIN ok and remain rulingBroken only for F-05 `ClaimOccurrence`), cypher25 0, selfCheckDiffs 0. Shared report in S not overwritten.
- `node scripts/packet-check.mjs D9` → ok (exit 0): nodeTypes 3, relationshipTypes 8, pairs 9, questions 36, fixtures 6.

Files changed: 03-retrieval-patterns.md, RUNLOG.md. Nothing committed.

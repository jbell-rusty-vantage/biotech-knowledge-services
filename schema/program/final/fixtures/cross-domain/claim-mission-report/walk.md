# claim-mission-report: walk

How the candidate schema carries one real statement from a podcast through vetting, an evidence mission, verification and a published-shape evidence report. The walk then answers the four mission-lineage questions over that record set. All records are fixture records (`assertions.yaml`, `locators.yaml`). They were loaded, exactly as listed, into the disposable Neo4j 5.26.31 (`bks-neo4j-synth`, every node tagged `fx: 'xfx-claim'`): 203 nodes and 744 relationships, of 22 relationship types, all declared in `final_biotech_schema_v2.graphql`. Every output quoted below is from that load on 2026-10-09. Research, not medical advice.

## 1. The path

```
Channel "Huberman Lab" -PUBLISHES-> MediaWork ep 52 (2021-12-27) <-RENDITION_OF- Source (publisher page) -HAS_SNAPSHOT-> SourceSnapshot sha256:3158ac…
   Person David A. Sinclair -APPEARS_IN {GUEST}-> ep 52                                    -HAS_LOCATOR-> l-o1, l-o1-unpub
   Assertion o1 {CLAIM, INCREASES_LEVEL_OF, STATES, CITED_FROM_PRIOR_WORK} -OCCURS_IN-> ep 52; -ASSERTED_BY-> Sinclair; -HAS_EVIDENCE{SUPPORTS,DECLARED}-> l-o1, l-o1-unpub
       -OCCURRENCE_OF-> Claim claim-avg "Taking NMN daily for about two weeks doubles blood NAD levels on average in humans"
Assessment as-vet-avg {VETTING, RESEARCH} -ASSESSES-> claim-avg                            (run R1-vetting)
Activity R2 {EVIDENCE_MISSION} -ASSESSES-> claim-avg; -WAS_INFORMED_BY-> Activity R1-vetting
   R2 writes: claim-broad + as-refines {EQUIVALENCE, K.claim-relation, REFINES}; 6 trial findings (b-*), 8 METRIC assertions (m-*);
              D7 episodes from the self-disclosure page as observed 2021-12-09 (Sinclair -HOLDS_ROLE/HOLDS_STAKE-> EdenRoc Sciences companies,
              -RECEIVES_VALUE_FROM {INVENTOR_ON_LICENSED_IP}-> MetroBiotech International); FUNDED_BY (D3 predicate) paper -> organization;
              as-res-metro, as-res-trial {RESOLUTION}; as-conflict {CONFLICT_RELEVANCE}; as-synthesis {EVIDENCE_SYNTHESIS, PARTIALLY_SUPPORTED}
Activity Rv {VERIFICATION, bundleDigest} -WAS_INFORMED_BY-> R2
   Adjudication adj-cf-o1 {CAPTURE_FIDELITY, DIRECTLY_SUPPORTED, PASS} -ASSESSES-> o1 (o1.status EXTRACTED -> ACCEPTED)
   Adjudication adj-sup-o1 {SUPPORT, PARTIALLY_SUPPORTED, REVIEW} -ASSESSES-> o1; -HAS_EVIDENCE {role, VERIFIER_FOUND, authority, independence}-> 16 spans
Report {EVIDENCE_REPORT, d10.evidence-report@1, verdict PARTIALLY_SUPPORTED, worldCorrectness UNKNOWN} -ASSESSES-> claim-avg
   -DERIVED_FROM-> 18 Assertions + 6 Assessments; -HAS_EVIDENCE-> 27 locators; -WAS_GENERATED_BY-> R2; -HAS_ITEM-> 6 ReportItems (D10)
```

## 2. Step by step

1. **The statement (D9, R1).** The guest's answer to "what about NMN, NR, and B3?" is captured on the publisher's transcript page. o1's two declared spans carry the printed speaker label "David Sinclair:". The containing chapter is linked at `?timestamp=3405` (`l-chapter`, media 3405–4150 s); the transcript itself has no cue times. The answer opens with "disclaimer is I don't recommend anything, but I talk about what I do", so o1 is STATES, not a recommendation (R-83). The page carries the publisher caveat "This transcript is currently under human review and may contain errors." (`l-caveat`), which QUALIFIES every quote.
2. **Vetting (Rvet).** claim-avg gets disposition RESEARCH. The reasons: it is quantitative; its stated basis was unpublished; it reaches a large audience (`y-views` "**Views**: 3717651" as displayed on 2026-10-08); and the speaker discloses roles in a company group in the field. claim-universal ("without any exceptions … twofold or more") gets MONITOR, because it needs individual-level data.
3. **Mission (R2).** The run is chartered about claim-avg (Activity ASSESSES Claim, R-12). It searched PubMed with two queries, logged in `_runlog/xfx-claim.md`, and captured seven records and full texts. It could not fetch the publisher PDF of the 14-day trial directly (HTTP 403), so it used the Firecrawl rendition and marked it PARTIAL_EXCERPT: the tool digitizes figures into tables that are not article text, and none of those is quoted. Each trial finding is an Assertion whose asserter is its Publication (R-15), grouped with its renditions by RENDITION_OF. The six findings are:
   - **Pencina 2023 (J Gerontol)**, POSITIVE: 1 g once or twice daily for 14 days; Day 8 similar to Day 14; Table 1 Cmax above baseline 23.0 / 40.4 / 1.36 µg/mL.
   - **Pencina 2023 (JCEM)**, POSITIVE: 2 g/day for 28 days.
   - **Yi 2023**, POSITIVE: 300 / 600 / 900 mg for 60 days; first sample at day 30; serum NAD+ + NADH by colorimetric assay.
   - **Huang 2022**, MIXED: 300 mg for 60 days; +38% against +14.3% with placebo, not significant.
   - **Okabe 2022**, POSITIVE: 250 mg for 12 weeks; first visit at 4 weeks; "may vary among individuals".
   - **Morita 2022**, DECREASES_LEVEL_OF: 300 mg/day for eight weeks, single arm; blood NAD 17.4 → 13.7 ng/mL.

   R2 also reads the self-disclosure page as archived 18 days before the statement (D9's verified Wayback copy). It writes the speaker's ties as D7 episodes, with valid time stated by the page ("2015-present") and observed at the copy's memento time. It links the three printings of the organization name by a PROPOSED RESOLUTION, never a merge. It hypothesizes, and does not assert, that the 14-day trial (received 2021-12-14) is among the "trials not yet published".
4. **Verification (Rv).** A deterministic re-selection of every declared span gives 27 CAPTURE_FIDELITY adjudications, all DIRECTLY_SUPPORTED / PASS. o1 and o2 are re-anchored on a fresh 2026-10-09 capture of the episode page (offset shift −281). The tool-rendered Table 1 value 23.0 µg/mL is corroborated by an independent review's table (`rv-row`, captured by Rv). The SUPPORT judgment on o1 sets per-span role, authority and independence:

   | role | families | of which independent |
   | --- | ---: | ---: |
   | SUPPORTS | 1 | 0 |
   | QUALIFIES | 6 | 1 (Morita, which declares no conflict of interest); Huang UNKNOWN; the rest INTERESTED_PARTY |
   | CONTRADICTS | 0 | — |

   The verdict is PARTIALLY_SUPPORTED with worldCorrectness UNKNOWN. The unsupported facets are the "double on average" magnitude (no located text states a fold change) and independence (the only evidence at the claim's dose and duration is funded by the speaker's affiliated company group).
5. **Report (R2).** The report follows `d10.evidence-report@1`: CLAIM_UNDER_TEST, INTERESTS, EVIDENCE_FOR, EVIDENCE_AGAINST, VERDICT, OPEN_QUESTIONS. The body is `composed-body.txt` (bodyDigest sha256:f11f7d49e853db7d9dd6654ebceb48fda6da58a3e8c6e0e1f9cdf469c260191f). Each ReportItem cites the subset its sentences rest on:

   | section | citations | uncited sentences |
   | --- | ---: | ---: |
   | CLAIM_UNDER_TEST | 2 | 0 |
   | INTERESTS | 11 | 0 |
   | EVIDENCE_FOR | 4 | 0 |
   | EVIDENCE_AGAINST | 7 | 0 |
   | VERDICT | 2 | 0 |
   | OPEN_QUESTIONS | 2 | 1 ("Research, not medical advice.") |

   Report citationCompleteness is 0.9444 (17 of 18 sentences); distinctSourceFamilyCount is 6 and independentSourceFamilyCount is 1. The report is a fixture draft: status PROPOSED, publishedAt null.

## 3. The four mission-lineage questions (Cypher run on the load)

The patterns are `packets/K/03-retrieval-patterns.md` Q-K-04 … Q-K-07, run verbatim, with two exceptions:
- The `CYPHER 25` prefix is removed. Neo4j 5.26 answers "25 is not a valid option for cypher version. Valid options are: 5" (finding F1).
- In Q-K-05, `$($label)` is replaced by the literal label.

Parameters: `$missionId = 'mission:xfx-claim-mission-report'`, `$r1 = 'run:xfx-claim-r1-ingest'`, `$r2 = 'run:xfx-claim-r2-evidence-mission'`, `$rv = 'run:xfx-claim-r2-verification'`. Scripts: scratch `synth/xfx-claim/queries.cypher`, `queries2.cypher`, `queries3.cypher`; outputs `queries*.out`.

### What did mission M produce? (Q-K-04)

```cypher
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(n)
WITH act, n, [l IN labels(n) WHERE NOT l IN ['Entity','InformationArtifact','EvidenceAssessment','Occurrence']][0] AS label,
     NOT EXISTS { MATCH (n)-[:WAS_GENERATED_BY]->(prior:Activity) WHERE prior.startedAt < act.startedAt } AS created
RETURN act.runId, label, sum(CASE WHEN created THEN 1 ELSE 0 END) AS createdCount, sum(CASE WHEN created THEN 0 ELSE 1 END) AS updatedCount
ORDER BY act.runId, label;
```

The label expression replaces the pattern's `labels(n)[0]` (finding F2). Fix stage (2026-10-09, ruling F-05): the scratch loader no longer writes a `ClaimOccurrence` label on CLAIM Assertions, because the kernel declares only `Assertion`. The exclusion list is therefore the canonical KIND list of `query-patterns.md`. Re-run on the reloaded graph, the per-run counts are in `_runlog/fix.md` section 6. Output: 188 distinct records and 195 WAS_GENERATED_BY edges.

| run | created | updated |
| --- | --- | --- |
| R1 | Activity 1, Agent 2, Assertion 2, ChemicalSubstance 2, Claim 2, SourceLocator 10 | — |
| Rvet | Activity 1, Assessment 2 | Claim 2 |
| R2 | Activity 1, Assertion 37, Assessment 5, Claim 1, Identifier 2, IngredientMaterial 1, Publication 7, Report 1, ReportItem 6, Source 10, SourceLocator 44, SourceSnapshot 11 | ChemicalSubstance 2, Claim 1 |
| Rv | Activity 1, Adjudication 28, Agent 2, Assertion 1, Publication 1, Source 1, SourceLocator 5, SourceSnapshot 1 | Assertion 2 |

Asserted edges authorized, by the pattern's part 2: R2 HOLDS_ROLE 4, HOLDS_STAKE 2, REALIZES_SUBSTANCE 1, RECEIVES_VALUE_FROM 1, RENDITION_OF 10; Rv RENDITION_OF 1. Part 2 does not count the two HAS_IDENTIFIER episodes (finding F5).

Outputs, by part 3: Rvet VETTING 2; R2 CONFLICT_RELEVANCE 1, EQUIVALENCE 1, EVIDENCE_SYNTHESIS 1, RESOLUTION 2, EVIDENCE_REPORT 1; Rv CAPTURE_FIDELITY 27, SUPPORT 1.

### Which missions touched the claim? (Q-K-05, x = claim-avg)

```
"mission:xfx-claim-mission-report", "run:xfx-claim-r1-ingest",           "INGESTION",        2026-10-09T04:17:48Z,     ["WROTE"]
"mission:xfx-claim-mission-report", "run:xfx-claim-r1-vetting",          "VETTING",          2026-10-09T04:18:24.343Z, ["WROTE", "ASSESSED"]
"mission:xfx-claim-mission-report", "run:xfx-claim-r2-evidence-mission", "EVIDENCE_MISSION", 2026-10-09T04:18:24.696Z, ["WROTE", "ASSESSED", "CHARTERED_ABOUT"]
```

For x = the speaker (`hu:person:david-a-sinclair`), the pattern crosses missions:

```
"mission:xfx-claim-mission-report", "run:xfx-claim-r2-evidence-mission", "EVIDENCE_MISSION", 2026-10-09T04:18:24.696Z, ["ASSERTED_ABOUT", "ASSESSED"]
"mission:ft-D7-fixtures", "run:ft-D7-sinclair-self-disclosure-unstructured", "INGESTION", NULL, ["WROTE"]
```

R1, which recorded his two statements, is missing: the pattern has no ASSERTED_BY role (finding F3).

### What depends on M? (Q-K-06, run-scoped to R1)

R1's kernel outputs are claim-avg, claim-universal, o1 and o2. Dependants, all current, are found over DERIVED_FROM, and over ASSESSES where the hop ends at a Claim or an Assertion:
- **Depth 1:** Activity R2; Assessments as-conflict, as-refines, as-synthesis, as-vet-avg, as-vet-univ; Adjudications adj-cf-o1, adj-cf-o2, adj-sup-o1; the Report; ReportItems claim-under-test, evidence-against, evidence-for, open-questions, verdict.
- **Depth 2:** ReportItem interests.

Downstream runs over WAS_INFORMED_BY are Rvet (1), R2 (2) and Rv (3). Touched entities, listed and not walked, are 2 substances, 1 material and 8 Publications.

### What changed between two runs? (Q-K-07)

**R1 → R2.** CREATED: Activity 1, Assertion 37, Assessment 5, SourceSnapshot 11, "Entity" 21, "InformationArtifact" 51 (F2 label grouping). UPDATED (each also written by R1): claim-avg (refinesClaimUid → claim-broad, lifecycle QUEUED_FOR_RESEARCH → REPORTED, latestVerdict PARTIALLY_SUPPORTED) and the two substances (MeSH identifiers). SUPERSEDES and CLOSED: none. Episodes opened: HOLDS_ROLE 4, HOLDS_STAKE 2, REALIZES_SUBSTANCE 1, RECEIVES_VALUE_FROM 1, RENDITION_OF 10, all OPEN.

**R2 → Rv.** CREATED: Activity 1, Agent 2, Assertion 1, "Entity" 2, Adjudication ("EvidenceAssessment") 28, "InformationArtifact" 5, SourceSnapshot 1. UPDATED: o1 and o2, status EXTRACTED → ACCEPTED.

### Supporting checks (same load)

- **Q-K-08** returns one row: R2, queuedByRun Rvet, the report, PARTIALLY_SUPPORTED / UNKNOWN, bundleDigest sha256:f5f40226acf0b7f1963d4d3ea17a4627ea4c173c39a3fafa3a115307132bf487. Asked from claim-broad, the same row comes through `refinesClaimUid`.
- **Interest valid at T, read from snapshots observed before T** (CQ-CL-05, CQ-EC-03): six ties, each validFrom 2015 and observed 2021-12-09T00:38:48Z. In-container disclosures: 0.
- **Q-K-17:** 27 HAS_EVIDENCE and 24 DERIVED_FROM citations from the report; 0 changed inputs.
- **Directive 3.8 trace** without chunks, from claim-avg through the occurrence to its spans and the snapshot bytes: l-o1 [69347, 69449) and l-o1-unpub [69456, 69566), both on sha256:3158acee44e12235c743aabb3750c7b0d0a807f560bb16477bef76529b0ae973.

## 4. Findings for the synthesis

| id | finding | where it goes |
| --- | --- | --- |
| F1 | `CYPHER 25` in the K patterns is rejected by Neo4j 5.26 ("Valid options are: 5"); the patterns run once the prefix is removed. The disposable instance does accept the `$(...)` dynamic label (EXPLAIN ok). | query-patterns.md |
| F2 | `labels(n)[0]` is not a type key. A node created `:Claim:Entity` returns `["Entity", "Claim"]`, so Q-K-04 and Q-K-07 group Claims, Publications and substances under "Entity" and locators and reports under "InformationArtifact". Use `[l IN labels(n) WHERE NOT l IN [<shared labels>]][0]`. | query-patterns.md |
| F3 | Q-K-05 has no role for "asserted BY X", so the runs that recorded a person's statements do not appear when X is the speaker. Add `MATCH (x)<-[:ASSERTED_BY]-(:Assertion)-[:WAS_GENERATED_BY]->(act) RETURN act, 'RECORDED_STATEMENT_BY' AS role`. | query-patterns.md: applied by the fix stage (P-10b, F-06); Sinclair now returns r1-ingest, r2-evidence-mission and r2-verification |
| F4 | The D7 fixture's `loc-sin-metrobiotech` and `loc-sin-legend` print U+00A0 as a plain space. The offsets re-select only after NBSP → space normalization (`locators.yaml` referencedLocators). | D7 fixture, re-path stage |
| F5 | Q-K-04 part 2 does not count HAS_IDENTIFIER episodes: the identifier assertion has no HAS_OBJECT, because the Identifier is the edge target. | query-patterns.md: applied by the fix stage (P-10a.2 second branch, F-06); 2 episodes here, 22 on the compound fixture |
| F6 | The D7 fixture writes `entityKind: UNSPECIFIED` for MetroBiotech International. The final OrganizationEntityKind has no such value, and the field is non-null. | open-questions |
| F7 | Firecrawl's PDF rendition interleaves digitized figure tables (round numbers, empty cells) with the article text and drops text around the figure. A TOOL_RENDITION of a PDF must be PARTIAL_EXCERPT, and a quote from a table must be checked against the text layer or a second source. | tooling / readiness |
| F8 | No caption-timecode tool is installed (yt-dlp, youtube_transcript_api), so episode claims are located by quote, and MEDIA_TIMECODE locators cannot be produced for this rendition. OUP returns HTTP 403 to curl for the article PDF, and article HTML via Firecrawl main-content is navigation only. | tooling / readiness |
| F9 | Fixture shortcuts: METRIC assertions have the reporting Publication as subject because the D3 Study / StudyResult was not instantiated. The metric predicates (BLOOD_NAD_CMAX_ABOVE_BASELINE_DAY14, SERUM_NAD_CONCENTRATION, WITHIN_GROUP_CV_OF_NAD_CHANGE) are registered nowhere. biotech-knowledge-intent.v1 cannot express Claims, Assessments, Reports or Activity ASSESSES (as in K). | open-questions |

## 5. Reproduce

From scratch `synth/xfx-claim/`:

1. `python -I -X utf8 gen.py <cap> <this dir>`: snapshots and locators (stage1.json). Anchors must be unique; the clock is frozen in clock.json at the first run, 2026-10-09T04:35:02Z.
2. `python -I -X utf8 build2.py <this dir>`: records, body, lineage (stage2.json).
3. `python -I -X utf8 emit.py <this dir>`: locators.yaml, assertions.yaml, intent.json, intent-r2.json.
4. `node validate.mjs <worktree> <this dir>`: both intents validate against `@bks/contracts` IngestionIntent.
5. `python -I -X utf8 load.py`, then `docker exec -i bks-neo4j-synth cypher-shell … < load.cypher`, then the same for `queries.cypher`, `queries2.cypher` and `queries3.cypher`. Cleanup: `MATCH (n {fx: 'xfx-claim'}) DETACH DELETE n`.

# D9 — summary

Sources, media and discourse (agent A8, 2026-10-08; adversarial review). D9 owns the editorial containers in which people
say things (podcast shows and episodes, video channels, newsletters, articles, protocol pages, social posts, forum threads,
images) and the retrieval structure over captured text (chunks). The claims themselves are kernel records: a statement, a
practice report or a recommendation is a kernel `ClaimOccurrence` (an `Assertion` with a speech act, one asserter and a
located span); D9 gives it its container (`OCCURS_IN`, seamed from both K and D9), the renditions that carry it, the people
who appear and the sponsors read. Channel operators and re-cut links are predicate-only Assertions. A recommendation is a
`ClaimOccurrence {speechAct: RECOMMENDS}`; the recommender's D7 interests are read with an OVERLAP verdict (OVERLAPS /
DISJOINT / UNKNOWN) at the container's `publishedAt`. No stored `RECOMMENDS` edge exists, and none is needed (directive 3.9).

## Headline counts (`node scripts/packet-check.mjs D9`: ok)

| measure | D9 | budget |
| --- | ---: | ---: |
| node types (Channel, MediaWork, Chunk) | 3 | 8 |
| relationship types | 8 | 14 |
| from→to pairs | 9 | 35 |
| widest union (ContentSponsor) | 2 | 6 |
| questions (21 of 36 harm / risk / disconfirmation) | 36 | 15–40 |
| fixtures (real captures, 140 locators) | 6 | ≥ 3 |

Executable cost against A1's current kernel (b2c2b1b0…): +98,499 bytes, +49 input types with D7 stubbed; +91,099 bytes,
+46 input types on top of A6's full D7 SDL; build ~1 s (09-reasoning.md). One of eight edges carries a valid-time
episode: CONTENT_SPONSORED_BY.

## Five highest-value questions

1. **Q-D9-02**: for P's recommendations, which recommended items come from an organization in which P held a financial
   interest at the time, and was it disclosed in the same container? (fixtures hl52 + sinclair-recommendation-disclosure-asof)
2. **Q-D9-01 / CQ-RC-05**: who *recommends* X, as distinct from practice reports, sponsor reads and mentions?
3. **CQ-CL-04 / Q-D9-09**: did a retelling drop a qualification or change a number? (the Attia retelling of RAPA-EX-01 matches
   the results span −1.19 kg, not the abstract's −1.13 kg; NMN.com cites the Essentials video but drops "not yet published")
4. **Q-D9-05 / Q-D9-04**: which spoken dosing statements were later corrected? (Lifespan ep 4: "1 gram of spermidine" corrected
   by the publisher to 1–2 mg; a risk finding about the statement, not a harm claim about spermidine)
5. **Q-D9-20**: the directive 3.8 path: question → chunk → covered locator → accepted occurrence → snapshot bytes, re-selected
   by the verifier in a later capture.

## Three biggest cuts

1. The pinned media graph (W18, W20, W21, W22: 28 node types, ~99 relationship types, the 75-member MediaSubjectTarget union)
   became 3 node types. Episode, post, article, MediaAsset and segment become one `MediaWork` (`workKind`), and Platform,
   Series and community become one `Channel` (`channelKind`, `platform`).
2. DocumentTextVersion, Segmentation and NEXT_CHUNK became `Chunk` properties; chunks are projection output. Chunk→entity
   support edges became derived, read-only `COVERS_LOCATOR` (chunk → locator) and `MENTIONS`. OPERATED_BY and REPUBLISHES
   are predicate-only (value-2 links), which drops two relationship types, three pairs and a union.
3. No D9 claim-layer types: RECOMMENDS, RETELLS, EpisodeSegment, DiscourseAssessment and ClaimOccurrence are kernel records
   or conventions (DERIVED_FROM with CITED_FROM_PRIOR_WORK; Assessments RETELLING_FIDELITY, CONFLICT_RELEVANCE, QUALITY with
   `conclusionCode` / `facets`; qualifiers). Adverse experiences use D5's `CAUSES_ADVERSE_EFFECT`.

## Three biggest risks

1. **Archive and capture integrity.** A Wayback `id_` request served a 2021-08-16 capture as 2021-12-09, and the fixtures
   stage drew a wrong "Levels not disclosed" finding from it. Archive copies are now accepted only after their
   memento-datetime and CDX digest are checked. Audio is not transcribed; X, YouTube and Spotify are scraped; Reddit is blocked.
2. **Shared definitions across packets.** T = OCCURS_IN → MediaWork.publishedAt is shared with K, but D7 still reads T
   from the evidence snapshot (11-open-questions D7-5). Rendition joins, the choice of container for re-cuts (made by
   supersession) and Brand→Organization ownership can each flip a "valid at the time" finding.
3. **Kernel interim conventions.** Corrections (K-2), assessing an occurrence (K-3) and DISCOURSE_METRIC (K-10) are still
   interim; the intent contract cannot write a claim occurrence or an assessment (F-1), so fixtures keep them in YAML.

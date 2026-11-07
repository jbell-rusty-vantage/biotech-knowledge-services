# K — summary (kernel: evidence, identity and time)

A1, fast-track schema run, 2026-10-08; updated after the adversarial review (same day). Research is not medical advice.

## What the domain is

The kernel is the part of the graph that every domain uses. It records who said what (`Assertion`, with subject, object and asserter), where it was said (`Source` → `SourceSnapshot` → `SourceLocator`, a verification.v1 selector over captured bytes), and who judged it. Judgments are `Adjudication` (the verification.v1 verdict lattice and five properties), `Assessment` (vetting, resolution, equivalence, synthesis, authority) and `Report` (evidence reports and answers, with a minimum citation set). It also models propositions that recur across sources (`Claim` ← `OCCURRENCE_OF`) and identity (`Identifier` on bitemporal episodes, plus a register of 103 schemes). A surface form awaiting entity resolution is a `SourceLocator` cited by a RESOLUTION `Assessment`; `MENTIONS` is a derived D9 chunk projection and never counts as evidence.

`Activity` is the single lineage spine. There is one Activity per Mission Control run or verification run, and everything a run writes points at it. Domains attach through the `Subjectable` and `Entity` interfaces and never re-declare a kernel type.

## Headline counts (packet-check, exit 0)

| | count | budget |
| --- | ---: | ---: |
| node types | 11 | 12 |
| relationship types | 13 | 14 |
| from→to pairs | 32 | 40 |
| unions | 0 | max width 6 |
| questions | 35 (18 harm or disconfirmation) | 15–40 |
| fixtures | 6, all from real re-fetched captures | ≥ 3 |

The printed executable for the kernel alone is 322,904 bytes, 6,466 lines and 179 inputs (345,273 / 192 before the review). With the domain template it is 357,817 bytes and 198 inputs. The kernel plus all 13 current domain drafts compiles with no stubs at 1,746,992 bytes and 986 inputs.

## Five highest-value questions

1. **Q-K-01** asks, for assertion A, which located span on which captured snapshot supports it, who asserted it, and who adjudicated it, with what verdict and under which policy.
2. **Q-K-14** follows the unstructured-to-entity path: user question → chunk (vector search or MENTIONS) → locator → assertion → snapshot digest. The verifier must re-select the same bytes.
3. **Q-K-08** asks which evidence mission tested claim C, what verdict it reached on the verification.v1 lattice, and which report published it. The answer covers refined variants and the vetting run that queued the claim.
4. **Q-K-06** is the blast radius of a faulty mission: every record, derived edge and downstream run that depends on what mission M produced.
5. **Q-K-10 / Q-K-22** find assertions made stale because their source was retracted or corrected, or because their locator failed to re-anchor. They show each authority's notice and date separately.

## Three biggest cuts

1. **Pinned W00 (13 types, 37 relationship types) plus W19, W20 and W23 (10 types) reduced to 11 node types and 13 relationship types.** The adversarial review cut `Mention` (a surface form is its locator plus a RESOLUTION Assessment) and `Adjudication.considers`. The 144-member `AssertionSubjectTarget` union became the `Subjectable` interface, which adds roughly zero cost per implementer. The six archetype interfaces were cut and survive as stored labels.
2. **SUPPORTED_BY, CONTRADICTED_BY and SUPPORTED_BY_CHUNK collapsed into `HAS_EVIDENCE {role, origin, authority, independence, facet}` → SourceLocator.** No document→entity support edge exists (directive 3.8). DERIVED_FROM_ASSERTION, CONSIDERS_ASSESSMENT and CITES_* merged into one `DERIVED_FROM`, so blast radius is one variable-length pattern.
3. **Separate nodes replaced by properties or by existing types:**
   - `VerificationRun` became a `bundleDigest` on a VERIFICATION Activity.
   - `SourceRevisionEvent` became `revisionKind` plus `revisesSnapshotUid`, with HAS_REVISION_STATUS Assertions per authority.
   - `ResolutionHypothesis` and `EquivalenceAssessment` became `Assessment`.
   - `AnswerRecord` became a `Report` of kind ANSWER.
   - `USED` edges and `PolicyVersion` were deferred to D10.

## Three biggest risks

1. **The executor (kg-ops) and the intent contract must change before the slim kernel can be written.** The executor needs changes P1–P21 (`11-open-questions.md`). biotech-knowledge-intent.v1 cannot yet carry Claim, Assessment, Adjudication or Report records, or `supersedesUid` (open question 26).
2. **The generic `Assertion` (28 properties) and `Assessment` (five typed slots) only stay safe if each subkind and predicate is registered.** Without the registers, `conclusionCode`, `facets` and predicates turn into free text. The synthesizer must assemble the vocabulary and predicate registers (open questions 17 and 18).
3. **Neo4j has no database-level as-of.** The run-diff and as-of patterns (Q-K-02, Q-K-07) therefore depend on executor discipline: WAS_GENERATED_BY written on update (P9), `recordedAt`/`recordedTo`/`supersedesUid` on every record, and per-type relationship indexes. Before P9, nodes updated by a later run are invisible to the diff (open question 24).

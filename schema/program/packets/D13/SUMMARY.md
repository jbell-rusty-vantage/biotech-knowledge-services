# D13 — summary

Frontiers, breakthroughs and events. Agent A7, check stage and adversarial-review pass, 2026-10-08. Research is not medical or investment advice.

## What the domain is

D13 tracks what happens in biotech and longevity and how those happenings connect. An **Event** is one dated public
occurrence: a trial start, readout, regulatory submission, acceptance, designation, approval or rejection, a clinical
hold, safety signal, discontinuation, financing, acquisition, partnership or retraction. A **Frontier** is a curated
field-level goal that investors and researchers follow, such as "senolytics in humans", "partial epigenetic
reprogramming" or "MASH fibrosis resolution". The vocabulary has about 25 frontiers, defined in `vocab-frontiers.yaml@0.2.1`.

- Events and studies are classified onto frontiers (ON_FRONTIER), events are linked to the organizations and people
  involved with a role (INVOLVES) and to the D8 regulatory record of the act (DOCUMENTED_BY_RECORD, whose issuer and
  addressee replace regulator / applicant roles), and chained to each other only when a source states the basis:
  LEADS_TO (process, "as a result of") and RESPONDS_TO (agency, "discontinued due to"). Temporal order alone
  ("following", "after") is a computed FOLLOWS, never an edge.
- Every clock (occurred, announced, effective, scheduled) is materialized from a kernel Assertion with a locator. A
  re-guided date is a new Assertion, so a slipped milestone can be computed from the history.
- What an event is about, and any breakthrough, impact or "good/bad" judgment, belong to the kernel: the EVENT_ABOUT
  predicate, BREAKTHROUGH_JUDGMENT / EVENT_IMPACT Assessments and Reports. The audience is mainly investors
  (00-DIRECTIVE 3.7), then researchers, then biohackers.

## Headline counts (`node scripts/packet-check.mjs D13`, ok)

| measure | D13 | budget |
| --- | ---: | ---: |
| node types | 2 (Event, Frontier) | 8 |
| relationship types | 5 (ON_FRONTIER, LEADS_TO, RESPONDS_TO, INVOLVES, DOCUMENTED_BY_RECORD) | 14 |
| from→to pairs | 7 | 35 |
| widest union | none | 6 |
| questions | 33 (14 harm / disconfirmation; Q-D13-33 is the comparison question) | 15–40 |
| fixtures | 5, from real captures: 23 snapshots, 70 locators, 83 assertions | ≥ 3 |
| printed cost vs kernel + stubs | +75,134 bytes, +45 input types (current kernel sha256 b2c2b1b0…) | — |

All five edges are recorded-time only (kernel AssertedRecordedProperties). INVOLVES carries only the role on its edge,
through `EventRoleEdgeProperties` (the printed title is the Assertion qualifier `roleText`, kernel M11(3)).

## Five highest-value questions

1. **Q-D13-01**: what happened on frontier F in the last N days, in order? Shows which events led to or responded to which, citing stated links only.
2. **Q-D13-05**: what is the timeline from pivotal readout to submission, acceptance, approval and launch for compound X? How long did each step take? (Fixture: resmetirom.)
3. **Q-D13-06**: which financings followed a readout? Which ones did a source *state* were based on it, and which only came after it?
4. **Q-D13-08**: what went wrong on frontier F (failed readouts, safety signals, holds, discontinuations, retractions), and what did each lead to?
5. **Q-D13-16**: for an intervention a biohacker reads about, has anything reached humans in a registered trial or an approval? Or is it still only an announcement?

## Three biggest cuts

1. **Pinned W18 has 22 relationship types; D13 keeps 5.** CAUSED_BY is merged into LEADS_TO and RESPONDS_TO, and FOLLOWED_BY becomes computed. HOSTS_EVENT, SPEAKS_AT, EXHIBITS_AT and ATTENDS fold into INVOLVES roles or are dropped. The 15-member EventSubjectTarget union is replaced by the kernel EVENT_ABOUT predicate.
2. **Nodes cut, moved to the kernel or to D9:** NarrativeArc becomes a kernel Report, EventImpactAssessment a kernel Assessment, and Conference becomes D9 Channel (EVENT_SERIES) plus qualifiers on PRESENTED_AT_CONFERENCE. Community is cut. Breakthrough, Milestone, Guidance, Forecast and FinancingRound are lenses or computed answers, not nodes.
3. **No stored verdicts.** Breakthrough status, impact, progress, "furthest milestone" and hype are not properties. They are computed from events or held as attributed Assessments (00-DIRECTIVE 3.2).

## Three biggest risks

1. **False causation in investor chains.** LEADS_TO and RESPONDS_TO depend on the verifier telling a stated basis apart from temporal wording. The financing fixture is the regression case: one span projects an edge, the other is CONTEXT_ONLY.
2. **Executor work is required.** The executor must re-materialize the clocks and status, apply the projection gate on causal links, and match events on kind + primary subject + jurisdiction + overlapping window (the `identityKey` is a frozen mint-time key; merges only through an EQUIVALENCE Assessment). Intent v1 also cannot express a predicate-only object, a held edge or qualifiers (11-open-questions.md items 12–14 and 27).
3. **Judgment drift.** Frontier classification (ON_FRONTIER) is a curator's claim, and over- or under-attaching events skews the "first on F" answers. The vocabulary version, the 1–2 frontier rule and supersession make it auditable, but not correct.

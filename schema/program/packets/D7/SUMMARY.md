# D7 — summary

**Organizations, people and money.** Who is behind a product, a study, a claim or a company: the organizations (legal entities, corporate groups, fund vehicles, funders, regulators), the public people who found, run, advise, own or speak for them, and the money between them (roles, stakes, payments, awards). It makes "who benefits if you believe this" answerable for biohackers, "who owns and finances this" for investors and "who funded this evidence" for researchers — every tie traceable to a located span and dated on both time axes.

## Headline counts (`node scripts/packet-check.mjs D7`, adversarial review 2026-10-08)

| measure | D7 | budget |
| --- | ---: | ---: |
| node types (Organization, Person, Brand, Award) | 4 | 8 |
| relationship types (HOLDS_ROLE, HOLDS_STAKE, RECEIVES_VALUE_FROM, PARENT_OF, OWNS_BRAND, AWARDED_BY, AWARDED_TO) | 7 | 14 |
| from→to pairs | 9 | 35 |
| questions (18 of 33 harm / risk / disconfirmation) | 33 | 15–40 |
| fixtures from real captures (98 locators, 0 re-selection failures) | 6 | ≥ 3 |

Executable cost against the current kernel (A1, sha256 `b2c2b1b0…d5c7`): +127.0 KB, +2,339 lines, +62 input types (kernel + D7 = 449,924 B, 241 inputs, ~1 s build). Organization declares 2 relationship fields (pinned: 59); pairs touching the old W01 types fall from 305 to 30 (9 in D7, 21 declared by the domains that ask). No unions, no derived edges, no budget excess.

## Five highest-value questions

1. **CQ-CL-05** — which financial ties of the speaker, in force at the time of a statement, are relevant to it, and where were they disclosed? (kernel Assessment CONFLICT_RELEVANCE, D7 vocabulary)
2. **Q-D7-06** — which of P's recommendations concern a company P has a financial interest in, and did the audience see the disclosure? (D9 seam, directive 3.9)
3. **Q-D7-01** — who owns or controls company X as of date V: every holder above 5 %, the holding chain behind each, the filing that says so?
4. **Q-D7-04** — who financed private company X, how much, when, and which persons does the filing name?
5. **Q-D7-20** — when we report "no financial interest found", was every disclosure source captured completely? (absence is never "no conflict")

## Three biggest cuts

1. **The Organization hub: 59 fields → 2.** Every role another domain asks about is declared on that domain's own type pointing at Organization (sponsor / funding award on D3 `Study.roles`; seller and label party on D6; issuer, addressee, assignee, licensee on D8; sponsor and operator on D9; event participant on D13). No inverse fields.
2. **Nine pinned interest edges → three families** (role, stake, value received), each a bitemporal episode with only the qualifiers questions filter on. No FinancialInterest node, no RECOMMENDS or CANDIDATE_TIE edges (recommendations are kernel claim occurrences; tie leads are INSIGHT Assessments for Mission Control).
3. **Nine W01 types → 4 nodes.** LegalEntity and OrganizationSnapshot → `entityKind` + valid-time name Assertions; InvestorGroup → `CORPORATE_GROUP` + PARENT_OF; FinancingRound → D13 Event; ConflictRelevanceAssessment → kernel Assessment; PseudonymousActor → D9 Channel + RESOLUTION; Facility deferred.

## Three biggest risks

1. **Disclosures and ties dated by the wrong clock.** The Attia article (dated 2021-06-20) carries a Dexcom disclosure its 2021-06-21 archived rendition lacks; the author's own disclosure list, archived in 2025 from a URL that now redirects, dates the advisory role September 2020 – August 2021. So the tie was live and undisclosed when the recommendation was published (OVERLAPS, DISCLOSED_IN_LATER_REVISION), and the 2024 revision's present-tense "I am a paid advisor" is a stale title. A current capture alone gets both wrong. Rule DISCLOSURE TIMING in `03`, archive-first capture of disclosure lists (`08`), Q-D7-17 for stale titles; depends on archive coverage (OQ-D7-31).
2. **Wrong-person resolution.** Form D related persons, FTC-named endorsers and RePORTER PIs carry no identifier shared with self-published pages; a wrong RESOLUTION attaches someone else's interests to a speaker — a harm and a privacy failure at once. Fixtures hold these links behind RESOLUTION Assessments, never merges.
3. **Ownership gaps between modules.** Manufacturer and supplier roles are predicate-only in every module, so CQ-MF-01 has no GraphQL filter; D7 now publishes one predicate set (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL + exclusivity, MANUFACTURER_UNNAMED) that D1, D6 and D8 are asked to adopt. Facility has no owner; D5 still reads a stale HAS_INTEREST_IN seam; awards and investors need D13 to adopt D7's write rules (Award record vs AWARD Event, HOLDS_STAKE vs INVOLVES). The synthesizer must settle OQ-D7-05, -28, -29, -32, -33 and reject any field re-added to Organization.

Files: `02` questions · `03` patterns (conventions AS-OF, TRACE, OVERLAP, DISCLOSURE TIMING) · `04` SDL · `05`/`06` registers · `07-fixtures/` (sinclair unstructured-to-entity, ftc harm, bioage disconfirmation, attia D9 seam with disclosure timing and a tie dated by the author's archived disclosure list, niagen ownership/brand, elysium funding/award with Study → Award) · `09` decisions, measurements and the adversarial-review decisions · `10` seams (reconciled with sibling SDL) · `11` open questions (36).

# D2 — summary

Mechanisms and the biology of aging. Agent A3, fast-track run, 2026-10-08 (research → model → fixtures → check → adversarial review).

## What the domain is

D2 holds the vocabulary that mechanism claims resolve to: hallmarks, biological processes, curated pathway records and molecular functions (one `Mechanism` type with a `mechanismKind`), the genes and proteins that take part in them (`MolecularEntity`), and the conditions and outcome concepts they lead to (`Condition`, `Outcome`). A mechanism finding is never an edge. It is a kernel Assertion (compound or intervention → mechanism, with a predicate from a closed list and a kernel `basisKind`) that points at one `MechanismEvidenceContext`: organism, compartment, setting and arm (a registered group's dose comes from D3's InterventionComponent). That context is what the three audiences filter on when they ask "measured where, in what, at what dose, and was it null?". The only compound → mechanism edge is a read-only projection over those Assertions (`d2.affects-mechanism/v1`); mechanism → outcome links are Assertions read at query time. Reference hierarchy and participants are asserted edges, one authority Assertion per record and release. Species and anatomical context are **enums plus ontology ids, not nodes** (`ModelOrganism` + `ncbiTaxonId`; `CompartmentKind` + a UBERON/CL id), because no question traverses through them.

## Headline counts (`node scripts/packet-check.mjs D2`, ok: true)

| measure | D2 | budget |
| --- | ---: | ---: |
| node types | 5 | 8 |
| relationship types | 6 (3 structural, 2 asserted, 1 derived) | 14 |
| from→to pairs | 10 | 35 |
| widest union | 3 | 6 |
| questions (harm/risk/disconfirmation) | 34 (16) | 15–40 (≥ 1/3) |
| fixtures (real captured sources) | 5 | ≥ 3 |
| executable cost (print-schema, current kernel) | +110 KB, +64 input types, builds in ≤ 1 s | — |

No budget excess. No D2 edge needs a valid-time episode: time lives on the Assertion.

## Five highest-value questions

1. **Q-D2-03 (= D4 Q-D4-01)**: compound → mechanism → biomarker → orderable test, with a compartment check. This is one joint D2 ∪ D4 query pattern (03, Q-D2-03), and kernel + D2 + D4 compile together.
2. **CQ-MX-03**: has a step seen in mice or cells also been measured in humans, and with what direction, including nulls? This disconfirms transfer across species.
3. **Q-D2-04**: which downstream steps does a "proof" biomarker such as blood NAD+ actually track in humans, and which does it fail to track? (Fixture: NR raises the muscle NAD+ metabolome, while acetylation and respiration show no change.)
4. **Q-D2-16**: which mechanism claims in a product's marketing have no measured human Assertion behind them?
5. **Q-D2-09**: does agent X blunt a beneficial adaptation through a mechanism, and in whom was that measured? (Fixture: metformin abrogates the exercise-induced rise in mitochondrial respiration.)

## Three biggest cuts

1. Species, AnatomicalContext and Organ become enums plus ontology ids. This removes 3 node types and 9 pinned relationship families.
2. 14 pinned compound → mechanism/target edge families (AFFECTS_MECHANISM from 8 source types, MODULATES from 6) become one derived, read-only `AFFECTS_MECHANISM` with 2 pairs.
3. Pathway, Hallmark and RiskFactor become kinds of Mechanism or Condition. HAS_MECHANISM, INCREASES_RISK_FOR, MEDIATES_RISK_THROUGH, AFFECTS_ORGAN and (adversarial review) INFLUENCES_OUTCOME become `Assertion.predicate` values (17 registered predicates, each with the question that would promote it).

The pinned W03 fragment had 10 node types and 28 relationship types. D2 keeps 5 and 6.

## Three biggest risks

1. **Projection semantics.** The sign propagation through `participantRole` is a heuristic. The fixtures show NR → Nicotinate metabolism MIXED (NAAD rose, NAD+ did not) and AET → mitochondrial respiration MIXED (SUIT1 trend, ADP-titration increase) under v1 (11 item 21). Mitigations: the method is versioned, `viaParticipant` is exposed, and the projection is regenerable.
2. **Conflicts with K and D10.** `MechanismProjectionProperties` extends `DerivedEdgeProperties`, which K's M11 base list does not name, and D10 says its Association replaces AFFECTS_MECHANISM; D2 asks K to add the base and D10 to drop that half (11 item 1). D3 must add three enum values D2 now borrows (item 30). D5 restored D2.Outcome in TargetMeasure (item 27, closed).
3. **Mechanism resolution of marketing text.** Phrases such as "activates longevity genes" are hard to map to a curated Mechanism. A kernel RESOLUTION Assessment must license each binding. Unresolved claims keep their text and get no object.

## Open for the owner

The full list is in `11-open-questions.md`. These need the owner:

- KEGG licence (item 11).
- Whether the BellLabs hallmark mapping is a published artifact (item 12).
- Projection v1 roll-up rules (item 21).
- The AFFECTS_MECHANISM / DerivedEdgeProperties ruling with K and D10 (item 1).
- Intent v1 gaps for predicate-only Assertions and contexts (item 25).

Research is not medical advice.

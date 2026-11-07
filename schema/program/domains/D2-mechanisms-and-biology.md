# D2 — Mechanisms and the biology of aging

Lens: science. Current fragment: W03 Biology and mechanisms (10 node types: MechanismEvidenceContext, Mechanism, Pathway, MolecularEntity, Species, AnatomicalContext, Organ, Outcome, Condition, RiskFactor).

## Scope

Why a compound might work: mechanisms, pathways, molecular targets, the hallmarks of aging as an organizing frame, species and tissue context, measured versus inferred mechanism steps, and the outcomes and conditions mechanisms plausibly influence. Narrowed deliberately to longevity and healthspan biology (NAD+ metabolism, mTOR/AMPK, senescence, autophagy, mitochondrial function, inflammation, epigenetic regulation) with attachment points for the rest. Out of scope: clinical results (D3), biomarker measurement (D4), disease ontology beyond what the questions need.

## Ecosystem to survey

Who produces mechanism knowledge and how it is published: curated pathway databases (Reactome, KEGG, WikiPathways, GO), target databases (Open Targets, UniProt, ChEMBL, DrugBank), aging-specific resources (GenAge/HAGR, Aging Atlas, Open Genes, the hallmarks literature), preprint and review culture, how longevity companies and podcasts talk about mechanisms (the gap between measured in vitro and claimed in humans), how mechanism claims travel into marketing.

## Seed questions

- Through which mechanisms is this compound claimed to act, and in which species, tissue and model was each step measured versus inferred (round 0003 rule)?
- Which compounds act on this pathway or hallmark, with what direction of effect and what level of evidence?
- Which outcomes and conditions does this mechanism influence, and is that a curated projection or source-asserted?
- Where do two sources disagree on mechanism, and which has the measured step?
- Which mechanisms have human evidence at all (join with D3)?
- What is the shortest mechanistic path from a compound to a biomarker users can measure (join with D4)?

## Retrieval patterns to consider

Mechanism chains with per-step evidence context; derived `AFFECTS_MECHANISM` and `INFLUENCES_OUTCOME` projections in rule mode with a method version; GDS: community detection over pathway co-membership, PageRank of mechanisms by evidence support, link prediction for compound–pathway candidates (as suggestions, never assertions); vector search over mechanism descriptions.

## Sources and tools to score (with D11)

Reactome API, KEGG REST (license), WikiPathways, UniProt REST, Open Targets GraphQL, ChEMBL, GO, HAGR/GenAge, Europe PMC annotations, PubMed MeSH, bioRxiv.

## Known problems and open questions

`MechanismChain` node deferred; `Association` was retired in the proposal and must be re-decided under PLAN 6.1 (materialized projection); the boundary between Outcome/Condition here and OutcomeDefinition in D3; whether Species and AnatomicalContext deserve nodes or enum properties for the questions actually asked.

## Deliverables

`../packets/D2/` per PLAN 5.1, including the derived-projection method spec for mechanism edges.

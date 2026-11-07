# D10 — Derived knowledge: associations, insights, reports, recommendations

Lens: AI. Current coverage: W10 in part (EvidenceSynthesis, EvidenceStrengthAssessment), W23 (AnswerRecord, PolicyVersion, DecisionCriterion), the derived-edge registry (ABOUT, MENTIONS_ENTITY, RECOMMENDS, AFFECTS_MECHANISM, INFLUENCES_OUTCOME, SUPPORTED_BY_CHUNK and others), and the retired `Association` type.

## Scope

Everything the system produces rather than captures: associations computed over the graph, insights an analyst or agent asserts, reports and recommendations published to users, answer records with their traces; the Agentic Graph RAG surface users will query. The work is to decide, question by question, which of the four kinds in PLAN 6.1 each answer is, how it is stored (if at all), how it is read with its trace, and how it is kept fresh. Out of scope: the user model and personalization inputs (a dedicated User API later), the private store.

## Ecosystem to survey

How comparable products do this today: Examine.com (graded summaries), Consensus and Elicit (evidence answers with citations), Perplexity-style answer traces, Open Targets (association scores with an evidence breakdown), DrugBank and Natural Medicines interaction reports, Labdoor and ConsumerLab rankings, Epistemonikos; GraphRAG practice (Microsoft GraphRAG communities and summaries, Neo4j GraphRAG patterns, text-to-Cypher over schema subsets, hybrid vector plus graph retrieval); GDS use in knowledge graphs (node similarity, community detection, PageRank, link prediction, pathfinding); report generation with verifiable citations.

## Seed questions

- For each high-value question from D1–D9: is the answer retrieved, materialized, an assessment, or a published artifact; what is its trace; how stale may it be?
- What is the association between compound X and outcome Y, broken down by evidence kind, with the method version and input set that produced the score?
- What are the top insights about X an analyst has asserted, with their inputs and supersessions?
- Give me a report on X: what skeleton must the graph hold so every sentence traces to assertions, assessments and locators under a policy version?
- What does the system recommend for a user context Z, and which use constraints (D5) and policy criteria shaped it?
- What changed since my last report (as-of diff over assertions and assessments)?
- Which communities or clusters exist in the evidence graph around X (GDS), and are they an answer or only a retrieval aid?

## Retrieval patterns to consider

Answer composition over subgraph slices; as-of and diff queries (QS-2); the public and private boundary (QS-6); unknown versus absent (QS-7); GDS projections per question with a refresh cadence; vector indexes over which node texts; text-to-Cypher against a domain slice rather than the whole schema (the slim schema is what makes this feasible).

## Sources and tools to score (with D11)

Neo4j GDS (edition), Neo4j vector indexes, the graphql-api and executor surfaces of this repo, GraphRAG libraries, LLM judges for answer faithfulness (the verification.v1 semantic stage), the eval harness `evals/baseline-comparison`.

## Known problems and open questions

`RECOMMENDS` derived-only; `AnswerRecord` scope (published answers only) and ad hoc answer logs; `Mention`, `AnswerRecord` and `UseContextProfile` flagged as possibly never used; whether Report and Insight are new node types or profiles of EvidenceAssessment and AnswerRecord; the Entity Snapshot as a frozen state citing assertions.

## Deliverables

`../packets/D10/` per PLAN 5.1, plus the answer-kind decision table covering every question id from the D1–D9 packets, and three worked report skeletons (compound profile, product comparison, protocol review).

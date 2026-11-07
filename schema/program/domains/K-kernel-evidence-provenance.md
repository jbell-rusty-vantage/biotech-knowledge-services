# K — Kernel: evidence, identity and time (a contract, not a research domain)

## Scope

The parts every domain depends on and nobody owns alone: the Entity archetype and uid identity; bitemporal time (valid time declared, recorded time service-assigned); `Source` → `SourceSnapshot` → `SourceLocator` → `Assertion` → `Adjudication`; `Activity`/`Agent` lineage; `Identifier` and resolution (`ResolutionHypothesis`, `EquivalenceAssessment`, `Mention`); the published-answer skeleton (`AnswerRecord`, `PolicyVersion`). Out of scope: any domain concept; the private store; user accounts.

## What exists today

Fragments W00 (13 node types), W19 (3), W20 (4), W23 (3). The kernel rules the executor already enforces: every asserted edge is authorized by one Assertion citing a SourceLocator; derived projections are read-only; nothing is deleted; uids are `hu:<token>:<opaque>`; no private-personal data. The kernel is also the source of 67% of the executable growth (PLAN section 1): the any-entity unions on Assertion, Identifier, Chunk, Mention, MediaAsset and ResolutionHypothesis.

## Work in Wave 1

1. **Lever experiment matrix.** Small synthetic SDLs (kernel plus five domain types) implementing each R1 option (interface target with `nestedOperations: [CONNECT]` and `aggregate: false`; `@cypher` read fields only; a thin `Subjectable` interface), each R2/R3 setting, measured with `print-schema` and `scripts/schema-size.mjs`. Record in `../decisions/0001-size-levers.md` with the numbers.
2. **Verification correspondence.** Confirm or amend the table in PLAN 6.2 against the real contracts in `ai-engineer-knowledge-services/packages/contracts/src/verification/` (`AssertionSchema`, `SemanticVerdictSchema`, `PolicyOutcomeSchema`, the locator schemas) and the module's five ordered questions. Decide: `VerificationRun` node or digest-only; verdict to assertion-status mapping; what an Entity Snapshot cites; the Report skeleton's minimum citation set.
3. **Kernel module SDL** (`../packets/K/04-schema-proposal.graphql`) small enough to be read whole, with the R1 pattern chosen, and its own size report.
4. **Identifier scheme register** seeded from D11's first-tier scoring: which schemes exist, normalization rule, authority, bridges.

## Seed questions (existing CQ-EV, CQ-TM, CQ-PV, CQ-ID ids where they match)

- Which source span supports this assertion, who adjudicated it, with what verdict, under which policy version?
- What did we believe about X on date D, and what changed between D1 and D2 (belief time versus world time)?
- Which run wrote this node, with which agent, model and skill, and can the bundle be replayed?
- Is this handle the same person as that author, under which hypothesis and evidence?
- Which assertions became stale because their snapshot was corrected or retracted?
- Which entity states (snapshots) were built from which assertions, and are any inputs now superseded?
- Which Mission Control mission produced this node, edge, assertion or report; what did mission M produce in total; which missions touched entity X; what depends on mission M's outputs (00-DIRECTIVE section 4)?
- Which mission tested this claim, with what verdict, and which report published it?

## Deliverables

`../packets/K/` per `../fast-track/01-PACKET-CONTRACT.md`; `../decisions/0001-size-levers.md`; the identifier scheme register.

# D5 — retrieval patterns

Model stage (Wave 2) by A5, 2026-10-08. One section per question in `02-questions.md` (34). Relationship and property names are the D5 SDL (`04-schema-proposal.graphql`) and the kernel published by A1 (`packets/K/04-schema-proposal.graphql`, `09-reasoning.md`): `(:Assertion)-[:HAS_SUBJECT|HAS_OBJECT|ASSERTED_BY]->(x)`, `(:Assertion|:Assessment|:Report)-[:HAS_EVIDENCE {role, origin}]->(:SourceLocator)`, `(:Source)-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(:SourceLocator)`, `(:Adjudication)-[:ASSESSES]->(:Assertion)`, `(:Assessment|:Report)-[:ASSESSES]->(x)`, `(:Assessment|:Report)-[:DERIVED_FROM]->(:Assertion|:Assessment)`, `(x)-[:WAS_GENERATED_BY]->(:Activity)`. Type names of other modules (D1 `ChemicalSubstance`, `IngredientMaterial`; D2 `Condition`; D3 `StudyArm`, `StudyResult`, `OutcomeDefinition`, `StudyPopulation`; D4 `Metric`, `Biomarker`; D6 `Product`; D7 `Person`, `Organization`; D9 `Chunk`; D12 `FoodItem`) are from their research notes; the check stage (2026-10-08) verified them against the sibling SDLs and added D2 `Outcome` and D3 `InterventionComponent`, `RESULT_FOR`, `MEASURES`, `HAS_COMPONENT`, `ADMINISTERS`.

Adversarial review (A5, 2026-10-08, late): Q-D5-13 rewritten to D7's real interest edges (`HOLDS_ROLE | HOLDS_STAKE | RECEIVES_VALUE_FROM`, D7 SDL; `HAS_INTEREST_IN` never existed in D7) and D6's product–organization paths (`BRANDED_AS` → `Brand` ← `OWNS_BRAND`; `HAS_VARIANT` → `HAS_PACKAGE` ← `LISTING_FOR` – `HAS_OFFER` → `SELLER_OF_RECORD`); CQ-RC-06 rewritten to D10's `ReportItem -BLOCKED_BY-> Assertion` (no `blockingConstraintUids`); Q-D5-14 gained the kernel claim branch (Claim → evidence mission → EVIDENCE_REPORT); Q-D5-01's study branch is a real UNION branch; Q-D5-08 / Q-D5-22 read the kernel slots `conclusionCode`, `gradeScheme`, `grade` (vocabulary registered in 09 "Registered assessment vocabulary"); Cypher bugs fixed in Q-D5-04 (disjunction parenthesised), Q-D5-23 (Q-D5-06's comparability predicate) and Q-D5-01 (EPISODE-AT on the protocol branch); Q-D5-20 joins effect Conditions to the target's measures by shared kernel Identifier instead of name substrings. STATES_CONSTRAINT is now derived (projection use-constraint-key/v2) and STEP_USES targets the kernel interface `Subjectable`; patterns that traverse them are unchanged.

Close-out pattern lint (A5, 2026-10-09): CQ-RC-06 follows D10's SDL (`ReportItem -BLOCKED_BY-> UseConstraint`, resolving Assertions cited with DERIVED_FROM; supersedes OQ-D5-39); Q-D5-13 reads an interest episode's observation date from the authorizing Assertion's `validObservedAt` (D7 removed `observedAt` from its edge properties). Blocks that use names later renamed by synthesis rulings (R-80 `PROTOCOL_AUTHORED_BY`, R-42 Identifier join) are left as packet SDL; S writes the final-SDL versions.

## Conventions used by every pattern

```cypher
// AS-OF (recorded time) on any record r with recordedAt / recordedTo (Assertion, Assessment, Adjudication, Report):
//   r.recordedAt <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf)
// VALID-AT (optional valid-time point; half-open; null bound = unknown, kept and flagged, never read as 'ongoing'):
//   ($validAt IS NULL OR ((r.validFrom IS NULL OR r.validFrom <= $validAt) AND (r.validTo IS NULL OR r.validTo > $validAt)))
// EPISODE-AT on the one D5 episode edge (HAS_EDITION, StateEpisodeProperties):
//   he.recordedFrom <= $asOf AND (he.recordedTo IS NULL OR he.recordedTo > $asOf) AND VALID-AT(he)
// STATUS: a.status IN ['ACCEPTED','DISPUTED'] by default; PROPOSED rows are returned only with $includeHeld, flagged.
// POPULATION (mandatory qualifier on D5 predicates): [q IN a.qualifiers WHERE q STARTS WITH 'population:'] ;
//   a population filter $pop matches 'population:'+$pop OR 'population:UNSPECIFIED' (returned as UNSPECIFIED, never 'everyone').
// TARGET SET: MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey  (2-level hierarchy is a property)
// TRACE(a) — the provenance every answer row carries (directive 3.8 / 3.10):
MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a) WHERE adj.recordedAt <= $asOf AND (adj.recordedTo IS NULL OR adj.recordedTo > $asOf)
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
// returns: a.uid, a.predicate, a.valueString, a.qualifiers, who.uid, ev.role, loc.uid, loc.exact, snap.contentHash,
//          snap.retrievedAt, src.canonicalUri, adj.verdict, act.missionId, act.runId
// STEP-TRACE(s) — a protocol step's own span: MATCH (loc:SourceLocator {uid: s.locatorUid})<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
//   plus the authorizing Assertion of the HAS_EDITION episode: MATCH (ha:Assertion {uid: he.assertionUid}) + TRACE(ha)
```

Indexes the patterns rely on: range `:Target(key)` unique, `:Target(parentKey)`; fulltext `TargetSearch` on `:Target(label, synonyms, definition)`; range `:ProtocolStep(stepKey)`, `:ProtocolStep(payloadHash)`, `:ProtocolEdition(payloadHash)`, `:UseConstraint(identityKeyHash)` unique, `:UseConstraint(constraintKind)`; uid range indexes on every label (kernel); kernel indexes on `:Assertion(predicate, recordedAt)` and relationship-property indexes on `assertionUid` / `lastWriterRunId`; D9 vector index on chunk embeddings.

Only one D5 edge needs a bitemporal episode: **HAS_EDITION** (which edition was current when). Every other D5 edge is recorded-only; time on harm, target and constraint statements lives on the kernel Assertion (valid + recorded), which is the authority.

## Q-D5-01

- kind: cypher (assertion branch + protocol branch + study branch), entry by fulltext for goal phrases
- pattern:

```cypher
// entity-link the user's goal phrase (optional): CALL db.index.fulltext.queryNodes('TargetSearch', $phrase) YIELD node AS t0
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
// (1) assertion branch: what helps T (benefit); Q-D5-02 swaps the direction list
MATCH (a:Assertion)-[:HAS_OBJECT]->(t)
WHERE a.predicate IN ['IMPROVES_TARGET'] AND a.status IN ['ACCEPTED','DISPUTED']
  AND a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
  AND ($validAt IS NULL OR ((a.validFrom IS NULL OR a.validFrom <= $validAt) AND (a.validTo IS NULL OR a.validTo > $validAt)))
MATCH (a)-[:HAS_SUBJECT]->(means)
WITH t, a, means, [q IN a.qualifiers WHERE q STARTS WITH 'population:'] AS forWhom
WHERE $pop IS NULL OR any(q IN forWhom WHERE q IN ['population:' + $pop, 'population:UNSPECIFIED'])
MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
// weighed conclusions about the same means and target (kernel Assessment, effectDirection)
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(means), (ass)-[:ASSESSES]->(t)
  WHERE ass.recordedAt <= $asOf AND (ass.recordedTo IS NULL OR ass.recordedTo > $asOf)
RETURN t.key, labels(means)[0] AS meansType, means.uid, means.name, a.predicate AS predicate, a.basisKind AS basisKind, forWhom,
       who.uid AS asserter, collect(DISTINCT {loc: loc.uid, exact: loc.exact, snapshot: snap.contentHash}) AS evidence,
       collect(DISTINCT adj.verdict) AS verdicts,
       collect(DISTINCT {assessment: ass.uid, effectDirection: ass.effectDirection, method: ass.methodVersion}) AS assessments,
       act.missionId AS missionId, act.runId AS runId   // UNION branches share these column names (review-stage fix)
UNION
// (2) protocol branch: steps whose captured purpose is T (stated purpose, never an effect claim; labelled INTENDED)
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
MATCH (p:Protocol)-[he:HAS_EDITION]->(e:ProtocolEdition)-[:HAS_STEP]->(s:ProtocolStep)-[:STEP_USES]->(means)
WHERE t.key IN s.targetKeys
  // EPISODE-AT: the edition current at $asOf (recorded) and at $validAt (valid), half-open
  AND he.recordedFrom <= $asOf AND (he.recordedTo IS NULL OR he.recordedTo > $asOf)
  AND ($validAt IS NULL OR ((he.validFrom IS NULL OR he.validFrom <= $validAt) AND (he.validTo IS NULL OR he.validTo > $validAt)))
MATCH (loc:SourceLocator {uid: s.locatorUid})<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN t.key, labels(means)[0] AS meansType, means.uid, means.name, 'STEP_STATES_PURPOSE' AS predicate, null AS basisKind,
       s.appliesToPopulations AS forWhom, p.uid AS asserter,
       [{loc: loc.uid, exact: loc.exact, snapshot: snap.contentHash}] AS evidence, [] AS verdicts, [] AS assessments,
       null AS missionId, he.lastWriterRunId AS runId
UNION
// (3) study branch: results measured on the target's operationalizing measures (D3 SDL names; labelled
// STUDY_RESULT_ON_MEASURE: a result row with its direction, never a 'helps' verdict from one result; D3 Q-D3-04 and
// D4 Q-D4-17 traverse the same OPERATIONALIZED_BY edge from their side)
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
MATCH (t)-[:OPERATIONALIZED_BY]->(measure)<-[:MEASURES]-(od:OutcomeDefinition)<-[:RESULT_FOR]-(r:StudyResult)
MATCH (r)-[:RESULT_FOR_ARM]->(arm:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)-[:ADMINISTERS]->(means)
OPTIONAL MATCH (r)-[:STATED_IN]->(rec)
OPTIONAL MATCH (ra:Assessment)-[:ASSESSES]->(r)
  WHERE ra.recordedAt <= $asOf AND (ra.recordedTo IS NULL OR ra.recordedTo > $asOf)
RETURN t.key, labels(means)[0] AS meansType, means.uid, means.name, 'STUDY_RESULT_ON_MEASURE' AS predicate,
       'DIRECT_MEASUREMENT' AS basisKind, [arm.uid] AS forWhom, rec.uid AS asserter,
       [{measure: measure.uid, outcomeDefinition: od.uid, result: r.uid, direction: r.direction,
         statisticalConclusion: r.statisticalConclusion}] AS evidence, [] AS verdicts,
       collect(DISTINCT {assessment: ra.uid, effectDirection: ra.effectDirection, method: ra.methodVersion}) AS assessments,
       null AS missionId, r.lastWriterRunId AS runId
// + D3 TRACE: the result's STATED_IN record (registration version or publication) carries the locators
```

- trace: every assertion row carries assertion uid → HAS_EVIDENCE locator (exact quote) → snapshot contentHash → Adjudication verdict → Activity (missionId, runId); protocol rows carry the step's own locator (`locatorUid`) and the run that attached the edition. The verifier re-selects the same locator (directive 3.8 effectiveness test, fixture `sleep-toolkit-unstructured`).
- unstructured entry (directive 3.8): `CYPHER 25 MATCH (c:Chunk) SEARCH c IN (VECTOR INDEX <D9 chunk index> FOR $qEmbedding LIMIT 20) SCORE AS score MATCH (c)-[:MENTIONS]->(x) WHERE x:Target OR x:ProtocolStep OR x:Intervention ...` then the same pattern seeded by `x`; MENTIONS is derived and only finds candidates, the answer rows come from assertions and their locators.
- bitemporal episode needed on: HAS_EDITION (protocol branch, which edition was current at $asOf / $validAt); none elsewhere (the Assertion carries valid and recorded time; D3 results carry their own revision time).

## Q-D5-02

- kind: cypher
- pattern:

```cypher
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
MATCH (a:Assertion)-[:HAS_OBJECT]->(t)
WHERE a.predicate IN ['WORSENS_TARGET','MIXED_EFFECT_ON_TARGET'] AND a.status IN ['ACCEPTED','DISPUTED']
  AND a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
MATCH (a)-[:HAS_SUBJECT]->(means)
// co-intervention named on the assertion (qualifier coExposure:<uid>) — e.g. vitamin C+E × endurance training
WITH t, a, means, [q IN a.qualifiers WHERE q STARTS WITH 'coExposure:' | substring(q, 11)] AS coUids,
     [q IN a.qualifiers WHERE q STARTS WITH 'population:' OR q STARTS WITH 'dose:' OR q STARTS WITH 'outcome:'] AS scope
OPTIONAL MATCH (co) WHERE co.uid IN coUids
// interaction constraints on the same means that name an effect antagonism (resolved identity)
OPTIONAL MATCH (a2:Assertion {predicate: 'INTERACTS_WITH'})-[:HAS_SUBJECT]->(means),
               (a2)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint {constraintKind: 'INTERACTION'})
  WHERE a2.recordedTo IS NULL
// + TRACE(a)
RETURN t.key, means.uid, means.name, a.predicate, scope, collect(DISTINCT co.name) AS coInterventions,
       collect(DISTINCT uc.uid) AS interactionConstraints, a.uid AS assertionUid
```

- trace: TRACE(a) per row (locator exact quote of the paper's result sentence, snapshot hash, adjudication, run); per-outcome direction is kept because each outcome is its own assertion (`outcome:` qualifier), so MIXED never hides which measure moved.
- bitemporal episode needed on: none (Assertion valid/recorded time).

## Q-D5-03

- kind: cypher
- pattern:

```cypher
// means that are FOR target T (assertion branch or protocol branch), then constraints that apply to population P
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
CALL (t) {
  MATCH (ai:Assertion)-[:HAS_OBJECT]->(t) WHERE ai.predicate IN ['INTENDED_FOR_TARGET','IMPROVES_TARGET'] AND ai.recordedTo IS NULL
  MATCH (ai)-[:HAS_SUBJECT]->(m) RETURN m
  UNION
  MATCH (s:ProtocolStep)-[:STEP_USES]->(m) WHERE t.key IN s.targetKeys RETURN m
}
MATCH (a:Assertion)-[:HAS_SUBJECT]->(m)
WHERE a.predicate IN ['USE_CONSTRAINED_IN','INTERACTS_WITH','HAS_UPPER_LIMIT']
  AND a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
MATCH (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
WHERE $pop IN uc.scopePopulations
   OR EXISTS { MATCH (a)-[:HAS_OBJECT]->(c:Condition) WHERE c.uid IN $conditionUids }
   OR EXISTS { MATCH (a)-[:HAS_OBJECT]->(x) WHERE x.uid IN $coExposureUids }
// protocols for T that state the same constraint themselves (STATES_CONSTRAINT; the 'stated' half of Q-D5-11)
OPTIONAL MATCH (ps:ProtocolStep)-[:STATES_CONSTRAINT]->(uc)
// + TRACE(a)
RETURN m.uid, m.name, uc.uid, uc.constraintKind, a.valueString AS level, a.proposition AS levelVerbatim,
       [q IN a.qualifiers WHERE q STARTS WITH 'population:' OR q STARTS WITH 'section:'] AS scope, a.uid,
       collect(DISTINCT ps.uid) AS statedByProtocolSteps
ORDER BY m.name, level
```

- trace: TRACE(a) (label section or monograph caution, verbatim directive in `proposition`, locator, snapshot, adjudication). Empty result = "no constraint recorded", never "safe".
- bitemporal episode needed on: none.

## CQ-RC-06

- kind: cypher (published answer composed by D10; D5 supplies the blocking statements and their shared identity)
- pattern:

```cypher
// (a) before publishing: the statements that block or qualify recommending means $m to context profile $ctx
MATCH (uc:UseConstraint)<-[:RESOLVES_TO_CONSTRAINT]-(a:Assertion)-[:HAS_SUBJECT]->(m {uid: $m})
WHERE a.recordedTo IS NULL AND a.status IN ['ACCEPTED','DISPUTED']
  AND (any(p IN uc.scopePopulations WHERE p IN $ctx.populations)
       OR EXISTS { MATCH (a)-[:HAS_OBJECT]->(o) WHERE o.uid IN $ctx.conditionUids + $ctx.coExposureUids })
WITH uc, collect(a) AS stmts
RETURN uc.uid AS constraintUid, uc.constraintKind,
       [s IN stmts WHERE s.valueString IN $policy.blockingLevels | s.uid] AS blockingAssertionUids,  // D10 policy decides which levels block
       [s IN stmts | s.uid] AS allAssertionUids
// D10 writes (D10 SDL): Report {reportKind: 'RECOMMENDATION', policyVersion} -HAS_ITEM-> ReportItem {disposition: 'BLOCKED', rank: null}
//   ReportItem -BLOCKED_BY-> each blocking UseConstraint (the shared identity of the contraindication / interaction / limit;
//     D10 SDL ReportItem.blockedBy) or, when no use constraint states the concern, the blocking Assessment (blockedByAssessments)
//   ReportItem -ASSESSES-> the option (means)
//   ReportItem -DERIVED_FROM-> the resolving Assertions (citesAssertions); Report -HAS_EVIDENCE-> their locators
// (b) after publishing: why was option $m blocked, through which shared constraint and which resolving statements
MATCH (i:ReportItem {disposition: 'BLOCKED'})-[:ASSESSES]->(m {uid: $m})
MATCH (i)-[:BLOCKED_BY]->(uc:UseConstraint)
OPTIONAL MATCH (i)-[:DERIVED_FROM]->(b:Assertion)-[:RESOLVES_TO_CONSTRAINT]->(uc)
RETURN i.uid, uc.uid AS constraintUid, uc.identityKey, b.uid, b.predicate, b.valueString AS level
```

- trace: the published item points at the blocking UseConstraint (BLOCKED_BY, D10 SDL; D10's adversarial review retargeted BLOCKED_BY from Assertion to UseConstraint, superseding OQ-D5-39) and cites the resolving Assertions (DERIVED_FROM, then HAS_EVIDENCE to the locators); each cited Assertion RESOLVES_TO_CONSTRAINT that UseConstraint. The blocking rule (which levels block) is a D10 policy version, not a D5 property; D5 stores no `blockingConstraintUids`.
- bitemporal episode needed on: none.

## Q-D5-04

- kind: cypher
- pattern:

```cypher
MATCH (x {uid: $x}), (y {uid: $y})
MATCH (a:Assertion {predicate: 'INTERACTS_WITH'})
WHERE (((a)-[:HAS_SUBJECT]->(x) AND (a)-[:HAS_OBJECT]->(y)) OR ((a)-[:HAS_SUBJECT]->(y) AND (a)-[:HAS_OBJECT]->(x)))
  AND a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
MATCH (a)-[:HAS_SUBJECT]->(victim), (a)-[:HAS_OBJECT]->(perp)
OPTIONAL MATCH (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
// + TRACE(a)
RETURN uc.uid, [q IN a.qualifiers WHERE q STARTS WITH 'exposureChange:'] AS exposureChange, victim.name AS affected, perp.name AS coExposure, a.valueString AS level,
       [q IN a.qualifiers WHERE q STARTS WITH 'mechanism:' OR q STARTS WITH 'exposureChange:' OR q STARTS WITH 'window:'] AS detail,
       a.proposition AS management, who.uid AS asserter, loc.exact, snap.contentHash
```

- trace: TRACE(a) per asserter (label section 7, NCCIH page, clinic page), so one pair shows every source side by side; the direction of exposure change is each asserter's (qualifier), never a property of the shared constraint.
- bitemporal episode needed on: none.

## Q-D5-05

- kind: cypher
- pattern:

```cypher
// disagreement about one concern = one UseConstraint, several asserters, different levels or stances
MATCH (uc:UseConstraint)<-[:RESOLVES_TO_CONSTRAINT]-(a:Assertion)
WHERE ($ucUid IS NULL OR uc.uid = $ucUid) AND a.recordedTo IS NULL
MATCH (a)-[:ASSERTED_BY]->(who)
MATCH (a)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
WITH uc, collect({asserter: who.uid, level: a.valueString, speechAct: a.speechAct, basis: a.basisKind,
                  stance: [q IN a.qualifiers WHERE q STARTS WITH 'stance:'], exact: loc.exact, source: src.canonicalUri,
                  assertion: a.uid}) AS rows
WHERE size(apoc.coll.toSet([r IN rows | r.level])) > 1 OR any(r IN rows WHERE 'stance:DELIBERATE_USE' IN r.stance)
RETURN uc.uid, uc.identityKey, rows
```

- trace: every row has its own locator and snapshot; the source-authority view comes from kernel Assessments of kind SOURCE_AUTHORITY about each Source (D9), never from a property on the constraint. (`apoc.coll.toSet` optional; plain Cypher `size(collect(DISTINCT a.valueString))` works.)
- bitemporal episode needed on: none.

## Q-D5-06

- kind: cypher (query-time comparison; nothing stored unless published)
- pattern:

```cypher
MATCH (p:Protocol)-[he:HAS_EDITION]->(e:ProtocolEdition)-[:HAS_STEP]->(s:ProtocolStep)-[:STEP_USES]->(m)
WHERE ($editionUid IS NULL OR e.uid = $editionUid)
  AND he.recordedFrom <= $asOf AND (he.recordedTo IS NULL OR he.recordedTo > $asOf)
  AND s.doseMax IS NOT NULL
MATCH (a:Assertion {predicate: 'HAS_UPPER_LIMIT'})-[:HAS_SUBJECT]->(m)
WHERE a.recordedTo IS NULL
MATCH (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint {constraintKind: 'DOSE_LIMIT'})
WITH p, e, s, m, a, uc,
     (uc.doseUnit = s.doseUnit AND uc.dosePeriod = s.dosePeriod
      AND (uc.intakeScope = s.intakeScope OR uc.intakeScope = 'TOTAL_INTAKE')) AS comparable,
     (size(uc.scopePopulations) = 0 OR any(x IN s.appliesToPopulations WHERE x IN uc.scopePopulations)) AS popMatch
RETURN e.uid, s.stepKey, m.name, s.doseMin, s.doseMax, s.doseUnit, s.appliesToPopulations,
       uc.doseValue AS limit, uc.doseUnit, uc.intakeScope, uc.scopePopulations,
       CASE WHEN NOT comparable OR NOT popMatch THEN 'NOT_COMPARABLE'
            WHEN s.doseMax > uc.doseValue THEN 'ABOVE' ELSE 'WITHIN' END AS verdict,
       CASE WHEN NOT comparable THEN 'unit, period or intake scope differ' WHEN NOT popMatch THEN 'population differs' END AS reason,
       s.locatorUid AS stepLocator, a.uid AS limitAssertion
// + STEP-TRACE(s) and TRACE(a)
```

- trace: both locators (the protocol step span and the UL table row), both snapshots; the verdict is computed per query and becomes a fact only inside a published Report (D10) that cites both assertions.
- bitemporal episode needed on: HAS_EDITION (which edition's step at $asOf); the UL assertion carries its own valid time (fact-sheet revision dates).

## Q-D5-07

- kind: cypher
- pattern:

```cypher
MATCH (a:Assertion {predicate: 'CAUSES_ADVERSE_EFFECT'})-[:HAS_SUBJECT]->(x {uid: $x})
WHERE a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
MATCH (a)-[:HAS_OBJECT]->(effect:Condition)
WITH a, effect, [q IN a.qualifiers WHERE q STARTS WITH 'dose:' OR q STARTS WITH 'schedule:' OR q STARTS WITH 'route:'] AS ctx,
     [q IN a.qualifiers WHERE q STARTS WITH 'sourceKind:'] AS sourceKind, [q IN a.qualifiers WHERE q STARTS WITH 'severity:'] AS severity
// + TRACE(a)
RETURN effect.name, effect.uid, ctx, sourceKind, severity, a.valueString AS frequency, who.uid AS asserter, loc.exact, snap.contentHash
ORDER BY effect.name, sourceKind
```

- trace: TRACE(a); spontaneous-report counts appear only as inputs of a SAFETY_SIGNAL assessment (Q-D5-08), never as an effect row's strength.
- bitemporal episode needed on: none.

## Q-D5-08

- kind: cypher (assessment lookup)
- pattern:

```cypher
MATCH (sig:Assessment {assessmentKind: 'SAFETY_SIGNAL', assessmentSubkind: 'D5.safety-signal'})-[:ASSESSES]->(x {uid: $x})
MATCH (sig)-[:ASSESSES]->(effect:Condition {uid: $effectUid})
WHERE sig.recordedAt <= $asOf AND (sig.recordedTo IS NULL OR sig.recordedTo > $asOf)
  AND ($signalStatus IS NULL OR sig.conclusionCode = $signalStatus)
OPTIONAL MATCH (sig)-[:DERIVED_FROM]->(inp:Assertion)-[:HAS_EVIDENCE]->(loc:SourceLocator)
OPTIONAL MATCH (sig)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN sig.uid, sig.conclusionCode AS signalStatus, sig.gradeScheme AS severityScheme, sig.grade AS severity, sig.certainty,
       sig.effectDirection, sig.methodVersion, sig.evidenceCutoffAt, sig.summary,
       [f IN sig.facets WHERE f STARTS WITH 'coExposure='] AS coExposure,
       collect(DISTINCT {input: inp.uid, predicate: inp.predicate, exact: loc.exact}) AS inputs, act.runId
```

- trace: the assessment's DERIVED_FROM inputs (results, case reports, surveillance counts as METRIC assertions) each with locators. Signal status is the kernel slot `conclusionCode` (vocabulary for `D5.safety-signal` registered in 09: POTENTIAL, UNDER_EVALUATION, CONFIRMED_ASSOCIATION, CLOSED_NO_ACTION, NOT_SUPPORTED, INSUFFICIENT_DATA); severity is `gradeScheme` + `grade` (CTCAE_V5, CTCAE_V6, LABEL_TEXT, SOURCE_TEXT), as the kernel mapped OQ-D5-04 (K 09 M9).
- bitemporal episode needed on: none (Assessment recorded time; supersession by `supersedesUid`).

## Q-D5-09

- kind: cypher
- pattern:

```cypher
MATCH (x {uid: $x})
CALL (x) {
  MATCH (a:Assertion {predicate: 'HAS_UPPER_LIMIT'})-[:HAS_SUBJECT]->(x) WHERE a.recordedTo IS NULL
  OPTIONAL MATCH (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
  RETURN 'LIMIT' AS kind, a, uc.scopePopulations AS pops, a.valueNumber AS value, a.unitCode AS unit
  UNION
  MATCH (a:Assertion {predicate: 'CAUSES_ADVERSE_EFFECT'})-[:HAS_SUBJECT]->(x)
  WHERE a.recordedTo IS NULL AND any(q IN a.qualifiers WHERE q IN ['context:OVERDOSE','context:ACCIDENTAL_INGESTION'])
  RETURN 'OVERDOSE_EFFECT' AS kind, a, null AS pops, a.valueNumber AS value, a.unitCode AS unit
  UNION
  MATCH (s:Assessment {assessmentKind: 'SAFETY_SIGNAL'})-[:ASSESSES]->(x)
  WHERE s.assessmentSubkind = 'D5.surveillance-trend' AND s.recordedTo IS NULL
  MATCH (s)-[:DERIVED_FROM]->(a:Assertion)
  RETURN 'SURVEILLANCE' AS kind, a, null AS pops, a.valueNumber AS value, a.unitCode AS unit
}
// + TRACE(a)
RETURN kind, value, unit, pops, a.qualifiers, a.proposition, loc.exact, snap.contentHash
```

- trace: TRACE(a) per row (UL table row, label overdosage section, MMWR table); surveillance numbers are inputs of an assessment whose erratum supersession is visible (Q-D5-26).
- bitemporal episode needed on: none.

## Q-D5-10

- kind: cypher
- pattern:

```cypher
MATCH (p:Protocol {uid: $protocolUid})-[he:HAS_EDITION]->(e:ProtocolEdition)
WHERE ($editionUid IS NOT NULL AND e.uid = $editionUid)
   OR ($editionUid IS NULL AND he.recordedFrom <= $asOf AND (he.recordedTo IS NULL OR he.recordedTo > $asOf)
       AND ($validAt IS NULL OR ((he.validFrom IS NULL OR he.validFrom <= $validAt) AND (he.validTo IS NULL OR he.validTo > $validAt))))
MATCH (e)-[hs:HAS_STEP]->(s:ProtocolStep)
OPTIONAL MATCH (s)-[:STEP_USES]->(m)
OPTIONAL MATCH (loc:SourceLocator {uid: s.locatorUid})<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN e.uid, e.payloadHash, hs.orderIndex, s.stepKey, s.stepKind, s.sectionLabel, s.alternativeGroup, s.requirementLevel,
       labels(m)[0] AS meansType, m.name, s.doseMin, s.doseMax, s.doseUnit, s.dosePeriod,
       s.timeAnchor, s.offsetMinutesMin, s.offsetMinutesMax, s.occurrencesPerPeriodMin, s.occurrencesPerPeriodMax,
       s.occurrencePeriodUnit, s.targetKeys, s.speechAct, loc.exact, snap.contentHash
ORDER BY hs.orderIndex
```

- trace: per step its own locator on the edition's snapshot; the edition's attach Assertion (`he.assertionUid`) carries the adjudication and run. Dose ranges are returned as ranges (never midpoints).
- bitemporal episode needed on: HAS_EDITION (edition current at $asOf / $validAt).

## CQ-PR-01

- kind: cypher
- pattern:

```cypher
MATCH (p:Protocol {uid: $protocolUid})-[h1:HAS_EDITION]->(e1:ProtocolEdition {uid: $e1}),
      (p)-[h2:HAS_EDITION]->(e2:ProtocolEdition {uid: $e2})
OPTIONAL MATCH (e1)-[:HAS_STEP]->(s1:ProtocolStep)
WITH p, e1, e2, h1, h2, collect(s1) AS s1s
OPTIONAL MATCH (e2)-[:HAS_STEP]->(s2:ProtocolStep)
WITH p, e1, e2, h1, h2, s1s, collect(s2) AS s2s
WITH e1, e2, h1, h2, s1s, s2s, [s IN s1s | s.stepKey] AS k1, [s IN s2s | s.stepKey] AS k2
RETURN e1.payloadHash = e2.payloadHash AS identicalPayload,
       [s IN s2s WHERE NOT s.stepKey IN k1 | s.stepKey] AS added,
       [s IN s1s WHERE NOT s.stepKey IN k2 | s.stepKey] AS removed,
       [s IN s2s WHERE s.stepKey IN k1 AND NOT s.payloadHash IN [x IN s1s | x.payloadHash] | s.stepKey] AS modified,
       e2.changeProvenance, e1.firstObservedAt, e1.lastObservedAt, e2.firstObservedAt, e2.lastObservedAt,
       h1.validFrom, h1.validTo, h2.validFrom, h2.validTo,
       h1.assertionUid, h2.assertionUid   // -> TRACE: the two captures (snapshot hashes, retrievedAt)
// field-level before/after for 'modified' keys: compare the two steps' properties pairwise in the client
// unobserved interval: e1.lastObservedAt .. e2.firstObservedAt is reported as UNOBSERVED (Wayback gaps), never filled
```

- trace: each edition's attach Assertion → locators → its capture's snapshot hash and retrievedAt; sponsor changes (Huberman Thorne → Momentous) appear from D7 interest assertions over the same interval (Q-D5-13), not as an edition diff.
- bitemporal episode needed on: HAS_EDITION (edition intervals; exclusive per protocol).

## CQ-PR-02

- kind: cypher
- pattern:

```cypher
MATCH (e:ProtocolEdition {uid: $editionUid})-[hs:HAS_STEP]->(s:ProtocolStep)
OPTIONAL MATCH (s)-[:STATES_CONSTRAINT]->(uc:UseConstraint)
RETURN hs.orderIndex, s.stepKey, s.requirementLevel, s.requirementBasis, s.conditionText, s.appliesToPopulations,
       s.statedLevel, collect(DISTINCT uc.uid) AS statedConstraints, s.dependsOnStepKeys, s.speechAct,
       s.exactText, s.locatorUid
ORDER BY hs.orderIndex
```

- trace: STEP-TRACE(s) ("start with one supplement (or none!)" → requirementLevel OPTIONAL, requirementBasis STATED_BY_SOURCE).
- bitemporal episode needed on: none (edition immutable; pick the edition via HAS_EDITION as in Q-D5-10).

## Q-D5-11

- kind: cypher (anti-join)
- pattern:

```cypher
MATCH (e:ProtocolEdition {uid: $editionUid})-[:HAS_STEP]->(s:ProtocolStep)-[:STEP_USES]->(m)
OPTIONAL MATCH (s)-[:STATES_CONSTRAINT]->(stated:UseConstraint)
WITH e, s, m, collect(stated.uid) AS statedUids
// constraints recorded elsewhere for the same means that apply to the step's populations (or to everyone)
MATCH (a:Assertion)-[:HAS_SUBJECT]->(m)
WHERE a.predicate IN ['USE_CONSTRAINED_IN','INTERACTS_WITH','HAS_UPPER_LIMIT'] AND a.recordedTo IS NULL
MATCH (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
WHERE size(uc.scopePopulations) = 0 OR any(x IN coalesce(s.appliesToPopulations, ['UNSPECIFIED']) WHERE x IN uc.scopePopulations)
   OR uc.constraintKind IN ['CONDITION','INTERACTION']
// interaction partners that the same edition also prescribes are flagged first
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(partner)<-[:STEP_USES]-(:ProtocolStep)<-[:HAS_STEP]-(e)
RETURN s.stepKey, m.name, statedUids,
       collect(DISTINCT CASE WHEN uc.uid IN statedUids THEN null ELSE {uc: uc.uid, kind: uc.constraintKind,
               level: a.valueString, partnerInSameEdition: partner.name, assertion: a.uid} END) AS omitted
// + TRACE(a) for each omitted row; STEP-TRACE(s) for stated rows
```

- trace: stated cautions cite the protocol's own locator; omitted ones cite the external label / monograph / fact-sheet locators. STATES_CONSTRAINT is derived (projection use-constraint-key/v2 from the author's caution Assertions that cite the step locator), so the anti-join is as current as the projection run (`derivedAt` on the edge).
- bitemporal episode needed on: none.

## CQ-PR-04

- kind: cypher
- pattern:

```cypher
MATCH (e:ProtocolEdition {uid: $editionUid})-[:HAS_STEP]->(s:ProtocolStep)
WHERE s.stepKind IN ['REVIEW','MEASURE','CONSULT']
OPTIONAL MATCH (s)-[:STEP_USES]->(metric:Metric)
RETURN s.stepKey, s.stepKind, metric.name, s.thresholdComparator, s.thresholdLow, s.thresholdHigh, s.thresholdUnit,
       s.reviewAction, s.occurrencesPerPeriodMin, s.occurrencePeriodUnit, s.requirementBasis, s.exactText, s.locatorUid
```

- trace: STEP-TRACE(s) ("if sleeplessness persists for more than 4 weeks ... consult" → REVIEW, reviewAction CONTACT_CLINICIAN).
- bitemporal episode needed on: none.

## Q-D5-12

- kind: cypher
- pattern:

```cypher
MATCH (x {uid: $x})
CALL (x) {
  MATCH (s:ProtocolStep)-[:STEP_USES]->(x) RETURN s
  UNION  // forms and active moieties of x (D1 seam, edge name per D1 SDL)
  MATCH (s:ProtocolStep)-[:STEP_USES]->(f)-[:HAS_ACTIVE_MOIETY|REALIZES_SUBSTANCE]->(x) RETURN s
}
MATCH (p:Protocol)-[he:HAS_EDITION]->(e:ProtocolEdition)-[:HAS_STEP]->(s)
WHERE he.recordedTo IS NULL AND (he.validTo IS NULL OR he.validTo > datetime())
// evidence the protocol cites for the step: assertions by the protocol author whose subject is the step
OPTIONAL MATCH (cite:Assertion)-[:HAS_SUBJECT]->(s) WHERE cite.recordedTo IS NULL
OPTIONAL MATCH (cite)-[:HAS_EVIDENCE]->(cl:SourceLocator)
RETURN p.name, e.uid, s.stepKey, s.doseMin, s.doseMax, s.doseUnit, s.dosePeriod, s.occurrencesPerPeriodMin,
       s.occurrencesPerPeriodMax, s.occurrencePeriodUnit, s.targetKeys, collect(DISTINCT cl.exact) AS citedEvidence
```

- trace: STEP-TRACE(s) plus the cited-evidence locators (PubMed links on Blueprint, episode references on Huberman).
- bitemporal episode needed on: HAS_EDITION (current editions only).

## CQ-PR-06

- kind: cypher (assessment lookup)
- pattern:

```cypher
MATCH (e:ProtocolEdition {uid: $editionUid})-[:HAS_STEP]->(s:ProtocolStep)
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(s)
WHERE ass.assessmentSubkind = 'D5.step-evidence' AND ass.recordedTo IS NULL
OPTIONAL MATCH (ass)-[:DERIVED_FROM]->(inp:Assertion)
RETURN s.stepKey, ass.uid, ass.verdict, ass.effectDirection, ass.methodVersion, ass.summary, collect(inp.uid) AS inputs
```

- trace: each step-level Assessment's DERIVED_FROM inputs → their locators; absent assessment = "not assessed".
- bitemporal episode needed on: none.

## Q-D5-13

- kind: cypher (interval overlap between the HAS_EDITION episode and D7 interest episodes)
- pattern:

```cypher
MATCH (p:Protocol {uid: $protocolUid})-[he:HAS_EDITION]->(e:ProtocolEdition)
WHERE he.recordedTo IS NULL
MATCH (aa:Assertion {predicate: 'PROTOCOL_AUTHORED_BY'})-[:HAS_SUBJECT]->(p), (aa)-[:HAS_OBJECT]->(author)
WHERE aa.recordedTo IS NULL
CALL (author, he) {
  // (1) D7 interest episodes (D7 SDL, Shape B): role, stake, value received; edge-property fields per D7
  //     (RoleEdgeProperties.roleKind, StakeEdgeProperties.stakeKind, ValueEdgeProperties.valueKind); D7 removed observedAt from
  //     the edge properties: an unbounded episode's observation date is the authorizing Assertion's kernel validObservedAt
  MATCH (author)-[i:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(org:Organization)
  WHERE i.recordedTo IS NULL
    AND (i.validFrom IS NULL OR he.validTo IS NULL OR i.validFrom < he.validTo)
    AND (i.validTo IS NULL OR he.validFrom IS NULL OR he.validFrom < i.validTo)
  OPTIONAL MATCH (ia:Assertion {uid: i.assertionUid})
  RETURN org, type(i) AS interestType, coalesce(i.roleKind, i.stakeKind, i.valueKind) AS interestKind,
         i.validFrom AS validFrom, i.validTo AS validTo, ia.validObservedAt AS observedAt, i.assertionUid AS assertionUid, 'POSITIVE' AS polarity
  UNION
  // (2) stated non-interests ("we have no affiliation to Swanson"): NEGATIVE assertions authorize no episode
  MATCH (n:Assertion {polarity: 'NEGATIVE'})-[:HAS_SUBJECT]->(author), (n)-[:HAS_OBJECT]->(org:Organization)
  WHERE n.predicate IN ['HOLDS_ROLE','HOLDS_STAKE','RECEIVES_VALUE_FROM'] AND n.recordedTo IS NULL
  RETURN org, n.predicate AS interestType, 'DENIED' AS interestKind, n.validFrom AS validFrom, n.validTo AS validTo,
         n.validObservedAt AS observedAt, n.uid AS assertionUid, 'NEGATIVE' AS polarity
}
// means in the edition that the counterparty owns (brand) or sells (seller of record) — D6 SDL paths, no untyped hops
OPTIONAL MATCH (e)-[:HAS_STEP]->(:ProtocolStep)-[:STEP_USES]->(prod:Product)
  WHERE EXISTS { (prod)-[:BRANDED_AS]->(:Brand)<-[:OWNS_BRAND]-(org) }
     OR EXISTS { (prod)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)<-[:LISTING_FOR]-(:MerchantListing)
                 -[:HAS_OFFER]->(:Offer)-[:SELLER_OF_RECORD]->(org) }
RETURN e.uid, he.validFrom, he.validTo, author.name, org.name, interestType, interestKind, polarity, validFrom, validTo,
       observedAt, assertionUid, collect(DISTINCT prod.name) AS meansOwnedOrSoldByCounterparty
// + TRACE(Assertion {uid: assertionUid}) -> the disclosure span ("I use supplements from Momentous ... 20% off";
//   2021: "we have no affiliation to Swanson")
```

- trace: the interest's authorizing Assertion → disclosure locator on the protocol snapshot; overlap is computed, unknown bounds reported as UNKNOWN; denied interests come back with polarity NEGATIVE and no interval.
- bitemporal episode needed on: HAS_EDITION (D5) and the D7 interest edges (D7 episodes; when only an observation date is known it is the authorizing Assertion's `validObservedAt`, read through `assertionUid`).

## Q-D5-14

- kind: cypher (assessment + assertion)
- pattern:

```cypher
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
MATCH (pos:Assertion)-[:HAS_OBJECT]->(t), (pos)-[:HAS_SUBJECT]->(m)
WHERE pos.predicate IN ['IMPROVES_TARGET','INTENDED_FOR_TARGET'] AND pos.recordedTo IS NULL
// contradicting / null controlled evidence on the same means and target
MATCH (neg:Assertion)-[:HAS_OBJECT]->(t), (neg)-[:HAS_SUBJECT]->(m)
WHERE neg.predicate IN ['NO_EFFECT_ON_TARGET','WORSENS_TARGET','MIXED_EFFECT_ON_TARGET'] AND neg.recordedTo IS NULL
OPTIONAL MATCH (neg)-[:HAS_EVIDENCE]->(nl:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(nsrc:Source)
// the weighed conclusion, if any (kernel Assessment, EVIDENCE_SYNTHESIS, effectDirection)
OPTIONAL MATCH (ass:Assessment)-[:DERIVED_FROM]->(neg) WHERE ass.recordedTo IS NULL
// the promoter's own statement of the null (same means, asserted by the promoter)
OPTIONAL MATCH (own:Assertion {predicate: 'NO_EFFECT_ON_TARGET'})-[:HAS_SUBJECT]->(m), (own)-[:ASSERTED_BY]->(promoter)
WHERE (pos)-[:ASSERTED_BY]->(promoter)
// study branch: outcomes measured by the target's operationalizing measures
// the kernel claim lifecycle (00-DIRECTIVE 3.4; K 09 "Claim lifecycle"): the popular statement as a claim occurrence,
// the vetting disposition, the evidence mission that tried to disqualify it, and its EVIDENCE_REPORT verdict
OPTIONAL MATCH (pos)-[:OCCURRENCE_OF]->(c:Claim)
OPTIONAL MATCH (vet:Assessment {assessmentKind: 'VETTING'})-[:ASSESSES]->(c) WHERE vet.recordedTo IS NULL
OPTIONAL MATCH (mission:Activity {activityKind: 'EVIDENCE_MISSION'})-[:ASSESSES]->(c)
OPTIONAL MATCH (rep:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(c) WHERE rep.recordedTo IS NULL
RETURN m.name, pos.uid AS claimAssertion, c.uid AS claim, c.lifecycleState, vet.disposition, mission.missionId, mission.runId,
       rep.uid AS evidenceReport, rep.verdict, rep.worldCorrectness,
       neg.uid AS disconfirming, neg.predicate, nl.exact, nsrc.canonicalUri,
       ass.uid, ass.effectDirection, ass.methodVersion, own.uid AS promoterAdmits
// measures that operationalize T (OPERATIONALIZED_BY) feed the study branch of Q-D5-01; they are not joined here
```

- trace: both sides carry locators; the target-effect Assessments cite the studies through DERIVED_FROM; the claim's verdict is the EVIDENCE_REPORT's (`verdict`, lattice of verification.v1, about the exact Claim it ASSESSES), never a D5 assessment; the report cites the assertions and assessments it rests on (DERIVED_FROM) and the locators it quotes (HAS_EVIDENCE); a CONTRADICTED SUPPORT adjudication on `pos` is the verifier's verdict on the occurrence (Q-K kernel). Fixture `antioxidant-exercise-disconfirmation` holds every record of the chain.
- bitemporal episode needed on: none.

## CQ-EV-04

- kind: cypher (assessment lookup)
- pattern:

```cypher
MATCH (ass:Assessment {assessmentKind: 'APPLICABILITY'})-[:ASSESSES]->(use)
WHERE use.uid IN [$editionUid, $stepUid, $interventionUid] AND ass.recordedTo IS NULL
MATCH (ass)-[:ASSESSES]->(arm)   // D3 StudyArm / Study (Subjectable)
OPTIONAL MATCH (ass)-[:DERIVED_FROM]->(inp:Assertion)-[:HAS_EVIDENCE]->(loc:SourceLocator)
RETURN ass.uid, ass.assessmentSubkind, ass.summary, ass.verdict, ass.methodVersion, labels(arm)[0], arm.uid,
       collect({input: inp.uid, exact: loc.exact}) AS dimensions   // form, dose, schedule, duration, population, outcome
```

- trace: per dimension the input assertions (trial dose "5 mg or 10 mg compounded rapamycin weekly"; clinic prescription text) and their locators.
- bitemporal episode needed on: none.

## Q-D5-15

- kind: cypher
- pattern:

```cypher
MATCH (a:Assertion)-[:HAS_SUBJECT]->(m {uid: $meansUid})
WHERE a.predicate IN ['INTENDED_FOR_TARGET','IMPROVES_TARGET','WORSENS_TARGET','NO_EFFECT_ON_TARGET','MIXED_EFFECT_ON_TARGET']
  AND a.recordedAt <= $asOf AND (a.recordedTo IS NULL OR a.recordedTo > $asOf)
MATCH (a)-[:HAS_OBJECT]->(t:Target)
// + TRACE(a)
RETURN t.key, t.label, a.predicate, [q IN a.qualifiers WHERE q STARTS WITH 'claimClass:'] AS claimClass,
       [q IN a.qualifiers WHERE q STARTS WITH 'population:'] AS forWhom, who.uid AS asserter, loc.exact, snap.contentHash
UNION
// protocol content: steps of the current edition stating the purpose
MATCH (m {uid: $meansUid})<-[:STEP_USES]-(s:ProtocolStep)<-[:HAS_STEP]-(e:ProtocolEdition)<-[he:HAS_EDITION]-(p:Protocol)
WHERE he.recordedTo IS NULL
UNWIND s.targetKeys AS k MATCH (t:Target {key: k})
RETURN t.key, t.label, 'STEP_STATES_PURPOSE' AS predicate, [] AS claimClass, s.appliesToPopulations AS forWhom,
       p.uid AS asserter, s.exactText AS exact, null AS contentHash
```

- trace: TRACE(a) (label indications section, monograph "Recommended use or purpose", product page); claim class from the qualifier (D8 decides regulatory status).
- bitemporal episode needed on: HAS_EDITION in the protocol branch only.

## Q-D5-16

- kind: cypher
- pattern:

```cypher
MATCH (x {uid: $x})
// approved indication (D8 predicate, e.g. HAS_APPROVED_INDICATION) vs promoted target (D5 predicates)
OPTIONAL MATCH (ind:Assertion)-[:HAS_SUBJECT]->(x) WHERE ind.predicate = 'HAS_APPROVED_INDICATION' AND ind.recordedTo IS NULL
OPTIONAL MATCH (ind)-[:HAS_OBJECT]->(cond:Condition)
OPTIONAL MATCH (promo:Assertion)-[:HAS_SUBJECT]->(x), (promo)-[:HAS_OBJECT]->(t:Target)
  WHERE promo.predicate IN ['INTENDED_FOR_TARGET','IMPROVES_TARGET'] AND promo.recordedTo IS NULL
// label harms with their population scope (boxed warning, approved population = transplant immunosuppression)
OPTIONAL MATCH (harm:Assertion)-[:HAS_SUBJECT]->(x)
  WHERE harm.predicate IN ['CAUSES_ADVERSE_EFFECT','USE_CONSTRAINED_IN'] AND harm.recordedTo IS NULL
RETURN x.name, collect(DISTINCT cond.name) AS approvedFor, collect(DISTINCT t.key) AS promotedFor,
       collect(DISTINCT {harm: harm.uid, predicate: harm.predicate, scope: harm.qualifiers}) AS labelHarms
// + TRACE for each listed assertion (label section, clinic statement "It is not FDA approved to slow aging ...")
```

- trace: TRACE per assertion; off-label status itself is a D8 fact, D5 only juxtaposes.
- bitemporal episode needed on: none.

## Q-D5-17

- kind: cypher
- pattern:

```cypher
MATCH (i:Intervention {uid: $interventionUid})
MATCH (o:Assertion {predicate: 'OFFERS_INTERVENTION'})-[:HAS_OBJECT]->(i), (o)-[:HAS_SUBJECT]->(offerer)
WHERE o.recordedTo IS NULL
OPTIONAL MATCH (tg:Assertion)-[:HAS_SUBJECT]->(i), (tg)-[:HAS_OBJECT]->(t:Target {key: $targetKey})
OPTIONAL MATCH (c:Assertion)-[:HAS_SUBJECT]->(i) WHERE c.predicate = 'USE_CONSTRAINED_IN' AND (c)-[:ASSERTED_BY]->(offerer)
// screening / monitoring: the clinic's program as a Protocol whose steps use the intervention (MEASURE steps)
OPTIONAL MATCH (prog:Protocol)-[:HAS_EDITION]->(:ProtocolEdition)-[:HAS_STEP]->(ms:ProtocolStep {stepKind: 'MEASURE'})
  WHERE EXISTS { MATCH (prog)<-[:HAS_SUBJECT]-(:Assertion {predicate: 'PROTOCOL_AUTHORED_BY'})-[:HAS_OBJECT]->(offerer) }
// price: D6 Offer / PriceObservation (D6 SDL) — joined by the offerer and the intervention
RETURN offerer.name, collect(DISTINCT c.valueString) AS screeningLevels, collect(DISTINCT ms.stepKey) AS monitoring
```

- trace: TRACE(o), TRACE(c); price rows carry D6 locators (price observation date).
- bitemporal episode needed on: none in D5 (D6 offer validity is D6's).

## Q-D5-18

- kind: cypher (published comparison: D10 composes, D5 supplies rows and blocked options)
- pattern:

```cypher
UNWIND $optionUids AS u MATCH (m {uid: u})
OPTIONAL MATCH (eff:Assertion)-[:HAS_SUBJECT]->(m), (eff)-[:HAS_OBJECT]->(:Target {key: $targetKey})
  WHERE eff.recordedTo IS NULL
OPTIONAL MATCH (lim:Assertion)-[:HAS_SUBJECT]->(m), (lim)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint) WHERE lim.recordedTo IS NULL
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(m) WHERE ass.recordedTo IS NULL
RETURN m.uid, collect(DISTINCT {a: eff.uid, p: eff.predicate}) AS effects, collect(DISTINCT uc.uid) AS constraints,
       collect(DISTINCT {ass: ass.uid, dir: ass.effectDirection}) AS assessments
// published: (:Report {reportKind:'COMPARISON', policyVersion, criteriaVersion})-[:ASSESSES]->(options and Target),
//            -[:DERIVED_FROM]->(every cited Assertion/Assessment), -[:HAS_EVIDENCE]->(their locators)
```

- trace: the Report's citation set; until published the comparison is computed and never stored (directive 3.5).
- bitemporal episode needed on: none.

## Q-D5-19

- kind: gds
- pattern: Cypher projection of a bipartite means–edition graph over **current** editions, then Node Similarity (Jaccard) among means; pairs joined back to interaction constraints.

```cypher
// projection 'd5-stack-cooccurrence' (method d5-stack-cooccurrence/v1), restricted to steps whose targetKeys contain $targetKey
MATCH (p:Protocol)-[he:HAS_EDITION]->(e:ProtocolEdition)-[:HAS_STEP]->(s:ProtocolStep)-[:STEP_USES]->(m)
WHERE he.recordedTo IS NULL AND (he.validTo IS NULL OR he.validTo > datetime())
  AND ($targetKey IS NULL OR $targetKey IN s.targetKeys) AND s.stepKind IN ['TAKE','PRACTICE']
RETURN gds.graph.project('d5-stack-cooccurrence', m, e, {relationshipType: 'IN_EDITION'})
// NATURAL orientation (means -> edition): Node Similarity compares nodes with outgoing edges, i.e. means, by the Jaccard
// overlap of the editions they appear in; editions are never compared.
// CALL gds.nodeSimilarity.stream('d5-stack-cooccurrence', {similarityCutoff: 0.1, topK: 10}) YIELD node1, node2, similarity
// then: pairs (m1, m2) whose interaction assertions resolve to an INTERACTION UseConstraint, or share a scopePopulation
WITH gds.util.asNode(node1) AS m1, gds.util.asNode(node2) AS m2, similarity
OPTIONAL MATCH (a:Assertion {predicate: 'INTERACTS_WITH'})-[:HAS_SUBJECT]->(m1), (a)-[:HAS_OBJECT]->(m2),
               (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
RETURN m1.name, m2.name, similarity, collect(DISTINCT uc.uid) AS interactionConstraints
```

- refresh cadence: on demand (stream) per target; if materialized, weekly or on any new HAS_EDITION episode, written by D10 as a derived association with `derivationRule: d5-stack-cooccurrence/v1` (D10 owns association edges). Use: discovery of stack patterns and of co-prescribed interacting pairs; never evidence.
- trace: each pair lists the editions it co-occurs in (STEP-TRACE of each step) and the interaction assertions' TRACE.
- bitemporal episode needed on: HAS_EDITION (current editions define the projection).

## Q-D5-20

- kind: cypher
- pattern:

```cypher
MATCH (x {uid: $x})
MATCH (ai:Assertion)-[:HAS_SUBJECT]->(x), (ai)-[:HAS_OBJECT]->(t:Target)
WHERE ai.predicate IN ['INTENDED_FOR_TARGET','IMPROVES_TARGET'] AND ai.recordedTo IS NULL
MATCH (ae:Assertion {predicate: 'CAUSES_ADVERSE_EFFECT'})-[:HAS_SUBJECT]->(x), (ae)-[:HAS_OBJECT]->(effect:Condition)
WHERE ae.recordedTo IS NULL
// effect term mapped to the intended target by identity, not by name: the effect Condition and one of the target's
// operationalizing measures (D2 Outcome, D4 Metric / Biomarker) carry the same kernel Identifier (MESH, HPO, SNOMEDCT),
// e.g. a sleep-disturbance concept on both the insomnia Condition and the target:sleep Outcome. D2 has no typed
// Condition -> Outcome relationship (OQ-D5-45); without a shared identifier the row is not returned.
MATCH (t)-[:OPERATIONALIZED_BY]->(measure)
MATCH (effect)-[:HAS_IDENTIFIER]->(id:Identifier)<-[:HAS_IDENTIFIER]-(measure)
WHERE id.scheme IN ['MESH','HPO','SNOMEDCT']
// + TRACE(ae) incl. the causality caveat locator (CAERS/FAERS disclaimers) as an Assertion with speechAct CAUTIONS
RETURN t.key, effect.name, measure.uid AS measure, id.scheme + ':' + id.value AS sharedIdentifier,
       ae.valueString AS frequencyOrCount, ae.qualifiers, ae.uid
```

- trace: TRACE(ae); report counts appear only as values of METRIC assertions / assessment inputs with the publisher's causality caveat.
- bitemporal episode needed on: none.

## Q-D5-21

- kind: cypher
- pattern:

```cypher
MATCH (a:Assertion)-[:HAS_SUBJECT]->(x {uid: $x})
WHERE a.predicate IN ['USE_CONSTRAINED_IN','HAS_UPPER_LIMIT','HAS_AUTHORIZED_DOSE_RANGE','INTERACTS_WITH'] AND a.recordedTo IS NULL
OPTIONAL MATCH (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
MATCH (a)-[:ASSERTED_BY]->(authority)
// + TRACE(a)
WITH coalesce(uc.scopePopulations, []) + [q IN a.qualifiers WHERE q STARTS WITH 'population:' | substring(q, 11)] AS pops, a, uc, authority, loc, snap
UNWIND pops AS pop
WITH pop, collect({authority: authority.uid, level: a.valueString, value: a.valueNumber, unit: a.unitCode,
                   validFrom: a.validFrom, exact: loc.exact, snapshot: snap.contentHash, uc: uc.uid}) AS rows
RETURN pop, rows, size(apoc.coll.toSet([r IN rows | r.level])) > 1 AS disagreement
```

- trace: per cell the authority's locator and snapshot (ODS UL table, HC monograph contraindication, label section 8, protocol pregnancy section); version date from the Assertion's valid time.
- bitemporal episode needed on: none.

## Q-D5-22

- kind: cypher (assessment lookup)
- pattern:

```cypher
MATCH (s:Assessment {assessmentKind: 'SAFETY_SIGNAL'})-[:ASSESSES]->(x {uid: $x})
WHERE s.assessmentSubkind = 'D5.surveillance-trend'
  AND s.recordedAt <= $asOf AND (s.recordedTo IS NULL OR s.recordedTo > $asOf)
MATCH (s)-[:DERIVED_FROM]->(inp:Assertion)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (newer:Assessment {supersedesUid: s.uid})
RETURN s.uid, s.conclusionCode AS trend, s.gradeScheme, s.grade AS seriousOutcomeGrade,
       [f IN s.facets WHERE f STARTS WITH 'exposurePopulation=' OR f STARTS WITH 'dataSystem='] AS scope,
       s.summary, s.methodVersion, s.evidenceCutoffAt, collect({value: inp.valueNumber, q: inp.qualifiers, exact: loc.exact}) AS counts,
       newer.uid AS correctedBy
```

- trace: counts are METRIC assertions on the MMWR table spans; an erratum supersedes the input assertion (`supersedesUid`) and the assessment (Q-D5-26). Trend is the kernel slot `conclusionCode` (vocabulary for `D5.surveillance-trend` registered in 09: INCREASING, DECREASING, STABLE, NOT_ASSESSABLE); exposure population and data system are registered `facets`.
- bitemporal episode needed on: none.

## Q-D5-23

- kind: cypher (agent pre-recommendation check; the GraphQL form is `useConstraints(where: {resolvedFrom: {some: {subject: {some: {uid: {eq: $m}}}}}})`)
- pattern:

```cypher
MATCH (m {uid: $m})<-[:HAS_SUBJECT]-(a:Assertion)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
WHERE a.recordedTo IS NULL AND a.status IN ['ACCEPTED','DISPUTED']
  AND (any(p IN uc.scopePopulations WHERE p IN $ctx.populations)
       OR EXISTS { MATCH (a)-[:HAS_OBJECT]->(o) WHERE o.uid IN $ctx.conditionUids + $ctx.coExposureUids }
       // DOSE_LIMIT: Q-D5-06's comparability predicate (unit, period, intake scope) before comparing numbers;
       // a non-comparable planned dose is returned flagged, never silently dropped
       OR (uc.constraintKind = 'DOSE_LIMIT' AND $ctx.plannedDose IS NOT NULL
           AND ((uc.doseUnit = $ctx.doseUnit AND uc.dosePeriod = $ctx.dosePeriod
                 AND (uc.intakeScope = $ctx.intakeScope OR uc.intakeScope = 'TOTAL_INTAKE')
                 AND $ctx.plannedDose > uc.doseValue)
                OR NOT (uc.doseUnit = $ctx.doseUnit AND uc.dosePeriod = $ctx.dosePeriod)))
       OR (uc.constraintKind = 'ROUTE_OR_FORM' AND uc.route = $ctx.route)
       OR (uc.constraintKind = 'TIMING' AND $ctx.timeAnchor IS NOT NULL AND uc.timingWindow STARTS WITH $ctx.timeAnchor))
// + TRACE(a)
RETURN uc.uid, uc.constraintKind, uc.identityKey, uc.scopePopulations, uc.doseValue, uc.doseUnit, uc.dosePeriod, uc.intakeScope,
       CASE WHEN uc.constraintKind = 'DOSE_LIMIT' AND NOT (uc.doseUnit = $ctx.doseUnit AND uc.dosePeriod = $ctx.dosePeriod)
            THEN 'NOT_COMPARABLE: unit or period differ' END AS doseComparability,
       uc.route, uc.timingWindow, uc.jurisdiction,
       collect({assertion: a.uid, level: a.valueString, asserter: who.uid, exact: loc.exact, snapshot: snap.contentHash}) AS statements
```

- trace: TRACE(a) for every statement behind each constraint; empty result is reported as "no constraint recorded", never "safe" (directive 3.2).
- bitemporal episode needed on: none.

## Q-D5-24

- kind: cypher
- pattern:

```cypher
// safety assertions about x whose source revised since $since: new, superseded, or changed level
MATCH (a:Assertion)-[:HAS_SUBJECT]->(x {uid: $x})
WHERE a.predicate IN ['USE_CONSTRAINED_IN','INTERACTS_WITH','HAS_UPPER_LIMIT','CAUSES_ADVERSE_EFFECT']
  AND (a.recordedAt >= $since OR (a.recordedTo IS NOT NULL AND a.recordedTo >= $since))
OPTIONAL MATCH (older:Assertion {uid: a.supersedesUid})
OPTIONAL MATCH (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
MATCH (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
// dependants: reports / assessments that cite the older state (kernel lineage, the K packet's blast-radius pattern)
OPTIONAL MATCH (dep)-[:DERIVED_FROM]->(older) WHERE dep:Report OR dep:Assessment
// protocol editions current at $since whose steps use x, and the protocol assessments recorded before the change
OPTIONAL MATCH (:Protocol)-[he:HAS_EDITION]->(e:ProtocolEdition)-[:HAS_STEP]->(:ProtocolStep)-[:STEP_USES]->(x)
  WHERE he.recordedFrom <= $since AND (he.recordedTo IS NULL OR he.recordedTo > $since)
OPTIONAL MATCH (pa:Assessment)-[:ASSESSES]->(e) WHERE pa.recordedAt <= $since
RETURN uc.uid, a.predicate, older.valueString AS before, a.valueString AS after, a.recordedAt, a.recordedTo,
       snap.revisionKind, snap.publishedAt, collect(DISTINCT dep.uid) AS dependsOnOlder,
       collect(DISTINCT e.uid) AS editionsUsingX, collect(DISTINCT pa.uid) AS protocolAssessmentsBeforeChange
```

- trace: old and new locators on the two label versions (SPL set id + version; snapshot `revisesSnapshotUid`).
- bitemporal episode needed on: HAS_EDITION for the protocol branch (which edition was current at $since); the safety facts themselves need none (supersession on the Assertion; recorded time).

## Q-D5-25

- kind: cypher
- pattern:

```cypher
MATCH (use {uid: $useUid})                    // a ProtocolStep or an offered Intervention
OPTIONAL MATCH (use)-[:STEP_USES]->(i)        // the step's means (Intervention or substance)
WITH coalesce(i, use) AS concept, use
// D3 arm administering the same concept (D3 SDL: StudyArm -HAS_COMPONENT-> InterventionComponent -ADMINISTERS->),
// or an EQUIVALENCE assessment linking two concepts
OPTIONAL MATCH (arm:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)-[:ADMINISTERS]->(concept)
OPTIONAL MATCH (eq:Assessment {assessmentKind: 'EQUIVALENCE'})-[:ASSESSES]->(concept), (eq)-[:ASSESSES]->(other)
  WHERE eq.recordedTo IS NULL AND other <> concept
RETURN labels(concept)[0], concept.uid, concept.kind, collect(DISTINCT arm.uid) AS sameConceptArms,
       collect(DISTINCT {other: other.uid, verdict: eq.verdict, method: eq.methodVersion}) AS equivalences
```

- trace: the equivalence assessment's inputs (trial dosing text vs clinic text) and locators; form / dose mismatches go to CQ-EV-04.
- bitemporal episode needed on: none.

## Q-D5-26

- kind: cypher
- pattern:

```cypher
MATCH (a:Assertion)-[:HAS_SUBJECT]->(x {uid: $x})
WHERE a.predicate IN ['USE_CONSTRAINED_IN','INTERACTS_WITH','HAS_UPPER_LIMIT','CAUSES_ADVERSE_EFFECT'] AND a.recordedTo IS NOT NULL
OPTIONAL MATCH (succ:Assertion {supersedesUid: a.uid})
OPTIONAL MATCH (succ)-[:HAS_EVIDENCE]->(cl:SourceLocator)<-[:HAS_LOCATOR]-(cs:SourceSnapshot)   // erratum / new label version
OPTIONAL MATCH (dep)-[:DERIVED_FROM]->(a) WHERE (dep:Report OR dep:Assessment) AND dep.recordedTo IS NULL
OPTIONAL MATCH (a)-[:RESOLVES_TO_CONSTRAINT]->(uc:UseConstraint)
RETURN a.uid, a.predicate, a.valueString, a.recordedTo AS supersededAt, succ.uid, cs.publishedAt, cl.exact,
       collect(DISTINCT dep.uid) AS stillCiting, uc.uid
```

- trace: original and correcting locators; "still citing" = current dependants with DERIVED_FROM to a closed assertion.
- bitemporal episode needed on: none.

## Q-D5-27

- kind: fulltext + cypher (vector over community chunks optional)
- pattern:

```cypher
// community practice statements against an authoritative constraint on the same concern
MATCH (uc:UseConstraint)<-[:RESOLVES_TO_CONSTRAINT]-(auth:Assertion)
WHERE auth.recordedTo IS NULL AND auth.valueString IN ['CONTRAINDICATED','AVOID','DO_NOT_EXCEED_DOSE','NOT_RECOMMENDED']
MATCH (uc)<-[:RESOLVES_TO_CONSTRAINT]-(comm:Assertion)
WHERE comm.recordedTo IS NULL AND (comm.speechAct IN ['REPORTS_PRACTICE','RECOMMENDS'] OR 'stance:DELIBERATE_USE' IN comm.qualifiers)
MATCH (comm)-[:HAS_EVIDENCE]->(cl:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
MATCH (comm)-[:ASSERTED_BY]->(handle)
RETURN uc.uid, uc.identityKey, auth.valueString AS authoritativeLevel, count(DISTINCT src) AS distinctCommunitySources,
       collect({who: handle.name, exact: cl.exact, source: src.canonicalUri, basis: comm.basisKind})[..20] AS examples
// discovery of new practice statements: fulltext over D9 chunks ('grapefruit' AND 'rapamycin'), or the D9 vector index,
// feeding extraction missions; MENTIONS / vector hits are candidates, never answer rows
```

- trace: every community row has its locator; evidence class from `basisKind` (PERSONAL_EXPERIENCE) and source-authority assessments (D9).
- bitemporal episode needed on: none.

## Q-D5-28

- kind: cypher
- pattern:

```cypher
MATCH (i:Intervention) WHERE $kind IS NULL OR i.kind = $kind
OPTIONAL MATCH (a:Assertion)-[:HAS_SUBJECT]->(i), (a)-[:HAS_OBJECT]->(t:Target)
  WHERE a.recordedTo IS NULL AND a.predicate ENDS WITH '_TARGET'
OPTIONAL MATCH (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
RETURN i.kind, t.key, a.predicate, count(DISTINCT a) AS statements, collect(DISTINCT src.sourceKind) AS sourceKinds
ORDER BY i.kind, t.key
```

- trace: counts are over assertions, each traceable by TRACE(a); `sourceKinds` shows that lifestyle practices have no label or regulator source (the kind changes which source classes exist, not the query).
- bitemporal episode needed on: none.

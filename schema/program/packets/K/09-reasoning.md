# K — reasoning

Wave 0 by A1, 2026-10-08; model stage (Wave 2) by A1, 2026-10-08. The first section is the published kernel pattern every domain module follows; it changes only additively, and any rename or removal is recorded under "## Kernel pattern changes" at the end of this file in the same edit that updates the pattern. The model stage made additive changes only (listed under "## Kernel pattern changes", entries 1–9) and answered the domains' kernel requests ("## Kernel requests from domain packets"). The adversarial review (A1, 2026-10-08) made changes 10–16: two removals that no domain SDL referenced (`Mention`, `Adjudication.considers`), additive enum values, and rules that tighten docstrings; it also answered D9's remaining kernel requests.

## Kernel pattern for subject, object, identifier and mention edges

Status: **published 2026-10-08 (Wave 0); amended additively 2026-10-08 (model stage, "## Kernel pattern changes" 1–9); amended in the adversarial review 2026-10-08 (changes 10–16: `Mention` and `Adjudication.considers` removed, no domain SDL affected)**. Kernel SDL: `packets/K/04-schema-proposal.graphql`. Copy-paste template: `packets/K/domain-template.graphql` (compiles with the kernel). Measurements: `packets/K/lever-experiments.md`.

### Chosen option and its numbers

R1 option **(c), thin `Subjectable` interface target**, with the any-entity relationships declared **once, on kernel types**, plus three levers measured in the matrix:

| lever | per-domain-type effect (default server options) |
| --- | --- |
| interface target instead of union (any-entity edges) | union: +3.6 KB and +20 input types per member; interface: ≈ 0 per implementer (one enum value). Options (a) wide `Entity`, (b) `@cypher`, (c) thin `Subjectable` measured identical per type (80.8 KB / 32 inputs before L1/L2); (c) keeps filters, connections and edge properties, (b) does not |
| L1 `@filterable(byValue: true, byAggregate: false)` on every `@relationship` | −59 KB per type (−74%): removes the `…NodeAggregationWhereInput` family that `aggregate: false` leaves in place |
| L2 `@mutation(operations: [])` on every `@node` type | −11 input types per type (−38%); the executor is the only writer (ADR 0003) |
| R2 `aggregate: false` + `@query(aggregate: false)` | −2.7 KB per type |
| R3 `nestedOperations` declared | −12 inputs per type while mutations exist; documents the class |

With all of these, one synthetic domain type with three relationships costs **17.7 KB and 12 input types** (C_MF; was 91.9 KB and 78 in pinned style). Kernel module alone prints **326,564 bytes, 6,582 lines, 185 input types** (118,511 bytes with the server's `excludeDeprecatedFields`); kernel + template prints 356,622 bytes, 202 input types, in about 1 s. After the model stage: kernel alone **345,273 bytes, 6,927 lines, 192 input types**; kernel + template 375,331 bytes, 209 input types (the template's marginal cost is unchanged: 30,058 bytes, 17 inputs). After the adversarial review: kernel alone **322,904 bytes, 6,466 lines, 179 input types**; kernel + template 357,817 bytes, 198 inputs (the template's marginal rises to 34,913 bytes and 19 inputs only because the kernel no longer uses `DerivedEdgeProperties` itself, so the first module with a derived edge pays for its three types).

### The two interfaces

| interface | who implements it | fields (list them verbatim; never change type, nullability or directives) | what targets it |
| --- | --- | --- | --- |
| `Entity` | **every** node type of every module | `id: ID!`, `uid: String!`, `name: String`, `privacyClass: PrivacyClass`, `lastWriterRunId: String`, `createdAt: DateTime`, `updatedAt: DateTime` | `Activity.generated` (WAS_GENERATED_BY, inverse) |
| `Subjectable` | every domain node type that a question makes the subject/object of an assertion, the holder of an identifier, the target of a mention or an assessment, or an asserter (default: **all domain entity types**); kernel: `Source`, `Agent`, `Claim` | `uid: String!`, `name: String` (a subset of Entity's) | `Assertion.subject` (HAS_SUBJECT), `Assertion.object` (HAS_OBJECT), `Assertion.assertedBy` (ASSERTED_BY), `Identifier.identifies` (HAS_IDENTIFIER, inverse), D9 `Chunk.mentions` (MENTIONS), `Assessment.about`, `Report.about` and `Activity.about` (ASSESSES), D10 `ReportItem.about` (ASSESSES) and `Association.members` (ASSOCIATES) |

A node type that is pure payload or retrieval structure (a versioned state such as a label version, a chunk, a segment) implements `Entity` only. Declaration of an entity type: `type X implements Entity & Subjectable @node(labels: ["X", "Entity"]) @query(aggregate: false) @mutation(operations: [])`.

**The `Entity` storage label vs the `Entity` interface (adversarial review; answers D9 C-6).** The GraphQL interface `Entity` is implemented by every node type of every module (it carries the seven executor fields). The stored label `Entity` marks the **entity archetype only**: identity-bearing things a question is about (every `Subjectable` implementer, plus `Identifier`). Records, captures, lineage and payload or retrieval types do not carry it: kernel `Assertion`, `SourceSnapshot`, `SourceLocator`, `Adjudication`, `Assessment`, `Report`, `Activity` carry their archetype label (`InformationArtifact`, `EvidenceAssessment`, `Occurrence`) or none, and D9 `Chunk`, label versions and segments declare `@node(labels: ["X"])` or `["X", "VersionedState"]`. A scan of the `Entity` label therefore means "entities", in every module; no K pattern scans it for lineage (lineage reads `WAS_GENERATED_BY` by type), and Q-K-06 uses it only to list touched entities.

### What a domain module writes

1. **Node types** implementing `Entity & Subjectable` (or `Entity` only, above), listing the seven Entity fields first, then their own properties. Docstring: Purpose, Identity rule, uid token, Questions. No `@id`, no `@timestamp` (the executor sets `id`, `createdAt`, `updatedAt`, `lastWriterRunId`).
2. **Becoming an Assertion subject or object:** nothing to declare. The executor writes `(:Assertion)-[:HAS_SUBJECT]->(n)` / `-[:HAS_OBJECT]->(n)` for any intent subject (untyped `MATCH (s {uid})`). Read in GraphQL from the Assertion side: `assertions(where: { subject: { some: { uid: { eq: $uid } } }, predicate: { eq: "…" } })`; in Cypher `(a:Assertion)-[:HAS_SUBJECT]->(n)`.
3. **Carrying identifiers:** nothing to declare. Name the schemes in `06-node-register.yaml identifierSchemes` using codes from `packets/K/identifier-schemes.yaml` (request a new scheme in your `11-open-questions.md`). The executor's `identifier.attach` writes the Identifier node (scheme, issuer, normalized value), an `Assertion` (predicate HAS_IDENTIFIER) and a `HAS_IDENTIFIER` episode (`IdentifierLinkProperties`). Read: `identifiers(where: { identifies: { some: { uid: { eq: $uid } } } })`, episodes through `identifiesConnection`.
4. **Being mentioned:** nothing to declare. D9 declares `Chunk.mentions: [Subjectable!]!` (MENTIONS, derived, kernel meaning), the only MENTIONS field since the adversarial review. A surface form awaiting resolution is a `SourceLocator` (its `exact`); a RESOLUTION Assessment cites it (`HAS_EVIDENCE {role: CONTEXT}`), ASSESSES the candidate and carries `surfaceForm=` / `normalizedForm=` / `typeHint=` in `facets`; the accepted, current one licenses the chunk's MENTIONS (`derivedFromAssessmentUids`). There is no Mention node.
5. **Lineage:** nothing to declare. The executor writes `WAS_GENERATED_BY` to the run's Activity and `lastWriterRunId` on every node and edge it writes.
6. **Domain relationships** between domain types (and from a domain type to a kernel type), each with the discipline below and one of the edge-property types below (or a domain-local superset type, rules under "Edge-property types").
7. **Computed states / snapshots** cite their inputs with the kernel relationship type `DERIVED_FROM` → `Assertion` (and carry `inputSetDigest`); a source-captured state is attached by `state.attach` whose Assertion cites the locator.
8. **Assessments** are kernel `Assessment` nodes: put your kind in `assessmentKind` (+ `assessmentSubkind`, e.g. `D5.interaction-risk`) and say so in `10-seams.yaml`. Harm is `effectDirection: HARM` on an assessment about a target. Typed slots every domain may use (model stage): `gradeScheme` + `grade` + `certainty` (evidence grades, CTCAE-style severity), `conclusionCode` (one categorical outcome from the vocabulary you register for your subkind in your `09-reasoning.md`, e.g. D4 `COMPARABLE`, D5 `CONFIRMED_ASSOCIATION`), `facets` (registered `<facet>=<value>` codes). Need anything else typed? Request it in `11-open-questions.md` (owner: kernel); do not declare your own assessment type. An assessment is always about a `Subjectable`: one that judges a particular occurrence or pair (RETELLING_FIDELITY, CONFLICT_RELEVANCE) ASSESSES the occurrence's Claim and is DERIVED_FROM the judged occurrence(s), naming roles in facets (`retelling=<uid>`, `original=<uid>`) (D9 K-3, declined as a new field).
9. **Claims and recommendations** are kernel records: a claim occurrence is an `Assertion` with `assertionKind: CLAIM` and `OCCURRENCE_OF` → `Claim`; a recommendation is a claim occurrence with `speechAct: RECOMMENDS`. D9 owns the containers (`OCCURS_IN`) and speakers; D7 the asserter's financial interest. The asserter (ASSERTED_BY) is a D7 Person or Organization, a K Agent, or a D9 `Channel` with `channelKind: ACCOUNT` when no person is identified (D9 K-6, accepted; a later RESOLUTION Assessment links the account to a Person). A third party's verdict on a claim (ClaimReview, regulator finding) is an Assertion with predicate `RATES_CLAIM` by that party, never a BellLabs Assessment.
10. **Edges between a kernel node and your node** are declared on **your** type (use `direction: IN` when the stored direction points from the kernel node, e.g. D9 `Episode.renditions: [Source!]!` over `RENDITION_OF`). Never add fields to kernel types.
11. **Kernel relationship types with kernel meaning** may be declared on a domain type (model stage): `DERIVED_FROM` (computed states, report rows, associations → their inputs; its target may be a kernel `Assertion` or `Assessment` or a D10 `Association`, as in D10 `ReportItem.citesAssociations`), `ASSESSES` (a D10 report row → what it is about), `MENTIONS` (D9 Chunk, derived; since the adversarial review declared and registered only by D9). The meaning, direction and class must be the kernel's; the kernel's lineage patterns (03 Q-K-05, Q-K-06) match them by type, not by label.
12. **Kernel predicate conventions** (values of `Assertion.predicate`): `FIELD_NOT_REPORTED` (the source was read for a field and does not report it; `valueString` = the field), `HAS_REVISION_STATUS` (per authority), `RATES_CLAIM`; a measured null is `polarity: POSITIVE` with a NO_CHANGE / NO_EFFECT predicate and `basisKind: DIRECT_MEASUREMENT` (NEGATIVE is a denial, never "not reported"); a price's currency is `unitCode: iso4217:<CODE>`; a date at which a source states a fact held, without bounds, is `validObservedAt` with `validFromBasis: OBSERVATION_ONLY`. Adversarial review (D9 requests): a correction is an occurrence with predicate `CORRECTS` that is DERIVED_FROM the corrected occurrence (K-2); a qualification is `HAS_EVIDENCE {role: QUALIFIES}` plus a registered `qualifiers` prefix (`population:`, `individual-variation:`, `dose-basis:`); the media segment of an occurrence is the qualifier `segment:<KIND>` (K-5; filterable with `qualifiers: { includes: "segment:SPONSOR_READ" }`); a rendition-level fact (duration of one rendition) is an Assertion whose subject is that rendition's `Source` (K-9). `Assertion.predicate` values are not seams: a domain lists them in its 05 `predicateOnly`.

### What a domain module never writes

- Any union target wider than 6 members; any "any entity" union at all (use `Subjectable`).
- `subject`, `object`, `assertedBy`, `identifiers`, `mentions` (except D9 Chunk), `generatedBy`, `evidence`/`supportedBy` fields, or any other kernel relationship re-declared on a domain type.
- Re-declared kernel fields with a different type, nullability or directive; a kernel type re-declared in a domain file.
- `SUPPORTS` / `CONTRADICTS` / `SUPPORTED_BY` edges from a document, chunk or source to an entity. Support and contradiction are `HAS_EVIDENCE {role}` from an Assertion, Adjudication, Assessment or Report to a `SourceLocator`, produced by the verifier (00-DIRECTIVE 3.8).
- `authority`, `independence` or `facet` on an Assertion's DECLARED evidence edges: the verifier writes them only on its Adjudications' VERIFIER_FOUND edges (adversarial review), so a verification run never rewrites the extractor's evidence record.
- Good/bad/safe/harmful/recommended/quality-score properties on an entity, or a plain edge with a confidence number between two domain entities. Use an Assertion (with polarity and predicate) or an Assessment (with `effectDirection`, `methodVersion`, inputs).
- A stored `RECOMMENDS` or association edge as a record; such edges exist only as derived projections (`DerivedEdgeProperties`, read-only).
- `@id`, `@timestamp`, or mutations (`@mutation` must be `operations: []`).

### Edge-property types

| type | use for | class | bitemporal episode? | fields (all executor-set) |
| --- | --- | --- | --- | --- |
| `AssertedEdgeProperties` | every asserted domain edge | asserted | **yes** (valid time + recorded time) | relationshipUid, assertionUid, validFrom/To (+Precision, +Basis), recordedFrom, recordedTo, lastWriterRunId |
| `StateEpisodeProperties` | entity → versioned-state attachments (formulation, label, protocol edition) | asserted | **yes** | same fields as AssertedEdgeProperties |
| `DerivedEdgeProperties` | projections (associations, MENTIONS, RECOMMENDS-for-retrieval, similarity) | derived | no (recorded only: derivedAt) | projectionOfAssertionUid or derivationRule + derivedFromAssertionUids / derivedFromAssessmentUids, score, derivedAt, lastWriterRunId |
| `StructuralEdgeProperties` | internal shape of one captured or composed record (recommended on every structural edge so `lastWriterRunId` is readable) | structural | no (recorded only) | orderIndex, lastWriterRunId |
| `AssertedRecordedProperties` (model stage) | asserted domain edges whose valid time no question reads (00-DIRECTIVE rule 9) | asserted | no (recorded time only) | relationshipUid, assertionUid, recordedFrom, recordedTo, lastWriterRunId |
| `IdentifierLinkProperties` (kernel-internal) | HAS_IDENTIFIER | asserted | **yes** | every AssertedEdgeProperties field verbatim and in order, then isPrimary (order fixed in the adversarial review) |
| `EvidenceEdgeProperties` (kernel-internal) | HAS_EVIDENCE | structural | no | role, origin, expectedSelectedContentDigest, authority, independence, facet (verifier-set, on Adjudication edges only; an Assessment or Report may copy them), lastWriterRunId |

Bitemporal authority is the Assertion node (valid time declared; `recordedAt` service-assigned; `recordedTo` written once; successor names `supersedesUid`). Episodes copy it onto the edge; nothing is deleted; an episode closes by one write of `recordedTo`. Derived edges are not records: a projection Activity may rebuild or remove them (history stays in the projection Activities and the input Assertions), so `DerivedEdgeProperties` has no `recordedTo`.

**Domain-local edge-property types (model stage).** A domain may declare its own `@relationshipProperties` type when a question filters an edge by a qualifier that cannot live on the authorizing Assertion (quantity on a composition line, role on an involvement, stake percent). Rules: (1) its name ends in `Properties` and is unique to the module; (2) it lists **every field of one kernel base type verbatim first** (same names, types, nullability, order; the kernel's own `IdentifierLinkProperties` follows the same rule) — `AssertedEdgeProperties`, `AssertedRecordedProperties`, `StateEpisodeProperties` or `StructuralEdgeProperties` — so the executor writes the base fields unchanged; (3) it then adds only qualifier fields a question filters on (say which in `05` `rationale`); (4) the edge's class is the base type's class; (5) when the kernel base type gains a field (additive change), the domain type adds it in the same synthesis pass. A field that only reproduces the source's wording stays in `Assertion.qualifiers`.

### Directive discipline (copy from `domain-template.graphql`)

- Node: `@node(labels: ["<Primary>", "Entity"]) @query(aggregate: false) @mutation(operations: [])` + docstring `Purpose … Identity rule … uid token … Questions: Q-<id>-nn`.
- Relationship: docstring `class: structural|asserted|derived; cardinality: …; questions: …`, then `@relationship(type, direction, properties, nestedOperations, aggregate: false) @filterable(byValue: true, byAggregate: false)`.
- `nestedOperations`: structural `[CREATE, CONNECT]` (kernel-owned structural edges to existing records use `[CONNECT]`), asserted `[CONNECT]`, derived `[]` **and** `@settable(onCreate: false, onUpdate: false)`.
- Relationship type names are SCREAMING_SNAKE and unique to the module unless they are kernel types used with kernel meaning (`DERIVED_FROM`, `ASSESSES`, `MENTIONS` for D9; see item 11 above).

### Kernel types a domain may reference without a seam

`Entity`, `Subjectable`, `Assertion`, `Source`, `SourceSnapshot`, `SourceLocator`, `Adjudication`, `Activity`, `Agent`, `Identifier`, `AssertedEdgeProperties`, `DerivedEdgeProperties`, `StructuralEdgeProperties`, `StateEpisodeProperties` (packet-check KERNEL allowlist; the script still lists `Mention`, which no longer exists, see 11-open-questions 22). Any other kernel **node** type a domain's relationship targets — `Claim`, `Assessment`, `Report` — **must be listed in that domain's `10-seams.yaml` under `seams`** keyed by the relationship type (e.g. `{ type: ASSESSES, from: K.Assessment, to: D5.Target, owner: other }`). Kernel edge-property types outside the allowlist (`AssertedRecordedProperties`, `IdentifierLinkProperties`, `EvidenceEdgeProperties`) and kernel enums used as property types (`PrivacyClass`, `EffectDirection`, …) are listed under `sharedVocabularies` as `kernel-types` (packet-check keys seams by relationship type and does not check property types; clarified in the model stage).

### Ownership map for kernel-adjacent concepts

| concept | owner | modeled as |
| --- | --- | --- |
| Claim (the proposition) | **K** | `Claim` (implements Subjectable) |
| ClaimOccurrence | **K** | `Assertion` with `assertionKind: CLAIM`, stored extra label `ClaimOccurrence`, `OCCURRENCE_OF` → Claim; container and speaker from D9 |
| Recommendation by a person (3.9) | **K** record, D9 containers, D7 interest | claim occurrence with `speechAct: RECOMMENDS`; any `RECOMMENDS` edge is a D10 derived projection |
| Assessments: vetting, insight, evidence synthesis, safety signal, applicability, quality, resolution hypothesis, equivalence, source authority, retelling fidelity | **K** type; kind values and questions by the owning domain (D3, D5, D8, D9 …) | `Assessment` with `assessmentKind` / `assessmentSubkind` |
| Adjudication (verifier verdict) | **K** | `Adjudication` |
| Evidence report, answer record, comparison report, profile, published recommendation | **K** type; composition method by **D10** | `Report` with `reportKind` (AnswerRecord merged in) |
| PolicyVersion | **D10** (node only if a question traverses it); **K** carries the id | `policyVersion` string on Report and Activity |
| DecisionCriterion, ranking/comparison methods, materialized associations | **D10** | D10 types / derived edges with `DerivedEdgeProperties` |
| Chunk, DocumentTextVersion, Segmentation | **D9** | D9 types; `Chunk.mentions` uses kernel MENTIONS |
| Surface form at a span (pinned Mention) | **K** | the `SourceLocator` of the span + a RESOLUTION `Assessment` that cites it (role CONTEXT) and ASSESSES the candidate; no Mention node (adversarial review) |
| Container of a claim occurrence | **D9** | `OCCURS_IN` (Assertion → MediaWork, exactly one); see "Occurrence container and source family" |
| MediaAsset, figure panel, label region | **D9** | D9 types; regions are `SourceLocator` selectors (`BOUNDING_BOX`) on a snapshot |
| Editorial containers (Publication, Episode, Channel, Platform) | **D9** | D9 types pointing at kernel `Source` (direction IN) |
| Person, Organization, financial interest | **D7** | D7 types implementing Subjectable (Person and Organization can be asserters) |
| Agent (software / curator identity) | **K** | `Agent` (never a Person) |
| Activity (every run: research, ingestion, vetting, evidence mission, verification, projection, answer) | **K** | `Activity` (single lineage spine; one per run; an evidence mission ASSESSES the Claim it tests) |
| Third-party verdicts (ClaimReview, regulator findings on a claim) | **K** record, rating-scale mapping **D10**, regulator content **D8** | `Assertion` predicate `RATES_CLAIM` by the reviewer, subject the Claim |
| Claim refinement (a qualified variant of a proposition) | **K** | a second `Claim` + `Assessment` EQUIVALENCE (`assessmentSubkind: K.claim-relation`, `conclusionCode: REFINES`) + cache `Claim.refinesClaimUid` |
| Retraction / correction status | **K** | `HAS_REVISION_STATUS` Assertion per authority + `SourceSnapshot.revisionKind` cache |
| Identifier and the scheme register | **K** (seed `identifier-schemes.yaml`); bridge table **D11** (A8) | `Identifier` |
| Source; source authority | **K** type; authority register content **D9** | `Source`; `Assessment` kind SOURCE_AUTHORITY |
| Targets (goal vocabulary) / Frontiers | **D5** / **D13** | their vocabularies; assessments and reports point at them through `ASSESSES` (Subjectable) |

### Occurrence container and source family (adversarial review)

One rule, so no pattern keeps two independent container paths:

- **Container** of a claim occurrence = D9 `OCCURS_IN` (Assertion → MediaWork, exactly one: the work where the act of asserting was first published). K patterns read it (03 Q-K-09) and never derive a container from `RENDITION_OF`.
- **Rendition grouping** = D9 `RENDITION_OF` (Source → MediaWork): which capture endpoints are renditions of one work. It is used for re-anchoring, per-rendition facts and, below, for the source family of evidence that has no container.
- **Source family** for independence counting (03 Q-K-21, `Report.distinctSourceFamilyCount`) = the OCCURS_IN work of the primary occurrence (a retelling counts in its primary's family); when the primary has none (scholarly records: D3 publications are not D9 works), the RENDITION_OF work of each evidence Source; else the Source. This is one rule with precedence, not two paths. Scholarly renditions (a PMC manuscript and the PubMed record of one article) are not grouped by any seam yet (11-open-questions 29).

## verification.v1 correspondence (PLAN 6.2 confirmed and amended)

Checked against `ai-engineer-knowledge-services/packages/contracts/src/verification/model.ts`, `selectors.ts`, `claims.ts`, `adjudication.ts` and `docs/verification/README.md` (2026-10-08).

| verification.v1 | graph | status |
| --- | --- | --- |
| `VerificationSource {sourceId, kind, canonicalUri, logicalIdentity}` | `Source {canonicalUri, sourceKind, logicalIdentity}`; editorial kind in `genre` | confirmed; `SourceKind` enum is now verification.v1's 13 values |
| `VerificationSourceCapture {capturedAt, effectiveAt, captureMethod(+Version), contentArtifact, canonicalProjectionArtifact}` | `SourceSnapshot {retrievedAt, publishedAt, captureMethod, contentHash, canonicalProjectionHash, storageUri}` | confirmed; storage key stays internal |
| `SourceFragment` + `VerificationSelector` (12 kinds) | `SourceLocator {selectorKind, selectorJson, selectorDigest, exact, prefix, suffix, startOffset, endOffset, page, mediaStart/EndSeconds}` | **amended**: selector vocabulary = verification.v1's 12 kinds + `WHOLE_SNAPSHOT`; the full selector is stored as canonical JSON so the verifier re-selects exactly |
| `Assertion {kind, claimType, value / proposition, qualifiers, entityBindings[{role, canonicalId}], derivation, riskClass}` | `Assertion {assertionKind, claimType, proposition / value*, qualifiers, basisKind, derivationRule, riskClass, verificationAssertionId}`; bindings → `HAS_SUBJECT` / `HAS_OBJECT` (canonicalId = uid) | confirmed; `report_assertion` is not a graph Assertion (it lives in the report ledger) |
| `Assertion.producer` (actor deployment that produced the output) | the generating Activity's `Agent` (WAS_ASSOCIATED_WITH) — **not** `ASSERTED_BY` | clarified: ASSERTED_BY is the person/organization/agent who said it in the source |
| `EvidenceEdge {fragment, role, origin, expectedSelectedContentDigest, authority}` | `HAS_EVIDENCE` → SourceLocator `{role, origin, expectedSelectedContentDigest, authority, independence, facet}`; per-claim-kind authority judgments → SOURCE_AUTHORITY Assessments; the judgment-level property → `Adjudication.sourceAuthority` | **new** (replaces SUPPORTED_BY / CONTRADICTED_BY); model stage: `SourceAuthorityVector.authority` and `.independence` copied per evidence edge (directness, freshness, applicability stay in the bundle); `VerificationMetricObservation.evidenceBindings.facet` → `facet`; adversarial review: written only on the Adjudication's VERIFIER_FOUND edges, never on the Assertion's DECLARED edges |
| `Judgment {judgeKind, graderVersion, verdict, properties×5, supporting/contradictingFragmentIds, unsupportedFacets, calibratedProbability, publicRationale}` | `Adjudication {judgeKind, methodVersion, verdict, evidenceSupport … provenanceIntegrity, unsupportedFacets, calibratedProbability, rationale, judgmentId}` + `HAS_EVIDENCE {role}` per fragment | **amended**: the full 15-value verdict lattice replaces the pinned 5-value AdjudicationVerdict; the five orthogonal properties are stored separately |
| mechanical status `passed / failed / review_required` | `Adjudication.mechanicalStatus` | confirmed |
| `PolicyOutcome` | `Adjudication.policyOutcome`, `Activity.policyOutcome`, `Report.policyOutcome`; drives Assertion.status (below) | confirmed |
| adjudication decision `affirm / reject / defer` + provenance | a new `Adjudication` superseding the held one, with `decision`, `decisionProvenance` | confirmed |
| sealed `VerificationBundle` / audit bundle | `Activity` of kind VERIFICATION: `runId` = verification run id, `bundleDigest`, `policyVersion`, `policyOutcome`; producer and verifier deployments are Agents on the Activity | **decided: no VerificationRun node** |
| `LineageEdge {derived_from, used, generated, quoted_from, revision_of, primary_source_for}` | `WAS_GENERATED_BY`, `DERIVED_FROM`, `SourceSnapshot.revisesSnapshotUid`; other artifact lineage stays inside the bundle | amended: only lineage a question traverses enters the graph |
| `VerificationReportLedger {reportArtifact, bundle, assertions[report_assertion, offsets, citations]}` | `Report {bodyDigest, ledgerDigest, bundleDigest, citationCompleteness, citationCorrectness}` + citation set | **new** |
| `VerificationReportWideSummary {claimWeightedCitationCompleteness, citationCorrectness (nullable), independentSourceFamilyCount, distinctSourceFamilyCount, unsupportedHighSeverityAssertionIds, …}` | `Report.citationCompleteness`, `citationCorrectness` (nullable), `independentSourceFamilyCount`, `distinctSourceFamilyCount`, `unsupportedHighSeverityCount` (count only; ids stay in the ledger) | **model stage** (checked against `claims.ts`) |
| `Judgment.properties.worldCorrectness` of the judged claim | `Report.worldCorrectness` on an EVIDENCE_REPORT (beside the lattice `verdict`) | **model stage** |
| decision provenance `human_origin` / `synthetic_engineering` | `Adjudication.decisionProvenance` | **model stage rule**: only AFFIRM with HUMAN_ORIGIN moves a held Assertion to ACCEPTED; SYNTHETIC_ENGINEERING decisions and DEFER change nothing (README: the human review pack has "180 blank candidates. No human label has been invented") |
| KS operation state (`queued`, `running`, `needs_review`, `quarantined`, `succeeded`, `failed`, `cancelled`) | not in the graph | confirmed (README: "Keep **execution state** separate from **admission disposition**"); the Activity carries admission (`policyOutcome`) and times only |
| Mission Control mission / run / operation | `Activity {missionId, runId, activationId, operationId, activityKind}` | confirmed |
| entity resolution outcome | `Assessment` RESOLUTION / EQUIVALENCE (citing the surface-form `SourceLocator`, role CONTEXT), `Identifier`, the derived D9 Chunk MENTIONS it licenses | amended (ResolutionHypothesis and EquivalenceAssessment merged into Assessment; Mention cut in the adversarial review) |
| derived numbers | `Assertion {basisKind: CALCULATED, derivationRule}` + `DERIVED_FROM` inputs; verdict `DERIVED_VERIFIED / DERIVED_FAILED` | confirmed |

### Decisions on the four open points of PLAN 6.2

1. **VerificationRun node vs digest: digest on Activity.** A verification run is an `Activity` (activityKind VERIFICATION, externalRunSystem `ks-verification`, `operationKind` e.g. `verification_claims`, `bundleDigest`, `policyVersion`, `policyOutcome`). Each judgment is an `Adjudication` generated by it. A separate node would be a second lineage mechanism (00-DIRECTIVE 4.1) and adds nothing a question traverses.
2. **Verdict → Assertion.status** (CAPTURE_FIDELITY adjudications only; SUPPORT adjudications and evidence reports never change status — status is capture fidelity, never truth):

| verdict | policy PASS / PASS_WITH_WARNINGS | policy REVIEW / ABSTAIN | policy FAIL |
| --- | --- | --- | --- |
| DIRECTLY_SUPPORTED, SUPPORTED_WITH_QUALIFICATION, DERIVED_VERIFIED | ACCEPTED | PROPOSED (held) | DISPUTED |
| PARTIALLY_SUPPORTED, MIXED_OR_CONFLICTING | DISPUTED | PROPOSED (held) | DISPUTED |
| CONTRADICTED, NOT_SUPPORTED, CONTEXT_ONLY, DERIVED_FAILED | REJECTED | PROPOSED (held) | REJECTED |
| INSUFFICIENT_EVIDENCE, UNVERIFIABLE, SOURCE_UNAVAILABLE, LOCATOR_ERROR, PARSER_ERROR | UNRESOLVED | UNRESOLVED | UNRESOLVED |
| PENDING_SEMANTIC_REVIEW | PROPOSED | PROPOSED | PROPOSED |

   An infrastructure verdict (source unavailable, locator or parser error) never rejects a record. A later human `AFFIRM` (human_origin) on a held result moves PROPOSED → ACCEPTED through a superseding Adjudication.
3. **What an entity snapshot cites.** A computed state (a profile, a frozen "state of X at T") is a node with `payloadHash` that cites every input Assertion by `DERIVED_FROM`, carries `inputSetDigest` (sha256 over sorted input uids and their contentHashes), and is `WAS_GENERATED_BY` a PROJECTION Activity with `methodVersion`; it is stale when any input is superseded (`recordedTo` set). A source-captured state (a label version) is attached by `state.attach`, whose Assertion cites the locator; it needs no DERIVED_FROM.
4. **Report skeleton minimum citation set.** A `Report` is published only with: `bodyDigest` of the registered report bytes; `ASSESSES` → what it is about (required for EVIDENCE_REPORT, exactly the Claim, and for COMPARISON, the compared entities; a PROFILE about the graph itself, such as D11's identifier-coverage profile, has none; adversarial review); `DERIVED_FROM` → every Assertion and Assessment whose content a report sentence rests on (the report ledger's citations resolve to these), whichever Claim an assertion is an occurrence of: a report about a refined Claim may cite an occurrence of the general Claim that a sentence relies on (rpt-refined cites a-occ-pacholec as context), while counts of a Claim's evidence always go through OCCURRENCE_OF, never through citations; `HAS_EVIDENCE` → every SourceLocator it quotes; `WAS_GENERATED_BY` → the composing Activity (EVIDENCE_MISSION, ANSWER, or PROJECTION for a PROFILE) with `policyVersion` and `bundleDigest`; `citationCompleteness` (verification.v1 claim-weighted citation completeness) recorded. Report-internal sentences (verification.v1 `report_assertion` with offsets) stay in the ledger, digest-referenced.

## Claim lifecycle (00-DIRECTIVE 3.4) at kernel level

```
(:Assertion {assertionKind: CLAIM, speechAct, polarity, basisKind})-[:OCCURRENCE_OF]->(:Claim)   who said it, where: ASSERTED_BY, HAS_EVIDENCE → SourceLocator
      retelling: (:Assertion {basisKind: CITED_FROM_PRIOR_WORK})-[:DERIVED_FROM]->(primary occurrence)
(:Assessment {assessmentKind: VETTING, disposition: IGNORE|MONITOR|RESEARCH})-[:ASSESSES]->(:Claim)
      -[:WAS_GENERATED_BY]->(vet:Activity {activityKind: VETTING})
(mission:Activity {activityKind: EVIDENCE_MISSION, missionId, runId})-[:ASSESSES]->(:Claim)          the claim under test (model stage)
      (mission)-[:WAS_INFORMED_BY]->(vet)   (mission)<-[:WAS_INFORMED_BY]-(:Activity {activityKind: VERIFICATION, bundleDigest})
(:Adjudication {adjudicationKind: SUPPORT, verdict})-[:ASSESSES]->(occurrence)   -[:HAS_EVIDENCE {role, origin, authority, independence}]->(:SourceLocator)
(:Report {reportKind: EVIDENCE_REPORT, verdict, worldCorrectness, policyVersion, bundleDigest})-[:ASSESSES]->(:Claim)
      -[:DERIVED_FROM]->(:Assertion|:Assessment)   -[:HAS_EVIDENCE]->(:SourceLocator)   -[:WAS_GENERATED_BY]->(mission)
refinement: (:Assessment {assessmentKind: EQUIVALENCE, assessmentSubkind: 'K.claim-relation', conclusionCode: REFINES})-[:ASSESSES]->(general), (narrow)
      narrow.refinesClaimUid = general.uid   (cache)
third party: (:Assertion {predicate: RATES_CLAIM, valueString: rating})-[:HAS_SUBJECT]->(:Claim)   -[:ASSERTED_BY]->(reviewer Organization)
```

Lifecycle states (`Claim.lifecycleState`, a projection cache): EXTRACTED (occurrences only) → IGNORED / MONITORED / QUEUED_FOR_RESEARCH (latest current VETTING disposition) → UNDER_RESEARCH (an EVIDENCE_MISSION Activity ASSESSES the Claim, no current report) → REPORTED (a current EVIDENCE_REPORT). MONITOR's trigger is the Q-K-26 pattern (new occurrences or evidence after the vetting date). The verdict an evidence report states is about the exact Claim it ASSESSES (its propositionHash): the FC-2 story yields MIXED_OR_CONFLICTING for "resveratrol directly activates SIRT1" and SUPPORTED_WITH_QUALIFICATION for the refined "… with substrates carrying hydrophobic motifs", which is why refinement is a first-class link. Patterns: 03 Q-K-08, Q-K-09, Q-K-11, Q-K-19, Q-K-21, Q-K-26, Q-K-27.

## Lineage spine: Activity ↔ Mission Control (00-DIRECTIVE 4, ADR 0004)

- **Granularity (decision needed by the research stage, decided here): one Activity per run.** Identity `(externalRunSystem, runId)`. The intents a run applied are list-valued on the Activity (`operationIds`, `intentDigests`, `planDigests`, `receiptIds`, in apply order); each receipt is tied to its graph effects by the executor's `KsIntentMarker` in the same transaction, so "which intent wrote X" is answered by the receipt, not by a second node. Retries (Mission Control attempts) keep the run identity and the marker dedupes them, so an attempt never writes distinct graph content and gets no Activity. Rejected: one Activity per applied intent (identity `(system, runId, operationId)` + WAS_INFORMED_BY to a run Activity) — it doubles the lineage nodes and makes "what did run R write" two hops, for a question (which intent) the receipt already answers.
- **What points at the Activity.** Nodes: `WAS_GENERATED_BY`, written on create **and update** (executor change P9), so a node may point at several Activities; its creator is the earliest by `startedAt`. Edges: `lastWriterRunId` (overwritten by later writers, used only for "last touched by"); asserted episodes are found from their authorizing Assertion with both endpoints bound (03 conventions), so lineage over edges needs no relationship scan. Published artifacts: the Report's `WAS_GENERATED_BY` → the composing Activity, which carries `policyVersion` and `bundleDigest`. Projections: the PROJECTION Activity with `methodVersion`; derived edges carry its run id.
- **The four lineage questions** are 03 Q-K-04 (what did mission M produce), Q-K-05 (which missions touched X, in which role), Q-K-06 (blast radius), Q-K-07 (what changed between two runs), each exercised by `07-fixtures/two-run-lineage`. Because WAS_GENERATED_BY is written on update and ASSESSES targets any Subjectable, Q-K-06 walks only from the kernel records M created and lets an ASSESSES hop count only when it ends at a Claim or an Assertion; domain entities M touched are listed, not walked (adversarial review; the fixture has a must-not-appear row). Q-K-07 has no database support (no `as-of`/`since` in Neo4j; the Mission Control annex forbids inventing a knowledge sequence), so it rests on three things the executor must provide: WAS_GENERATED_BY on update (P9), `recordedAt`/`recordedTo`/`supersedesUid` on records and `recordedFrom`/`recordedTo` on episodes, and the relationship-property indexes (P13), which are therefore required, not optional.
- **Evidence missions close the loop**: the mission's Activity ASSESSES the Claim (so one vetting run that queues five claims still yields an unambiguous mission ↔ claim link) and WAS_INFORMED_BY the vetting run; its Report is WAS_GENERATED_BY it. "Which mission tested this claim, with what verdict" is Q-K-08.

## MENTIONS, SUPPORTS, CONTRADICTS in practice (00-DIRECTIVE 3.8)

| relation | kernel form | class | who writes it | never |
| --- | --- | --- | --- | --- |
| mention (text names an entity) | D9 `Chunk.mentions` — `MENTIONS` with `DerivedEdgeProperties` (`derivationRule` entity-link/vN, licensing RESOLUTION Assessment uid); the surface form itself is a SourceLocator cited by that Assessment | derived | the entity-link projection Activity | evidence; a mutation input; a reason to write an asserted edge |
| span covered by a chunk | D9 `Chunk.locators` — `COVERS_LOCATOR` (derived span overlap) | derived (D9) | D9 projection | a locator (a chunk is never a locator) |
| support / contradiction / qualification | `HAS_EVIDENCE {role: SUPPORTS|CONTRADICTS|QUALIFIES|CONTEXT, origin: DECLARED|VERIFIER_FOUND, authority, independence}` from Assertion, Adjudication, Assessment or Report to a SourceLocator | structural | the extractor (DECLARED, role and origin only, on its own Assertion) and the verifier (VERIFIER_FOUND with authority / independence / facet, on Adjudications) | document → entity; chunk → entity; entity → entity with a confidence |
| verdict | `Adjudication.verdict` (lattice) and `Report.verdict` | record | verification.v1 ingest; report.publish | an edge |

Effectiveness test (03 Q-K-14, fixture `hubbard-2013-unstructured-to-entity`): question → chunk (vector index or MENTIONS) → COVERS_LOCATOR → the accepted Assertion whose HAS_EVIDENCE is that locator → snapshot digest; the verifier's Adjudication cites the same locator with the same `expectedSelectedContentDigest`. Two traps the fixtures must show: the same sentence in two renditions (two Sources, one family for independence counting) and a quote that occurs twice in one capture (TEXT_QUOTE needs prefix/suffix or a position).

## Model stage decisions (alternatives considered)

| # | decision | alternatives considered | chosen and why | questions |
| --- | --- | --- | --- | --- |
| M1 | Activity granularity | per run; per applied intent; per attempt | **per run** with list-valued intent/plan/receipt ids — one hop from run to everything it wrote; the receipt answers "which intent" (above) | Q-K-03, Q-K-04, Q-K-07 |
| M2 | mission ↔ claim link | WAS_INFORMED_BY to the vetting run only; new `TESTS_CLAIM`; PROV `USED`; `testedClaimUid` property | **`Activity.about` over ASSESSES** (kernel meaning "is about"), 0 new types, +1 pair. WAS_INFORMED_BY alone is ambiguous when a vetting run queues several claims; a new type breaks the 14-type budget; a property cannot be traversed for Q-K-19's NOT EXISTS | Q-K-05, Q-K-08, Q-K-19, CQ-AX-04 |
| M3 | claim refinement | REFINES relationship; `assessmentSubkind: REFINES` (research note); property only | **second Claim + EQUIVALENCE Assessment (`K.claim-relation`, `conclusionCode: REFINES`) + `Claim.refinesClaimUid` cache** — the assessment records who decided and why; ASSESSES carries no role, so the cache states which Claim is the narrower; a typed edge has one question (Q-K-08) and no depth | Q-K-08, Q-K-21 |
| M4 | third-party verdicts | `ClaimReview` node; our Assessment; Report | **Assertion `RATES_CLAIM` by the reviewer** (subject the Claim, rating in `valueString`, scale in qualifiers) — it is a statement by another asserter with a locator; mapping to the lattice is a versioned D10 rule applied at query time | Q-K-23, Q-K-27 |
| M5 | retellings | `RETELLS` edge; RETELLING_FIDELITY Assessment only | **DERIVED_FROM Assertion → Assertion with `basisKind: CITED_FROM_PRIOR_WORK`** (PROV: quotation and primary-source are sub-properties of derivation); fidelity stays a D9 Assessment | Q-K-21, Q-K-30 |
| M6 | retraction status | `SourceRevisionEvent` node; snapshot property only | **HAS_REVISION_STATUS Assertion per authority + `SourceSnapshot.revisionKind` cache** — Crossref's `source: retraction-watch` vs publisher, and PubMed's `RetractionIn`, are different asserters with different dates (FC-3) | Q-K-10, Q-K-22, CQ-TM-02 |
| M7 | per-evidence authority and independence | SOURCE_AUTHORITY Assessment per source; `Adjudication.sourceAuthority` only | **`authority`, `independence`, `facet` on EvidenceEdgeProperties**, verifier-set — verification.v1 puts the authority vector on each EvidenceEdge; an Assessment per source would multiply nodes for a value the verifier already emits. Adversarial review: written only on Adjudication edges (one copy, no rewrite of the extractor's DECLARED edges); readers join the Adjudication's edge to the span the assertion declared | Q-K-15, Q-K-21 |
| M8 | report-wide numbers | `ReportStatement` nodes; nothing | **properties on Report** (`independentSourceFamilyCount`, `distinctSourceFamilyCount`, `unsupportedHighSeverityCount`, `worldCorrectness`, `skeletonKey`, `recordedTo`) — cheap filters; sentences stay in the sealed ledger | Q-K-21, Q-K-25, Q-K-26 |
| M9 | typed assessment fields requested by D3, D4, D5, D7, D10, D13 | one field per request (signalStatus, severity, severityScheme, relevanceLevel, comparabilityVerdict, impactDomain …); domain assessment types | **five shared slots**: `gradeScheme`, `grade`, `certainty`, `conclusionCode`, `facets` — every request maps onto them (CTCAE severity = gradeScheme + grade; signal status, comparability verdict, relevance level = conclusionCode; impact domain, relevance basis = facets); Assessment has 20 own properties after them (split threshold ~25) | Q-K-13, Q-K-21 and the domains' questions |
| M10 | recorded-only asserted edges (D1, D8, D13) | AssertedEdgeProperties with null valid bounds | **`AssertedRecordedProperties`** — 00-DIRECTIVE rule 9 asks that edges without a valid-time question carry recorded time only; the Assertion still holds any valid time the source states | Q-K-02, Q-K-07 |
| M11 | domain-local edge-property types (D1, D2, D6, D7, D12, D13) | forbidden (qualifiers as Assertion.qualifiers strings); a generic kernel qualifier type | **allowed as supersets of a kernel base type** (rules in the pattern) — quantities and roles must be filterable; a generic type would be a bag of nullable fields on every edge | domains' questions |
| M12 | Q-K-07 without a database as-of | per-node `runIds` list; a graph revision counter | **multi-valued WAS_GENERATED_BY + record clocks** — the annex forbids inventing a knowledge sequence; a list property cannot be traversed | Q-K-05, Q-K-07 |
| M13 | VerificationRun node vs digest | node with per-run metrics | **digest on the VERIFICATION Activity** (PLAN 6.2 decision 1, re-confirmed: every bundle top-level field is an Activity property or already a graph record; no K question traverses a bundle) | Q-K-03 |

## Kernel requests from domain packets (answered in the model stage)

Read from the sibling worktrees' `11-open-questions.md` on 2026-10-08 (A1 D10, A2 D1/D12, A3 D2/D4, A5 D5, A6 D6/D7, A7 D8/D13, A8 D9). Every accepted change is additive.

| request | from | decision | where |
| --- | --- | --- | --- |
| domain-local edge-property types (quantities, roles, stakes) | D1 OQ-D1-01, D2 #1, D6 OQ-D6-01, D7 OQ-D7-01, D12 OQ-D12-01, D13 #1, D8 OQ-D8-09 | **accepted** with the superset rule (M11) | pattern "Edge-property types"; change 2 |
| recorded-only asserted edge type | D8 OQ-D8-13, D1 OQ-D1-18, D13 #2 | **accepted**: `AssertedRecordedProperties` (M10) | SDL; change 1 |
| typed grading fields (gradeScheme, grade, certainty) | D10 #8 (D3) | **accepted** | Assessment; change 4 |
| typed signalStatus, severity, severityScheme | D5 OQ-D5-04 | **mapped**: severity → gradeScheme + grade; signal status → conclusionCode (D5 registers the vocabulary) | M9 |
| comparability verdict | D4 #1 | **mapped**: `assessmentKind: COMPARABILITY` (new value) + conclusionCode COMPARABLE / COMPARABLE_WITH_CONVERSION / NOT_COMPARABLE / UNKNOWN | change 4 |
| conflict-relevance facets | D7 OQ-D7-03 | **mapped**: conclusionCode = relevance level; `facets` for relevanceBasis, temporalOverlap, disclosureFinding | M9 |
| BREAKTHROUGH_JUDGMENT, EVENT_IMPACT kinds; impactDomain | D13 #6 | **accepted** both kinds; impactDomain → `facets` (`impactDomain=MARKET`) | change 4 |
| `observedAt` on AssertedEdgeProperties | D7 OQ-D7-07 | **accepted on the Assertion** (`validObservedAt`), **not** on the edge types (the Assertion is the valid-time authority; adding it to the base edge types would force every domain superset type to change); revisit if a D7 question filters edges by it | change 5 |
| `Report.skeletonKey` | D10 #7 | **accepted** (also covers D13 frontier brief and D6 avoidance report without new ReportKind values) | change 4 |
| ASSESSES / DERIVED_FROM declared on domain types | D10 #9, #1 | **accepted** as "kernel types with kernel meaning" | pattern item 11; change 3 |
| evidence-report verdict vocabulary | D10 #11 | keep the lattice on `Report.verdict`; **add `Report.worldCorrectness`** (verification.v1 orthogonal property) for the "did the claim survive" reading | change 4 |
| `ReportStatement` node | D10 #12 | **declined** (ledger digest; D10 rows) | node register deferred |
| Assessment / Report implement Subjectable | D10 #13 | **deferred**: no K question needs an assessment about a report; a correction is an Assessment about the misquoted Assertion. Adding the interface later is additive | 11-open-questions |
| currency in `unitCode` | D6 OQ-D6-06 | **accepted**: `iso4217:<CODE>` | Assertion docstring; pattern item 12 |
| `field_not_reported` convention | D4 #16 | **accepted** kernel-wide as `FIELD_NOT_REPORTED` | predicateOnly; pattern item 12 |
| measured nulls (no "no change" polarity) | D2 #4 | **accepted** as a kernel-wide rule (POSITIVE + NO_CHANGE/NO_EFFECT predicate + DIRECT_MEASUREMENT) | pattern item 12 |
| `INFERRED_BY_ORTHOLOGY` basis | D2 #3 | **declined**: `INFERRED_FROM_MEASUREMENT` + `derivationRule: orthology/<authority>` answers every listed question | 11-open-questions |
| removing derived edges when inputs vanish | D2 #17 | **allowed**: derived edges are regenerable projections, not records | pattern "Edge-property types" |
| predicate registry | D1 OQ-D1-16 | **open**: the assembled 05 registers' `predicateOnly` lists are the registry until the synthesizer emits one file | 11-open-questions |
| typed `populationScope`, `valueCode` | D5 OQ-D5-05, OQ-D5-14 | **declined for now**: `qualifiers` (`population:<code>`) and `valueString` with executor validation of D5 predicates | 11-open-questions |
| structural record from a located span (`ProtocolStep.locatorUid`) | D5 OQ-D5-16 | **open**: the attach Assertion citing all step locators is the sanctioned form; a uid-valued property is tolerated as a cache | 11-open-questions |
| identifier schemes | D1, D2, D4, D5, D6, D7, D8, D9, D13, K research | **added** to `identifier-schemes.yaml` v2 (56 rows `status: requested`; CHEMBL_TARGET folded into CHEMBL; MESH and SNOMEDCT gain D5) | identifier register |
| node-register `mutations` field vs `@mutation(operations: [])` | D1 OQ-D1-20, D5 OQ-D5-26, D7 OQ-D7-24 | K records `{ graphql: none, executor: … }` per type; recommend the synthesizer read the field that way | 11-open-questions |
| `EffectDirection` vs D5's OutcomeDirection | D12 OQ-D12-12 | kernel `EffectDirection` on Assessments; target-effect Assertions use D5's closed predicates; no enum merge | — |
| **D9 requests still open after the model stage (D9 11-open-questions C-7; answered in the adversarial review)** | | | |
| K-2 `CORRECTS` / `QUALIFIED_BY` typed edges | D9 K-2 | **declined as types; D9's interim is the kernel form**: a correction is an occurrence with predicate `CORRECTS` DERIVED_FROM the corrected occurrence; a qualification is `HAS_EVIDENCE {role: QUALIFIES}` + a registered `qualifiers` prefix. Q-D9-04 / Q-D9-05 filter by predicate and `qualifiers: { includes }` | pattern item 12; change 15 |
| K-3 `Assessment.aboutAssertions` (ASSESSES → Assertion) | D9 K-3 | **declined** (+1 pair for a case DERIVED_FROM already carries): an assessment ASSESSES the occurrence's Claim and is DERIVED_FROM the judged occurrence(s), roles in facets; Q-K-30 already reads it that way | pattern item 8; change 15 |
| K-5 `Assertion.segmentKind` | D9 K-5 | **declined as a field; qualifier `segment:<KIND>`** with D9's registered kinds. CQ-CL-08 (value 1) excludes sponsor reads with `qualifiers: { includes: "segment:SPONSOR_READ" }` in GraphQL or `'segment:SPONSOR_READ' IN a.qualifiers` in Cypher; the executor maps the intent contract's `segmentKind` onto the qualifier (P21) | pattern item 12; Assertion docstring |
| K-6 D9 `Channel {channelKind: ACCOUNT}` as asserter | D9 K-6 | **accepted**: ASSERTED_BY admits an ACCOUNT channel when no Person is identified; a RESOLUTION Assessment links it to a D7 Person later; asserter track records (Q-K-23) then read the account until resolved | assertedBy docstring; pattern item 9; executor P20; change 15 |
| K-7 BasisKind THIRD_PARTY_ANECDOTE, MECHANISM_REASONING | D9 K-7 | **accepted** (two enum values, ≈ 0 bytes): a report of someone else's experience and an argument from mechanism are different bases from PERSONAL_EXPERIENCE and EXPERT_OPINION for weighing biohacker claims | BasisKind; change 13 |
| K-9 rendition-level duration | D9 K-9 | **declined as a kernel field**: an Assertion per rendition with the rendition's `Source` as subject (`valueNumber`, `unitCode: s`, predicate registered by D9); the Source is Subjectable | pattern item 12 |
| K-10 AssessmentKind DISCOURSE_METRIC | D9 K-10 | **declined**: per-node discourse measures (independence count, spread, influence) are materialized, regenerable projections (00-DIRECTIVE 3.6), not asserted judgments; D10 decides their form (a projection cache with methodVersion, or a one-member Association). Interim `OTHER` + subkind `D9.<metric>` tolerated | 11-open-questions 34 (owner D10 + D9) |
| K-11 locator offset basis on SourceLocator | D9 K-11 | **declined**: the offset basis stays in `selectorJson`; D9's derived COVERS_LOCATOR into SourceLocator is accepted (already a seam), and the projection reads the basis once at derivation time | 10-seams |
| C-6 `Chunk` without the `Entity` label | D9 C-6 | **accepted**: the `Entity` label marks the entity archetype only (rule above, "The `Entity` storage label") | pattern "The two interfaces"; change 16 |
| **Other review rulings** | | | |
| Report about the graph (PROFILE, no ASSESSES) generated by PROJECTION | D11 10-seams | **accepted**: `Report.about` zero_or_more for a PROFILE about the graph; `generatedBy` may be EVIDENCE_MISSION, ANSWER or PROJECTION; ASSESSES stays required for EVIDENCE_REPORT and COMPARISON | Report docstrings; decision 4; change 16 |
| DERIVED_FROM → D10 Association | D10 ReportItem.citesAssociations | **accepted** with kernel meaning | pattern item 11; change 16 |

## Size estimate

- node types: **11** (budget 12) — Source, SourceSnapshot, SourceLocator, Assertion, Adjudication, Claim, Assessment, Report, Activity, Agent, Identifier. `Mention` was cut in the adversarial review (06 deferred).
- relationship types: **13** (budget 14) — HAS_SNAPSHOT, HAS_LOCATOR, HAS_SUBJECT, HAS_OBJECT, ASSERTED_BY, HAS_EVIDENCE, ASSESSES, DERIVED_FROM, OCCURRENCE_OF, WAS_GENERATED_BY, WAS_ASSOCIATED_WITH, WAS_INFORMED_BY, HAS_IDENTIFIER. `MENTIONS` keeps its kernel meaning (pattern items 4 and 11) but is declared and registered only by D9 (Chunk.mentions).
- from→to pairs: **32** by `packet-check` (budget 40), computed as the number of relationship fields (an interface target counts 1). Of these, 27 are distinct stored from→to pairs and 5 are inverse read fields of a stored pair (SourceSnapshot.source, Assertion.adjudications, Claim.occurrences, Claim.assessments, Claim.reports). The model stage added one pair (Activity.about → Subjectable over ASSESSES); the adversarial review removed three (Mention.span, Mention.resolvedTo, Adjudication.considers).
- widest union target: **none** (0 unions); interface targets `Subjectable` and `Entity`.
- most relationship fields on one type: Assertion, 8 (limit 12).
- own scalar properties per type (excluding the 7 Entity fields): Assertion 28, Report 21, Adjudication 20, Assessment 20, Activity 16, SourceLocator 15, SourceSnapshot 14, Claim 6, Identifier 6, Agent 5, Source 4.
- printed executable (`BKS_SCHEMA_PATH=<abs> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs out>`, deployed server options, @neo4j/graphql 7.6.3; files in scratch `ft/K/model/out*`):

| SDL | bytes | lines | `^input ` | build |
| --- | ---: | ---: | ---: | --- |
| kernel, Wave 0 (`K-wave0`, sha256 0ad41559…) | 326,564 | 6,582 | 185 | ~1 s |
| **kernel, model stage** (`compile.graphql` = this `04`, sha256 790e7244…) | **345,273** | **6,927** | **192** | < 1 s |
| marginal cost of the model-stage changes | +18,709 | +345 | +7 | |
| kernel (model) + `domain-template.graphql` | 375,331 | 7,526 | 209 | < 1 s |
| template marginal (Wave 0 and model stage identical) | +30,058 | +599 | +17 | |
| kernel (model) + D10 draft (A1 worktree, unchanged) | 440,520 | 8,753 | 235 | ~1 s |
| **check stage re-run** (2026-10-08, same `04` sha256 790e7244…; scratch `ft/K/check/compile/`): kernel alone · + template · + D10 | 345,273 · 375,331 · 440,520 | 6,927 · 7,526 · 8,753 | 192 · 209 · 235 | ~4 s wall each (pnpm) |
| kernel + all 13 domain drafts as they stood in A1–A8 at the check stage (D1…D13 `04` concatenated, no stubs; sha256 of the concatenation baa9873f…) | 1,799,182 | 36,110 | 1,038 | 2 s |
| **kernel, adversarial review** (this `04`, sha256 b2c2b1b0…; scratch `ft/K/adv/compile/`; output is not the pinned 55 MB schema) | **322,904** | **6,466** | **179** | 1 s build (6 s wall with pnpm) |
| marginal cost of the review changes (Mention and its 2 fields, Adjudication.considers removed; 2 BasisKind values added) | −22,369 | −461 | −13 | |
| kernel (review) + `domain-template.graphql` | 357,817 | 7,132 | 198 | < 1 s |
| template marginal (review): rises because the kernel no longer uses `DerivedEdgeProperties`, so the template pays for its 3 types | +34,913 | +666 | +19 | |
| kernel (review) + D10 draft (A1 worktree) | 423,006 | 8,359 | 224 | ~1 s |
| kernel (review) + all 13 domain drafts as they stand in A1–A8 now (no stubs; sha256 of the concatenation 1787d2ac…) | 1,746,992 | 34,820 | 986 | 3 s build |

  The +7 inputs come from the new enums used as filterable properties (EvidenceAuthority, EvidenceIndependence, EvidenceFacet, CertaintyLevel), the new edge-property type, and Activity.about's connection/where inputs; the D10 draft compiles unchanged against the amended kernel, which is the additivity check. Kernel + D9 draft does not compile without stubs for D7 types (Organization, Brand, Person), as expected for a domain draft with seams. Check stage: the kernel was not changed after the model stage and the re-run reproduces the model-stage numbers byte for byte; the kernel plus all thirteen domain drafts of that moment compile together with no stubs (every seam resolves; a name grep finds no domain draft re-declaring any kernel type, interface, enum or edge-property type), which is the strongest additivity evidence available before synthesis. Caveat: the type-defs merge unions duplicate definitions silently, so a clean compile does not prove there are no duplicates. The grep found one: `enum MassBasis` is declared by both D1 and D3 with different members (D3 lacks NUTRIENT_EQUIVALENT). It is recorded for the synthesizer in `11-open-questions.md` 31. The drafts were still moving; the number is a snapshot, not a budget figure.

## Wave 0 decisions (alternatives considered, what was cut and why; still in force)

Pinned kernel-adjacent fragments W00 (13 types, 37 relationship types), W19 (3), W20 (4), W23 (3) → 12 types, 14 relationship types.

| pinned element | decision | reason |
| --- | --- | --- |
| six archetype interfaces (EntityArchetype, VersionedStateArchetype, OccurrenceArchetype, InformationArtifactArchetype, AssertionArchetype, EvidenceAssessmentArchetype), SearchIndexable, TemporalSnapshot, ActorIdentity | cut; archetype stays a stored label (`Entity`, `InformationArtifact`, `Occurrence`, `EvidenceAssessment`, `VersionedState`); two interfaces remain: `Entity`, `Subjectable` | no question filters by archetype through GraphQL; every interface field must be listed on every implementer |
| `AssertionSubjectTarget` (144-member union, 17 fields), `AsserterTarget`, `SupportedRecordTarget` | → `Subjectable` interface, fields declared once | lever matrix: union +3.6 KB / +20 inputs per member |
| SourceRevisionEvent, PRIOR_SNAPSHOT, RESULTING_SNAPSHOT, ANNOUNCED_IN, REVISES_SOURCE | → `SourceSnapshot.revisionKind` + `revisesSnapshotUid` | a retraction is a capture of the notice; Q-K-10 is answered by a property join |
| ResolutionHypothesis, EquivalenceAssessment, PROPOSES_MATCH, COMPARES_IDENTITIES, COMPETES_WITH, RESOLVES_MENTION | → `Assessment` (RESOLUTION, EQUIVALENCE) `ASSESSES` the candidates; Wave 0 also had `Mention.resolvedTo` (MENTIONS, derived), cut in the adversarial review | one judgment archetype; competing hypotheses are sibling Assessments that cite the same surface-form span |
| TradeItemIdentifier | → `Identifier` with scheme GTIN/UPC/EAN/ASIN/SKU | same identity rule; planner change |
| SourceAuthorityAssessment (W19) | → `Assessment` SOURCE_AUTHORITY about a Source, `assessmentSubkind` = claim kind | authority is per claim kind; register content is D9's |
| SourceCoverageRequirement, SourceDiscoveryRecord (W19) | deferred to D11's action-space registry (operational, not graph) | no user question traverses them |
| Document, DocumentTextVersion, Segmentation, Chunk (W20) | → D9 | retrieval structure; D9 researches its questions |
| AnswerRecord (W23) | → `Report {reportKind: ANSWER, queryDigest}` | one published-artifact skeleton |
| PolicyVersion, DecisionCriterion, AUTHORIZED_BY + AuthorizationProperties (W23) | → D10; kernel carries `policyVersion` ids on Report and Activity | a property suffices until a question traverses policies |
| SUPPORTED_BY, CONTRADICTED_BY, SUPPORTED_BY_CHUNK | → `HAS_EVIDENCE {role, origin}` | mirrors verification.v1 EvidenceEdge; contradiction is a role on located evidence (3.8) |
| EVALUATES, ABOUT, CITES_ASSESSMENT (as target) | → `ASSESSES` | one "judges / is about" type for Adjudication, Assessment, Report |
| DERIVED_FROM_ASSERTION, CONSIDERS_ASSESSMENT, CITES_ASSERTION, CITES_ASSESSMENT | → `DERIVED_FROM` (PROV-O wasDerivedFrom) | one dependency edge makes "what depends on mission M" a single variable-length pattern |
| INSTANCE_OF (Assertion → Claim, derived) | → `OCCURRENCE_OF` (structural) | the extractor knows which proposition it extracted; re-clustering is an EQUIVALENCE Assessment |
| MENTIONS (locator → Mention), MENTIONS_ENTITY (chunk → entity) | Wave 0: `Mention.span` (HAS_EVIDENCE) and `MENTIONS` (derived, → Subjectable) for both Mention and D9 Chunk; adversarial review: Mention cut, so the span is cited by the RESOLUTION Assessment and MENTIONS exists only on D9 Chunk | 3.8: MENTIONS is the derived retrieval projection |
| SUPERSEDES + SupersessionProperties | → `supersedesUid` (+ `recordedTo` on the older record) | no question traverses supersession chains deeper than one hop |
| REANCHORS + ReanchorProperties | → `SourceLocator.reanchorsLocatorUid`, `reanchorMatch` | same |
| USED (Activity → snapshot/locator/assertion/…) | cut | the claim a mission tests is reached by `WAS_INFORMED_BY` + `ASSESSES`; inputs of assessments and reports are `DERIVED_FROM` |
| ASSESSED_BY (→ Agent / Person), ACTED_ON_BEHALF_OF | → the Activity's Agent; acting-for an Organization deferred to a D7 seam | one way to say who judged |
| WAS_GENERATED_BY forward fields on every type (15 pinned inverse fields on Activity) | `Activity.generated: [Entity!]!` once + forward `generatedBy` on Assertion, Adjudication, Assessment, Report | interface target costs ≈ 0 per implementer |
| `mongoResearchRunId`, `externalRunId`, `agentRunUid` | → `lastWriterRunId`, `Activity.runId` | ADR 0004 rename |
| `Activity.externalRunSystem` kept; new `missionId`, `activationId`, `operationId`, `operationKind`, `intentDigest`, `planDigest`, `receiptId`, `bundleDigest`, `policyVersion`, `policyOutcome` | directive 4.1 | the lineage spine carries Mission Control and verification identity (model stage: operationId, intentDigest, planDigest, receiptId became lists, change 8) |

Alternatives rejected for the subject pattern: (a) wide `Entity` as the only target — same cost, but makes kernel records (snapshots, adjudications) legal subjects; (b) `@cypher` read fields — 14–50 KB smaller fixed cost but no relationship filters, no connections, and HAS_IDENTIFIER episode properties become unreadable; forward per-type fields (`identifiers` on every domain type) — +19.7 KB and +7 inputs per type.


## Bitemporal decision per edge

| edge | temporal | why |
| --- | --- | --- |
| HAS_IDENTIFIER | **episode** (`IdentifierLinkProperties`) | an identifier's assignment to a record has validity (a GTIN reassigned, a UNII deprecated); Q-K-12 and Q-K-29 read it |
| domain asserted edges a question reads as of a valid time | **episode** (`AssertedEdgeProperties`) | "what did we believe about X on date D for period V" (Q-K-02) reads the episode |
| domain asserted edges no question reads by valid time | recorded-only (`AssertedRecordedProperties`, model stage) | 00-DIRECTIVE rule 9; the authorizing Assertion keeps any stated valid time; Q-K-07 still reads `recordedFrom`/`recordedTo` |
| domain state attachments | **episode** (`StateEpisodeProperties`) | which formulation / label version was current when |
| HAS_SUBJECT, HAS_OBJECT, ASSERTED_BY, HAS_EVIDENCE, OCCURRENCE_OF, ASSESSES (incl. Activity → Claim), DERIVED_FROM | recorded-only (part of an immutable record) | time lives on the record node (Assertion valid + recorded time; Adjudication / Assessment / Report `recordedAt` / `recordedTo`; Activity `startedAt` / `endedAt`) |
| HAS_SNAPSHOT, HAS_LOCATOR | recorded-only | snapshots are immutable captures with their own clocks (`retrievedAt`, `publishedAt`, `observedAt`) |
| WAS_GENERATED_BY, WAS_ASSOCIATED_WITH, WAS_INFORMED_BY | recorded-only | lineage facts never change |
| MENTIONS (D9 Chunk) and D9 COVERS_LOCATOR | recorded-only (`derivedAt`, `derivationRule`) | derived, regenerable |

No K question needs an episode on a kernel structural edge (research stage re-check; confirmed by the 03 patterns: only Q-K-02, Q-K-12 and Q-K-29 read an episode's valid time).

## Budget excess

None: 11 / 12 node types, 13 / 14 relationship types, 32 / 40 pairs, 0 unions (adversarial review; was 12 / 14 / 35). No `EXCESS:` line is needed.

## Risks

- **Executor changes are required before the slim kernel is writable** (`11-open-questions.md` P1–P13, plus P14–P19 added in the model stage: list-valued Activity fields, Activity.about at run start, verifier-set authority/independence/facet on HAS_EVIDENCE, `AssertedRecordedProperties` writes; P18–P19: refinement-cache rewrite and the report.publish fields; P8 amended and P20–P21 added in the adversarial review: no Mention node, ACCOUNT channels as asserters, `segmentKind` → qualifier).
- **Removing Mention moves "unresolved surface forms" into locators.** A question that must list surface forms nobody has resolved yet scans locators without a current ACCEPTED RESOLUTION Assessment; that is a Cypher anti-join, not a GraphQL filter. Acceptable while Q-K-13 is value 2; promote a node again if a value-1 question needs it (06 deferred).
- **Assertion is wide** (28 own properties, 8 relationship fields). It is the authority record and every property is either verification.v1-mandated or read by a K pattern; the risk is that domains push typed literal slots onto it (D5 asked for `valueCode` and `populationScope`, declined for now). Split threshold: a request that only one domain reads goes to `qualifiers`.
- **Generic Assessment** now carries five shared typed slots; the meaning of `conclusionCode` and `facets` depends on the registered subkind vocabulary. Without a vocabulary file per subkind the slots become free text. Mitigation: each owning domain lists its subkinds and codes in its `09-reasoning.md`; the synthesizer assembles them into one register (open question).
- **Activity is a per-run hub** (every node a run writes points at it, now also on update). Bounded by run size; `Activity.generated` reads must paginate; Q-K-04/05/07 use the node side first.
- **Relationship-property indexes are per relationship type in Neo4j**; the lineage and staleness patterns avoid scans by binding endpoints through the authorizing Assertion, but derived-edge checks (CQ-AX-08, Q-K-06 derived part) need one index per derived type, generated from the assembled registers.
- **Report verdict vs Assertion status**: two related vocabularies with different meanings (truth of a claim after a mission vs capture fidelity of a record). Docstrings, the mapping table and `Report.worldCorrectness` are the guard.
- **Refinement cache drift**: `Claim.refinesClaimUid` is a cache of an Assessment; if the assessment is superseded the cache must be rewritten by the same intent (executor rule, open question).
- **Domain-local edge-property types** must track additive changes of their kernel base type; the synthesizer checks the verbatim-prefix rule mechanically.

## With twice the budget

A `SourceRevisionEvent` node (publisher revision with issuer time, one per notice), a `Mention` node for unresolved surface forms (cut in the adversarial review), a `PolicyVersion` node in the kernel, `USED` edges for full PROV (inputs of every run), a separate `ResolutionHypothesis` type with `COMPETES_WITH`, a typed `REFINES` edge between Claims, forward `generatedBy` on every kernel type, a `VerificationRun` node carrying per-run metrics, and a `ReportStatement` node per ledger sentence so sentence-level traces run in Cypher without the ledger.

## Kernel pattern changes

Every entry is additive for domain modules (nothing a domain module declares or references was renamed or removed; entry 8 renames kernel-internal Activity fields); the pattern section above was updated in the same edit.

1. **2026-10-08, model stage — new kernel edge-property type `AssertedRecordedProperties`** (relationshipUid, assertionUid, recordedFrom, recordedTo, lastWriterRunId) for asserted edges without a valid-time question. Reason: 00-DIRECTIVE rule 9; D1, D8, D13 requests. Pattern: "Edge-property types" table.
2. **2026-10-08 — domain-local edge-property types allowed** as supersets of a kernel base type (verbatim base fields first, then filterable qualifiers). Reason: D1, D2, D6, D7, D12, D13 need quantities, roles and stakes a question filters; the Wave 0 wording ("the only ones a domain module uses") is relaxed, not reversed. Pattern: "Edge-property types" paragraph and "What a domain module writes" item 6.
3. **2026-10-08 — kernel relationship types with kernel meaning on domain types**: `ASSESSES` joins `DERIVED_FROM` and `MENTIONS`. Reason: D10 ReportItem; lineage patterns match by type. Pattern: item 11 and "Directive discipline".
4. **2026-10-08 — additive fields and enum values on kernel types**: `EvidenceEdgeProperties.authority / independence / facet` (+ enums EvidenceAuthority, EvidenceIndependence, EvidenceFacet); `Assessment.gradeScheme / grade / certainty / conclusionCode / facets` (+ enum CertaintyLevel); `AssessmentKind` + COMPARABILITY, EVENT_IMPACT, BREAKTHROUGH_JUDGMENT; `Report.skeletonKey / worldCorrectness / independentSourceFamilyCount / distinctSourceFamilyCount / unsupportedHighSeverityCount / recordedTo`; `Claim.refinesClaimUid`. Reason: verification.v1 (`model.ts` SourceAuthorityVector, `claims.ts` VerificationReportWideSummary) and domain requests. Pattern: items 8 and 12, "Edge-property types" table.
5. **2026-10-08 — `Assertion.validObservedAt`** (point date at which the source states the fact held, with OBSERVATION_ONLY basis). Reason: D7 OQ-D7-07; FC-4 undated seller pages. Pattern: item 12.
6. **2026-10-08 — kernel predicate conventions**: RATES_CLAIM, HAS_REVISION_STATUS, FIELD_NOT_REPORTED, measured-null rule, `iso4217:` currency in `unitCode`, retellings as DERIVED_FROM with CITED_FROM_PRIOR_WORK. Reason: research notes §4–§5, D2 #4, D4 #16, D6 OQ-D6-06. Pattern: items 9 and 12.
7. **2026-10-08 — `Activity.about` (ASSESSES → Subjectable)**: the evidence mission's Claim, a research mission's chartered entities. Kernel-internal (no domain declares Activity fields). Reason: M2.
8. **2026-10-08 — kernel-internal renames on Activity: `operationId` → `operationIds`, `intentDigest` → `intentDigests`, `planDigest` → `planDigests`, `receiptId` → `receiptIds`** (single → list). Reason: M1 (one Activity per run; a run applies several intents). No domain module references these fields; the executor change P2 is amended accordingly (P14).
9. **2026-10-08 — seam rule clarified**: kernel node types outside the packet-check allowlist go under `seams`; kernel edge-property types outside the allowlist (`AssertedRecordedProperties`, `IdentifierLinkProperties`, `EvidenceEdgeProperties`) and kernel enums go under `sharedVocabularies: kernel-types`. Reason: packet-check keys seams by relationship type and never checks property types (D12 OQ-D12-18). Pattern: "Kernel types a domain may reference without a seam".
10. **2026-10-08, adversarial review — `Mention` removed (with `Mention.span` and `Mention.resolvedTo`).** Not additive for the kernel; no domain SDL referenced `Mention` (checked by compiling the kernel with all 13 current domain drafts, no stubs). A surface form is the `SourceLocator` of its span, cited (role CONTEXT) by a RESOLUTION Assessment that ASSESSES the candidate and carries `surfaceForm=` / `normalizedForm=` / `typeHint=` in facets; the accepted Assessment licenses D9's derived Chunk MENTIONS. `MENTIONS` keeps its kernel meaning and is declared only by D9. Reason: SLIM (Q-K-13 is value 2 and needs only the shared span; Q-K-14 never used Mention; resolvedTo restated the Assessment). Domain follow-ups: D1 10-seams (`D9.Chunk | K.Mention`) and D4's RESOLUTION subkind note ("Metric candidates for a Mention") — 11-open-questions 35. Pattern: items 4 and 11, "The two interfaces", allowlist, ownership map, 3.8 table.
11. **2026-10-08, adversarial review — `Adjudication.considers` (DERIVED_FROM → Assessment) removed.** Nothing populated it (verification.v1 Judgment carries fragments, not assessment inputs) and no pattern or fixture read it. `Assessment.inputAssessments` stays (now instantiated by `as-synthesis-general` in the K fixtures and by D1, D5 and D7 fixtures). Pattern: none (kernel-internal).
12. **2026-10-08, adversarial review — EvidenceEdgeProperties `authority` / `independence` / `facet` only on Adjudication edges.** No type change; the docstring, the 3.8 table, "What a domain module never writes", M7, executor change P16 and Q-K-15 / Q-K-21 say so. Reason: one copy of the verifier's vector, and a verification run never rewrites the extractor's DECLARED edges (their `lastWriterRunId` stays the extractor's).
13. **2026-10-08, adversarial review — `BasisKind` + `THIRD_PARTY_ANECDOTE`, `MECHANISM_REASONING`** (additive; D9 K-7).
14. **2026-10-08, adversarial review — `IdentifierLinkProperties` field order**: `isPrimary` moved after `lastWriterRunId`, so the kernel's own superset type obeys the verbatim-base-prefix rule the synthesizer checks mechanically. Kernel-internal; no domain declares it.
15. **2026-10-08, adversarial review — conventions answering D9's open kernel requests**: ASSERTED_BY admits a D9 ACCOUNT channel (K-6); `CORRECTS` predicate + DERIVED_FROM for corrections and QUALIFIES + qualifier prefixes for qualifications (K-2); `segment:<KIND>` qualifier (K-5); assessments about one occurrence ASSESS its Claim and are DERIVED_FROM the occurrence (K-3); rendition facts on the rendition's Source (K-9). Pattern: items 8, 9, 12.
16. **2026-10-08, adversarial review — rules clarified**: the `Entity` storage label marks the entity archetype only (D9 C-6); `Report.about` is zero_or_more (a PROFILE about the graph has none) and `Report.generatedBy` may be a PROJECTION Activity (D11); DERIVED_FROM may target a D10 Association (D10 ReportItem.citesAssociations); occurrence container = D9 OCCURS_IN, source family by the rule in "Occurrence container and source family". Pattern: "The two interfaces", item 11, decision 4, the new subsection.

# D11 — retrieval patterns

Model stage, A8, 2026-10-08. One section per question in `02-questions.md` (ids stable). Written against the published kernel (`packets/K/04-schema-proposal.graphql`, A1) and the sibling module SDLs as they stood on 2026-10-08 (D1 A2, D3 A4, D6/D7 A6, D8 A7, D9 A8); every non-kernel type is a seam (`10-seams.yaml`).

Conventions used below.

- Stored directions (kernel): `(Source)-[:HAS_SNAPSHOT]->(SourceSnapshot)-[:HAS_LOCATOR]->(SourceLocator)`; `(Assertion)-[:HAS_SUBJECT|HAS_OBJECT|ASSERTED_BY]->(x)`; `(Assertion|Adjudication|Assessment|Report)-[:HAS_EVIDENCE {role, origin}]->(SourceLocator)` (no Mention node: a surface form is a SourceLocator cited with role CONTEXT by a RESOLUTION Assessment, K Q-K-13); `(Adjudication|Assessment|Report)-[:ASSESSES]->(x)`; `(x)-[:HAS_IDENTIFIER {episode, isPrimary}]->(Identifier)`; `(n)-[:WAS_GENERATED_BY]->(Activity)-[:WAS_ASSOCIATED_WITH]->(Agent)`; D9 `(Chunk)-[:CHUNK_OF]->(SourceSnapshot)`, `(Chunk)-[:COVERS_LOCATOR]->(SourceLocator)` and `(Chunk)-[:MENTIONS]->(x)` (both derived).
- **TRACE** (the provenance tail every answer row returns): `(a:Assertion)-[e:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)`, returning `loc.selectorKind, loc.selectorJson, loc.exact, snap.contentHash, snap.contentHashBasis, snap.retrievedAt, src.canonicalUri`, plus `(a)-[:WAS_GENERATED_BY]->(act:Activity)` for `act.missionId, act.runId` and the newest `(adj:Adjudication {adjudicationKind:'CAPTURE_FIDELITY'})-[:ASSESSES]->(a)` verdict. The verifier re-selects `loc.selectorJson` on the bytes behind `snap.contentHash`; that is the same path the answer cites (00-DIRECTIVE 3.8).
- **EPISODE(r, $asOf)** for an asserted or state edge: `r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf)`; valid-time filter `(r.validFrom IS NULL OR r.validFrom <= $validAt) AND (r.validTo IS NULL OR r.validTo > $validAt)` (half-open, null = unknown). `$asOf` defaults to now.
- **CONFIG**: `tooling/action-space.yaml` (tools/sources) and `identifier-bridges.yaml` (schemes, normalization, bridges) are versioned repository files loaded by the agent's tool layer; they are not graph data. A pattern that says "join CONFIG" joins on `toolId` / `scheme` in the client.
- D11 declares **no relationship type**; the only D11 node type is `CaptureAttempt` (no relationship fields; reached by property filters and by the kernel `WAS_GENERATED_BY`). So no D11 edge needs a bitemporal episode; the "episode" lines below name the other modules' or the kernel's edges the pattern reads, with the edge-property type the owner's SDL declares (checked 2026-10-08 in the adversarial review: D3 `REPORTS_ON`, `ADMINISTERS` and D1 `HAS_ACTIVE_MOIETY` are `AssertedRecordedProperties`, D3 `REVISES` is `RevisionEdgeProperties` = AssertedRecordedProperties + `revisionKind`; all four are recorded-time only, with no `validFrom`).
- Predicate-only statements use SCREAMING_SNAKE predicates, like the kernel conventions (FIELD_NOT_REPORTED, HAS_REVISION_STATUS).

Indexes these patterns assume (D11 asks for the CaptureAttempt ones; the rest are K/D9 obligations already listed by A1):
`CREATE INDEX capture_attempt_subject IF NOT EXISTS FOR (c:CaptureAttempt) ON (c.subjectUid)`;
`CREATE INDEX capture_attempt_tool IF NOT EXISTS FOR (c:CaptureAttempt) ON (c.toolId, c.attemptedAt)`;
`CREATE INDEX snapshot_capture_method IF NOT EXISTS FOR (s:SourceSnapshot) ON (s.captureMethod)` (range index serves `STARTS WITH`);
`CREATE CONSTRAINT identifier_key IF NOT EXISTS FOR (i:Identifier) REQUIRE (i.scheme, i.issuer, i.value) IS UNIQUE` (A1 P13).

## Q-D11-01

- kind: cypher (+ CONFIG)
- pattern: the registry gives the candidate tools for domain D and their readiness, auth and gap; the graph adds what actually happened with each tool.

```cypher
// $toolIds = registry entries whose domains include $domain (CONFIG)
UNWIND $toolIds AS toolId
CALL (toolId) {
  OPTIONAL MATCH (s:SourceSnapshot) WHERE s.captureMethod STARTS WITH toolId + '/'
  RETURN count(s) AS captures, max(s.retrievedAt) AS lastCaptured
}
CALL (toolId) {
  OPTIONAL MATCH (c:CaptureAttempt {toolId: toolId}) WHERE c.attemptedAt >= $since
  RETURN count(c) AS failed, collect(DISTINCT c.failureKind) AS failureKinds, max(c.attemptedAt) AS lastAttempt
}
RETURN toolId, captures, lastCaptured, failed, failureKinds, lastAttempt
ORDER BY toolId
```

- trace: each row cites the registry entry (`evidence` field, scored 2026-10-08) and, for graph counts, the snapshot or attempt uids; no locator (operational answer).
- bitemporal episode needed on: none.

## Q-D11-02

- kind: cypher
- pattern: publication → study through D3 `REPORTS_ON` (asserted, one episode per asserter: the paper's own text, the registry references module, NLM DataBank), then the study's registry identifiers through kernel `HAS_IDENTIFIER`; a link asserted by only one side is flagged.

```cypher
MATCH (pub:Publication)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'DOI', value: $doi})
MATCH (pub)-[r:REPORTS_ON]->(st:Study)
WHERE r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf)
MATCH (a:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(who)
MATCH (a)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (st)-[:HAS_IDENTIFIER]->(reg:Identifier) WHERE reg.scheme IN ['NCT', 'EUCT', 'EUDRACT', 'ISRCTN']
WITH st, reg, collect({assertedBy: who.name, genre: src.genre, selector: loc.selectorKind, quote: loc.exact,
                       retrievedAt: snap.retrievedAt, contentHash: snap.contentHash}) AS sides
RETURN reg.scheme, reg.value, sides, size(sides) = 1 AS oneSidedLink
```

- trace: TRACE per side; for FC-1 the side is the JATS `ext-link` (`pmc:clinical-trial`) quoted at Sec10 with a TEXT_QUOTE/HTML selector; the CT.gov side is absent (JSON_POINTER `/protocolSection/referencesModule` holds no PMID).
- bitemporal episode needed on: none with valid time. D3 `REPORTS_ON` is recorded-only (`AssertedRecordedProperties`); "which publications were linked to the study as known on date D" is its recorded time (`recordedFrom` / `recordedTo`), which is all this pattern filters.

## Q-D11-03

- kind: vector + cypher (the 00-DIRECTIVE 3.8 path)
- pattern: (1) chunks for the question from the D9 vector index, pre-restricted to chunks the entity linker connected to the study (derived `MENTIONS`); (2) from the chunk to the located span it covers (`COVERS_LOCATOR`, derived) and to the Assertion that cites that span (`HAS_EVIDENCE role SUPPORTS`); (3) that Assertion authorizes the D3 `ADMINISTERS` episode from the study's intervention component to the D1 material, whose UNII says the form.

```cypher
MATCH (st:Study)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'NCT', value: $nct})
// 1. candidate chunks: vector post-filter on the entity-linked set (index owned by D9; name to confirm)
CALL db.index.vector.queryNodes('chunk_embedding', 50, $questionEmbedding) YIELD node AS c, score
WHERE (c)-[:MENTIONS]->(st)
WITH st, c, score ORDER BY score DESC LIMIT 5
// 2. chunk -> located span -> assertion that cites it
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[e:HAS_EVIDENCE {role: 'SUPPORTS'}]-(a:Assertion {predicate: 'ADMINISTERS'})
// 3. assertion -> the authorized D3 edge and the D1 material form
MATCH (a)-[:HAS_SUBJECT]->(ic:InterventionComponent)<-[:HAS_COMPONENT]-(:StudyArm)<-[:HAS_ARM]-(st)
MATCH (ic)-[adm:ADMINISTERS {assertionUid: a.uid}]->(mat)
WHERE adm.recordedTo IS NULL
OPTIONAL MATCH (mat)-[:REALIZES_SUBSTANCE]->(sub:ChemicalSubstance)-[:HAS_IDENTIFIER]->(unii:Identifier {scheme: 'UNII'})
MATCH (loc)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(a)
RETURN mat.name, unii.value AS formUnii, ic.quantity, ic.unitCode, ic.quantityBasis, ic.scheduleText,
       loc.exact AS quote, loc.selectorJson, snap.contentHash, snap.retrievedAt, adj.verdict, score
ORDER BY score DESC
```

- trace: TRACE on the JATS snapshot (FC-1: Par30, "Subjects ingested nicotinamide riboside chloride (NIAGEN®; 500 mg, twice per day; ChromaDex, Inc.) …"; the TEXT_QUOTE selector declares a normalization that folds U+2009 inside "500 mg"). The verifier re-selects the same `selectorJson` on the bytes with sha256 `dd620181…4794`. A fulltext fallback (`db.index.fulltext.queryNodes('chunk_text', '"nicotinamide riboside" AND mg')`) is used when no embedding exists.
- bitemporal episode needed on: none with valid time. D3 `ADMINISTERS` is recorded-only (`AssertedRecordedProperties`; the pattern reads `recordedTo IS NULL`); the chunk edges are derived (recorded-only).

## Q-D11-04

- kind: cypher
- pattern: incoming D3 `REVISES` records on the work (one per asserter: NLM CommentsCorrections, Crossref/Retraction Watch `updated-by`, the publisher's notice), each with the asserter's `revisionKind`, its notice and the reason quote on the notice snapshot. The revision date is the notice's `publishedAt` (D3: REVISES carries no valid time); the kernel `SourceSnapshot.revisionKind` on the notice capture is the fallback when no Publication node exists.

```cypher
MATCH (pub:Publication)-[:HAS_IDENTIFIER]->(:Identifier {scheme: $scheme, value: $value})   // DOI or PMID
MATCH (notice:Publication)-[r:REVISES]->(pub)
WHERE r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf)
MATCH (a:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(asserter)
MATCH (a)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (notice)-[:HAS_IDENTIFIER]->(nid:Identifier) WHERE nid.scheme IN ['DOI', 'PMID']
RETURN notice.publicationKind, r.revisionKind, collect(DISTINCT nid.value) AS noticeIds, notice.publishedAt AS revisedOn,
       r.recordedFrom AS knownSince, asserter.name, loc.exact AS quote, snap.revisionKind, snap.retrievedAt, src.canonicalUri
ORDER BY revisedOn
```

- trace: TRACE per asserter (FC-2: Crossref JSON_POINTER `/message/updated-by/0`; PubMed `CommentsCorrections RefType="RetractionIn"`; the notice page quote "…contain instances of data fabrication…").
- bitemporal episode needed on: none with valid time. D3 `REVISES` is recorded-only (`RevisionEdgeProperties`, no `validFrom`): the notice date is the revising Publication's `publishedAt`, and `recordedFrom` is when BellLabs learned it. Q-D11-05's "since when do we know" is `recordedFrom`, so D11 needs no valid time on REVISES (adversarial review; the earlier text called it an episode with valid time and read the non-existent `r.validFrom`).

## Q-D11-05

- kind: cypher
- pattern: every current Assertion, Assessment or Report whose evidence or inputs lead to a snapshot of a source that is a rendition of a revised work; shows since when BellLabs knows (recorded time of the revision episode). Sources join works through shared identifiers (D3 rule: renditions are Sources joined by DOI/PMID/PMCID).

```cypher
MATCH (notice:Publication)-[r:REVISES]->(pub:Publication)
WHERE notice.publicationKind IN ['RETRACTION_NOTICE', 'EXPRESSION_OF_CONCERN', 'CORRECTION_NOTICE'] AND r.recordedTo IS NULL
MATCH (pub)-[:HAS_IDENTIFIER]->(id:Identifier)<-[:HAS_IDENTIFIER]-(src:Source)
MATCH (src)-[:HAS_SNAPSHOT]->(:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[:HAS_EVIDENCE]-(a:Assertion)
WHERE a.recordedTo IS NULL
OPTIONAL MATCH (dep)-[:DERIVED_FROM]->{1,4}(a)                      // assessments, reports, calculated assertions
RETURN pub.uid, notice.publicationKind, r.recordedFrom AS knownSince, a.uid, a.predicate,
       collect(DISTINCT labels(dep)[0] + ':' + dep.uid) AS dependents
```

- trace: the tainted assertion's own TRACE plus the REVISES assertion's TRACE (FC-2 retraction of PMID 12003802). `Publication.revisionStatus` (D3 projection cache) is a cheap pre-filter for answer composition.
- bitemporal episode needed on: D3 `REVISES` recorded time only (`recordedFrom` = "since when do we know"; RevisionEdgeProperties has no valid time); kernel `HAS_IDENTIFIER` episodes when an identifier assignment is later closed.

## Q-D11-06

- kind: cypher
- pattern: D3 `RegistrationVersion` states attached to the study (state episodes), comparing first-submitted date with start date per registry, plus any registry-stated prospective flag captured as an Assertion (ICTRP "Prospective Registration: No").

```cypher
MATCH (st:Study)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'NCT', value: $nct})
MATCH (st)-[h:HAS_REGISTRATION_VERSION]->(rv:RegistrationVersion)
WHERE h.recordedFrom <= $asOf AND (h.recordedTo IS NULL OR h.recordedTo > $asOf)
MATCH (a:Assertion {uid: h.assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (flag:Assertion {predicate: 'PROSPECTIVE_REGISTRATION_FLAG'})-[:HAS_SUBJECT]->(st)
RETURN rv.registry, rv.firstSubmittedDate, rv.startDate, rv.startDateType,
       rv.firstSubmittedDate > rv.startDate AS retrospective, flag.valueBoolean AS registryFlag,
       loc.selectorJson, snap.retrievedAt, snap.contentHash
ORDER BY rv.registry, snap.retrievedAt
```

- trace: TRACE on CT.gov JSON (JSON_POINTER `/protocolSection/statusModule/studyFirstSubmitDate` = "2016-09-29"; `startDateStruct` "2015-04") and on the ICTRP HTML (HTML selector `span#DataList3_ctl01_Label1` = "No"); disagreements between registries are listed, not resolved.
- bitemporal episode needed on: D3 `HAS_REGISTRATION_VERSION` (StateEpisodeProperties).

## Q-D11-07

- kind: cypher (+ CONFIG)
- pattern: diff of consecutive registration versions BellLabs observed (D3), with the explicit floor "history before our first observation is unavailable". The floor comes from CONFIG: registry entry `ctgov-record-history` (readiness 0, gap G1), which holds for every study. CaptureAttempts on the history endpoint for this study are optional evidence, looked up before the diff so that they are returned even when fewer than two versions exist.

```cypher
MATCH (st:Study)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'NCT', value: $nct})
// optional evidence first, so a study with 0 or 1 observed versions still returns its floor
OPTIONAL MATCH (c:CaptureAttempt {subjectUid: st.uid, toolId: 'ctgov-record-history'})
WITH st, collect(c {.outcome, .failureKind, .httpStatus, .responseHash, .attemptedAt}) AS historyAttempts
OPTIONAL MATCH (st)-[h:HAS_REGISTRATION_VERSION]->(rv:RegistrationVersion)
WITH st, historyAttempts, rv, h ORDER BY coalesce(rv.versionDate, h.validFrom)
WITH st, historyAttempts, [x IN collect({v: rv, from: h.validFrom}) WHERE x.v IS NOT NULL] AS versions
RETURN head(versions).v.versionDate AS firstObservedVersion,
       [i IN range(1, size(versions) - 1) |
          {from: versions[i-1].v.versionDate, to: versions[i].v.versionDate,
           changes: [f IN ['overallStatus', 'enrollmentCount', 'primaryCompletionDate', 'payloadHash']
                     WHERE versions[i-1].v[f] <> versions[i].v[f] | {field: f, old: versions[i-1].v[f], new: versions[i].v[f]}]}] AS diffs,
       historyAttempts
// client side: floor = CONFIG ctgov-record-history.readiness = 0 (gap G1) -> "history before firstObservedVersion unavailable"
```

- trace: TRACE of each version's HAS_REGISTRATION_VERSION assertion (one CT.gov snapshot per observation); the floor cites the registry entry (gap G1) and, when present, the attempts (fixture ca-01..03: `httpStatus` 403, `responseHash` sha256 `c996c046…ad5f`; the 134-byte 403 page was hashed, not kept as a snapshot, so the attempts carry no `snapshotUid`). Nothing is asserted about the trial. Outcome-switching judgments stay D3's (D3:CQ-ST-08).
- bitemporal episode needed on: D3 `HAS_REGISTRATION_VERSION` (StateEpisodeProperties).

## Q-D11-08

- kind: cypher
- pattern: four statement kinds about one study/publication — collaborator (registry), acknowledged material provider or funder (paper `ack`; D3 `HAS_STUDY_ROLE` with `roleKind` COLLABORATOR / MATERIAL_PROVIDER / FUNDER), competing-interest statement (paper `notes`), funder metadata (Crossref/Europe PMC grants) — as Assertions with subject the publication or study; disagreement = an organization named by one kind and denied or absent in another. Financial-interest edges are D7's; D11 reads them through Assertions.

```cypher
MATCH (st:Study)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'NCT', value: $nct})
OPTIONAL MATCH (pub:Publication)-[:REPORTS_ON]->(st)
WITH st, collect(pub) + [st] AS subjects
UNWIND subjects AS s
MATCH (a:Assertion)-[:HAS_SUBJECT]->(s)
WHERE a.predicate IN ['HAS_STUDY_ROLE', 'DISCLOSES_SUPPORT_FROM', 'DECLARES_NO_COMPETING_INTEREST', 'FUNDED_BY']
  AND a.recordedTo IS NULL
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(org)
OPTIONAL MATCH (st)-[role:HAS_STUDY_ROLE {assertionUid: a.uid}]->(org)
MATCH (a)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
RETURN a.predicate, role.roleKind AS roleKind, a.polarity, org.name AS organization, loc.exact AS quote, src.genre, snap.retrievedAt
ORDER BY organization
```

- trace: TRACE per statement (FC-1: ack "Study pills, NR standards for metabolite analyses and partial funding support were provided by ChromaDex, Inc." vs notes "The authors declare no competing interests."; FC-8: CT.gov collaborator "ChromaDex, Inc."). The disagreement itself is an Assessment (kernel kind CONFLICT_RELEVANCE, D7 subkind) if an analyst records it; the query only lines the statements up.
- bitemporal episode needed on: D3 `HAS_STUDY_ROLE` (asserted, StudyRoleEdgeProperties = AssertedEdgeProperties + roleKind; renamed from the research-stage `SPONSORED_BY` in the check stage to match A4's SDL); the predicate-only statements carry valid time on the Assertion.

## CQ-ID-04

- kind: cypher
- pattern: identifiers attached to a substance with the authority snapshot that carried each (kernel `HAS_IDENTIFIER` episode → its Assertion → locator on the authority record), validity of the assignment, and assertion status.

```cypher
MATCH (sub:ChemicalSubstance {uid: $uid})-[h:HAS_IDENTIFIER]->(id:Identifier)
WHERE h.recordedFrom <= $asOf AND (h.recordedTo IS NULL OR h.recordedTo > $asOf)
MATCH (a:Assertion {uid: h.assertionUid})-[:ASSERTED_BY]->(issuer)
MATCH (a)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
RETURN id.scheme, id.value, id.issuer, h.isPrimary, h.validFrom, h.validTo, a.status,
       issuer.name AS assertedBy, loc.selectorJson, snap.retrievedAt, snap.contentHash, src.canonicalUri
ORDER BY id.scheme
```

- trace: TRACE on the GSRS record (FC-4: JSON_POINTER `/codes/i` → `"codeSystem":"CAS","code":"23111-00-4"`; record `"version":"18"` read from `/version` of the same snapshot). The bridge's authority and readiness come from CONFIG `identifier-bridges.yaml` B07.
- bitemporal episode needed on: kernel `HAS_IDENTIFIER` (IdentifierLinkProperties) — "valid when".

## Q-D11-09

- kind: cypher
- pattern: D1 form tree: the substance identified by the UNII, its asserted active moiety (`HAS_ACTIVE_MOIETY`), and sibling forms sharing that moiety, each with CAS/CID from kernel identifiers.

```cypher
MATCH (form:ChemicalSubstance)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'UNII', value: $unii})
OPTIONAL MATCH (form)-[m:HAS_ACTIVE_MOIETY]->(moiety:ChemicalSubstance) WHERE m.recordedTo IS NULL
OPTIONAL MATCH (sibling:ChemicalSubstance)-[m2:HAS_ACTIVE_MOIETY]->(moiety) WHERE m2.recordedTo IS NULL AND sibling <> form
WITH form, moiety, m, collect(DISTINCT sibling) AS siblings
UNWIND [form, moiety] + siblings AS n
OPTIONAL MATCH (n)-[:HAS_IDENTIFIER]->(i:Identifier) WHERE i.scheme IN ['UNII', 'CAS_RN', 'PUBCHEM_CID', 'INCHIKEY']
OPTIONAL MATCH (a:Assertion {uid: m.assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator)
RETURN n.name, collect(i.scheme + ':' + i.value) AS ids, n = moiety AS isMoiety, loc.selectorJson AS moietyLocator
```

- trace: TRACE of the `HAS_ACTIVE_MOIETY` assertion on the GSRS salt record (FC-4: `/relationships/j` with `"approvalID":"0I8H2M0L7N"` and `"type":"ACTIVE MOIETY"`).
- bitemporal episode needed on: none with valid time. D1 `HAS_ACTIVE_MOIETY` is recorded-only (`AssertedRecordedProperties`; the pattern reads `recordedTo IS NULL`); GSRS record versions are kernel snapshots.

## CQ-PV-04

- kind: cypher (+ assessment)
- pattern: put the two amounts side by side with their declared bases: a label line (D6 `DECLARES_COMPONENT`, ComponentLineProperties `amount`/`unitCode`/`massBasis`/`amountBasis`) and a study component (D3 `InterventionComponent.quantity`/`unitCode`/`quantityBasis`/`massBasis`); the salt-vs-moiety risk is the D1 `MassBasis` (UNSPECIFIED or null) on either side, both resolved to D1 materials sharing an active moiety; a conversion, when made, is a CALCULATED Assertion with `derivationRule` and `DERIVED_FROM` inputs; the qualification block is a kernel Assessment (kind APPLICABILITY, subkind `D11.quantity-basis`) when an analyst records it.

```cypher
MATCH (lv:LabelVersion {uid: $labelVersionUid})-[line:DECLARES_COMPONENT]->(lm:IngredientMaterial)
MATCH (ic:InterventionComponent {uid: $componentUid})-[adm:ADMINISTERS]->(sm:IngredientMaterial)
WHERE adm.recordedTo IS NULL
MATCH (lm)-[:REALIZES_SUBSTANCE]->(:ChemicalSubstance)-[:HAS_ACTIVE_MOIETY*0..1]->(moiety:ChemicalSubstance)
      <-[:HAS_ACTIVE_MOIETY*0..1]-(:ChemicalSubstance)<-[:REALIZES_SUBSTANCE]-(sm)
OPTIONAL MATCH (calc:Assertion {basisKind: 'CALCULATED'})-[:HAS_SUBJECT]->(lv) WHERE calc.recordedTo IS NULL
OPTIONAL MATCH (calc)-[:DERIVED_FROM]->(input:Assertion)
RETURN line.amount, line.unitCode, line.massBasis, line.amountBasis, lv.maxDailyServings,
       ic.quantity, ic.unitCode, ic.quantityBasis, ic.massBasis, ic.scheduleText, moiety.name,
       calc.valueNumber, calc.unitCode, calc.derivationRule, collect(input.uid) AS conversionInputs,
       coalesce(line.massBasis, 'UNSPECIFIED') = 'UNSPECIFIED' OR coalesce(ic.massBasis, 'UNSPECIFIED') = 'UNSPECIFIED' AS basisRisk
```

- trace: TRACE of the label line assertion (FC-5: DSLD JSON_POINTER to the nested form "Nicotinamide Riboside Chloride", UNII 8XM2XT8VWI, 300 mg, basis not stated) and of the study component (FC-1 Par30, 500 mg twice per day of the chloride); the calculated assertion cites both.
- bitemporal episode needed on: D6 `HAS_LABEL_VERSION` (which label version was current); D3 `ADMINISTERS` is recorded-only (current = `recordedTo IS NULL`); the `DECLARES_COMPONENT` lines are parts of an immutable label version.

## CQ-AX-14

- kind: fulltext + cypher
- pattern: a free-text name is a kernel `SourceLocator` (its `exact`; the kernel has no Mention node, K Q-K-13); candidate identities are kernel Assessments of kind RESOLUTION that cite the span (`HAS_EVIDENCE` role CONTEXT, `surfaceForm=` / `normalizedForm=` / `typeHint=` in `facets`) and `ASSESS` the candidates (pinned ResolutionHypothesis merged into Assessment); the chosen one is the D9 Chunk's derived `MENTIONS` edge licensed by an ACCEPTED RESOLUTION assessment (named in `derivedFromAssessmentUids`). Candidate generation uses a fulltext index on names and identifier values.

```cypher
MATCH (span:SourceLocator {uid: $locatorUid})                 // the free-text name's span
OPTIONAL MATCH (ra:Assessment {assessmentKind: 'RESOLUTION'})-[:HAS_EVIDENCE {role: 'CONTEXT'}]->(span)
OPTIONAL MATCH (ra)-[:ASSESSES]->(cand)
OPTIONAL MATCH (cand)-[:HAS_IDENTIFIER]->(i:Identifier)
OPTIONAL MATCH (:Chunk)-[res:MENTIONS]->(cand) WHERE ra.uid IN res.derivedFromAssessmentUids
RETURN span.exact AS surfaceForm, ra.facets AS facets, cand.uid AS candidate, cand.name AS candidateName,
       collect(DISTINCT i.scheme + ':' + i.value) AS ids, ra.uid AS assessment, ra.status AS status, ra.score AS score,
       ra.methodVersion AS methodVersion, ra.status = 'ACCEPTED' AND ra.recordedTo IS NULL AS licensed,
       count(DISTINCT res) AS licensedMentionEdges
ORDER BY score DESC
// candidate generation (before any Assessment exists):
// CALL db.index.fulltext.queryNodes('subjectable_names', $surfaceForm) YIELD node, score
```

- trace: the span itself (`span`, cited by each assessment with role CONTEXT) plus TRACE of each candidate's authority identifiers; an unresolved name returns its open assessments, never a silent pick.
- bitemporal episode needed on: none (Assessments are immutable records with recordedAt/recordedTo; `MENTIONS` is derived from D9 Chunks).

## Q-D11-10

- kind: cypher
- pattern: machine-proposed links (Europe PMC annotations, name lookups) recorded as RESOLUTION Assessments generated by a TEXT_MINING_AGENT, superseded or REJECTED by an authority check (a later RESOLUTION Assessment or Adjudication citing the authority record).

```cypher
MATCH (ra:Assessment {assessmentKind: 'RESOLUTION'})-[:WAS_GENERATED_BY]->(:Activity)-[:WAS_ASSOCIATED_WITH]->(ag:Agent {agentKind: 'TEXT_MINING_AGENT'})
WHERE ra.status IN ['WITHDRAWN', 'SUPERSEDED'] OR ra.verdict IN ['CONTRADICTED', 'NOT_SUPPORTED']
MATCH (ra)-[:HAS_EVIDENCE {role: 'CONTEXT'}]->(span:SourceLocator)   // the surface form (no Mention node, K Q-K-13)
OPTIONAL MATCH (ra)-[:ASSESSES]->(proposed)                          // absent when the proposed id was never a node (facets carry it)
OPTIONAL MATCH (check:Assessment {assessmentKind: 'RESOLUTION', supersedesUid: ra.uid})-[:HAS_EVIDENCE]->(authLoc:SourceLocator)
RETURN span.exact AS surfaceForm, ra.facets, proposed.name, ag.name, ag.toolVersion, ra.methodVersion, check.rationale, authLoc.selectorJson
```

- trace: the authority locator (FC-4 GSRS record) that contradicts the mislink (Europe PMC tagged "nicotinamide riboside" as ChEBI dihydrozeatin riboside; S9 in `01-ecosystem.md`).
- bitemporal episode needed on: none.

## Q-D11-11

- kind: cypher
- pattern: the boxed warning is D5's use-constraint statement: a kernel Assertion with predicate `USE_CONSTRAINED_IN` (D5 `05` predicateOnly; `valueString` = ConstraintLevel code, `proposition` = the verbatim warning title, speechAct CAUTIONS) whose subject is the drug product (or substance) and whose qualifier `section:BOXED_WARNING` places it (D11 requests BOXED_WARNING in D5's section list, 11-open-questions item 39). Its locator is the SPL section (HTML selector on `section@ID` + LOINC 34066-1 in `selectorJson`). The label version is the D6 `LabelVersion` whose `HAS_LABEL_VERSION` assertion cites the same SPL snapshot; its valid time is the SPL `effectiveTime`. D11 adds no predicate (adversarial review: `has_boxed_warning` dropped as a duplicate of D5's concept).

```cypher
MATCH (sub:ChemicalSubstance)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'UNII', value: $unii})
MATCH (lv:LabelVersion)-[:DECLARES_COMPONENT]->(:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(sub)
MATCH (pkg:Package)-[h:HAS_LABEL_VERSION]->(lv)
WHERE h.recordedTo IS NULL
MATCH (ha:Assertion {uid: h.assertionUid})-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
// the use constraint stated in the boxed-warning section of the same label snapshot
MATCH (a:Assertion {predicate: 'USE_CONSTRAINED_IN'})-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap)
WHERE 'section:BOXED_WARNING' IN a.qualifiers AND a.recordedTo IS NULL
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(scope)
OPTIONAL MATCH (lv)-[:HAS_IDENTIFIER]->(set:Identifier {scheme: 'SPL_SET_ID'})
RETURN DISTINCT set.value, lv.labelVersionCode, h.validFrom AS effectiveFrom, a.proposition AS warningTitle, a.valueString AS level,
       scope.name AS constrainedIn, loc.exact, loc.selectorJson, snap.publishedAt, snap.retrievedAt, src.canonicalUri
ORDER BY effectiveFrom DESC
```

- trace: TRACE on the DailyMed SPL XML (FC-3: `section ID="LINK_b7e90274-…"`, code 34066-1, title "WARNING: IMMUNOSUPPRESSION, USE IS NOT RECOMMENDED IN LIVER OR LUNG TRANSPLANT PATIENTS"); valid time (effectiveTime 2024-04-30) differs from DailyMed publication (`snap.publishedAt`) and retrieval.
- bitemporal episode needed on: D6 `HAS_LABEL_VERSION` (StateEpisodeProperties).

## Q-D11-12

- kind: cypher
- pattern: consecutive label versions of one package (D6 state episodes), diffing directions, maxDailyServings, seals and `compositionDigest`; the package's GTIN via kernel identifiers.

```cypher
MATCH (pkg:Package)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'GTIN', value: $gtin14})
MATCH (pkg)-[h:HAS_LABEL_VERSION]->(lv:LabelVersion)
WITH pkg, lv, h ORDER BY h.validFrom
WITH pkg, collect({lv: lv, from: h.validFrom, assertionUid: h.assertionUid}) AS vs
UNWIND range(1, size(vs) - 1) AS i
WITH vs[i-1] AS p, vs[i] AS c
WITH p, c, [f IN ['directionsText', 'maxDailyServings', 'seals', 'compositionDigest'] WHERE p.lv[f] <> c.lv[f]
            | {field: f, old: p.lv[f], new: c.lv[f]}] AS changes
WHERE size(changes) > 0
MATCH (a:Assertion {uid: c.assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN p.from, c.from, changes, loc.selectorJson, snap.retrievedAt, snap.contentHash
```

- trace: TRACE of each version's attachment (FC-5: DSLD 295562 `"maxDailyServings":1` → 323170 `"maxDailyServings":3`, both `upcSku` "8 50015 31111 6" normalized by `gtin14-v1` to 00850015311116).
- bitemporal episode needed on: D6 `HAS_LABEL_VERSION`.

## Q-D11-13

- kind: cypher
- pattern: identifier join on the normalized GTIN (kernel identity rule: scheme GTIN, issuer GS1, value GTIN-14) across D6 packages, label versions and D8 records, versus records joined only by an EQUIVALENCE/RESOLUTION Assessment (name match). No identifier-to-identifier edge exists.

```cypher
MATCH (gid:Identifier {scheme: 'GTIN', value: $gtin14})<-[h:HAS_IDENTIFIER]-(rec)
WHERE h.recordedTo IS NULL
WITH gid, collect({uid: rec.uid, kind: labels(rec)[0], basis: 'IDENTIFIER'}) AS byId
OPTIONAL MATCH (eq:Assessment)-[:ASSESSES]->(x) WHERE eq.assessmentKind IN ['EQUIVALENCE', 'RESOLUTION']
  AND x.uid IN [r IN byId | r.uid]
OPTIONAL MATCH (eq)-[:ASSESSES]->(other) WHERE NOT other.uid IN [r IN byId | r.uid]
RETURN byId, collect(DISTINCT {uid: other.uid, kind: labels(other)[0], basis: 'HYPOTHESIS', status: eq.status}) AS byHypothesis
```

- trace: TRACE of each HAS_IDENTIFIER assertion (DSLD `upcSku` JSON_POINTER); hypothesis rows cite the assessment's evidence. The empty FDC side is a CaptureAttempt (usda-fdc, RATE_LIMITED), not an absence.
- bitemporal episode needed on: kernel `HAS_IDENTIFIER` (a GTIN reassigned or a label version that changed GTIN).

## Q-D11-14

- kind: cypher
- pattern: D8 `LegalStatus` standings of an ingredient (US, dietary-supplement family) with the records that establish them (`STATUS_FROM` → `RegulatoryRecord`); superseded standings are closed episodes; the setting-aside text is the asserting locator.

```cypher
MATCH (subj)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'UNII', value: $unii})
MATCH (ls:LegalStatus {jurisdiction: 'US'})-[s:STATUS_OF]->(subj)
MATCH (ls)-[f:STATUS_FROM]->(rec:RegulatoryRecord)
MATCH (a:Assertion {uid: s.assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN ls.statusKind, ls.statusVerbatim, s.validFrom, s.validTo, s.recordedFrom, s.recordedTo,
       rec.name, loc.page, loc.exact, snap.contentHashBasis, snap.retrievedAt
ORDER BY s.validFrom
```

- trace: TRACE on the NDI 1259 letter (FC-7 candidate: PDF_TEXT page 1 "…we are setting aside our October 11, 2022 and November 4, 2022 letters."). The rendition is a tool rendition (`contentHashBasis` proposed TOOL_RENDITION) until the PDF bytes are captured; an assertion on it should stay below ACCEPTED (11-open-questions).
- bitemporal episode needed on: D8 `STATUS_OF` (valid time of the standing; recorded time of our knowledge).

## Q-D11-15

- kind: cypher
- pattern: identifiers of the organization (kernel HAS_IDENTIFIER episodes: SEC_CIK, LEI, EIN), each identifier's own validity (`Identifier.validTo`, registration status per open question), and the unbridged pairs as EQUIVALENCE Assessments.

```cypher
MATCH (org:Organization {uid: $orgUid})-[h:HAS_IDENTIFIER]->(id:Identifier)
OPTIONAL MATCH (a:Assertion {uid: h.assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (eq:Assessment {assessmentKind: 'EQUIVALENCE'})-[:ASSESSES]->(org)
RETURN id.scheme, id.value, id.validTo, h.validFrom, h.validTo, h.recordedTo IS NULL AS current,
       loc.selectorJson, snap.retrievedAt, collect(DISTINCT {status: eq.status, rationale: eq.rationale}) AS hypotheses
```

- trace: TRACE on EDGAR submissions JSON (`/cik`, `/formerNames`) and the GLEIF record (`/data/attributes/registration/status` = "LAPSED"); the CIK↔LEI pair (B18) is a hypothesis row, never an identity.
- bitemporal episode needed on: kernel `HAS_IDENTIFIER`.

## Q-D11-16

- kind: cypher
- pattern: a person's NPI is accepted only through a HAS_IDENTIFIER assertion that cites a second key (license number, practice location) from the NPPES record; otherwise the answer is the open RESOLUTION Assessments (homonyms). D11 adds nothing; D7 owns Person, D9 the recommending context.

```cypher
MATCH (p:Person {uid: $personUid})
OPTIONAL MATCH (p)-[h:HAS_IDENTIFIER]->(npi:Identifier {scheme: 'NPI'}) WHERE h.recordedTo IS NULL
OPTIONAL MATCH (ra:Assessment {assessmentKind: 'RESOLUTION'})-[:ASSESSES]->(p)
WITH npi, h, collect(CASE WHEN ra IS NULL THEN null ELSE {status: ra.status, score: ra.score, rationale: ra.rationale} END) AS hypotheses
RETURN npi.value, h.assertionUid, hypotheses,
       CASE WHEN npi IS NOT NULL THEN 'VERIFIED_BY_SECOND_KEY' WHEN size(hypotheses) > 0 THEN 'HOMONYMS_OR_UNRESOLVED' ELSE 'NOT_CHECKED' END AS verdict
```

- trace: TRACE of the NPI assertion on the NPPES record snapshot; person-level registry data is stored only for public professional identity (privacyClass PUBLIC) and only when verified.
- bitemporal episode needed on: kernel `HAS_IDENTIFIER`.

## Q-D11-17

- kind: cypher (+ CONFIG)
- pattern: the mission's Activities (kernel `missionId`) → everything they generated that is a CaptureAttempt (every attempt is FAILED or PARTIAL); join `toolId` with the registry to name the affected questions (`domains`, `gap`, and the packets' question ids that list the tool as a source).

```cypher
MATCH (act:Activity {missionId: $missionId})<-[:WAS_GENERATED_BY]-(c:CaptureAttempt)
RETURN act.runId, c.toolId, c.outcome, c.failureKind, c.httpStatus, c.requestUri, c.subjectUid,
       c.attemptedAt, c.retryAfterSeconds
ORDER BY act.runId, c.attemptedAt
// client side: JOIN rows ON toolId = action-space entry id → readiness, gap, priority, affected question ids
```

- trace: each row cites the attempt (and, for a PARTIAL attempt whose bytes were kept, the snapshot via `snapshotUid`); `responseHash` identifies the error body (the 134-byte CT.gov 403 page, the FDC `OVER_RATE_LIMIT` JSON) without storing it. No locator: the answer is about our operations, not about the world.
- bitemporal episode needed on: none.

## CQ-AX-04

- kind: cypher
- pattern: K's CQ-AX-04 states, evaluated per tool of the question's source set (CONFIG) for one subject, so the answer also says which sources were blocked or never queried. Definitions are the kernel's (K `03` CQ-AX-04; K `09` item 12): **MEASURED_ABSENT** = a current POSITIVE assertion with an absence predicate (NO_CHANGE / NO_EFFECT …, `$absencePredicates`) and `basisKind: DIRECT_MEASUREMENT`; **REPORTED** = a current POSITIVE assertion with one of the question's predicates (`$predicates`), with the subject as its subject or object (a REPORTS_ON assertion names the study as object), never a FIELD_NOT_REPORTED or NEGATIVE one; **NOT_REPORTED_BY_SOURCE** = a kernel FIELD_NOT_REPORTED assertion for one of the question's fields (`$fields`) whose evidence lies on a COMPLETE snapshot from the tool; **UNKNOWN_BLOCKED** = only FAILED / PARTIAL CaptureAttempts; **UNKNOWN_NEVER_QUERIED** = nothing. **OUT_OF_SCOPE** comes from CONFIG (no tool for the question's domain). A NEGATIVE assertion is a denial (K item 12), so it is neither "measured absent" nor "not reported". Evidence is attributed to a tool by the snapshot's `captureMethod` prefix. The fixture query (`capture-failures-coverage` `queries.CQ-AX-04`) is identical.

```cypher
MATCH (x:$($label) {uid: $uid})
UNWIND $toolIds AS toolId
CALL (x, toolId) {
  OPTIONAL MATCH (a:Assertion)-[:HAS_SUBJECT|HAS_OBJECT]->(x)
  WHERE a.recordedTo IS NULL
    AND EXISTS { (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot) WHERE s.captureMethod STARTS WITH toolId + '/' }
  RETURN
    sum(CASE WHEN a.polarity = 'POSITIVE' AND a.predicate IN $absencePredicates AND a.basisKind = 'DIRECT_MEASUREMENT' THEN 1 ELSE 0 END) AS measuredAbsent,
    sum(CASE WHEN a.polarity = 'POSITIVE' AND a.predicate IN $predicates AND a.predicate <> 'FIELD_NOT_REPORTED' THEN 1 ELSE 0 END) AS reported,
    sum(CASE WHEN a.predicate = 'FIELD_NOT_REPORTED' AND a.valueString IN $fields
              AND EXISTS { (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s2:SourceSnapshot)
                           WHERE s2.captureMethod STARTS WITH toolId + '/' AND s2.captureCompleteness = 'COMPLETE' }
             THEN 1 ELSE 0 END) AS notReported
}
CALL (x, toolId) {
  OPTIONAL MATCH (c:CaptureAttempt {subjectUid: x.uid, toolId: toolId})
  RETURN count(c) AS blocked, max(c.attemptedAt) AS lastAttempt
}
RETURN toolId,
  CASE WHEN measuredAbsent > 0 THEN 'MEASURED_ABSENT'
       WHEN reported > 0 THEN 'REPORTED'
       WHEN notReported > 0 THEN 'NOT_REPORTED_BY_SOURCE'
       WHEN blocked > 0 THEN 'UNKNOWN_BLOCKED'
       ELSE 'UNKNOWN_NEVER_QUERIED' END AS state, lastAttempt
```

- trace: MEASURED_ABSENT, REPORTED and NOT_REPORTED_BY_SOURCE rows return TRACE (for not reported: the FIELD_NOT_REPORTED assertion, its snapshot `contentHash` and the JSON_POINTER to the zero count, e.g. esearch `/esearchresult/count` = "0" for `NCT02921659[si]`); blocked rows return the attempts only. A FIELD_NOT_REPORTED is never turned into a NEGATIVE assertion about the world: PubMed's empty `[si]` search did not mean the trial is unpublished (FC-1 names it). Hand check on fixture `capture-failures-coverage` (`$predicates = ['REPORTS_ON']`, `$fields` = the f01 field): ncbi-eutils-pubmed → NOT_REPORTED_BY_SOURCE (f01 is excluded from `reported`), europepmc-fulltext-jats → REPORTED (nr-trial-jats-unstructured a05), ctgov-record-history and firecrawl-cli → UNKNOWN_BLOCKED, eu-ctis-public → UNKNOWN_NEVER_QUERIED. Known limit: the CT.gov referencesModule silence (nr-trial-jats-unstructured a06) is a FIELD_NOT_REPORTED whose subject is the registry record (Source), not the Study, so this pattern returns UNKNOWN_NEVER_QUERIED for ctgov-v2-api; 11-open-questions item 26 asks the kernel to fix the subject rule.
- bitemporal episode needed on: none (attempts and assertions carry their own times; `$asOf` filters `a.recordedAt` / `c.attemptedAt` when asked "as known on D").

## Q-D11-18

- kind: cypher
- pattern: D11 reads the sibling modules' records and adds no predicate (adversarial review: `recall_names_product` and `adverse_event_report_names_product` dropped as duplicates). Recalls are D8 `RegulatoryRecord {recordKind: 'RECALL'}` with `CONCERNS` (AssertedRecordedProperties) to the Product or a Lot of it. Adverse-event reports are D5 `CAUSES_ADVERSE_EFFECT` Assertions (subject the product, object a D2 Condition, qualifier `sourceKind:SPONTANEOUS_REPORT` for CAERS/FAERS), whose causality disclaimer is a CAUTIONS Assertion on the same dataset snapshot that the answer must carry (D5 `03` Q-D5-20). The product-match basis is an identifier join (GTIN) or an open EQUIVALENCE / RESOLUTION hypothesis (brand string).

```cypher
MATCH (prod:Product {uid: $productUid})
// recalls (D8): the record concerns the product or a lot of it
OPTIONAL MATCH (rr:RegulatoryRecord {recordKind: 'RECALL'})-[c:CONCERNS]->(t)
WHERE c.recordedTo IS NULL AND (t = prod OR (t:Lot AND (t)-[:LOT_OF]->(prod)))
WITH prod, collect(DISTINCT {record: rr.uid, name: rr.name, assertionUid: c.assertionUid}) AS recalls
// adverse-event reports (D5 predicate), with the source's own disclaimer
OPTIONAL MATCH (ae:Assertion {predicate: 'CAUSES_ADVERSE_EFFECT'})-[:HAS_SUBJECT]->(prod)
WHERE ae.recordedTo IS NULL AND 'sourceKind:SPONTANEOUS_REPORT' IN ae.qualifiers
OPTIONAL MATCH (ae)-[:HAS_OBJECT]->(effect:Condition)
OPTIONAL MATCH (ae)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (disc:Assertion {speechAct: 'CAUTIONS'})-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap)
OPTIONAL MATCH (eq:Assessment)-[:ASSESSES]->(prod) WHERE eq.assessmentKind IN ['EQUIVALENCE', 'RESOLUTION']
RETURN recalls,
       collect(DISTINCT {report: loc.exact, effect: effect.name, observedAt: ae.validObservedAt, disclaimer: disc.proposition,
                         snapshot: snap.contentHash}) AS adverseEventReports,
       CASE WHEN count(eq) = 0 THEN 'IDENTIFIER' ELSE 'HYPOTHESIS' END AS matchBasis
```

- trace: TRACE on the openFDA JSON (FC-6 candidate: `/results/i/report_number` "2020-CFS-007354", `/results/i/products/j/name_brand` "CHROMADEX TRU NIAGEN"; disclaimer at `/meta/disclaimer`) and on the enforcement record behind the D8 RegulatoryRecord. Reports are "reported", never "measured" (CQ-AX-04).
- bitemporal episode needed on: none D11; D8 `CONCERNS` is recorded-only; product-match assessments are immutable records.

## Q-D11-19

- kind: cypher
- pattern: preprint → journal version through D3 `REVISES` (publicationKind PREPRINT revised by the journal article, asserted by the preprint server or Crossref `is-preprint-of`), then the claim occurrences on each version compared by Claim (kernel `OCCURRENCE_OF`).

```cypher
MATCH (pre:Publication)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'DOI', value: $preprintDoi})
OPTIONAL MATCH (jrnl:Publication)-[r:REVISES]->(pre) WHERE r.recordedTo IS NULL
MATCH (pre)-[:HAS_IDENTIFIER]->(:Identifier)<-[:HAS_IDENTIFIER]-(preSrc:Source)
OPTIONAL MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(preSrc)
OPTIONAL MATCH (occ)-[:OCCURRENCE_OF]->(claim:Claim)
OPTIONAL MATCH (claim)<-[:OCCURRENCE_OF]-(occ2:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(jSrc:Source)
WHERE (jrnl)-[:HAS_IDENTIFIER]->(:Identifier)<-[:HAS_IDENTIFIER]-(jSrc)
RETURN jrnl.uid, r.assertionUid, claim.uid, occ.proposition AS preprintWording, occ2.proposition AS journalWording
```

- trace: TRACE of the REVISES assertion (bioRxiv API `published_doi`; B05) and of each claim occurrence; a missing link is reported as "no published version known", citing the kernel FIELD_NOT_REPORTED assertion on the COMPLETE bioRxiv API snapshot when the API answered with no `published_doi`, or the CaptureAttempt when the request failed.
- bitemporal episode needed on: D3 `REVISES`.

## CQ-PV-02

- kind: cypher
- pattern: locators re-found on newer snapshots (`reanchorsLocatorUid` chain, kernel property) plus the verifier's latest adjudication of the assertion on each snapshot; a LOCATOR_ERROR / PARSER_ERROR verdict means the span was not re-found.

```cypher
MATCH (a:Assertion {uid: $assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (newer:SourceLocator {reanchorsLocatorUid: loc.uid})<-[:HAS_LOCATOR]-(nsnap:SourceSnapshot)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
RETURN loc.selectorKind, loc.selectorJson, snap.retrievedAt, snap.contentHash,
       newer.uid, newer.reanchorMatch, nsnap.retrievedAt,
       collect({verdict: adj.verdict, method: adj.methodVersion}) AS adjudications
```

- trace: the locators themselves (FC-1 JATS, FC-3 SPL, FC-5 DSLD); the selector kind per source kind comes from CONFIG (`locatorKinds`).
- bitemporal episode needed on: none (snapshots and locators are immutable; re-anchoring is a property chain).

## CQ-PV-03

- kind: cypher
- pattern: assertion → locator → snapshot (`captureMethod` = "<action-space id>/<version>", `contentHash`, `retrievedAt`) → the run that captured it and the run that extracted the assertion → their Agents (model, prompt, skill, tool version).

```cypher
MATCH (a:Assertion {uid: $assertionUid})-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
MATCH (snap)-[:WAS_GENERATED_BY]->(cap:Activity)-[:WAS_ASSOCIATED_WITH]->(capAgent:Agent)
MATCH (a)-[:WAS_GENERATED_BY]->(ext:Activity)-[:WAS_ASSOCIATED_WITH]->(extAgent:Agent)
RETURN snap.captureMethod, snap.contentHash, snap.contentHashBasis, snap.retrievedAt,
       cap.missionId, cap.runId, capAgent.toolVersion,
       ext.runId, ext.methodVersion, extAgent.model, extAgent.promptVersion, extAgent.skillVersion
```

- trace: this is the trace itself; `captureMethod`'s prefix joins CONFIG to state the tool's readiness at capture time.
- bitemporal episode needed on: none.

## CQ-PV-05

- kind: cypher (+ CONFIG)
- pattern: two Sources that are renditions of the same record share an identifier (NCT, SPL_SET_ID, DOI); the primary one is the issuer's endpoint (CONFIG: registry `kind`/`provider` marks aggregators such as ICTRP, openFDA, OpenAlex); staleness = the aggregator's own "last refreshed" assertion versus the primary's last-update assertion.

```cypher
MATCH (id:Identifier {scheme: $scheme, value: $value})<-[:HAS_IDENTIFIER]-(src:Source)-[:HAS_SNAPSHOT]->(snap:SourceSnapshot)
OPTIONAL MATCH (fresh:Assertion {predicate: 'RECORD_LAST_UPDATED'})-[:HAS_SUBJECT]->(src)
WITH src, max(snap.retrievedAt) AS lastRetrieved, max(fresh.valueString) AS lastUpdatedPerSource,
     split(head(collect(snap.captureMethod)), '/')[0] AS toolId
RETURN src.canonicalUri, src.genre, toolId, lastRetrieved, lastUpdatedPerSource
// client side: JOIN toolId → registry (primary vs aggregator); lag = primary.lastUpdated - aggregator.lastUpdated
```

- trace: TRACE of each `RECORD_LAST_UPDATED` assertion (FC-8: ICTRP HTML `span#DataList3_ctl01_Last_updatedLabel` "12 December 2016" vs CT.gov `/protocolSection/statusModule/lastUpdatePostDateStruct`; FC-3: openFDA flattens the SPL boxed-warning section and loses its id).
- bitemporal episode needed on: kernel `HAS_IDENTIFIER` (a rendition endpoint can be re-pointed).

## CQ-AX-07

- kind: cypher
- pattern: audit of current accepted assertions lacking a locator, a reproducible snapshot (no contentHash, a tool rendition, or a partial capture), or a capture-fidelity adjudication.

```cypher
MATCH (a:Assertion) WHERE a.status = 'ACCEPTED' AND a.recordedTo IS NULL
OPTIONAL MATCH (a)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'CAPTURE_FIDELITY'})-[:ASSESSES]->(a)
WITH a, collect(snap) AS snaps, count(loc) AS locs, count(adj) AS adjs
WHERE locs = 0 OR adjs = 0
   OR all(s IN snaps WHERE s.contentHashBasis <> 'RAW_BYTES' OR s.captureCompleteness <> 'COMPLETE')
MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
RETURN a.uid, a.predicate, locs = 0 AS noLocator, adjs = 0 AS noAdjudication,
       [s IN snaps | s.contentHashBasis] AS hashBases, act.runId
LIMIT 200
```

- trace: the listed assertion and its generating run (who to re-run).
- bitemporal episode needed on: none.

## Q-D11-20

- kind: cypher (+ CONFIG)
- pattern: CONFIG lists, per tool and source kind, the selector kinds the tool can produce and the normalization version; the graph adds the observed selector kinds actually used on that tool's snapshots and the PARTIAL / LOSSY_RENDITION / NO_TEXT_LAYER attempt counts.

```cypher
MATCH (s:SourceSnapshot)-[:HAS_LOCATOR]->(loc:SourceLocator)
WITH split(s.captureMethod, '/')[0] AS toolId, loc.selectorKind AS kind, count(*) AS n
WITH toolId, collect({kind: kind, n: n}) AS selectorUse
OPTIONAL MATCH (c:CaptureAttempt {toolId: toolId}) WHERE c.failureKind IN ['LOSSY_RENDITION', 'NO_TEXT_LAYER', 'PARSE_ERROR']
RETURN toolId, selectorUse, count(c) AS renditionProblems
```

- trace: per tool, example locators (`selectorJson`) and the attempts; CONFIG `locatorKinds` is the declared capability.
- bitemporal episode needed on: none.

## Q-D11-21

- kind: cypher (+ assessment, published)
- pattern: the brand's claim occurrence (kernel CLAIM assertion on the brand page snapshot) → the Claim → an evidence mission (kernel loop: vetting Assessment RESEARCH → EVIDENCE_MISSION Activity → evidence Report); the per-dimension match of study material versus product (form, dose, schedule) is an APPLICABILITY Assessment the mission records, citing the D3 component and the D6 label line.

```cypher
MATCH (occ:Assertion {assertionKind: 'CLAIM'})-[:HAS_SUBJECT]->(prod:Product {uid: $productUid})
MATCH (occ)-[:OCCURRENCE_OF]->(claim:Claim)
MATCH (occ)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
OPTIONAL MATCH (rep:Report {reportKind: 'EVIDENCE_REPORT'})-[:ASSESSES]->(claim)
OPTIONAL MATCH (rep)-[:WAS_GENERATED_BY]->(mission:Activity)
OPTIONAL MATCH (app:Assessment {assessmentKind: 'APPLICABILITY'})-[:ASSESSES]->(prod)
WHERE (app)-[:WAS_GENERATED_BY]->(mission)
RETURN loc.exact AS brandClaim, snap.contentHashBasis, claim.uid, rep.verdict, mission.missionId,
       collect({summary: app.summary, verdict: app.verdict}) AS materialMatch
```

- trace: TRACE on the brand page (FC-9 candidate: "Our foundational 300mg daily serving is clinically shown to increase NAD+ levels by over 50% in most individuals."; a tool rendition, so the claim stays below ACCEPTED until raw bytes are captured), the report's `HAS_EVIDENCE` locators and `DERIVED_FROM` inputs (FC-1 Par30: 1000 mg/day of the chloride).
- bitemporal episode needed on: none D11 (kernel records); D6 `HAS_LABEL_VERSION` (episode) and D3 `ADMINISTERS` (recorded-only) on the compared sides.

## Q-D11-22

- kind: cypher (materialized by a PROJECTION Activity on a weekly cadence; result published as a kernel Report of kind PROFILE with `methodVersion` `identifier-coverage/v1`; no GDS — a grouped count over HAS_IDENTIFIER answers it)
- pattern: share of current entities per label that carry a current identifier of each expected scheme (expected schemes per node type from each packet's `06-node-register.yaml identifierSchemes`, CONFIG).

```cypher
UNWIND $expected AS e                      // [{label: 'ChemicalSubstance', scheme: 'UNII'}, …]
CALL (e) {
  MATCH (n:$(e.label))
  WITH n, EXISTS { MATCH (n)-[h:HAS_IDENTIFIER]->(:Identifier {scheme: e.scheme}) WHERE h.recordedTo IS NULL } AS has
  RETURN count(n) AS total, sum(CASE WHEN has THEN 1 ELSE 0 END) AS withScheme
}
RETURN e.label, e.scheme, total, withScheme, CASE WHEN total = 0 THEN null ELSE toFloat(withScheme) / total END AS share
```

- trace: the Report's `DERIVED_FROM` is omitted (aggregate over all identifier assertions); the Report carries `inputSetDigest` over the HAS_IDENTIFIER relationship uids counted, and the PROJECTION Activity's run id.
- bitemporal episode needed on: kernel `HAS_IDENTIFIER` (only current episodes counted; `$asOf` reproduces an older report).

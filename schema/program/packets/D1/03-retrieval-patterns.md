# D1 — retrieval patterns

MODEL stage (Wave 2), A2, 2026-10-08; seam paths rewritten in the CHECK stage (2026-10-08) to the sibling SDL names verified in their worktrees (D6 `LabelVersion`, D3 `InterventionComponent`, D8 `CONCERNS`/`LegalStatus`, D9 `Chunk`/`CHUNK_OF`/`COVERS_LOCATOR`, D12 `FOOD_CONTAINS`, D5 threshold predicates). ADVERSARIAL-REVIEW stage (same day): NUTRIENT_EXPRESSED_AS read as a predicate-only Assertion (Q-D1-02, Q-D1-19); D6 lines are asserted with their own Assertion and carry `massBasis` (D6 adversarial review; CQ-PF-01, Q-D1-24); Q-D1-03 reads only D5's `HAS_UPPER_LIMIT` with a `limitKind` qualifier; Q-D1-11 filters standardization on the edge; Q-D1-12 restricts signals by the `plantPart=` facet; Q-D1-15 walks PARENT_TAXON up to the genus valid at `$vt`. One section per question in `02-questions.md`. Cypher is Neo4j 5.26 syntax (Cypher 5; `CALL (x) { … }` subqueries; no `CYPHER 25` prefix, no `SEARCH` clause — close-out pattern lint 2026-10-09). Types outside D1 are listed in `10-seams.yaml`; the synthesizer renames them if those modules change names.

## Conventions used by every pattern

**Parameters.** `$vt` valid-time instant ("as of what was true on date V"); `$rt` recorded-time instant ("as the graph knew it at T"; default `datetime()`).

**Episode predicate `EP(r)`** for edges with a bitemporal episode (MATERIAL_CONTAINS, PARENT_TAXON, and D6 state attachments):

```cypher
r.recordedFrom <= $rt AND (r.recordedTo IS NULL OR r.recordedTo > $rt)
AND (r.validFrom IS NULL OR r.validFrom <= $vt) AND (r.validTo IS NULL OR r.validTo > $vt)
```

**Recorded predicate `REC(r)`** for asserted edges that are recorded-only (HAS_ACTIVE_MOIETY, COUNTS_TOWARD_NUTRIENT, REALIZES_SUBSTANCE, DERIVED_FROM_TAXON — kernel `AssertedRecordedProperties`, which has no valid-time fields): the first line of `EP(r)` only. On episode edges a null valid bound means unknown, never "ongoing".

**Seam paths** (other modules' SDL, verified 2026-10-08; `10-seams.yaml`):

- Label current at `$vt`: `(p:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv)` with `EP(h)` on the D6 `StateEpisodeProperties` episode; then `(lv:LabelVersion)-[d:DECLARES_COMPONENT]->(t)` where `t` is an `IngredientMaterial`, a `Constituent` (nutrient line) or a D12 `FoodItem`. Since D6's adversarial review `DECLARES_COMPONENT` is an **asserted** line (`ComponentLineProperties` = kernel `AssertedRecordedProperties` + amount, unitCode, amountReferent, `massBasis` (D1 `MassBasis`), amountBasis, lineRole, orderIndex/parentOrderIndex, declaredNameVerbatim, formVerbatim): `d.assertionUid` is the line's own Assertion (predicate `DECLARES_COMPONENT`, subject the LabelVersion, object the line target, the panel-row locator), and that Assertion is the `DERIVED_FROM` input of every CALCULATED amount built on the line. D6 has no `ChemicalSubstance` target (a chemical line resolves to a CHEMICALLY_DEFINED IngredientMaterial).
- Study material: `(st:Study)-[:HAS_ARM]->(:StudyArm)-[:HAS_COMPONENT]->(ic:InterventionComponent)-[ad:ADMINISTERS]->(m:IngredientMaterial)`; the dose is on `ic` (`quantity`, `unitCode`, `quantityBasis`, `massBasis` — D1 `MassBasis`, D3 dropped its own copy); `ad` is asserted, recorded-only (`AssertedRecordedProperties`, `ad.assertionUid`).

**TRACE** (how every answer cites locators — the kernel evidence chain, 00-DIRECTIVE 3.10). Given the `assertionUid`s an answer rests on (edge property `r.assertionUid`, or the uid of a CALCULATED Assertion):

```cypher
CALL (uids) {
  UNWIND uids AS u
  MATCH (a:Assertion {uid: u})
  // CALCULATED assertions: walk to their leaf inputs (declarations, MW fields, authority relations)
  MATCH (a)-[:DERIVED_FROM*0..4]->(leaf:Assertion) WHERE leaf.basisKind IS NULL OR leaf.basisKind <> 'CALCULATED'
  MATCH (leaf)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  MATCH (leaf)-[:ASSERTED_BY]->(who)
  OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(leaf) WHERE adj.recordedTo IS NULL
  RETURN collect({assertion: a.uid, rule: a.derivationRule, leaf: leaf.uid, status: leaf.status, asserter: who.uid,
                  role: ev.role, selectorKind: loc.selectorKind, exact: loc.exact, start: loc.startOffset, end: loc.endOffset,
                  page: loc.page, snapshot: snap.uid, contentHash: snap.contentHash, retrievedAt: snap.retrievedAt,
                  source: src.canonicalUri, verdict: adj.verdict}) AS citations
}
```

An answer row is publishable only when every leaf has a locator and a current CAPTURE_FIDELITY adjudication (kernel rule); `status` and `verdict` are returned so the answer layer can say "proposed / held".

**Materialized derived amounts** ("the projection"). A PROJECTION Activity (`activityKind: PROJECTION`, `methodVersion` = rule set version, e.g. `d1-amounts/v1`) writes, for every current declaration, CALCULATED kernel Assertions: predicates `MOIETY_EQUIVALENT_AMOUNT` (`rule:mw-ratio.v1`), `NUTRIENT_EQUIVALENT_AMOUNT` (`rule:nutrient-equivalent.v1`) and `PER_MAX_DAILY_DOSE_AMOUNT` (`rule:daily-max.v1`), each with `valueNumber`, `unitCode`, `HAS_SUBJECT` → the declaration owner (D6 `LabelVersion`, D3 `InterventionComponent`), `HAS_OBJECT` → the moiety `ChemicalSubstance` or the nutrient `Constituent`, and `DERIVED_FROM` → every input Assertion (the line's `DECLARES_COMPONENT` Assertion `d.assertionUid`, both molecular-weight FIELD assertions with their GSRS record version, the HAS_ACTIVE_MOIETY / COUNTS_TOWARD_NUTRIENT assertions, the predicate-only `NUTRIENT_EXPRESSED_AS` Assertion of the jurisdiction valid at the label's date, the MAX_DAILY_SERVINGS assertion on the label version). The reference form is read as `(e:Assertion {predicate: 'NUTRIENT_EXPRESSED_AS'})-[:HAS_SUBJECT]->(n)` with `'jurisdiction ' + $jurisdiction IN e.qualifiers` and `e.validFrom/validTo` around `$vt`. Refresh: event-driven on any new or superseded input (the kernel's staleness rule: an output is stale when any input has `recordedTo` set) plus a nightly sweep. Indexes: `Assertion(predicate)`, `Assertion(basisKind)`, relationship-property indexes on `assertionUid` (kernel). It is never a stored fact on a product, and never an edge.

**Fulltext index** (owned by D1, used by Q-D1-26 and agents):

```cypher
CREATE FULLTEXT INDEX d1_identity_fulltext IF NOT EXISTS
FOR (n:ChemicalSubstance|IngredientMaterial|Constituent|Taxon) ON EACH [n.name, n.searchText];
```

---

## CQ-PF-01

- kind: cypher
- pattern (declared basis of each amount on a label version, and the calculated amounts that follow):

```cypher
MATCH (lv:LabelVersion {uid: $labelVersionUid})-[d:DECLARES_COMPONENT]->(target)   // D6 seam (asserted line); target IngredientMaterial|Constituent|FoodItem
WHERE d.recordedFrom <= $rt AND (d.recordedTo IS NULL OR d.recordedTo > $rt)
OPTIONAL MATCH (target:IngredientMaterial)-[rs:REALIZES_SUBSTANCE]->(form:ChemicalSubstance)
WHERE rs.recordedFrom <= $rt AND (rs.recordedTo IS NULL OR rs.recordedTo > $rt)
OPTIONAL MATCH (form)-[:HAS_ACTIVE_MOIETY]->(moiety:ChemicalSubstance)
OPTIONAL MATCH (form)-[:COUNTS_TOWARD_NUTRIENT]->(nut:Constituent)
// the line's own Assertion (D6 adversarial review) is the projection's DERIVED_FROM input for this line
MATCH (decl:Assertion {uid: d.assertionUid})
OPTIONAL MATCH (calc:Assertion {basisKind: 'CALCULATED'})-[:DERIVED_FROM]->(decl)
WHERE calc.recordedTo IS NULL AND (calc)-[:HAS_SUBJECT]->(lv)
RETURN d.declaredNameVerbatim AS declaredAs, d.formVerbatim, d.amount, d.unitCode, d.amountReferent, d.massBasis, d.amountBasis, d.lineRole,
       form.name AS form, moiety.name AS moiety, nut.name AS nutrient, decl.uid AS declaration,
       collect({predicate: calc.predicate, value: calc.valueNumber, unit: calc.unitCode, rule: calc.derivationRule, uid: calc.uid}) AS calculated
```

- trace: TRACE over `decl.uid` (the label row locator: DSLD JSON_POINTER `/ingredientRows/0/quantity/0`) and over each `calc.uid` (walks DERIVED_FROM to the GSRS molecular-weight locators).
- bitemporal episode needed on: none in D1 — the asserted `DECLARES_COMPONENT` line is recorded-only inside a LabelVersion that D6 attaches with the `HAS_LABEL_VERSION` StateEpisode; D1 edges here are recorded-only.

## Q-D1-01

- kind: cypher
- pattern (form → active moiety, mass ratio, authority record):

```cypher
MATCH (form:ChemicalSubstance {uid: $formUid})-[r:HAS_ACTIVE_MOIETY]->(m:ChemicalSubstance)
WHERE r.recordedFrom <= $rt AND (r.recordedTo IS NULL OR r.recordedTo > $rt)
// the molecular weights a derivation must cite are FIELD assertions, not the cached properties
OPTIONAL MATCH (mwF:Assertion {predicate: 'MOLECULAR_WEIGHT', status: 'ACCEPTED'})-[:HAS_SUBJECT]->(form) WHERE mwF.recordedTo IS NULL
OPTIONAL MATCH (mwM:Assertion {predicate: 'MOLECULAR_WEIGHT', status: 'ACCEPTED'})-[:HAS_SUBJECT]->(m)  WHERE mwM.recordedTo IS NULL
RETURN form.name, m.name, mwF.valueNumber AS mwForm, mwM.valueNumber AS mwMoiety,
       mwM.valueNumber / mwF.valueNumber AS moietyMassFraction,
       [r.assertionUid, mwF.uid, mwM.uid] AS cite
```

- trace: TRACE over `cite`: GSRS `relationships[i].type = "ACTIVE MOIETY"` and `structure.mwt` JSON_POINTER locators on the two GSRS snapshots (record `version` on the snapshot; the rule names which record supplied each MW — the moiety record's 255.2476, not the in-record normalized 254.2397).
- bitemporal episode needed on: none (recorded-only; a GSRS correction supersedes the Assertion).

## Q-D1-02

- kind: cypher (reads the materialized projection)
- pattern (per serving and per maximum daily dose, normalized to moiety or nutrient):

```cypher
MATCH (p:ProductVariant {uid: $productUid})-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv:LabelVersion)   // D6 state attachment
WHERE h.recordedFrom <= $rt AND (h.recordedTo IS NULL OR h.recordedTo > $rt)
  AND (h.validFrom IS NULL OR h.validFrom <= $vt) AND (h.validTo IS NULL OR h.validTo > $vt)
MATCH (calc:Assertion {basisKind: 'CALCULATED'})-[:HAS_SUBJECT]->(lv)
WHERE calc.predicate IN ['MOIETY_EQUIVALENT_AMOUNT', 'NUTRIENT_EQUIVALENT_AMOUNT', 'PER_MAX_DAILY_DOSE_AMOUNT']
  AND calc.recordedTo IS NULL
MATCH (calc)-[:HAS_OBJECT]->(target) WHERE target.uid = $targetUid    // moiety ChemicalSubstance or nutrient Constituent
// reference form of a nutrient amount: the predicate-only NUTRIENT_EXPRESSED_AS Assertion the calculation cited
OPTIONAL MATCH (calc)-[:DERIVED_FROM*1..2]->(e:Assertion {predicate: 'NUTRIENT_EXPRESSED_AS'})-[:HAS_OBJECT]->(ref:ChemicalSubstance)
RETURN calc.predicate, calc.valueNumber, calc.unitCode, calc.derivationRule, ref.name AS expressedAs, e.qualifiers AS convention, calc.uid
```

- trace: TRACE over `calc.uid` (derivation chain declaration → ratio → servings/day, each leaf with its locator; the NUTRIENT_EXPRESSED_AS leaf carries the TGA locator).
- bitemporal episode needed on: D6 HAS_LABEL_VERSION (which label was current at `$vt`). The reference-form convention's valid time and jurisdiction are on its Assertion (predicate-only since the adversarial review); the projection picked the one valid at the label's date.

## Q-D1-03

- kind: cypher (materialized projection joined to threshold assertions)
- pattern (products or a stack above a nutrient/moiety threshold per maximum daily dose, counting every converting form):

```cypher
MATCH (n {uid: $nutrientOrMoietyUid})           // Constituent(NUTRIENT) or ChemicalSubstance(moiety)
// threshold knowledge is D5's HAS_UPPER_LIMIT, qualifier limitKind:<UL | MONOGRAPH_MAX | LABEL_MAX | SCHEDULING_THRESHOLD | LABEL_WARNING_THRESHOLD>
// (the last two requested from D5 with D1.Constituent as subject, OQ-D1-03)
MATCH (thr:Assertion {predicate: 'HAS_UPPER_LIMIT'})-[:HAS_SUBJECT]->(n)
WHERE thr.recordedTo IS NULL
  AND any(q IN thr.qualifiers WHERE q = 'jurisdiction ' + $jurisdiction)
  AND ($limitKinds IS NULL OR any(q IN thr.qualifiers WHERE q IN [k IN $limitKinds | 'limitKind:' + k]))
  AND (thr.validFrom IS NULL OR thr.validFrom <= $vt) AND (thr.validTo IS NULL OR thr.validTo > $vt)
MATCH (calc:Assertion {predicate: 'PER_MAX_DAILY_DOSE_AMOUNT', basisKind: 'CALCULATED'})-[:HAS_OBJECT]->(n)
WHERE calc.recordedTo IS NULL AND calc.valueNumber > thr.valueNumber
MATCH (calc)-[:HAS_SUBJECT]->(lv:LabelVersion)<-[h:HAS_LABEL_VERSION]-(:Package)<-[:HAS_PACKAGE]-(p:ProductVariant)
WHERE h.recordedTo IS NULL AND (h.validFrom IS NULL OR h.validFrom <= $vt) AND (h.validTo IS NULL OR h.validTo > $vt)
RETURN p.uid, p.name, calc.valueNumber AS dailyMax, calc.unitCode, thr.valueNumber AS threshold,
       [q IN thr.qualifiers WHERE q STARTS WITH 'limitKind:'] AS limitKind, thr.uid AS thresholdAssertion, calc.uid
ORDER BY dailyMax DESC
// "unknown equivalence" flag: declarations whose form reaches n by COUNTS_TOWARD_NUTRIENT but have no calc (rule table lacks the form)
```

  Stack variant (a person's stack is a query-time sum over the stack's product uids, never stored): `UNWIND $stack AS pid … RETURN sum(calc.valueNumber)`.
  Reverse expansion that feeds the projection: `(form)-[:HAS_ACTIVE_MOIETY*0..1]->(:ChemicalSubstance)-[:COUNTS_TOWARD_NUTRIENT]->(n)`.
- trace: TRACE over `calc.uid` and `thr.uid` (TGA "per recommended daily dose" locator; NIH ODS UL locator). The comparison itself may also be materialized as CALCULATED `EXCEEDS_DOSE_THRESHOLD` checks (`rule:threshold-compare.v1`), **one per (label version, threshold) pair**, each `DERIVED_FROM` exactly its daily amount and its threshold Assertion (fixture `vitamin-b6-threshold-harm` c10a–c10d).
- bitemporal episode needed on: D6 HAS_LABEL_VERSION (the threshold's valid time is on its Assertion).

## Q-D1-04

- kind: cypher
- pattern (label names and forms that contain nutrient or moiety M without saying so):

```cypher
MATCH (n {uid: $mUid})
MATCH (form:ChemicalSubstance)
WHERE (form)-[:COUNTS_TOWARD_NUTRIENT]->(n) OR (form)-[:HAS_ACTIVE_MOIETY]->(n)
   OR (form)-[:HAS_ACTIVE_MOIETY]->(:ChemicalSubstance)-[:COUNTS_TOWARD_NUTRIENT]->(n)
OPTIONAL MATCH (mat:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(form)
OPTIONAL MATCH (lv:LabelVersion)-[:DECLARES_COMPONENT]->(mat)
RETURN form.name AS chemicalName, form.searchText AS labelSpellings, collect(DISTINCT mat.name) AS materials,
       count(DISTINCT lv) AS labelVersions
```

- trace: TRACE over the COUNTS_TOWARD_NUTRIENT / HAS_ACTIVE_MOIETY assertion uids (NIH ODS six vitamers; GSRS relation) and the TGA locator "label lists the chemical name without the common name".
- bitemporal episode needed on: none (recorded-only edges).

## Q-D1-05

- kind: cypher
- pattern (products containing S in any form at or above dose D per day, as declared on the label current at V):

```cypher
MATCH (s:ChemicalSubstance {uid: $sUid})
MATCH (form:ChemicalSubstance) WHERE form = s OR (form)-[:HAS_ACTIVE_MOIETY]->(s)
MATCH (mat:IngredientMaterial)-[rs:REALIZES_SUBSTANCE]->(form)
WHERE rs.recordedFrom <= $rt AND (rs.recordedTo IS NULL OR rs.recordedTo > $rt)
MATCH (lv:LabelVersion)-[d:DECLARES_COMPONENT]->(mat)
MATCH (p:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv)
WHERE h.recordedFrom <= $rt AND (h.recordedTo IS NULL OR h.recordedTo > $rt)
  AND (h.validFrom IS NULL OR h.validFrom <= $vt) AND (h.validTo IS NULL OR h.validTo > $vt)
OPTIONAL MATCH (calc:Assertion {predicate: 'PER_MAX_DAILY_DOSE_AMOUNT', basisKind: 'CALCULATED'})-[:HAS_SUBJECT]->(lv),
               (calc)-[:HAS_OBJECT]->(s) WHERE calc.recordedTo IS NULL
WITH p, d, form, calc, h WHERE calc.valueNumber >= $dosePerDay
RETURN p.name, d.amount, d.unitCode, d.amountReferent, form.name AS declaredForm, calc.valueNumber AS moietyPerDay, h.assertionUid, calc.uid
```

- trace: TRACE over `d.assertionUid` (the label row) and `calc.uid` (whose DERIVED_FROM reaches the same line Assertion); the answer states "declared on label snapshot of date …" from the snapshot `retrievedAt`. Measured content (Q-D1-09) is never mixed in.
- bitemporal episode needed on: D6 HAS_LABEL_VERSION (label current at V).

## CQ-ID-03

- kind: cypher
- pattern (does a declaration name a substance, a material that realizes it, or a constituent the material provides):

```cypher
MATCH (lv:LabelVersion {uid: $lvUid})-[d:DECLARES_COMPONENT]->(t)
OPTIONAL MATCH (t:IngredientMaterial)-[rs:REALIZES_SUBSTANCE]->(s:ChemicalSubstance)
OPTIONAL MATCH (t:IngredientMaterial)-[c:MATERIAL_CONTAINS]->(k)
WHERE c.recordedTo IS NULL AND (c.validTo IS NULL OR c.validTo > $vt)
RETURN labels(t)[0] AS declares, t.name, s.name AS realizes,
       collect({target: k.name, kind: c.statementKind, q: c.quantity, cmp: c.comparator, unit: c.unitCode, uid: c.assertionUid}) AS contents,
       d.declaredNameVerbatim, d.lineRole, d.assertionUid AS line, rs.assertionUid
```

- trace: TRACE over the label line (`d.assertionUid`), `rs.assertionUid` (DSLD form UNII) and each content `uid` (DSLD notes span).
- bitemporal episode needed on: MATERIAL_CONTAINS.

## CQ-ID-04

- kind: cypher
- pattern (identifiers supporting a substance match, with authority snapshot, and disagreements):

```cypher
MATCH (s:ChemicalSubstance {uid: $sUid})
MATCH (s)-[l:HAS_IDENTIFIER]->(i:Identifier)            // kernel edge stored Subjectable → Identifier (Identifier.identifies is IN), IdentifierLinkProperties episode
WHERE l.recordedFrom <= $rt AND (l.recordedTo IS NULL OR l.recordedTo > $rt)
OPTIONAL MATCH (other)-[l2:HAS_IDENTIFIER]->(i) WHERE other <> s AND l2.recordedTo IS NULL   // same string on another record = disagreement
RETURN i.scheme, i.value, l.isPrimary, l.assertionUid, collect(other.uid) AS alsoAssignedTo
```

- trace: TRACE over `l.assertionUid` (GSRS `codes[]` JSON_POINTER; PubChem property record; DSLD form `uniiCode`).
- bitemporal episode needed on: kernel HAS_IDENTIFIER (already an episode).

## Q-D1-06

- kind: cypher
- pattern (conflicting identity statements; rejected automatic matches):

```cypher
MATCH (x {uid: $uid}) WHERE x:ChemicalSubstance OR x:IngredientMaterial
// RESOLUTION / EQUIVALENCE assessments (kernel) that rejected or disputed a match involving x
OPTIONAL MATCH (asmt:Assessment)-[:ASSESSES]->(x)
WHERE asmt.assessmentKind IN ['RESOLUTION', 'EQUIVALENCE'] AND asmt.recordedTo IS NULL
// competing identifier assertions: same scheme, different values, both current
OPTIONAL MATCH (x)-[l1:HAS_IDENTIFIER]->(i1:Identifier), (x)-[l2:HAS_IDENTIFIER]->(i2:Identifier)
WHERE i1.scheme = i2.scheme AND i1.value < i2.value AND l1.recordedTo IS NULL AND l2.recordedTo IS NULL
RETURN x.name, collect(DISTINCT {kind: asmt.assessmentKind, subkind: asmt.assessmentSubkind, verdict: asmt.verdict, status: asmt.status, uid: asmt.uid}) AS judgments,
       collect(DISTINCT [i1.scheme, i1.value, i2.value]) AS conflicts
```

- trace: TRACE over the identifier link assertions; each assessment's `HAS_EVIDENCE` locators (DSLD sentinel UNII; PubChem name→CID resolving to the moiety; GSRS root record used for an extract).
- bitemporal episode needed on: none beyond kernel HAS_IDENTIFIER.

## Q-D1-07

- kind: cypher (reads kernel EQUIVALENCE assessments; the judgment itself is an assessment)
- pattern:

```cypher
MATCH (a:IngredientMaterial {uid: $aUid}), (b:IngredientMaterial {uid: $bUid})
OPTIONAL MATCH (eq:Assessment {assessmentKind: 'EQUIVALENCE'})-[:ASSESSES]->(a), (eq)-[:ASSESSES]->(b)
WHERE eq.recordedTo IS NULL
// structural facts that bound the answer even without an assessment
OPTIONAL MATCH (a)-[:REALIZES_SUBSTANCE]->(sa:ChemicalSubstance)
OPTIONAL MATCH (b)-[:REALIZES_SUBSTANCE]->(sb:ChemicalSubstance)
RETURN eq.assessmentSubkind AS identityLevel,   // D1 registers: SAME_SUBSTANCE | SAME_FORM | SAME_BRANDED_MATERIAL | SAME_SPECIFICATION | SUBSTANCE_RELATED | NOT_EQUIVALENT | UNRESOLVED
       eq.methodVersion, eq.uid, sa = sb AS sameDefiningSubstance,
       [a.physicalForm, a.grade, a.brandName] AS aKeys, [b.physicalForm, b.grade, b.brandName] AS bKeys
```

- trace: the assessment's `DERIVED_FROM` input assertions → TRACE (10-K grade text; label trademark statements; GSRS record).
- bitemporal episode needed on: none (assessments carry recordedAt/recordedTo and supersession).

## CQ-ID-06

- kind: cypher
- pattern (which material a study administered; same material as a current product component or only same substance):

```cypher
MATCH (ic:InterventionComponent {uid: $componentUid})-[ad:ADMINISTERS]->(t:IngredientMaterial)   // D3 seam (StudyArm -HAS_COMPONENT-> InterventionComponent)
OPTIONAL MATCH (res:Assessment {assessmentKind: 'RESOLUTION'})-[:ASSESSES]->(t) WHERE res.recordedTo IS NULL
OPTIONAL MATCH (t)-[:REALIZES_SUBSTANCE]->(s:ChemicalSubstance)
OPTIONAL MATCH (lv:LabelVersion)-[:DECLARES_COMPONENT]->(pm:IngredientMaterial)
WHERE pm = t OR (pm)-[:REALIZES_SUBSTANCE]->(s)
RETURN t.name AS administered, t.materialKind, ic.quantity, ic.unitCode, ic.massBasis,
       collect(DISTINCT {hyp: res.assessmentSubkind, score: res.score, uid: res.uid}) AS hypotheses,
       collect(DISTINCT {labelVersion: lv.uid, path: CASE WHEN pm = t THEN 'SAME_MATERIAL' ELSE 'SAME_SUBSTANCE_ONLY' END}) AS products
```

- trace: TRACE over `ad.assertionUid` (methods span) and the RESOLUTION assessments' evidence locators; "UNRESOLVED" is a valid answer when `t.materialKind = 'UNRESOLVED'`.
- bitemporal episode needed on: none in D1.

## CQ-ST-02

- kind: cypher
- pattern (products sharing a substance or material with a study intervention, with path type):

```cypher
MATCH (st:Study {uid: $studyUid})-[:HAS_ARM]->(:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)-[:ADMINISTERS]->(t:IngredientMaterial)
OPTIONAL MATCH (t)-[:REALIZES_SUBSTANCE]->(sub:ChemicalSubstance)
MATCH (lv:LabelVersion)-[:DECLARES_COMPONENT]->(pm:IngredientMaterial)
OPTIONAL MATCH (pm)-[:REALIZES_SUBSTANCE]->(psub:ChemicalSubstance)
WITH t, sub, lv, pm, psub
WHERE pm = t OR psub = sub OR (psub)-[:HAS_ACTIVE_MOIETY]->(sub) OR (sub)-[:HAS_ACTIVE_MOIETY]->(psub)
MATCH (p:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv) WHERE h.recordedTo IS NULL AND h.validTo IS NULL
RETURN p.name, CASE WHEN pm = t THEN 'SAME_MATERIAL' WHEN psub = sub THEN 'SAME_SUBSTANCE' ELSE 'SAME_MOIETY_ONLY' END AS pathType
// SAME_LOT is D8 (Lot -LOT_OF-> Product | ProductVariant); added through the D8 seam when present
```

- trace: TRACE over the ADMINISTERS assertion uids, the label versions' `h.assertionUid` and the matched lines' `DECLARES_COMPONENT` assertions, and the REALIZES_SUBSTANCE / HAS_ACTIVE_MOIETY assertions on the path.
- bitemporal episode needed on: D6 HAS_LABEL_VERSION (current label).

## Q-D1-08

- kind: vector (entry) + cypher (path to locators) — the 00-DIRECTIVE 3.8 demonstration (fixture `07-fixtures/nr-trial-unstructured`)
- pattern:

```cypher
// 1. question → chunks: vector search over D9 chunk embeddings (index chunk_embedding owned by D9; Neo4j 5.26 procedure),
//    $embedding = the embedded question text ("capsule consisted of mg NR chloride dose per day"), filtered to the paper,
//    OR the derived MENTIONS projection to the D1 entities
CALL db.index.vector.queryNodes('chunk_embedding', 8, $embedding) YIELD node AS c, score
MATCH (c)-[:CHUNK_OF]->(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)          // D9 Chunk (absorbs DocumentTextVersion)
WHERE src.uid = $paperSourceUid    // a Chunk has no recorded time: a re-chunk writes new chunks (chunkerVersion / textVersionHash)
OPTIONAL MATCH (c)-[m:MENTIONS]->(e) WHERE e:IngredientMaterial OR e:ChemicalSubstance     // D9 derived, entity-link/vN
// 2. chunk → the located spans it covers (D9 derived COVERS_LOCATOR, span-overlap/v1) → the assertions citing them
//    (a chunk is never a locator; COVERS_LOCATOR is regenerable from chunk and locator offsets in the same snapshot)
MATCH (c)-[:COVERS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE]-(a:Assertion)
// 3. assertions → D1 entities and the assessment about the dose basis
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(obj) WHERE obj:IngredientMaterial OR obj:ChemicalSubstance
OPTIONAL MATCH (basis:Assessment {assessmentKind: 'APPLICABILITY', assessmentSubkind: 'D1.dose-mass-basis'})-[:DERIVED_FROM]->(a)
RETURN c.uid, score, collect(DISTINCT e.name) AS mentioned, a.predicate, a.valueNumber, a.unitCode, obj.name,
       loc.exact, loc.startOffset, loc.endOffset, snap.contentHash, basis.verdict, basis.summary
```

  Offsets: locator offsets and chunk `startOffset/endOffset` count in the same snapshot text (`Chunk.textVersionHash`; here raw JATS code points, fixture chunk Sec6 = 28532–30482). Deterministic entry without embeddings: `MATCH (s:ChemicalSubstance {uid: $nrChlorideUid})<-[:MENTIONS]-(c:Chunk)` (fixture `retrievalPath`). On Neo4j 2026.01+ the vector entry can instead be written with the Cypher 25 `SEARCH` clause (`MATCH (c:Chunk) SEARCH c IN (VECTOR INDEX chunk_embedding FOR $embedding LIMIT 8) SCORE AS score`); the 5.26 target uses the procedure above.
- trace: the locators returned in step 2 are the trace; the verifier re-selects them from `snap` (selector JSON + `contentHash`) and the same spans (offsets 28769, 29785) must come back. The dose-basis assessment cites both locators.
- bitemporal episode needed on: none (MENTIONS is derived, recorded-only).

## Q-D1-09

- kind: cypher
- pattern (measured vs declared content of substance S across products, per analytical study):

```cypher
MATCH (s:ChemicalSubstance {uid: $sUid})<-[:HAS_OBJECT]-(m:Assertion {predicate: 'MEASURED_CONTENT_IN_PRODUCT'})-[:HAS_SUBJECT]->(p:ProductVariant)
WHERE m.recordedTo IS NULL                                     // surveys that name no lot; lot results are D8 QualityResult -MEASURES_ANALYTE-> s
OPTIONAL MATCH (p)-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv:LabelVersion)-[d:DECLARES_COMPONENT]->(t:IngredientMaterial)
WHERE h.recordedTo IS NULL AND (h.validFrom IS NULL OR h.validFrom <= m.validFrom) AND (h.validTo IS NULL OR h.validTo > m.validFrom)
  AND (t)-[:REALIZES_SUBSTANCE]->(s)
MATCH (m)-[:ASSERTED_BY]->(lab)
RETURN p.name, d.amount AS declared, m.valueNumber AS measured, m.unitCode, m.qualifiers AS methodAndN, lab.name, m.uid, h.assertionUid
```

- trace: TRACE over `m.uid` (Cohen 2023 Results span) and `h.assertionUid` (declared label); scope = one sample, never generalized beyond the tested product/lot (qualifier).
- bitemporal episode needed on: D6 label attachment (declared label at the sampling date).

## Q-D1-10

- kind: cypher
- pattern:

```cypher
MATCH (u:Assertion {predicate: 'CONTAINS_UNDECLARED_SUBSTANCE'})-[:HAS_OBJECT]->(s:ChemicalSubstance)
MATCH (u)-[:HAS_SUBJECT]->(p) WHERE u.recordedTo IS NULL     // p: D6 ProductVariant (product kind via HAS_VARIANT from Product.productKind)
RETURN p.name, s.name, u.valueNumber, u.unitCode, u.uid
```

- trace: TRACE over `u.uid` (analysis Results span; JAMA letter CBD finding).
- bitemporal episode needed on: none.

## Q-D1-11

- kind: cypher
- pattern (botanical preparations of taxon T, with defining properties and products; optionally only those standardized to at least `$minPct` % of marker `$markerUid`):

```cypher
MATCH (t:Taxon {uid: $taxonUid})
MATCH (sp:Taxon) WHERE sp = t OR (sp)-[:PARENT_TAXON*1..3]->(t)      // genus → species → variety
MATCH (m:IngredientMaterial {materialKind: 'BOTANICAL_PREPARATION'})-[dt:DERIVED_FROM_TAXON]->(sp)
WHERE dt.recordedFrom <= $rt AND (dt.recordedTo IS NULL OR dt.recordedTo > $rt)
OPTIONAL MATCH (m)-[c:MATERIAL_CONTAINS]->(marker) WHERE c.statementKind = 'STANDARDIZATION_CLAIM' AND c.recordedTo IS NULL
WITH m, collect(DISTINCT {marker: marker, cmp: c.comparator, q: c.quantity, unit: c.unitCode, uid: c.assertionUid}) AS std
// the filter that earns ContentEdgeProperties' qualifiers (05 MATERIAL_CONTAINS rationale): a minimum or point claim
// (GTE, GT, EQ, APPROX) of at least $minPct % satisfies it; an LT/LTE limit never does
WHERE $minPct IS NULL OR any(s IN std WHERE s.marker.uid = $markerUid AND s.unit = '%'
                                    AND s.cmp IN ['GTE', 'GT', 'EQ', 'APPROX'] AND s.q >= $minPct)
OPTIONAL MATCH (lv:LabelVersion)-[:DECLARES_COMPONENT]->(m)
RETURN m.name, m.plantPart, m.preparationType, m.extractRatioLow, m.extractRatioHigh, m.extractionSolvent,
       [s IN std WHERE s.marker IS NOT NULL | {marker: s.marker.name, cmp: s.cmp, q: s.q, unit: s.unit, uid: s.uid}] AS standardization,
       count(DISTINCT lv) AS labelVersions
```

  GraphQL equivalent of the filter (why the qualifiers are edge properties, kernel M11 rule 3): `ingredientMaterials(where: { containsConstituentsConnection: { some: { edge: { statementKind: { eq: STANDARDIZATION_CLAIM }, unitCode: { eq: "%" }, quantity: { gte: 5 }, comparator: { in: [GTE, GT, EQ, APPROX] } } } } })`. Fixture: KSM-66 "min. 5% total withanolides" (GTE 5 %) passes `$minPct = 5`; its "< 0.1% withaferin A" (LT) never passes a withaferin filter.
  (PARENT_TAXON episodes are filtered with `EP` on each hop when `$vt` is given: `all(r IN relationships(path) WHERE EP(r))`.)
- trace: TRACE over `dt.assertionUid` (DSLD notes "Genus/Species/PlantPart"; LNHPD `source_material`) and `c.assertionUid`.
- bitemporal episode needed on: PARENT_TAXON, MATERIAL_CONTAINS.

## Q-D1-12

- kind: cypher
- pattern (preparations of a plant part flagged by a regulator, and products, for a person to avoid):

```cypher
MATCH (sig:Assessment {assessmentKind: 'SAFETY_SIGNAL', effectDirection: 'HARM'})-[:ASSESSES]->(x)
WHERE sig.recordedTo IS NULL AND (x:Taxon OR x:IngredientMaterial OR x:ChemicalSubstance)
// a signal about a taxon applies to its preparations; the graph restricts it to a plant part only through the registered
// kernel Assessment facet plantPart=<D1 PlantPart> (a signal without a plantPart facet applies to every part)
MATCH (m:IngredientMaterial)
WHERE (m = x OR (m)-[:REALIZES_SUBSTANCE]->(x) OR (m)-[:DERIVED_FROM_TAXON]->(:Taxon)-[:PARENT_TAXON*0..2]->(x))
  AND (none(f IN coalesce(sig.facets, []) WHERE f STARTS WITH 'plantPart=')
       OR ('plantPart=' + m.plantPart) IN sig.facets)
OPTIONAL MATCH (lv:LabelVersion)-[:DECLARES_COMPONENT]->(m)
OPTIONAL MATCH (p:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv) WHERE h.recordedTo IS NULL AND h.validTo IS NULL
RETURN sig.assessmentSubkind, sig.summary, [f IN coalesce(sig.facets, []) WHERE f STARTS WITH 'plantPart=' OR f STARTS WITH 'jurisdiction='] AS restriction,
       x.name AS flaggedEntity, m.name, m.plantPart, m.preparationType, collect(DISTINCT p.name) AS products, sig.uid
```

  Fixture `ashwagandha-plant-part-harm`: s02 (TGA liver signal, no plantPart facet) returns KSM-66 and the dried-root extract; s03 (India leaf ban as reported by TGA, `plantPart=LEAF`) returns neither, because both are `plantPart: ROOT`.
- trace: the assessment's HAS_EVIDENCE locators (TGA "should be avoided in individuals with existing liver disorders"; "The use of W. somnifera leaves was recently banned in" India; jurisdiction disagreement = sibling assessments, both returned) + TRACE over the DERIVED_FROM_TAXON assertion uids.
- bitemporal episode needed on: none in D1 (assessment supersession is recorded time).

## Q-D1-13

- kind: cypher
- pattern (what kind of content statement a botanical percentage is):

```cypher
MATCH (m:IngredientMaterial {uid: $mUid})-[c:MATERIAL_CONTAINS]->(k)
WHERE c.recordedFrom <= $rt AND (c.recordedTo IS NULL OR c.recordedTo > $rt)
  AND (c.validFrom IS NULL OR c.validFrom <= $vt) AND (c.validTo IS NULL OR c.validTo > $vt)
MATCH (a:Assertion {uid: c.assertionUid})      // range bounds, content basis, method: Assertion qualifiers (no question filters them)
RETURN k.name, labels(k)[0] AS targetKind, k.constituentKind, c.statementKind, c.comparator, c.quantity, c.unitCode,
       a.qualifiers AS basisRangeMethod, c.assertionUid
```

- trace: TRACE over `c.assertionUid` (DSLD notes "min. 5% total withanolides"; supplier page); the method, when stated, is a qualifier on the authorizing Assertion.
- bitemporal episode needed on: MATERIAL_CONTAINS (statements dated by source; specification changes).

## Q-D1-14

- kind: cypher
- pattern (strains in product P, count per serving, viability, studies that used the same strain):

```cypher
MATCH (p:ProductVariant {uid: $pUid})-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv:LabelVersion)-[d:DECLARES_COMPONENT]->(m:IngredientMaterial {materialKind: 'MICROBIAL_PREPARATION'})
WHERE h.recordedTo IS NULL AND (h.validTo IS NULL OR h.validTo > $vt)
MATCH (m)-[dt:DERIVED_FROM_TAXON]->(strain:Taxon) WHERE dt.recordedTo IS NULL
OPTIONAL MATCH (strain)-[pt:PARENT_TAXON]->(species:Taxon) WHERE pt.recordedTo IS NULL AND pt.validTo IS NULL
OPTIONAL MATCH (ic:InterventionComponent)-[:ADMINISTERS]->(m2:IngredientMaterial)-[:DERIVED_FROM_TAXON]->(strain) WHERE strain.rank = 'STRAIN'
OPTIONAL MATCH (ic)<-[:HAS_COMPONENT]-(:StudyArm)<-[:HAS_ARM]-(st:Study)
RETURN strain.scientificName, strain.rank, species.scientificName, m.viabilityState,
       d.amount AS countPerServing, d.unitCode, collect(DISTINCT st.uid) AS sameStrainStudies
```

- trace: TRACE over the label line (`d.assertionUid`; DSLD notes "10 billion CFUs" — a D6 declaration), `dt.assertionUid`, `pt.assertionUid` (NCBI ParentTaxId).
- bitemporal episode needed on: PARENT_TAXON (current classification), D6 label attachment.

## Q-D1-15

- kind: cypher (+ kernel RESOLUTION assessment)
- pattern (does a strain claim resolve to a deposited strain or only to a species, possibly under a superseded genus; and which genus was valid at `$vt`):

```cypher
MATCH (m:IngredientMaterial {uid: $mUid})-[dt:DERIVED_FROM_TAXON]->(t:Taxon) WHERE dt.recordedTo IS NULL
// walk up to the genus with EP on EVERY hop: strain → species (episode unaffected by 2020) → genus (dated episodes)
OPTIONAL MATCH path = (t)-[:PARENT_TAXON*1..2]->(genus:Taxon {rank: 'GENUS'})
WHERE all(r IN relationships(path) WHERE r.recordedFrom <= $rt AND (r.recordedTo IS NULL OR r.recordedTo > $rt)
          AND (r.validFrom IS NULL OR r.validFrom <= $vt) AND (r.validTo IS NULL OR r.validTo > $vt))
OPTIONAL MATCH (t)-[:HAS_IDENTIFIER]->(dep:Identifier) WHERE dep.scheme = 'CULTURE_COLLECTION'
OPTIONAL MATCH (res:Assessment {assessmentKind: 'RESOLUTION'})-[:ASSESSES]->(m) WHERE res.recordedTo IS NULL
RETURN t.scientificName, t.rank, genus.scientificName AS genusAsOf, [r IN relationships(path) | r.assertionUid] AS lineage,
       collect(DISTINCT dep.value) AS deposits,
       CASE WHEN t.rank = 'STRAIN' AND size(collect(DISTINCT dep.value)) > 0 THEN 'STRAIN' WHEN t.rank = 'STRAIN' THEN 'STRAIN_NO_DEPOSIT'
            WHEN t.rank = 'SPECIES' THEN 'SPECIES_ONLY' ELSE 'UNRESOLVED' END AS resolution,
       res.assessmentSubkind, res.uid
```

  Fixture `lgg-strain-resolution`: `$vt` = 2019-06-01 returns genusAsOf *Lactobacillus* (g03 open + g05 closed 1989 → 2020-04-15); `$vt` = 2026-10-08 returns *Lacticaseibacillus* (g03 + g04 from 2020-04-15). The strain → species hop (g03) is the same at both dates.
- trace: TRACE over `dt.assertionUid` (label strain string), the `lineage` assertion uids (NCBI ParentTaxId, DispName authorities, Zheng 2020 publication date) and the HAS_IDENTIFIER assertion (NCBI `<Synonym>Lactobacillus rhamnosus ATCC 53103</Synonym>` locator).
- bitemporal episode needed on: PARENT_TAXON (the species → genus hop: `$vt` before 2020-04-15 returns the legacy genus).

## Q-D1-16

- kind: cypher
- pattern (branded material in product P, mark owner, supplier, by source and time):

```cypher
MATCH (p:ProductVariant {uid: $pUid})-[:HAS_PACKAGE]->(:Package)-[:HAS_LABEL_VERSION]->(lv:LabelVersion)-[:DECLARES_COMPONENT]->(m:IngredientMaterial)
WHERE m.brandName IS NOT NULL
OPTIONAL MATCH (a:Assertion)-[:HAS_SUBJECT|HAS_OBJECT]->(m)
WHERE a.predicate IN ['MARKETED_UNDER_MARK', 'SUPPLIES_MATERIAL', 'MANUFACTURES_MATERIAL'] AND a.recordedTo IS NULL
  AND (a.validFrom IS NULL OR a.validFrom <= $vt) AND (a.validTo IS NULL OR a.validTo > $vt)
OPTIONAL MATCH (a)-[:HAS_SUBJECT|HAS_OBJECT]->(org) WHERE org <> m           // D7 Organization (mark owner, supplier, manufacturer; D8 declares no mark type)
RETURN m.brandName, a.predicate, org.name, a.validFrom, a.uid
```

- trace: TRACE over `a.uid` (label "Niagen and TRU Niagen are trademarks of ChromaDex, Inc."; 10-K supplier sentence).
- bitemporal episode needed on: none in D1 (valid time on the Assertion node; predicate-only).

## Q-D1-17

- kind: cypher
- pattern (products depending on a single-source or IP-protected material form):

```cypher
MATCH (m:IngredientMaterial) WHERE m.physicalForm IS NOT NULL OR m.brandName IS NOT NULL
OPTIONAL MATCH (sup:Assertion {predicate: 'SUPPLIES_MATERIAL'})-[:HAS_OBJECT]->(m) WHERE sup.recordedTo IS NULL
OPTIONAL MATCH (pat:Patent)-[pa:CONCERNS]->(x) WHERE x = m OR (m)-[:REALIZES_SUBSTANCE]->(x)   // D8 seam (union PatentTopic)
WITH m, count(DISTINCT sup) AS suppliers, collect(DISTINCT pat.uid) AS patents
WHERE suppliers <= 1 OR size(patents) > 0
MATCH (lv:LabelVersion)-[:DECLARES_COMPONENT]->(m)
MATCH (p:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv) WHERE h.recordedTo IS NULL AND h.validTo IS NULL
RETURN m.name, m.physicalForm, m.formDescriptor, suppliers, patents, collect(DISTINCT p.name) AS dependentProducts
```

- trace: TRACE over the supply assertions (10-K "We rely on a single supplier, W.R. Grace, for NRC") and the D8 `CONCERNS` assertions (`pa.assertionUid`).
- bitemporal episode needed on: none in D1.

## Q-D1-18

- kind: cypher
- pattern (forms, materials and products affected by a substance's regulatory-status change):

```cypher
MATCH (s:ChemicalSubstance {uid: $sUid})<-[st:STATUS_OF]-(ls:LegalStatus)                       // D8 seam, episode
WHERE st.recordedTo IS NULL
MATCH (form:ChemicalSubstance) WHERE form = s OR (form)-[:HAS_ACTIVE_MOIETY]->(s)
OPTIONAL MATCH (m:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(form)
OPTIONAL MATCH (lv:LabelVersion)-[:DECLARES_COMPONENT]->(m)
OPTIONAL MATCH (p:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv) WHERE h.recordedTo IS NULL AND h.validTo IS NULL
RETURN ls.statusKind, ls.jurisdiction, st.validFrom, form.name, collect(DISTINCT m.name) AS materials, collect(DISTINCT p.name) AS products
```

- trace: TRACE over `st.assertionUid` (FDA NMN determination; 10-K sentence) and the moiety/realizes assertions on the path.
- bitemporal episode needed on: D8 STATUS_OF (owned by D8).

## Q-D1-19

- kind: cypher (materialized projection; a ranking is computed at query time, published only as a D10 comparison Report)
- pattern (rank forms of a nutrient and products by elemental/nutrient amount per serving and per max daily dose):

```cypher
MATCH (n:Constituent {uid: $nutrientUid})<-[:COUNTS_TOWARD_NUTRIENT]-(form:ChemicalSubstance)
MATCH (calc:Assertion {predicate: 'PER_MAX_DAILY_DOSE_AMOUNT', basisKind: 'CALCULATED'})-[:HAS_OBJECT]->(n)
// the declared line the amount rests on: the D6 line Assertion (predicate DECLARES_COMPONENT) among the calc's inputs
MATCH (calc)-[:DERIVED_FROM*1..2]->(decl:Assertion {predicate: 'DECLARES_COMPONENT'})-[:HAS_OBJECT]->(declared)
WHERE calc.recordedTo IS NULL AND (declared = form OR (declared)-[:REALIZES_SUBSTANCE]->(form) OR declared = n)
MATCH (calc)-[:HAS_SUBJECT]->(lv:LabelVersion)<-[h:HAS_LABEL_VERSION]-(:Package)<-[:HAS_PACKAGE]-(p:ProductVariant)
WHERE h.recordedTo IS NULL AND h.validTo IS NULL
RETURN form.name, p.name, calc.valueNumber, calc.unitCode, calc.derivationRule, calc.uid
ORDER BY calc.valueNumber DESC
// price per unit of nutrient: join the D6 offer-price Assertions (OFFER_PRICE_*) at query time (never stored)
```

- trace: TRACE over every row's `calc.uid`; a published comparison is a kernel Report (`reportKind: COMPARISON`) that `DERIVED_FROM` these Assertions (D10 method).
- bitemporal episode needed on: none in D1 (the reference-form convention is a predicate-only Assertion among the projection inputs); D6 HAS_LABEL_VERSION for "current".

## Q-D1-20

- kind: cypher (derived check assertions)
- pattern (does a declared elemental/moiety amount agree with stoichiometry of the declared source form):

```cypher
MATCH (chk:Assertion {predicate: 'DECLARATION_STOICHIOMETRY_CHECK', basisKind: 'CALCULATED'})-[:HAS_SUBJECT]->(lv:LabelVersion {uid: $lvUid})
WHERE chk.recordedTo IS NULL
MATCH (chk)-[:HAS_OBJECT]->(target)                          // nutrient Constituent or moiety ChemicalSubstance
MATCH (chk)-[:DERIVED_FROM]->(inputs:Assertion)
RETURN target.name, chk.valueBoolean AS consistent, chk.valueNumber AS residual, chk.unitCode, chk.derivationRule,
       collect(inputs.uid) AS inputs
```

  The projection computes the check from the MW ratio of the realized substance and the reference form named by the NUTRIENT_EXPRESSED_AS Assertion (its inputs are returned above); a false flag is a derived check, never a finding of fraud.
- trace: TRACE over `chk.uid`.
- bitemporal episode needed on: none in D1 (the inputs' valid time is on their Assertions).

## Q-D1-21

- kind: cypher (D6 owns blends; D1 supplies identity)
- pattern:

```cypher
MATCH (lv:LabelVersion {uid: $lvUid})-[blend:DECLARES_COMPONENT {lineRole: 'BLEND_TOTAL'}]->(b)
MATCH (lv)-[member:DECLARES_COMPONENT {lineRole: 'BLEND_MEMBER'}]->(t) WHERE member.parentOrderIndex = blend.orderIndex
OPTIONAL MATCH (t:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(s:ChemicalSubstance)
RETURN blend.declaredNameVerbatim AS blend, blend.amount AS blendTotal, blend.unitCode, t.name, s.name,
       CASE WHEN member.amount IS NULL THEN 'AMOUNT_NOT_DISCLOSED (<= blend total)' ELSE toString(member.amount) END AS bound
```

- trace: the label panel locator through each line's own Assertion (`blend.assertionUid`, `member.assertionUid`; D6 asserted lines); 21 CFR 101.36(c) explains why the bound is all that can be said.
- bitemporal episode needed on: none in D1.

## Q-D1-22

- kind: cypher (D12 owns composition; D1 identity is shared)
- pattern:

```cypher
MATCH (c {uid: $compoundUid}) WHERE c:ChemicalSubstance OR c:Constituent
MATCH (target) WHERE target = c OR (target:ChemicalSubstance AND ((target)-[:COUNTS_TOWARD_NUTRIENT]->(c) OR (target)-[:HAS_ACTIVE_MOIETY]->(c)))
MATCH (f:FoodItem)-[fc:FOOD_CONTAINS]->(target)                                    // D12 seam
WHERE fc.recordedTo IS NULL
MATCH (a:Assertion {uid: fc.assertionUid})                                            // amount, unit, basis on the authorizing Assertion
RETURN f.name, f.preparationMethod, target.name, a.valueNumber AS amount, a.unitCode, a.qualifiers AS basis, fc.assertionUid
ORDER BY amount DESC
// D12's adversarial review (in progress 2026-10-08) types quantity / unitCode / statementKind on the edge
// (FoodContentProperties, same names as D1 ContentEdgeProperties): then read fc.quantity / fc.unitCode directly
```

- trace: TRACE over `fc.assertionUid` (FoodData Central JSON_POINTER; Phenol-Explorer row).
- bitemporal episode needed on: D12's composition edge (D12 decides).

## Q-D1-23

- kind: cypher (kernel claims; D9 containers)
- pattern:

```cypher
MATCH (occ:Assertion {assertionKind: 'CLAIM', speechAct: 'RECOMMENDS'})-[:HAS_SUBJECT]->(x)
WHERE (x:ChemicalSubstance OR x:IngredientMaterial) AND occ.recordedTo IS NULL
MATCH (occ)-[:HAS_OBJECT]->(t:Target {uid: $targetUid})                         // D5 vocabulary (kernel subject/object)
OPTIONAL MATCH (res:Assessment {assessmentKind: 'RESOLUTION'})-[:ASSESSES]->(x) WHERE res.recordedTo IS NULL
MATCH (occ)-[:ASSERTED_BY]->(who)
RETURN x.name, labels(x)[0] AS identityLevel, who.name, occ.uid, res.assessmentSubkind AS resolutionStatus
```

- trace: TRACE over `occ.uid` (episode or post span; D9 container); the speaker's financial interest is a D7 seam.
- bitemporal episode needed on: none.

## Q-D1-24

- kind: cypher (materialized reconciliation)
- pattern (same product line, US salt basis vs Canadian moiety basis):

```cypher
MATCH (us:LabelVersion {uid: $usLv})-[d1:DECLARES_COMPONENT]->(t1:IngredientMaterial), (ca:LabelVersion {uid: $caLv})-[d2:DECLARES_COMPONENT]->(t2:IngredientMaterial)
MATCH (t1)-[:REALIZES_SUBSTANCE]->(f1:ChemicalSubstance)
MATCH (t2)-[:REALIZES_SUBSTANCE]->(f2:ChemicalSubstance)
MATCH (moiety:ChemicalSubstance) WHERE (f1 = moiety OR (f1)-[:HAS_ACTIVE_MOIETY]->(moiety)) AND (f2 = moiety OR (f2)-[:HAS_ACTIVE_MOIETY]->(moiety))
MATCH (c1:Assertion {predicate: 'MOIETY_EQUIVALENT_AMOUNT'})-[:HAS_SUBJECT]->(us), (c1)-[:HAS_OBJECT]->(moiety)
MATCH (c2:Assertion {predicate: 'MOIETY_EQUIVALENT_AMOUNT'})-[:HAS_SUBJECT]->(ca), (c2)-[:HAS_OBJECT]->(moiety)
WHERE c1.recordedTo IS NULL AND c2.recordedTo IS NULL
RETURN d1.amount, d1.massBasis, d2.amount, d2.massBasis, c1.valueNumber, c2.valueNumber, c1.valueNumber - c2.valueNumber AS residual,
       [d1.assertionUid, d2.assertionUid, c1.uid, c2.uid]
// the salt vs moiety basis of each line is D6 ComponentLineProperties.massBasis (D1 MassBasis: SALT_FORM vs ACTIVE_MOIETY)
```

  (A declaration already on moiety basis yields its moiety amount by identity, rule `rule:mw-ratio.v1` with ratio 1.)
- trace: TRACE over `c1.uid`, `c2.uid` (DSLD 300 mg; LNHPD 263.0 mg with source_material).
- bitemporal episode needed on: D6 label attachments.

## Q-D1-25

- kind: cypher (bitemporal history; D6 owns label versions)
- pattern:

```cypher
MATCH (p:ProductVariant {uid: $pUid})-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv:LabelVersion)-[d:DECLARES_COMPONENT]->(t:IngredientMaterial)
WHERE (t)-[:REALIZES_SUBSTANCE]->(:ChemicalSubstance {uid: $sUid})
RETURN h.validFrom, h.validTo, h.recordedFrom, h.recordedTo, d.amount, d.unitCode, d.amountReferent, t.name, h.assertionUid ORDER BY h.validFrom
```

- trace: TRACE over each `h.assertionUid` (one label snapshot per version).
- bitemporal episode needed on: D6 HAS_LABEL_VERSION (the history is the episodes).

## Q-D1-26

- kind: fulltext (+ identifier lookup)
- pattern (free-text ingredient string → candidates with identity level):

```cypher
CALL db.index.fulltext.queryNodes('d1_identity_fulltext', $q) YIELD node, score     // e.g. "LGG", "KSM-66", "P-5-P", "Niagen"
WITH node, score ORDER BY score DESC LIMIT 20
OPTIONAL MATCH (node:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(s:ChemicalSubstance)
OPTIONAL MATCH (node:IngredientMaterial)-[:DERIVED_FROM_TAXON]->(tx:Taxon)
OPTIONAL MATCH (node)-[:HAS_IDENTIFIER]->(id:Identifier)
RETURN labels(node)[0] AS identityLevel, node.uid AS uid, node.name AS name, score, s.name AS realizes, tx.scientificName AS scientificName,
       collect(DISTINCT id.scheme + ':' + id.value) AS identifiers
UNION
MATCH (node)-[:HAS_IDENTIFIER]->(id:Identifier {scheme: $scheme, value: $normalizedValue})          // exact UNII / CAS / CID hit
RETURN labels(node)[0] AS identityLevel, node.uid AS uid, node.name AS name, 1000.0 AS score, null AS realizes, null AS scientificName, [$scheme + ':' + $normalizedValue] AS identifiers
```

  Indexed text: `name` + `searchText` (preferred name, synonyms, label spellings, legacy taxon names, deposit strings). A string that resolves to nothing, or to more than one identity level, is staged as a RESOLUTION Assessment over its located span (HAS_EVIDENCE role CONTEXT, facets `surfaceForm=…`; the kernel has no Mention node since its adversarial review), never auto-linked; a PubChem name hit is rejected when the label names a salt and the hit is the moiety.
- trace: none for the lookup itself (retrieval aid); the accepted resolution is an Assessment whose evidence locators are the label span.
- bitemporal episode needed on: none.

## Q-D1-27

- kind: cypher
- pattern:

```cypher
MATCH (m:IngredientMaterial {uid: $mUid})<-[:HAS_SUBJECT]-(a:Assertion)
WHERE a.predicate IN ['PROCESS_ALLERGEN_NOTE'] AND a.recordedTo IS NULL
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(risk)                                  // D5 allergen / risk concept
OPTIONAL MATCH (sig:Assessment {assessmentKind: 'SAFETY_SIGNAL'})-[:ASSESSES]->(m) WHERE sig.recordedTo IS NULL
RETURN a.predicate, risk.name, a.proposition, sig.summary, sig.effectDirection, a.uid
```

- trace: TRACE over `a.uid` (label statement "Contains: Milk."; supplier page "milk-based extraction").
- bitemporal episode needed on: none.

## Q-D1-28

- kind: cypher (reads kernel APPLICABILITY assessments; D3/D2 seam)
- pattern (does evidence for one form or vitamer transfer to another):

```cypher
MATCH (a:ChemicalSubstance {uid: $formA}), (b:ChemicalSubstance {uid: $formB})
OPTIONAL MATCH (a)-[:HAS_ACTIVE_MOIETY]->(ma)
OPTIONAL MATCH (b)-[:HAS_ACTIVE_MOIETY]->(mb)
OPTIONAL MATCH (a)-[:COUNTS_TOWARD_NUTRIENT]->(n)<-[:COUNTS_TOWARD_NUTRIENT]-(b)
OPTIONAL MATCH (ap:Assessment {assessmentKind: 'APPLICABILITY'})-[:ASSESSES]->(a), (ap)-[:ASSESSES]->(b) WHERE ap.recordedTo IS NULL
RETURN coalesce(ma, a) = coalesce(mb, b) AS sameMoiety, n.name AS sharedNutrient,
       ap.verdict, ap.summary, ap.uid
// sameMoiety=false and only a shared nutrient (NR vs NMN vs nicotinamide; pyridoxine vs P5P) means transfer is unsupported unless an assessment says otherwise
```

- trace: the assessment's DERIVED_FROM inputs and evidence locators; the structural facts are TRACEd through the edge assertion uids.
- bitemporal episode needed on: none.

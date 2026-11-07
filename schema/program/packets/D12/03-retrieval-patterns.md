# D12 — retrieval patterns

Model stage (A2, 2026-10-08). One section per question in `02-questions.md`. Kernel names follow A1's published pattern (`packets/K/04-schema-proposal.graphql`): `(a:Assertion)-[:HAS_SUBJECT|HAS_OBJECT|ASSERTED_BY]->(…)`, `(a)-[:HAS_EVIDENCE {role}]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)`, `(adj:Adjudication)-[:ASSESSES]->(a)`, `(ass:Assessment)-[:ASSESSES]->(entity)`, `(ass)-[:DERIVED_FROM]->(a)`, `(x)-[:WAS_GENERATED_BY]->(act:Activity)`, `(entity)-[:HAS_IDENTIFIER]->(i:Identifier)` (stored Subjectable → Identifier; `Identifier.identifies` is direction IN), D9 `(ch:Chunk)-[:MENTIONS]->(entity)`. Names owned by other modules were placeholders in the model stage; the check stage (2026-10-08) resolved them against the sibling SDLs as published in worktrees A4 (D3 `HAS_COMPONENT`/`ADMINISTERS`/`RESULT_FOR_ARM`), A5 (D5 predicates, `RESOLVES_TO_CONSTRAINT`), A6 (D6 `HAS_VARIANT`/`HAS_PACKAGE`/`HAS_LABEL_VERSION`/`DECLARES_COMPONENT`/`BRANDED_AS`; D7 `OWNS_BRAND`/`HOLDS_STAKE`/`HOLDS_ROLE`/`RECEIVES_VALUE_FROM`), A7 (D8 `RegulatoryRecord`-`CONCERNS`, `QualityResult`-`QUALITY_RESULT_FOR`/`MEASURES_ANALYTE`, renamed from RESULT_FOR in D8's adversarial review) and A8 (D9 `CHUNK_OF`); they are draft names and the synthesizer re-checks them. Adversarial-review pass (same day): patterns re-based on the current D3 (`Study -HAS_ARM-> StudyArm -HAS_COMPONENT-> InterventionComponent -ADMINISTERS->`, `StudyResult.direction / statisticalConclusion`, `-RESULT_FOR-> OutcomeDefinition.priority`), D6 (`LabelVersion -DECLARES_COMPONENT->` with ComponentLineProperties `amount / unitCode / amountBasis`; allergens are LabelVersion fields), D8 (`RegulatoryRecord.recordKind`, `Lot -LOT_OF-> Product`) and D10 (`DecisionCriterion.criterionKey / version / valueUnitCode`) SDLs; qualifier filters follow the grammar in `05-relationship-register.yaml qualifierGrammar` (`key:VALUE`, no space); FOOD_CONTAINS amounts are read from the edge (`FoodContentProperties`).

## Conventions used in every pattern

**As-of on an asserted edge or Assertion** (`$asOf` = recorded-time point, default `datetime()`; `$validAt` = optional valid-time point; half-open intervals; null valid bound = unknown, never "ongoing"):

```cypher
// AS_OF(r): r is an asserted edge (AssertedEdgeProperties) or an Assertion (recordedAt instead of recordedFrom)
r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf)
AND ($validAt IS NULL OR ((r.validFrom IS NULL OR r.validFrom <= $validAt)
                      AND (r.validTo   IS NULL OR r.validTo   > $validAt)))
```

**TRACE(a)** — how every answer row cites its evidence (directive 3.8/3.10); the verifier re-selects the same locator:

```cypher
CALL (a) {
  MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  WHERE ev.role IN ['SUPPORTS', 'QUALIFIES']
  OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
  OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
    WHERE adj.recordedAt <= $asOf AND (adj.recordedTo IS NULL OR adj.recordedTo > $asOf)
  OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
  RETURN collect(DISTINCT {assertion: a.uid, asserter: who.uid, role: ev.role, selector: loc.selectorKind,
         exact: loc.exact, page: loc.page, snapshot: snap.uid, contentHash: snap.contentHash,
         retrievedAt: snap.retrievedAt, revisionKind: snap.revisionKind, source: src.uid,
         verdict: adj.verdict, missionId: act.missionId, runId: act.runId}) AS trace
}
```

**AS_OF_REC(r)** for recorded-only edges (`AssertedRecordedProperties`, `FoodContentProperties`): `r.recordedFrom <= $asOf AND (r.recordedTo IS NULL OR r.recordedTo > $asOf)`; any valid time a source states is read from the authorizing Assertion (`a.validFrom`, `a.validTo`).

An asserted D12 edge `r` is joined to its Assertion with `MATCH (a:Assertion {uid: r.assertionUid})` (range index on `Assertion.uid`). FOOD_CONTAINS amounts are typed on the edge (`r.quantity`, `r.unitCode`, `r.amountBasis`, `r.statementKind`); roles and the remaining qualifiers are read from the Assertion (`valueString`, `qualifiers`), per `05-relationship-register.yaml` `edgeCarries` / `assertionCarries`. Qualifier filters use the exact grammar `key:VALUE` (`'preparationMethod:' + $prep`, `'population:' + $pop`).

**Bitemporal episodes in D12** (summary; detail in `09-reasoning.md`): `HAS_REFERENCE_FOOD` and `IN_FOOD_CATEGORY` carry valid-time episodes; `FOOD_CONTAINS` (`FoodContentProperties`) and `PATTERN_COMPONENT` (`AssertedRecordedProperties`) are recorded-time only. `VARIANT_OF` is predicate-only since the adversarial review. Predicate-only facts carry their episode on the Assertion itself.

**Fixture dry run (adversarial review).** The filter predicates of Q-D12-01, Q-D12-02, Q-D12-03, Q-D12-20 and Q-D12-21 were evaluated over the fixtures' `assertions.yaml` with `_notes/dryrun.py` (PyYAML; no Neo4j instance, so it checks that the filters match what the fixtures write, not the Cypher engine). Row counts are recorded under each pattern ("fixture rows").

---

## Q-D12-01

- kind: cypher
- pattern: composition of one reference food at its preparation, optionally converted to a named portion at query time.

```cypher
MATCH (f:FoodItem {uid: $foodUid})-[r:FOOD_CONTAINS]->(c)
WHERE AS_OF_REC(r)
  AND ($basis IS NULL OR r.amountBasis = $basis)                       // D6 AmountBasis: PER_100G | PER_100ML | PER_SERVING
MATCH (a:Assertion {uid: r.assertionUid})
OPTIONAL MATCH (p:Assertion {predicate: 'HAS_PORTION_WEIGHT'})-[:HAS_SUBJECT]->(f)
  WHERE ('portion:' + $portionLabel) IN p.qualifiers AND p.recordedTo IS NULL   // e.g. portion:medium_serving = 117 g
CALL (a) { /* TRACE(a) */ }
RETURN labels(c)[0] AS componentType, c.uid, c.name,
       r.quantity AS amount, r.unitCode AS unit, r.amountBasis AS basis, r.statementKind,
       [q IN a.qualifiers WHERE any(k IN ['derivation:','dataPoints:','min:','max:','comparator:','range:','dataType:'] WHERE q STARTS WITH k)] AS derivationNSpread,
       CASE WHEN p IS NULL OR r.amountBasis <> 'PER_100G' THEN null ELSE r.quantity * p.valueNumber / 100.0 END AS amountPerPortion, // derived: basis-convert/v1, never stored
       f.definingSystem, f.preparationMethod, a.validFrom, a.validTo, r.recordedFrom, trace
ORDER BY componentType, c.name
```

- trace: each row cites the FOOD_CONTAINS Assertion → JSON_POINTER locator into the FDC (or TEXT_QUOTE into the Phenol-Explorer) snapshot; the per-portion value additionally cites the HAS_PORTION_WEIGHT Assertion and names `basis-convert/v1` as a computation, not a declaration.
- fixture rows (dry run): `$foodUid = hu:food:fdc-170721, $basis = PER_100G, $portionLabel = medium_serving` → 1 row (energy 323 kcal per 100 g, statementKind CALCULATED, derivation:FDC:NC, dataPoints:0; amountPerPortion 377.9 kcal from mcd-09 117 g). `hu:food:pe-olive-oil-extra-virgin, PER_100G` → 2 rows (hydroxytyrosol 0.8 mg, tyrosol 1.1 mg). Before the review the filter `'basis:' + $basis` returned 0 rows because the fixtures wrote `basis: PER_100G` with a space.
- bitemporal episode needed on: none on the edge (recorded-only; a source-stated sampling period sits on the Assertion).

## Q-D12-02

- kind: cypher
- pattern: base ↔ prepared-variant comparison (predicate-only VARIANT_OF) plus source-stated preparation effects.

```cypher
MATCH (b:FoodItem {uid: $baseUid})
// VARIANT_OF is predicate-only: subject = variant, object = base (two hops through the Assertion)
OPTIONAL MATCH (va:Assertion {predicate: 'VARIANT_OF'})-[:HAS_OBJECT]->(b)
  WHERE va.recordedTo IS NULL AND va.status <> 'REJECTED'
OPTIONAL MATCH (va)-[:HAS_SUBJECT]->(v:FoodItem)
  WHERE v.variantKind = 'PREPARATION' AND ($prep IS NULL OR v.preparationMethod = $prep)
OPTIONAL MATCH (b)-[rb:FOOD_CONTAINS]->(c {uid: $componentUid}) WHERE AS_OF_REC(rb)
OPTIONAL MATCH (v)-[rv:FOOD_CONTAINS]->(c) WHERE AS_OF_REC(rv) AND rv.amountBasis = rb.amountBasis
// source-stated effect with conditions (Phenol-Explorer: frying 10 min at 180 °C cuts hydroxytyrosol 40-50 %)
OPTIONAL MATCH (e:Assertion {predicate: 'PREPARATION_CHANGES_CONTENT'})-[:HAS_SUBJECT]->(b), (e)-[:HAS_OBJECT]->(c)
  WHERE AS_OF(e) AND ($prep IS NULL OR ('preparationMethod:' + $prep) IN e.qualifiers)
RETURN b.descriptionVerbatim AS base, v.descriptionVerbatim AS variant, v.preparationMethod, va.basisKind AS pairingBasis,
       rb.quantity AS baseAmount, rv.quantity AS variantAmount, rb.unitCode, rb.amountBasis,
       e.valueNumber AS statedChange, e.valueString AS statedChangeText, e.qualifiers AS conditions
```

- trace: TRACE on the FOOD_CONTAINS Assertions of `rb`/`rv`, on `va` (the curator's pairing, basisKind EXPERT_OPINION: shown as a pairing, never as a source statement) and on `e`; the computed difference (`variantAmount − baseAmount`, optionally moisture-normalized) is labeled `prep-diff/v1` and never stored, because per-100 g values move with water loss.
- fixture rows (dry run): `$baseUid = hu:food:fdc-170027, $componentUid = hu:constituent:potassium, $prep = BAKED` → 1 row (417 → 550 mg per 100 g via mcd-05). `$baseUid = hu:food:pe-olive-oil-virgin, hydroxytyrosol, $prep = FRIED_DEEP` → 2 effect rows (olive-03, olive-04; olive-03 also carries FRIED_PAN), no variant row (no base/variant pair in that fixture).
- bitemporal episode needed on: none on edges (FOOD_CONTAINS recorded-only; VARIANT_OF is an Assertion).

## Q-D12-03

- kind: cypher
- pattern: preparation-formed hazards (predicate-only) plus measured levels of the same compound in sold foods (D8) and the regulator's hazard statement (D5 CAUSES_ADVERSE_EFFECT).

```cypher
MATCH (h:Assertion {predicate: 'FORMS_DURING_PREPARATION'})-[:HAS_SUBJECT]->(cmp:ChemicalSubstance)
MATCH (h)-[:HAS_OBJECT]->(food)                                     // FoodItem | FoodCategory
WHERE AS_OF(h) AND ($prep IS NULL OR ('preparationMethod:' + $prep) IN h.qualifiers)
// measured levels of the compound in sold foods, whether or not the product is filed under the formation statement's group
OPTIONAL MATCH (qr:QualityResult)-[:MEASURES_ANALYTE]->(cmp)          // D8 analyte edge
OPTIONAL MATCH (qr)-[rf:QUALITY_RESULT_FOR]->(p:Product)               // D8 (AssertedRecordedProperties)
OPTIONAL MATCH (rfa:Assertion {uid: rf.assertionUid})                  // sampling window = validFrom/validTo of the QUALITY_RESULT_FOR Assertion
OPTIONAL MATCH (p)-[hr:HAS_REFERENCE_FOOD]->(fi:FoodItem) WHERE AS_OF(hr)
// hazard statements about the compound (D5 predicate; species and dose context are qualifiers)
OPTIONAL MATCH (hz:Assertion {predicate: 'CAUSES_ADVERSE_EFFECT'})-[:HAS_SUBJECT]->(cmp) WHERE AS_OF(hz)
OPTIONAL MATCH (hz)-[:HAS_OBJECT]->(effect)
CALL (h) { /* TRACE(h) */ }
RETURN cmp.name, labels(food)[0] AS formedIn, food.name,
       [q IN h.qualifiers WHERE q STARTS WITH 'preparationMethod:'] AS preparation,
       p.name AS product, fi.descriptionVerbatim AS referenceFood, qr.value, qr.unitCode, qr.reportingLimit,
       rfa.validFrom AS sampledFrom, rfa.validFromBasis, rfa.validTo AS sampledTo,
       collect(DISTINCT {effect: effect.name, qualifiers: hz.qualifiers, assertion: hz.uid}) AS hazard, trace
```

- trace: formation statement → FDA/IARC locator; each level → D8 result → its table-row locator (row selector carries the group label, e.g. "French Fries and Other Potato Foods, Restaurant and Take-Out"); the hazard statement → its sentence ("high levels of acrylamide caused cancer in laboratory animals", qualified by the FDA's own dose caveat); the FDA consumer-choice caveat travels as a QUALIFIES locator.
- fixture rows (dry run): `$prep = FRIED_DEEP` → 1 row: acrylamide formed in "plant-based foods – including potato and cereal-grain-based foods" (acr-01); McDonald's French Fries 428 µg/kg, LOQ 20, sampled 2003-10-01 (INFERRED) to 2004-10-07 (acr-03); reference food FDC 170721 (reused mcd-01); hazard acr-05 (species:LABORATORY_ANIMALS, doseContext:ABOVE_DIETARY_EXPOSURE). Before the review the filter matched no fixture qualifier (`preparationMethod: FRIED_DEEP | FRIED_PAN (source: 'frying')`) and the category expansion could not reach the product.
- bitemporal episode needed on: HAS_REFERENCE_FOOD (product reformulated since 2004); the D8 result's sampling window is valid time on its Assertion.

## Q-D12-04

- kind: cypher
- pattern: the chain's current declaration (D6) beside the reference-food record (D12), as of a date, never reconciled.

```cypher
MATCH (p:Product {uid: $productUid})
// D6 declaration: label/menu declaration version in force at $validAt (D6 path, StateEpisodeProperties episode)
OPTIONAL MATCH (p)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lve:HAS_LABEL_VERSION]->(lv:LabelVersion) WHERE AS_OF(lve)
OPTIONAL MATCH (p)-[hr:HAS_REFERENCE_FOOD]->(f:FoodItem) WHERE AS_OF(hr)
OPTIONAL MATCH (f)-[r:FOOD_CONTAINS]->(c) WHERE AS_OF_REC(r)
OPTIONAL MATCH (pw:Assertion {predicate: 'HAS_PORTION_WEIGHT'})-[:HAS_SUBJECT]->(f)
RETURN p.name, lv.asOfStatementVerbatim, lv.uid AS declaration,
       f.descriptionVerbatim, f.isHistoricalReference, f.sourcePublishedAt,
       collect({component: c.name, amount: r.quantity, unit: r.unitCode, basis: r.amountBasis, statementKind: r.statementKind}) AS reference,
       collect(DISTINCT {portion: [q IN pw.qualifiers WHERE q STARTS WITH 'portion:'], grams: pw.valueNumber}) AS portions
```

- trace: D6 declaration rows cite the menu page locators ("This information is correct as of January 2022…"); reference rows cite FDC JSON pointers; the HAS_REFERENCE_FOOD Assertion cites its match basis. Differences (320 Cal declared vs 323 kcal/100 g × 117 g ≈ 378 kcal) are computed in the answer and labeled.
- bitemporal episode needed on: HAS_REFERENCE_FOOD; D6's declaration attachment (D6 StateEpisodeProperties).

## Q-D12-05

- kind: cypher (+ fulltext candidate step, see Q-D12-34)
- pattern: Product → reference food(s) with match basis, both directions.

```cypher
MATCH (p:Product {uid: $productUid})-[hr:HAS_REFERENCE_FOOD]->(f:FoodItem)
WHERE AS_OF(hr)
MATCH (a:Assertion {uid: hr.assertionUid})
OPTIONAL MATCH (f)-[:HAS_IDENTIFIER]->(i:Identifier)                 // kernel: stored Subjectable -> Identifier
CALL (a) { /* TRACE(a) */ }
RETURN f.uid, f.descriptionVerbatim, f.definingSystem, a.valueString AS matchBasis, a.basisKind,
       collect(DISTINCT i.scheme + ':' + i.value) AS identifiers, trace
// reverse: MATCH (f:FoodItem {uid:$foodUid})<-[hr:HAS_REFERENCE_FOOD]-(p:Product) WHERE AS_OF(hr) RETURN p
```

- trace: the HAS_REFERENCE_FOOD Assertion (asserter = curation agent or the reference DB; basis SAME_ITEM_IN_REFERENCE_DB / INGREDIENT_STATEMENT / CURATED_GENERIC) → locators on both the product page and the FDC record.
- bitemporal episode needed on: HAS_REFERENCE_FOOD.

## Q-D12-06

- kind: cypher (D8-led; D12 supplies the food side)
- pattern: products (and the reference foods they realize) with reported contaminant results versus a reference level.

```cypher
MATCH (qr:QualityResult)-[:QUALITY_RESULT_FOR]->(p:Product)                                // D8 (renamed from RESULT_FOR)
MATCH (qr)-[:MEASURES_ANALYTE]->(an) WHERE an.uid IN $contaminantUids OR qr.analyteVerbatim IN $contaminants
OPTIONAL MATCH (org:Organization)-[:OWNS_BRAND]->(:Brand)<-[:BRANDED_AS]-(p)                     // D7 OWNS_BRAND, D6 BRANDED_AS
OPTIONAL MATCH (p)-[hr:HAS_REFERENCE_FOOD]->(f:FoodItem) WHERE AS_OF(hr)
OPTIONAL MATCH (lvl:Assertion {predicate: 'HAS_ACTION_LEVEL'})-[:HAS_SUBJECT]->(an)   // D8 predicate (R-93; listed in 05 predicateOnly as consumed)
RETURN p.name, org.name, f.descriptionVerbatim, qr.value, qr.unitCode, qr.sampleKind, lvl.valueNumber, lvl.unitCode, lvl.qualifiers AS authorityAndStatus
```

- trace: QualityResult and reference-level Assertions each cite their FDA/openFDA locators (WanaBana: "2.18 ppm"; Codex/FDA 2.5 ppm proposed level).
- bitemporal episode needed on: none in D12 beyond HAS_REFERENCE_FOOD; D8 results carry sampling time.

## Q-D12-07

- kind: cypher (D6/D7/D8-led)
- pattern: Product → declared food ingredient (D6 → D12 FoodItem seam) → supplier organizations by role → enforcement actions.

```cypher
MATCH (p:Product {uid: $productUid})-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lve:HAS_LABEL_VERSION]->(lv:LabelVersion)-[:DECLARES_COMPONENT]->(ing)   // ing: FoodItem (cinnamon) or D1 material
OPTIONAL MATCH (supRole:Assertion)-[:HAS_OBJECT]->(ing) WHERE supRole.predicate IN ['SUPPLIES_MATERIAL','MANUFACTURES']   // D7 role predicates (D7 05 predicateOnly)
OPTIONAL MATCH (supRole)-[:HAS_SUBJECT]->(org)
OPTIONAL MATCH (ea:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})-[:CONCERNS]->(p)            // D8 recall / warning letter / import alert
RETURN p.name, ing.name, collect(DISTINCT {org: org.name, role: supRole.predicate}) AS chain, collect(DISTINCT ea.uid) AS actions
```

- trace: each role Assertion and each action cites the FDA investigation page or openFDA record (firm-name variants "WanaBana LLC" vs "WANABANA USA LLC" resolved by an EQUIVALENCE Assessment).
- bitemporal episode needed on: none in D12.

## Q-D12-08

- kind: cypher (QP-TARGET-01 of D5 0.2.1, harm direction) + assessment branch
- pattern: what to avoid or limit for target T among foods, categories, patterns and sold foods, by evidence, for whom.

```cypher
MATCH (t:Target) WHERE t.key = $targetKey OR t.parentKey = $targetKey
MATCH (a:Assertion)-[:HAS_OBJECT]->(t)
WHERE a.predicate = 'WORSENS_TARGET' AND a.status IN ['ACCEPTED','DISPUTED'] AND AS_OF(a)
  AND ($pop IS NULL OR ('population:' + $pop) IN a.qualifiers OR 'population:UNSPECIFIED' IN a.qualifiers)
MATCH (a)-[:HAS_SUBJECT]->(means)
WHERE means:FoodItem OR means:FoodCategory OR means:DietaryPattern OR means:Product   // FoodCategory as subject: OQ-D12-28 (D5)
// expand a category to its member foods/products so "is my food in a group with harm evidence" works
OPTIONAL MATCH (means)<-[mc:IN_FOOD_CATEGORY]-(member) WHERE means:FoodCategory AND AS_OF(mc)
// patterns that tell you to limit or exclude the means: edge and its Assertion bound together, current only
OPTIONAL MATCH (dp:DietaryPattern)-[pc:PATTERN_COMPONENT]->(means), (pa:Assertion {uid: pc.assertionUid})
  WHERE pa.valueString IN ['LIMITS','EXCLUDES'] AND AS_OF_REC(pc)
// weighed conclusions (kernel Assessment, harm = effectDirection HARM)
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(means)
  WHERE ass.effectDirection = 'HARM' AND ass.recordedAt <= $asOf AND (ass.recordedTo IS NULL OR ass.recordedTo > $asOf)
CALL (a) { /* TRACE(a) */ }
RETURN labels(means)[0] AS kind, means.name, [q IN a.qualifiers WHERE q STARTS WITH 'population:' | substring(q, 11)] AS forWhom,
       collect(DISTINCT member.name)[..20] AS members,
       [x IN collect(DISTINCT CASE WHEN dp IS NULL THEN null ELSE {pattern: dp.name, role: pa.valueString} END) WHERE x IS NOT NULL] AS patternsThatLimit,
       collect(DISTINCT {assessment: ass.uid, method: ass.methodVersion, subkind: ass.assessmentSubkind, conclusion: ass.conclusionCode}) AS assessments, trace
```

- trace: each WORSENS_TARGET Assertion → its locator (Lane 2024 umbrella review table row; IARC Q&A sentence; Hall 2019 result) → snapshot; assessments list their DERIVED_FROM inputs. No "bad food" flag exists to shortcut this. A pattern appears in `patternsThatLimit` only when its PATTERN_COMPONENT Assertion says LIMITS or EXCLUDES (the review found the earlier two-step OPTIONAL MATCH returned INCLUDES/EMPHASIZES patterns with a null role).
- bitemporal episode needed on: IN_FOOD_CATEGORY (membership as of $asOf); the target-effect Assertions carry their own episode.

## Q-D12-09

- kind: cypher + assessment
- pattern: alleged longevity foods = subjects of IMPROVES_TARGET / INTENDED_FOR_TARGET on target:longevity (or claims mapped to it), with the human evidence and any retraction (per authority) or contradiction.

```cypher
MATCH (t:Target {key: 'target:longevity'})<-[:HAS_OBJECT]-(a:Assertion)-[:HAS_SUBJECT]->(food)
WHERE (food:FoodItem OR food:DietaryPattern OR food:FoodCategory)
  AND a.predicate IN ['IMPROVES_TARGET','INTENDED_FOR_TARGET'] AND AS_OF(a)
OPTIONAL MATCH (a)-[:OCCURRENCE_OF]->(cl:Claim)
// human evidence: D3 arms that administered the food/pattern (seam ADMINISTERS) and their results
OPTIONAL MATCH (arm:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)-[:ADMINISTERS]->(food)
OPTIONAL MATCH (arm)<-[:RESULT_FOR_ARM]-(res:StudyResult)
// disconfirmation: revision status per authority (kernel HAS_REVISION_STATUS) on the sources the claim cites,
// with the SourceSnapshot.revisionKind cache as a fallback; contradicting evidence on assessments
OPTIONAL MATCH (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (rs:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:HAS_SUBJECT]->(src) WHERE AS_OF(rs)
OPTIONAL MATCH (rs)-[:ASSERTED_BY]->(authority)
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(cl) WHERE ass.recordedTo IS NULL
OPTIONAL MATCH (ass)-[ce:HAS_EVIDENCE {role: 'CONTRADICTS'}]->(cloc:SourceLocator)
RETURN food.name, a.predicate, cl.proposition, cl.latestVerdict,
       collect(DISTINCT {arm: arm.uid, result: res.uid, direction: res.direction, conclusion: res.statisticalConclusion}) AS humanEvidence,
       collect(DISTINCT {source: src.uid, status: rs.valueString, by: authority.name, since: rs.validFrom, cache: snap.revisionKind}) AS revisions,
       collect(DISTINCT {assessment: ass.uid, verdict: ass.verdict, conclusion: ass.conclusionCode, method: ass.methodVersion, contradicting: cloc.exact}) AS weighed
```

- trace: claim occurrences and results cite their locators; each revision status is its own Assertion with its own asserter and locator (PubMed `Retracted Publication` on PMID 23432189; the NEJM notice PMID 29897867 "Retraction and Republication", electronic date 2018-06-13); verdicts come from Assessments with their inputs.
- bitemporal episode needed on: none on D12 edges (the Assertions and Assessments are the bitemporal records).

## Q-D12-10

- kind: cypher
- pattern: one food claim's occurrences, publication status per authority and vetting verdicts, as of a date.

```cypher
MATCH (cl:Claim {uid: $claimUid})<-[:OCCURRENCE_OF]-(occ:Assertion)
WHERE occ.recordedAt <= $asOf
MATCH (occ)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
// kernel convention: one HAS_REVISION_STATUS Assertion per authority, valid from the date that authority states
OPTIONAL MATCH (rs:Assertion {predicate: 'HAS_REVISION_STATUS'})-[:HAS_SUBJECT]->(src)
  WHERE rs.recordedAt <= $asOf AND ($validAt IS NULL OR rs.validFrom IS NULL OR rs.validFrom <= $validAt)
OPTIONAL MATCH (rs)-[:ASSERTED_BY]->(authority)
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(cl)
  WHERE ass.recordedAt <= $asOf AND (ass.recordedTo IS NULL OR ass.recordedTo > $asOf)
RETURN occ.uid, occ.validFrom, loc.exact, src.uid, snap.revisionKind AS cachedStatus,
       collect(DISTINCT {status: rs.valueString, by: authority.name, since: rs.validFrom, basis: rs.validFromBasis}) AS statusByAuthority,
       collect(DISTINCT {kind: ass.assessmentKind, disposition: ass.disposition, verdict: ass.verdict}) AS vetting
ORDER BY occ.validFrom
```

- trace: each occurrence's exact quote ("reduced the incidence …" 2013 vs "was lower among those assigned …" 2018) on its snapshot; each status from its own Assertion (PubMed `PublicationType` / `RetractionIn` locators; the NEJM notice's electronic `ArticleDate` 2018-06-13 locator).
- fixture rows: `$validAt = 2018-06-15` → the 2013 report is RETRACTION (NEJM notice, 2018-06-13, STATED_BY_SOURCE; PubMed RETRACTION, validFrom 2018-06-13 PUBLICATION_PROXY) and the 2018 report CORRECTED_AND_REPUBLISHED; `$validAt = 2018-06-12` → no status on either. There is no longer a window in which the 2013 report is republished but not retracted (review finding: 2018-06-21 is the print issue date).
- bitemporal episode needed on: none (Assertion/Assessment recorded time is the as-of axis; status validity on the status Assertions).

## Q-D12-11

- kind: cypher
- pattern: a dietary pattern's definition by component and role, with the defining source.

```cypher
MATCH (dp:DietaryPattern {uid: $patternUid})-[pc:PATTERN_COMPONENT]->(x)
WHERE pc.recordedFrom <= $asOf AND (pc.recordedTo IS NULL OR pc.recordedTo > $asOf)
MATCH (a:Assertion {uid: pc.assertionUid})
WHERE $role IS NULL OR a.valueString = $role
OPTIONAL MATCH (claim:Assertion)-[:HAS_SUBJECT]->(dp)
  WHERE claim.predicate IN ['IMPROVES_TARGET','WORSENS_TARGET','NO_EFFECT_ON_TARGET','INTENDED_FOR_TARGET'] AND AS_OF(claim)
OPTIONAL MATCH (claim)-[:HAS_OBJECT]->(t:Target)
CALL (a) { /* TRACE(a) */ }
RETURN dp.name, dp.definedBy, dp.version, labels(x)[0] AS componentType, x.name, a.valueString AS role,
       a.valueNumber AS quantity, a.unitCode, collect(DISTINCT {target: t.key, direction: claim.predicate}) AS claims, trace
// reverse ("which patterns include or exclude food F"): MATCH (dp:DietaryPattern)-[pc:PATTERN_COMPONENT]->(:FoodItem {uid:$foodUid}) …
```

- trace: each component row cites the defining sentence (DGA PDF page; PREDIMED protocol text).
- bitemporal episode needed on: none (recorded-only; the version is the node identity).

## Q-D12-12

- kind: cypher (D3-led over the ADMINISTERS seam)
- pattern: trials whose arms administered pattern D or food F, with comparator and primary result, nulls included.

```cypher
MATCH (s:Study)-[:HAS_ARM]->(arm:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)-[:ADMINISTERS]->(x)
WHERE x.uid = $meansUid OR (x:DietaryPattern AND x.name =~ $namePattern)
OPTIONAL MATCH (s)-[:HAS_ARM]->(cmp:StudyArm) WHERE cmp <> arm
OPTIONAL MATCH (res:StudyResult)-[:RESULT_FOR_ARM]->(arm)
OPTIONAL MATCH (res)-[:RESULT_FOR]->(od:OutcomeDefinition)                  // D3: priority lives on the outcome definition
RETURN s.uid, s.name, arm.uid, x.name, collect(DISTINCT cmp.uid) AS comparators,
       collect(DISTINCT {result: res.uid, outcome: od.outcomeKey, priority: od.priority,
                         direction: res.direction, conclusion: res.statisticalConclusion}) AS results
```

- trace: arm and result records cite registry/paper locators (D3); the D12 contribution is the pattern node and its definition (Q-D12-11).
- bitemporal episode needed on: none in D12.

## Q-D12-13

- kind: cypher + assessment
- pattern: NO_EFFECT / opposite-direction findings on foods and patterns, and the popular claims they disconfirm.

```cypher
MATCH (n:Assertion)-[:HAS_SUBJECT]->(m)
WHERE (m:DietaryPattern OR m:FoodItem OR m:FoodCategory)
  AND n.predicate IN ['NO_EFFECT_ON_TARGET','WORSENS_TARGET','MIXED_EFFECT_ON_TARGET'] AND AS_OF(n)
MATCH (n)-[:HAS_OBJECT]->(t:Target)
// popular claims of benefit on the same means and target
OPTIONAL MATCH (p:Assertion {predicate: 'IMPROVES_TARGET'})-[:HAS_SUBJECT]->(m), (p)-[:HAS_OBJECT]->(t)
  WHERE p.assertionKind = 'CLAIM' AND AS_OF(p)
OPTIONAL MATCH (p)-[:OCCURRENCE_OF]->(cl:Claim)
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(cl) WHERE ass.recordedTo IS NULL
CALL (n) { /* TRACE(n) */ }
RETURN m.name, t.key, n.predicate, collect(DISTINCT cl.proposition) AS disconfirmedClaims,
       collect(DISTINCT ass.verdict) AS verdicts, trace
```

- trace: the null finding's locator (TREAT: TRE no better than control; Wastyk: primary immune score unchanged) → snapshot; the claim side cites its occurrences.
- bitemporal episode needed on: none on D12 edges.

## Q-D12-14

- kind: cypher (answer kind materialized: the computed membership is a stored CALCULATED Assertion under a rule version)
- pattern: NOVA (or any system) membership of a food or product, stated or computed, with method and inputs.

```cypher
MATCH (x {uid: $uid})-[r:IN_FOOD_CATEGORY]->(cat:FoodCategory {system: 'NOVA'})
WHERE AS_OF(r)
MATCH (a:Assertion {uid: r.assertionUid})
OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (a)-[:DERIVED_FROM]->(input:Assertion)                 // ingredient-statement Assertions (markers)
OPTIONAL MATCH (input)-[:HAS_EVIDENCE]->(iloc:SourceLocator)<-[:HAS_LOCATOR]-(isnap:SourceSnapshot)
RETURN cat.code AS novaGroup, cat.systemVersion,
       CASE a.basisKind WHEN 'CALCULATED' THEN 'computed' ELSE 'source-stated' END AS how,
       a.derivationRule AS method, who.uid AS asserter,
       collect(DISTINCT {marker: iloc.exact, snapshot: isnap.contentHash}) AS inputs
```

- trace: source-stated rows cite the source's own field (OFF `nova_group`, a paper's methods sentence); computed rows cite the marker spans of the ingredient statement they were DERIVED_FROM and name `nova-markers/v<n>`; a new rule version supersedes (recordedTo) rather than overwrites.
- bitemporal episode needed on: IN_FOOD_CATEGORY (reformulation and rule-version supersession).

## Q-D12-15

- kind: cypher
- pattern: a classifier's hazard group for a food category, quantified risk and caveats, with member foods.

```cypher
MATCH (h:Assertion {predicate: 'HAS_HAZARD_CLASSIFICATION'})-[:HAS_SUBJECT]->(cat:FoodCategory)
WHERE AS_OF(h) AND ($classifier IS NULL OR cat.system = $classifier)
MATCH (h)-[:ASSERTED_BY]->(classifier)
OPTIONAL MATCH (q:Assertion)-[:HAS_SUBJECT]->(cat) WHERE q.predicate = 'WORSENS_TARGET' AND AS_OF(q)
OPTIONAL MATCH (cat)<-[m:IN_FOOD_CATEGORY]-(f:FoodItem) WHERE AS_OF(m)
CALL (h) { /* TRACE(h) */ }
RETURN cat.label, classifier.name, h.valueString AS hazardGroup, h.qualifiers,
       collect(DISTINCT {risk: q.valueNumber, unit: q.unitCode, qualifiers: q.qualifiers}) AS quantified,
       collect(DISTINCT f.name)[..25] AS memberFoods, trace
```

- trace: IARC Q&A sentence locators (PDF page): "every 50 gram portion … increases the risk … by about 18%"; the cooking caveat is a QUALIFIES locator.
- bitemporal episode needed on: IN_FOOD_CATEGORY.

## Q-D12-16

- kind: cypher (D5-led)
- pattern: interaction knowledge where one side is a D12 food.

```cypher
// D5 declares no typed edge into FoodItem for interactions: INTERACTS_WITH (FoodItem as OBJECT) and USE_CONSTRAINED_IN
// (FoodItem as SUBJECT, object D2 Condition) are D5 Assertion predicates; UseConstraint is D5's derived roll-up of
// those Assertions (RESOLVES_TO_CONSTRAINT). The USE_CONSTRAINED_IN branch: MATCH (f)<-[:HAS_SUBJECT]-(uc:Assertion
// {predicate: 'USE_CONSTRAINED_IN'})-[:HAS_OBJECT]->(cond:Condition).
MATCH (f:FoodItem {uid: $foodUid})<-[:HAS_OBJECT]-(ia:Assertion {predicate: 'INTERACTS_WITH'})-[:HAS_SUBJECT]->(drug)
WHERE AS_OF(ia)
OPTIONAL MATCH (ia)-[:RESOLVES_TO_CONSTRAINT]->(u:UseConstraint)
CALL (ia) { /* TRACE(ia) */ }
RETURN f.name, drug.name, ia.predicate, ia.qualifiers,
       [q IN ia.qualifiers WHERE q STARTS WITH 'exposureChange:'] AS exposureChange,   // D5: a qualifier on INTERACTS_WITH, not a UseConstraint field
       u.constraintKind, u.summary, trace
```

- trace: FDA consumer update / label locators via the D5 records.
- bitemporal episode needed on: none in D12.

## Q-D12-17

- kind: cypher (D6-led)
- pattern: allergen declarations of a sold food, by jurisdiction, as of a date.

```cypher
MATCH (p:Product {uid: $productUid})-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lve:HAS_LABEL_VERSION]->(lv:LabelVersion)
WHERE AS_OF(lve)                                                             // D6 StateEpisodeProperties
MATCH (la:Assertion {uid: lve.assertionUid})
CALL (la) { /* TRACE(la) */ }
RETURN lv.jurisdiction, lv.containsAllergens, lv.mayContainAllergens, lv.allergenStatementVerbatim,
       lv.asOfStatementVerbatim, lve.validFrom, trace
```

- trace: "Contains: Wheat, Milk." locator on the McDonald's snapshot; Wendy's UK page for the other jurisdiction. Allergens are D6 LabelVersion fields, not predicates (the model-stage DECLARES_ALLERGEN / MAY_CONTAIN predicates do not exist in D6).
- bitemporal episode needed on: none in D12 (D6 HAS_LABEL_VERSION episodes carry valid time).

## Q-D12-18

- kind: assessment (stored kernel Assessment, subkind `D12.claim-threshold-comparison`, conclusionCode MET | NOT_MET | NOT_COMPARABLE)
- pattern: compare a product's declared composition to the regulatory condition of the health claim it implies.

```cypher
MATCH (p:Product {uid: $productUid})-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lve:HAS_LABEL_VERSION]->(lv:LabelVersion)
WHERE AS_OF(lve)
MATCH (lv)-[dc:DECLARES_COMPONENT]->(c)                                       // D6 ComponentLineProperties: amount, unitCode, amountBasis, statementVerbatim
WHERE c.uid IN $measurandUids
MATCH (cond:Assertion {predicate: 'HAS_CLAIM_CONDITION'})-[:HAS_OBJECT]->(c2)  // D8 predicate (R-93; listed in 05 predicateOnly as consumed)
OPTIONAL MATCH (ass:Assessment {assessmentSubkind: 'D12.claim-threshold-comparison'})-[:ASSESSES]->(p)
  WHERE ass.recordedTo IS NULL
OPTIONAL MATCH (ass)-[:DERIVED_FROM]->(input:Assertion)
RETURN c.name AS declaredMeasurand, dc.amount, dc.unitCode, dc.amountBasis, dc.statementVerbatim,
       c2.name AS regulatedMeasurand, cond.valueNumber, cond.unitCode, cond.qualifiers,
       ass.conclusionCode, ass.rationale, collect(input.uid) AS inputs
```

- trace: the Assessment's DERIVED_FROM inputs (the product's declaration line, e.g. "400 mg/kg polyphenols"; the EU condition "at least 5 mg of hydroxytyrosol … per 20 g") and HAS_EVIDENCE locators; outcome in `conclusionCode` from the vocabulary registered in `09-reasoning.md` (kernel M9; OQ-D12-07 closed). A marketing statement not on a label/menu declaration is a claim occurrence (assertionKind CLAIM) and enters as a DERIVED_FROM input instead of `dc`.
- bitemporal episode needed on: none (Assessment is supersedable).

## Q-D12-19

- kind: cypher, computed at query time (directive 3.5); published form = kernel Report COMPARISON whose rows are D10 ReportItems (ASSESSES → FoodItem / Product)
- pattern: rank sold longevity foods (declared lines) or reference foods (FOOD_CONTAINS) by content of compound C per serving under a D10 DecisionCriterion version.

```cypher
MATCH (dc:DecisionCriterion {criterionKey: $criterionKey, version: $criterionVersion})   // D10 identity (criterionKey, version)
CALL () {
  // sold foods: D6 declaration lines
  MATCH (x:Product)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lve:HAS_LABEL_VERSION]->(lv:LabelVersion)-[l:DECLARES_COMPONENT]->(c {uid: $componentUid})
  WHERE lve.recordedTo IS NULL AND l.amountBasis = 'PER_SERVING'
  RETURN x, l.amount AS perServing, l.unitCode AS unit, 'declared' AS basisOfRow, l.assertionUid AS cites
  UNION
  // reference foods: FOOD_CONTAINS per 100 g x portion weight
  MATCH (x:FoodItem)-[r:FOOD_CONTAINS]->(c {uid: $componentUid})
  WHERE r.recordedTo IS NULL AND r.amountBasis = 'PER_100G' AND r.quantity IS NOT NULL
  OPTIONAL MATCH (pw:Assertion {predicate: 'HAS_PORTION_WEIGHT'})-[:HAS_SUBJECT]->(x) WHERE pw.recordedTo IS NULL
  RETURN x, r.quantity * coalesce(pw.valueNumber, 100) / 100.0 AS perServing, r.unitCode AS unit, 'reference' AS basisOfRow, r.assertionUid AS cites
}
WITH dc, x, perServing, unit, basisOfRow, cites WHERE dc.valueUnitCode IS NULL OR unit = dc.valueUnitCode
RETURN x.name, labels(x)[0], perServing, unit, basisOfRow, cites, dc.criterionKey, dc.version
ORDER BY perServing DESC
```

- trace: every ranked row cites the composition Assertion it ranks on; a published ranking becomes a Report (reportKind COMPARISON, policyVersion) whose D10 ReportItems ASSESS each ranked FoodItem/Product. D6 `ComponentLineProperties` is structural (`orderIndex`, no `assertionUid` documented); `cites` falls back to the LabelVersion's HAS_LABEL_VERSION Assertion when the line has none (OQ-D12-32).
- bitemporal episode needed on: none on D12 edges (FOOD_CONTAINS recorded-only).

## Q-D12-20

- kind: gds
- pattern: substitution similarity — node similarity (Jaccard on shared components) or KNN on a normalized composition vector.
  - projection (Cypher projection, rebuilt **weekly** and after each FDC/Phenol-Explorer import Activity; named `food-composition-<release>`):

```cypher
MATCH (f:FoodItem)-[r:FOOD_CONTAINS]->(c)
WHERE r.recordedTo IS NULL AND r.amountBasis = 'PER_100G' AND r.quantity IS NOT NULL
  AND f.definingSystem IN ['FDC_FOUNDATION','FDC_SR_LEGACY','PHENOL_EXPLORER']
WITH c, r.unitCode AS unit, collect({f: f, v: r.quantity}) AS rows, max(r.quantity) AS mx   // per component and unit max normalization
UNWIND rows AS row
WITH row.f AS f, c, CASE WHEN mx > 0 THEN row.v / mx ELSE 0.0 END AS w
RETURN gds.graph.project('food-composition', f, c, {relationshipProperties: {weight: w}})
```

  - algorithm: `gds.nodeSimilarity.stream('food-composition', {similarityMetric: 'JACCARD' | 'OVERLAP', topK: 10, relationshipWeightProperty: 'weight'})` (weighted Jaccard); alternative `gds.fastRP.mutate` → `gds.knn.stream` for large catalogs.
  - use: stream only, returned at query time with `derivationRule = 'food-similarity/v1'` and the projection name; **not written** — neither as a derived FOOD_SIMILAR_TO edge nor as a D10 Association (OQ-D12-29). Promote to a derived edge with DerivedEdgeProperties only if latency requires.
- trace: each similar pair lists the shared components and the FOOD_CONTAINS Assertion uids (`r.assertionUid`) behind them.
- fixture rows (dry run): the projection filter keeps 5 of the 5 fixture FOOD_CONTAINS lines (3 FDC SR Legacy, 2 Phenol-Explorer); before the review `'basis:PER_100G' IN a.qualifiers` kept 0.
- bitemporal episode needed on: none (the projection takes current lines only).

## Q-D12-21

- kind: cypher
- pattern: foods delivering at least amount A of component C per 100 g or per serving.

```cypher
MATCH (c {uid: $componentUid})<-[r:FOOD_CONTAINS]-(f:FoodItem)
WHERE AS_OF_REC(r) AND r.amountBasis = 'PER_100G' AND r.quantity IS NOT NULL AND r.unitCode = $unitCode
OPTIONAL MATCH (pw:Assertion {predicate: 'HAS_PORTION_WEIGHT'})-[:HAS_SUBJECT]->(f) WHERE pw.recordedTo IS NULL
WITH f, r, pw, CASE WHEN $perServing THEN r.quantity * pw.valueNumber / 100.0 ELSE r.quantity END AS amount
WHERE amount >= $minAmount
OPTIONAL MATCH (p:Product)-[hr:HAS_REFERENCE_FOOD]->(f) WHERE AS_OF(hr)
RETURN f.descriptionVerbatim, f.preparationMethod, amount, r.unitCode, r.statementKind, pw.qualifiers AS portion,
       collect(DISTINCT p.name) AS productsReferencingThisFood, r.assertionUid AS cites
ORDER BY amount DESC LIMIT 50
```

- GraphQL equivalent (now possible, review finding): `foodItems(where: { componentsConnection: { some: { edge: { amountBasis: { eq: PER_100G }, quantity: { gte: $minAmount }, unitCode: { eq: $unitCode } }, node: { uid: { eq: $componentUid } } } } })`.
- trace: each row cites its FOOD_CONTAINS Assertion (and the portion Assertion when per serving); products are listed as "reference-based", never as measured.
- fixture rows (dry run): `$componentUid = hu:constituent:potassium, $unitCode = mg, $minAmount = 500` → 1 row (FDC 170030 baked, 550 mg); `hu:substance:hydroxytyrosol, mg, 0.5` → 1 row (EVOO 0.8 mg). Before the review the qualifier filter returned 0 rows.
- bitemporal episode needed on: HAS_REFERENCE_FOOD.

## Q-D12-22

- kind: cypher (D9/D7-led)
- pattern: recommendations of a food or food product for target T and the recommender's financial interest.

```cypher
MATCH (occ:Assertion {assertionKind: 'CLAIM', speechAct: 'RECOMMENDS'})-[:HAS_SUBJECT]->(m)
WHERE (m:FoodItem OR m:Product OR m:DietaryPattern) AND ($meansUid IS NULL OR m.uid = $meansUid)
OPTIONAL MATCH (occ)-[:HAS_OBJECT]->(t:Target)
MATCH (occ)-[:ASSERTED_BY]->(person)
OPTIONAL MATCH (person)-[:HOLDS_STAKE|HOLDS_ROLE|RECEIVES_VALUE_FROM]->(org:Organization)-[:OWNS_BRAND]->(:Brand)<-[:BRANDED_AS]-(m)   // D7 interest edges, D6 BRANDED_AS
CALL (occ) { /* TRACE(occ) */ }
RETURN m.name, t.key, person.name, collect(DISTINCT org.name) AS interestedIn, trace
```

- trace: the recommendation's span ("Take 1-3 tablespoons daily…") on the Blueprint snapshot; the interest edge cites its own disclosure.
- bitemporal episode needed on: none in D12.

## Q-D12-23

- kind: cypher + assessment
- pattern: alleged benefits of foods/patterns for T with best and worst evidence.

```cypher
MATCH (t:Target {key: $targetKey})<-[:HAS_OBJECT]-(a:Assertion {predicate: 'IMPROVES_TARGET'})-[:HAS_SUBJECT]->(m)
WHERE (m:FoodItem OR m:DietaryPattern OR m:FoodCategory) AND AS_OF(a)
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(m)
  WHERE ass.assessmentKind = 'EVIDENCE_SYNTHESIS' AND ass.recordedTo IS NULL
OPTIONAL MATCH (ass)-[:DERIVED_FROM]->(input:Assertion)
// food reached through patterns that include or emphasize it: edge and Assertion bound together, current only
OPTIONAL MATCH (dp:DietaryPattern)-[pc:PATTERN_COMPONENT]->(m), (pa:Assertion {uid: pc.assertionUid})
  WHERE pa.valueString IN ['INCLUDES','EMPHASIZES'] AND AS_OF_REC(pc)
RETURN m.name, count(DISTINCT a) AS claims,
       collect(DISTINCT {assessment: ass.uid, direction: ass.effectDirection, verdict: ass.verdict, conclusion: ass.conclusionCode}) AS weighed,
       collect(DISTINCT input.uid) AS inputs, [x IN collect(DISTINCT dp.name) WHERE x IS NOT NULL] AS viaPatterns
```

- trace: best/worst evidence = the assessment's inputs ordered by D3 design and status; each cites its locator.
- bitemporal episode needed on: none on D12 edges.

## Q-D12-24

- kind: cypher
- pattern: trust attributes of one composition value.

```cypher
MATCH (f:FoodItem {uid: $foodUid})-[r:FOOD_CONTAINS]->(c {uid: $componentUid})
WHERE AS_OF_REC(r)
MATCH (a:Assertion {uid: r.assertionUid})
OPTIONAL MATCH (w:Assertion {predicate: 'HAS_DATA_QUALITY_WARNING'})-[:HAS_SUBJECT]->(f)   // OFF/FDC warnings, predicate-only (05)
CALL (a) { /* TRACE(a) */ }
RETURN f.definingSystem, f.isHistoricalReference, f.sourcePublishedAt, r.statementKind, a.basisKind,
       [q IN a.qualifiers WHERE any(k IN ['derivation:','dataPoints:','min:','max:','dataType:'] WHERE q STARTS WITH k)] AS derivationNMinMax,
       a.extractionConfidence, collect(w.valueString) AS warnings, trace
```

- trace: JSON pointer locators to `foodNutrientDerivation.code`, `dataPoints`, `min`, `max` in the FDC snapshot.
- bitemporal episode needed on: none (recorded-only line; supersession shows in recordedTo).

## Q-D12-25

- kind: cypher
- pattern: which composition database and classification method a dietary study used.

```cypher
MATCH (s:Study {uid: $studyUid})-[:HAS_ARM]->(arm:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)-[:ADMINISTERS]->(dp:DietaryPattern)   // D3 path
OPTIONAL MATCH (m:Assertion)-[:HAS_SUBJECT]->(s)
  WHERE m.predicate IN ['USED_COMPOSITION_DATABASE','USED_FOOD_CLASSIFICATION'] AND AS_OF(m)                                   // D12 predicate-only (05)
OPTIONAL MATCH (dp)-[pc:PATTERN_COMPONENT]->(cat:FoodCategory), (pa:Assertion {uid: pc.assertionUid}) WHERE AS_OF_REC(pc)
RETURN s.name, dp.name, collect(DISTINCT {method: m.predicate, value: m.valueString}) AS methods,
       collect(DISTINCT {category: cat.system + ':' + cat.code, role: pa.valueString, share: pa.valueNumber, unit: pa.unitCode}) AS definition
```

- trace: methods sentence locators ("Foods and beverages were categorized according to the NOVA system"; "nutrient values derived from the USDA National Nutrient Database for Standard Reference, Release 26 …").
- bitemporal episode needed on: none.

## Q-D12-26

- kind: vector + cypher (the 00-DIRECTIVE 3.8 path) + assessment branch
- pattern: (1) find chunks: D9 `Chunk.mentions` of FoodCategory NOVA 4 / UPF DietaryPatterns, or the chunk vector index; (2) climb to the assertions those chunks support; (3) add weighed assessments.

```cypher
// 1a. entity route: chunks that mention the UPF category or a UPF diet
MATCH (cat:FoodCategory {system: 'NOVA', code: '4'})
OPTIONAL MATCH (dp:DietaryPattern)-[:PATTERN_COMPONENT]->(cat)
WITH cat, collect(dp) AS diets
WITH [cat] + diets AS concepts
UNWIND concepts AS k
MATCH (ch:Chunk)-[:MENTIONS]->(k)
// 1b. vector route (Neo4j 2026.01+ SEARCH; index chunk_embedding is D9's): run in parallel and UNION
//   MATCH (ch:Chunk) SEARCH ch IN (VECTOR INDEX chunk_embedding FOR $qEmbedding LIMIT 20) SCORE AS s
// 2. chunk -> located span on the same snapshot -> assertions it supports
MATCH (ch)-[:CHUNK_OF]->(snap:SourceSnapshot)                                      // D9 Chunk: offsets are text-version offsets (textVersionHash)
MATCH (snap)-[:HAS_LOCATOR]->(loc:SourceLocator)<-[ev:HAS_EVIDENCE]-(a:Assertion)
WHERE loc.startOffset >= ch.startOffset AND loc.endOffset <= ch.endOffset          // span inside the chunk
  AND a.predicate IN ['WORSENS_TARGET','NO_EFFECT_ON_TARGET','MIXED_EFFECT_ON_TARGET','IMPROVES_TARGET']
MATCH (a)-[:HAS_OBJECT]->(t:Target {key: $targetKey})
OPTIONAL MATCH (ass:Assessment)-[:DERIVED_FROM]->(a) WHERE ass.recordedTo IS NULL
RETURN a.predicate, a.qualifiers AS population, loc.exact, snap.contentHash, ev.role,
       collect(DISTINCT {assessment: ass.uid, grading: ass.methodVersion, direction: ass.effectDirection}) AS weighed
```

- trace: question → chunk (MENTIONS, derived `entity-link/vN`, or vector score; never evidence) → Assertion (Hall 2019: +508 kcal/d under the UPF diet; WORSENS_TARGET target:body-composition, population "20 weight-stable adults, inpatient") → TEXT_QUOTE locator "Energy intake was greater during the ultra-processed diet (508±106 kcal/d; p=0.0001)" → snapshot sha256 `e95aca15…29ae3`; the verifier re-selects the same locator. Randomized vs cohort evidence is separated by the D3 design of the asserting study; grading systems (credibility class vs GRADE, Lane 2024) are two assessments, not one number.
- bitemporal episode needed on: IN_FOOD_CATEGORY when the expansion goes from a product to its category.

## Q-D12-27

- kind: cypher (D6-led, D12 mapping history)
- pattern: declaration and mapping history of a sold food.

```cypher
MATCH (p:Product {uid: $productUid})
OPTIONAL MATCH (p)-[hr:HAS_REFERENCE_FOOD]->(f:FoodItem)                         // all episodes, open and closed
OPTIONAL MATCH (p)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lve:HAS_LABEL_VERSION]->(lv:LabelVersion)                                       // all episodes
RETURN collect(DISTINCT {food: f.descriptionVerbatim, validFrom: hr.validFrom, validTo: hr.validTo,
                         recordedFrom: hr.recordedFrom, recordedTo: hr.recordedTo}) AS mappingHistory,
       collect(DISTINCT {declaration: lv.uid, asOf: lv.asOfStatementVerbatim, validFrom: lve.validFrom, validTo: lve.validTo,
                         recordedFrom: lve.recordedFrom, recordedTo: lve.recordedTo}) AS declarations
```

- trace: each episode names its Assertion; each declaration version its snapshot.
- bitemporal episode needed on: HAS_REFERENCE_FOOD (the only D12 edge in the answer).

## Q-D12-28

- kind: cypher (D8-led)
- pattern: food recalls with vulnerable-population qualifiers and lots.

```cypher
MATCH (ea:RegulatoryRecord {recordKind: 'RECALL'})-[ce:CONCERNS]->(target)          // D8 (AssertedRecordedProperties)
WHERE target:Product OR target:Lot
MATCH (ca:Assertion {uid: ce.assertionUid})                                        // the CONCERNS Assertion carries the population qualifier
OPTIONAL MATCH (target)-[:LOT_OF]->(lp)                                            // D8: a Lot reaches its Product (or ProductVariant)
WITH ea, ca, target, CASE WHEN target:Lot THEN lp ELSE target END AS product
OPTIONAL MATCH (product)-[ic:IN_FOOD_CATEGORY]->(cat:FoodCategory) WHERE AS_OF(ic)  // e.g. infant/children's foods (FoodEx2 / source-defined)
RETURN ea.uid, ea.recallClass, ea.recallStatus, ea.issuedAt, ea.reasonVerbatim, ea.lotCodesVerbatim,
       target.name, product.name, collect(DISTINCT cat.label) AS categories,
       [q IN ca.qualifiers WHERE q STARTS WITH 'population:' | substring(q, 11)] AS forWhom
```

- trace: openFDA record (`recall_number`) and FDA page locators. The review removed the model-stage `IN_FOOD_CATEGORY` pair from a Lot (D12 declares none) and the `APPLIES_TO_POPULATION` predicate (withdrawn in D5 vocab 0.2.0).
- bitemporal episode needed on: IN_FOOD_CATEGORY.

## Q-D12-29

- kind: assessment
- pattern: blue-zone food claims, the demographic evidence they rest on, and contradicting evidence.

```cypher
MATCH (cl:Claim)<-[:OCCURRENCE_OF]-(occ:Assertion)-[:HAS_SUBJECT]->(m)
WHERE (m:DietaryPattern OR m:FoodItem) AND (m.name =~ '(?i).*blue zone.*' OR any(s IN coalesce(m.synonyms, []) WHERE s =~ '(?i).*blue zone.*'))
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(cl) WHERE ass.recordedTo IS NULL
OPTIONAL MATCH (ass)-[e:HAS_EVIDENCE]->(loc:SourceLocator) WHERE e.role = 'CONTRADICTS'
RETURN cl.proposition, collect(DISTINCT occ.uid) AS occurrences, ass.verdict, collect(loc.exact) AS contradicting
```

- trace: contradicting spans of the Newman preprint snapshot; claim occurrences on their own snapshots.
- bitemporal episode needed on: none.

## Q-D12-30

- kind: cypher
- pattern: conflicting composition/formulation statements side by side (reference record vs declaration; two formulations under one barcode).

```cypher
MATCH (p:Product {uid: $productUid})-[hr:HAS_REFERENCE_FOOD]->(f:FoodItem)
MATCH (f)-[r:FOOD_CONTAINS]->(c)
MATCH (ar:Assertion {uid: r.assertionUid})
OPTIONAL MATCH (p)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lve:HAS_LABEL_VERSION]->(lv:LabelVersion)-[l:DECLARES_COMPONENT]->(c)   // D6 declaration line
RETURN c.name,
       {value: r.quantity, unit: r.unitCode, basis: r.amountBasis, validFrom: ar.validFrom, recordedFrom: r.recordedFrom, source: 'reference'} AS reference,
       collect({value: l.amount, unit: l.unitCode, basis: l.amountBasis, jurisdiction: lv.jurisdiction, asOf: lv.asOfStatementVerbatim,
                validFrom: lve.validFrom, recordedFrom: lve.recordedFrom}) AS declared
```

- trace: both sides cite their own locators; nothing is reconciled (the difference is a computed, labeled value).
- bitemporal episode needed on: HAS_REFERENCE_FOOD and D6 HAS_LABEL_VERSION (both sides shown with valid and recorded time); FOOD_CONTAINS is recorded-only.

## Q-D12-31

- kind: cypher, computed at query time with a versioned D10 DecisionCriterion (never stored as a property)
- pattern: sold foods whose declared amount per serving exceeds a guideline threshold.

```cypher
MATCH (dc:DecisionCriterion {criterionKey: $criterionKey, version: $v})              // e.g. 'added-sugars-per-meal' (DGA 2025-2030)
// D10 has no numeric threshold field: $threshold is read from dc.rule by the caller until D10 adds one (OQ-D12-19)
MATCH (p:Product)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[lve:HAS_LABEL_VERSION]->(lv:LabelVersion)-[l:DECLARES_COMPONENT]->(n:Constituent {uid: $componentUid})
WHERE AS_OF(lve) AND l.amountBasis = 'PER_SERVING' AND l.unitCode = dc.valueUnitCode AND l.amount > $threshold
OPTIONAL MATCH (p)-[ic:IN_FOOD_CATEGORY]->(cat:FoodCategory) WHERE AS_OF(ic)
RETURN p.name, l.amount, l.unitCode, $threshold AS threshold, dc.criterionKey, dc.version, collect(cat.label) AS categories, lve.assertionUid AS cites
```

- trace: declared line locator + the criterion's own defining locator (DGA page).
- bitemporal episode needed on: IN_FOOD_CATEGORY (optional facet).

## Q-D12-32

- kind: cypher (D6/D7/D8/D10 over D12 subjects)
- pattern: organizations selling foods that are claimed for longevity, with prices and harm/claim events.

```cypher
MATCH (a:Assertion)-[:HAS_OBJECT]->(:Target {key: 'target:longevity'})
WHERE a.predicate IN ['INTENDED_FOR_TARGET','IMPROVES_TARGET'] AND AS_OF(a)
MATCH (a)-[:HAS_SUBJECT]->(p:Product)
WHERE p.productKind IN ['CONVENTIONAL_FOOD','PREPARED_FOOD'] OR EXISTS { (p)-[:HAS_REFERENCE_FOOD]->(:FoodItem) }
OPTIONAL MATCH (org:Organization)-[:OWNS_BRAND]->(:Brand)<-[:BRANDED_AS]-(p)
OPTIONAL MATCH (ea:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})-[:CONCERNS]->(p)
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(p) WHERE ass.recordedTo IS NULL
RETURN org.name, p.name, collect(DISTINCT ea.uid) AS actions, collect(DISTINCT {kind: ass.assessmentKind, verdict: ass.verdict}) AS contested
```

- trace: marketing-claim locators; price observations (D6) and actions (D8) cite theirs.
- bitemporal episode needed on: HAS_REFERENCE_FOOD (the food filter).

## Q-D12-33

- kind: assessment
- pattern: seed-oil / dietary-fat claims contradicted by recovered RCT data, beside current guidance text.

```cypher
MATCH (cl:Claim)<-[:OCCURRENCE_OF]-(occ:Assertion)-[:HAS_SUBJECT]->(m)
WHERE (m:FoodCategory OR m:FoodItem OR m:Constituent) AND m.name =~ $seedOilOrLinoleic
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(occ) WHERE adj.verdict IN ['CONTRADICTED','MIXED_OR_CONFLICTING']
OPTIONAL MATCH (ass:Assessment)-[:ASSESSES]->(cl) WHERE ass.recordedTo IS NULL
OPTIONAL MATCH (ass)-[e:HAS_EVIDENCE]->(loc:SourceLocator)
OPTIONAL MATCH (g:Assertion)-[:HAS_SUBJECT]->(dp:DietaryPattern {definedBy: 'DGA 2025-2030'})-[:PATTERN_COMPONENT]->(m)
RETURN cl.proposition, collect(DISTINCT adj.verdict) AS adjudications, ass.verdict,
       collect(DISTINCT {role: e.role, exact: loc.exact}) AS evidence, dp.name AS currentGuidance
```

- trace: Ramsden 2016 (MCE) spans as CONTRADICTS evidence on the assessment; DGA text span for the current recommendation.
- bitemporal episode needed on: none.

## Q-D12-34

- kind: fulltext (primary) + vector (fallback)
- pattern: resolve a free-text food mention to ranked FoodItem / Product / DietaryPattern candidates.

```cypher
// fulltext indexes: food_item_search ON FoodItem[name, descriptionVerbatim, synonyms, brandNameVerbatim];
// dietary_pattern_search ON DietaryPattern[name, synonyms, definitionVerbatim]; D6 product_search on Product[name]
CALL () {
  CALL db.index.fulltext.queryNodes('food_item_search', $text) YIELD node, score
  RETURN node AS n, score, 'FoodItem' AS kind
  UNION ALL
  CALL db.index.fulltext.queryNodes('product_search', $text) YIELD node, score   // D6 index
  RETURN node AS n, score, 'Product' AS kind
}
OPTIONAL MATCH (n)-[:HAS_IDENTIFIER]->(i:Identifier)                 // kernel: stored Subjectable -> Identifier
OPTIONAL MATCH (n)-[hr:HAS_REFERENCE_FOOD]->(ref:FoodItem) WHERE hr.recordedTo IS NULL
RETURN kind, n.uid, n.name, score, collect(DISTINCT i.scheme + ':' + i.value) AS identifiers,
       collect(DISTINCT ref.uid) AS referenceFoods
ORDER BY score DESC LIMIT 10
// vector fallback (2026.01+): MATCH (f:FoodItem) SEARCH f IN (VECTOR INDEX food_item_embedding FOR $qEmbedding LIMIT 10) SCORE AS s
```

- trace: a candidate is not evidence; the chosen resolution is a kernel RESOLUTION Assessment (facets `surfaceForm=`, `typeHint=`; the span is its HAS_EVIDENCE role CONTEXT locator) that ASSESSES the chosen candidate; the kernel has no Mention node since its adversarial review (OQ-D12-34). D9 `Chunk.mentions` (derived MENTIONS) may then be projected from it.
- bitemporal episode needed on: HAS_REFERENCE_FOOD (to show the current reference food of a product candidate).

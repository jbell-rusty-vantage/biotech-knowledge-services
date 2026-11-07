# D6 — retrieval patterns

Model stage, A6, 2026-10-08; adversarial-review stage 2026-10-08 (D1 names COUNTS_TOWARD_NUTRIENT / HAS_ACTIVE_MOIETY / MOIETY_EQUIVALENT_AMOUNT; asserted DECLARES_COMPONENT lines; categorical assessment outcomes read from `conclusionCode`; reference prices off Offer). One section per question in `02-questions.md` (37). Shapes are written against the D6 module (`04-schema-proposal.graphql`) and A1's kernel (`packets/K/04-schema-proposal.graphql`, A1 worktree). Cypher follows `neo4j-cypher-skill` conventions (parameters, `OPTIONAL MATCH` for optional joins, `CALL {}` subqueries for latest-per-group). Nothing in this file stores a computed value as a fact: price per dose, max daily intake, rankings and "current" are computed at query time or written as kernel CALCULATED assertions / Assessments / Reports with method versions.

## Conventions used below

**As-of (valid time) on an episode edge `r`** (`AssertedEdgeProperties` / `StateEpisodeProperties`), half-open, null = unknown (never "ongoing"):

```cypher
// AS_OF(r, $V): valid at $V; rows with unknown bounds are returned with a flag, never silently dropped
WHERE (r.validFrom IS NULL OR r.validFrom <= $V) AND (r.validTo IS NULL OR r.validTo > $V)
WITH *, (r.validFrom IS NULL OR r.validTo IS NULL) AS validBoundUnknown
```

**As-recorded (recorded time)** `$T` (default: now): `r.recordedFrom <= $T AND (r.recordedTo IS NULL OR r.recordedTo > $T)`. Assertions use `a.recordedAt` / `a.recordedTo` the same way. Both filters together give the bitemporal "what did we believe at T about V".

**TRACE(a)** — how every answer cites captured bytes (00-DIRECTIVE 3.10). Every asserted D6 edge carries `assertionUid`; every typed-literal fact is itself an Assertion:

```cypher
MATCH (a:Assertion {uid: r.assertionUid})                       // or the literal Assertion itself
MATCH (a)-[:ASSERTED_BY]->(who)
MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)          // missionId, runId (00-DIRECTIVE 4)
RETURN a.uid, a.status, who.uid, loc.selectorKind, loc.exact, loc.startOffset, loc.endOffset, loc.page,
       snap.contentHash, snap.retrievedAt, src.canonicalUri, collect(adj.uid) AS adjudications, act.runId
```

Structural edges (`HAS_VARIANT`, `HAS_PACKAGE`, `HAS_OFFER`) have no Assertion of their own: their trace is the containing record's trace. A `DECLARES_COMPONENT` line is asserted (adversarial-review stage): `c.assertionUid` is the line's own Assertion (subject the LabelVersion, object the line target, asserter the transcribing source, locator the panel row), so TRACE(c) works like any asserted edge, and the line's valid time is its LabelVersion's `HAS_LABEL_VERSION` episode. Current lines are `c.recordedTo IS NULL` (a D1 merge/split closes a line and opens a new one; nothing is rewritten).

**OBSERVED_AT(p)** — the instant of a price/availability observation. Kernel rule: `ValidTimeBasis` OBSERVATION_ONLY forces a null valid bound, so a live page's price has `validFrom = null` and its instant is the capture's `observedAt` (else `retrievedAt`); a source that states a date (tracker "Oct 31, 2024", Economist CSV `date`) sets `validFrom` with basis STATED_BY_SOURCE and its precision; a source that states only the date at which the fact held, without bounds ("correct as of January 2022", a 10-K's filing date), sets the kernel's `validObservedAt` with basis OBSERVATION_ONLY (A1 change 5, adopted in the check stage; resolves OQ-D6-19):

```cypher
MATCH (p)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
WITH p, coalesce(p.validFrom, p.validObservedAt, min(coalesce(snap.observedAt, snap.retrievedAt))) AS observedAt
```

**PRICE(o, kind)** — latest price of one kind on an offer (price is a kernel typed-literal Assertion; no PriceObservation node):

```cypher
CALL (o) {
  MATCH (p:Assertion)-[:HAS_SUBJECT]->(o)
  WHERE p.predicate = 'OFFER_PRICE_' + $kind AND p.recordedTo IS NULL
  MATCH (p)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
  WITH p, coalesce(p.validFrom, p.validObservedAt, min(coalesce(snap.observedAt, snap.retrievedAt))) AS observedAt
  WHERE observedAt <= $V
  RETURN p, observedAt ORDER BY observedAt DESC LIMIT 1
}
// p.valueNumber = amount, p.unitCode = 'iso4217:<CODE>' (kernel convention; OQ-D6-06 resolved), observedAt per OBSERVED_AT
```

Price subjects: a seller's price has its Offer as subject. A price with no seller proposition behind it is never an Offer: a tracker's aggregate over third-party sellers has the MerchantListing as subject (qualifier `sellerClass=THIRD_PARTY_NEW`), and a published index or survey price is `MARKET_REFERENCE_PRICE` with the Product, ProductVariant or Package as subject (adversarial-review stage). The currency is only `unitCode` (no `Offer.currency`).

Index plan (created by the executor, not GraphQL): range index `Assertion(predicate)`; range indexes on `Package(packageKind)`, `MerchantListing(hostDomain, hostItemId)`, `Offer(purchaseMode)`, `LabelVersion(compositionDigest)`, `LabelVersion(labelVersionCode)`, `Product(productKind)`; relationship indexes on `DECLARES_COMPONENT(lineRole)`, `DECLARES_COMPONENT(dailyValuePercent)`; fulltext index `product_text` over `Product.name, Product.marketedName, MerchantListing.titleAsDisplayed` (Q-D6-18 entry, CQ-PF-02 candidate matching). Vector retrieval over captured text uses D9's chunk index (MENTIONS is a derived projection only, 00-DIRECTIVE 3.8).

## Q-D6-01

- kind: cypher
- pattern: label history of one package, newest first, each version with its lines, and a field diff to the predecessor computed in the query.

```cypher
MATCH (pk:Package {uid: $package})-[r:HAS_LABEL_VERSION]->(lv:LabelVersion)
WHERE r.recordedTo IS NULL                                          // current belief; add AS_OF(r,$V) for "at V"
// validObservedAt is a kernel Assertion field, not an episode-edge field: read it from the episode's own Assertion.
OPTIONAL MATCH (ea:Assertion {uid: r.assertionUid})
// HAS_LABEL_VERSION is NON-EXCLUSIVE (05): several sources may attest the same version with parallel open episodes.
// Aggregate to one row per DISTINCT LabelVersion first (earliest attested start; the episodes kept as a list),
// so a version is never diffed against itself.
WITH pk, lv, min(coalesce(r.validFrom, ea.validObservedAt, lv.firstObservedAt)) AS since,
     collect({assertion: r.assertionUid, from: r.validFrom, to: r.validTo, basis: r.validFromBasis}) AS episodes
WITH pk, lv, since, episodes ORDER BY since DESC
WITH pk, collect({lv: lv, since: since, episodes: episodes}) AS hist
UNWIND range(0, size(hist) - 1) AS i
WITH hist[i] AS cur, CASE WHEN i + 1 < size(hist) THEN hist[i + 1] ELSE null END AS prev
CALL (cur) {
  WITH cur.lv AS lv
  MATCH (lv)-[c:DECLARES_COMPONENT]->(t) WHERE c.recordedTo IS NULL
  RETURN collect({order: c.orderIndex, parent: c.parentOrderIndex, role: c.lineRole, name: c.declaredNameVerbatim,
                  amount: c.amount, unit: c.unitCode, referent: c.amountReferent, massBasis: c.massBasis, target: t.uid,
                  lineAssertion: c.assertionUid}) AS lines
}
RETURN cur.lv.uid, cur.lv.labelVersionCode, cur.since, cur.episodes, cur.lv.servingSizeVerbatim,
       cur.lv.minDailyServings, cur.lv.maxDailyServings, cur.lv.directionsText, cur.lv.seals, cur.lv.containsAllergens,
       lines,
       prev.lv.compositionDigest = cur.lv.compositionDigest AS sameComposition,
       prev.lv.maxDailyServings <> cur.lv.maxDailyServings AS directionsChanged,
       [s IN cur.lv.seals WHERE NOT s IN coalesce(prev.lv.seals, [])] AS sealsAdded,
       [s IN coalesce(prev.lv.seals, []) WHERE NOT s IN cur.lv.seals] AS sealsRemoved
```

- trace: TRACE on each `HAS_LABEL_VERSION` episode Assertion (`cur.episodes[*].assertion`) and on each line's own Assertion (`lineAssertion`): DSLD JSON locators (`productVersionCode`, `statements[...]`), retailer table locators; every snapshot that evidences the same LabelVersion is listed (many captures → one version).
- bitemporal episode needed on: `HAS_LABEL_VERSION` (yes: two versions on one UPC, late archive captures).

## CQ-ID-05

- kind: cypher (+ assessment read)
- pattern: compare two observed states of one package on each dimension; the verdict is a kernel Assessment (`assessmentSubkind: D6.change-kind`, values LABEL_ONLY | PACKAGE_ONLY | FORMULATION | IDENTITY | UNKNOWN) written by an agent from this query's output.

```cypher
MATCH (pk:Package {uid: $package})-[r1:HAS_LABEL_VERSION]->(a:LabelVersion), (pk)-[r2:HAS_LABEL_VERSION]->(b:LabelVersion)
WHERE a.uid = $labelA AND b.uid = $labelB
OPTIONAL MATCH (pk)-[h:HAS_IDENTIFIER]->(gtin:Identifier {scheme: 'GTIN'})
WITH pk, a, b, r1, r2, collect({gtin: gtin.name, from: h.validFrom, to: h.validTo}) AS gtinEpisodes
OPTIONAL MATCH (as:Assessment {assessmentSubkind: 'D6.change-kind'})-[:ASSESSES]->(a), (as)-[:ASSESSES]->(b)
WHERE as.recordedTo IS NULL
RETURN a.compositionDigest = b.compositionDigest AS sameFormulation,
       a.contentDigest = b.contentDigest AS sameLabel,
       a.maxDailyServings, b.maxDailyServings, a.seals, b.seals, gtinEpisodes,
       as.conclusionCode AS changeKind, as.summary, as.uid
```

Variant identity changes (IDENTITY) are detected one level up: the two packages' variants differ. A retailer's "New formulation" statement is a claim occurrence on the MerchantListing adjudicated by CQ-PF-02.
- trace: both HAS_LABEL_VERSION episode Assertions (TRACE), the HAS_IDENTIFIER episode Assertions for the GTINs, and the Assessment's `HAS_EVIDENCE` locators and `DERIVED_FROM` inputs.
- bitemporal episode needed on: `HAS_LABEL_VERSION`; kernel `HAS_IDENTIFIER` (IdentifierLinkProperties).

## CQ-ID-02

- kind: cypher
- pattern: given a D3 administration interval [$from, $to) for a D3 InterventionComponent that ADMINISTERS a ProductVariant (D3 seam; D3 declares ADMINISTERS on InterventionComponent, check stage), return label versions whose episode overlaps it, per package; "unknown" when none.

```cypher
MATCH (ic:InterventionComponent {uid: $interventionComponent})-[:ADMINISTERS]->(v:ProductVariant)-[:HAS_PACKAGE]->(pk:Package)
OPTIONAL MATCH (pk)-[r:HAS_LABEL_VERSION]->(lv:LabelVersion)
WHERE r.recordedTo IS NULL
  AND (r.validFrom IS NULL OR r.validFrom < $to) AND (r.validTo IS NULL OR r.validTo > $from)
RETURN pk.uid, lv.uid, lv.compositionDigest, r.validFrom, r.validTo, r.validFromBasis,
       CASE WHEN lv IS NULL THEN 'UNKNOWN' ELSE 'CAPTURED' END AS status
```

DSLD `entryDate` is a database entry date, not a market date: the episode carries the kernel `validFromBasis` (PUBLICATION_PROXY for an entry date, STATED_BY_SOURCE for a printed or declared date, OBSERVATION_ONLY → null bound) so the answer says how the interval was known.
- trace: TRACE on each overlapping episode Assertion; D3's administration dates trace through D3's own assertions.
- bitemporal episode needed on: `HAS_LABEL_VERSION` (essential).

## CQ-ID-01

- kind: cypher (assessment read)
- pattern: identity match between a study's named material and the marketed product is a kernel Assessment (`EQUIVALENCE`, subkind `D6.study-material-match`) ABOUT the D3 arm material and the ProductVariant, with dimension results in `summary`/`rationale` and UNKNOWN where no historical label exists.

```cypher
MATCH (v:ProductVariant {uid: $variant})<-[:ASSESSES]-(as:Assessment {assessmentKind: 'EQUIVALENCE', assessmentSubkind: 'D6.study-material-match'})
MATCH (as)-[:ASSESSES]->(studied)
WHERE studied <> v AND as.recordedTo IS NULL
OPTIONAL MATCH (as)-[:DERIVED_FROM]->(input:Assertion)
RETURN studied.uid, as.conclusionCode, as.summary, as.methodVersion, collect(input.uid) AS inputs
```

- trace: the Assessment's HAS_EVIDENCE locators (study methods text, label versions) and DERIVED_FROM inputs; each input TRACEs to its snapshot.
- bitemporal episode needed on: none new (reads HAS_LABEL_VERSION episodes through CQ-ID-02 when the period matters).

## CQ-PF-01

- kind: cypher
- pattern: one label's declaration lines with the referent and the D1 mass basis, and every CALCULATED assertion derived from a line (D1 `MOIETY_EQUIVALENT_AMOUNT` rule:mw-ratio.v1, `NUTRIENT_EQUIVALENT_AMOUNT`, D6 `CALCULATED_DAILY_MAX_INTAKE`). A calculated amount cites the line's own Assertion in `DERIVED_FROM` (adversarial-review stage; the form D1's fixtures write; replaces the `line=<orderIndex>` qualifier convention).

```cypher
MATCH (lv:LabelVersion {uid: $label})-[c:DECLARES_COMPONENT]->(t)
WHERE c.recordedTo IS NULL
OPTIONAL MATCH (calc:Assertion {basisKind: 'CALCULATED'})-[:DERIVED_FROM]->(:Assertion {uid: c.assertionUid})
WHERE calc.recordedTo IS NULL
RETURN c.orderIndex, c.declaredNameVerbatim, c.formVerbatim, c.amount, c.unitCode, c.amountReferent, c.massBasis, c.amountBasis,
       labels(t)[0] AS targetType, t.uid, c.assertionUid AS lineAssertion,
       collect({predicate: calc.predicate, rule: calc.derivationRule, value: calc.valueNumber, unit: calc.unitCode}) AS calculated
ORDER BY c.orderIndex
```

(Computed records are kernel Assertions with `assertionKind: COMPUTATION`, `basisKind: CALCULATED`, a `derivationRule` and `DERIVED_FROM` inputs.)
- trace: the line's own Assertion (TRACE(c): panel-row locator) and the label's HAS_LABEL_VERSION assertion; calculated values cite the line Assertion through kernel `DERIVED_FROM` plus their rule; D1's moiety rule traces in D1.
- bitemporal episode needed on: none (lines carry recorded time only; valid time is the label episode).

## CQ-AX-25

- kind: cypher
- pattern: products whose label valid at V declares compound C (line target is a D1 material realizing C, a material realizing a salt or ester whose active moiety is C — a query for NR returns labels declaring NRC — or C's nutrient constituent), with amount, referent and mass basis; blend members listed separately with no amount.

```cypher
MATCH (sub {uid: $compound})                                         // D1 ChemicalSubstance
MATCH (lv:LabelVersion)-[c:DECLARES_COMPONENT]->(t)
WHERE c.recordedTo IS NULL
  AND ( (t:IngredientMaterial AND (EXISTS { (t)-[:REALIZES_SUBSTANCE]->(sub) }                              // D1 edge
                                   OR EXISTS { (t)-[:REALIZES_SUBSTANCE]->()-[:HAS_ACTIVE_MOIETY]->(sub) }))  // D1 edges: salt form -> moiety
     OR (t:Constituent AND EXISTS { (sub)-[:COUNTS_TOWARD_NUTRIENT]->(t) }) )                                 // D1 edge
MATCH (p:Product)-[:HAS_VARIANT]->(v:ProductVariant)-[:HAS_PACKAGE]->(pk:Package)-[r:HAS_LABEL_VERSION]->(lv)
WHERE r.recordedTo IS NULL AND (r.validFrom IS NULL OR r.validFrom <= $V) AND (r.validTo IS NULL OR r.validTo > $V)
RETURN DISTINCT p.uid, p.name, v.uid, pk.uid, lv.uid, c.declaredNameVerbatim, c.amount, c.unitCode, c.amountReferent, c.massBasis,
       NOT EXISTS { (t)-[:REALIZES_SUBSTANCE]->(sub) } AND t:IngredientMaterial AS viaActiveMoiety,
       c.lineRole = 'BLEND_MEMBER' AND c.amount IS NULL AS blendOnly, c.assertionUid AS lineAssertion
ORDER BY blendOnly, p.name
```

Never filtered on a stored product→compound shortcut (pinned CONTAINS cut).
- trace: per row, the line's own Assertion (TRACE(c)), the HAS_LABEL_VERSION episode Assertion, and D1's REALIZES_SUBSTANCE / HAS_ACTIVE_MOIETY / COUNTS_TOWARD_NUTRIENT assertions.
- bitemporal episode needed on: `HAS_LABEL_VERSION`.

## Q-D6-02

- kind: cypher (computed at query time; never stored)
- pattern: price per effective daily dose of compound C, per package and price kind, for offers in jurisdiction J.

```cypher
MATCH (sub {uid: $compound})
MATCH (lv:LabelVersion)-[c:DECLARES_COMPONENT]->(t:IngredientMaterial)
WHERE c.recordedTo IS NULL AND c.amount IS NOT NULL AND c.amountBasis = 'PER_SERVING'
  AND (EXISTS { (t)-[:REALIZES_SUBSTANCE]->(sub) } OR EXISTS { (t)-[:REALIZES_SUBSTANCE]->()-[:HAS_ACTIVE_MOIETY]->(sub) })
MATCH (pk:Package)-[r:HAS_LABEL_VERSION]->(lv) WHERE r.recordedTo IS NULL AND r.validTo IS NULL
MATCH (prod:Product)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(pk)          // the row names the product line
MATCH (l:MerchantListing)-[lf:LISTING_FOR]->(pk) WHERE lf.recordedTo IS NULL AND lf.validTo IS NULL
MATCH (l)-[:HAS_OFFER]->(o:Offer {jurisdiction: $J})
UNWIND $kinds AS kind                                                // ['ONE_TIME','SUBSCRIPTION']
CALL (o, kind) {                                                      // PRICE(o, kind) with $V = now
  MATCH (p:Assertion)-[:HAS_SUBJECT]->(o)
  WHERE p.predicate = 'OFFER_PRICE_' + kind AND p.recordedTo IS NULL
  MATCH (p)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
  WITH p, coalesce(p.validFrom, p.validObservedAt, min(coalesce(snap.observedAt, snap.retrievedAt))) AS observedAt
  RETURN p, observedAt ORDER BY observedAt DESC LIMIT 1
}
// moiety basis ($basis = 'MOIETY'): D1's CALCULATED MOIETY_EQUIVALENT_AMOUNT (rule:mw-ratio.v1, subject the label version,
// object the moiety) that cites this line's Assertion in DERIVED_FROM; a line already declared on the moiety (massBasis
// ACTIVE_MOIETY, Canadian label) is used as is; otherwise the declared (salt-form) amount and the answer says so.
OPTIONAL MATCH (m:Assertion {predicate: 'MOIETY_EQUIVALENT_AMOUNT'})-[:DERIVED_FROM]->(:Assertion {uid: c.assertionUid})
WHERE m.recordedTo IS NULL AND EXISTS { (m)-[:HAS_OBJECT]->(sub) }
WITH prod, pk, lv, c, o, kind, p, observedAt,
     CASE WHEN $basis = 'MOIETY' AND c.massBasis <> 'ACTIVE_MOIETY' THEN m.valueNumber ELSE c.amount END AS perServing,
     CASE WHEN $basis = 'MOIETY' AND c.massBasis <> 'ACTIVE_MOIETY' THEN 'MOIETY_EQUIVALENT_AMOUNT' ELSE coalesce(c.massBasis, 'AS_DECLARED') END AS doseBasis
WITH *, (pk.unitCount / lv.servingSizeValue) AS servingsInPackage,
        perServing * coalesce(lv.maxDailyServings, 1) AS dailyDose
RETURN prod.name AS product, pk.uid, kind, p.valueNumber AS price, p.unitCode AS currency, observedAt,
       dailyDose, doseBasis, c.unitCode, p.valueNumber / (servingsInPackage / coalesce(lv.maxDailyServings, 1)) AS pricePerDailyDose
ORDER BY pricePerDailyDose
```

The user chooses the dose basis (label serving, max daily servings, or a target dose); the answer prints the basis.
- trace: price Assertion TRACE (merchant page locator, observer = asserter); the line's own Assertion and the label episode TRACE; LISTING_FOR episode TRACE; D1 MOIETY_EQUIVALENT_AMOUNT TRACE (its DERIVED_FROM inputs: the line Assertion, two MW FIELD assertions, the HAS_ACTIVE_MOIETY assertion).
- bitemporal episode needed on: `HAS_LABEL_VERSION`, `LISTING_FOR` (current = open episode).

## Q-D6-03

- kind: cypher (published read) — ranking is a D10 Report
- pattern: read the published comparison report about products marketed for target T and its cited rows; producing it runs Q-D6-02, Q-D6-04, CQ-PF-03 and target-claim retrieval under a versioned DecisionCriterion (D10).

```cypher
MATCH (tg {uid: $target})                                           // D5 Target
MATCH (rep:Report {reportKind: 'COMPARISON'})-[:ASSESSES]->(tg)
WHERE rep.recordedTo IS NULL
MATCH (rep)-[:HAS_ITEM]->(row:ReportItem {itemKind: 'ROW'})-[:ASSESSES]->(p:Product)   // D10 option rows (check stage)
OPTIONAL MATCH (row)-[:DERIVED_FROM]->(cited:Assertion)
OPTIONAL MATCH (rep)-[:USES_CRITERION]->(dc:DecisionCriterion)                         // D10, versioned
RETURN rep.uid, rep.skeletonKey, rep.policyVersion, collect(DISTINCT dc.uid) AS criteria,
       p.uid, row.disposition, row.rank, row.cellValues, count(cited) AS citedAssertions
ORDER BY row.rank
```

Candidate set (input to the report): `(a:Assertion {predicate:'INTENDED_FOR_TARGET'})-[:HAS_SUBJECT]->(p:Product)` with `(a)-[:HAS_OBJECT]->(tg)`.
- trace: the Report's DERIVED_FROM assertions and HAS_EVIDENCE locators; each row TRACEs.
- bitemporal episode needed on: none new.

## CQ-AX-17

- kind: cypher (assessment read + live join)
- pattern: studied material (D3) → equivalence Assessment → variant → packages → current label (amount per serving) → current offers in J.

```cypher
MATCH (as:Assessment {assessmentSubkind: 'D6.study-material-match'})-[:ASSESSES]->(v:ProductVariant)
MATCH (as)-[:ASSESSES]->(:Entity {uid: $studiedMaterial}) WHERE as.recordedTo IS NULL
MATCH (v)-[:HAS_PACKAGE]->(pk)-[r:HAS_LABEL_VERSION]->(lv) WHERE r.recordedTo IS NULL AND r.validTo IS NULL
OPTIONAL MATCH (lv)-[c:DECLARES_COMPONENT]->(t) WHERE c.recordedTo IS NULL AND t.uid IN $studiedMaterialTargets
OPTIONAL MATCH (l:MerchantListing)-[lf:LISTING_FOR]->(pk) WHERE lf.recordedTo IS NULL AND lf.validTo IS NULL
OPTIONAL MATCH (l)-[:HAS_OFFER]->(o:Offer {jurisdiction: $J})
RETURN as.conclusionCode, v.uid, lv.uid, c.amount, c.unitCode, c.massBasis, collect(DISTINCT o.uid) AS offers
```

- trace: Assessment evidence + label TRACE + offer price TRACE.
- bitemporal episode needed on: `HAS_LABEL_VERSION`, `LISTING_FOR`.

## CQ-CM-01

- kind: cypher
- pattern: per offer on a listing: host (listing.hostDomain → D7 Organization by domain identifier), seller of record (episode), fulfiller (property), affiliate links (D9 predicate-only LINKS_TO_OFFER Assertions whose object is the offer or the listing).

```cypher
MATCH (l:MerchantListing {uid: $listing})-[:HAS_OFFER]->(o:Offer)
OPTIONAL MATCH (o)-[s:SELLER_OF_RECORD]->(seller:Organization) WHERE s.recordedTo IS NULL AND s.validTo IS NULL
OPTIONAL MATCH (host:Organization)-[:HAS_IDENTIFIER]->(:Identifier {scheme: 'WEB_DOMAIN', value: l.hostDomain})   // scheme requested (OQ-D6-05)
OPTIONAL MATCH (link:Assertion {predicate: 'LINKS_TO_OFFER'})-[:HAS_OBJECT]->(lo) WHERE lo = o OR lo = l   // D9 predicate (check stage)
RETURN o.uid, o.purchaseMode, host.uid AS host, seller.uid AS sellerOfRecord, o.sellerAccountIdVerbatim,
       o.fulfillmentKind, o.fulfillerNameAsDisplayed, s.validFrom AS sellerSince, o.lastObservedAt,
       collect(link.uid) AS affiliateLinks
```

- trace: SELLER_OF_RECORD episode Assertion TRACE (Amazon "Sold by" link locator `seller=A1W0QC6JE0QLDF`); fulfiller text locator via the offer's OFFER_AVAILABILITY/price Assertions of the same snapshot.
- bitemporal episode needed on: `SELLER_OF_RECORD`.

## CQ-CM-02

- kind: cypher
- pattern: offers for a variant's packages on date D, with the listing→package link status: accepted (LISTING_FOR episode valid at D) or proposed (open D6.listing-to-package Assessment, status PROPOSED).

```cypher
MATCH (v:ProductVariant {uid: $variant})-[:HAS_PACKAGE]->(pk:Package)
CALL (pk) {
  MATCH (l:MerchantListing)-[lf:LISTING_FOR]->(pk)
  WHERE lf.recordedTo IS NULL AND (lf.validFrom IS NULL OR lf.validFrom <= $D) AND (lf.validTo IS NULL OR lf.validTo > $D)
  RETURN l, 'ACCEPTED' AS linkStatus, lf.assertionUid AS basis
  UNION
  MATCH (as:Assessment {assessmentSubkind: 'D6.listing-to-package', status: 'PROPOSED'})-[:ASSESSES]->(pk)
  MATCH (as)-[:ASSESSES]->(l:MerchantListing) WHERE as.recordedTo IS NULL
  RETURN l, 'PROPOSED' AS linkStatus, as.uid AS basis
}
MATCH (l)-[:HAS_OFFER]->(o:Offer)
WHERE EXISTS { MATCH (p:Assertion)-[:HAS_SUBJECT]->(o)
               WHERE p.predicate STARTS WITH 'OFFER_'
               MATCH (p)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
               WHERE coalesce(p.validFrom, p.validObservedAt, snap.observedAt, snap.retrievedAt) <= $D
                 AND coalesce(p.validFrom, p.validObservedAt, snap.observedAt, snap.retrievedAt) > $D - duration({days: $window}) }
RETURN pk.uid, l.hostDomain, l.hostItemId, linkStatus, basis, o.uid, o.purchaseMode
```

- trace: LISTING_FOR episode TRACE or the Assessment's evidence; offer existence at D from its price/availability Assertions (TRACE).
- bitemporal episode needed on: `LISTING_FOR`.

## CQ-CM-03

- kind: cypher
- pattern: all price and availability observations of one offer, ordered by observed instant, with kind, observer (asserter) and locator.

```cypher
MATCH (o:Offer {uid: $offer})<-[:HAS_SUBJECT]-(p:Assertion)
WHERE (p.predicate STARTS WITH 'OFFER_PRICE_' OR p.predicate = 'OFFER_AVAILABILITY') AND p.recordedTo IS NULL
MATCH (p)-[:ASSERTED_BY]->(observer)
MATCH (p)-[:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
RETURN coalesce(p.validFrom, p.validObservedAt, snap.observedAt, snap.retrievedAt) AS observedAt, p.validFromBasis, p.validFromPrecision,
       substring(p.predicate, 12) AS priceKind, p.valueNumber, p.unitCode,
       p.valueString AS availability, observer.uid, snap.captureMethod, loc.exact, snap.contentHash
ORDER BY observedAt
```

Tracker statistics (lowest/highest with a date) are OFFER_PRICE_TRACKER_LOW/HIGH asserted by the tracker; tracker averages are not stored. A tracker's aggregate over third-party sellers has the MerchantListing as subject (qualifier `sellerClass=THIRD_PARTY_NEW`): run the same pattern with `(l:MerchantListing {uid: $listing})<-[:HAS_SUBJECT]-(p:Assertion)`.
- trace: each row is its own Assertion with locator (TRACE inline).
- bitemporal episode needed on: none (each observation is an instant on its Assertion; recorded time on the Assertion).

## CQ-CM-05

- kind: cypher
- pattern: last observation, explicit end signals, and the open end left null.

```cypher
MATCH (o:Offer {uid: $offer})<-[:HAS_OFFER]-(l:MerchantListing)
CALL (o) { MATCH (p:Assertion)-[:HAS_SUBJECT]->(o) WHERE p.predicate STARTS WITH 'OFFER_' AND p.recordedTo IS NULL
           MATCH (p)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
           RETURN max(coalesce(p.validFrom, p.validObservedAt, s.observedAt, s.retrievedAt)) AS lastObservedAt }
OPTIONAL MATCH (e:Assertion)-[:HAS_SUBJECT]->(x) WHERE x IN [o, l]
  AND ((e.predicate = 'OFFER_AVAILABILITY' AND e.valueString IN ['DISCONTINUED_AS_DISPLAYED','CURRENTLY_UNAVAILABLE'])
       OR e.predicate = 'RETAILER_DISCONTINUED')
OPTIONAL MATCH (snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source {canonicalUri: l.canonicalUrl})
WHERE snap.retrievedAt > lastObservedAt
RETURN lastObservedAt, collect(DISTINCT {signal: e.predicate, value: e.valueString, assertion: e.uid}) AS endSignals,
       count(snap) AS laterCapturesWithoutOffer,
       CASE WHEN size(collect(e)) > 0 THEN 'ENDED_AS_DISPLAYED' WHEN count(snap) > 0 THEN 'NOT_SEEN_SINCE' ELSE 'OBSERVATION_STOPPED' END AS reading
```

- trace: end-signal Assertions TRACE (iHerb "Discontinued Item" title locator); later snapshots show observation continued.
- bitemporal episode needed on: none.

## CQ-AX-06

- kind: cypher
- pattern: the current value with lastObservedAt and whether a later capture confirmed it (generic for price, availability, label).

```cypher
MATCH (o:Offer {uid: $offer})
CALL (o) { MATCH (p:Assertion)-[:HAS_SUBJECT]->(o) WHERE p.predicate = $predicate AND p.recordedTo IS NULL
           MATCH (p)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
           WITH p, coalesce(p.validFrom, p.validObservedAt, min(coalesce(s.observedAt, s.retrievedAt))) AS observedAt
           RETURN p, observedAt ORDER BY observedAt DESC LIMIT 2 }
WITH o, collect({p: p, at: observedAt}) AS lastTwo
RETURN lastTwo[0].p.valueNumber AS value, lastTwo[0].at AS lastObservedAt,
       lastTwo[1].p.valueNumber = lastTwo[0].p.valueNumber AS confirmedByEarlier, o.lastObservedAt AS anyObservation
```

For labels: `LabelVersion.lastObservedAt` and the newest evidencing snapshot of the open HAS_LABEL_VERSION episode.
- trace: TRACE of the latest Assertion.
- bitemporal episode needed on: none (labels: `HAS_LABEL_VERSION`).

## Q-D6-04

- kind: cypher (cross-module: D8 recall records)
- pattern: recall/enforcement records (D8 `RegulatoryRecord`, recordFamily ENFORCEMENT) that CONCERN the product or one of its lots (D8 targets: Product, Lot; LOT_OF → Product or ProductVariant), with hazard, classification, status, lot codes and channels; package-level scope stays in `productDescriptionVerbatim` / `lotCodesVerbatim` until D8 accepts D6.Package (OQ-D6-13); unresolved product matches shown as proposed.

```cypher
MATCH (p:Product {uid: $product})-[:HAS_VARIANT]->(v)-[:HAS_PACKAGE]->(pk)
OPTIONAL MATCH (lot:Lot)-[:LOT_OF]->(lt) WHERE lt = v OR lt = p      // D8 seam (LotOfTarget = Product | ProductVariant)
WITH p, pk, collect(DISTINCT lot) + [p] AS scope
UNWIND scope AS x
MATCH (ea:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})-[:CONCERNS]->(x)   // D8 seam (RegulatoryRecordTopic)
OPTIONAL MATCH (ch:Assertion {predicate: 'SOLD_THROUGH_CHANNEL'})-[:HAS_SUBJECT]->(p)
OPTIONAL MATCH (lv:LabelVersion)-[:NAMES_RESPONSIBLE_PARTY]->(firm:Organization) WHERE (pk)-[:HAS_LABEL_VERSION]->(lv)
RETURN ea.uid, ea.recordKind, ea.recallClass, ea.recallStatus, ea.issuedAt, ea.reasonVerbatim, ea.lotCodesVerbatim, labels(x)[0] AS scopeLevel,
       collect(DISTINCT ch.uid) AS statedChannels, collect(DISTINCT firm.uid) AS labelResponsibleParty
```

Proposed matches: `Assessment {assessmentSubkind:'D6.recall-scope', status:'PROPOSED'}` ABOUT the action and the package.
- trace: D8 action Assertion TRACE (openFDA `code_info`, FDA press release locators); channel Assertions TRACE.
- bitemporal episode needed on: none in D6 (D8 owns its action dates).

## Q-D6-05

- kind: cypher (assessment read + live join)
- pattern: listings currently resolved (or proposed) to a recalled package, with the commerce-match assessment and its status.

```cypher
MATCH (ea:RegulatoryRecord {uid: $action})-[:CONCERNS]->(p:Product)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk:Package)   // D8 targets Product; package scope by productDescriptionVerbatim (OQ-D6-13)
OPTIONAL MATCH (l:MerchantListing)-[lf:LISTING_FOR]->(pk) WHERE lf.recordedTo IS NULL AND lf.validTo IS NULL
OPTIONAL MATCH (as:Assessment {assessmentSubkind: 'D6.recall-scope'})-[:ASSESSES]->(l2:MerchantListing)
WHERE (as)-[:ASSESSES]->(ea) AND as.recordedTo IS NULL
WITH pk, collect(DISTINCT {listing: l.uid, status: 'RESOLVED'}) + collect(DISTINCT {listing: l2.uid, status: as.status, verdict: as.conclusionCode}) AS hits
UNWIND hits AS h
MATCH (lst:MerchantListing {uid: h.listing})
WHERE lst.lastObservedAt >= datetime() - duration({days: $freshDays})
RETURN pk.uid, h.listing, lst.hostDomain, h.status, h.verdict, lst.lastObservedAt
```

- trace: LISTING_FOR TRACE or Assessment evidence (lot text on the recall vs listing images/text).
- bitemporal episode needed on: `LISTING_FOR`.

## Q-D6-06

- kind: cypher (assessment read)
- pattern: per offer of the brand's packages, the authorized-channel Assessment (never a boolean on the seller), with the brand statement and the observed seller.

```cypher
MATCH (b {uid: $brand})<-[bb:BRANDED_AS]-(p:Product)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk)
WHERE bb.recordedTo IS NULL AND bb.validTo IS NULL
MATCH (l:MerchantListing)-[lf:LISTING_FOR]->(pk) WHERE lf.recordedTo IS NULL AND lf.validTo IS NULL
MATCH (l)-[:HAS_OFFER]->(o:Offer)
OPTIONAL MATCH (o)-[s:SELLER_OF_RECORD]->(seller) WHERE s.recordedTo IS NULL
OPTIONAL MATCH (as:Assessment {assessmentSubkind: 'D6.authorized-channel'})-[:ASSESSES]->(o) WHERE as.recordedTo IS NULL
OPTIONAL MATCH (stmt:Assertion {predicate: 'AUTHORIZES_CHANNEL'})-[:HAS_SUBJECT]->(owner)-[:OWNS_BRAND]->(b)
RETURN o.uid, l.hostDomain, seller.uid, o.sellerNameAsDisplayed, as.conclusionCode AS channelVerdict, as.summary, collect(stmt.uid) AS brandStatements
```

- trace: brand statement TRACE ("does not authorize any third-party sellers", FDA page locator), SELLER_OF_RECORD TRACE, Assessment evidence.
- bitemporal episode needed on: `BRANDED_AS`, `SELLER_OF_RECORD`, `LISTING_FOR`.

## Q-D6-07

- kind: cypher (kernel claim + adjudication read)
- pattern: company claim occurrences about a product/recall and the agency or independent assertions on the same proposition, side by side with adjudications.

```cypher
MATCH (p:Product {uid: $product})<-[:HAS_SUBJECT]-(co:Assertion {assertionKind: 'CLAIM'})-[:OCCURRENCE_OF]->(cl:Claim)
MATCH (co)-[:ASSERTED_BY]->(company)
OPTIONAL MATCH (other:Assertion)-[:OCCURRENCE_OF]->(cl) WHERE other <> co
OPTIONAL MATCH (other)-[:ASSERTED_BY]->(otherAsserter)
OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(co)
OPTIONAL MATCH (adj)-[e:HAS_EVIDENCE]->(loc:SourceLocator)
RETURN cl.uid, co.proposition, company.uid, collect(DISTINCT {by: otherAsserter.uid, polarity: other.polarity}) AS otherSources,
       adj.uid, adj.verdict, collect(DISTINCT {role: e.role, quote: loc.exact}) AS adjudicationEvidence
```

Contradiction lives on `HAS_EVIDENCE {role: CONTRADICTS}` from the Adjudication to the agency locator (never document → product).
- trace: claim occurrence TRACE + adjudication evidence locators.
- bitemporal episode needed on: none.

## Q-D6-08

- kind: cypher
- pattern: products whose current label declares an ingredient only inside a proprietary blend (no member amount). Starts from the lines themselves (the stored Boolean `hasUndeclaredBlendAmounts` was dropped in the adversarial-review stage: it repeated this filter; closes OQ-D6-12); index `DECLARES_COMPONENT(lineRole)`.

```cypher
MATCH (lv:LabelVersion)-[c:DECLARES_COMPONENT]->(t)
WHERE c.recordedTo IS NULL AND c.lineRole = 'BLEND_MEMBER' AND c.amount IS NULL
  AND ($ingredient IS NULL OR t.uid = $ingredient)
MATCH (lv)-[tot:DECLARES_COMPONENT]->() WHERE tot.recordedTo IS NULL AND tot.lineRole = 'BLEND_TOTAL' AND tot.orderIndex = c.parentOrderIndex
MATCH (p:Product)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk)-[r:HAS_LABEL_VERSION]->(lv)
WHERE r.recordedTo IS NULL AND r.validTo IS NULL
RETURN p.uid, p.name, c.declaredNameVerbatim, tot.declaredNameVerbatim AS blend, tot.amount AS blendTotal, tot.unitCode
```

The regulatory basis (21 CFR 101.36(c)) is cited as a D8 source locator in the answer, not stored on the product.
- trace: each line's own Assertion (DSLD nestedRows quantity 0 / unit NP locator) and the label TRACE.
- bitemporal episode needed on: `HAS_LABEL_VERSION`.

## Q-D6-09

- kind: cypher (computed) + assessment
- pattern: maximum declared daily intake = maxDailyServings × line amount, compared with a D5 safety reference; a label change that raised it is found by diffing successive versions. The comparison verdict is a kernel Assessment (`D6.max-intake-vs-reference`, conclusionCode EXCEEDS_REFERENCE | WITHIN_REFERENCE | NO_REFERENCE; effectDirection HARM only when the assessment is also ABOUT a D5 target — kernel rule).

```cypher
MATCH (pk:Package {uid: $package})-[r:HAS_LABEL_VERSION]->(lv:LabelVersion)-[c:DECLARES_COMPONENT]->(t)
WHERE r.recordedTo IS NULL AND c.recordedTo IS NULL AND c.amount IS NOT NULL AND t.uid = $material
OPTIONAL MATCH (ul:Assertion {predicate: 'HAS_UPPER_LIMIT'})-[:HAS_SUBJECT]->(ref) WHERE ref.uid IN $referenceSubjects  // D5
WITH r, lv, c, ul, c.amount * coalesce(lv.maxDailyServings, 1) AS maxDaily
OPTIONAL MATCH (as:Assessment {assessmentSubkind: 'D6.max-intake-vs-reference'})-[:ASSESSES]->(lv) WHERE as.recordedTo IS NULL
RETURN lv.uid, r.validFrom, lv.maxDailyServings, maxDaily, c.unitCode, c.massBasis, ul.valueNumber AS reference, ul.unitCode,
       as.conclusionCode, as.effectDirection, as.summary
ORDER BY r.validFrom
```

FC-1: 300 mg × 1 → 300 mg × 3 between V09.2 and V12.3; the brand's "tested as safe up to 2,000mg/day" is a claim occurrence (Q-D6-18), not a reference.
- trace: label TRACE; D5 reference TRACE; Assessment DERIVED_FROM both.
- bitemporal episode needed on: `HAS_LABEL_VERSION`.

## Q-D6-10

- kind: cypher
- pattern: allergen lists and per-component statements of the current declaration(s) of an item, with the as-of statement and the asserting source; differences between sources flagged.

```cypher
MATCH (p:Product {uid: $product})-[:HAS_VARIANT]->(v)-[:HAS_PACKAGE]->(pk)-[r:HAS_LABEL_VERSION]->(lv:LabelVersion)
WHERE r.recordedTo IS NULL AND r.validTo IS NULL
MATCH (a:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(src)
OPTIONAL MATCH (lv)-[c:DECLARES_COMPONENT]->() WHERE c.statementVerbatim IS NOT NULL
RETURN v.jurisdiction, lv.uid, src.uid AS declaredBy, lv.containsAllergens, lv.mayContainAllergens, lv.asOfStatementVerbatim,
       collect({component: c.declaredNameVerbatim, statement: c.statementVerbatim}) AS perComponent
// client-side: flag when two open episodes (brand vs crowd database) disagree on containsAllergens
```

Filter form ("products containing no SESAME"): `WHERE NOT 'SESAME' IN lv.containsAllergens AND NOT 'SESAME' IN coalesce(lv.mayContainAllergens, [])`.
- trace: label TRACE ("Contains: Egg, Soy, Wheat." locator; David "May Contain" locator; OFF record locator).
- bitemporal episode needed on: `HAS_LABEL_VERSION`.

## Q-D6-11

- kind: cypher
- pattern: what organization O declares per prepared-food item (energy, nutrients with %DV, ingredients per component, preparation notes, as-of), and competing declarations for the same item.

```cypher
MATCH (o:Organization {uid: $org})-[:OWNS_BRAND]->(b)<-[bb:BRANDED_AS]-(p:Product {productKind: 'PREPARED_FOOD'})
WHERE bb.recordedTo IS NULL
MATCH (p)-[:HAS_VARIANT]->(v {jurisdiction: $J})-[:HAS_PACKAGE]->(pk)-[r:HAS_LABEL_VERSION]->(lv) WHERE r.recordedTo IS NULL
MATCH (decl:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(declarer)
MATCH (lv)-[c:DECLARES_COMPONENT]->(t) WHERE c.recordedTo IS NULL
OPTIONAL MATCH (prep:Assertion {predicate: 'PREPARED_WITH'})-[:HAS_SUBJECT]->(lv)
OPTIONAL MATCH (p)-[:HAS_REFERENCE_FOOD]->(ref)                      // D12 seam: reference composition, never merged
RETURN p.name, lv.uid, declarer.uid, declarer = o AS selfDeclared, lv.asOfStatementVerbatim,
       collect({line: c.declaredNameVerbatim, role: c.lineRole, parent: c.parentOrderIndex, amount: c.amount, unit: c.unitCode, dv: c.dailyValuePercent}) AS lines,
       collect(DISTINCT prep.valueString) AS preparation, ref.uid AS referenceFood
```

- trace: label TRACE (McDonald's page text locators; "correct as of January 2022"), D12 reference TRACE.
- bitemporal episode needed on: `HAS_LABEL_VERSION`, `BRANDED_AS`.

## Q-D6-12

- kind: cypher
- pattern: products from named organizations whose latest declaration states ≥ X %DV of sodium / saturated fat / added sugars per serving (computed filter; no stored "unhealthy" flag).

```cypher
MATCH (n {uid: $nutrient})<-[c:DECLARES_COMPONENT]-(lv:LabelVersion)          // D1 Constituent (sodium)
WHERE c.recordedTo IS NULL AND c.dailyValuePercent >= $threshold AND c.amountBasis IN ['PER_SERVING', 'PER_ITEM']
MATCH (p:Product)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk)-[r:HAS_LABEL_VERSION]->(lv)
WHERE r.recordedTo IS NULL AND r.validTo IS NULL AND p.productKind IN $kinds
MATCH (p)-[bb:BRANDED_AS]->(b)<-[:OWNS_BRAND]-(org) WHERE bb.recordedTo IS NULL AND bb.validTo IS NULL
RETURN org.uid, p.name, c.amount, c.unitCode, c.dailyValuePercent, lv.asOfStatementVerbatim
ORDER BY c.dailyValuePercent DESC
```

- trace: label TRACE per row (Big Mac sodium line "1060milligrams", %DV).
- bitemporal episode needed on: `HAS_LABEL_VERSION`, `BRANDED_AS`.

## Q-D6-13

- kind: cypher
- pattern: price series for a product grouped by subject level and observer: seller prices on Offers, tracker aggregates on MerchantListings, and published reference prices (`MARKET_REFERENCE_PRICE`) on the Product, ProductVariant or Package; method-change markers are `PRICE_SERIES_METHOD_CHANGE` assertions by the same observer on the same subject.

```cypher
MATCH (p:Product {uid: $product})-[:HAS_VARIANT]->(v)-[:HAS_PACKAGE]->(pk)
OPTIONAL MATCH (pk)<-[lf:LISTING_FOR]-(l:MerchantListing) WHERE lf.recordedTo IS NULL
OPTIONAL MATCH (l)-[:HAS_OFFER]->(o:Offer)
WITH p, collect(DISTINCT v) + collect(DISTINCT pk) + collect(DISTINCT l) + collect(DISTINCT o) + [p] AS scope
UNWIND scope AS s
MATCH (pr:Assertion)-[:HAS_SUBJECT]->(s)
WHERE (pr.predicate STARTS WITH 'OFFER_PRICE_' OR pr.predicate = 'MARKET_REFERENCE_PRICE') AND pr.recordedTo IS NULL
MATCH (pr)-[:ASSERTED_BY]->(observer)
MATCH (pr)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)
WITH s, pr, observer, coalesce(pr.validFrom, pr.validObservedAt, min(coalesce(snap.observedAt, snap.retrievedAt))) AS at
OPTIONAL MATCH (mc:Assertion {predicate: 'PRICE_SERIES_METHOD_CHANGE'})-[:HAS_SUBJECT]->(s)
WHERE mc.recordedTo IS NULL AND EXISTS { (mc)-[:ASSERTED_BY]->(observer) }
RETURN labels(s)[0] AS level, s.uid, observer.uid, pr.predicate,
       [q IN coalesce(pr.qualifiers, []) WHERE q STARTS WITH 'sellerClass='] AS sellerClass,
       collect({at: at, amount: pr.valueNumber, cur: pr.unitCode}) AS series,
       collect(DISTINCT {changedAt: mc.validFrom, note: mc.valueString}) AS methodChanges
```

FC-4: Economist US Big Mac price, `MARKET_REFERENCE_PRICE` on the US served-portion Package, asserter The Economist, method change July 2022 (four-city average → McDonald's-provided price) as `PRICE_SERIES_METHOD_CHANGE` on the same Package (fixture d05–d09).
- trace: each point TRACEs to its CSV row locator (TEXT_POSITION/CSV row) on the dated snapshot of the dataset.
- bitemporal episode needed on: none (instants on Assertions); `LISTING_FOR` for the listing→package join.

## Q-D6-14

- kind: cypher
- pattern: kits/multipacks and their components via the predicate-only CONTAINS_PACKAGE assertion (quantity qualifier), with per-unit comparison computed at query time.

```cypher
MATCH (kit:Package) WHERE kit.packageKind IN ['KIT', 'MULTIPACK', 'BUNDLE']
MATCH (a:Assertion {predicate: 'CONTAINS_PACKAGE'})-[:HAS_SUBJECT]->(kit)
MATCH (a)-[:HAS_OBJECT]->(comp:Package)
WITH kit, comp, toInteger(head([q IN a.qualifiers WHERE q STARTS WITH 'quantity=' | substring(q, 9)])) AS qty
CALL (kit) { MATCH (:MerchantListing)-[:LISTING_FOR]->(kit) RETURN count(*) AS kitListings }
RETURN kit.uid, kit.componentSummary, comp.uid, qty, comp.unitCount * qty AS totalUnits
// per-unit price: PRICE(o_kit) / totalUnits vs PRICE(o_comp) / comp.unitCount (same pattern as Q-D6-02)
```

- trace: CONTAINS_PACKAGE Assertion TRACE (Shopify `-KIT` SKU and barcode locator).
- bitemporal episode needed on: none.

## Q-D6-15

- kind: cypher (+ assessment read)
- pattern: identifier clusters per package from kernel HAS_IDENTIFIER episodes (first/last valid per identifier, issuer), with equivalence Assessments for contested identifiers (malformed tracker EAN, retailer codes).

```cypher
MATCH (pk:Package {uid: $package})-[h:HAS_IDENTIFIER]->(id:Identifier)
OPTIONAL MATCH (l:MerchantListing)-[lf:LISTING_FOR]->(pk)
OPTIONAL MATCH (l)-[hl:HAS_IDENTIFIER]->(lid:Identifier)
OPTIONAL MATCH (as:Assessment {assessmentSubkind: 'D6.identifier-equivalence'})-[:ASSESSES]->(pk)
RETURN id.scheme, id.issuer, id.name AS printed, h.validFrom, h.validTo, h.isPrimary, h.recordedFrom,
       collect(DISTINCT {listing: l.hostItemId, scheme: lid.scheme, value: lid.name, from: lf.validFrom, to: lf.validTo}) AS listingIds,
       collect(DISTINCT {verdict: as.conclusionCode, summary: as.summary, status: as.status}) AS equivalence
ORDER BY h.validFrom
```

FC-1/2/3: GTIN 850015311116 (DSLD 2023 and 2025 labels, iHerb 120467) and 850015311857 (brand store from ≤ 2025-05-20, Amazon, iHerb 162274) on the same 30-count Package; the 90-count's 856029008554 (DSLD) vs 850015311895 (brand) is an equivalence question, not a merge.
- trace: HAS_IDENTIFIER episode Assertion TRACE per identifier.
- bitemporal episode needed on: kernel `HAS_IDENTIFIER` (IdentifierLinkProperties), `LISTING_FOR`.

## Q-D6-16

- kind: cypher
- pattern: roles of organization O toward products, each role from its own edge or predicate, with source and valid time: brand owner (D7 OWNS_BRAND → BRANDED_AS), label responsible party (NAMES_RESPONSIBLE_PARTY + role, on O itself or on a subsidiary reached through D7 PARENT_OF — the Tru Niagen label names ChromaDex, Inc., a subsidiary of Niagen Bioscience, Inc.), seller of record (SELLER_OF_RECORD), stated channel (SOLD_THROUGH_CHANNEL, subject Product), manufacturer (predicate MANUFACTURES: subject Organization, object Product, as D6 and D7 register it).

```cypher
MATCH (o:Organization {uid: $org})
CALL (o) {
  MATCH (o)-[ob:OWNS_BRAND]->(b)<-[bb:BRANDED_AS]-(p:Product) WHERE ob.recordedTo IS NULL AND bb.recordedTo IS NULL
  RETURN p, 'BRAND_OWNER' AS role, bb.assertionUid AS basis, bb.validFrom AS since, bb.validTo AS until
  UNION
  MATCH (o)-[:PARENT_OF*0..2]->(party:Organization)                                 // D7 control edge (0 hops = O itself)
  MATCH (lv:LabelVersion)-[n:NAMES_RESPONSIBLE_PARTY]->(party) WHERE n.recordedTo IS NULL   // AssertedRecordedProperties
  MATCH (p:Product)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->()-[:HAS_LABEL_VERSION]->(lv)
  RETURN p, 'LABEL_' + lv.responsiblePartyRole + CASE WHEN party = o THEN '' ELSE '_VIA_SUBSIDIARY' END AS role,
         n.assertionUid AS basis, null AS since, null AS until
  UNION
  MATCH (offer:Offer)-[s:SELLER_OF_RECORD]->(o) WHERE s.recordedTo IS NULL
  MATCH (offer)<-[:HAS_OFFER]-(:MerchantListing)-[:LISTING_FOR]->(:Package)<-[:HAS_PACKAGE]-(:ProductVariant)<-[:HAS_VARIANT]-(p:Product)
  RETURN p, 'SELLER_OF_RECORD' AS role, s.assertionUid AS basis, s.validFrom AS since, s.validTo AS until
  UNION
  MATCH (a:Assertion {predicate: 'SOLD_THROUGH_CHANNEL'})-[:HAS_OBJECT|ASSERTED_BY]->(o)
  MATCH (a)-[:HAS_SUBJECT]->(p:Product)
  RETURN p, 'STATED_CHANNEL' AS role, a.uid AS basis, a.validFrom AS since, a.validTo AS until
  UNION
  MATCH (a:Assertion {predicate: 'MANUFACTURES'})-[:HAS_SUBJECT]->(o)               // subject Organization, object Product
  MATCH (a)-[:HAS_OBJECT]->(p:Product)
  RETURN p, 'MANUFACTURER' AS role, a.uid AS basis, a.validFrom AS since, a.validTo AS until
}
RETURN p.uid, p.name, role, basis, since, until ORDER BY p.name, role
```

Reseller of partner products (Blueprint "Partnership" items) shows as SELLER_OF_RECORD without BRAND_OWNER.
- trace: every `basis` is an Assertion uid → TRACE.
- bitemporal episode needed on: `BRANDED_AS`, `SELLER_OF_RECORD` (and D7's OWNS_BRAND, PARENT_OF).

## CQ-CM-04

- kind: cypher (cross-module: D9 tracked links, D7 financial interest)
- pattern: tracked links pointing at a product's offers or listings (D9 predicate-only LINKS_TO_OFFER: subject a D9 MediaWork, object the D6 Offer or MerchantListing, qualifier linkKind), the publishing media actor (the link Assertion's asserter), and the actor's value or stake ties to the brand owner (D7).

```cypher
MATCH (p:Product {uid: $product})-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk)<-[:LISTING_FOR]-(l:MerchantListing)
OPTIONAL MATCH (l)-[:HAS_OFFER]->(o:Offer)
MATCH (link:Assertion {predicate: 'LINKS_TO_OFFER'})-[:HAS_OBJECT]->(x) WHERE x = l OR x = o   // D9 predicate (check stage)
MATCH (link)-[:HAS_SUBJECT]->(work:MediaWork)                                                // D9
OPTIONAL MATCH (link)-[:ASSERTED_BY]->(actor)
OPTIONAL MATCH (actor)-[fi:RECEIVES_VALUE_FROM|HOLDS_STAKE|HOLDS_ROLE]->(owner:Organization)-[:OWNS_BRAND]->(:Brand)<-[:BRANDED_AS]-(p)  // D7
RETURN link.uid, link.qualifiers AS linkKind, x.uid, work.uid, actor.uid, type(fi) AS tie, fi.valueKind, fi.validFrom, fi.validTo
```

- trace: D9 link Assertion TRACE (sponsor page locator, CDX row); D7 tie TRACE (its assertionUid). Disclosure (was the tie stated in the work?) is a D9/D7 claim-occurrence question, not an edge property.
- bitemporal episode needed on: `LISTING_FOR`, `BRANDED_AS` (D7/D9 own theirs).

## Q-D6-17

- kind: cypher
- pattern: subscription offers on a listing with current terms (property) and the history of term statements (OFFER_SUBSCRIPTION_TERMS assertions per capture).

```cypher
MATCH (l:MerchantListing {uid: $listing})-[:HAS_OFFER]->(o:Offer)
WHERE o.purchaseMode IN ['SUBSCRIPTION', 'ONE_TIME_OR_SUBSCRIPTION']
OPTIONAL MATCH (t:Assertion {predicate: 'OFFER_SUBSCRIPTION_TERMS'})-[:HAS_SUBJECT]->(o)
RETURN o.uid, o.subscriptionApp, o.subscriptionTermsVerbatim,
       collect({assertion: t.uid, terms: t.valueString}) AS termsHistory   // instant per OBSERVED_AT(t)
```

FC-3: 2025-05-20 archive "Delivered every month and get 20% off future orders." vs current terms.
- trace: each terms Assertion TRACE (Shopify `selling_plan_groups` locator on live and archived snapshots).
- bitemporal episode needed on: none.

## CQ-AX-19

- kind: cypher (cross-module: D8 measured results)
- pattern: for a lot (D8) of a variant: measured vs declared per ingredient — D8 QualityResult rows joined to the label version valid at the lot's manufacture date.

```cypher
MATCH (lot:Lot {uid: $lot})-[:LOT_OF]->(v:ProductVariant)-[:HAS_PACKAGE]->(pk)-[r:HAS_LABEL_VERSION]->(lv)
WHERE r.recordedTo IS NULL AND (r.validFrom IS NULL OR r.validFrom <= lot.manufacturedAt) AND (r.validTo IS NULL OR r.validTo > lot.manufacturedAt)
MATCH (lv)-[c:DECLARES_COMPONENT]->(t) WHERE c.recordedTo IS NULL
OPTIONAL MATCH (qr:QualityResult)-[:QUALITY_RESULT_FOR]->(lot) WHERE (qr)-[:MEASURES_ANALYTE]->(t)   // D8 seam (D8 renamed RESULT_FOR -> QUALITY_RESULT_FOR, OQ-D8-30)
RETURN t.uid, c.amount AS declared, c.unitCode, qr.value AS measured, qr.unitCode AS measuredUnit, qr.valueQualifier,
       qr.percentOfLabelClaimStated, qr.method, qr.resultBasis, qr.uid
```

"No measurement" when qr is null. No measurement is ever stored on a D6 type.
- trace: label TRACE; D8 result TRACE (COA / test report locator).
- bitemporal episode needed on: `HAS_LABEL_VERSION`.

## CQ-PF-03

- kind: cypher (+ assessment)
- pattern: certification scope (D8 CertificationListing COVERS Product / ProductVariant / Lot with coverageKind; package sizes only in scopeVerbatim until D8 accepts D6.Package, OQ-D6-13) against the seals printed on each label version and listing claims; verdict per claim is an Assessment (`D6.certification-scope`).

```cypher
MATCH (p:Product {uid: $product})-[:HAS_VARIANT]->(v)-[:HAS_PACKAGE]->(pk)-[r:HAS_LABEL_VERSION]->(lv:LabelVersion)
WHERE r.recordedTo IS NULL
OPTIONAL MATCH (cert:CertificationListing)-[cv:COVERS]->(x) WHERE x IN [p, v]   // D8 seam (CertificationCoverageTarget)
OPTIONAL MATCH (as:Assessment {assessmentSubkind: 'D6.certification-scope'})-[:ASSESSES]->(lv) WHERE as.recordedTo IS NULL
RETURN lv.uid, r.validFrom, r.validTo, lv.seals, collect(DISTINCT {cert: cert.uid, programme: cert.programme, coverageKind: cert.coverageKind, scope: cert.scopeVerbatim,
       from: cv.validFrom, to: cv.validTo}) AS certifications, as.conclusionCode AS verdict, as.summary
```

FC-1: V09.2 prints "NSF Certified for Sport"; V12.3 drops it; NSF listing 1263423 states Package Size 30, 60, 90, Lot # All, Country United States.
- trace: label TRACE (seals locator), D8 listing TRACE, Assessment evidence.
- bitemporal episode needed on: `HAS_LABEL_VERSION` (and D8's COVERS).

## CQ-PF-02

- kind: cypher (claim + adjudication)
- pattern: listing statements (title amounts, "New formulation") as claim occurrences with the listing as subject; the verdict is the kernel SUPPORT Adjudication of the claim occurrence (no separate D6 Assessment: the subkind `D6.label-claim-match` was dropped in the adversarial-review stage), whose evidence must include composition evidence for the GTIN the listing resolves to that is not the retailer's own copy (brand panel, brand-sold marketplace listing, registry entry for that GTIN); label versions of a predecessor GTIN are CONTEXT only.

```cypher
MATCH (l:MerchantListing {uid: $listing})
MATCH (co:Assertion {assertionKind: 'CLAIM'})-[:HAS_SUBJECT]->(l)
OPTIONAL MATCH (l)-[lf:LISTING_FOR]->(pk:Package) WHERE lf.recordedTo IS NULL
OPTIONAL MATCH (pk)-[r:HAS_LABEL_VERSION]->(lv:LabelVersion) WHERE r.recordedTo IS NULL
OPTIONAL MATCH (adj:Adjudication {adjudicationKind: 'SUPPORT'})-[:ASSESSES]->(co)
OPTIONAL MATCH (adj)-[e:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
RETURN co.predicate, co.proposition, collect(DISTINCT {label: lv.uid, composition: lv.compositionDigest, from: r.validFrom}) AS labels,
       adj.verdict, adj.rationale, collect(DISTINCT {role: e.role, source: src.canonicalUri, quote: loc.exact}) AS evidence
```

FC-2: "New formulation available now" (iHerb 120467 → 162274, UPC 850015311116 → 850015311857) vs the brand's product-page Supplement Facts and the brand-sold Amazon listing for UPC 850015311857 (same composition as the old package; DSLD labels carry the old UPC, CONTEXT) → NOT_SUPPORTED; the packaging/GTIN change is the D6.change-kind Assessment PACKAGE_ONLY (CQ-ID-05).
- trace: claim occurrence TRACE (iHerb locator), the Adjudication's HAS_EVIDENCE locators (CONTRADICTS on the brand panel and the brand-sold listing; CONTEXT on predecessor labels; QUALIFIES on the retailer disclaimer).
- bitemporal episode needed on: `LISTING_FOR`, `HAS_LABEL_VERSION`.

## Q-D6-18

- kind: cypher + fulltext
- pattern: claim occurrences whose subject is the product, its variants, packages, label versions or listings, grouped by channel (source host) and date, with each claim's vetting/mission status (kernel).

```cypher
CALL db.index.fulltext.queryNodes('product_text', $q) YIELD node AS p0, score WHERE p0:Product
WITH p0 AS p ORDER BY score DESC LIMIT 1
MATCH (p)-[:HAS_VARIANT*0..1]->(x0)
WITH p, collect(x0) AS xs
OPTIONAL MATCH (p)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk)
OPTIONAL MATCH (pk)-[:HAS_LABEL_VERSION]->(lv)
OPTIONAL MATCH (l:MerchantListing)-[:LISTING_FOR]->(pk)
WITH p, xs, collect(DISTINCT pk) AS pks, collect(DISTINCT lv) AS lvs, collect(DISTINCT l) AS ls   // aggregate first, then concatenate
WITH p, xs + pks + lvs + ls AS scope
UNWIND scope AS s
MATCH (co:Assertion {assertionKind: 'CLAIM'})-[:HAS_SUBJECT]->(s)
MATCH (co)-[:OCCURRENCE_OF]->(cl:Claim)
MATCH (co)-[:HAS_EVIDENCE]->(loc)<-[:HAS_LOCATOR]-(snap)<-[:HAS_SNAPSHOT]-(src:Source)
RETURN cl.uid, cl.lifecycleState, src.canonicalUri, snap.retrievedAt, loc.exact ORDER BY cl.uid, snap.retrievedAt
```

- trace: inline (locator per occurrence); mission status through the Claim's Assessments and Reports (kernel).
- bitemporal episode needed on: none.

## Q-D6-19

- kind: cypher
- pattern: discontinuation and successor assertions per source (retailer, registry, brand) with dates; disagreements shown.

```cypher
MATCH (p:Product {uid: $product})-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk)
OPTIONAL MATCH (l:MerchantListing)-[lf:LISTING_FOR]->(pk)
WITH p, collect(DISTINCT pk) + collect(DISTINCT l) + [p] AS scope
UNWIND scope AS s
MATCH (a:Assertion)-[:HAS_SUBJECT]->(s)
WHERE a.predicate IN ['RETAILER_DISCONTINUED', 'SUCCEEDED_BY', 'OFF_MARKET'] AND a.recordedTo IS NULL   // OFF_MARKET: DSLD offMarket, asserter NIH ODS (05 predicateOnly)
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(successor)
MATCH (a)-[:ASSERTED_BY]->(who)
RETURN labels(s)[0], s.uid, a.predicate, successor.uid, who.uid, a.validFrom ORDER BY a.validFrom
```

- trace: TRACE per assertion (iHerb title "(Discontinued Item)", DSLD offMarket field).
- bitemporal episode needed on: `LISTING_FOR` (the successor listing's episode opens).

## Q-D6-20

- kind: cypher (+ vector entry for the filing text)
- pattern: filing assertions about channels/segments for the company's products beside observed offers by host per period.

```cypher
MATCH (o:Organization {uid: $company})-[:OWNS_BRAND]->(b)<-[:BRANDED_AS]-(p:Product)
OPTIONAL MATCH (stated:Assertion {predicate: 'SOLD_THROUGH_CHANNEL'})-[:HAS_SUBJECT]->(p)
OPTIONAL MATCH (stated)-[:HAS_OBJECT]->(channel)
OPTIONAL MATCH (stated)-[:HAS_EVIDENCE]->(sloc)<-[:HAS_LOCATOR]-(ssnap)
WITH o, p, collect(DISTINCT {channel: channel.uid, quote: sloc.exact, filed: ssnap.publishedAt}) AS statedChannels
OPTIONAL MATCH (p)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk)<-[lf:LISTING_FOR]-(l:MerchantListing)-[:HAS_OFFER]->(off:Offer)
WHERE lf.recordedTo IS NULL AND (lf.validTo IS NULL OR lf.validTo > $periodStart) AND (lf.validFrom IS NULL OR lf.validFrom < $periodEnd)
OPTIONAL MATCH (off)-[s:SELLER_OF_RECORD]->(seller) WHERE s.recordedTo IS NULL
RETURN p.name, statedChannels, collect(DISTINCT {host: l.hostDomain, seller: seller.uid, sellerIsOwner: seller = o}) AS observedChannels
```

Unstructured entry (00-DIRECTIVE 3.8, fixture `filing-channels-niagen-10k`): question text → D9 vector index over 10-K chunks (or `(ch:Chunk)-[:MENTIONS]->(p)` derived) → the Assertions whose HAS_EVIDENCE locators fall inside those chunks' spans → locator → snapshot bytes; the verifier re-selects the same spans by quote + offsets on the same DocumentTextVersion.
- trace: inline (filing locators; offers TRACE through SELLER_OF_RECORD and price assertions).
- bitemporal episode needed on: `LISTING_FOR`, `SELLER_OF_RECORD`, `BRANDED_AS`.

## Q-D6-21

- kind: cypher (cross-module: D8/D13 hazard records)
- pattern: products currently on sale whose current label declares a material that is the subject of a recent recall/outbreak/import alert, and their current offers.

```cypher
MATCH (hz:RegulatoryRecord {recordFamily: 'ENFORCEMENT'})-[:CONCERNS]->(m:IngredientMaterial)   // D8 seam (RegulatoryRecordTopic includes IngredientMaterial)
WHERE hz.issuedAt >= datetime() - duration({days: $days})
MATCH (lv:LabelVersion)-[c:DECLARES_COMPONENT]->(m) WHERE c.recordedTo IS NULL
MATCH (p:Product)-[:HAS_VARIANT]->()-[:HAS_PACKAGE]->(pk)-[r:HAS_LABEL_VERSION]->(lv)
WHERE r.recordedTo IS NULL AND r.validTo IS NULL
OPTIONAL MATCH (l:MerchantListing)-[lf:LISTING_FOR]->(pk) WHERE lf.recordedTo IS NULL AND lf.validTo IS NULL
OPTIONAL MATCH (l)-[:HAS_OFFER]->(o:Offer)
RETURN hz.uid, m.uid, p.uid, p.name, collect(DISTINCT l.hostDomain) AS channels, count(o) AS offers
```

- trace: hazard record TRACE (FDA outbreak page), label TRACE, listing TRACE.
- bitemporal episode needed on: `HAS_LABEL_VERSION`, `LISTING_FOR`.

## Q-D6-22

- kind: cypher (published read) — the avoidance report is a K Report composed by D10
- pattern: read the avoidance report for target T and its cited items; composing it unions Q-D6-04 (recalled), Q-D6-09 (max intake over reference, Assessment effectDirection HARM), Q-D6-08 (blend-only dosing), CQ-PF-03 (unsupported certification claims), Q-D6-06 (unauthorized sellers) over the candidate set from INTENDED_FOR_TARGET assertions.

```cypher
// D10 shape (check stage, against A1's D10 packet): the avoid-list is published as HARMS_AND_AVOIDANCE rows of a
// COMPARISON (or PROFILE) Report about target T; rows are D10 ReportItems ABOUT the product, with BLOCKED disposition
// and BLOCKED_BY / DERIVED_FROM citations. No new ReportKind (A1: Report.skeletonKey distinguishes skeletons).
MATCH (tg {uid: $target})<-[:ASSESSES]-(rep:Report)
WHERE rep.reportKind IN ['COMPARISON', 'PROFILE'] AND rep.recordedTo IS NULL
MATCH (rep)-[:HAS_ITEM]->(row:ReportItem {itemKind: 'ROW'})
WHERE EXISTS { (rep)-[:HAS_ITEM]->(:ReportItem {itemKind: 'SECTION', sectionKind: 'HARMS_AND_AVOIDANCE', itemKey: row.parentItemKey}) }
MATCH (row)-[:ASSESSES]->(item)
WHERE item:Product OR item:ProductVariant OR item:Package OR item:Offer
OPTIONAL MATCH (row)-[:DERIVED_FROM|BLOCKED_BY]->(basis)
RETURN rep.uid, rep.skeletonKey, row.itemKey, row.disposition, row.reason, item.uid,
       collect(DISTINCT {kind: labels(basis)[0], uid: basis.uid, effectDirection: basis.effectDirection}) AS cited
```

(OQ-D6-10 resolved in the check stage: Q-D6-03 is a COMPARISON report; Q-D6-22 is the HARMS_AND_AVOIDANCE section of a COMPARISON or PROFILE report, per A1's D10 packet `report-skeletons.md`.)
- trace: ReportItem DERIVED_FROM / BLOCKED_BY assertions and assessments, Report HAS_EVIDENCE locators; each TRACEs.
- bitemporal episode needed on: none new.

## GDS and vector patterns considered

- GDS node similarity over label composition (products that look alike by declared components) — not adopted: no question in `02-questions.md` needs it. If Q-D6-03 later ranks "alternatives to X", the projection would be `gds.graph.project('d6-composition', ['LabelVersion','IngredientMaterial','Constituent'], {DECLARES_COMPONENT: {properties: 'amount'}})` restricted to open label episodes, `gds.nodeSimilarity.stream` (Jaccard, topK 10), refreshed nightly, written back as a D10 derived edge with `DerivedEdgeProperties` (method `d6-composition-similarity/v1`) — never as a D6 stored fact.
- Vector: none on D6 nodes. Text retrieval for filings, recall pages and listing copy uses D9's chunk vector index; D6 names are in the `product_text` fulltext index for entity entry.

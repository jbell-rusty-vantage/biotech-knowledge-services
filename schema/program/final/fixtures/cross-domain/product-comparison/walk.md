# Fixture product-comparison: walk through the candidate schema

This file walks the fixture through `final/schema/final_biotech_schema_v2.graphql` (schema digest `sha256:d233930272c7aaa75d9aac21103e83448bd96a79d1106c4749fb807f257dd705`). Every result below was produced by a command in `final/_runlog/xfx-product.md`. Nothing here is a hand-typed expected value. Research only, not medical advice.

## 1. What was loaded and how

- **Records.** `assertions.yaml` and `locators.yaml` were turned into Cypher by the scratch script `bin/emit.py` (written to `load.cypher`, 1,349 statements). The labels are the candidate's `@node(labels: …)` values. Edge directions and edge-property names come from the candidate IR. Every node carries `fixture:'xfx-product'`, so the load deletes and re-creates only its own records.
- **Database.** Disposable Neo4j 5.26 Community, container `bks-neo4j-synth`. The load command was `docker exec bks-neo4j-synth cypher-shell -f /tmp/xfx-product-load.cypher`. It exited 0.
- **What the load created.** 327 nodes and 1,020 relationships of 22 node types:
  - 111 Assertion, 77 SourceLocator, 14 SourceSnapshot and 14 Source
  - 31 Identifier and 19 Lot
  - 9 Organization, 8 ReportItem, 5 DecisionCriterion and 5 Assessment
  - 4 LabelVersion and 4 Package
  - 3 each of Activity, Agent, Product, ProductVariant, IngredientMaterial, ChemicalSubstance and CertificationListing
  - 2 MerchantListing and 2 Offer
  - 1 Report
- **Typed relationships written.** Every one of these types and endpoint pairs exists in the candidate IR. `bin/build_fixture.py` checks that before anything is written.
  - D6: `DECLARES_COMPONENT` ×4, `HAS_LABEL_VERSION` ×4, `HAS_VARIANT` ×3, `HAS_PACKAGE` ×4, `NAMES_RESPONSIBLE_PARTY` ×3, `HAS_OFFER` ×2 and `LISTING_FOR` ×2.
  - D1: `REALIZES_SUBSTANCE` ×3 and `HAS_ACTIVE_MOIETY` ×2.
  - D8: `COVERS` ×21, `LOT_OF` ×19 and `ISSUED_BY` ×3.
  - D10: `USES_CRITERION` ×5 and `HAS_ITEM` ×8.
  - Kernel: `HAS_SUBJECT`, `HAS_OBJECT`, `ASSERTED_BY`, `HAS_EVIDENCE`, `DERIVED_FROM`, `ASSESSES`, `HAS_IDENTIFIER`, `HAS_SNAPSHOT`, `HAS_LOCATOR`, `WAS_GENERATED_BY`, `WAS_ASSOCIATED_WITH` and `WAS_INFORMED_BY`.
- **How the walk was run.** `bin/run_walk.py` ran each query below through `cypher-shell --format plain`, with the parameter `$T` where a query needs one. The times shown include `docker exec` and `cypher-shell` start-up. They are not query latencies.

**The path in one line:**

```
Product -HAS_VARIANT-> ProductVariant -HAS_PACKAGE-> Package -HAS_LABEL_VERSION{episode, as of T}-> LabelVersion
  -DECLARES_COMPONENT{amount, unitCode, massBasis, assertionUid}-> IngredientMaterial -REALIZES_SUBSTANCE-> ChemicalSubstance
  -HAS_ACTIVE_MOIETY-> ChemicalSubstance(NR, UNII 0I8H2M0L7N)
(Assertion PER_MAX_DAILY_DOSE_AMOUNT, CALCULATED) -HAS_SUBJECT-> LabelVersion, -HAS_OBJECT-> NR, -DERIVED_FROM-> inputs -HAS_EVIDENCE-> SourceLocator <-HAS_LOCATOR- SourceSnapshot
CertificationListing -COVERS{episode}-> Product | ProductVariant | Lot -LOT_OF-> Product
Report(COMPARISON) -USES_CRITERION-> DecisionCriterion(version) ; Report -HAS_ITEM-> ReportItem(ROW) -ASSESSES-> Product ; ReportItem -DERIVED_FROM-> Assertion | Assessment
```

## 2. Which products are options, as of T (D6 → D1)

The candidate set is every product whose label version in force at T declares a line whose material realizes nicotinamide riboside, or a salt whose active moiety is nicotinamide riboside. The label version in force is the latest `HAS_LABEL_VERSION` episode with `validFrom <= T` (here the DSLD entry date, a publication proxy; the predecessor's end is not stated, so "latest start" decides, as D6 does). The daily amount is read from the materialized CALCULATED Assertion; it is never recomputed here.

```cypher
WITH datetime($T) AS T
MATCH (nr:ChemicalSubstance {fixture:'xfx-product'})-[:HAS_IDENTIFIER]->(:Identifier {scheme:'UNII', value:'0I8H2M0L7N'})
MATCH (p:Product {fixture:'xfx-product'})-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(pk:Package)-[h:HAS_LABEL_VERSION]->(lv:LabelVersion)
WHERE h.validFrom <= T AND (h.validTo IS NULL OR h.validTo > T) AND h.recordedTo IS NULL
WITH T, nr, p, pk, h, lv ORDER BY h.validFrom DESC
WITH T, nr, p, pk, collect(lv)[0] AS lv
MATCH (lv)-[dc:DECLARES_COMPONENT]->(m:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(s:ChemicalSubstance)
WHERE dc.recordedTo IS NULL AND (s = nr OR EXISTS { (s)-[:HAS_ACTIVE_MOIETY]->(nr) })
OPTIONAL MATCH (day:Assertion {predicate:'PER_MAX_DAILY_DOSE_AMOUNT'})-[:HAS_SUBJECT]->(lv)
WHERE EXISTS { (day)-[:HAS_OBJECT]->(nr) }
RETURN p.name AS product, lv.labelVersionCode AS label, dc.amount AS amount, dc.unitCode AS unit, dc.massBasis AS massBasis,
       s.name AS realizes, day.valueNumber AS nrPerMaxDay, day.unitCode AS dayUnit, day.status AS dayStatus
ORDER BY product;
```

Result, T = 2026-10-09T05:00:00Z (exit 0, 2.69 s wall):

```
product, label, amount, unit, massBasis, realizes, nrPerMaxDay, dayUnit, dayStatus
"Liposomal Nicotinamide Riboside+", "Nr 23.2304.23L", 500, "mg", "UNSPECIFIED", "NICOTINAMIDE RIBOSIDE", NULL, NULL, NULL
"NiaCel 400", "SP654 LSP65404", 415, "mg", "SALT_FORM", "Nicotinamide riboside malate (PubChem CID 146673021)", 272.8, "mg/d", "PROPOSED"
"Tru Niagen", "V12.3", 300, "mg", "SALT_FORM", "NICOTINAMIDE RIBOSIDE CHLORIDE", 790.2, "mg/d", "ACCEPTED"
```

Result, T = 2024-06-01T00:00:00Z (exit 0, 3.00 s wall):

```
product, label, amount, unit, massBasis, realizes, nrPerMaxDay, dayUnit, dayStatus
"NiaCel 400", "SP654 LSP65403", 415, "mg", "SALT_FORM", "Nicotinamide riboside malate (PubChem CID 146673021)", 545.6, "mg/d", "PROPOSED"
```

- **Three mass bases on three labels.**
  - Tru Niagen declares the salt as such. The line says massBasis SALT_FORM, the material NIAGEN realizes NR chloride, and its active moiety is NR.
  - NiaCel 400 declares a different salt, NR hydrogen malate, at 415 mg. Its realization and moiety links are PROPOSED. They are BellLabs curation over PubChem; GSRS has no record of this salt.
  - Codeage declares "Nicotinamide Riboside" 500 mg with no salt. DSLD puts the moiety UNII on the row, so the material realizes NR itself, but the line's massBasis stays UNSPECIFIED. No daily amount exists for it, and the result shows NULL rather than 500.
- **As of 2024-06-01 only NiaCel appears.** Its label in force on that date is the previous version, SP654 LSP65403, at up to 2 capsules a day, which gives 545.6 mg/d. The other two products have no captured label version starting before that date. That means "unknown", not "not on the market".

## 3. Computed comparison under `bl:compare:nr-products@1` (Q-D10-01, Q-D6-03, Q-D8-19; directive 3.5)

The ranking is computed at query time from the versioned DecisionCriterion records. It is not stored as a fact.

The criteria are applied in their evaluationOrder:

1. BLOCK when no certification listing covers the option at T.
2. FILTER: the declared amount must convert to the NR moiety.
3. SCORE whether the covering listing names lots. This is the only criterion that orders.
4. A reported column: NR per maximum labeled day.
5. A reported column: price per 100 mg of NR. This query does not compute it; section 8 explains why every option is missing it.

A COVERS episode with an unknown start counts as holding only from its observation time. At an earlier T the gate is therefore "certification at T unknown", not BLOCKED and not passed.

```cypher
WITH datetime($T) AS T
MATCH (crit:DecisionCriterion {fixture:'xfx-product', criteriaSetKey:'bl:compare:nr-products', criteriaSetVersion:'1'})
WITH T, crit ORDER BY crit.evaluationOrder
WITH T, collect(crit.criterionKey + '@' + crit.version + ' ' + crit.criterionKind) AS criteria
MATCH (nr:ChemicalSubstance {fixture:'xfx-product'})-[:HAS_IDENTIFIER]->(:Identifier {scheme:'UNII', value:'0I8H2M0L7N'})
MATCH (p:Product {fixture:'xfx-product'})-[:HAS_VARIANT]->(v:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[h:HAS_LABEL_VERSION]->(lv:LabelVersion)
WHERE h.validFrom <= T AND (h.validTo IS NULL OR h.validTo > T) AND h.recordedTo IS NULL
WITH T, criteria, nr, p, v, h, lv ORDER BY h.validFrom DESC
WITH T, criteria, nr, p, collect(DISTINCT v) AS vs, collect(lv)[0] AS lv
MATCH (lv)-[dc:DECLARES_COMPONENT]->(:IngredientMaterial)-[:REALIZES_SUBSTANCE]->(s:ChemicalSubstance)
WHERE dc.recordedTo IS NULL AND (s = nr OR EXISTS { (s)-[:HAS_ACTIVE_MOIETY]->(nr) })
OPTIONAL MATCH (day:Assertion {predicate:'PER_MAX_DAILY_DOSE_AMOUNT'})-[:HAS_SUBJECT]->(lv)
WHERE EXISTS { (day)-[:HAS_OBJECT]->(nr) } AND day.status IN ['ACCEPTED', 'PROPOSED']
OPTIONAL MATCH (cl:CertificationListing {status:'LISTED'})-[cov:COVERS]->(x)
WHERE cov.recordedTo IS NULL AND (cov.validTo IS NULL OR cov.validTo > T)
  AND (x = p OR x IN vs OR EXISTS { MATCH (x)-[:LOT_OF]->(y) WHERE y = p OR y IN vs })
OPTIONAL MATCH (ca:Assertion {uid: cov.assertionUid})
// unknown coverage start: the episode is known to hold only from its observation (unknown is not absent, and not present either)
WITH T, criteria, p, lv, dc, day, cl, x, coalesce(cov.validFrom, ca.validObservedAt) <= T AS knownAtT
WITH T, criteria, p, lv, dc, day, cl, count(DISTINCT CASE WHEN knownAtT THEN x END) AS coveredAtT, count(DISTINCT x) AS coveredLater
WITH criteria, p, lv, dc, day,
     collect(CASE WHEN cl IS NOT NULL AND coveredAtT > 0 THEN cl.programme + coalesce(' ' + cl.standard, '') + ' ' + cl.coverageKind + ' x' + toString(coveredAtT) END) AS certs,
     collect(CASE WHEN cl IS NOT NULL AND coveredAtT > 0 THEN cl.coverageKind END) AS kinds,
     sum(CASE WHEN cl IS NOT NULL AND coveredAtT = 0 AND coveredLater > 0 THEN 1 ELSE 0 END) AS onlyObservedLater
WITH criteria, p, lv, dc, day, certs, kinds,
     CASE WHEN size(certs) = 0 AND onlyObservedLater > 0 THEN 'NOT_EVALUATED (certification at T unknown)'
          WHEN size(certs) = 0 THEN 'BLOCKED'
          WHEN day IS NULL THEN 'NOT_EVALUATED (no moiety amount)' ELSE 'RANKED' END AS gate,
     CASE WHEN 'LOT' IN kinds THEN 1 ELSE 0 END AS lotScore
ORDER BY CASE gate WHEN 'RANKED' THEN 0 ELSE 1 END, lotScore DESC, p.name
WITH criteria, collect({product: p.name, label: lv.labelVersionCode, declared: toString(dc.amount) + ' ' + dc.unitCode + ' ' + dc.massBasis, gate: gate, lotScore: lotScore,
                        nrPerMaxDay: day.valueNumber, dayStatus: day.status, certs: certs}) AS rows
WITH criteria, rows, [r IN rows WHERE r.gate = 'RANKED' | r.product] AS ranked
UNWIND rows AS r
RETURN r.product AS option, r.label AS label, r.declared AS declared, r.gate AS gate,
       CASE WHEN r.gate = 'RANKED' THEN [i IN range(0, size(ranked) - 1) WHERE ranked[i] = r.product][0] + 1 END AS rank,
       r.lotScore AS lotScore, r.nrPerMaxDay AS nrPerMaxDay, r.dayStatus AS dayStatus, r.certs AS certs, criteria;
```

Result, T = 2026-10-09T05:00:00Z (exit 0, 3.09 s wall):

```
option, label, declared, gate, rank, lotScore, nrPerMaxDay, dayStatus, certs, criteria
"NiaCel 400", "SP654 LSP65404", "415 mg SALT_FORM", "RANKED", 1, 1, 272.8, "PROPOSED", ["NSF Certified for Sport LOT x19"], ["bl:nr:block-no-current-certification@1 BLOCK", "bl:nr:declared-amount-convertible-to-moiety@1 FILTER", "bl:nr:lot-verifiable-certification@1 SCORE", "bl:nr:moiety-per-max-labeled-day@1 SCORE", "bl:nr:usd-per-100mg-moiety@1 SCORE"]
"Tru Niagen", "V12.3", "300 mg SALT_FORM", "RANKED", 2, 0, 790.2, "ACCEPTED", ["NSF Certified for Sport PRODUCT_ALL_SIZES x1"], ["bl:nr:block-no-current-certification@1 BLOCK", "bl:nr:declared-amount-convertible-to-moiety@1 FILTER", "bl:nr:lot-verifiable-certification@1 SCORE", "bl:nr:moiety-per-max-labeled-day@1 SCORE", "bl:nr:usd-per-100mg-moiety@1 SCORE"]
"Liposomal Nicotinamide Riboside+", "Nr 23.2304.23L", "500 mg UNSPECIFIED", "NOT_EVALUATED (no moiety amount)", NULL, 0, NULL, NULL, ["NSF Dietary Supplements Certification NSF/ANSI 173 PRODUCT_ALL_SIZES x1"], ["bl:nr:block-no-current-certification@1 BLOCK", "bl:nr:declared-amount-convertible-to-moiety@1 FILTER", "bl:nr:lot-verifiable-certification@1 SCORE", "bl:nr:moiety-per-max-labeled-day@1 SCORE", "bl:nr:usd-per-100mg-moiety@1 SCORE"]
```

Result, T = 2024-06-01T00:00:00Z (exit 0, 2.89 s wall):

```
option, label, declared, gate, rank, lotScore, nrPerMaxDay, dayStatus, certs, criteria
"NiaCel 400", "SP654 LSP65403", "415 mg SALT_FORM", "NOT_EVALUATED (certification at T unknown)", NULL, 0, 545.6, "PROPOSED", [], ["bl:nr:block-no-current-certification@1 BLOCK", "bl:nr:declared-amount-convertible-to-moiety@1 FILTER", "bl:nr:lot-verifiable-certification@1 SCORE", "bl:nr:moiety-per-max-labeled-day@1 SCORE", "bl:nr:usd-per-100mg-moiety@1 SCORE"]
```

**At T = 2026-10-09** the result is the same as `computedComparison` in `assertions.yaml` and the draft report rows:

- **NiaCel 400: rank 1, SELECTED.** NSF Certified for Sport covers 19 named lots. Its moiety amount rests on PROPOSED inputs, and the row flags that.
- **Tru Niagen: rank 2, ALTERNATIVE.** NSF Certified for Sport covers the 300 mg capsule variant with "Lot # All", so its lot score is 0.
- **Liposomal Nicotinamide Riboside+: NOT_EVALUATED.** It is NSF/ANSI 173 listed, but it has no moiety amount. It is not ranked last.

**At T = 2024-06-01** NiaCel is NOT_EVALUATED. The 2026 observation of the listing says nothing about 2024.

The 790.2 mg/d against 272.8 mg/d difference is reported, not ranked. The criterion set states that more is not better.

## 4. Provenance trace of the selected row (directive 3.10; the effectiveness test of 3.8 for a structured source)

The trace runs from the report cell to the CALCULATED daily amount, through its DERIVED_FROM inputs, to each input's asserter, locator and snapshot digest. The verifier re-selects the same locators. Each locator's `[startOffset, endOffset)` in `locators.yaml` re-selects the exact quote from bytes whose sha256 is the snapshot digest.

```cypher
MATCH (:Report {fixture:'xfx-product'})-[:HAS_ITEM]->(i:ReportItem {disposition:'SELECTED'})-[:DERIVED_FROM]->(a:Assertion {predicate:'PER_MAX_DAILY_DOSE_AMOUNT'})
MATCH (a)-[:DERIVED_FROM*0..3]->(x:Assertion)
OPTIONAL MATCH (x)-[:ASSERTED_BY]->(who)
OPTIONAL MATCH (x)-[e:HAS_EVIDENCE]->(l:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
RETURN DISTINCT x.name AS assertion, x.predicate AS predicate, x.basisKind AS basis, x.status AS status, who.name AS asserter,
       l.name AS locator, l.startOffset AS start, l.endOffset AS end, left(s.contentHash, 23) AS snapshot
ORDER BY assertion, locator;
```

Result (exit 0, 2.71 s wall):

```
assertion, predicate, basis, status, asserter, locator, start, end, snapshot
"c-nc-day", "PER_MAX_DAILY_DOSE_AMOUNT", "CALCULATED", "PROPOSED", "agent:d1-amount-projection (d1-amounts/v1)", NULL, NULL, NULL, NULL
"c-nc-moiety", "MOIETY_EQUIVALENT_AMOUNT", "CALCULATED", "PROPOSED", "agent:d1-amount-projection (d1-amounts/v1)", NULL, NULL, NULL, NULL
"dc-nc", "DECLARES_COMPONENT", "MANUFACTURER_CLAIM", "ACCEPTED", "Thorne Research", "l-nc-qty", 2926, 2967, "sha256:f76f932080400688"
"dc-nc", "DECLARES_COMPONENT", "MANUFACTURER_CLAIM", "ACCEPTED", "Thorne Research", "l-nc-row", 3174, 3343, "sha256:f76f932080400688"
"f-nc-maxdaily", "MAX_DAILY_SERVINGS", "MANUFACTURER_CLAIM", "ACCEPTED", "Thorne Research", "l-nc-directions", 1462, 1549, "sha256:f76f932080400688"
"f-nc-maxdaily", "MAX_DAILY_SERVINGS", "MANUFACTURER_CLAIM", "ACCEPTED", "Thorne Research", "l-nc-maxdaily", 1080, 1141, "sha256:f76f932080400688"
"g03-mw-nr", "MOLECULAR_WEIGHT", "UNSTATED", "ACCEPTED", "FDA Global Substance Registration System (GSRS)", "l-gsrs0i8h-mwt", 15669, 15683, "sha256:3316792f5779d6e2"
"g03-mw-nr", "MOLECULAR_WEIGHT", "UNSTATED", "ACCEPTED", "FDA Global Substance Registration System (GSRS)", "l-gsrs0i8h-version", 264, 278, "sha256:3316792f5779d6e2"
"g04-mw-mal", "MOLECULAR_WEIGHT", "UNSTATED", "ACCEPTED", "NCBI PubChem (National Library of Medicine)", "l-pc-cid", 59, 76, "sha256:5497e09d836271cf"
"g04-mw-mal", "MOLECULAR_WEIGHT", "UNSTATED", "ACCEPTED", "NCBI PubChem (National Library of Medicine)", "l-pc-mw", 128, 155, "sha256:5497e09d836271cf"
"g06-moiety-mal", "HAS_ACTIVE_MOIETY", "CURATOR_CLASSIFICATION", "PROPOSED", "S synthesizer agent, cross-domain fixture 2 (claude-opus-5-5)", "l-gsrs0i8h-pubchem", 4412, 4467, "sha256:3316792f5779d6e2"
"g06-moiety-mal", "HAS_ACTIVE_MOIETY", "CURATOR_CLASSIFICATION", "PROPOSED", "S synthesizer agent, cross-domain fixture 2 (claude-opus-5-5)", "l-pc-components", 28, 69, "sha256:a16db13d60129ad3"
"g06-moiety-mal", "HAS_ACTIVE_MOIETY", "CURATOR_CLASSIFICATION", "PROPOSED", "S synthesizer agent, cross-domain fixture 2 (claude-opus-5-5)", "l-pc-iupac", 216, 352, "sha256:5497e09d836271cf"
"r02-realizes-nc", "REALIZES_SUBSTANCE", "CURATOR_CLASSIFICATION", "PROPOSED", "S synthesizer agent, cross-domain fixture 2 (claude-opus-5-5)", "l-nc-row", 3174, 3343, "sha256:f76f932080400688"
"r02-realizes-nc", "REALIZES_SUBSTANCE", "CURATOR_CLASSIFICATION", "PROPOSED", "S synthesizer agent, cross-domain fixture 2 (claude-opus-5-5)", "l-pc-formula", 85, 118, "sha256:5497e09d836271cf"
"r02-realizes-nc", "REALIZES_SUBSTANCE", "CURATOR_CLASSIFICATION", "PROPOSED", "S synthesizer agent, cross-domain fixture 2 (claude-opus-5-5)", "l-pc-iupac", 216, 352, "sha256:5497e09d836271cf"
"r02-realizes-nc", "REALIZES_SUBSTANCE", "CURATOR_CLASSIFICATION", "PROPOSED", "S synthesizer agent, cross-domain fixture 2 (claude-opus-5-5)", "l-pc-syn", 111, 141, "sha256:16442d4def5e2d98"
```

The two CALCULATED rows have no locator by design. Their evidence is their inputs, and the verifier recomputes them (DERIVED_VERIFIED or DERIVED_FAILED).

Every leaf has a locator and a snapshot. The leaves come from four asserters:

- **Thorne Research** is the labeler of record for the line and the serving maximum (R-16 rule 1). DSLD relays the line, and the qualifier `relayedBy` records that.
- **FDA GSRS** asserts the NR molecular weight.
- **NCBI PubChem** asserts the malate molecular weight.
- **The S agent** asserts the two PROPOSED curation links.

## 5. Mission lineage of the selected row (00-DIRECTIVE 4)

```cypher
MATCH (:Report {fixture:'xfx-product'})-[:HAS_ITEM]->(i:ReportItem {disposition:'SELECTED'})-[:DERIVED_FROM]->(a)
MATCH (a)-[:DERIVED_FROM*0..3]->(x)-[:WAS_GENERATED_BY]->(act:Activity)
WITH act, count(DISTINCT x) AS records
OPTIONAL MATCH (act)-[:WAS_INFORMED_BY]->(up:Activity)
RETURN act.missionId AS mission, act.runId AS run, act.activityKind AS kind, act.methodVersion AS method, records, up.runId AS informedBy
ORDER BY run;
```

Result (exit 0, 2.56 s wall):

```
mission, run, kind, method, records, informedBy
"mission:ft-S-xfx", "run:ft-S-xfx-product-ingest", "INGESTION", NULL, 32, NULL
"mission:ft-S-xfx", "run:ft-S-xfx-product-project", "PROJECTION", "d1-amounts/v1", 2, "run:ft-S-xfx-product-ingest"
```

The row rests on two runs of mission `mission:ft-S-xfx`:

- **The ingestion run** wrote the source-stated and curated inputs: 32 Assertion and Assessment records reachable from the row.
- **The projection run** wrote the two CALCULATED amounts under `d1-amounts/v1`. It is linked to the ingestion run by WAS_INFORMED_BY.

The comparison Activity (`run:ft-S-xfx-product-compare`, ANSWER) generated the report and its items.

## 6. The draft COMPARISON report as stored (Q-D10-02 shape, skeleton `d10.product-comparison@1`)

```cypher
MATCH (r:Report {fixture:'xfx-product'})
OPTIONAL MATCH (r)-[:USES_CRITERION]->(c:DecisionCriterion)
WITH r, count(c) AS nCriteria
MATCH (r)-[h:HAS_ITEM]->(i:ReportItem)
OPTIONAL MATCH (i)-[:ASSESSES]->(o)
OPTIONAL MATCH (i)-[:DERIVED_FROM]->(d)
RETURN r.status AS status, r.policyVersion AS policy, nCriteria, h.orderIndex AS ord, i.itemKind AS kind, i.sectionKind AS section,
       i.disposition AS disposition, i.rank AS rank, i.missingFactKeys AS missing, collect(DISTINCT o.name) AS about, count(DISTINCT d) AS cites
ORDER BY ord;
```

Result (exit 0, 2.59 s wall):

```
status, policy, nCriteria, ord, kind, section, disposition, rank, missing, about, cites
"PROPOSED", "policy:bl-publish@fixture", 5, 1, "SECTION", "SCOPE", NULL, NULL, NULL, ["NICOTINAMIDE RIBOSIDE"], 0
"PROPOSED", "policy:bl-publish@fixture", 5, 2, "SECTION", "CRITERIA", NULL, NULL, NULL, [], 0
"PROPOSED", "policy:bl-publish@fixture", 5, 3, "SECTION", "OPTIONS", NULL, NULL, NULL, ["NICOTINAMIDE RIBOSIDE"], 0
"PROPOSED", "policy:bl-publish@fixture", 5, 4, "ROW", "OPTIONS", "SELECTED", 1, ["offer-price-one-time (disputed)"], ["NiaCel 400"], 7
"PROPOSED", "policy:bl-publish@fixture", 5, 5, "ROW", "OPTIONS", "ALTERNATIVE", 2, ["label-version-for-offer-package"], ["Tru Niagen"], 6
"PROPOSED", "policy:bl-publish@fixture", 5, 6, "ROW", "OPTIONS", "NOT_EVALUATED", NULL, ["declared-mass-basis", "salt-form", "offer-price-one-time"], ["Liposomal Nicotinamide Riboside+"], 4
"PROPOSED", "policy:bl-publish@fixture", 5, 7, "SECTION", "MISSING_OR_DISPUTED", NULL, NULL, NULL, ["Liposomal Nicotinamide Riboside+", "Tru Niagen", "NiaCel 400"], 9
"PROPOSED", "policy:bl-publish@fixture", 5, 8, "SECTION", "INTERESTS", NULL, NULL, NULL, ["BellLabs"], 0
```

The report's status is PROPOSED under `policy:bl-publish@fixture`, and its `publishedAt` is null. It is a draft, not a BellLabs publication.

- **Publishing it** means a successor Report: status ACCEPTED, `publishedAt` set, `supersedesUid` pointing at this draft, written by a composing Activity under a real PolicyVersion through `report.publish`. Intent v1 has no `report.publish` kind (R-40), so that step cannot be written yet.
- **The body.** The body text is `composed-body.txt`, sha256 `8701c9c51404081b2c35c73d05b7cbada680e8d39a44e9f98ac77edb9bcaa36b` (the bodyDigest). Each item's `[bodyStartOffset, bodyEndOffset)` slices it.
- **Citations.** OPTIONS rows have 0 uncited sentences, as the skeleton's citation floor requires. SCOPE has 4 uncited framing sentences and INTERESTS has 1. The report-level citationCompleteness is 0.667, which is 10 of 15 sentences.

## 7. Is my lot covered? (Q-D8-08)

```cypher
UNWIND ['414956', '417281', '999999'] AS code
OPTIONAL MATCH (cl:CertificationListing {fixture:'xfx-product'})-[c:COVERS]->(l:Lot {lotCode: code})-[:LOT_OF]->(p:Product)
OPTIONAL MATCH (a:Assertion {uid: c.assertionUid})
RETURN code, cl.programme AS programme, cl.listingId AS listing, p.name AS product, a.validObservedAt AS observedAt, c.validTo AS coverageEnds;
```

Result (exit 0, 2.45 s wall):

```
code, programme, listing, product, observedAt, coverageEnds
"414956", "NSF Certified for Sport", "1423140", "NiaCel 400", 2026-10-09T04:19:47Z, NULL
"417281", "NSF Certified for Sport", "1423140", "NiaCel 400", 2026-10-09T04:19:47Z, NULL
"999999", NULL, NULL, NULL, NULL, NULL
```

Lots 414956 and 417281 are listed under NSF Certified for Sport 1423140, as observed on 2026-10-09. Lot 999999 is a made-up probe code that returns no row; it is not a real lot.

None of the three labels has a lot-level answer elsewhere in this fixture. The NiaCel 400 label prints "NSF Certified Sport", and the D6 certification-scope assessment `as-seal-nc` (SUPPORTED_WITH_QUALIFICATION) reads that seal against the lot list. For Tru Niagen and Codeage the listing says "All", so no lot can be checked.

## 8. Missing and disputed facts (CQ-RC-03)

```cypher
CALL {
  MATCH (o:Offer {fixture:'xfx-product'})<-[:HAS_SUBJECT]-(a:Assertion {predicate:'OFFER_PRICE_ONE_TIME'})
  WITH o, collect(DISTINCT a.valueNumber) AS values WHERE size(values) > 1
  RETURN 'price disagreement' AS kind, o.name AS about, reduce(acc = '', v IN values | acc + toString(v) + ' USD; ') AS detail
  UNION
  MATCH (lv:LabelVersion {fixture:'xfx-product'})<-[:HAS_SUBJECT]-(a:Assertion {predicate:'FIELD_NOT_REPORTED'})
  RETURN 'field silent' AS kind, lv.name AS about, a.valueString AS detail
  UNION
  MATCH (ml:MerchantListing {fixture:'xfx-product'})-[:LISTING_FOR]->(pk:Package)
  WHERE NOT EXISTS { (pk)-[:HAS_LABEL_VERSION]->() }
  RETURN 'offer package without label version' AS kind, pk.name AS about, ml.name AS detail
}
RETURN kind, about, detail ORDER BY kind;
```

Result (exit 0, 2.53 s wall):

```
kind, about, detail
"field silent", "Liposomal Nicotinamide Riboside+ — US Supplement Facts (DSLD 333430, Nr 23.2304.23L)", "salt form / mass basis of the 'Nicotinamide Riboside' 500 mg line"
"offer package without label version", "Tru Niagen 300 mg, 30-count (store barcode 850015311857)", "truniagen.com — Tru Niagen® 300mg (Shopify product JSON)"
"price disagreement", "thorne.com one-time offer, 60 capsules", "44 USD; 74 USD; "
```

These three gaps are why the price-per-100-mg column is not computed for any option and why Codeage is not ranked.

- **Thorne's one snapshot states two prices.** The rendered block says $74 and the schema.org Offer says 44.
- **The Tru Niagen store's 30-count package has no captured label version.** Its GTIN is 00850015311857. The captured label version belongs to GTIN 00850015311116.
- **Codeage's label line is silent on its salt form.**

Each gap is a stored, cited record. None is a blank.

## 9. Intent and planner (03-SYNTHESIS step 8)

- **Contract validation.** `intent.json` is the ingestion run's `biotech-knowledge-intent.v1` intent. It parses with `@bks/contracts` IngestionIntent: 155 proposals, 57 subjects, 77 locators, 0 dangling refs.
- **What intent v1 cannot carry (R-40).** It cannot carry these records, so the intent's `notes` list them:
  - the 6 CALCULATED amounts, which the PROJECTION run writes
  - the predicate-only BEARS_SEAL
  - the 5 assessments
  - the 5 criteria, the report and its 8 items
- **Planner probe.** The current kg-ops planner ran read-only against the candidate IR through `final/_work/planner-probe-v2.mjs`.
  - **v2:** rejected. No v2 type allows CREATE (R-03). Lot, Package and LabelVersion have no uid token.
  - **v2sim:** partial, with 40 proposals admitted and 275 planned statements. The remaining reasons are planner or IR-parameter gaps that `migration-notes.md` already lists:
    - no uid token for Lot, Package and LabelVersion
    - `ChemicalSubstance has no HAS_IDENTIFIER field`, because the planner reads a forward field
    - v1 keys still written: maturity, schemaVersion, mongoResearchRunId and SUPPORTED_BY
  - **First probe run.** It found four fixture-side errors, all fixed before the run above:
    - a missing `entityKind` on Organization
    - a missing `hostItemId` on MerchantListing
    - a write to the derived `IngredientMaterial.searchText`
    - a `tool` key in `source.properties`

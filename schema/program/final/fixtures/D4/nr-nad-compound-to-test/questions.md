# Fixture nr-nad-compound-to-test - questions answered

Kind: other (cross-domain path D1 -> D2 -> D4, with D3 and D6/D7 seams; harm/conflict branch in s01/s02).

## Q-D4-01 as one query pattern (D2 + D4)

```cypher
// compound -> mechanism (D2) <- biomarker (D4) -> metric -> test, with the comparability verdict for each test metric
MATCH (c:ChemicalSubstance {uid: 'hu:substance:nicotinamide-riboside'})-[:AFFECTS_MECHANISM]->(m:Mechanism)   // D2 derived projection (D2 fixture)
MATCH (b:Biomarker)-[rm:REFLECTS_MECHANISM]->(m)                                                              // D4 asserted (e03, e04)
MATCH (study:Metric)-[:QUANTIFIES]->(b)<-[:QUANTIFIES]-(tm:Metric)<-[mm:MEASURES_METRIC]-(t:LabTest)           // D4 (e05, e06, e07)
WHERE study.definitionSource = 'PUBLICATION' AND tm <> study AND mm.recordedTo IS NULL
OPTIONAL MATCH (a:Assessment)-[:ASSESSES]->(study), (a)-[:ASSESSES]->(tm) WHERE a.assessmentKind = 'COMPARABILITY' AND a.assessmentSubkind = 'D4.comparability'
OPTIONAL MATCH (p:Product)-[:DELIVERS]->(t)
RETURN c.name, m.name, b.name, study.name, tm.name, t.name, coalesce(a.conclusionCode, 'UNKNOWN') AS verdict, collect(p.name) AS buy
```

Expected row: nicotinamide riboside · Nicotinate metabolism (R-HSA-196807) · NAD+ level · NAD+ in PBMCs (pmol/mg protein) · Intracellular NAD+ in RBC (μM) · Jinfiniti Intracellular NAD® Test · COMPARABILITY `D4.comparability` conclusionCode `NOT_COMPARABLE` · [Intracellular NAD® Test kit, NAD Membership]. (NAAD level also reflects the mechanism, e03, but no captured consumer test measures NAAD.)

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| Q-D4-01 | A test exists for the NR-responsive biomarker NAD+ (Jinfiniti, RBC, μM), but it is **NOT_COMPARABLE** with the trial measurement (PBMC, pmol/mg protein, LC-MS); every hop cites a locator. | e03-e07, s01 |
| Q-D4-02 | **NOT_COMPARABLE**: compartment PBMC vs RBC, unit pmol/mg protein vs μM, method LC-MS vs not reported; the paper notes NAD+ metabolites are undetectable in plasma - compartment matters. | s01; m1, m2, j1, j3 |
| Q-D4-12 | The "optimal range (40–100 μM)" is a VENDOR_TARGET, derivation VENDOR_DEFINED, set by Jinfiniti (who "established the reference ranges and guidelines"); population not reported; the seller of the booster ran the cited 85 % study on its own product. | e09, e10, e13; j6, j9, j10 |
| Q-D4-13 | Jinfiniti issues the test and sells the NAD+ booster in the same membership product -> test-and-sell (CONFLICT_RELEVANCE assessment, HARM direction for the buyer's interpretation). | s02; e11, e12 |
| Q-D4-14 | Trial NCT02921659: registry outcomes are adverse events (primary) and physiological/inflammation markers (secondary); NAD+ is not a registered outcome although the paper reports it -> registry/publication divergence for D3. | ct1-primary, ct2-secondary, m7-nct |

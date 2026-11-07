# Fixture: two Mission Control runs over the resveratrol-SIRT1 story, the four lineage questions

- kind: other
- url: https://www.activemotif.com/catalog/details/14022/resveratrol
- title: lineage view over the captures of the sibling K fixtures (first capture of run R1: Active Motif catalog page 14022; run R2: the evidence mission)
- retrieved: 2026-10-08
- snapshot digest: sha256:a271f178bae756ff70a053908e64d30bcd71e2ec63bd055bb043274ba1c576b0 (R1 capture of the Active Motif page) and sha256:38ab3c5178349128fe45e5da65e0639f634c636816241dd0d264ffdfa15e40d4 (R1 capture of the MegaResveratrol blog); R2's captures are listed in `../resveratrol-sirt1-evidence-mission`, `../retracted-sah-2017-stale-evidence`, `../hubbard-2013-unstructured-to-entity` and `../seller-claim-occurrences`
- tool: tool:mission-control (run identity: missionId, runId; fixture ids), tool:kg-executor (intents in `intent.json` and `intent-r2.json`, validated against `@bks/contracts`), tool:ks-verification (the VERIFICATION run's bundle digest, computed here over the fixture adjudications), tool:entity-link-projection (fixture method), tool:http-capture

## What the fixture shows

One fixture mission (`mission:ft-K-fixtures`) with one Activity per run: R1 ingestion (`run:ft-K-r1-ingest`: first capture of the two seller pages, the Claim, two occurrences), R1 vetting (`run:ft-K-r1-vetting`: the VETTING Assessment, disposition RESEARCH), R2 evidence mission (`run:ft-K-r2-evidence-mission`: ASSESSES the Claim, WAS_INFORMED_BY the vetting run, captures the papers and the retraction, writes the refined Claim and the two evidence reports, supersedes one R1 occurrence), its VERIFICATION run (`run:ft-K-r2-verification`, bundle digest) and an entity-link PROJECTION run; plus the identifier-crosswalk ingestion and the benchmark-replay verification. `lineage-index.yaml` lists every record of the six K fixtures with the run that created it and the runs that updated it, and is the expected answer of Q-K-04; `assertions.yaml` gives the expected answers of Q-K-05 (timeline of the Claim), Q-K-06 (blast radius of R1) and Q-K-07 (R1 → R2 diff). No new capture: `locators.yaml` copies the traced locators from the sibling fixtures with their digests.

## Files

- `assertions.yaml`: Agents, Activities (WAS_ASSOCIATED_WITH, WAS_INFORMED_BY, ASSESSES), R2's corrections, lineage edges
- `lineage-index.yaml`: generated record → run index with per-run counts
- `locators.yaml`: copied locators traced by the lineage answers
- `intent.json` (R1 ingestion) and `intent-r2.json` (R2 correction: edge.assert + edge.close), both validated against biotech-knowledge-intent.v1
- `questions.md`

# Fixture nr-salt-moiety-us-canada — source

- url: https://api.ods.od.nih.gov/dsld/v9/label/323170
- title: NIH DSLD label 323170 "Tru Niagen 300 mg" (ChromaDex), productVersionCode V12.3, entered into DSLD 2025-04-24
- retrieved: 2026-10-08
- snapshot digest: sha256:d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d
- kind: other
- tool: tool:dsld-api (curl 8, no key); companions below
- fixture ids: mission:ft-D1-fixtures / run:ft-D1-nr-salt-moiety-us-canada (fixture ids, not live Mission Control ids)

## Companion snapshots (all re-captured 2026-10-08; digests are sha256 of the raw bytes; locators.yaml lists them with retrievedAt)

| snapshot | url | tool | sha256 |
| --- | --- | --- | --- |
| FDA GSRS NICOTINAMIDE RIBOSIDE CHLORIDE (UNII 8XM2XT8VWI, record version 18) | https://gsrs.ncats.nih.gov/api/v1/substances(8XM2XT8VWI)?view=full | tool:gsrs-api | 1a3167f256ef0426c33d505f49e91c523392046d0edcbec97c9d36c976eab58b |
| FDA GSRS NICOTINAMIDE RIBOSIDE (UNII 0I8H2M0L7N, version 24) | https://gsrs.ncats.nih.gov/api/v1/substances(0I8H2M0L7N)?view=full | tool:gsrs-api | 3316792f5779d6e2a6c179ae2d5956d662250736e9c35a209f678ed434a8a9ad |
| Health Canada LNHPD medicinal ingredient, lnhpd_id 9465261 (Tru Niagen capsule, NPN 80092534) | https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=9465261 | tool:lnhpd-api | 4b50ab3fedbea218f59d0153f843cc80b1193289d9722ff0f3fc5e6d4cfdb7e0 |
| Health Canada LNHPD medicinal ingredient, lnhpd_id 23195874 (Tru Niagen powder, NPN 80092742) | https://health-products.canada.ca/api/natural-licences/medicinalingredient/?lang=en&type=json&id=23195874 | tool:lnhpd-api | f70c5a09a995c54dc52ea0660e2725ddd05333a0e0e20b0c83bb7d446229b9f9 |
| Health Canada LNHPD product licence bulk listing (research-stage capture of 2026-10-08, 148 MB; the per-id licence filter is ignored by the API) | https://health-products.canada.ca/api/natural-licences/productlicence/?lang=en&type=json | tool:lnhpd-api | 9b18b5be944f5aef904100ccbfa2467ffe2c08d8948c3d2636dbf1cda5d1bd92 |
| Niagen Bioscience, Inc. Form 10-K FY2025 (accession 0001386570-26-000013, filed 2026-03-04) | https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm | tool:sec-edgar | 0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6 |

The DSLD, GSRS and EDGAR bytes are identical to the research-stage captures (`_notes/fixture-candidates.md` FC-01/FC-03/FC-09). The LNHPD records differ only in the server's `metadata.dateReceived` timestamp, so their digests changed; the data rows are unchanged.

## Description

One branded material, two jurisdictions, two mass bases. The US label (DSLD 323170) declares "Niagen" 300 mg per capsule with the form "Nicotinamide Riboside Chloride" (UNII 8XM2XT8VWI) — the amount is the salt. The Canadian licence for the same product line (NPN 80092534) declares 263.0 mg of the moiety, named by a CAS-index-style name ("Pyridinium, 3-(aminocarbonyl)-1-beta-D-ribofuranosyl-"), with "Nicotinamide riboside chloride" as source material. FDA GSRS supplies the salt→moiety relation (ACTIVE MOIETY) and both molecular weights (290.7006 and 255.2476, each pinned to its record version). The 10-K adds what makes NIAGEN a material rather than a substance: a food-grade, crystalline form of NR chloride made by one supplier under patents. The derived amounts (263.4 mg NR per capsule, 790.2 mg/d at the 3-capsule maximum, 900 mg/d of salt) and the US–Canada reconciliation (−0.41 mg, −0.16 %) are CALCULATED Assertions citing their inputs; nothing derived is stored as a declaration.

## What it exercises (05-relationship-register.yaml)

- `REALIZES_SUBSTANCE` IngredientMaterial(NIAGEN) → ChemicalSubstance(8XM2XT8VWI) (a01; DSLD form row, asserter NIH ODS; corroborated by the 10-K, a02) and IngredientMaterial(LNHPD source material) → 8XM2XT8VWI (a05).
- `HAS_ACTIVE_MOIETY` 8XM2XT8VWI → 0I8H2M0L7N (a06; GSRS `/relationships/0/type` "ACTIVE MOIETY").
- FIELD Assertions MOLECULAR_WEIGHT ×2 and MOLECULAR_FORMULA (JSON_POINTER locators, record version on the locator set).
- CALCULATED `rule:mw-ratio.v1` (c01), `rule:daily-max.v1` (c02, c03), reconciliation `DECLARATION_STOICHIOMETRY_CHECK` (c04).
- Predicate-only `MARKETED_UNDER_MARK` (p01) and `SUPPLIES_MATERIAL` (p02); RESOLUTION (r01, r02) and EQUIVALENCE (e01) assessments.
- Seams: D6 `LabelVersion` + `DECLARES_COMPONENT` (a10, a12), D7 organizations as asserters.

## Re-verify

`locators.yaml` holds every quote with code-point offsets and `quoteHash`; re-fetch each URL, check the sha256, then `text[startOffset:endOffset] == exact`. The scratch builder that did this on 2026-10-08 is `…/scratchpad/ft/D1/bin/build_locators.py` (not committed; raw captures are not committed either).

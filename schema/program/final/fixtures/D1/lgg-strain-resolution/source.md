# Fixture lgg-strain-resolution — source

- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=568703&retmode=xml
- title: NCBI Taxonomy 568703 "Lacticaseibacillus rhamnosus GG" (rank strain, parent 47715)
- retrieved: 2026-10-08
- snapshot digest: sha256:d895c84b7882c30c974dd626b9ecfcad7c658eb321eab3c823a094fef68db85f
- kind: other
- tool: tool:ncbi-taxonomy-eutils (curl 8, E-utilities efetch, no key)
- fixture ids: mission:ft-D1-fixtures / run:ft-D1-lgg-strain-resolution (fixture ids, not live Mission Control ids)

## Companion snapshots (re-captured 2026-10-08)

| snapshot | url | tool | sha256 |
| --- | --- | --- | --- |
| NCBI Taxonomy 47715 Lacticaseibacillus rhamnosus (species) | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=47715&retmode=xml | tool:ncbi-taxonomy-eutils | 0f77ce1976e8dc6c1f204ba6f544e48d1b4fd86e112d54c5049e7717eddee8ef |
| NCBI Taxonomy 1578 Lactobacillus (genus) | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=1578&retmode=xml | tool:ncbi-taxonomy-eutils | 4572153e500fe4355e08bdce4fb9d8e1ba302d0eee873172efb1475c1c7ea424 |
| Europe PMC metadata, Zheng et al. 2020 IJSEM (PMID 32293557, DOI 10.1099/ijsem.0.004107) | https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1099/ijsem.0.004107&resultType=core&format=json | tool:europepmc-rest | 22a6d023e95cb4dfbc6a35053f401a2b820f376b18c70e7b76e8f971a41856d7 |
| NIH DSLD label 250851 "Digestive Daily Probiotic" (Culturelle) | https://api.ods.od.nih.gov/dsld/v9/label/250851 | tool:dsld-api | 94a4657250fbbe647c84c0b2f0b21046574da277839a1b63d12c9890088f831d |
| NIH DSLD label 273846 "Pro Strength Digestive Daily Probiotic" (Culturelle) | https://api.ods.od.nih.gov/dsld/v9/label/273846 | tool:dsld-api | 2c80f347e496e14715aa628e634e38b7f06355408fc88b4e4795abc973ce95b8 |

NCBI 568703 and both DSLD labels are byte-identical to the research captures; 47715, 1578 and the Zheng metadata were first captured in this stage.

## Description

A probiotic label names "Lactobacillus rhamnosus GG" — a genus that no longer contains the species. NCBI resolves the strain (taxid 568703, rank strain, EquivalentName "Lactobacillus rhamnosus strain GG") and exposes its culture-collection deposits only as synonym strings ("Lactobacillus rhamnosus ATCC 53103", "… LMG 18243"); the species record 47715 carries the history in its authority names ("Lactobacillus rhamnosus (Hansen 1968) Collins et al. 1989" and "Lacticaseibacillus rhamnosus (Hansen 1968) Zheng et al. 2020"), and its current parent is Lacticaseibacillus (2759736). The fixture models that as two PARENT_TAXON episodes of the species — closed to Lactobacillus (1989 → 2020-04-15) and open to Lacticaseibacillus (from 2020-04-15, the Zheng et al. first-publication date per Europe PMC) — so a label's legacy name still resolves and strain-specific evidence still joins on the STRAIN taxon. Two Culturelle labels declare the same 40 mg of the LGG material with different counts (10 vs 12 billion CFU, in notes rather than in the quantity field): the counts are D6 amounts, the material and strain are one D1 identity.

## What it exercises

- `DERIVED_FROM_TAXON` IngredientMaterial(LGG) → Taxon(568703, STRAIN) (g01, g02).
- `PARENT_TAXON` strain → species (g03), species → Lacticaseibacillus open episode (g04), species → Lactobacillus closed episode (g05).
- Deposit identifiers ATCC 53103 and LMG 18243 via kernel HAS_IDENTIFIER with scheme CULTURE_COLLECTION (requested, OQ-D1-07) (g06, g07).
- D6 seam declarations and CFU counts (g08–g11); predicate-only MARKETED_UNDER_MARK (p03); RESOLUTION r05 (Q-D1-15), EQUIVALENCE e02.

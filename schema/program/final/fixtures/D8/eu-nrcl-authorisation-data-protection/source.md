# Fixture — EU novel-food authorisation of NR chloride: conditions, and a data protection that ended

- url: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32020R0016
- title: Commission Implementing Regulation (EU) 2020/16 of 10 January 2020 authorising the placing on the market of nicotinamide riboside chloride as a novel food
- retrieved: 2026-10-08
- snapshot digest: sha256:f53290e3c90af7f77e58f58dc7a7e038d7fefd792629be81cc98a7a7cb1c93af (raw HTML bytes, 40,645 B, fetched 2026-10-08T21:38:10Z)
- kind: other
- tool: curl 8.x (browser User-Agent); text by scratch `tools/h2t.py` v2
- candidate: FC-8 in `../../../../packets/D8/_notes/fixture-candidates.md`

## What the fixture shows

A `RegulatoryRecord` (NOVEL_FOOD_AUTHORISATION, CELEX 32020R0016) ISSUED_BY the European Commission, ADDRESSED_TO the applicant ChromaDex Inc., CONCERNS the D1 ingredient material NR chloride, with its conditions of use verbatim (food supplements, 300 mg/day for the general adult population excluding pregnant and lactating women). It establishes two `LegalStatus`es: AUTHORISED (valid from 2020-02-20 as the Annex states) and DATA_PROTECTED (family EXCLUSIVITY) valid [2020-02-20, 2025-02-20) — an exclusivity that has ended, which answers "when does protection end" (Q-D8-13) with a past date. One inconsistency is recorded, not resolved: Article 4 puts entry into force on the twentieth day after publication (OJ L 7 of 13.1.2020, i.e. 2020-02-02 by computation), while the Annex says "Authorised on 20 February 2020"; the fixture keeps the Annex dates and records the computed date as a CALCULATED assertion for review.

## Files

- `locators.yaml` — 1 snapshot, 12 locators.
- `assertions.yaml` — 7 entities, 8 assertions (ISSUED_BY, ADDRESSED_TO, CONCERNS, STATUS_OF ×2, STATUS_FROM ×2, 1 computed literal).
- `intent.json` — zod-valid (11 proposals).
- `questions.md` — CQ-PF-04, Q-D8-13, CQ-MF-02, Q-D8-09.

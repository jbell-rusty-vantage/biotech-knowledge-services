# Fixture — US 8,197,807: owned by Dartmouth, licensed exclusively, asserted claims held invalid; the aggregator still says "Active"

- url: https://www.cafc.uscourts.gov/opinions-orders/22-1116.OPINION.2-13-2023_2079642.pdf
- title: ChromaDex, Inc. v. Elysium Health, Inc., No. 2022-1116 (Fed. Cir. decided 2023-02-13)
- retrieved: 2026-10-08
- snapshot digest: sha256:f1b39bc48cf1e093a86067cdd1bf253f1c2b5ff4e221c76410ba1fd6e2eb8dfb (raw PDF bytes, 124,077 B, 11 pages; byte-identical to the research capture)
- kind: disconfirmation
- tool: curl 8.x (browser User-Agent); text by `pdftotext 4.00 -raw -enc UTF-8`
- second source: https://patents.google.com/patent/US8197807B2/en · Google Patents US8197807B2 · retrieved 2026-10-08 · sha256:5d97286e02347657c6e836b225984b2a4f93a0fd359429066d2378496fd0924e (raw HTML, 1,128,222 B) · curl
- third source: https://www.sec.gov/Archives/edgar/data/1386570/000138657026000013/cdxc-20251231.htm · Niagen Bioscience, Inc. Form 10-K for FY2025 · retrieved 2026-10-08 · sha256:0f823d4988919baf6ee581216ac10a0537edfffb5a0e2c5bdc1d9eb32e6483e6 (raw HTML, 2,046,533 B) · curl with the `EDGAR_IDENTITY` User-Agent read in-shell (not printed)
- candidate: FC-4 in `../../../../packets/D8/_notes/fixture-candidates.md`

## What the fixture shows

"Nicotinamide riboside is patented" is disconfirmed at claim level. The `Patent` US 8,197,807 B2 is ASSIGNED_TO the Trustees of Dartmouth College (episode from the 2007-11-20 assignment, relayed by Google Patents; corroborated by the 10-K's "held by Dartmouth") and LICENSED_TO the ChromaDex group: the court says ChromaDex, Inc. "licenses the patent from Dartmouth" (exclusivity not stated), the 10-K says "licensed exclusively to Niagen Bioscience" (qualifier `exclusivity=EXCLUSIVE`), and the Supplemental Agreement of 2024-11-27 amended that licence's terms (Dartmouth's waiver of further royalties for the "Dartmouth Patents"; a dated literal D8.LICENCE_TERMS_AMENDED, not a new licence episode — adversarial-review revision; held as PROPOSED: the passage does not list patent numbers). The court record (`RegulatoryRecord` COURT_DECISION 2022-1116, ISSUED_BY the Federal Circuit, ADDRESSED_TO the three parties, ADJUDICATES_PATENT the patent as a predicate-only link since the adversarial-review revision) establishes a `LegalStatus` CLAIMS_HELD_INVALID with `claimNumbers [1, 2, 3]` (the asserted claims), valid from 2023-02-13, while the aggregator's "Active , expires 2026-11-19" stays text (`aggregatorStatusVerbatim`) next to its own disclaimer. Identity care: ChromaDex, Inc. (the litigant) is a wholly owned subsidiary of Niagen Bioscience, Inc. (formerly ChromaDex Corporation, renamed 2025-03-19); the fixture keeps them as two organizations for D7 to relate.

## Files

- `locators.yaml` — 3 snapshots, 22 locators.
- `assertions.yaml` — 10 entities, 15 assertions (ASSIGNED_TO ×2, LICENSED_TO ×2, CONCERNS ×1, ISSUED_BY, ADDRESSED_TO ×3, STATUS_OF, STATUS_FROM, ADJUDICATES_PATENT (predicate-only), 3 literals; revised after the adversarial review).
- `intent.json` — zod-valid (18 proposals).
- `questions.md` — Q-D8-12, Q-D8-11, Q-D8-13, Q-D8-21, CQ-EC-01.

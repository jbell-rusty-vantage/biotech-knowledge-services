# Fixture madrigal-financing-after-readout — source

- url: https://www.sec.gov/Archives/edgar/data/1157601/000119312522311537/d434336d8k.htm
- title: Madrigal Pharmaceuticals, Inc. Form 8-K filed 2022-12-23, Date of Report December 19, 2022 (Items 1.01, 5.03, 7.01, 8.01, 9.01; accession 0001193125-22-311537), with Exhibit 99.1 "Madrigal Pharmaceuticals Announces $300+ Million in Financing Events to Advance Resmetirom Program" (https://www.sec.gov/Archives/edgar/data/1157601/000119312522311537/d434336dex991.htm, dated December 21, 2022)
- retrieved: 2026-10-08
- snapshot digest: sha256:e67b4342dc932400f5149353f2573b039778ef546d61b66299d42929cebbe459 (8-K, h2t-v1 projection = snapshot identity, contentHashBasis NORMALIZED_TEXT); EX-99.1 sha256:3fdd41e2668e4bac47ea9abaa78f9d503a3ef1afa89be727b2e3a440155579cc (projection; reproduced by a re-fetch on 2026-10-08); EDGAR submissions index sha256:6b23ab5df12518ae53921769482dfaf108cc4336e22136b8f944aad7c0297860 (raw JSON of this capture; locators select by accession number). Session raw-HTML hashes (8-K 416740c7…, EX-99.1 ef32efcd…) were identical to the research-stage captures within the authoring session only: sec.gov injects a per-client `<script src>` path, so a later re-fetch gives other raw bytes with the same projection.
- kind: other
- tool: curl to SEC EDGAR Archives and the submissions API (`tool:sec-edgar-archives`, `tool:sec-edgar-submissions`; User-Agent from `EDGAR_IDENTITY`, never printed), h2t-v1 projection; link adjudication expectations for `tool:verification-v1`.
- producedBy (fixture ids): mission `mission:ft-D13-fixtures`, run `run:ft-D13-madrigal-financing-after-readout`; agent `agent:d13-event-linker`.

## Description

"A financing follows a result" (directive 3.7) tested on the two ways a source can say it. The 8-K's Item 8.01 states that
the lender's confirmation of the clinical milestone came "as a result of the Company’s announcement of Phase 3 MAESTRO-NASH
clinical trial topline results" and that the Company is "now eligible to borrow up to an additional $50 million": a stated
basis, so the LEADS_TO Assertion (READOUT → FINANCING, asserter Madrigal, speechAct STATES) passes the projection gate and
becomes a LEADS_TO episode, with Hercules Capital as LENDER and the amount as a FINANCING_AMOUNT literal. The CEO's sentence
in Exhibit 99.1, "The financings secured following the positive topline readout …", is temporal wording only: the candidate
LEADS_TO to the $100 million registered direct is adjudicated CONTEXT_ONLY, no edge is written, and Q-D13-06 shows that pair
only as a computed FOLLOWS. The filing also shows the clock split of CQ-TM-03: the earliest event reported is 2022-12-19, the
agreement 2022-12-21, the filing 2022-12-23. The registered-direct investors are unnamed in both documents, so no INVESTOR
edge can be written; the issuer is recorded with the EventRole value ISSUER. The same 8-K reports the at-the-market sales of
2022-12-19 ("On December 19, 2022, the Company sold 738,900 shares … for $159.1 million in gross proceeds"; Cowen "acted as sales
agent"), recorded as a third FINANCING Event (adversarial-review pass): it is temporal only (same day as the readout) and the CEO
sentence is CONTEXT_ONLY for it too. Madrigal is the BORROWER of the loan tranche and the ISSUER of the two equity financings.
Amounts carry `unitCode iso4217:USD` (kernel convention) and the qualifiers amountKind / amountBasis, so gross proceeds sold,
gross proceeds committed and borrowing capacity are never summed together.

Exercises: LEADS_TO (positive and two negatives), INVOLVES (LENDER, BORROWER, ISSUER, UNDERWRITER as sales agent),
FINANCING_AMOUNT (three amount kinds), EVENT_OCCURRED, EVENT_ANNOUNCED, mint-time identity keys with an instrument
discriminator (two FINANCING events of the same issuer on the same day).

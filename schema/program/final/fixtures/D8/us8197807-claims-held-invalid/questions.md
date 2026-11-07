# Fixture us8197807-claims-held-invalid — questions answered

Assertion ids (`p01` …) are in `assertions.yaml`; locators in `locators.yaml`.

| question | expected answer | rests on |
| --- | --- | --- |
| Q-D8-12 (has any claim been adjudicated; does "active" mislead) | Yes. Claims 1–3 (the asserted claims) of US 8,197,807 B2 were held invalid under 35 U.S.C. § 101; the Federal Circuit affirmed on 2023-02-13 (No. 2022-1116), after the district court's summary judgment of 2021-09-21. Google Patents still shows "Active , expires 2026-11-19", next to its own disclaimer that the legal status "is an assumption and is not a legal conclusion". Answer: the patent record may be in force; the claims that were asserted against a competitor are not valid. | p12, p13 (the path Q-D8-12 reads), p07–p10, p11 (predicate-only ADJUDICATES_PATENT), p14; `pat-807.aggregatorStatusVerbatim` |
| Q-D8-11 (which patents does C own or license, from whom, exclusive?) | US 8,197,807 B2 is assigned to the Trustees of Dartmouth College (assignment recorded 2007-11-20, per Google Patents; "held by Dartmouth", per the 10-K) and licensed to the ChromaDex group: exclusively to "Niagen Bioscience" (10-K FY2025, qualifier EXCLUSIVE); the court states ChromaDex, Inc. licenses it from Dartmouth. Owned vs licensed is the edge type (ASSIGNED_TO vs LICENSED_TO). | p01–p04 |
| Q-D8-13 (when does protection end) | Patent: aggregator-estimated expiry 2026-11-19 (`expiryBasis AGGREGATOR_ESTIMATE`), but the adjudicated claims 1–3 already give no protection since the 2023 affirmance. (The EU NR-chloride data protection ended 2025-02-20: see fixture eu-nrcl-authorisation-data-protection.) | `pat-807` properties; p12 |
| Q-D8-21 (licence terms over time, after adjudication) | The exclusive licence (p04; agreements dated 2012-07-13 and 2014-05-16, start not tied to this patent) was amended, not restarted, by the Supplemental Agreement of 2024-11-27 (literal D8.LICENCE_TERMS_AMENDED, p05): Dartmouth waived accrued royalties and agreed to no further royalties or fees for the "Dartmouth Patents" after the Supplemental Agreement's effective date, subject to conditions (appeal bond for the fee judgment). Held for review (PROPOSED) because the passage does not list patent numbers. | p05 |
| CQ-EC-01 (neighbourhood of X valid at V, recorded at R) | Around nicotinamide riboside (D1): Patent US 8,197,807 (CONCERNS, topical), its assignee Dartmouth, licensees ChromaDex, Inc. / Niagen Bioscience, Inc., the court record 2022-1116 with parties ChromaDex, Dartmouth and Elysium Health, and the CLAIMS_HELD_INVALID status (valid from 2023-02-13). | p01–p13 |

## Verification

`tools/verify.py` (scratch) re-selected 22 of 22 locators from the bytes (PDF text layer of the opinion; HTML text of Google Patents and the 10-K), text hashes matched.

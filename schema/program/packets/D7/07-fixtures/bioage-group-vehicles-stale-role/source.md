# Fixture: bioage-group-vehicles-stale-role (optional)

- url: https://www.sec.gov/Archives/edgar/data/1709941/000119312526166738/bioa-20260421.htm
- title: BioAge Labs, Inc. — Schedule 14A definitive proxy statement (accession 0001193125-26-166738, 2026-04-21)
- retrieved: 2026-10-08
- snapshot digest: sha256:d6c25348e3f7d1ea7ae6c3957ad53222ae86705fdf5fe42102970847fed195f9
- kind: disconfirmation
- tool: curl with the declared SEC User-Agent (EDGAR_IDENTITY, not printed), `--compressed`; raw HTML 743,827 bytes (RAW_BYTES digest, identical to the research-stage capture on the same day). Adversarial-review note: EDGAR appends a bot-manager <script src="/…"> tag with a rotating path before </body>, so this RAW_BYTES digest does not reproduce on a later fetch (a re-fetch on 2026-10-08 differed only in that tag); verify by the projection digest (canonicalProjectionHash in locators.yaml) or by the raw bytes with the trailing injected tag removed (sha256:e016263fd23a58c43e577c161f01d49c535a7552890fa7d45b1a063c4e1b284d). Offsets index the h2t.py text projection (sha256:9c2d55e09f7d66113bee8396a6ca99bbe66bb9c5a6dc99e9d80eb77a33ef8403).
- capture files (scratch, not committed): `ft/D7/fix/bioa_def14a_2026.htm|.txt`.

## Description

BioAge Labs' 2026 proxy statement. The beneficial-ownership table lists "Entities affiliated with Andreessen Horowitz" at 7.28 %; footnote (1) decomposes that group into fund vehicles holding shares of record, their general-partner LLCs that "may be deemed" to control voting and disposition, and the managing members of those LLCs. The fixture keeps the group (CORPORATE_GROUP) apart from its vehicles (PARENT_OF GROUP_MEMBER_UNSPECIFIED to members, GENERAL_PARTNER_OR_MANAGING_MEMBER from GP to fund) and from the venture firm as an employer, and labels the group-level stake as aggregated (Q-D7-14). The disconfirmation: the same proxy states that a sitting director served at Andreessen Horowitz "From September 2014 to June 2025 … most recently as a General Partner since September 2015" and that he "departed from Andreessen Horowitz in June 2025." The closed HOLDS_ROLE episode (validTo 2025-06, MONTH) lets Q-D7-17 flag any later statement that still presents him in that role (OVERLAP returns DISJOINT), while his BioAge board role stays open.

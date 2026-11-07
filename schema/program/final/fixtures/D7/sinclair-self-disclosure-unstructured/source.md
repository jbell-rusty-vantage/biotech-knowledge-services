# Fixture: sinclair-self-disclosure-unstructured

- url: https://sinclair.hms.harvard.edu/david-sinclairs-affiliations
- title: David A. Sinclair's Affiliations | The Sinclair Lab
- retrieved: 2026-10-08
- snapshot digest: sha256:4a360dd31a561a81b4a6fc70ec16f890322f6dcbe860aab7e31b78ff69688f3f
- kind: unstructured-to-entity
- tool: Firecrawl CLI 1.23.1 `firecrawl scrape <url> --only-main-content --max-age 0` (markdown, 25,505 bytes; re-captured 2026-10-08T21:39:47Z, digest identical to the research-stage capture). Digest basis: the Firecrawl markdown (NORMALIZED_TEXT), not the server's HTML bytes.
- second source (structured corroboration): https://www.sec.gov/Archives/edgar/data/1751806/000175180626000003/primary_doc.xml · SEC Form D, Life Biosciences LLC (accession 0001751806-26-000003, signature date 2026-04-24) · retrieved 2026-10-08 · snapshot digest sha256:6788d860a7a17a1f19bd9485a3c91751246a9a4435b819337e24861048331287 (raw XML bytes) · tool: curl with the declared SEC User-Agent (EDGAR_IDENTITY from .env, not printed).
- capture files (scratch, not committed): `ft/D7/fix/sinclair_affil.fc.md`, `ft/D7/fix/formd_lifebio_2026.xml`; builder `ft/D7/tools/build_locators.py`.

## Description

A scientist's self-published list of past and present company ties, printed as one line per counterparty with single-letter codes (F, I, E, A, B, IP, L), year ranges and a "(Updated Oct 8th, 2024)" as-of date, plus a disclaimer that the list is not a formal list of affiliations. It is the packet's unstructured-to-entity case (00-DIRECTIVE 3.8): free text becomes HOLDS_ROLE, HOLDS_STAKE and RECEIVES_VALUE_FROM episodes from the Person, a group-versus-member PARENT_OF (GROUP_MEMBER_UNSPECIFIED) for "MetroBiotech International, an EdenRoc Sciences company … NAD boosters", and a closed board episode (InsideTracker "B (2011-2017)") next to open ones on the same line. The walk question → chunk (MENTIONS or the vector index) → assertions → SourceLocator → SourceSnapshot bytes is written out in `assertions.yaml` (`unstructuredPath`). The SEC Form D names a related person "David Sinclair" as Director of Life Biosciences LLC with no identifier: that link is a RESOLUTION Assessment (`as-res-01`), not a merge, and the role-agreement synthesis (Q-D7-08) is conditional on it. Locator offsets index the capture text after mapping U+00A0 to U+0020 (length preserving): the page separates link text from the following words with a no-break space.

## Exercises

HOLDS_ROLE (F, B, A; a closed 2011–2017 board episode), HOLDS_STAKE (I and E as separate episodes; group-level holder target), RECEIVES_VALUE_FROM (IP, L), PARENT_OF (GROUP_MEMBER_UNSPECIFIED), kernel RESOLUTION / EVIDENCE_SYNTHESIS (D7.role-agreement) / QUALITY (D7.disclosure-coverage) Assessments, Mention staging (Form D name, InsideTracker brand).

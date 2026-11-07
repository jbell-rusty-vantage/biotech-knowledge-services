# D11 — Bio-medical tooling action space

Lens: AI. Current coverage: none in the schema. Prior work: the capability-layer checkpoint in `biotech-meta/docs/checkpoints/agent-capability-layers/2026-07-19-biotech-research-agent-capability-layers.md` (web, literature, trials, normalization, documents, storage layers with suggested tool families such as `trials.*`) and the source-intelligence checkpoints under `biotech-meta/docs/checkpoints/source_intelligence/`.

## Scope

The universe of biomedical tooling and sources an agent can act on: search, fetch, parse, resolve, verify, compute; for each: access mode, auth, limits, identifiers emitted, locator kinds possible, agent-readiness, and the custom tooling gap. The output decides which Source kinds, Identifier schemes and SourceLocator kinds the kernel supports and which domains can be populated at all. Premise (the owner's, and Anthropic's published case studies): most of this infrastructure is not agent-ready, and we will build custom tooling on top of it, prioritized by domain. Out of scope: building the tools (follows from the gap list); general web tooling already covered by Firecrawl and the verification executor.

## Ecosystem to survey

Per domain, the authorities and aggregators listed in the D1–D9 briefs; the MCP servers attached to this workspace (PubMed, Clinical Trials, bioRxiv, ICD-10, NPI, the Firecrawl research index) and public biomedical MCP servers; the NCBI E-utilities and NLM API families; EBI services; OpenAlex, Crossref, Unpaywall; openFDA; Europe PMC annotations; how teams in published case studies built search-and-parse layers for biomedical literature, trials and regulatory documents; licensing constraints (KEGG, LOINC, DrugBank, Natural Medicines, Crunchbase); rate limits and bulk-download alternatives; parser needs (PDF tables in COAs and labels, Supplement Facts panels, registry XML, transcripts).

## Seed questions

- For each tool: what does it return, with which identifiers, can a locator be produced that `verification.v1` can re-select, and what is the failure mode under load?
- Which identifier schemes bridge domains (UNII ↔ PubChem ↔ CAS; NCT ↔ PMID ↔ DOI; GTIN ↔ ASIN; LOINC ↔ vendor codes), and where do the bridges not exist?
- Which sources must be captured by scrape with change tracking because no API exists (brand pages, protocol pages, certification databases)?
- Which parsing problems recur (Supplement Facts panels, COA tables, registry version diffs, transcript alignment) and justify a custom parser?
- What is the minimum agent action set per domain (the `trials.*`, `literature.*`, `substances.*` style families), and what exists versus must be built?

## Registry

`tooling/action-space.yaml`, one entry per tool or source, fields per PLAN 6.3: `id, domains, kind, provider, access, auth, rateLimits, identifiersEmitted, locatorKinds, readiness (0–3), gap, priority, owner`. Readiness: 0 blocked or licensed-out; 1 scrape only; 2 API without stable locators; 3 agent-ready (API, stable identifiers, re-selectable locators).

## Deliverables

`tooling/action-space.yaml` with first-tier scoring; `../packets/D11/` with the gap list prioritized by which D1–D9 questions each gap blocks; the readiness scorecard; the identifier-bridge table for the kernel; recommendations on which MCP servers to adopt, wrap or replace.

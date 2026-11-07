# Fixture: elysium-paper-funding-award

- url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC10903100/fullTextXML
- title: Nicotinamide riboside, pterostilbene and ibudilast protect motor neurons and extend survival in ALS mice (Neurotherapeutics 21(1):e00301, published 2023-12-19; PMID 38241160; PMCID PMC10903100; DOI 10.1016/j.neurot.2023.10.011)
- retrieved: 2026-10-08
- snapshot digest: sha256:16bc07a4706a4763572deb3369d6405a5622c5fd69f996758b600edb6c0bae29
- kind: other
- fixture role: funding vs competing interests in one paper (CQ-EC-04) and the Award node with AWARDED_BY / AWARDED_TO (Q-D7-05, Q-D7-15, Q-D7-25).
- tool: curl Europe PMC REST `/{PMCID}/fullTextXML` (JATS XML, 183,100 bytes, RAW_BYTES digest, identical to the research-stage capture); PubMed MCP `get_article_metadata` (research stage) for the identifiers. Locator offsets index the raw XML; an XPath refinement is recorded per locator.
- second source: https://api.reporter.nih.gov/v2/projects/search (POST, criteria.project_nums ["R01AG082737*"], sorted by fiscal year descending) · NIH RePORTER project records for R01AG082737 (4 fiscal-year rows; locators point into results[0], the FY2026 row 5R01AG082737-04) · retrieved 2026-10-08 · snapshot digest sha256:e201b208933ee412c7203459bf9ab90525ee780de567726dbba3956db1c500eb · curl, no auth. A POST search response is not a stable URL: the snapshot is the response body; the canonical record URL would be the RePORTER project page (readiness note in 08).
- capture files (scratch, not committed): `ft/D7/fix/epmc_PMC10903100.xml`, `ft/D7/fix/nihrep_R01AG082737.json`.

## Description

An ALS-mouse paper testing nicotinamide riboside, pterostilbene and ibudilast whose funding section and competing-interest declaration name the same company in four different ways: as a source of grants with award numbers ("Elysium Health Inc. (USA) (OTR2017-18255INVES and OTR2018-19337INVES)"), as the provider of "financial support" to one author, as the employer of another author (also his listed affiliation), and as the assignee of an author's patent publication ("#US2022/0160745A1 issued to Elysium Health Inc." — A1 is an application kind code; the grant status is a D8 check). The fixture keeps the four apart (CQ-EC-04): Award + AWARDED_BY (structural) for the grants, RECEIVES_VALUE_FROM for the author's support, HOLDS_ROLE EMPLOYEE for the employment, and a predicate-only INVENTOR_ON_PATENT_ASSIGNED_TO Assertion. Which party issued the OTR numbers (the University of Valencia or the company, named together in one clause) is recorded as an open reading, not resolved. The NIH RePORTER record adds an Award with a funder (National Institute on Aging), a recipient institution and a contact PI (AWARDED_TO → Organization and → Person), a per-fiscal-year amount as a literal (not a total), and a RESOLUTION hypothesis linking the PI to the Person of the Sinclair fixture.

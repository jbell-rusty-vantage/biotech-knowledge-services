# Fixture rapa-ex-01-attia-retelling — source (FC-4)

- url: https://peterattiamd.com/rapamycin-plus-exercise-trial
- title: Disappointing results from the first rapamycin-plus-exercise trial (Peter Attia MD, 2026-05-02), retelling RAPA-EX-01 (PMID 41985884, PMCID PMC13082878, DOI 10.1002/jcsm.70274, ACTRN12624000790549)
- retrieved: 2026-10-08
- snapshot digest: sha256:52a977f7617793d3f1a9c8b1f91c2890a4f6566a3b50b9377096ca81a7eb4cbf
- kind: disconfirmation
- tool: firecrawl CLI 1.23.1 `scrape --only-main-content --max-age 0` (tool:firecrawl-scrape) for the article (re-fetch identical); Europe PMC REST full-text XML via curl for the trial (re-fetch identical); PubMed MCP `get_article_metadata` for identifiers and the author list (2026-10-08)
- original url: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13082878/fullTextXML · sha256:9d139b7a222fa364d43cd14bf3dc05e77d5e908646ee830a553b721a60c8cebb

RAPA-EX-01 is a negative randomized trial: once-weekly sirolimus did not enhance, and in sensitivity analyses may have attenuated, functional gains from exercise in older adults. The trial reports the grip-strength difference twice — "−1.13 kg" in the abstract and "−1.19 kg" in the results, with the same CI and p value. A prominent retelling on peterattiamd.com (byline Taylor Yeater, Michael Rae, Peter Attia) accepts the numbers, retells "−1.19 kg (p=0.344)" and the HbA1c and pneumonia safety findings, and contests the implication ("a long way from the death knell for rapamycin"). Retelling fidelity is therefore assessed against a located span: the retold number matches the results span, not the abstract span, and the retelling carries a safety finding (HbA1c) that the abstract omits. The paper's conflict-of-interest statement names an author who is CEO of and holds equity in Optispan and an author with YouTube advertising revenue and a supplement company (researcher-influencer seam with D7).

## Relationships exercised

PUBLISHES, RENDITION_OF, OCCURS_IN (ret-*), APPEARS_IN (AUTHOR ×3), kernel DERIVED_FROM ret-grip → orig-res (−1.19, results) and not orig-abs (−1.13, abstract), RETELLING_FIDELITY assessments (rf-grip, rf-safety), D7 HOLDS_ROLE / HOLDS_STAKE / RECEIVES_VALUE_FROM from the paper's COI, RESOLUTION of author initials.

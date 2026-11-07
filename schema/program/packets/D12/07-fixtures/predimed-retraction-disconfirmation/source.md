# Fixture — PREDIMED 2013 (retracted) and 2018 (corrected and republished): disconfirmation of a longevity-food claim

- url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23432189,29897866&retmode=xml
- title: PubMed XML for Estruch R et al., "Primary prevention of cardiovascular disease with a Mediterranean diet", N Engl J Med 2013;368(14):1279-90 (PMID 23432189, DOI 10.1056/NEJMoa1200303, Retracted Publication) and "Primary Prevention of Cardiovascular Disease with a Mediterranean Diet Supplemented with Extra-Virgin Olive Oil or Nuts", N Engl J Med 2018;378(25):e34 (PMID 29897866, DOI 10.1056/NEJMoa1800389, Corrected and Republished Article); retraction notice PMID 29897867 (DOI 10.1056/NEJMc1806491); trial ISRCTN35739639
- retrieved: 2026-10-08
- snapshot digest: sha256:29d54857a3360ca03356e68e434f90d2bf587f7e015618858d5dab0133bc77a3
- kind: disconfirmation
- second snapshot (adversarial review): https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29897867&retmode=xml — the retraction notice "Retraction and Republication: Primary Prevention of Cardiovascular Disease with a Mediterranean Diet. N Engl J Med 2013;368:1279-90." (PublicationType Retraction Notice; ArticleDate Electronic 2018-06-13; PubDate 2018 Jun 21; PubMed entry 2018-06-14), retrieved 2026-10-09T01:50:03Z, digest in locators.yaml (snap-predimed-notice)
- tool: curl, NCBI E-utilities `efetch db=pubmed retmode=xml` (research capture 2026-10-08T20:55:00Z). The PubMed MCP `get_article_metadata` returned no publication types and no retraction links for 23432189, so E-utilities XML is the source of record. Fixture-stage re-fetch 2026-10-08T21:37:13Z: byte-identical.

## What it demonstrates

An alleged longevity food pattern (Mediterranean diet with extra-virgin olive oil or nuts) whose flagship evidence was retracted and republished. Pattern definitions: three trial-arm `DietaryPattern`s with `PATTERN_COMPONENT` roles taken from the 2018 abstract — EVOO arm EMPHASIZES extra-virgin olive oil, nuts arm EMPHASIZES mixed nuts, control "advice to reduce dietary fat" LIMITS total fat (D1 Constituent). Claim timeline (kernel): one `Claim`, two claim occurrences by the same asserter — 2013 (epub 2013-02-25) "a Mediterranean diet supplemented with extra-virgin olive oil or nuts reduced the incidence of major cardiovascular events" (causal) and 2018 (epub 2018-06-13) "the incidence of major cardiovascular events was lower among those assigned to …" (comparative) — plus revision-status assertions (kernel HAS_REVISION_STATUS, one per authority: PubMed "Retracted Publication" and "Corrected and Republished Article"; NEJM's notice "Retraction and Republication", e-published 2018-06-13, print issue 2018 Jun 21) and the authors' own statement that the revised estimates "do not rely exclusively on the assumption that all the participants were randomly assigned". The effect estimate barely moves (HR 0.70 → 0.69), so the disconfirmation is of the causal wording and the randomization claim, not of the direction: a test of the verdict lattice with as-of answers. The vetting verdicts in assertions.yaml are expected fixture values, not a real mission's result.

## Relationships exercised

- PATTERN_COMPONENT — `hu:assertion:ft-d12-pred-01` (EMPHASIZES EVOO), `-02` (EMPHASIZES mixed nuts), `-03` (LIMITS total fat)
- predicate-only IMPROVES_TARGET as claim occurrences — `ft-d12-pred-04` (2013), `ft-d12-pred-07` (2018); revision status (kernel HAS_REVISION_STATUS) — `-05` (PubMed), `-05b` (NEJM notice), `-06` (PubMed, republication)
- seams: kernel Claim / OCCURRENCE_OF / VETTING Assessment; D3 ADMINISTERS (StudyArm → DietaryPattern) not written (D3 owns)

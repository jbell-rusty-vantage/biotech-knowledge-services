# Fixture: LiverTox green tea extract (likelihood A) and ashwagandha (likelihood B) (harm)

- url: https://ftp.ncbi.nlm.nih.gov/pub/litarch/29/31/livertox_NBK547852.tar.gz
- title: LiverTox: Clinical and Research Information on Drug-Induced Liver Injury (NIDDK), monographs "Green Tea" (updated 2020-11-20, member livertox_NBK547852/GreenTea.nxml) and "Ashwagandha" (updated 2024-12-03, member livertox_NBK547852/Ashwagandha.nxml)
- retrieved: 2026-10-08
- snapshot digest: sha256:15012b346e687758703513375e452a594be4f4da7f7085445283c34715090e86
- kind: harm
- tool: tool:ncbi-litarch (curl of the NCBI literature-archive bulk file, then tar member extract)
- other digests: Ashwagandha.nxml sha256:4d8afc346940a13c8a70ed788d890e187a9b8dc393a65731dcd2d2ac0c9f2a36; archive sha256:c6d016bace6318bf9de5878cdf4a74956f2b2cbe3d6621e393f5d8f733c55f2d (196,034,904 bytes; Last-Modified Thu, 08 Oct 2026 06:40:21 GMT)
- re-fetch: the 196 MB archive was downloaded again at 2026-10-08T21:39Z; archive and both members are byte-identical to the research capture; the archive was deleted from scratch after extraction (members kept)
- access note: the Bookshelf HTML (https://www.ncbi.nlm.nih.gov/books/NBK547925/) is reCAPTCHA-walled for curl, Tavily and Firecrawl; the bulk archive is the agent-reachable route and its `<sec id>` values are the section selectors

## What the fixture shows

LiverTox grades the monograph subject "Green Tea" with "Likelihood score: A (well established cause of clinically apparent liver injury)", while stating that drinking green tea "has not been associated with liver injury" and that the case evidence concerns green tea extract (GTE), with a small number of cases after green tea infusions. The fixture keeps the source's own subject on the grade assertion and lets a BellLabs harm-causality Assessment (EVIDENCE_SYNTHESIS, subkind D10.harm-causality, effectDirection HARM) narrow it to the extract. A draft green tea profile (`composed-body-green-tea.txt`) has a HARMS_AND_AVOIDANCE section with a BLOCKED row for green tea extract (BLOCKED_BY the harm Assessment, citing the likelihood-A Assertion; rank null; LiverTox grades causality and states no avoidance for the extract, so no use constraint applies) and a not-blocked row for the beverage. The extract row carries LiverTox's own qualifiers: in the ALT study clinically apparent liver injury was not observed because the extract was quickly discontinued in patients with ALT elevations, and the prevalence of symptomatic injury is not known but undoubtedly low relative to use. A draft ashwagandha profile (`composed-body-ashwagandha.txt`) has a BLOCKED row scoped to people with cirrhosis or advanced chronic liver disease (BLOCKED_BY the D5 UseConstraint "ashwagandha in cirrhosis or advanced chronic liver disease", which the avoidance Assertion resolves to, and the harm Assessment; the row ASSESSES only ashwagandha, the condition scope is the constraint's). The adulteration caveat of the Ashwagandha monograph is captured as a qualifying input.

## Files

- `locators.yaml` (9 locators, 2 snapshots) · `assertions.yaml` (8 assertions, 2 assessments, 1 D5 use constraint, 2 reports, 5 items) · `intent.json` (validated) · `questions.md` · `composed-body-green-tea.txt` · `composed-body-ashwagandha.txt`

Research is not medical advice.

# K — fixture candidates (research stage, 2026-10-08)

Seven candidates from real captures. Raw bytes are in scratch `C:\Users\Pinda\AppData\Local\Temp\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-1d90-4042-9623-ff67cb1b7809\scratchpad\ft\K\raw\`; every sha256 below is `sha256sum` over the saved file (also in `..\MANIFEST.sha256`). Offsets are **UTF-8 byte offsets, half-open `[start, end)`, into the raw captured file** (computed by `scratch\ft\K\off.js`, which also checks the quote occurs exactly once unless noted). Quotes are copied from the captures; JSON quotes keep the raw escaping (`\/`).

One story runs through FC-1 … FC-4 so the fixtures stage can build a single connected example: the proposition **"resveratrol directly activates SIRT1"** — asserted in 2003, qualified 2005, contradicted 2010, re-supported with a mechanism 2013, presupposed by a 2017 paper retracted in 2025, and still restated by sellers in 2026. That gives one `Claim`, many occurrences, an evidence mission, a report with a non-trivial lattice verdict, a retraction, and two runs for the lineage questions.

| id | role in the K packet | marks |
| --- | --- | --- |
| FC-1 | Hubbard et al. 2013 full text (PMC JATS) | **unstructured-to-entity path** (directive 3.8) |
| FC-2 | resveratrol–SIRT1 evidence set (4 PubMed records) | **disconfirmation** (evidence mission → report) |
| FC-3 | retracted 2017 paper + its 2025 notice (PubMed + Crossref) | **harm** (stale assertions, revision snapshot, late-arriving fact) |
| FC-4 | interested-party occurrences (reagent vendor, supplement brand) + verification.v1 benchmark twin | harm (promotional authority), claim occurrences |
| FC-5 | Science Feedback ClaimReviews (curcumin/green tea/lion's mane; SightCare) | harm / third-party disconfirmation, verdict mapping |
| FC-6 | Wikidata Q407329 entity + revisions | identifiers, recorded time, two "runs" |
| FC-7 | nanopublication retraction | supersession by a signed new record (supporting only) |

Planned **lineage fixture** (the third K fixture of the RUNLOG claim, "two runs of one mission over one entity"): built from FC-2 + FC-4 + FC-1 with two Mission Control runs — run R1 (activityKind INGESTION/VETTING) captures FC-4 and the Howitz abstract, writes the `Claim`, three occurrences and a VETTING assessment with disposition RESEARCH; run R2 (EVIDENCE_MISSION, `WAS_INFORMED_BY` R1) captures Kaeberlein, Pacholec, Hubbard (abstract + FC-1 body) and FC-3, writes SUPPORT adjudications and the EVIDENCE_REPORT. Q-K-04/05/06/07 then have non-trivial answers (R2 supersedes nothing of R1 but adds dependants of R1's Claim; FC-3's retraction closes an R1-era assertion).

---

## FC-1 — Hubbard et al. 2013, "Evidence for a Common Mechanism of SIRT1 Regulation by Allosteric Activators" (PMC author manuscript, JATS)

- URL: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=3799917 (human page https://pmc.ncbi.nlm.nih.gov/articles/PMC3799917/)
- Title: Evidence for a Common Mechanism of SIRT1 Regulation by Allosteric Activators
- Identifiers: PMID 23471411 · DOI 10.1126/science.1231097 · PMCID PMC3799917 (pmcid-ver PMC3799917.1) · NIHMS504463
- Retrieved: 2026-10-08 · tool: curl → NCBI E-utilities `efetch db=pmc`
- Capture: `pmc-3799917.xml`, 51,695 bytes, sha256 `ced64cfd1261ed0f62b359d7278b9f5d2931f8f814025dba2e45f3f1d31b1c44`. Companion abstract record `pubmed-23471411.xml`, sha256 `7dbca2395e1bf0472c1f1fb2012c143c1897715738faa023bc7a3b77f40913a4`.
- Quotes:
  1. "However, the legitimacy of STACs as direct SIRT1 activators has been widely debated." — body paragraph 2 (`<p>` index 1), bytes [15518, 15602)
  2. "Thus, allosteric activation of SIRT1 by STACs remains a viable therapeutic intervention strategy for many diseases associated with aging." — last body paragraph (`<p>` index 13), bytes [28223, 28360)
  3. "Thus, SIRT1 can be directly activated through an allosteric mechanism common to chemically diverse STACs." — abstract, bytes [12094, 12199) in `pmc-3799917.xml`; the same sentence at bytes [1830, 1935) in `pubmed-23471411.xml`
  4. "Yet controversy exists around the mechanism of sirtuin-activating compounds (STACs)." — abstract, bytes [1294, 1378) in `pubmed-23471411.xml`
- **Unstructured-to-entity demonstration** (directive 3.8): user question "does resveratrol really activate SIRT1?" → D9 chunks of the JATS body (paragraph-level) found via MENTIONS(resveratrol, SIRT1) or vector index → chunk containing quote 1 and the following sentences → assertions: (a) claim occurrence of the Claim with `speechAct STATES`, `polarity POSITIVE`, qualifier "assisted allosteric activation; substrate-dependent (hydrophobic motifs)" from quote 3; (b) a context occurrence (quote 1, `EvidenceRole CONTEXT`) recording the debate → `SourceLocator {selectorKind CHARACTER_POSITION (utf8_bytes) or TEXT_QUOTE, exact, prefix, suffix}` → `SourceSnapshot {contentHash sha256:ced64c…, captureMethod efetch-pmc, retrievedAt 2026-10-08}` → the verifier's re-selection must produce the same `selectedContentDigest`. Rendition note: this is the author manuscript, not the Science version of record — two Sources (D9 container decides their equivalence).
- Answers: Q-K-14, Q-K-20, Q-K-21, Q-K-01, Q-K-26.

## FC-2 — the resveratrol–SIRT1 evidence set (PubMed XML abstracts)

- URLs: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={12939617,15684413,20061378,23471411}&retmode=xml
- Titles / identifiers:
  - Howitz KT et al. "Small molecule activators of sirtuins extend Saccharomyces cerevisiae lifespan." Nature 2003 · PMID 12939617 · DOI 10.1038/nature01960
  - Kaeberlein M et al. "Substrate-specific activation of sirtuins by resveratrol." J Biol Chem 2005 · PMID 15684413 · DOI 10.1074/jbc.M500655200
  - Pacholec M et al. "SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1." J Biol Chem 2010 · PMID 20061378 · DOI 10.1074/jbc.M109.088682 · PMC2832984 (XML download refused by publisher)
  - Hubbard BP et al. 2013 (FC-1) · PMID 23471411
- Retrieved: 2026-10-08 · tools: PubMed MCP `search_articles` (discovery), curl → E-utilities `efetch db=pubmed`
- Captures and sha256: `pubmed-12939617.xml` `eefeb54674e35dac24d9259fe983e4d00762ddc130e01000f92a1d1f84b82ee5` · `pubmed-15684413.xml` `6cc06a1b3791d87a75a2d24add303aba5697869dca3e6d4125b81f4c1ea0fe7d` · `pubmed-20061378.xml` `ef3a2a1ca835bfbcbdac6e1805d5488ca7757cf1d5f5d8e75f40211f7834a381` · `pubmed-23471411.xml` `7dbca2395e1bf0472c1f1fb2012c143c1897715738faa023bc7a3b77f40913a4`
- Quotes:
  1. "We show that the potent activator resveratrol, a polyphenol found in red wine, lowers the Michaelis constant of SIRT1 for both the acetylated substrate and NAD(+), and increases cell survival by stimulating SIRT1-dependent deacetylation of p53." — Howitz 2003 abstract, `pubmed-12939617.xml` bytes [1617, 1861)
  2. "We show here that resveratrol is a substrate-specific activator of yeast Sir2 and human SirT1." — Kaeberlein 2005 abstract, `pubmed-15684413.xml` bytes [1325, 1419)
  3. "In light of these findings, the mechanism accounting for putative longevity effects of resveratrol should be reexamined." — Kaeberlein 2005 abstract (last sentence), bytes [1947, 2067)
  4. "and resveratrol do not lead to apparent activation of SIRT1 with native peptide or full-length protein substrates, whereas they do activate SIRT1 with peptide substrate containing a covalently attached fluorophore." — Pacholec 2010 abstract (sentence begins "SRT1720, its structurally related compounds SRT2183 and SRT1460,"), `pubmed-20061378.xml` bytes [2162, 2376)
  5. "Taken together, we conclude that SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1." — Pacholec 2010 abstract (last sentence), bytes [2843, 2954)
- **Disconfirmation case**: Claim "resveratrol directly activates SIRT1" (propositionHash over the normalized proposition). Occurrences: Howitz (POSITIVE, STATES, DIRECT_MEASUREMENT), Kaeberlein (QUALIFIES: substrate-specific, fluorophore-dependent), Pacholec (CONTRADICTS), Hubbard (SUPPORTS with qualification). Vetting assessment disposition RESEARCH → evidence-mission Activity → EVIDENCE_REPORT with a lattice verdict that is **not** a simple yes/no (candidate: MIXED_OR_CONFLICTING for "direct activation in general"; SUPPORTED_WITH_QUALIFICATION for "activation of substrates with hydrophobic motifs at +1/+6") — this forces the report to carry the proposition variant it judged (a refined Claim linked by an EQUIVALENCE/refinement assessment, research-notes §4). Pacholec also gives an off-target/harm-relevant sentence ("exhibit multiple off-target activities against receptors, enzymes, transporters, and ion channels" — same abstract) for D5.
- Answers: Q-K-08, Q-K-09, Q-K-11, Q-K-19, Q-K-21, Q-K-25, Q-K-26.

## FC-3 — retraction: Mol Med Rep 2017 (retracted 2025) and its notice

- URLs: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29039533&retmode=xml · …&id=40613201… · https://api.crossref.org/v1/works/10.3892/mmr.2017.7773 · https://api.crossref.org/v1/works/10.3892/mmr.2025.13603
- Titles: "SIRT1 activation by resveratrol reduces brain edema and neuronal apoptosis in an experimental rat subarachnoid hemorrhage model." (PMID 29039533, DOI 10.3892/mmr.2017.7773) and "[Retracted] SIRT1 activation by resveratrol reduces brain edema …" (retraction notice, PMID 40613201, DOI 10.3892/mmr.2025.13603, PMC12235689)
- Retrieved: 2026-10-08 · tools: Crossref REST (`filter=update-type:retraction` discovery, then `/works/{doi}`), E-utilities `esearch` by `[doi]` and `efetch`
- Captures and sha256: `pubmed-29039533.xml` `d3f8f6832814df4256aa095f9fc35205b63f7415bc13aab57d351fc307f6711b` · `pubmed-40613201.xml` `2a10444d959f30a759e8fb991667b43c78b5340e7cb2c01ce1afed1ddeedbaec` · `cr-10_3892_mmr_2017_7773.json` `1235493964e0e94722dea735d983484a2e33cf87df1ad90453c8046116082901` · `cr-10_3892_mmr_2025_13603.json` `4458c21ac237fbaedf3a541a76940b7c2e3f8754eaaa2255a055371fe643f648` · discovery list `cr-retractions-resveratrol.json` `0b4664962a3bf3313453ac4c9e8aa822a3effc7f2a97282ed6d34ed29210acc0`
- Quotes:
  1. "SIRT1 activators such as RES may have the potential to improve the prognosis of patients with SAH and clinical research should be investigated further." — retracted article abstract (last sentence), `pubmed-29039533.xml` bytes [3260, 3411)
  2. "Retracted Publication" — `PublicationType` added to the article record, `pubmed-29039533.xml` bytes [5784, 5805); `RefType` "RetractionIn" at bytes [7080, 7092)
  3. "the Editor has decided that the article should be retracted from the publication" — notice abstract, `pubmed-40613201.xml` bytes [1866, 1946)
  4. "The authors were asked for an explanation to account for these concerns, but the Editorial Office did not receive a reply." — notice abstract, bytes [1948, 2070)
  5. `"updated-by":[{"DOI":"10.3892\/mmr.2025.13603","type":"retraction","label":"Retraction","source":"retraction-watch"` — Crossref record of the original, `cr-10_3892_mmr_2017_7773.json` bytes [18289, 18404); `"record-id":"68904"` at [18505, 18524)
  6. `"update-to":[{"DOI":"10.3892\/mmr.2017.7773","type":"retraction","label":"Retraction","source":"retraction-watch"` — Crossref record of the notice, `cr-10_3892_mmr_2025_13603.json` bytes [193, 306)
- **Harm case**: an occurrence of the Claim (quote 1, plus the presupposition "The SIRT1 activator resveratrol (RES)") captured from a source that is later retracted. Model path: the 2026 capture of PMID 29039533 is a **new SourceSnapshot of the same Source** with `revisionKind RETRACTION` (PubMed DateRevised 2025-07-04; Crossref `updated` 2025-06-30, asserted by `source: retraction-watch`); the notice is its own Source; assertions resting on the old snapshot are not deleted — Q-K-10 lists them as stale and Q-K-17 flags reports citing them. Late-arriving fact (CQ-TM-02): validFrom of "retracted" = 2025-06-30 (stated by source), recordedAt = ingestion time. Identifier bonus: PubMed `ChemicalList` gives UNII Q369O8926L and MeSH D000077185 for resveratrol, the same as Wikidata (FC-6).
- Answers: Q-K-10, Q-K-17, Q-K-22, CQ-TM-02, CQ-TM-03, Q-K-06 (if the paper was ingested by a run).

## FC-4 — interested-party claim occurrences and their retellings

- URLs: https://www.activemotif.com/catalog/details/14022/resveratrol · https://megaresveratrol.net/feeds/blog/resveratrol-sirtuins-longevity
- Titles: "Resveratrol a SIRT1 (Sirtuin) activator" (Active Motif catalog) · "Resveratrol and Sirtuins: Unlocking Longevity Benefits" (MegaResveratrol blog)
- Retrieved: 2026-10-08 · tools: Tavily search (discovery), Tavily extract (markdown), curl with browser UA (raw HTML used for digests and offsets)
- Captures and sha256: `am-14022.html` (539,540 bytes) `a271f178bae756ff70a053908e64d30bcd71e2ec63bd055bb043274ba1c576b0` · `megares-sirtuins.html` (282,837 bytes) `38ab3c5178349128fe45e5da65e0639f634c636816241dd0d264ffdfa15e40d4`; markdown projections `tvo-www_activemotif_…md` `1fca8d5a…9678`, `tvo-megaresveratrol_…md` `696dce07…2ed6`
- Quotes:
  1. "Activates SIRT1 and increases longevity in yeast (ref 2)" — Active Motif "Description", `am-14022.html` bytes [490584, 490640); its reference "KT Howitz" at [491127, 491136)
  2. "Resveratrol was named a SIRT1 activator in 2003; later assays and a 2020 CRISPR study cast doubt on direct activation" — MegaResveratrol "Key takeaways", `megares-sirtuins.html` bytes [134060, 134177) (occurs twice in the HTML; first occurrence)
  3. "showing that resveratrol only appeared to activate SIRT1 because of a fluorescent tag used in early assays. Tested with the native protein, the activation disappeared." — MegaResveratrol retelling of Pacholec 2010, bytes [140380, 140547) (first of two occurrences)
  4. "Browse our full range of pharmaceutical-grade trans-resveratrol supplements online." — call to action, bytes [181347, 181430)
- Companion (internal, verification.v1 benchmark): `ai-engineer-knowledge-services/catalog/verification-benchmarks/diagnostics-companies-pilot-v4/artifacts/case-input/gl-interested-comparison-source.json` sha256 `d678ff4a908ee4193b1574543f3def6ccb853950356e55453bfbf491e5c36e9c` ("Generation Lab's comparison page calls SystemAge the most advanced and comprehensive aging-speed test in preventive healthcare.") and `…-mutated.json` sha256 `ed620b7dfc8c6262b85bae31604024f8199070b19b60aa1e0ff6fd571bd41fc6` ("An independent clinical trial establishes that SystemAge is the most advanced and comprehensive aging test."), same evidence fragment, `sourceClass: interested_party_comparison`.
- **Harm case** (authority/independence): occurrence 1 is a seller restating a 2003 proposition as present fact with a citation (Q-K-30: does the cited work say it? yes, in 2003; Q-K-21: is it independent? no). Occurrence 2–3 is a seller accurately retelling the disconfirmation while selling — accuracy and interest are orthogonal. The benchmark twin shows the capture-fidelity verdict that must REJECT an attribution swap (Q-K-16). Financial interest is D7's seam (Organization sells resveratrol).
- Answers: Q-K-09, Q-K-11, Q-K-15, Q-K-16, Q-K-21, Q-K-23, Q-K-30.

## FC-5 — third-party verdicts: Science Feedback ClaimReviews

- URLs: https://science.feedback.org/review/more-evidence-needed-confirm-association-between-alzheimers-prevention-supplements-like-curcumin-green-tea-lions-mane/ · https://science.feedback.org/review/dubious-facebook-ads-unproven-supplement-sightcare-alleged-perfect-vision-cure-macular-degeneration/ · method: https://science.feedback.org/process/
- Titles: "More evidence needed to confirm association between Alzheimer's prevention and supplements like curcumin, green tea, or lion's mane" · "Dubious Facebook ads promote unproven supplement SightCare alleged to restore 'perfect' vision and cure macular degeneration"
- Retrieved: 2026-10-08 · tools: Firecrawl MCP `firecrawl_search` (discovery), curl (raw HTML), Tavily extract (process page)
- Captures and sha256: `sf-more-evidence-needed-confirm-association.html` `9284bdb8392b939b3e4ca965580e870d90717290b4283e39f5bfce61b0823b2a` · `sf-dubious-facebook-ads-unproven-supplement.html` `69fda3419db203aa8cd1221f5fd765af9464a45d1896781b767f3254a193d22e` · `tvly-sf-process.json` `6b4bbf43b20c7132ea1ed2c39909d0859862c25b206fad31870a84fb7471fb70`
- Quotes:
  1. "There is currently genuine scientific uncertainty as to the effect of supplements such as curcumin, green tea, and lion’s mane on the prevention or progression of Alzheimer’s disease." — "Verdict detail", curcumin page bytes [116883, 117070)
  2. "There is also no evidence from studies in humans showing that curcumin, green tea, or lion’s mane can prevent the onset of Alzheimer’s disease." — body, bytes [120682, 120829)
  3. `"alternateName": "Unsupported"` — ClaimReview `reviewRating` (ratingValue 2 of 1–5), curcumin page bytes [74177, 74207); SightCare page bytes [74250, 74280)
  4. `"headline": "TBD"` and `"url": "TBD"` — `itemReviewed`, curcumin page bytes [73115, 73132) and [73972, 73984)
  5. `"claimReviewed": "Natural supplement SightCare restores “perfect 20/20 vision without glasses, contacts or surgery”"` — SightCare page bytes [72634, 72754)
- **Harm / disconfirmation by a third party**: the review is an assertion by Science Feedback (an Organization asserter) about a claim occurrence (speaker, platform, date). It must **not** become our Assessment or Report; it enters as a captured Source whose rating is an Assertion mapped to the lattice by a versioned rule ("Unsupported"/"Inadequate support" → candidate NOT_SUPPORTED or INSUFFICIENT_EVIDENCE — an open question). Time distinctions (CQ-TM-03): JSON-LD `datePublished` "29 Dec. 2023" (claim/occurrence date) vs article `datePublished` "20-12-2024" vs the visible "Posted on" date; the reel was "shared on Facebook in late November 2024" and "previously shared on TikTok in December 2023". Data-quality finding: placeholders "TBD" in structured data.
- Answers: Q-K-27, Q-K-23, CQ-TM-03, Q-K-09.

## FC-6 — Wikidata Q407329 (resveratrol): identifier crosswalk and transaction-time history

- URLs: https://www.wikidata.org/wiki/Special:EntityData/Q407329.json · https://www.wikidata.org/w/api.php?action=query&prop=revisions&titles=Q407329&rvlimit=8&rvprop=ids|timestamp|user|comment|size|sha1&format=json · lookup: `…list=search&srsearch=haswbstatement:P652=Q369O8926L`
- Title: Wikidata item Q407329 "resveratrol" (lastrevid 2497216568, modified 2026-05-25T10:22:48Z)
- Retrieved: 2026-10-08 · tool: curl (Wikidata API, polite UA)
- Captures and sha256: `wd-Q407329.json` (268,104 bytes) `9df1b256618ad7661228412034258949e0258edc212c88e4d8b7bef752f8273e` · `wd-Q407329-revs.json` `26c6d2da91f4398b043c3c9f8a677377ab3bfc2a5872de73418d4c474379014a`
- Quotes (raw JSON):
  1. `"datavalue":{"value":"Q369O8926L","type":"string"}` — P652 (UNII) mainsnak, `wd-Q407329.json` bytes [10213, 10263) (6 occurrences: mainsnak plus references that repeat the id; first is the mainsnak)
  2. `"datavalue":{"value":"501-36-0","type":"string"}` — P231 (CAS RN), bytes [9643, 9691)
  3. `[[Property:P973]]: https://ingredients.hermeticasuperfoods.com/ingredients/resveratrol-trans, Adding Hermetica` — revision comment by user "Hermeticasuperoods", 2026-04-24, `wd-Q407329-revs.json` bytes [1643, 1753)
  4. `#quickstatement` — first of the removal comments (2026-04-25, user Mahir256), bytes [754, 769)
- Use: (a) identifier fixture — Q407329 carries UNII, CAS, PubChem CID 445154, ChEBI 45713, ChEMBL CHEMBL165, MeSH D000077185, InChIKey, DrugBank DB02709, RxNorm 1000492, UMLS C0073096; each is a secondary assertion "stated in" its registry; agreement with PubMed's ChemicalList (FC-3) is an independent cross-check (Q-K-12, Q-K-29); (b) recorded-time fixture — the add batch (revisions 2484372968, 2484373002, 2484377019 on 2026-04-24 by "Hermeticasuperoods") and the removal batch (2484690167, 2484691068, 2484694097 on 2026-04-25 by Mahir256) are two "runs" of external writers, a ready illustration of Q-K-07's diff and Q-K-02's as-of; (c) promotional contamination of an aggregator, removed by another editor about 33 hours later (one observed instance; corrected in the adversarial review) (Q-K-15 context).
- Answers: Q-K-12, Q-K-29, Q-K-02, Q-K-07, CQ-AX-04 (no SIRT1 interaction statement on the item).

## FC-7 — nanopublication retraction (supporting)

- URL: https://registry.knowledgepixels.com/np/RAy3gHBIu9sF5q03V8o6GMFW0OJF_Y707uEqeCc27ec44.trig (IRI https://w3id.org/np/RAy3gHBIu9sF5q03V8o6GMFW0OJF_Y707uEqeCc27ec44)
- Title: "Retraction of RA9S21U6j4" (nanopublication, created 2026-10-08T16:00:40.536Z)
- Retrieved: 2026-10-08 · tool: curl (Nanopub Registry)
- Capture: `np-RAy3gHBIu9sF5q03V8o6GMFW0OJF_Y707uEqeCc27ec44.trig` sha256 `69ce100271dcfb2c080ef01047825abfc6fe337156a02f70ea680c88c6c301b3`; companion assertion nanopub `np-RAfdyYUR-2-EElQCzm3pIQSZ2KRso_9NtpKnNLswF5HEI.trig` sha256 `607cbc72d3fda2e982765f3ef0566b27a53b4e7d5df17a068937ac064d0f9250`
- Quotes: `npx:retracts <https://w3id.org/np/RA9S21U6j48DKwwpYhY5sYzI2lyDjIdboHH-y4FI-4Mww>` bytes [788, 868); `rdfs:label "Retraction of RA9S21U6j4"` bytes [1312, 1349)
- Use: precedent for "retract by a new signed record that points at the old one" (kernel `supersedesUid` + `recordedTo`), and for template-as-method (`nt:wasCreatedFromTemplate`). Not proposed as a packet fixture; cited in 01 and 09.
- Answers: Q-K-10 (pattern), Q-K-03 (method/template provenance analogue).

## Coverage check

- Unstructured-to-entity: FC-1. Disconfirmation: FC-2 (and FC-5 third-party). Harm: FC-3, FC-4, FC-5.
- Question ids with a fixture candidate: Q-K-01, 02, 06, 07, 08, 09, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 26, 27, 29, 30, CQ-TM-02, CQ-TM-03, CQ-AX-04; lineage fixture adds Q-K-03, 04, 05, 06, 07, 28, CQ-AX-07.
- Not covered by a real capture (synthetic or later stage): Q-K-13 (resolution hypotheses), Q-K-18 (computed state), Q-K-24 (producer error rate), CQ-AX-08.

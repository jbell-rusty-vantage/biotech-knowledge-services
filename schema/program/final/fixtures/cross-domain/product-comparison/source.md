# Cross-domain fixture: product comparison. Source.

- **url (primary):** https://api.ods.od.nih.gov/dsld/v9/label/323125
- **title:** NIH DSLD label 323125, "NiaCel 400" (Thorne), version SP654 LSP65404, entered into DSLD 2025-01-23
- **retrieved:** 2026-10-09 (all 14 snapshots, 04:19:41Z–04:25:19Z UTC)
- **snapshot digest (primary):** sha256:f76f932080400688993edc41e571dad97bee30f9f40b88f3ef6ce4dc73997ff0. RAW_BYTES, 4,933 B.
- **kind:** comparison. It also covers disconfirmation: a declared "500 mg nicotinamide riboside" is not 500 mg of the moiety, one snapshot states two prices, and a covered lot is checked.
- **modules:** D6 (product, label, offer), D1 (material, substance, moiety, CALCULATED amounts), D8 (certification listing, lot), D10 (criteria, comparison report) and K (lineage, evidence).
- **tool:**
  - curl 8 with a browser User-Agent, for every snapshot. The script is the scratch `bin/capture.sh`.
  - Firecrawl `firecrawl_scrape` (maxAge 0) was used only to probe the Thorne page. That rendering is not a snapshot of this fixture.
- **fixture ids:** mission `mission:ft-S-xfx`. Runs `run:ft-S-xfx-product-ingest` (INGESTION), `run:ft-S-xfx-product-project` (PROJECTION, d1-amounts/v1) and `run:ft-S-xfx-product-compare` (ANSWER, bl-compare/v1). These are fixture ids, not live Mission Control ids.

## Snapshots

All snapshots were captured fresh on 2026-10-09. The sha256 is of the raw bytes. `locators.yaml` repeats each one with its retrievedAt and bytes.

| snapshot | url | what it gives | sha256 |
| --- | --- | --- | --- |
| DSLD 323170, Tru Niagen 300 mg (ChromaDex), V12.3 | https://api.ods.od.nih.gov/dsld/v9/label/323170 | the "Niagen" 300 mg line, its form nicotinamide riboside chloride (UNII 8XM2XT8VWI) and 1–3 capsules a day | d90025929a353034c6c549b41eb1558e7673ce3eba2a0109ca48fed9830c003d |
| DSLD 323125, NiaCel 400 (Thorne), SP654 LSP65404 | https://api.ods.od.nih.gov/dsld/v9/label/323125 | the "Nicotinamide Riboside Hydrogen Malate" 415 mg line (no UNII, no form), 1 capsule a day and the seal "NSF Certified Sport" | f76f932080400688993edc41e571dad97bee30f9f40b88f3ef6ce4dc73997ff0 |
| DSLD 298081, NiaCel 400 (Thorne), SP654 LSP65403 (previous label) | https://api.ods.od.nih.gov/dsld/v9/label/298081 | the same line, at 1–2 capsules a day | 3fea23ce9945b8498be75864b118c12a5214bc582cc771b571649de9a298b332 |
| DSLD 333430, Liposomal Nicotinamide Riboside+ (Codeage), Nr 23.2304.23L | https://api.ods.od.nih.gov/dsld/v9/label/333430 | the "Nicotinamide Riboside" 500 mg line; DSLD puts the moiety UNII 0I8H2M0L7N on the row and gives no form; "NR - TMG - Pterostilbene phospholipid complex" | bbb1d1a2564c059191c852a251233182e1076ca434a1eb184cf2bdeb1d22b2ba |
| FDA GSRS 8XM2XT8VWI (NR chloride), full view, record v18 | https://gsrs.ncats.nih.gov/api/v1/substances(8XM2XT8VWI)?view=full | molecular weight 290.7006 and ACTIVE MOIETY → 0I8H2M0L7N | 1a3167f256ef0426c33d505f49e91c523392046d0edcbec97c9d36c976eab58b |
| FDA GSRS 0I8H2M0L7N (NR), full view, v24 | https://gsrs.ncats.nih.gov/api/v1/substances(0I8H2M0L7N)?view=full | molecular weight 255.2476 and the PUBCHEM code 439924 (PRIMARY) | 3316792f5779d6e2a6c179ae2d5956d662250736e9c35a209f678ed434a8a9ad |
| PubChem CID 146673021, properties | https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/146673021/property/MolecularFormula,MolecularWeight,InChIKey,IUPACName/JSON | C15H20N2O10, molecular weight 388.33 and the IUPAC name (NR cation; (3S)-hydrogen malate) | 5497e09d836271cf139dedc45ced8190420463faee3452217fe0194d2d4ed0e5 |
| PubChem CID 146673021, synonyms | https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/146673021/synonyms/JSON | "Nicotinamide riboside malate" | 16442d4def5e2d9895b0e3d6098efbd34f51a900cf4f51d3ecf8c3c85ff29ef7 |
| PubChem CID 146673021, component CIDs | https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/146673021/cids/JSON?cids_type=component | components 222656 and 439924 | a16db13d60129ad317900a757a864a692f7988628de97f796e04775af9aba174 |
| NSF Certified for Sport listing 1263423 | https://www.nsfsport.com/certified-products/listing-detail.php?id=1263423 | "TRU NIAGEN® 300mg": Lot # All, Package Size 30, 60, 90, United States | e0f0b05e0c911848b23eda2005e4bcfec064eceaac7f25dcb2bad30d329262a8 |
| NSF Certified for Sport listing 1423140 | https://www.nsfsport.com/certified-products/listing-detail.php?id=1423140 | "Thorne® NiaCel 400®": 19 lot codes, Package Size 60, United States | fe7f5eb6fb379c4016c354b23d75b59222b05ae04b8c5865739aa61a0c224a51 |
| NSF/ANSI 173 listings, TradeName=nicotinamide | http://info.nsf.org/Certified/Dietary/Listings.asp?TradeName=nicotinamide& | Codeage LLC, "Liposomal Nicotinamide Riboside+", Product ID All; "current as of Friday, October 9, 2026 at 12:15 a.m. Eastern Time" | b0045665dcae22dff20594e82b4e19e747e1ec1700346d487f78c609f78dd943 |
| Thorne product page, NiaCel® 400 (server-rendered HTML) | https://www.thorne.com/products/dp/niacel-400 | the rendered price "$74 /60 Capsule(s)", the schema.org Offer `"price":44`, the sku SP654 and the 415 mg row | 572faadab7de6f04d87a9dc2dfc5d24681a0ea55c649d71cfae56437df3a8a83 |
| truniagen.com Shopify product JSON | https://www.truniagen.com/products/tru-niagen-300mg.js | variant "30": price 4900 (minor units) and barcode 850015311857 | 4c2f6a1c3c33b4e5f64353b733bb18fa1ec1249e62054b30c2cd8681255c090a |

Some captures match captures that packet fixtures made on 2026-10-08, byte for byte:

- The DSLD 323170 and both GSRS records match `packets/D1/07-fixtures/nr-salt-moiety-us-canada`.
- The truniagen.com JSON matches `packets/D6/07-fixtures/offer-roles-price-kinds-truniagen` (capture shopify-tn-live).

The NSF/ANSI 173 page also appears in `packets/D8/07-fixtures/certification-listing-lot-scope`. Its bytes differ from the D8 capture because its "current as of" timestamp changed. The listing row is the same.

## Description

Three US dietary supplements declare nicotinamide riboside (NR) in three different ways.

- **Tru Niagen 300 mg** declares "Niagen" 300 mg. The form is NR chloride, so the amount is on a salt basis.
- **NiaCel 400** declares 415 mg of a different salt, "Nicotinamide Riboside Hydrogen Malate". DSLD gives it no UNII and no form. GSRS has no record of it; a GSRS search returned 0 hits. It was resolved to PubChem CID 146673021 ("Nicotinamide riboside malate", C15H20N2O10, molecular weight 388.33). That resolution is PROPOSED, and the HAS_ACTIVE_MOIETY link to the NR cation is BellLabs curation over the PubChem component list and the GSRS PubChem code.
- **Liposomal Nicotinamide Riboside+** declares "Nicotinamide Riboside" 500 mg with no salt at all. DSLD maps the row to the moiety UNII, which identifies the substance but not the mass basis.

The PROJECTION run writes the D1 moiety amounts as CALCULATED Assertions, using rule:mw-ratio.v1 and rule:daily-max.v1 (unrounded values are in `_runlog/xfx-product.md` section 5):

- **Tru Niagen:** 263.4 mg NR per capsule, and 790.2 mg/d at the label's 3-capsule maximum.
- **NiaCel 400 (current label):** 272.8 mg NR per capsule, and 272.8 mg/d at 1 capsule.
- **NiaCel 400 (previous label):** 545.6 mg/d at 2 capsules.

The Codeage line gets a FIELD_NOT_REPORTED Assertion instead of an amount.

Quality records (D8) are three NSF listings:

- **Tru Niagen:** NSF Certified for Sport covers the 300 mg capsule variant with "Lot # All".
- **NiaCel 400:** NSF Certified for Sport covers 19 named lots.
- **Codeage:** NSF/ANSI 173 lists the product with "Product ID All".

A versioned, fixture-illustrative criteria set, `bl:compare:nr-products@1`, has five DecisionCriterion records. It computes the comparison at query time: NiaCel 400 ranks first, Tru Niagen second, and Codeage is NOT_EVALUATED. A draft COMPARISON Report freezes the same rows. Its status is PROPOSED and it is not published. Every row cites the Assertions and Assessments it rests on.

Price per 100 mg of NR is not computed for any option, and each reason is a cited record:

- **Thorne:** one snapshot states both $74 and 44 USD.
- **Tru Niagen:** the brand store's 30-count has GTIN 00850015311857, while the DSLD label's package is 00850015311116, and no label version for the store package was captured.
- **Codeage:** no offer was captured.

## What it exercises

- **D6.**
  - `HAS_VARIANT` ×3, `HAS_PACKAGE` ×4, `HAS_OFFER` ×2 (structural).
  - `HAS_LABEL_VERSION` ×4 (episodes from the DSLD entry date, PUBLICATION_PROXY).
  - `DECLARES_COMPONENT` ×4: one Assertion per line (R-87), with ComponentLineProperties massBasis SALT_FORM ×3 and UNSPECIFIED ×1.
  - `NAMES_RESPONSIBLE_PARTY` ×3 and `LISTING_FOR` ×2.
  - FIELD assertions: MAX_DAILY_SERVINGS ×4 and OFFER_PRICE_ONE_TIME ×3.
  - Predicate-only: BEARS_SEAL.
- **D1.**
  - `REALIZES_SUBSTANCE` ×3, `HAS_ACTIVE_MOIETY` ×2, and MOLECULAR_WEIGHT ×3 and MOLECULAR_FORMULA FIELD assertions.
  - CALCULATED MOIETY_EQUIVALENT_AMOUNT ×3 and PER_MAX_DAILY_DOSE_AMOUNT ×3.
  - Two RESOLUTION assessments: the salt name, and the unresolved mass basis.
- **D8.** `COVERS` ×21 (ProductVariant ×1, Product ×1, Lot ×19), `LOT_OF` ×19 and `ISSUED_BY` ×3. `COVERS → ProductVariant` is the pair R-73 kept with a fixture request. The Tru Niagen listing names the strength variant.
- **D10.** DecisionCriterion ×5 (BLOCK, FILTER, SCORE and two weight-0 reported columns), `USES_CRITERION` ×5, `HAS_ITEM` ×8 (5 sections and 3 rows), `ASSESSES` from the rows to the products, and `DERIVED_FROM` from the rows and the report to Assertions and Assessments.
- **Kernel.**
  - 31 Identifiers through `HAS_IDENTIFIER` (UNII, PubChem CID, DSLD, GTIN, lot code), each with its own Assertion.
  - Activities chained by `WAS_INFORMED_BY`, and `WAS_GENERATED_BY` on every record.
  - 77 locators: JSON_POINTER, HTML and TABLE.

## Re-verify

`locators.yaml` holds every quote with its code-point offsets, prefix, suffix and quoteHash. To re-verify:

1. Re-fetch each URL and check its sha256.
2. Check that `text[startOffset:endOffset] == exact`.

Expect the NSF/ANSI 173 page, the Thorne page and both NSF Certified for Sport listing pages (nsfsport.com 1263423 and 1423140) to change between fetches; the NSF/ANSI 173 page's "current as of" line changes daily. Re-verification for these pages is quote-based: find `exact` in the fresh bytes and compare it with `occurrencesInSnapshot`, and do not expect the stored sha256 or offsets to reproduce. Re-fetched by the fix stage on 2026-10-09 (`_runlog/fix.md` section 7): listing 1263423 was 19,948 B against 19,949 recorded, and 1423140 was 19,987 B against 19,988; both sha256 differ. All ten l-nsf-tn-* and l-nsf-nc-* quotes occur once in the fresh bytes, one code point before their stored offsets.

The scratch scripts that did this on 2026-10-09 are not committed: `bin/build_locators.py`, `bin/build_fixture.py` (IR checks, number recomputation), `bin/emit.py`, `bin/validate_intent.mjs` and `bin/run_walk.py`. The raw captures are not committed either.

Research, not medical advice. The criteria set is fixture-illustrative, not a BellLabs policy.

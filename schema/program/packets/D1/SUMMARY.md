# D1 — summary (compounds and ingredients)

**What the domain is.** What is actually in a consumer supplement, in what form and amount, and what it is chemically. D1 holds four kinds of identity:
- the chemical substance at authority granularity: salt, ester and moiety are separate substances (FDA GSRS/UNII);
- the actual material a label or trial names: a branded crystal form, a root-only extract, a deposited probiotic strain;
- the nutrient or marker class a form counts toward;
- the organism a botanical or microbial material comes from.

D1 is the identity join point for labels (D6), trials (D3), foods (D12), quality and regulation (D8), analytes (D4) and mechanisms (D2). Amounts are declared by D6, D3 and D12. Every normalized amount (moiety-equivalent, nutrient-equivalent, per maximum daily dose) is a CALCULATED kernel Assertion with its inputs, never a declaration. Harm lives in D5 assessments and assertions about D1 nodes, never on them. Research, not medical advice.

**Headline counts** (`node scripts/packet-check.mjs D1`, ADVERSARIAL-REVIEW stage 2026-10-08, ok):

| measure | D1 | budget |
| --- | ---: | ---: |
| node types | 4 | 8 |
| relationship types | 6 | 14 |
| from→to pairs | 7 | 35 |
| widest union | 0 | 6 |
| questions (harm/risk/disconfirmation) | 33 (15) | 15–40 (≥ 1/3) |
| fixtures | 5 | ≥ 3 |

- **Node types:** ChemicalSubstance, IngredientMaterial, Constituent, Taxon.
- **Edge-property types:** D1 declares one, `ContentEdgeProperties` (AssertedEdgeProperties + statementKind, quantity, comparator, unitCode — the four qualifiers Q-D1-11 filters on). Recorded-only edges use the kernel `AssertedRecordedProperties`.
- **Fixtures:** 104 locators, 73 assertions and 15 assessments; every locator re-selected in its capture (0 errors), 5 intents parse.
- **Executable size:** kernel + D1 compiles to 421,219 bytes and 230 input types against the current kernel (sha256 b2c2b1b0…). D1 adds 98 KB and 51 input types; the adversarial review saved 7 KB and 5 inputs.

**Five highest-value questions**
1. **Q-D1-02.** How much moiety or nutrient does product P deliver per serving and per maximum daily dose, across salt, ester and vitamer forms? Fixture: Tru Niagen, 300 mg salt → 263.4 mg NR → 790.2 mg/d.
2. **Q-D1-03 (harm).** Which products exceed a nutrient threshold per maximum daily dose? Fixture: B6 at 34.2 mg/d is not above the TGA 50 mg/d scheduling threshold (from 2027-06-01) but is above the 10 mg/d label-warning threshold (since 2022-03-01). Each label-threshold pair is its own calculated screen.
3. **Q-D1-04 (harm).** Which label names hide nutrient M, for example B6 listed only as "pyridoxal 5-phosphate"? Answered through `COUNTS_TOWARD_NUTRIENT`.
4. **Q-D1-08 / CQ-ID-06.** In a trial, are the doses salt mass or moiety mass, and which material was administered? Fixture: Conze 2019, where "1000 mg NR" is NR chloride. This is the directive 3.8 path: Chunk → COVERS_LOCATOR → locator → snapshot bytes.
5. **Q-D1-24.** Do the US declaration (salt basis) and the Canadian declaration (moiety basis) of one product line reconcile? Fixture: 300 mg salt against 263.0 mg NR, residual −0.41 mg.

**Three biggest cuts**
1. **Node types: from 12 (W02) to 4.** ChemicalForm, the four material subtypes, Nutrient and the three taxon types are merged:
   - into IngredientMaterial, as `materialKind` plus properties;
   - into Constituent, which absorbs Nutrient;
   - into Taxon, with strains as rank STRAIN.
2. **One content edge, and fewer typed edges.** QUANTITATIVELY_CONTAINS and PROVIDES_CONSTITUENT become a single MATERIAL_CONTAINS. Its `statementKind` keeps declared, standardized, measured and qualitative statements apart. NUTRIENT_EXPRESSED_AS is a predicate-only Assertion since the adversarial review.
3. **No stored amount edges or properties.**
   - Moiety, nutrient and daily-max amounts are CALCULATED Assertions (`rule:mw-ratio.v1`, `rule:nutrient-equivalent.v1`, `rule:daily-max.v1`).
   - Identifiers, mentions and safety signals go to the kernel.
   - Supplier and mark relations stay predicate-only.
   - D1 declares no cross-module edge.

**Three biggest risks**
1. **The label and dose seams rest on uncommitted sibling work (OQ-D1-24, OQ-D1-32).** In their own adversarial reviews D6 made each label line an asserted edge with its own Assertion and `massBasis` (D1's enum), and D3 dropped its duplicate MassBasis enum.
   - D1's fixtures and patterns match that design. Neither sibling had committed at the time of this review.
   - If D6 returns to structural lines, the derived amounts cite the label version's Assertion plus a `line=` qualifier instead. D1's schema does not change.
2. **The projection is the product (OQ-D1-19, OQ-D1-25).**
   - Q-D1-02, -03, -05 and -24 need a PROJECTION job and a versioned rule table, and neither exists yet.
   - `biotech-knowledge-intent.v1` cannot yet express CALCULATED assertions, assessments, or predicate-only object assertions.
3. **Source quality and seam vocabulary.**
   - Source quality: DSLD has sentinel and null UNIIs, GSRS root records are used for extracts, a peer-reviewed paper prints a mistyped trial id, and LNHPD snapshots are not byte-reproducible.
   - Source quality found in the adversarial review: an ORCID was attached to the wrong author, and a GSRS search snapshot could not be re-verified. Both are fixed, and the fixture checker now tests the first.
   - Seam vocabulary: D5's `HAS_UPPER_LIMIT` does not yet accept a nutrient subject or the two TGA limit kinds (OQ-D1-03), comparators are spelled three ways (OQ-D1-34), and D13 still uses a pinned D1 type name (OQ-D1-31).

**Files:** `07-fixtures/` (5 folders), `08-sources-and-tools.md` (20 tools scored), `11-open-questions.md` (OQ-D1-01…35; 01 and 18 resolved by the kernel, 24 and 32 resolved by D6 and D3).

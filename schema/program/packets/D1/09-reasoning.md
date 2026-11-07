# D1 — reasoning

MODEL stage (Wave 2), A2, 2026-10-08; CHECK stage the same day (size table re-measured against the current kernel, edge-property types per kernel M10/M11, seam names and risks updated — changes marked "check stage"); ADVERSARIAL-REVIEW stage the same evening (section "Adversarial review changes" at the end; size table re-measured). Inputs: research-stage `01-ecosystem.md`, `02-questions.md`, `_notes/research-notes.md`, `_notes/fixture-candidates.md`; A1's published kernel pattern (`packets/K/09-reasoning.md`, `04-schema-proposal.graphql`, `domain-template.graphql`, kernel sha256 prefix `0ad415592b9e0b6c`); sibling research notes (D2, D3, D4, D6, D8, D12; none had SDL yet). The module is the answer to one question: **what is actually in a supplement, in what form and amount, and what is it chemically** — with the bad (hidden forms, over-threshold daily doses, wrong plant part, species-only strain claims, mis-declared bases) as first-class as the good.

## Size estimate

| measure | D1 | budget | how computed |
| --- | ---: | ---: | --- |
| node types | **4** | 8 | `packet-check` count of `@node` types: ChemicalSubstance, IngredientMaterial, Constituent, Taxon |
| relationship types | **6** | 14 | `packet-check`: HAS_ACTIVE_MOIETY, COUNTS_TOWARD_NUTRIENT, REALIZES_SUBSTANCE, MATERIAL_CONTAINS, DERIVED_FROM_TAXON, PARENT_TAXON (NUTRIENT_EXPRESSED_AS predicate-only since the adversarial review) |
| from→to pairs | **7** | 35 | `packet-check` (one per relationship field; MATERIAL_CONTAINS has two target fields) |
| widest union target | **0** (no unions) | 6 | MATERIAL_CONTAINS uses two fields instead of a 2-member union (measured below) |
| most relationship fields on one type | 4 (IngredientMaterial) | 12 | Constituent now has none |
| inverse fields | 0 | | every question reads forward or filters on the forward field; inverses would add pairs and inputs |
| edge-property types | 1 declared (`ContentEdgeProperties` = AssertedEdgeProperties + statementKind, quantity, comparator, unitCode; kernel M11); uses kernel AssertedEdgeProperties (1 edge: PARENT_TAXON) and AssertedRecordedProperties (4 edges) | | OQ-D1-01 and OQ-D1-18 resolved (check stage); qualifiers cut from 8 to 4 (adversarial review) |
| enums | 14 | | controlled vocabularies (directive: enums over nodes); ContentBasis removed in the review; MassBasis kept as the shared vocabulary of D3 and D6 (no D1 field uses it, so it is pruned from a D1-only executable) |

**Executable measurement** (`BKS_SCHEMA_PATH=<Windows abs path> NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <Windows abs out>`, deployed options, from the worktree; compile file = A1 kernel SDL + this module concatenated, no stubs needed because D1 references no other module's type; export the variable with a `cygpath -w` path, see OQ-D1-21; every output checked to contain the four D1 types, i.e. not the 55 MB pinned fallback).

Adversarial-review stage, 2026-10-08, against the kernel as it is now (A1 `K/04-schema-proposal.graphql`, sha256 `b2c2b1b0094ead58…`, 51,355 bytes — A1's own review cut Mention and Adjudication.considers; scratch `ft/D1/adv/compile/`):

| build | bytes | lines | `grep -c '^input '` | build time |
| --- | ---: | ---: | ---: | ---: |
| kernel alone | 322,904 | 6,466 | 179 | 1 s |
| **kernel + D1 (this file)** | **421,219** | **8,331** | **230** | 1 s |
| **D1 marginal cost** | **+98,315** | **+1,865** | **+51** | |
| kernel + D1 check-stage SDL (git HEAD) | 428,200 | 8,489 | 235 | 1 s |
| alt: ContentEdgeProperties with `statementKind` only | 418,723 | 8,278 | 229 | 1 s |
| alt: MATERIAL_CONTAINS on kernel `AssertedEdgeProperties` (no D1 property type) | 410,798 | 8,156 | 226 | 1 s |

Reading (adversarial review): the review saves **6,981 bytes and 5 input types** (NUTRIENT_EXPRESSED_AS field and its inputs, four ContentEdgeProperties qualifiers, the ContentBasis enum). The check-stage SDL has the same marginal cost on this kernel as on the previous one (+105,296 bytes either way), so D1 stays kernel-additive. `ContentEdgeProperties` with its four filtered qualifiers costs **+10.4 KB and +4 inputs** over plain AssertedEdgeProperties; with `statementKind` alone it would cost +7.9 KB / +3. The quantity, comparator and unit cost the last 2.5 KB / 1 input and are kept because Q-D1-11 filters on them ("botanical preparations of taxon T standardized to ≥ X % of marker M", 03) and because D12's food content uses the same field names, so material and food content filter alike.

Check stage, 2026-10-08, against the kernel then (sha256 `790e7244eec773ff…`, 51,377 bytes): kernel alone 345,273 bytes / 6,927 lines / 192 inputs; kernel + D1 450,569 / 8,950 / 248 (marginal +105,296, +56); alt the 4 recorded-only edges on AssertedEdgeProperties 446,470 / 246; alt MATERIAL_CONTAINS with kernel AssertedEdgeProperties 437,377 / 242. `AssertedRecordedProperties` costs +4.1 KB and +2 input types once (its `Where`/`Sort` inputs appear with the first relationship that uses it) and about 0 per further edge: property inputs are shared by name, so executable size depends on the number of distinct edge-property types in use, not on how many fields each has.

Model stage, against the Wave 0 kernel (sha256 prefix `0ad415592b9e0b6c`): kernel alone 326,564 bytes / 6,582 lines / 185 inputs; kernel + D1 427,761 / 8,548 / 239 (marginal +101,197 bytes, +54 inputs); alt MATERIAL_CONTAINS with AssertedEdgeProperties 414,569 / 233; alt one field to `union MaterialContentTarget = ChemicalSubstance \| Constituent` 423,899 / 240 (the union variant was not re-measured; the trade-off is unchanged). Per node type D1 costs about 25 KB and 13 input types including its share of the enums — in line with A1's 17.7 KB / 12 inputs for a template type with three relationships. For scale: the pinned D1-equivalent (W02, 12 types, 20 relationship types) was a share of a 57.9 MB / 38,034-input executable.

Tooling finding recorded while measuring (OQ-D1-21): if `BKS_SCHEMA_PATH` points at a missing file, `print-schema` silently falls back to the pinned SDL and prints 57,908,217 chars — a wrong measurement that looks like a success.

## Decisions (alternatives considered, what was cut and why)

### Node types

| decision | alternatives considered | why this one |
| --- | --- | --- |
| **ChemicalSubstance at GSRS (UNII) granularity**: salt, ester, hydrate and free moiety are separate nodes; "form" in the salt/ester sense is a substance + `HAS_ACTIVE_MOIETY` | (a) one node per moiety with salt as a property; (b) a separate `ChemicalForm`-style node for salts | Every authority read (GSRS, PubChem, DSLD forms) gives salts their own identifier and structure; labels declare the salt mass (US) or the moiety mass (Canada) — collapsing them makes the four declaration bases unrepresentable. (a) loses the salt's identifiers; (b) duplicates what GSRS already registers. |
| **IngredientMaterial as the single material type** (absorbs Branded, Botanical, Microbial, Mixture preparations and ChemicalForm through `materialKind` + nullable properties) | keep 5–6 subtypes as labels/interfaces (pinned) | No question traverses differently by subtype; all are targets of the same D6/D3 edges; the harm facts (plantPart, preparationType, grade, viability) are filterable properties. Five fewer types, zero lost questions. Cost: some properties are null for most kinds (accepted; documented per kind in the docstring). |
| **ChemicalForm cut** (crystal form, polymorph, grade → `physicalForm`, `formDescriptor`, `grade` on the material) | keep ChemicalForm so D8 patents attach to a form shared across suppliers (research Option B) | Only Q-D1-17 needs it and it is answerable through the material (NIAGEN's crystal form has one exclusive manufacturer). D8 can contest (OQ-D1-04). |
| **Constituent absorbs Nutrient** (`constituentKind: NUTRIENT`, `nutrientKind`, `referenceUnitCode`) | (a) separate Nutrient node (pinned); (b) nutrients as ChemicalSubstance with substanceClass CONCEPT; (c) nutrient as a string property on substances | Nutrients and marker classes share the "no single structure, a convention or a measurand" shape and the same incoming edges (MATERIAL_CONTAINS, D12 composition, D4 analyte). (b) muddles UNII-granularity identity; (c) cannot be a threshold subject or join point (Q-D1-03/04). |
| **Taxon merges BotanicalTaxon, MicrobialTaxon, MicrobialStrain** (`rank` incl. STRAIN, `organismGroup`) | keep three types (pinned); strain as IngredientMaterial property | NCBI Taxonomy itself treats a strain as rank `strain` under its species (568703 → 47715); Q-D1-14/15 traverse strain → species → genus uniformly. Deposit numbers are identifiers. |
| **No FoodItem, Exposure, Lifestyle** | rehome W05 into D1 | FoodItem is D12 (A2's other packet), referencing D1 identity; Exposure and Lifestyle are D5. |
| **Identifiers are not fields** (pinned `unii`, `inchikey` dropped) | keep `unii` as a filterable property | Kernel pattern: identifiers attach through `HAS_IDENTIFIER` with an episode (CQ-ID-04 asks "valid when"); a UNII lookup is `identifiers(where: {scheme, value}) { identifies }` or the Q-D1-26 union branch. |
| **`searchText` + one fulltext index over the four labels** | vector index on entity names; per-type fulltext indexes | Label strings are short, lexical and full of codes ("P-5-P", "KSM-66", "LGG"); Lucene beats embeddings for them. One index keeps the identity-level comparison in one ranked list. Embeddings stay on D9 chunks (Q-D1-08). |

### Relationship types

| decision | alternatives considered | why this one |
| --- | --- | --- |
| **HAS_ACTIVE_MOIETY** (kept) | GSRS's full relationship vocabulary as typed edges (SALT/SOLVATE→PARENT, CONSTITUENT ALWAYS PRESENT, METABOLITE…) | Only "active moiety" is traversed by a question (normalization). Others are `Assertion.predicate` values (`SALT_OR_SOLVATE_OF`, `MEMBER_OF_CLASS`). |
| **COUNTS_TOWARD_NUTRIENT** (new) | reuse HAS_ACTIVE_MOIETY for vitamers; put nutrient membership in the rule table only | GSRS gives P5P as its *own* active moiety, so the moiety edge cannot say "P5P is vitamin B6". The harm threshold (TGA, UL) is on the nutrient. Conversion factors stay out of the graph (rule table, versioned with the projection) because they are convention, jurisdiction- and form-dependent and never traversed. |
| **NUTRIENT_EXPRESSED_AS → predicate-only** (adversarial review; was a typed episode edge) | typed edge with an episode (model/check stage); reference form as a string inside the rule table; a property on Constituent | Only Q-D1-02 read the edge (one OPTIONAL MATCH); the projection cites the **Assertion** in DERIVED_FROM, not the edge; the jurisdiction lives in a qualifier, so an edge episode filtered at `$vt` returned every jurisdiction's reference form at once; the one fixture episode had no valid bounds. As a predicate-only Assertion (Constituent → ChemicalSubstance, jurisdiction qualifier, valid time on the Assertion) the input stays explicit and citable. −1 relationship type, −1 pair. |
| **REALIZES_SUBSTANCE** (kept; absorbs FORM_OF_SUBSTANCE/HAS_CHEMICAL_FORM) | — | Material → defining substance is the hop every label/trial path crosses. |
| **MATERIAL_CONTAINS** (merges QUANTITATIVELY_CONTAINS + PROVIDES_CONSTITUENT) | keep two types (pinned) | The CQ-ID-03 distinction and the non-inference rule ("provides" never implies an amount) survive as `statementKind: QUALITATIVE_PROVIDES` with null quantity; one type halves fields and pairs. Measured content from analytical surveys and lot COAs, and the purity of a trial batch (adversarial review: fixture t02 moved to a D3 FIELD Assertion), never become this edge (product-, lot- or administration-scoped: D6/D8/D3). |
| **ContentEdgeProperties = base + statementKind, quantity, comparator, unitCode** (adversarial review; was 8 qualifiers) | (a) 8 qualifiers (check stage: + quantityLow/High, contentBasis, massBasis); (b) `statementKind` only (reviewer's first option, −2.5 KB / −1 input); (c) kernel AssertedEdgeProperties, all values on the Assertion (−10.4 KB / −4 inputs) | Kernel M11 rule 3 admits only qualifiers a question filters on. Q-D1-11 now filters "standardized to ≥ X % of marker M" (statementKind, comparator ∈ GTE/GT/EQ/APPROX, quantity ≥ X, unitCode '%'); range bounds, content basis and mass basis are filtered by nothing and moved to Assertion qualifiers. D12's food content (in-progress review) uses the same names (statementKind, quantity, unitCode), so (c) would make material and food content read differently again. |
| **DERIVED_FROM_TAXON** (kept; absorbs HAS_STRAIN) | separate HAS_STRAIN | One edge from material to organism for botanical source and microbial strain; plant part is a material property because Q-D1-12 filters it with the material. |
| **PARENT_TAXON** (absorbs STRAIN_OF) | taxon lineage as a string property | Q-D1-15 needs the genus *as of* a date (the 2020 *Lactobacillus* split; adversarial review: its pattern now walks `PARENT_TAXON*1..2` with EP on every hop, because the dated episodes are on the species → genus hop, not on strain → species) and the strain→species fallback; Q-D1-11 also filters each hop. A property cannot carry the episode. |
| **No derived edges** | derived `NORMALIZES_TO` (substance → moiety/nutrient closure); derived `DELIVERS_AMOUNT` (formulation → substance with score) | Normalization is ≤ 2 hops; amounts need value + unit + rule + inputs, which a kernel CALCULATED Assertion already carries (DerivedEdgeProperties has no quantity). Fewer types, same answers. |
| **Derived amounts are CALCULATED Assertions** (rules `rule:mw-ratio.v1`, `rule:nutrient-equivalent.v1`, `rule:daily-max.v1`) written by a PROJECTION Activity | properties on Product / formulation; an edge per amount | Directive 3.6/rule 8: regenerable, method-versioned, cite inputs, never a declaration. The US closed rule (salt declared, moiety derived) and the Canadian case (moiety declared with source material, salt derived) are the same rule run in either direction. |
| **HAS_MIXTURE_COMPONENT cut** (predicate-only) | keep | Proprietary blends are label structure (D6); no question traverses branded complex materials. |
| **Supplier, manufacturer, mark owner, measured content, undeclared substance, allergen note: predicate-only** | typed edges to D7/D8/D6 types | Each serves one value-2/3 question that reads a handful of Assertions; promotion criteria are listed in `05-relationship-register.yaml` `predicateOnly`. D1 thereby declares no cross-module edge at all. |
| **Equivalence and resolution are kernel Assessments** (EQUIVALENCE subkinds `D1.identity-level.*`, RESOLUTION, APPLICABILITY `D1.dose-mass-basis`, `D1.form-transfer`) | SAME_MATERIAL_AS edge; a D1 assessment type | Directive 3.6 and the kernel ownership map; an identity judgment is never an edge or a merge. |
| **Two fields, not a union, for MATERIAL_CONTAINS** | `union MaterialContentTarget` (pinned) | Measured: same pair count, −3.9 KB but +1 input type; fields keep client filters simple and leave the widest union at 0. |
| **All asserted, `[CONNECT]` only, read-only GraphQL** | structural `[CREATE, CONNECT]` for definitional edges | Every D1 edge is a sourced statement (GSRS relation, label form, NCBI parent), so it needs an authorizing Assertion; there is no structural edge in D1. |

### What was cut, in one list

From W02's 12 node types / 20 relationship types / 1 union to 4 / 6 / 0 (7 until the adversarial review demoted NUTRIENT_EXPRESSED_AS): ChemicalForm, BrandedIngredientMaterial, BotanicalPreparation, MicrobialPreparation, MaterialMixture, Nutrient, BotanicalTaxon, MicrobialTaxon, MicrobialStrain merged or cut; QUANTITATIVELY_CONTAINS + PROVIDES_CONSTITUENT merged; HAS_STRAIN, STRAIN_OF, FORM_OF_SUBSTANCE, HAS_CHEMICAL_FORM replaced; HAS_MIXTURE_COMPONENT, MARKETED_UNDER_MARK predicate-only; HAS_IDENTIFIER to the kernel; GOVERNED_BY_SPECIFICATION, PRODUCED_BY_PROCESS, CAPABILITY_FOR_MATERIAL, INPUTS, OUTPUTS to D8; AFFECTS_MECHANISM, MODULATES to D2; HAS_SAFETY_SIGNAL to kernel Assessment (D5 kind). Full list with reasons: `05-relationship-register.yaml` `deferred`, `06-node-register.yaml` `deferred`/`mergedInto`.

## Bitemporal decision per edge

Every D1 edge is asserted and therefore carries an authorizing Assertion; the decision is whether valid time is **stated and read**. Check stage: recorded-only edges now use the kernel `AssertedRecordedProperties` (no valid-time fields; the Assertion still holds any valid time a source states), episode edges `AssertedEdgeProperties` or its D1 superset `ContentEdgeProperties`.

| edge | temporal | property type | why |
| --- | --- | --- | --- |
| HAS_ACTIVE_MOIETY | recorded-only | AssertedRecordedProperties | chemistry; a GSRS correction is a superseding Assertion (recorded time) |
| COUNTS_TOWARD_NUTRIENT | recorded-only | AssertedRecordedProperties | vitamer membership is nutrition science, not dated; factors are versioned in the rule, not on the edge |
| REALIZES_SUBSTANCE | recorded-only | AssertedRecordedProperties | definitional for the material; a specification change makes a new material |
| MATERIAL_CONTAINS | **episode** | ContentEdgeProperties | composition and standardization claims change with supplier specifications and are dated by their source (Q-D1-13, CQ-ID-03 at a date) |
| DERIVED_FROM_TAXON | recorded-only | AssertedRecordedProperties | definitional for the material |
| PARENT_TAXON | **episode** | AssertedEdgeProperties | reclassification has a real valid-from (2020 genus split); Q-D1-15 asks the genus as of a date (EP on each hop of `PARENT_TAXON*1..2`) |

Two of six edges need valid time. The reference-form convention (NUTRIENT_EXPRESSED_AS, e.g. TGA's description of ARTG summaries "as the equivalent amount of pyridoxine") keeps its valid time and jurisdiction on its predicate-only Assertion since the adversarial review. The seams D1 reads with an episode are D6 `HAS_LABEL_VERSION` (label current at `$vt`) and D8 `STATUS_OF`; D6 `DECLARES_COMPONENT` lines are structural inside an immutable LabelVersion.

## Budget excess (one line per element, prefixed EXCESS:)

None. 4/8 node types, 6/14 relationship types, 7/35 pairs, widest union 0/6, at most 4/12 relationship fields per type. Headroom is deliberate: other modules declare their edges into D1 types (D6, D3, D12, D4, D8, D2 — counted in their packets).

## Risks

1. **The D6 declaration seam depends on uncommitted sibling work** (adversarial review). D6's in-progress review makes `DECLARES_COMPONENT` asserted with its own per-line Assertion and `massBasis: MassBasis` (D1's enum), which is what D1's fixtures and patterns use (OQ-D1-24 resolved); D3 likewise dropped its MassBasis copy (OQ-D1-32). Both are uncommitted at the time of this review. If D6 returns to structural lines, Q-D1-02/03/05/24 switch to the OQ-D6-24 form (cite the label version's HAS_LABEL_VERSION Assertion with `line=<orderIndex>`; basis from `amountReferent`) without a D1 schema change.
2. **The projection is the product.** The four highest-value questions (Q-D1-02, Q-D1-03, Q-D1-05, Q-D1-24) depend on a PROJECTION job and a versioned rule table that do not exist yet; if they lag, answers fall back to declared amounts only. The rule table's home (graph vs versioned file) is OQ-D1-19.
3. **Content and amounts still take three shapes across modules** (adversarial review; was four). D1 material content and D12 food content now both put `statementKind`, `quantity`, `unitCode` on a domain-local edge type with the same names (D12 in progress); D6 label lines put amount/unitCode/massBasis on `ComponentLineProperties`; D3 puts the dose on the `InterventionComponent` node. Comparators are spelled three ways (D1 QuantityComparator, D5 ThresholdComparator, D8 SpecComparator; D1 renamed GE/LE to GTE/LTE to match D5 — OQ-D1-34). If the owner rejects domain-local property types, MATERIAL_CONTAINS falls back to AssertedEdgeProperties (measured: −10.4 KB, −4 inputs) and Q-D1-11's standardization filter joins through `assertionUid` and parses qualifiers.
4. **IngredientMaterial identity rule is still a proposal** (Priority-1 open block): too strict splits one commercial material into many; too loose merges food-grade and pharmaceutical-grade Niagen. Mitigation: EQUIVALENCE Assessments instead of merges; fixtures exercise one branded material across three labels and a trial.
5. **One fulltext index over four labels** may rank a Taxon above a material for strings like "rhamnosus"; the answer shape returns identity level so the agent decides, and unresolved strings are staged as Mentions.
6. **Taxon may be contested by D2** (species of a study population). D2's research leans to species as enums; if D2 later needs nodes, sharing Taxon is the slim choice (OQ-D1-05).

## With twice the budget

- `ChemicalForm` back as a node shared by suppliers' materials, with D8 patents and specifications attached (investor IP questions at scale).
- A derived `SIMILAR_MATERIAL` projection from GDS node similarity (Jaccard/overlap over MATERIAL_CONTAINS, nightly) for "materials like this one" (value 3 today).
- `HAS_MIXTURE_COMPONENT` typed, for branded complexes and premixes.
- `MEMBER_OF_CLASS` typed (substance → chemical class) for "every withanolide in product P".
- Strain-level content (`{CFU}/g` of material) as a third MATERIAL_CONTAINS target field to Taxon.
- A typed `MEASURED_CONTENT` edge (product/lot → substance) with measured % of declared, for adulteration and under-dosing screens across many surveys.

## Adversarial review changes (2026-10-08)

Two independent reviewers (evidence integrity; model discipline) examined the packet; every finding was re-verified (sources re-fetched where the finding was about a source) and either fixed or rebutted (RUNLOG "Adversarial review"). Schema-relevant results:

| change | why | effect |
| --- | --- | --- |
| NUTRIENT_EXPRESSED_AS → predicate-only | earned no typed edge (one OPTIONAL MATCH; projection cites the Assertion; jurisdiction in a qualifier defeats an edge episode) | 6 relationship types, 7 pairs; Q-D1-02/19/20 read the Assertion |
| ContentEdgeProperties qualifiers 8 → 4 | kernel M11 rule 3; Q-D1-11 standardization filter written into 03 and named in 05 | −6,981 bytes / −5 inputs together with the row above; ContentBasis enum removed |
| QuantityComparator GE/LE → GTE/LTE | one spelling with D5 ThresholdComparator | fixtures w04 (GTE), w05 (LT) |
| MassBasis kept, consumers [D3, D6] | duplicate `enum MassBasis` in D3 (compile blocker) is resolved by D3 deleting its copy; D6 adopted the enum on ComponentLineProperties | no D1 field uses it; pruned from a D1-only executable |
| D6 lines asserted (D6's own review) | per-line Assertions are now D6's design | D1 fixtures keep per-line Assertions, add `orderIndex`; 03 reads `d.assertionUid`, `d.massBasis` |
| thresholds = D5 `HAS_UPPER_LIMIT` + `limitKind` | DOSE_THRESHOLD was registered nowhere | request to D5 for Constituent subjects and two limitKind values (OQ-D1-03) |
| threshold screen split per (label, threshold) | one valueBoolean answered four comparisons and reported "not exceeded" for an exceeded threshold | fixture c10a–c10d |
| `plantPart=` Assessment facet | Q-D1-12's plant-part restriction came from a caller parameter, not the graph | fixture s03 (`plantPart=LEAF`); request to D5 (OQ-D1-33) |
| Q-D1-15 walks to the genus with EP per hop | the dated episodes are species → genus; the old one-hop pattern could not return the legacy genus | pattern + fixture expectation |

**Registered codes owned by D1 (kernel M9 asks each domain to list them here):** Assessment facet `plantPart=<PlantPart value>` (on D5 SAFETY_SIGNAL assessments about a Taxon, IngredientMaterial or ChemicalSubstance; absence = all parts); EQUIVALENCE subkinds `D1.identity-level.{SAME_SUBSTANCE, SAME_FORM, SAME_BRANDED_MATERIAL, SAME_SPECIFICATION, SUBSTANCE_RELATED, NOT_EQUIVALENT, UNRESOLVED}`; APPLICABILITY subkinds `D1.dose-mass-basis`, `D1.form-transfer`, `D1.preparation-relevance`; RESOLUTION subkinds `D1.mention-resolution`, `D1.common-name-resolution`; QUALITY subkind `D1.identity-granularity`. Assertion qualifier prefixes used by D1: `comparator:`, `contentBasis:`, `range:`, `limitKind:` (D5's), `threshold=` (on screens), `jurisdiction <CC>`.

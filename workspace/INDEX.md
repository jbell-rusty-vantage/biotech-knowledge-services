# INDEX — every node type and relationship type

One line each. Node: **Type** · uid token · module · summary. Relationship: **TYPE** · class · temporal · endpoints. Release biotech-schema-v2.2.0.

## Modules (14)

| module | title | owner | nodes |
| --- | --- | --- | --- |
| [K](modules/K.md) | kernel: evidence, identity, time, lineage | kernel | 11 |
| [D1](modules/D1.md) | compounds and ingredients | D1 | 4 |
| [D2](modules/D2.md) | mechanisms and biology of aging | D2 | 5 |
| [D3](modules/D3.md) | clinical and preclinical evidence | D3 | 8 |
| [D4](modules/D4.md) | diagnostics, biomarkers and measurement | D4 | 7 |
| [D5](modules/D5.md) | interventions, protocols and safety | D5 | 6 |
| [D6](modules/D6.md) | consumer products and commerce | D6 | 6 |
| [D7](modules/D7.md) | organizations, people and money | D7 | 4 |
| [D8](modules/D8.md) | manufacturing, quality, regulation and IP | D8 | 6 |
| [D9](modules/D9.md) | sources, media and discourse | D9 | 3 |
| [D10](modules/D10.md) | derived knowledge: associations, insights, reports, recommendations | D10 | 3 |
| [D11](modules/D11.md) | bio-medical tooling action space | D11 | 1 |
| [D12](modules/D12.md) | food and nutrition | D12 | 3 |
| [D13](modules/D13.md) | frontiers, breakthroughs and events | D13 | 2 |

## Node types (69)

### Kernel, identity, time and provenance (`dom:kernel-and-provenance`, 11)

- **[Activity](nodes/Activity.md)** · `hu:activity:` · K · Purpose: the single lineage spine (00-DIRECTIVE 4).
- **[Adjudication](nodes/Adjudication.md)** · `hu:adjudication:` · K · Purpose: one verification.v1 judgment about one Assertion, immutable (a re-review is a new node naming `supersedesUid`).
- **[Agent](nodes/Agent.md)** · `hu:agent:` · K · Purpose: a software or human-operated agent identity (executor, extraction model + prompt + skill, verifier, analyst seat).
- **[Assertion](nodes/Assertion.md)** · `hu:assertion:` · K · Purpose: one attributable proposition (verification.v1 Assertion): exactly one subject, exactly one object or one typed literal, exactly one asserter, at least…
- **[Assessment](nodes/Assessment.md)** · `hu:assessment:` · K · Purpose: an immutable, versioned, supersedable judgment asserted by an agent or analyst with named inputs (PLAN 6.1 "assessment"): claim vetting (with `disposi…
- **[Claim](nodes/Claim.md)** · `hu:claim:` · K · Purpose: the proposition itself, independent of who said it (00-DIRECTIVE 3.4): the unit that is vetted, monitored, researched and reported on.
- **[Identifier](nodes/Identifier.md)** · `hu:identifier:` · K · Purpose: an external identifier string with scheme and issuer (PMID, DOI, NCT, UNII, CAS, GTIN, LOINC, ...; the scheme register is packets/K/identifier-schemes…
- **[Report](nodes/Report.md)** · `hu:report:` · K · Purpose: the in-graph skeleton of a published artifact (PLAN 6.1): evidence report (the outcome of an evidence mission, with the verification.v1 verdict on the…
- **[Source](nodes/Source.md)** · `hu:source:` · K · Purpose: stable identity of one retrieval endpoint (one normalized canonicalUri): a page, registry record, PDF, API record, feed item or media file.
- **[SourceLocator](nodes/SourceLocator.md)** · `hu:locator:` · K · Purpose: reproducible selector for the exact span, cell, page region, JSON pointer or media time range of one SourceSnapshot (verification.v1 SourceFragment +…
- **[SourceSnapshot](nodes/SourceSnapshot.md)** · `hu:snapshot:` · K · Purpose: immutable capture of a Source at a retrieval time (verification.v1 VerificationSourceCapture): the bytes that every claim must trace to.

### Substances, materials, mechanisms and biology (`dom:substances-and-biology`, 9)

- **[ChemicalSubstance](nodes/ChemicalSubstance.md)** · `hu:substance:` · D1 · Purpose: a chemical substance at the granularity of its FDA GSRS substance record — salts, esters, hydrates and the free moiety are DIFFERENT substances (NR ch…
- **[Condition](nodes/Condition.md)** · `hu:condition:` · D2 · Purpose: a disease, syndrome, phenotype or risk state (conditionKind) that mechanisms are linked to and that other modules scope by: D3 studies investigate it,…
- **[Constituent](nodes/Constituent.md)** · `hu:constituent:` · D1 · Purpose: a component concept with no single defined structure — a NUTRIENT with its own declaration convention ("vitamin B6" = six vitamers, declared "as pyrid…
- **[IngredientMaterial](nodes/IngredientMaterial.md)** · `hu:material:` · D1 · Purpose: the canonical identity of an actual material used as an ingredient or administered in a study — a supplier's grade of one substance, a branded materia…
- **[Mechanism](nodes/Mechanism.md)** · `hu:mechanism:` · D2 · Purpose: a curated mechanism concept — hallmark of aging, biological process, curated pathway record or molecular function (mechanismKind) — the vocabulary eve…
- **[MechanismEvidenceContext](nodes/MechanismEvidenceContext.md)** · `hu:mech-context:` · D2 · Purpose: the per-context qualifier of mechanism findings (round 0003 M3): one exposure group measured in one compartment of one organism in one setting.
- **[MolecularEntity](nodes/MolecularEntity.md)** · `hu:molecular-entity:` · D2 · Purpose: a gene, protein, protein complex, protein family or non-coding RNA that is a curated participant in a mechanism or the object of a compound's molecula…
- **[Outcome](nodes/Outcome.md)** · `hu:outcome:` · D2 · Purpose: a study-independent endpoint concept (lifespan, all-cause mortality, handgrip strength, VO2max, sleep quality) — the join point where D3 OutcomeDefini…
- **[Taxon](nodes/Taxon.md)** · `hu:taxon:` · D1 · Purpose: an organism taxon a material is derived from — botanical source species (Withania somnifera, NCBI 126910), microbial species (Lacticaseibacillus rhamn…

### Clinical and preclinical evidence (`dom:studies-and-evidence`, 8)

- **[InterventionComponent](nodes/InterventionComponent.md)** · `hu:intervention-component:` · D3 · Purpose: one administered thing inside one arm with its dose as stated — amount, unit, basis (per dose / day / kg diet), mass basis (salt vs moiety), form, rou…
- **[OutcomeDefinition](nodes/OutcomeDefinition.md)** · `hu:outcome-definition:` · D3 · Purpose: one outcome measure at one timepoint with one declared priority (the same measure at 2, 4 and 20 weeks is three definitions; a measure demoted from pr…
- **[Publication](nodes/Publication.md)** · `hu:publication:` · D3 · Purpose: one scholarly work or one version of it — journal article, preprint version, systematic review version, protocol or analysis plan, conference abstract…
- **[RegistrationVersion](nodes/RegistrationVersion.md)** · `hu:registration-version:` · D3 · Purpose: one version of one registration as a registry stated it at a point in valid time — status, enrollment (actual vs estimated), dates, results posting an…
- **[Study](nodes/Study.md)** · `hu:study:` · D3 · Purpose: one investigation (trial, cohort, preclinical experiment, systematic review) independent of how many registrations, versions and papers describe it; t…
- **[StudyArm](nodes/StudyArm.md)** · `hu:study-arm:` · D3 · Purpose: one arm or group of a study as one source states it (registry arms/groups, paper randomization groups) — the unit results, adverse events and administ…
- **[StudyPopulation](nodes/StudyPopulation.md)** · `hu:study-population:` · D3 · Purpose: who was eligible, enrolled, randomized or analyzed, as one source states it: size, sex and age bounds, healthy volunteers, species and strain for prec…
- **[StudyResult](nodes/StudyResult.md)** · `hu:study-result:` · D3 · Purpose: one reported number set for one outcome definition, one arm set, one analysis set, as one source states it (registry results module row, paper table c…

### Diagnostics, biomarkers, measurement and devices (`dom:diagnostics-and-devices`, 7)

- **[AlgorithmVersion](nodes/AlgorithmVersion.md)** · `hu:algorithm-version:` · D4 · Purpose: one fixed realization of a clock, risk score, wearable score, signal-processing or firmware build: the publication reference version (DunedinPACE, Bel…
- **[AssayVersion](nodes/AssayVersion.md)** · `hu:assay-version:` · D4 · Purpose: how one laboratory ran one measurement procedure — performing lab (exactly one), method principle, instrument model, reagent kit, software version, sp…
- **[Biomarker](nodes/Biomarker.md)** · `hu:biomarker:` · D4 · Purpose: the biological referent a measurement is about (NAD+, glycated hemoglobin, IgG glycan profile, pace of biological aging).
- **[Device](nodes/Device.md)** · `hu:device:` · D4 · Purpose: a device or instrument MODEL as its maker designates it, in its role as a measuring instrument (Oura Ring Gen3, WHOOP MG, Dexcom G7, FreeStyle Libre 3…
- **[LabTest](nodes/LabTest.md)** · `hu:lab-test:` · D4 · Purpose: the orderable or purchasable test as a laboratory or vendor offers it (Labcorp 001453 'Hemoglobin (Hb) A1c', Quest 496, Jinfiniti Intracellular NAD te…
- **[Metric](nodes/Metric.md)** · `hu:metric:` · D4 · Purpose: the measurand or feature definition — what exactly a number is: LOINC 4548-4 (HbA1c mass fraction in blood), 'NAD+ in red blood cells (µM)', WHOOP 'hr…
- **[ReferenceIntervalVersion](nodes/ReferenceIntervalVersion.md)** · `hu:ri-version:` · D4 · Purpose: one interval or limit a laboratory or vendor applies for one Metric on one AssayVersion and one population partition, with its kind (reference interva…

### Interventions, protocols, safety, food and nutrition (`dom:exposures-and-interventions`, 9)

- **[DietaryPattern](nodes/DietaryPattern.md)** · `hu:dietary-pattern:` · D12 · Purpose: a dietary pattern as one defining source states it — what foods, groups or nutrients it includes, emphasizes, limits or excludes, and when or how much…
- **[FoodCategory](nodes/FoodCategory.md)** · `hu:food-category:` · D12 · Purpose: a food group as one classification system defines it (NOVA group 4 "ultra-processed food and drink products"; IARC agent "processed meat"; WWEIA 3702…
- **[FoodItem](nodes/FoodItem.md)** · `hu:food:` · D12 · Purpose: a reference food concept as one composition or food-ontology source defines it, at the preparation it names ("Potatoes, russet, flesh and skin, raw",…
- **[Intervention](nodes/Intervention.md)** · `hu:intervention:` · D5 · Purpose: an intervention CONCEPT that is not simply a substance or a product: a practice (morning sunlight viewing, sauna bathing, resistance training), a proc…
- **[Protocol](nodes/Protocol.md)** · `hu:protocol:` · D5 · Purpose: the enduring identity of a public protocol (a creator's toolkit page, a published longevity protocol, a clinic's program definition).
- **[ProtocolEdition](nodes/ProtocolEdition.md)** · `hu:protocol-edition:` · D5 · Purpose: the immutable content of one observed or published state of a Protocol: its ordered steps (with their doses, timing, stated constraints, stated target…
- **[ProtocolStep](nodes/ProtocolStep.md)** · `hu:protocol-step:` · D5 · Purpose: one step of a protocol edition: what to do (stepKind), with what (STEP_USES -> substance, product, food, practice, or the Metric a MEASURE step measur…
- **[Target](nodes/Target.md)** · `hu:target:` · D5 · Purpose: one curated goal people pursue (sleep, strength, brain fitness, body composition, longevity, energy, mood, recovery ...): the shared targets vocabular…
- **[UseConstraint](nodes/UseConstraint.md)** · `hu:use-constraint:` · D5 · Purpose: the shared, stable identity of one scoped use concern, "use of S [above a dose band] [by a route] [in a jurisdiction] together with these scope member…

### Products, labels and commerce (`dom:products-and-commerce`, 6)

- **[LabelVersion](nodes/LabelVersion.md)** · `hu:label-version:` · D6 · Purpose: one version of what a package's label (or a menu item's declaration) states — the panel, serving definition, directions with min/max daily servings, w…
- **[MerchantListing](nodes/MerchantListing.md)** · `hu:listing:` · D6 · Purpose: one host's catalog entry for a sellable item (Amazon ASIN detail page, iHerb product id, Shopify product page, restaurant menu-item page): the place o…
- **[Offer](nodes/Offer.md)** · `hu:offer:` · D6 · Purpose: one party's commercial proposition for one listing's item in one market and purchase mode — the subject of every price and availability Assertion (OFF…
- **[Package](nodes/Package.md)** · `hu:package:` · D6 · Purpose: a sellable package configuration of one variant — container of N units or net quantity, multipack, kit, bundle, or one served portion of a prepared fo…
- **[Product](nodes/Product.md)** · `hu:product:` · D6 · Purpose: the enduring marketed concept behind every variant, package and listing ("Tru Niagen", "AG1", "Big Mac"): what a brand presents, what marketing and ta…
- **[ProductVariant](nodes/ProductVariant.md)** · `hu:product-variant:` · D6 · Purpose: a consumer-distinguishable realization of a Product — strength per unit, dosage form, flavor or jurisdiction (round-0001 Candidate B) — the level a st…

### Organizations, people and money (`dom:actors-and-institutions`, 4)

- **[Award](nodes/Award.md)** · `hu:award:` · D7 · Purpose: one funding award — grant, contract, sponsored research agreement, prize, in-kind award — as the join point between a funder, the recipient institutio…
- **[Brand](nodes/Brand.md)** · `hu:brand:` · D7 · Purpose: a name under which products, services, clinics or media are presented ('Tru Niagen', 'InsideTracker', a clinic chain name) — kept apart from the legal…
- **[Organization](nodes/Organization.md)** · `hu:org:` · D7 · Purpose: an organized body as an enduring identity — company, legal entity, corporate group, fund vehicle, university, lab, agency, clinic operator — that hold…
- **[Person](nodes/Person.md)** · `hu:person:` · D7 · Purpose: a natural person who is a public actor in sourced material — officer, director, founder, investor, author, investigator, speaker, host, clinician who…

### Manufacturing, quality, regulation and intellectual property (`dom:manufacturing-quality-regulatory-ip`, 6)

- **[CertificationListing](nodes/CertificationListing.md)** · `hu:cert-listing:` · D8 · Purpose: one listing record of a certifier (NSF Certified for Sport listing 1451522 'Basis'; an NSF/ANSI 173 listing row; an Informed Sport product page with i…
- **[LegalStatus](nodes/LegalStatus.md)** · `hu:legal-status:` · D8 · Purpose: one legal standing of one subject — an ingredient's or product's market-access standing in one jurisdiction under one pathway (excluded / not excluded…
- **[Lot](nodes/Lot.md)** · `hu:lot:` · D8 · Purpose: one production lot (batch) of one product or variant — the join key for "is the thing I hold real and lawful": recall lot lists, COA lot numbers, cert…
- **[Patent](nodes/Patent.md)** · `hu:patent:` · D8 · Purpose: one patent publication at one office (application, grant, reissue).
- **[QualityResult](nodes/QualityResult.md)** · `hu:quality-result:` · D8 · Purpose: one reported outcome for one analyte or check, from one row of a COA, a lot test summary, a certifier batch page, a lot-identified survey table or a p…
- **[RegulatoryRecord](nodes/RegulatoryRecord.md)** · `hu:reg-record:` · D8 · Purpose: one document-backed act of an authority — regulator, court or patent tribunal — with a record number: an NDI or GRAS response, a citizen-petition resp…

### Sources, media, discourse and capture tooling (`dom:sources-documents-and-media`, 4)

- **[CaptureAttempt](nodes/CaptureAttempt.md)** · `hu:capture-attempt:` · D11 · Purpose: one bounded attempt by a tool to search, fetch, resolve or parse a source for a subject that left no complete capture: a failure (401/403/429, challen…
- **[Channel](nodes/Channel.md)** · `hu:channel:` · D9 · Purpose: an editorial container that publishes works over time — a podcast show, a video channel, a newsletter, a site, a forum, or an account/handle on a plat…
- **[Chunk](nodes/Chunk.md)** · `hu:chunk:` · D9 · Purpose: a derived retrieval unit — a span of the text extracted from one captured SourceSnapshot (publisher transcript, caption track, ASR, OCR, HTML or PDF t…
- **[MediaWork](nodes/MediaWork.md)** · `hu:media-work:` · D9 · Purpose: one editorial work — a podcast episode, video, talk recording, newsletter issue, article, protocol page, social post, forum thread, book or image — in…

### Derived knowledge, reports, rankings and recommendations (`dom:derived-knowledge-and-reports`, 3)

- **[Association](nodes/Association.md)** · `hu:association:` · D10 · Purpose: a regenerable score between two entities computed by a projection Activity under a method version (PLAN 6.1 "materialized"): evidence aggregate (compo…
- **[DecisionCriterion](nodes/DecisionCriterion.md)** · `hu:decision-criterion:` · D10 · Purpose: one versioned criterion of a ranking or comparison method ("elemental magnesium per maximum daily dose", "block if the daily dose exceeds the suppleme…
- **[ReportItem](nodes/ReportItem.md)** · `hu:report-item:` · D10 · Purpose: one section or one option row of a published kernel Report (comparison, profile, protocol review, evidence report, published answer).

### Frontiers, breakthroughs and events (`dom:frontiers-and-events`, 2)

- **[Event](nodes/Event.md)** · `hu:event:` · D13 · Purpose: one dated public occurrence in biotech that investors, researchers and agents order into timelines and chains: a trial start, a readout, a regulatory…
- **[Frontier](nodes/Frontier.md)** · `hu:frontier:` · D13 · Purpose: one curated research or therapeutic frontier — a field-level goal the community and investors track and that is not yet reliably achieved in humans ("…

## Relationship types (106)

### Kernel, identity, time and provenance (15)

- **[ASSERTED_BY](relationships/ASSERTED_BY.md)** · structural · recorded-only · Assertion → Subjectable
- **[ASSESSES](relationships/ASSESSES.md)** · structural · recorded-only · Adjudication|Assessment|Report|Activity|ReportItem → Assertion|Subjectable
- **[DERIVED_FROM](relationships/DERIVED_FROM.md)** · structural · recorded-only · Assertion|Assessment|Report|ReportItem|Association → Assertion|Assessment
- **[HAS_EVIDENCE](relationships/HAS_EVIDENCE.md)** · structural · recorded-only · Assertion|Adjudication|Assessment|Report → SourceLocator
- **[HAS_IDENTIFIER](relationships/HAS_IDENTIFIER.md)** · asserted · episode · Subjectable → Identifier
- **[HAS_LOCATOR](relationships/HAS_LOCATOR.md)** · structural · recorded-only · SourceSnapshot → SourceLocator
- **[HAS_OBJECT](relationships/HAS_OBJECT.md)** · structural · recorded-only · Assertion → Subjectable
- **[HAS_SNAPSHOT](relationships/HAS_SNAPSHOT.md)** · structural · recorded-only · Source → SourceSnapshot
- **[HAS_SUBJECT](relationships/HAS_SUBJECT.md)** · structural · recorded-only · Assertion → Subjectable
- **[MENTIONS](relationships/MENTIONS.md)** · derived · recorded-only · Chunk → Subjectable
- **[OCCURRENCE_OF](relationships/OCCURRENCE_OF.md)** · structural · recorded-only · Assertion → Claim
- **[RENDITION_OF](relationships/RENDITION_OF.md)** · asserted · recorded-only · Source → Publication|MediaWork
- **[WAS_ASSOCIATED_WITH](relationships/WAS_ASSOCIATED_WITH.md)** · structural · recorded-only · Activity → Agent
- **[WAS_GENERATED_BY](relationships/WAS_GENERATED_BY.md)** · structural · recorded-only · Assertion|Adjudication|Assessment|Report|Entity → Activity
- **[WAS_INFORMED_BY](relationships/WAS_INFORMED_BY.md)** · structural · recorded-only · Activity → Activity

### Substances, materials, mechanisms and biology (12)

- **[AFFECTS_MECHANISM](relationships/AFFECTS_MECHANISM.md)** · derived · recorded-only · ChemicalSubstance|Intervention → Mechanism
- **[COUNTS_TOWARD_NUTRIENT](relationships/COUNTS_TOWARD_NUTRIENT.md)** · asserted · recorded-only · ChemicalSubstance → Constituent
- **[DERIVED_FROM_TAXON](relationships/DERIVED_FROM_TAXON.md)** · asserted · recorded-only · IngredientMaterial → Taxon
- **[EXPOSED_TO](relationships/EXPOSED_TO.md)** · structural · recorded-only · MechanismEvidenceContext → ChemicalSubstance|IngredientMaterial|Intervention
- **[HAS_ACTIVE_MOIETY](relationships/HAS_ACTIVE_MOIETY.md)** · asserted · recorded-only · ChemicalSubstance → ChemicalSubstance
- **[IN_STUDY_ARM](relationships/IN_STUDY_ARM.md)** · structural · recorded-only · MechanismEvidenceContext → StudyArm
- **[MATERIAL_CONTAINS](relationships/MATERIAL_CONTAINS.md)** · asserted · episode · IngredientMaterial → ChemicalSubstance | Constituent
- **[OBSERVED_IN_CONTEXT](relationships/OBSERVED_IN_CONTEXT.md)** · structural · recorded-only · Assertion → MechanismEvidenceContext
- **[PARENT_TAXON](relationships/PARENT_TAXON.md)** · asserted · episode · Taxon → Taxon
- **[PART_OF_MECHANISM](relationships/PART_OF_MECHANISM.md)** · asserted · recorded-only · Mechanism → Mechanism
- **[PARTICIPATES_IN](relationships/PARTICIPATES_IN.md)** · asserted · recorded-only · MolecularEntity|ChemicalSubstance → Mechanism
- **[REALIZES_SUBSTANCE](relationships/REALIZES_SUBSTANCE.md)** · asserted · recorded-only · IngredientMaterial → ChemicalSubstance

### Clinical and preclinical evidence (14)

- **[ADMINISTERS](relationships/ADMINISTERS.md)** · asserted · recorded-only · InterventionComponent → IngredientMaterial|ProductVariant|Intervention|FoodItem|DietaryPattern
- **[HAS_ARM](relationships/HAS_ARM.md)** · structural · recorded-only · Study → StudyArm
- **[HAS_COMPONENT](relationships/HAS_COMPONENT.md)** · structural · recorded-only · StudyArm → InterventionComponent
- **[HAS_OUTCOME](relationships/HAS_OUTCOME.md)** · structural · recorded-only · Study → OutcomeDefinition
- **[HAS_POPULATION](relationships/HAS_POPULATION.md)** · structural · recorded-only · Study → StudyPopulation
- **[HAS_REGISTRATION_VERSION](relationships/HAS_REGISTRATION_VERSION.md)** · asserted · episode, exclusive · Study → RegistrationVersion
- **[HAS_STUDY_ROLE](relationships/HAS_STUDY_ROLE.md)** · asserted · episode · Study → Organization|Person|Award
- **[INVESTIGATES](relationships/INVESTIGATES.md)** · asserted · recorded-only · Study → Condition
- **[MEASURES](relationships/MEASURES.md)** · asserted · recorded-only · OutcomeDefinition → Metric|Biomarker|Outcome|Condition
- **[REPORTS_ON](relationships/REPORTS_ON.md)** · asserted · recorded-only · Publication → Study
- **[RESULT_FOR](relationships/RESULT_FOR.md)** · structural · recorded-only · StudyResult → OutcomeDefinition
- **[RESULT_FOR_ARM](relationships/RESULT_FOR_ARM.md)** · structural · recorded-only · StudyResult → StudyArm
- **[REVISES](relationships/REVISES.md)** · asserted · recorded-only · Publication → Publication
- **[STATED_IN](relationships/STATED_IN.md)** · asserted · recorded-only · StudyArm|StudyPopulation|OutcomeDefinition|StudyResult → RegistrationVersion|Publication

### Diagnostics, biomarkers, measurement and devices (13)

- **[DELIVERS](relationships/DELIVERS.md)** · asserted · recorded-only · Product → LabTest|Device
- **[DERIVED_FROM_ALGORITHM_VERSION](relationships/DERIVED_FROM_ALGORITHM_VERSION.md)** · asserted · recorded-only · AlgorithmVersion → AlgorithmVersion
- **[HAS_ANALYTE](relationships/HAS_ANALYTE.md)** · structural · recorded-only · Biomarker → ChemicalSubstance|MolecularEntity
- **[INCLUDES_TEST](relationships/INCLUDES_TEST.md)** · asserted · episode · LabTest → LabTest
- **[INTERVAL_FOR](relationships/INTERVAL_FOR.md)** · structural · recorded-only · ReferenceIntervalVersion → AssayVersion|Metric
- **[MEASURES_METRIC](relationships/MEASURES_METRIC.md)** · asserted · episode · LabTest → Metric
- **[OUTPUTS_METRIC](relationships/OUTPUTS_METRIC.md)** · structural · recorded-only · AlgorithmVersion → Metric
- **[PERFORMED_BY_LAB](relationships/PERFORMED_BY_LAB.md)** · asserted · recorded-only · AssayVersion → Organization
- **[PERFORMED_WITH_VERSION](relationships/PERFORMED_WITH_VERSION.md)** · asserted · episode · LabTest → AssayVersion|AlgorithmVersion
- **[QUANTIFIES](relationships/QUANTIFIES.md)** · structural · recorded-only · Metric → Biomarker
- **[REFLECTS_MECHANISM](relationships/REFLECTS_MECHANISM.md)** · asserted · recorded-only · Biomarker → Mechanism
- **[REQUIRES_INPUT_METRIC](relationships/REQUIRES_INPUT_METRIC.md)** · structural · recorded-only · AlgorithmVersion → Metric
- **[RUNS_ON_DEVICE](relationships/RUNS_ON_DEVICE.md)** · asserted · episode · AlgorithmVersion → Device

### Interventions, protocols, safety, food and nutrition (10)

- **[FOOD_CONTAINS](relationships/FOOD_CONTAINS.md)** · asserted · recorded-only · FoodItem → ChemicalSubstance|Constituent
- **[HAS_EDITION](relationships/HAS_EDITION.md)** · asserted · episode, exclusive · Protocol → ProtocolEdition
- **[HAS_REFERENCE_FOOD](relationships/HAS_REFERENCE_FOOD.md)** · asserted · episode · Product → FoodItem
- **[HAS_STEP](relationships/HAS_STEP.md)** · structural · recorded-only · ProtocolEdition → ProtocolStep
- **[IN_FOOD_CATEGORY](relationships/IN_FOOD_CATEGORY.md)** · asserted · episode · FoodItem|Product → FoodCategory
- **[OPERATIONALIZED_BY](relationships/OPERATIONALIZED_BY.md)** · asserted · recorded-only · Target → Biomarker|Metric|Outcome|Condition
- **[PATTERN_COMPONENT](relationships/PATTERN_COMPONENT.md)** · asserted · recorded-only · DietaryPattern → FoodItem|FoodCategory|Constituent
- **[RESOLVES_TO_CONSTRAINT](relationships/RESOLVES_TO_CONSTRAINT.md)** · derived · recorded-only · Assertion → UseConstraint
- **[STATES_CONSTRAINT](relationships/STATES_CONSTRAINT.md)** · derived · recorded-only (derivedAt) · ProtocolStep → UseConstraint
- **[STEP_USES](relationships/STEP_USES.md)** · structural · recorded-only · ProtocolStep → Subjectable

### Products, labels and commerce (9)

- **[BRANDED_AS](relationships/BRANDED_AS.md)** · asserted · episode · Product → Brand
- **[DECLARES_COMPONENT](relationships/DECLARES_COMPONENT.md)** · asserted · recorded-only · LabelVersion → IngredientMaterial|Constituent|FoodItem
- **[HAS_LABEL_VERSION](relationships/HAS_LABEL_VERSION.md)** · asserted · episode, exclusive · Package → LabelVersion
- **[HAS_OFFER](relationships/HAS_OFFER.md)** · structural · recorded-only · MerchantListing → Offer
- **[HAS_PACKAGE](relationships/HAS_PACKAGE.md)** · structural · recorded-only · ProductVariant → Package
- **[HAS_VARIANT](relationships/HAS_VARIANT.md)** · structural · recorded-only · Product → ProductVariant
- **[LISTING_FOR](relationships/LISTING_FOR.md)** · asserted · episode · MerchantListing → Package
- **[NAMES_RESPONSIBLE_PARTY](relationships/NAMES_RESPONSIBLE_PARTY.md)** · asserted · recorded-only · LabelVersion → Organization
- **[SELLER_OF_RECORD](relationships/SELLER_OF_RECORD.md)** · asserted · episode · Offer → Organization

### Organizations, people and money (7)

- **[AWARDED_BY](relationships/AWARDED_BY.md)** · asserted · recorded-only · Award → Organization
- **[AWARDED_TO](relationships/AWARDED_TO.md)** · asserted · recorded-only · Award → Organization|Person
- **[HOLDS_ROLE](relationships/HOLDS_ROLE.md)** · asserted · episode · Person → Organization
- **[HOLDS_STAKE](relationships/HOLDS_STAKE.md)** · asserted · episode · Person|Organization → Organization
- **[OWNS_BRAND](relationships/OWNS_BRAND.md)** · asserted · episode · Organization → Brand
- **[PARENT_OF](relationships/PARENT_OF.md)** · asserted · episode · Organization → Organization
- **[RECEIVES_VALUE_FROM](relationships/RECEIVES_VALUE_FROM.md)** · asserted · episode · Person → Organization

### Manufacturing, quality, regulation and intellectual property (11)

- **[ADDRESSED_TO](relationships/ADDRESSED_TO.md)** · asserted · recorded-only · RegulatoryRecord → Organization
- **[ASSIGNED_TO](relationships/ASSIGNED_TO.md)** · asserted · episode · Patent → Organization
- **[CONCERNS](relationships/CONCERNS.md)** · asserted · recorded-only · RegulatoryRecord|Patent → ChemicalSubstance|IngredientMaterial|Product|Lot
- **[COVERS](relationships/COVERS.md)** · asserted · episode · CertificationListing → Product|ProductVariant|Lot
- **[ISSUED_BY](relationships/ISSUED_BY.md)** · asserted · recorded-only · RegulatoryRecord|QualityResult|CertificationListing → Organization
- **[LICENSED_TO](relationships/LICENSED_TO.md)** · asserted · episode · Patent → Organization
- **[LOT_OF](relationships/LOT_OF.md)** · asserted · recorded-only · Lot → Product|ProductVariant
- **[MEASURES_ANALYTE](relationships/MEASURES_ANALYTE.md)** · asserted · recorded-only · QualityResult → ChemicalSubstance|IngredientMaterial|Constituent
- **[QUALITY_RESULT_FOR](relationships/QUALITY_RESULT_FOR.md)** · asserted · recorded-only · QualityResult → Lot
- **[STATUS_FROM](relationships/STATUS_FROM.md)** · asserted · recorded-only · LegalStatus → RegulatoryRecord
- **[STATUS_OF](relationships/STATUS_OF.md)** · asserted · episode · LegalStatus → ChemicalSubstance|IngredientMaterial|Product|Patent

### Sources, media, discourse and capture tooling (6)

- **[APPEARS_IN](relationships/APPEARS_IN.md)** · asserted · recorded-only · Person → MediaWork
- **[CHUNK_OF](relationships/CHUNK_OF.md)** · structural · recorded-only · Chunk → SourceSnapshot
- **[CONTENT_SPONSORED_BY](relationships/CONTENT_SPONSORED_BY.md)** · asserted · episode · MediaWork → ContentSponsor
- **[COVERS_LOCATOR](relationships/COVERS_LOCATOR.md)** · derived · recorded-only · Chunk → SourceLocator
- **[OCCURS_IN](relationships/OCCURS_IN.md)** · structural · recorded-only · Assertion → MediaWork
- **[PUBLISHES](relationships/PUBLISHES.md)** · structural · recorded-only · Channel → MediaWork

### Derived knowledge, reports, rankings and recommendations (4)

- **[ASSOCIATES](relationships/ASSOCIATES.md)** · derived · recorded-only · Association → Subjectable
- **[BLOCKED_BY](relationships/BLOCKED_BY.md)** · structural · recorded-only · ReportItem → UseConstraint|Assessment
- **[HAS_ITEM](relationships/HAS_ITEM.md)** · structural · recorded-only · Report → ReportItem
- **[USES_CRITERION](relationships/USES_CRITERION.md)** · structural · recorded-only · Report → DecisionCriterion

### Frontiers, breakthroughs and events (5)

- **[DOCUMENTED_BY_RECORD](relationships/DOCUMENTED_BY_RECORD.md)** · asserted · recorded-only · Event → RegulatoryRecord
- **[INVOLVES](relationships/INVOLVES.md)** · asserted · recorded-only · Event → Organization|Person
- **[LEADS_TO](relationships/LEADS_TO.md)** · asserted · recorded-only · Event → Event
- **[ON_FRONTIER](relationships/ON_FRONTIER.md)** · asserted · recorded-only · Event|Study → Frontier
- **[RESPONDS_TO](relationships/RESPONDS_TO.md)** · asserted · recorded-only · Event → Event

## Predicates

374 entries by route: alias 39, assertion-only 98, computation 4, field 14, literal 120, retired 34, typed-edge 65. One card each in `predicates/`; filter with `bks-schema find --kind predicate`.

## Assessments

[APPLICABILITY](assessments/APPLICABILITY.md), [BREAKTHROUGH_JUDGMENT](assessments/BREAKTHROUGH_JUDGMENT.md), [COMPARABILITY](assessments/COMPARABILITY.md), [CONFLICT_RELEVANCE](assessments/CONFLICT_RELEVANCE.md), [EQUIVALENCE](assessments/EQUIVALENCE.md), [EVENT_IMPACT](assessments/EVENT_IMPACT.md), [EVIDENCE_SYNTHESIS](assessments/EVIDENCE_SYNTHESIS.md), [INSIGHT](assessments/INSIGHT.md), [OTHER](assessments/OTHER.md), [QUALITY](assessments/QUALITY.md), [RESOLUTION](assessments/RESOLUTION.md), [RETELLING_FIDELITY](assessments/RETELLING_FIDELITY.md), [SAFETY_SIGNAL](assessments/SAFETY_SIGNAL.md), [SOURCE_AUTHORITY](assessments/SOURCE_AUTHORITY.md), [VETTING](assessments/VETTING.md)

## Rules, patterns, migrations

- Rules: [identity-rules](rules/identity-rules.md), [ingestion-rules](rules/ingestion-rules.md), [temporal-rules](rules/temporal-rules.md), [projection-rules](rules/projection-rules.md), [evidence-path](rules/evidence-path.md), [compatibility](rules/compatibility.md)
- Question sets: [K](patterns/questions/K.md), [D1](patterns/questions/D1.md), [D2](patterns/questions/D2.md), [D3](patterns/questions/D3.md), [D4](patterns/questions/D4.md), [D5](patterns/questions/D5.md), [D6](patterns/questions/D6.md), [D7](patterns/questions/D7.md), [D8](patterns/questions/D8.md), [D9](patterns/questions/D9.md), [D10](patterns/questions/D10.md), [D11](patterns/questions/D11.md), [D12](patterns/questions/D12.md), [D13](patterns/questions/D13.md)
- Migrations: [README](migrations/README.md)
- Vocabularies: [index](vocabularies/INDEX.md)


---
id: "migration:legacy-map"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:migration/legacy-map.yaml"]
aliases: ["legacy-map","legacy map","live legacy graph"]
capabilities: ["get"]
cardDigest: "sha256:daf94623ed4bf090bd4b2f06812da14daeb550aae73d436ee7a7894162552a87"
---
# Live legacy graph to v2 navigation

Source: `migration/legacy-map.yaml` of release biotech-schema-v2.2.0 (format bks-legacy-map.v1, map version 1.0.0, status **candidate**). Navigation only: the migration tooling (`packages/kg-ops/src/migration`) executes it; this page is never an execution script. Legacy data is never deleted.

Reference export `20261011T224403Z-aura-neo4j` (`sha256:7f76eefcf7b50977d78efc7d761e00a4622f7e45d4afa97d11c8d0a84a385ba1`): 210 nodes, 288 relationships, 19 labels, 25 relationship types.

## Preservation

- legacy nodes, relationships and properties are never deleted or rewritten. Legacy properties are never SET by the migrator.
- Relabel: `REMOVE n:<Label> SET n:LegacyV0_<Label>:LegacyV0, n.legacyLabels = <original labels>, n.legacyExportDigest = <exportDigest>` · tag-only (label kept): `Document`, `BellLabsSchemaDeploymentEvidence`
- Lineage edge: `MIGRATED_FROM` (operational; see [operational names](operational-names.md))
- Reverse: `MATCH (n:LegacyV0 {legacyExportDigest: $d}) REMOVE n:LegacyV0_<Label>, n:LegacyV0 SET n:<Label> REMOVE n.legacyLabels, n.legacyExportDigest (per label, from the manifest)`

Dispositions: `migrate` (v2 element created, the legacy element preserved and linked), `retain-legacy` (stays physically, relabeled), `quarantine` (held resolution work, never a v2 fact).

## Legacy labels (19)

| legacy label | count | disposition | v2 target | module | reason | held work |
| --- | --- | --- | --- | --- | --- | --- |
| `BellLabsSchemaDeploymentEvidence` | 1 | retain-legacy | — |  | operational deployment attestation (not domain knowledge); kept as-is, tagged LegacyV0, never migrated |  |
| `Biomarker` | 41 | migrate | [Metric](../nodes/Metric.md) | D4 | every legacy Biomarker is a vendor-reported, DNA-methylation-derived estimate (measurementDirectness is a methylation-derived proxy for all rows); D4 models such a number as a Metric (ALGORITHM_OUTPUT) that QUANTIFIES a… | QUANTIFIES -> curated Biomarker (curation) |
| `Compound` | 19 | migrate | [ChemicalSubstance](../nodes/ChemicalSubstance.md) | D1 | named substances without identifiers; the register's provisional identity tier (normalized preferred name, substanceClass) applies until UNII/InChIKey resolution | identifier resolution (UNII / INCHIKEY / PUBCHEM_CID) |
| `CompoundForm` | 26 | migrate | [IngredientMaterial](../nodes/IngredientMaterial.md) | D1 | product formulation ingredients; their defining substance and form are not resolved, which v2 records as materialKind UNRESOLVED | REALIZES_SUBSTANCE -> ChemicalSubstance (resolution) |
| `Document` | 2 | retain-legacy | — |  | Knowledge Services document-lane records (documentId/documentKey under the live document_* constraints); v2 represents a captured document as Source/SourceSnapshot with captured bytes, which these rows do not carry. Re-… |  |
| `Event` | 3 | migrate | [Event](../nodes/Event.md) | D13 |  |  |
| `LabTest` | 4 | migrate | [LabTest](../nodes/LabTest.md) | D4 | legacy lab tests are vendor algorithm reports over a methylation assay |  |
| `Listing` | 10 | migrate | [MerchantListing](../nodes/MerchantListing.md) | D6 | host catalog entries with a stable URL; identity (hostDomain, hostItemId) is derivable exactly from the URL | Offer + OFFER_PRICE_* Assertions (purchase mode and price kind not stated; priceAmount/currency retained); LISTING_FOR -> Package (OD-43) |
| `ListingSnapshot` | 10 | retain-legacy | — |  | byte-identical state caches of their Listing (OD-43 rationale as ProductSnapshot); price history needs Offer price Assertions from evidenced captures, held with the Listing price work |  |
| `Organization` | 3 | migrate | [Organization](../nodes/Organization.md) | D7 | organizations named by the legacy research runs; no registry identifiers exist, so identity is the provisional (normalized legal name, jurisdiction) tier |  |
| `OrganizationSnapshot` | 1 | retain-legacy | — |  | byte-identical state cache of its Organization; organization history in v2 is FIELD/role Assertions with episodes from evidenced captures (OD-43 rationale) |  |
| `PanelDefinition` | 4 | migrate | [LabTest](../nodes/LabTest.md) | D4 | migration-notes one-to-one PanelDefinition -> LabTest; a panel is a LabTest with testKind PANEL |  |
| `Person` | 36 | migrate | [Person](../nodes/Person.md) | D7 | people named in public organization and publication roles |  |
| `PhysicalLocation` | 2 | retain-legacy | — |  | v2 has no location node type; headquarters text has no registered predicate |  |
| `Product` | 23 | migrate | [Product](../nodes/Product.md) | D6 | enduring product identity; variants, packages, label versions and brand are not evidenced in the legacy rows and are held resolution work | BRANDED_AS -> Brand; HAS_VARIANT/HAS_PACKAGE/HAS_LABEL_VERSION (needs label capture) |
| `ProductSnapshot` | 10 | retain-legacy | — |  | OD-43 folds ProductSnapshot into LabelVersion history when the snapshot carries label content. These snapshots are byte-identical state caches of their Product (every non-temporal field equals the parent in the referenc… |  |
| `RegulatoryStatus` | 6 | migrate | [LegalStatus](../nodes/LegalStatus.md) | D8 |  |  |
| `Study` | 2 | migrate | [Publication](../nodes/Publication.md) | D3 | both legacy Study rows are publications (studyType Publication, registryNamespace DOI); a D3 Study is a registered/described research study and is not evidenced |  |
| `TechnologyPlatform` | 7 | migrate | [AlgorithmVersion](../nodes/AlgorithmVersion.md) | D4 | algorithm platforms are vendor realizations of named algorithm families; the version is unstated, which v2 records as versionBasis UNKNOWN (no invented version or pin date) |  |

## Legacy relationship triples (29)

| legacy type | from | to | count | disposition | v2 target | reason |
| --- | --- | --- | --- | --- | --- | --- |
| `ABOUT` | Document | Organization | 2 | retain-legacy | — | Knowledge Services document lane (Document retained) |
| `ABOUT` | Event | Organization | 3 | migrate | predicate [EVENT_ABOUT](../predicates/EVENT_ABOUT.md) | D13 registered predicate EVENT_ABOUT (object Subjectable) |
| `ADVISES` | Person | Organization | 18 | migrate | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  |
| `AUTHORED_BY` | Document | Organization | 2 | retain-legacy | — | Knowledge Services document lane (Document retained) |
| `CONTAINS_COMPOUND_FORM` | Product | CompoundForm | 27 | quarantine | — | v2 carries formulation through LabelVersion DECLARES_COMPONENT (ComponentLineProperties) under Package/ProductVariant; no label version is evidenced (OD-43). Dose and unit stay on the legacy edge as… |
| `DELIVERS_LABTEST` | Product | LabTest | 7 | migrate | [DELIVERS](../relationships/DELIVERS.md) |  |
| `DEVELOPS_PLATFORM` | Organization | TechnologyPlatform | 7 | quarantine | — | no registered v2 relationship from an Organization to an AlgorithmVersion; the developer is an identity input of AlgorithmVersion (derivation developerOrganization) and the edge is held for D4 review |
| `EMPLOYS` | Organization | Person | 15 | migrate | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  |
| `FOUNDED_BY` | Organization | Person | 4 | migrate | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  |
| `HAS_CEO` | Organization | Person | 2 | migrate | [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) |  |
| `HAS_LOCATION` | Organization | PhysicalLocation | 2 | retain-legacy | — | PhysicalLocation has no v2 type |
| `HAS_PRIMARY_SOURCE` | Study | Document | 2 | quarantine | — | role 'Cited by report' contradicts the edge direction; citation semantics and the Document's capture are unresolved |
| `HAS_REGULATORY_STATUS` | Product | RegulatoryStatus | 6 | migrate | [STATUS_OF](../relationships/STATUS_OF.md) | v2 STATUS_OF (LegalStatus -> Product) episode; held with its LegalStatus when the status is held |
| `HAS_SNAPSHOT` | Listing | ListingSnapshot | 10 | retain-legacy | — | snapshot state caches are retained legacy |
| `HAS_SNAPSHOT` | Organization | OrganizationSnapshot | 1 | retain-legacy | — | snapshot state caches are retained legacy |
| `HAS_SNAPSHOT` | Product | ProductSnapshot | 10 | retain-legacy | — | snapshot state caches are retained legacy |
| `IMPLEMENTS` | Product | TechnologyPlatform | 14 | quarantine | — | no registered v2 relationship from Product to an algorithm/assay version; v2 reaches it through DELIVERS -> LabTest -> PERFORMED_WITH_VERSION, which is migrated where the legacy LabTest USES_PLATFORM… |
| `IMPLEMENTS_PANEL` | Product | PanelDefinition | 8 | migrate | [DELIVERS](../relationships/DELIVERS.md) |  |
| `INCLUDES_BIOMARKER` | PanelDefinition | Biomarker | 38 | migrate | [MEASURES_METRIC](../relationships/MEASURES_METRIC.md) |  |
| `INCLUDES_LABTEST` | PanelDefinition | LabTest | 4 | migrate | [INCLUDES_TEST](../relationships/INCLUDES_TEST.md) |  |
| `INVESTIGATED_BY` | Study | Person | 5 | migrate | predicate [AUTHORED_BY](../predicates/AUTHORED_BY.md) | legacy roleType AUTHOR on a Publication; D3 predicate AUTHORED_BY (Publication -> Person) |
| `LISTS` | Organization | Listing | 10 | migrate | predicate [HOSTED_BY](../predicates/HOSTED_BY.md) | the listing's host domain is the organization's own website domain, which is what HOSTED_BY states; seller of record is not stated (Offer held) |
| `LISTS_PRODUCT` | Listing | Product | 10 | quarantine | — | OD-43 maps a listing only to a single evidenced Package; no Package is evidenced |
| `MEASURES` | LabTest | Biomarker | 45 | migrate | [MEASURES_METRIC](../relationships/MEASURES_METRIC.md) |  |
| `OFFERS` | Organization | Product | 14 | migrate | predicate [DISTRIBUTES](../predicates/DISTRIBUTES.md) | D7 registered predicate DISTRIBUTES (Organization -> Product) matches the stated roleType; rows without a roleType are held |
| `REPORTED_IN` | Event | Document | 3 | quarantine | — | evidence pointer to a document without captured bytes; becomes HAS_EVIDENCE once Knowledge Services captures the document |
| `SPONSORED_BY` | Study | Organization | 2 | quarantine | — | role 'Sponsor / affiliated company' does not distinguish funding (FUNDED_BY) from affiliation |
| `USES_PLATFORM` | LabTest | TechnologyPlatform | 10 | migrate | [PERFORMED_WITH_VERSION](../relationships/PERFORMED_WITH_VERSION.md) | held with its platform when the platform is held (assay platform) |
| `USES_PLATFORM` | Organization | TechnologyPlatform | 7 | quarantine | — | no registered v2 relationship for an organization using an algorithm version |

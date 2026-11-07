---
id: "dom:manufacturing-quality-regulatory-ip"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#manufacturing-quality-regulatory-ip"]
aliases: ["manufacturing-quality-regulatory-ip","manufacturing quality regulatory ip"]
capabilities: ["get","slice"]
cardDigest: "sha256:1606e42556efa49f9ec6f1b2ca17e5c7919b8b96e5f7441f6b71ad73d36d0fbd"
---
# Domain: Manufacturing, quality, regulation and intellectual property

Id `dom:manufacturing-quality-regulatory-ip` · modules [D8](../modules/D8.md) · 6 node types · 2 internal relationship types · seams to 4 other domains.

Regulatory records (filings, letters, recalls, inspections, enforcement), legal status episodes, lots, quality results with their stated verdicts, certification listings and patents.

## Questions this domain answers

- Which lot was tested by which lab, against which specification, and what verdict did the lab state?
- What legal status does this ingredient hold in this jurisdiction, and which record is it from (STATUS_FROM)?
- Which patent concerns this substance, who holds or licenses it, and is it still in force?

## Write guidance

Filing is not capability and licence validity never implies market presence or approval (status non-implication policy, rules/projection-rules.yaml). QualityResult.statedVerdict is the lab's statement; our conformance is an Assessment.

## Start with these types

- [RegulatoryRecord](../nodes/RegulatoryRecord.md) — Purpose: one document-backed act of an authority — regulator, court or patent tribunal — with a record number: an NDI or GRAS response, a citizen-pet…
- [LegalStatus](../nodes/LegalStatus.md) — Purpose: one legal standing of one subject — an ingredient's or product's market-access standing in one jurisdiction under one pathway (excluded / no…
- [Lot](../nodes/Lot.md) — Purpose: one production lot (batch) of one product or variant — the join key for "is the thing I hold real and lawful": recall lot lists, COA lot num…
- [QualityResult](../nodes/QualityResult.md) — Purpose: one reported outcome for one analyte or check, from one row of a COA, a lot test summary, a certifier batch page, a lot-identified survey ta…
- [CertificationListing](../nodes/CertificationListing.md) — Purpose: one listing record of a certifier (NSF Certified for Sport listing 1451522 'Basis'; an NSF/ANSI 173 listing row; an Informed Sport product p…
- [Patent](../nodes/Patent.md) — Purpose: one patent publication at one office (application, grant, reissue).

## Node types (6)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [CertificationListing](../nodes/CertificationListing.md) | D8 | `hu:cert-listing:` | Purpose: one listing record of a certifier (NSF Certified for Sport listing 1451522 'Basis'; an NSF/ANSI 173 listing row; an Informed Sport… |
| [LegalStatus](../nodes/LegalStatus.md) | D8 | `hu:legal-status:` | Purpose: one legal standing of one subject — an ingredient's or product's market-access standing in one jurisdiction under one pathway (exc… |
| [Lot](../nodes/Lot.md) | D8 | `hu:lot:` | Purpose: one production lot (batch) of one product or variant — the join key for "is the thing I hold real and lawful": recall lot lists, C… |
| [Patent](../nodes/Patent.md) | D8 | `hu:patent:` | Purpose: one patent publication at one office (application, grant, reissue). |
| [QualityResult](../nodes/QualityResult.md) | D8 | `hu:quality-result:` | Purpose: one reported outcome for one analyte or check, from one row of a COA, a lot test summary, a certifier batch page, a lot-identified… |
| [RegulatoryRecord](../nodes/RegulatoryRecord.md) | D8 | `hu:reg-record:` | Purpose: one document-backed act of an authority — regulator, court or patent tribunal — with a record number: an NDI or GRAS response, a c… |

## Relationship types inside the domain (2)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [QUALITY_RESULT_FOR](../relationships/QUALITY_RESULT_FOR.md) | asserted | recorded-only | QualityResult → Lot |
| [STATUS_FROM](../relationships/STATUS_FROM.md) | asserted | recorded-only | LegalStatus → RegulatoryRecord |

## Seams to other domains

### → [actors-and-institutions](actors-and-institutions.md) (4)

- [ADDRESSED_TO](../relationships/ADDRESSED_TO.md) · asserted · RegulatoryRecord → Organization
- [ASSIGNED_TO](../relationships/ASSIGNED_TO.md) · asserted · Patent → Organization
- [ISSUED_BY](../relationships/ISSUED_BY.md) · asserted · RegulatoryRecord|QualityResult|CertificationListing → Organization
- [LICENSED_TO](../relationships/LICENSED_TO.md) · asserted · Patent → Organization

### → [frontiers-and-events](frontiers-and-events.md) (1)

- [DOCUMENTED_BY_RECORD](../relationships/DOCUMENTED_BY_RECORD.md) · asserted · Event → RegulatoryRecord

### → [products-and-commerce](products-and-commerce.md) (4)

- [CONCERNS](../relationships/CONCERNS.md) · asserted · RegulatoryRecord|Patent → ChemicalSubstance|IngredientMaterial|Product|Lot
- [COVERS](../relationships/COVERS.md) · asserted · CertificationListing → Product|ProductVariant|Lot
- [LOT_OF](../relationships/LOT_OF.md) · asserted · Lot → Product|ProductVariant
- [STATUS_OF](../relationships/STATUS_OF.md) · asserted · LegalStatus → ChemicalSubstance|IngredientMaterial|Product|Patent

### → [substances-and-biology](substances-and-biology.md) (3)

- [CONCERNS](../relationships/CONCERNS.md) · asserted · RegulatoryRecord|Patent → ChemicalSubstance|IngredientMaterial|Product|Lot
- [MEASURES_ANALYTE](../relationships/MEASURES_ANALYTE.md) · asserted · QualityResult → ChemicalSubstance|IngredientMaterial|Constituent
- [STATUS_OF](../relationships/STATUS_OF.md) · asserted · LegalStatus → ChemicalSubstance|IngredientMaterial|Product|Patent

## Tasks

- [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](../tasks/ingest-regulatory-filing.md) (ingestion)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md) (ingestion)

## v1 navigation aliases

(none)

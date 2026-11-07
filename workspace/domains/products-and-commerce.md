---
id: "dom:products-and-commerce"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#products-and-commerce"]
aliases: ["products-and-commerce","products and commerce"]
capabilities: ["get","slice"]
cardDigest: "sha256:4bc44ce5a8fb9273e2c2d1aa010245a1daecc544ff2a5edff40c50992892282c"
---
# Domain: Products, labels and commerce

Id `dom:products-and-commerce` · modules [D6](../modules/D6.md) · 6 node types · 5 internal relationship types · seams to 6 other domains.

The enduring Product, its variants and packages, label versions with their declared component lines, merchant listings and offers with the seller of record.

## Questions this domain answers

- What does the current label version of this package declare per serving, and when was it observed?
- Which listings sell this package, at what observed price, and who is the seller of record?
- Did the label composition change between two versions (compositionDigest), or only the packaging?

## Write guidance

Label history is HAS_LABEL_VERSION episodes (exclusive per package, slot and asserter); each label line is a DECLARES_COMPONENT edge whose own Assertion carries the printed wording (declaredName:, form:, statement:). A lab measurement of a sold product is MEASURED_CONTENT_IN_PRODUCT (OD-10 option A), never a declaration.

## Start with these types

- [Product](../nodes/Product.md) — Purpose: the enduring marketed concept behind every variant, package and listing ("Tru Niagen", "AG1", "Big Mac"): what a brand presents, what market…
- [ProductVariant](../nodes/ProductVariant.md) — Purpose: a consumer-distinguishable realization of a Product — strength per unit, dosage form, flavor or jurisdiction (round-0001 Candidate B) — the…
- [Package](../nodes/Package.md) — Purpose: a sellable package configuration of one variant — container of N units or net quantity, multipack, kit, bundle, or one served portion of a p…
- [LabelVersion](../nodes/LabelVersion.md) — Purpose: one version of what a package's label (or a menu item's declaration) states — the panel, serving definition, directions with min/max daily s…
- [MerchantListing](../nodes/MerchantListing.md) — Purpose: one host's catalog entry for a sellable item (Amazon ASIN detail page, iHerb product id, Shopify product page, restaurant menu-item page): t…
- [Offer](../nodes/Offer.md) — Purpose: one party's commercial proposition for one listing's item in one market and purchase mode — the subject of every price and availability Asse…

## Node types (6)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [LabelVersion](../nodes/LabelVersion.md) | D6 | `hu:label-version:` | Purpose: one version of what a package's label (or a menu item's declaration) states — the panel, serving definition, directions with min/m… |
| [MerchantListing](../nodes/MerchantListing.md) | D6 | `hu:listing:` | Purpose: one host's catalog entry for a sellable item (Amazon ASIN detail page, iHerb product id, Shopify product page, restaurant menu-ite… |
| [Offer](../nodes/Offer.md) | D6 | `hu:offer:` | Purpose: one party's commercial proposition for one listing's item in one market and purchase mode — the subject of every price and availab… |
| [Package](../nodes/Package.md) | D6 | `hu:package:` | Purpose: a sellable package configuration of one variant — container of N units or net quantity, multipack, kit, bundle, or one served port… |
| [Product](../nodes/Product.md) | D6 | `hu:product:` | Purpose: the enduring marketed concept behind every variant, package and listing ("Tru Niagen", "AG1", "Big Mac"): what a brand presents, w… |
| [ProductVariant](../nodes/ProductVariant.md) | D6 | `hu:product-variant:` | Purpose: a consumer-distinguishable realization of a Product — strength per unit, dosage form, flavor or jurisdiction (round-0001 Candidate… |

## Relationship types inside the domain (5)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [HAS_LABEL_VERSION](../relationships/HAS_LABEL_VERSION.md) | asserted | episode, exclusive | Package → LabelVersion |
| [HAS_OFFER](../relationships/HAS_OFFER.md) | structural | recorded-only | MerchantListing → Offer |
| [HAS_PACKAGE](../relationships/HAS_PACKAGE.md) | structural | recorded-only | ProductVariant → Package |
| [HAS_VARIANT](../relationships/HAS_VARIANT.md) | structural | recorded-only | Product → ProductVariant |
| [LISTING_FOR](../relationships/LISTING_FOR.md) | asserted | episode | MerchantListing → Package |

## Seams to other domains

### → [actors-and-institutions](actors-and-institutions.md) (3)

- [BRANDED_AS](../relationships/BRANDED_AS.md) · asserted · Product → Brand
- [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md) · asserted · LabelVersion → Organization
- [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) · asserted · Offer → Organization

### → [diagnostics-and-devices](diagnostics-and-devices.md) (1)

- [DELIVERS](../relationships/DELIVERS.md) · asserted · Product → LabTest|Device

### → [exposures-and-interventions](exposures-and-interventions.md) (3)

- [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) · asserted · LabelVersion → IngredientMaterial|Constituent|FoodItem
- [HAS_REFERENCE_FOOD](../relationships/HAS_REFERENCE_FOOD.md) · asserted · Product → FoodItem
- [IN_FOOD_CATEGORY](../relationships/IN_FOOD_CATEGORY.md) · asserted · FoodItem|Product → FoodCategory

### → [manufacturing-quality-regulatory-ip](manufacturing-quality-regulatory-ip.md) (4)

- [CONCERNS](../relationships/CONCERNS.md) · asserted · RegulatoryRecord|Patent → ChemicalSubstance|IngredientMaterial|Product|Lot
- [COVERS](../relationships/COVERS.md) · asserted · CertificationListing → Product|ProductVariant|Lot
- [LOT_OF](../relationships/LOT_OF.md) · asserted · Lot → Product|ProductVariant
- [STATUS_OF](../relationships/STATUS_OF.md) · asserted · LegalStatus → ChemicalSubstance|IngredientMaterial|Product|Patent

### → [studies-and-evidence](studies-and-evidence.md) (1)

- [ADMINISTERS](../relationships/ADMINISTERS.md) · asserted · InterventionComponent → IngredientMaterial|ProductVariant|Intervention|FoodItem|DietaryPattern

### → [substances-and-biology](substances-and-biology.md) (1)

- [DECLARES_COMPONENT](../relationships/DECLARES_COMPONENT.md) · asserted · LabelVersion → IngredientMaterial|Constituent|FoodItem

## Tasks

- [Ingest a product label (supplement facts) as a label version with its component lines](../tasks/ingest-product-label.md) (ingestion)
- [Record an observed price for a listing](../tasks/record-price-observation.md) (ingestion)
- [Compare measured content of a sold product with its label declaration (OD-10 option A)](../tasks/measured-versus-declared-content.md) (ingestion)

## v1 navigation aliases

(none)

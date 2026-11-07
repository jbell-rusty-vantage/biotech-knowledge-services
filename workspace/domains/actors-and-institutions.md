---
id: "dom:actors-and-institutions"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#actors-and-institutions"]
aliases: ["actors-and-institutions","actors and institutions"]
capabilities: ["get","slice"]
cardDigest: "sha256:9f6c67010794f2c12a742857c15512f90b88a03834e12a23acb107b72d2c82d5"
---
# Domain: Organizations, people and money

Id `dom:actors-and-institutions` · modules [D7](../modules/D7.md) · 4 node types · 7 internal relationship types · seams to 6 other domains.

Organizations (legal entities, groups), people (public actors only), brands and awards; roles, stakes, control, brand ownership and financial interests as asserted, time-bounded edges.

## Questions this domain answers

- Who holds a role in, a stake in or control of this organization, and since when (HOLDS_ROLE, HOLDS_STAKE, PARENT_OF)?
- Is this brand owned (OWNS_BRAND, needs ownership evidence) or only operated by this organization?
- Does this speaker receive value from the organization whose product they talk about (RECEIVES_VALUE_FROM)?

## Write guidance

No family relationships or private contact details. A role never implies a recommendation; a discount link alone does not prove receipt of value (benefit NOT_STATED until the registered threshold is met).

## Start with these types

- [Organization](../nodes/Organization.md) — Purpose: an organized body as an enduring identity — company, legal entity, corporate group, fund vehicle, university, lab, agency, clinic operator —…
- [Person](../nodes/Person.md) — Purpose: a natural person who is a public actor in sourced material — officer, director, founder, investor, author, investigator, speaker, host, clin…
- [Brand](../nodes/Brand.md) — Purpose: a name under which products, services, clinics or media are presented ('Tru Niagen', 'InsideTracker', a clinic chain name) — kept apart from…
- [Award](../nodes/Award.md) — Purpose: one funding award — grant, contract, sponsored research agreement, prize, in-kind award — as the join point between a funder, the recipient…

## Node types (4)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [Award](../nodes/Award.md) | D7 | `hu:award:` | Purpose: one funding award — grant, contract, sponsored research agreement, prize, in-kind award — as the join point between a funder, the… |
| [Brand](../nodes/Brand.md) | D7 | `hu:brand:` | Purpose: a name under which products, services, clinics or media are presented ('Tru Niagen', 'InsideTracker', a clinic chain name) — kept… |
| [Organization](../nodes/Organization.md) | D7 | `hu:org:` | Purpose: an organized body as an enduring identity — company, legal entity, corporate group, fund vehicle, university, lab, agency, clinic… |
| [Person](../nodes/Person.md) | D7 | `hu:person:` | Purpose: a natural person who is a public actor in sourced material — officer, director, founder, investor, author, investigator, speaker,… |

## Relationship types inside the domain (7)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [AWARDED_BY](../relationships/AWARDED_BY.md) | asserted | recorded-only | Award → Organization |
| [AWARDED_TO](../relationships/AWARDED_TO.md) | asserted | recorded-only | Award → Organization\|Person |
| [HOLDS_ROLE](../relationships/HOLDS_ROLE.md) | asserted | episode | Person → Organization |
| [HOLDS_STAKE](../relationships/HOLDS_STAKE.md) | asserted | episode | Person\|Organization → Organization |
| [OWNS_BRAND](../relationships/OWNS_BRAND.md) | asserted | episode | Organization → Brand |
| [PARENT_OF](../relationships/PARENT_OF.md) | asserted | episode | Organization → Organization |
| [RECEIVES_VALUE_FROM](../relationships/RECEIVES_VALUE_FROM.md) | asserted | episode | Person → Organization |

## Seams to other domains

### → [diagnostics-and-devices](diagnostics-and-devices.md) (1)

- [PERFORMED_BY_LAB](../relationships/PERFORMED_BY_LAB.md) · asserted · AssayVersion → Organization

### → [frontiers-and-events](frontiers-and-events.md) (1)

- [INVOLVES](../relationships/INVOLVES.md) · asserted · Event → Organization|Person

### → [manufacturing-quality-regulatory-ip](manufacturing-quality-regulatory-ip.md) (4)

- [ADDRESSED_TO](../relationships/ADDRESSED_TO.md) · asserted · RegulatoryRecord → Organization
- [ASSIGNED_TO](../relationships/ASSIGNED_TO.md) · asserted · Patent → Organization
- [ISSUED_BY](../relationships/ISSUED_BY.md) · asserted · RegulatoryRecord|QualityResult|CertificationListing → Organization
- [LICENSED_TO](../relationships/LICENSED_TO.md) · asserted · Patent → Organization

### → [products-and-commerce](products-and-commerce.md) (3)

- [BRANDED_AS](../relationships/BRANDED_AS.md) · asserted · Product → Brand
- [NAMES_RESPONSIBLE_PARTY](../relationships/NAMES_RESPONSIBLE_PARTY.md) · asserted · LabelVersion → Organization
- [SELLER_OF_RECORD](../relationships/SELLER_OF_RECORD.md) · asserted · Offer → Organization

### → [sources-documents-and-media](sources-documents-and-media.md) (2)

- [APPEARS_IN](../relationships/APPEARS_IN.md) · asserted · Person → MediaWork
- [CONTENT_SPONSORED_BY](../relationships/CONTENT_SPONSORED_BY.md) · asserted · MediaWork → ContentSponsor

### → [studies-and-evidence](studies-and-evidence.md) (1)

- [HAS_STUDY_ROLE](../relationships/HAS_STUDY_ROLE.md) · asserted · Study → Organization|Person|Award

## Tasks

- [Ingest an organization profile (roles, stakes, brands, control)](../tasks/ingest-organization-profile.md) (ingestion)
- [Ingest claims made in a podcast or video episode](../tasks/ingest-podcast-claims.md) (ingestion)
- [Record a financial interest or conflict and its disclosure](../tasks/interest-conflict-disclosure.md) (ingestion)

## v1 navigation aliases

(none)

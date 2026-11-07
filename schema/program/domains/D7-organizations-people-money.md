# D7 — Organizations, people and money

Lens: economics and community. Current fragment: W01 Actors and institutions (9 node types: Organization, LegalEntity, ConsumerBrand, Facility, OrganizationSnapshot, Person, PseudonymousActor, AnonymousActor, CohortParticipant). `Organization` is the largest hub in the schema (59 relationship fields, 24,912 generated lines).

## Scope

Who is who and who pays whom: companies (brands, ingredient suppliers, CROs, CDMOs, labs, clinics, retailers, media companies, investors), legal entities and brands, facilities, people (founders, scientists, clinicians, hosts, guests, investigators), pseudonymous speakers, roles with validity episodes, ownership, affiliations, funding, financial interests and disclosures. Out of scope: what organizations publish (D9), their products (D6), their regulatory record (D8); roles live as edges in the domain that asks about them (R7).

## Ecosystem to survey

The longevity industry map: biotech and pharma pipelines (Altos, Retro, Unity, BioAge, Loyal), supplement brands and their holding companies, ingredient suppliers, contract manufacturers, testing and certification bodies, clinics, media companies and creator businesses, investors and funds (Longevity Fund, Hevolution, ARPA-H), nonprofits (Buck, LEVF, Lifespan.io), academic labs; disclosure norms (ICMJE, FTC 16 CFR 255, podcast sponsorship), corporate registries (OpenCorporates, SEC EDGAR, Companies House), ORCID and NPI for people.

## Seed questions

- Who owns, operates, advises, is employed by or has a financial interest in this organization, since when, and by which source?
- Is this brand a legal entity or a marketing name of one, and who manufactures for it?
- Does this speaker have a financial interest in what they recommend (seam D9), disclosed or undisclosed?
- Who funded this study and what else do they fund (seam D3)?
- Which people connect two organizations (board, advisory, founder) and when did that start and end?
- Which organizations supply, test, certify or sell for this brand (seams D1, D8, D6)?

## Retrieval patterns to consider

Role edges with validity episodes and year-precision bounds; conflict-of-interest paths (person → role → organization → product or claim) with a maximum length; GDS: betweenness and community detection over the people–organization graph, link prediction for undisclosed relations as leads only; identity resolution between handles and persons.

## Sources and tools to score (with D11)

OpenCorporates API, SEC EDGAR full text and XBRL, Companies House, Crunchbase and PitchBook (license), LinkedIn (terms), ORCID, the NPI registry (MCP attached), ClinicalTrials.gov sponsor and investigator fields, podcast show notes, FTC actions, CMS Open Payments for clinicians.

## Known problems and open questions

The `Organization` hub split (R7); organization role predicates stay predicate-only except the commerce and financial-interest families (open item 3); conflicting role kinds across sources need an adjudication method; the private-personal boundary for persons who are not public actors.

## Deliverables

`../packets/D7/` per PLAN 5.1, including the hub split proposal with before and after size numbers.

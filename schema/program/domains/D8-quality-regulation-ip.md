# D8 — Manufacturing, quality, regulation and IP

Lens: economics. Current fragments: W11 Manufacturing (5 node types), W12 Quality testing and certification (13), W13 Regulation and jurisdictions (10), W14 IP and licensing (7). 35 node types for a domain with few first-pass questions: the candidate for the largest cut.

## Scope

Is the product what it says, is it lawful, and who owns the rights: specifications and versions, processes, lots and their tests, COAs and test summaries, certification programs and listings (NSF, USP, Informed Sport); regulatory agencies, pathways and their versions, submissions, statuses (NDI, GRAS, novel food, drug approval), inspections and warning letters; patents, claims, licenses, trademarks. Out of scope: the product's commercial life (D6), the substance identity (D1).

## Ecosystem to survey

Contract manufacturers and cGMP practice, third-party testing labs (Eurofins, NSF labs, Alkemist), certification bodies and what their public databases expose, FDA dietary supplement regulation in practice (NDI notifications, GRAS notices, warning letters, Form 483s, recalls), EFSA novel foods, Health Canada NPN/LNHPD, TGA, the patent landscape of key longevity compounds (NR, NMN, urolithin A, spermidine, rapamycin formulations), licensing practice between ingredient patent holders and brands, trademark use as identity.

## Seed questions

- Which lot was tested by which lab against which specification version, with what verdict, and is the COA genuine (the COA versus test-summary rule)?
- What regulatory status does this ingredient hold in this jurisdiction at date D (filing is not capability; round 0005)?
- Which brands received warning letters or recalls about which claims or contaminants?
- Which patent claims cover this formulation, who holds the license, and does the license cover what the brand sells?
- Which certification listing covers which products and lots, and when did it lapse?
- Is this manufacturer capable (stage) of producing this ingredient at scale, by what evidence?

## Retrieval patterns to consider

Lot → test → result → verdict chains; regulatory status as-of with pathway versions; certification coverage over product sets; patent family → claim → formulation coverage as assessments; GDS: little; mostly as-of traversal.

## Sources and tools to score (with D11)

openFDA (enforcement; warning letters via the FDA site), FDA NDI and GRAS notice inventories, DailyMed, Health Canada LNHPD API, EFSA OpenFoodTox and the novel food catalogue, USPTO PatentsView and Google Patents, EPO OPS, NSF/USP/Informed Sport databases (scrape), the FDA inspection classification database and Data Dashboard.

## Known problems and open questions

COA classification evidence; specification targets versus release limits versus shelf-life limits; `RegulatoryPathway` versioning; inspections modeled now or later; the `IpRightStatus` candidate. The first-pass decision: which of the 35 node types answer a Wave-2 question at all.

## Deliverables

`../packets/D8/` per PLAN 5.1, with an explicit "deferred" list expected to be the longest of all packets.

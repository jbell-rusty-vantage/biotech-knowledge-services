# Fixture nr-chloride-gsrs-identifier-bridge — source

- url: https://precision.fda.gov/ginas/app/api/v1/substances(8XM2XT8VWI)?view=full
- title: FDA Global Substance Registration System — NICOTINAMIDE RIBOSIDE CHLORIDE, UNII 8XM2XT8VWI, record version 18 (view=full JSON)
- retrieved: 2026-10-08
- snapshot digest: sha256:ec5e5d2dc8e5a156deb38de9fca4a7f5a212ac42f54f4d769205fbff4f1b3ddd
- kind: other
- also: identifier bridge (kernel identifier pattern + D11 identifier-bridges.yaml B07–B10), disconfirmation of a machine-produced identity link (Q-D11-10), supports the quantity-basis harm question CQ-PV-04
- tool: `fda-gsrs` via curl 8 (precision.fda.gov host); 16,367 bytes, RAW_BYTES; re-fetched 2026-10-08T21:54:54Z, sha256 equal to the research capture (21:09:03Z).

The GSRS record for the salt form used in NR trials and supplements lists, as typed codes, CAS 23111-00-4, PubChem CID 90480033, the FDA UNII 8XM2XT8VWI and GRAS notice GRN 635, computes InChIKey YABIFCKURFRPPO-IVOJBTPCSA-N, and relates the salt to its ACTIVE MOIETY NICOTINAMIDE RIBOSIDE (UNII 0I8H2M0L7N, record version 24), which carries a different identifier set (CAS 1341-23-7, CID 439924, ChEBI 15927). The fixture writes each code as a kernel `HAS_IDENTIFIER` episode asserted by GSRS from a JSON-pointer locator (`/codes/i`), the salt→moiety link as D1 `HAS_ACTIVE_MOIETY`, and PubChem's own InChIKeys as structural corroboration — so the UNII↔CAS↔CID↔InChIKey bridge is co-attachment on one substance from one authority snapshot, never an identifier→identifier edge. The negative half: Europe PMC's text-mining annotator tagged the title words "nicotinamide riboside" of the NR trial paper (PMC5876407) with ChEBI_80498, dihydrozeatin riboside. That proposal is recorded as a RESOLUTION Assessment from a TEXT_MINING_AGENT and superseded by an authority check (verdict CONTRADICTED: GSRS records ChEBI 15927 for NR); no CHEBI:80498 identifier is ever attached. Not a harm or disconfirmation fixture by kind (the packet's harm and disconfirmation fixtures are `sirolimus-spl-boxed-warning` and `resveratrol-retraction-integrity`), hence `kind: other`.

Further sources of this fixture:

| url | title | retrieved | digest | tool |
| --- | --- | --- | --- | --- |
| https://precision.fda.gov/ginas/app/api/v1/substances(0I8H2M0L7N)?view=full | GSRS NICOTINAMIDE RIBOSIDE (active moiety, UNII 0I8H2M0L7N, record version 24) | 2026-10-08 | sha256:a673c453fcbb047df59dc5ad543e2e08c418061939fc56874f9a735182c7ed24 | fda-gsrs (curl) |
| https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/439924,90480033/property/MolecularFormula,InChIKey/JSON | PubChem PUG REST properties for CID 439924 (NR cation) and 90480033 (NR chloride) | 2026-10-08 | sha256:300c81c8bad479f26d6a2bb7f0f35ed3e794f5aa09573b1736f44a71e5337f1b | pubchem-pug-rest (curl) |
| https://www.ebi.ac.uk/europepmc/annotations_api/annotationsByArticleIds?articleIds=PMC:5876407&format=JSON | Europe PMC Annotations API, 341 annotations for PMC5876407 (annotation 10: "nicotinamide riboside" → CHEBI_80498) | 2026-10-08 | sha256:1703421335dd6b5763dc72e3859732af08dd481bcaa680def9703c8a6572e633 | europepmc-annotations (curl) |
| https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5876407/fullTextXML | JATS title of the NR trial paper (the tagged mention; same snapshot as `nr-trial-jats-unstructured`) | 2026-10-08 | sha256:dd620181966f862df7030f4bb7b09811befd90e8e67c2b94fc90f9c212664794 | europepmc-fulltext-jats (curl) |

Uid compatibility: the two substances are the nodes of `final/fixtures/D1/nr-salt-moiety-us-canada` (A2: `sub-nrcl`, `sub-nr`, `org-fda-srs`), which cites the same GSRS snapshot for version, formula and molecular weight; uids `hu:substance:unii-<unii lower case>`.

# Fixture: resveratrol identifier crosswalk (Wikidata Q407329 vs NLM's MEDLINE ChemicalList)

- kind: other
- url: https://www.wikidata.org/wiki/Special:EntityData/Q407329.json
- title: Wikidata item Q407329 "resveratrol" (lastrevid 2497216568, modified 2026-05-25T10:22:48Z)
- retrieved: 2026-10-08
- snapshot digest: sha256:9df1b256618ad7661228412034258949e0258edc212c88e4d8b7bef752f8273e (268,104 bytes, raw bytes; byte-identical to the research-stage capture)
- tool: tool:wikidata-api (curl, Special:EntityData and the MediaWiki revisions API); tool:ncbi-eutils (PubMed ChemicalList); patterns from tool:bioregistry-api (research stage) and `../../identifier-schemes.yaml`

| url | title | retrieved | snapshot digest | tool |
| --- | --- | --- | --- | --- |
| https://www.wikidata.org/w/api.php?action=query&prop=revisions&revids=2484372968\|2484373002\|2484377019\|2484690167\|2484691068\|2484694097&rvprop=ids\|timestamp\|user\|comment\|size\|sha1&format=json | six pinned revisions of Q407329 (2026-04-24 adds, 2026-04-25 removals) | 2026-10-08 | sha256:32db66fb48e51a4378995d22aabaeb4b70fce48f2af2ea340550689b5ab793c4 | tool:wikidata-api |
| https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=23471411&retmode=xml | PubMed record of Hubbard et al. 2013 (ChemicalList: Resveratrol, RegistryNumber Q369O8926L, MeSH D000077185) | 2026-10-08 | sha256:7dbca2395e1bf0472c1f1fb2012c143c1897715738faa023bc7a3b77f40913a4 | tool:ncbi-eutils |

## What the fixture shows

Identifier identity and assignment in the kernel. Wikidata states eight identifiers for resveratrol (UNII Q369O8926L, CAS 501-36-0, PubChem CID 445154, ChEBI 45713, ChEMBL CHEMBL165, MeSH D000077185, InChIKey LUKBXSAWLPMMSZ-OWOJBTEDSA-N, and the item id itself); NLM's ChemicalList independently states the UNII and the MeSH UI. Each statement is one Assertion (predicate HAS_IDENTIFIER, asserter Wikidata or NLM, evidence a JSON pointer or a text quote) that authorizes one HAS_IDENTIFIER episode, so the UNII and MeSH links carry two episodes each and agree (Q-K-29 finds no conflict). Identifier nodes are keyed by (scheme, issuer, value), with the minting registry as issuer. One real probe fails the register's pattern: Wikidata stores ChEBI as the bare number `45713`, which fails `^CHEBI:[0-9]+$` until the normalizer adds the prefix. The UNII locator is anchored on the statement's own `mainsnak` (the research stage's byte offset pointed at a copy of the value inside another statement's reference). The pinned revision log records an ingredient-encyclopedia account adding two promotional "described at URL" statements and a "described by source" statement on 2026-04-24 and another user removing them on 2026-04-25: a recorded-time illustration for as-of reads.

## Files

- `locators.yaml`: 3 snapshots, 11 locators (10 JSON_POINTER, 1 TEXT_QUOTE) (generated)
- `assertions.yaml`: 8 Identifier nodes with pattern checks, 10 HAS_IDENTIFIER assertions, 11 episodes (one from `../seller-claim-occurrences`), the external revision history
- `intent.json`: biotech-knowledge-intent.v1 (validated): 10 identifier.attach
- `questions.md`

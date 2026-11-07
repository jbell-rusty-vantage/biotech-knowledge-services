# resveratrol-identifier-crosswalk: questions answered

Ids from `../../../../packets/K/02-questions.md`, patterns from `../../../../packets/K/03-retrieval-patterns.md`.

| question | expected answer from this fixture |
| --- | --- |
| Q-K-12 | e-resveratrol carries 8 Identifiers: UNII Q369O8926L (FDA GSRS; 2 open episodes: Wikidata, NLM), CAS_RN 501-36-0 (Chemical Abstracts Service; 2 episodes: Wikidata, Active Motif), PUBCHEM_CID 445154 (NCBI PubChem), CHEBI CHEBI:45713 (EMBL-EBI), CHEMBL CHEMBL165 (EMBL-EBI ChEMBL), MESH D000077185 (NLM; 2 episodes: Wikidata, NLM), INCHIKEY LUKBXSAWLPMMSZ-OWOJBTEDSA-N, WIKIDATA Q407329; validity OBSERVATION_ONLY (observed 2026-10-08), recordedFrom 2026-10-08T22:09:18Z. Reverse lookup (UNII, FDA GSRS, Q369O8926L) → e-resveratrol. |
| Q-K-29 | SHARED: none (each Identifier has one holder). MULTI_VALUED: none (one value per scheme). PATTERN: none for stored values; the raw Wikidata ChEBI value `45713` fails `^CHEBI:[0-9]+$` and is stored only after normalization to `CHEBI:45713` (the normalizer must run before the node write, or the pattern check flags it). CAS 501-36-0 passes the check digit. Wikidata and NLM agree on UNII and MeSH; the vendor's CAS agrees with Wikidata. |
| Q-K-02 | (analogue, external writer) Wikidata's own recorded-time history: a capture between 2026-04-24T12:10:28Z and 2026-04-25T20:30:45Z would have carried two "described at URL" statements and one "described by source" statement added by an ingredient-encyclopedia account; the 2026-10-08 capture (lastrevid 2497216568) carries none. An as-of answer cites the snapshot it read. |
| Q-K-07 | (analogue) Diff between the external "runs" of 2026-04-24 (revisions 2484372968, 2484373002, 2484377019: three claims created) and 2026-04-25 (2484690167, 2484691068, 2484694097: the same three removed); each revision has its own sha1 in the capture. |

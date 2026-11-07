# Close-out: fixture editor (S) — final/fixtures/D7/ (FU-03), 2026-10-09

Scope: `final/fixtures/D7/<folder>/{assertions.yaml,intent.json}` only. source.md, locators.yaml, snapshot digests and every
sourced number / identifier / quote untouched. SDL untouched. Not committed (coordinator commits).

## Baseline lint

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D7/<folder>
```

| fixture | errors | warnings | categories |
|---|---|---|---|
| attia-cgm-dexcom-recommendation-interest | 12 | 0 | edge-property 6, retired-name 6 (R-30) |
| bioage-group-vehicles-stale-role | 24 | 0 | edge-property 12, retired-name 12 (R-30) |
| elysium-paper-funding-award | 4 | 0 | edge-property 2, retired-name 2 (R-30) |
| ftc-ameribev-paid-dieticians-harm | 0 | 0 | — |
| niagen-ownership-brand-history | 32 | 0 | edge-property 16, retired-name 16 (R-30) |
| sinclair-self-disclosure-unstructured | 34 | 0 | edge-property 17, retired-name 17 (R-30) |
| **total** | **106** | **0** | all R-30 |

Edits the lint does not see (checked by hand): R-55 disclosureFinding values (attia, ftc), R-15 asserters (elysium: the
paper's own-voice statements asserted by the corresponding author / "PMC10903100 authors"), R-09/R-27 Mention (sinclair:
`mentions:` section, `inputMentions`, two `mention.stage` intent proposals). Predicate registry: no alias/retired/
unregistered predicate in D7 (0 predicate-* violations). rulings.yaml modules.D7 has no edit-fixture op; R-21 "bioage" is
D13/bioage-strides-discontinuation (not D7).

## Edits

1. **R-30** (scratch `r30-d7.mjs`, text edit for YAML, JSON re-serialized with 2-space indent, which round-trips byte-for-byte):
   `roleTitleVerbatim` / `stakeClassVerbatim` removed from HOLDS_ROLE / HOLDS_STAKE edge properties; the printed text becomes the
   first authorizing-Assertion qualifier `roleText:'…'` / `stakeClass:'…'` (a `qualifiers:` line was added where the Assertion
   had none: bioage b-02, b-06; niagen n-04, n-05, n-07, n-08). intent.json: field removed from `edgeProperties`, the qualifier
   is carried in `rationale` ("R-30 authorizing-Assertion qualifiers (intent v1 has no assertion.qualifiers; carried here): …",
   the D6 editor's wording). Counts (assertions / intent): attia 3/3, bioage 6/6, elysium 1/1, niagen 8/8, sinclair 9/8
   (a-13 is held, not in the intent) = 27/26.
2. **R-15** elysium-paper-funding-award: new seam entity / intent subject D3 Publication `hu:publication:pmid-38241160`
   (name = loc-jats-title quote; PMID/PMCID/DOI as printed in e-04; issuers NLM/NLM/Crossref as in the other fixtures).
   Asserter → the Publication for the paper's own-voice statements e-01..e-03 (was `{ source: "PMC10903100 authors" }`, no
   asserterRef in the intent), e-04 and e-12..e-14 (was the corresponding author "standing in for the author group").
   e-05..e-07 (competing interests of named authors) stay with the named Person (R-15 bullet 3).
3. **R-09/R-27** sinclair-self-disclosure-unstructured: `mentions:` section removed (m-fd-sinclair, m-insidetracker) and replaced
   by a comment; as-res-01 `inputMentions` → `facets: ["surfaceForm=David Sinclair", "typeHint=Person"]` and its
   loc-fd-sinclair-name evidence role SUPPORTS → CONTEXT (SDL Assessment docstring); a-13 `via` and the Segterra note reworded.
   intent.json: the two `mention.stage` proposals removed (14 → 12 proposals); notes updated.
4. **R-55**: attia `disclosureFinding=DISCLOSED_IN_LATER_REVISION` is in the decision report's merged list → unchanged. ftc
   `INADEQUATE_DISCLOSURE_PER_REGULATOR` is a D7 value absent from the five-value list (D9 spells it INADEQUATE_PER_REGULATOR;
   seams.yaml D7.conflict-relevance openIssue): no mapping in the ruled list, so kept → owner-gated (vocabulary editor with D9).
5. Header comment (assertions.yaml) and `notes` (intent.json) record the close-out in each edited fixture; prose avoids the
   retired tokens (the residual scan reads non-comment JSON/YAML text).

## Checks

```
bash <scratch>/lintd7.sh            # lint-fixtures.mjs --fixture D7/<folder> ×6
# -> every D7 fixture: errors 0, warnings 0   (before: 106 errors = attia 12, bioage 24, elysium 4, ftc 0, niagen 32, sinclair 34)
node <scratch>/val-d7.mjs           # zod IngestionIntent + Ajv 2020 biotech-knowledge-intent.v1.json (as validate-intents.mjs)
# -> all 6 intents: zod true, jsonSchema true (first run: elysium invalid — identifiers need issuer; fixed)
YAML.parseDocument on the 6 assertions.yaml -> no errors
```

`_work/validate-intents.mjs` and `lint-fixtures.mjs --baseline` were not run (they rewrite shared files); the coordinator's
full re-run picks up these edits. FU-03 table rows for the six D7 fixtures updated (fixtures/README.md, targeted line replace
after a fresh read). Files: fixtures/D7/{attia…,bioage…,elysium…,niagen…,sinclair…}/{assertions.yaml,intent.json},
fixtures/README.md (6 rows). Not changed: source.md, locators.yaml, questions.md, ftc files.

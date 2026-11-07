# Close-out (second attempt): fixture editor (S), final/fixtures/D7/ (FU-03), 2026-10-09

This is the recovery round. The coordinator reset `final/fixtures/` to 31390a6 after `repath-fixtures.mjs` was run during the
first round, so the D7 folder started unedited. I used the lost first attempt's log (`_runlog/closeout-fixture-editor-D7.md`)
as a guide and re-applied and re-verified every edit myself.

Scope:
- Changed: `final/fixtures/D7/<folder>/{assertions.yaml,intent.json}` and the six D7 rows of the FU-03 table in `fixtures/README.md`.
- Not changed: source.md, locators.yaml, questions.md, snapshot digests, sourced numbers, identifiers and quotes, and the SDL.
- Not committed.
- Not run, imported or required: `repath-fixtures.mjs`, `validate-intents.mjs` and `lint-fixtures.mjs --baseline`. I only read them as text.

## Inputs

- The FU-03 table rows for D7:
  - attia, bioage, elysium, niagen and sinclair: R-30.
  - attia and ftc: R-55.
- `_work/rulings.yaml` `modules.D7` has no `edit-fixture` op.
  - R-92 (FINANCING_AMOUNT and the related predicates) has 0 uses in D7.
  - R-21 "bioage" refers to D13, not D7.
- `predicates.yaml`: no alias, retired or unregistered predicate is used in D7. The baseline has 0 `predicate-*` violations.
- Cross-cutting rulings I checked by hand:
  - R-15 (elysium asserters).
  - R-09/R-27 (the sinclair `mentions:` section and the `mention.stage` proposals).
  - R-23, R-44, R-47, R-49, F-05 and R-43: grep found no supersedesUid, HAS_REVISION_STATUS, nNoChangeContexts, OTHER discourse Assessment, ClaimOccurrence or RENDITION_OF in D7.

## Baseline lint

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-fixtures.mjs --fixture D7/<folder>
```

| fixture | errors | warnings | categories |
|---|---|---|---|
| attia-cgm-dexcom-recommendation-interest | 12 | 0 | edge-property 6, retired-name 6 |
| bioage-group-vehicles-stale-role | 24 | 0 | edge-property 12, retired-name 12 |
| elysium-paper-funding-award | 4 | 0 | edge-property 2, retired-name 2 |
| ftc-ameribev-paid-dieticians-harm | 0 | 0 | — |
| niagen-ownership-brand-history | 32 | 0 | edge-property 16, retired-name 16 |
| sinclair-self-disclosure-unstructured | 34 | 0 | edge-property 17, retired-name 17 |
| **total** | **106** | **0** | all R-30 |

## Edits

1. **R-30** (scratch script `<scratchpad>/r30-d7.mjs`; dry run first, then `--write`).
   - In assertions.yaml, `roleTitleVerbatim` and `stakeClassVerbatim` are removed from the HOLDS_ROLE and HOLDS_STAKE edge properties. The value moves unchanged into the first qualifier of the authorizing Assertion, written `roleText:'…'` or `stakeClass:'…'`.
     - This is the same quoting as the D6 and D9 editors and the existing D7 e-12..e-14 qualifiers.
     - Assertions that had no qualifiers got a new `qualifiers:` line: bioage b-02 and b-06; niagen n-04, n-05, n-07 and n-08.
   - In intent.json, the field is removed from `edgeProperties` and the qualifier is put at the head of `rationale` (v1 AssertionCore has no qualifiers).
   - The script checks its own output:
     - The parsed YAML must equal the original minus the removed fields plus the added qualifiers.
     - The intent qualifier must match the YAML qualifier for each proposal.
   - Counts (assertions / intent): attia 3/3, bioage 6/6, elysium 1/1, niagen 8/8, sinclair 9/8 (a-13 is held and is not in the intent). Total 27/26.
2. **R-15** elysium-paper-funding-award.
   - New entity `hu:publication:pmid-38241160`: type Publication, module D3, seam.
     - The name is the `loc-jats-title` quote.
     - `publicationKind` is ARTICLE (source.md: Neurotherapeutics journal article).
     - The identifiers are PMID/NLM, PMCID/NLM and DOI/Crossref, as printed in e-04's object.
   - In the intent, this is the new subject `publication.pmid-38241160`.
   - Asserters changed to the Publication:
     - e-01..e-03 were `{source: "PMC10903100 authors"}` and had no asserterRef in the intent.
     - e-04 and e-12..e-14 were the corresponding author "standing in for the author group".
   - e-05..e-07 (competing interests of named authors) stay with the named Person, per R-15 bullet 3.
   - Each changed proposal's rationale ends with "R-15: …".
3. **R-09/R-27** sinclair-self-disclosure-unstructured.
   - The `mentions:` section is removed (m-fd-sinclair, m-insidetracker) and replaced by a comment.
   - as-res-01:
     - `inputMentions` becomes `facets: ["surfaceForm=David Sinclair", "typeHint=Person"]`.
     - The `loc-fd-sinclair-name` evidence role changes from SUPPORTS to CONTEXT (SDL Assessment docstring, lines 918–920).
   - Reworded: a-13 `via` and the Segterra entity note.
   - intent.json: the two `mention.stage` proposals are removed (14 → 12).
   - InsideTracker had no binding resting on it, so no Assessment is needed (R-27). Its surface form stays at `loc-sin-insidetracker`.
4. **R-55**:
   - attia `disclosureFinding=DISCLOSED_IN_LATER_REVISION` is in the decision-report list, so it is unchanged.
   - ftc `INADEQUATE_DISCLOSURE_PER_REGULATOR` is in the D7 list (seams.yaml `d7Values`), so it is in the "union" rule. It is not in the five-value decision-report list, and D9 spells it `INADEQUATE_PER_REGULATOR` (seams.yaml `openIssue`).
     - I kept it, because there is no ruled mapping and no `final/vocabularies` file for D7.conflict-relevance yet. It is **owner-gated** (vocabulary editor with D9).
5. Bookkeeping: each edited fixture has a header comment (assertions.yaml) and an addition to `notes` (intent.json) that record the close-out.
   - The prose avoids retired tokens, because the residual scan reads non-comment text.
   - My first wording "no Mention node" in a YAML note and in the intent notes tripped `retired-name` (2 errors on sinclair). I reworded it to "no surface-form node (R-09)".

## Checks

```
lint-fixtures.mjs --fixture D7/<folder>   (×6)
# every D7 fixture: errors 0, warnings 0      (before: 106 errors, 0 warnings)
node <scratchpad>/val-d7.mjs              # zod IngestionIntent + Ajv 2020 biotech-knowledge-intent.v1.json (+ajv-formats), read-only
# attia 6, bioage 8, elysium 14, ftc 4, niagen 20, sinclair 12 proposals: zod true, jsonSchema true for all 6
YAML.parseDocument on the 6 assertions.yaml -> 0 errors, 0 warnings
JSON.stringify(parse(intent), null, 2) + "\n" === file  -> true for all 6 (format preserved)
```

## README

I updated the six D7 rows of "Residual non-final names and pending ruling edits":
- Column 2 is now "—".
- Column 3 is now "applied (close-out FU-03, 2026-10-09): …".

Method:
- The script matched only lines that start with `| D7/<folder> |`.
- It re-read the file just before writing and asserted the content had not changed, because other editors edit other rows concurrently.
- Line endings stay LF, as at HEAD.

The only remaining owner-gated item is the ftc R-55 value.

## Open items (reported, not acted on)

- The pattern writer noted (closeout-S-patterns-D7.md) that the attia fixture writes no D9 MediaWork, OCCURS_IN or RENDITION_OF.
  - Because of that, Q-D7-06 and CQ-CL-05 take the snapshot fallback (R-19).
  - This is not in the FU-03 table. Adding a container would be new content, not a ruling re-key, so I did not add it. It goes to the coordinator or the D7/D9 owners.
- The elysium JATS snapshot is not linked to the new Publication by RENDITION_OF (R-43 asserted).
  - Writing that link needs an asserter choice (the publisher, or Europe PMC as relayer) that the fixture does not state.
  - I recorded this in the entity note and did not invent the link.

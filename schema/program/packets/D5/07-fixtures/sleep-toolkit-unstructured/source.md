# Fixture: sleep-toolkit-unstructured

- url: https://www.hubermanlab.com/newsletter/toolkit-for-sleep
- title: Toolkit for Sleep (Huberman Lab newsletter; page displays "September 20, 2021")
- retrieved: 2026-10-08
- snapshot digest: sha256:ba41fc394014a65b3f20e29e1ccb9d4fe9222e99a16398da1277a90e6739f61f
- kind: unstructured-to-entity
- tool: Tavily CLI `tvly extract` (v0.1.5, `PYTHONUTF8=1`), raw_content markdown = the stored snapshot (tool id `tool:tavily-extract`); second edition by curl Wayback `id_` replay (`tool:wayback-cdx`)
- second snapshot: http://web.archive.org/web/20211018160634id_/https://hubermanlab.com/toolkit-for-sleep/ (requested 20211016002820, served 20211018160634 by HTTP 302; Memento-Datetime Mon, 18 Oct 2021 16:06:34 GMT) · retrieved 2026-10-08 · snapshot digest sha256:ac737d4c7a6d11a780377ba039dd0efcd8f52c92d146ad7bbf6268ac26d1ce00 (raw archived HTML, byte-identical to the research-stage capture). Adversarial review re-test (2026-10-08): the requested URL 20211016002820id_ now answers HTTP 200 with its own capture (Memento-Datetime Sat, 16 Oct 2021 00:28:20 GMT, sha256 65ec04d1…949a decompressed), whose supplier text matches; the fixture keeps the 2021-10-18 bytes it captured
- fixture stage: A5, 2026-10-08 (generator `scratch ft/D5/gen/gen_sleep.py`; captures `scratch ft/D5/fx/sleep/`; verification `scratch ft/D5/gen/verify.py`)

## What the source is

A creator's public protocol page ("Toolkit for Sleep"): 12 numbered steps of unstructured prose with doses, timing relative to bedtime, a weekly cadence reported as personal practice, alternatives ("145mg Magnesium Threonate or 200mg Magnesium Bisglycinate"), two author cautions (theanine; magnesium stomach upset with a stop rule), and a supplier disclosure with a discount link. The page is edited in place while its displayed date stays "September 20, 2021": the 2021 archive names Thorne as the supplier, the 2026 page names Momentous with an affiliate link (`utm_medium=affiliate`), and step 4 lost the words "zero-cost" and changed "(for Apple or Android phones)" to "(for iPhone)". The structured step payload (step kinds, means, doses, timing, cadence, cautions) is identical in both captures, so the fixture has **one** ProtocolEdition (payloadHash `sha256:1efd6389d30082f3ae2811229d66ed47d3c01980137b22941df0b3d880eef9d2`, rule `d5-step-payload/0`): the sponsor change is two D7 interest assertions with their own observation times, and the step-4 wording change is a product attribute of the Reveri app (D6), not a protocol edition. Correction to the research stage: the 2021 replay timestamp actually served is 20211018160634, not 20211016002820.

## What it exercises

| relationship / record | where |
| --- | --- |
| HAS_EDITION (asserted episode; validFrom 2021-09-20 PUBLICATION_PROXY corroborated by the 2021-10-18 capture; validTo unknown) | `assertions.yaml` a01 + `edges.structuralAndEpisode[0]` |
| HAS_STEP (19 steps, orderIndex = source order; magnesium alternatives as sibling steps with `alternativeGroup: s08-magnesium`) | `steps`, `edges.structuralAndEpisode` |
| STEP_USES (17 edges to D1 substances, D6 Reveri app, D12 alcoholic beverage, D5 Interventions for practices) | `edges.structuralAndEpisode` |
| STATES_CONSTRAINT (derived since the adversarial review: theanine caution step → 3 CONDITION UseConstraints; caffeine step → 1 TIMING UseConstraint; each from the author's caution assertion that cites the step locator) | `edges.derived` |
| RESOLVES_TO_CONSTRAINT (author USE_CONSTRAINED_IN assertions → the same UseConstraints the step states) | `edges.derived` |
| Directive 3.8 path: question → D9 chunk [6026, 6688) of the 2026 snapshot (vector index or MENTIONS) → 5 assertions citing the 8 covered locators → SourceLocator exact quote and offsets → SourceSnapshot bytes (sha256 re-verified) → CAPTURE_FIDELITY Adjudication → Activity (missionId, runId) | `retrievalPath`, `adjudications`, `questions.md` |
| Harm: CAUSES_ADVERSE_EFFECT (magnesium → GI upset, "~5%"), WORSENS_TARGET (alcohol → sleep), USE_CONSTRAINED_IN (theanine; caffeine window) | `assertions` |
| D7 seam: RECEIVES_VALUE_FROM Momentous (2026, affiliate link) and Thorne (2021, valueKind not stated); stated non-affiliation to Swanson (2021, polarity NEGATIVE) | `assertions` a08, a09, a10 |
| Authorship: PROTOCOL_AUTHORED_BY is inferred (no byline): the body is first-person and signed "Best wishes, Andrew" in both captures; the newsletter sign-up box names Dr. Andrew Huberman as sender | `assertions` a02 (`attributionBasis`) |

Research is not medical advice; the fixture records what the page says, attributed and located.

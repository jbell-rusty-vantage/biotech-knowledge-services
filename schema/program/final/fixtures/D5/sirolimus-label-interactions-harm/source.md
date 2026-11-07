# Fixture: sirolimus-label-interactions-harm

- url: https://api.fda.gov/drug/label.json?search=set_id:%225908cd1a-fc5a-462f-99ed-1d8983e253c9%22&limit=1
- title: Sirolimus tablets label — Mylan Pharmaceuticals Inc., NDA021110, SPL set 5908cd1a-fc5a-462f-99ed-1d8983e253c9, SPL id 8f2761f9-9bc3-47c3-8093-6375a39d1034, version 22, effective_time 20260326 (openFDA drug/label)
- retrieved: 2026-10-08
- snapshot digest: sha256:ab1a2c2708312dd5b77e7e11a81234f890032d5a24e9555738e40dd0d88451c2
- kind: harm
- tool: curl → openFDA drug/label, no API key (`tool:openfda-label`); archived label versions by curl → DailyMed `getFile.cfm?type=zip&version=N` + unzip (`tool:dailymed-spl-history`); version list by curl → DailyMed web services v2 history; clinic page and forum post by Tavily CLI `tvly extract` (`tool:tavily-extract`); forum author and edit dates by curl → Discourse topic JSON (`tool:discourse-json`)
- fixture stage: A5, 2026-10-08 (generator `scratch ft/D5/gen/gen_siro.py`; captures `scratch ft/D5/fx/siro/`)

## Snapshots

| ref | url | retrieved | digest | note |
| --- | --- | --- | --- | --- |
| snap-label-v22 | openFDA query above | 2026-10-08 | sha256:ab1a2c2708312dd5b77e7e11a81234f890032d5a24e9555738e40dd0d88451c2 | current label (v22, 2026-03-26), labeler Mylan; byte-identical to the research capture |
| snap-spl-v14 | https://dailymed.nlm.nih.gov/dailymed/getFile.cfm?setid=5908cd1a-fc5a-462f-99ed-1d8983e253c9&type=zip&version=14 | 2026-10-08 | sha256:d79f784fe7c9b761c1a13e81a04e15126f4088aaa5990a7983bc45cfcfbe53f9 (SPL XML member) | v14, effectiveTime 20191204, SPL author Greenstone LLC; zero occurrences of "cannabidiol" (COMPLETE capture) |
| snap-spl-v15 | same, `version=15` | 2026-10-08 | sha256:b6b375cfc9875520e486c3b8236330dc744c362727e5c1ef6a0cc10a7a9fb6bd (SPL XML member) | v15, effectiveTime 20220923, first version with "5.21 Cannabidiol Drug Interactions" |
| snap-spl-history | https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/5908cd1a-fc5a-462f-99ed-1d8983e253c9/history.json | 2026-10-08 | sha256:70f2dceae4a55c6a5e6eeadc3d672167ae03462dccdaa9bf811c8b844c05b4b5 | 21 versions, v1 Jan 17, 2014 … v22 Mar 26, 2026 |
| snap-agelessrx | https://www.agelessrx.com/rapamycin/ | 2026-10-08 | sha256:e6d4430022109d3ebdf0d467bff3946d610c448639e112f2abcad21932e87a4a | telehealth clinic page (Tavily markdown) |
| snap-rapanews | https://www.rapamycin.news/t/improve-bioavailability-of-rapamycin-2/86 | 2026-10-08 | sha256:b39ad118d870829aa2e86d079adb5b3dd991e37639bb883482b37cea1514fa87 | forum topic, admin first post (RapAdmin; Discourse JSON: wiki false, post_type 1, version 20, category 1, archetype regular; re-checked in the adversarial review) as Tavily markdown (no author in the text; contentHash over the stored extractor bytes, basis EXTRACTED_TEXT_BYTES) |
| snap-rapanews-api | https://www.rapamycin.news/t/86.json | 2026-10-08 | sha256:1657284b993ce2af137a10e7c3982cc9413d5f8c31bd3260e40cffeed5262515 | Discourse JSON: post 1 by handle "RapAdmin", created 2021-10-22, last edited 2023-03-07 (post version 20) |

## What the source is

The FDA-approved prescribing information for sirolimus (rapamycin), the most-discussed longevity drug, as served by openFDA: whole-section strings for contraindications, boxed warning, drug interactions (7.3 grapefruit juice "must not be taken with sirolimus"; 7.4 St. John's Wort among agents that "could decrease sirolimus concentrations" under "Exercise caution"; 7.5 cannabidiol "closely monitor" and "A dose reduction ... should be considered"), indications (renal-transplant prophylaxis, LAM) and overdosage. Two archived versions of the same SPL set show when the cannabidiol interaction entered the label (absent in v14 of 2019-12-04, present in v15 of 2022-09-23), and that the labeler of record changed (Greenstone LLC → Mylan). The same grapefruit interaction is stated by a longevity telehealth clinic (interaction list + "talk to your healthcare provider") and by a community forum post that presents grapefruit juice as a way to raise the "effective dose" 3X to 7X while warning to consult a doctor and disclaiming it as "not a recommended protocol". All four grapefruit statements (two label versions, clinic, forum) resolve to one INTERACTION UseConstraint; each keeps its own directive level in `valueString`.

## What it exercises

RESOLVES_TO_CONSTRAINT (derived; 4 UseConstraints, the grapefruit one grouping 4 assertions from 3 asserter kinds, the cannabidiol one grouping 2 directives of one source plus a superseded earlier version); predicates INTERACTS_WITH (level in valueString: AVOID, USE_WITH_CAUTION, MONITOR, ADJUST_DOSE, CONSULT_CLINICIAN), USE_CONSTRAINED_IN (CONTRAINDICATED, section CONTRAINDICATIONS), CAUSES_ADVERSE_EFFECT (boxed warning, population IMMUNOSUPPRESSED); label-version supersession (`supersedesUid` + `recordedTo`) for grapefruit (v14 → v22) and cannabidiol (v15 → v22). No typed D5 edge leaves sirolimus.

Research is not medical advice.

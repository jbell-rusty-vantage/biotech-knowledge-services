# Fixture noninvasive-glucose-cgm-recall - source

- kind: harm
- url: https://www.fda.gov/medical-devices/safety-communications/do-not-use-smartwatches-or-smart-rings-measure-blood-glucose-levels-fda-safety-communication
- title: FDA - Do Not Use Smartwatches or Smart Rings to Measure Blood Glucose Levels: FDA Safety Communication (2024-02-21)
- retrieved: 2026-10-08
- snapshot digest: sha256:a406e0fb4dca30ab1f1916e417146ea39be3a2a2343f875039db9b67e98edb8f
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (found with Tavily CLI search in the research stage)
- candidate: FC-5 in ../../_notes/fixture-candidates.md

## Description

Harm case with two branches. (1) Unauthorized measurement claim: the FDA safety communication of 2024-02-21 says no smartwatch or smart ring is authorized to measure or estimate blood glucose on its own, that these devices do not directly test blood glucose, and that wrong readings can lead to dangerous hypoglycaemia. The seller claim is a kernel Claim; the FDA statements are third-party ratings of it (kernel predicate RATES_CLAIM, asserter FDA, subject the Claim); no seller page was captured, so the Claim has no occurrence in this fixture; the verdict is a kernel SAFETY_SIGNAL Assessment (subkind D4.unauthorized-measurement, effectDirection HARM). (2) Measurement error in an authorized device: the openFDA recall record for FreeStyle Libre 3 sensors (event 98049, product Z-1020-2026, initiated 2025-11-24, status 'Open, Classified') reports carbon build-up that may give incorrect low glucose results. It exercises DELIVERS (D6 Product 'FreeStyle Libre 3 CGM System' -> Device 'FreeStyle Libre 3 sensor'), RUNS_ON_DEVICE (the sensor's glucose estimation software, version not stated, versionBasis UNKNOWN) and OUTPUTS_METRIC (-> interstitial glucose estimate), plus a SAFETY_SIGNAL Assessment (subkind D4.measurement-error-recall, HARM). The recall record itself is D8's: it reaches the device through the D6 Product that DELIVERS it (D8 RegulatoryRecord -CONCERNS-> Product, no D8 union change); D4 holds the device, the algorithm version and the metric it reaches.

## Snapshots

### S1 `snap-fda`

- url: https://www.fda.gov/medical-devices/safety-communications/do-not-use-smartwatches-or-smart-rings-measure-blood-glucose-levels-fda-safety-communication
- title: FDA - Do Not Use Smartwatches or Smart Rings to Measure Blood Glucose Levels: FDA Safety Communication (2024-02-21)
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:a406e0fb4dca30ab1f1916e417146ea39be3a2a2343f875039db9b67e98edb8f (10002 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (found with Tavily CLI search in the research stage)
- source kind / genre: WEB_PAGE / REGULATOR_SAFETY_COMMUNICATION
- research-stage capture: identical (re-fetch returned the same bytes)

### S2 `snap-openfda`

- url: https://api.fda.gov/device/recall.json?search=product_description:%22FreeStyle+Libre+3%22&limit=3
- title: openFDA device recall API - FreeStyle Libre 3 (3 records; meta.last_updated 2026-10-05)
- retrieved: 2026-10-08 (2026-10-08T17:39:00-04:00)
- snapshot digest: sha256:4a16676ef1ddb4c15725332f830ba0fb94715a0262fcce58b84cf905d81de6bc (7261559 bytes, application/json, RAW_BYTES)
- tool: curl openFDA device/recall (no API key)
- source kind / genre: API / REGULATOR_RECORD
- research-stage capture: identical (re-fetch returned the same bytes)
- note: 7.26 MB for 3 records (openfda.registration_number lists are large); a narrower query res_event_number:98049 returns 4 products (8.6 MB)

## Citation

https://www.fda.gov/medical-devices/safety-communications/do-not-use-smartwatches-or-smart-rings-measure-blood-glucose-levels-fda-safety-communication · FDA, Do Not Use Smartwatches or Smart Rings to Measure Blood Glucose Levels: FDA Safety Communication (2024-02-21) · retrieved 2026-10-08; https://api.fda.gov/device/recall.json?search=product_description:%22FreeStyle+Libre+3%22&limit=3 · openFDA device recall (meta.last_updated 2026-10-05) · retrieved 2026-10-08

# Fixture wearable-hrv-algorithm-changes - source

- kind: other
- url: https://www.whoop.com/us/en/thelocker/2026-whats-new
- title: WHOOP - What's new on WHOOP (2026 changelog)
- retrieved: 2026-10-08
- snapshot digest: sha256:d8e63d826d82836051f7884fe06adacb54203dc93a3fe34ae74666b9c29fc7ee
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (found with Tavily CLI search in the research stage)
- candidate: FC-6 in ../../../../packets/D4/_notes/fixture-candidates.md

## Description

Wearable values change meaning without a version label, and one name ('HRV') covers different metrics. WHOOP's 2026 changelog announces a new heart-rate signal-processing algorithm on February 25 and a new heart-rate algorithm on July 6 (Strain may shift), with no version string: each is an AlgorithmVersion with versionBasis CHANGE_EVENT_UNLABELED pinned by its date, attached to the device model by RUNS_ON_DEVICE episodes (the second closes the first). Neither change names a hardware model: their attachment to WHOOP MG is a curator inference (only the dates are stated by WHOOP). A community member reports WHOOP MG firmware 50.30.3.0 (post dated May 20, 2025) with no vendor notes: an Assertion with a forum asserter. OUTPUTS_METRIC separates three 'HRV' metrics: WHOOP API hrv_rmssd_milli (RMSSD in milliseconds, stated in WHOOP's OpenAPI document), Apple HealthKit heartRateVariabilitySDNN (SDNN, ms) and Oura average_hrv (method and unit not stated; attributed by curator inference to the version Oura reports per record, which its OpenAPI enum calls 'Oura Sleep Staging Algorithms' v1/v2). Comparability: RMSSD vs SDNN NOT_COMPARABLE; Oura vs either UNKNOWN.

## Snapshots

### S1 `snap-whoop-new`

- url: https://www.whoop.com/us/en/thelocker/2026-whats-new
- title: WHOOP - What's new on WHOOP (2026 changelog)
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:d8e63d826d82836051f7884fe06adacb54203dc93a3fe34ae74666b9c29fc7ee (20168 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0 (found with Tavily CLI search in the research stage)
- source kind / genre: WEB_PAGE / VENDOR_CHANGELOG
- research-stage capture: identical (re-fetch returned the same bytes)

### S2 `snap-whoop-forum`

- url: https://www.community.whoop.com/t/mg-firmware-50-30-3-0/1502
- title: WHOOP Community - MG firmware 50.30.3.0 (forum thread)
- retrieved: 2026-10-08 (2026-10-08T17:41:00-04:00)
- snapshot digest: sha256:783ada6e54476eb9574e1af3a16f05b8f6329eb158ef86a8aae91c33e7c95499 (5263 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: WEB_PAGE / COMMUNITY_FORUM_POST
- research-stage capture differed: sha256:236deaf0694793d8da4ec2ef555d2f11521dfc0418f6667c101d1a032afdb7ce (quotes re-verified on this capture; offsets are this capture's)

### S3 `snap-whoop-api`

- url: https://developer.whoop.com/api
- title: WHOOP Developer - API reference
- retrieved: 2026-10-08 (2026-10-08T17:40:00-04:00)
- snapshot digest: sha256:ad0a088611cfa9022f17196af320d683db1b372f94c93dbd4c8c61d8969ab4aa (31271 bytes, text/markdown, RAW_BYTES)
- tool: Firecrawl CLI 1.23.1 scrape --only-main-content --max-age 0
- source kind / genre: WEB_PAGE / API_DOCUMENTATION
- research-stage capture: identical (re-fetch returned the same bytes)

### S4 `snap-whoop-openapi`

- url: https://api.prod.whoop.com/developer/doc/openapi.json
- title: WHOOP API - OpenAPI document (openapi.json, info.title "WHOOP API")
- retrieved: 2026-10-08 (2026-10-08T21:55:26-04:00)
- snapshot digest: sha256:b40986e62c85067188fa01b23cbb3d5eec67c0f424b8b9d7c9e8b5bacee99892 (77417 bytes, application/json, RAW_BYTES)
- tool: curl 8.2.1 (no auth)
- source kind / genre: API / API_DOCUMENTATION
- note: added in the adversarial-review pass. Not byte-stable: two other fetches the same evening returned sha256 d9c6147d... (same 77,417 bytes, same JSON value, different property order), so the JSON_POINTER locator is the stable reference, not the byte digest

### S5 `snap-oura-openapi`

- url: https://cloud.ouraring.com/v2/static/json/openapi-1.41.json
- title: Oura API Documentation 2.0 - OpenAPI document openapi-1.41.json
- retrieved: 2026-10-08 (2026-10-08T17:39:00-04:00)
- snapshot digest: sha256:2f960162d81034e80d3028af7dcadf56469100730c2aefaed869656f5db8486e (454162 bytes, application/json, RAW_BYTES)
- tool: curl (file name discovered from cloud.ouraring.com/v2/docs)
- source kind / genre: API / API_DOCUMENTATION
- research-stage capture: identical (re-fetch returned the same bytes)

### S6 `snap-apple-hk`

- url: https://developer.apple.com/tutorials/data/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn.json
- title: Apple Developer Documentation - HKQuantityTypeIdentifier.heartRateVariabilitySDNN (documentation JSON)
- retrieved: 2026-10-08 (2026-10-08T17:39:00-04:00)
- snapshot digest: sha256:09d39d661cdb3262e6d91f76581a5d6b1e6ba926f241e9247d6271d1f11631a1 (36213 bytes, application/json, RAW_BYTES)
- tool: curl (Apple documentation JSON endpoint; the HTML page is JS-rendered)
- source kind / genre: API / API_DOCUMENTATION
- research-stage capture: identical (re-fetch returned the same bytes)

## Citation

https://www.whoop.com/us/en/thelocker/2026-whats-new · WHOOP, What's new on WHOOP (2026) · 2026-10-08; https://www.community.whoop.com/t/mg-firmware-50-30-3-0/1502 · WHOOP Community, MG firmware 50.30.3.0 · 2026-10-08; https://developer.whoop.com/api · WHOOP API reference · 2026-10-08; https://api.prod.whoop.com/developer/doc/openapi.json · WHOOP API OpenAPI document · 2026-10-08; https://cloud.ouraring.com/v2/static/json/openapi-1.41.json · Oura API Documentation 2.0 (OpenAPI) · 2026-10-08; https://developer.apple.com/tutorials/data/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn.json · Apple HealthKit heartRateVariabilitySDNN · 2026-10-08

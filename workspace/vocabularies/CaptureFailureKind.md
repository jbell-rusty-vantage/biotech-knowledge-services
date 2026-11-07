---
id: "enum:CaptureFailureKind"
kind: "enum"
module: "D11"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D11.graphql#L36-L62"]
aliases: ["capture failure kind"]
capabilities: ["get"]
cardDigest: "sha256:7353b9b1bac0df4ac801108b0cbb8c8d9752e384ed1d4e068a282cbbc4c94939"
---
# Enum CaptureFailureKind

Why an attempt did not yield a complete capture (observed 2026-10-08 across the first-tier tools; tooling/action-space.yaml evidence).

Id `enum:CaptureFailureKind` · module [D11](../modules/D11.md) · 13 values · used by 1 fields · raw SDL [sdl:CaptureFailureKind](../sdl/CaptureFailureKind.graphql)

## Values (13)

| value | description |
| --- | --- |
| `AUTH_REQUIRED` | 401 or login redirect: key or account required (CAS Common Chemistry, fhir.loinc.org). |
| `FORBIDDEN` | 403 by policy, including identity headers missing (CT.gov internal history API, EDGAR without declared User-Agent, regulations.gov attachment via curl). |
| `BOT_CHALLENGE` | 200 with an error or challenge page instead of content (Firecrawl scrape of the CT.gov history tab returned 'Error \| ClinicalTrials.gov'). |
| `RATE_LIMITED` | 429 transient throttle (USDA FDC DEMO_KEY shared per IP, Semantic Scholar unkeyed). |
| `QUOTA_EXHAUSTED` | Daily or monetary budget spent (OpenAlex X-RateLimit-Limit-USD without key). |
| `TIMEOUT` | No response in the client deadline (WHO ICTRP, 60 s). |
| `SERVER_ERROR` | 5xx from the source. |
| `LICENCE_RESTRICTED` | Content exists but the licence forbids capture or storage (LOINC table, KEGG, DrugBank, Natural Medicines). |
| `NO_TEXT_LAYER` | Bytes have no text layer (image-only PDF FDA-2022-S-0023-0068); OCR needed. |
| `LOSSY_RENDITION` | Third-party rendition (kernel contentHashBasis TOOL_RENDITION) dropped characters versus the issuer bytes (beta sign lost in a Firecrawl PDF rendition). |
| `PARSE_ERROR` | Bytes received; the parser could not read them. |
| `CLIENT_ERROR` | The calling client failed (CLI console-encoding crash), not the source. |
| `OTHER` |  |

Any value not listed here is not allowed in this release.

## Used by

- [CaptureAttempt](../nodes/CaptureAttempt.md).`failureKind`

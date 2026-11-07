# Evidence and custody references

Every asserted fact cites evidence the executor can verify: a Source, a SourceSnapshot of exact bytes, and a
SourceLocator that selects the span. The chain Assertion -[HAS_EVIDENCE]-> SourceLocator <-[HAS_LOCATOR]-
SourceSnapshot <-[HAS_SNAPSHOT]- Source is written by the executor; you declare it.

## Source

`source {canonicalUri, sourceKind, title?, genre?, logicalIdentity?}`. The executor canonicalizes the URI (scheme and
host case, default ports, fragment, sorted query, tracking parameters removed) and derives the Source uid from it.
`sourceKind` is the medium (WEB_PAGE, PDF, API, REGISTRY, ...); `genre` is the kind of document (PRESS_RELEASE,
SCHOLARLY_ARTICLE, MARKETING_PAGE, ...).

## Snapshot (immutable bytes)

`snapshot {retrievedAt, observedAt?, publishedAt?, contentHash, contentHashBasis, captureMethod?, captureCompleteness,
mimeType?, custodyArtifactDigest?, revisesSnapshotRef?}`.
- `contentHash` is `sha256:<hex>` of the bytes named by `contentHashBasis`: `RAW_BYTES` (the captured artifact),
  `CANONICAL_PROJECTION`, `TOOL_RENDITION` (a tool's rendition, e.g. Firecrawl markdown), `STORED_EXCERPT_TEXT`.
- A tool rendition without a recorded failed raw capture attempt is an OD-08 exception and is reported as such.
- `captureAttempts[]` record failed or partial attempts (status, failureKind, httpStatus); request URIs are stripped of
  credentials (api_key, token, ...) before hashing.
- A revised capture declares `revisesSnapshotRef` to an earlier declared snapshot.

## Locator (the span)

`locators[] {ref, selectorKind, selector, exact?, prefix?, suffix?, startOffset?, endOffset?, page?, reportsFields[]}`.
- `selector.basis` is mandatory (R-38): the versioned text projection the offsets index (`raw-capture/v1` for offsets
  over the captured artifact itself). A locator without it is invalid and every proposal citing it is refused
  (`BKS_EVIDENCE_UNVERIFIED`).
- Locator identity is (snapshot, selectorKind, selectorDigest); citing an existing locator uses `{uid, selectorDigest}`
  and must match its stored digest.
- `reportsFields` names the fields the span reports (`LabelVersion.maxDailyServings`), used for per-field evidence.

## Read-before-write snapshot (basis)

`basis.snapshotRef {ref, digest}` names a read result persisted in snapshot custody (`bks-custody-snapshot.v1`) by the
read service. The planner accepts it when its revision equals the current graph revision, or when its dependencies are
complete and unchanged; otherwise `BKS_STALE_REVISION`. A creation-only basis states why no snapshot exists and what
must be absent / present.

## Sealed verifications

Capture-fidelity and other verification verdicts are delivered by the verification service as sealed results
(`bks-sealed-verification.v1`, pinned verifier keys) and written by `adjudication` proposals with the
`adjudication.deliver` grant. An ACCEPTED capture fidelity says the span matches the bytes; it says nothing about
scientific truth.

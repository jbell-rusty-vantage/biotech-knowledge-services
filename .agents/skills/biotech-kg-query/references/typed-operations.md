# Typed operations matrix (biotech-knowledge-read-intent.v2)

Intent envelope (common to typed and Cypher reads):

```json
{ "schemaVersion": "biotech-knowledge-read-intent.v2", "intentId": "<id>",
  "pins": { "schemaReleaseDigest": "<sha256:...>", "workspaceFingerprint": "<optional>", "queryCatalogDigest": "<optional>" },
  "purpose": "<why this read>", "questionIds": ["Q-K-09"], "bindingRef": "default",
  "limits": { "rowCap": 100, "byteCap": 1048576, "timeoutMs": 10000, "maxDepth": 4, "listCap": 200, "nestingCap": 6 },
  "consistency": { "mode": "observed" | "stable_revision", "bookmarks": [], "maxAttempts": 3 },   // maxAttempts 1..5 (contract cap; >5 is BKS_PARSE_REJECTED)
  "persistSnapshot": false,
  "operations": [ { "opId": "o1", "op": "card", "uid": "hu:package:..." } ] }
```

Every operation runs inside ONE explicit read transaction with the others; each returns one `part` with its own
`status`, `reasons`, `columns`, `rows`, `truncations` and `annotations` (status meanings, temporal view, policy).
Visibility (scope of the binding) is compiled into every node the operation touches, including intermediate hops and
counts: in scope `public` a record with `privacyClass` other than `PUBLIC` (null fails closed) does not exist for the
read, and an assertion whose subject, object or asserter is not visible is not returned. Operational and legacy
records (Ks*, LegacyV0*, MIGRATED_FROM) never appear. Properties are the release-declared ones of the record's type.

| op | stored pattern read | notes |
| --- | --- | --- |
| resolve | `(n:<Type> {uid})`; `(n)-[h:HAS_IDENTIFIER]->(i:Identifier {scheme, issuer?, value})` with `h.recordedTo IS NULL`; `toLower(trim(n.name))` | identifier values are normalized with the release scheme rule (UNII upper case, DOI lower case, GTIN-14 padding, ...). `identifierChain: true` returns the subject's other open identifiers (KN-07). `resolution`: unique / candidate (name only) / ambiguous / none. A name without `nodeType` is matched over every Entity-labelled type (bounded per mention, overflow probe -> `truncated`). At most 50 mentions; `mentionId` lower case; a mention with no uid / identifier / name is `unsupported` PARAMETER_INVALID (an operation that ran no query never answers `empty`) |
| card | `(n:<Type> {uid})` + open HAS_IDENTIFIER + `COUNT` of visible neighbours by type and direction | relationship counts count visible neighbours only (no existence inference) |
| list | `(n:<Type>) WHERE n.<prop> = $v` | `limit` <= 500 (page with `after` = last uid); equality on release properties; DateTime properties take RFC 3339 strings; restricted properties are `forbidden` |
| neighbors | `(n)-[r:<T>|...]-(m)` | default view = open episodes (`r.recordedTo IS NULL`); `recordedAsOf` = episodes recorded at that time; `validAt` adds `validityClass` (KNOWN_WITHIN, UNKNOWN_START, UNKNOWN_BOTH_BOUNDS, OPEN_END_UNVERIFIED; OUTSIDE rows are dropped) |
| assertion | `(a:Assertion)-[:HAS_SUBJECT|HAS_OBJECT]->(s)`, `ASSERTED_BY`, `HAS_EVIDENCE{role,origin}->SourceLocator<-HAS_LOCATOR-SourceSnapshot<-HAS_SNAPSHOT-Source`, `(adj:Adjudication)-[:ASSESSES]->(a)`, `WAS_GENERATED_BY->Activity`, `DERIVED_FROM`, `OCCURRENCE_OF->Claim` | current assertions by default (`recordedTo IS NULL`); `includeSuperseded` or `recordedAsOf` for history. `gaps`: NO_DECLARED_SUPPORTING_SPAN, NOT_ADJUDICATED, NO_SUPPORT_VERDICT, VALID_TIME_UNKNOWN, LINEAGE_NOT_VISIBLE (Activities are INTERNAL), EVIDENCE_CHAIN_INCOMPLETE |
| evidence | `(x)-[e:HAS_EVIDENCE]->(l:SourceLocator)` + snapshot + source + later snapshots of the same source | `evidenceState`: CURRENT, HISTORICAL (a later capture exists), REVISED (a later capture records a revision such as a retraction), UNKNOWN (snapshot/source not visible) |
| history | `(n)-[r:<T>]->(m)` all episodes + `(a:Assertion {uid: r.assertionUid})` | `recordedState` OPEN/CLOSED; `currentAtRecordedAsOf`; superseded authorizing assertions show `status: SUPERSEDED` |
| report | `(r:Report)`: ASSESSES, DERIVED_FROM (Assertion, Assessment), HAS_EVIDENCE, WAS_GENERATED_BY, HAS_ITEM -> ReportItem | `sentenceTrace` states whether a sealed ledger digest exists (KN-11): sentences live in the ledger, never as nodes |
| association | `(a:Association {anchorUid})-[:ASSOCIATES]->(m)`, `DERIVED_FROM` inputs | derived analytics, not facts. `expansion: {ontology: MONDO}` is `unsupported` (ONTOLOGY_ARTIFACT_ABSENT) until a versioned mapping artifact ships |
| status | `(ls:LegalStatus)-[r:STATUS_OF]->(x)`, `STATUS_FROM` | `notImplied` lists the PR-01 non-implications that apply (licence != marketed, patent != approved, EFSA opinion != EU authorization, ...) |

Typed reads are available on every binding (Community and Enterprise): their visibility is enforced by construction.

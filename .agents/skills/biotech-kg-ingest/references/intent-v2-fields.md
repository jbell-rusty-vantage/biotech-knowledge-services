# biotech-knowledge-intent.v2 field guide

Authoritative shape: `packages/contracts/json-schema/biotech-knowledge-intent.v2.json` (exported from
`packages/contracts/src/intent-v2.ts`). The service validates the intent; unknown keys are refused (strict objects).

## Top level

| Field | Required | Meaning |
| --- | --- | --- |
| `schemaVersion` | yes | `biotech-knowledge-intent.v2` |
| `intentId` | yes | stable id of this intent (the same intent re-sent keeps it; a different intent gets a new one) |
| `pins.schemaReleaseDigest` | yes | the release you navigated; must equal the executor's pinned release (`BKS_RELEASE_MISMATCH`) |
| `pins.policyVersion` | yes | admission policy version; bound into the plan and the witness |
| `pins.workspaceFingerprint`, `pins.schemaDigest` | no | extra identities you navigated with; checked when present |
| `context.actor {kind, id, model?}` | yes | agent / human / service that authored the intent |
| `context.run {system, runId, missionId?, operationId?}` | yes | the run this write belongs to; the Activity uid derives from (system, runId) |
| `context.activityKind` | yes | kernel ActivityKind (INGESTION, RESEARCH, EVIDENCE_MISSION, VERIFICATION, PROJECTION, ...) |
| `basis` | yes | `{snapshotRef: {ref, digest}}` (custody-verified read result) or `{creationOnly: {reason, expectAbsent[], expectPresent[]}}` |
| `defaults.privacyClass` | no | PUBLIC (default) or INTERNAL; authors may only tighten. CaptureAttempt is always INTERNAL (register R-41) |
| `sources[]` | no | sources with snapshots, capture attempts and locators (evidence-custody.md) |
| `subjects[]` | no | `{ref, mode: "resolved", uid, nodeType}` or `{ref, mode: "new", nodeType, name, uidSegment?, properties, identifiers[], onMatch}` |
| `proposals[]` | yes, 1..500 | typed proposals (proposal-matrix.md) |
| `notes` | no | free text for humans; never interpreted |
| `provenance` | no | migration / derivation record (`derivedFrom`, `migrator`, `edits[]`); kept in plan custody, not written to nodes |

## Subjects

- Resolve before you create: `mode: resolved` with the uid from a read whenever the thing exists.
- `mode: new`: the executor mints `hu:<token>:<uidSegment or slug(name)>`; Source identity is the canonical-URI digest
  (EX-04); Claim identity is the computed `propositionHash`.
- `onMatch` (default `review`): `review` holds a subject that matches an existing node (exact uid, identifier or name);
  `use_existing` adopts the single strong match (or a single exact-name match, recorded as the author's choice);
  `fail` refuses; `create_anyway` creates beside it (give a distinguishing `uidSegment`). Names never establish identity
  on their own.
- `identifiers[]` on a new subject are resolution keys (scheme + issuer + normalized value). The attachment itself is an
  evidenced `identifier.attach` proposal.
- Required properties of the type must be present to create (a `use_existing` subject that resolves needs none).

## Valid time vs recorded time

`assertion.validity`: `validFrom` / `validTo` (ISO instants, half-open), `validFromPrecision` (YEAR, MONTH, DAY, ...),
`validFromBasis` (`STATED_BY_SOURCE`, `PUBLICATION_PROXY`, `OBSERVATION_ONLY`, `INFERRED`, `UNKNOWN`),
`validObservedAt` (when the source was seen to state it), `statedAsOf` ("as of" statements). `recordedAt` /
`recordedFrom` / `recordedTo` are assigned by the service; never send them.

## Proposal plumbing

- `dependsOn: [proposalId]`: explicit ordering; the planner adds implicit dependencies from what statements need.
- `hold: {reason}`: the author holds the proposal; it is recorded as held and writes nothing.
- `asserterRef`: who states it (Person, Organization, Agent, Publication / MediaWork in its own voice, ACCOUNT Channel);
  when omitted the executor Agent is the asserter with `asserterBasis:EXECUTOR_DEFAULT` (warning ASSERTER_DEFAULTED).
- `evidence`: locator refs, `{locator, role}` (SUPPORTS default, CONTEXT, QUALIFIES, ...) or existing
  `{uid, selectorDigest}`.

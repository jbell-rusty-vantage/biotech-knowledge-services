# Reading a plan and a receipt

## Plan (`biotech-knowledge-plan.v2`, response of `POST /kg/plan`: `{planRef, planDigest, outcome, plan}`)

| Field | Read it for |
| --- | --- |
| `outcome` | `applicable` (every proposal admitted or duplicate), `partial` (some admitted, others held / rejected), `held` (nothing admitted or rejected, at least one held: nothing to apply), `rejected` (errors, or nothing admitted), `noop` (everything already recorded) |
| `errors[]` | intent-level refusals (release, basis, sources) |
| `subjects[] {ref, disposition, uid, matches, reasons}` | `create`, `use_existing`, `review_required`, `missing`, `conflict` |
| `proposals[] {proposalId, disposition, reasons, warnings, mints, dependsOn, statementIds}` | `admitted`, `noop_duplicate`, `held`, `rejected`; the first reason names the rule (e.g. `SUBJECT_REVIEW_REQUIRED`, `QUALIFIER_UNREGISTERED`, `BKS_FORBIDDEN_SCOPE`) |
| `mints` | the uids the proposal will create: `assertion`, `relationship`, `assessment`, `report`, `association` |
| `effects {nodes, relationships}` | every node / edge the plan creates, updates or closes |
| `invariants[]` | checks re-run inside the apply transaction (uid absent, identifier owner, slot free, episode absent, evidence chain) |
| `statements[] {id, purpose, cypher, params, expectRows, needs}` | the compiled Cypher 5, for inspection only |
| `binding` | release digests, intent digest, principal scope and grants the plan was compiled for |

The plan is stored server-side (plan custody). Applying recompiles it from the frozen observations; a plan whose stored
bytes, digest or recompilation disagree is `BKS_PLAN_FORGED` / `BKS_PLAN_DIGEST_MISMATCH`.

## Receipt (`biotech-knowledge-receipt.v2`)

| Field | Meaning |
| --- | --- |
| `outcome` | `applied`, `partial` (the included subset applied), `noop`, `duplicate` (this effect key was already applied; `duplicateOf` names the receipt), `failed`, `unresolved` (commit outcome unknown: look it up) |
| `proposals[] {proposalId, outcome}` | `applied`, `noop`, `held`, `rejected`, `excluded` (outside the partial subset), `failed` |
| `effects`, `priorGraphRevision`, `nextGraphRevision` | what changed and the writer-fence revisions around the commit |
| `failure {code, message}` | why a failed apply was rolled back (nothing was written) |
| `attempts[]` | every attempt under this effect key (failures are history, never overwritten) |
| `recovery {effectKey, markerKey, lookup}` | the receipt lookup to use after a lost response |
| `witness` | the admission witness facts (issuer, jti, iat, exp, revocationGeneration) |

`POST /kg/verify-effects {effectKey, cursor, pageSize}` reads back the declared effects page by page
(`bks-effect-verification.v1`): every item has checks (exists, properties, lineage, evidence chain, closed) and the
page reports `failures`, `nextCursor` and `complete`.

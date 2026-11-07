# Error codes (bks-error.v1)

Native codes from INTERFACES section 5 plus the S3 deltas of section 10. HTTP status on the executor in brackets.
Planner reasons (per proposal, inside a 200 plan response) are listed after the service codes.

| Code | When | Recovery |
| --- | --- | --- |
| `BKS_RELEASE_MISMATCH` [422] | `pins.schemaReleaseDigest` differs from the executor's release, or the graph's release marker is not that release | re-read `/describe`; re-plan against the served release |
| `BKS_RELEASE_TAMPERED` | the pinned release bundle failed verification | operator issue; stop |
| `BKS_UNAUTHORIZED` [401] | missing / unknown token | use your configured token |
| `BKS_FORBIDDEN_SCOPE` [403] | role too low, or a privileged proposal kind without its grant (also a planner reason) | use the trusted service that holds the grant |
| `BKS_PLAN_NOT_FOUND` [404] | unknown `planRef` | plan again |
| `BKS_PLAN_DIGEST_MISMATCH` | `expectedPlanDigest` differs from the stored plan | send the digest from the plan response |
| `BKS_PLAN_FORGED` | the request carries statements / a plan body, or custody / recompilation disagree | send only planRef + digest |
| `BKS_PLAN_REJECTED` | the plan's outcome is `rejected` or `held` | fix the reasons; plan again |
| `BKS_WITNESS_INVALID` / `_EXPIRED` / `_REVOKED` | witness signature / audience / binding wrong, lease over, or admission revoked | new witness (invalid / expired); stop (revoked) |
| `BKS_AUTHORITY_UNAVAILABLE` [503] | no admission authority or signing key configured | admission fails closed; report |
| `BKS_EFFECT_CONFLICT` [409] | the effect key was applied (or attempted) with another intent / plan | new key for a new effect; lookup for the old one |
| `BKS_EFFECT_PENDING` [409] | another attempt under this key is in flight | look up the receipt |
| `BKS_EFFECT_UNRESOLVED` | commit outcome unknown | receipt lookup |
| `BKS_STALE_REVISION` | the basis snapshot is not current | read again, re-plan |
| `BKS_STALE_PRECONDITION` | an invariant failed inside the apply transaction (graph changed); or a cited snapshot has `retrievedAt` after the service instant (plan or apply clock) or `observedAt` after `retrievedAt` (WR-19; plan outcome `rejected`, no skew allowance, equal instants accepted) | reconcile, re-plan; fix the capture times (never date evidence in the future) |
| `BKS_IDENTITY_CONFLICT` | uid or identifier already owned by another node | identity work |
| `BKS_SLOT_CONFLICT` | exclusive slot occupied by the same asserter (OD-05) | close / supersede first |
| `BKS_EVIDENCE_UNVERIFIED` | locator invalid (no selector basis), selector digest mismatch, or no SUPPORTS evidence | fix the evidence |
| `BKS_SNAPSHOT_UNVERIFIED` | basis snapshot not in custody or digest mismatch | persist the read result first |
| `BKS_PARSE_REJECTED` [400] | the request does not match the contract | fix the artifact |
| `BKS_LIMIT_EXCEEDED` [413] | > 500 proposals, > 6000 statements, oversized artifact | split into bounded child intents |
| `BKS_TIMEOUT` [504] | the apply exceeded its 30 s budget; rolled back | smaller intent; look up the receipt |
| `BKS_PARTIAL_REFUSED` | `partialPolicy: "all"` on a partial plan | name a closed subset |
| `BKS_PARTIAL_NOT_CLOSED` | the subset omits a dependency | include the dependencies |
| `BKS_UNSUPPORTED` [501] | surface disabled (e.g. development admission outside local dev) | use the production surface |

Common planner reasons: `SUBJECT_REVIEW_REQUIRED` (ambiguous identity), `SUBJECT_MISSING` (resolved subject absent),
`SUBJECT_CONFLICT` (subject cannot be created, e.g. `REQUIRED_PROPERTY_MISSING`), `QUALIFIER_UNREGISTERED`,
`QUALIFIER_REQUIRED`, `PREDICATE_KIND_MISMATCH`, `RETIRED_PREDICATE` (names the replacement), `LITERAL_VALUE_INVALID`,
`ASSERTER_TYPE_INVALID` (P20), `TYPE_NOT_CREATABLE` / `TYPE_IMMUTABLE` (register executorOps), `PROJECTION_ONLY_TYPE`,
`DEPENDS_ON_HELD` / `DEPENDS_ON_REJECTED`, `HELD_BY_AUTHOR`, `DUPLICATE_WITHIN_INTENT`.

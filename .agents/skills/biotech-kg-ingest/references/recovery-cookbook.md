# Recovery cookbook

The effect key names the effect ("this write of this intent"), not the attempt. Keep it, the intentId and the planRef
until the receipt is read back.

| Situation | Do | Never |
| --- | --- | --- |
| Response lost (timeout, disconnect) | `GET /kg/receipt?effectKey=<original>`. `applied` → read back. `failed` → read `failure`. Not found → the request never reached the writer: apply the same plan again with a fresh witness for the same key | mint a new intentId or effect key; re-plan "to retry" |
| Receipt `unresolved` | look the receipt up again; the marker reconciles once the commit outcome is known | apply under a new key |
| Same request sent twice | the second returns `duplicate` with `duplicateOf` (the recorded receipt) | treat a duplicate as a second write |
| `BKS_EFFECT_CONFLICT` | the key was used with another intent or plan; this is a different effect: plan it and use a new key | reuse the key with changed bytes |
| `BKS_STALE_REVISION` / `BKS_STALE_PRECONDITION` | the graph changed since your basis: read again, reconcile, re-plan (new plan, new witness), apply under a new key if the intent changed | force through |
| `BKS_IDENTITY_CONFLICT` | an identifier already identifies another subject (R-42): resolve which thing it is | attach anyway |
| `BKS_SLOT_CONFLICT` | an open episode of the same asserter occupies the slot: close it (`edge.close` or `supersedes`) in the same intent | open a second overlapping episode |
| `BKS_WITNESS_EXPIRED` | get a new witness for the same plan and key; the lease is ≤ 60 s | extend or forge a witness |
| `BKS_WITNESS_REVOKED` | admission was revoked; stop and report | retry with an older witness |
| `BKS_PARTIAL_REFUSED` / `BKS_PARTIAL_NOT_CLOSED` | the plan is partial: send `{include: [...]}` with every dependency of what you include | include a proposal without its dependencies |
| `BKS_PLAN_REJECTED` | the plan is `rejected` or `held`: fix the reasons (source, identity) and plan again | apply anyway |
| `BKS_PLAN_FORGED` / `BKS_PLAN_DIGEST_MISMATCH` | send only `planRef` + `expectedPlanDigest` from the plan response | send statements or edited plans |
| `BKS_TIMEOUT` | nothing was written (the transaction rolled back); split a large intent into bounded child intents | raise budgets |

A failed attempt stays in `attempts[]`; a later successful attempt under the same key is recorded next to it. A failure
record never overwrites an applied marker.

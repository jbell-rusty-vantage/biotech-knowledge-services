# Stable serialization and the digest triple

Row values use `bks-read-values.v1`:

| value | JSON |
| --- | --- |
| null, boolean, string | as is (no Unicode normalization) |
| Integer within +-(2^53-1) | number |
| Integer beyond | `{"$type":"Integer","value":"<decimal digits>"}` |
| Float, finite, non-integral | number |
| Float, integral / -0 / NaN / +-Infinity | `{"$type":"Float","value":"2"|"-0"|"NaN"|"Infinity"|"-Infinity"}` |
| DateTime | `{"$type":"DateTime","value":"<UTC ...Z, fraction without trailing zeros>"}`; a non-UTC offset adds `"offsetSeconds"`, a named zone adds `"zone"` and `"local"` (wall time). `value` is the instant to compare; the extra fields make the value round-trip exactly |
| Date (date-only) | `{"$type":"Date","value":"YYYY-MM-DD"}` |
| LocalDateTime / Time / LocalTime | `{"$type":..., "value": "<ISO text>"}` |
| Duration | `{"$type":"Duration","value":"P<months>M<days>DT<seconds>[.<nanos>]S"}` (components kept) |
| Point | `{"$type":"Point","srid":4326,"x":..,"y":..[, "z":..]}` |
| bytes | `{"$type":"Bytes","base64":"..."}` |
| list / map | array (statement order) / object |
| node, relationship, path | refused (FULL_ENTITY_RETURN) |

Decimals: Neo4j has no decimal type; decimal text stays a string as stored.

Digests (bks-canonical-json.v2, `sha256:`):

- `queryDigest`: kind, statement digest or template id, typed operations, canonical parameters, release and catalog
  pins, scope, limits, consistency mode, ordering, policy versions.
- `resultDigest`: overall status and reasons, ordering, and per part: status, reasons, columns, rows (in statement
  order, or canonically sorted when `ordering: set`), truncations. Excludes timing, request ids, bookmarks.
- `receiptDigest`: query and result digests plus consistency (mode, graphRevision, attempts, bookmarks, read interval),
  receipt (request id, principal, timing, server agent/edition, EXPLAIN operators) and binding.

Two identical reads of an unchanged graph have the same `queryDigest` and `resultDigest` and different
`receiptDigest`s. `snapshot.bytesDigest` is the raw-bytes digest of the retained result document in custody.

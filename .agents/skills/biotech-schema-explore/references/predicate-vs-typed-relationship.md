# Predicate versus typed relationship

Every source-derived fact is an Assertion. The predicate card (`pred:<NAME>`) says where the fact lives (`route`):

| route | where the fact is | write with | example |
| --- | --- | --- | --- |
| `typed-edge` | a stored relationship of the same name, authorized by one Assertion with that predicate (`r.assertionUid`) | `edge.assert` / `state.attach` (exclusive episodes) / `edge.structural` | `DECLARES_COMPONENT`, `HAS_LABEL_VERSION` |
| `assertion-only` | no typed edge: `(s)<-[:HAS_SUBJECT]-(a:Assertion {predicate})-[:HAS_OBJECT]->(o)` | `assertion.relate` | `INHIBITS`, `HOSTED_BY`, `EVENT_ABOUT` |
| `literal` | an Assertion with value fields (`valueNumber`, unit) and no object node | `assertion.literal` | `ADMINISTERED_AMOUNT`, `RECOMMENDS_USE` |
| `field` | a FIELD Assertion certifying a node field; the value is on the node | `node.upsert` | `MAX_DAILY_SERVINGS` |
| `computation` | produced by a registered derivation / trusted job; not source evidence | none (derived) | `CALCULATED_DAILY_MAX_INTAKE` |
| `alias` | another name of a registered predicate; re-key before ingest | re-key | `ASSOCIATED_WITH_ADVERSE_EFFECT -> CAUSES_ADVERSE_EFFECT` |
| `retired` | rejected by ingest; the card names the replacement | none | `ADJUSTED_MEAN_DIFFERENCE` |

Rules:

- Do not invent an edge named after an `assertion-only` predicate. `bks-schema neighbors pred:INHIBITS` shows the
  predicate joins (`[pred]`); `path` reports them as `predicate-join` hops with the Assertion pattern.
- Evidence for any of them: `(a:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)`
  (`rule:evidence-path`). Capture fidelity (`status`) is not scientific truth.
- Forbidden implications (`rule:ingestion-rules`) list premise predicates that never license a conclusion
  (`MEASURED_CONTENT_IN_PRODUCT` does not imply `DECLARES_COMPONENT`).
- Assessments are not predicates: an Assessment (`asmt:<KIND>`) `ASSESSES` its subjects with a registered subkind
  and admissible subjects (`assessment.record`).

Filters: `bks-schema find --kind predicate --predicate-kind relationship --module D2`, or
`jq -c 'select(.kind=="predicate" and .typedEdge==null and .predicateKind=="relationship") | .id' workspace/search/index.jsonl`.

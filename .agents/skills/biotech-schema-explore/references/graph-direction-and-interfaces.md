# Graph direction and interface expansion

## Stored direction

Every relationship type is stored `from -> to` (`direction: "OUT"` in IR v2). A relationship card shows:

- **stored direction**: the declared endpoint types (`Package -> LabelVersion`);
- **fields in the stored direction (OUT)**: GraphQL fields on the `from` type;
- **inverse GraphQL fields (IN)**: fields on the `to` type that read the *same* stored edge backwards. They never mean
  a second edge. `SourceLocator.snapshot (IN)` is `(:SourceSnapshot)-[:HAS_LOCATOR]->(:SourceLocator)`.

In Cypher, write the pattern in the stored direction: `(p:Package)-[:HAS_LABEL_VERSION]->(lv:LabelVersion)`. A path
hop from `bks-schema path` says `along-direction` or `against-direction` relative to how you walk it.

Node cards split **Outgoing relationships** (this type is `from`) from **Incoming relationships** (this type is `to`),
so reverse edges declared on other types are not missed.

## Interfaces and unions

`Entity` and `Subjectable` are interfaces with dozens of implementers. Kernel traversal edges declare them as
endpoints (OD-45): `HAS_SUBJECT`, `HAS_OBJECT`, `ASSERTED_BY`, `ASSESSES`, `HAS_IDENTIFIER`, `MENTIONS`,
`WAS_GENERATED_BY`; registered exceptions are D5 `STEP_USES` and D10 `ASSOCIATES`. Unions (e.g.
`DeclaredComponentTarget = IngredientMaterial | Constituent | FoodItem`) are small, closed target sets.

- Cards, `neighbors` and slices show such an endpoint **once**, as the declared group with its member count.
- Expand only when you need the members: `bks-schema neighbors rel:HAS_SUBJECT --expand`,
  `bks-schema neighbors node:Assertion --direction out --expand`, or the interface card's implementer list.
- `path` labels hops through an interface endpoint `viaInterface` and ranks such paths after typed domain paths of
  equal length; `--joins exclude` forbids them.
- A slice records an unexpanded interface target as an omission (`interface target (56 implementers) not expanded`).

## Topology is not data

`search/adjacency.json` and every `neighbors` / `path` answer describe what may connect in the pinned release
(`instanceClaim: false`). Whether a given product has a label version is a `biotech-kg-query` read.

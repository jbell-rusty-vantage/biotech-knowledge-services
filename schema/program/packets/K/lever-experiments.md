# K — lever experiment matrix (R1 / R2 / R3 and three new levers)

Run 2026-10-08 by A1 (Wave 0). `@neo4j/graphql` 7.6.3, graphql 16.14.2, Node 24, Windows 11. Every SDL printed twice: with the deployed server's options (`apps/graphql-api` `createNeo4jGraphQL`, `excludeDeprecatedFields: {}`; numbers identical to `pnpm --filter @bks/graphql-api print-schema`, checked byte-for-byte on C-5 = 606,205 bytes) and with all five `excludeDeprecatedFields` flags set. The deployed printer applies the same `@limit` preparation in both.

## Method

- Generator `lever/gen.mjs` (sha256 `0fb2d9ac…0edc`) writes one SDL per variant: kernel core (Assertion with subject/object, SourceLocator, Activity with `generated`, Identifier with `identifies`, a Chunk with `mentions`) plus N synthetic domain types. Each domain type has 5 scalar properties plus the shared Entity fields and three relationships: one structural (self), one asserted (`AssertedEdgeProperties`), one derived (`DerivedEdgeProperties`).
- Printed at N = 5 and N = 10; **marginal cost per domain type = (N10 − N5) / 5**. Printer `lever/print2.mjs` (sha256 `b8a634cd…f56f`) = the server's `prepareTypeDefs` + `Neo4jGraphQL` with an optional `excludeDeprecatedFields` switch. Raw output: `lever/results.txt`.
- SDLs and printed schemas: scratch `%TEMP%\claude\C--Users-Pinda-Proyectos-Biotech\d38640f3-…\scratchpad\ft\K\lever\{sdl,out}\` (regenerable with `node lever/gen.mjs <dir>`; digests in RUNLOG).

Variants: **U0** union target (5 or 10 members), no levers (pinned style) · **U2** union target + R2 + R3 · **A** interface target = wide `Entity` (every type implements it) + R2 + R3 · **B** `@cypher` read fields only for the any-entity edges + R2 + R3 · **C** thin `Subjectable` interface target (domain types only) + R2 + R3 · **C_noR2** C without `aggregate: false` · **C_noR3** C without `nestedOperations` · **C_fwd** C plus a forward `identifiers` field on every domain type via `@declareRelationship` · **C_M / B_M** plus `@mutation(operations: [])` on every type · **C_F** C plus `@filterable(byValue: true, byAggregate: false)` on every relationship · **C_MF** C + `@mutation(operations: [])` + `@filterable(byAggregate: false)`.

## Results

Default server options (what is deployed today):

| variant | bytes N=5 | bytes N=10 | **bytes / domain type** | inputs N=5 | inputs N=10 | **inputs / domain type** | lines / type |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| U0 union, no levers | 631,180 | 1,090,841 | 91,932 | 529 | 919 | 78 | 1,383 |
| U2 union + R2 + R3 | 584,748 | 1,006,580 | 84,366 | 372 | 632 | 52 | 1,127 |
| A interface `Entity` | 616,446 | 1,020,421 | 80,795 | 297 | 457 | 32 | 1,004 |
| B `@cypher` only | 555,509 | 959,468 | 80,792 | 250 | 410 | 32 | 1,004 |
| C thin `Subjectable` | 606,205 | 1,010,286 | 80,816 | 299 | 459 | 32 | 1,005 |
| C_noR2 | 626,142 | 1,043,634 | 83,498 | 299 | 459 | 32 | 1,095 |
| C_noR3 | 622,377 | 1,036,085 | 82,742 | 393 | 613 | 44 | 1,078 |
| C_fwd (forward identifiers) | 726,316 | 1,228,761 | 100,489 | 349 | 544 | 39 | 1,222 |
| C_M (+ no mutations) | 572,096 | 957,511 | 77,083 | 191 | 296 | 21 | 904 |
| B_M | 523,774 | 909,189 | 77,083 | 160 | 265 | 21 | 904 |
| **C_F** (+ `@filterable(byAggregate: false)`) | 202,657 | 309,704 | **21,409** | 223 | 338 | 23 | 487 |
| **C_MF** (+ both) | 168,548 | 256,929 | **17,676** | 115 | 175 | **12** | 386 |

With all `excludeDeprecatedFields` flags (server option, not SDL):

| variant | bytes N=5 | bytes N=10 | bytes / type | inputs / type |
| --- | ---: | ---: | ---: | ---: |
| U0 | 154,749 | 264,955 | 22,041 | 75 |
| U2 | 109,171 | 181,548 | 14,475 | 49 |
| A | 99,399 | 153,919 | 10,904 | 29 |
| B | 86,443 | 140,947 | 10,901 | 29 |
| C | 100,340 | 154,966 | 10,925 | 29 |
| C_noR2 | 120,277 | 188,314 | 13,607 | 29 |
| C_noR3 | 115,448 | 179,701 | 12,851 | 41 |
| C_fwd | 117,689 | 185,135 | 13,489 | 35 |
| C_M | 80,281 | 125,236 | 8,991 | 18 |
| C_F | 76,634 | 116,219 | 7,917 | 23 |
| C_MF | 56,575 | 86,489 | **5,983** | **12** |

Build time: every variant printed in 0.3–1.2 s.

## What the numbers say

1. **R1 — any-entity edges.** With an interface target, the per-domain-type cost of the six any-entity edges is effectively zero: A, B and C have identical marginal cost (80.8 KB / 32 inputs default; 10.9 KB / 29 inputs without deprecated fields); adding an implementer adds one value to the interface's implementation enum. A union target costs **+3.6 KB and +20 input types per member** at six any-entity fields (U2 − C), which is what made `AssertionSubjectTarget` (144 members × 17 fields) the top growth cause. Between interface options only the fixed cost differs: B (`@cypher`) is 14–50 KB smaller in total than C, but loses relationship filters (`assertions(where: {subject: {some: …}})`), connections and edge properties (HAS_IDENTIFIER episodes would be unreadable). A (wide `Entity` as target) and C (thin `Subjectable`) cost the same; C is chosen for semantics (a SourceSnapshot is never an assertion subject). Forward per-type fields (C_fwd) cost +19.7 KB / +7 inputs per type: kernel edges are declared once, on kernel types, never repeated on domain types.
2. **R2 as written (aggregate: false) removes little.** `aggregate: false` + `@query(aggregate: false)` saves only 2.7 KB per type (C_noR2 − C). The 259,039-line aggregation family is driven by **`<Type><Field>NodeAggregationWhereInput`** (≈ 18 KB per relationship field in default mode), which `aggregate: false` does not remove. **`@filterable(byValue: true, byAggregate: false)` on every `@relationship` removes it: −59 KB per type (−74%) default, −3 KB per type with deprecated fields excluded.** This is a new SDL lever, L1; it is part of the kernel pattern.
3. **R3 nestedOperations** saves 12 input types per type (C_noR3 − C) while mutations exist.
4. **L2 `@mutation(operations: [])`** on every type removes every create/update/connect input (−11 inputs/type, −38%; with L1: 12 inputs/type total). ADR 0003 already makes the executor the only writer and the API read-only (`GRAPHQL_ALLOW_MUTATIONS` defaults false), so the generated mutation surface is dead weight. With L2, R3 has no effect on size, but nestedOperations stay declared (directive rule 3; they document the class and keep mutations re-enableable).
5. **L3 `excludeDeprecatedFields` (server option)** cuts printed bytes by 66–85% at no SDL cost (deprecated `_EQ`/`_CONTAINS` style filters and aggregation filters outside connections). It changes the client-visible filter syntax, so it is an owner decision for `apps/graphql-api`, outside packet scope.

Kernel module alone (`04-schema-proposal.graphql`, levers L1 + L2 + R2 + R3 applied): **326,564 bytes, 6,582 lines, 185 input types** with the deployed options; 118,511 bytes with L3. Kernel + `domain-template.graphql` (one domain type, four relationships): 356,622 bytes, 202 inputs (template type: +30 KB, +17 inputs; +11.4 KB with L3).

Projection for the assembled candidate (≤ 90 node types): kernel + ~78 domain types at the template's per-type cost ≈ 2.7 MB and ≈ 1,550 input types with deployed options (≈ 1.0 MB with L3) — inside the ≤ 6 MB / ≤ 4,000 input budget with room for domain types that have twice the template's relationship fields.

## Proposed decision text (for the owner's `decisions/0001-size-levers.md`; not written there by A1)

> **0001 — Size levers.** Accepted on the measurements in `packets/K/lever-experiments.md`.
> 1. R1: any-entity edges (HAS_SUBJECT, HAS_OBJECT, ASSERTED_BY, HAS_IDENTIFIER, MENTIONS, ASSESSES, WAS_GENERATED_BY inverse) target the thin `Subjectable` interface (or `Entity` for WAS_GENERATED_BY), are declared once on kernel types with `nestedOperations: [CONNECT]` (derived: `[]`), and are never re-declared on domain types. Unions as relationship targets are limited to 6 members. `@cypher` read fields are reserved for computed values.
> 2. R2: every `@relationship` carries `aggregate: false` **and `@filterable(byValue: true, byAggregate: false)`**; every node type and interface carries `@query(aggregate: false)`. A field opts back into aggregate filters only with a question id.
> 3. R3: every `@relationship` declares `nestedOperations` by class.
> 4. Every `@node` type carries `@mutation(operations: [])`; the knowledge executor is the only writer (ADR 0003).
> 5. Recommended to `apps/graphql-api` (owner): enable all five `excludeDeprecatedFields` flags after checking clients for deprecated filter syntax; re-measure the assembled candidate with and without.

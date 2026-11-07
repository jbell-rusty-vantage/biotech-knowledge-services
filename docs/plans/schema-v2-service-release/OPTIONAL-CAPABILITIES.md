# Optional capabilities: analytics and native vectors (biotech-schema-v2.0.0)

Date: 2026-10-11 (S8). Both capabilities are **explicitly disabled / unavailable** in this release. Their absence does
not block core schema, read, write, migration or consumer API work (OD-22, S8 exit rule). `describe` must advertise
exactly this (INTERFACES section 8: nothing planned-but-absent is advertised).

```json
{ "analytics": { "available": false }, "retrieve": { "available": false } }
```

## 1. Graph analytics (AGA / GDS)

| Item | State | Evidence |
| --- | --- | --- |
| GDS procedures on the production instance | installed: 454 `gds.*` procedures (of 703) | export `20261011T224403Z-aura-neo4j` `server.json` (procedure inventory and digest); live READ probe 2026-10-11T23:11Z: `capability-probe.mjs --live` reports 454 |
| GDS version | `RETURN gds.version()` fails with "Aura Graph Analytics is versionless." | export `server.json.gdsVersion` |
| Principal | current `.env` principal is denied `gds.internal.*` and `aura.*` (S0 section 4) | S0-INVENTORY |
| Local test instances | no GDS (5.26.31 Community and Enterprise eval) | `SHOW PROCEDURES` count 0 on both |
| Admission | none. No feature/budget admission exists for any algorithm (OD-22) | this file; `skill-routing.json` route `analytics.graph` `capabilityState` |
| Skill | `.agents/skills/biotech-graph-analyze` reports unsupported with evidence and stops | `capability-probe.mjs --export ...` output |

Installed procedures are not admission. Vendor write-back (`gds.<algo>.write`, AGA remote write-back in concurrent
batches with a transaction per batch) can never stand in for the canonical single-transaction writer (OV-GDS-WRITEBACK).

### Qualification required to enable analytics

1. **Admission record** naming each algorithm, version, configuration space, projection filters (time, admission state,
   tenant/scope) and per-job resource budget (memory estimate ceiling, wall-clock, concurrent jobs), approved by the owner.
2. **Version pin**: AGA is versionless, so the recorded artifact must carry the session/plugin build identity the
   service can read; embedded GDS needs `gds.version()` on a principal with access, recorded in the compatibility matrix.
3. **Principal**: a dedicated analytics principal with READ on the graph and execute on the admitted `gds.*`
   procedures only; no write privilege (prediction-versus-fact separation enforced by the database, not by prose).
4. **Tests on a version-matched instance** (Aura or an Enterprise image with the GDS plugin): budget denial from the
   estimate, timeout and cancellation with verified cleanup of projections/sessions, resume from a recorded job id,
   stable input metadata (revision and digest), and a negative test that write-back and ordinary fact proposals are
   refused (`evals/v2/write-recovery` WR-26..WR-28 become run evidence).
5. **Publication path**: results sealed as `bks-analytics-result.v1` artifacts; serving only through an admitted
   derived-projection intent (D10 Report / Association with method version, input digest and freshness, OD-23 and
   FU-11), with deterministic child batches and an atomic serving-generation pointer for large outputs.
6. **Capability flip**: only then may `describe.analytics.available` become true for the admitted algorithms.

## 2. Native data vectors (chunk embeddings / GraphRAG)

| Item | State | Evidence |
| --- | --- | --- |
| OD-44 profile | selected and recorded, **not served**: `text-embedding-3-small`, 1,536 dimensions, cosine; model change = new generation | DECISIONS OD-44 |
| v2 Chunk nodes | 0 on Aura; the migration writes none | export counts; migration expected counts (no `Chunk`) |
| Legacy vectors | 1,536-d `searchEmbedding` arrays with `embeddingModel = text-embedding-3-small` on legacy nodes (Compound, CompoundForm, LabTest, Listing, ListingSnapshot, Organization, OrganizationSnapshot, Person, PhysicalLocation, Product, ProductSnapshot); 15 legacy VECTOR and 31 FULLTEXT indexes | export `manifest.json` property schemas, `schema.json` |
| Disposition | legacy vectors stay on legacy nodes only (retain-legacy); no v2 vector property or index is written; invariant `od44.noV2Vectors` = 0 in the dry run | `legacy-map.yaml` `policy.embeddings`; dry-run reports |
| Blocking constraint | Knowledge Services Enterprise constraints on `:Chunk` require `chunkId`, `chunkKey`, `index`, `text` (NOT NULL) plus uniqueness on `chunkId`/`chunkKey`; the v2 D9 `Chunk` stores `chunkIndex` and has no `chunkId`/`chunkKey`, so a v2 Chunk write on Aura would fail | export `schema.json` (`chunk_*` constraints); v2 SDL `type Chunk` |
| `genai` | 1 `genai.*` procedure present; not admitted | export `server.json` |
| `SEARCH` clause | requires Neo4j >= 2026.01; unavailable on 5.26 / 5.27-aura | `neo4j-vector-index-skill` compatibility; TL-03 |
| Product vector search | unsupported (S0 consequence 6) | S0-INVENTORY |

Schema semantic discovery is a different capability (managed OpenAI Vector Stores over the schema corpus, S5) and does
not depend on native vectors.

### Qualification required to enable native vectors

1. **DDL reconciliation (operator)**: S1 decides how D9 `Chunk` coexists with the Knowledge Services `:Chunk`
   constraints (separate label for KS chunks, or KS adopts the v2 shape). Any change to production constraints is an
   operator action under the lead; nothing is dropped as cleanup.
2. **Profile generation record**: model, dimensions, similarity, representation/normalization, chunker version,
   extractor version and index generation id; a model change mints a new generation (OD-44).
3. **Index**: a v2 vector index on the admitted Chunk label/property, ONLINE, with population checked against the
   generation's expected count.
4. **Pipeline**: chunk provenance (snapshot, textVersionHash, chunkerVersion, chunkIndex), embedding outbox and
   reconciliation, retrieval-eligibility checks (admission and visibility of the cited evidence), budget accounting.
5. **Qualification on Biotech retrieval tasks** with the same paired protocol as `evals/v2/protocol.md`, including
   stale-generation and provider-outage behaviour (unavailable, never empty).
6. **Capability flip**: only then `describe.retrieve.available = true` for the qualified generation.

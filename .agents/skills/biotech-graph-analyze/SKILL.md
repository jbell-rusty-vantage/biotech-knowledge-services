---
name: biotech-graph-analyze
description: >-
  Graph-global analytics over the BellLabs biotech graph (similarity, communities, centrality, topology, frontier
  ranking, candidate discovery) through Neo4j GDS or Aura Graph Analytics, capability-gated. In
  the pinned release analytics is NOT admitted: the skill checks the capability, reports unavailable with evidence and
  stops. When a later release admits a route it runs a bounded projection, streams results into a sealed artifact and
  never writes facts. Not for routine evidence reads (biotech-kg-query) or any canonical write (biotech-kg-ingest).
allowed-tools:
  - Bash(node .agents/skills/biotech-graph-analyze/scripts/capability-probe.mjs *)
---

# biotech-graph-analyze: analytics as artifacts, behind admission

## Current state (pinned release)

The pinned release is `schema/pinned/PIN.json` (`biotech-schema-v2.2.0` as of 2026-10-25). The probe prints the pinned
`releaseId` and `schemaReleaseDigest` it read; trust that output over this text.

- GDS is **installed** on the Aura instance (454 `gds.*` procedures; `gds.version()` answers "Aura Graph Analytics is
  versionless."). Installed is not admitted.
- No analytics route is **admitted** (OD-22): `describe` returns `analytics: {available: false}`. Unavailable analytics
  does not block core reads or writes.
- Native data vectors are **disabled** (OD-44 profile `text-embedding-3-small`, 1,536 dimensions, cosine, recorded and
  not served): `retrieve: {available: false}`. Schema semantic search is a separate OpenAI Vector Store route.
- Evidence and the qualification needed to enable either: `docs/plans/schema-v2-service-release/OPTIONAL-CAPABILITIES.md`.

## Triggers and non-triggers

Use for: whole-graph similarity, community detection, centrality, path topology, per-frontier influence ranking (FU-11
versioned D10 ranking Report), candidate link discovery. Do not use for: resolving an entity, reading evidence or
history, answering a bounded path question (biotech-kg-query), or recording anything (biotech-kg-ingest).

## Overrides (read before loading neo4j-gds-skill or neo4j-aura-graph-analytics-skill)

- **OV-GDS-WRITEBACK**: `gds.<algo>.write` and AGA write-back are not fact writers. AGA writes back in concurrent
  batches with a transaction per batch, so it cannot satisfy the single-transaction canonical apply. Use `stream` or
  in-projection `mutate`, then seal an artifact.
- **OV-CYPHER-VERSION**: Cypher 5 only; never `CYPHER 25`.
- **OV-ELEMENT-ID**: map results to `uid`; never persist `elementId()` or GDS internal node ids as identity.
- A predicted link, cluster or similarity score is an analytical result, never a sourced fact.

## Procedure

1. **Gate**: run `node .agents/skills/biotech-graph-analyze/scripts/capability-probe.mjs --export <exportDir>` (offline)
   or `--live` (READ session, `SHOW PROCEDURES` only), and read the service `describe`. If `analytics.available` is
   false, return `{status: "unsupported", capability: "analytics", reasons, evidence}` and stop. Do not fall back to
   raw Cypher loops that emulate an algorithm over the whole graph.
2. **Declare** (admitted releases only): projection filters (time, admission state, tenant/scope, labels and
   relationship types from the release-bound schema context), algorithm and version, configuration and seed, resource
   budget, input graph revision and digest, TTL and output schema.
3. **Estimate** memory and runtime (`gds.<algo>.stream.estimate` or `GdsSessions.estimate`); refuse over budget.
4. **Run** as a recorded job/session with an id; stream results; respect the time budget and cancel on expiry.
5. **Seal** the result artifact with provenance: algorithm/version/config/seed, input revision digest, projection
   filters, row count, output digest.
6. **Clean up** projections and sessions in `finally`, including after cancellation or error; verify they are gone.
7. **Publish** only through an admitted derived-projection intent with its own trusted typed writer and authoritative
   inputs. A projection too large for one intent uses deterministic child batches plus an atomic serving-generation
   pointer after completeness checks; partial generations are never current.
8. **Resume** after interruption from the recorded job/session id; never start a second job for the same request.

## Result artifact

`bks-analytics-result.v1` (defined with the first admitted route): `{capability, algorithm, version, config, seed,
inputRevision, inputDigest, projection, budget, startedAt, finishedAt, rows, outputDigest, cleanup}`. The unavailable
outcome above is the only artifact this release produces.

## Failures

| Situation | Outcome |
| --- | --- |
| capability unavailable | `unsupported` with reasons and evidence; not an empty result |
| budget denied by estimate | `refused` with the estimate |
| timeout or cancellation | `cancelled`; cleanup verified; resume from job id |
| write-back requested | refused (OV-GDS-WRITEBACK) |

## Evaluations

`evals/v2/write-recovery/tasks.json` WR-26 (capability unavailable reported, not empty), WR-27 (write-back request
refused) and WR-28 (prediction never recorded as a sourced fact).

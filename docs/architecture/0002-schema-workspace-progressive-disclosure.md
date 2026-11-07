# ADR 0002 — Schema workspace as progressive disclosure

Status: accepted · 2026-10-07 · revised 2026-10-11 for workspace v2 (release `biotech-schema-v2.0.x`)

## Problem

The schema is a large `@neo4j/graphql` SDL (v2 release: 69 node types, 106 relationship types, 848 concrete from→to
pairs, 374 predicate registry entries, 193 enums, 14 modules K and D1–D13) plus registers, vocabularies, rules and a
query catalog. No agent can hold it in context, and reading it linearly loses what the release encodes outside the SDL:
relationship class and temporal model, executor operations, predicate routes, evidence paths, question-linked
templates and v1 → v2 dispositions.

## Decision

Parse the **verified pinned release** (`loadRelease()`: `schema/pinned/PIN.json` + `release/**`, every byte checked)
into IR v2 once and render a deterministic, release-bound tree (`bks-schema-workspace.v2`). Module membership comes
from the release assembly manifest, never from banner names. Workspace inputs (domains, terminology, task routes,
identity and ingestion rules, aliases) are the release's `workspace-inputs/`; `schema/sidecars/` is only a pointer.

| depth | layer | content |
|---|---|---|
| 0 | `START_HERE.md` | workflow, release identities, context budget, limits, CLI and plain-filesystem routes, compatibility |
| 1 | `INDEX.md` | every node and relationship type on one line, modules, predicate / assessment overview |
| 2 | `domains/<slug>.md`, `modules/<K\|D1..D13>.md` | navigational domains; release modules (owner, digest, definitions, relationship types, predicates, questions) |
| 3 | cards: `nodes/`, `relationships/`, `edge-properties/`, `interfaces/`, `unions/`, `predicates/`, `assessments/`, `vocabularies/` | one element each, with generated front matter |
| 4 | `sdl/<Name>.graphql` | the verbatim definition |
| aside | `tasks/`, `rules/`, `patterns/`, `migrations/`, `search/index.jsonl`, `search/adjacency.json`, `schema-ir.json`, `manifest.json` | task routes, release rules, question-linked templates, v1/legacy navigation, machine index, topology, IR, inventory |

Cards carry generated front matter (`id`, `kind`, `module`, `schemaReleaseDigest`, `sourceRefs`, `aliases`,
`capabilities`, `cardDigest`); `cardDigest` is the sha256 of the canonical front matter (without the digest) and body.
`search/index.jsonl` is the machine authority for filters; front matter is a projection of the same row.

Node cards: identity (uid token, register identity rule, keys, identifier schemes with write status), stored labels,
fields with module source lines, outgoing and incoming relationships (stored direction; interface/union targets
collapsed), legal predicates with their route, evidence path, temporal scope and exclusivity, read patterns, executor
operations and proposal kinds, forbidden implications, tasks, v1 aliases, source definition. Relationship cards separate
stored direction from inverse GraphQL fields and expand interface/union endpoints only on request. Predicate cards say
whether a fact is a typed edge or Assertion-only (or literal / field / computation / alias / retired).

`patterns/` renders the release query catalog (a byte-identical `patterns/catalog.json` plus one card per template and
one question set per module). `migrations/` renders v1 → v2 dispositions (old ids become `alias` records that explain,
never substitute), the live legacy-graph map, and the operational names (`LegacyV0*`, `MIGRATED_FROM`, `legacy:`, `Ks*`)
as non-ontology. None of it is an execution script.

Commands (`bks-schema`, also served by the executor): `search` (lexical / semantic / hybrid with explicit degradation),
`find` (exact structured filters), `get` (with `--section` / `--field`), `neighbors`, `path`, `pattern`, `slice`
(budgeted, digest-bound, with closure and omissions, emitting `biotech-schema-context.v1`), `doctor`, `verify`, `eval`.
Ordinary filesystem tools (`rg`, `jq`, PowerShell `Get-Content` / `ConvertFrom-Json`) are first-class; the old
"never list the tree" and four-page rules are replaced by a context budget and progressive disclosure.

## Consequences

- Reproducible: the generation timestamp (default the release `createdAt`) lives only in `manifest.json`; the
  fingerprint covers every other file. A clean-room re-render is byte-identical.
- `workspace:verify` hashes every file on disk against the manifest inventory (missing / altered / unexpected) and
  compares a fresh render; `workspace:build` writes to a staging directory and swaps it in only after path validation.
- Schema changes are upstream release changes; the renderer and the planner adapt from the IR. Agents cite the
  release `schemaReleaseDigest` from the manifest; a mismatch is refused (`BKS_RELEASE_MISMATCH`).

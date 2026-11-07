# BellLabs biotech knowledge schema — agent workspace (v2)

Generated from the pinned release **biotech-schema-v2.2.0** (`schema/pinned/release/sdl/assembled.graphql`).

| identity | value |
| --- | --- |
| schemaDigest | `sha256:de8ab942f3b2fac85011938adcddd75244bc9b5e7c53df07ebc7490b888f6576` |
| schemaReleaseDigest | `sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74` |
| queryCatalogDigest | `sha256:39c7a9d3a3f13f2c8e287bb42ea528c060a2cfc8ebe01d8a4a79abcbe27896b6` |
| workspaceFingerprint | see `manifest.json` (`bks-schema manifest`) |

69 node types, 106 relationship types, 374 predicates, 15 assessment kinds, 195 enums, 14 modules (K, D1–D13), 11 domains, 157 query templates for 454 questions.

## Workflow

1. **Bind the release.** `bks-schema manifest` (or `Get-Content workspace/manifest.json | ConvertFrom-Json`). Every citation carries `schemaReleaseDigest`; a different digest is a different schema. `bks-schema doctor --json` checks integrity and links.
2. **Exact first.** An id, name or alias you already know: `bks-schema get node:LabelVersion`. Old v1 ids resolve to a migration record that says what happened (`get node:Mention`), never to a silent substitute.
3. **Search or filter.** `bks-schema search "per serving label amount"` (lexical, deterministic), `bks-schema find --kind relationship --class asserted --module D6`, or plain `rg` over the tree. Semantic/hybrid search is optional; when unavailable it says so.
4. **Read the cards you will use**: task → node / relationship / predicate cards → the mandatory rules (identity, ingestion, temporal, evidence path). Follow reverse edges and interfaces deliberately (`neighbors`), and predicate-only facts through the Assertion.
5. **Bound the context.** `bks-schema slice --tasks <slug> --max-tokens 12000 --out <dir>` gives a digest-bound context with closure and omissions; `path` / `neighbors` give bounded topology.
6. **Emit a schema context** (`biotech-schema-context.v1`, written by `slice`): it records what you selected and decided. It is advisory and grants no authority to write.

The schema is the contract, not the data: a card says what may exist; `bks kg read` says what does. A legal schema path is never proof that the live graph contains one.

## Context budget and progressive disclosure

There is no fixed page count. Budget your context: the default slice target is 12,000 estimated tokens (ceil(utf8 characters / 4)); cards are ~1–6k tokens, `schema-ir.json` and `patterns/catalog.json` are large machine files (query them with `jq`/`ConvertFrom-Json`, do not read them whole). Read START_HERE → domain or task → the few cards that decide your answer; expand (reverse edges, interface members, more templates) when correctness needs it and record what you left out. `get --section <heading>` and `get --field <key>` read part of a card.

## Filesystem workflows (first-class)

POSIX / any shell with ripgrep and jq:

```bash
rg --files workspace/nodes                                   # every node card
rg -n 'HAS_EVIDENCE|SourceLocator' workspace/patterns workspace/rules
rg -l '^module: "D6"' workspace/predicates               # front matter is greppable
jq -c 'select(.kind=="relationship" and .relClass=="asserted" and .module=="D6") | {id,temporal,exclusive}' workspace/search/index.jsonl
jq -r 'select(.kind=="alias" and .name=="Mention") | .summary' workspace/search/index.jsonl
jq '.arcs[] | select(.from=="LabelVersion")' workspace/search/adjacency.json
```

PowerShell:

```powershell
Get-ChildItem workspace/nodes -Name
Select-String -Path workspace/rules/*.md -Pattern 'HAS_EVIDENCE|SourceLocator'
Get-Content workspace/search/index.jsonl | ForEach-Object { $_ | ConvertFrom-Json } | Where-Object { $_.kind -eq 'node' -and $_.properties -contains 'compositionDigest' } | Select-Object id, path
(Get-Content workspace/manifest.json -Raw | ConvertFrom-Json).release
```

## Commands (`node packages/schema-workspace/dist/cli.js <cmd>`, alias `bks-schema`)

| command | result |
| --- | --- |
| `search "<words>" [--mode lexical\|semantic\|hybrid] [--kind k] [--module D6] [--limit 10] [--json]` | ranked ids, paths, match reasons, card digests, retriever mode and degradation (top 10, max 50) |
| `search "<words>" --expand paths [--base-limit N] [--json]` | structured discovery: with path intent (two node types named, or from…to / between / path / trace wording) the top search cards (adaptive 4–7), then the relationship and node cards of legal schema paths between every pair of up to 3 node types (≤ 3 hops, 2 paths per pair, direction-consistent first), then referenced predicate / assessment cards; capped at 10 with a `route` and the exact calls. Without path intent: the plain top 10 |
| `find --kind node [--property uid] [--executor-op create\|node.upsert] [--class asserted] [--module D6] [--json]` | exact structured matches, deterministic order |
| `get <id-or-path> [--section <heading>] [--field <key>] [--json]` | one card (or part); old ids answer with their migration record |
| `neighbors <id> [--direction out\|in\|both] [--depth 1..5] [--expand] [--json]` | bounded schema adjacency (100 nodes / 250 arcs) |
| `path <from> <to> [--max-hops 1..5] [--limit 1..5] [--joins fill\|include\|exclude] [--json]` | at most five legal schema paths, typed first, then evidence/predicate joins |
| `pattern --question <id> \| --template <id> [--json]` | question → templates, parameters, output contract, temporal/provenance notes, status |
| `slice --tasks t1 [--types A,B] [--max-tokens 12000] --out <dir>` | budgeted context + `schema-context.json` with closure and omissions |
| `manifest` · `doctor [--json]` · `verify` | identities · integrity/links/versions · on-disk hashes + clean rerender |

Ids: `node:` node, `rel:` relationship, `edge:` edge-properties, `iface:` interface, `union:` union, `enum:` enum, `vocab:` vocabulary, `pred:` predicate, `asmt:` assessment, `mod:` module, `dom:` domain, `task:` task, `rule:` rule, `pattern:` pattern, `qset:` question-set, `migration:` migration, `term:` term, `q:` question, `op:` operational; raw SDL `sdl:<Name>`; old v1 ids (`node:Mention`, `frag:W04`) are alias records.

## Limits (policy bks-schema-limits.v1)

Search top 10 (max 50, query ≤ 2000 characters); traversal depth 1 (max 5), adjacency ≤ 100 nodes / 250 arcs; paths ≤ 5, max hops 5; slice target 12,000 tokens with explicit estimates. Truncation is always reported; identity and admission rules are never silently dropped from a write slice.

## Layers

| depth | layer | path | purpose |
| --- | --- | --- | --- |
| 0 | START_HERE | `START_HERE.md` | Workflow, pin, context budget, limits, tool routes (CLI and plain filesystem). |
| 1 | INDEX | `INDEX.md` | Every node type and relationship type on one line, grouped by domain; modules; counts. |
| 2 | domains | `domains/<slug>.md` | Navigational domain: purpose, questions, modules, node types, internal relationships, seams, tasks. |
| 2 | modules | `modules/<K\|D1..D13>.md` | Release module (assembly manifest): owner, digest, definitions, relationship types, predicates, questions. |
| 3 | cards | `nodes/ relationships/ edge-properties/ interfaces/ unions/ predicates/ assessments/ vocabularies/` | One element with generated front matter: identity, fields, relationships, predicates, evidence path, temporal rules, write route. |
| 4 | sdl | `sdl/<Name>.graphql` | Verbatim SDL definition from the pinned release. |
| aside | tasks | `tasks/<slug>.md` | Task routes: elements, read operations, proposal kinds (pending kinds marked), steps, pitfalls. |
| aside | rules | `rules/*.md` | Identity, ingestion, temporal, projection and evidence-path rules of the release. |
| aside | patterns | `patterns/<module>/<template>.md, patterns/questions/<module>.md, patterns/catalog.json` | Question-linked Cypher 5 templates with parameters, output contracts, temporal/provenance notes and status. |
| aside | migrations | `migrations/*.md` | v1 -> v2 navigation (old ids as aliases, removed concepts explained); never execution scripts. |
| aside | search | `search/index.jsonl, search/adjacency.json` | Machine authority: one JSON record per card (filterable fields) and the schema topology. |
| aside | schema-ir | `schema-ir.json` | The full IR v2 (large; read with jq / ConvertFrom-Json, not whole). |

## Domains

| domain | id | modules | nodes | purpose |
| --- | --- | --- | --- | --- |
| [Kernel, identity, time and provenance](domains/kernel-and-provenance.md) | `dom:kernel-and-provenance` | [K](modules/K.md) | 11 | The parts every other domain depends on: uid identity and archetype labels, bitemporal time, the Assertion that authorizes every source-der… |
| [Substances, materials, mechanisms and biology](domains/substances-and-biology.md) | `dom:substances-and-biology` | [D1](modules/D1.md), [D2](modules/D2.md) | 9 | Chemical substances (identity by structure), ingredient materials (branded, botanical, microbial, extracts), taxa and strains, constituents… |
| [Clinical and preclinical evidence](domains/studies-and-evidence.md) | `dom:studies-and-evidence` | [D3](modules/D3.md) | 8 | Studies with registry versions, arms, intervention components, populations, outcome definitions, results and adverse-event results, publica… |
| [Diagnostics, biomarkers, measurement and devices](domains/diagnostics-and-devices.md) | `dom:diagnostics-and-devices` | [D4](modules/D4.md) | 7 | Biomarkers, metrics, lab tests, assay and algorithm versions, reference interval versions and devices; what a test measures, which version… |
| [Interventions, protocols, safety, food and nutrition](domains/exposures-and-interventions.md) | `dom:exposures-and-interventions` | [D5](modules/D5.md), [D12](modules/D12.md) | 9 | Targets (what helps or hurts), interventions, protocols with editions and steps, use constraints (dose limits, contraindications, interacti… |
| [Products, labels and commerce](domains/products-and-commerce.md) | `dom:products-and-commerce` | [D6](modules/D6.md) | 6 | The enduring Product, its variants and packages, label versions with their declared component lines, merchant listings and offers with the… |
| [Organizations, people and money](domains/actors-and-institutions.md) | `dom:actors-and-institutions` | [D7](modules/D7.md) | 4 | Organizations (legal entities, groups), people (public actors only), brands and awards; roles, stakes, control, brand ownership and financi… |
| [Manufacturing, quality, regulation and intellectual property](domains/manufacturing-quality-regulatory-ip.md) | `dom:manufacturing-quality-regulatory-ip` | [D8](modules/D8.md) | 6 | Regulatory records (filings, letters, recalls, inspections, enforcement), legal status episodes, lots, quality results with their stated ve… |
| [Sources, media, discourse and capture tooling](domains/sources-documents-and-media.md) | `dom:sources-documents-and-media` | [D9](modules/D9.md), [D11](modules/D11.md) | 4 | Channels (podcasts, video channels, accounts, event series), media works and the text chunks retrieval reads; discourse metrics; capture at… |
| [Derived knowledge, reports, rankings and recommendations](domains/derived-knowledge-and-reports.md) | `dom:derived-knowledge-and-reports` | [D10](modules/D10.md) | 3 | Versioned decision criteria, report items of published reports, and regenerable associations; how BellLabs derives and publishes knowledge… |
| [Frontiers, breakthroughs and events](domains/frontiers-and-events.md) | `dom:frontiers-and-events` | [D13](modules/D13.md) | 2 | Events (trial readouts, approvals, recalls, funding, retractions) with their own clocks, and the research frontiers they move; leads-to and… |

## Tasks

| task | phase | id | pending proposal kinds |
| --- | --- | --- | --- |
| [What do we already know about X? (run before every research mission)](tasks/what-do-we-know-about-entity.md) | before-research | `task:what-do-we-know-about-entity` |  |
| [Should I update an existing node or create a new one?](tasks/decide-update-or-create.md) | before-ingestion | `task:decide-update-or-create` | `mention.stage`, `assessment.record` |
| [Ingest a product label (supplement facts) as a label version with its component lines](tasks/ingest-product-label.md) | ingestion | `task:ingest-product-label` |  |
| [Ingest a study with its registration versions, intervention material and results](tasks/ingest-study-publication.md) | ingestion | `task:ingest-study-publication` |  |
| [Ingest an organization profile (roles, stakes, brands, control)](tasks/ingest-organization-profile.md) | ingestion | `task:ingest-organization-profile` |  |
| [Ingest claims made in a podcast or video episode](tasks/ingest-podcast-claims.md) | ingestion | `task:ingest-podcast-claims` | `assertion.relate`, `mention.stage` |
| [Ingest a regulatory record (filing, letter, recall, inspection) and the status it establishes](tasks/ingest-regulatory-filing.md) | ingestion | `task:ingest-regulatory-filing` |  |
| [Record mechanism evidence (measured vs inferred) for a substance](tasks/ingest-mechanism-evidence.md) | ingestion | `task:ingest-mechanism-evidence` | `assertion.relate` |
| [Record an observed price for a listing](tasks/record-price-observation.md) | ingestion | `task:record-price-observation` |  |
| [Attach an external identifier to a node](tasks/attach-identifier.md) | ingestion | `task:attach-identifier` |  |
| [Trace an assertion to its source span and adjudication](tasks/trace-answer-to-source.md) | query | `task:trace-answer-to-source` |  |
| [Correct or end a fact that is no longer true](tasks/correct-a-stale-fact.md) | ingestion | `task:correct-a-stale-fact` |  |
| [Stage something you found but cannot resolve or place](tasks/stage-unresolved-mention.md) | ingestion | `task:stage-unresolved-mention` | `mention.stage`, `assessment.record` |
| [Take a claim through vetting, an evidence mission and a published evidence report](tasks/claim-to-evidence-report.md) | ingestion | `task:claim-to-evidence-report` | `assessment.record`, `adjudication`, `report.publish` |
| [Compare measured content of a sold product with its label declaration (OD-10 option A)](tasks/measured-versus-declared-content.md) | ingestion | `task:measured-versus-declared-content` | `assertion.relate`, `assessment.record` |
| [Record a financial interest or conflict and its disclosure](tasks/interest-conflict-disclosure.md) | ingestion | `task:interest-conflict-disclosure` | `assertion.relate`, `assessment.record` |

## Compatibility (this release)

| capability | status | reason |
| --- | --- | --- |
| `analytics.gds-aga` | disabled | OD-22: optional capability; no required DDL or supported template depends on it |
| `chunk.write` | unsupported | the live shared Knowledge Services Enterprise constraints on :Chunk (chunkId, chunkKey, index, text NOT NULL; chunkId/chunkKey unique) conflict with the v2 D9… |
| `graphql.mutations` | unsupported | L2 (OD-02): no Mutation root; writes go through the native executor |
| `legacy.nodes` | present-excluded | LegacyV0 / LegacyV0_<Label> nodes, MIGRATED_FROM edges and legacy: qualifiers exist after the migration; they are excluded from the consumer projection, typed… |
| `vectors.native` | disabled | OD-44: ddl/optional.cypher records the text-embedding-3-small/1536/cosine profile; not created or served in this release; the catalog templates that need the v… |

Full statement: [rules/compatibility.md](rules/compatibility.md). Migration-only names (`LegacyV0*`, `MIGRATED_FROM`, `legacy:` qualifiers, `Ks*` markers) are operational, not ontology: [migrations/operational-names.md](migrations/operational-names.md); live legacy labels: [migrations/legacy-map.md](migrations/legacy-map.md).

## Kernel facts

- Identity is `uid` (`hu:<token>:<opaque>`); `name` is presentation. Resolution order and schemes: [identity rules](rules/identity-rules.md).
- A source-derived fact is an Assertion; its evidence path is `(:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(:Source)` ([evidence path](rules/evidence-path.md)). Status is capture fidelity, never truth.
- Valid time (author-declared, half-open, null = unknown) and recorded time (service-assigned) are distinct ([temporal rules](rules/temporal-rules.md)); exclusive episodes are scoped to (subject, slot, asserter).
- Executor creatability comes from the node register (`executorOps` on each node card), never from GraphQL `@mutation` flags (all off).
- Predicate-only relations have no typed edge; they live on the Assertion ([predicates](INDEX.md#predicates)).
- Mention is retired (OD-04): an unplaceable surface form is a SourceLocator plus a RESOLUTION Assessment (`mention.stage`).

# Semantic search and fallback

`bks-schema search "<words>" --mode lexical|semantic|hybrid` (executor: `/schema/search`, MCP `schema_search`).
Semantic retrieval uses one OpenAI Vector Store per immutable schema-index generation, bound by
`runs/release-v2/custody/semantic/current.json` (server-side; agents never hold `OPENAI_API_KEY`).

| mode | no generation bound / disabled / provider down | generation bound and compatible |
| --- | --- | --- |
| `lexical` (default) | complete, deterministic local ranking | same |
| `semantic` | `status: "unavailable"`, `hits: []`, exit 4: **not** "nothing found" | hosted candidates, validated and rehydrated from local cards |
| `hybrid` | `status: "degraded"`, `mode: "lexical-only"`, lexical hits, `degradation.reason` | lexical top 20 + semantic top 20, reciprocal-rank fusion (k = 60); exact id / name / alias hits stay first; dedupe by card; top 10 |

Use `hybrid` on demand for unfamiliar phrasing (paraphrases); keep `lexical` as the default route unless the release
evaluation says otherwise (`docs/plans/schema-v2-service-release/reports/S2-workspace.md`, section S5).

## What the hosted side is and is not

- Corpus: generated schema cards (nodes, relationships, edge properties, interfaces, unions, enums, domains,
  modules), task routes, predicate and assessment cards, release rule cards and pattern explanations (no Cypher
  statements, no SDL, no IR, no migrations, nothing private). Long cards are split into sections sharing the card id;
  each document embeds its card id, section, kind, module and release / workspace identity.
- Attributes on every file: `release_digest`, `workspace_fingerprint`, `card_id`, `card_digest`, `kind`, `module`,
  `language`, `corpus_kind`, `section`. Static chunking 800 / 100 tokens. The embedding model is provider-managed
  and not configurable through the Vector Store contract.
- Search: exact `release_digest` filter (plus `kind` / `module` filters), `max_num_results` 20, `rewrite_query`
  false, ranker `auto`, score threshold 0, 5 s deadline, 2,000-character queries, request / spend ceilings.

## Validation (hosted hits are candidates; the local workspace is truth)

1. The file id must be in the generation's local mapping and its attributes must equal the mapped card id, card
   digest, section, release and workspace; otherwise the hit is rejected.
2. The card digest must equal the local card's `cardDigest` (`validateHostedHits`; CLI `bks-schema rehydrate --hits`).
3. Accepted hits are rehydrated from local cards (`get <cardId>`); retrieved text is never executed or quoted as
   authority. `rejectedHostedHits` counts what was dropped.

## Degradation reasons you may see

| reason prefix | meaning | do |
| --- | --- | --- |
| `semantic search disabled` / `no semantic generation is published` | not configured | lexical is complete |
| `stale generation: ...` | the bound generation was built from another release or workspace | operator runs `bks-schema semantic refresh --live` (reuses every unchanged uploaded file; attribute-only when no card byte changed); lexical meanwhile |
| `timeout:` | hosted search exceeded the deadline | retry later or stay lexical |
| `quota:` / `billing:` / `rate-limit:` | provider limits | lexical; operator checks the account |
| `not-found:` | the bound store no longer exists | operator rebinds `current.json` |
| `semantic request ceiling reached` / `spend ceiling` | per-process budget used | lexical |

`bks-schema doctor` reports generation compatibility offline, document by document, without calling the provider:
`compatible` (same release, same fingerprint, every document byte-identical), `refreshable` (documents identical,
only the `workspace_fingerprint` attribute differs) or `stale` (documents changed). Document text carries only
release-stable identity (title, card id, section, kind, module); release digest, card digest and workspace fingerprint
live only in file attributes, so a release bump that leaves card bodies unchanged needs zero uploads. `bks-schema semantic status` shows the pointer and the usage ledger.

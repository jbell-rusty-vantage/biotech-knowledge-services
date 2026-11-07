# Blinded certification: structured-arm diagnosis (abstract)

Author: S8 (gold owner), 2026-10-12. Abstract by design: no task text, task ids, type names or gold content. Per-task
detail is in protected custody only (`runs/release-v2/custody/certify/diagnosis-structured-20261012T032848Z.json`,
`s8-cli-structured-bl{3,5,7}.json`). Workspace `sha256:37967296...`, release v2.0.1, lexical base search, k = 10.

## 1. What the reported 0.904 measured

- The run of record (`structured-bl5-20261012T032634Z.json`, 03:26Z) carries no `baseLimit` field. At that time
  `bks-schema eval` did not forward `--base-limit`, and structured search defaulted its base limit to the 10-candidate
  cap. Ten search cards therefore filled the list before path expansion could add anything (`fromPath` 0-1 per
  cross-domain task). The run was effectively "base limit 10", not 5.
- The workspace code changed at 03:28Z: `eval` now forwards `--base-limit` and records it, the default is 5, and path
  endpoints can be taken from types the query names. All figures below use that code. A rerun of the old setting
  (base 10) gives cross-domain 0.40, close to the reported 0.35; most misses are cap displacement (mode E).
- Cross-check: the official CLI (`eval --mode structured --base-limit N --json`) and my harness
  (`evals/v2/diagnose-structured.mjs`, which calls the same `searchWorkspace(..., {expand: "paths", baseLimit})`) agree
  exactly at base 3, 5 and 7.

## 2. Results by base limit (same workspace, same code)

| Base limit | Recall@10 overall (95% CI, CLI) | exact | negative | paraphrase | cross-domain recall | cross-domain hit@10 | Cross-domain misses (gold cards) by mode |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 3 | 0.926 [0.860, 0.978] | 1.00 | 1.00 | 0.85 | 0.80 | 0.90 | B 4 |
| 4 | 0.926 | 1.00 | 1.00 | 0.85 | 0.80 | 0.90 | B 4 |
| 5 | 0.941 [0.882, 0.985] | 1.00 | 1.00 | 0.90 | 0.80 | 0.90 | B 4 |
| 6 | 0.949 | 1.00 | 1.00 | 0.95 | 0.75 | 0.90 | B 4, E 1 |
| 7 | 0.956 [0.904, 0.993] | 1.00 | 1.00 | 1.00 | 0.70 | 0.80 | B 4, E 2 |
| 10 | 0.912 | 1.00 | 1.00 | 1.00 | 0.40 | 0.60 | B 3, E 9 |

Paraphrase misses at a low base limit (3 tasks at base 3-4, 2 at base 5, 1 at base 6) are the same displacement seen
from the other side: the gold card sits at search rank 6-7 and is cut because expansion runs even for queries that
express no path intent.

## 3. Cross-domain miss modes

Classification is mechanical (`diagnose-structured.mjs`). Counts are at the current default, base 5: 4 missed gold
cards in 3 of the 10 tasks.

| Mode | Count at base 5 | Mechanism observed | General change (no task knowledge) |
| --- | ---: | --- | --- |
| A: endpoint not among the top node cards | 0 | Query-named endpoints resolve every endpoint | none needed; keep the query-named endpoint source, falling back to the top-5 node window |
| P: endpoints present but never paired | 0 | n/a | none |
| B: endpoints paired, gold path not among `--limit 2` returned paths | 4 cards, 3 tasks | Each endpoint pair has 4-5 legal paths of the shortest length; the gold path ranks 3rd every time. In all three, the paths ranked above it traverse at least one relationship against its declared direction (in one, a 1-hop predicate join against direction outranks every 2-hop typed path, because length is ranked before category). The gold path follows declared direction for every hop. | When the query orders its endpoints (from X to Y), rank paths whose every hop follows declared direction before mixed-direction paths at equal length, and let a direction-consistent typed path outrank a shorter predicate join against direction. Alternatively, return the `pathLimit` best direction-consistent paths, then fill with mixed-direction ones. Either way, report the ranking rule in the route. |
| C: gold longer than maxHops (3) | 0 | every gold path here is short | none; keep `maxHops 3` (a frozen-suite task needs 5 hops; recorded as a task-design note in `protocol.md`) |
| D: gold includes predicate/assessment cards the expansion does not add | 0 | gold cards are relationship cards only | none |
| E: gold card on a returned path but displaced by the 10-candidate cap | 0 at base 5 (1 at base 6, 2 at base 7, 9 at base 10) | appending each path as node, rel, node, ... uses 2-3 slots per path, so the second path's relationship card falls off the end | Append relationship (and predicate) cards across all returned paths first, then intermediate node cards, then endpoint cards; or reserve `pathLimit x (shortest length)` slots for relationship cards before filling with search cards |
| F: other | 0 | n/a | n/a |

## 4. Recommended base limit

Do not pick a fixed number by maximizing this blinded set: 7 is the only setting that clears 0.95 here, but it does so
by trading cross-domain recall (0.70) for paraphrase recall, which is tuning to the test. The principled setting
follows from the candidate budget:

- **Expansion runs only when the query names at least two endpoint types (or otherwise signals path intent).** With
  no expansion, keep all 10 search cards: base = 10. This removes the paraphrase displacement, and paraphrase is 1.00 at
  base 10.
- **With expansion,** the space needed is at most `pathLimit x L` relationship cards plus `pathLimit x (L-1)`
  intermediate nodes, for shortest length L (L <= 2 for most endpoint pairs, at most 3). The endpoints are already among
  the search cards. With relationship-first appending (mode E fix), `pathLimit 2` and L = 2 need 4 relationship slots
  (6 with intermediates), which gives **base = 10 - 2 x L, i.e. 6 for L = 2 and 4 for L = 3, computed per query from
  the shortest path found**. A fixed fallback of 5 is a reasonable middle when L is not known in advance.
- Expected effect, by arithmetic on the observed modes (not a run):
  - The direction-consistent ranking (mode B fix) brings each gold path to rank 1 of the returned paths, so all 20
    gold cards fit at base 5-6.
  - The intent gate keeps paraphrase at 1.00.
  - Overall would then be bounded by 1.00, with the remaining risk in queries whose endpoint pair has more than
    `pathLimit` direction-consistent shortest paths.

## 5. Gold-card definition and what 0.95 requires

- Cross-domain Recall@10 (`definitions.recallAt10`) is the per-task fraction of gold cards in the top 10, averaged.
  For cross-domain tasks the gold cards are the **relationship cards of the gold path only**; endpoint and intermediate
  node cards are not gold.
- The blinded set's 10 cross-domain tasks carry **2.0 gold cards each** (all relationship cards; min 2, max 2), so 20
  in total. For comparison, the frozen suite averages 2.5 (range 1-5).
- The other 58 tasks score 1.00 at base 7-10 and 0.97 at base 5 (paraphrase 0.90). Overall >= 0.95 therefore needs
  cross-domain recall >= 0.66 (14/20 gold cards) when the other categories are at 1.00, or >= 0.86 (18/20) at base 5
  as it behaves today.

## 6. Blindness caveat

This diagnosis looked at the blinded set's per-task results. Any ranking change made because of it is informed by that
set, even though no task content is shared. For the final Gate C number, I recommend a fresh certification draw (same
generator and category mix, new seed, generated after the change lands), with this set kept as a development set.
I can generate it on request; generating it takes seconds and needs no graph access.

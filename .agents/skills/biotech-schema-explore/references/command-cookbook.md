# Command cookbook (POSIX and PowerShell)

All commands run from the repository root. `bks-schema` = `node packages/schema-workspace/dist/cli.js`.
Add `--dir <workspace>` for a mounted bundle other than `./workspace` (or set `BKS_WORKSPACE_DIR`).

## Bind and check

| goal | CLI | POSIX | PowerShell |
| --- | --- | --- | --- |
| release identities | `bks-schema manifest` | `jq '.release, .workspaceFingerprint' workspace/manifest.json` | `(Get-Content workspace/manifest.json -Raw \| ConvertFrom-Json).release` |
| refuse a wrong pin | `bks-schema manifest --expect-release sha256:...` (exit 3) | — | — |
| health | `bks-schema doctor --json` | — | — |
| full integrity + clean rerender | `pnpm workspace:verify` | — | — |

## Find things

| goal | CLI | POSIX | PowerShell |
| --- | --- | --- | --- |
| list node cards | `bks-schema find --kind node` | `rg --files workspace/nodes` | `Get-ChildItem workspace/nodes -Name` |
| text across rules / patterns | `bks-schema search "has evidence locator"` | `rg -n 'HAS_EVIDENCE\|SourceLocator' workspace/patterns workspace/rules` | `Select-String -Path workspace/rules/*.md -Pattern 'HAS_EVIDENCE\|SourceLocator'` |
| asserted D6 relationships | `bks-schema find --kind relationship --class asserted --module D6` | `jq -c 'select(.kind=="relationship" and .relClass=="asserted" and .module=="D6") \| .id' workspace/search/index.jsonl` | `Get-Content workspace/search/index.jsonl \| % { $_ \| ConvertFrom-Json } \| ? { $_.kind -eq 'relationship' -and $_.relClass -eq 'asserted' -and $_.module -eq 'D6' } \| select id` |
| creatable types with a property | `bks-schema find --kind node --executor-op node.upsert --property compositionDigest` | `jq -c 'select(.kind=="node" and (.proposalKinds\|index("node.upsert")) and (.properties\|index("compositionDigest"))) \| .id' workspace/search/index.jsonl` | (as above with `-contains`) |
| exclusive episode types | `bks-schema find --kind relationship --exclusive true` | `jq -c 'select(.exclusive==true) \| .id' workspace/search/index.jsonl` | — |
| predicates of a module | `bks-schema find --kind predicate --module D2 --predicate-kind relationship` | `rg -l '^module: "D2"' workspace/predicates` | — |
| a catalog question | `bks-schema pattern --question Q-D6-01 --json` | `jq '.questions[] \| select(.id=="Q-D6-01")' workspace/patterns/catalog.json` | — |
| old v1 / legacy name | `bks-schema get node:Mention` · `bks-schema get legacy:Product` | `jq -r 'select(.id=="node:Mention") \| .summary' workspace/search/index.jsonl` | — |

Front matter is greppable: every card starts with `id`, `kind`, `module`, `schemaReleaseDigest`, `sourceRefs`,
`aliases`, `capabilities`, `cardDigest`. `search/index.jsonl` is the machine authority; the front matter is the same
row projected onto the card.

## Read part of a card

```bash
bks-schema get node:LabelVersion --section identity
bks-schema get rel:HAS_LABEL_VERSION --section "temporal rule"
bks-schema get node:LabelVersion --field executorOps
sed -n '/^## Outgoing relationships/,/^## Incoming/p' workspace/nodes/LabelVersion.md
```

```powershell
$t = Get-Content workspace/nodes/LabelVersion.md -Raw; ($t -split "`n## ")[1]
```

## Structured discovery (search + bounded path expansion)

One command for step 5 of the procedure:

1. path intent: your query names two or more node types (exact type names or registered aliases such as
   "label version"), or says "from … to", "between", "path" or "trace". Without path intent you get the plain top 10
   search cards (`expansion.pathIntent: "none"`);
2. endpoints: the node types named in the query, in query order, when there are at least two; otherwise the distinct
   node types among the top 5 search cards; at most 3;
3. base: keep the top `10 − 2 × (shortest legal path length)` search cards, clamped to 4–7 (5 when no path is known);
   `--base-limit N` overrides;
4. `path a b --max-hops 3 --limit 2 --joins fill` for every endpoint pair (1-2, 1-3, 2-3); paths are ranked with the
   fewest hops against the stored direction first, then length, then typed before joins (each path reports
   `againstDirection`, each hop its `traversal`);
5. append the relationship (and predicate-join) cards of all those paths first, then the node cards on them,
   deduplicated; then, while slots remain, the predicate / assessment cards those relationship cards reference;
6. stop at 10 candidates. `route` says where each came from (`search`, `path` with its call, `reference` with its
   relationship card) and `calls` lists the exact commands, so you can rerun any step yourself.

```bash
bks-schema search "trace a lab test to the biomarker it measures" --expand paths
bks-schema search "trace a lab test to the biomarker it measures" --mode structured   # same as --expand paths (structured-hybrid = hybrid + paths); identical to eval --mode structured
bks-schema search "..." --expand paths --base-limit 3 --json | jq '.expansion, .route, .calls'   # more room for path cards
bks-schema search "..." --mode hybrid --expand paths --json                          # same on top of hybrid (degrades to lexical-only when semantic is unavailable)
```

```powershell
$r = bks-schema search "..." --expand paths --json | ConvertFrom-Json; $r.route | Format-Table id, source, via
```

Without path intent, or with fewer than two endpoint node types, nothing is expanded (`expansion.pathRuns` is empty). Paths are
schema possibilities (`instanceClaim: false`), never evidence that instances exist. Evaluation: `bks-schema eval
--tasks <file> --mode structured` (or `structured-hybrid`) scores exactly these 10 candidates.

## Topology and slices

```bash
bks-schema neighbors node:LabelVersion --direction both --depth 1
bks-schema neighbors rel:HAS_SUBJECT --expand            # interface members only when asked
bks-schema path node:Product node:SourceLocator --max-hops 3
bks-schema path Product ChemicalSubstance --via ProductVariant,Package,LabelVersion --joins exclude --max-hops 5
bks-schema slice --tasks ingest-product-label --questions Q-D6-01 --max-tokens 12000 --out "$TMPDIR/slice"
jq '.budget, .closure, (.omissions | length)' "$TMPDIR/slice/slice.json"
```

```powershell
bks-schema slice --tasks ingest-product-label --out $env:TEMP\slice
(Get-Content $env:TEMP\slice\schema-context.json -Raw | ConvertFrom-Json).route
```

Large machine files (`schema-ir.json`, `patterns/catalog.json`, `search/*.json*`) are for `jq` / `ConvertFrom-Json`
queries; do not read them whole into context.

# 02 — Team: assignments, tools, skills, protocol

Eight domain agents run in parallel; one synthesizer runs when all eight packets pass. Each agent owns one or two domains and writes only inside its packet directories. Nothing outside `schema/program/packets/<id>/` is written by a domain agent except `11-open-questions.md` entries that name another owner.

## Assignments

| agent | domains | why paired | briefs |
| --- | --- | --- | --- |
| A1 | K kernel + D10 derived knowledge | The evidence chain and what is derived from it are one design: claims → vetting → missions → reports; subject/object pattern; verification.v1 mapping. A1 publishes the kernel pattern on day one; every other agent depends on it. | `../domains/K-kernel-evidence-provenance.md`, `../domains/D10-derived-knowledge.md` |
| A2 | D1 compounds and ingredients + D12 food and nutrition | What is in things: compounds, forms, materials, foods, preparations, composition. | `../domains/D1-compounds-and-ingredients.md`, `../domains/D12-food-and-nutrition.md` |
| A3 | D2 mechanisms and biology + D4 diagnostics and measurement | Why it might work and how it is measured; the compound → mechanism → biomarker → test path. | `../domains/D2-mechanisms-and-biology.md`, `../domains/D4-diagnostics-and-measurement.md` |
| A4 | D3 clinical and preclinical evidence | Largest domain; alone. Registry histories, administered material, applicability, synthesis. | `../domains/D3-clinical-and-preclinical-evidence.md` |
| A5 | D5 interventions, protocols, safety + the targets vocabulary | What people do, what they must avoid, and the biohacking targets (sleep, strength, brain fitness …) that everything else is "for". | `../domains/D5-interventions-protocols-safety.md` |
| A6 | D6 products and commerce + D7 organizations, people, money | What is sold, by whom, for how much, and who is behind it; the Organization hub split. | `../domains/D6-products-and-commerce.md`, `../domains/D7-organizations-people-money.md` |
| A7 | D8 quality, regulation, IP + D13 frontiers and breakthroughs | The investor lens: is it real, is it lawful, who owns it, what just happened; events and their relationships. | `../domains/D8-quality-regulation-ip.md`, `../domains/D13-frontiers-and-breakthroughs.md` |
| A8 | D9 sources, media, discourse + D11 bio-medical action space | Where claims come from and what tooling can reach them; recommendations by people; the action-space registry assembled from every packet's `08-sources-and-tools.md`. | `../domains/D9-sources-media-discourse.md`, `../domains/D11-biomedical-action-space.md` |
| S | synthesis | Runs after A1–A8 pass `packet-check`. See `03-SYNTHESIS.md`. | |

## Tool stack (required; record use in `08-sources-and-tools.md`)

Prefer the agent skills with their CLIs over remote MCP tools; both read keys from the repo `.env` (`TAVILY_API_KEY`, `FIRECRAWL_API_KEY`, `EXA_API_KEY`, `EDGAR_IDENTITY`). MCP servers for this repo are declared in `.mcp.json` (project scope, picked up by Claude Code in any worktree).

| need | tool | notes |
| --- | --- | --- |
| web search, extract, map, crawl, research | Tavily skills `tavily-search`, `tavily-extract`, `tavily-map`, `tavily-crawl`, `tavily-research` (CLI `tvly`, see `tavily-cli` for status) | `tvly … --client-name "cursor plugin" --json`; `tvly --status` must show authenticated. |
| scrape, search, crawl, change tracking, research papers | Firecrawl skills `firecrawl`, `firecrawl-search`, `firecrawl-scrape`, `firecrawl-map`, `firecrawl-crawl`, `firecrawl-monitor`, `firecrawl-research-papers`, `firecrawl-research-index`, `firecrawl-deep-research`, `firecrawl-parse` (CLI `firecrawl`) | `firecrawl --status` must show authenticated. Change tracking for pages that version in place (protocols, labels, listings). |
| literature | `pubmed` MCP (`.mcp.json`), Firecrawl research index, bioRxiv where connected | Record PMID/DOI/PMCID for every paper cited. |
| trials | `clinicaltrialsgov` MCP (`.mcp.json`) | Record NCT ids; for version history use the ClinicalTrials.gov v2 API history endpoints directly. |
| compounds | `pubchem` MCP (`.mcp.json`), GSRS/UNII, DSLD, openFDA public APIs by HTTP | Note auth and rate limits as readiness findings. |
| filings, financings, 8-Ks | `edgartools` MCP (`.mcp.json`; needs `EDGAR_IDENTITY`) | For D7, D13. |
| codes and registries | ICD-10 and NPI where connected; otherwise public APIs by HTTP | |
| browser fallback | Vercel agent-browser, or the built-in browser / computer control | Only when the CLIs cannot fetch; every use is a readiness finding for D11. |
| schema tooling | `pnpm schema:map`, `node packages/schema-workspace/dist/cli.js map --sdl <file> --out <file>`, `node scripts/packet-check.mjs <id>`, `node scripts/packet-skeleton.mjs <id>` | Map your module alone to see its own pairs and seams. |
| executable size (synthesizer; agents optional) | `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema <abs path>` then `node scripts/schema-size.mjs <that file> --ir <ir> --out <report>` | The print needs the kernel merged in; agents estimate from pairs, the synthesizer measures. |

## Skills to load (in `.agents/skills/`)

`neo4j-modeling-skill` (every agent, before SDL), `neo4j-graphql-skill` (directive syntax, v7 filters, `@cypher`), `neo4j-gds-skill` and `neo4j-vector-index-skill` (A1, A3, A8 and anyone proposing a GDS or vector pattern), `neo4j-cypher-skill` (query shapes), `biotech-schema-explore` (navigating the current workspace), `biotech-kg-ingest` (intent shape for fixtures). Research: the `tavily-*` and `firecrawl*` skills listed in the tool stack (all installed in `.agents/skills/`).

## Reading order for every agent

1. `00-DIRECTIVE.md` (this packet), then `01-PACKET-CONTRACT.md`, then your brief(s) in `../domains/`.
2. `../PLAN.md` sections 1, 3 and 6.
3. `workspace/START_HERE.md`, your fragments' pages under `workspace/fragments/`, and your domain's section in `../schema-map.md` (`grep -n "^## Domain" schema/program/schema-map.md` to find it).
4. The open questions that touch your domain in `biotech-meta/docs/schema/OPEN-QUESTIONS.md` and the competency questions in `biotech-meta/docs/schema/ontology-lab/competency-questions.md`.
5. A1 only: `docs/architecture/0003-*.md`, `0004-*.md`, and `ai-engineer-knowledge-services/docs/verification/README.md` plus `packages/contracts/src/verification/model.ts`.

## Protocol

- **Worktree.** `git worktree add ../biotech-knowledge-services-<agent> -b ft/schema-<agent> main` from the repo root (the program packet is committed on `main`), then `pnpm install && pnpm build` inside it, and copy the repo `.env` into the worktree (it is git-ignored and carries the research keys). Do not touch the primary checkout; it carries uncommitted owner work. Commit on your branch; do not push or merge.
- **Claim** (first message in your run log `../packets/<id>/RUNLOG.md`): agent, domains, worktree, base commit, planned fixtures.
- **Day-one dependency.** A1 publishes `packets/K/09-reasoning.md` section "Kernel pattern for subject, object, identifier and mention edges" plus `packets/K/04-schema-proposal.graphql` before anything else. Domain agents may draft against the placeholder interface `Subjectable` and must rebase on A1's pattern before handoff.
- **Shared vocabularies.** A5 publishes the targets vocabulary (`packets/D5/vocab-targets.yaml`) and A7 the frontiers vocabulary (`packets/D13/vocab-frontiers.yaml`) by mid-run; other agents reference them in `10-seams.yaml` under `sharedVocabularies`.
- **Cross-domain questions.** If your question needs another domain's type, write the seam in `10-seams.yaml` and the question in your `02-questions.md`; do not model their type.
- **Handoff** (last entry in `RUNLOG.md`): `packet-check` output, counts versus budget, the fixtures list, the open questions you are handing to the owner, the files changed. Then stop.
- **Stop conditions.** Stop and record when: a budget cannot be met without dropping an essential question (record both options); a source is unreachable by every tool (record the readiness finding); the kernel pattern is not yet published and you have reached the SDL step (draft against `Subjectable`, continue).

## Waves inside the run

| wave | who | what |
| --- | --- | --- |
| 0 | A1 | kernel pattern and kernel module draft published; verification.v1 mapping confirmed |
| 0 | A5, A7 | targets and frontiers vocabularies published |
| 1 | A1–A8 | ecosystem survey, questions, retrieval patterns (files 01–03) |
| 2 | A1–A8 | module SDL, registers, fixtures, sources, reasoning, seams (files 04–11); rebase on the kernel pattern; `packet-check` green |
| 3 | S | synthesis per `03-SYNTHESIS.md` |
| 4 | owner | review on measurements and fixtures; decisions to `../decisions/` |

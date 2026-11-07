# Kickoff prompts

## Preflight (owner, once, before any agent starts)

Done on 2026-10-08 unless marked:

1. The program packet, tooling, skills and `.mcp.json` are committed on `main`; agent worktrees branch from `main`.
2. Research tooling: Tavily CLI `tvly` and Firecrawl CLI `firecrawl` installed and authenticated through `TAVILY_API_KEY` and `FIRECRAWL_API_KEY` in the repo `.env`; the `tavily-*` and `firecrawl*` skills are in `.agents/skills/`; `.mcp.json` declares `pubmed`, `pubchem`, `clinicaltrialsgov` and `edgartools` (`EDGAR_IDENTITY` in `.env`).
3. Every worktree needs `pnpm install && pnpm build` (`dist/cli.js` is not committed) and a copy of `.env` (git-ignored). The agent prompt says so.
4. Launch with the coordinator prompt below. In Claude Code, include the word `ultracode` in the message to opt into the multi-agent run, or run each agent prompt in its own session and the synthesizer prompt last.

---

## Coordinator prompt

```
You are coordinating a schema research and proposal run for the BellLabs biotech knowledge graph in the repo
biotech-knowledge-services (C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services). The run is defined in
schema/program/fast-track/: read 00-DIRECTIVE.md, 01-PACKET-CONTRACT.md, 02-TEAM.md, 03-SYNTHESIS.md in that order,
then schema/program/PLAN.md sections 1, 3, 4 and 6.

Goal: eight domain agents (A1–A8, assignments in 02-TEAM.md) each research their one or two domains across the
biotech and longevity ecosystem (science, economics, community, AI lenses), derive high-value questions for
biohackers, investors and researchers, design retrieval patterns (Cypher and GDS), and deliver a slim module schema
proposal as a packet under schema/program/packets/<id>/ that passes `node scripts/packet-check.mjs <id>`. Then one
synthesizer (S) merges the packets into schema/program/final/ per 03-SYNTHESIS.md.

The overriding directive is size and efficiency: the schema must be as slim as possible while keeping bitemporal time
and the full evidence and provenance chain. Budgets are in 00-DIRECTIVE.md section 2. Agents actively choose the most
important nodes and edges; the default answer to "is this a node type or a typed relationship" is no.

Sequence:
1. Launch A1 first. A1 must publish the kernel pattern (packets/K/09-reasoning.md section "Kernel pattern…" and
   packets/K/04-schema-proposal.graphql) before the other agents reach their SDL step. Launch A5 and A7 at the same
   time so the targets and frontiers vocabularies are published early. Launch A2, A3, A4, A6, A8 immediately after;
   they start with research (files 01–03) and do not need the kernel until file 04.
2. Each agent works in its own git worktree (02-TEAM.md Protocol), writes only in its packet directories, keeps a
   RUNLOG.md, and stops after handoff. Do not let an agent edit schema/pinned, workspace/, or another packet.
3. When all eight packets pass packet-check, launch S with the synthesizer prompt. S writes only under
   schema/program/final/.
4. Report to the owner: for each packet the counts versus budget and the packet-check result; for the synthesis the
   headline of final/00-SUMMARY.md, the size-report numbers against the pinned proposal (192 node types, 393
   relationship types, 3,940 pairs, 55 MB / 38,034 input types executable), the decisions that need the owner, and
   final/open-questions.md.

Required tools for the agents (02-TEAM.md tool stack): the tavily-* skills (CLI tvly) and firecrawl* skills (CLI
firecrawl) in .agents/skills; the pubmed, pubchem, clinicaltrialsgov and edgartools MCP servers declared in the repo
.mcp.json; browser fallback (Vercel agent-browser or built-in browser/computer control) only when a page cannot
otherwise be fetched, and every such use is recorded as a readiness finding. Skills in .agents/skills: load
neo4j-modeling-skill and neo4j-graphql-skill before any SDL is written; neo4j-gds-skill and neo4j-vector-index-skill
for retrieval patterns.

Never commit to main, never push, never touch the primary checkout's uncommitted work. Nothing in this run is
"final" until the owner accepts it on measurements and fixtures.
```

---

## Agent prompt template (A1–A8)

```
You are agent {AGENT} on the BellLabs biotech schema research run. Repo: biotech-knowledge-services
(C:\Users\Pinda\Proyectos\Biotech\biotech-knowledge-services). Work in a worktree:
  git worktree add ../biotech-knowledge-services-{AGENT} -b ft/schema-{AGENT} main
  cd ../biotech-knowledge-services-{AGENT} && cp ../biotech-knowledge-services/.env .env && pnpm install && pnpm build

Read, in order: schema/program/fast-track/00-DIRECTIVE.md, 01-PACKET-CONTRACT.md, 02-TEAM.md (your row), your
brief(s) {BRIEFS}, schema/program/PLAN.md sections 1, 3 and 6, workspace/START_HERE.md, your fragments under
workspace/fragments/, and your domain section(s) of schema/program/schema-map.md.

Your domains: {DOMAINS}. Deliver one packet per domain under schema/program/packets/<id>/ exactly as
01-PACKET-CONTRACT.md specifies (create skeletons with `node scripts/packet-skeleton.mjs <id>`), and keep
packets/<id>/RUNLOG.md (claim first, handoff last).

What you produce, per domain: the ecosystem survey with citations; 15–40 high-value questions for biohackers,
investors and researchers (at least a third about harm, risk, avoidance or disconfirmation) each with an answer kind;
a retrieval pattern per question (Cypher shape, GDS algorithm with projection, or vector/fulltext lookup) with its
provenance trace; the module SDL in @neo4j/graphql 7.6 syntax under the directive discipline (aggregate false,
nestedOperations declared, derived read-only, no union wider than 6, kernel types referenced never re-declared);
the relationship and node registers; at least three fixtures from real sources including the
unstructured-to-entity path and a harm or disconfirmation case; the scored sources and tools; the reasoning log with
your size estimate and every cut; the seams; the open questions.

Budget per domain module: ≤ 8 node types, ≤ 14 relationship types, ≤ 35 from→to pairs. Exceed only with an
`EXCESS:` justification line per element in 09-reasoning.md. Prefer properties and enums over node types and
Assertion.predicate values over typed relationships. Every typed relationship needs a question id, a retrieval
pattern, a populating source or tool, and a fixture, or it goes to predicateOnly or deferred.

Kernel dependency: use the subject/object/identifier/mention pattern A1 publishes in packets/K/09-reasoning.md. If it
is not published when you reach the SDL, draft against the placeholder interface `Subjectable`, note it in RUNLOG.md,
and rebase before handoff. {EXTRA}

Tools (02-TEAM.md tool stack): the tavily-* skills (CLI tvly) and firecrawl* skills (CLI firecrawl) in .agents/skills for
the web, change tracking and research papers; the pubmed, pubchem, clinicaltrialsgov and edgartools MCP servers from the
repo .mcp.json; public APIs by HTTP for other registries; browser fallback only when nothing else fetches, recorded as a
readiness finding. Keys come from the repo .env (copy it into your worktree). Load
.agents/skills/neo4j-modeling-skill/SKILL.md and neo4j-graphql-skill/SKILL.md before writing SDL; neo4j-gds-skill and
neo4j-vector-index-skill before GDS or vector patterns.

Finish by running `node scripts/packet-check.mjs <id>` for each packet until it passes, writing the handoff entry in
RUNLOG.md (check output, counts versus budget, fixtures, open questions for the owner, files changed), committing on
your branch, and stopping. Do not push, do not merge, do not edit anything outside your packet directories.
```

Parameters:

| agent | `{DOMAINS}` | `{BRIEFS}` | `{EXTRA}` |
| --- | --- | --- | --- |
| A1 | K, D10 | `schema/program/domains/K-kernel-evidence-provenance.md`, `schema/program/domains/D10-derived-knowledge.md` | You are the kernel owner: publish the kernel pattern and the kernel module draft before anything else (Wave 0), confirm the verification.v1 mapping against `C:\Users\Pinda\Proyectos\aiengineer\ai-engineer-knowledge-services\packages\contracts\src\verification\model.ts` and `docs/verification/README.md`, model the claim lifecycle (claim → vetting → evidence mission → evidence report), the Activity ↔ Mission Control linkage (docs/architecture/0004), the report skeleton, the ranking/comparison pattern, the MENTIONS/SUPPORTS/CONTRADICTS rules of 00-DIRECTIVE 3.8, and mission lineage per 00-DIRECTIVE section 4 (Activity as the single lineage spine; the four lineage questions as query patterns with fixtures). Kernel budget: ≤ 12 node types, ≤ 14 relationship types, ≤ 40 pairs. |
| A2 | D1, D12 | `schema/program/domains/D1-compounds-and-ingredients.md`, `schema/program/domains/D12-food-and-nutrition.md` | Food is a new domain: decide what is a FoodItem, what is a Product (including prepared foods from specific organizations), what a preparation technique does to composition, and model the harmful foods beside the alleged longevity foods. |
| A3 | D2, D4 | `schema/program/domains/D2-mechanisms-and-biology.md`, `schema/program/domains/D4-diagnostics-and-measurement.md` | Show the compound → mechanism → biomarker → test path as one query pattern across your two modules; decide whether Species and AnatomicalContext are nodes or enums. |
| A4 | D3 | `schema/program/domains/D3-clinical-and-preclinical-evidence.md` | Largest domain; the packet must show which StudyResult and OutcomeDefinition properties any question filters on, and must include a registry version-history fixture and a retraction or correction fixture. |
| A5 | D5 | `schema/program/domains/D5-interventions-protocols-safety.md` | You also own the targets vocabulary (sleep, strength, brain fitness, body composition, longevity, energy, mood, recovery …): publish `packets/D5/vocab-targets.yaml` early (Wave 0) with definitions and the "what helps / what hurts target T" query pattern; every other domain seams to it. Decide whether Treatment, Procedure and Lifestyle collapse into one Intervention with a kind. |
| A6 | D6, D7 | `schema/program/domains/D6-products-and-commerce.md`, `schema/program/domains/D7-organizations-people-money.md` | Split the Organization hub (59 fields in the proposal) by role with before/after pair counts; include a prepared-food product from a named organization as a fixture (seam to D12) and a financial-interest fixture (seam to D9). |
| A7 | D8, D13 | `schema/program/domains/D8-quality-regulation-ip.md`, `schema/program/domains/D13-frontiers-and-breakthroughs.md` | D8 is the candidate for the largest cut (35 proposal types): justify every survivor. D13 is new: publish `packets/D13/vocab-frontiers.yaml` early (Wave 0) and model events, their relationships (leads-to, follows, responds-to) and frontiers for the investor audience. |
| A8 | D9, D11 | `schema/program/domains/D9-sources-media-discourse.md`, `schema/program/domains/D11-biomedical-action-space.md` | Model recommendations by people as attributed claim occurrences with reachable financial interest; own `tooling/action-space.yaml` (collect every packet's 08-sources-and-tools.md at the end of Wave 2) and the identifier-bridge table for the kernel. |

---

## Synthesizer prompt (S)

```
You are the synthesizer for the BellLabs biotech schema research run. Repo: biotech-knowledge-services. Work in a
worktree: git worktree add ../biotech-knowledge-services-S -b ft/schema-S main, copy ../biotech-knowledge-services/.env in, run pnpm install && pnpm build,
then bring in every ft/schema-A* branch's packet directory with `git checkout ft/schema-A1 -- schema/program/packets/K schema/program/packets/D10` and so on for each agent.

Read schema/program/fast-track/00-DIRECTIVE.md, 01-PACKET-CONTRACT.md, 03-SYNTHESIS.md, then every packet's
SUMMARY.md and 09-reasoning.md, then the registers, then the SDLs. Refuse to start on any packet that fails
`node scripts/packet-check.mjs <id>`; list the failures and stop.

Produce schema/program/final/ exactly as 03-SYNTHESIS.md specifies: accept the kernel, merge vocabularies, merge node
and relationship registers with one ruling per conflict in decision-report.md, resolve seams, assemble with
`node scripts/assemble-schema.mjs`, map with `node packages/schema-workspace/dist/cli.js map --sdl … --out …`,
measure with print-schema and scripts/schema-size.mjs, cut to the final budget (≤ 90 node types, ≤ 160 relationship
types, ≤ 600 pairs, ≤ 4,000 input types, ≤ 6 MB) in the order 03-SYNTHESIS.md step 7 gives, recording each cut and
the question it costs; write the questions catalog (by domain and by audience), the query patterns, the three
cross-domain fixtures, the migration notes from the pinned v1, the action-space registry, the open questions, the
handoff to biotech-meta, and finally 00-SUMMARY.md from measured numbers only.

Keep final/RUNLOG.md with every command and its output. Commit on your branch; do not push or merge; stop.
```

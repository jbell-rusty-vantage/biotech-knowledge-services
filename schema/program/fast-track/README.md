# Fast track: research → schema proposal run

The executable packet for the agent-team run that produces the slim schema candidate. Opened 2026-10-08.

| read | file | why |
| --- | --- | --- |
| 1 | `00-DIRECTIVE.md` | The owner's directive: mission, the slimming priority and budgets, the ten clarified concepts (targets, harm, food, claim lifecycle, ranking, derived knowledge, frontiers, unstructured-to-entity, recommendations, verification), Mission Control linkage, what "done" means |
| 2 | `01-PACKET-CONTRACT.md` | What every domain agent delivers, file by file, with the research and modeling standards and the acceptance checks |
| 3 | `02-TEAM.md` | Assignments (eight agents, one or two domains each, plus a synthesizer), tool stack, skills, reading order, protocol, waves |
| 4 | `03-SYNTHESIS.md` | What the synthesizer produces and how it merges, cuts to budget, measures and hands off |
| 5 | `KICKOFF.md` | The coordinator prompt, the agent prompt template with per-agent parameters, the synthesizer prompt |

Supporting: `../PLAN.md` (the program), `../domains/` (one brief per domain), `../schema-map.md` and `../size-report.md` (the baseline), `../packets/` (agent output), `../final/` (synthesizer output), `../decisions/` (owner decisions).

Scripts: `node scripts/packet-skeleton.mjs <id>` creates a packet skeleton; `node scripts/packet-check.mjs <id>` validates it; `node scripts/assemble-schema.mjs` assembles `final/schema/*.graphql`; `node packages/schema-workspace/dist/cli.js map --sdl <file> --out <file>` maps any SDL.

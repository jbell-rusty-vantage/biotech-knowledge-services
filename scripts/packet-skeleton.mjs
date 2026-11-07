#!/usr/bin/env node
/**
 * Creates the packet skeleton for one domain under schema/program/packets/<id>/ (see
 * schema/program/fast-track/01-PACKET-CONTRACT.md). Existing files are never overwritten.
 *
 *   node scripts/packet-skeleton.mjs D6
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const id = process.argv[2];
if (!id || !/^(K|D\d{1,2})$/.test(id)) {
  console.error("usage: node scripts/packet-skeleton.mjs <K|D1..D13>");
  process.exit(1);
}
const root = resolve("schema/program/packets", id);
mkdirSync(resolve(root, "07-fixtures", "fixture-01"), { recursive: true });

const files = {
  "RUNLOG.md": `# Run log — packet ${id}\n\n## Claim\n\n- agent:\n- domains:\n- worktree:\n- base commit:\n- planned fixtures:\n\n## Entries\n\n## Handoff\n\n- packet-check:\n- counts vs budget:\n- fixtures:\n- open questions for the owner:\n- files changed:\n`,
  "SUMMARY.md": `# ${id} — summary\n\n<!-- ≤ 60 lines, written last: what the domain is; headline counts (node types, relationship types, pairs); five highest-value questions; three biggest cuts; three biggest risks. -->\n`,
  "01-ecosystem.md": `# ${id} — ecosystem survey\n\n<!-- Organizations, processes, operations, artifacts, capturable sources, agent-readiness; four lenses. Every factual claim: URL · title · retrieval date. -->\n`,
  "02-questions.md": `# ${id} — high-value questions\n\n| id | question | audience | value | polarity | answer kind | answer shape | sources | fixture |\n| --- | --- | --- | ---: | --- | --- | --- | --- | --- |\n| Q-${id}-01 | | biohacker | 1 | benefit | retrieved | | | no |\n`,
  "03-retrieval-patterns.md": `# ${id} — retrieval patterns\n\n## Q-${id}-01\n\n- kind: cypher | gds | vector | fulltext\n- pattern:\n\n\`\`\`cypher\n\`\`\`\n\n- trace (how the answer cites locators):\n- bitemporal episode needed on:\n`,
  "04-schema-proposal.graphql": `# ---- fragment ${id} ----\n# Module ${id}. Kernel types are referenced, never re-declared. Every @relationship: aggregate: false, nestedOperations declared.\n`,
  "05-relationship-register.yaml": `version: 1\nmodule: ${id}\nrelationships:\n  # - type: HAS_X\n  #   class: structural | asserted | derived\n  #   from: TypeA\n  #   to: TypeB\n  #   edgeProperties: AssertedEdgeProperties | null\n  #   cardinality: one_or_more\n  #   temporal: episode | recorded-only\n  #   questions: [Q-${id}-01]\n  #   pattern: 03#Q-${id}-01\n  #   populatedBy: [tool-id]\n  #   fixture: 07-fixtures/fixture-01\n  #   nestedOperations: [CONNECT]\n  #   aggregate: false\n  #   rationale: ...\npredicateOnly: []\ndeferred: []\n`,
  "06-node-register.yaml": `version: 1\nmodule: ${id}\nnodes:\n  # - name: TypeA\n  #   uidToken: type-a\n  #   identityKeys: [uid]\n  #   identifierSchemes: []\n  #   whyNode: ...\n  #   filterProperties: []\n  #   otherProperties: 0\n  #   archetype: Entity\n  #   mutations: { create: true, update: true, delete: false }\ndeferred: []\nmergedInto: []\n`,
  "07-fixtures/fixture-01/source.md": `# Fixture 01 — source\n\n- url:\n- title:\n- retrieved:\n- snapshot digest:\n- kind: harm | disconfirmation | unstructured-to-entity | other\n`,
  "07-fixtures/fixture-01/locators.yaml": `locators: []\n`,
  "07-fixtures/fixture-01/assertions.yaml": `assertions: []\n`,
  "07-fixtures/fixture-01/questions.md": `# Fixture 01 — questions answered\n\n- Q-${id}-01: expected answer …\n`,
  "08-sources-and-tools.md": `# ${id} — sources and tools\n\n| id | kind | provider | access | auth | rateLimits | identifiersEmitted | locatorKinds | readiness | gap | priority | exercised |\n| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- |\n`,
  "09-reasoning.md": `# ${id} — reasoning\n\n## Size estimate\n\n- node types:\n- relationship types:\n- from→to pairs:\n- widest union target:\n\n## Decisions (alternatives considered, what was cut and why)\n\n## Bitemporal decision per edge\n\n## Budget excess (one line per element, prefixed EXCESS:)\n\n## Risks\n\n## With twice the budget\n`,
  "10-seams.yaml": `version: 1\nmodule: ${id}\nseams: []\nsharedVocabularies: []\n`,
  "11-open-questions.md": `# ${id} — open questions\n\n<!-- question · evidence that would decide it · owner (owner | kernel | <domain>) -->\n`,
};
let created = 0;
for (const [name, content] of Object.entries(files)) {
  const path = resolve(root, name);
  if (existsSync(path)) continue;
  writeFileSync(path, content, "utf8");
  created++;
}
console.log(`packet ${id}: ${created} files created under ${root}`);

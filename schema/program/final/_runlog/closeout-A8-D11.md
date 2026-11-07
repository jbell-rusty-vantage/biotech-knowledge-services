# Close-out: packet owner A8, packet D11 (pattern lint + TL-04)

Date: 2026-10-09. Worktree: C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-A8 (ft/schema-A8 @ 5b9788a). The edits are uncommitted and limited to schema/program/packets/D11/. The D9 edits in the same worktree belong to the D9 close-out. No SDL change.

## Input

`final/_work/pattern-lint.json` D11: 30 blocks, 30 failing, 30 packetBug, 0 rulingBroken.

| block(s) | packet issue |
|---|---|
| all 30 | `CYPHER 25` prefix |
| Q-D11-16 | aggregation with an implicit grouping key (`npi`) |
| CQ-AX-04, Q-D11-22 | dynamic label in WHERE (`x:$($label)`), which Cypher 5 allows only in MATCH/CREATE/MERGE/SET/REMOVE |
| CQ-AX-14, Q-D11-10 | label `Mention` not declared (the kernel cut it) |
| CQ-PV-04 | `line.quantityBasis` is not on ComponentLineProperties; `'UNSPECIFIED'` is not a QuantityBasis value |

## Edits (A8 schema/program/packets/D11/)

- `03-retrieval-patterns.md`:
  - Removed all 30 `CYPHER 25` lines.
  - CQ-AX-04 now uses `MATCH (x:$($label) {uid: $uid})`. Q-D11-22 now uses `MATCH (n:$(e.label))`.
  - Q-D11-16: `WITH npi, h, collect(CASE WHEN ra IS NULL THEN null ELSE {...} END) AS hypotheses`; the verdict reads `size(hypotheses)`.
  - CQ-AX-14 and Q-D11-10 are rewritten to the K Q-K-13 shape. The span is a SourceLocator that a RESOLUTION Assessment cites with `HAS_EVIDENCE {role:'CONTEXT'}`. The candidates are `ASSESSES`. The licensed edge is `(:Chunk)-[:MENTIONS]->(cand)` with the assessment uid in `derivedFromAssessmentUids`.
  - CQ-PV-04 reads `line.massBasis`, `line.amountBasis` and `ic.massBasis`. `basisRisk` is true when the D1 MassBasis is UNSPECIFIED or null on either side.
  - Conventions and prose: `Mention` removed.
- `07-fixtures/capture-failures-coverage/assertions.yaml` `queries.CQ-AX-04`: same fix (no CYPHER 25, MATCH dynamic label). A diff against the `03` block shows the two are still identical.
- `05-relationship-register.yaml` (line 68), `06-node-register.yaml` (line 50) and `09-reasoning.md` (line 104): "Mention + RESOLUTION Assessment" is replaced by the span-locator form.
- Left as is: the `Mention` node in fixture `nr-chloride-gsrs-identifier-bridge`. It is the FU-03 residual already listed in `final/fixtures/README.md`.
- TL-04, `_notes/action-space/build-action-space.mjs`: new `quoteFlowScalars(doc)`, applied to the action-space document and to the reconciliation block.
  - Inside flow collections it double-quotes every string; flow-map keys that are bare words stay plain.
  - Anywhere in the document it also quotes any string that matches a PyYAML YAML 1.1 implicit resolver: bool, int, float, null, merge, value or timestamp.
  - The hand-written `scoredAt` in `identifier-bridges.yaml` (line 30) is now quoted too, because PyYAML read it as a date.
  - Regenerated `tooling/action-space.yaml` and the `identifier-bridges.yaml` block.

## Commands and key outputs

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D11 --json <scratchpad>/lint-D11.json --md <scratchpad>/lint-D11.md
  → D11: total 30, ok 26, packetBugs 0, rulingBroken 4, cypher25 0, selfCheckDiffs 0
  → rulingBroken (left in packet names): Q-D11-05 (R-42), Q-D11-08 (R-82 DISCLOSES_SUPPORT_FROM / DECLARES_NO_COMPETING_INTEREST),
    Q-D11-19 (R-42), CQ-PV-05 (R-42 pending edit-pattern, prose)
docker exec bks-neo4j-synth cypher-shell … "EXPLAIN MATCH (x:$($label) {uid: $uid}) RETURN x"   → plans on 5.26
node schema/program/packets/D11/_notes/action-space/build-action-space.mjs           → exit 0
node schema/program/packets/D11/_notes/action-space/build-action-space.mjs --check   → exit 0 (summary JSON byte-identical to pre-change --check; scorecard unchanged)
python -I -c "import yaml,sys; yaml.safe_load(open(sys.argv[1],encoding='utf-8'))" …/D11/tooling/action-space.yaml   → exit 0 (before: ParserError line 2931 '(?)' in a flow sequence)
python -I -c "…same…" …/D11/identifier-bridges.yaml                                   → exit 0 (before: ParserError line 557)
deep-equal (JSON, sorted keys): Node-yaml(before) == Node-yaml(after) == PyYAML(after)  → True for action-space.yaml and identifier-bridges.yaml
PyYAML safe_load over every D11 *.yaml (fixtures, registers, seams, tooling)           → all load
node scripts/packet-check.mjs D11                                                       → exit 0 (nodeTypes 1, relationshipTypes 0, pairs 0, questions 30, fixtures 5)
```

The S report `final/_work/pattern-lint.{json,md}` was not overwritten; the per-packet run wrote to the scratchpad. A full linter rerun will show D11 at 0 packetBug.

## Result

30 blocks fixed. Remaining: 0 packetBug and 4 rulingBroken; S writes the final-SDL versions of the rulingBroken blocks. TL-04 is closed for D11. RUNLOG entry: "2026-10-09 — Close-out: pattern lint (A8, D11)".

# Close-out — packet owner A2, packet D1 (pattern lint)

2026-10-09. Worktree `biotech-knowledge-services-A2` (ft/schema-A2, head 6635197), writes under `schema/program/packets/D1/` only; not committed.

Input from `final/_work/pattern-lint.json`: D1 total 36, failing 9, packetBug 6, rulingBroken 3.

| Block | Finding | Fix |
|---|---|---|
| Q-D1-01 (L83) | predicate `MOLECULAR_WEIGHT` not registered in any packet 05 register | registered in D1 `05-relationship-register.yaml` predicateOnly (FIELD Assertion on ChemicalSubstance; D1 registrar per R-52 rule 3, matching `final/vocabularies/predicates.yaml` proposed-new, registrar D1); note added to OQ-D1-16 |
| CQ-ID-04 (L212) | `(Identifier)-[:HAS_IDENTIFIER]->(ChemicalSubstance)` and `->(other)` reversed | `(s)-[l:HAS_IDENTIFIER]->(i:Identifier)`, `(other)-[l2:HAS_IDENTIFIER]->(i)`; R-42 identifier-join stays (rulingBroken, left for S) |
| Q-D1-06 (L228) | two reversed HAS_IDENTIFIER hops | `(x)-[l1:HAS_IDENTIFIER]->(i1:Identifier), (x)-[l2:HAS_IDENTIFIER]->(i2:Identifier)` |
| Q-D1-08 (L307) | `CYPHER 25` prefix; `SEARCH … VECTOR INDEX` syntax error on 5.26; `c.recordedTo` not on D9 Chunk | prefix removed; `CALL db.index.vector.queryNodes('chunk_embedding', 8, $embedding) YIELD node AS c, score`; recordedTo filter dropped (Chunk has no recorded time); SEARCH form kept only as a prose note for 2026.01+ |
| Q-D1-15 (L454) | `(dep:Identifier)-[:HAS_IDENTIFIER]->(t)` reversed | `(t)-[:HAS_IDENTIFIER]->(dep:Identifier)` |
| Q-D1-26 (L661) | UNION branches return different column names; two reversed HAS_IDENTIFIER hops | both branches alias `uid`, `name`, `scientificName`; `(node)-[:HAS_IDENTIFIER]->(id:Identifier)` |

Also: header line now says Neo4j 5.26 / Cypher 5 (was "5/2025+"); Q-D1-16 comment "or D8 Trademark" (prose finding: no Trademark type anywhere) reworded; fixture `07-fixtures/nr-trial-unstructured/assertions.yaml` retrievalPath text "Neo4j SEARCH" -> `db.index.vector.queryNodes`. Grep for reversed HAS_IDENTIFIER / CYPHER 25 / SEARCH in 04 SDL, 05, 06, 09, 10, 11, SUMMARY: none other (10-seams HAS_IDENTIFIER row already says from K.Identifier, direction IN, i.e. the IN field).

rulingBroken blocks left as the packet record (S writes final versions): CQ-PF-01 and CQ-ID-03 (R-30 `declaredNameVerbatim`/`formVerbatim`), CQ-ID-04 (R-42), Q-D1-16 (R-68 MANUFACTURES_MATERIAL -> MANUFACTURES).

Commands and key outputs:

```
node C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S/schema/program/final/_work/lint-packet-patterns.mjs --packets D1 \
  --json <scratchpad>/lint-D1.json --md <scratchpad>/lint-D1.md
  -> "D1: 36 total, 4 failing (0 packetBug, 4 rulingBroken), 2 fragment, 0 gds"; selfCheckDiffs 0; proseFindings 0
node scripts/packet-check.mjs D1   (in A2)
  -> ok: true, exit 0 (nodeTypes 4, relationshipTypes 6, pairs 7, questions 33, fixtures 5)
```

rulingBroken went 3 -> 4 because CQ-ID-04 was packetBug with alsoRulingBroken (R-42); after the direction fix only the ruling issue remains. Per-packet reports written to the session scratchpad, not to `final/_work/pattern-lint.{json,md}`; the coordinator's full re-run refreshes the shared report. SDL unchanged.

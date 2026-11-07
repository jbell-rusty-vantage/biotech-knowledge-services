# Vendor overlay (state before loading a Neo4j vendor skill)

The vendored Neo4j skills under `.agents/skills/_vendor-neo4j/` stay unmodified. For canonical ingestion these release
rules override them (`.agents/skills/skill-routing.json`, overrides OV-CYPHER-VERSION, OV-GENERIC-WRITES,
OV-ELEMENT-ID, OV-CONFIRM-WRITES):

1. **Cypher 5.** The tested baseline is Neo4j 5.26 with Cypher 5. Never prefix `CYPHER 25` or use GQL-only clauses,
   whatever `neo4j-cypher-skill` recommends.
2. **Release-bound schema.** Types, identity rules, predicates and proposal routes come from the pinned release
   (biotech-schema-explore / `biotech-schema-context.v1`), not from `db.schema.*`, live introspection or a
   database-schema.json. The live graph also holds preserved legacy records.
3. **Generic MERGE / CREATE / SET / DELETE / LOAD CSV are not ingestion.** They bypass identity resolution, evidence
   chains, episodes, the writer fence and the effect marker. Canonical writes go typed intent → compiled plan → apply.
   Legacy data is never deleted.
4. **`elementId()` is not identity**; `uid` is (it changes across restore and store copies).
5. **No extra approval gate.** Generic "confirm every write" advice does not add a step to an admitted workflow; the
   admission witness is the authorization.

Load `neo4j-cypher-skill` only to read a plan's compiled statements. Load `neo4j-import-skill` only to design a bulk
adapter (engineering), whose output is still intents.

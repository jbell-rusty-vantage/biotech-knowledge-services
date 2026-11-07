---
id: "rule:compatibility"
kind: "rule"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:compatibility.json","release:rules/compatibility.yaml"]
aliases: ["compatibility","capabilities"]
capabilities: ["get"]
cardDigest: "sha256:bc3c80aa0a134ad1b55c86b4f2613c1311ba4dc83b1bb99ee5f43546ec2029e2"
---
# Compatibility (biotech-schema-v2.2.0)

Machine form: `compatibility.json` of the release (human form `COMPATIBILITY.md`). What this release supports, disables or leaves to another authority. A disabled or unsupported capability is not advertised.

## Capabilities

| capability | status | reason |
| --- | --- | --- |
| `analytics.gds-aga` | **disabled** | OD-22: optional capability; no required DDL or supported template depends on it |
| `chunk.write` | **unsupported** | the live shared Knowledge Services Enterprise constraints on :Chunk (chunkId, chunkKey, index, text NOT NULL; chunkId/chunkKey unique) conflict with the v2 D9 Chunk shape; they belong to another authority and are not dropped or modified; v2 Chunk writes are unsupported in this release |
| `graphql.mutations` | **unsupported** | L2 (OD-02): no Mutation root; writes go through the native executor |
| `legacy.nodes` | **present-excluded** | LegacyV0 / LegacyV0_<Label> nodes, MIGRATED_FROM edges and legacy: qualifiers exist after the migration; they are excluded from the consumer projection, typed reads and catalog templates |
| `vectors.native` | **disabled** | OD-44: ddl/optional.cypher records the text-embedding-3-small/1536/cosine profile; not created or served in this release; the catalog templates that need the vector index (D9/Q-D9-20#vector, QP/P-04a) are unsupported with requires: [vectors.native] and excluded from the supported count |

## Supported matrix

| component | supported |
| --- | --- |
| apoc | APOC Core (required: DateTime projection in @neo4j/graphql reads); APOC Extended not required |
| cypher | Cypher 5 (a CYPHER 5 prefix is allowed; CYPHER 25 is not used) |
| gds | optional (OD-22); no required DDL or supported template depends on it |
| graphqlJs | 16.14.2 |
| neo4j | {"enterpriseEvaluation":"neo4j:5.26-enterprise (NEO4J_ACCEPT_LICENSE_AGREEMENT=eval) for Enterprise-only DDL","target":"Neo4j 5.27-aura Enterprise (Aura database neo4j, S0-INVENTORY)","tested":"Neo4j 5.26.31 community (disposable docker neo4j:5.26-community)"} |
| neo4jGraphql | 7.6.3 |
| node | >=22 |

## Live constraints owned by another authority (not dropped, not modified)

| label | constraints | owner | decision |
| --- | --- | --- | --- |
| `Chunk` | chunkId NOT NULL, chunkKey NOT NULL, index NOT NULL, text NOT NULL, chunkId UNIQUE, chunkKey UNIQUE | shared Knowledge Services ingestion | kept; v2 Chunk writes unsupported |
| `Document` | document_* constraints (live) | shared Knowledge Services ingestion | kept; Document nodes are tag-only LegacyV0 (original label kept) |
| `DocumentTextVersion` | live KS constraints | shared Knowledge Services ingestion | kept; not a v2 label |
| `Segmentation` | live KS constraints | shared Knowledge Services ingestion | kept; not a v2 label |

## Read compatibility

{"changeClass":"minor-additive","ddlDelta":"v2.2.0 against v2.1.0: two RANGE indexes added on the operational label KsIntentMarker (ks_intent_marker_dispatch_id on dispatchId, ks_intent_marker_marker_digest on markerDigest), both idempotent CREATE INDEX IF NOT EXISTS and not writer-required; no constraint changed; ddl.json otherwise differs only in its release binding (releaseId, schemaDigest)","rule":"biotech-schema-v2.2.0 adds one ReportKind enum value (STUDY_APPRAISAL) and one nullable field (useDecisionDigest) on kernel Activity and Assessment; no label, relationship type, required field, field type or existing enum value of v2.1.0 is removed or changed. schemaDigest and schemaReleaseDigest differ from v2.1.0. Readers bound to v2.1.0 keep working against a graph installed at v2.2.0 except that a Report may now carry reportKind STUDY_APPRAISAL, which a reader that switches exhaustively over ReportKind must accept (GraphQL clients treat a new output enum value as dangerous, not breaking); writers and the migrator require an exact schemaReleaseDigest match with the installed KsReleaseMarker, so a v2.1.0 writer refuses a v2.2.0 graph and a release upgrade re-stamps the marker. An incompatible change would require biotech-schema-v3.0.0.","schemaDigestEqualToParent":false,"schemaReleaseDigestRule":"always differs from the parent release (release.json content differs); readers accept either release when its schemaDigest equals theirs and its operational names are a superset; wr…

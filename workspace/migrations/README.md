---
id: "migration:README"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:migration/v1-map.yaml","release:workspace-inputs/aliases.yaml"]
aliases: ["readme","v1 -> v2 migration navigation"]
capabilities: ["get"]
cardDigest: "sha256:623ee9759597a69f9546d71b20adc861d52e2788148652ec90e961750387f3b5"
---
# v1 -> v2 migration navigation

Scope: Policy for any v1-proposal-shaped import (pinned final_biotech_schema_proposal.graphql, 192 node types / 393 relationship types). The live Aura graph is NOT v1-shaped: it is the legacy biotech-kg schema (S0-INVENTORY section 4: 19 labels, 25 relationship types), whose dispositions are migration/legacy-map.yaml (owner S8). This file is navigation and policy, never an execution script; S8 executes migrations.

Old v1 workspace ids (`node:Mention`, `frag:W04`, `rel:SELLS_PRODUCT`, ...) are search records of kind `alias` in `search/index.jsonl`: `bks-schema get node:Mention` answers with the disposition, the v2 targets (`to`) and related live ids (`seeAlso`). Kinds: kept 217, merged 245, removed 453, renamed 19, split 9 (`workspace-inputs/aliases.yaml`).

## Disposition legend (`migration/v1-map.yaml`)

| disposition | meaning |
| --- | --- |
| `unchanged` | same name and meaning in v2 |
| `kept` | same name in v2 (properties or class may change; see changes) |
| `kept-changed` | same name in v2 with changed values or members |
| `renamed` | renamed to the v2 target |
| `merged` | folded into the v2 target type(s) |
| `replaced` | replaced by the named v2 construct |
| `folded` | no node; its meaning is a property, qualifier or locator on another record |
| `retired` | deliberately not carried (deferred / cut by a ruling); no silent substitute |
| `predicate-only` | no typed edge; an Assertion with the named predicate |
| `carried-by-pattern` | no typed edge; the meaning is carried by the listed kernel pattern edges |
| `unmapped` | no register or ruling row; handled by DECISIONS (see unmappedEdges) |

## Counts

| v1 element | dispositions |
| --- | --- |
| nodeTypes | kept 49, merged 119, retired 8, renamed 3, folded 13 |
| relationshipTypes | merged 111, unmapped 7, retired 114, kept 50, predicate-only 30, carried-by-pattern 66, renamed 15 |

## Pages

- [v1 node types](v1-node-types.md)
- [v1 relationship types](v1-relationship-types.md)
- [v1 enums](v1-enums.md)
- [v1 unions, interfaces, edge-property types and properties](v1-other.md)
- [Seven unmapped v1 edges](unmapped-edges.md)
- [v1 workspace ids (domains, fragments, tasks, terms)](navigation-aliases.md)
- [Live legacy graph to v2 navigation](legacy-map.md)
- [Operational names (not domain ontology)](operational-names.md)

## The live legacy graph

The live Aura graph is the legacy biotech-kg schema, not v1-shaped. Its map is `migration/legacy-map.yaml` (status `candidate`, frozen in this release); see [legacy-map](legacy-map.md). Migration-only names (`LegacyV0*`, `MIGRATED_FROM`, `legacy:` qualifiers, `Ks*` markers) are operational, not ontology: [operational names](operational-names.md).

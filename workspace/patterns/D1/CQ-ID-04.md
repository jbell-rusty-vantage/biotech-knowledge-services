---
id: "pattern:D1/CQ-ID-04"
kind: "pattern"
module: "D1"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D1/CQ-ID-04"]
aliases: ["d1/cq-id-04","CQ-ID-04"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:dd508c0d4d59c0c0c1d8dfe0b1f4028e2911f08e0d5a281ed549719220da9c48"
---
# Pattern D1/CQ-ID-04

| | |
| --- | --- |
| id | `pattern:D1/CQ-ID-04` |
| module | [D1](../../modules/D1.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-ID-04` ([D1 question set](../questions/D1.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:d57a736d80261f1fcff7e2a412ef1673be6c02abd95132a61314048a21e14984` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `assessment_kind`, `identifier_key`, `identifier_scheme_value`, `uid_Assertion`, `uid_ChemicalSubstance`, `uid_exists_Assertion`, `uid_exists_ChemicalSubstance`, `uid_type_Assertion`, `uid_type_ChemicalSubstance` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-ID-04
// @param rt:datetime
// @param vt:datetime
MATCH (s:ChemicalSubstance {uid: $sUid})
MATCH (s)-[l:HAS_IDENTIFIER]->(i:Identifier)            // kernel: Subjectable -> Identifier (Identifier.identifies is IN), IdentifierLinkProperties episode
WHERE l.recordedFrom <= $rt AND (l.recordedTo IS NULL OR l.recordedTo > $rt)
  AND (l.validFrom IS NULL OR l.validFrom <= $vt) AND (l.validTo IS NULL OR l.validTo > $vt)
// R-42: i identifies s only. A disagreement is the same (scheme, normalized value) from another issuer, held by another record:
// two Identifier nodes compared by value, reported for review, never identity.
CALL (s, i) {
  OPTIONAL MATCH (other)-[ol:HAS_IDENTIFIER]->(oi:Identifier)
  WHERE oi.scheme = i.scheme AND oi.value = i.value AND oi.issuer <> i.issuer AND other <> s AND ol.recordedTo IS NULL
  RETURN collect(DISTINCT CASE WHEN oi IS NULL THEN null ELSE
           {holder: other.uid, holderKind: [lb IN labels(other) WHERE lb <> 'Entity'][0], issuer: oi.issuer, link: ol.assertionUid} END) AS sameValueElsewhere
}
// TRACE over the identifier link assertion: the authority record and snapshot that assign i to s
CALL (l) {
  OPTIONAL MATCH (ta:Assertion {uid: l.assertionUid})
  OPTIONAL MATCH (ta)-[tev:HAS_EVIDENCE]->(tloc:SourceLocator)<-[:HAS_LOCATOR]-(tsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(tsrc:Source)
  OPTIONAL MATCH (ta)-[:ASSERTED_BY]->(twho)
  OPTIONAL MATCH (tadj:Adjudication)-[:ASSESSES]->(ta) WHERE tadj.recordedTo IS NULL
  RETURN collect(DISTINCT CASE WHEN ta IS NULL THEN null ELSE
           {assertion: ta.uid, status: ta.status, asserter: twho.uid, role: tev.role, selectorKind: tloc.selectorKind, exact: tloc.exact,
            snapshot: tsnap.uid, contentHash: tsnap.contentHash, retrievedAt: tsnap.retrievedAt, source: tsrc.canonicalUri,
            adjudicationKind: tadj.adjudicationKind, verdict: tadj.verdict} END) AS authority
}
WITH s, collect({scheme: i.scheme, issuer: i.issuer, value: i.value, normalizationRule: i.normalizationRule, isPrimary: l.isPrimary,
                 link: l.assertionUid, validFrom: l.validFrom, authority: authority, sameValueElsewhere: sameValueElsewhere}) AS identifiers
// RESOLUTION / EQUIVALENCE judgments about s (rejected or disputed matches; R-42 rules.bridges)
CALL (s) {
  OPTIONAL MATCH (asmt:Assessment)-[:ASSESSES]->(s)
  WHERE asmt.assessmentKind IN ['RESOLUTION', 'EQUIVALENCE'] AND asmt.recordedTo IS NULL
  RETURN collect(DISTINCT asmt {.uid, .assessmentKind, .assessmentSubkind, .verdict, .status}) AS judgments
}
RETURN s.uid AS substance, s.name AS name, identifiers, judgments
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `rt` | string (DateTime) |  | @param hint |
| `sUid` | string | `^hu:` | uid lookup |
| `vt` | string (DateTime) |  | @param hint |

## Output contract

Columns: `substance`, `name`, `identifiers`, `judgments`

## Temporal notes

- bitemporal episode needed on: kernel HAS_IDENTIFIER (already an episode).

## Evidence and provenance notes

- trace: `authority` per identifier gives the kernel chain of the HAS_IDENTIFIER Assertion (GSRS `codes[]` JSON_POINTER; PubChem property record; DSLD form `uniiCode`). Each `judgments` entry is an Assessment with its own `HAS_EVIDENCE` locators. `sameValueElsewhere.link` is the other holder's link Assertion, to TRACE on demand.

## Notes

- **Ruling: R-42.** One (scheme, issuer, normalized value) identifies at most one Subjectable, and the executor enforces it (`vocabularies/identifier-schemes.yaml` `rules.uniqueness`; EX-01). Cross-type joins through a shared Identifier are not a modeling pattern. The same (scheme, value) from two issuers is two Identifiers and never establishes identity (`rules.identity`). A bridge or match that B…
- **How the question is answered now:** in full, with one narrowing. The packet's `alsoAssignedTo` column (same Identifier node on another record) cannot occur under R-42 and is not returned. Same-scheme competing values *on s itself* stay with Q-D1-06. No open question is needed: R-42 and identifier-schemes `rules.identity` / `rules.bridges` decide it.

## Source

- `release:query-catalog/catalog.json#D1/CQ-ID-04` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D1/CQ-ID-04 --json`)

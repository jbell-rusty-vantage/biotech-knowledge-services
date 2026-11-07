---
id: "pattern:D8/CQ-MF-01"
kind: "pattern"
module: "D8"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D8/CQ-MF-01"]
aliases: ["d8/cq-mf-01","CQ-MF-01"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:0331c29ee36fb1f9c95b5afa168d58b4a588e815b78c393caa41b200e3fd3f1e"
---
# Pattern D8/CQ-MF-01

| | |
| --- | --- |
| id | `pattern:D8/CQ-MF-01` |
| module | [D8](../../modules/D8.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-MF-01` ([D7 question set](../questions/D7.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:5a7e1d397220cf2627bb8862aafb4e21d1a660f54e92afab0913152bd9179ca5` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `assertion_predicate`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// @id CQ-MF-01
// $uid = X (a D6 Product or a D1 IngredientMaterial); $V = valid time; $R = recorded time (default now)
MATCH (x {uid: $uid}) WHERE x:Product OR x:IngredientMaterial
CALL (x) {
  // R-68 (D7 set): MANUFACTURES -> Product | IngredientMaterial; SUPPLIES_MATERIAL -> IngredientMaterial; DISTRIBUTES -> Product
  MATCH (a:Assertion)-[:HAS_OBJECT]->(x)
  WHERE a.predicate IN ['MANUFACTURES', 'SUPPLIES_MATERIAL', 'DISTRIBUTES']
  RETURN a
  UNION
  // R-68: CONTRACT_MANUFACTURES_FOR is Organization -> client Organization; the product is the qualifier product=<uid>
  MATCH (x)-[:BRANDED_AS]->(:Brand)<-[:OWNS_BRAND]-(:Organization)<-[:HAS_OBJECT]-(a:Assertion {predicate: 'CONTRACT_MANUFACTURES_FOR'})
  RETURN a
  UNION
  // R-68: MANUFACTURER_UNNAMED, the brand owner's statement that its makers are unnamed (an explicit unknown, never a node)
  MATCH (x)-[:BRANDED_AS]->(:Brand)<-[:OWNS_BRAND]-(:Organization)<-[:HAS_SUBJECT]-(a:Assertion {predicate: 'MANUFACTURER_UNNAMED'})
  RETURN a
  UNION
  // R-68: a label's distributor / manufacturer line is the D6 typed edge NAMES_RESPONSIBLE_PARTY (its authorizing Assertion)
  MATCH (x)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[:HAS_LABEL_VERSION]->(:LabelVersion)
        -[n:NAMES_RESPONSIBLE_PARTY]->(:Organization)
  WHERE n.recordedTo IS NULL
  MATCH (a:Assertion {uid: n.assertionUid})
  RETURN a
}
WITH x, a
WHERE a.recordedTo IS NULL
  AND (a.validFrom IS NULL OR a.validFrom <= $V) AND (a.validTo IS NULL OR $V < a.validTo)
OPTIONAL MATCH (a)-[:HAS_SUBJECT]->(subj)
OPTIONAL MATCH (a)-[:HAS_OBJECT]->(obj)
OPTIONAL MATCH (a)-[:HAS_SUBJECT]->(lv:LabelVersion)
WITH x, a, subj, obj, lv,
     [q IN coalesce(a.qualifiers, []) WHERE q STARTS WITH 'exclusivity=' OR q STARTS WITH 'buyer='
        OR q STARTS WITH 'manufacturingKind=' OR q STARTS WITH 'product='] AS roleQualifiers,
     [q IN coalesce(a.qualifiers, []) WHERE q STARTS WITH 'product='] AS productQualifiers
WHERE a.predicate <> 'CONTRACT_MANUFACTURES_FOR' OR size(productQualifiers) = 0
   OR any(q IN productQualifiers WHERE q STARTS WITH 'product=' + x.uid)
// TRACE(a): the 10-K sentence, GRAS letter manufacturing paragraph, recall recalling_firm field, label panel line
CALL (a) {
  OPTIONAL MATCH (a)-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
  OPTIONAL MATCH (adj:Adjudication)-[:ASSESSES]->(a)
    WHERE adj.recordedAt <= $R AND (adj.recordedTo IS NULL OR adj.recordedTo > $R)
  OPTIONAL MATCH (a)-[:ASSERTED_BY]->(who)
  OPTIONAL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)
  RETURN who.name AS asserter,
         collect(DISTINCT {role: ev.role, locator: loc.uid, exact: loc.exact, contentHash: snap.contentHash,
                           retrievedAt: snap.retrievedAt, uri: src.canonicalUri, verdict: adj.verdict,
                           missionId: act.missionId, runId: act.runId}) AS trace
}
RETURN a.predicate AS role,
       CASE WHEN lv IS NOT NULL THEN obj.name ELSE subj.name END AS party,
       CASE WHEN a.predicate = 'CONTRACT_MANUFACTURES_FOR' THEN obj.name END AS contractClient,
       CASE WHEN a.predicate = 'CONTRACT_MANUFACTURES_FOR' THEN size(productQualifiers) > 0 END AS productScoped,
       lv.responsiblePartyRole AS labelRole,
       CASE WHEN a.predicate = 'MANUFACTURER_UNNAMED' THEN a.valueString END AS unnamedPartyText,
       roleQualifiers, asserter, a.validFrom, a.validTo, a.validObservedAt, a.uid AS assertionUid, trace
// also: recall / warning-letter addressees of X (RegulatoryRecord -ADDRESSED_TO-> Organization) as "named by the regulator" evidence
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `R` | string (DateTime) |  | temporal name |
| `V` | string (DateTime) |  | temporal name |
| `uid` | string | `^hu:` | uid lookup |

## Output contract

Columns: `role`, `party`, `contractClient`, `productScoped`, `labelRole`, `unnamedPartyText`, `roleQualifiers`, `asserter`, `a.validFrom`, `a.validTo`, `a.validObservedAt`, `assertionUid`, `trace`

## Temporal notes

- bitemporal episode needed on: none in D8 (the Assertion carries valid time); HAS_LABEL_VERSION when the label must be current at `$V`.

## Evidence and provenance notes

- trace: inline `trace` per role Assertion (10-K sentence, GRAS letter manufacturing paragraph, recall `recalling_firm` field, label panel line).

## Notes

- **Rulings that changed it:**

## Source

- `release:query-catalog/catalog.json#D8/CQ-MF-01` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D8/CQ-MF-01 --json`)

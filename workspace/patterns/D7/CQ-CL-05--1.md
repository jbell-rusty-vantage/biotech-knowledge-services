---
id: "pattern:D7/CQ-CL-05#1"
kind: "pattern"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D7/CQ-CL-05#1"]
aliases: ["d7/cq-cl-05#1","CQ-CL-05"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:9a050c753e95d1e8a79e8d5244038ef4d7379eb060269e212bc162aae657287d"
---
# Pattern D7/CQ-CL-05#1

| | |
| --- | --- |
| id | `pattern:D7/CQ-CL-05#1` |
| module | [D7](../../modules/D7.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-CL-05` ([D7 question set](../questions/D7.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:0024cee9a014f3742b87470f4dc8f4f90c6f108bd7f8a0076bbedba2ea0067b2` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `assertion_predicate`, `assessment_kind`, `uid_Assertion`, `uid_exists_Assertion`, `uid_type_Assertion` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions contract-only |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// $occ = uid of the claim occurrence (kernel Assertion, assertionKind CLAIM; speaker by ASSERTED_BY)
MATCH (occ:Assertion {uid: $occ})-[:ASSERTED_BY]->(p:Person)
OPTIONAL MATCH (occ)-[:OCCURS_IN]->(w:MediaWork)                                    // R-19: the container (one per occurrence)
MATCH (occ)-[:HAS_EVIDENCE {role:'SUPPORTS'}]->(:SourceLocator)<-[:HAS_LOCATOR]-(osnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(osrc:Source)
WITH occ, p, w, collect(DISTINCT osrc) AS occSources, min(coalesce(osnap.publishedAt, osnap.observedAt)) AS snapT
WITH occ, p, w, occSources,
     CASE WHEN w IS NULL THEN snapT ELSE w.publishedAt END AS t,                    // R-19: T = MediaWork.publishedAt; snapshot only without a container
     CASE WHEN w IS NULL THEN null ELSE w.publishedAtPrecision END AS tPrecision,
     CASE WHEN w IS NULL THEN 'SNAPSHOT_FALLBACK' ELSE 'OCCURS_IN_MEDIAWORK' END AS tBasis
MATCH (p)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization)
WHERE r.recordedTo IS NULL                                                          // current belief; pass $R for as-recorded
OPTIONAL MATCH (o)-[:PARENT_OF*0..2]-(o2:Organization)                              // group <-> member, holding <-> subsidiary
WITH occ, p, w, occSources, t, tPrecision, tBasis, r, o, collect(DISTINCT o2) AS orgSet
MATCH (ia:Assertion {uid: r.assertionUid})                                          // authorizing Assertion: TRACE and validObservedAt (OVERLAP)
OPTIONAL MATCH (occ)-[:HAS_SUBJECT|HAS_OBJECT]->(obj)                               // the recommended thing: subject (Attia: D4 Device) or object
OPTIONAL MATCH (b:Brand)<-[:OWNS_BRAND]-(ox:Organization) WHERE ox IN orgSet AND (obj)-[:BRANDED_AS]->(b)   // D6 Product -BRANDED_AS-> Brand
WITH occ, p, w, occSources, t, tPrecision, tBasis, r, o, ia,
     CASE WHEN obj IN orgSet THEN 'SAME_ORGANIZATION' WHEN b IS NOT NULL THEN 'SAME_PRODUCT_OR_BRAND' ELSE 'NOT_ESTABLISHED' END AS basisHint
// disclosure candidates: the holder's own interest Assertion (predicate = the edge type) or a DISCLOSES_INTEREST Assertion (R-82)
// whose locator sits in a rendition of the same work (R-19: Source -RENDITION_OF-> w); without a container, in the occurrence's own Source
OPTIONAL MATCH (da:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(dsnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(dsrc:Source)
  WHERE (da)-[:HAS_OBJECT]->(o)
    AND ((da.predicate = type(r) AND (da)-[:ASSERTED_BY]->(p))
         OR (da.predicate = 'DISCLOSES_INTEREST' AND (da.polarity IS NULL OR da.polarity <> 'NEGATIVE')
             AND ((da)-[:HAS_SUBJECT]->(p) OR (w IS NOT NULL AND (da)-[:HAS_SUBJECT]->(w)))))
    AND ((w IS NULL AND dsrc IN occSources) OR (w IS NOT NULL AND (dsrc)-[:RENDITION_OF]->(w)))
WITH occ, w, t, tPrecision, tBasis, r, o, ia, basisHint,
     collect(DISTINCT CASE WHEN da IS NOT NULL THEN {a: da.uid, predicate: da.predicate, rendition: dsrc.uid,
       renditionPublishedAt: dsnap.publishedAt, renditionObservedAt: dsnap.observedAt,
       timing: CASE WHEN dsnap.publishedAt IS NULL OR t IS NULL THEN 'TIMING_UNKNOWN'           // DISCLOSURE TIMING: archived copy judged on observedAt
                    WHEN dsnap.publishedAt <= t THEN 'DISCLOSED_IN_CONTAINER' ELSE 'DISCLOSED_IN_LATER_REVISION' END} END) AS disclosures
OPTIONAL MATCH (cra:Assessment {assessmentKind:'CONFLICT_RELEVANCE'})-[:DERIVED_FROM]->(occ)
  WHERE (cra)-[:DERIVED_FROM]->(ia) AND cra.recordedTo IS NULL
RETURN type(r) AS family, r.roleKind, r.stakeKind, r.valueKind, o.name, o.entityKind,
       r.validFrom, r.validFromPrecision, r.validFromBasis, r.validTo, r.validToPrecision, r.validToBasis, ia.validObservedAt,
       w.uid AS container, t, tPrecision, tBasis,
       CASE WHEN r.validTo IS NOT NULL AND r.validTo <= t THEN 'DISJOINT'
            WHEN r.validFrom IS NOT NULL AND r.validFrom > t THEN 'DISJOINT'
            WHEN r.validFrom IS NOT NULL AND r.validFrom <= t AND (r.validTo > t OR (r.validTo IS NULL AND ia.validObservedAt >= t)) THEN 'OVERLAPS'
            ELSE 'UNKNOWN' END AS overlapRaw,                                       // then the OVERLAP precision rule (bound precision vs tPrecision)
       basisHint, disclosures,
       cra.assessmentSubkind, cra.conclusionCode AS relevanceLevel, cra.facets AS relevanceFacets, ia.uid AS interestAssertion
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `occ` | string | `^hu:` | uid lookup |

## Output contract

Columns: `family`, `r.roleKind`, `r.stakeKind`, `r.valueKind`, `o.name`, `o.entityKind`, `r.validFrom`, `r.validFromPrecision`, `r.validFromBasis`, `r.validTo`, `r.validToPrecision`, `r.validToBasis`, `ia.validObservedAt`, `container`, `t`, `tPrecision`, `tBasis`, `overlapRaw`, `basisHint`, `disclosures`, `cra.assessmentSubkind`, `relevanceLevel`, `relevanceFacets`, `interestAssertion`

## Temporal notes

- bitemporal episode needed on: HOLDS_ROLE, HOLDS_STAKE, RECEIVES_VALUE_FROM (OVERLAP against T); PARENT_OF when the chain hop must hold at T.

## Evidence and provenance notes

- trace: TRACE on `ia` (the interest's own locator: self-disclosure line, filing table cell, regulator letter sentence), on each `disclosures[].a` (the in-container disclosure span, in a rendition of the container) and on `occ` (the statement span); `container` plus `tBasis` say where T came from. The relevance and disclosure verdicts are still read from the CONFLICT_RELEVANCE Assessment (`DERIVED_FROM` the occurrence and the interest Assertions; `conclusionCode` = relevanceLevel, `facets` = `relevanceBasis=`, `temporalOverlap=`, `disclosureFinding=`), never inferred by the query; `basisHint`, …

## Notes

- rulings: **R-19** (statement time T is the `publishedAt` of the OCCURS_IN MediaWork, the snapshot only when there is no container; in-container disclosure is tested through `Source -RENDITION_OF-> work`; OVERLAP reads the authorizing Assertion's `validObservedAt` through `r.assertionUid`, no edge carries `observedAt`; DISCLOSURE TIMING kept). Applied alongside: **R-82** (a disclosure is also the …
- status: rewritten

## Source

- `release:query-catalog/catalog.json#D7/CQ-CL-05#1` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D7/CQ-CL-05#1 --json`)

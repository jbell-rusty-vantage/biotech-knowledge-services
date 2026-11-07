---
id: "pattern:D7/CQ-EC-04#1"
kind: "pattern"
module: "D7"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:query-catalog/catalog.json#D7/CQ-EC-04#1"]
aliases: ["d7/cq-ec-04#1","CQ-EC-04"]
capabilities: ["get","pattern","read:template"]
cardDigest: "sha256:f3fe90c41dd6e0d86f8afc38393797e76ca8c71215e4599ac9b9f81b172802ce"
---
# Pattern D7/CQ-EC-04#1

| | |
| --- | --- |
| id | `pattern:D7/CQ-EC-04#1` |
| module | [D7](../../modules/D7.md) |
| status | **supported** — EXPLAIN ok on the release baseline; result assertions not run (S4) |
| questions | `CQ-EC-04` ([D7 question set](../questions/D7.md)) |
| language | CYPHER_5 (`CYPHER 5` prefix allowed, never `CYPHER 25`) · read |
| statement digest | `sha256:de57a7792d403d3ecd4fd61c63604ddf4a2c323ce7bd9c6be525886d6bca1eb4` |
| limits | maxRows 1000, timeoutMs 15000, maxDepth 5 |
| required indexes | `assertion_predicate`, `uid_Study`, `uid_exists_Study`, `uid_type_Study` |
| validation | EXPLAIN ok on 5.26.31 community; result assertions fixture-positive |

`supported` means EXPLAIN passed with the required DDL; it does not mean result assertions ran. A template is a read artifact for the native read service; a schema card is not data.

## Statement

```cypher
// per study: author -> employer (affiliation), funder (money), material supplier (in-kind), equity and patent ties; each with its locator
MATCH (st:Study {uid: $study})
OPTIONAL MATCH (st)-[sr:HAS_STUDY_ROLE]->(fo:Organization)                         // roleKind FUNDER / MATERIAL_PROVIDER / SPONSOR / ...
OPTIONAL MATCH (st)-[:HAS_STUDY_ROLE {roleKind:'FUNDING_AWARD'}]->(aw:Award)-[:AWARDED_BY]->(funder:Organization)
OPTIONAL MATCH (aw)-[:AWARDED_TO]->(recipient)                                     // Organization or Person
OPTIONAL MATCH (pub:Publication)-[:REPORTS_ON]->(st)
OPTIONAL MATCH (pub)<-[:HAS_SUBJECT]-(fs:Assertion {predicate:'FUNDED_BY'})-[:HAS_OBJECT]->(stated:Organization)          // R-82
OPTIONAL MATCH (pub)<-[:HAS_SUBJECT]-(auth:Assertion {predicate:'AUTHORED_BY'})-[:HAS_OBJECT]->(author:Person)          // R-80
OPTIONAL MATCH (author)-[emp:HOLDS_ROLE]->(employer:Organization) WHERE emp.roleKind IN ['EMPLOYEE','EXECUTIVE_OFFICER','FOUNDER']
OPTIONAL MATCH (author)-[val:RECEIVES_VALUE_FROM]->(payer:Organization)
OPTIONAL MATCH (author)-[stk:HOLDS_STAKE]->(holding:Organization)
OPTIONAL MATCH (ip:Assertion {predicate:'INVENTOR_ON_PATENT_ASSIGNED_TO'})-[:HAS_SUBJECT]->(author)
OPTIONAL MATCH (ip)-[:HAS_OBJECT]->(assignee:Organization)
WITH st, collect(DISTINCT {kind:'SPONSOR_OR_MATERIAL', org: fo.name, role: sr.roleKind, a: sr.assertionUid}) AS registryRoles,
     collect(DISTINCT {kind:'FUNDING', org: funder.name, award: aw.awardNumberVerbatim, instrument: aw.instrument, recipient: recipient.name})
       + collect(DISTINCT {kind:'FUNDING_STATEMENT', org: stated.name, a: fs.uid}) AS funding,
     collect(DISTINCT {kind:'EMPLOYMENT', person: author.name, org: employer.name, a: emp.assertionUid, authorship: auth.uid}) AS employment,
     collect(DISTINCT {kind:'PERSONAL_VALUE', person: author.name, org: payer.name, valueKind: val.valueKind, a: val.assertionUid}) AS personal,
     collect(DISTINCT {kind:'EQUITY', person: author.name, org: holding.name, stakeKind: stk.stakeKind, a: stk.assertionUid})
       + collect(DISTINCT {kind:'PATENT', person: author.name, org: assignee.name, a: ip.uid}) AS stakes
RETURN st.uid, registryRoles, funding, employment, personal, stakes,
       [e IN employment WHERE e.org IN [f IN funding | f.org]] AS employerAlsoFunder   // "affiliation distinct from funding" check
```

## Parameters

| name | type | constraint | inferred from |
| --- | --- | --- | --- |
| `study` | string | `^hu:` | uid lookup |

## Output contract

Columns: `st.uid`, `registryRoles`, `funding`, `employment`, `personal`, `stakes`, `employerAlsoFunder`

## Temporal notes

- bitemporal episode needed on: HOLDS_ROLE (employment at publication date), RECEIVES_VALUE_FROM, HOLDS_STAKE; AWARDED_* and REPORTS_ON recorded-only.

## Evidence and provenance notes

- trace: TRACE per tie: the JATS `<funding-group>` and "Declaration of competing interest" locators (FC7 quotes 1–4) for funding, employment and patent; the registry collaborator field for the D3 roles; the AUTHORED_BY Assertion (`authorship`) cites the byline locator, and the Person it names is the object a RESOLUTION Assessment settled (R-80), never a name match made by the query.

## Notes

- rulings: **R-80** (one authorship predicate, AUTHORED_BY, registered by D3: subject D3.Publication | D5.Protocol | D5.ProtocolEdition, object D7.Person | D7.Organization; D7 drops AUTHORED; author identity comes from RESOLUTION Assessments). Applied alongside: **R-82** (a paper-level funding statement is the D3 predicate FUNDED_BY, read beside the typed HAS_STUDY_ROLE {FUNDER | FUNDING_AWARD}). N…
- status: rewritten

## Source

- `release:query-catalog/catalog.json#D7/CQ-EC-04#1` (machine form: `patterns/catalog.json`, `bks-schema pattern --template D7/CQ-EC-04#1 --json`)

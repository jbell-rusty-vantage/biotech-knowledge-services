# D7 — retrieval patterns

Model stage (A6, 2026-10-08). One section per question id in `02-questions.md`. Types and relationship names are the ones in `04-schema-proposal.graphql` (D7: `Organization`, `Person`, `Brand`, `Award`; `HOLDS_ROLE`, `HOLDS_STAKE`, `RECEIVES_VALUE_FROM`, `PARENT_OF`, `OWNS_BRAND`, `AWARDED_BY`, `AWARDED_TO`) and the kernel's (`packets/K/04-schema-proposal.graphql`). Edges declared by other modules are written with the name their research notes use and marked *(seam, owner Dn)*; the synthesizer reconciles names through `10-seams.yaml`.

Conventions used by every pattern below (written once here, referenced as **AS-OF**, **TRACE**, **OVERLAP**):

- **AS-OF (both axes).** An episode edge `r` (RoleEdgeProperties, StakeEdgeProperties, ValueEdgeProperties, ControlEdgeProperties, AssertedEdgeProperties) is *recorded at R* when `r.recordedFrom <= $R AND (r.recordedTo IS NULL OR r.recordedTo > $R)` (default `$R = datetime()`, i.e. current belief). It is *valid at V* when `(r.validFrom IS NULL OR r.validFrom <= $V) AND (r.validTo IS NULL OR r.validTo > $V)`; a null bound is **unknown, never ongoing** (kernel rule), so every as-of answer returns the bound bases and precisions next to the verdict instead of silently treating null as open. Half-open intervals.
- **TRACE (provenance to bytes).** Every edge carries `assertionUid`. The citation is
  `MATCH (a:Assertion {uid: r.assertionUid})-[ev:HAS_EVIDENCE]->(loc:SourceLocator)<-[:HAS_LOCATOR]-(snap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source) WHERE ev.role = 'SUPPORTS' MATCH (a)-[:ASSERTED_BY]->(who) OPTIONAL MATCH (adj:Adjudication {adjudicationKind:'CAPTURE_FIDELITY'})-[:ASSESSES]->(a) WHERE adj.recordedTo IS NULL MATCH (a)-[:WAS_GENERATED_BY]->(act:Activity)`
  returning `who.name, a.predicate, a.status, loc.exact, loc.selectorKind, loc.startOffset, loc.page, snap.contentHash, snap.retrievedAt, snap.publishedAt, src.canonicalUri, adj.verdict, act.missionId, act.runId`. The verifier re-selects the same `loc.selectorJson` on the same `snap` (00-DIRECTIVE 3.8 and 3.10), so the answer and the verification read the same path. `a.status` is capture fidelity, never truth.
- **OVERLAP (tie in force at statement date t, CQ-AX-18).** Given an episode `r`, its authorizing Assertion `a` (`MATCH (a:Assertion {uid: r.assertionUid})`, already joined for TRACE) and `t` (the statement's `snap.publishedAt`, else the D9 container date): truncate `t` to each bound's precision. `DISJOINT` if `r.validTo` is known and `trunc(t, validToPrecision) >= r.validTo` truncated likewise and not equal, or `r.validFrom` is known and later than `t` at its precision; `OVERLAPS` if `r.validFrom <= t` (strictly earlier at its precision) and (`r.validTo > t` strictly at its precision, or `r.validTo IS NULL AND a.validObservedAt >= t`); otherwise `UNKNOWN` (includes equal-at-precision boundaries such as a YEAR bound in the statement's year). `a.validObservedAt` (kernel) is the date at which a source states the tie held ("Updated Oct 8th, 2024" page, proxy table date, Form D signature date, revision date of a present-tense "I am a paid advisor"); the edge carries no copy of it (adversarial review: the edge-level `observedAt` was removed). Worked case: Attia r-02 `validFrom 2020-09` / `validTo 2021-08` (MONTH) against t = 2021-06-20 → OVERLAPS.
- **DISCLOSURE TIMING (check stage).** A disclosure found in the container counts as DISCLOSED_IN_CONTAINER only when the rendition that carries it is dated at or before the statement (`dsnap.publishedAt <= t`, where the kernel's `SourceSnapshot.publishedAt` is the issuer's date *for this version* — a page's modified time, not its first date line — or an archived rendition, `dsnap.observedAt` = archive capture time, within days of `t` shows it). A disclosure seen only in a later rendition is DISCLOSED_IN_LATER_REVISION, and its Assertion's `validObservedAt` is that rendition's date, never the container's original date line (Attia fixture: the 2021-06-21 archived rendition lacks the Dexcom disclosure the 2024-12-09 revision carries; kernel FIELD_NOT_REPORTED records the absence). The timing of the *tie* is a separate question: it comes from a dated source for the tie (Attia: the author's archived disclosure list, Sep 2020 – Aug 2021), never from the disclosing rendition's date. Capture path for script-gated or redirected disclosure lists: the Internet Archive `id_` copy of the pre-redirect URL before any browser fallback (08).
- **Interest family** = `HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM`. **Holder** = Person or Organization. Path budget for indirect ties: ≤ 2 `PARENT_OF` hops (either direction) after the first interest hop.
- **Bitemporal episodes in D7**: HOLDS_ROLE, HOLDS_STAKE, RECEIVES_VALUE_FROM, PARENT_OF, OWNS_BRAND. Recorded-only, asserted (kernel AssertedRecordedProperties): AWARDED_BY, AWARDED_TO (the award period is the Award's own clock).
- **Investor basis (adversarial review).** Round participation is D13 `INVOLVES {role: INVESTOR | LEAD_INVESTOR}` on a FINANCING Event; a holding is D7 `HOLDS_STAKE`, written only when a source states it. Investor answers read both and label each row `basis: 'STATED_HOLDING' | 'ROUND_PARTICIPANT'`.
- **Manufacturer and supplier predicates** (predicate-only, the set D7 publishes in `05`): `MANUFACTURES`, `CONTRACT_MANUFACTURES_FOR`, `SUPPLIES_MATERIAL` (qualifier `exclusivity=`), `MANUFACTURER_UNNAMED`.

## CQ-CL-05

- kind: cypher (reads a kernel `Assessment` of kind CONFLICT_RELEVANCE when one exists; otherwise returns the candidate ties unassessed)
- pattern:

```cypher
// $occ = uid of the claim occurrence (kernel Assertion, assertionKind CLAIM; container and speaker from D9)
MATCH (occ:Assertion {uid: $occ})-[:ASSERTED_BY]->(p:Person)
MATCH (occ)-[:HAS_EVIDENCE {role:'SUPPORTS'}]->(:SourceLocator)<-[:HAS_LOCATOR]-(osnap:SourceSnapshot)<-[:HAS_SNAPSHOT]-(osrc:Source)
WITH occ, p, osrc, coalesce(osnap.publishedAt, osnap.observedAt) AS t
MATCH (p)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization)
WHERE r.recordedTo IS NULL                                            // current belief; pass $R for as-recorded
OPTIONAL MATCH chain = (o)-[:PARENT_OF*0..2]-(o2:Organization)        // group ↔ member, holding ↔ subsidiary
WITH occ, p, osrc, t, r, o, collect(DISTINCT o2) AS orgSet
MATCH (ia:Assertion {uid: r.assertionUid})                            // authorizing Assertion: TRACE and validObservedAt
// relevance to the statement's object (seam: D6 Product → Brand, D1 Compound, D4 Device …)
OPTIONAL MATCH (occ)-[:HAS_SUBJECT|HAS_OBJECT]->(obj)                // the recommended thing may be the subject (Attia: D4 Device) or the object
OPTIONAL MATCH (b:Brand)<-[:OWNS_BRAND]-(ox) WHERE ox IN orgSet AND (obj)-[:BRANDED_AS]->(b)   // BRANDED_AS: seam, owner D6 (Product.brand)
WITH occ, p, osrc, t, r, o, ia, obj, CASE WHEN obj IN orgSet THEN 'SAME_ORGANIZATION'
                                      WHEN b IS NOT NULL THEN 'SAME_PRODUCT_OR_BRAND' ELSE 'NOT_ESTABLISHED' END AS basisHint
// disclosure: an interest Assertion asserted by the holder whose locator sits in the same Source as the occurrence
OPTIONAL MATCH (da:Assertion)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(osrc)
  WHERE da.predicate = type(r) AND (da)-[:ASSERTED_BY]->(p) AND (da)-[:HAS_OBJECT]->(o)
OPTIONAL MATCH (cra:Assessment {assessmentKind:'CONFLICT_RELEVANCE'})-[:DERIVED_FROM]->(occ)
  WHERE (cra)-[:DERIVED_FROM]->(ia) AND cra.recordedTo IS NULL
RETURN type(r) AS family, r.roleKind, r.stakeKind, r.valueKind, o.name, o.entityKind,
       r.validFrom, r.validFromPrecision, r.validTo, r.validToPrecision, ia.validObservedAt, t,
       /* OVERLAP(r, t) */ basisHint, da IS NOT NULL AS disclosedInContainer,
       cra.assessmentSubkind, cra.conclusionCode AS relevanceLevel, cra.facets AS relevanceFacets, ia.uid AS interestAssertion
```

- trace: TRACE on `ia` (the interest's own locator: self-disclosure line, filing table cell, regulator letter sentence) and on `da` (the in-container disclosure span) and on `occ` (the statement span). The relevance and disclosure verdicts are read from the CONFLICT_RELEVANCE Assessment (`DERIVED_FROM` → occurrence and interest Assertions, `ASSESSES` → Person and Claim) and are never inferred by the query; `basisHint` is a retrieval aid only; `disclosedInContainer` is a candidate until DISCLOSURE TIMING is applied to the disclosing rendition. Kernel slots (K M9): `conclusionCode` = relevanceLevel; `facets` = `relevanceBasis=…`, `temporalOverlap=…`, `disclosureFinding=…` codes registered in `10-seams.yaml` (conflict-relevance-subkinds).
- bitemporal episode needed on: HOLDS_ROLE, HOLDS_STAKE, RECEIVES_VALUE_FROM (OVERLAP against t); PARENT_OF when the chain hop must hold at t.

## CQ-EC-03

- kind: cypher
- pattern:

```cypher
// speaker P and the statement's neighbourhood N (organizations, brands, products, substances bound to the occurrence)
MATCH (occ:Assertion {uid: $occ})-[:ASSERTED_BY]->(p:Person)
MATCH (occ)-[:HAS_SUBJECT|HAS_OBJECT]->(n)
MATCH path = (p)-[first:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization)-[ctl:PARENT_OF*0..2]-(o2:Organization)
WHERE all(x IN [first] + ctl WHERE x.recordedTo IS NULL
          AND ($V IS NULL OR ((x.validFrom IS NULL OR x.validFrom <= $V) AND (x.validTo IS NULL OR x.validTo > $V))))   // AS-OF on every hop
OPTIONAL MATCH (o2)-[:OWNS_BRAND]->(b:Brand)
WITH occ, p, n, path, first, o, o2, b
WHERE n = o2 OR n = b OR (n)-[:BRANDED_AS]->(b)               // BRANDED_AS: seam, owner D6
   OR EXISTS { (n)<-[:REALIZES_SUBSTANCE|MATERIAL_CONTAINS*0..1]-(:IngredientMaterial)<-[:DECLARES_COMPONENT]-(:LabelVersion)
               <-[:HAS_LABEL_VERSION]-(:Package)<-[:HAS_PACKAGE]-(:ProductVariant)<-[:HAS_VARIANT]-(:Product)-[:BRANDED_AS]->(b) }   // D1/D6 seams (names per their SDL)
RETURN p.name, [x IN relationships(path) | {type: type(x), assertion: x.assertionUid, from: x.validFrom, to: x.validTo,
        fromP: x.validFromPrecision, toP: x.validToPrecision, fromBasis: x.validFromBasis, toBasis: x.validToBasis}] AS hops,
       CASE WHEN length(path) = 1 THEN 'DIRECT' ELSE 'INDIRECT' END AS tieClass, n.uid AS neighbour
ORDER BY length(path)
```

- trace: TRACE per hop (`x.assertionUid`), so an indirect tie lists every authorizing span (e.g. FC1 "EdenRoc Sciences companies F,I,E,A,B, IP" plus "MetroBiotech International, an EdenRoc Sciences company … NAD boosters"); a path that needs a missing hop is reported "path incomplete" by returning the partial path from the D7 side.
- bitemporal episode needed on: interest family and PARENT_OF (each hop is filtered as-of when the caller passes `$V`).

## CQ-AX-18

- kind: cypher
- pattern:

```cypher
MATCH (occ:Assertion {uid: $occ})-[:ASSERTED_BY]->(p:Person)
MATCH (occ)-[:HAS_EVIDENCE {role:'SUPPORTS'}]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
WITH p, coalesce(s.publishedAt, s.observedAt) AS t
MATCH (p)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization {uid: $manufacturerUid})
WHERE r.recordedTo IS NULL
MATCH (a:Assertion {uid: r.assertionUid})                               // the observation date lives on the Assertion (kernel validObservedAt)
RETURN type(r), r.validFrom, r.validFromPrecision, r.validFromBasis, r.validTo, r.validToPrecision, r.validToBasis,
       a.validObservedAt, t, a.uid,
       CASE WHEN r.validTo IS NOT NULL AND r.validTo <= t THEN 'DISJOINT'
            WHEN r.validFrom IS NOT NULL AND r.validFrom > t THEN 'DISJOINT'
            WHEN r.validFrom IS NOT NULL AND r.validFrom <= t AND (r.validTo > t OR (r.validTo IS NULL AND a.validObservedAt >= t)) THEN 'OVERLAPS'
            ELSE 'UNKNOWN' END AS overlapRaw          // then apply the precision rule of OVERLAP (YEAR bound in t's year → UNKNOWN)
```

- trace: TRACE on `r.assertionUid` for the interval and on the occurrence for t; the precision and basis of each bound are part of the answer (FC1 year ranges; FC4: the author's archived list "Dexcom (September 2020 – Aug 2021)" → OVERLAPS with 2021-06-20, while the open present-tense episode from the 2024 revision returns UNKNOWN and is shown as a stale title, Q-D7-17).
- bitemporal episode needed on: HOLDS_ROLE, HOLDS_STAKE, RECEIVES_VALUE_FROM.

## CQ-EC-01

- kind: cypher
- pattern:

```cypher
// neighbourhood of X (an Organization or Person) valid at $V and as recorded at $R, grouped by role family
MATCH (x {uid: $x}) WHERE x:Organization OR x:Person
CALL (x) {
  MATCH (x)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM|PARENT_OF|OWNS_BRAND]-(y) RETURN r, y, 'D7' AS family
  UNION
  MATCH (x)<-[r:AWARDED_BY|AWARDED_TO]-(y:Award) RETURN r, y, 'D7-funding' AS family
  UNION
  MATCH (x)<-[r]-(y) WHERE type(r) IN $seamTypes RETURN r, y, 'seam' AS family   // HAS_STUDY_ROLE (D3), INVOLVES (D13), seller/manufacturer roles (D6/D8)
}
WITH x, r, y, family
WHERE (r.recordedFrom IS NULL OR (r.recordedFrom <= $R AND (r.recordedTo IS NULL OR r.recordedTo > $R)))
  AND ((r.validFrom IS NULL OR r.validFrom <= $V) AND (r.validTo IS NULL OR r.validTo > $V))
RETURN family, type(r) AS tie, labels(y)[0] AS kind, y.uid, y.name, r.assertionUid, r.validFrom, r.validTo,
       r.validFromBasis, r.validToBasis, r.recordedFrom
ORDER BY family, tie
```

- trace: TRACE on every returned `assertionUid`, AWARDED_BY included (asserted since the adversarial review; it was structural and could only cite the Award's creating Activity through `WAS_GENERATED_BY`, which reaches no locator).
- bitemporal episode needed on: every D7 episode edge returned (as-of on both axes); seam edges per their owner's register.

## CQ-EC-02

- kind: fulltext + cypher
- pattern:

```cypher
// fulltext index (created by the synthesizer's index plan): CREATE FULLTEXT INDEX orgBrandNames IF NOT EXISTS
//   FOR (n:Organization|Brand) ON EACH [n.name, n.legalName]
CALL db.index.fulltext.queryNodes('orgBrandNames', $text) YIELD node, score
WITH node, score LIMIT 25
OPTIONAL MATCH (node)<-[ob:OWNS_BRAND]-(owner:Organization)                         // brand → holder (episodes)
OPTIONAL MATCH (node)-[ob2:OWNS_BRAND]->(brand:Brand)                               // legal entity → its brands
OPTIONAL MATCH (n2:Assertion)-[:HAS_SUBJECT]->(node) WHERE n2.predicate IN ['LEGAL_NAME','FORMER_NAME','DOING_BUSINESS_AS']
OPTIONAL MATCH (eq:Assessment {assessmentKind:'EQUIVALENCE'})-[:ASSESSES]->(node)
OPTIONAL MATCH (parent:Organization)-[pc:PARENT_OF]->(child:Organization)             // parent of the hit or of its brand holder: where a dissolved holder's brand passes (Healthspan Research LLC → ChromaDex)
  WHERE child IN [owner, node] AND pc.controlKind <> 'GROUP_MEMBER_UNSPECIFIED'
RETURN node.uid, labels(node)[0], node.name, score,
       collect(DISTINCT {owner: owner.name, from: ob.validFrom, to: ob.validTo, a: ob.assertionUid}) AS holders,
       collect(DISTINCT {parent: parent.name, kind: pc.controlKind, from: pc.validFrom, to: pc.validTo, a: pc.assertionUid}) AS parents,
       collect(DISTINCT brand.name) AS brands,
       collect(DISTINCT {name: n2.valueString, from: n2.validFrom, to: n2.validTo, a: n2.uid}) AS names,
       collect(DISTINCT {eq: eq.uid, verdict: eq.verdict, status: eq.status}) AS equivalenceHypotheses
```

- trace: TRACE on each OWNS_BRAND and PARENT_OF episode and each name Assertion; equivalence is an Assessment (never a merge), so its own inputs (`DERIVED_FROM`) are the citation. Name variants found only in text (NPPES "other name", CT.gov sponsor strings) arrive as kernel `Mention`s resolved by RESOLUTION Assessments.
- bitemporal episode needed on: OWNS_BRAND (brand holder changes), PARENT_OF (parent at the time the old name was used); names live on Assertions (valid time on the record).

## CQ-EC-04

- kind: cypher
- pattern:

```cypher
// per study: four distinct tie kinds, each with its own locator
MATCH (st {uid: $study})                                                // D3 Study (seam)
OPTIONAL MATCH (st)-[sr:HAS_STUDY_ROLE]->(fo:Organization)              // seam, owner D3: roleKind FUNDER / MATERIAL_PROVIDER / SPONSOR
OPTIONAL MATCH (st)-[:HAS_STUDY_ROLE {roleKind:'FUNDING_AWARD'}]->(aw:Award)-[:AWARDED_BY]->(funder:Organization)   // seam, owner D3 (StudyParty union)
OPTIONAL MATCH (aw)-[:AWARDED_TO]->(recipient)                          // recipient Organization or Person (D7)
OPTIONAL MATCH (pub)-[:REPORTS_ON]->(st)                                // seam, D3/D9 publication
OPTIONAL MATCH (author:Person)<-[:HAS_OBJECT|HAS_SUBJECT]-(auth:Assertion {predicate:'AUTHORED'})-[:HAS_SUBJECT|HAS_OBJECT]->(pub)
OPTIONAL MATCH (author)-[emp:HOLDS_ROLE]->(employer:Organization) WHERE emp.roleKind IN ['EMPLOYEE','EXECUTIVE_OFFICER','FOUNDER']
OPTIONAL MATCH (author)-[val:RECEIVES_VALUE_FROM]->(payer:Organization)
OPTIONAL MATCH (author)-[stk:HOLDS_STAKE]->(holding:Organization)
WITH st, collect(DISTINCT {kind:'SPONSOR_OR_MATERIAL', org: fo.name, role: sr.roleKind, a: sr.assertionUid}) AS registryRoles,
     collect(DISTINCT {kind:'FUNDING', org: funder.name, award: aw.awardNumberVerbatim, instrument: aw.instrument, recipient: recipient.name}) AS funding,
     collect(DISTINCT {kind:'EMPLOYMENT', person: author.name, org: employer.name, a: emp.assertionUid}) AS employment,
     collect(DISTINCT {kind:'PERSONAL_VALUE', person: author.name, org: payer.name, valueKind: val.valueKind, a: val.assertionUid}) AS personal,
     collect(DISTINCT {kind:'EQUITY_OR_IP', person: author.name, org: holding.name, a: stk.assertionUid}) AS stakes
RETURN st.uid, registryRoles, funding, employment, personal, stakes,
       [e IN employment WHERE e.org IN [f IN funding | f.org]] AS employerAlsoFunder   // "affiliation distinct from funding" check
```

- trace: TRACE per tie: the JATS `<funding-group>` / "Declaration of competing interest" element locators (FC7 quotes 1–4) for funding, employment and patent; the registry collaborator field for D3 roles. A patent statement ("has patent … issued to Elysium") is a D8 seam check and stays an Assertion (predicate INVENTOR_ON_PATENT_ASSIGNED_TO) until D8 resolves the patent.
- bitemporal episode needed on: HOLDS_ROLE (employment at publication date), RECEIVES_VALUE_FROM; AWARDED_* recorded-only.

## CQ-MF-01

- kind: cypher
- pattern:

```cypher
// no module declares a typed manufacturer or supplier edge; every module writes the predicate set D7 publishes in 05
// (MANUFACTURES, CONTRACT_MANUFACTURES_FOR, SUPPLIES_MATERIAL + exclusivity, MANUFACTURER_UNNAMED; OQ-D7-28)
MATCH (m {uid: $materialOrProduct})
OPTIONAL MATCH (u:Assertion)-[:HAS_OBJECT]->(m) WHERE u.predicate IN ['MANUFACTURES','SUPPLIES_MATERIAL']
OPTIONAL MATCH (u)-[:HAS_SUBJECT]->(o:Organization)
OPTIONAL MATCH (m)-[:BRANDED_AS]->(b:Brand)<-[ob:OWNS_BRAND]-(holder:Organization)                          // BRANDED_AS seam D6
OPTIONAL MATCH (m)-[:HAS_VARIANT]->(:ProductVariant)-[:HAS_PACKAGE]->(:Package)-[:HAS_LABEL_VERSION]->(:LabelVersion)-[:NAMES_RESPONSIBLE_PARTY]->(rp:Organization)   // D6 seam ("Distributed by")
OPTIONAL MATCH (cmo:Assertion {predicate:'CONTRACT_MANUFACTURES_FOR'})-[:HAS_OBJECT]->(holder)      // CMO for the brand owner (qualifier product=)
OPTIONAL MATCH (cmo)-[:HAS_SUBJECT]->(cmoOrg:Organization)
OPTIONAL MATCH (gap:Assertion {predicate:'MANUFACTURER_UNNAMED'})-[:HAS_SUBJECT]->(holder)
RETURN u.predicate AS role, o.name, u.uid, u.validFrom, u.validTo, u.status, u.qualifiers AS exclusivityAndBuyer,
       collect(DISTINCT {cmo: cmoOrg.name, a: cmo.uid, q: cmo.qualifiers}) AS contractManufacturers,
       holder.name AS brandHolder, ob.assertionUid, collect(DISTINCT rp.name) AS labelResponsibleParties,
       collect(DISTINCT gap.valueString) AS unnamedParties   // "unnamed third-party contract manufacturers" stays an explicit unknown
```

- trace: TRACE on each role Assertion and on the OWNS_BRAND episode; an unnamed party is an Assertion with a literal and its 10-K locator (FC9 quote 3), never a filled-in Organization. The Niagen 10-K's sole NRC supplier is `SUPPLIES_MATERIAL` (W.R. Grace & Co.-Conn. → food-grade NRC, `exclusivity=SOLE`), written identically by the D6 and the D7 fixture.
- bitemporal episode needed on: OWNS_BRAND (D7); role Assertions carry their own valid time.

## CQ-CL-07

- kind: cypher (identity resolution is a kernel Assessment; the pseudonymous account node is D9's)
- pattern:

```cypher
MATCH (acct {uid: $handleUid})                                         // D9 account / channel node (seam; PseudonymousActor deferred to D9)
OPTIONAL MATCH (h:Assessment {assessmentKind:'RESOLUTION'})-[:ASSESSES]->(acct)
OPTIONAL MATCH (h)-[:ASSESSES]->(cand:Person)
RETURN acct.name, h.uid, h.status, h.score, h.methodVersion, h.rationale, cand.uid, cand.name
ORDER BY h.recordedAt DESC
```

- trace: the RESOLUTION Assessment's `DERIVED_FROM` inputs and `HAS_EVIDENCE` locators (profile pages, ORCID record) are the citation; the answer is a hypothesis with status, never an identity merge.
- bitemporal episode needed on: none (assessment records carry recorded time).

## Q-D7-01

- kind: cypher
- pattern:

```cypher
// holders ≥ 5 % of issuer X as of $V, and the chain behind each holder (holding companies → ultimate person), max depth 6
MATCH (x:Organization {uid: $issuer})
MATCH (h)-[s:HOLDS_STAKE]->(x)
WHERE s.recordedTo IS NULL
  AND (s.stakePercent >= 5 OR s.stakeBand IN ['AT_LEAST_5','AT_LEAST_10','OVER_25_TO_50','OVER_50_TO_75','OVER_75'])
  AND (s.validFrom IS NULL OR s.validFrom <= $V) AND (s.validTo IS NULL OR s.validTo > $V)
MATCH (sa:Assertion {uid: s.assertionUid})
OPTIONAL MATCH chain = (top)-[:PARENT_OF|HOLDS_STAKE*1..6]->(h)
WHERE all(e IN relationships(chain) WHERE e.recordedTo IS NULL
          AND (e.validFrom IS NULL OR e.validFrom <= $V) AND (e.validTo IS NULL OR e.validTo > $V)   // AS-OF on every hop
          AND (type(e) = 'HOLDS_STAKE' OR e.controlKind <> 'GROUP_MEMBER_UNSPECIFIED'))
  AND NOT ()-[:PARENT_OF|HOLDS_STAKE]->(top)                           // top of the chain
RETURN h.name, s.stakePercent, s.stakeBand, s.ownershipBasis, s.votingPower, s.dispositivePower, sa.validObservedAt,
       s.validFromBasis, s.validToBasis, s.assertionUid,
       [e IN relationships(chain) | {type: type(e), kind: coalesce(e.controlKind, e.stakeKind), basis: e.ownershipBasis,
                                     pct: e.stakePercent, from: e.validFrom, to: e.validTo, fromBasis: e.validFromBasis,
                                     toBasis: e.validToBasis, a: e.assertionUid}] AS chainHops, top.name AS ultimateHolder
ORDER BY s.stakePercent DESC
```

- trace: TRACE on each hop; the proxy beneficial-ownership table cell and its footnote (FC5: "Based on beneficial ownership reported on Schedule 13D/A …"), GLEIF relationship record JSON pointer (FC10), PSC "Nature of control" text (FC11). "May be deemed" stays `ownershipBasis = MAY_BE_DEEMED` on its hop. Every hop is filtered as of `$V` (a null bound is unknown, never ongoing) and returns its bound bases, so a chain that holds only on some hops is visible as such.
- bitemporal episode needed on: HOLDS_STAKE, PARENT_OF.

## Q-D7-02

- kind: cypher
- pattern:

```cypher
MATCH (p:Person)-[r:HOLDS_ROLE]->(x:Organization {uid: $org})
WHERE r.recordedTo IS NULL AND r.roleKind IN ['DIRECTOR','CHAIR','BOARD_OBSERVER','EXECUTIVE_OFFICER']
OPTIONAL MATCH (nom:Assertion {predicate:'NOMINATES_DIRECTOR'})-[:HAS_OBJECT]->(p)
OPTIONAL MATCH (nom)-[:HAS_SUBJECT]->(nominator:Organization)
MATCH (ra:Assertion {uid: r.assertionUid})
RETURN p.name, r.roleKind, r.roleTitleVerbatim, r.validFrom, r.validFromPrecision, r.validTo, ra.validObservedAt,
       r.assertionUid, nominator.name AS nominatedBy, nom.uid
ORDER BY r.roleKind, r.validFrom
```

- trace: TRACE on the role episode (DEF 14A bio "has been a director of the Company since March 2017", Form D relatedPersonInfo) and on the NOMINATES_DIRECTOR predicate-only Assertion (FC5 "the director nominated by Champion River …").
- bitemporal episode needed on: HOLDS_ROLE.

## Q-D7-03

- kind: cypher (+ gds for discovery, see below)
- pattern:

```cypher
MATCH (a:Organization {uid: $orgA}), (b:Organization {uid: $orgB})
MATCH (p:Person)-[r1:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(a)
MATCH (p)-[r2:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(b)
WHERE r1.recordedTo IS NULL AND r2.recordedTo IS NULL
WITH p, r1, r2,
     CASE WHEN r1.validFrom IS NULL OR r2.validFrom IS NULL THEN null
          ELSE CASE WHEN r1.validFrom > r2.validFrom THEN r1.validFrom ELSE r2.validFrom END END AS overlapFrom,
     CASE WHEN r1.validTo IS NULL OR r2.validTo IS NULL THEN null
          ELSE CASE WHEN r1.validTo < r2.validTo THEN r1.validTo ELSE r2.validTo END END AS overlapTo
RETURN p.name, type(r1), coalesce(r1.roleKind, r1.stakeKind, r1.valueKind), r1.validFrom, r1.validTo, r1.assertionUid,
       type(r2), coalesce(r2.roleKind, r2.stakeKind, r2.valueKind), r2.validFrom, r2.validTo, r2.assertionUid,
       overlapFrom, overlapTo        // null = unknown, reported with the bound bases
```

- Discovery variant (gds, materialized, monthly): betweenness over an undirected Person–Organization projection of current interest edges to list connector people across a set of organizations; result stored nowhere in the graph (served to the analyst UI), method `d7-connector-betweenness/v1`.

```cypher
MATCH (p:Person)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization) WHERE r.recordedTo IS NULL
WITH gds.graph.project('d7-interest', p, o, {}, {undirectedRelationshipTypes: ['*']}) AS g RETURN g.graphName;
CALL gds.betweenness.stream('d7-interest') YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS n, score WHERE n:Person RETURN n.uid, n.name, score ORDER BY score DESC LIMIT 50;
```

- trace: TRACE on both edges of each connecting person (FC6: "Dr. Pande departed from Andreessen Horowitz in June 2025" closes one side).
- bitemporal episode needed on: interest family (overlap window).

## Q-D7-04

- kind: cypher
- pattern:

```cypher
// the financing is a D13 Event (eventKind FINANCING) INVOLVES issuer; amounts are Assertions on the Event; persons from the same Form D are HOLDS_ROLE
MATCH (x:Organization {uid: $issuer})<-[iss:INVOLVES]-(e)                          // seam, owner D13 (role ISSUER)
WHERE e.eventKind = 'FINANCING' AND iss.role = 'ISSUER'
OPTIONAL MATCH (amt:Assertion)-[:HAS_SUBJECT]->(e) WHERE amt.predicate IN ['FINANCING_AMOUNT','INVESTOR_COUNT','DATE_OF_FIRST_SALE']   // FINANCING_AMOUNT qualifier amountKind=OFFERED|SOLD|…
OPTIONAL MATCH (e)-[i:INVOLVES]->(inv) WHERE i.role IN ['INVESTOR','LEAD_INVESTOR'] AND i.recordedTo IS NULL         // seam D13: round participants (named by press releases; Form D names none)
OPTIONAL MATCH (p:Person)-[r:HOLDS_ROLE]->(x)
  WHERE r.roleKind IN ['DIRECTOR','EXECUTIVE_OFFICER','PROMOTER']
    AND EXISTS { MATCH (ra:Assertion {uid: r.assertionUid})-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap)
                 MATCH (amt)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(snap) }     // same Form D snapshot
RETURN e.uid, e.startedAt, collect(DISTINCT {p: amt.predicate, v: coalesce(amt.valueNumber, amt.valueString), unit: amt.unitCode, q: amt.qualifiers, a: amt.uid}) AS figures,
       collect(DISTINCT {investor: inv.name, kind: labels(inv)[0], role: i.role, a: i.assertionUid, basis: 'ROUND_PARTICIPANT'}) AS investors,
       collect(DISTINCT {person: p.name, role: r.roleKind, a: r.assertionUid}) AS relatedPersons
```

- trace: TRACE on each figure (Form D XML `JSON_POINTER`/XPath-style selectors: totalOfferingAmount, dateOfFirstSale; FC2) and each related person; the Person ↔ Form D name link is a RESOLUTION Assessment because Form D persons carry no identifier.
- bitemporal episode needed on: HOLDS_ROLE (the authorizing Assertion's validObservedAt = signature date; start unknown); Event clocks and INVOLVES episodes are D13's. Investors come from D13 INVOLVES (round participation); a stated holding afterwards is HOLDS_STAKE (Q-D7-01, Q-D7-13), never inferred from participation.

## Q-D7-05

- kind: cypher
- pattern:

```cypher
MATCH (st {uid: $study})
CALL (st) {
  MATCH (st)-[sr:HAS_STUDY_ROLE]->(o:Organization) WHERE sr.roleKind IN ['LEAD_SPONSOR','SPONSOR','COLLABORATOR','FUNDER','MATERIAL_PROVIDER']   // seam D3
  RETURN o AS funder, sr.roleKind AS kind, sr.assertionUid AS a, null AS award
  UNION
  MATCH (st)-[:HAS_STUDY_ROLE {roleKind:'FUNDING_AWARD'}]->(aw:Award)-[:AWARDED_BY]->(o:Organization)                               // seam D3
  RETURN o AS funder, 'AWARD:' + aw.instrument AS kind, null AS a, aw AS award
}
WITH funder, collect({kind: kind, a: a, award: award.awardNumberVerbatim}) AS ties
OPTIONAL MATCH (funder)<-[:AWARDED_BY]-(other:Award)
OPTIONAL MATCH (other)<-[:HAS_STUDY_ROLE {roleKind:'FUNDING_AWARD'}]-(st2)
RETURN funder.name, ties, count(DISTINCT other) AS otherAwards, collect(DISTINCT st2.uid)[0..25] AS otherStudies
```

- trace: TRACE on each D3 role assertion (FC7: e-12..e-14, Study → Award, FUNDING_AWARD) and on the AWARDED_BY / AWARDED_TO assertions of the award (FC7 `<funding-group>`; FC8 "ChromaDex provided the nicotinamide riboside." is MATERIAL_PROVIDER, not FUNDER).
- bitemporal episode needed on: none in D7 (AWARDED_* asserted, recorded-only); D3's HAS_STUDY_ROLE is an episode per D3.

## Q-D7-06

- kind: cypher (assessment read; seam D9)
- pattern:

```cypher
// all recommendation occurrences by P with their reachable interests and the disclosure finding.
// The answer is driven by the CONFLICT_RELEVANCE Assessment's DERIVED_FROM inputs (how the relevance verdict is produced);
// the structural match is a candidate list for occurrences no Assessment covers yet, never a verdict.
MATCH (occ:Assertion {assertionKind:'CLAIM', speechAct:'RECOMMENDS'})-[:ASSERTED_BY]->(p:Person {uid: $person})
MATCH (occ)-[:HAS_EVIDENCE {role:'SUPPORTS'}]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
OPTIONAL MATCH (occ)-[:HAS_SUBJECT|HAS_OBJECT]->(thing)                // the recommended thing: subject or object (Attia: D4 Device as subject)
// (1) assessed interests: the Assessment's interest inputs and the episodes they authorize
OPTIONAL MATCH (cra:Assessment {assessmentKind:'CONFLICT_RELEVANCE'})-[:DERIVED_FROM]->(occ) WHERE cra.recordedTo IS NULL
OPTIONAL MATCH (cra)-[:DERIVED_FROM]->(ia:Assertion) WHERE ia.predicate IN ['HOLDS_ROLE','HOLDS_STAKE','RECEIVES_VALUE_FROM']
OPTIONAL MATCH (p)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM {assertionUid: ia.uid}]->(o:Organization)
// (2) unassessed candidates: same organization or brand family only (no category test for things that are not D6 Products)
OPTIONAL MATCH (p)-[rc:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(oc:Organization)-[:PARENT_OF*0..2]-(oc2:Organization)
  WHERE cra IS NULL AND rc.recordedTo IS NULL
    AND (thing = oc2 OR EXISTS { (oc2)-[:OWNS_BRAND]->(:Brand)<-[:BRANDED_AS]-(thing) })              // BRANDED_AS seam D6
OPTIONAL MATCH (da:Assertion)-[:ASSERTED_BY]->(p)
  WHERE da.predicate = type(r) AND (da)-[:HAS_OBJECT]->(o)
    AND EXISTS { (da)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src) }
RETURN occ.uid, s.publishedAt, thing.name, labels(thing)[0] AS thingKind,
       cra.assessmentSubkind, cra.conclusionCode, cra.facets,
       collect(DISTINCT {family: type(r), kind: coalesce(r.roleKind, r.stakeKind, r.valueKind), org: o.name, from: r.validFrom,
                         to: r.validTo, a: r.assertionUid, disclosedInSameSource: da IS NOT NULL}) AS assessedInterests,
       collect(DISTINCT {family: type(rc), org: oc.name, a: rc.assertionUid}) AS unassessedCandidates
```

- trace: TRACE on the occurrence span, the interest episode, and the in-container disclosure span (FC4: "I’m a proponent of continuous glucose monitors …", "Dexcom (September 2020 – Aug 2021)" and "I am a paid advisor to Dexcom; a company that develops, manufactures, and distributes CGMs."). The relevance basis (facet `relevanceBasis=` SAME_PRODUCT / SAME_ORGANIZATION / SAME_PRODUCT_CATEGORY / SAME_SERVICE_CATEGORY …) is the Assessment's, not the query's: no typed path links a D4 device category to its maker (D4 platform roles are predicate-only), so a category match is only ever read from the Assessment. Fixture check (adversarial review): on the Attia fixture the pattern returns r-01 with as-cr-01 (DIRECT; SAME_PRODUCT_CATEGORY, OVERLAPS, DISCLOSED_IN_LATER_REVISION) and assessed interests HOLDS_ROLE r-02 and RECEIVES_VALUE_FROM r-03 → Dexcom; the earlier version read only HAS_OBJECT and filtered on `thing.productKind`, and returned no rows.
- bitemporal episode needed on: interest family (OVERLAP with `s.publishedAt`).

## Q-D7-07

- kind: cypher
- pattern:

```cypher
// regulator-asserted payment ties and the regulator's disclosure finding
MATCH (reg:Organization {organizationKind:'GOVERNMENT_OR_REGULATOR'})<-[:ASSERTED_BY]-(a:Assertion {predicate:'RECEIVES_VALUE_FROM'})
MATCH (a)-[:HAS_SUBJECT]->(endorser:Person), (a)-[:HAS_OBJECT]->(marketer:Organization)
MATCH (endorser)-[r:RECEIVES_VALUE_FROM {assertionUid: a.uid}]->(marketer)
OPTIONAL MATCH (f:Assertion {predicate:'MATERIAL_CONNECTION_NOT_ADEQUATELY_DISCLOSED'})-[:ASSERTED_BY]->(reg)
  WHERE (f)-[:HAS_SUBJECT]->(endorser) OR (f)-[:HAS_SUBJECT]->(marketer)
OPTIONAL MATCH (f)-[:HAS_OBJECT]->(promoted)                     // D1/D12 substance or product promoted (aspartame, sugar)
OPTIONAL MATCH (act)-[:ADDRESSED_TO]->(marketer)                 // seam, owner D8 (RegulatoryRecord.addressedTo: the warning letter record)
RETURN reg.name, marketer.name, endorser.name, r.valueKind, a.qualifiers AS modality, f.uid, promoted.name, act.uid
```

- trace: TRACE on `a` (FC3 quote 2: "It appears that the American Beverage Association paid the dieticians to do so."; modality `APPEARS` in `a.qualifiers`) and on `f` (quote 4); the letter's internal date inconsistency is kept on the snapshot (`publishedAt` from the page-1 date).
- bitemporal episode needed on: RECEIVES_VALUE_FROM (valid time from the letter: the posting period when stated, else the Assertion's validObservedAt = letter date; the individual letter dates one post, July 14, 2023, loc-bonci-post-date).

## Q-D7-08

- kind: cypher (assessment read)
- pattern:

```cypher
MATCH (p:Person {uid: $person})-[r:HOLDS_ROLE]->(o:Organization {uid: $org})
MATCH (a:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(asserter)
MATCH (a)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(:SourceSnapshot)<-[:HAS_SNAPSHOT]-(src:Source)
WITH p, o, count(DISTINCT r.roleKind) AS distinctKinds, collect({kind: r.roleKind, title: r.roleTitleVerbatim, from: r.validFrom, fromP: r.validFromPrecision,
                    to: r.validTo, toP: r.validToPrecision, observedAt: a.validObservedAt, asserter: asserter.name,
                    genre: src.genre, a: a.uid, current: r.recordedTo IS NULL}) AS claims
OPTIONAL MATCH (adj:Assessment {assessmentKind:'EVIDENCE_SYNTHESIS'})-[:ASSESSES]->(p)
  WHERE adj.assessmentSubkind = 'D7.role-agreement' AND (adj)-[:ASSESSES]->(o) AND adj.recordedTo IS NULL
RETURN p.name, o.name, claims,
       CASE WHEN distinctKinds > 1 THEN 'CONFLICT_ON_KIND'
            WHEN size(claims) = 1 THEN 'ONE_SIDED' ELSE 'COMPARE_INTERVALS' END AS shape,
       adj.verdict, adj.rationale
```

- trace: TRACE per claim (FC1 "Life Biosciences … F,I,E,A,B,IP" line vs FC2 Form D `<relationship>Director</relationship>`); the adjudication rule (filing over self-disclosure for governance roles; self-disclosure over filing for advisory/IP) is an Assessment with methodVersion, not a query decision.
- bitemporal episode needed on: HOLDS_ROLE (compare bounds and the Assertions' validObservedAt).

## Q-D7-09

- kind: cypher
- pattern:

```cypher
MATCH (x:Organization {uid: $org})
OPTIONAL MATCH (n:Assertion)-[:HAS_SUBJECT]->(x) WHERE n.predicate IN ['LEGAL_NAME','FORMER_NAME','ORGANIZATION_STATUS','SUCCEEDED_BY']
OPTIONAL MATCH (x)-[c:PARENT_OF]->(acq:Organization)                 // acquired / dissolved entities (Healthspan Research LLC 2017-03-12 → 2021-01-15)
OPTIONAL MATCH (prev:Organization)-[c2:PARENT_OF]->(x)
OPTIONAL MATCH (x)-[hi:HAS_IDENTIFIER]->(i:Identifier)
RETURN x.name, x.status,
       collect(DISTINCT {pred: n.predicate, value: n.valueString, from: n.validFrom, to: n.validTo, a: n.uid}) AS nameAndStatusEpisodes,
       collect(DISTINCT {child: acq.name, kind: c.controlKind, from: c.validFrom, to: c.validTo, childStatus: acq.status, a: c.assertionUid}) AS acquired,
       collect(DISTINCT {parent: prev.name, kind: c2.controlKind, from: c2.validFrom, to: c2.validTo}) AS parents,
       collect(DISTINCT {scheme: i.scheme, value: i.value, from: hi.validFrom, to: hi.validTo}) AS identifiers
```

- trace: TRACE on each name Assertion (EDGAR submissions `formerNames` JSON pointer with from/to; FC9 10-K Item 1 sentences) and each PARENT_OF episode; identifiers carry their own HAS_IDENTIFIER episodes (kernel).
- bitemporal episode needed on: PARENT_OF; names are valid-time Assertions (no edge).

## Q-D7-10

- kind: cypher
- pattern:

```cypher
MATCH (b:Brand {uid: $brand}) WHERE b.brandKind = 'CLINIC_OR_SERVICE'
MATCH (op:Organization)-[ob:OWNS_BRAND]->(b) WHERE ob.recordedTo IS NULL
MATCH (a:Assertion {uid: ob.assertionUid})
OPTIONAL MATCH (op)-[:HAS_IDENTIFIER]->(npi:Identifier {scheme:'NPI'})       // NPI-2 of the licensed operating entity
// sites are not modeled (D8 declined Facility, OQ-D7-05); a site address stays verbatim on the NPPES-backed Assertion
RETURN b.name, op.name, op.legalName, op.jurisdiction, op.entityKind, a.qualifiers AS tieKind, ob.validFrom, ob.validTo,
       collect(DISTINCT npi.value) AS operatorNpi
```

- trace: TRACE on the OWNS_BRAND episode (NPPES "Other Name" code 5 record via `API_RECORD` selector, FC-candidate S30).
- bitemporal episode needed on: OWNS_BRAND.

## Q-D7-11

- kind: cypher
- pattern:

```cypher
MATCH (p:Person {uid: $person})-[r:HOLDS_ROLE|HOLDS_STAKE]->(o:Organization)
WHERE r.recordedTo IS NULL AND (type(r) = 'HOLDS_STAKE' OR r.roleKind IN ['FOUNDER','ADVISOR','DIRECTOR','CONSULTANT'])
OPTIONAL MATCH (o)-[:PARENT_OF*0..2]->(o2:Organization)-[:OWNS_BRAND]->(b:Brand)<-[:BRANDED_AS]-(prod:Product) WHERE prod.productKind = $productKind   // D6 seam; category = D6 productKind
RETURN o.name, type(r), coalesce(r.roleKind, r.stakeKind), r.validFrom, r.validTo, r.assertionUid,
       collect(DISTINCT b.name) AS brandsInCategory, count(prod) AS products
ORDER BY products DESC
```

- trace: TRACE on each tie (FC1 "Tally Health (2021-2024) F,I,E", "MetroBiotech … NAD boosters (2015-present)") and on the brand-holder episodes.
- bitemporal episode needed on: HOLDS_ROLE, HOLDS_STAKE, OWNS_BRAND.

## Q-D7-12

- kind: cypher (graph part) + query-time external read (Form 4 transactions are not stored)
- pattern:

```cypher
MATCH (x:Organization {uid: $issuer})
MATCH (insider)-[r:HOLDS_ROLE|HOLDS_STAKE]->(x)
WHERE r.recordedTo IS NULL
  AND (r.roleKind IN ['DIRECTOR','EXECUTIVE_OFFICER','CHAIR'] OR r.stakeBand IN ['AT_LEAST_10','OVER_25_TO_50','OVER_50_TO_75','OVER_75'] OR r.stakePercent >= 10)
OPTIONAL MATCH (insider)-[:HAS_IDENTIFIER]->(cik:Identifier {scheme:'SEC_CIK'})
OPTIONAL MATCH (x)<-[:INVOLVES]-(e {uid: $event})                            // D13 event for the window
RETURN insider.uid, insider.name, type(r), r.roleKind, cik.value AS reportingOwnerCik, e.startedAt AS eventDate
// the caller fetches Form 4 XML for (issuer CIK, reportingOwner CIK) in [eventDate − 90d, eventDate + 90d] at query time
```

- trace: TRACE on the role/stake episodes; transactions cite the fetched Form 4 accession at answer time (an ANSWER Report's HAS_EVIDENCE when published).
- bitemporal episode needed on: HOLDS_ROLE, HOLDS_STAKE (as-of the event date).

## Q-D7-13

- kind: cypher
- pattern:

```cypher
MATCH (e)-[:INVOLVES]->(x:Organization)                                      // seam D13: negative events (eventKind in failure, safety halt, enforcement)
WHERE e.eventKind IN $negativeKinds AND e.startedAt >= $since
CALL (e, x) {
  // stated holdings in force at the event date (D7)
  MATCH (holder)-[s:HOLDS_STAKE]->(x)
  WHERE s.recordedTo IS NULL AND (s.validTo IS NULL OR s.validTo > e.startedAt) AND (s.validFrom IS NULL OR s.validFrom <= e.startedAt)
  RETURN holder, s.stakePercent AS pct, s.stakeBand AS band, s.assertionUid AS a, 'STATED_HOLDING' AS basis, null AS round
  UNION
  // participants of the company's earlier financing rounds (D13), not known to hold today
  MATCH (fin)-[:INVOLVES {role:'ISSUER'}]->(x)
  MATCH (fin)-[i:INVOLVES]->(holder)
  WHERE fin.eventKind = 'FINANCING' AND fin.startedAt <= e.startedAt AND i.role IN ['INVESTOR','LEAD_INVESTOR'] AND i.recordedTo IS NULL
  RETURN holder, null AS pct, null AS band, i.assertionUid AS a, 'ROUND_PARTICIPANT' AS basis, fin.uid AS round
}
OPTIONAL MATCH (group:Organization {entityKind:'CORPORATE_GROUP'})-[g:PARENT_OF]->(holder)
RETURN x.name, e.eventKind, e.startedAt, holder.name, holder.entityKind, basis, pct, band, a, round,
       group.name AS investorGroup      // group vs vehicle kept apart; group-level rows are labelled aggregated; basis labels every row
```

- trace: TRACE on each stake episode, each INVOLVES participation (D13's authorizing Assertion) and the D13 event's own assertions. A ROUND_PARTICIPANT row is exposure by participation, not a stated holding at the event date.
- bitemporal episode needed on: HOLDS_STAKE (as-of the event date), PARENT_OF; INVOLVES per D13.

## Q-D7-14

- kind: cypher
- pattern:

```cypher
MATCH (g:Organization {uid: $group})
MATCH (g)-[m:PARENT_OF*1..3]->(v:Organization)                               // GENERAL_PARTNER_OR_MANAGING_MEMBER / GROUP_MEMBER_UNSPECIFIED hops
WHERE all(e IN m WHERE e.recordedTo IS NULL AND (e.validFrom IS NULL OR e.validFrom <= $V) AND (e.validTo IS NULL OR e.validTo > $V))
MATCH (v)-[s:HOLDS_STAKE]->(target:Organization)
WHERE s.recordedTo IS NULL AND (s.validFrom IS NULL OR s.validFrom <= $V) AND (s.validTo IS NULL OR s.validTo > $V)
OPTIONAL MATCH (mm:Person)-[r:HOLDS_ROLE {roleKind:'MANAGING_MEMBER_OR_GENERAL_PARTNER'}]->(v)
RETURN target.name, v.name AS vehicle, [e IN m | {kind: e.controlKind, fromBasis: e.validFromBasis, toBasis: e.validToBasis, a: e.assertionUid}] AS path,
       s.stakePercent, s.stakeBand, s.assertionUid,
       collect(DISTINCT mm.name) AS managingMembers, 'AGGREGATED_OVER_MEMBERS' AS groupLevelLabel
```

- trace: TRACE on the table row ("Entities affiliated with Andreessen Horowitz(1)") and its footnote (FC6 quote 2, names the vehicles and managing members).
- bitemporal episode needed on: PARENT_OF, HOLDS_STAKE, HOLDS_ROLE.

## Q-D7-15

- kind: cypher
- pattern:

```cypher
MATCH (f:Organization {uid: $funder})<-[:AWARDED_BY]-(aw:Award)
WHERE ($since IS NULL OR aw.startDate >= $since)
OPTIONAL MATCH (aw)-[ro:AWARDED_TO]->(rec:Organization)
OPTIONAL MATCH (aw)-[rp:AWARDED_TO]->(pi:Person)
OPTIONAL MATCH (aw)-[:HAS_IDENTIFIER]->(i:Identifier)
RETURN aw.name, aw.instrument, aw.amount, aw.currency, aw.startDate, aw.endDate, aw.datePrecision, aw.programName,
       collect(DISTINCT rec.name) AS recipients, collect(DISTINCT pi.name) AS investigators,
       collect(DISTINCT i.scheme + ':' + i.value) AS awardIds, ro.assertionUid, rp.assertionUid
ORDER BY aw.startDate DESC
```

- trace: TRACE on AWARDED_TO assertions (NIH RePORTER `API_RECORD` selector per project; ARPA-H release text with "contracts", no amount → `amount` null, said "not disclosed").
- bitemporal episode needed on: none (recorded-only; award period is a node property).

## Q-D7-16

- kind: cypher
- pattern:

```cypher
MATCH (p:Person {uid: $person})-[r:HOLDS_STAKE|RECEIVES_VALUE_FROM]->(co:Organization)
MATCH (a:Assertion {uid: r.assertionUid})-[:ASSERTED_BY]->(inst:Organization)        // institution-reported (FCOI)
WHERE inst.organizationKind = 'ACADEMIC_OR_RESEARCH_INSTITUTE'
OPTIONAL MATCH (a)-[:HAS_OBJECT|HAS_SUBJECT]->(aw:Award)                              // the NIH project the report is filed under (qualifier binding)
OPTIONAL MATCH (aw)-[at:AWARDED_TO]->(p)                                               // P is the award's recipient investigator (RePORTER)
RETURN inst.name, co.name, type(r), coalesce(r.stakeKind, r.valueKind), r.valueBucket, a.validObservedAt, aw.awardNumberVerbatim, at IS NOT NULL AS pIsAwardRecipient, a.uid
```

- trace: TRACE on the ProPublica FCOI record row (dataset frozen 2019; `snap.retrievedAt` and the dataset's own cutoff are shown).
- bitemporal episode needed on: HOLDS_STAKE, RECEIVES_VALUE_FROM.

## Q-D7-17

- kind: cypher (disconfirmation)
- pattern:

```cypher
// statements or pages that rely on a role title ("advisor to X") after the role ended
MATCH (use:Assertion)-[:HAS_SUBJECT]->(p:Person), (use)-[:HAS_OBJECT]->(o:Organization)
WHERE use.predicate = 'HOLDS_ROLE' OR use.assertionKind = 'CLAIM'
MATCH (use)-[:HAS_EVIDENCE]->(:SourceLocator)<-[:HAS_LOCATOR]-(s:SourceSnapshot)
WITH p, o, use, coalesce(s.publishedAt, s.observedAt) AS t
MATCH (p)-[r:HOLDS_ROLE]->(o)
WHERE r.recordedTo IS NULL AND r.validTo IS NOT NULL AND r.validTo <= t AND r.assertionUid <> use.uid
RETURN p.name, o.name, r.roleKind, r.validTo, r.validToPrecision, r.validToBasis, r.assertionUid AS endedBy,
       use.uid AS reliesOnRole, t AS statementDate, 'TITLE_USED_AFTER_ROLE_ENDED' AS flag
```

- trace: TRACE on the ending assertion (FC6 "Dr. Pande departed from Andreessen Horowitz in June 2025."; FC1 "B (2011-2017)"; FC4 "Dexcom (September 2020 – Aug 2021)") and on the relying statement (FC4: "I am a paid advisor to Dexcom" in the revision dated 2024-12-09 — `t` is the snapshot's `publishedAt`, the issuer's date for that version, not the article's 2021 date line).
- bitemporal episode needed on: HOLDS_ROLE (validTo with precision).

## Q-D7-18

- kind: cypher (graph part) + query-time external read (Open Payments rows are not stored)
- pattern:

```cypher
MATCH (p:Person {uid: $person}) WHERE 'CLINICIAN_PUBLIC_COMMENTATOR' IN p.publicActorBasis
MATCH (p)-[:HAS_IDENTIFIER]->(npi:Identifier {scheme:'NPI'})
MATCH (occ:Assertion {assertionKind:'CLAIM'})-[:ASSERTED_BY]->(p)
MATCH (occ)-[:HAS_OBJECT]->(thing)<-[:HAS_OBJECT]-(mk:Assertion)-[:HAS_SUBJECT]->(maker:Organization)
  WHERE mk.predicate IN ['MANUFACTURES','CONTRACT_MANUFACTURES_FOR']                                     // predicate-only maker roles (D7-published set, OQ-D7-28)
OPTIONAL MATCH (p)-[r:RECEIVES_VALUE_FROM|HOLDS_STAKE]->(maker)                                          // ties stored from other sources (self-disclosure, filings); never from Open Payments rows
RETURN p.name, npi.value, maker.name, collect(DISTINCT thing.name) AS discussed, collect(r.assertionUid) AS storedTies
// the caller queries CMS Open Payments (general + ownership datasets) for (NPI, manufacturer name) by program year at answer time
```

- trace: TRACE on stored ties; query-time Open Payments rows are cited by dataset id and row key in the ANSWER Report and are never written as edges or Assertions (privacy rule in 09: transaction-level personal payments are not stored; `src:cms-open-payments` is not a populating source of any D7 edge).
- bitemporal episode needed on: RECEIVES_VALUE_FROM, HOLDS_STAKE (program-year bounds, YEAR precision).

## Q-D7-19

- kind: cypher
- pattern:

```cypher
MATCH (b:Brand {uid: $brand})
OPTIONAL MATCH (b)<-[ob:OWNS_BRAND]-(holder:Organization) WHERE ob.recordedTo IS NULL AND (ob.validTo IS NULL OR ob.validTo > datetime())
OPTIONAL MATCH up = (top:Organization)-[:PARENT_OF*0..4]->(holder)
WHERE all(e IN relationships(up) WHERE e.recordedTo IS NULL AND e.controlKind <> 'GROUP_MEMBER_UNSPECIFIED') AND NOT ()-[:PARENT_OF]->(top)
OPTIONAL MATCH (holder)-[:HAS_IDENTIFIER]->(i:Identifier) WHERE i.scheme IN ['LEI','SEC_CIK','NPI','COMPANY_NUMBER']
RETURN b.name, holder.name, holder.legalName, holder.jurisdiction, holder.entityKind, ob.assertionUid,
       collect(DISTINCT i.scheme + ':' + i.value) AS registryIds, top.name AS ultimateParent,
       CASE WHEN holder IS NULL THEN 'ACCOUNTABLE_ENTITY_UNKNOWN' END AS gap
```

- trace: TRACE on the OWNS_BRAND episode (FC9 "ChromaDex Corporation acquired Healthspan Research LLC, a consumer product company offering Tru Niagen® branded products." then "Healthspan Research LLC was dissolved." → holder moves to the parent) and on each PARENT_OF hop.
- bitemporal episode needed on: OWNS_BRAND, PARENT_OF.

## Q-D7-20

- kind: cypher (assessment read; disconfirmation of absence)
- pattern:

```cypher
MATCH (p:Person {uid: $person})
// disclosure sources registered for P (predicate-only DISCLOSES_INTERESTS_OF: subject Source, object Person)
OPTIONAL MATCH (d:Assertion {predicate:'DISCLOSES_INTERESTS_OF'})-[:HAS_OBJECT]->(p)
OPTIONAL MATCH (d)-[:HAS_SUBJECT]->(src:Source)-[:HAS_SNAPSHOT]->(snap:SourceSnapshot)
WITH p, src, snap ORDER BY snap.retrievedAt DESC
WITH p, src, collect(snap)[0] AS latest
OPTIONAL MATCH (cov:Assessment {assessmentKind:'QUALITY'})-[:ASSESSES]->(p) WHERE cov.assessmentSubkind = 'D7.disclosure-coverage' AND cov.recordedTo IS NULL
RETURN p.name, collect({source: src.canonicalUri, retrievedAt: latest.retrievedAt, completeness: latest.captureCompleteness}) AS searched,
       CASE WHEN any(x IN collect(latest.captureCompleteness) WHERE x <> 'COMPLETE') OR count(src) = 0
            THEN 'NOT_FOUND_IN_PARTIAL_CAPTURE' ELSE 'NOT_DISCLOSED_IN_CAPTURED_SOURCES' END AS findingCeiling,
       cov.summary, cov.verdict
```

- trace: every source searched is listed with its snapshot digest, `captureCompleteness` and `observedAt` (kernel); a page that says "may not have yet been added" (FC1 quote 2) or a live list behind a script panel (FC4 /about/, 2026) forces the ceiling to NOT_FOUND_IN_PARTIAL_CAPTURE. An archived complete copy (FC4: the Internet Archive copy of /disclosures/, 2025-09-30) lifts the ceiling only as of its own `observedAt` and only within the list's declared scope ("does not include investments in companies that have no involvement … in my sphere of influence or line of work" → SOURCE_DECLARED_INCOMPLETE). "No conflict" is never produced from a partial capture.
- bitemporal episode needed on: none (snapshot clocks and assessment recorded time).

## Q-D7-21

- kind: cypher
- pattern:

```cypher
MATCH (x:Organization {uid: $company})
OPTIONAL MATCH (sup:Assertion {predicate:'SUPPLIES_MATERIAL'})-[:HAS_SUBJECT]->(s:Organization)      // D7-published predicate (qualifiers exclusivity=, buyer=); D1 declares the edge on promotion
  WHERE EXISTS { (sup)-[:HAS_OBJECT]->(:IngredientMaterial)<-[:DECLARES_COMPONENT]-(:LabelVersion)<-[:HAS_LABEL_VERSION]-(:Package)
                 <-[:HAS_PACKAGE]-(:ProductVariant)<-[:HAS_VARIANT]-(:Product)-[:BRANDED_AS]->(:Brand)<-[:OWNS_BRAND]-(x) }
OPTIONAL MATCH (sole:Assertion {predicate:'SUPPLIES_MATERIAL'})-[:HAS_SUBJECT]->(soleSupplier:Organization)
  WHERE any(q IN sole.qualifiers WHERE q = 'exclusivity=SOLE') AND any(q IN sole.qualifiers WHERE q = 'buyer=' + x.uid)
OPTIONAL MATCH (a:Assertion {predicate:'MANUFACTURER_UNNAMED'})-[:HAS_SUBJECT]->(x)
RETURN x.name, s.name, sup.uid, collect(DISTINCT {supplier: soleSupplier.name, a: sole.uid}) AS soleSources,
       collect(DISTINCT {pred: a.predicate, text: a.valueString, a: a.uid}) AS unnamedParties
```

- trace: TRACE on the 10-K risk-factor and Item 1 spans (FC9: "W.R. Grace & Co.-Conn. (Grace) is our single source for the supply of food-grade NRC." and, unnamed, "We rely on a single manufacturer for the supply of food-grade NRC."; "third-party, FDA-registered contract manufacturers").
- bitemporal episode needed on: none in D7 (supplier and dependence are valid-time Assertions).

## Q-D7-22

- kind: cypher, materialized (projection Activity, method `d7-evidence-backers/v1`, refreshed when D3 study roles or awards change; stored as a D10 COMPARISON/PROFILE Report or a D10 association projection, never as D7 edges)
- pattern:

```cypher
MATCH (c {uid: $compound})                                                  // D1 compound (seam)
MATCH (st)-[:HAS_ARM]->(:StudyArm)-[:HAS_COMPONENT]->(:InterventionComponent)-[:ADMINISTERS]->(:IngredientMaterial)-[:REALIZES_SUBSTANCE|MATERIAL_CONTAINS]->(c)   // D3 + D1 seams
CALL (st) {
  MATCH (st)-[sr:HAS_STUDY_ROLE]->(o:Organization) RETURN o, sr.roleKind AS kind, sr.assertionUid AS a
  UNION
  MATCH (st)-[:HAS_STUDY_ROLE {roleKind:'FUNDING_AWARD'}]->(:Award)-[:AWARDED_BY]->(o:Organization) RETURN o, 'AWARD_FUNDER' AS kind, null AS a
  UNION
  MATCH (st)<-[:REPORTS_ON]-(pub)<-[:HAS_OBJECT]-(:Assertion {predicate:'AUTHORED'})-[:HAS_SUBJECT]->(au:Person)-[r:HOLDS_ROLE]->(o:Organization)
  WHERE r.roleKind IN ['EMPLOYEE','EXECUTIVE_OFFICER','FOUNDER'] RETURN o, 'AUTHOR_EMPLOYER' AS kind, r.assertionUid AS a
}
WITH o, count(DISTINCT st) AS studies, collect(DISTINCT kind) AS kinds, collect(a) AS inputs
WITH collect({o: o, n: studies, kinds: kinds, inputs: inputs}) AS rows, sum(studies) AS total
UNWIND rows AS r
RETURN r.o.name, r.n, r.kinds, toFloat(r.n) / total AS share, r.inputs   // + Herfindahl index over shares in the Report
```

- trace: the Report `DERIVED_FROM` every input assertion (kernel minimum citation set) with `inputSetDigest`; each row cites its D3 role and D7 role assertions.
- bitemporal episode needed on: HOLDS_ROLE (employment at publication date); D3's role episodes.

## Q-D7-23

- kind: gds (materialized as mission leads; never written back as interest edges)
- pattern:

```cypher
// projection: Person–Organization bipartite graph of current interest edges, plus co-occurrence of a person and an
// organization in the same chunk (D9 Chunk.mentions, derived) as a second relationship type with a weight
MATCH (p:Person)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization) WHERE r.recordedTo IS NULL
WITH gds.graph.project('d7-ties', p, o, {relationshipType: 'TIE'}, {undirectedRelationshipTypes: ['*']}) AS g RETURN g.nodeCount;
CALL gds.nodeSimilarity.stream('d7-ties', {topK: 10, similarityCutoff: 0.2}) YIELD node1, node2, similarity
// candidate (person, organization): organizations tied to the person's most similar peers that the person has no edge to
WITH gds.util.asNode(node1) AS p, gds.util.asNode(node2) AS peer, similarity WHERE p:Person AND peer:Person
MATCH (peer)-[:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization)
WHERE NOT (p)-[:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o)
RETURN p.uid, o.uid, sum(similarity) AS leadScore, 'd7-tie-leads/v1' AS method ORDER BY leadScore DESC LIMIT 200
```

- Refresh: weekly, by a PROJECTION Activity; output handed to Mission Control as research-mission leads (an INSIGHT Assessment per accepted lead, `assessmentSubkind: D7.undisclosed-tie-lead`, `score` = leadScore). A lead becomes an edge only when a mission captures a located source.
- trace: none for the score (it is a method output); every lead's explanation lists the peer ties with TRACE.
- bitemporal episode needed on: none (current edges only).

## Q-D7-24

- kind: cypher (assessment read)
- pattern:

```cypher
// experts who discuss target T (D9 occurrences whose object is the D5 Target or a means asserted for it) and their relevant interests
MATCH (t {uid: $target})                                                    // D5 Target node hu:target:<slug>
MATCH (occ:Assertion {assertionKind:'CLAIM'})-[:HAS_OBJECT|HAS_SUBJECT]->(t)
MATCH (occ)-[:ASSERTED_BY]->(p:Person)
OPTIONAL MATCH (sellers:Organization)-[:OWNS_BRAND]->(:Brand)<-[:BRANDED_AS]-(prod)<-[:HAS_SUBJECT]-(fa:Assertion {predicate:'INTENDED_FOR_TARGET'})-[:HAS_OBJECT]->(t)
WITH p, collect(DISTINCT sellers) AS sellerOrgs
OPTIONAL MATCH (p)-[r:HOLDS_ROLE|HOLDS_STAKE|RECEIVES_VALUE_FROM]->(o:Organization) WHERE o IN sellerOrgs AND r.recordedTo IS NULL
OPTIONAL MATCH (cov:Assessment)-[:ASSESSES]->(p) WHERE cov.assessmentSubkind = 'D7.disclosure-coverage' AND cov.recordedTo IS NULL
RETURN p.name, count(r) AS relevantTies, cov.verdict, cov.summary AS completeness
ORDER BY relevantTies ASC
```

- trace: TRACE on each occurrence and each tie; the completeness column comes from Q-D7-20's assessment, so "zero ties" is always printed with its capture ceiling.
- bitemporal episode needed on: interest family.

## Q-D7-25

- kind: cypher
- pattern:

```cypher
MATCH (x:Organization {uid: $company})
MATCH (p:Person)-[r:HOLDS_ROLE]->(x) WHERE r.roleKind IN ['FOUNDER','EXECUTIVE_OFFICER','CHAIR'] AND r.recordedTo IS NULL
OPTIONAL MATCH (p)-[e:HOLDS_ROLE {roleKind:'EMPLOYEE'}]->(emp:Organization) WHERE emp <> x
OPTIONAL MATCH (aw:Award)-[:AWARDED_TO]->(p)
OPTIONAL MATCH (p)-[:HAS_IDENTIFIER]->(orcid:Identifier {scheme:'ORCID'})
OPTIONAL MATCH (au:Assertion {predicate:'AUTHORED'})-[:HAS_SUBJECT]->(p)
RETURN p.name, r.roleKind, orcid.value, collect(DISTINCT {org: emp.name, from: e.validFrom, to: e.validTo}) AS employments,
       collect(DISTINCT aw.awardNumberVerbatim) AS awards, count(DISTINCT au) AS publications
```

- trace: TRACE on roles (DEF 14A bios, Form D) and on ORCID employment records (`API_RECORD` selector, DAY or YEAR precision).
- bitemporal episode needed on: HOLDS_ROLE.

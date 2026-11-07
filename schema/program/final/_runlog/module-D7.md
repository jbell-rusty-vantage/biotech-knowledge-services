# Module D7 — module editor run log (S team, 2026-10-08)

## Inputs

- Worktree `C:/Users/Pinda/Proyectos/Biotech/biotech-knowledge-services-S`, branch `ft/schema-S`, HEAD `e484fd2`.
- `final/decision-report.md` (R-03, R-05..R-07, R-15, R-19, R-20, R-27, R-28, R-30, R-46, R-50, R-52..R-55, R-60, R-67..R-69, R-72, R-77..R-83, R-89, R-91, R-92, R-94 read in full); `final/_work/rulings.yaml` (`global`, `modules.D7`, and every other module's rows that name D7); `final/schema/kernel.graphql`; `final/_runlog/module-K.md` "Kernel changes in synthesis"; `scratchpad/inv/review-open-issues.json` (D7); `scratchpad/inv/inventory-final.md` (D7 seam rows).

```
$ sha256sum packets/D7/04-schema-proposal.graphql packets/D7/05-relationship-register.yaml packets/D7/06-node-register.yaml packets/D7/10-seams.yaml
d691417f5133a1bba863f0e921059947745c7f71e37602ec58f212bacb3936ac  packets/D7/04-schema-proposal.graphql
8f8b0ee432b1600808af413fac805744bdf7677c205a3feb36c6aeb03802dc83  packets/D7/05-relationship-register.yaml
c856a14010e20a4e14d7e23977e70b357e8aaaf0444e7cc1fc8ce761a0df38a1  packets/D7/06-node-register.yaml
16f6f33aaa1a9d663b9e9aaadde841116f38b8c8de1ef3438e7d360d4cebae4b  packets/D7/10-seams.yaml
$ cp packets/D7/04-schema-proposal.graphql final/schema/D7.graphql
```

## SDL edits (`final/schema/D7.graphql`, banner `# ---- fragment D7 ----` kept on line 1)

| ruling | edit |
| --- | --- |
| R-30 | `RoleEdgeProperties.roleTitleVerbatim` removed (Assertion qualifier `roleText:`) |
| R-30 | `StakeEdgeProperties.stakeClassVerbatim` removed (Assertion qualifier `stakeClass:`) |
| R-30 | `ValueEdgeProperties.currency` renamed `unitCode` (`iso4217:<CODE>`) |
| R-30 | docstrings of RoleEdgeProperties, StakeEdgeProperties, ValueEdgeProperties, OrgRoleKind; header synthesis line |

No other ruling requires an SDL change in D7. Node types, relationship types and pairs are unchanged: 4 node types, 7 relationship types, 9 relationship fields = 9 from→to pairs (collapsed and expanded are the same: D7 declares no union and no interface target). The four D7 edge-property types now start with AssertedEdgeProperties' eleven fields verbatim and add only filterable qualifiers (M11).

Not changed (no ruling requires it): `Award.currency` (R-30 names only ValueEdgeProperties), `Organization.legalName` / `status` projections, `PublicActorBasis.SPEAKER_OR_CREATOR`.

## Registers

Written by hand from the packet's 05, 06, 10 (each entry: every contract field plus `module: D7`; `fixture` → `final/fixtures/D7/<folder>`).

- `D7.node.yaml`: `mutations` read per R-03 as `{ graphql: none, executor: unstated, packet: {…} }` (the packet does not state executor operations, nothing invented); deferred Facility closed (R-67), ConflictRelevanceAssessment (R-55, R-20), FinancingRound (R-69, R-92), PseudonymousActor (R-79); mergedInto role rows (R-30).
- `D7.relationship.yaml`: rationales (R-30, R-69, R-78, R-15); every predicate entry names `registrar: D7` (R-52); removed OPERATES_CHANNEL (R-79), AUTHORED (R-80), SPEAKS_AT (R-81), ENDORSES_PRODUCT and RECOMMENDS_USE (R-83), FINANCING_AMOUNT / DATE_OF_FIRST_SALE / INVESTOR_COUNT (R-92), SUCCEEDED_BY (R-52, D6 registrar); added DISTRIBUTES (R-68) and aliases/qualifiers on the manufacturer set (R-68); DISCLOSES_INTERESTS_OF note (R-82); new `authorizingPredicates` list for the seven typed edges (R-53, K precedent); deferred reasons updated (R-67, R-68, R-69, R-79, R-80, R-81, R-82, R-83, R-78, R-47).
- `D7.seams.yaml`: relationship `seams` and `predicateSeams` split (R-94); each row `status` + `ruling`. Cut: OPERATED_BY typed row (R-79), COVERS → Organization (R-67), publisherUid property reference (R-46). CQ-MF-01 dropped from the two D8 ISSUED_BY rows (QualityResult, CertificationListing) per R-67, which leaves them with `questions: []` (kept as inbound hub-split rows; flagged). Predicate rows: D7 manufacturer set (owner this, R-68); OPERATED_BY (D9, R-79), RECOMMENDS_USE (D9, R-83), DISCLOSES_INTEREST (D9, R-82), AUTHORED_BY (D3, R-80), OFFERS_INTERVENTION (D6, R-52), SUCCEEDED_BY (D6, R-52), REPORTED_MARKET_MOVE / FINANCING_AMOUNT / DATE_OF_FIRST_SALE / INVESTOR_COUNT (D13, R-92), EVENT_ABOUT (D13, R-69). Vocabulary pins: targets 0.2.2, frontiers 0.2.1 (R-60). Owner field names re-checked by grep against packets/{D3,D4,D6,D8,D9,D13}/04 (Study.roles, StudyParty = Organization | Person | Award, Publication.reportsOn, AssayVersion.performingLab, Product.brand, LabelVersion.responsibleParty, Offer.sellerOfRecord, RegulatoryRecord.issuedBy/addressedTo, Patent.assignees/licensees, MediaWork.appearances/sponsors, ContentSponsor = Organization | Brand, Chunk.mentions, Event.involvedOrganizations/involvedPeople; CertificationCoverageTarget = Product | ProductVariant | Lot).

Rulings that do not edit these files (carried to the patterns / answer-kind integrator): R-19 (CQ-CL-05, Q-D7-06: T = OCCURS_IN MediaWork.publishedAt with snapshot fallback; in-container disclosure via Source -RENDITION_OF-> work; OVERLAP reads a.validObservedAt through r.assertionUid) and R-50 (Q-D7-22 materialized → retrieved) live in 03 / the answer-kind table.

```
$ python (yaml.safe_load + regex over final/schema/D7.graphql)
node {'version': 1, 'module': 'D7', 'nodes': 4, 'deferred': 9, 'mergedInto': 12}
rel {'version': 1, 'module': 'D7', 'relationships': 7, 'predicateOnly': 18, 'authorizingPredicates': 7, 'deferred': 25}
seams {'version': 1, 'module': 'D7', 'seams': 31, 'predicateSeams': 15, 'sharedVocabularies': 7}
SDL node types ['Organization', 'Person', 'Brand', 'Award'] 4
SDL rel fields 9 distinct 7
nodes match True
rels match True
register pairs 9
rel missing [] / node missing [] / seam missing [] / pseam missing []
predicateOnly & relTypes set()
retired still in predicateOnly set()
status {'accepted': 43, 'cut': 3}
cut rows [('OPERATED_BY', 'R-79'), ('COVERS', 'R-67'), ('publisherUid (property reference)', 'R-46')]
SDL fields ['unitCode', 'currency']          # unitCode = ValueEdgeProperties; currency = Award.currency (unruled)
```

## Compile check

D7 references no type outside the module except kernel types, so no seam stubs were needed (scratch dir `scratchpad/synth/module-D7/`).

```
$ cat final/schema/kernel.graphql final/schema/D7.graphql > synth/module-D7/K+D7.graphql
$ wc -c -l final/schema/D7.graphql synth/module-D7/K+D7.graphql
   465  23299 final/schema/D7.graphql
  1655  79339 K+D7.graphql
$ BKS_SCHEMA_PATH=C:/.../synth/module-D7/K+D7.graphql NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @bks/graphql-api print-schema C:/.../synth/module-D7/K+D7.printed.graphql
wrote ...\synth\module-D7\K+D7.printed.graphql (452056 chars) in 3s
wall: 79 s (first pnpm/tsx start in this shell)
$ BKS_SCHEMA_PATH=C:/.../final/schema/kernel.graphql ... print-schema C:/.../synth/module-D7/K.printed.graphql
wrote ...\synth\module-D7\K.printed.graphql (326571 chars) in 2s
wall: 19 s
$ cat final/schema/kernel.graphql packets/D7/04-schema-proposal.graphql > synth/module-D7/K+D7packet.graphql
$ BKS_SCHEMA_PATH=C:/.../synth/module-D7/K+D7packet.graphql ... print-schema C:/.../synth/module-D7/K+D7packet.printed.graphql
wrote ...\K+D7packet.printed.graphql (453569 chars) in 2s
wall: 12 s
$ for f in ...; wc -c; wc -l; grep -c '^input '; '^enum '; '^type '; '^union '; '^interface '
K.printed.graphql          bytes=326595 lines=6498 input=179 enum=35 type=105 union=0 interface=2
K+D7.printed.graphql       bytes=452102 lines=8821 input=241 enum=48 type=141 union=0 interface=2
K+D7packet.printed.graphql bytes=453615 lines=8837 input=241 enum=48 type=141 union=0 interface=2
$ grep -c "roleTitleVerbatim\|stakeClassVerbatim" K+D7.printed.graphql   -> 0
$ grep -c "^type Award \|^type Brand \|^type Person \|^type Organization " K+D7.printed.graphql -> 4
```

Source confirmation: all outputs are 0.3–0.45 MB, not the ~55 MB pinned fallback; K+D7 contains the four D7 node types and none of the removed R-30 fields, and differs from the packet variant.

| measure | kernel alone | kernel + D7 (final) | D7 marginal | kernel + D7 packet | R-30 effect |
| --- | ---: | ---: | ---: | ---: | ---: |
| printed bytes | 326,595 | 452,102 | +125,507 | 453,615 | −1,513 |
| printed lines | 6,498 | 8,821 | +2,323 | 8,837 | −16 |
| input types | 179 | 241 | +62 | 241 | 0 |
| enums | 35 | 48 | +13 | 48 | 0 |
| object types | 105 | 141 | +36 | 141 | 0 |
| build (print-schema log) | 2 s | 3 s | | 2 s | |

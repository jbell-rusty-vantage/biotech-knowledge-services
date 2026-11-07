---
id: "enum:EventRole"
kind: "enum"
module: "D13"
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:sdl/modules/D13.graphql#L111-L135"]
aliases: ["event role"]
capabilities: ["get"]
cardDigest: "sha256:4a2846f37913ce06bb0903ddb152bbfb2f8445d2cde17c0471e9a068518b2702"
---
# Enum EventRole

Role of an organization or person in an event (INVOLVES). Merges the pinned HOSTS_EVENT, SPEAKS_AT, EXHIBITS_AT and EventRoleEdgeProperties.participantRole strings. What the source printed ('lead investor', 'sole book-running manager') is the authorizing Assertion's qualifier roleText:<label>, never an edge field (kernel rule M11(3)).

Id `enum:EventRole` · module [D13](../modules/D13.md) · 14 values · used by 1 fields · raw SDL [sdl:EventRole](../sdl/EventRole.graphql)

## Values (14)

| value | description |
| --- | --- |
| `SPONSOR` | Runs the trial or program the event is about. |
| `APPLICANT` | Files or holds the application (NDA/BLA/MAA holder). Written only while no D8 RegulatoryRecord documents the event (a submission, a hold); once DOCUMENTED_BY_RECORD exists the applicant is the record… |
| `REGULATOR` | Regulator or agency that acts (holds, rejects, designates, enforces). Written only while no D8 RegulatoryRecord documents the event (a clinical hold or a designation known only from the sponsor); onc… |
| `ISSUER` | Issuer of the securities sold in a FINANCING (registered direct, ATM sales, IPO, follow-on). Written only while no DOCUMENTED_BY_RECORD exists; with one, the issuer is the record's ISSUED_BY (executo… |
| `BORROWER` | Borrower under a loan or credit facility in a FINANCING (adversarial review: the financed party of a loan tranche issues no securities). |
| `INVESTOR` |  |
| `LEAD_INVESTOR` |  |
| `LENDER` |  |
| `UNDERWRITER` | Underwriter, placement agent or at-the-market sales agent; the printed title is the authorizing Assertion's qualifier roleText. |
| `ACQUIRER` |  |
| `ACQUIREE` |  |
| `PARTNER` | Counterparty in a license, collaboration or option deal. |
| `PRESENTER` | Presents data or a paper (conference speaker, presenting author). |
| `OTHER` | Other party; the authorizing Assertion's qualifier roleText says what the source printed. Funder and recipient of an AWARD are not event roles: they are D7 Award AWARDED_BY / AWARDED_TO. |

Any value not listed here is not allowed in this release.

## Used by

- `EventRoleEdgeProperties`.`role`

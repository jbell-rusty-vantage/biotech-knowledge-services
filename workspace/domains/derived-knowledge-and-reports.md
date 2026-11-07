---
id: "dom:derived-knowledge-and-reports"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#derived-knowledge-and-reports"]
aliases: ["derived-knowledge-and-reports","derived knowledge and reports","dom:access-and-answers"]
capabilities: ["get","slice"]
cardDigest: "sha256:877bfd7016a4fc41c6d9808a9bb883eb3d090e225b7a2dbf6425758fd69854ac"
---
# Domain: Derived knowledge, reports, rankings and recommendations

Id `dom:derived-knowledge-and-reports` · modules [D10](../modules/D10.md) · 3 node types · 0 internal relationship types · seams to 2 other domains.

Versioned decision criteria, report items of published reports, and regenerable associations; how BellLabs derives and publishes knowledge from assertions and assessments without becoming a second source of truth.

## Questions this domain answers

- Which criteria versions did this published comparison apply, and which rows were blocked by which constraint?
- Which report items cite an input that has since been superseded?
- What is the current support score of this association, under which method version and input set?

## Write guidance

Reports and report items are insert-only (a revision is a new Report). Associations are projection-job output (create, close, delete only when unreferenced). Cache fields carry method version and derivation time.

## Start with these types

- [DecisionCriterion](../nodes/DecisionCriterion.md) — Purpose: one versioned criterion of a ranking or comparison method ("elemental magnesium per maximum daily dose", "block if the daily dose exceeds th…
- [ReportItem](../nodes/ReportItem.md) — Purpose: one section or one option row of a published kernel Report (comparison, profile, protocol review, evidence report, published answer).
- [Association](../nodes/Association.md) — Purpose: a regenerable score between two entities computed by a projection Activity under a method version (PLAN 6.1 "materialized"): evidence aggreg…
- [Report](../nodes/Report.md) — Purpose: the in-graph skeleton of a published artifact (PLAN 6.1): evidence report (the outcome of an evidence mission, with the verification.v1 verd…

## Node types (3)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [Association](../nodes/Association.md) | D10 | `hu:association:` | Purpose: a regenerable score between two entities computed by a projection Activity under a method version (PLAN 6.1 "materialized"): evide… |
| [DecisionCriterion](../nodes/DecisionCriterion.md) | D10 | `hu:decision-criterion:` | Purpose: one versioned criterion of a ranking or comparison method ("elemental magnesium per maximum daily dose", "block if the daily dose… |
| [ReportItem](../nodes/ReportItem.md) | D10 | `hu:report-item:` | Purpose: one section or one option row of a published kernel Report (comparison, profile, protocol review, evidence report, published answe… |

## Relationship types inside the domain (0)

(none)

## Seams to other domains

### → [exposures-and-interventions](exposures-and-interventions.md) (1)

- [BLOCKED_BY](../relationships/BLOCKED_BY.md) · structural · ReportItem → UseConstraint|Assessment

### → [kernel-and-provenance](kernel-and-provenance.md) (4)

- [BLOCKED_BY](../relationships/BLOCKED_BY.md) · structural · ReportItem → UseConstraint|Assessment
- [DERIVED_FROM](../relationships/DERIVED_FROM.md) · structural · Assertion|Assessment|Report|ReportItem|Association → Assertion|Assessment
- [HAS_ITEM](../relationships/HAS_ITEM.md) · structural · Report → ReportItem
- [USES_CRITERION](../relationships/USES_CRITERION.md) · structural · Report → DecisionCriterion

## Tasks

- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md) (ingestion)

## v1 navigation aliases

- `dom:access-and-answers` (renamed): v1 access/answers/policy domain: answers are kernel Reports, criteria and report items are D10; the private-store boundary has no graph types

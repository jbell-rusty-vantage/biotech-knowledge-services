---
id: "task:claim-to-evidence-report"
kind: "task"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/task-routes.yaml#claim-to-evidence-report"]
aliases: ["claim-to-evidence-report","claim to evidence report"]
capabilities: ["get","slice","propose:assessment.record","propose:adjudication","propose:report.publish"]
cardDigest: "sha256:72f3994a627f3d5d18a587ce1ab778d99cc8ed88341495486de03e67e577c20d"
---
# Task: Take a claim through vetting, an evidence mission and a published evidence report

Id `task:claim-to-evidence-report` · phase **ingestion** · domains [kernel-and-provenance](../domains/kernel-and-provenance.md), [derived-knowledge-and-reports](../domains/derived-knowledge-and-reports.md) · write route

A Claim is vetted by a VETTING Assessment (IGNORE / MONITOR / RESEARCH); an evidence-mission Activity ASSESSES exactly one Claim; SUPPORT Adjudications judge located evidence; the result is a Report (verdict, worldCorrectness) with ReportItems citing locators.

## Elements

- Node types: [Claim](../nodes/Claim.md), [Assertion](../nodes/Assertion.md), [Assessment](../nodes/Assessment.md), [Adjudication](../nodes/Adjudication.md), [Activity](../nodes/Activity.md), [Report](../nodes/Report.md), [ReportItem](../nodes/ReportItem.md), [SourceLocator](../nodes/SourceLocator.md)
- Relationship types: [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md), [ASSESSES](../relationships/ASSESSES.md), [DERIVED_FROM](../relationships/DERIVED_FROM.md), [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md), [WAS_INFORMED_BY](../relationships/WAS_INFORMED_BY.md), [HAS_ITEM](../relationships/HAS_ITEM.md), [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md)
- Read operations (`bks kg read`): `assertion.about`, `assertion.trace`, `node.neighbors`
- Proposal kinds (`biotech-knowledge-intent.v2`): `assessment.record`, `adjudication`, `report.publish`
- Pending proposal kinds: `assessment.record`, `adjudication`, `report.publish` — new or changed in v2; they need the S3 executor-v2 planner before they plan against the v2 IR

## Steps

1. Record the vetting disposition as an Assessment (assessmentKind VETTING) that ASSESSES the Claim and is DERIVED_FROM its occurrences.
2. The mission run is one Activity (runId) that ASSESSES the Claim; child runs chain with WAS_INFORMED_BY (OD-06, OD-07).
3. Adjudications carry a sealed verification ref; publish the Report through `report.publish` (insert-only; a revision is a new Report).

## Pitfalls

- Capture fidelity (ACCEPTED) and located support (SUPPORT verdict) are separate gates; a failed provider cannot support "none exists" without a sealed search-coverage artifact (OD-40).
- Do not rank conflicting asserters by a single "highest verdict" (KN-15).

## Mandatory rules for this route

- [identity-rules](../rules/identity-rules.md)
- [ingestion-rules](../rules/ingestion-rules.md)
- [temporal-rules](../rules/temporal-rules.md)
- [evidence-path](../rules/evidence-path.md)

A budgeted slice keeps these rules even beyond its budget: `bks-schema slice --tasks claim-to-evidence-report --out <dir>`.

## v1 navigation aliases

(none)

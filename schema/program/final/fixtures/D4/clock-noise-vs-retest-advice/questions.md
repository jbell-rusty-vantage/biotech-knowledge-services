# Fixture clock-noise-vs-retest-advice - questions answered

Kind: reliability-gap (relabelled from disconfirmation in the adversarial-review pass). The vendor's advice and naming are recorded as located assertions; the advice is a kernel claim occurrence (b03 OCCURRENCE_OF a Claim); the verdict is a kernel Assessment, never a clock property. No captured source measures DunedinPACE's own replicate noise, so the evidence qualifies the advice and does not contradict it.

| question | expected answer from this fixture | rests on |
| --- | --- | --- |
| CQ-DX-05 | For the TruAge DunedinPACE™ pipeline: **no reliability source** (verdict NO_RELIABILITY_SOURCE). The publication version has ICC 0.96 (450k replicates; points toward reliability); other CpG clocks show replicate deviations of 0.9-2.4 years median, up to 8.6 years max (QUALIFIES, class-level); nothing ties those numbers to this pipeline. | s01; b04, b05, b07; ../dunedinpace-paper-unstructured a06 |
| Q-D4-05 | "Retest every 3 months to track your progress" (located vendor advice, b03, a claim occurrence of the Claim "retesting TruAge every 3 months tracks progress"; the vendor's only nearby rationale is "*Based on the last 2-3 months") cannot be shown to detect real change: change detectability **not established** for this pipeline. | s01, b03, r1-retest, r4-window |
| Q-D4-15 | A biological-age "improvement" between two TruAge tests rests on one vendor pipeline with unstated version and no published replicate noise -> the claim's support is incomplete (input to a D4.bio-age-claim-disconfirmation assessment; no specific claim captured here). | s01 |
| Q-D4-04 | TruAge reports DunedinPACE™ via an exclusively licensed algorithm; version: NOT_REPORTED; array: NOT_REPORTED (1,000,000+ sites stated); lab: NOT_REPORTED; reliability source: none in the captured page or sample report. | b01, b07, t4-sites, r0-whole |
| Q-D4-06 | The vendor DunedinPACE™ is a distinct AlgorithmVersion (VENDOR_IMPLEMENTATION, versionBasis UNKNOWN) DERIVED_FROM the publication version; equivalence UNRESOLVED. | b02, s02 |
| Q-D4-20 | DunedinPACE is offered by TruDiagnostic (licensed; sample report header "DEVELOPED WITH DUKE"); the publication behind it is Belsky et al. 2022. | b02, r3-duke |

Contrast (weighed, not adopted): Elysium claims (b06, a claim occurrence of its own Claim) its Index agrees across technical replicates "within zero to 1.5 years" while stating that a single sample can vary "up to nine years" on other clocks - a manufacturer claim (b06) that would need the cited replicate study to count as a reliability source.

---
id: "dom:kernel-and-provenance"
kind: "domain"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/domains.yaml#kernel-and-provenance"]
aliases: ["kernel-and-provenance","kernel and provenance"]
capabilities: ["get","slice"]
cardDigest: "sha256:5449ab1b583eac3b0b990d41e09b92a510e9069dfca271eb4b4279aaae73c74b"
---
# Domain: Kernel, identity, time and provenance

Id `dom:kernel-and-provenance` · modules [K](../modules/K.md) · 11 node types · 8 internal relationship types · seams to 5 other domains.

The parts every other domain depends on: uid identity and archetype labels, bitemporal time, the Assertion that authorizes every source-derived edge, the Source / SourceSnapshot / SourceLocator evidence chain, Claims and their occurrences, Adjudications, Assessments, Reports, Activity / Agent lineage and Identifier records.

## Questions this domain answers

- Which located source span supports this assertion (HAS_EVIDENCE role and origin), and who adjudicated it?
- Is this statement a claim occurrence (Assertion assertionKind CLAIM, OCCURRENCE_OF its Claim), and who repeated it?
- What external identifiers does this record carry, under which normalization rule and issuer?
- Which Mission Control run (Activity runId) wrote this record, and what did it read (DERIVED_FROM, ASSESSES)?

## Write guidance

Never write an asserted edge without its Assertion (ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT) and at least one HAS_EVIDENCE to a SourceLocator. recordedAt / recordedFrom are service-assigned; nothing is deleted: a correction is a superseding Assertion (supersedesUid, same asserter) and the old episode is closed with recordedTo. An unresolved surface form is a SourceLocator cited by a RESOLUTION Assessment, never a node. Executor permissions come from the node register (mutations.executor); the GraphQL API has no mutations.

## Start with these types

- [Assertion](../nodes/Assertion.md) — Purpose: one attributable proposition (verification.v1 Assertion): exactly one subject, exactly one object or one typed literal, exactly one asserter…
- [Source](../nodes/Source.md) — Purpose: stable identity of one retrieval endpoint (one normalized canonicalUri): a page, registry record, PDF, API record, feed item or media file.
- [SourceSnapshot](../nodes/SourceSnapshot.md) — Purpose: immutable capture of a Source at a retrieval time (verification.v1 VerificationSourceCapture): the bytes that every claim must trace to.
- [SourceLocator](../nodes/SourceLocator.md) — Purpose: reproducible selector for the exact span, cell, page region, JSON pointer or media time range of one SourceSnapshot (verification.v1 SourceF…
- [Claim](../nodes/Claim.md) — Purpose: the proposition itself, independent of who said it (00-DIRECTIVE 3.4): the unit that is vetted, monitored, researched and reported on.
- [Adjudication](../nodes/Adjudication.md) — Purpose: one verification.v1 judgment about one Assertion, immutable (a re-review is a new node naming `supersedesUid`).
- [Assessment](../nodes/Assessment.md) — Purpose: an immutable, versioned, supersedable judgment asserted by an agent or analyst with named inputs (PLAN 6.1 "assessment"): claim vetting (wit…
- [Report](../nodes/Report.md) — Purpose: the in-graph skeleton of a published artifact (PLAN 6.1): evidence report (the outcome of an evidence mission, with the verification.v1 verd…
- [Identifier](../nodes/Identifier.md) — Purpose: an external identifier string with scheme and issuer (PMID, DOI, NCT, UNII, CAS, GTIN, LOINC, ...; the scheme register is packets/K/identifi…
- [Activity](../nodes/Activity.md) — Purpose: the single lineage spine (00-DIRECTIVE 4).
- [Agent](../nodes/Agent.md) — Purpose: a software or human-operated agent identity (executor, extraction model + prompt + skill, verifier, analyst seat).

## Node types (11)

| type | module | uid token | summary |
| --- | --- | --- | --- |
| [Activity](../nodes/Activity.md) | K | `hu:activity:` | Purpose: the single lineage spine (00-DIRECTIVE 4). |
| [Adjudication](../nodes/Adjudication.md) | K | `hu:adjudication:` | Purpose: one verification.v1 judgment about one Assertion, immutable (a re-review is a new node naming `supersedesUid`). |
| [Agent](../nodes/Agent.md) | K | `hu:agent:` | Purpose: a software or human-operated agent identity (executor, extraction model + prompt + skill, verifier, analyst seat). |
| [Assertion](../nodes/Assertion.md) | K | `hu:assertion:` | Purpose: one attributable proposition (verification.v1 Assertion): exactly one subject, exactly one object or one typed literal, exactly on… |
| [Assessment](../nodes/Assessment.md) | K | `hu:assessment:` | Purpose: an immutable, versioned, supersedable judgment asserted by an agent or analyst with named inputs (PLAN 6.1 "assessment"): claim ve… |
| [Claim](../nodes/Claim.md) | K | `hu:claim:` | Purpose: the proposition itself, independent of who said it (00-DIRECTIVE 3.4): the unit that is vetted, monitored, researched and reported… |
| [Identifier](../nodes/Identifier.md) | K | `hu:identifier:` | Purpose: an external identifier string with scheme and issuer (PMID, DOI, NCT, UNII, CAS, GTIN, LOINC, ...; the scheme register is packets/… |
| [Report](../nodes/Report.md) | K | `hu:report:` | Purpose: the in-graph skeleton of a published artifact (PLAN 6.1): evidence report (the outcome of an evidence mission, with the verificati… |
| [Source](../nodes/Source.md) | K | `hu:source:` | Purpose: stable identity of one retrieval endpoint (one normalized canonicalUri): a page, registry record, PDF, API record, feed item or me… |
| [SourceLocator](../nodes/SourceLocator.md) | K | `hu:locator:` | Purpose: reproducible selector for the exact span, cell, page region, JSON pointer or media time range of one SourceSnapshot (verification.… |
| [SourceSnapshot](../nodes/SourceSnapshot.md) | K | `hu:snapshot:` | Purpose: immutable capture of a Source at a retrieval time (verification.v1 VerificationSourceCapture): the bytes that every claim must tra… |

## Relationship types inside the domain (8)

| type | class | temporal | endpoints |
| --- | --- | --- | --- |
| [ASSESSES](../relationships/ASSESSES.md) | structural | recorded-only | Adjudication\|Assessment\|Report\|Activity\|ReportItem → Assertion\|Subjectable |
| [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) | structural | recorded-only | Assertion\|Adjudication\|Assessment\|Report → SourceLocator |
| [HAS_LOCATOR](../relationships/HAS_LOCATOR.md) | structural | recorded-only | SourceSnapshot → SourceLocator |
| [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) | structural | recorded-only | Source → SourceSnapshot |
| [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md) | structural | recorded-only | Assertion → Claim |
| [WAS_ASSOCIATED_WITH](../relationships/WAS_ASSOCIATED_WITH.md) | structural | recorded-only | Activity → Agent |
| [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) | structural | recorded-only | Assertion\|Adjudication\|Assessment\|Report\|Entity → Activity |
| [WAS_INFORMED_BY](../relationships/WAS_INFORMED_BY.md) | structural | recorded-only | Activity → Activity |

## Seams to other domains

### → [derived-knowledge-and-reports](derived-knowledge-and-reports.md) (4)

- [BLOCKED_BY](../relationships/BLOCKED_BY.md) · structural · ReportItem → UseConstraint|Assessment
- [DERIVED_FROM](../relationships/DERIVED_FROM.md) · structural · Assertion|Assessment|Report|ReportItem|Association → Assertion|Assessment
- [HAS_ITEM](../relationships/HAS_ITEM.md) · structural · Report → ReportItem
- [USES_CRITERION](../relationships/USES_CRITERION.md) · structural · Report → DecisionCriterion

### → [exposures-and-interventions](exposures-and-interventions.md) (1)

- [RESOLVES_TO_CONSTRAINT](../relationships/RESOLVES_TO_CONSTRAINT.md) · derived · Assertion → UseConstraint

### → [sources-documents-and-media](sources-documents-and-media.md) (4)

- [CHUNK_OF](../relationships/CHUNK_OF.md) · structural · Chunk → SourceSnapshot
- [COVERS_LOCATOR](../relationships/COVERS_LOCATOR.md) · derived · Chunk → SourceLocator
- [OCCURS_IN](../relationships/OCCURS_IN.md) · structural · Assertion → MediaWork
- [RENDITION_OF](../relationships/RENDITION_OF.md) · asserted · Source → Publication|MediaWork

### → [studies-and-evidence](studies-and-evidence.md) (1)

- [RENDITION_OF](../relationships/RENDITION_OF.md) · asserted · Source → Publication|MediaWork

### → [substances-and-biology](substances-and-biology.md) (1)

- [OBSERVED_IN_CONTEXT](../relationships/OBSERVED_IN_CONTEXT.md) · structural · Assertion → MechanismEvidenceContext

## Tasks

- [What do we already know about X? (run before every research mission)](../tasks/what-do-we-know-about-entity.md) (before-research)
- [Should I update an existing node or create a new one?](../tasks/decide-update-or-create.md) (before-ingestion)
- [Attach an external identifier to a node](../tasks/attach-identifier.md) (ingestion)
- [Trace an assertion to its source span and adjudication](../tasks/trace-answer-to-source.md) (query)
- [Correct or end a fact that is no longer true](../tasks/correct-a-stale-fact.md) (ingestion)
- [Stage something you found but cannot resolve or place](../tasks/stage-unresolved-mention.md) (ingestion)
- [Take a claim through vetting, an evidence mission and a published evidence report](../tasks/claim-to-evidence-report.md) (ingestion)

## v1 navigation aliases

(none)

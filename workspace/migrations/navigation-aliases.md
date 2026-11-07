---
id: "migration:navigation-aliases"
kind: "migration"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/aliases.yaml"]
aliases: ["navigation-aliases","v1 workspace ids (domains, fragments, tasks, terms)"]
capabilities: ["get"]
cardDigest: "sha256:9ab4a58404c9a3b542973eb4c96ff6011999e792763412c209d8de05053f27c1"
---
# v1 workspace ids (domains, fragments, tasks, terms)

Navigation only: how a v1-proposal name maps to release biotech-schema-v2.2.0. This is never an execution script; data migration is owned by S8. A removed concept points here, never at a silently substituted type. Legend: [README](README.md).

| v1 id | kind | to | see also | explanation |
| --- | --- | --- | --- | --- |
| `dom:access-and-answers` | renamed | [dom:derived-knowledge-and-reports](../domains/derived-knowledge-and-reports.md) |  | v1 access/answers/policy domain: answers are kernel Reports, criteria and report items are D10; the private-store boundary has no graph types |
| `dom:actors-and-institutions` | kept | [dom:actors-and-institutions](../domains/actors-and-institutions.md) |  | domain kept; v1 fragments W01 are now release modules (workspace-inputs/domains.yaml) |
| `dom:diagnostics-and-devices` | kept | [dom:diagnostics-and-devices](../domains/diagnostics-and-devices.md) |  | domain kept; v1 fragments W07, W08 are now release modules (workspace-inputs/domains.yaml) |
| `dom:exposures-and-interventions` | kept | [dom:exposures-and-interventions](../domains/exposures-and-interventions.md) |  | domain kept; v1 fragments W05, W06, W16, W17 are now release modules (workspace-inputs/domains.yaml) |
| `dom:kernel-and-provenance` | kept | [dom:kernel-and-provenance](../domains/kernel-and-provenance.md) |  | domain kept; v1 fragments W00 are now release modules (workspace-inputs/domains.yaml) |
| `dom:manufacturing-quality-regulatory-ip` | kept | [dom:manufacturing-quality-regulatory-ip](../domains/manufacturing-quality-regulatory-ip.md) |  | domain kept; v1 fragments W11, W12, W13, W14 are now release modules (workspace-inputs/domains.yaml) |
| `dom:products-and-commerce` | kept | [dom:products-and-commerce](../domains/products-and-commerce.md) |  | domain kept; v1 fragments W04, W15 are now release modules (workspace-inputs/domains.yaml) |
| `dom:seam-closure` | removed | — |  | v1 seam-closure domain: no seam module in v2 |
| `dom:sources-documents-and-media` | kept | [dom:sources-documents-and-media](../domains/sources-documents-and-media.md) |  | domain kept; v1 fragments W18, W19, W20, W21, W22 are now release modules (workspace-inputs/domains.yaml) |
| `dom:studies-and-evidence` | kept | [dom:studies-and-evidence](../domains/studies-and-evidence.md) |  | domain kept; v1 fragments W09, W10 are now release modules (workspace-inputs/domains.yaml) |
| `dom:substances-and-biology` | kept | [dom:substances-and-biology](../domains/substances-and-biology.md) |  | domain kept; v1 fragments W02, W03 are now release modules (workspace-inputs/domains.yaml) |
| `frag:SEAM` | removed | — |  | v1 seam-closure fragment: v2 has no seam module; its RecommendableTarget union was replaced by the kernel Subjectable pattern (a recommendation is a claim occurrence with speechAct RECOMMENDS) |
| `frag:W00` | merged | [frag:K](../modules/K.md) |  | v1 fragment W00 (kernel: archetypes, identity, time, assertion, evidence provenance) |
| `frag:W01` | merged | [frag:D7](../modules/D7.md) |  | v1 fragment W01 (actors and institutions -> D7 organizations, people and money) |
| `frag:W02` | merged | [frag:D1](../modules/D1.md) |  | v1 fragment W02 (substances and materials -> D1 compounds and ingredients) |
| `frag:W03` | merged | [frag:D2](../modules/D2.md) |  | v1 fragment W03 (biology and mechanisms -> D2 mechanisms and biology of aging) |
| `frag:W04` | merged | [frag:D6](../modules/D6.md) |  | v1 fragment W04 (products, formulations and labels -> D6 (FormulationVersion folded into LabelVersion)) |
| `frag:W05` | split | [frag:D12](../modules/D12.md), [frag:D5](../modules/D5.md) |  | v1 fragment W05 (food -> D12 food and nutrition; lifestyle and exposures -> D5 Intervention) |
| `frag:W06` | merged | [frag:D5](../modules/D5.md) |  | v1 fragment W06 (treatments, procedures and modalities -> D5 Intervention) |
| `frag:W07` | merged | [frag:D4](../modules/D4.md) |  | v1 fragment W07 (diagnostics and measurement -> D4) |
| `frag:W08` | merged | [frag:D4](../modules/D4.md) |  | v1 fragment W08 (platforms, instruments and devices -> D4 Device / AssayVersion) |
| `frag:W09` | merged | [frag:D3](../modules/D3.md) |  | v1 fragment W09 (studies, interventions and results -> D3) |
| `frag:W10` | split | [frag:K](../modules/K.md), [frag:D3](../modules/D3.md) |  | v1 fragment W10 (evidence assessment, applicability and synthesis -> kernel Assessment kinds (K) over D3 evidence) |
| `frag:W11` | merged | [frag:D8](../modules/D8.md) |  | v1 fragment W11 (manufacturing and specifications -> D8 (capability is the HAS_CAPABILITY_STAGE predicate)) |
| `frag:W12` | merged | [frag:D8](../modules/D8.md) |  | v1 fragment W12 (quality testing and certification -> D8 QualityResult / CertificationListing) |
| `frag:W13` | merged | [frag:D8](../modules/D8.md) |  | v1 fragment W13 (regulation and jurisdictions -> D8 RegulatoryRecord / LegalStatus) |
| `frag:W14` | merged | [frag:D8](../modules/D8.md) |  | v1 fragment W14 (intellectual property and licensing -> D8 Patent) |
| `frag:W15` | merged | [frag:D6](../modules/D6.md) |  | v1 fragment W15 (commerce and access to products -> D6 MerchantListing / Offer) |
| `frag:W16` | merged | [frag:D5](../modules/D5.md) |  | v1 fragment W16 (protocols and public workflow definitions -> D5 Protocol / ProtocolEdition / ProtocolStep) |
| `frag:W17` | merged | [frag:D5](../modules/D5.md) |  | v1 fragment W17 (safety and use constraints -> D5 UseConstraint (safety signals are SAFETY_SIGNAL Assessments)) |
| `frag:W18` | split | [frag:D9](../modules/D9.md), [frag:D13](../modules/D13.md) |  | v1 fragment W18 (communities -> D9 Channel; events and narrative arcs -> D13 Event and D10 / kernel Reports) |
| `frag:W19` | split | [frag:K](../modules/K.md), [frag:D11](../modules/D11.md) |  | v1 fragment W19 (source intelligence -> kernel Source / SOURCE_AUTHORITY Assessments and D11 CaptureAttempt) |
| `frag:W20` | split | [frag:K](../modules/K.md), [frag:D9](../modules/D9.md) |  | v1 fragment W20 (documents and text versions -> kernel Source / SourceSnapshot; chunks -> D9 Chunk) |
| `frag:W21` | split | [frag:D9](../modules/D9.md), [frag:K](../modules/K.md) |  | v1 fragment W21 (narrative media and speakers -> D9 Channel / MediaWork; claims -> kernel Claim and claim-occurrence Assertions) |
| `frag:W22` | merged | [frag:D9](../modules/D9.md) |  | v1 fragment W22 (media assets -> D9 MediaWork (IMAGE works); regions are SourceLocators; depiction and rights are predicate-only / custody metadata) |
| `frag:W23` | split | [frag:D10](../modules/D10.md), [frag:K](../modules/K.md) |  | v1 fragment W23 (access, answers and policy -> kernel Report and D10 DecisionCriterion / ReportItem; private context lives outside the graph) |
| `task:attach-identifier` | kept | [task:attach-identifier](../tasks/attach-identifier.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:correct-a-stale-fact` | kept | [task:correct-a-stale-fact](../tasks/correct-a-stale-fact.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:decide-update-or-create` | kept | [task:decide-update-or-create](../tasks/decide-update-or-create.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:ingest-mechanism-evidence` | kept | [task:ingest-mechanism-evidence](../tasks/ingest-mechanism-evidence.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:ingest-organization-profile` | kept | [task:ingest-organization-profile](../tasks/ingest-organization-profile.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:ingest-podcast-claims` | kept | [task:ingest-podcast-claims](../tasks/ingest-podcast-claims.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:ingest-product-label` | kept | [task:ingest-product-label](../tasks/ingest-product-label.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:ingest-regulatory-filing` | kept | [task:ingest-regulatory-filing](../tasks/ingest-regulatory-filing.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:ingest-study-publication` | kept | [task:ingest-study-publication](../tasks/ingest-study-publication.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:record-price-observation` | kept | [task:record-price-observation](../tasks/record-price-observation.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:stage-unresolved-mention` | kept | [task:stage-unresolved-mention](../tasks/stage-unresolved-mention.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:trace-answer-to-source` | kept | [task:trace-answer-to-source](../tasks/trace-answer-to-source.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `task:what-do-we-know-about-entity` | kept | [task:what-do-we-know-about-entity](../tasks/what-do-we-know-about-entity.md) |  | task route kept, rewritten on the v2 kernel pattern |
| `term:biomarker` | kept | `term:biomarker` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:certificate-of-analysis` | kept | `term:certificate-of-analysis` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:claim` | kept | `term:claim` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:clinical-trial` | kept | `term:clinical-trial` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:company` | kept | `term:company` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:compound` | kept | `term:compound` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:condition` | kept | `term:condition` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:document` | kept | `term:document` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:event` | kept | `term:event` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:evidence` | kept | `term:evidence` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:identifier` | kept | `term:identifier` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:ingredient` | kept | `term:ingredient` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:label` | kept | `term:label` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:manufacturing` | kept | `term:manufacturing` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:mechanism` | kept | `term:mechanism` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:media` | kept | `term:media` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:paper` | kept | `term:paper` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:patent` | kept | `term:patent` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:person` | kept | `term:person` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:podcast` | kept | `term:podcast` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:price` | kept | `term:price` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:privacy` | kept | `term:privacy` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:protocol` | kept | `term:protocol` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:regulatory` | kept | `term:regulatory` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:run` | kept | `term:run` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:safety` | kept | `term:safety` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:supplement` | kept | `term:supplement` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:time` | kept | `term:time` |  | term kept with v2 ids; its v1 type names are search aliases |
| `term:treatment` | kept | `term:treatment` |  | term kept with v2 ids; its v1 type names are search aliases |

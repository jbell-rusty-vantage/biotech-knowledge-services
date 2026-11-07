---
id: "rule:ingestion-rules"
kind: "rule"
module: null
schemaReleaseDigest: "sha256:2df9d3bc0548b92d317fc27ee1e3283fb6326a15709f199457423b6d9b025a74"
sourceRefs: ["release:workspace-inputs/ingestion-rules.yaml","release:validation/validation-params.json"]
aliases: ["ingestion-rules","ingestion rules"]
capabilities: ["get","slice"]
cardDigest: "sha256:83b982025eea28f85c89a656285c5401d5cd23989cd8b515c127d32524058249"
---
# Ingestion rules (enforced by the planner)

Authority: workspace input `ingestion-rules.yaml` and `validation/validation-params.json` of the pinned release.

## Relationship classes

| class | proposal kind | rule |
| --- | --- | --- |
| asserted | edge.assert | One Assertion per episode (assertionKind RELATIONSHIP, predicate = the edge type, ASSERTED_BY, HAS_SUBJECT, HAS_OBJECT). The edge carries relationshipUid, assertionUid and recordedFrom; episode types (AssertedEdgeProperties and module episode profiles) also carry the validity copied from the Assertion. At least one HAS_EVIDENCE {role: SUPPORTS} to a SourceLocator. Exclusive types reject an overlapping episode of the same asserter only. |
| structural | edge.structural | Containment, curated reference links and provenance plumbing. No Assertion is minted; evidence is optional but recorded on the plan when given. Only creatable on node types whose register executorOps allow the write. |
| derived | (read-only) | Regenerable projections (mechanism projection, chunk mentions, associations, constraint resolution). Read-only for intents; the projection Activity writes them with projectionOfAssertionUid / derivationRule / derivedAt. A proposal naming a derived type is rejected with DERIVED_EDGE_READ_ONLY. |

## Kernel plumbing the executor writes for you

| purpose | relationship type |
| --- | --- |
| assertionSubject | [HAS_SUBJECT](../relationships/HAS_SUBJECT.md) |
| assertionObject | [HAS_OBJECT](../relationships/HAS_OBJECT.md) |
| assertionAsserter | [ASSERTED_BY](../relationships/ASSERTED_BY.md) |
| assertionSupport | [HAS_EVIDENCE](../relationships/HAS_EVIDENCE.md) |
| assertionGeneratedBy | [WAS_GENERATED_BY](../relationships/WAS_GENERATED_BY.md) |
| claimOccurrence | [OCCURRENCE_OF](../relationships/OCCURRENCE_OF.md) |
| assessmentTarget | [ASSESSES](../relationships/ASSESSES.md) |
| derivationInput | [DERIVED_FROM](../relationships/DERIVED_FROM.md) |
| sourceSnapshot | [HAS_SNAPSHOT](../relationships/HAS_SNAPSHOT.md) |
| snapshotLocator | [HAS_LOCATOR](../relationships/HAS_LOCATOR.md) |
| identifierLink | [HAS_IDENTIFIER](../relationships/HAS_IDENTIFIER.md) |
| activityAgent | [WAS_ASSOCIATED_WITH](../relationships/WAS_ASSOCIATED_WITH.md) |
| activityInformedBy | [WAS_INFORMED_BY](../relationships/WAS_INFORMED_BY.md) |

## Edge-property profiles

| profile | set by the executor |
| --- | --- |
| [AssertedEdgeProperties](../edge-properties/AssertedEdgeProperties.md) | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |
| [AssertedRecordedProperties](../edge-properties/AssertedRecordedProperties.md) | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |
| [IdentifierLinkProperties](../edge-properties/IdentifierLinkProperties.md) | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |
| [StructuralEdgeProperties](../edge-properties/StructuralEdgeProperties.md) | `lastWriterRunId` |
| [EvidenceEdgeProperties](../edge-properties/EvidenceEdgeProperties.md) | `lastWriterRunId` |
| [DerivedEdgeProperties](../edge-properties/DerivedEdgeProperties.md) | `projectionOfAssertionUid`, `derivationRule`, `derivedFromAssertionUids`, `derivedFromAssessmentUids`, `derivedAt`, `lastWriterRunId` |
| [AppearanceEdgeProperties](../edge-properties/AppearanceEdgeProperties.md) | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |
| [ComponentLineProperties](../edge-properties/ComponentLineProperties.md) | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |
| [ContentEdgeProperties](../edge-properties/ContentEdgeProperties.md) | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |
| [ControlEdgeProperties](../edge-properties/ControlEdgeProperties.md) | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |
| [EventRoleEdgeProperties](../edge-properties/EventRoleEdgeProperties.md) | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |
| [ExposureRoleProperties](../edge-properties/ExposureRoleProperties.md) | `lastWriterRunId` |
| [FoodContentProperties](../edge-properties/FoodContentProperties.md) | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |
| [MechanismProjectionProperties](../edge-properties/MechanismProjectionProperties.md) | `projectionOfAssertionUid`, `derivationRule`, `derivedFromAssertionUids`, `derivedFromAssessmentUids`, `derivedAt`, `lastWriterRunId` |
| [MechanismReferenceProperties](../edge-properties/MechanismReferenceProperties.md) | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |
| [RevisionEdgeProperties](../edge-properties/RevisionEdgeProperties.md) | `relationshipUid`, `assertionUid`, `recordedFrom`, `lastWriterRunId` |
| [RoleEdgeProperties](../edge-properties/RoleEdgeProperties.md) | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |
| [StakeEdgeProperties](../edge-properties/StakeEdgeProperties.md) | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |
| [StudyRoleEdgeProperties](../edge-properties/StudyRoleEdgeProperties.md) | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |
| [ValueEdgeProperties](../edge-properties/ValueEdgeProperties.md) | `relationshipUid`, `assertionUid`, `validFrom`, `validTo`, `validFromPrecision`, `validToPrecision`, `validFromBasis`, `validToBasis`, `recordedFrom`, `lastWriterRunId` |

## Defaults

- Assertion: `status`=`EXTRACTED`, `polarity`=`POSITIVE`, `speechAct`=`STATES`, `basisKind`=`UNSTATED`, `assertionKindForEdges`=`RELATIONSHIP`, `validFromBasis`=`UNKNOWN`, `validToBasis`=`UNKNOWN`, `precisionWhenBoundGiven`=`DAY`
- Node: `privacyClass`=`PUBLIC`

## Uid minting

Pattern `hu:<token>:<opaque>`; tokens from `validation/validation-params.json#uidTypeTokens`; slug rule: lowercase, ascii, hyphen-separated, max 80 chars; collisions get a short digest suffix.

| minted record | pattern |
| --- | --- |
| assertion | `hu:assertion:<proposalId>-<intentDigest8>` |
| relationship | `hu:rel:<TYPE-lowercase>-<intentDigest8>-<n>` |
| identifier | `hu:identifier:<scheme-lowercase>-<normalized-value-slug>` |
| activity | `hu:activity:<externalRunSystem>-<runId-slug>` |
| source | `hu:source:<canonical-uri-digest>` |
| snapshot | `hu:snapshot:<sourceSlug>-<contentHash8>` |
| locator | `hu:locator:<snapshotSlug>-<selectorDigest8>` |
| assessment | `hu:assessment:<kind-lowercase>-<inputSetDigest8>` |
| adjudication | `hu:adjudication:<judgmentId-slug>` |
| report | `hu:report:<reportKind-lowercase>-<bodyDigest8>` |

## Denied

- DELETE and DETACH DELETE never appear in a compiled knowledge-agent plan (projection jobs may delete only unreferenced regenerable records, register executorOps delete / delete-unreferenced).
- No proposal rewrites uid, id, createdAt, recordedAt, recordedFrom or any @timestamp / @id property.
- No proposal sets a property that the schema marks @settable(onUpdate: false) on an existing node.
- No proposal targets a relationship type of class derived.
- No private-personal uid prefix (hu:private-, urn:hu:private, hu:user-context:, ...) is ever written to the shared graph.
- No node is created or updated unless the node register's executorOps for its type allow the operation (GraphQL @mutation is irrelevant).
- No predicate outside vocabularies/predicates.yaml status registered is written; alias-of names are re-keyed first, retired and unknown names are rejected.
- No identifier scheme with writeStatus disabled is attached.
- No qualifier name outside vocabularies/qualifiers.yaml is written.
- No knowledge-agent proposal writes an operational name of rules/operational-names.yaml (LegacyV0, LegacyV0_<Label>, MIGRATED_FROM, legacyLabels, legacyExportDigest, legacy:* qualifiers, Ks* markers); only the migrator and executor internals write them, under the KsWriteFence.

## Predicate admission

- Aliases are re-keyed before ingest (39 aliases); retired predicates are rejected (34); only active identifier schemes are written (52).

## Forbidden implications (8)

A premise on the left never licenses the conclusion on the right.

- `HOLDS_ROLE` ⇏ `RECOMMENDS_USE` — a role (advisor, employee, officer) never implies a recommendation or endorsement (pinned ADVISES_ORGANIZATION -> ENDORSES_PRODUCT; migration-notes 5.7 ingest-…
- `RECEIVES_VALUE_FROM` ⇏ `RECOMMENDS_USE` — a financial interest never implies a recommendation (pinned HAS_FINANCIAL_INTEREST -> ENDORSES_PRODUCT)
- `CONTENT_SPONSORED_BY` ⇏ `RECOMMENDS_USE` — sponsorship of content never implies endorsement (pinned SPONSORS_CONTENT -> ENDORSES_PRODUCT)
- `HOLDS_STAKE` ⇏ `OWNS_BRAND` — a stake never implies brand ownership (MD-D7-08: OWNS_BRAND requires ownership evidence)
- `OPERATED_BY` ⇏ `OWNS_BRAND` — operating a brand or channel is not ownership (MD-D7-08)
- `LISTING_FOR` ⇏ `SELLER_OF_RECORD` — hosting a listing never implies being the seller of record (pinned HOSTS_LISTING -> SELLS_PRODUCT)
- `MEASURED_CONTENT_IN_PRODUCT` ⇏ `DECLARES_COMPONENT` — a lab measurement never becomes a label declaration (FX-05)
- `LICENSED_TO` ⇏ `STATUS_OF` — licence validity never implies market presence or approval status (MD-D8-02, MD-D10-05)

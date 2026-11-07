/**
 * Domain admission, revocation delivery, serving rechecks and knowledge-artifacts custody (S7).
 * Re-exported from `@bks/kg-ops` (packages/kg-ops/src/index.ts, S7 patch P1).
 *
 */
export { ADMISSION_LEDGER_V1, emptyLedger, FileAdmissionLedger, MemoryAdmissionLedger, scopeKeyOf, type AdmissionLedger, type IssuanceEntry, type LedgerState, type OutboxEntry, type RevocationEntry, type RevocationKind } from "./ledger.js";
export {
  authorityUnavailable,
  CustodyEvidenceSource,
  evaluateGrant,
  FileGrantSource,
  FileVerificationStateSource,
  GRANT_REGISTRY_V1,
  HttpGrantSource,
  HttpVerificationStateSource,
  MemoryGrantSource,
  VERIFICATION_STATE_V1,
  type EvidenceDecision,
  type EvidenceSource,
  type GrantDecision,
  type GrantQuery,
  type GrantRecord,
  type GrantSource,
  type PrincipalScope,
  type VerificationStateSource,
} from "./sources.js";
export { ADMISSION_SEMANTICS, AdmissionService, type AdmissionRecord, type AdmissionResult, type AdmissionServiceOptions, type DeliveryReport, type Eligibility, type ReconcileReport, type WitnessRequest } from "./service.js";
export { DispatchConsumer, writerGraph, type DispatchConsumerOptions, type DispatchGraph } from "./dispatch.js";
export { consumeOnceFromEnv, consumerConfigFromEnv, consumerConfigured, type ConsumerConfig } from "./consumer-config.js";
export { AuthorityError, AuthorityUnavailableError, evaluateDecision, MemoryVerificationAuthority, PgVerificationAuthority, type DecisionLookup, type DecisionRecord, type DecisionVerdict, type EffectRecord, type EligibilityAuthority, type MemoryDispatch, type OutboxAuthority, type OutboxRow, type OutboxState, type PayloadArtifact, type PgAuthorityOptions } from "./verification.js";
export { ContentAddressedArtifacts, KNOWLEDGE_ARTIFACTS_BUCKET, LocalObjectStore, SupabasePlanStore, SupabaseReceiptStore, SupabaseSnapshotCustody, SupabaseStorageObjectStore, type ObjectStore } from "./custody-supabase.js";

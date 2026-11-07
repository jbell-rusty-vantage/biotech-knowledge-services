import type { KeyObject } from "node:crypto";
import { BksServiceError, type ApplyWitness, type IngestionPlanV2, type IngestionReceiptV2, type PartialPolicy, type VerifyEffectsPage } from "@bks/contracts";
import { applyV2, getReceiptV2, verifyEffects, type ApplyFaults, type ReceiptLookup } from "../apply.js";
import { FilePlanStore, FileReceiptStore, FileSnapshotCustody, FileVerificationCustody, type PlanStore, type SnapshotCustody, type VerificationCustody } from "../custody.js";
import type { GraphClient } from "../neo4j.js";
import { DEFAULT_AGENT_UID, EXECUTOR_VERSION, planIntentV2 } from "../plan.js";
import { loadWriteRelease } from "../release-adapter.js";
import { readFence } from "../fence.js";
import { issueWitness, MemoryGrantAuthority, parsePinnedKeys, parseSigningKey, type GrantAuthority } from "../witness.js";
import type { PrincipalCtx } from "./context.js";
import { WriteSchema } from "./release-model.js";

export interface WriterConfig {
  schema?: WriteSchema;
  plans?: PlanStore;
  snapshots?: SnapshotCustody;
  verifications?: VerificationCustody;
  receipts?: FileReceiptStore;
  witnessKeys?: Map<string, KeyObject>;
  signer?: { kid: string; key: KeyObject } | null;
  authority?: GrantAuthority | null;
  issuer?: string;
  localDev?: boolean;
  agentUid?: string;
  now?: () => Date;
}

let sharedSchema: WriteSchema | null = null;
export function writeSchema(): WriteSchema {
  return (sharedSchema ??= new WriteSchema(loadWriteRelease()));
}

/** The trusted native writer: plan -> (admission witness) -> apply -> receipt -> verifyEffects. */
export class KnowledgeWriter {
  readonly schema: WriteSchema;
  readonly plans: PlanStore;
  readonly snapshots: SnapshotCustody;
  readonly verifications: VerificationCustody;
  readonly receipts: FileReceiptStore | undefined;
  readonly witnessKeys: Map<string, KeyObject>;
  readonly signer: { kid: string; key: KeyObject } | null;
  readonly authority: GrantAuthority | null;
  readonly issuer: string;
  readonly localDev: boolean;
  readonly agentUid: string;
  readonly now: () => Date;

  constructor(readonly client: GraphClient, config: WriterConfig = {}) {
    this.schema = config.schema ?? writeSchema();
    this.plans = config.plans ?? new FilePlanStore();
    this.snapshots = config.snapshots ?? new FileSnapshotCustody();
    this.verifications = config.verifications ?? new FileVerificationCustody();
    this.receipts = config.receipts ?? new FileReceiptStore();
    this.witnessKeys = config.witnessKeys ?? parsePinnedKeys(process.env.BKS_WITNESS_ISSUER_KEYS);
    this.signer = config.signer === undefined ? parseSigningKey(process.env.BKS_WITNESS_SIGNING_KEY) : config.signer;
    this.authority = config.authority ?? null;
    this.issuer = config.issuer ?? process.env.BKS_WITNESS_ISSUER ?? "bks-admission-dev";
    this.localDev = config.localDev ?? process.env.BKS_LOCAL_DEV === "1";
    this.agentUid = config.agentUid ?? process.env.BKS_AGENT_UID ?? DEFAULT_AGENT_UID;
    this.now = config.now ?? (() => new Date());
  }

  plan(intent: unknown, principal: PrincipalCtx, now: () => Date = this.now): Promise<IngestionPlanV2> {
    return planIntentV2(this.client, { schema: this.schema, plans: this.plans, snapshots: this.snapshots, verifications: this.verifications }, intent, { principal, now, agentUid: this.agentUid, executorVersion: EXECUTOR_VERSION });
  }

  /** Development admission service (the production issuer is Mission Control / the domain admission service). */
  async admit(planRef: string, req: { effectKey: string; partialPolicy: PartialPolicy }, principal: PrincipalCtx): Promise<ApplyWitness> {
    if (!this.signer) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", "no witness signing key configured (BKS_WITNESS_SIGNING_KEY); admission fails closed");
    if (!this.authority) throw new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", "no grant authority configured; admission fails closed");
    const record = await this.plans.get(planRef);
    if (!record) throw new BksServiceError("BKS_PLAN_NOT_FOUND", `no stored plan ${planRef}`);
    if (this.localDev && this.authority instanceof MemoryGrantAuthority) {
      // Local development only: the in-memory authority adopts revocations already delivered to this graph's fence.
      const fence = await this.client.read((tx) => readFence(tx));
      if (fence && fence.revocationGeneration > this.authority.generation) this.authority.generation = fence.revocationGeneration;
    }
    return issueWitness(record.plan, { ...req, principal }, { issuer: this.issuer, signer: this.signer, authority: this.authority, nowSeconds: Math.floor(this.now().getTime() / 1000) });
  }

  apply(request: unknown, principal: PrincipalCtx, extra: { signal?: AbortSignal; faults?: ApplyFaults; now?: () => Date } = {}): Promise<IngestionReceiptV2> {
    return applyV2(this.client, { schema: this.schema, plans: this.plans, snapshots: this.snapshots, witnessKeys: this.witnessKeys, ...(this.receipts ? { receipts: this.receipts } : {}), localDev: this.localDev, executorVersion: EXECUTOR_VERSION }, request, { principal, now: extra.now ?? this.now, ...(extra.signal ? { signal: extra.signal } : {}), ...(extra.faults ? { faults: extra.faults } : {}) });
  }

  receipt(principal: PrincipalCtx, effectKey: string): Promise<ReceiptLookup> {
    return getReceiptV2(this.client, principal, effectKey);
  }

  async verifyEffects(principal: PrincipalCtx, effectKey: string, cursor = 0, pageSize = 100): Promise<VerifyEffectsPage> {
    const r = await this.receipt(principal, effectKey);
    if (!r.found || !r.receipt) throw new BksServiceError("BKS_PLAN_NOT_FOUND", `no applied receipt for effectKey ${effectKey} in this scope`);
    return verifyEffects(this.client, this.schema, r.receipt, cursor, pageSize);
  }
}

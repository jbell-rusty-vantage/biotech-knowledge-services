import { randomUUID } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, statSync, writeSync } from "node:fs";
import { dirname } from "node:path";
import { BksServiceError } from "@bks/contracts";

/**
 * Durable admission ledger of the domain admission service (S7): the authoritative revocation generation, every
 * revocation, every issued witness (so a later grant revocation maps to the effects it admitted) and the revocation
 * OUTBOX whose entries are delivered at least once into the graph's `KsRevocationFence` (generation only moves forward,
 * so redelivery is idempotent) and reconciled against the fence.
 *
 * The file backend is one JSON document replaced atomically (temp file + fsync + rename) under an exclusive lock
 * directory, so concurrent executor processes on one host serialize. A multi-host deployment replaces it with a
 * database-backed ledger implementing the same interface (Mission Control PostgreSQL outbox); that backend is not
 * part of this release.
 */

export const ADMISSION_LEDGER_V1 = "bks-admission-ledger.v1" as const;

export type RevocationKind = "grant" | "effect" | "principal";

export interface RevocationEntry {
  generation: number;
  at: string;
  kind: RevocationKind;
  /** grantRef | effectKey | principalId. */
  target: string;
  /** installation/application/tenant scope key (`null` = every scope, for grant revocations). */
  scopeKey: string | null;
  reason: string;
}

export interface IssuanceEntry {
  jti: string;
  admissionRef: string;
  effectKey: string;
  scopeKey: string;
  principalId: string;
  grantRef: string;
  planRef: string;
  planDigest: string;
  intentDigest: string;
  generation: number;
  iat: number;
  exp: number;
  issuer: string;
  kid: string;
  decisionVersion: string;
  verificationRefs: Array<{ ref: string; digest: string }>;
}

export interface OutboxAttempt {
  at: string;
  ok: boolean;
  fenceGeneration: number | null;
  error: string | null;
}

export interface OutboxEntry {
  id: string;
  generation: number;
  createdAt: string;
  attempts: OutboxAttempt[];
  deliveredAt: string | null;
}

export interface LedgerState {
  format: typeof ADMISSION_LEDGER_V1;
  ledgerId: string;
  createdAt: string;
  generation: number;
  revocations: RevocationEntry[];
  issuances: IssuanceEntry[];
  outbox: OutboxEntry[];
}

export interface AdmissionLedger {
  readonly location: string;
  /** Throws BKS_AUTHORITY_UNAVAILABLE when the ledger cannot be read (fail closed). */
  read(): Promise<LedgerState>;
  /** Exclusive read-modify-write; the new state is durable when the promise resolves. */
  update<T>(fn: (state: LedgerState) => T): Promise<T>;
}

export const scopeKeyOf = (s: { installationId: string; applicationId: string; tenantId: string }) => `${s.installationId}/${s.applicationId}/${s.tenantId}`;

export function emptyLedger(now = new Date()): LedgerState {
  return { format: ADMISSION_LEDGER_V1, ledgerId: `ledger-${randomUUID()}`, createdAt: now.toISOString(), generation: 0, revocations: [], issuances: [], outbox: [] };
}

function unavailable(message: string): BksServiceError {
  return new BksServiceError("BKS_AUTHORITY_UNAVAILABLE", message);
}

function parseLedger(text: string, location: string): LedgerState {
  let s: LedgerState;
  try {
    s = JSON.parse(text) as LedgerState;
  } catch {
    throw unavailable(`admission ledger ${location} is not valid JSON; failing closed`);
  }
  if (s.format !== ADMISSION_LEDGER_V1 || !Number.isInteger(s.generation) || !Array.isArray(s.outbox) || !Array.isArray(s.issuances) || !Array.isArray(s.revocations)) throw unavailable(`admission ledger ${location} has an unknown format; failing closed`);
  return s;
}

export class MemoryAdmissionLedger implements AdmissionLedger {
  readonly location = "memory:";
  private text: string;
  available = true;
  constructor(state: LedgerState = emptyLedger()) {
    this.text = JSON.stringify(state);
  }
  async read(): Promise<LedgerState> {
    if (!this.available) throw unavailable("admission ledger unavailable; failing closed");
    return parseLedger(this.text, this.location);
  }
  async update<T>(fn: (state: LedgerState) => T): Promise<T> {
    const state = await this.read();
    const out = fn(state);
    this.text = JSON.stringify(state);
    return out;
  }
}

export class FileAdmissionLedger implements AdmissionLedger {
  readonly location: string;
  private readonly lockDir: string;
  constructor(
    readonly path: string,
    private readonly opts: { create?: boolean; lockTimeoutMs?: number; staleLockMs?: number } = {},
  ) {
    this.location = `file:${path}`;
    this.lockDir = `${path}.lock`;
    if (!existsSync(path)) {
      // A missing ledger is never silently re-created at generation 0 (that would forget revocations): creation is explicit.
      if (!opts.create) return;
      mkdirSync(dirname(path), { recursive: true });
      this.writeDurable(emptyLedger());
    }
  }

  async read(): Promise<LedgerState> {
    if (!existsSync(this.path)) throw unavailable(`admission ledger ${this.path} does not exist (create it explicitly); failing closed`);
    try {
      return parseLedger(readFileSync(this.path, "utf8"), this.location);
    } catch (e) {
      if (e instanceof BksServiceError) throw e;
      throw unavailable(`admission ledger ${this.path} unreadable: ${(e as Error).message}`);
    }
  }

  async update<T>(fn: (state: LedgerState) => T): Promise<T> {
    await this.lock();
    try {
      const state = await this.read();
      const out = fn(state);
      this.writeDurable(state);
      return out;
    } finally {
      rmSync(this.lockDir, { recursive: true, force: true });
    }
  }

  private writeDurable(state: LedgerState): void {
    const tmp = `${this.path}.${process.pid}.${randomUUID().slice(0, 8)}.tmp`;
    const fd = openSync(tmp, "w");
    try {
      writeSync(fd, `${JSON.stringify(state, null, 1)}\n`);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(tmp, this.path);
  }

  private async lock(): Promise<void> {
    const deadline = Date.now() + (this.opts.lockTimeoutMs ?? 10_000);
    const stale = this.opts.staleLockMs ?? 30_000;
    for (;;) {
      try {
        mkdirSync(this.lockDir);
        return;
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw unavailable(`admission ledger lock failed: ${(e as Error).message}`);
        try {
          if (Date.now() - statSync(this.lockDir).mtimeMs > stale) rmSync(this.lockDir, { recursive: true, force: true });
        } catch {
          /* raced with the holder */
        }
        if (Date.now() > deadline) throw unavailable(`admission ledger ${this.path} is locked; failing closed`);
        await new Promise((r) => setTimeout(r, 25));
      }
    }
  }
}

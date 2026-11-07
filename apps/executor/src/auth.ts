import { createHash, timingSafeEqual } from "node:crypto";
import { BksServiceError, type Principal } from "@bks/contracts";

/**
 * Executor authentication (AGENT-SKILLS 3 repair: mandatory service auth outside explicit local dev; role-specific
 * capabilities). Tokens are configured host-side, never sent to agents:
 *
 *   BKS_EXECUTOR_TOKENS = JSON array of
 *     { "tokenSha256": "<hex>" | "token": "<plaintext>", "role": "reader" | "writer" | "admin",
 *       "principalId": "...", "installationId": "...", "applicationId": "...", "tenantId": "...", "grants": ["adjudication.deliver", ...] }
 *   EXECUTOR_API_KEY (legacy)  -> one writer principal "executor-api-key" in installation "default"
 *   BKS_LOCAL_DEV=1            -> unauthenticated requests get the local-dev principal (role BKS_LOCAL_DEV_ROLE, default writer;
 *                                 grants BKS_LOCAL_DEV_GRANTS). Without BKS_LOCAL_DEV=1 and without tokens the executor refuses to start.
 *
 * Roles: reader (schema, reads, receipts, effect verification), writer (+ plan / apply), admin (+ the baseline Cypher
 * tools, and only when BKS_ENABLE_BASELINE_TOOLS=1). A writer token never runs raw Cypher; a reader token never plans or applies.
 *
 * Principal class (SV-11): an entry may declare "class": "agent" (default) | "operator" | "service". A `service`
 * principal is a machine binding (the Knowledge Services biotech-graph binding); with role writer and grant
 * `admission.dispatch` it may trigger the dispatch outbox consumer (POST /kg/admission/dispatch/consume) for its own
 * tenantId (a knowledge_verification tenant uuid). The class is an executor-local mapping of an opaque token; it is NOT
 * the Mission Control -> Knowledge Services issuer/JWKS credential profile and grants nothing outside this executor.
 */
export type Role = Principal["role"];
export const ROLE_RANK: Record<Role, number> = { reader: 1, writer: 2, admin: 3 };

interface TokenEntry {
  hash: Buffer;
  principal: Principal;
}

export class AuthRegistry {
  private readonly entries: TokenEntry[] = [];
  readonly localDev: boolean;
  readonly devPrincipal: Principal | null;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.localDev = env.BKS_LOCAL_DEV === "1";
    const raw = env.BKS_EXECUTOR_TOKENS?.trim();
    if (raw) {
      let list: Array<Record<string, unknown>>;
      try {
        list = JSON.parse(raw) as Array<Record<string, unknown>>;
      } catch {
        throw new Error("BKS_EXECUTOR_TOKENS is not valid JSON");
      }
      for (const e of list) {
        const hashHex = typeof e.tokenSha256 === "string" ? e.tokenSha256 : typeof e.token === "string" ? createHash("sha256").update(e.token).digest("hex") : null;
        if (!hashHex || !/^[0-9a-f]{64}$/i.test(hashHex)) throw new Error("BKS_EXECUTOR_TOKENS entry needs token or tokenSha256");
        const role = String(e.role ?? "reader") as Role;
        if (!(role in ROLE_RANK)) throw new Error(`BKS_EXECUTOR_TOKENS role ${role} is not reader|writer|admin`);
        this.entries.push({
          hash: Buffer.from(hashHex.toLowerCase(), "hex"),
          principal: {
            principalId: String(e.principalId ?? `token-${hashHex.slice(0, 8)}`),
            installationId: String(e.installationId ?? "default"),
            applicationId: String(e.applicationId ?? "default"),
            tenantId: String(e.tenantId ?? "default"),
            role,
            grants: Array.isArray(e.grants) ? e.grants.map(String) : [],
            ...(e.class !== undefined ? { principalClass: principalClassOf(e.class) } : {}),
          },
        });
      }
    }
    const legacy = env.EXECUTOR_API_KEY?.trim();
    if (legacy) this.entries.push({ hash: createHash("sha256").update(legacy).digest(), principal: { principalId: "executor-api-key", installationId: "default", applicationId: "default", tenantId: "default", role: "writer", grants: [] } });
    this.devPrincipal = this.localDev
      ? { principalId: "local-dev", installationId: "local", applicationId: "bks-local", tenantId: "local", role: (env.BKS_LOCAL_DEV_ROLE as Role | undefined) ?? "writer", grants: (env.BKS_LOCAL_DEV_GRANTS ?? "").split(",").map((s) => s.trim()).filter(Boolean) }
      : null;
    if (!this.entries.length && !this.localDev) {
      throw new Error("executor authentication is mandatory: configure BKS_EXECUTOR_TOKENS (or EXECUTOR_API_KEY), or set BKS_LOCAL_DEV=1 for an explicit local development profile");
    }
  }

  get configuredPrincipals(): number {
    return this.entries.length;
  }

  /** Authenticates a presented token (x-api-key or Bearer). Missing token: local-dev principal or BKS_UNAUTHORIZED. */
  authenticate(presented: string | null | undefined): Principal {
    if (!presented) {
      if (this.devPrincipal) return this.devPrincipal;
      throw new BksServiceError("BKS_UNAUTHORIZED", "service token required (x-api-key or Authorization: Bearer)");
    }
    const h = createHash("sha256").update(presented).digest();
    for (const e of this.entries) if (e.hash.length === h.length && timingSafeEqual(e.hash, h)) return e.principal;
    throw new BksServiceError("BKS_UNAUTHORIZED", "unknown service token");
  }
}

function principalClassOf(v: unknown): NonNullable<Principal["principalClass"]> {
  if (v === "agent" || v === "operator" || v === "service") return v;
  throw new Error(`BKS_EXECUTOR_TOKENS class ${String(v)} is not agent|operator|service`);
}

/** A `service` principal with the named grant (SV-11 dispatch consumer trigger). */
export function requireService(principal: Principal, grant: string, capability: string): void {
  if (principal.principalClass !== "service") throw new BksServiceError("BKS_FORBIDDEN_SCOPE", `${capability} requires a service principal (token class service); this token is ${principal.principalClass ?? "agent"}`);
  if (!principal.grants.includes(grant)) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", `${capability} requires the grant ${grant}`);
}

export function requireRole(principal: Principal, role: Role, capability: string): void {
  if (ROLE_RANK[principal.role] < ROLE_RANK[role]) throw new BksServiceError("BKS_FORBIDDEN_SCOPE", `${capability} requires the ${role} role; this token is ${principal.role}`);
}

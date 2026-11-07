/**
 * Reference product BFF configuration. No product application exists in the workspace yet (S0-INVENTORY section 3),
 * so this BFF binds to the identity provider already configured for BellLabs: Supabase Auth, verified through its
 * JWKS. It never invents an identity provider; issuer, audience and algorithms are configuration.
 */

export interface BffConfig {
  production: boolean;
  port: number;
  session: {
    jwksUrl: string;
    issuer: string;
    audience: string;
    algorithms: string[];
    /** Required value of the Supabase `role` claim (`authenticated` for signed-in users). */
    requiredRole: string | null;
  };
  entitlements: {
    /** Entitlements are read only from `app_metadata` (server-controlled in Supabase), never `user_metadata`. */
    claimPath: string[];
    required: string | null;
    internal: string;
  };
  actor: {
    privateKeyPem: string;
    keyId: string | null;
    issuer: string;
    audience: string;
    ttlSeconds: number;
    appId: string;
  };
  upstream: { url: string; serviceKey: string; deadlineMs: number };
  bodyLimitBytes: number;
}

export class BffConfigError extends Error {
  constructor(message: string) {
    super(`product-bff configuration refused: ${message}`);
  }
}

export function bffConfigFromEnv(env: NodeJS.ProcessEnv = process.env): BffConfig {
  const production = env.NODE_ENV === "production";
  const jwksUrl = env.BKS_BIOTECH_DB_JWKS_URL?.trim();
  if (!jwksUrl) throw new BffConfigError("BKS_BIOTECH_DB_JWKS_URL is required (the application session issuer's JWKS)");
  const supabaseUrl = env.BKS_BIOTECH_DB_URL?.trim().replace(/\/+$/, "");
  const issuer = env.BFF_SESSION_ISSUER?.trim() || (supabaseUrl ? `${supabaseUrl}/auth/v1` : "");
  if (!issuer) throw new BffConfigError("BFF_SESSION_ISSUER (or BKS_BIOTECH_DB_URL) is required");
  const privateKeyPem = env.BFF_ACTOR_PRIVATE_KEY?.trim().replace(/\\n/g, "\n");
  if (!privateKeyPem) throw new BffConfigError("BFF_ACTOR_PRIVATE_KEY (Ed25519 PKCS8 PEM) is required to sign actor contexts");
  const url = env.GRAPHQL_URL?.trim() || env.BKS_GRAPHQL_URL?.trim();
  if (!url) throw new BffConfigError("GRAPHQL_URL (or BKS_GRAPHQL_URL) is required");
  if (production && !url.startsWith("https://") && !/^http:\/\/[a-z0-9.-]+\.internal(:\d+)?\//.test(url)) throw new BffConfigError("GRAPHQL_URL must be https (or a private .internal address) in production");
  const serviceKey = env.GRAPHQL_API_KEY?.trim() || env.BKS_GRAPHQL_SERVICE_KEY?.trim();
  if (!serviceKey || serviceKey.length < 32) throw new BffConfigError("GRAPHQL_API_KEY (or BKS_GRAPHQL_SERVICE_KEY), >= 32 characters, is required; it stays server-side");
  const ttl = Number(env.BFF_ACTOR_TTL_SECONDS ?? "60");
  if (!Number.isInteger(ttl) || ttl < 5 || ttl > 120) throw new BffConfigError("BFF_ACTOR_TTL_SECONDS must be an integer in [5, 120]");
  return {
    production,
    port: Number(env.PORT ?? 4020),
    session: {
      jwksUrl,
      issuer,
      audience: env.BFF_SESSION_AUDIENCE?.trim() || "authenticated",
      algorithms: (env.BFF_SESSION_ALGORITHMS?.trim() || "ES256,RS256,EdDSA").split(",").map((s) => s.trim()).filter(Boolean),
      requiredRole: env.BFF_REQUIRED_ROLE === "" ? null : (env.BFF_REQUIRED_ROLE?.trim() ?? "authenticated"),
    },
    entitlements: {
      claimPath: ["app_metadata", env.BFF_ENTITLEMENTS_CLAIM?.trim() || "bks_entitlements"],
      required: env.BFF_REQUIRED_ENTITLEMENT?.trim() || null,
      internal: env.BFF_INTERNAL_ENTITLEMENT?.trim() || "biotech:internal",
    },
    actor: {
      privateKeyPem,
      keyId: env.BFF_ACTOR_KEY_ID?.trim() || null,
      issuer: env.BFF_ACTOR_ISSUER?.trim() || "bks-product-bff",
      audience: env.BFF_ACTOR_AUDIENCE?.trim() || "bks-graphql-api",
      ttlSeconds: ttl,
      appId: env.BFF_APP_ID?.trim() || "bks-reference-bff",
    },
    upstream: { url, serviceKey, deadlineMs: Math.min(Number(env.BFF_UPSTREAM_DEADLINE_MS ?? 8000), 8000) },
    bodyLimitBytes: 64 * 1024,
  };
}

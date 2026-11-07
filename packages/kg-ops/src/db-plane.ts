/**
 * Startup check of the Biotech database plane. When BKS_BIOTECH_DB_PROJECT_REF is set, every Biotech database URL or
 * DSN that is set must name that Supabase project: in its host (`<ref>.supabase.co`, `db.<ref>.supabase.co`) or in its
 * user (`postgres.<ref>` on the Supavisor pooler). Loopback hosts are exempt (disposable local databases). Refusal
 * messages carry only the variable name, the ref and the host; never a user, password or full value.
 */
export const BIOTECH_DB_LOCATOR_VARS = [
  "BKS_BIOTECH_DB_URL",
  "BKS_BIOTECH_DB_JWKS_URL",
  "BKS_BIOTECH_DB_ADMIN_DSN",
  "BKS_BIOTECH_DB_VERIFICATION_DSN",
  "BKS_BIOTECH_DB_VERIFICATION_READ_DSN",
] as const;

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

export class BiotechDbPlaneError extends Error {}

export function assertBiotechDbPlane(env: NodeJS.ProcessEnv = process.env): void {
  const ref = env.BKS_BIOTECH_DB_PROJECT_REF?.trim();
  if (!ref) return;
  for (const name of BIOTECH_DB_LOCATOR_VARS) {
    const value = env[name]?.trim();
    if (!value) continue;
    let host: string;
    let user: string;
    try {
      const url = new URL(value);
      host = url.hostname;
      user = decodeURIComponent(url.username);
    } catch {
      throw new BiotechDbPlaneError(`${name} is not a URL; cannot confirm Biotech project ${ref}`);
    }
    if (LOOPBACK.has(host)) continue;
    if (!host.split(".").includes(ref) && !user.split(".").includes(ref)) {
      throw new BiotechDbPlaneError(`${name} does not address Biotech project ${ref} (host ${host})`);
    }
  }
}

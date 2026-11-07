import { describe, expect, it } from "vitest";
import { assertBiotechDbPlane, BiotechDbPlaneError } from "./db-plane.js";

const REF = "abcdefghijklmnopqrst";

describe("assertBiotechDbPlane", () => {
  it("is a no-op without BKS_BIOTECH_DB_PROJECT_REF", () => {
    expect(() => assertBiotechDbPlane({ BKS_BIOTECH_DB_URL: "https://other.supabase.co" })).not.toThrow();
  });

  it("accepts the ref in the host or in the pooler user, and loopback hosts", () => {
    expect(() =>
      assertBiotechDbPlane({
        BKS_BIOTECH_DB_PROJECT_REF: REF,
        BKS_BIOTECH_DB_URL: `https://${REF}.supabase.co`,
        BKS_BIOTECH_DB_JWKS_URL: `https://${REF}.supabase.co/auth/v1/.well-known/jwks.json`,
        BKS_BIOTECH_DB_ADMIN_DSN: `postgresql://postgres:pw@db.${REF}.supabase.co:5432/postgres?sslmode=require`,
        BKS_BIOTECH_DB_VERIFICATION_DSN: `postgresql://worker.${REF}:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
        BKS_BIOTECH_DB_VERIFICATION_READ_DSN: "postgresql://reader:pw@127.0.0.1:55433/throwaway",
      }),
    ).not.toThrow();
  });

  it("refuses another project and reports only the name, ref and host", () => {
    const env = { BKS_BIOTECH_DB_PROJECT_REF: REF, BKS_BIOTECH_DB_ADMIN_DSN: "postgresql://postgres.zzzzzzzzzzzzzzzzzzzz:s3cret@aws-0-us-east-1.pooler.supabase.com:5432/postgres" };
    expect(() => assertBiotechDbPlane(env)).toThrowError(BiotechDbPlaneError);
    try {
      assertBiotechDbPlane(env);
    } catch (e) {
      const message = (e as Error).message;
      expect(message).toBe(`BKS_BIOTECH_DB_ADMIN_DSN does not address Biotech project ${REF} (host aws-0-us-east-1.pooler.supabase.com)`);
      expect(message).not.toMatch(/s3cret|zzzz/);
    }
  });

  it("refuses a value that is not a URL without echoing it", () => {
    expect(() => assertBiotechDbPlane({ BKS_BIOTECH_DB_PROJECT_REF: REF, BKS_BIOTECH_DB_URL: "not a url s3cret" })).toThrowError(/^BKS_BIOTECH_DB_URL is not a URL; cannot confirm Biotech project abcdefghijklmnopqrst$/);
  });
});

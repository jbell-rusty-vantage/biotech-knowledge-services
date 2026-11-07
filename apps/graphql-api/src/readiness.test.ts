import { describe, expect, it } from "vitest";
import { acceptedReleases, ddlApplies, expectedAbsentDdl, loadCompatibilityMatrix } from "./readiness.js";
import { loadConsumerSourceSdl } from "./release.js";

const source = loadConsumerSourceSdl({ log: () => {} });

describe.runIf(source.mode === "release")("readiness against the pinned release", () => {
  it("accepts the pinned release and its declared read-compatible parent", () => {
    const accepted = acceptedReleases(source, loadCompatibilityMatrix());
    expect(accepted[0]).toEqual({ releaseId: source.releaseId, schemaReleaseDigest: source.schemaReleaseDigest, candidate: false });
    const parent = source.releaseCompatibility?.parentRelease;
    if (parent && source.releaseCompatibility?.readCompatibility?.schemaDigestEqualToParent) expect(accepted.map((a) => a.releaseId)).toContain(parent.releaseId);
  });

  it("treats blocked-by-legacy-data DDL as expected absent and checks only the pre/post phase required sets", () => {
    const absent = expectedAbsentDdl(source);
    for (const e of source.ddl.filter((d) => d.status === "blocked-by-legacy-data")) expect(absent.has(e.name)).toBe(true);
    for (const edition of ["community", "enterprise"]) {
      const checked = source.ddl.filter((d) => ddlApplies(d, edition, absent));
      expect(checked.some((d) => absent.has(d.name))).toBe(false);
      expect(checked.every((d) => d.required && (d.phase === undefined || d.phase === "pre-migration" || d.phase === "post-migration"))).toBe(true);
    }
    expect(source.ddl.filter((d) => ddlApplies(d, "community", absent)).length).toBeGreaterThan(300);
  });
});

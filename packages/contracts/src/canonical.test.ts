import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { canonicalDate, canonicalDecimal, canonicalDigest, canonicalDuration, CanonicalError, canonicalInstant, canonicalize, rawBytesDigest } from "./canonical.js";
import { canonicalJson, digestOf } from "./digest.js";

const here = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(readFileSync(resolve(here, "..", "golden", "canonical-json.v2.json"), "utf8")) as {
  vectors: Array<{ id: string; input: string; profile?: { sets?: string[]; fields?: Record<string, string[]> }; canonical?: string; digest?: string; error?: string }>;
  scalars: Array<{ kind: "instant" | "date" | "duration" | "decimal"; input: string; output?: string; error?: string }>;
};

describe("bks-canonical-json.v2 golden vectors (shared with the Python client)", () => {
  for (const v of golden.vectors) {
    it(v.id, () => {
      const value = JSON.parse(v.input);
      if (v.error) {
        expect(() => canonicalize(value, v.profile ?? {})).toThrowError(CanonicalError);
        try {
          canonicalize(value, v.profile ?? {});
        } catch (e) {
          expect((e as CanonicalError).code).toBe(v.error);
        }
      } else {
        expect(canonicalize(value, v.profile ?? {})).toBe(v.canonical);
        expect(canonicalDigest(value, v.profile ?? {})).toBe(v.digest);
      }
    });
  }
  const fns = { instant: canonicalInstant, date: canonicalDate, duration: canonicalDuration, decimal: canonicalDecimal };
  for (const s of golden.scalars) {
    it(`${s.kind} ${s.input}`, () => {
      if (s.error) expect(() => fns[s.kind](s.input)).toThrowError(CanonicalError);
      else expect(fns[s.kind](s.input)).toBe(s.output);
    });
  }
});

describe("canonical v2 invariants", () => {
  it("drops undefined members but rejects undefined array members and exotic types", () => {
    expect(canonicalize({ a: undefined, b: 1 })).toBe('{"b":1}');
    expect(() => canonicalize([undefined])).toThrowError(/CANONICAL_UNDEFINED_MEMBER/);
    expect(() => canonicalize({ d: new Date(0) })).toThrowError(/CANONICAL_UNSUPPORTED_TYPE/);
    expect(() => canonicalize({ n: 10n })).toThrowError(/CANONICAL_BIGINT/);
    expect(() => canonicalize(Number.NaN)).toThrowError(/CANONICAL_NONFINITE/);
  });
  it("keeps raw-byte and canonical digests distinct", () => {
    const text = '{"b":1, "a":2}';
    expect(rawBytesDigest(text)).not.toBe(canonicalDigest(JSON.parse(text)));
    expect(canonicalDigest(JSON.parse(text))).toBe(rawBytesDigest('{"a":2,"b":1}'));
  });
  it("retains v1 decoding (digestOf) unchanged", () => {
    // v1 sorts keys by code point via Array.sort too, but does not reject unsafe integers or lone surrogates.
    expect(canonicalJson({ b: 1, a: [60, { z: null }] })).toBe('{"a":[60,{"z":null}],"b":1}');
    expect(digestOf({ x: 9007199254740993 })).toMatch(/^sha256:[0-9a-f]{64}$/);
  });
});

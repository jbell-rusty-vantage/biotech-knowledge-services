import { createHash } from "node:crypto";

/**
 * bks-canonical-json.v2 (KN-08). One deterministic text form for every semantic digest in contracts v2.
 *
 * Rules (mirrored byte for byte by `biotech_knowledge_client.canonical`; golden vectors in
 * `packages/contracts/golden/canonical-json.v2.json` are run by both test suites):
 *
 *  1. Objects: keys sorted by UTF-16 code units (RFC 8785 order); members whose value is `undefined` are dropped;
 *     no insignificant whitespace. A profile may declare the explicit field set of a path; any other key is an error.
 *  2. Arrays are ordered sequences and keep their order. A path the profile declares as a semantic set is sorted by the
 *     canonical text of its members (UTF-16 code-unit order) and exact duplicates are removed. `undefined` members are errors.
 *  3. Numbers use the ECMAScript Number::toString form (ES6/JCS): shortest round-trip digits, exponent form outside
 *     [1e-6, 1e21). `-0` becomes `0`. NaN and ±Infinity are errors. Integers outside ±(2^53-1) are errors in numeric form:
 *     large integers are carried as JSON strings of decimal digits (the producer's explicit choice, never a coercion).
 *     `bigint` values are errors for the same reason.
 *  4. Strings are written as JSON.stringify writes them (`"` `\` and C0 controls escaped; \b \f \n \r \t short forms;
 *     other controls as lower-case \u00xx; everything else literal UTF-8). No Unicode normalization (NFC is not applied).
 *     Lone surrogates are errors.
 *  5. `null` is written as `null`; booleans as `true` / `false`. Any other value type (Date, Map, function) is an error.
 *  6. Decimals, UTC instants, date-only values and durations are strings. Their canonical spelling is produced by the
 *     helpers below (`canonicalDecimal`, `canonicalInstant`, `canonicalDate`, `canonicalDuration`); the canonicalizer
 *     never reinterprets a string.
 *
 * The digest of a canonical form is `sha256:<hex>` over its UTF-8 bytes (`canonicalDigest`). The digest of an
 * artifact's raw bytes is `rawBytesDigest`; the two are never interchangeable and carry different field names.
 * v1 (`canonicalJson` / `digestOf` in digest.ts) stays as it was for decoding and verifying v1 artifacts.
 */
export const CANONICAL_JSON_V2 = "bks-canonical-json.v2" as const;

export interface CanonicalProfile {
  /** Paths whose arrays are semantic sets (sorted, de-duplicated). Path syntax: `a.b`, `[]` for array members, `*` for any key. */
  sets?: string[];
  /** Explicit field sets: path -> allowed keys. Keys outside the set are an error. */
  fields?: Record<string, string[]>;
}

export class CanonicalError extends Error {
  constructor(
    public readonly code: "CANONICAL_NONFINITE" | "CANONICAL_UNSAFE_INTEGER" | "CANONICAL_BIGINT" | "CANONICAL_LONE_SURROGATE" | "CANONICAL_UNDEFINED_MEMBER" | "CANONICAL_UNSUPPORTED_TYPE" | "CANONICAL_UNKNOWN_FIELD" | "CANONICAL_TEMPORAL" | "CANONICAL_DECIMAL",
    message: string,
    public readonly path: string,
  ) {
    super(`${code} at ${path || "$"}: ${message}`);
  }
}

const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function pathMatches(pattern: string, path: string): boolean {
  if (pattern === path) return true;
  const p = pattern.split(".");
  const q = path.split(".");
  if (p.length !== q.length) return false;
  return p.every((seg, i) => seg === q[i] || seg === "*" || (seg.startsWith("*") && q[i]!.endsWith(seg.slice(1))));
}

function child(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}

function hasLoneSurrogate(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const n = s.charCodeAt(i + 1);
      if (!(n >= 0xdc00 && n <= 0xdfff)) return true;
      i++;
    } else if (c >= 0xdc00 && c <= 0xdfff) return true;
  }
  return false;
}

/** UTF-16 code-unit comparison (the default JS string order, RFC 8785 member order). */
function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function encodeNumber(n: number, path: string): string {
  if (!Number.isFinite(n)) throw new CanonicalError("CANONICAL_NONFINITE", `${n} is not finite`, path);
  if (Object.is(n, -0) || n === 0) return "0";
  if (Number.isInteger(n) && Math.abs(n) > MAX_SAFE) throw new CanonicalError("CANONICAL_UNSAFE_INTEGER", `${n} is outside ±(2^53-1); carry it as a decimal string`, path);
  return String(n);
}

function encode(value: unknown, path: string, profile: CanonicalProfile): string {
  if (value === null) return "null";
  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "number":
      return encodeNumber(value, path);
    case "bigint":
      throw new CanonicalError("CANONICAL_BIGINT", "bigint must be carried as a decimal string", path);
    case "string":
      if (hasLoneSurrogate(value)) throw new CanonicalError("CANONICAL_LONE_SURROGATE", "string contains a lone surrogate", path);
      return JSON.stringify(value);
    case "undefined":
      throw new CanonicalError("CANONICAL_UNDEFINED_MEMBER", "undefined is not a JSON value", path);
    case "object":
      break;
    default:
      throw new CanonicalError("CANONICAL_UNSUPPORTED_TYPE", `${typeof value} is not a JSON value`, path);
  }
  if (Array.isArray(value)) {
    const itemPath = `${path}[]`;
    const items = value.map((v, i) => {
      if (v === undefined) throw new CanonicalError("CANONICAL_UNDEFINED_MEMBER", `array member ${i} is undefined`, path);
      return encode(v, itemPath, profile);
    });
    if (profile.sets?.some((s) => pathMatches(s, path))) {
      const sorted = [...new Set(items)].sort(compareCodeUnits);
      return `[${sorted.join(",")}]`;
    }
    return `[${items.join(",")}]`;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) throw new CanonicalError("CANONICAL_UNSUPPORTED_TYPE", `${proto?.constructor?.name ?? "object"} is not a plain JSON object`, path);
  const obj = value as Record<string, unknown>;
  const allowed = profile.fields ? Object.entries(profile.fields).find(([p]) => pathMatches(p, path))?.[1] : undefined;
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort(compareCodeUnits);
  const parts: string[] = [];
  for (const key of keys) {
    if (hasLoneSurrogate(key)) throw new CanonicalError("CANONICAL_LONE_SURROGATE", "key contains a lone surrogate", path);
    if (allowed && !allowed.includes(key)) throw new CanonicalError("CANONICAL_UNKNOWN_FIELD", `${key} is not in the declared field set`, path);
    parts.push(`${JSON.stringify(key)}:${encode(obj[key], child(path, key), profile)}`);
  }
  return `{${parts.join(",")}}`;
}

/** Canonical text (bks-canonical-json.v2). Throws CanonicalError on any value the rules do not admit. */
export function canonicalize(value: unknown, profile: CanonicalProfile = {}): string {
  return encode(value, "", profile);
}

export function sha256HexOf(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

/** `sha256:<hex>` of the canonical v2 text (semantic digest). */
export function canonicalDigest(value: unknown, profile: CanonicalProfile = {}): string {
  return `sha256:${sha256HexOf(Buffer.from(canonicalize(value, profile), "utf8"))}`;
}

/** `sha256:<hex>` of raw artifact bytes (never of a canonical form). */
export function rawBytesDigest(bytes: Uint8Array | string): string {
  return `sha256:${sha256HexOf(typeof bytes === "string" ? Buffer.from(bytes, "utf8") : bytes)}`;
}

// ---------------------------------------------------------------------------------------------
// Typed scalar spellings (rule 6)
// ---------------------------------------------------------------------------------------------

const INSTANT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})$/i;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DURATION_RE = /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(?:\.\d{1,9})?S)?)?$/;
const DECIMAL_RE = /^([+-])?(\d+)(?:\.(\d+))?$/;

function validCalendarDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) return false;
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const dim = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]!;
  return d <= dim;
}

/**
 * UTC instant: `YYYY-MM-DDTHH:MM:SS[.fraction]Z`. The offset is applied, seconds are always written, the fraction keeps
 * the stated digits (up to 9) with trailing zeros removed. Leap seconds are rejected.
 */
export function canonicalInstant(text: string): string {
  const m = INSTANT_RE.exec(text);
  if (!m) throw new CanonicalError("CANONICAL_TEMPORAL", `not an RFC 3339 instant with offset: ${text}`, "");
  const [, ys, mos, ds, hs, mis, ss = "00", frac = "", off] = m;
  const y = Number(ys), mo = Number(mos), d = Number(ds), h = Number(hs), mi = Number(mis), s = Number(ss);
  if (y < 1 || !validCalendarDate(y, mo, d) || h > 23 || mi > 59 || s > 59) throw new CanonicalError("CANONICAL_TEMPORAL", `invalid instant fields: ${text}`, "");
  let offsetMinutes = 0;
  if (off!.toUpperCase() !== "Z") {
    const sign = off![0] === "-" ? -1 : 1;
    const oh = Number(off!.slice(1, 3)), om = Number(off!.slice(4, 6));
    if (oh > 23 || om > 59) throw new CanonicalError("CANONICAL_TEMPORAL", `invalid offset: ${text}`, "");
    offsetMinutes = sign * (oh * 60 + om);
  }
  const base = new Date(0);
  base.setUTCFullYear(y, mo - 1, d);
  base.setUTCHours(h, mi, s, 0);
  const dt = new Date(base.getTime() - offsetMinutes * 60_000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const fraction = frac.replace(/0+$/, "");
  const year = dt.getUTCFullYear();
  if (year < 0 || year > 9999) throw new CanonicalError("CANONICAL_TEMPORAL", `year out of range: ${text}`, "");
  return `${pad(year, 4)}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:${pad(dt.getUTCSeconds())}${fraction ? `.${fraction}` : ""}Z`;
}

/** Date-only value `YYYY-MM-DD`, validated and returned unchanged (never converted to an instant). */
export function canonicalDate(text: string): string {
  const m = DATE_RE.exec(text);
  if (!m || !validCalendarDate(Number(m[1]), Number(m[2]), Number(m[3]))) throw new CanonicalError("CANONICAL_TEMPORAL", `not a calendar date: ${text}`, "");
  return text;
}

/** ISO 8601 duration, upper-cased; components are kept as stated (P1D is not rewritten as PT24H). */
export function canonicalDuration(text: string): string {
  const up = text.toUpperCase();
  if (!DURATION_RE.test(up)) throw new CanonicalError("CANONICAL_TEMPORAL", `not an ISO 8601 duration: ${text}`, "");
  return up;
}

/** Plain decimal string: sign only when negative, no leading zeros, no trailing fractional zeros, `-0` -> `0`, no exponent. */
export function canonicalDecimal(text: string): string {
  const m = DECIMAL_RE.exec(text.trim());
  if (!m) throw new CanonicalError("CANONICAL_DECIMAL", `not a plain decimal: ${text}`, "");
  const [, sign, intPart, fracPart = ""] = m;
  const i = intPart!.replace(/^0+(?=\d)/, "");
  const f = fracPart.replace(/0+$/, "");
  const zero = /^0*$/.test(i) && f === "";
  if (zero) return "0";
  return `${sign === "-" ? "-" : ""}${i}${f ? `.${f}` : ""}`;
}

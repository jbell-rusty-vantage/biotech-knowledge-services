import neo4j, { Integer, isDate, isDateTime, isDuration, isInt, isLocalDateTime, isLocalTime, isPoint, isTime, isNode, isRelationship, isPath, isUnboundRelationship, isPathSegment } from "neo4j-driver";
import { canonicalInstant } from "@bks/contracts";

/**
 * bks-read-values.v1: the value serialization of every row value in a read result (SPECIFICATION 6.2 "declare ...").
 *
 *  - null                       -> null
 *  - Boolean, String            -> JSON boolean / string (no Unicode normalization)
 *  - Integer within +-(2^53-1)  -> JSON number
 *  - Integer outside that range -> {"$type":"Integer","value":"<decimal digits>"} (never a lossy float)
 *  - Float, finite, non-integral -> JSON number (ES6 shortest round-trip form after canonicalization)
 *  - Float, integral or -0      -> {"$type":"Float","value":"<ES6 digits>"} so it never collapses into an Integer
 *  - Float NaN / +-Infinity     -> {"$type":"Float","value":"NaN"|"Infinity"|"-Infinity"}
 *  - DateTime (offset or zone)  -> {"$type":"DateTime","value":"<UTC instant ...Z, fraction without trailing zeros>"[,"offsetSeconds":n | ,"zone":"<IANA id>","local":"<local wall time>"]}
 *                                  (value = semantic identity; the stated offset or zone is kept so the value round-trips exactly)
 *  - LocalDateTime / Time / LocalTime -> {"$type":"LocalDateTime"|"Time"|"LocalTime","value":"<ISO text as stored>"}
 *  - Date (date-only)           -> {"$type":"Date","value":"YYYY-MM-DD"} (never converted to an instant)
 *  - Duration                   -> {"$type":"Duration","value":"P<months>M<days>DT<seconds>[.<nanos>]S"} (components kept, upper case)
 *  - Point                      -> {"$type":"Point","srid":n,"x":..,"y":..[,"z":..]}
 *  - Bytes                      -> {"$type":"Bytes","base64":"..."}
 *  - List                       -> JSON array in returned order (the statement decides list order; cap: listCap)
 *  - Map                        -> JSON object (keys canonicalized by sorting in the digest)
 *  - Node / Relationship / Path -> refused (FULL_ENTITY_RETURN): return projected properties, never whole entities;
 *                                  elementId is never serialized (it is not identity; use uid).
 *  - Decimals: Neo4j has no decimal type; decimal text stays a string exactly as stored.
 *
 * `decodeReadValue` turns a serialized value back into a driver parameter value (round-trip proof).
 */
export const READ_VALUES_V1 = "bks-read-values.v1" as const;

export class ValueLimitError extends Error {
  constructor(public readonly code: "NESTING_CAP" | "FULL_ENTITY_RETURN", message: string, public readonly path: string) {
    super(message);
  }
}

export interface ValueLimits {
  listCap: number;
  nestingCap: number;
}

export interface NormalizeState {
  truncations: Array<{ kind: "list"; limit: number; path: string }>;
}

const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function floatValue(n: number): unknown {
  if (Number.isNaN(n)) return { $type: "Float", value: "NaN" };
  if (n === Infinity) return { $type: "Float", value: "Infinity" };
  if (n === -Infinity) return { $type: "Float", value: "-Infinity" };
  if (Number.isInteger(n) || Object.is(n, -0)) return { $type: "Float", value: Object.is(n, -0) ? "-0" : String(n) };
  return n;
}

function durationText(d: { months: unknown; days: unknown; seconds: unknown; nanoseconds: unknown }): string {
  const months = Number(d.months);
  const days = Number(d.days);
  const secs = BigInt(String(d.seconds));
  const nanos = Number(d.nanoseconds);
  const frac = nanos ? `.${String(nanos).padStart(9, "0").replace(/0+$/, "")}` : "";
  // Components are kept as stored (months, days, seconds + nanoseconds); P1D is never rewritten as PT24H.
  return `P${months}M${days}DT${secs}${frac}S`;
}

/** Serializes one driver value (bks-read-values.v1). Throws ValueLimitError for refused entities or nesting beyond the cap. */
export function normalizeValue(value: unknown, limits: ValueLimits, state: NormalizeState, path = "$", depth = 0): unknown {
  if (value === null || value === undefined) return null;
  if (depth > limits.nestingCap) throw new ValueLimitError("NESTING_CAP", `value nesting exceeds ${limits.nestingCap} at ${path}`, path);
  if (typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number") return floatValue(value);
  if (typeof value === "bigint") return Number.isSafeInteger(Number(value)) && BigInt(Number(value)) === value ? Number(value) : { $type: "Integer", value: value.toString() };
  if (isInt(value)) {
    const i = value as Integer;
    return i.inSafeRange() ? i.toNumber() : { $type: "Integer", value: i.toString() };
  }
  if (isNode(value) || isRelationship(value) || isUnboundRelationship(value) || isPath(value) || isPathSegment(value)) {
    throw new ValueLimitError("FULL_ENTITY_RETURN", `a whole node/relationship/path was returned at ${path}; return projected release properties (n.uid, n.name, ...) instead`, path);
  }
  if (isDateTime(value)) {
    const dt = value as unknown as { timeZoneId?: string | null; timeZoneOffsetSeconds?: unknown; toString(): string };
    const text = dt.toString().replace(/\[[^\]]+\]$/, "");
    const withOffset = text.replace(/([+-]\d{2}:\d{2}):\d{2}$/, "$1");
    const instant = /[+-]\d{2}:\d{2}$|Z$/i.test(withOffset) ? canonicalInstant(withOffset) : canonicalInstant(`${withOffset}Z`);
    const offset = dt.timeZoneOffsetSeconds === undefined || dt.timeZoneOffsetSeconds === null ? 0 : Number(dt.timeZoneOffsetSeconds);
    // `value` is the UTC instant (semantic identity); the stated offset / zone is kept so the value round-trips exactly.
    if (dt.timeZoneId) return { $type: "DateTime", value: instant, zone: dt.timeZoneId, local: withOffset.replace(/([+-]\d{2}:\d{2}|Z)$/i, "") };
    return offset ? { $type: "DateTime", value: instant, offsetSeconds: offset } : { $type: "DateTime", value: instant };
  }
  if (isDate(value)) return { $type: "Date", value: (value as { toString(): string }).toString() };
  if (isLocalDateTime(value)) return { $type: "LocalDateTime", value: (value as { toString(): string }).toString() };
  if (isTime(value)) return { $type: "Time", value: (value as { toString(): string }).toString() };
  if (isLocalTime(value)) return { $type: "LocalTime", value: (value as { toString(): string }).toString() };
  if (isDuration(value)) return { $type: "Duration", value: durationText(value as never) };
  if (isPoint(value)) {
    const p = value as unknown as { srid: unknown; x: number; y: number; z?: number };
    return p.z === undefined || p.z === null ? { $type: "Point", srid: Number(p.srid), x: p.x, y: p.y } : { $type: "Point", srid: Number(p.srid), x: p.x, y: p.y, z: p.z };
  }
  if (value instanceof Int8Array || value instanceof Uint8Array) return { $type: "Bytes", base64: Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString("base64") };
  if (Array.isArray(value)) {
    let items = value;
    if (items.length > limits.listCap) {
      state.truncations.push({ kind: "list", limit: limits.listCap, path });
      items = items.slice(0, limits.listCap);
    }
    return items.map((v, i) => normalizeValue(v, limits, state, `${path}[${i}]`, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = normalizeValue(v, limits, state, `${path}.${k}`, depth + 1);
    return out;
  }
  throw new ValueLimitError("FULL_ENTITY_RETURN", `unsupported value type ${typeof value} at ${path}`, path);
}

/** Decodes a bks-read-values.v1 value into a driver parameter value (inverse of normalizeValue for every scalar type). */
export function decodeReadValue(v: unknown): unknown {
  if (v === null || typeof v === "boolean" || typeof v === "string") return v;
  if (typeof v === "number") return Number.isInteger(v) ? neo4j.int(v) : v;
  if (Array.isArray(v)) return v.map(decodeReadValue);
  const o = v as Record<string, unknown>;
  switch (o.$type) {
    case "Integer":
      return neo4j.int(String(o.value));
    case "Float":
      return o.value === "NaN" ? NaN : o.value === "Infinity" ? Infinity : o.value === "-Infinity" ? -Infinity : Number(o.value);
    case "DateTime": {
      const s = String(o.value);
      const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?Z$/.exec(s);
      if (!m) throw new Error(`bad DateTime ${s}`);
      const nanos = Number((m[7] ?? "").padEnd(9, "0") || 0);
      if (typeof o.zone === "string" && typeof o.local === "string") {
        const l = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(o.local);
        if (l) return new neo4j.types.DateTime(Number(l[1]), Number(l[2]), Number(l[3]), Number(l[4]), Number(l[5]), Number(l[6]), nanos, undefined, o.zone);
      }
      const off = Number(o.offsetSeconds ?? 0);
      const local = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])) + off * 1000);
      return new neo4j.types.DateTime(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate(), local.getUTCHours(), local.getUTCMinutes(), local.getUTCSeconds(), nanos, off, null);
    }
    case "Date": {
      const [y, mo, d] = String(o.value).split("-").map(Number);
      return new neo4j.types.Date(y!, mo!, d!);
    }
    case "Duration": {
      const m = /^P(-?\d+)M(-?\d+)DT(-?\d+)(?:\.(\d{1,9}))?S$/.exec(String(o.value));
      if (!m) throw new Error(`bad Duration ${String(o.value)}`);
      return new neo4j.types.Duration(Number(m[1]), Number(m[2]), Number(m[3]), Number((m[4] ?? "").padEnd(9, "0") || 0));
    }
    case "Point":
      return o.z === undefined ? new neo4j.types.Point(neo4j.int(Number(o.srid)), Number(o.x), Number(o.y)) : new neo4j.types.Point(neo4j.int(Number(o.srid)), Number(o.x), Number(o.y), Number(o.z));
    case "Bytes":
      return Int8Array.from(Buffer.from(String(o.base64), "base64"));
    default: {
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(o)) out[k] = decodeReadValue(x);
      return out;
    }
  }
}

/** Converts a JSON parameter into the driver value its declared neo4jType names (catalog `neo4jType: DateTime`). */
export function bindParameter(value: unknown, schema: { type?: string; neo4jType?: string; items?: unknown } | undefined): unknown {
  if (value === null || value === undefined) return null;
  if (schema?.neo4jType && typeof value === "string") {
    switch (schema.neo4jType) {
      case "DateTime":
        return neo4j.types.DateTime.fromStandardDate(new Date(canonicalInstant(value)));
      case "Date": {
        const [y, m, d] = value.split("-").map(Number);
        return new neo4j.types.Date(y!, m!, d!);
      }
      case "LocalDateTime":
        return neo4j.types.LocalDateTime.fromStandardDate(new Date(value));
      case "Duration": {
        const m = /^P(?:(\d+)M)?(?:(\d+)D)?(?:T(\d+)S)?$/.exec(value.toUpperCase());
        if (!m) throw new Error(`parameter is not a P<n>M<n>DT<n>S duration: ${value}`);
        return new neo4j.types.Duration(Number(m[1] ?? 0), Number(m[2] ?? 0), Number(m[3] ?? 0), 0);
      }
    }
  }
  if (Array.isArray(value)) return value.map((v) => bindParameter(v, (schema?.items as never) ?? undefined));
  if (typeof value === "number" && (schema?.type === "integer" || (Number.isInteger(value) && schema?.type !== "number"))) return neo4j.int(value);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, bindParameter(v, undefined)]));
  return value;
}


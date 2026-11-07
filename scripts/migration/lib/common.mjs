// Shared helpers for the graph export / restore / verify / migration-plan scripts.
// Format: bks-graph-export.v1. Every property value is encoded losslessly:
//   string | boolean | null      -> as JSON
//   Float (JS number)            -> JSON number; NaN/±Infinity/-0 -> {"$t":"float","v":"NaN"|"Infinity"|"-Infinity"|"-0"}
//   Integer (any size)           -> {"$t":"int","v":"<decimal>"}
//   Date/Time/LocalTime/DateTime/LocalDateTime/Duration -> {"$t":"<Type>", ...components}
//   Point                        -> {"$t":"Point","srid":n,"x":..,"y":..,"z"?:..}
//   byte[]                       -> {"$t":"bytes","v":"<base64>"}
//   arrays                       -> JSON array of encoded elements
// Property values are never maps in Neo4j, so any object value is a tag. Lines are canonical JSON
// (sorted keys, ES number serialization), so file digests are reproducible.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const requireFromKgOps = createRequire(path.join(REPO_ROOT, "packages", "kg-ops", "package.json"));
const requireFromWorkspace = createRequire(path.join(REPO_ROOT, "packages", "schema-workspace", "package.json"));
export const neo4j = requireFromKgOps("neo4j-driver");
export const YAML = requireFromWorkspace("yaml");
const dotenv = requireFromKgOps("dotenv");

export const EXPORT_FORMAT = "bks-graph-export.v1";

/** Loads the repository .env into a private object (never into logs). process.env wins. */
export function loadEnv() {
  const file = path.join(REPO_ROOT, ".env");
  const fromFile = fs.existsSync(file) ? dotenv.parse(fs.readFileSync(file)) : {};
  return { ...fromFile, ...process.env };
}

/** Source connection for export: BKS_EXPORT_* overrides, else the Biotech graph BKS_BIOTECH_GRAPH_* names (kg-ops neo4j.ts semantics). */
export function sourceConfig(env) {
  const overridden = Boolean(env.BKS_EXPORT_URI);
  const uri = overridden ? env.BKS_EXPORT_URI : env.BKS_BIOTECH_GRAPH_URI;
  const username = overridden ? env.BKS_EXPORT_USERNAME ?? "neo4j" : env.BKS_BIOTECH_GRAPH_USERNAME;
  const password = overridden ? env.BKS_EXPORT_PASSWORD : env.BKS_BIOTECH_GRAPH_PASSWORD;
  const database = overridden ? env.BKS_EXPORT_DATABASE ?? "neo4j" : env.BKS_BIOTECH_GRAPH_DATABASE ?? "neo4j";
  if (!uri || !username || !password) throw new Error("missing source Neo4j env (BKS_BIOTECH_GRAPH_URI / BKS_BIOTECH_GRAPH_USERNAME / BKS_BIOTECH_GRAPH_PASSWORD, or BKS_EXPORT_URI/BKS_EXPORT_PASSWORD)");
  return { uri, username, password, database, overridden };
}

/** Target connection for restore/verify/apply rehearsal: BKS_RESTORE_* only. There is no fallback to production names. */
export function targetConfig(env) {
  const uri = env.BKS_RESTORE_URI;
  const username = env.BKS_RESTORE_USERNAME ?? "neo4j";
  const password = env.BKS_RESTORE_PASSWORD;
  const database = env.BKS_RESTORE_DATABASE ?? "neo4j";
  if (!uri || !password) throw new Error("missing target env: BKS_RESTORE_URI and BKS_RESTORE_PASSWORD are required (no fallback to BKS_BIOTECH_GRAPH_*)");
  return { uri, username, password, database };
}

export function uriHost(uri) {
  try {
    return new URL(String(uri).replace(/^(neo4j|bolt)(\+s|\+ssc)?:/, "http:")).hostname;
  } catch {
    return "unparseable";
  }
}

/** Refuses a write target that is the production host (or any Aura host) unless explicitly allowed for a later, separately authorized wave. */
export function assertDisposableTarget(cfg, env, { sourceHost, sourceDatabase } = {}) {
  const host = uriHost(cfg.uri);
  const prodHost = env.BKS_BIOTECH_GRAPH_URI ? uriHost(env.BKS_BIOTECH_GRAPH_URI) : undefined;
  const isAura = /\.databases\.neo4j\.io$/i.test(host);
  const sameAsSource = Boolean(sourceHost) && host === sourceHost && (sourceDatabase ?? "neo4j") === cfg.database;
  if ((prodHost && host === prodHost) || sameAsSource || isAura) {
    if (env.BKS_ALLOW_NON_DISPOSABLE_TARGET !== "I_HAVE_OPERATOR_AUTHORIZATION") {
      throw new Error(`refusing to write to non-disposable target host ${host}: restore/apply rehearsals target local disposable instances only`);
    }
  }
  return host;
}

export function openDriver(cfg) {
  return neo4j.driver(cfg.uri, neo4j.auth.basic(cfg.username, cfg.password), {
    disableLosslessIntegers: false,
    maxConnectionPoolSize: 4,
    connectionAcquisitionTimeout: 30_000,
  });
}

const num = (v) => (neo4j.isInt(v) ? v.toNumber() : typeof v === "bigint" ? Number(v) : v);

export function encodeValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" || typeof v === "boolean") return v;
  if (typeof v === "number") {
    if (Number.isNaN(v)) return { $t: "float", v: "NaN" };
    if (v === Infinity) return { $t: "float", v: "Infinity" };
    if (v === -Infinity) return { $t: "float", v: "-Infinity" };
    if (Object.is(v, -0)) return { $t: "float", v: "-0" };
    return v;
  }
  if (neo4j.isInt(v)) return { $t: "int", v: v.toString() };
  if (typeof v === "bigint") return { $t: "int", v: v.toString() };
  if (Array.isArray(v)) return v.map(encodeValue);
  // byte[]: the JS driver returns Int8Array (and only sends Int8Array as bytes).
  if (v instanceof Int8Array || v instanceof Uint8Array) return { $t: "bytes", v: Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString("base64") };
  if (neo4j.isDateTime(v)) {
    const o = { $t: "DateTime", year: num(v.year), month: num(v.month), day: num(v.day), hour: num(v.hour), minute: num(v.minute), second: num(v.second), nanosecond: num(v.nanosecond) };
    if (v.timeZoneOffsetSeconds !== undefined && v.timeZoneOffsetSeconds !== null) o.timeZoneOffsetSeconds = num(v.timeZoneOffsetSeconds);
    if (v.timeZoneId) o.timeZoneId = v.timeZoneId;
    return o;
  }
  if (neo4j.isLocalDateTime(v)) return { $t: "LocalDateTime", year: num(v.year), month: num(v.month), day: num(v.day), hour: num(v.hour), minute: num(v.minute), second: num(v.second), nanosecond: num(v.nanosecond) };
  if (neo4j.isDate(v)) return { $t: "Date", year: num(v.year), month: num(v.month), day: num(v.day) };
  if (neo4j.isTime(v)) return { $t: "Time", hour: num(v.hour), minute: num(v.minute), second: num(v.second), nanosecond: num(v.nanosecond), timeZoneOffsetSeconds: num(v.timeZoneOffsetSeconds) };
  if (neo4j.isLocalTime(v)) return { $t: "LocalTime", hour: num(v.hour), minute: num(v.minute), second: num(v.second), nanosecond: num(v.nanosecond) };
  if (neo4j.isDuration(v)) return { $t: "Duration", months: num(v.months), days: num(v.days), seconds: num(v.seconds), nanoseconds: num(v.nanoseconds) };
  if (neo4j.isPoint(v)) {
    const o = { $t: "Point", srid: num(v.srid), x: v.x, y: v.y };
    if (v.z !== undefined && v.z !== null) o.z = v.z;
    return o;
  }
  throw new Error(`unencodable property value of type ${Object.prototype.toString.call(v)}`);
}

const I = (x) => neo4j.int(x);
export function decodeValue(v) {
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(decodeValue);
  switch (v.$t) {
    case "int":
      return neo4j.int(v.v);
    case "float":
      return v.v === "NaN" ? NaN : v.v === "Infinity" ? Infinity : v.v === "-Infinity" ? -Infinity : -0;
    case "bytes":
      { const b = Buffer.from(v.v, "base64"); return new Int8Array(b.buffer, b.byteOffset, b.byteLength); }
    case "DateTime":
      return new neo4j.types.DateTime(I(v.year), I(v.month), I(v.day), I(v.hour), I(v.minute), I(v.second), I(v.nanosecond),
        v.timeZoneId ? undefined : I(v.timeZoneOffsetSeconds), v.timeZoneId ?? undefined);
    case "LocalDateTime":
      return new neo4j.types.LocalDateTime(I(v.year), I(v.month), I(v.day), I(v.hour), I(v.minute), I(v.second), I(v.nanosecond));
    case "Date":
      return new neo4j.types.Date(I(v.year), I(v.month), I(v.day));
    case "Time":
      return new neo4j.types.Time(I(v.hour), I(v.minute), I(v.second), I(v.nanosecond), I(v.timeZoneOffsetSeconds));
    case "LocalTime":
      return new neo4j.types.LocalTime(I(v.hour), I(v.minute), I(v.second), I(v.nanosecond));
    case "Duration":
      return new neo4j.types.Duration(I(v.months), I(v.days), I(v.seconds), I(v.nanoseconds));
    case "Point":
      return v.z === undefined ? new neo4j.types.Point(I(v.srid), v.x, v.y) : new neo4j.types.Point(I(v.srid), v.x, v.y, v.z);
    default:
      throw new Error(`unknown value tag ${JSON.stringify(v.$t)}`);
  }
}

/** Neo4j type name of an encoded value (for property-schema summaries). */
export function encodedTypeName(v) {
  if (v === null) return "Null";
  if (typeof v === "string") return "String";
  if (typeof v === "boolean") return "Boolean";
  if (typeof v === "number") return "Float";
  if (Array.isArray(v)) return v.length === 0 ? "List<EMPTY>" : `List<${encodedTypeName(v[0])}>`;
  if (v.$t === "int") return "Integer";
  if (v.$t === "float") return "Float";
  return v.$t;
}

export function encodeProps(props) {
  const out = {};
  for (const k of Object.keys(props).sort()) out[k] = encodeValue(props[k]);
  return out;
}
export function decodeProps(props) {
  const out = {};
  for (const [k, v] of Object.entries(props)) out[k] = decodeValue(v);
  return out;
}

/** Canonical JSON: sorted object keys, ES number serialization, no whitespace. */
export function canonical(value) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error("non-finite number in canonical JSON");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
}

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
export const sha256File = (file) => sha256(fs.readFileSync(file));

/** Line-oriented writer that hashes as it writes. */
export class JsonlWriter {
  constructor(file) {
    this.file = file;
    this.fd = fs.openSync(file, "w");
    this.hash = createHash("sha256");
    this.bytes = 0;
    this.lines = 0;
  }
  write(obj) {
    const buf = Buffer.from(canonical(obj) + "\n", "utf8");
    fs.writeSync(this.fd, buf);
    this.hash.update(buf);
    this.bytes += buf.length;
    this.lines += 1;
  }
  close() {
    fs.closeSync(this.fd);
    return { sha256: this.hash.digest("hex"), bytes: this.bytes, lines: this.lines };
  }
}

export function* readJsonl(file) {
  const text = fs.readFileSync(file, "utf8");
  let start = 0;
  while (start < text.length) {
    const end = text.indexOf("\n", start);
    const line = end === -1 ? text.slice(start) : text.slice(start, end);
    if (line.length) yield JSON.parse(line);
    if (end === -1) break;
    start = end + 1;
  }
}

/** Pretty JSON with sorted keys (deterministic bytes). */
export function writeJson(file, obj) {
  const text = JSON.stringify(JSON.parse(canonical(obj)), null, 2) + "\n";
  fs.writeFileSync(file, text);
  return { sha256: sha256(Buffer.from(text, "utf8")), bytes: Buffer.byteLength(text) };
}

export function utcStamp(d = new Date()) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) args[key] = true;
      else {
        args[key] = next;
        i++;
      }
    } else args._.push(a);
  }
  return args;
}

export const q = (name) => "`" + String(name).replace(/`/g, "``") + "`";
export const labelKey = (labels) => [...labels].sort().join(":");
export const tripleKey = (from, type, to) => `(${from})-[:${type}]->(${to})`;

/** Volatile index/constraint fields excluded from schema comparison and the schema digest. */
export const VOLATILE_INDEX_FIELDS = ["lastRead", "readCount", "populationPercent", "trackedSince", "id"];

export function stripVolatile(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) if (!VOLATILE_INDEX_FIELDS.includes(k)) out[k] = v;
  return out;
}

/** Records a driver result as plain encoded rows. */
export function rowsToPlain(records) {
  return records.map((r) => {
    const o = {};
    for (const k of r.keys) o[k] = plain(r.get(k));
    return o;
  });
}
export function plain(v) {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return v.map(plain);
  if (neo4j.isInt(v)) return v.inSafeRange() ? v.toNumber() : v.toString();
  if (typeof v === "object" && !ArrayBuffer.isView(v) && v.constructor === Object) {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = plain(v[k]);
    return o;
  }
  if (typeof v === "object") return encodeValue(v);
  return v;
}

/** Recomputes every manifest-listed file digest. */
export function verifyExportFiles(dir, mf) {
  const mismatches = [];
  for (const [name, meta] of Object.entries(mf.files)) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) {
      mismatches.push({ name, problem: "missing" });
      continue;
    }
    const actual = sha256File(file);
    if (actual !== meta.sha256) mismatches.push({ name, expected: meta.sha256, actual });
  }
  return { ok: mismatches.length === 0, filesChecked: Object.keys(mf.files).length, mismatches };
}

import { createHash } from "node:crypto";

/**
 * Canonical JSON: object keys sorted recursively, no insignificant whitespace, arrays in order.
 * The Python client (`biotech_knowledge_client.digest`) implements the same algorithm:
 * `json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)`.
 * Numbers must be written the way JSON.stringify writes them (integers without a fractional part).
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = sortKeys(v);
    }
    return out;
  }
  return value;
}

export function sha256Hex(text: string | Uint8Array): string {
  return createHash("sha256").update(text).digest("hex");
}

/** `sha256:<hex>` digest of the canonical JSON form of `value` (contract D-016 hash spelling). */
export function digestOf(value: unknown): string {
  return `sha256:${sha256Hex(canonicalJson(value))}`;
}

export function digestOfText(text: string): string {
  return `sha256:${sha256Hex(text)}`;
}

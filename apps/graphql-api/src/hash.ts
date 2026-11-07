import { createHash } from "node:crypto";

/** `sha256:<hex>` of UTF-8 text or bytes (the release identity spelling used across the program). */
export function sha256Digest(input: string | Uint8Array): string {
  return `sha256:${createHash("sha256").update(input).digest("hex")}`;
}

/** Canonical JSON: keys sorted recursively, no insignificant whitespace, undefined dropped, arrays in order. */
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

export function digestOfJson(value: unknown): string {
  return sha256Digest(canonicalJson(value));
}

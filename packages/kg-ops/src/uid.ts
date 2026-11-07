import { digestOf, sha256Hex } from "@bks/contracts";

/** Lowercase ASCII slug: letters, digits and hyphens; max 80 chars; never empty. */
export function slugify(text: string, max = 80): string {
  const base = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return base || "x";
}

export function shortDigest(value: unknown, length = 8): string {
  return digestOf(value).slice("sha256:".length, "sha256:".length + length);
}

export function shortHash(text: string, length = 8): string {
  return sha256Hex(text).slice(0, length);
}

export function uidOf(token: string, segment: string): string {
  return `hu:${token}:${segment}`;
}

export function uidSegment(uid: string): string {
  const i = uid.lastIndexOf(":");
  return i >= 0 ? uid.slice(i + 1) : uid;
}

export function uidToken(uid: string): string | null {
  const parts = uid.split(":");
  return parts.length >= 3 && parts[0] === "hu" ? (parts[1] ?? null) : null;
}

export function hostAndPathSlug(uri: string): string {
  try {
    const u = new URL(uri);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "");
    return slugify(`${host}${path ? `-${path}` : ""}`, 70);
  } catch {
    return slugify(uri, 70);
  }
}

export function isPrivateUid(uid: string, privateTokens: string[]): boolean {
  return privateTokens.some((t) => uid.startsWith(t));
}

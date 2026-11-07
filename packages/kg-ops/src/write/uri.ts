import { createHash } from "node:crypto";
import { slugify } from "../uid.js";

/**
 * EX-04 canonical URI source identity (bks-canonical-uri/v1). Source identity is a versioned digest of the
 * normalized canonical URI, not a host-path slug: semantic query keys are preserved (YouTube `v`, `list`; any key not
 * on the documented tracking list), documented tracking keys are stripped, the remaining query is sorted by key
 * (stable for repeated keys), scheme/host are lower-cased, default ports and fragments are dropped, and per-host
 * rules map known aliases (youtu.be, m.youtube.com) onto one form. The canonical URI itself is retained on the node
 * and an existing Source with the same uid but a different canonical URI is an identity collision (quarantined, never merged).
 */
export const CANONICAL_URI_VERSION = "bks-canonical-uri/v1";

/** Documented tracking keys (never semantic). */
export const TRACKING_KEYS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id", "utm_name",
  "fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid", "igshid", "yclid", "_hsenc", "_hsmi", "ref_src", "ref_url", "si", "feature",
]);

export interface CanonicalUri {
  uri: string;
  version: typeof CANONICAL_URI_VERSION;
  /** Keys dropped as tracking parameters (recorded as a rewrite). */
  stripped: string[];
  changed: boolean;
}

function hostRules(u: URL): void {
  const host = u.hostname;
  if (host === "youtu.be") {
    const id = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
    u.hostname = "www.youtube.com";
    u.pathname = "/watch";
    if (id) u.searchParams.set("v", id);
  } else if (host === "m.youtube.com" || host === "youtube.com" || host === "music.youtube.com") {
    u.hostname = "www.youtube.com";
  }
  if (u.hostname === "www.youtube.com" && u.pathname.startsWith("/shorts/")) {
    const id = u.pathname.slice("/shorts/".length).split("/")[0] ?? "";
    u.pathname = "/watch";
    if (id) u.searchParams.set("v", id);
  }
  if (host === "dx.doi.org") u.hostname = "doi.org";
}

export function canonicalizeUri(input: string): CanonicalUri {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    // Non-URL endpoint identifiers (e.g. urn:, dataset ids) are kept verbatim; identity is their exact text.
    return { uri: input.trim(), version: CANONICAL_URI_VERSION, stripped: [], changed: input.trim() !== input };
  }
  u.protocol = u.protocol.toLowerCase();
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) u.port = "";
  hostRules(u);
  u.hash = "";
  const stripped: string[] = [];
  const kept: Array<[string, string]> = [];
  for (const [k, v] of u.searchParams) {
    if (TRACKING_KEYS.has(k.toLowerCase()) || /^utm_/i.test(k)) stripped.push(k);
    else kept.push([k, v]);
  }
  kept.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  u.search = "";
  for (const [k, v] of kept) u.searchParams.append(k, v);
  let path = u.pathname;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  u.pathname = path || "/";
  let out = u.toString();
  if (out.endsWith("/") && u.pathname === "/" && !u.search) out = out.slice(0, -1);
  return { uri: out, version: CANONICAL_URI_VERSION, stripped: [...new Set(stripped)].sort(), changed: out !== input };
}

/** Source uid: readable host-path slug plus a digest of the versioned canonical URI (collision-resistant). */
export function sourceUidFor(canonical: string): string {
  let slug: string;
  try {
    const u = new URL(canonical);
    slug = slugify(`${u.hostname.replace(/^www\./, "")}${u.pathname === "/" ? "" : `-${u.pathname}`}`, 48);
  } catch {
    slug = slugify(canonical, 48);
  }
  const h = createHash("sha256").update(`${CANONICAL_URI_VERSION}\n${canonical}`).digest("hex").slice(0, 16);
  return `hu:source:${slug}-${h}`;
}

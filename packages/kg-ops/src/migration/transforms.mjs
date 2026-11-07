// Transform library and per-label field builders for the legacy v0 -> v2 migration.
// Each builder implements the `fields` / `identity` contract written in schema/program/final/migration/legacy-map.yaml
// for one legacy label; plan-migration.mjs checks that every field named in the map is produced here (map/code parity).
// Builders are pure: they read the legacy record (encoded bks-graph-export.v1 values) and derivations, never the clock.
import { createHash } from "node:crypto";

export const PLANNER_VERSION = "0.2.0";

export const sha256Hex = (s) => createHash("sha256").update(s).digest("hex");
export const shortHash = (s, n = 10) => sha256Hex(String(s)).slice(0, n);

/** Same algorithm as packages/kg-ops/src/uid.ts slugify. */
export function slugify(text, max = 80) {
  const base = String(text ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return base || "x";
}

export const normName = (s) => String(s ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function legacyKeyOf(label, props) {
  if (label === "Document") return props.documentId ?? null;
  if (label === "BellLabsSchemaDeploymentEvidence") return props.evidence_id ?? null;
  return props.id ?? null;
}
export function legacyKeyProp(label) {
  if (label === "Document") return "documentId";
  if (label === "BellLabsSchemaDeploymentEvidence") return "evidence_id";
  return "id";
}

/** hu:<token>:<slug(name basis, 48)>-<shortHash('bks-legacy-v0|label|key', 10)> */
export function mintUid(token, nameBasis, label, legacyKey) {
  return `hu:${token}:${slugify(nameBasis ?? "", 48)}-${shortHash(`bks-legacy-v0|${label}|${legacyKey}`, 10)}`;
}

// ---- value transforms over encoded values ----
export const isDateTimeTag = (v) => v && typeof v === "object" && v.$t === "DateTime";
const ISO_INSTANT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;
/** DateTime kept; full ISO-8601 instant strings parsed to an encoded DateTime; anything else -> null. */
export function isoInstant(v) {
  if (v === null || v === undefined) return null;
  if (isDateTimeTag(v)) return v;
  if (typeof v !== "string") return null;
  const m = ISO_INSTANT.exec(v);
  if (!m) return null;
  const off = m[8] === "Z" ? 0 : (m[8][0] === "-" ? -1 : 1) * (Number(m[8].slice(1, 3)) * 3600 + Number(m[8].slice(4, 6)) * 60);
  return { $t: "DateTime", year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5], second: +m[6], nanosecond: m[7] ? Number(m[7].padEnd(9, "0")) : 0, timeZoneOffsetSeconds: off };
}
export function isoString(v) {
  const d = isoInstant(v);
  if (!d) return typeof v === "string" ? v : null;
  const p = (x, n = 2) => String(x).padStart(n, "0");
  const ns = d.nanosecond ? "." + String(d.nanosecond).padStart(9, "0").replace(/0+$/, "") : "";
  const o = d.timeZoneOffsetSeconds ?? 0;
  const off = o === 0 ? "Z" : `${o < 0 ? "-" : "+"}${p(Math.floor(Math.abs(o) / 3600))}:${p(Math.floor((Math.abs(o) % 3600) / 60))}`;
  return `${p(d.year, 4)}-${p(d.month)}-${p(d.day)}T${p(d.hour)}:${p(d.minute)}:${p(d.second)}${ns}${off}`;
}
export function urlHost(u) {
  try {
    return new URL(u).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}
export function urlPath(u) {
  try {
    const p = new URL(u).pathname.replace(/\/+$/, "");
    return p || "/";
  } catch {
    return null;
  }
}
export const firstNonNull = (...xs) => xs.find((x) => x !== null && x !== undefined && x !== "") ?? null;
export function normalizeDoi(v) {
  if (!v) return null;
  return String(v).trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:/i, "").toLowerCase() || null;
}

/** enumMap with explicit miss handling: returns {value} or {miss: legacyValue}. */
export function enumLookup(map, value) {
  if (value !== null && value !== undefined && Object.prototype.hasOwnProperty.call(map ?? {}, value)) return { value: map[value] };
  return { miss: value ?? null };
}

// ---- builders: (legacy node, rule, ctx) -> { fields, identity: {keys, tuple, tier}, nameBasis, hold?: {code, reason} } ----
const hold = (code, reason) => ({ hold: { code, reason } });

export const builders = {
  Biomarker(n, rule, ctx) {
    const p = n.properties;
    const issuer = ctx.derive.metricIssuer(n);
    const fields = {
      name: p.name ?? null,
      metricKind: "ALGORITHM_OUTPUT",
      defaultResultKind: "INFERRED",
      definitionSource: "VENDOR",
      definitionIssuerName: issuer?.name ?? null,
      definitionText: p.description ?? null,
      systemText: p.specimenMatrix ?? null,
      methodText: p.measurementDirectness ?? null,
      searchText: p.searchText ?? null,
      scale: null,
      canonicalUnitCode: null,
    };
    return { fields, nameBasis: p.name, identity: { keys: rule.identity.keys, tuple: ["VENDOR", issuer?.name ?? null, normName(p.name), null], tier: "provisional" } };
  },
  LabTest(n, rule, ctx) {
    const p = n.properties;
    const kind = enumLookup(rule.enumMaps?.testType, p.testType);
    if (kind.miss !== undefined) return hold("ENUM_UNMAPPED", `testType ${JSON.stringify(kind.miss)} not in enumMaps.testType`);
    return { fields: { name: p.name ?? null, testKind: kind.value }, nameBasis: p.name, identity: { keys: rule.identity.keys, tuple: [null, normName(p.name)], tier: "provisional" } };
  },
  PanelDefinition(n, rule) {
    const p = n.properties;
    return { fields: { name: p.name ?? null, testKind: "PANEL" }, nameBasis: p.name, identity: { keys: rule.identity.keys, tuple: [null, normName(p.name)], tier: "provisional" } };
  },
  TechnologyPlatform(n, rule, ctx) {
    const p = n.properties;
    const kind = enumLookup(rule.enumMaps?.platformClass, p.platformClass);
    if (kind.miss !== undefined) return hold("CONDITION_UNMET", rule.elseReason);
    const dev = ctx.derive.developerOrganization(n);
    return {
      fields: { name: p.name ?? null, algorithmFamily: p.name ?? null, familyKey: slugify(p.name ?? "", 80), algorithmKind: kind.value, realization: "VENDOR_IMPLEMENTATION", versionLabel: null, versionBasis: "UNKNOWN", versionPinnedAt: null },
      nameBasis: p.name,
      identity: { keys: rule.identity.keys, tuple: [slugify(p.name ?? "", 80), "VENDOR_IMPLEMENTATION", dev?.uid ?? null, null], tier: "provisional" },
    };
  },
  Product(n, rule) {
    const p = n.properties;
    const kind = enumLookup(rule.enumMaps?.productType, p.productType);
    if (kind.miss !== undefined) return hold("ENUM_UNMAPPED", `productType ${JSON.stringify(kind.miss)} not in enumMaps.productType`);
    return { fields: { name: p.name ?? null, productKind: kind.value, marketedName: p.name ?? null, jurisdiction: null }, nameBasis: p.name, identity: { keys: rule.identity.keys, tuple: [null, normName(p.name), null], tier: "provisional" } };
  },
  Listing(n, rule, ctx) {
    const p = n.properties;
    const host = urlHost(p.url);
    const path = urlPath(p.url);
    if (!host || !path) return hold("IDENTITY_UNRESOLVED", "listing url does not parse to (hostDomain, hostItemId)");
    const dtc = ctx.derive.hostMatchesLister(n);
    return {
      fields: { name: p.name ?? null, listingKind: dtc ? "DTC_PRODUCT_PAGE" : "OTHER", hostDomain: host, hostItemId: path, canonicalUrl: p.url, titleAsDisplayed: p.name ?? null, firstObservedAt: null, lastObservedAt: null },
      nameBasis: p.name,
      identity: { keys: rule.identity.keys, tuple: [host, path], tier: "exact" },
    };
  },
  Organization(n, rule) {
    const p = n.properties;
    const kind = enumLookup(rule.enumMaps?.organizationType, p.organizationType);
    const nameBasis = firstNonNull(p.displayName, p.name);
    return {
      fields: { name: nameBasis, entityKind: p.legalName ? "LEGAL_ENTITY" : "UNSPECIFIED", organizationKind: kind.value ?? null, legalName: p.legalName ?? null, jurisdiction: null, status: null, description: p.description ?? null },
      nameBasis,
      identity: { keys: rule.identity.keys, tuple: [normName(firstNonNull(p.legalName, nameBasis)), null], tier: "provisional" },
    };
  },
  Person(n, rule, ctx) {
    const p = n.properties;
    const basis = ctx.derive.publicActorBasis(n);
    if (!basis.length) return hold("CONDITION_UNMET", rule.elseReason);
    return {
      fields: { name: p.name ?? null, publicActorBasis: basis, credentialsVerbatim: null, description: p.description ?? null, privacyClass: "PUBLIC" },
      nameBasis: p.name,
      identity: { keys: rule.identity.keys, tuple: [normName(p.name), basis.join("|"), ctx.derive.personOrganizations(n).join("|") || null], tier: "provisional" },
    };
  },
  Study(n, rule) {
    const p = n.properties;
    const kind = enumLookup(rule.enumMaps?.evidenceLevel, p.evidenceLevel);
    if (kind.miss !== undefined) return hold("ENUM_UNMAPPED", `evidenceLevel ${JSON.stringify(kind.miss)} not in enumMaps.evidenceLevel`);
    const doi = normalizeDoi(firstNonNull(p.doi, p.registryNamespace === "DOI" ? p.registryId : null));
    return {
      fields: { name: p.name ?? null, publicationKind: kind.value, publishedAt: null, venueName: null },
      nameBasis: p.name,
      identity: { keys: rule.identity.keys, tuple: [doi], tier: doi ? "exact" : "unresolved" },
      identifiers: doi ? [{ scheme: "DOI", issuer: "doi.org", value: doi, normalizationRule: "lower-case; strip https://doi.org/ prefix", isPrimary: true }] : [],
    };
  },
  Event(n, rule, ctx) {
    const p = n.properties;
    const status = enumLookup(rule.enumMaps?.eventStatus, p.eventStatus);
    if (status.miss !== undefined) return hold("CONDITION_UNMET", rule.elseReason);
    const kind = enumLookup(rule.enumMaps?.eventCategory, p.eventCategory);
    if (kind.miss !== undefined) return hold("ENUM_UNMAPPED", `eventCategory ${JSON.stringify(kind.miss)} not in enumMaps.eventCategory`);
    const subj = ctx.derive.eventPrimarySubject(n);
    return {
      fields: {
        name: p.name ?? null, eventKind: kind.value, eventKindNote: kind.value === "OTHER" ? `legacy eventCategory ${p.eventCategory}` : null, eventStatus: status.value,
        startedAt: isoInstant(p.happenedAt), startedAtBasis: "UNKNOWN", startedAtPrecision: null, summaryText: p.summaryText ?? null, jurisdiction: null,
      },
      nameBasis: p.name,
      identity: { keys: rule.identity.keys, tuple: [kind.value, subj?.uid ?? null, null, isoString(p.happenedAt), normName(p.name)], tier: "provisional" },
    };
  },
  RegulatoryStatus(n, rule) {
    const p = n.properties;
    const kind = enumLookup(rule.enumMaps?.statusCode, p.statusCode);
    if (kind.miss !== undefined) return hold("CONDITION_UNMET", rule.elseReason);
    if (!p.jurisdictionCode) return hold("IDENTITY_UNRESOLVED", "jurisdiction is required for LegalStatus");
    return {
      fields: { name: p.name ?? null, statusKind: kind.value, statusFamily: "MARKET_ACCESS", jurisdiction: p.jurisdictionCode, pathway: null, statusVerbatim: p.statusCode, marketStatus: null, claimNumbers: null },
      nameBasis: p.name,
      identity: { keys: rule.identity.keys, tuple: ["<STATUS_OF subject>", p.jurisdictionCode, null, kind.value, null, null], tier: "provisional" },
    };
  },
  Compound(n, rule) {
    const p = n.properties;
    return { fields: { name: p.name ?? null, substanceClass: null, searchText: p.searchText ?? null }, nameBasis: p.name, identity: { keys: rule.identity.keys, tuple: [null, null, normName(p.name), null], tier: "provisional" } };
  },
  CompoundForm(n, rule) {
    const p = n.properties;
    return { fields: { name: p.name ?? null, materialKind: "UNRESOLVED", searchText: p.searchText ?? null }, nameBasis: p.name, identity: { keys: rule.identity.keys, tuple: ["UNRESOLVED", null, null, null, normName(p.name)], tier: "provisional" } };
  },
};

/** Fields each builder emits for its `fields` contract (used for map/code parity checks). */
export const builderFieldKeys = {
  Biomarker: ["metricKind", "defaultResultKind", "definitionSource", "definitionIssuerName", "scale", "canonicalUnitCode"],
  LabTest: ["testKind"],
  PanelDefinition: ["testKind"],
  TechnologyPlatform: ["algorithmFamily", "familyKey", "algorithmKind", "realization", "versionLabel", "versionBasis", "versionPinnedAt"],
  Product: ["productKind", "marketedName", "jurisdiction"],
  Listing: ["listingKind", "hostDomain", "hostItemId", "canonicalUrl", "titleAsDisplayed", "firstObservedAt", "lastObservedAt"],
  Organization: ["entityKind", "organizationKind", "legalName", "jurisdiction", "status"],
  Person: ["publicActorBasis", "credentialsVerbatim"],
  Study: ["publicationKind", "publishedAt", "venueName"],
  Event: ["eventKind", "eventKindNote", "eventStatus", "startedAt", "startedAtBasis", "startedAtPrecision", "summaryText", "jurisdiction"],
  RegulatoryStatus: ["statusKind", "statusFamily", "jurisdiction", "pathway", "statusVerbatim", "marketStatus", "claimNumbers"],
  Compound: ["substanceClass"],
  CompoundForm: ["materialKind"],
};

/** Edge-condition evaluators named in the map (`condition:` strings). */
export function edgeCondition(cond, rel, ctx) {
  if (!cond) return true;
  if (cond === "roleType == AUTHOR") return rel.properties.roleType === "AUTHOR";
  if (cond === "roleType == DISTRIBUTOR") return rel.properties.roleType === "DISTRIBUTOR";
  if (cond === "derivation hostMatchesLister") return ctx.derive.hostMatchesListerEdge(rel);
  throw new Error(`unknown edge condition ${cond}`);
}

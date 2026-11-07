import { createHash } from "node:crypto";
import {
  canonicalDigest,
  canonicalInstant,
  canonicalize,
  type DeclaredNodeEffect,
  type DeclaredRelationshipEffect,
  type IngestionIntentV2,
  type PlanInvariant,
  type PlanIssue,
  type PlannedStatementV2,
  type ProposalPlanV2,
  type SubjectPlanV2,
  type BksErrorCode,
} from "@bks/contracts";
import type { Property } from "@bks/schema-workspace";
import { slugify } from "../uid.js";
import type { Observations } from "./observations.js";
import type { NodeSpec, WriteSchema } from "./release-model.js";

export const q = (s: string) => `\`${s.replace(/`/g, "``")}\``;
export const labelsOf = (spec: NodeSpec) => spec.labels.map(q).join(":");
export const h = (text: string, n = 20) => createHash("sha256").update(text).digest("hex").slice(0, n);
export const hc = (value: unknown, n = 20) => h(canonicalize(value), n);
export const TX_NOW = "datetime.transaction()";

export interface PrincipalCtx {
  principalId: string;
  installationId: string;
  applicationId: string;
  tenantId: string;
  grants: string[];
}

export interface BasisCtx {
  kind: "snapshot" | "creationOnly";
  snapshotRef?: string;
  snapshotDigest?: string;
  snapshotGraphRevision?: number | null;
  dependencies?: { complete: boolean; nodes: Array<{ uid: string; updatedAt: string | null }> };
  reason?: string;
  expectAbsent: string[];
  expectPresent: string[];
  /** Error detected while verifying custody (snapshot missing, digest mismatch, scope mismatch). */
  error?: { code: BksErrorCode; message: string };
}

export interface VerificationCtx {
  ref: string;
  digest: string;
  body?: import("@bks/contracts").SealedVerificationBody;
  error?: { code: BksErrorCode; message: string };
}

export interface CompileInput {
  intent: IngestionIntentV2;
  intentDigest: string;
  schema: WriteSchema;
  obs: Observations;
  plannedAt: string;
  executorVersion: string;
  agentUid: string;
  agentName: string;
  principal: PrincipalCtx;
  basis: BasisCtx;
  verifications: Map<string, VerificationCtx>;
}

export interface RefTarget {
  uid: string;
  nodeType: string;
  kind: "subject" | "source" | "proposal";
  /** Created by this plan (needs its creating statement). */
  creating: boolean;
  /** For subject refs whose subject is not usable. */
  unusable?: string;
  newProps?: Record<string, unknown>;
}

export interface LocatorInfo {
  ref: string;
  uid: string;
  selectorDigest: string;
  snapshotUid: string;
  sourceUid: string;
  contentHashBasis: string;
  exists: boolean;
  invalid?: string;
  reportsFields: string[];
  expectedSelectedContentDigest?: string;
}

export interface EpisodeRec {
  relationshipUid: string;
  toUid: string;
  assertionUid: string;
  asserterUid: string | null;
  validFrom: string | null;
  validTo: string | null;
}

export class Ctx {
  readonly schema: WriteSchema;
  readonly intent: IngestionIntentV2;
  readonly obs: Observations;
  readonly statements: PlannedStatementV2[] = [];
  readonly errors: PlanIssue[] = [];
  readonly warnings: PlanIssue[] = [];
  readonly subjects = new Map<string, SubjectPlanV2>();
  readonly refs = new Map<string, RefTarget>();
  readonly locators = new Map<string, LocatorInfo>();
  readonly locatorsByUid = new Map<string, LocatorInfo>();
  readonly proposals = new Map<string, ProposalPlanV2>();
  readonly nodeEffects: DeclaredNodeEffect[] = [];
  readonly relEffects: DeclaredRelationshipEffect[] = [];
  readonly invariants: PlanInvariant[] = [];
  /** uid -> statement id that creates it in this plan. */
  readonly creators = new Map<string, string>();
  /** relationshipUids closed by this plan. */
  readonly closedEpisodes = new Set<string>();
  /** Assertion uids superseded by this plan. */
  readonly superseded = new Set<string>();
  /** Episodes opened by this plan (for intra-intent slot and one-episode-per-asserter checks). */
  readonly openedEpisodes: Array<EpisodeRec & { type: string; fromUid: string }> = [];
  /** identifier key -> owner uid attached by this plan. */
  readonly identOwners = new Map<string, string>();
  /** Statement ids per proposal while it compiles. */
  current: { proposalId: string; ids: string[] } | null = null;
  readonly activityUid: string;
  readonly runId: string;
  readonly runSystem: string;
  readonly privacyClass: string;
  activityExists = false;
  private seq = 0;

  constructor(readonly input: CompileInput) {
    this.schema = input.schema;
    this.intent = input.intent;
    this.obs = input.obs;
    this.runId = input.intent.context.run.runId;
    this.runSystem = input.intent.context.run.system;
    this.activityUid = activityUidFor(this.runSystem, this.runId);
    this.privacyClass = input.intent.defaults.privacyClass;
  }

  grant(name: string): boolean {
    return this.input.principal.grants.includes(name);
  }

  error(code: string, message: string, details?: unknown): void {
    this.errors.push({ code, message, ...(details === undefined ? {} : { details: details as never }) });
  }

  warn(code: string, message: string, details?: unknown): void {
    this.warnings.push({ code, message, ...(details === undefined ? {} : { details: details as never }) });
  }

  /** Adds a statement; `uses` lists every uid it MATCHes (dependency closure for partial apply). */
  stmt(s: {
    group: PlannedStatementV2["group"];
    purpose: string;
    cypher: string;
    params: Record<string, unknown>;
    rows: number;
    nodes: number;
    rels: number;
    uses?: string[];
    creates?: string[];
  }): string {
    const id = `s${String(++this.seq).padStart(4, "0")}`;
    const proposalId = s.group === "proposal" ? this.current?.proposalId : undefined;
    this.statements.push({
      id,
      ...(proposalId ? { proposalId } : {}),
      group: s.group,
      purpose: s.purpose,
      cypher: s.cypher,
      params: { ...s.params, runId: this.runId },
      expectRows: s.rows,
      expectNodesCreated: s.nodes,
      expectRelationshipsCreated: s.rels,
      needs: [...new Set(s.uses ?? [])].sort(),
    });
    for (const uid of s.creates ?? []) if (!this.creators.has(uid)) this.creators.set(uid, id);
    if (this.current && s.group === "proposal") this.current.ids.push(id);
    return id;
  }

  nodeEffect(e: Omit<DeclaredNodeEffect, "proposalId"> & { proposalId?: string }): void {
    this.nodeEffects.push({ ...e, ...(this.current && !e.proposalId ? { proposalId: this.current.proposalId } : {}) } as DeclaredNodeEffect);
  }

  relEffect(e: Omit<DeclaredRelationshipEffect, "proposalId" | "assertionUid"> & { assertionUid?: string | null }): void {
    this.relEffects.push({ ...e, assertionUid: e.assertionUid ?? null, ...(this.current ? { proposalId: this.current.proposalId } : {}) } as DeclaredRelationshipEffect);
  }

  invariant(kind: PlanInvariant["kind"], failure: BksErrorCode, params: Record<string, unknown>): void {
    this.invariants.push({ id: `i${String(this.invariants.length + 1).padStart(4, "0")}`, kind, failure, ...(this.current ? { proposalId: this.current.proposalId } : {}), params });
  }

  /** Observation helper: undefined while probing (treated as unknown). */
  o<T>(key: string): T | null | undefined {
    return this.obs.get<T>(key);
  }
}

export function activityUidFor(system: string, runId: string): string {
  return `hu:activity:${slugify(system, 20)}-${slugify(runId, 60)}-${h(`${system}\n${runId}`, 8)}`;
}

/** Splits node property values into plain / DateTime / Date params and the Cypher SET clause for them. */
/**
 * Int-typed properties travel in the JSON plan as numbers, which the driver sends as Float. The SET clause re-assigns
 * them with toInteger(...) after the map merge, so the stored value is an Integer (lists element-wise). Plans stay
 * plain JSON (digests unchanged in shape); the cast is part of the compiled, digested Cypher.
 */
export function intCasts(properties: Iterable<Property> | undefined, props: Record<string, unknown>, alias: string, param: string): string {
  if (!properties) return "";
  const byName = new Map([...properties].map((p) => [p.name, p]));
  const parts = Object.keys(props)
    .filter((k) => {
      const p = byName.get(k);
      const v = props[k];
      return p !== undefined && p.namedType === "Int" && v !== null && v !== undefined;
    })
    .sort()
    .map((k) => (byName.get(k)!.isList ? `${alias}.${q(k)} = [x IN $${param}.${q(k)} | toInteger(x)]` : `${alias}.${q(k)} = toInteger($${param}.${q(k)})`));
  return parts.length ? `, ${parts.join(", ")}` : "";
}

export function propertyParams(spec: { properties: Map<string, Property> } | null, props: Record<string, unknown>, alias: string, prefix: string): { plain: Record<string, unknown>; dt: Record<string, string>; d: Record<string, string>; clause: string } {
  const plain: Record<string, unknown> = {};
  const dt: Record<string, string> = {};
  const d: Record<string, string> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined) continue;
    const p = spec?.properties.get(k);
    if (p && p.namedType === "DateTime" && typeof v === "string") dt[k] = canonicalInstant(v);
    else if (p && p.namedType === "Date" && typeof v === "string") d[k] = v;
    else plain[k] = v;
  }
  const parts = [
    ...Object.keys(dt).sort().map((k) => `${alias}.${q(k)} = datetime($${prefix}Dt.${q(k)})`),
    ...Object.keys(d).sort().map((k) => `${alias}.${q(k)} = date($${prefix}D.${q(k)})`),
  ];
  const ints = intCasts(spec?.properties.values(), plain, alias, `${prefix}Props`);
  return { plain, dt, d, clause: (parts.length ? `, ${parts.join(", ")}` : "") + ints };
}

/** Validates author-supplied node properties against the SDL type. Returns errors. */
export function checkNodeProps(ctx: Ctx, spec: NodeSpec, props: Record<string, unknown>, mode: "create" | "update"): string[] {
  const errors: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    const p = spec.properties.get(k);
    if (!p) {
      errors.push(`UNKNOWN_PROPERTY: ${spec.name}.${k} is not in the release`);
      continue;
    }
    if (k === "name") continue;
    if (k === "privacyClass" && (v === "INTERNAL" || v === ctx.privacyClass)) continue; // authors may only tighten access
    if (EXECUTOR_OWNED_NODE_PROPS.has(k)) {
      errors.push(`EXECUTOR_FIELD: ${spec.name}.${k} is set by the executor`);
      continue;
    }
    if (p.readOnly) {
      errors.push(`READ_ONLY_PROPERTY: ${spec.name}.${k}`);
      continue;
    }
    if (mode === "update" && spec.updatableProperties && !spec.updatableProperties.includes(k)) errors.push(`NOT_UPDATABLE: ${spec.name}.${k} (register allows updates of ${spec.updatableProperties.join(", ")})`);
    const e = ctx.schema.checkValue({ ...p, isRequired: false }, v);
    if (e) errors.push(`INVALID_PROPERTY: ${spec.name}.${e}`);
  }
  return errors;
}

export const EXECUTOR_OWNED_NODE_PROPS = new Set(["id", "uid", "createdAt", "updatedAt", "lastWriterRunId", "privacyClass", "recordedAt", "recordedTo"]);

/** OD-17: contact details never enter the scientific graph. Returns the cleaned properties and the rewrites made. */
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE = /(?:\+\d{1,3}[\s.-]?)?\(?\b\d{2,4}\)?[\s.-]\d{3,4}[\s.-]\d{3,4}\b/g;
export function stripContacts(props: Record<string, unknown>): { props: Record<string, unknown>; rewrites: Array<{ field: string; from: unknown; to: unknown; rule: string }> } {
  const out: Record<string, unknown> = {};
  const rewrites: Array<{ field: string; from: unknown; to: unknown; rule: string }> = [];
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string" && (EMAIL.test(v) || PHONE.test(v))) {
      EMAIL.lastIndex = 0;
      PHONE.lastIndex = 0;
      const cleaned = v.replace(EMAIL, "[contact removed]").replace(PHONE, "[contact removed]");
      rewrites.push({ field: k, from: "[contact detail]", to: cleaned, rule: "OD-17" });
      out[k] = cleaned;
    } else out[k] = v;
    EMAIL.lastIndex = 0;
    PHONE.lastIndex = 0;
  }
  return { props: out, rewrites };
}

export function containsContact(text: string): boolean {
  const r = EMAIL.test(text) || PHONE.test(text);
  EMAIL.lastIndex = 0;
  PHONE.lastIndex = 0;
  return r;
}

/** Predicates that would carry private-person data (OD-17); never written. */
export const PRIVATE_PERSON_PREDICATES = /^(SPOUSE_OF|MARRIED_TO|CHILD_OF|PARENT_OF_PERSON|SIBLING_OF|FAMILY_OF|RELATIVE_OF|HOME_ADDRESS|HAS_PHONE|HAS_EMAIL|CONTACT_EMAIL|CONTACT_PHONE|LIVES_AT|DATE_OF_BIRTH)$/;

export function instantOrNull(v: string | null | undefined): string | null {
  return v ? canonicalInstant(v) : null;
}

/** Half-open interval overlap with null = unbounded. */
export function intervalsOverlap(aFrom: string | null, aTo: string | null, bFrom: string | null, bTo: string | null): boolean {
  const t = (x: string | null, dflt: number) => (x ? Date.parse(x) : dflt);
  const af = t(aFrom, -Infinity), at = t(aTo, Infinity), bf = t(bFrom, -Infinity), bt = t(bTo, Infinity);
  return af < bt && bf < at;
}

export function digestOfSorted(values: string[]): string {
  return canonicalDigest([...new Set(values)].sort());
}

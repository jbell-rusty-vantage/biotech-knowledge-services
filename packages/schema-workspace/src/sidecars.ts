import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { digestOfText } from "@bks/contracts";
import type { SchemaIR } from "./ir.js";
import { sidecarDir } from "./load.js";

/**
 * Workspace inputs ("sidecars") of the pinned release (FU-09). The authority is the upstream release directory
 * biotech-meta/docs/schema/releases/<release>/workspace-inputs/; the verified pinned copy is
 * schema/pinned/release/workspace-inputs/ (loadRelease checks every byte). They are keyed to modules K, D1..D13 and v2
 * concepts; old v1 navigation ids survive only as documented aliases (aliases.yaml).
 */

export interface DomainSidecar {
  slug: string;
  title: string;
  /** Module ids (K, D1..D13) of the domain. Filled from the YAML `modules` key (v2); `fragments` is the v1 key. */
  fragments: string[];
  /** Same as `fragments` (v2 name); always set by loadSidecars. */
  modules?: string[];
  purpose: string;
  entryTypes: string[];
  questions: string[];
  writeGuidance?: string;
}

export interface TermSidecar {
  term: string;
  aliases: string[];
  ids: string[];
  definition?: string;
}

export interface TaskSidecar {
  slug: string;
  title: string;
  phase: string;
  domains: string[];
  summary: string;
  nodeTypes: string[];
  relationshipTypes: string[];
  readOperations: string[];
  proposalKinds: string[];
  /** Proposal kinds of this route that need the executor v2 planner (S3); listed in proposalKinds too. */
  pendingProposalKinds?: string[];
  steps: string[];
  pitfalls: string[];
}

export interface IdentityRulesSidecar {
  version: number;
  defaults: {
    nameProperties: string[];
    uidSlugFrom: string;
    fulltextIsCandidateOnly: boolean;
    identifierNormalization: Record<string, string>;
  };
  types: Record<string, { identifierSchemes: string[]; activeIdentifierSchemes?: string[]; identityKeys?: string[]; nameProperties?: string[]; uidSlugFrom?: string }>;
}

export interface IngestionRulesSidecar {
  version: number;
  relationshipClasses: Record<string, { rule: string; proposalKind: string | null }>;
  kernelPlumbing: Record<string, string>;
  edgeProfiles: Record<string, { executorSets: string[] }>;
  assertionDefaults: Record<string, string>;
  nodeDefaults: Record<string, string | boolean>;
  uid: { pattern: string; tokenSource: string; slug: string; mintedBy: Record<string, string> };
  deny: string[];
  forbiddenImplicationsSource: string;
}

export type AliasKind = "renamed" | "merged" | "split" | "removed" | "kept";

export interface AliasEntry {
  kind: AliasKind;
  /** Live v2 workspace ids; empty for removed concepts. */
  to: string[];
  /** Related live v2 ids for a removed concept (pattern edges, the predicate's Assertion), never a substitute. */
  seeAlso?: string[];
  explanation: string;
  source: string;
}

export interface AliasesSidecar {
  format: string;
  releaseId?: string;
  aliases: Record<string, AliasEntry>;
}

export interface Sidecars {
  domains: DomainSidecar[];
  terms: TermSidecar[];
  tasks: TaskSidecar[];
  identityRules: IdentityRulesSidecar;
  ingestionRules: IngestionRulesSidecar;
  /** v1 -> v2 navigation aliases (aliases.yaml; absent only in a pre-v2 sidecar set). */
  aliases?: AliasesSidecar;
  digests: Record<string, string>;
}

const FILES = {
  domains: "domains.yaml",
  terminology: "terminology.yaml",
  tasks: "task-routes.yaml",
  identityRules: "identity-rules.yaml",
  ingestionRules: "ingestion-rules.yaml",
  aliases: "aliases.yaml",
} as const;

/** The executor's identifier normalization rule names (kg-ops schema-access.ts normalizeIdentifier). */
export const NORMALIZATION_RULES = ["lowercase", "uppercase", "digits", "lowercase-url", "lowercase-host", "as-is"] as const;

export function loadSidecars(dir: string = sidecarDir): Sidecars {
  const read = (name: string) => readFileSync(resolve(dir, name), "utf8");
  const digests: Record<string, string> = {};
  const load = <T>(name: string): T => {
    const text = read(name);
    digests[name] = digestOfText(text);
    return parseYaml(text) as T;
  };
  type RawDomain = Omit<DomainSidecar, "fragments" | "modules"> & { modules?: string[]; fragments?: string[] };
  const domains = load<{ domains: RawDomain[] }>(FILES.domains).domains;
  const terms = load<{ terms: TermSidecar[] }>(FILES.terminology).terms;
  const tasks = load<{ tasks: TaskSidecar[] }>(FILES.tasks).tasks;
  const identityRules = load<IdentityRulesSidecar>(FILES.identityRules);
  const ingestionRules = load<IngestionRulesSidecar>(FILES.ingestionRules);
  const aliases = existsSync(resolve(dir, FILES.aliases)) ? load<AliasesSidecar>(FILES.aliases) : undefined;
  return {
    domains: domains.map((d) => {
      const modules = d.modules ?? d.fragments ?? [];
      return { ...d, fragments: modules, modules, entryTypes: d.entryTypes ?? [], questions: d.questions ?? [] };
    }),
    terms: terms.map((t) => ({ ...t, aliases: t.aliases ?? [], ids: t.ids ?? [] })),
    tasks: tasks.map((t) => ({
      ...t,
      nodeTypes: t.nodeTypes ?? [],
      relationshipTypes: t.relationshipTypes ?? [],
      readOperations: t.readOperations ?? [],
      proposalKinds: t.proposalKinds ?? [],
      pendingProposalKinds: t.pendingProposalKinds ?? [],
      steps: t.steps ?? [],
      pitfalls: t.pitfalls ?? [],
    })),
    identityRules,
    ingestionRules,
    ...(aliases ? { aliases: { ...aliases, aliases: aliases.aliases ?? {} } } : {}),
    digests,
  };
}

/** Every reference in a sidecar must resolve against the IR; the build fails on any unknown name. */
export function validateSidecars(ir: SchemaIR, sidecars: Sidecars): string[] {
  const errors: string[] = [];
  const nodeNames = new Set(ir.nodes.map((n) => n.name));
  const relNames = new Set(ir.relationshipTypes.map((r) => r.type));
  const enumNames = new Set(ir.enums.map((e) => e.name));
  const unionNames = new Set(ir.unions.map((u) => u.name));
  const ifaceNames = new Set(ir.interfaces.map((i) => i.name));
  const edgeNames = new Set(ir.edgePropertyTypes.map((e) => e.name));
  const fragmentIds = new Set(ir.fragments.map((f) => f.id));
  const domainSlugs = new Set(sidecars.domains.map((d) => d.slug));
  const taskSlugs = new Set(sidecars.tasks.map((t) => t.slug));
  const termSlugs = new Set(sidecars.terms.map((t) => t.term.toLowerCase().replace(/\s+/g, "-")));

  // Domains: every module (fragment) in exactly one domain; entry types exist.
  const assigned = new Map<string, string>();
  for (const d of sidecars.domains) {
    if (!d.fragments.length) errors.push(`domains.yaml: domain ${d.slug} lists no module`);
    for (const f of d.fragments) {
      if (!fragmentIds.has(f)) errors.push(`domains.yaml: domain ${d.slug} names unknown module ${f}`);
      if (assigned.has(f)) errors.push(`domains.yaml: module ${f} assigned to both ${assigned.get(f)} and ${d.slug}`);
      assigned.set(f, d.slug);
    }
    for (const t of d.entryTypes) if (!nodeNames.has(t)) errors.push(`domains.yaml: domain ${d.slug} entry type ${t} is not a node type`);
  }
  for (const f of ir.fragments) if (!assigned.has(f.id)) errors.push(`domains.yaml: module ${f.id} (${f.title}) is not assigned to a domain`);

  const liveId = (id: string): boolean => {
    const i = id.indexOf(":");
    if (i < 0) return false;
    const kind = id.slice(0, i);
    const name = id.slice(i + 1);
    return (
      (kind === "node" && nodeNames.has(name)) ||
      (kind === "rel" && relNames.has(name)) ||
      (kind === "enum" && enumNames.has(name)) ||
      (kind === "union" && unionNames.has(name)) ||
      (kind === "iface" && ifaceNames.has(name)) ||
      (kind === "edge" && edgeNames.has(name)) ||
      (kind === "dom" && domainSlugs.has(name)) ||
      (kind === "frag" && fragmentIds.has(name)) ||
      (kind === "task" && taskSlugs.has(name)) ||
      (kind === "term" && termSlugs.has(name))
    );
  };
  const checkId = (where: string, id: string) => {
    if (!liveId(id)) errors.push(`${where}: unknown id ${id}`);
  };

  // Terminology.
  const seenTerms = new Set<string>();
  for (const t of sidecars.terms) {
    if (seenTerms.has(t.term)) errors.push(`terminology.yaml: duplicate term "${t.term}"`);
    seenTerms.add(t.term);
    if (!t.ids.length) errors.push(`terminology.yaml term "${t.term}": no ids`);
    for (const id of t.ids) checkId(`terminology.yaml term "${t.term}"`, id);
  }

  // Task routes.
  const seenTasks = new Set<string>();
  for (const t of sidecars.tasks) {
    if (seenTasks.has(t.slug)) errors.push(`task-routes.yaml: duplicate task ${t.slug}`);
    seenTasks.add(t.slug);
    for (const n of t.nodeTypes) if (!nodeNames.has(n)) errors.push(`task-routes.yaml task ${t.slug}: unknown node type ${n}`);
    for (const r of t.relationshipTypes) if (!relNames.has(r)) errors.push(`task-routes.yaml task ${t.slug}: unknown relationship type ${r}`);
    for (const d of t.domains) if (!domainSlugs.has(d)) errors.push(`task-routes.yaml task ${t.slug}: unknown domain ${d}`);
    for (const k of t.pendingProposalKinds ?? []) if (!t.proposalKinds.includes(k)) errors.push(`task-routes.yaml task ${t.slug}: pending proposal kind ${k} is not in proposalKinds`);
  }

  // Identity rules: types, properties, scheme codes, normalization rule names.
  const schemeCodes = new Set<string>();
  const activeSchemes = new Set(ir.params.activeIdentifierSchemes ?? []);
  for (const n of ir.nodes) for (const s of n.identifierSchemes) if (s.writeStatus !== "unregistered") schemeCodes.add(s.scheme);
  for (const s of activeSchemes) schemeCodes.add(s);
  const knownScheme = (code: string) => schemeCodes.has(code) || activeSchemes.has(code);
  for (const [scheme, rule] of Object.entries(sidecars.identityRules.defaults.identifierNormalization)) {
    if (!(NORMALIZATION_RULES as readonly string[]).includes(rule)) errors.push(`identity-rules.yaml: normalization rule ${rule} for ${scheme} is not an executor rule (${NORMALIZATION_RULES.join(", ")})`);
  }
  for (const p of sidecars.identityRules.defaults.nameProperties) if (!ir.nodes.some((n) => n.properties.some((q) => q.name === p))) errors.push(`identity-rules.yaml: default name property ${p} exists on no node type`);
  for (const [type, rule] of Object.entries(sidecars.identityRules.types)) {
    const node = ir.nodes.find((n) => n.name === type);
    if (!node) {
      errors.push(`identity-rules.yaml: unknown node type ${type}`);
      continue;
    }
    for (const p of rule.nameProperties ?? []) if (!node.properties.some((q) => q.name === p)) errors.push(`identity-rules.yaml: ${type}.${p} is not a property`);
    if (rule.uidSlugFrom && !node.properties.some((q) => q.name === rule.uidSlugFrom)) errors.push(`identity-rules.yaml: ${type}.uidSlugFrom ${rule.uidSlugFrom} is not a property`);
    for (const s of rule.identifierSchemes ?? []) if (!knownScheme(s)) errors.push(`identity-rules.yaml: ${type} names identifier scheme ${s}, not in the release identifier register`);
    for (const s of rule.activeIdentifierSchemes ?? []) {
      if (!(rule.identifierSchemes ?? []).includes(s)) errors.push(`identity-rules.yaml: ${type} active scheme ${s} is not in its identifierSchemes`);
      if (ir.params.activeIdentifierSchemes && !activeSchemes.has(s)) errors.push(`identity-rules.yaml: ${type} lists ${s} as active, but the release register disables it`);
    }
  }

  // Ingestion rules: plumbing relationships, edge profiles and executor-set fields.
  for (const [k, v] of Object.entries(sidecars.ingestionRules.kernelPlumbing)) if (!relNames.has(v)) errors.push(`ingestion-rules.yaml: kernel plumbing ${k} names relationship ${v}, which does not exist`);
  for (const [name, profile] of Object.entries(sidecars.ingestionRules.edgeProfiles)) {
    const ep = ir.edgePropertyTypes.find((e) => e.name === name);
    if (!ep) {
      errors.push(`ingestion-rules.yaml: edge profile ${name} does not exist`);
      continue;
    }
    for (const f of profile.executorSets) if (!ep.properties.some((p) => p.name === f)) errors.push(`ingestion-rules.yaml: edge profile ${name} sets ${f}, not a property of the profile`);
  }
  for (const k of Object.keys(sidecars.ingestionRules.relationshipClasses)) if (!["asserted", "structural", "derived"].includes(k)) errors.push(`ingestion-rules.yaml: unknown relationship class ${k}`);
  for (const k of Object.keys(sidecars.ingestionRules.nodeDefaults)) if (!ir.nodes.some((n) => n.properties.some((p) => p.name === k))) errors.push(`ingestion-rules.yaml: node default ${k} is a property of no node type`);

  // Aliases: targets resolve; a source is not a live id unless the alias says kept.
  if (sidecars.aliases) {
    for (const [from, a] of Object.entries(sidecars.aliases.aliases)) {
      if (!["renamed", "merged", "split", "removed", "kept"].includes(a.kind)) errors.push(`aliases.yaml: ${from} has unknown kind ${a.kind}`);
      if (!a.explanation) errors.push(`aliases.yaml: ${from} has no explanation`);
      if (a.kind === "removed" && a.to.length) errors.push(`aliases.yaml: removed ${from} must not name a substitute (use seeAlso)`);
      if (a.kind !== "removed" && !a.to.length) errors.push(`aliases.yaml: ${from} (${a.kind}) names no target`);
      if (a.kind === "split" && a.to.length < 2) errors.push(`aliases.yaml: split ${from} needs at least two targets`);
      for (const t of [...a.to, ...(a.seeAlso ?? [])]) checkId(`aliases.yaml ${from}`, t);
      if (a.kind !== "kept" && liveId(from) && !a.to.includes(from)) errors.push(`aliases.yaml: ${from} is a live v2 id but its alias kind is ${a.kind}`);
      if (a.kind === "kept" && !liveId(from)) errors.push(`aliases.yaml: ${from} is marked kept but is not a live v2 id`);
    }
  }
  return errors;
}

export function domainOfFragment(sidecars: Sidecars, fragmentId: string): DomainSidecar | undefined {
  return sidecars.domains.find((d) => d.fragments.includes(fragmentId));
}

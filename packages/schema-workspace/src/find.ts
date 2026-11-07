/**
 * `bks-schema find`: exact structured matches over search/index.jsonl (the machine authority for filters).
 * Every given criterion must hold (AND); list-valued fields match when they contain the value. Results are ordered
 * by id, so equal inputs give equal outputs. No ranking, no fuzzy matching.
 */
import type { CardRecord } from "./schema-contracts.js";
import type { Workspace } from "./workspace.js";

export interface FindQuery {
  kind?: string | string[];
  module?: string | string[];
  domain?: string;
  name?: string;
  /** Node / edge-property / interface property name (or enum value). */
  property?: string;
  /** Executor operation (`create`, `update`, `close`, ...) or proposal kind (`node.upsert`, `edge.assert`, ...). */
  executorOp?: string;
  proposalKind?: string;
  relClass?: string;
  temporal?: string;
  exclusive?: boolean;
  predicateKind?: string;
  status?: string;
  label?: string;
  interface?: string;
  identifierScheme?: string;
  uidToken?: string;
  from?: string;
  to?: string;
  question?: string;
  capability?: string;
  migrationKind?: string;
  limit?: number;
}

export interface FindResult {
  query: FindQuery;
  total: number;
  returned: number;
  truncated: boolean;
  results: Array<Omit<CardRecord, "tokens">>;
}

export const FIND_LIMITS = { defaultLimit: 50, maxLimit: 500 } as const;

const KIND_ALIASES: Record<string, string> = { rel: "relationship", pred: "predicate", edge: "edge-properties", iface: "interface", mod: "module", dom: "domain", asmt: "assessment", vocab: "vocabulary", qset: "question-set" };

export function findCards(source: Workspace | readonly CardRecord[], query: FindQuery): FindResult {
  const records = Array.isArray(source) ? (source as readonly CardRecord[]) : (source as Workspace).index;
  const limit = Math.min(Math.max(query.limit ?? FIND_LIMITS.defaultLimit, 1), FIND_LIMITS.maxLimit);
  const kinds = query.kind === undefined ? null : new Set((Array.isArray(query.kind) ? query.kind : [query.kind]).map((k) => KIND_ALIASES[k] ?? k));
  const modules = query.module === undefined ? null : new Set(Array.isArray(query.module) ? query.module : [query.module]);
  const has = (xs: string[] | undefined, v: string | undefined) => v === undefined || Boolean(xs?.includes(v));
  const eq = (x: string | undefined, v: string | undefined) => v === undefined || x === v;
  const matches = records.filter(
    (r) =>
      (!kinds || kinds.has(r.kind)) &&
      (!modules || (r.module !== undefined && modules.has(r.module))) &&
      eq(r.domain, query.domain) &&
      (query.name === undefined || r.name === query.name || r.name.toLowerCase() === query.name.toLowerCase()) &&
      has(r.properties, query.property) &&
      (query.executorOp === undefined || Boolean(r.executorOps?.includes(query.executorOp) || r.proposalKinds?.includes(query.executorOp))) &&
      has(r.proposalKinds, query.proposalKind) &&
      eq(r.relClass, query.relClass) &&
      eq(r.temporal, query.temporal) &&
      (query.exclusive === undefined || r.exclusive === query.exclusive) &&
      eq(r.predicateKind, query.predicateKind) &&
      eq(r.status, query.status) &&
      has(r.labels, query.label) &&
      has(r.interfaces, query.interface) &&
      has(r.identifierSchemes, query.identifierScheme) &&
      eq(r.uidToken, query.uidToken) &&
      (query.from === undefined || Boolean(r.from?.includes(query.from) || r.subjectTypes?.includes(query.from))) &&
      (query.to === undefined || Boolean(r.to?.includes(query.to) || r.objectTypes?.includes(query.to))) &&
      has(r.questionIds, query.question) &&
      has(r.capabilities, query.capability) &&
      eq(r.migrationKind, query.migrationKind),
  );
  const sorted = [...matches].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const results = sorted.slice(0, limit).map(({ tokens: _t, ...rest }) => rest);
  return { query, total: sorted.length, returned: results.length, truncated: sorted.length > limit, results };
}

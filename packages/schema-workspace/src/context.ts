/**
 * biotech-schema-context.v1: the advisory record of what an agent selected and decided from the schema workspace
 * (task / question ids, release and workspace digests, selected cards with digests and sections, identity /
 * predicate / temporal decisions, chosen operation route, scope, omissions, unresolved concepts). It informs
 * planning and grants no authority: the executor re-validates everything against the pinned release.
 */
import { digestOf } from "@bks/contracts";
import type { SchemaIR } from "./ir.js";
import { RENDERER_VERSION } from "./render.js";
import { SCHEMA_CONTEXT_VERSION, SchemaContext } from "./schema-contracts.js";
import type { Workspace } from "./workspace.js";

export interface SchemaContextInput {
  intent?: string;
  taskIds?: string[];
  questionIds?: string[];
  /** Card ids (any kind); old v1 ids are resolved and recorded as unresolved when they have no live card. */
  cardIds?: string[];
  sections?: Record<string, string[]>;
  reasons?: Record<string, string>;
  omissions?: Array<{ element: string; reason: string }>;
  budget?: { maxTokens: number; estimatedTokens: number; exceeded: boolean; estimator: string };
}

export function schemaContext(ws: Workspace, input: SchemaContextInput): SchemaContext {
  const ir: SchemaIR = ws.ir();
  const tasks = (input.taskIds ?? []).map((t) => t.replace(/^task:/, ""));
  const unresolved: string[] = [];
  const ids = new Set<string>();
  for (const t of tasks) ids.add(`task:${t}`);
  for (const id of input.cardIds ?? []) {
    const r = ws.resolve(id);
    if (!r) unresolved.push(id);
    else if (r.record.kind === "alias") {
      unresolved.push(`${id} (v1 ${r.record.migrationKind}; not a live v2 element)`);
      for (const t of r.record.targets ?? []) if (ws.record(t)) ids.add(t);
    } else if (r.record.kind === "term" || r.record.kind === "question") for (const t of r.record.targets ?? []) ids.add(t);
    else ids.add(r.record.id);
  }
  const catalog = ws.catalog();
  const questionIds = [...new Set(input.questionIds ?? [])];
  for (const q of questionIds) if (!catalog.questions.some((x) => x.id === q) && !catalog.aliases.some((a) => a.alias === q)) unresolved.push(`question ${q}`);
  const taskRecords = tasks.map((t) => ws.record(`task:${t}`));
  tasks.forEach((t, i) => {
    if (!taskRecords[i]) unresolved.push(`task:${t}`);
  });
  const selected = [...ids]
    .map((id) => ws.record(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((r) => ({ cardId: r.id, ...(r.cardDigest ? { cardDigest: r.cardDigest } : {}), path: r.path, sections: input.sections?.[r.id] ?? [], reason: input.reasons?.[r.id] ?? (r.kind === "task" ? "task route" : "selected") }));

  const nodeNames = selected.filter((s) => s.cardId.startsWith("node:")).map((s) => s.cardId.slice(5));
  const relNames = selected.filter((s) => s.cardId.startsWith("rel:")).map((s) => s.cardId.slice(4));
  const predNames = selected.filter((s) => s.cardId.startsWith("pred:")).map((s) => s.cardId.slice(5));
  const relTypes = new Set(ir.relationshipTypes.map((r) => r.type));
  const tm01 = "TM-01";
  const identity = nodeNames.map((n) => {
    const node = ir.nodes.find((x) => x.name === n)!;
    return { type: n, uidToken: node.uidToken, rule: node.identityRule, identifierSchemes: node.identifierSchemes.filter((s) => s.writeStatus === "active").map((s) => s.scheme), executorOps: node.executorOps };
  });
  const predicates = predNames.map((p) => {
    const e = ir.predicates.find((x) => x.name === p)!;
    const route = e.status.startsWith("alias-of") ? "alias" : e.kind === "retired" || e.status.startsWith("retired") ? "retired" : relTypes.has(e.name) ? "typed-edge" : e.kind === "literal" ? "literal" : e.kind === "field" ? "field" : e.kind === "computation" ? "computation" : "assertion-only";
    return { name: p, kind: e.kind, status: e.status, route: route as SchemaContext["decisions"]["predicates"][number]["route"], typedEdge: relTypes.has(p) ? p : null };
  });
  const temporal = relNames.map((r) => {
    const rel = ir.relationshipTypes.find((x) => x.type === r)!;
    return { element: `rel:${r}`, temporal: rel.temporal, exclusive: rel.exclusive, scope: rel.exclusive ? `${tm01}: exclusive per (subject, slot, asserter); different asserters coexist` : null };
  });
  const taskDefs = taskRecords.filter(Boolean).map((r) => r!);
  const proposalKinds = [...new Set(taskDefs.flatMap((t) => t.proposalKinds ?? []))].sort();
  const pending = [...new Set(taskDefs.flatMap((t) => t.pendingProposalKinds ?? []))].sort();
  const readOperations = [...new Set(taskDefs.flatMap((t) => t.readOperations ?? []))].sort();
  const patternTemplates = [...new Set(questionIds.flatMap((q) => catalog.questions.find((x) => x.id === q || catalog.aliases.some((a) => a.alias === q && a.canonical.includes(x.id)))?.templates ?? []))].sort();
  const operation: SchemaContext["route"]["operation"] = proposalKinds.length ? (readOperations.length || patternTemplates.length ? "read+write" : "write") : readOperations.length || patternTemplates.length ? "read" : "navigation";
  const modules = [...new Set(selected.map((s) => ws.record(s.cardId)?.module).filter((m): m is string => Boolean(m)))].sort();
  const domains = [...new Set(selected.map((s) => ws.record(s.cardId)?.domain).filter((d): d is string => Boolean(d)))].sort();
  const body: Omit<SchemaContext, "contextId"> = {
    schemaVersion: SCHEMA_CONTEXT_VERSION,
    advisory: true,
    grantsAuthority: false,
    producer: { tool: "bks-schema", version: RENDERER_VERSION },
    release: { releaseId: ws.manifest.release.releaseId, schemaDigest: ws.manifest.release.schemaDigest, schemaReleaseDigest: ws.manifest.release.schemaReleaseDigest, workspaceFingerprint: ws.manifest.workspaceFingerprint, ...(ws.manifest.release.queryCatalogDigest ? { queryCatalogDigest: ws.manifest.release.queryCatalogDigest } : {}) },
    ...(input.intent ? { intent: input.intent } : {}),
    taskIds: tasks,
    questionIds,
    selected,
    decisions: { identity, predicates, temporal },
    route: { operation, readOperations, proposalKinds, pendingProposalKinds: pending, patternTemplates },
    scope: { modules, domains, nodeTypes: nodeNames, relationshipTypes: relNames },
    omissions: input.omissions ?? [],
    unresolved,
    ...(input.budget ? { budget: input.budget } : {}),
  };
  return SchemaContext.parse({ ...body, contextId: digestOf(body) });
}


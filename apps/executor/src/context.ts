import { GraphClient, KnowledgeWriter, MemoryGrantAuthority, SchemaModel, writeSchema, EXECUTOR_VERSION, type WriteSchema } from "@bks/kg-ops";
import { loadSidecars, openWorkspace, type Workspace } from "@bks/schema-workspace";
import { AuthRegistry } from "./auth.js";

/**
 * Shared executor context for every surface (HTTP, MCP). Secrets stay host-side (env); agents only ever see
 * capability names and contract payloads.
 */
export interface ExecutorContext {
  env: NodeJS.ProcessEnv;
  auth: AuthRegistry;
  executorVersion: string;
  /** v1 workspace and read model (schema routes, v1 typed reads); the reads role replaces the read model. */
  workspace(): Workspace;
  readModel(): SchemaModel;
  /** v2 release write model (candidate release until S1's loadRelease() lands). */
  writeSchema(): WriteSchema;
  graph(): GraphClient;
  writer(): KnowledgeWriter;
  flags: { localDev: boolean; baselineTools: boolean; devAdmission: boolean };
}

export function createContext(env: NodeJS.ProcessEnv = process.env, overrides: Partial<Pick<ExecutorContext, "graph" | "writer" | "writeSchema">> & { auth?: AuthRegistry } = {}): ExecutorContext {
  const auth = overrides.auth ?? new AuthRegistry(env);
  let workspace: Workspace | null = null;
  let readModel: SchemaModel | null = null;
  let client: GraphClient | null = null;
  let writer: KnowledgeWriter | null = null;
  const localDev = env.BKS_LOCAL_DEV === "1";
  const flags = {
    localDev,
    baselineTools: env.BKS_ENABLE_BASELINE_TOOLS === "1",
    // The dev admission endpoint signs witnesses with BKS_WITNESS_SIGNING_KEY against a local in-memory authority. Production
    // admission is the domain admission service (Mission Control), so this is opt-in and never on without local dev.
    devAdmission: localDev && Boolean(env.BKS_WITNESS_SIGNING_KEY),
  };
  const ctx: ExecutorContext = {
    env,
    auth,
    executorVersion: EXECUTOR_VERSION,
    flags,
    workspace: () => (workspace ??= openWorkspace()),
    readModel: () => (readModel ??= new SchemaModel(ctx.workspace().ir(), loadSidecars(), ctx.workspace().manifest.workspaceFingerprint)),
    writeSchema: overrides.writeSchema ?? (() => writeSchema()),
    graph: overrides.graph ?? (() => (client ??= GraphClient.fromEnv(env))),
    writer: overrides.writer ?? (() => (writer ??= new KnowledgeWriter(ctx.graph(), { schema: ctx.writeSchema(), authority: flags.devAdmission ? new MemoryGrantAuthority() : null, localDev }))),
  };
  return ctx;
}

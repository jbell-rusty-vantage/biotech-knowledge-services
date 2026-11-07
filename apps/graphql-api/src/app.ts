import { createServer, type Server } from "node:http";
import { randomUUID } from "node:crypto";
import { ApolloServer, type ApolloServerPlugin, type GraphQLRequestContext } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { GraphQLError, Kind, execute, parse, type GraphQLFormattedError } from "graphql";
import type { Driver } from "neo4j-driver";
import { ActorError, bearerToken, credentialMatches, libraryJwtFor, rejectForgeableIdentityHeaders, type ActorVerifier, type VerifiedActor } from "./actor.js";
import type { ApiConfig } from "./config.js";
import { admitOperation, depthLimitRule, encodeCursorOffset, noIntrospectionRule } from "./limits.js";
import { libraryVersions, type ExecutableBuild } from "./projection.js";
import { checkReadiness, type CompatibilityMatrix, type ReadinessReport, type RequiredIndexes } from "./readiness.js";
import { bindVariables, RequestRejected, resolvePersistedOperation, type LoadedRegistry, type PersistedRequestBody, type RegisteredOperation } from "./registry.js";
import type { ConsumerSource } from "./release.js";

export interface AppDeps {
  config: ApiConfig;
  source: ConsumerSource;
  build: ExecutableBuild;
  registry: LoadedRegistry;
  driver: Driver;
  actorVerifier: ActorVerifier | null;
  matrix: CompatibilityMatrix;
  requiredIndexes: RequiredIndexes;
  log?: (message: string) => void;
}

interface RequestState {
  requestId: string;
  actor: VerifiedActor | null;
  op: RegisteredOperation | null;
  deadlineHit: boolean;
}

interface GraphQLContext {
  /** The one long-lived driver; the executable itself is built without a driver so the same build serves every app. */
  executionContext: Driver;
  requestId: string;
  jwt: { sub: string; internal: boolean };
  sessionConfig: { database: string };
  transaction: { timeout: number; metadata: Record<string, string> };
  op: RegisteredOperation | null;
}

const ENGINEERING_ACTOR: VerifiedActor = { sub: "engineering-profile", jti: "engineering", app: "engineering", visibility: ["INTERNAL", "PUBLIC"], entitlements: ["engineering"], issuedAt: 0, expiresAt: 0 };

function errorBody(code: string, message: string, extra: Record<string, unknown> = {}) {
  return { errors: [{ message, extensions: { code, ...extra } }] };
}

function stateOf(res: Response): RequestState {
  return res.locals.bks as RequestState;
}

/** Product vector/phrase requests are answered explicitly, before any database or provider work. */
function looksLikeVectorRequest(body: PersistedRequestBody): boolean {
  const text = typeof body.query === "string" ? body.query : "";
  if (/\bphrase\s*:|vector/i.test(text)) return true;
  const vars = body.variables && typeof body.variables === "object" ? Object.keys(body.variables as Record<string, unknown>) : [];
  return vars.some((k) => /^(phrase|vector|embedding)$/i.test(k));
}

export interface ConsumerApp {
  app: express.Express;
  httpServer: Server;
  apollo: ApolloServer<GraphQLContext>;
  identity: Record<string, unknown>;
  readiness: () => Promise<ReadinessReport>;
  /** Resolves when the plan warm-up has finished (retrying once if it failed). */
  awaitWarmup: () => Promise<{ state: string; durationMs: number; operations: number; error?: string | undefined }>;
  stop: () => Promise<void>;
}

export async function createConsumerApp(deps: AppDeps): Promise<ConsumerApp> {
  const { config, source, build, registry, driver, actorVerifier, matrix, requiredIndexes } = deps;
  const log = deps.log ?? ((m: string) => console.log(m));
  const schema = build.schema;
  const identity = {
    service: "bks-graphql-api",
    profile: config.profile,
    releaseId: source.releaseId,
    sourceMode: source.mode,
    schemaDigest: source.schemaDigest,
    schemaReleaseDigest: source.schemaReleaseDigest,
    productProjectionDigest: build.identity.productProjectionDigest,
    executableGraphqlDigest: build.identity.executableGraphqlDigest,
    operationRegistryDigest: registry.operationRegistryDigest,
    projectionManifestDigest: build.identity.projectionManifestDigest,
    libraryVersions: libraryVersions(),
    capabilities: { mutations: false, vector: "unsupported", introspection: config.profile === "engineering", persistedOperationsOnly: config.profile === "product" },
    releaseCapabilities: source.releaseCompatibility?.capabilities ?? null,
    limits: {
      ...config.limits,
      requestBodyLimitBytes: config.requestBodyLimitBytes,
      maxResponseBytes: config.maxResponseBytes,
      dbTimeoutMs: config.dbTimeoutMs,
      deadlineMs: config.deadlineMs,
    },
    operations: registry.registry.operations.map((o) => ({ name: o.name, id: o.id, costClass: o.costClass })),
  };
  const identityHeaders: Record<string, string> = {
    "x-bks-release-id": source.releaseId,
    "x-bks-schema-digest": source.schemaDigest,
    "x-bks-schema-release-digest": source.schemaReleaseDigest ?? "none",
    "x-bks-product-projection-digest": build.identity.productProjectionDigest,
    "x-bks-executable-graphql-digest": build.identity.executableGraphqlDigest,
    "x-bks-operation-registry-digest": registry.operationRegistryDigest,
  };

  // Plan-cache warm-up: execute every safelisted document once (dummy uid, both cursor shapes) so the first product
  // request does not pay Cypher planning for the wide interface unions (measured: a cold EntityCard plan can exceed
  // the 5 s database limit locally). Readiness stays false until it has completed.
  const warmup = { state: "pending" as "pending" | "running" | "done" | "failed", durationMs: 0, operations: 0, error: undefined as string | undefined };
  const runWarmup = async (): Promise<void> => {
    if (warmup.state === "running" || warmup.state === "done") return;
    warmup.state = "running";
    const started = Date.now();
    try {
      let count = 0;
      for (const op of registry.registry.operations) {
        const base: Record<string, unknown> = {};
        let hasCursor = false;
        for (const [name, spec] of Object.entries(op.variables)) {
          if (spec.bind === "actor.visibility") base[name] = ["INTERNAL", "PUBLIC"];
          else if (spec.cursor) hasCursor = true;
          else if (spec.default !== undefined) base[name] = spec.default;
          else if (spec.type === "String" && spec.required) base[name] = name === "scheme" ? "warmup" : name === "value" ? "warmup" : "hu:warmup:none";
        }
        for (const variables of hasCursor ? [base, { ...base, ...Object.fromEntries(Object.entries(op.variables).filter(([, s]) => s.cursor).map(([n]) => [n, encodeCursorOffset(0)])) }] : [base]) {
          const result = await execute({
            schema,
            document: parse(op.document),
            variableValues: variables,
            contextValue: { executionContext: driver, jwt: { sub: "bks-warmup", internal: true }, sessionConfig: { database: config.neo4j.database }, transaction: { timeout: 60_000, metadata: { app: "bks-graphql-api", operation: `warmup:${op.name}` } } },
          });
          if (result.errors?.length) throw new Error(`${op.name}: ${result.errors[0]!.message}`);
          count++;
        }
      }
      warmup.operations = count;
      warmup.state = "done";
      warmup.error = undefined;
    } catch (error) {
      warmup.state = "failed";
      warmup.error = (error as Error).message;
    } finally {
      warmup.durationMs = Date.now() - started;
    }
  };
  let warmupPromise: Promise<void> = config.warmup ? runWarmup() : Promise.resolve();
  const awaitWarmup = async () => {
    await warmupPromise;
    if (config.warmup && warmup.state === "failed") {
      warmupPromise = runWarmup();
      await warmupPromise;
    }
    return { ...warmup };
  };

  let cachedReadiness: { at: number; report: ReadinessReport } | null = null;
  let inFlightReadiness: Promise<ReadinessReport> | null = null;
  const readiness = async (): Promise<ReadinessReport> => {
    if (cachedReadiness && Date.now() - cachedReadiness.at < config.readiness.cacheMs) return cachedReadiness.report;
    inFlightReadiness ??= checkReadiness({ driver, database: config.neo4j.database, source, matrix, requiredIndexes, skipReleaseCheck: config.readiness.skipReleaseCheck }).finally(() => {
      inFlightReadiness = null;
    });
    const base = await inFlightReadiness;
    if (config.warmup && base.checks.connectivity.ok && (warmup.state === "pending" || warmup.state === "failed")) warmupPromise = runWarmup();
    const warm = { ok: !config.warmup || warmup.state === "done", state: config.warmup ? warmup.state : "disabled", durationMs: warmup.durationMs, operations: warmup.operations, ...(warmup.error ? { error: warmup.error } : {}) };
    const report: ReadinessReport = { ...base, ready: base.ready && warm.ok, checks: { ...base.checks, warmup: warm } };
    // Cache only settled answers; a warming instance is re-evaluated on the next probe.
    if (!config.warmup || warmup.state === "done" || !base.ready) cachedReadiness = { at: Date.now(), report };
    return report;
  };

  const app = express();
  app.disable("x-powered-by");
  const httpServer = createServer(app);

  const admissionPlugin: ApolloServerPlugin<GraphQLContext> = {
    async requestDidStart() {
      return {
        async didResolveOperation(ctx: GraphQLRequestContext<GraphQLContext>) {
          const { document, operation, request, contextValue } = ctx;
          if (!operation || !document) return;
          const result = admitOperation(schema, document, operation, request.variables ?? {}, config.limits);
          const op = contextValue.op;
          if (op) {
            const costClass = registry.registry.costClasses[op.costClass];
            if (costClass && result.cost > costClass.maxEstimatedCost) {
              result.violations.push({ code: "QUERY_TOO_COSTLY", message: `cost ${result.cost} exceeds cost class ${op.costClass} (${costClass.maxEstimatedCost})`, path: "" });
            }
          }
          if (result.violations.length) {
            const first = result.violations[0]!;
            throw new GraphQLError(`${first.code}: ${first.message}`, {
              extensions: { code: first.code, violations: result.violations, cost: result.cost, maxCost: config.limits.maxCost, http: { status: 400 } },
            });
          }
        },
        async willSendResponse(ctx) {
          const { response, contextValue } = ctx;
          if (response.body.kind !== "single") return;
          const limit = Math.min(contextValue.op?.maxResponseBytes ?? config.maxResponseBytes, config.maxResponseBytes);
          const bytes = Buffer.byteLength(JSON.stringify(response.body.singleResult));
          if (bytes > limit) {
            response.body.singleResult = errorBody("RESPONSE_TOO_LARGE", `response of ${bytes} bytes exceeds ${limit}; request a smaller page`, { bytes, limit }) as typeof response.body.singleResult;
            response.http.status = 400;
          }
          for (const [k, v] of Object.entries(identityHeaders)) response.http.headers.set(k, v);
        },
      };
    },
  };

  const apollo = new ApolloServer<GraphQLContext>({
    schema,
    introspection: config.profile === "engineering",
    persistedQueries: false,
    csrfPrevention: true,
    allowBatchedHttpRequests: false,
    includeStacktraceInErrorResponses: !config.production,
    parseOptions: { maxTokens: config.maxTokens },
    validationRules: [depthLimitRule(config.limits.maxDepth), ...(config.profile === "product" ? [noIntrospectionRule] : [])],
    formatError(formatted: GraphQLFormattedError, error: unknown) {
      const code = String(formatted.extensions?.code ?? "");
      const message = String((error as { originalError?: { message?: string } })?.originalError?.message ?? formatted.message);
      if (process.env.BKS_DEBUG_ERRORS === "1") console.error("graphql error:", message, (error as { originalError?: { code?: string } })?.originalError?.code);
      if (/acquisition timed out|Failed to connect|ServiceUnavailable|SessionExpired|Connection lost|Could not perform discovery/i.test(message)) {
        return { message: "graph database unavailable", extensions: { code: "BKS_UNAVAILABLE" } };
      }
      if (/TransactionTimedOut|transaction has been terminated|has been terminated|timed out/i.test(message)) {
        return { message: "database time limit exceeded", extensions: { code: "BKS_TIMEOUT", limitMs: config.dbTimeoutMs } };
      }
      if (/^(Unauthenticated|Forbidden)$/.test(formatted.message)) {
        return { message: "actor context is not authorized for this read", extensions: { code: "BKS_UNAUTHORIZED" } };
      }
      if (config.production && (code === "INTERNAL_SERVER_ERROR" || code === "")) {
        return { message: "internal error", extensions: { code: "INTERNAL_SERVER_ERROR" } };
      }
      return formatted;
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), admissionPlugin],
  });
  await apollo.start();

  if (config.corsOrigins.length) app.use(cors({ origin: config.corsOrigins, methods: ["GET", "POST"], maxAge: 600 }));

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok", service: "bks-graphql-api", releaseId: source.releaseId, uptimeSeconds: Math.round(process.uptime()) });
  });
  app.get("/readyz", async (_req, res) => {
    const report = await readiness();
    res.status(report.ready ? 200 : 503).json({ ...report, releaseId: source.releaseId, sourceMode: source.mode });
  });
  app.get("/schema.graphql", (_req, res) => {
    res.set(identityHeaders).set("etag", `"${build.identity.executableGraphqlDigest}"`).type("text/plain; charset=utf-8").send(build.printed);
  });
  app.get("/identity", (_req, res) => {
    res.set(identityHeaders).json(identity);
  });

  const guard = (req: Request, res: Response, next: NextFunction) => {
    const presentedId = req.header("x-request-id");
    const state: RequestState = { requestId: presentedId && /^[A-Za-z0-9._-]{1,64}$/.test(presentedId) ? presentedId : randomUUID(), actor: null, op: null, deadlineHit: false };
    res.locals.bks = state;
    res.setHeader("x-request-id", state.requestId);
    // End-to-end deadline: answer 504 and swallow any later write from the GraphQL layer.
    const timer = setTimeout(() => {
      state.deadlineHit = true;
      if (!res.headersSent) res.status(504).json(errorBody("BKS_TIMEOUT", `end-to-end deadline of ${config.deadlineMs} ms exceeded`));
      const noop = (() => res) as unknown as typeof res.end;
      res.setHeader = (() => res) as unknown as typeof res.setHeader;
      res.writeHead = (() => res) as unknown as typeof res.writeHead;
      res.write = (() => true) as unknown as typeof res.write;
      res.end = noop;
    }, config.deadlineMs);
    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));
    if (req.method !== "POST") {
      res.status(405).set("allow", "POST").json(errorBody("METHOD_NOT_ALLOWED", "POST application/json only"));
      return;
    }
    try {
      rejectForgeableIdentityHeaders(req.headers);
      if (config.serviceApiKey && !credentialMatches(req.header("x-api-key"), config.serviceApiKey)) {
        throw new ActorError("SERVICE_CREDENTIAL_INVALID", "missing or invalid service credential (x-api-key); only the BFF may call this API");
      }
      if (config.profile === "engineering" && !credentialMatches(req.header("x-bks-engineering-key"), config.engineeringKey)) {
        throw new ActorError("SERVICE_CREDENTIAL_INVALID", "the engineering profile requires x-bks-engineering-key");
      }
    } catch (error) {
      const e = error as ActorError;
      res.status(e.status ?? 401).json(errorBody(e.code === "ACTOR_HEADER_REJECTED" ? e.code : "BKS_UNAUTHORIZED", e.message, { reason: e.code }));
      return;
    }
    next();
  };

  const jsonBody = express.json({ limit: config.requestBodyLimitBytes, strict: true, type: ["application/json", "application/graphql-response+json"] });

  const admit = async (req: Request, res: Response, next: NextFunction) => {
    const state = stateOf(res);
    const body = (req.body ?? {}) as PersistedRequestBody;
    if (typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json(errorBody("BAD_REQUEST", "request body must be one JSON object (batching is disabled)"));
      return;
    }
    try {
      const token = bearerToken(req.header("authorization"));
      if (config.profile === "engineering" && !token) state.actor = ENGINEERING_ACTOR;
      else if (!actorVerifier) throw new ActorError("ACTOR_TOKEN_INVALID", "this deployment has no actor verifier configured");
      else state.actor = await actorVerifier.verify(token);
    } catch (error) {
      const e = error as ActorError;
      res.status(e.status ?? 401).json(errorBody("BKS_UNAUTHORIZED", e.message, { reason: e.code ?? "ACTOR_TOKEN_INVALID" }));
      return;
    }
    if (looksLikeVectorRequest(body)) {
      res.status(400).json(errorBody("BKS_UNSUPPORTED", "product vector/phrase search is not part of this release; no embedding provider is called", { capability: "vector" }));
      return;
    }
    try {
      const persisted = typeof body.documentId === "string" || typeof body.extensions?.persistedQuery?.sha256Hash === "string";
      if (config.profile === "product" || persisted) {
        const op = resolvePersistedOperation(registry, body);
        const variables = bindVariables(op, body.variables, { visibility: state.actor!.visibility }, config.limits);
        state.op = op;
        req.body = { query: op.document, variables, operationName: op.name };
      } else {
        if (typeof body.query !== "string" || body.query.length === 0) throw new RequestRejected(400, "BAD_REQUEST", "query is required");
        let doc;
        try {
          doc = parse(body.query, { maxTokens: config.maxTokens });
        } catch (error) {
          throw new RequestRejected(400, "GRAPHQL_PARSE_FAILED", (error as Error).message);
        }
        if (doc.definitions.some((d) => d.kind === Kind.OPERATION_DEFINITION && d.operation !== "query")) {
          throw new RequestRejected(400, "BKS_UNSUPPORTED", "only queries are supported; the consumer API has no mutations or subscriptions");
        }
        req.body = { query: body.query, variables: body.variables ?? {}, ...(typeof body.operationName === "string" ? { operationName: body.operationName } : {}) };
      }
    } catch (error) {
      if (error instanceof RequestRejected) {
        res.status(error.status).json(errorBody(error.code, error.message));
        return;
      }
      throw error;
    }
    next();
  };

  app.use(
    "/graphql",
    guard,
    jsonBody,
    (error: unknown, _req: Request, res: Response, next: NextFunction) => {
      const e = error as { type?: string; status?: number; message?: string };
      if (e?.type === "entity.too.large") return res.status(413).json(errorBody("REQUEST_TOO_LARGE", `request body exceeds ${config.requestBodyLimitBytes} bytes`));
      if (e?.status === 400) return res.status(400).json(errorBody("BAD_REQUEST", "malformed JSON body"));
      return next(error);
    },
    admit,
    expressMiddleware(apollo, {
      context: async ({ res }) => {
        const state = stateOf(res);
        return {
          executionContext: driver,
          requestId: state.requestId,
          jwt: libraryJwtFor(state.actor!),
          sessionConfig: { database: config.neo4j.database },
          transaction: { timeout: config.dbTimeoutMs, metadata: { app: "bks-graphql-api", operation: state.op?.name ?? "engineering", requestId: state.requestId } },
          op: state.op,
        };
      },
    }),
  );
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    log(`unhandled request error: ${(error as Error)?.message ?? String(error)}`);
    if (!res.headersSent) res.status(500).json(errorBody("INTERNAL_SERVER_ERROR", "internal error"));
  });

  const stop = async () => {
    await apollo.stop();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  };
  return { app, httpServer, apollo, identity, readiness, awaitWarmup, stop };
}

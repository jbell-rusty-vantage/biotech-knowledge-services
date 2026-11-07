import neo4j, { type Driver } from "neo4j-driver";
import { createActorVerifier } from "./actor.js";
import { createConsumerApp, type ConsumerApp } from "./app.js";
import { configFromEnv, type ApiConfig } from "./config.js";
import { buildExecutable, loadProjectionManifest } from "./projection.js";
import { loadCompatibilityMatrix, loadRequiredIndexes } from "./readiness.js";
import { loadRegistry } from "./registry.js";
import { loadConsumerSourceSdl, type ConsumerSource } from "./release.js";

/** One long-lived driver per process: explicit database, bounded pool, acquisition, connection and retry time. */
export function createReaderDriver(config: ApiConfig): Driver {
  return neo4j.driver(config.neo4j.uri, neo4j.auth.basic(config.neo4j.username, config.neo4j.password), {
    maxConnectionPoolSize: config.pool.maxConnectionPoolSize,
    connectionAcquisitionTimeout: config.pool.connectionAcquisitionTimeoutMs,
    connectionTimeout: config.pool.connectionTimeoutMs,
    maxTransactionRetryTime: config.pool.maxTransactionRetryTimeMs,
    userAgent: "bks-graphql-api/0.1.0",
  });
}

export interface StartedServer extends ConsumerApp {
  config: ApiConfig;
  source: ConsumerSource;
  driver: Driver;
  port: number;
  startupMs: { build: number; total: number };
}

export interface StartOptions {
  env?: NodeJS.ProcessEnv;
  port?: number;
  log?: (message: string) => void;
  registryPath?: string;
}

/** Loads the release, builds the executable once, verifies the safelist against it, then listens. */
export async function startServer(options: StartOptions = {}): Promise<StartedServer> {
  const started = performance.now();
  const env = options.env ?? process.env;
  const log = options.log ?? ((m: string) => console.log(m));
  const config = configFromEnv(env);
  for (const w of config.warnings) log(`[bks-graphql-api] warning: ${w}`);
  const source = loadConsumerSourceSdl({ env, log });
  const { manifest, bytes } = loadProjectionManifest();
  const registry = loadRegistry(options.registryPath);
  const driver = createReaderDriver(config);
  try {
    const build = await buildExecutable(source.sdl, manifest, {}, { driver, manifestBytes: bytes });
    const compat = registry.registry.releaseCompatibility;
    if (compat.executableGraphqlDigest !== build.identity.executableGraphqlDigest) {
      throw new Error(`operation registry was generated for executable ${compat.executableGraphqlDigest}, this build is ${build.identity.executableGraphqlDigest}; run pnpm api:generate`);
    }
    if (compat.releaseId !== source.releaseId || compat.schemaReleaseDigest !== source.schemaReleaseDigest) {
      const message = `operation registry release ${compat.releaseId} (${String(compat.schemaReleaseDigest)}) differs from the loaded release ${source.releaseId} (${String(source.schemaReleaseDigest)})`;
      if (config.production) throw new Error(message);
      log(`[bks-graphql-api] warning: ${message}`);
    }
    const actorVerifier = config.actor ? await createActorVerifier(config.actor) : null;
    const consumer = await createConsumerApp({
      config,
      source,
      build,
      registry,
      driver,
      actorVerifier,
      matrix: loadCompatibilityMatrix(),
      requiredIndexes: loadRequiredIndexes(),
      log,
    });
    const port = options.port ?? config.port;
    await new Promise<void>((resolve) => consumer.httpServer.listen(port, resolve));
    const address = consumer.httpServer.address();
    const boundPort = typeof address === "object" && address ? address.port : port;
    const total = performance.now() - started;
    log(
      `bks-graphql-api ${config.profile} profile on :${boundPort} | ${source.mode} ${source.releaseId} | executable ${build.identity.executableGraphqlDigest} ` +
        `| registry ${registry.operationRegistryDigest} (${registry.registry.operations.length} ops) | build ${Math.round(build.buildMs)} ms, startup ${Math.round(total)} ms`,
    );
    return { ...consumer, config, source, driver, port: boundPort, startupMs: { build: build.buildMs, total } };
  } catch (error) {
    await driver.close();
    throw error;
  }
}

/**
 * Server-side configuration for semantic schema search. Values come from the process environment, falling back to
 * the repository `.env` for the named keys only. Values are never logged or returned in reports; callers receive
 * presence booleans for diagnostics.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { repoRoot } from "../load.js";

export const SEMANTIC_ENV = {
  apiKey: "OPENAI_API_KEY",
  enabled: "BKS_SEMANTIC_ENABLED",
  custodyDir: "BKS_SEMANTIC_CUSTODY_DIR",
  generation: "BKS_SEMANTIC_GENERATION",
  deadlineMs: "BKS_SEMANTIC_DEADLINE_MS",
  maxRequests: "BKS_SEMANTIC_MAX_REQUESTS",
  maxSpendUsd: "BKS_SEMANTIC_MAX_SPEND_USD",
  costPerSearchUsd: "BKS_SEMANTIC_COST_PER_SEARCH_USD",
} as const;

let dotenvCache: Map<string, string> | null = null;

function dotenv(): Map<string, string> {
  if (dotenvCache) return dotenvCache;
  dotenvCache = new Map();
  const path = resolve(repoRoot, ".env");
  if (!existsSync(path)) return dotenvCache;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const key = line.slice(0, i).replace(/^export\s+/, "").trim();
    let value = line.slice(i + 1).trim();
    const hash = value.startsWith('"') || value.startsWith("'") ? -1 : value.indexOf(" #");
    if (hash >= 0) value = value.slice(0, hash).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    dotenvCache.set(key, value);
  }
  return dotenvCache;
}

/** Reads one configuration value (process env first, then `.env`). Never log the result of secret keys. */
export function readSetting(name: string, options: { dotenv?: boolean } = {}): string | undefined {
  const v = process.env[name];
  if (v !== undefined && v !== "") return v;
  if (options.dotenv === false) return undefined;
  const d = dotenv().get(name);
  return d === undefined || d === "" ? undefined : d;
}

export function hasSetting(name: string): boolean {
  return readSetting(name) !== undefined;
}

/** Test hook. */
export function resetEnvCache(): void {
  dotenvCache = null;
}

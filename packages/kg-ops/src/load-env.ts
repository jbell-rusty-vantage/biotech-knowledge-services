/**
 * Loads one env file explicitly and says which (path only, never contents) on stderr. Replaces `import "dotenv/config"`
 * so an operator always sees whether a repository .env was picked up; BKS_ENV_FILE names another file and
 * BKS_NO_ENV_FILE=1 loads none. Connections to production hosts are still refused unless BKS_TARGET=production
 * (GraphClient target guard). Import this module first.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";

const label = process.env.BKS_PROCESS_LABEL ?? "bks";
const path = process.env.BKS_ENV_FILE ? resolve(process.env.BKS_ENV_FILE) : resolve(process.cwd(), ".env");
if (process.env.BKS_NO_ENV_FILE === "1" || !existsSync(path)) {
  if (process.env.BKS_ENV_FILE) console.error(`[${label}] env file not found: ${path}`);
} else {
  dotenv.config({ path });
  console.error(`[${label}] env file loaded: ${path}`);
}
export const loadedEnvFile: string | null = process.env.BKS_NO_ENV_FILE === "1" || !existsSync(path) ? null : path;

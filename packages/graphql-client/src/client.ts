import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
import { compatibility } from "./compatibility.js";
import { AuthError, CompatibilityError, DomainError, PartialDataError, TransportError, ValidationError, type BiotechClientError, type GraphQLErrorEntry } from "./errors.js";

/**
 * Transport-neutral runtime core. The caller injects the transport (default: global fetch), the endpoint, a
 * credential supplier (the application session token toward the BFF; a service never ships one in a client
 * bundle), abort signals and deadlines. Requests carry only the persisted document id: no document text, no
 * service key. Only network/5xx failures of these read-only queries are retried, a bounded number of times.
 */

export interface TransportRequest {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: string;
  signal: AbortSignal;
}

export interface TransportResponse {
  status: number;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}

export type Transport = (request: TransportRequest) => Promise<TransportResponse>;
export type CredentialSupplier = () => string | null | undefined | Promise<string | null | undefined>;

export interface RetryPolicy {
  /** Total attempts including the first; capped at 3. */
  attempts: number;
  baseDelayMs: number;
}

export interface BiotechClientOptions {
  endpoint: string;
  transport?: Transport;
  credentials?: CredentialSupplier;
  /** End-to-end deadline per call, including retries (default 8000 ms, the server's own deadline). */
  deadlineMs?: number;
  retry?: Partial<RetryPolicy>;
  /** Non-credential request metadata (e.g. app version). Authorization and identity headers are refused here. */
  headers?: Record<string, string>;
  /** `strict` (default) throws CompatibilityError when the server identifies a different executable/registry. */
  compatibilityMode?: "strict" | "warn" | "off";
  onWarning?: (message: string) => void;
  /** Injected for tests; defaults to setTimeout. */
  sleep?: (ms: number) => Promise<void>;
}

export interface CallOptions {
  signal?: AbortSignal;
  deadlineMs?: number;
  requestId?: string;
}

type PersistedDocument<TResult, TVariables> = DocumentTypeDecoration<TResult, TVariables> & { __meta__?: { hash?: string } };

const FORBIDDEN_HEADER = /^(authorization|x-api-key|cookie|x-(bks-)?(actor|user|visibility|entitlements?|roles?|tenant|engineering-key))/i;
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const operationNames = new Map<string, string>(Object.entries(compatibility.operations).map(([name, op]) => [op.id, name]));

function defaultTransport(): Transport {
  const f = (globalThis as { fetch?: typeof fetch }).fetch;
  if (!f) throw new Error("no global fetch; pass a transport");
  return async (request) => {
    const res = await f(request.url, { method: request.method, headers: request.headers, body: request.body, signal: request.signal });
    return { status: res.status, headers: res.headers, text: () => res.text() };
  };
}

function linkSignals(signals: Array<AbortSignal | undefined>): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const listeners: Array<() => void> = [];
  for (const s of signals) {
    if (!s) continue;
    if (s.aborted) {
      controller.abort(s.reason);
      break;
    }
    const onAbort = () => controller.abort(s.reason);
    s.addEventListener("abort", onAbort, { once: true });
    listeners.push(() => s.removeEventListener("abort", onAbort));
  }
  return { signal: controller.signal, cleanup: () => listeners.forEach((l) => l()) };
}

function classify(status: number, body: { data?: unknown; errors?: GraphQLErrorEntry[] } | null, requestId: string | null): BiotechClientError | null {
  const errors = body?.errors ?? [];
  const code = errors[0]?.extensions?.code ?? null;
  const message = errors.map((e) => e.message).join("; ") || `HTTP ${status}`;
  if (status === 401 || status === 403 || code === "BKS_UNAUTHORIZED" || code === "SERVICE_CREDENTIAL_INVALID") return new AuthError(message, { status, code, requestId });
  if (RETRYABLE_STATUS.has(status) || status >= 500) return new TransportError(message, { status, code, requestId, retryable: RETRYABLE_STATUS.has(status) });
  if (status >= 400) return new ValidationError(message, errors, { status, code, requestId });
  if (errors.length && body?.data !== undefined && body.data !== null) return new PartialDataError(body.data, errors, { status, requestId });
  if (errors.length) {
    if (code === "GRAPHQL_VALIDATION_FAILED" || code === "BAD_USER_INPUT") return new ValidationError(message, errors, { status, code, requestId });
    return new DomainError(message, errors, { status, code, requestId });
  }
  if (body?.data === undefined || body.data === null) return new DomainError("empty response", [], { status, requestId });
  return null;
}

export interface BiotechClient {
  readonly compatibility: typeof compatibility;
  execute<TResult, TVariables>(document: PersistedDocument<TResult, TVariables>, variables: TVariables, options?: CallOptions): Promise<TResult>;
}

export function createBiotechClient(options: BiotechClientOptions): BiotechClient {
  const transport = options.transport ?? defaultTransport();
  const attempts = Math.max(1, Math.min(3, options.retry?.attempts ?? 2));
  const baseDelayMs = Math.max(10, options.retry?.baseDelayMs ?? 150);
  const deadlineMs = options.deadlineMs ?? 8000;
  const mode = options.compatibilityMode ?? "strict";
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  for (const name of Object.keys(options.headers ?? {})) {
    if (FORBIDDEN_HEADER.test(name)) throw new Error(`header ${name} cannot be set on the client; credentials come from the credential supplier and identity from the BFF`);
  }

  const checkCompatibility = (headers: TransportResponse["headers"], requestId: string | null) => {
    if (mode === "off") return;
    const actual = { executableGraphqlDigest: headers.get("x-bks-executable-graphql-digest"), operationRegistryDigest: headers.get("x-bks-operation-registry-digest") };
    const expected = { executableGraphqlDigest: compatibility.executableGraphqlDigest, operationRegistryDigest: compatibility.operationRegistryDigest };
    const differs = (Object.keys(expected) as Array<keyof typeof expected>).some((k) => actual[k] !== null && actual[k] !== expected[k]);
    if (!differs) return;
    if (mode === "strict") throw new CompatibilityError(expected, actual, requestId);
    options.onWarning?.(`server build differs from the generated client (${JSON.stringify(actual)})`);
  };

  return {
    compatibility,
    async execute<TResult, TVariables>(document: PersistedDocument<TResult, TVariables>, variables: TVariables, call: CallOptions = {}): Promise<TResult> {
      const id = document.__meta__?.hash;
      if (!id || !operationNames.has(id)) throw new ValidationError("document is not a safelisted persisted operation of this client", [], { code: "PERSISTED_QUERY_NOT_FOUND" });
      const deadline = new AbortController();
      const timer = setTimeout(() => deadline.abort(new Error("deadline")), call.deadlineMs ?? deadlineMs);
      const linked = linkSignals([call.signal, deadline.signal]);
      try {
        let lastError: BiotechClientError | null = null;
        for (let attempt = 1; attempt <= attempts; attempt++) {
          if (linked.signal.aborted) break;
          const token = options.credentials ? await options.credentials() : null;
          const headers: Record<string, string> = { "content-type": "application/json", accept: "application/json", ...(options.headers ?? {}) };
          if (token) headers.authorization = `Bearer ${token}`;
          if (call.requestId) headers["x-request-id"] = call.requestId;
          const body = JSON.stringify({ documentId: id, operationName: operationNames.get(id), variables: variables ?? {} });
          let response: TransportResponse;
          try {
            response = await transport({ url: options.endpoint, method: "POST", headers, body, signal: linked.signal });
          } catch (error) {
            const aborted = linked.signal.aborted;
            lastError = new TransportError(aborted ? (deadline.signal.aborted ? "deadline exceeded" : "aborted") : `network error: ${(error as Error)?.message ?? String(error)}`, { retryable: !aborted, aborted, cause: error });
            if (!aborted && attempt < attempts) {
              await sleep(baseDelayMs * 2 ** (attempt - 1) * (0.5 + Math.random() / 2));
              continue;
            }
            throw lastError;
          }
          const requestId = response.headers.get("x-request-id");
          const text = await response.text();
          let parsed: { data?: unknown; errors?: GraphQLErrorEntry[] } | null = null;
          try {
            parsed = text ? JSON.parse(text) : null;
          } catch {
            parsed = null;
          }
          if (response.status < 500) checkCompatibility(response.headers, requestId);
          const error = classify(response.status, parsed, requestId);
          if (!error) return parsed!.data as TResult;
          lastError = error;
          if (error instanceof TransportError && error.retryable && attempt < attempts && !linked.signal.aborted) {
            await sleep(baseDelayMs * 2 ** (attempt - 1) * (0.5 + Math.random() / 2));
            continue;
          }
          throw error;
        }
        throw lastError ?? new TransportError(deadline.signal.aborted ? "deadline exceeded" : "aborted", { aborted: true });
      } finally {
        clearTimeout(timer);
        linked.cleanup();
      }
    },
  };
}

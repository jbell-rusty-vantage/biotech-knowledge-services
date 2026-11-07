/** Typed client errors. A partial GraphQL result is never turned into a successful empty result. */

export interface GraphQLErrorEntry {
  message: string;
  path?: ReadonlyArray<string | number>;
  extensions?: { code?: string; [key: string]: unknown };
}

export abstract class BiotechClientError extends Error {
  abstract readonly kind: "transport" | "auth" | "validation" | "partial-data" | "domain" | "compatibility";
  readonly status: number | null;
  readonly code: string | null;
  readonly requestId: string | null;
  constructor(message: string, options: { status?: number | null; code?: string | null; requestId?: string | null; cause?: unknown } = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.requestId = options.requestId ?? null;
  }
}

/** Network failure, abort, deadline, or an HTTP 5xx; `retryable` marks the ones a bounded retry may repeat. */
export class TransportError extends BiotechClientError {
  readonly kind = "transport" as const;
  readonly retryable: boolean;
  readonly aborted: boolean;
  constructor(message: string, options: { status?: number | null; code?: string | null; requestId?: string | null; retryable?: boolean; aborted?: boolean; cause?: unknown } = {}) {
    super(message, options);
    this.retryable = options.retryable ?? false;
    this.aborted = options.aborted ?? false;
  }
}

/** Session/actor/service credential rejected (HTTP 401/403 or BKS_UNAUTHORIZED). */
export class AuthError extends BiotechClientError {
  readonly kind = "auth" as const;
}

/** The request was refused before execution: unknown operation, variable bounds, size, admission. */
export class ValidationError extends BiotechClientError {
  readonly kind = "validation" as const;
  readonly errors: GraphQLErrorEntry[];
  constructor(message: string, errors: GraphQLErrorEntry[], options: { status?: number | null; code?: string | null; requestId?: string | null } = {}) {
    super(message, options);
    this.errors = errors;
  }
}

/** The server returned data AND errors; `data` is the partial result, never silently accepted. */
export class PartialDataError<TData = unknown> extends BiotechClientError {
  readonly kind = "partial-data" as const;
  readonly data: TData;
  readonly errors: GraphQLErrorEntry[];
  constructor(data: TData, errors: GraphQLErrorEntry[], options: { status?: number | null; requestId?: string | null } = {}) {
    super(`partial result: ${errors.map((e) => e.message).join("; ")}`, { ...options, code: errors[0]?.extensions?.code ?? null });
    this.data = data;
    this.errors = errors;
  }
}

/** A domain refusal with no data: unsupported capability, database time limit, release mismatch. */
export class DomainError extends BiotechClientError {
  readonly kind = "domain" as const;
  readonly errors: GraphQLErrorEntry[];
  constructor(message: string, errors: GraphQLErrorEntry[], options: { status?: number | null; code?: string | null; requestId?: string | null } = {}) {
    super(message, options);
    this.errors = errors;
  }
}

/** The server answers from a different executable schema or operation registry than this client was generated for. */
export class CompatibilityError extends BiotechClientError {
  readonly kind = "compatibility" as const;
  readonly expected: Record<string, string>;
  readonly actual: Record<string, string | null>;
  constructor(expected: Record<string, string>, actual: Record<string, string | null>, requestId: string | null) {
    super(`server build differs from the generated client: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`, { code: "CLIENT_SERVER_MISMATCH", requestId });
    this.expected = expected;
    this.actual = actual;
  }
}

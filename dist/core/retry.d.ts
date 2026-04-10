import type { Middleware, OpenFetchRetryOptions } from "../types/index.js";
/**
 * Middleware: re-invokes `next()` on retryable failures with exponential backoff.
 * Honors merged `ctx.request.retry` (defaults + per-request).
 * By default, retries after network/parse failures or configured HTTP statuses only for GET, HEAD, OPTIONS, and TRACE.
 * Set `retry.retryNonIdempotentMethods: true` (client defaults or per request) to retry POST/PUT/PATCH/DELETE as well.
 */
export declare function createRetryMiddleware(factoryDefaults?: OpenFetchRetryOptions): Middleware;
//# sourceMappingURL=retry.d.ts.map
import type { Middleware, OpenFetchRetryOptions } from "../types/index.js";
/**
 * Middleware: re-invokes `next()` on retryable failures with exponential backoff.
 * Honors merged `ctx.request.retry` (defaults + per-request).
 */
export declare function createRetryMiddleware(factoryDefaults?: OpenFetchRetryOptions): Middleware;
//# sourceMappingURL=retry.d.ts.map
import type { Middleware, OpenFetchRetryOptions } from "../types/index.js";
/**
 * Middleware: re-invokes `next()` on retryable failures with exponential backoff.
 * Honors merged `ctx.request.retry` (defaults + per-request).
 * By default, retries after network/parse failures or configured HTTP statuses only for GET, HEAD, OPTIONS, and TRACE.
 * Set `retry.retryNonIdempotentMethods: true` (client defaults or per request) to retry POST/PUT/PATCH/DELETE as well.
 *
 * With `retryNonIdempotentMethods` and `maxAttempts > 1`, POST requests get a stable `Idempotency-Key` header
 * (if unset) so servers can deduplicate retried writes. Disable with `retry.autoIdempotencyKey: false`.
 *
 * If `request.signal` is aborted (e.g. user called `controller.abort()`), no further attempts or backoff run.
 *
 * `retry.timeoutTotalMs` caps elapsed time for the whole sequence using a monotonic clock (`performance.now()`)
 * when available. With `retry.enforceTotalTimeout !== false` (default), each attempt merges a deadline into
 * `request.signal` so an in-flight `fetch` aborts when the budget is exhausted. Set `enforceTotalTimeout: false`
 * to enforce the budget only between attempts. On expiry throws `OpenFetchError` with code `ERR_RETRY_TIMEOUT`.
 * `retry.timeoutPerAttemptMs` overrides `request.timeout` for each attempt when set.
 */
export declare function createRetryMiddleware(factoryDefaults?: OpenFetchRetryOptions): Middleware;
//# sourceMappingURL=retry.d.ts.map
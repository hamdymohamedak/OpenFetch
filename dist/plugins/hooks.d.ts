import type { Middleware, OpenFetchContext, OpenFetchRetryOptions } from "../domain/types.js";
export type HooksPluginOptions = {
    /** Runs before the rest of the middleware stack and `fetch`. */
    onRequest?: (ctx: OpenFetchContext) => void | Promise<void>;
    /** Runs after a successful `next()` when `ctx.response` is set. */
    onResponse?: (ctx: OpenFetchContext) => void | Promise<void>;
    /** Runs when `next()` throws; the error is rethrown after the hook. */
    onError?: (ctx: OpenFetchContext, error: unknown) => void | Promise<void>;
    /** See `OpenFetchRetryOptions.onBeforeRetry` (merged into `ctx.request.retry`). */
    onBeforeRetry?: OpenFetchRetryOptions["onBeforeRetry"];
    /** See `OpenFetchRetryOptions.onAfterResponse` (merged into `ctx.request.retry`). */
    onAfterResponse?: OpenFetchRetryOptions["onAfterResponse"];
};
/**
 * Lifecycle hooks as a single middleware. For transforming config/response, prefer interceptors.
 */
export declare function hooks(options: HooksPluginOptions): Middleware;
//# sourceMappingURL=hooks.d.ts.map
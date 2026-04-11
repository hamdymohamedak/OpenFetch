import type { Middleware, OpenFetchContext } from "../types/index.js";
export type HooksPluginOptions = {
    /** Runs before the rest of the middleware stack and `fetch`. */
    onRequest?: (ctx: OpenFetchContext) => void | Promise<void>;
    /** Runs after a successful `next()` when `ctx.response` is set. */
    onResponse?: (ctx: OpenFetchContext) => void | Promise<void>;
    /** Runs when `next()` throws; the error is rethrown after the hook. */
    onError?: (ctx: OpenFetchContext, error: unknown) => void | Promise<void>;
};
/**
 * Lifecycle hooks as a single middleware. For transforming config/response, prefer interceptors.
 */
export declare function hooks(options: HooksPluginOptions): Middleware;
//# sourceMappingURL=hooks.d.ts.map
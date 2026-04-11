import type { Middleware, OpenFetchRetryOptions } from "../types/index.js";
export type RetryPluginOptions = Omit<OpenFetchRetryOptions, "maxAttempts"> & {
    /** Alias for `maxAttempts` (total tries including the first). */
    attempts?: number;
    maxAttempts?: number;
};
/**
 * Retry plugin: wraps {@link createRetryMiddleware} with DX-friendly `attempts` alias.
 * Register **before** other plugins so retries wrap the full inner chain (including timeout).
 */
export declare function retry(options?: RetryPluginOptions): Middleware;
//# sourceMappingURL=retry.d.ts.map
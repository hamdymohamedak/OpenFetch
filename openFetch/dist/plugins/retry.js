import { createRetryMiddleware } from "../core/retry.js";
/**
 * Retry plugin: wraps {@link createRetryMiddleware} with DX-friendly `attempts` alias.
 * Register **before** other plugins so retries wrap the full inner chain (including timeout).
 */
export function retry(options) {
    const { attempts, ...rest } = options ?? {};
    const mapped = {
        ...rest,
        maxAttempts: attempts ?? rest.maxAttempts,
    };
    return createRetryMiddleware(mapped);
}

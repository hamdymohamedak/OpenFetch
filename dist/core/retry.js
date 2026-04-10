import { OpenFetchError } from "./error.js";
const DEFAULT_RETRY_ON_STATUS = [408, 429, 500, 502, 503, 504];
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function computeDelayMs(attemptIndex, ro) {
    const raw = ro.baseDelayMs * ro.factor ** Math.max(0, attemptIndex - 1);
    const capped = Math.min(raw, ro.maxDelayMs);
    const jitter = capped * 0.25 * Math.random();
    return Math.round(capped + jitter);
}
function resolveRetryOptions(ctx, factoryDefaults) {
    const r = { ...factoryDefaults, ...ctx.retry };
    return {
        maxAttempts: r.maxAttempts ?? 3,
        baseDelayMs: r.baseDelayMs ?? 300,
        maxDelayMs: r.maxDelayMs ?? 30_000,
        factor: r.factor ?? 2,
        retryOnStatus: r.retryOnStatus ?? DEFAULT_RETRY_ON_STATUS,
        retryOnNetworkError: r.retryOnNetworkError ?? true,
        shouldRetry: r.shouldRetry,
    };
}
async function builtinShouldRetry(err, ro) {
    if (err instanceof OpenFetchError) {
        if (err.code === "ERR_CANCELED")
            return false;
        if (err.code === "ERR_BAD_RESPONSE" && err.response) {
            return ro.retryOnStatus.includes(err.response.status);
        }
        if (err.code === "ERR_NETWORK" || err.code === "ERR_PARSE") {
            return ro.retryOnNetworkError;
        }
        return false;
    }
    return ro.retryOnNetworkError;
}
/**
 * Middleware: re-invokes `next()` on retryable failures with exponential backoff.
 * Honors merged `ctx.request.retry` (defaults + per-request).
 */
export function createRetryMiddleware(factoryDefaults) {
    return async (ctx, next) => {
        const ro = resolveRetryOptions(ctx.request, factoryDefaults);
        let attempt = 0;
        while (true) {
            attempt += 1;
            try {
                await next();
                return;
            }
            catch (err) {
                if (attempt >= ro.maxAttempts) {
                    ctx.error = err;
                    throw err;
                }
                const baseOk = await builtinShouldRetry(err, ro);
                const customOk = ro.shouldRetry != null ? await ro.shouldRetry(err, attempt) : true;
                if (!baseOk || !customOk) {
                    ctx.error = err;
                    throw err;
                }
                await sleep(computeDelayMs(attempt, ro));
            }
        }
    };
}

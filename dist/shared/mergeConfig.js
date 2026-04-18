/** Keys that must never be copied from user config (prototype pollution). */
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
function stripPollution(record) {
    if (!record)
        return;
    for (const k of DANGEROUS_KEYS) {
        delete record[k];
    }
}
function composeOnBeforeRetry(a, b) {
    if (!a)
        return b;
    if (!b)
        return a;
    return async (ctx, info) => {
        await a(ctx, info);
        await b(ctx, info);
    };
}
function composeOnAfterResponse(a, b) {
    if (!a)
        return b;
    if (!b)
        return a;
    return async (ctx, response) => {
        await a(ctx, response);
        await b(ctx, response);
    };
}
function mergeRetry(a, b) {
    if (!a && !b)
        return undefined;
    const { onBeforeRetry: aBefore, onAfterResponse: aAfter, ...aRest } = a ?? {};
    const { onBeforeRetry: bBefore, onAfterResponse: bAfter, ...bRest } = b ?? {};
    return {
        ...aRest,
        ...bRest,
        onBeforeRetry: composeOnBeforeRetry(aBefore, bBefore),
        onAfterResponse: composeOnAfterResponse(aAfter, bAfter),
    };
}
function mergeMemoryCache(a, b) {
    if (!a && !b)
        return undefined;
    return { ...a, ...b };
}
export function mergeConfig(globalConfig, localConfig) {
    const merged = {
        ...globalConfig,
        ...localConfig,
        headers: {
            ...(globalConfig.headers ?? {}),
            ...(localConfig.headers ?? {}),
        },
        middlewares: [
            ...(globalConfig.middlewares ?? []),
            ...(localConfig.middlewares ?? []),
        ],
        transformRequest: [
            ...(globalConfig.transformRequest ?? []),
            ...(localConfig.transformRequest ?? []),
        ],
        transformResponse: [
            ...(globalConfig.transformResponse ?? []),
            ...(localConfig.transformResponse ?? []),
        ],
        init: [...(globalConfig.init ?? []), ...(localConfig.init ?? [])],
        retry: mergeRetry(globalConfig.retry, localConfig.retry),
        memoryCache: mergeMemoryCache(globalConfig.memoryCache, localConfig.memoryCache),
    };
    stripPollution(merged);
    stripPollution(merged.headers);
    if (merged.retry) {
        stripPollution(merged.retry);
    }
    if (merged.memoryCache) {
        stripPollution(merged.memoryCache);
    }
    return merged;
}

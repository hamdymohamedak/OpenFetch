/** Keys that must never be copied from user config (prototype pollution). */
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
function stripPollution(record) {
    if (!record)
        return;
    for (const k of DANGEROUS_KEYS) {
        delete record[k];
    }
}
function mergeRetry(a, b) {
    if (!a && !b)
        return undefined;
    return { ...a, ...b };
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

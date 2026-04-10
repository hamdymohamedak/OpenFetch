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
    return {
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
}

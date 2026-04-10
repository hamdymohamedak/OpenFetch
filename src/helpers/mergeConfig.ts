import type {
  OpenFetchConfig,
  OpenFetchMemoryCacheRequestOptions,
  OpenFetchRetryOptions,
} from "../types/index.js";

function mergeRetry(
  a: OpenFetchRetryOptions | undefined,
  b: OpenFetchRetryOptions | undefined
): OpenFetchRetryOptions | undefined {
  if (!a && !b) return undefined;
  return { ...a, ...b };
}

function mergeMemoryCache(
  a: OpenFetchMemoryCacheRequestOptions | undefined,
  b: OpenFetchMemoryCacheRequestOptions | undefined
): OpenFetchMemoryCacheRequestOptions | undefined {
  if (!a && !b) return undefined;
  return { ...a, ...b };
}

export function mergeConfig(
  globalConfig: OpenFetchConfig,
  localConfig: OpenFetchConfig
): OpenFetchConfig {
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
    memoryCache: mergeMemoryCache(
      globalConfig.memoryCache,
      localConfig.memoryCache
    ),
  };
}

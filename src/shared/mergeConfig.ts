import type {
  OpenFetchConfig,
  OpenFetchMemoryCacheRequestOptions,
  OpenFetchRetryOptions,
} from "../domain/types.js";

/** Keys that must never be copied from user config (prototype pollution). */
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function stripPollution(record: Record<string, unknown> | undefined): void {
  if (!record) return;
  for (const k of DANGEROUS_KEYS) {
    delete record[k];
  }
}

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
  const merged: OpenFetchConfig = {
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

  stripPollution(merged as unknown as Record<string, unknown>);
  stripPollution(merged.headers as unknown as Record<string, unknown>);
  if (merged.retry) {
    stripPollution(merged.retry as unknown as Record<string, unknown>);
  }
  if (merged.memoryCache) {
    stripPollution(merged.memoryCache as unknown as Record<string, unknown>);
  }

  return merged;
}

import type {
  OpenFetchConfig,
  OpenFetchContext,
  OpenFetchMemoryCacheRequestOptions,
  OpenFetchResponse,
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

function composeOnBeforeRetry(
  a?: OpenFetchRetryOptions["onBeforeRetry"],
  b?: OpenFetchRetryOptions["onBeforeRetry"]
): OpenFetchRetryOptions["onBeforeRetry"] | undefined {
  if (!a) return b;
  if (!b) return a;
  return async (
    ctx: OpenFetchContext,
    info: { attempt: number; error: unknown }
  ) => {
    await a(ctx, info);
    await b(ctx, info);
  };
}

function composeOnAfterResponse(
  a?: OpenFetchRetryOptions["onAfterResponse"],
  b?: OpenFetchRetryOptions["onAfterResponse"]
): OpenFetchRetryOptions["onAfterResponse"] | undefined {
  if (!a) return b;
  if (!b) return a;
  return async (ctx: OpenFetchContext, response: OpenFetchResponse) => {
    await a(ctx, response);
    await b(ctx, response);
  };
}

function mergeRetry(
  a: OpenFetchRetryOptions | undefined,
  b: OpenFetchRetryOptions | undefined
): OpenFetchRetryOptions | undefined {
  if (!a && !b) return undefined;
  const {
    onBeforeRetry: aBefore,
    onAfterResponse: aAfter,
    ...aRest
  } = a ?? {};
  const {
    onBeforeRetry: bBefore,
    onAfterResponse: bAfter,
    ...bRest
  } = b ?? {};
  return {
    ...aRest,
    ...bRest,
    onBeforeRetry: composeOnBeforeRetry(aBefore, bBefore),
    onAfterResponse: composeOnAfterResponse(aAfter, bAfter),
  };
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
    init: [...(globalConfig.init ?? []), ...(localConfig.init ?? [])],
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

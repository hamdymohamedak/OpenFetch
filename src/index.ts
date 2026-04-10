import { createClient, create } from "./core/client.js";

const openFetch = createClient();

export default openFetch;

export { createClient, create };

export { OpenFetchError, isOpenFetchError } from "./core/error.js";
export type { OpenFetchErrorShape } from "./core/error.js";
export { InterceptorManager } from "./core/interceptors.js";
export {
  createRetryMiddleware,
} from "./core/retry.js";
export {
  MemoryCacheStore,
  createCacheMiddleware,
  type CacheMiddlewareOptions,
  type MemoryCacheEntry,
  type MemoryCacheStoreOptions,
} from "./core/cache.js";

export type {
  Middleware,
  NextFn,
  OpenFetchClient,
  OpenFetchConfig,
  OpenFetchContext,
  OpenFetchInterceptors,
  OpenFetchMemoryCacheRequestOptions,
  OpenFetchResponse,
  OpenFetchRetryOptions,
  RequestConfig,
  TransformRequest,
  TransformResponse,
} from "./types/index.js";

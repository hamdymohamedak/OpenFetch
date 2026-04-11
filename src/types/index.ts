import type { InterceptorManager } from "../core/interceptors.js";

/** Called by middleware to continue the chain (may run the next middleware or the core fetch). */
export type NextFn = () => Promise<void>;

export type TransformRequest = (
  data: unknown,
  headers: Record<string, string>
) => unknown | Promise<unknown>;

export type TransformResponse<T = unknown> = (data: unknown) => T | Promise<T>;

/** Exponential backoff retry (merged from defaults + per-request). */
export type OpenFetchRetryOptions = {
  /** Total attempts including the first try. Default 3. */
  maxAttempts?: number;
  /** Base delay in ms before first retry. Default 300. */
  baseDelayMs?: number;
  /** Cap for backoff delay. Default 30_000. */
  maxDelayMs?: number;
  /** Multiplier each attempt. Default 2. */
  factor?: number;
  /** HTTP status codes that trigger a retry when `validateStatus` failed. */
  retryOnStatus?: number[];
  /** Retry when no response / network failure. Default true. */
  retryOnNetworkError?: boolean;
  /**
   * When true, network/parse failures and retryable HTTP statuses are retried for any method (e.g. POST).
   * Default false: only GET, HEAD, OPTIONS, and TRACE are retried for those cases to avoid duplicate side effects.
   */
  retryNonIdempotentMethods?: boolean;
  /** Optional custom gate (runs after built-in rules). */
  shouldRetry?: (error: unknown, attempt: number) => boolean | Promise<boolean>;
};

/** Per-request overrides for the memory cache middleware. */
export type OpenFetchMemoryCacheRequestOptions = {
  ttlMs?: number;
  staleWhileRevalidateMs?: number;
  /** Bypass memory cache read/write for this request. */
  skip?: boolean;
};

export type OpenFetchConfig = {
  url?: string | URL;
  baseURL?: string;
  method?: string;
  headers?: Record<string, string>;
  /** Request payload; merged into fetch `body` after transforms. */
  data?: unknown;
  body?: BodyInit | null;
  params?: Record<string, unknown>;
  paramsSerializer?: (params: Record<string, unknown>) => string;
  signal?: AbortSignal | null;
  timeout?: number;
  /** Maps to `credentials: 'include'` when true unless `credentials` is set. */
  withCredentials?: boolean;
  auth?: { username: string; password: string };
  responseType?: "arraybuffer" | "blob" | "json" | "text" | "stream";
  validateStatus?: (status: number) => boolean;
  transformRequest?: TransformRequest[];
  transformResponse?: TransformResponse[];
  middlewares?: Middleware[];
  /** Merged shallowly: defaults + per-request. Used by `createRetryMiddleware`. */
  retry?: OpenFetchRetryOptions;
  /** Per-request memory cache hints when using `createCacheMiddleware`. */
  memoryCache?: OpenFetchMemoryCacheRequestOptions;
  /**
   * When true, `get`/`post`/… return `response.data` only (ergonomic for RSC).
   * Default false — return full `OpenFetchResponse`.
   */
  unwrapResponse?: boolean;
} & Partial<
  Pick<
    RequestInit,
    | "cache"
    | "credentials"
    | "integrity"
    | "keepalive"
    | "mode"
    | "redirect"
    | "referrer"
    | "referrerPolicy"
  >
>;

export type OpenFetchResponse<T = unknown> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: OpenFetchConfig;
};

export type OpenFetchContext = {
  url: string | URL;
  request: OpenFetchConfig;
  response: OpenFetchResponse | null;
  error: unknown;
};

export type Middleware = (ctx: OpenFetchContext, next: NextFn) => Promise<void>;

export type OpenFetchInterceptors = {
  request: InterceptorManager<OpenFetchConfig>;
  response: InterceptorManager<OpenFetchResponse>;
};

export type RequestConfig = OpenFetchConfig & { url: string | URL };

export type OpenFetchClient = {
  defaults: OpenFetchConfig;
  interceptors: OpenFetchInterceptors;
  request: <T = unknown>(
    urlOrConfig: string | URL | RequestConfig,
    config?: OpenFetchConfig
  ) => Promise<OpenFetchResponse<T> | T>;
  get: <T = unknown>(
    url: string | URL,
    config?: OpenFetchConfig
  ) => Promise<OpenFetchResponse<T> | T>;
  post: <T = unknown>(
    url: string | URL,
    data?: unknown,
    config?: OpenFetchConfig
  ) => Promise<OpenFetchResponse<T> | T>;
  put: <T = unknown>(
    url: string | URL,
    data?: unknown,
    config?: OpenFetchConfig
  ) => Promise<OpenFetchResponse<T> | T>;
  patch: <T = unknown>(
    url: string | URL,
    data?: unknown,
    config?: OpenFetchConfig
  ) => Promise<OpenFetchResponse<T> | T>;
  delete: <T = unknown>(
    url: string | URL,
    config?: OpenFetchConfig
  ) => Promise<OpenFetchResponse<T> | T>;
  head: <T = unknown>(
    url: string | URL,
    config?: OpenFetchConfig
  ) => Promise<OpenFetchResponse<T> | T>;
  options: <T = unknown>(
    url: string | URL,
    config?: OpenFetchConfig
  ) => Promise<OpenFetchResponse<T> | T>;
  /** Register middleware (runs around the fetch adapter after request interceptors). */
  use: (fn: Middleware) => void;
};

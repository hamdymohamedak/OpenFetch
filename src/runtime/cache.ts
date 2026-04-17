import type { Middleware, OpenFetchConfig, OpenFetchResponse } from "../domain/types.js";
import { buildURL } from "../shared/buildURL.js";
import { dispatch, type DispatchConfig } from "../transport/dispatch.js";

export type MemoryCacheEntry = {
  response: OpenFetchResponse;
  freshUntil: number;
  expireAt: number;
};

export type MemoryCacheStoreOptions = {
  /** Max entries before evicting oldest (Map insertion order). Default 500. */
  maxEntries?: number;
};

export class MemoryCacheStore {
  private readonly map = new Map<string, MemoryCacheEntry>();
  private readonly maxEntries: number;

  constructor(options?: MemoryCacheStoreOptions) {
    this.maxEntries = options?.maxEntries ?? 500;
  }

  get(key: string): MemoryCacheEntry | undefined {
    return this.map.get(key);
  }

  set(key: string, entry: MemoryCacheEntry): void {
    while (this.maxEntries > 0 && this.map.size >= this.maxEntries) {
      const first = this.map.keys().next().value;
      if (first === undefined) break;
      this.map.delete(first);
    }
    this.map.set(key, entry);
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

/** Always folded into the cache key unless `varyHeaderNames` is explicitly `[]`. */
const DEFAULT_VARY_HEADER_NAMES = ["authorization", "cookie"] as const;

function resolveVaryHeaderNames(
  explicit: string[] | undefined
): string[] {
  if (explicit === undefined) {
    return [...DEFAULT_VARY_HEADER_NAMES];
  }
  if (explicit.length === 0) {
    return [];
  }
  const byLower = new Map<string, string>();
  for (const n of DEFAULT_VARY_HEADER_NAMES) {
    byLower.set(n.toLowerCase(), n);
  }
  for (const n of explicit) {
    byLower.set(n.toLowerCase(), n);
  }
  return [...byLower.values()];
}

export type CacheMiddlewareOptions = {
  /** Fresh window: serve from memory without network. Default 60_000 ms. */
  ttlMs?: number;
  /** After TTL, still serve cached while a background refresh runs. Default 0. */
  staleWhileRevalidateMs?: number;
  /** Uppercase methods to cache. Default GET and HEAD. */
  methods?: string[];
  /** Custom key; default `METHOD fullUrl`. */
  key?: (input: { request: OpenFetchConfig; url: string }) => string;
  /**
   * Extra header names (case-insensitive) to fold into the cache key after the default or custom `key`.
   * `authorization` and `cookie` are always included unless you pass `varyHeaderNames: []` (URL-only keying).
   */
  varyHeaderNames?: string[];
  /**
   * When false (default), a GET/HEAD that includes `Authorization` or `Cookie` while
   * `varyHeaderNames` is explicitly empty and there is no custom `key` triggers a one-time `console.warn`.
   * Set true if an empty `varyHeaderNames` is intentional.
   */
  suppressAuthCacheKeyWarning?: boolean;
};

function shallowCloneResponse(r: OpenFetchResponse): OpenFetchResponse {
  return {
    ...r,
    headers: { ...r.headers },
    config: { ...r.config },
    data: r.data,
  };
}

function headersHaveAuthOrCookie(
  headers: Record<string, string> | undefined
): boolean {
  if (!headers) return false;
  for (const k of Object.keys(headers)) {
    const l = k.toLowerCase();
    if (l === "authorization" || l === "cookie") return true;
  }
  return false;
}

/** Append a stable suffix from header values so cache keys differ per auth/cookie (etc.). */
export function appendCacheKeyVaryHeaders(
  baseKey: string,
  headers: Record<string, string> | undefined,
  headerNames: string[]
): string {
  if (!headerNames.length) return baseKey;
  const lowerToValue = new Map<string, string>();
  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      lowerToValue.set(k.toLowerCase(), v);
    }
  }
  const parts = headerNames.map((name) => {
    const v = lowerToValue.get(name.toLowerCase());
    return `${name.toLowerCase()}:${v ?? ""}`;
  });
  return `${baseKey}\u001f${parts.join("\u001f")}`;
}

function revalidateInBackground(
  key: string,
  store: MemoryCacheStore,
  request: OpenFetchConfig,
  ttlMs: number,
  swrMs: number,
  inflight: Map<string, Promise<void>>
): void {
  if (inflight.has(key)) return;

  const p = (async () => {
    try {
      const cfg: DispatchConfig = {
        ...request,
        memoryCache: { ...request.memoryCache, skip: true },
        url: request.url as string | URL,
      };
      const res = await dispatch(cfg);
      const storedAt = Date.now();
      store.set(key, {
        response: shallowCloneResponse(res),
        freshUntil: storedAt + ttlMs,
        expireAt: storedAt + ttlMs + swrMs,
      });
    } catch {
      // background refresh failed — stale entry remains until expireAt
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
}

/**
 * In-memory cache with TTL and optional stale-while-revalidate (background `dispatch`).
 * Skips when `memoryCache.skip` is true. Uses `memoryCache.ttlMs` / `staleWhileRevalidateMs` per request when set.
 * For per-user or authenticated responses, set `varyHeaderNames` (e.g. `["authorization","cookie"]`) or a custom `key`.
 */
export function createCacheMiddleware(
  store: MemoryCacheStore,
  options?: CacheMiddlewareOptions
): Middleware {
  const defaultTtl = options?.ttlMs ?? 60_000;
  const defaultSwr = options?.staleWhileRevalidateMs ?? 0;
  const varyHeaderNames = resolveVaryHeaderNames(options?.varyHeaderNames);
  const methods = new Set(
    (options?.methods ?? ["GET", "HEAD"]).map((m) => m.toUpperCase())
  );
  const inflight = new Map<string, Promise<void>>();
  let authCacheKeyWarningIssued = false;

  return async (ctx, next) => {
    if (ctx.request.memoryCache?.skip) {
      await next();
      return;
    }

    const method = (ctx.request.method ?? "GET").toUpperCase();
    if (!methods.has(method)) {
      await next();
      return;
    }

    const urlString = buildURL(ctx.request.url as string | URL, ctx.request);
    const rawKey =
      options?.key?.({ request: ctx.request, url: urlString }) ??
      `${method} ${urlString}`;
    if (
      !authCacheKeyWarningIssued &&
      options?.suppressAuthCacheKeyWarning !== true &&
      options?.key === undefined &&
      options?.varyHeaderNames !== undefined &&
      options.varyHeaderNames.length === 0 &&
      headersHaveAuthOrCookie(ctx.request.headers)
    ) {
      authCacheKeyWarningIssued = true;
      if (typeof console !== "undefined" && typeof console.warn === "function") {
        console.warn(
          "[openfetch] createCacheMiddleware: request uses Authorization or Cookie but varyHeaderNames was explicitly set to [] and no custom key is set; cache entries may be shared across users. Omit varyHeaderNames (defaults include authorization + cookie), set options.key, or set suppressAuthCacheKeyWarning: true if this is intentional."
        );
      }
    }
    const key = appendCacheKeyVaryHeaders(
      rawKey,
      ctx.request.headers,
      varyHeaderNames
    );

    const ttlMs = ctx.request.memoryCache?.ttlMs ?? defaultTtl;
    const swrMs = ctx.request.memoryCache?.staleWhileRevalidateMs ?? defaultSwr;

    const now = Date.now();
    const hit = store.get(key);

    if (hit) {
      if (now < hit.freshUntil) {
        ctx.response = shallowCloneResponse(hit.response);
        return;
      }
      if (now < hit.expireAt) {
        ctx.response = shallowCloneResponse(hit.response);
        if (swrMs > 0) {
          revalidateInBackground(
            key,
            store,
            ctx.request,
            ttlMs,
            swrMs,
            inflight
          );
        }
        return;
      }
    }

    await next();

    if (ctx.error) return;
    if (!ctx.response) return;

    const storedAt = Date.now();
    store.set(key, {
      response: shallowCloneResponse(ctx.response),
      freshUntil: storedAt + ttlMs,
      expireAt: storedAt + ttlMs + swrMs,
    });
  };
}

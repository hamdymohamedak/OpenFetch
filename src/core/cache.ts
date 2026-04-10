import { buildURL } from "../helpers/buildURL.js";
import { dispatch, type DispatchConfig } from "./dispatch.js";
import type { Middleware, OpenFetchConfig, OpenFetchResponse } from "../types/index.js";

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

export type CacheMiddlewareOptions = {
  /** Fresh window: serve from memory without network. Default 60_000 ms. */
  ttlMs?: number;
  /** After TTL, still serve cached while a background refresh runs. Default 0. */
  staleWhileRevalidateMs?: number;
  /** Uppercase methods to cache. Default GET and HEAD. */
  methods?: string[];
  /** Custom key; default `METHOD fullUrl`. */
  key?: (input: { request: OpenFetchConfig; url: string }) => string;
};

function shallowCloneResponse(r: OpenFetchResponse): OpenFetchResponse {
  return {
    ...r,
    headers: { ...r.headers },
    config: { ...r.config },
    data: r.data,
  };
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
 */
export function createCacheMiddleware(
  store: MemoryCacheStore,
  options?: CacheMiddlewareOptions
): Middleware {
  const defaultTtl = options?.ttlMs ?? 60_000;
  const defaultSwr = options?.staleWhileRevalidateMs ?? 0;
  const methods = new Set(
    (options?.methods ?? ["GET", "HEAD"]).map((m) => m.toUpperCase())
  );
  const inflight = new Map<string, Promise<void>>();

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
    const key =
      options?.key?.({ request: ctx.request, url: urlString }) ??
      `${method} ${urlString}`;

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

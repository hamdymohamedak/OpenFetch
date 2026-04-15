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
export declare class MemoryCacheStore {
    private readonly map;
    private readonly maxEntries;
    constructor(options?: MemoryCacheStoreOptions);
    get(key: string): MemoryCacheEntry | undefined;
    set(key: string, entry: MemoryCacheEntry): void;
    delete(key: string): void;
    clear(): void;
}
export type CacheMiddlewareOptions = {
    /** Fresh window: serve from memory without network. Default 60_000 ms. */
    ttlMs?: number;
    /** After TTL, still serve cached while a background refresh runs. Default 0. */
    staleWhileRevalidateMs?: number;
    /** Uppercase methods to cache. Default GET and HEAD. */
    methods?: string[];
    /** Custom key; default `METHOD fullUrl`. */
    key?: (input: {
        request: OpenFetchConfig;
        url: string;
    }) => string;
    /**
     * Header names (case-insensitive) to fold into the cache key after the default or custom `key`.
     * Use for authenticated or personalized GETs, e.g. `["authorization", "cookie"]`, so entries do not leak across users.
     */
    varyHeaderNames?: string[];
    /**
     * When false (default), the first cached GET/HEAD that includes `Authorization` or `Cookie`
     * without `varyHeaderNames` or a custom `key` triggers a one-time `console.warn` about
     * possible cross-user cache leakage. Set true if you intentionally cache anonymous responses
     * only or use another isolation mechanism.
     */
    suppressAuthCacheKeyWarning?: boolean;
};
/** Append a stable suffix from header values so cache keys differ per auth/cookie (etc.). */
export declare function appendCacheKeyVaryHeaders(baseKey: string, headers: Record<string, string> | undefined, headerNames: string[]): string;
/**
 * In-memory cache with TTL and optional stale-while-revalidate (background `dispatch`).
 * Skips when `memoryCache.skip` is true. Uses `memoryCache.ttlMs` / `staleWhileRevalidateMs` per request when set.
 * For per-user or authenticated responses, set `varyHeaderNames` (e.g. `["authorization","cookie"]`) or a custom `key`.
 */
export declare function createCacheMiddleware(store: MemoryCacheStore, options?: CacheMiddlewareOptions): Middleware;
//# sourceMappingURL=cache.d.ts.map
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
};
/**
 * In-memory cache with TTL and optional stale-while-revalidate (background `dispatch`).
 * Skips when `memoryCache.skip` is true. Uses `memoryCache.ttlMs` / `staleWhileRevalidateMs` per request when set.
 */
export declare function createCacheMiddleware(store: MemoryCacheStore, options?: CacheMiddlewareOptions): Middleware;
//# sourceMappingURL=cache.d.ts.map
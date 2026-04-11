import type { Middleware, OpenFetchClient, OpenFetchConfig, OpenFetchResponse } from "../types/index.js";
/**
 * Lazy builder: `.get()` / `.post()` only accumulate config. Each **terminal** method (`.json()`, `.text()`,
 * `.send()`, `.raw()`, …) starts **one new** HTTP request — calling two terminals is two requests, not one
 * shared `Response`, unless you use {@link RequestChain.memo}.
 *
 * **`.raw()` / `rawResponse`:** skips reading the body in the core adapter and skips `transformResponse`.
 * Client **response interceptors** still run; they see `OpenFetchResponse` with `data` set to the native
 * `Response`. Middleware that expects parsed/transformed `ctx.response.data` will not see transformed JSON.
 */
export type RequestChain = {
    get(config?: OpenFetchConfig): RequestChain;
    post(data?: unknown, config?: OpenFetchConfig): RequestChain;
    put(data?: unknown, config?: OpenFetchConfig): RequestChain;
    patch(data?: unknown, config?: OpenFetchConfig): RequestChain;
    delete(config?: OpenFetchConfig): RequestChain;
    head(config?: OpenFetchConfig): RequestChain;
    options(config?: OpenFetchConfig): RequestChain;
    /**
     * One HTTP round-trip shared across subsequent terminals on this chain (`json` + `text`, etc.).
     * Body is buffered once (as `ArrayBuffer`); not a general HTTP cache.
     */
    memo(): RequestChain;
    /** Parsed JSON body (`unwrapResponse` + `responseType: json`). */
    json<T = unknown>(): Promise<T>;
    /** Text body (`unwrapResponse` + `responseType: text`). */
    text(): Promise<string>;
    blob(): Promise<Blob>;
    arrayBuffer(): Promise<ArrayBuffer>;
    /** `unwrapResponse` + `responseType: stream` (body stream). */
    stream(): Promise<ReadableStream<Uint8Array> | null>;
    /** Native `Response` with an unread body (escape hatch). */
    raw(): Promise<Response>;
    /** Full `OpenFetchResponse` without unwrapping. */
    send<T = unknown>(): Promise<OpenFetchResponse<T>>;
};
export type FluentOpenFetchClient = Omit<OpenFetchClient, "use"> & {
    (url: string | URL, config?: OpenFetchConfig): RequestChain;
    use: (fn: Middleware) => FluentOpenFetchClient;
};
/**
 * Like {@link createClient} plus a callable URL entrypoint for Wretch-style chaining:
 * `await fluent("/api").json()`, `fluent("/x").post(body).send()`.
 */
export declare function createFluentClient(initialDefaults?: OpenFetchConfig): FluentOpenFetchClient;
//# sourceMappingURL=fluent.d.ts.map
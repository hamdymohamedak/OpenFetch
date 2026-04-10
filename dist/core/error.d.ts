import type { OpenFetchConfig, OpenFetchResponse } from "../types/index.js";
/**
 * Serializable error shape for logging or structured API responses.
 */
export type OpenFetchErrorShape = {
    message: string;
    status?: number;
    url: string;
    method: string;
    data?: unknown;
    headers?: Record<string, string>;
    code?: string;
};
/** Options for {@link OpenFetchError.toShape}. */
export type OpenFetchErrorToShapeOptions = {
    /**
     * When false, omits `data` (response body on error responses). Prefer false for client-facing or shared logs.
     * Default true (backward compatible).
     */
    includeResponseData?: boolean;
    /**
     * When false, omits `headers`. Prefer false when responses may carry tokens or cookies.
     * Default true (backward compatible).
     */
    includeResponseHeaders?: boolean;
};
export declare class OpenFetchError<T = unknown> extends Error {
    config?: OpenFetchConfig;
    code?: string;
    response?: OpenFetchResponse<T>;
    request?: {
        url: string;
    };
    constructor(message: string, options?: {
        config?: OpenFetchConfig;
        code?: string;
        response?: OpenFetchResponse<T>;
        request?: {
            url: string;
        };
    });
    /**
     * Plain object: `message`, `status`, `url`, `method`, optional `data` / `headers`, `code`.
     * Omits `config.auth`; the live `OpenFetchError` instance may still hold secrets — do not expose it raw to clients.
     * Use `includeResponseData: false` and `includeResponseHeaders: false` when serializing for untrusted parties.
     */
    toShape(options?: OpenFetchErrorToShapeOptions): OpenFetchErrorShape;
    toJSON(): OpenFetchErrorShape;
}
export declare function isOpenFetchError(err: unknown): err is OpenFetchError;
//# sourceMappingURL=error.d.ts.map
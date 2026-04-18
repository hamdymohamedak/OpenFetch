import type { OpenFetchConfig, OpenFetchResponse } from "./types.js";
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
     * When true, includes `data` (response body on error responses). Default false — omit for safer logs and JSON.
     */
    includeResponseData?: boolean;
    /**
     * When true, includes response `headers`. Default false — omit when responses may carry tokens or cookies.
     */
    includeResponseHeaders?: boolean;
    /**
     * When true (default), replaces sensitive query parameter values in the serialized `url`
     * (e.g. `token`, `code`, `api_key`). Set false only for trusted internal diagnostics.
     */
    redactSensitiveUrlQuery?: boolean;
    /** Extra query parameter names to redact (case-insensitive); merged with the built-in list. */
    sensitiveQueryParamNames?: string[];
    /** Replacement string for redacted query values (default `"[REDACTED]"`). */
    sensitiveQueryParamReplacement?: string;
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
     * By default omits `data` and `headers`; pass `includeResponseData: true` / `includeResponseHeaders: true` for trusted diagnostics.
     */
    toShape(options?: OpenFetchErrorToShapeOptions): OpenFetchErrorShape;
    toJSON(): OpenFetchErrorShape;
}
export declare function isOpenFetchError(err: unknown): err is OpenFetchError;
/** `OpenFetchError` with `code === "ERR_BAD_RESPONSE"` and a populated `response`. */
export declare function isHTTPError(err: unknown): err is OpenFetchError;
/** Per-attempt fetch timeout (`ERR_TIMEOUT`) or retry budget exceeded (`ERR_RETRY_TIMEOUT`). */
export declare function isTimeoutError(err: unknown): err is OpenFetchError;
//# sourceMappingURL=error.d.ts.map
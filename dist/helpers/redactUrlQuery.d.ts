/** Lowercase query parameter names whose values are redacted in logs and error shapes. */
export declare const DEFAULT_SENSITIVE_QUERY_PARAM_NAMES: readonly ["token", "access_token", "refresh_token", "id_token", "password", "passwd", "secret", "client_secret", "api_key", "apikey", "auth", "code", "session", "sessionid", "sid", "csrf", "nonce"];
export type RedactUrlQueryOptions = {
    /** Extra parameter names (case-insensitive) to redact. */
    paramNames?: string[];
    /** When false, returns `url` unchanged. Default true. */
    enabled?: boolean;
};
/**
 * Replaces values of sensitive query parameters for safe logging or serialization.
 * Invalid or non-absolute URLs are returned unchanged.
 */
export declare function redactSensitiveUrlQuery(url: string, options?: RedactUrlQueryOptions): string;
//# sourceMappingURL=redactUrlQuery.d.ts.map
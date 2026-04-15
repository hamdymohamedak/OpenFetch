/** Lowercase query parameter names whose values are redacted in logs and error shapes. */
export const DEFAULT_SENSITIVE_QUERY_PARAM_NAMES = [
    "token",
    "access_token",
    "refresh_token",
    "id_token",
    "password",
    "passwd",
    "secret",
    "client_secret",
    "api_key",
    "apikey",
    "auth",
    "code",
    "session",
    "sessionid",
    "sid",
    "csrf",
    "nonce",
];
const DEFAULT_SET = new Set(DEFAULT_SENSITIVE_QUERY_PARAM_NAMES.map((n) => n.toLowerCase()));
/**
 * Replaces values of sensitive query parameters for safe logging or serialization.
 * Invalid or non-absolute URLs are returned unchanged.
 */
export function redactSensitiveUrlQuery(url, options) {
    if (options?.enabled === false || url === "")
        return url;
    const extra = options?.paramNames ?? [];
    const sensitive = extra.length === 0
        ? DEFAULT_SET
        : new Set([
            ...DEFAULT_SET,
            ...extra.map((n) => n.toLowerCase()),
        ]);
    try {
        const u = new URL(url);
        if (u.search === "")
            return url;
        const params = u.searchParams;
        let changed = false;
        const names = new Set();
        params.forEach((_v, name) => {
            names.add(name);
        });
        for (const name of names) {
            if (sensitive.has(name.toLowerCase())) {
                params.set(name, "[REDACTED]");
                changed = true;
            }
        }
        return changed ? u.toString() : url;
    }
    catch {
        return url;
    }
}

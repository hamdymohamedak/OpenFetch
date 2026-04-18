/**
 * Map a native `Request` into {@link OpenFetchConfig} fields (URL, method, headers, body, signal, RequestInit picks).
 * Caller should merge with defaults / overrides via {@link mergeConfig}.
 */
export function openFetchConfigFromRequest(request) {
    const headers = {};
    request.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
    });
    const cfg = {
        url: request.url,
        method: request.method,
        headers,
    };
    if (request.body != null) {
        cfg.body = request.body;
    }
    if (request.signal) {
        cfg.signal = request.signal;
    }
    if (request.cache)
        cfg.cache = request.cache;
    if (request.credentials)
        cfg.credentials = request.credentials;
    if (request.integrity)
        cfg.integrity = request.integrity;
    if (request.keepalive)
        cfg.keepalive = request.keepalive;
    if (request.mode)
        cfg.mode = request.mode;
    if (request.redirect)
        cfg.redirect = request.redirect;
    if (request.referrer)
        cfg.referrer = request.referrer;
    if (request.referrerPolicy)
        cfg.referrerPolicy = request.referrerPolicy;
    return cfg;
}

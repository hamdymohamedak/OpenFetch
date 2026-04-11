/** RFC 7617 Basic auth header value (no "Basic " prefix). */
export function encodeBasicAuth(username, password) {
    const pair = `${username}:${password}`;
    if (typeof btoa === "function") {
        return btoa(pair);
    }
    // Node.js without btoa (rare on supported engines)
    const g = globalThis;
    if (g.Buffer) {
        return g.Buffer.from(pair, "utf8").toString("base64");
    }
    throw new Error("openfetch: cannot encode Basic auth (no btoa/Buffer)");
}

/**
 * Optional guard for server-side fetches when the URL may be influenced by untrusted input.
 * Blocks `http`/`https` URLs whose host is a literal private, loopback, or link-local IP (IPv4 and common IPv6 cases).
 * Does **not** prevent SSRF via DNS names that resolve to internal addresses (DNS rebinding); validate hostnames at the application layer or use an egress proxy.
 */
/**
 * Throws `Error` if the URL is not `http:`/`https:` or resolves to a blocked literal IP host.
 * Call before `client.request` when the URL is not fully trusted.
 */
export declare function assertSafeHttpUrl(url: string | URL): void;
//# sourceMappingURL=assertSafeHttpUrl.d.ts.map
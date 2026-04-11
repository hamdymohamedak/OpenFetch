/**
 * Optional guard for server-side fetches when the URL may be influenced by untrusted input.
 * Blocks `http`/`https` URLs whose host is a literal private, loopback, or link-local IP (IPv4 and common IPv6 cases).
 * Does **not** prevent SSRF via DNS names that resolve to internal addresses (DNS rebinding); validate hostnames at the application layer or use an egress proxy.
 */

function parseIPv4(host: string): [number, number, number, number] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return null;
  const parts = m.slice(1).map((x) => Number(x));
  if (parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return parts as [number, number, number, number];
}

function isBlockedIPv4(octets: [number, number, number, number]): boolean {
  const [a, b] = octets;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224 && a <= 239) return true;
  return false;
}

function isBlockedIPv6(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "::1") return true;
  if (h.startsWith("fe80:")) return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true;
  const mapped = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i.exec(h);
  if (mapped) {
    const v4 = parseIPv4(mapped[1]);
    if (v4 && isBlockedIPv4(v4)) return true;
  }
  return false;
}

/**
 * Throws `Error` if the URL is not `http:`/`https:` or resolves to a blocked literal IP host.
 * Call before `client.request` when the URL is not fully trusted.
 */
export function assertSafeHttpUrl(url: string | URL): void {
  let u: URL;
  try {
    u = typeof url === "string" ? new URL(url) : new URL(url.href);
  } catch {
    throw new Error("openfetch: assertSafeHttpUrl: invalid URL");
  }
  const proto = u.protocol.toLowerCase();
  if (proto !== "http:" && proto !== "https:") {
    throw new Error("openfetch: assertSafeHttpUrl: only http(s) URLs are allowed");
  }
  const host = u.hostname;
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error("openfetch: assertSafeHttpUrl: localhost is not allowed");
  }
  const v4 = parseIPv4(host);
  if (v4 && isBlockedIPv4(v4)) {
    throw new Error("openfetch: assertSafeHttpUrl: private or blocked IPv4 address");
  }
  if (host.includes(":") && isBlockedIPv6(host)) {
    throw new Error("openfetch: assertSafeHttpUrl: private or blocked IPv6 address");
  }
}

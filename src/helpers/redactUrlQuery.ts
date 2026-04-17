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
] as const;

const DEFAULT_REDACTION = "[REDACTED]";

const DEFAULT_SET = new Set<string>(
  DEFAULT_SENSITIVE_QUERY_PARAM_NAMES.map((n) => n.toLowerCase())
);

function normalizeKey(k: string): string {
  return k.toLowerCase().replace(/[-_]/g, "");
}

function buildPartialFragments(sensitive: Set<string>): string[] {
  const out: string[] = [];
  for (const s of sensitive) {
    const n = normalizeKey(s);
    if (n !== "") out.push(n);
  }
  return out;
}

const DEFAULT_PARTIAL_FRAGMENTS = buildPartialFragments(DEFAULT_SET);

/**
 * Path- or query-shaped strings that are safe to resolve with a dummy base.
 * Avoids turning arbitrary tokens like `not-a-url` into `http://localhost/not-a-url`.
 */
function mayBeRelativeRequestUrl(url: string): boolean {
  return (
    url.startsWith("/") ||
    url.startsWith("./") ||
    url.startsWith("../") ||
    url.startsWith("?") ||
    url.includes("/") ||
    url.includes("?")
  );
}

type ParsedUrl = {
  u: URL;
  /** Parsed via dummy base (relative / path-only input). */
  relativeInput: boolean;
  /** Input was query-only (e.g. `?token=1`). */
  queryOnlyInput: boolean;
};

function parseUrlForRedaction(url: string): ParsedUrl | null {
  try {
    const u = new URL(url);
    return { u, relativeInput: false, queryOnlyInput: false };
  } catch {
    if (!mayBeRelativeRequestUrl(url)) return null;
    try {
      const u = new URL(url, "http://localhost");
      return {
        u,
        relativeInput: true,
        queryOnlyInput: url.startsWith("?"),
      };
    } catch {
      return null;
    }
  }
}

function isSensitiveName(
  nameLower: string,
  sensitive: Set<string>,
  partialFragments: readonly string[]
): boolean {
  if (sensitive.has(nameLower)) return true;
  const kn = normalizeKey(nameLower);
  if (kn === "") return false;
  for (const frag of partialFragments) {
    if (frag !== "" && kn.includes(frag)) return true;
  }
  return false;
}

function serializeAfterRedaction(parsed: ParsedUrl): string {
  const { u, relativeInput, queryOnlyInput } = parsed;
  if (!relativeInput) return u.toString();
  if (queryOnlyInput) return `${u.search}${u.hash}`;
  return `${u.pathname}${u.search}${u.hash}`;
}

export type RedactUrlQueryOptions = {
  /** Extra parameter names (case-insensitive) to redact. */
  paramNames?: string[];
  /** When false, returns `url` unchanged. Default true. */
  enabled?: boolean;
  /** Value substituted for sensitive query parameters (default `"[REDACTED]"`). */
  replacement?: string;
};

/**
 * Replaces values of sensitive query parameters for safe logging or serialization.
 * Supports absolute URLs and common relative forms (`/path?…`, `?only=query`, `api/x?…`).
 * Strings that are not valid URLs and do not look like path/query requests are returned unchanged.
 */
export function redactSensitiveUrlQuery(
  url: string,
  options?: RedactUrlQueryOptions
): string {
  if (options?.enabled === false || url === "") return url;
  const extra = options?.paramNames ?? [];
  const sensitive =
    extra.length === 0
      ? DEFAULT_SET
      : new Set([...DEFAULT_SET, ...extra.map((n) => n.toLowerCase())]);
  const partialFragments =
    extra.length === 0
      ? DEFAULT_PARTIAL_FRAGMENTS
      : buildPartialFragments(sensitive);
  const replacement = options?.replacement ?? DEFAULT_REDACTION;

  const parsed = parseUrlForRedaction(url);
  if (parsed === null) return url;
  const { u } = parsed;
  if (u.search === "") return url;

  const params = u.searchParams;
  let changed = false;
  const names = new Set<string>();
  params.forEach((_v, name) => {
    names.add(name);
  });

  for (const name of names) {
    const lower = name.toLowerCase();
    if (!isSensitiveName(lower, sensitive, partialFragments)) continue;
    const n = params.getAll(name).length;
    params.delete(name);
    for (let i = 0; i < n; i++) {
      params.append(name, replacement);
    }
    changed = true;
  }

  return changed ? serializeAfterRedaction(parsed) : url;
}

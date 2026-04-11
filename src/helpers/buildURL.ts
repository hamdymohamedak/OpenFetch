import { combineURLs } from "./combineURLs.js";
import { isAbsoluteURL } from "./isAbsoluteURL.js";
import { serializeParams } from "./serializeParams.js";
import type { OpenFetchConfig } from "../types/index.js";

export function buildURL(
  url: string | URL,
  config: Pick<
    OpenFetchConfig,
    "baseURL" | "params" | "paramsSerializer"
  >
): string {
  let resolved =
    typeof url === "string" ? url.trim() : url.href;

  if (config.baseURL && !isAbsoluteURL(resolved)) {
    const rel = resolved.startsWith("/") ? resolved : `/${resolved}`;
    resolved = combineURLs(config.baseURL.replace(/\/+$/, ""), rel);
  }

  const query = serializeParams(config.params, config.paramsSerializer);
  if (!query) return resolved;

  const sep = resolved.includes("?") ? "&" : "?";
  return `${resolved}${sep}${query}`;
}

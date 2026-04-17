import { buildURL } from "../shared/buildURL.js";
import {
  redactSensitiveUrlQuery,
  type RedactUrlQueryOptions,
} from "../shared/redactUrlQuery.js";
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

function resolveUrl(config?: OpenFetchConfig): string {
  if (config?.url === undefined || config.url === "") return "";
  try {
    return buildURL(config.url as string | URL, config);
  } catch {
    return String(config.url);
  }
}

export class OpenFetchError<T = unknown> extends Error {
  config?: OpenFetchConfig;
  code?: string;
  response?: OpenFetchResponse<T>;
  request?: { url: string };

  constructor(
    message: string,
    options?: {
      config?: OpenFetchConfig;
      code?: string;
      response?: OpenFetchResponse<T>;
      request?: { url: string };
    }
  ) {
    super(message);
    this.name = "OpenFetchError";
    if (options?.config !== undefined) this.config = options.config;
    if (options?.code !== undefined) this.code = options.code;
    if (options?.response !== undefined) this.response = options.response;
    if (options?.request !== undefined) this.request = options.request;
  }

  /**
   * Plain object: `message`, `status`, `url`, `method`, optional `data` / `headers`, `code`.
   * Omits `config.auth`; the live `OpenFetchError` instance may still hold secrets — do not expose it raw to clients.
   * By default omits `data` and `headers`; pass `includeResponseData: true` / `includeResponseHeaders: true` for trusted diagnostics.
   */
  toShape(options?: OpenFetchErrorToShapeOptions): OpenFetchErrorShape {
    let url =
      this.request?.url ??
      resolveUrl(this.config) ??
      "";
    const redactOpts: RedactUrlQueryOptions = {
      enabled: options?.redactSensitiveUrlQuery !== false,
      paramNames: options?.sensitiveQueryParamNames,
      replacement: options?.sensitiveQueryParamReplacement,
    };
    url = redactSensitiveUrlQuery(url, redactOpts);
    const method = (this.config?.method ?? "GET").toUpperCase();
    const includeData = options?.includeResponseData === true;
    const includeHeaders = options?.includeResponseHeaders === true;
    const shape: OpenFetchErrorShape = {
      message: this.message,
      status: this.response?.status,
      url,
      method,
      code: this.code,
    };
    if (includeData) shape.data = this.response?.data;
    if (includeHeaders) shape.headers = this.response?.headers;
    return shape;
  }

  toJSON(): OpenFetchErrorShape {
    return this.toShape();
  }
}

export function isOpenFetchError(err: unknown): err is OpenFetchError {
  return err instanceof OpenFetchError;
}

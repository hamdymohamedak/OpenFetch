import { buildURL } from "../helpers/buildURL.js";
import type { OpenFetchConfig, OpenFetchResponse } from "../types/index.js";

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

  /** Plain object: `message`, `status`, `url`, `method`, `data`, `headers`, `code`. */
  toShape(): OpenFetchErrorShape {
    const url =
      this.request?.url ??
      resolveUrl(this.config) ??
      "";
    const method = (this.config?.method ?? "GET").toUpperCase();
    return {
      message: this.message,
      status: this.response?.status,
      url,
      method,
      data: this.response?.data,
      headers: this.response?.headers,
      code: this.code,
    };
  }

  toJSON(): OpenFetchErrorShape {
    return this.toShape();
  }
}

export function isOpenFetchError(err: unknown): err is OpenFetchError {
  return err instanceof OpenFetchError;
}

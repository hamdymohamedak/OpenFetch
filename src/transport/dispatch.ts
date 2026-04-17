import { OpenFetchError } from "../domain/error.js";
import type { OpenFetchConfig, OpenFetchResponse } from "../domain/types.js";
import { assertSafeHttpUrl } from "../shared/assertSafeHttpUrl.js";
import { buildURL } from "../shared/buildURL.js";
import { encodeBasicAuth } from "../shared/basicAuth.js";
import { mergeAbortSignals } from "../shared/mergeAbortSignals.js";
import { headersToRecord } from "../shared/responseHeaders.js";

const defaultValidateStatus = (status: number): boolean =>
  status >= 200 && status < 300;

function normalizeHeaders(h: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(h)) {
    out[k.toLowerCase()] = v;
  }
  return out;
}

async function parseBody(
  res: Response,
  responseType: OpenFetchConfig["responseType"]
): Promise<unknown> {
  if (responseType === "arraybuffer") return res.arrayBuffer();
  if (responseType === "blob") return res.blob();
  if (responseType === "text") return res.text();
  if (responseType === "stream") return res.body;

  if (responseType === "json") {
    const t = await res.text();
    if (!t.trim()) return null;
    try {
      return JSON.parse(t) as unknown;
    } catch {
      return t;
    }
  }

  const ct = res.headers.get("content-type");
  const asJson = ct?.includes("application/json") ?? false;
  if (asJson) {
    const t = await res.text();
    if (!t.trim()) return null;
    try {
      return JSON.parse(t) as unknown;
    } catch {
      return t;
    }
  }
  return res.text();
}

export type DispatchConfig = OpenFetchConfig & { url: string | URL };

export async function dispatch(
  config: DispatchConfig
): Promise<OpenFetchResponse> {
  const urlString = buildURL(config.url, config);
  if (config.assertSafeUrl === true) {
    assertSafeHttpUrl(urlString);
  }

  let headers = normalizeHeaders({ ...(config.headers ?? {}) });

  if (config.auth) {
    const token = encodeBasicAuth(config.auth.username, config.auth.password);
    headers["authorization"] = `Basic ${token}`;
  }

  let data: unknown =
    config.data !== undefined ? config.data : (config.body as unknown);

  for (const t of config.transformRequest ?? []) {
    data = await t(data, headers);
    headers = normalizeHeaders(headers);
  }

  let body: BodyInit | null | undefined = data as BodyInit | null | undefined;

  if (
    body !== undefined &&
    body !== null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(body)
  ) {
    if (!headers["content-type"]) {
      headers["content-type"] = "application/json";
    }
    body = JSON.stringify(body);
  }

  const credentials =
    config.withCredentials === true
      ? "include"
      : (config.credentials ?? undefined);

  const validateStatus = config.validateStatus ?? defaultValidateStatus;

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (config.timeout != null && config.timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), config.timeout);
  }

  const signal = mergeAbortSignals(config.signal ?? undefined, controller);

  try {
    const res = await fetch(urlString, {
      method: (config.method ?? "GET").toUpperCase(),
      headers,
      body: body === undefined ? undefined : body,
      signal,
      cache: config.cache,
      credentials,
      integrity: config.integrity,
      keepalive: config.keepalive,
      mode: config.mode,
      redirect: config.redirect,
      referrer: config.referrer,
      referrerPolicy: config.referrerPolicy,
    });

    const headerRecord = headersToRecord(res.headers);

    if (config.rawResponse === true) {
      const openResponse: OpenFetchResponse<Response> = {
        data: res,
        status: res.status,
        statusText: res.statusText,
        headers: headerRecord,
        config,
      };
      if (!validateStatus(res.status)) {
        throw new OpenFetchError(`Request failed with status ${res.status}`, {
          config,
          code: "ERR_BAD_RESPONSE",
          response: openResponse,
          request: { url: urlString },
        });
      }
      return openResponse;
    }

    let parsed: unknown;
    try {
      parsed = await parseBody(res, config.responseType);
    } catch {
      throw new OpenFetchError("Response could not be parsed", {
        config,
        code: "ERR_PARSE",
        request: { url: urlString },
      });
    }

    const openResponse: OpenFetchResponse = {
      data: parsed,
      status: res.status,
      statusText: res.statusText,
      headers: headerRecord,
      config,
    };

    if (!validateStatus(res.status)) {
      throw new OpenFetchError(`Request failed with status ${res.status}`, {
        config,
        code: "ERR_BAD_RESPONSE",
        response: openResponse,
        request: { url: urlString },
      });
    }

    let outData: unknown = openResponse.data;
    for (const tr of config.transformResponse ?? []) {
      outData = await tr(outData);
    }

    return {
      ...openResponse,
      data: outData,
    };
  } catch (e) {
    if (e instanceof OpenFetchError) throw e;
    const aborted =
      signal.aborted ||
      (typeof DOMException !== "undefined" &&
        e instanceof DOMException &&
        e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError");
    if (aborted) {
      throw new OpenFetchError("Request aborted", {
        config,
        code: "ERR_CANCELED",
        request: { url: urlString },
      });
    }
    const msg = e instanceof Error ? e.message : String(e);
    throw new OpenFetchError(msg, {
      config,
      code: "ERR_NETWORK",
      request: { url: urlString },
    });
  } finally {
    // Clear per-attempt timer so it cannot fire after completion (avoids dangling timers / leaks).
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

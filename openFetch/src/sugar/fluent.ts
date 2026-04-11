import { createClient } from "../core/client.js";
import type {
  Middleware,
  OpenFetchClient,
  OpenFetchConfig,
  OpenFetchResponse,
} from "../types/index.js";

function withJsonHint(
  data: unknown,
  config: OpenFetchConfig
): OpenFetchConfig {
  const headers = { ...(config.headers ?? {}) };
  const hasCt =
    Boolean(headers["content-type"]) || Boolean(headers["Content-Type"]);
  if (
    data !== undefined &&
    data !== null &&
    typeof data === "object" &&
    !(data instanceof FormData) &&
    !(data instanceof URLSearchParams) &&
    !(data instanceof Blob) &&
    !(data instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(data) &&
    !hasCt
  ) {
    headers["content-type"] = "application/json";
  }
  return { ...config, headers };
}

type MemoSnapshot = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  buf: ArrayBuffer;
  config: OpenFetchConfig;
};

type MemoState = { promise: Promise<MemoSnapshot> | null };

function inferBodyKind(
  headers: Record<string, string>
): "json" | "text" {
  const ct = (headers["content-type"] ?? "").toLowerCase();
  return ct.includes("application/json") ? "json" : "text";
}

async function parseBuffer(
  buf: ArrayBuffer,
  responseType: OpenFetchConfig["responseType"] | undefined,
  headerRecord: Record<string, string>
): Promise<unknown> {
  const rt =
    responseType ??
    (inferBodyKind(headerRecord) === "json" ? "json" : "text");

  if (rt === "arraybuffer") return buf.slice(0);
  if (rt === "blob") return new Blob([buf]);
  if (rt === "stream") {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(buf));
        controller.close();
      },
    });
  }

  const text = new TextDecoder().decode(buf);
  if (rt === "text") return text;
  if (rt === "json") {
    if (!text.trim()) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
  return text;
}

async function applyTransforms(
  data: unknown,
  transforms: OpenFetchConfig["transformResponse"]
): Promise<unknown> {
  let out: unknown = data;
  for (const tr of transforms ?? []) {
    out = await tr(out);
  }
  return out;
}

/**
 * Lazy builder: `.get()` / `.post()` only accumulate config. Each **terminal** method (`.json()`, `.text()`,
 * `.send()`, `.raw()`, …) starts **one new** HTTP request — calling two terminals is two requests, not one
 * shared `Response`, unless you use {@link RequestChain.memo}.
 *
 * **`.raw()` / `rawResponse`:** skips reading the body in the core adapter and skips `transformResponse`.
 * Client **response interceptors** still run; they see `OpenFetchResponse` with `data` set to the native
 * `Response`. Middleware that expects parsed/transformed `ctx.response.data` will not see transformed JSON.
 */
export type RequestChain = {
  get(config?: OpenFetchConfig): RequestChain;
  post(data?: unknown, config?: OpenFetchConfig): RequestChain;
  put(data?: unknown, config?: OpenFetchConfig): RequestChain;
  patch(data?: unknown, config?: OpenFetchConfig): RequestChain;
  delete(config?: OpenFetchConfig): RequestChain;
  head(config?: OpenFetchConfig): RequestChain;
  options(config?: OpenFetchConfig): RequestChain;
  /**
   * One HTTP round-trip shared across subsequent terminals on this chain (`json` + `text`, etc.).
   * Body is buffered once (as `ArrayBuffer`); not a general HTTP cache.
   */
  memo(): RequestChain;
  /** Parsed JSON body (`unwrapResponse` + `responseType: json`). */
  json<T = unknown>(): Promise<T>;
  /** Text body (`unwrapResponse` + `responseType: text`). */
  text(): Promise<string>;
  blob(): Promise<Blob>;
  arrayBuffer(): Promise<ArrayBuffer>;
  /** `unwrapResponse` + `responseType: stream` (body stream). */
  stream(): Promise<ReadableStream<Uint8Array> | null>;
  /** Native `Response` with an unread body (escape hatch). */
  raw(): Promise<Response>;
  /** Full `OpenFetchResponse` without unwrapping. */
  send<T = unknown>(): Promise<OpenFetchResponse<T>>;
};

function createRequestChain(
  base: OpenFetchClient,
  url: string | URL,
  config: OpenFetchConfig = {},
  memoState?: MemoState
): RequestChain {
  const next = (patch: OpenFetchConfig): RequestChain =>
    createRequestChain(base, url, { ...config, ...patch }, memoState);

  const methodOrGet = (): string =>
    (config.method ?? "GET").toUpperCase();

  function ensureMemoSnapshot(): Promise<MemoSnapshot> {
    if (!memoState) {
      throw new Error("openfetch: internal memo state missing");
    }
    let p = memoState.promise;
    if (!p) {
      p = (async (): Promise<MemoSnapshot> => {
        const full = (await base.request(url, {
          ...config,
          method: methodOrGet(),
          rawResponse: true,
          unwrapResponse: false,
        })) as OpenFetchResponse<Response>;
        const res = full.data;
        const buf = await res.arrayBuffer();
        return {
          status: full.status,
          statusText: full.statusText,
          headers: full.headers,
          buf,
          config: full.config,
        };
      })();
      memoState.promise = p;
    }
    return p;
  }

  const chain: RequestChain = {
    get(extra = {}) {
      return next({ ...extra, method: "GET" });
    },
    post(data?: unknown, extra = {}) {
      return createRequestChain(
        base,
        url,
        withJsonHint(data, { ...config, ...extra, method: "POST", data }),
        memoState
      );
    },
    put(data?: unknown, extra = {}) {
      return createRequestChain(
        base,
        url,
        withJsonHint(data, { ...config, ...extra, method: "PUT", data }),
        memoState
      );
    },
    patch(data?: unknown, extra = {}) {
      return createRequestChain(
        base,
        url,
        withJsonHint(data, { ...config, ...extra, method: "PATCH", data }),
        memoState
      );
    },
    delete(extra = {}) {
      return next({ ...extra, method: "DELETE" });
    },
    head(extra = {}) {
      return next({ ...extra, method: "HEAD" });
    },
    options(extra = {}) {
      return next({ ...extra, method: "OPTIONS" });
    },
    memo() {
      return createRequestChain(base, url, { ...config }, { promise: null });
    },
    json<T = unknown>() {
      if (memoState) {
        return (async () => {
          const snap = await ensureMemoSnapshot();
          let data = await parseBuffer(snap.buf, "json", snap.headers);
          data = await applyTransforms(data, snap.config.transformResponse);
          return data as T;
        })();
      }
      return base.request<T>(url, {
        ...config,
        method: methodOrGet(),
        responseType: "json",
        unwrapResponse: true,
      }) as Promise<T>;
    },
    text() {
      if (memoState) {
        return (async () => {
          const snap = await ensureMemoSnapshot();
          let data = await parseBuffer(snap.buf, "text", snap.headers);
          data = await applyTransforms(data, snap.config.transformResponse);
          return data as string;
        })();
      }
      return base.request<string>(url, {
        ...config,
        method: methodOrGet(),
        responseType: "text",
        unwrapResponse: true,
      }) as Promise<string>;
    },
    blob() {
      if (memoState) {
        return (async () => {
          const snap = await ensureMemoSnapshot();
          let data = await parseBuffer(snap.buf, "blob", snap.headers);
          data = await applyTransforms(data, snap.config.transformResponse);
          return data as Blob;
        })();
      }
      return base.request<Blob>(url, {
        ...config,
        method: methodOrGet(),
        responseType: "blob",
        unwrapResponse: true,
      }) as Promise<Blob>;
    },
    arrayBuffer() {
      if (memoState) {
        return (async () => {
          const snap = await ensureMemoSnapshot();
          let data = await parseBuffer(snap.buf, "arraybuffer", snap.headers);
          data = await applyTransforms(data, snap.config.transformResponse);
          return data as ArrayBuffer;
        })();
      }
      return base.request<ArrayBuffer>(url, {
        ...config,
        method: methodOrGet(),
        responseType: "arraybuffer",
        unwrapResponse: true,
      }) as Promise<ArrayBuffer>;
    },
    stream() {
      if (memoState) {
        return (async () => {
          const snap = await ensureMemoSnapshot();
          let data = await parseBuffer(snap.buf, "stream", snap.headers);
          data = await applyTransforms(data, snap.config.transformResponse);
          return data as ReadableStream<Uint8Array> | null;
        })();
      }
      return base.request<ReadableStream<Uint8Array> | null>(url, {
        ...config,
        method: methodOrGet(),
        responseType: "stream",
        unwrapResponse: true,
      }) as Promise<ReadableStream<Uint8Array> | null>;
    },
    raw() {
      if (memoState) {
        return (async () => {
          const snap = await ensureMemoSnapshot();
          const h = new Headers();
          for (const [k, v] of Object.entries(snap.headers)) {
            h.set(k, v);
          }
          return new Response(snap.buf.slice(0), {
            status: snap.status,
            statusText: snap.statusText,
            headers: h,
          });
        })();
      }
      return base.request<Response>(url, {
        ...config,
        method: methodOrGet(),
        rawResponse: true,
        unwrapResponse: true,
      }) as Promise<Response>;
    },
    send<T = unknown>() {
      if (memoState) {
        return (async () => {
          const snap = await ensureMemoSnapshot();
          const rt =
            snap.config.responseType ?? inferBodyKind(snap.headers);
          let data = await parseBuffer(snap.buf, rt, snap.headers);
          data = await applyTransforms(data, snap.config.transformResponse);
          const open: OpenFetchResponse<T> = {
            data: data as T,
            status: snap.status,
            statusText: snap.statusText,
            headers: snap.headers,
            config: snap.config,
          };
          return open;
        })();
      }
      return base.request<T>(url, {
        ...config,
        method: methodOrGet(),
        unwrapResponse: false,
      }) as Promise<OpenFetchResponse<T>>;
    },
  };

  return chain;
}

export type FluentOpenFetchClient = Omit<OpenFetchClient, "use"> & {
  (url: string | URL, config?: OpenFetchConfig): RequestChain;
  use: (fn: Middleware) => FluentOpenFetchClient;
};

/**
 * Like {@link createClient} plus a callable URL entrypoint for Wretch-style chaining:
 * `await fluent("/api").json()`, `fluent("/x").post(body).send()`.
 */
export function createFluentClient(
  initialDefaults: OpenFetchConfig = {}
): FluentOpenFetchClient {
  const base = createClient(initialDefaults);

  function invoke(url: string | URL, cfg?: OpenFetchConfig) {
    return createRequestChain(base, url, { ...(cfg ?? {}) });
  }

  const fluent = Object.assign(invoke, {
    defaults: base.defaults,
    interceptors: base.interceptors,
    use(fn: Middleware) {
      base.use(fn);
      return fluent;
    },
    request: base.request.bind(base),
    get: base.get.bind(base),
    post: base.post.bind(base),
    put: base.put.bind(base),
    patch: base.patch.bind(base),
    delete: base.delete.bind(base),
    head: base.head.bind(base),
    options: base.options.bind(base),
  }) as FluentOpenFetchClient;

  return fluent;
}

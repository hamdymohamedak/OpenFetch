import { InterceptorManager } from "../domain/interceptors.js";
import type {
  OpenFetchClient,
  OpenFetchConfig,
  OpenFetchResponse,
  RequestConfig,
} from "../domain/types.js";
import { mergeConfig } from "../shared/mergeConfig.js";
import { dispatch } from "../transport/dispatch.js";
import { applyMiddlewares } from "./middleware.js";

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

export function createClient(initialDefaults: OpenFetchConfig = {}): OpenFetchClient {
  const defaults = initialDefaults;
  const requestInterceptors = new InterceptorManager<OpenFetchConfig>();
  const responseInterceptors = new InterceptorManager<OpenFetchResponse>();

  async function run<T = unknown>(
    urlOrConfig: string | URL | RequestConfig,
    config?: OpenFetchConfig
  ): Promise<OpenFetchResponse<T> | T> {
    let merged: OpenFetchConfig;
    if (typeof urlOrConfig === "string" || urlOrConfig instanceof URL) {
      merged = mergeConfig(defaults, { ...config, url: urlOrConfig });
    } else {
      merged = mergeConfig(defaults, urlOrConfig);
    }

    if (merged.url === undefined || merged.url === "") {
      throw new Error("openfetch: `url` is required");
    }

    const afterRequest = await requestInterceptors.runRequest(merged);

    const ctx = {
      url: afterRequest.url as string | URL,
      request: afterRequest,
      response: null as OpenFetchResponse | null,
      error: null as unknown,
    };

    await applyMiddlewares(ctx, async () => {
      const cfg = ctx.request as OpenFetchConfig & {
        url: string | URL;
      };
      ctx.response = await dispatch(cfg);
    });

    // Stale ctx.error can remain from an earlier failed `next()` inside retry middleware; prefer a successful response.
    if (ctx.error != null && ctx.response == null) throw ctx.error;

    let response = ctx.response as OpenFetchResponse<T>;
    response = (await responseInterceptors.runResponse(
      response
    )) as OpenFetchResponse<T>;

    if (afterRequest.unwrapResponse) {
      return response.data;
    }
    return response;
  }

  const client: OpenFetchClient = {
    defaults,
    interceptors: {
      request: requestInterceptors,
      response: responseInterceptors,
    },
    request: run,
    get(url, config = {}) {
      return run(url, { ...config, method: "GET" });
    },
    post(url, data, config = {}) {
      return run(url, withJsonHint(data, { ...config, method: "POST", data }));
    },
    put(url, data, config = {}) {
      return run(url, withJsonHint(data, { ...config, method: "PUT", data }));
    },
    patch(url, data, config = {}) {
      return run(url, withJsonHint(data, { ...config, method: "PATCH", data }));
    },
    delete(url, config = {}) {
      return run(url, { ...config, method: "DELETE" });
    },
    head(url, config = {}) {
      return run(url, { ...config, method: "HEAD" });
    },
    options(url, config = {}) {
      return run(url, { ...config, method: "OPTIONS" });
    },
    use(fn) {
      if (!defaults.middlewares) defaults.middlewares = [];
      defaults.middlewares.push(fn);
      return client;
    },
  };

  return client;
}

/** Alias for {@link createClient}. */
export const create = createClient;

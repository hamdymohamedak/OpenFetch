import { validateJsonWithStandardSchema } from "../domain/validateJsonSchema.js";
import { createClient } from "../runtime/client.js";
function withJsonHint(data, config) {
    const headers = { ...(config.headers ?? {}) };
    const hasCt = Boolean(headers["content-type"]) || Boolean(headers["Content-Type"]);
    if (data !== undefined &&
        data !== null &&
        typeof data === "object" &&
        !(data instanceof FormData) &&
        !(data instanceof URLSearchParams) &&
        !(data instanceof Blob) &&
        !(data instanceof ArrayBuffer) &&
        !ArrayBuffer.isView(data) &&
        !hasCt) {
        headers["content-type"] = "application/json";
    }
    return { ...config, headers };
}
function inferBodyKind(headers) {
    const ct = (headers["content-type"] ?? "").toLowerCase();
    return ct.includes("application/json") ? "json" : "text";
}
async function parseBuffer(buf, responseType, headerRecord) {
    const rt = responseType ??
        (inferBodyKind(headerRecord) === "json" ? "json" : "text");
    if (rt === "arraybuffer")
        return buf.slice(0);
    if (rt === "blob")
        return new Blob([buf]);
    if (rt === "stream") {
        return new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array(buf));
                controller.close();
            },
        });
    }
    const text = new TextDecoder().decode(buf);
    if (rt === "text")
        return text;
    if (rt === "json") {
        if (!text.trim())
            return null;
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    }
    return text;
}
async function applyTransforms(data, transforms) {
    let out = data;
    for (const tr of transforms ?? []) {
        out = await tr(out);
    }
    return out;
}
function createRequestChain(base, url, config = {}, memoState) {
    const next = (patch) => createRequestChain(base, url, { ...config, ...patch }, memoState);
    const methodOrGet = () => (config.method ?? "GET").toUpperCase();
    function ensureMemoSnapshot() {
        if (!memoState) {
            throw new Error("openfetch: internal memo state missing");
        }
        let p = memoState.promise;
        if (!p) {
            p = (async () => {
                const full = (await base.request(url, {
                    ...config,
                    method: methodOrGet(),
                    rawResponse: true,
                    unwrapResponse: false,
                }));
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
    const chain = {
        get(extra = {}) {
            return next({ ...extra, method: "GET" });
        },
        post(data, extra = {}) {
            return createRequestChain(base, url, withJsonHint(data, { ...config, ...extra, method: "POST", data }), memoState);
        },
        put(data, extra = {}) {
            return createRequestChain(base, url, withJsonHint(data, { ...config, ...extra, method: "PUT", data }), memoState);
        },
        patch(data, extra = {}) {
            return createRequestChain(base, url, withJsonHint(data, { ...config, ...extra, method: "PATCH", data }), memoState);
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
        json(schema) {
            if (memoState) {
                return (async () => {
                    const snap = await ensureMemoSnapshot();
                    let data = await parseBuffer(snap.buf, "json", snap.headers);
                    if (schema !== undefined) {
                        data = await validateJsonWithStandardSchema(data, schema);
                    }
                    else if (snap.config.jsonSchema != null) {
                        data = await validateJsonWithStandardSchema(data, snap.config.jsonSchema);
                    }
                    data = await applyTransforms(data, snap.config.transformResponse);
                    return data;
                })();
            }
            return base.request(url, {
                ...config,
                method: methodOrGet(),
                responseType: "json",
                unwrapResponse: true,
                ...(schema !== undefined ? { jsonSchema: schema } : {}),
            });
        },
        text() {
            if (memoState) {
                return (async () => {
                    const snap = await ensureMemoSnapshot();
                    let data = await parseBuffer(snap.buf, "text", snap.headers);
                    data = await applyTransforms(data, snap.config.transformResponse);
                    return data;
                })();
            }
            return base.request(url, {
                ...config,
                method: methodOrGet(),
                responseType: "text",
                unwrapResponse: true,
            });
        },
        blob() {
            if (memoState) {
                return (async () => {
                    const snap = await ensureMemoSnapshot();
                    let data = await parseBuffer(snap.buf, "blob", snap.headers);
                    data = await applyTransforms(data, snap.config.transformResponse);
                    return data;
                })();
            }
            return base.request(url, {
                ...config,
                method: methodOrGet(),
                responseType: "blob",
                unwrapResponse: true,
            });
        },
        arrayBuffer() {
            if (memoState) {
                return (async () => {
                    const snap = await ensureMemoSnapshot();
                    let data = await parseBuffer(snap.buf, "arraybuffer", snap.headers);
                    data = await applyTransforms(data, snap.config.transformResponse);
                    return data;
                })();
            }
            return base.request(url, {
                ...config,
                method: methodOrGet(),
                responseType: "arraybuffer",
                unwrapResponse: true,
            });
        },
        stream() {
            if (memoState) {
                return (async () => {
                    const snap = await ensureMemoSnapshot();
                    let data = await parseBuffer(snap.buf, "stream", snap.headers);
                    data = await applyTransforms(data, snap.config.transformResponse);
                    return data;
                })();
            }
            return base.request(url, {
                ...config,
                method: methodOrGet(),
                responseType: "stream",
                unwrapResponse: true,
            });
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
            return base.request(url, {
                ...config,
                method: methodOrGet(),
                rawResponse: true,
                unwrapResponse: true,
            });
        },
        send() {
            if (memoState) {
                return (async () => {
                    const snap = await ensureMemoSnapshot();
                    const rt = snap.config.responseType ?? inferBodyKind(snap.headers);
                    let data = await parseBuffer(snap.buf, rt, snap.headers);
                    if (snap.config.jsonSchema != null) {
                        data = await validateJsonWithStandardSchema(data, snap.config.jsonSchema);
                    }
                    data = await applyTransforms(data, snap.config.transformResponse);
                    const open = {
                        data: data,
                        status: snap.status,
                        statusText: snap.statusText,
                        headers: snap.headers,
                        config: snap.config,
                    };
                    return open;
                })();
            }
            return base.request(url, {
                ...config,
                method: methodOrGet(),
                unwrapResponse: false,
            });
        },
    };
    return chain;
}
/**
 * Like {@link createClient} plus a callable URL entrypoint for Wretch-style chaining:
 * `await fluent("/api").json()`, `fluent("/x").post(body).send()`.
 */
export function createFluentClient(initialDefaults = {}) {
    const base = createClient(initialDefaults);
    function invoke(url, cfg) {
        return createRequestChain(base, url, { ...(cfg ?? {}) });
    }
    const fluent = Object.assign(invoke, {
        defaults: base.defaults,
        interceptors: base.interceptors,
        use(fn) {
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
    });
    return fluent;
}

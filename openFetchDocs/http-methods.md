# HTTP methods

openFetch maps each helper to `fetch` with merged defaults, interceptors, and middleware. All paths below assume a client `api` from `createClient({ baseURL: "https://api.example.com" })`.

## Return type

- **`unwrapResponse: false`** (default): `Promise<OpenFetchResponse<T>>` with `{ data, status, statusText, headers, config }`.
- **`unwrapResponse: true`**: `Promise<T>` — only the parsed body (`data`).

You can set `unwrapResponse` on the client defaults or override per request via the optional `config` argument.

---

## GET

**Signature:** `get(url, config?)`

Use for safe, cacheable reads. Query string comes from **`params`** (merged into the URL).

```ts
// /v1/items?page=2&tag=news
const res = await api.get("/v1/items", {
  params: { page: 2, tag: "news" },
});

// With unwrapResponse on the client:
const items = await api.get<Item[]>("/v1/items");
```

**HEAD / OPTIONS** use the same pattern: `head(url, config?)`, `options(url, config?)`.

---

## POST

**Signature:** `post(url, data?, config?)`

- **`data`** is optional. Plain objects (not `FormData`, `Blob`, etc.) are JSON-serialized and get `content-type: application/json` if you did not set a Content-Type header.
- You may omit `data` and set `body` / headers in `config` instead.

```ts
const created = await api.post(
  "/v1/posts",
  { title: "Hello", body: "…" },
  { headers: { "Idempotency-Key": "uuid-here" } }
);
```

### JSON

```ts
await api.post("/v1/login", { email, password });
```

### FormData (multipart or `application/x-www-form-urlencoded`)

```ts
const fd = new FormData();
fd.append("file", fileBlob, "photo.jpg");
await api.post("/v1/upload", fd);
// FormData skips automatic JSON; do not set JSON content-type unless you intend to.
```

### URL-encoded without FormData

```ts
const body = new URLSearchParams({ user: "a", token: "b" });
await api.post("/v1/token", body, {
  headers: { "content-type": "application/x-www-form-urlencoded" },
});
```

---

## PUT

**Signature:** `put(url, data?, config?)`

Same serialization rules as POST. Typical use: replace a resource.

```ts
await api.put("/v1/users/me", { name: "Ada", theme: "dark" });
```

---

## PATCH

**Signature:** `patch(url, data?, config?)`

Same as PUT for serialization; semantically for partial updates.

```ts
await api.patch("/v1/users/me", { theme: "light" });
```

---

## DELETE

**Signature:** `delete(url, config?)`

No `data` positional argument; pass payload via **`config.data`** or **`config.body`** if your API requires a body (some APIs use JSON DELETE bodies).

```ts
await api.delete("/v1/posts/42");

await api.delete("/v1/posts/bulk", {
  data: { ids: [1, 2, 3] },
});
```

---

## Low-level: `request`

**Signatures:**

- `request(url, config?)` — string or `URL` plus overrides.
- `request(config)` — full `RequestConfig` including `url`.

Use when you build the config dynamically or need a method not wrapped by a helper:

```ts
await api.request({
  url: "/v1/reports/export",
  method: "POST",
  responseType: "blob",
  headers: { Accept: "application/pdf" },
});
```

---

## Per-request overrides

Any call can pass a final `config` object with `timeout`, `signal`, `headers`, `unwrapResponse`, `validateStatus`, `middlewares`, `retry`, `memoryCache`, etc. See [Configuration](./configuration.md).

```ts
const row = await api.get("/v1/rows/1", {
  timeout: 2_000,
  signal: controller.signal,
  unwrapResponse: true,
});
```

---

## Next

- [React & Vue](./framework-guides.md)  
- [Configuration](./configuration.md)  
- [Errors & security](./errors-security.md) — failed status codes and parsing errors

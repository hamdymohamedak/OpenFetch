# طرق HTTP

يربط openFetch كل مساعد بـ `fetch` مع دمج الافتراضيات والمعترضات والوسيط. المثال أدناه يفترض `api` من `createClient({ baseURL: "https://api.example.com" })`.

## نوع الإرجاع

- **`unwrapResponse: false`** (الافتراضي): `Promise<OpenFetchResponse<T>>` يحتوي `{ data, status, statusText, headers, config }`.
- **`unwrapResponse: true`**: `Promise<T>` — الجسم المفسَّر فقط.

يمكن ضبط `unwrapResponse` على العميل أو لكل طلب عبر كائن `config` الاختياري.

---

## GET

**التوقيع:** `get(url, config?)`

للقراءات الآمنة. سلسلة الاستعلام تُبنى من **`params`**.

```ts
const res = await api.get("/v1/items", {
  params: { page: 2, tag: "news" },
});
```

**HEAD** و**OPTIONS** بنفس النمط: `head(url, config?)`، `options(url, config?)`.

---

## POST

**التوقيع:** `post(url, data?, config?)`

- **`data`** اختياري. الكائنات العادية (وليست `FormData` أو `Blob`…) تُسلسل JSON ويُضاف `content-type: application/json` إن لم تضبط رأس Content-Type.
- يمكن حذف `data` واستخدام `body` / الرؤوس في `config`.

```ts
await api.post("/v1/posts", { title: "مرحبا", body: "…" });
```

### FormData

```ts
const fd = new FormData();
fd.append("file", fileBlob, "photo.jpg");
await api.post("/v1/upload", fd);
```

---

## PUT

**التوقيع:** `put(url, data?, config?)`

نفس قواعد التسلسل مثل POST. غالباً لاستبدال مورد بالكامل.

```ts
await api.put("/v1/users/me", { name: "آدم", theme: "dark" });
```

---

## PATCH

**التوقيع:** `patch(url, data?, config?)`

مثل PUT من ناحية التسلسل؛ دلالياً للتحديثات الجزئية.

```ts
await api.patch("/v1/users/me", { theme: "light" });
```

---

## DELETE

**التوقيع:** `delete(url, config?)`

لا وسيط `data`؛ مرّر الحمولة عبر **`config.data`** أو **`config.body`** إن احتاجت واجهتك جسم DELETE.

```ts
await api.delete("/v1/posts/42");
await api.delete("/v1/posts/bulk", { data: { ids: [1, 2, 3] } });
```

---

## المستوى الأدنى: `request`

- `request(url, config?)`
- `request(config)` مع `url` داخل الكائن.

```ts
await api.request({
  url: "/v1/reports/export",
  method: "POST",
  responseType: "blob",
});
```

---

## تجاوزات لكل طلب

أي استدعاء يمكن أن يمرّر `timeout`، `signal`، `headers`، `unwrapResponse`، `validateStatus`، `middlewares`، `retry`، `memoryCache`، إلخ. راجع [الإعدادات](./configuration.md).

---

## التالي

- [React و Vue](./framework-guides.md)  
- [الإعدادات](./configuration.md)  
- [الأخطاء والأمان](./errors-security.md)

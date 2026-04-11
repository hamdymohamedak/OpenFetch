# إعادة المحاولة والتخزين المؤقت في الذاكرة

## إعادة المحاولة — `createRetryMiddleware`

تُرجع المصنع **وسيطاً** يستدعي `next()` عدة مرات عند الأعطال القابلة لإعادة المحاولة مع **تراجع أسي** وعشوائية بسيطة.

### الخيارات (الافتراضيات + `ctx.request.retry`)

| الخيار | الافتراضي | الوصف |
|--------|-----------|--------|
| `maxAttempts` | `3` | إجمالي المحاولات بما فيها الأولى |
| `baseDelayMs` | `300` | تأخير أساسي قبل أول إعادة |
| `maxDelayMs` | `30000` | سقف التأخير |
| `factor` | `2` | مضاعف أسي |
| `retryOnStatus` | `[408,429,500,502,503,504]` | حالات HTTP لإعادة المحاولة عند فشل `validateStatus` |
| `retryOnNetworkError` | `true` | إعادة `ERR_NETWORK` / `ERR_PARSE` عند السماح |
| `retryNonIdempotentMethods` | `false` | إن `false`، فقط **GET, HEAD, OPTIONS, TRACE** تُعاد لأخطاء الشبكة/التحليل/الحالة القابلة لإعادة المحاولة |
| `shouldRetry` | — | `(error, attempt) => boolean` اختياري بعد الفحوصات المدمجة |

**الطلبات الملغاة** (`ERR_CANCELED`) **لا** تُعاد.

### POST / PUT / آثار جانبية

افتراضياً، طرق التعديل **لا** تُعاد لأخطاء الشبكة أو HTTP القابلة لإعادة المحاولة لتجنب تكرار الآثار الجانبية. للموافقة:

```ts
retry: { retryNonIdempotentMethods: true }
```

(على افتراضيات العميل أو لكل طلب).

## التخزين المؤقت في الذاكرة — `MemoryCacheStore` + `createCacheMiddleware`

### المخزن

```ts
const store = new MemoryCacheStore({ maxEntries: 500 });
```

- **`maxEntries`** — عند الامتلاء تُزال **الأقدم** (ترتيب إدخال `Map`). الافتراضي `500`.

### الوسيط

```ts
createCacheMiddleware(store, {
  ttlMs: 60_000,
  staleWhileRevalidateMs: 0,
  methods: ["GET", "HEAD"],
  key: ({ request, url }) => `…`,
  varyHeaderNames: ["authorization", "cookie"],
});
```

- الطرق **المضبوطة** فقط (الافتراض **GET**، **HEAD**).
- يتخطى القراءة/الكتابة عندما **`memoryCache.skip`** على الطلب `true`.
- **`memoryCache.ttlMs`** و **`memoryCache.staleWhileRevalidateMs`** لكل طلب تغلبان افتراضيات المصنع عند الضبط.

### مفتاح التخزين

المفتاح الافتراضي: ``METHOD fullUrl`` (بعد `buildURL`).

للاستجابات **المصادق عليها**، أدرج الرؤوس في المفتاح:

```ts
varyHeaderNames: ["authorization", "cookie"]
```

أو استخدم **`key`** مخصصاً و **`appendCacheKeyVaryHeaders`**.

### Stale-while-revalidate

إن **`staleWhileRevalidateMs` > 0**، بعد انتهاء TTL يمكن تقديم نسخة قديمة وتشغيل **`dispatch` خلفية** مع `memoryCache.skip: true` للتحديث.

## التالي

- [الأخطاء والأمان](./errors-security.md)

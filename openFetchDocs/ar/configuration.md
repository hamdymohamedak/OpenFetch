# الإعدادات

يُدمج الإعداد من **افتراضيات العميل** و**خيارات كل استدعاء** عبر `mergeConfig` (انظر قواعد الدمج أدناه).

## `OpenFetchConfig` (الطلب)

### العنوان وسلسلة الاستعلام

- **`url`** — مطلق أو نسبي (مع `baseURL`).
- **`baseURL`** — يُسبق للمسارات غير المطلقة.
- **`params`** — كائن عادي يُسلسل كسلسلة استعلام (يمكن استبدال المسلسل بـ **`paramsSerializer`**).

### الطريقة والجسم

- **`method`** — طريقة HTTP؛ المساعدات تضبطها تلقائياً.
- **`data`** — الحمولة المنطقية: بعد خطافات **`transformRequest`**، تُسلسل الكائنات (ما عدا `FormData`، `URLSearchParams`، `Blob`، `ArrayBuffer`، المصفوفات المشاهَدة) كـ JSON؛ يُضبط `content-type` على `application/json` إن كان ناقصاً.
- **`body`** — جسم `fetch` الخام عند عدم استخدام `data` بنفس الطريقة؛ يستخدم `dispatch` قيمة `data` إن وُجدت وإلا `body`.

### الرؤوس والمصادقة

- **`headers`** — `Record<string, string>` (تُطبَّع المفاتيح إلى أحرف صغيرة داخلياً للطلب الصادر).
- **`auth`** — `{ username, password }` → `Authorization: Basic …`.
- **`withCredentials: true`** — يضبط `credentials: 'include'` ما لم يُضبط **`credentials`** صراحة.

### المهلات والإلغاء

- **`timeout`** — بالمللي ثانية؛ يستخدم `AbortController` داخلياً يُدمج مع **`signal`** عبر `mergeAbortSignals`.
- **`signal`** — `AbortSignal` خارجي؛ يُدمج مع مهلة الإلغاء.

### معالجة الاستجابة

- **`responseType`** — `"json"` | `"text"` | `"arraybuffer"` | `"blob"` | `"stream"`.  
  إن وُجد، يستنتج JSON من `Content-Type: application/json`، وإلا يُقرأ كنص.
- **`validateStatus`** — `(status: number) => boolean`. الافتراضي: 200–299. إن رجع `false`، يُرمى **`OpenFetchError`** برمز `ERR_BAD_RESPONSE` مع إرفاق الاستجابة.

### التحويلات

- **`transformRequest`** — مصفوفة `(data, headers) => unknown` تُنفَّذ بالترتيب قبل بناء جسم `fetch`.
- **`transformResponse`** — مصفوفة `(data) => T` على الاستجابات الناجحة بعد التحليل.

### الوسيط وإعادة المحاولة وتلميحات التخزين المؤقت

- **`middlewares`** — مصفوفة دوال وسيط (تُلحق بالافتراضيات).
- **`retry`** — دمج سطحي لخيارات `createRetryMiddleware` (افتراضيات + لكل طلب).
- **`memoryCache`** — تجاوزات لكل طلب لوسيط التخزين المؤقت: `ttlMs`، `staleWhileRevalidateMs`، `skip`.

### مريحة الاستخدام

- **`unwrapResponse`** — عند `true`، تُرجع `get`/`post`/… **`data` فقط** بدلاً من `OpenFetchResponse` الكامل. مفيد لـ RSC.

### تمرير `RequestInit`

تُمرَّر هذه الحقول إلى `fetch`:  
`cache`، `credentials`، `integrity`، `keepalive`، `mode`، `redirect`، `referrer`، `referrerPolicy`.

## `OpenFetchResponse`

```ts
type OpenFetchResponse<T = unknown> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: OpenFetchConfig;
};
```

## سلوك الدمج (`mergeConfig`)

- المفاتيح على المستوى الأعلى: الإعداد الأحدث يغلب.
- **`headers`**: دمج سطحي؛ رؤوس الاستدعاء تغلب الافتراضيات.
- **`middlewares`**، **`transformRequest`**، **`transformResponse`**: **تُلحق** (الافتراضيات أولاً ثم الخاصة بالاستدعاء).
- **`retry`**، **`memoryCache`**: دمج سطحي للكائنات.
- تُزال مفاتيح تلوث النموذج الأولي (`__proto__`، `constructor`، `prototype`) من الكائنات المدمجة والرؤوس / `retry` / `memoryCache` المتداخلة.

## التالي

- [المعترضات والوسيط](./interceptors-middleware.md)

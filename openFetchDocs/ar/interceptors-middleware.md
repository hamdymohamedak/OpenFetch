# المعترضات والوسيط

## دورة حياة الطلب (مختصر)

1. دمج **الافتراضيات** + إعداد الاستدعاء.  
2. تشغيل **معترضات الطلب** على الإعداد.  
3. بناء **`OpenFetchContext`** (`url`، `request`، `response`، `error`).  
4. تشغيل مكدس **الوسيط**؛ الطبقة الداخلية تستدعي **`dispatch`** (`fetch` + تحليل + `validateStatus` + تحويلات الاستجابة).  
5. تشغيل **معترضات الاستجابة** على الاستجابة الناجحة.  
6. إرجاع الاستجابة الكاملة أو `data` إن وُجد `unwrapResponse`.

راجع `openFetch/docs/PROJECT_FLOW.md` في مستودع الحزمة للمخطط.

## المعترضات

كل عميل يوفّر:

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

**الترتيب:**

- **الطلب:** تُنفَّذ المعالجات **آخر تسجيل أولاً** (LIFO).
- **الاستجابة:** **أول تسجيل أولاً** (FIFO).

## الوسيط

```ts
type Middleware = (
  ctx: OpenFetchContext,
  next: NextFn
) => Promise<void>;
```

- **`ctx.request`** — الإعداد النهائي المدمج لهذه الجولة.  
- **`ctx.response`** — يضبطه `dispatch` (أو وسيط) عند النجاح.  
- **`ctx.error`** — عند الفشل؛ يعيد العميل الرمي إن لم يبقَ `response` بعد المكدس.

التسجيل:

```ts
client.use(async (ctx, next) => {
  await next();
});
```

`client.use` **يدفع** إلى `defaults.middlewares`.

### الترتيب

الوسيط الخارجي يعمل أولاً عند الدخول. **الترتيب مهم** للتخزين المقابل لإعادة المحاولة — راجع [إعادة المحاولة والتخزين المؤقت](./retry-cache.md).

## مصانع الوسيط المدمجة

- **`createRetryMiddleware(options?)`**  
- **`createCacheMiddleware(store, options?)`**

## التالي

- [إعادة المحاولة والتخزين المؤقت](./retry-cache.md)  
- [الأخطاء والأمان](./errors-security.md)

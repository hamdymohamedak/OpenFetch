# openFetch

**@hamdymohamedak/openfetch** عميل HTTP صغير بلا تبعيات لأي بيئة JavaScript توفر واجهة [`fetch`](https://developer.mozilla.org/ar/docs/Web/API/Fetch_API) القياسية. يوفّر مثيلات بقيم افتراضية، **معترضات** للطلب/الاستجابة، **وسيطاً** قابلاً للتجميع، **إعادة محاولة** اختيارية مع تراجع أسي، **تخزيناً مؤقتاً في الذاكرة** لطلبات GET/HEAD، **أخطاء** منظمة، و**حارس URL** اختياري للروابط غير الموثوقة — دون ربطك بـ React أو `window` أو XHR القديم.

## المصدر والحزمة

- **GitHub:** [openfetch-js/OpenFetch](https://github.com/openfetch-js/OpenFetch) — الشفرة، المشاكل، والمساهمة  
- **npm:** [@hamdymohamedak/openfetch](https://www.npmjs.com/package/@hamdymohamedak/openfetch) — تثبيت الحزمة المنشورة  

## أهداف التصميم

- **نقل واحد:** `fetch` فقط (Node 18+، Bun، Deno، Workers، المتصفحات).
- **لا حاجة لمكملات إلزامية** في البيئات المدعومة.
- **آمن على الخادم:** مناسب لـ SSR ومكوّنات React Server.

## صفحات التوثيق

1. [البدء](./getting-started.md) — التثبيت، التصدير الافتراضي، `createClient`، أول طلبات  
2. [طرق HTTP](./http-methods.md) — GET وPOST وPUT وPATCH وDELETE و`request()` والأجسام ومعاملات الاستعلام  
3. [React و Vue](./framework-guides.md) — الخطافات، التركيبات، العملاء المشتركون، ملاحظات RSC  
4. [الإعدادات](./configuration.md) — خيارات الطلب الكاملة، شكل الاستجابة، `unwrapResponse`  
5. [المعترضات والوسيط](./interceptors-middleware.md) — ترتيب التنفيذ، `use()`، وسيط مخصص  
6. [إعادة المحاولة والتخزين المؤقت](./retry-cache.md) — `createRetryMiddleware`، `createCacheMiddleware`، TTL / SWR  
7. [الأخطاء والأمان](./errors-security.md) — `OpenFetchError`، الرموز، التسجيل الآمن، `assertSafeHttpUrl`  

## واجهة برمجة التطبيقات العامة (ملخص)

| التصدير | الدور |
|---------|--------|
| **الافتراضي** | مثيل جاهز من `createClient()` |
| `createClient` / `create` | عميل جديد مع `initialDefaults` اختيارية |
| `OpenFetchError`، `isOpenFetchError` | أخطاء مُنمّاة + حارس النوع |
| `InterceptorManager` | مكدس المعترضات (عادة عبر `client.interceptors`) |
| `createRetryMiddleware` | مصنع وسيط إعادة المحاولة |
| `MemoryCacheStore`، `createCacheMiddleware`، `appendCacheKeyVaryHeaders` | تخزين مؤقت في الذاكرة |
| الأنواع | `OpenFetchConfig`، `OpenFetchResponse`، `Middleware`، `OpenFetchClient`، إلخ. |
| `assertSafeHttpUrl` | حارس اختياري على نمط SSRF لعناوين IP الحرفية / localhost |

## المتطلبات

**Node.js 18+** أو أي بيئة فيها `fetch` و`AbortController`.

## لغات أخرى

تصفح [كل الترجمات](/languages/).

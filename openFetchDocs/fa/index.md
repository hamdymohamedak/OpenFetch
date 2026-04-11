# openFetch — فارسی (fa)

> متن راهنما از چپ‌به‌راست (LTR) برای بلوک‌های کد حفظ شده است؛ عناوین و توضیحات فارسی را می‌توانید در مرورگر یا ویرایگر با جهت RTL بخوانید.

**@hamdymohamedak/openfetch** یک کلاینت HTTP سبک و بدون وابستگی برای هر محیط اجرای JavaScript است که [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) استاندارد دارد. نمونه با پیش‌فرض، **قطع‌کننده‌های** درخواست/پاسخ، **میان‌افزار** ترکیب‌پذیر، **تلاش مجدد** با عقب‌نشینی نمایی، **حافظهٔ نهان** برای GET/HEAD، **خطاهای** ساخت‌یافته و **محافظ اختیاری URL** برای ورودی غیرقابل‌اعتماد ارائه می‌دهد — بدون وابستگی به React، `window` یا XHR قدیمی.

## اهداف طراحی

- **فقط `fetch`** (Node 18+، Bun، Deno، Workers، مرورگر).
- **بدون polyfill اجباری** در محیط‌های پشتیبانی‌شده.
- **مناسب سرور:** SSR و React Server Components.

## صفحات

1. [شروع سریع](./getting-started.md)  
2. [پیکربندی](./configuration.md)  
3. [قطع‌کننده‌ها و میان‌افزار](./interceptors-middleware.md)  
4. [تلاش مجدد و حافظهٔ نهان](./retry-cache.md)  
5. [خطا و امنیت](./errors-security.md)  

## API عمومی (خلاصه)

| صادرات | نقش |
|--------|-----|
| **default** | نمونهٔ از پیش ساخته‌شده با `createClient()` |
| `createClient` / `create` | کلاینت جدید |
| `OpenFetchError`, `isOpenFetchError` | خطای نوع‌دار |
| `InterceptorManager` | پشتهٔ قطع‌کننده |
| `createRetryMiddleware` | کارخانهٔ میان‌افزار تلاش مجدد |
| `MemoryCacheStore`, `createCacheMiddleware`, `appendCacheKeyVaryHeaders` | حافظهٔ نهان |
| انواع | `OpenFetchConfig`, `OpenFetchResponse`, … |
| `assertSafeHttpUrl` | محافظ اختیاری شبیه SSRF برای IP تحت‌اللفظ / localhost |

## نیازمندی

**Node.js 18+** یا هر زمان‌اجرایی با `fetch` و `AbortController`.

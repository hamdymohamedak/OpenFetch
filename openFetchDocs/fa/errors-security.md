# خطا و امنیت

## `OpenFetchError`

فیلدها: `code`, `config?`, `response?`, `request?`. کدهای رایج: `ERR_BAD_RESPONSE`, `ERR_NETWORK`, `ERR_PARSE`, `ERR_CANCELED`.

## `isOpenFetchError`

نگهبان نوع.

## `toShape()` / `toJSON()`

در شکل سریال‌شده، `config.auth` حذف می‌شود؛ خود نمونه ممکن است راز داشته باشد.

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

## `assertSafeHttpUrl(url)`

محافظ اختیاری سمت سرور وقتی URL از ورودی غیرقابل‌اعتماد است. فقط `http:`/`https:`؛ مسدود کردن localhost و IP تحت‌اللفظ خصوصی/حلقه. **DNS rebinding** را برطرف نمی‌کند.

## نهان‌گاه و احراز

[تلاش مجدد و حافظهٔ نهان](./retry-cache.md) — `varyHeaderNames` یا `key` سفارشی.

## بیشتر

`SECURITY.md` و `npm run test:security` در مخزن بسته.

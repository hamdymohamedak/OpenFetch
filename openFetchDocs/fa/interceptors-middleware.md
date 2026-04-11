# قطع‌کننده‌ها و میان‌افزار

## چرخهٔ کوتاه

1. ادغام پیکربندی  
2. قطع‌کننده‌های **درخواست**  
3. `OpenFetchContext`  
4. **میان‌افزار** → `dispatch` (`fetch`)  
5. قطع‌کننده‌های **پاسخ**  
6. برگرداندن پاسخ کامل یا فقط `data` با `unwrapResponse`

## قطع‌کننده‌ها

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

- **درخواست:** آخرین ثبت‌شده **اول** اجرا می‌شود (LIFO).  
- **پاسخ:** اولین ثبت‌شده **اول** (FIFO).

## میان‌افزار

`client.use(fn)` به `defaults.middlewares` **push** می‌کند. **ترتیب مهم است** (نهان‌گاه در برابر تلاش مجدد).

## کارخانه‌های داخلی

`createRetryMiddleware`, `createCacheMiddleware` — [تلاش مجدد و حافظهٔ نهان](./retry-cache.md).

## بعدی

- [تلاش مجدد و حافظهٔ نهان](./retry-cache.md)  
- [خطا و امنیت](./errors-security.md)

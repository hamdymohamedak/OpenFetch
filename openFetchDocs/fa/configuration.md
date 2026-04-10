# پیکربندی

**پیش‌فرضهای کلاینت** و گزینه‌های **هر فراخوانی** با `mergeConfig` ادغام می‌شوند.

## `OpenFetchConfig`

- **URL:** `url`, `baseURL`, `params`, `paramsSerializer`
- **بدنه:** `method`, `data`, `body` — پس از `transformRequest`، اشیاء (به‌جز انواع مستثنی) JSON می‌شوند
- **سرصفحه/احراز:** `headers`, `auth`, `withCredentials`, `credentials`
- **لغو:** `timeout`, `signal`
- **پاسخ:** `responseType`, `validateStatus` (پیش‌فرض ۲۰۰–۲۹۹)
- **تبدیل:** `transformRequest[]`, `transformResponse[]`
- **میان‌افزار/تلاش مجدد/نهان‌گاه:** `middlewares`, `retry`, `memoryCache`
- **راحتی:** `unwrapResponse` — در صورت true فقط **`data`**
- **`RequestInit`:** `cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`

## `OpenFetchResponse`

`data`, `status`, `statusText`, `headers`, `config`.

## ادغام

- `headers`: ادغام سطحی.  
- `middlewares`, `transformRequest`, `transformResponse`: **الحاق** (ابتدا پیش‌فرضها).  
- `retry`, `memoryCache`: ادغام سطحی.  
- حذف کلیدهای آلودگی نمونهٔ اولیه.

## بعدی

- [قطع‌کننده‌ها و میان‌افزار](./interceptors-middleware.md)

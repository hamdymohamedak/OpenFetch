# Configurazione

Merge tra **default del client** e opzioni **per chiamata** (`mergeConfig`).

## `OpenFetchConfig`

- **URL:** `url`, `baseURL`, `params`, `paramsSerializer`
- **Corpo:** `method`, `data`, `body` — dopo `transformRequest`, oggetti → JSON salvo tipi esclusi
- **Header/auth:** `headers`, `auth`, `withCredentials`, `credentials`
- **Timeout/abort:** `timeout`, `signal`
- **Risposta:** `responseType`, `validateStatus` (default 200–299)
- **Trasformazioni:** `transformRequest[]`, `transformResponse[]`
- **Middleware/retry/cache:** `middlewares`, `retry`, `memoryCache`
- **Comodità:** `unwrapResponse`
- **`RequestInit`:** `cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`

## `OpenFetchResponse`

`data`, `status`, `statusText`, `headers`, `config`.

## Merge

- Header: merge superficiale.  
- `middlewares`, `transformRequest`, `transformResponse`: **concatenati**.  
- `retry`, `memoryCache`: merge superficiale.  
- Rimozione chiavi pericolose (prototype pollution).

## Prossimo

- [Intercettori e middleware](./interceptors-middleware.md)

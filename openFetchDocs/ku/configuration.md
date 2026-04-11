# Veavakirin

**Defaultên klient** û vebijarkên **her bangê** bi `mergeConfig` tên hevkirin.

## `OpenFetchConfig`

- **URL:** `url`, `baseURL`, `params`, `paramsSerializer`
- **Body:** `method`, `data`, `body` — piştî `transformRequest`, obje (ne ji cureyên derxistî) → JSON
- **Header/auth:** `headers`, `auth`, `withCredentials`, `credentials`
- **Betal kirin:** `timeout`, `signal`
- **Bersiv:** `responseType`, `validateStatus` (standard 200–299)
- **Veguherîn:** `transformRequest[]`, `transformResponse[]`
- **Middleware/retry/cache:** `middlewares`, `retry`, `memoryCache`
- **Rehetî:** `unwrapResponse` — `true` tenê **`data`** vedigere
- **`RequestInit`:** `cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`

## `OpenFetchResponse`

`data`, `status`, `statusText`, `headers`, `config`.

## Hevkirin

- `headers`: merge ya sathi.  
- `middlewares`, `transformRequest`, `transformResponse`: **lêzîvirandin** (pêşî defaults).  
- `retry`, `memoryCache`: merge ya sathi.  
- Keyên xetereyên prototype tên rakirin.

## Pêş

- [Interceptors û middleware](./interceptors-middleware.md)

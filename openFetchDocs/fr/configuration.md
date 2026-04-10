# Configuration

Fusion **defaults client** + **appel** via `mergeConfig`.

## `OpenFetchConfig`

### URL

- **`url`**, **`baseURL`**, **`params`**, **`paramsSerializer`**

### Corps

- **`method`**, **`data`**, **`body`** — après `transformRequest`, objets sérialisés en JSON sauf types binaires / `FormData` / etc.

### En-têtes / auth

- **`headers`**, **`auth`**, **`withCredentials`**, **`credentials`**

### Annulation

- **`timeout`**, **`signal`**

### Réponse

- **`responseType`**, **`validateStatus`** (défaut 200–299)

### Pipelines

- **`transformRequest[]`**, **`transformResponse[]`**

### Middleware / retry / cache

- **`middlewares`**, **`retry`**, **`memoryCache`**

### Confort

- **`unwrapResponse`** — retourne seulement `data` si `true`

### `RequestInit`

`cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`.

## `OpenFetchResponse`

`data`, `status`, `statusText`, `headers`, `config`.

## Fusion

- En-têtes : merge superficiel.  
- `middlewares`, `transformRequest`, `transformResponse` : **concaténation**.  
- `retry`, `memoryCache` : merge superficiel.  
- Suppression des clés dangereuses de pollution de prototype.

## Suite

- [Intercepteurs et middleware](./interceptors-middleware.md)

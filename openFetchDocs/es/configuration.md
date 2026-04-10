# Configuración

La configuración se fusiona desde **defaults del cliente** y opciones **por llamada** mediante `mergeConfig` (ver reglas abajo).

## `OpenFetchConfig` (petición)

### URL y consulta

- **`url`** — Absoluta o relativa (con `baseURL`).
- **`baseURL`** — Prefijo para rutas no absolutas.
- **`params`** — Objeto serializado a query string (serializador por defecto; sustituye con **`paramsSerializer`**).

### Método y cuerpo

- **`method`** — Los helpers lo fijan automáticamente.
- **`data`** — Tras **`transformRequest`**, los objetos (salvo `FormData`, `URLSearchParams`, `Blob`, `ArrayBuffer`, vistas tipadas) se serializan a JSON; `content-type` por defecto `application/json` si falta.
- **`body`** — Cuerpo crudo de `fetch` si no usas `data` así; dispatch usa `data` si está definido, si no `body`.

### Cabeceras y autenticación

- **`headers`** — `Record<string, string>` (claves en minúsculas internamente).
- **`auth`** — `{ username, password }` → `Authorization: Basic …`.
- **`withCredentials: true`** — Pone `credentials: 'include'` salvo que **`credentials`** esté definido.

### Tiempo de espera y cancelación

- **`timeout`** — ms; `AbortController` interno fusionado con **`signal`**.
- **`signal`** — `AbortSignal` externo.

### Respuesta

- **`responseType`** — `"json"` | `"text"` | `"arraybuffer"` | `"blob"` | `"stream"`.  
  Si se omite, se infiere JSON por `Content-Type: application/json`, si no texto.
- **`validateStatus`** — `(status) => boolean`. Por defecto 200–299. Si falla, lanza **`OpenFetchError`** con `ERR_BAD_RESPONSE`.

### Transformaciones

- **`transformRequest`** — `(data, headers) => unknown` en orden.
- **`transformResponse`** — `(data) => T` tras el parseo en éxito.

### Middleware, reintentos, caché

- **`middlewares`** — Array (concatenado con defaults).
- **`retry`** — Opciones fusionadas en plano para `createRetryMiddleware`.
- **`memoryCache`** — `ttlMs`, `staleWhileRevalidateMs`, `skip` por petición.

### Ergonomía

- **`unwrapResponse`** — Si es `true`, los helpers devuelven solo **`data`**.

### `RequestInit`

Se reenvían a `fetch`: `cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`.

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

## Fusión (`mergeConfig`)

- Claves de primer nivel: gana la config de la llamada.
- **`headers`**: fusión superficial.
- **`middlewares`**, **`transformRequest`**, **`transformResponse`**: **concatenación** (defaults primero).
- **`retry`**, **`memoryCache`**: fusión superficial.
- Se eliminan claves de contaminación de prototipo en objetos fusionados.

## Siguiente

- [Interceptores y middleware](./interceptors-middleware.md)

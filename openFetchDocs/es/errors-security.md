# Errores y seguridad

## `OpenFetchError`

Subclase de `Error` con opcionales:

- **`code`**
- **`config`** (puede contener secretos)
- **`response`** — Con `ERR_BAD_RESPONSE`
- **`request`** — `{ url }`

### Códigos habituales

| Código | Significado |
|--------|-------------|
| `ERR_BAD_RESPONSE` | Estado HTTP no aceptado por `validateStatus` |
| `ERR_NETWORK` | Red / error inesperado en `fetch` |
| `ERR_PARSE` | No se pudo parsear el cuerpo |
| `ERR_CANCELED` | Abortado (timeout o señal externa) |

## `isOpenFetchError`

Guarda de tipo: `err is OpenFetchError`.

## Registro — `toShape()` / `toJSON()`

`toShape()` devuelve un objeto plano. **`config.auth` no** va en la forma, pero la **instancia** puede llevar `config` completo — no la expongas cruda a clientes.

Para logs compartidos o hacia el cliente:

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

Por defecto **sí** incluye datos y cabeceras de respuesta.

## `assertSafeHttpUrl(url)`

Protección **opcional en servidor** cuando la URL puede venir de entrada **no confiable**.

- Solo **`http:`** / **`https:`**.
- Rechaza **localhost** e IPs **literales** privadas / loopback / enlace local (IPv4 e IPv6 comunes).
- **No** evita **DNS rebinding**.

## Caché y autenticación

Ver [Reintentos y caché](./retry-cache.md): usa **`varyHeaderNames`** o clave personalizada.

## Más información

- **`SECURITY.md`** del paquete y **`npm run test:security`**.

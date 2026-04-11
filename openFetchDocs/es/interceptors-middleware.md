# Interceptores y middleware

## Ciclo de vida (resumen)

1. Fusionar **defaults** + config de la llamada.  
2. **Interceptores de petición** sobre la config.  
3. Crear **`OpenFetchContext`**.  
4. Pila de **middleware**; el núcleo llama a **`dispatch`** (`fetch` + parseo + validación + transformaciones de respuesta).  
5. **Interceptores de respuesta**.  
6. Devolver respuesta completa o solo `data` si `unwrapResponse`.

Ver `docs/PROJECT_FLOW.md` en el paquete.

## Interceptores

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

**Orden:**

- **Petición:** el último registrado se ejecuta primero (LIFO).
- **Respuesta:** el primero registrado primero (FIFO).

## Middleware

```ts
type Middleware = (
  ctx: OpenFetchContext,
  next: NextFn
) => Promise<void>;
```

- **`ctx.request`** — Config fusionada.  
- **`ctx.response`** — Rellena `dispatch` o otro middleware.  
- **`ctx.error`** — En fallo; el cliente relanza si no hay `response` al terminar.

```ts
client.use(async (ctx, next) => {
  await next();
});
```

`client.use` hace **push** en `defaults.middlewares`.

### Orden

El middleware exterior entra primero. **Importa** para caché vs reintento: caché **antes** que reintento evita reintentar aciertos de caché; reintento **antes** que caché reintenta el origen antes de la capa de caché.

## Fábricas incluidas

- **`createRetryMiddleware`** — [Reintentos y caché](./retry-cache.md).  
- **`createCacheMiddleware`** — [Reintentos y caché](./retry-cache.md).

## Siguiente

- [Reintentos y caché](./retry-cache.md)  
- [Errores y seguridad](./errors-security.md)

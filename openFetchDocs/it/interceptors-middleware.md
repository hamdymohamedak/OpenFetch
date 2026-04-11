# Intercettori e middleware

## Flusso

1. Merge config  
2. Intercettori **richiesta**  
3. `OpenFetchContext`  
4. **Middleware** → `dispatch`  
5. Intercettori **risposta**  
6. Risposta completa o solo `data`

## Intercettori

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

- **Richiesta:** ultimo registrato per primo (LIFO).  
- **Risposta:** primo registrato per primo (FIFO).

## Middleware

`client.use(fn)` aggiunge a `defaults.middlewares`. L’ordine conta (cache vs retry).

## Factory integrate

`createRetryMiddleware`, `createCacheMiddleware` — vedi [Retry e cache](./retry-cache.md).

## Prossimo

- [Retry e cache](./retry-cache.md)  
- [Errori e sicurezza](./errors-security.md)

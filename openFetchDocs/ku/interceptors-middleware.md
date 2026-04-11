# Interceptors û middleware

## Jiyan-name (kurte)

1. Hevkirina config  
2. Interceptorên **daxwaz**  
3. `OpenFetchContext`  
4. **Middleware** → `dispatch` (`fetch`)  
5. Interceptorên **bersiv**  
6. Bersiva tev an tenê `data` bi `unwrapResponse`

## Interceptors

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

- **Daxwaz:** ya dawî hatî tomar kirin **pêşî** (LIFO).  
- **Bersiv:** ya yekem hatî tomar kirin **pêşî** (FIFO).

## Middleware

`client.use(fn)` → `defaults.middlewares` **push**. **Rêz girîng e** (cache li dijî retry).

## Factory-yên navxweyî

`createRetryMiddleware`, `createCacheMiddleware` — [Retry û cache](./retry-cache.md).

## Pêş

- [Retry û cache](./retry-cache.md)  
- [Çewtî û ewlehî](./errors-security.md)

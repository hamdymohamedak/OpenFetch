# Intercepteurs et middleware

## Cycle

1. Merge config  
2. Intercepteurs **requête**  
3. Contexte `OpenFetchContext`  
4. **Middleware** → `dispatch`  
5. Intercepteurs **réponse**  
6. Retour réponse ou `data` si `unwrapResponse`

## Intercepteurs

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

- **Requête :** dernier enregistré exécuté en premier (LIFO).  
- **Réponse :** premier enregistré en premier (FIFO).

## Middleware

```ts
(client as OpenFetchClient).use(async (ctx, next) => {
  await next();
});
```

`use` **ajoute** à `defaults.middlewares`. L’ordre compte (cache vs retry).

## Fabriques

- `createRetryMiddleware` — [Nouvelles tentatives et cache](./retry-cache.md)  
- `createCacheMiddleware` — idem

## Suite

- [Nouvelles tentatives et cache](./retry-cache.md)  
- [Erreurs et sécurité](./errors-security.md)

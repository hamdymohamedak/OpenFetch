# Erreurs et sécurité

## `OpenFetchError`

Champs : `code`, `config?`, `response?`, `request?`.

Codes courants : `ERR_BAD_RESPONSE`, `ERR_NETWORK`, `ERR_PARSE`, `ERR_CANCELED`.

## `isOpenFetchError`

Garde de type.

## `toShape()` / `toJSON()`

`config.auth` omis dans la forme sérialisée ; l’instance peut encore tout contenir.

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

## `assertSafeHttpUrl`

Garde serveur optionnelle : http(s) uniquement ; bloque localhost et IP littérales privées/loopback (IPv4/IPv6 courantes). **Ne** suffit **pas** contre le rebinding DNS.

## Cache

Voir [Nouvelles tentatives et cache](./retry-cache.md) — `varyHeaderNames`.

## Plus

`SECURITY.md` et `npm run test:security` dans le dépôt du paquet.

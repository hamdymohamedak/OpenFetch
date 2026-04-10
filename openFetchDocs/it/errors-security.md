# Errori e sicurezza

## `OpenFetchError`

`code`, `config?`, `response?`, `request?`. Codici: `ERR_BAD_RESPONSE`, `ERR_NETWORK`, `ERR_PARSE`, `ERR_CANCELED`.

## `isOpenFetchError`

Type guard.

## `toShape()` / `toJSON()`

`config.auth` escluso dalla forma; l’istanza può contenere segreti.

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

## `assertSafeHttpUrl`

Solo http(s); blocca localhost e IP private letterali. Non mitiga DNS rebinding.

## Cache autenticata

Vedi [Retry e cache](./retry-cache.md) — `varyHeaderNames`.

## Altro

`SECURITY.md` e `npm run test:security` nel repo del pacchetto.

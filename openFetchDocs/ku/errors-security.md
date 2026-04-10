# Çewtî û ewlehî

## `OpenFetchError`

`code`, `config?`, `response?`, `request?`. Kodên gelemperî: `ERR_BAD_RESPONSE`, `ERR_NETWORK`, `ERR_PARSE`, `ERR_CANCELED`.

## `isOpenFetchError`

Type guard.

## `toShape()` / `toJSON()`

Di şeklê serialîze de `config.auth` tune; instance dikare hemî `config` bigire — ji klient re neşîne.

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

## `assertSafeHttpUrl(url)`

Parastina bijartî li serverê dema URL ji input-e ne ewle be. Tenê `http:`/`https:`; localhost û IP-yên taybet yên literal asteng dike. **DNS rebinding** naxe.

## Cache û auth

[Retry û cache](./retry-cache.md) — `varyHeaderNames` an `key` ya taybet.

## Zêdetir

`SECURITY.md` û `npm run test:security` li repo ya pakêtê.

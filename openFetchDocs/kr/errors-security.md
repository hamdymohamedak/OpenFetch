# 오류와 보안

## `OpenFetchError`

`code`, `config?`, `response?`, `request?`. 흔한 `code`: `ERR_BAD_RESPONSE`, `ERR_NETWORK`, `ERR_PARSE`, `ERR_CANCELED`.

## `isOpenFetchError`

타입 가드.

## `toShape()` / `toJSON()`

형태에는 `config.auth` 가 빠짐. 인스턴스에는 전체 설정이 남을 수 있음 — 클라이언트에 그대로 노출하지 마세요.

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

## `assertSafeHttpUrl(url)`

서버에서 선택적 가드. `http:`/`https:` 만. localhost 및 리터럴 사설/루프백 IP 차단. **DNS 리바인딩은 막지 못함.**

## 캐시와 인증

[재시도와 캐시](./retry-cache.md) — `varyHeaderNames` 또는 사용자 정의 `key`.

## 더 보기

패키지의 `SECURITY.md`, `npm run test:security`.

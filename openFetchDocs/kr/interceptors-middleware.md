# 인터셉터와 미들웨어

## 생명주기 (요약)

1. 설정 병합  
2. **요청** 인터셉터  
3. `OpenFetchContext`  
4. **미들웨어** → 내부에서 `dispatch`(`fetch`)  
5. **응답** 인터셉터  
6. 전체 응답 또는 `unwrapResponse` 시 `data` 만

## 인터셉터

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

- **요청:** **나중에 등록한 것이 먼저** (LIFO).  
- **응답:** **등록 순서** (FIFO).

## 미들웨어

`client.use(fn)` 은 `defaults.middlewares` 에 **push**. **순서가 중요**(캐시 vs 재시도).

## 내장 팩토리

`createRetryMiddleware`, `createCacheMiddleware` — [재시도와 캐시](./retry-cache.md).

## 다음

- [재시도와 캐시](./retry-cache.md)  
- [오류와 보안](./errors-security.md)

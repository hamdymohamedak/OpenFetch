# 시작하기

## 설치

```bash
npm install @hamdymohamedak/openfetch
```

**ESM 전용.** `"@hamdymohamedak/openfetch"` 에서 import 합니다.

## 기본 인스턴스

```ts
import openFetch from "@hamdymohamedak/openfetch";

const res = await openFetch.get("https://api.example.com/v1/users");
```

## `createClient` / `create`

```ts
import { createClient } from "@hamdymohamedak/openfetch";

const api = createClient({
  baseURL: "https://api.example.com",
  headers: { Authorization: "Bearer <token>" },
  timeout: 10_000,
  unwrapResponse: true,
});

const users = await api.get("/v1/users");
```

## HTTP 메서드

`unwrapResponse` 가 없으면 `Promise<OpenFetchResponse<T>>`, 있으면 `Promise<T>`.

| 메서드 | 비고 |
|--------|------|
| `request(urlOrConfig, config?)` | |
| `get`, `head`, `options` | |
| `post`, `put`, `patch` | 일반 객체 → JSON 본문 + 미설정 시 `content-type` |
| `delete` | |

**`url` 필수:** 병합 후 없으면 ``openfetch: `url` is required``.

## 미들웨어

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({ middlewares: [createRetryMiddleware()] });
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

## 다음

- [설정](./configuration.md)

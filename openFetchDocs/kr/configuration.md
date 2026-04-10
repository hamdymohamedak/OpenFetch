# 설정

클라이언트 **defaults** 와 **호출별** 옵션이 `mergeConfig` 로 합쳐집니다.

## `OpenFetchConfig` (주요 필드)

- **URL:** `url`, `baseURL`, `params`, `paramsSerializer`
- **본문:** `method`, `data`, `body` — `transformRequest` 이후 제외 타입이 아닌 객체는 JSON
- **헤더/인증:** `headers`, `auth`, `withCredentials`, `credentials`
- **취소:** `timeout`, `signal`
- **응답:** `responseType`, `validateStatus` (기본 200–299)
- **변환:** `transformRequest[]`, `transformResponse[]`
- **미들웨어/재시도/캐시:** `middlewares`, `retry`, `memoryCache`
- **편의:** `unwrapResponse` 가 true 이면 **`data` 만** 반환
- **`RequestInit` 전달:** `cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`

## `OpenFetchResponse`

`data`, `status`, `statusText`, `headers`, `config`.

## 병합 규칙

- `headers`: 얕은 병합.  
- `middlewares`, `transformRequest`, `transformResponse`: **연결(concat)**.  
- `retry`, `memoryCache`: 얕은 병합.  
- 프로토타입 오염 키 제거.

## 다음

- [인터셉터와 미들웨어](./interceptors-middleware.md)

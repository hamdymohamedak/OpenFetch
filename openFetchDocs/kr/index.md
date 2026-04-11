# openFetch — 한국어 (kr)

이 문서 폴더 이름은 프로젝트에서 **kr** 로 표기합니다. 언어 코드로는 ISO 639-1 **ko** 가 흔히 쓰입니다.

**@hamdymohamedak/openfetch** 는 표준 [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 가 있는 JavaScript 런타임용의 작고 의존성 없는 HTTP 클라이언트입니다. 기본값이 있는 인스턴스, 요청/응답 **인터셉터**, 조합 가능한 **미들웨어**, 지수 백오프 **재시도**, GET/HEAD **메모리 캐시**, 구조화된 **오류**, 신뢰할 수 없는 URL용 선택 **URL 가드**를 제공하며 React, `window`, 구형 XHR에 묶이지 않습니다.

## 설계 목표

- **전송 수단은 `fetch` 만** (Node 18+, Bun, Deno, Workers, 브라우저).
- 지원 환경에서 **필수 polyfill 없음**.
- **서버 친화:** SSR, React Server Components.

## 문서

1. [시작하기](./getting-started.md)  
2. [설정](./configuration.md)  
3. [인터셉터와 미들웨어](./interceptors-middleware.md)  
4. [재시도와 캐시](./retry-cache.md)  
5. [오류와 보안](./errors-security.md)  

## 공개 API 요약

|보내기 | 역할 |
|----------|------|
| **default** | `createClient()` 로 만든 인스턴스 |
| `createClient` / `create` | 새 클라이언트 |
| `OpenFetchError`, `isOpenFetchError` | 타입 오류 |
| `InterceptorManager` | 인터셉터 스택 |
| `createRetryMiddleware` | 재시도 미들웨어 |
| `MemoryCacheStore`, `createCacheMiddleware`, `appendCacheKeyVaryHeaders` | 메모리 캐시 |
| 타입 | `OpenFetchConfig`, `OpenFetchResponse` 등 |
| `assertSafeHttpUrl` | 선택적 SSRF 성격 방어(리터럴 IP 등) |

## 요구 사항

**Node.js 18+** 또는 `fetch` 와 `AbortController` 가 있는 런타임.

# 設定

クライアントの **defaults** と **呼び出しごとのオプション** が `mergeConfig` でマージされます。

## `OpenFetchConfig`（主な項目）

- **URL:** `url`, `baseURL`, `params`, `paramsSerializer`
- **ボディ:** `method`, `data`, `body` — `transformRequest` 後、除外型以外のオブジェクトは JSON
- **ヘッダー／認証:** `headers`, `auth`, `withCredentials`, `credentials`
- **タイムアウト／中断:** `timeout`, `signal`
- **レスポンス:** `responseType`, `validateStatus`（既定は 200–299）
- **変換:** `transformRequest[]`, `transformResponse[]`
- **ミドルウェア／リトライ／キャッシュ:** `middlewares`, `retry`, `memoryCache`
- **利便性:** `unwrapResponse` が true のとき **`data` のみ**返却
- **`RequestInit` 転送:** `cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`

## `OpenFetchResponse`

`data`, `status`, `statusText`, `headers`, `config`。

## マージの挙動

- `headers` は浅いマージ。  
- `middlewares`, `transformRequest`, `transformResponse` は **連結**（defaults が先）。  
- `retry`, `memoryCache` は浅いマージ。  
- プロトタイプ汚染用キーは除去。

## 次へ

- [インターセプターとミドルウェア](./interceptors-middleware.md)

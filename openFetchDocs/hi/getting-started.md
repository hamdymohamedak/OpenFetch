# शुरुआत

## इंस्टॉल

```bash
npm install @hamdymohamedak/openfetch
```

यह पैकेज **केवल ESM** है। इम्पोर्ट: `"@hamdymohamedak/openfetch"`।

## डिफ़ॉल्ट इंस्टेंस

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

## HTTP तरीके

`unwrapResponse` के बिना `Promise<OpenFetchResponse<T>>`, साथ होने पर `Promise<T>`।

| तरीका | नोट |
|--------|------|
| `request(urlOrConfig, config?)` | |
| `get`, `head`, `options` | |
| `post`, `put`, `patch` | सादे ऑब्जेक्ट → JSON बॉडी + `content-type` यदि सेट नहीं |
| `delete` | |

**URL ज़रूरी:** नहीं तो ``openfetch: `url` is required``।

## मिडलवेयर

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({ middlewares: [createRetryMiddleware()] });
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

## आगे

- [कॉन्फ़िगरेशन](./configuration.md)

# कॉन्फ़िगरेशन

**क्लाइंट डिफ़ॉल्ट** और **प्रति कॉल** विकल्प `mergeConfig` से मिलते हैं।

## `OpenFetchConfig` (मुख्य फ़ील्ड)

- **URL:** `url`, `baseURL`, `params`, `paramsSerializer`
- **बॉडी:** `method`, `data`, `body` — `transformRequest` के बाद ऑब्जेक्ट JSON (कुछ प्रकार छोड़कर)
- **हेडर/ऑथ:** `headers`, `auth`, `withCredentials`, `credentials`
- **रद्दीकरण:** `timeout`, `signal`
- **प्रतिक्रिया:** `responseType`, `validateStatus` (डिफ़ॉल्ट 200–299)
- **ट्रांसफ़ॉर्म:** `transformRequest[]`, `transformResponse[]`
- **मिडलवेयर/रीट्राई/कैश:** `middlewares`, `retry`, `memoryCache`
- **सुविधा:** `unwrapResponse` — `true` पर केवल `data` लौटता है
- **`RequestInit` पासथ्रू:** `cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`

## `OpenFetchResponse`

`data`, `status`, `statusText`, `headers`, `config`।

## मर्ज नियम

- हेडर: उथला मर्ज।  
- `middlewares`, `transformRequest`, `transformResponse`: **जोड़ (concat)**।  
- `retry`, `memoryCache`: उथला मर्ज।  
- प्रोटोटाइप प्रदूषण कुंजियाँ हटाई जाती हैं।

## आगे

- [इंटरसेप्टर और मिडलवेयर](./interceptors-middleware.md)

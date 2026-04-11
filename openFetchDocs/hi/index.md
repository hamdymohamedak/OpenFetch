# openFetch — हिन्दी (hi)

**@hamdymohamedak/openfetch** एक हल्का, बिना बाहरी निर्भरता वाला HTTP क्लाइंट है, जो किसी भी JavaScript रनटाइम में मानक [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) के साथ काम करता है। इसमें डिफ़ॉल्ट के साथ इंस्टेंस, अनुरोध/प्रतिक्रिया **इंटरसेप्टर**, जोड़े जा सकने वाला **मिडलवेयर**, घातांकी बैकऑफ़ के साथ **रीट्राई**, GET/HEAD के लिए **मेमोरी कैश**, संरचित **त्रुटियाँ** और वैकल्पिक **URL सुरक्षा जाँच** शामिल है — बिना React, `window` या पुराने XHR से जुड़ाव के।

## लक्ष्य

- **केवल `fetch`** (Node 18+, Bun, Deno, Workers, ब्राउज़र)।
- **अनिवार्य polyfill नहीं।**
- **सर्वर-अनुकूल:** SSR और React Server Components।

## पृष्ठ

1. [शुरुआत](./getting-started.md)  
2. [कॉन्फ़िगरेशन](./configuration.md)  
3. [इंटरसेप्टर और मिडलवेयर](./interceptors-middleware.md)  
4. [रीट्राई और कैश](./retry-cache.md)  
5. [त्रुटियाँ और सुरक्षा](./errors-security.md)  

## सार्वजनिक API (संक्षेप)

| एक्सपोर्ट | भूमिका |
|-----------|--------|
| **default** | पहले से `createClient()` वाला इंस्टेंस |
| `createClient` / `create` | नया क्लाइंट |
| `OpenFetchError`, `isOpenFetchError` | टाइप किए गए एरर |
| `InterceptorManager` | इंटरसेप्टर स्टैक |
| `createRetryMiddleware` | रीट्राई मिडलवेयर फ़ैक्टरी |
| `MemoryCacheStore`, `createCacheMiddleware`, `appendCacheKeyVaryHeaders` | मेमोरी कैश |
| टाइप्स | `OpenFetchConfig`, `OpenFetchResponse`, … |
| `assertSafeHttpUrl` | वैकल्पिक SSRF-जैसी जाँच (लिटरल IP / localhost) |

## आवश्यकता

**Node.js 18+** या `fetch` और `AbortController` वाला रनटाइम।

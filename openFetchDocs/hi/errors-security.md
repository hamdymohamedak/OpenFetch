# त्रुटियाँ और सुरक्षा

## `OpenFetchError`

`Error` का उपवर्ग: `code`, `config?`, `response?`, `request?`।

सामान्य `code`: `ERR_BAD_RESPONSE`, `ERR_NETWORK`, `ERR_PARSE`, `ERR_CANCELED`।

## `isOpenFetchError`

टाइप गार्ड।

## `toShape()` / `toJSON()`

आकार में `config.auth` शामिल नहीं; इंस्टेंस में पूरा `config` हो सकता है — क्लाइंट को कच्चा न भेजें।

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

## `assertSafeHttpUrl(url)`

सर्वर पर वैकल्पिक जाँच जब URL अविश्वसनीय इनपुट से आए। केवल `http:`/`https:`; localhost और लिटरल निजी/लूपबैक IP अवरुद्ध। **DNS rebinding** रोकता नहीं।

## कैश और ऑथ

[रीट्राई और कैश](./retry-cache.md) — `varyHeaderNames` या कस्टम `key`।

## और पढ़ें

पैकेज में `SECURITY.md`, `npm run test:security`।

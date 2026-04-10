# इंटरसेप्टर और मिडलवेयर

## जीवनचक्र (संक्षेप)

1. कॉन्फ़िग मर्ज  
2. **अनुरोध इंटरसेप्टर**  
3. `OpenFetchContext`  
4. **मिडलवेयर** → अंदर `dispatch` (`fetch`)  
5. **प्रतिक्रिया इंटरसेप्टर**  
6. पूरी प्रतिक्रिया या `unwrapResponse` पर केवल `data`

## इंटरसेप्टर

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

- **अनुरोध:** अंतिम पंजीकृत पहले चलता है (LIFO)।  
- **प्रतिक्रिया:** पहला पंजीकृत पहले (FIFO)।

## मिडलवेयर

`client.use(fn)` → `defaults.middlewares` में **push**। क्रम महत्वपूर्ण (कैश बनाम रीट्राई)।

## बिल्ट-इन फ़ैक्टरी

`createRetryMiddleware`, `createCacheMiddleware` — [रीट्राई और कैश](./retry-cache.md) देखें।

## आगे

- [रीट्राई और कैश](./retry-cache.md)  
- [त्रुटियाँ और सुरक्षा](./errors-security.md)

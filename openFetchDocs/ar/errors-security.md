# الأخطاء والأمان

## `OpenFetchError`

صنف فرعي من `Error` مع حقول اختيارية:

- **`code`** — سلسلة قابلة للآلة  
- **`config`** — إعداد الطلب المدمج (قد يحتوي أسراراً)  
- **`response`** — موجود عند فشل `validateStatus` (`ERR_BAD_RESPONSE`)  
- **`request`** — `{ url }` عند التوفر  

### رموز شائعة

| الرمز | المعنى |
|-------|--------|
| `ERR_BAD_RESPONSE` | حالة HTTP فشلت `validateStatus` |
| `ERR_NETWORK` | شبكة / رمي غير متوقع من `fetch` |
| `ERR_PARSE` | تعذر تحليل جسم الاستجابة |
| `ERR_CANCELED` | إلغاء (مهلة أو إشارة خارجية) |

## `isOpenFetchError`

حارس النوع: `err is OpenFetchError`.

## التسجيل — `toShape()` / `toJSON()`

`toShape()` يُرجع كائناً عادياً: `message`، `status`، `url`، `method`، اختياري `data` / `headers`، `code`.

- **`config.auth` يُستبعد** من الشكل، لكن **نسخة الخطأ الحية** قد تحتفظ بـ `config` كاملاً — لا ترسلها خاماً للعملاء.
- للسجلات المشتركة أو الواجهة:

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

الافتراض لـ `toShape()` / `toJSON()` **يشمل** بيانات ورؤوس الاستجابة (توافقاً للخلف).

## `assertSafeHttpUrl(url)`

حارس **اختياري على الخادم** عندما قد يتأثر الURL بمدخلات **غير موثوقة**.

- يسمح فقط بـ **`http:`** / **`https:`**.
- يرفض **localhost** و**عناوين IPv4/IPv6** الخاصة / الاسترجاع / الرابط-المحلي **الحرفية**.
- **لا** يمنع **إعادة ربط DNS**. اجمع مع قوائم سماح أسماء المضيف، أو ضوابط خروج، أو بروكسيات.

يُرمى `Error` برسائل تبدأ `openfetch: assertSafeHttpUrl:`.

## التخزين المؤقت والمصادقة

راجع [إعادة المحاولة والتخزين المؤقت](./retry-cache.md): استخدم **`varyHeaderNames`** أو مفتاحاً مخصصاً لـ GET لكل مستخدم.

## قراءة إضافية

- ملف **`SECURITY.md`** في الحزمة و **`npm run test:security`**.

# React و Vue

openFetch حزمة JavaScript عادية: **تستوردها** وتستدعي `.get()` / `.post()` مثل أي دالة أخرى. تعمل بنفس الطريقة في React وVue.

الأمثلة تستخدم **واجهة تجريبية مجانية** (بدون مفتاح API وبدون ملف `.env`). الرابط مكتوب كاملاً لتنسخ الكود وتشغّله مباشرة.

---

## React

1. ثبّت: `npm install @hamdymohamedak/openfetch`  
2. ضع الكود في ملف مكوّن (مثلاً `PostTitle.jsx`).

```jsx
import { useEffect, useState } from "react";
import openFetch from "@hamdymohamedak/openfetch";

export function PostTitle() {
  const [title, setTitle] = useState("جاري التحميل…");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await openFetch.get(
          "https://jsonplaceholder.typicode.com/posts/1"
        );
        if (active) setTitle(res.data.title);
      } catch {
        if (active) setTitle("حدث خطأ");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return <p>{title}</p>;
}
```

- **`res`** هي الاستجابة الكاملة؛ جسم JSON في **`res.data`**.
- **`active`** يقلل خطر تحديث الحالة بعد مغادرة المستخدم للصفحة.

لاحقاً يمكنك استخدام **`createClient`** مع `baseURL` لتختصر المسار:

```js
import { createClient } from "@hamdymohamedak/openfetch";

const api = createClient({ baseURL: "https://jsonplaceholder.typicode.com" });
// ثم: await api.get("/posts/1")
```

---

## Vue 3

1. ثبّت: `npm install @hamdymohamedak/openfetch`  
2. في ملف `.vue`:

```vue
<script setup>
import { onMounted, ref } from "vue";
import openFetch from "@hamdymohamedak/openfetch";

const title = ref("جاري التحميل…");

onMounted(async () => {
  try {
    const res = await openFetch.get(
      "https://jsonplaceholder.typicode.com/posts/1"
    );
    title.value = res.data.title;
  } catch {
    title.value = "حدث خطأ";
  }
});
</script>

<template>
  <p>{{ title }}</p>
</template>
```

نفس الفكرة: **`res.data`** يحمل JSON المفسَّر.

---

## React Server Components (اختياري)

إن كان إطارك يدعم مكوّنات خادم غير متزامنة:

```jsx
import openFetch from "@hamdymohamedak/openfetch";

export default async function Page() {
  const res = await openFetch.get(
    "https://jsonplaceholder.typicode.com/posts/1"
  );
  return <p>{res.data.title}</p>;
}
```

---

## التالي

- [طرق HTTP](./http-methods.md)  
- [الإعدادات](./configuration.md)  
- [البدء](./getting-started.md)

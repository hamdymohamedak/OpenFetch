# React & Vue

openFetch is a normal JavaScript package: you **import** it and **call** `.get()` / `.post()` like any other function. It works the same in React, Vue, and other frameworks.

The examples below use a **free test API** (no API key, no `.env` file). The URL is written in full so you can copy and run the code as-is.

---

## React

1. Install: `npm install @hamdymohamedak/openfetch`
2. Put this in a component file (for example `PostTitle.jsx`).

```jsx
import { useEffect, useState } from "react";
import openFetch from "@hamdymohamedak/openfetch";

export function PostTitle() {
  const [title, setTitle] = useState("Loading…");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await openFetch.get(
          "https://jsonplaceholder.typicode.com/posts/1"
        );
        if (active) setTitle(res.data.title);
      } catch {
        if (active) setTitle("Something went wrong");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return <p>{title}</p>;
}
```

- **`res`** is the full response; the JSON body is in **`res.data`**.
- The **`active`** flag avoids updating state after the user leaves the page (simple React safety).

When you are ready for a **base URL** (so you write `"/posts/1"` instead of the long string), use `createClient`:

```js
import { createClient } from "@hamdymohamedak/openfetch";

const api = createClient({ baseURL: "https://jsonplaceholder.typicode.com" });
// then: await api.get("/posts/1")
```

---

## Vue 3

1. Install: `npm install @hamdymohamedak/openfetch`
2. Use this inside a `.vue` file.

```vue
<script setup>
import { onMounted, ref } from "vue";
import openFetch from "@hamdymohamedak/openfetch";

const title = ref("Loading…");

onMounted(async () => {
  try {
    const res = await openFetch.get(
      "https://jsonplaceholder.typicode.com/posts/1"
    );
    title.value = res.data.title;
  } catch {
    title.value = "Something went wrong";
  }
});
</script>

<template>
  <p>{{ title }}</p>
</template>
```

Same idea: **`res.data`** holds the parsed JSON. For a shared `baseURL`, create one client and import it from a small `api.js` file (see `createClient` above).

---

## React Server Components (optional)

If your app supports async server components, you can `await` without `useEffect`:

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

## Next

- [HTTP methods](./http-methods.md) — POST, PUT, DELETE, and more  
- [Configuration](./configuration.md) — `baseURL`, timeouts, headers  
- [Getting started](./getting-started.md) — `createClient` and middleware

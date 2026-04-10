# OpenFetch workspace

This repository groups the **OpenFetch** HTTP client, its documentation site, a small React demo, and an agent skill.

## Packages and folders

| Path | Purpose |
|------|---------|
| [`openFetch/`](openFetch/) | **@hamdymohamedak/openfetch** — fetch-only HTTP client with interceptors, middleware, retry, memory cache, and a design that works well with React Server Components. |
| [`openFetchDocs/`](openFetchDocs/) | Official **VitePress** documentation (`npm run dev` / `build` / `preview`). |
| [`frontEnd/openfetch/`](frontEnd/openfetch/) | **React + Vite** app for exercising the published package in a browser. |
| [`openfetchskill/`](openfetchskill/) | **Claude / Cursor skill** for working with OpenFetch (see that folder’s README). |

## Quick start

**Library (local development)**

```bash
cd openFetch
npm install
npm run build
```

**Docs**

```bash
cd openFetchDocs
npm install
npm run dev
```

**Frontend demo**

```bash
cd frontEnd/openfetch
npm install
npm run dev
```

## Links

- [Package on npm](https://www.npmjs.com/package/@hamdymohamedak/openfetch)
- [Documentation (hosted)](https://openfetch-js.github.io/openfetch-docs/)
- [Repository](https://github.com/openfetch-js/OpenFetch)

Requires **Node.js ≥ 18** for the library build.

# openFetch documentation

Multilingual documentation for **`@hamdymohamedak/openfetch`** (fetch-only HTTP client: interceptors, middleware, retry, memory cache, RSC-friendly).

- **Library (GitHub):** [github.com/openfetch-js/OpenFetch](https://github.com/openfetch-js/OpenFetch)  
- **npm package:** [npmjs.com/package/@hamdymohamedak/openfetch](https://www.npmjs.com/package/@hamdymohamedak/openfetch)  

**Local package source (optional):** `../openFetch` if you clone the monorepo sibling in this workspace.

## Documentation website (VitePress)

This folder is a **[VitePress](https://vitepress.dev/)** site.

- **Default language:** English at **`/`** (overview, guides, API reference pages).
- **Language hub:** **`/languages/`** — links to every locale.
- **Navbar:** **Guide** (getting started) and **Languages**; the **globe icon** (desktop) switches locale while keeping the same page when translations exist (`i18nRouting`).

### Commands

```bash
cd openFetchDocs
npm install
npm run dev      # local dev server (default http://localhost:5173)
npm run build    # static output → .vitepress/dist
npm run preview  # serve the production build locally
```

### Deploying the static site

After `npm run build`, upload **`.vitepress/dist`** to any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

**GitHub Pages (this repo):** the live site is **[https://openfetch-js.github.io/openfetch-docs/](https://openfetch-js.github.io/openfetch-docs/)**.  
`base` is set to **`/openfetch-docs/`** in [`.vitepress/config.mts`](./.vitepress/config.mts) so assets and the router work under that path. Local dev and `npm run preview` use the same base (open **`http://localhost:5173/openfetch-docs/`** after `npm run dev`).

**If the live site looks unstyled (plain HTML):** Pages is almost certainly **not** serving the VitePress build. Check the page source: if you see `generator" content="Jekyll`, GitHub is building **Jekyll** from a branch (e.g. `main` + `/docs`) instead of your VitePress `dist`.

**Fix:**

1. Repo **Settings → Pages → Build and deployment**.
2. Under **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main` so [`.github/workflows/deploy-docs.yml`](./.github/workflows/deploy-docs.yml) runs; it uploads **`.vitepress/dist`** via the official Pages workflow.

The build output also includes **`public/.nojekyll`** in `dist` so static assets are not processed as Jekyll if you ever publish that folder manually.

If you move hosting to the **domain root**, change `base` to `"/"`.

### Locales

| Path prefix | Language | Notes |
|-------------|----------|--------|
| `/` | English (default) | Full guide set including HTTP methods & React/Vue |
| `/ar/` | Arabic (العربية) | RTL · full parity with English sidebar |
| `/es/` | Spanish | |
| `/fa/` | Persian (Farsi) | RTL |
| `/fr/` | French | |
| `/hi/` | Hindi | |
| `/it/` | Italian | |
| `/ja/` | Japanese | |
| `/kr/` | Korean | HTML `lang` is `ko` |
| `/ku/` | Kurdish | |

### Source layout (English at repo root)

1. **`index.md`** — Overview  
2. **`getting-started.md`** — Install, default client, `createClient`, middleware  
3. **`http-methods.md`** — GET, POST, PUT, PATCH, DELETE, `request()`, bodies & params  
4. **`framework-guides.md`** — React, RSC, Vue 3, SSR notes  
5. **`configuration.md`** — `OpenFetchConfig`, merge rules, `unwrapResponse`  
6. **`interceptors-middleware.md`** — Interceptors, `use()`, ordering  
7. **`retry-cache.md`** — Retry middleware, memory cache, SWR  
8. **`errors-security.md`** — `OpenFetchError`, `toShape`, `assertSafeHttpUrl`  
9. **`languages/index.md`** — Landing page listing all locales  

Translated locales live under **`ar/`**, **`es/`**, etc. (same filenames where translated).

### LLM / agent files

- **`public/llms.txt`** — Copied to site root as **`/llms.txt`** when built (concise API + doc map).  
- **`skills.md`** — Repo-only companion for AI tools (excluded from VitePress pages via `srcExclude`).

### Package version

Docs are aligned with the library’s public API as of **v0.2.x**. For runtime behavior details and file-level architecture, see `openFetch/docs/PROJECT_FLOW.md`.

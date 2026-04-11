# Contributing to @hamdymohamedak/openfetch

Thank you for taking the time to improve this project. The following guidelines keep reviews predictable and the package stable across runtimes.

## Ground rules

1. **Stay on `fetch`.** Do not add XMLHttpRequest, alternate fetch shims as required dependencies, or polyfills that assume a browser.
2. **Avoid browser-only globals.** Do not reference `window`, `document`, `localStorage`, `sessionStorage`, `WebSocket`, or `EventSource` in library code.
3. **Keep the public API small.** Prefer new behavior as optional middleware or clearly documented config rather than breaking existing callers.
4. **TypeScript source of truth.** All implementation lives under `src/`; `dist/` is compiled output from `npm run build`.

## How to contribute

### Reporting issues

Open an issue with:

- Runtime and version (Node, Bun, Deno, worker, browser).
- Minimal code sample and expected vs actual behavior.
- If relevant, the target URL shape (without secrets).

### Suggesting features

Describe the use case and whether it can live in userland (middleware) vs core. Large features should be discussed in an issue before a heavy pull request.

### Pull requests

1. **Fork** the repository and create a branch from `main` (for example `fix/timeout-signal` or `feat/cache-key`).
2. **Implement** your change in `src/`. Match existing formatting and naming.
3. **Build** locally: `npm run build` (must pass with no TypeScript errors).
4. **Document** user-visible behavior in `README.md` and, if structural, in `docs/PROJECT_FLOW.md`.
5. **Open a PR** into `main` with:
   - A clear title and description.
   - What changed and why (motivation).
   - Any breaking changes called out explicitly.

### Commit messages

Use short, imperative subjects (for example `Add cache key override option`). Optional body for context. Consistent history helps maintainers and consumers.

### Code review

Maintainers may request tests, naming tweaks, or doc updates. Keeping changes scoped to one concern per PR speeds up merge.

## Local development

```bash
npm install
npm run build
npm run test:security
```

`npm run test:security` runs the checks under `security-tests/`. `tsc` remains the compile gate for every change.

## Publishing

Publishing to npm is reserved for maintainers after version bump and changelog review. Consumers should install from the registry or from a tagged release, not from unreviewed branches.

npm **requires two-factor authentication** (or a granular access token with publish rights) for `npm publish`. Logging in with the browser (`npm login`) is not enough by itself.

1. On [npmjs.com](https://www.npmjs.com/) go to **Account → Two-Factor Authentication** and enable **Authorization and writes** (authenticator app recommended).
2. From the package root:

```bash
npm publish --access public --otp=123456
```

Use the current 6-digit code from your authenticator app. Do not commit or share OTPs.

**Alternative:** create a **Granular Access Token** at npm with permission to publish this package (and “bypass 2FA” only if your org policy allows it), then configure npm to use that token for `registry.npmjs.org`.

## Code of conduct

Be respectful and professional in issues and pull requests. Focus feedback on the work, not the person.

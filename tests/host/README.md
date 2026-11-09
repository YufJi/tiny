# Test host

Standalone Vite host for running compiled test mini programs with the Tiny runtime.

It contains no mini-program source. The compiler writes each fixture to
`tests/host/generated/apps/<id>/generated`, with a `tests/host/generated/apps.json`
registry; the host selects one fixture with `?app=<id>` and boots the
service/render iframes, with one render iframe per page. It is intentionally
UI-less, unlike the debugger in `apps/devtool`.

The browser host has no single-render fallback: every page owns a render iframe,
and only that page's transitive styles are registered in the frame. P0 exercises
app/page/component scoping, built-in host styling, private built-in internals,
and external-class entry points such as `placeholder-class`.

```bash
pnpm compile:glass-easel                 # tests/apps/demo -> tests/host/generated/apps/demo
node scripts/compile-apps.mjs --all      # every fixture -> the same tree (gate path)
pnpm dev:glass-easel                     # compile demo + Vite on :5173
pnpm dev:wechat-demo                     # compile the WeChat subset + Vite on :5174
```

- `src/host.ts` boots `WasmBrowserHost` with `@tiny/host-core-wasm` and exposes
  `window.__tinyRuntime`.
- `src/test-app.ts` reads `generated/apps.json`, resolves `?app=` (default: the
  first registry entry) and loads that fixture's manifest.
- `src/service-thread.ts` / `src/render-thread.ts` boot the two threads and load
  the same fixture's templates, styles, scripts and assets from the URL base.
- `index.html`, `service.html`, `render.html` are the three entry documents.
- Use `?app=<id>` to pick a fixture and `?path=pages/...` to boot a specific page.
- `tests/host/generated` is gitignored and rebuilt by `pnpm compile:glass-easel`
  (or `pnpm accept:glass-easel`, which compiles every fixture once).
- This host is stage 3/4/5/6 of `pnpm accept:glass-easel` (P0, mini, Taro,
  WeChat demo). Those four stages run concurrently, each against its own
  `?app=`, and the debugger stage previews the same artifact tree.

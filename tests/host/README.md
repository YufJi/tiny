# Test host

Standalone Vite host for running compiled test mini programs with the Tiny runtime.

It contains no mini-program source. The compiler writes an app to
`tests/host/generated`; the host imports that manifest and boots the
service/render iframes.

```bash
pnpm compile:glass-easel     # tests/apps/demo -> tests/host/generated
pnpm dev:glass-easel         # compile + Vite on :5173
```

- `src/host.ts` boots `createStandaloneDualThreadHost` and exposes
  `window.__tinyRuntime`.
- `src/service-thread.ts` / `src/render-thread.ts` boot the two threads.
- `index.html`, `service.html`, `render.html` are the three entry documents.
- Use `?path=pages/...` to boot a specific page from the generated manifest.

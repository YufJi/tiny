# P0 acceptance path

From a clean checkout:

```bash
pnpm install
pnpm accept:glass-easel
```

The gate builds the active glass-easel packages, runs bridge/compiler/built-in/runtime
tests, compiles this example, starts the standalone dual-thread host, and drives the
full P0 flow in a headless browser.

The browser stage verifies:

1. The host boots with no page or console errors, and the render frame fills the host.
2. The todos page renders the P0 component set (`scroll-view`, checkbox group, slider,
   progress, switch, swiper, icon, image, canvas placeholder).
3. Page-scoped classes, `app.wxss` page styles, and built-in block/inline layout apply:
   the page background, card padding/border, and text display are computed from CSS.
4. `add-button` receives properties, renders its slot, and delivers its custom event to
   the page.
5. Checkbox, slider, and switch interactions update page data.
6. `todos → add-todo` navigation delivers the page query and releases the previous page.
7. Input changes reach page data, and `Save and back` persists storage and restores the
   todos marker.
8. System info carries a non-zero window size and pixel ratio.
9. Canvas stays a non-fatal placeholder and emits a structured `UNSUPPORTED_CANVAS`
   warning.
10. Runtime state diagnostics observe the todos → add-todo → todos page transitions.

## Browser selection

The gate uses `playwright-core` with the system Chrome (`channel: 'chrome'`), falling
back to Edge. Override the binary with an environment variable when needed:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium pnpm accept:glass-easel
```

Known knobs:

- `SKIP_BROWSER=1` runs only build, tests, and compilation.
- `TINY_ACCEPT_PORT=5299` changes the temporary host port.
- `HEADED=1` shows the browser window.

## Manual debugging

```bash
pnpm dev:glass-easel
```

Open the printed Vite URL. The example exposes `window.__tinyRuntime` for inspecting
host diagnostics and storage in the devtools console.

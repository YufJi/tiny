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

## Existing example app stage

After the P0 demo flow, the gate compiles `example/mini` (3 pages + 1 subpackage page,
2 components) into the same host and drives the real app:

1. Boots from `App.onLaunch` storage writes and renders the todos page from `getApp()`
   state.
2. Renders both `add-button` instances, slots, checkbox group, slider, progress, switch,
   swiper, and the canvas placeholder.
3. Applies `app.wxss` page styling to the real app.
4. Resolves WXML `import` / `include` and named templates.
5. Navigates to the Component-as-page `add-todo`, updates its input, and returns.
6. Mounts the canvas-only `bar` page without fatal errors.
7. Reports `wx.createAnimation` / `wx.createCanvasContext` as unsupported warnings
   instead of throwing.

The P0 demo artifacts are recompiled after this stage, so `pnpm dev:glass-easel` keeps
serving the small demo.

## Runtime debugger stage

The gate compiles both `example/glass-easel/mini` (demo) and `example/mini` (real) into
`packages/devtool/static/runtime/apps/*/generated`, starts the devtool, and verifies the
runtime debugger:

1. `DevtoolRuntimeClient` boots the dual-thread host and reports `running`.
2. Page stack, current page, structured diagnostics, and the rendered element tree are
   projected into Redux.
3. The mini program renders inside the debugger viewport; the tree drawer shows `page`,
   built-in tags, classes, attributes, and text.
4. `Navigate` / `Back` drive the runtime through host API handlers and refresh the tree.
5. The app selector switches from the demo to the existing example app.
6. `Reload` restarts the runtime and `Terminate` removes both thread iframes.
7. No console or page errors occur.

The debugger is the devtool default page; the legacy shell remains at `/legacy.html`.
Run it manually with:

```bash
pnpm dev:devtool
# open http://localhost:8080/
```

`dev:devtool` starts watchers for both example apps plus the rspack dev server. Editing a
WXML/WXSS/JS file recompiles within ~250ms; press `Reload` in the panel to boot the new
artifacts.

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

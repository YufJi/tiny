# P0 acceptance path

The browser host lives in `hosts/browser`; mini-program sources live under
`test-apps/` (`test-apps/demo` is the P0 demo, `test-apps/mini` the full sample).

From a clean checkout:

```bash
pnpm install
pnpm accept:glass-easel
```

The gate builds the active glass-easel packages, runs bridge/compiler/template/
stylesheet/components/runtime tests, compiles this example, starts the standalone
dual-thread host, and drives the full P0, existing-app, Taro 3, and debugger flows
in a headless browser.

The browser stage verifies:

1. The host boots with no page or console errors, and the render frame fills the host.
2. The todos page renders the P0 component set (`scroll-view`, checkbox group, slider,
   progress, switch, swiper, icon, image, canvas).
3. Page-scoped classes, `app.wxss` page styles, and built-in block/inline layout apply:
   the page background, card padding/border, and text display are computed from CSS.
4. `add-button` receives properties, renders its slot, and delivers its custom event to
   the page.
5. Checkbox, slider, and switch interactions update page data.
6. `todos → add-todo` navigation delivers the page query and releases the previous page.
7. Input changes reach page data, and `Save and back` persists storage and restores the
   todos marker.
8. System info carries a non-zero window size and pixel ratio.
9. Canvas draws through the service-thread mirror without fatal errors; the legacy
   canvas API still emits a structured `UNSUPPORTED_CANVAS` warning.
10. Runtime state diagnostics observe the todos → add-todo → todos page transitions.

## Existing example app stage

After the P0 demo flow, the gate compiles `test-apps/mini` (3 pages + 1 subpackage page,
2 components) into the same host and drives the real app:

1. Boots from `App.onLaunch` storage writes and renders the todos page from `getApp()`
   state.
2. Renders both `add-button` instances, slots, checkbox group, slider, progress, switch,
   swiper, the mirrored canvas, and a loaded image (assets are inlined as data URIs).
3. Applies `app.wxss` page styling to the real app.
4. Drives page interactions: checkbox-group aggregation updates `app.todos`, the first
   component instance runs its own handler without navigating, the switch and sliders
   update page data, radio/icon state renders, the swiper moves to the selected dot,
   and `animation="{{...}}"` data produces a CSS transform.
5. Resolves WXML `import` / `include` and named templates.
6. Navigates to the Component-as-page `add-todo`, updates its input, and returns.
7. Renders the `bar` ECharts page: the service-thread canvas is mirrored to the render
   page as PNG frames, and the acceptance checks for non-blank pixels.
8. Boots the `packageA/pages/c/c` subpackage page directly.
9. Runs `wx.createAnimation` and `wx.createSelectorQuery`, reports the offscreen canvas
   mirror as info, and keeps the legacy canvas API at warning level.

The P0 demo artifacts are recompiled after this stage, so `pnpm dev:glass-easel` keeps
serving the small demo.

## Taro 3 example stage

The gate then compiles the prebuilt Taro 3 output in `test-apps/todo` (webpack
`webpackJsonp` bundles, `base.wxml`, external WXS, recursive templates) and
drives `pages/index/index`:

1. Boots the Taro app and renders the Redux-backed todo list (`Use Redux`,
   `1 item left`).
2. Adds a todo through the Taro input by filling it and pressing Enter.
3. Toggles a checkbox, switches `Active` / `Completed` filters, and clears
   completed todos.
4. Keeps page, console, and runtime error output empty.

This stage also guards the compatibility pieces Taro depends on: `webpackJsonp`
on `wx`, `getCurrentPages`, callback-style `wx.getSystemInfo`, external WXS
modules, mutually recursive component metadata, and lifecycle methods exposed
on the page instance.

## Runtime debugger stage

The gate compiles both `test-apps/demo` (demo) and `test-apps/mini` (real) into
`apps/devtool/static/runtime/apps/*/generated`, starts the devtool, and verifies the
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

The debugger is the devtool default page. Run it manually with:

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

# P0 acceptance path

The browser host lives in `tests/host`; mini-program sources live under
`tests/apps/` (`tests/apps/demo` is the P0 demo, `tests/apps/mini` the full sample).

From a clean checkout:

```bash
pnpm install
pnpm accept:glass-easel
```

The gate builds the active glass-easel packages, runs bridge/compiler/template/
stylesheet/built-in-component/runtime tests, compiles the demo, starts the standalone
dual-thread host, and drives the full P0, existing-app, Taro 3, WeChat demo, and debugger flows
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
10. The component semantics page boots from the todos page and returns to it.
11. `Behavior` data/methods/lifetimes are merged; property observers and `observers`
    run on page-driven property changes; `selectComponent` resolves the behavior box
    and returns its `probe()` result.
12. Parent/child `relations` link on attach and unlink after `wx:if` removes the child.
13. `externalClasses` resolve the page class inside the component.
14. `styleIsolation` works for `isolated`, `apply-shared`/`addGlobalClass`, and
    `shared`: page styles reach only shared components, shared component styles reach
    the page, and isolated components stay isolated.
15. `button` renders WeChat-compatible default/primary/warn-plain/mini/loading/disabled
    variants; computed colors, background, radius, font size, padding, border and loading
    spinner are asserted.
16. Runtime state diagnostics observe the todos → add-todo → semantics → todos page
    transitions.

## Existing test app stage (mini)

After the P0 demo flow, the gate compiles `tests/apps/mini` (3 pages + 1 subpackage page,
2 components) into the same host and drives the real app:

1. Boots from `App.onLaunch` storage writes and renders the todos page from `getApp()`
   state.
2. Renders both `add-button` instances, slots, checkbox group, slider, progress, switch,
   swiper, the mirrored canvas, and a loaded image (static assets are inlined or resolved
   by the render asset hook).
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

## Taro 3 test app stage

The gate then compiles the prebuilt Taro 3 output in `tests/apps/todo` (webpack
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

## WeChat demo stage

The gate compiles `tests/apps/wechat-demo`, a subset of the official
`wechat-miniprogram/miniprogram-demo` containing only the basic component and
API examples:

1. Boots the component index, renders its categories, and loads the dynamic
   `resources/kind/{{id}}.png` icons through the host `resolveAssetUrl` hook.
2. Boots a component example (`button`).
3. Boots an API example (`storage`).
4. Keeps page, console, and runtime error output empty.

The subset, adaptations, and excluded advanced packages are documented in
`tests/apps/wechat-demo/README.md`.

## Runtime debugger stage

The gate scans every `tests/apps/*` fixture with an `app.json`, compiles all of them into
`apps/devtool/static/runtime/apps/<app>/generated`, writes the app registry to
`apps/devtool/static/runtime/apps.json`, starts the devtool, and verifies the runtime
debugger:

1. `DevtoolRuntimeClient` boots the dual-thread host and reports `running`.
2. Page stack, current page, per-page render frames, structured diagnostics, and the
   rendered element tree are projected into Redux and surfaced in the right-bottom
   Console / Lifecycle / Elements panel.
3. The mini program renders inside the `375 × 812` iPhone X preview. Each page owns one
   `next-render.html?pageId=<page-id>` iframe; the active frame is visible and hidden
   pages stay mounted behind it. A host status bar and navigation bar consume the top
   `88px` (content stays `375 × 724`); the Elements tab shows `page`, built-in tags,
   classes, attributes, and text.
4. The host navigation bar projects the **active page** title and exposes back;
   `navigate.back` is disabled on the first page and drives the runtime after a
   navigation. The page stack chips show page paths and visible/hidden WebView state.
5. Navigating to the add-todo page creates a second iframe and hides the first without
   destroying its DOM; going back removes only the popped page iframe and re-shows the
   first page with its previous data. The Lifecycle timeline records
   `onLoad/onShow/onReady/onHide/onUnload` and `onReachBottom`/`onResize`.
6. The app selector lists every `tests/apps` fixture; each app boots its first page and
   renders representative content for `demo`, `mini`, `todo`, `wechat-demo`, and `echarts`;
   page-relative dynamic images (for example the WeChat demo icons) load successfully.
7. The capsule menu backgrounds and foregrounds the preview (with an in-preview overlay),
   `Reload` restarts the runtime, and `Terminate` removes the service iframe and every
   page render iframe.
8. No console or page errors occur.

The debugger is the devtool default page. Run it manually with:

```bash
pnpm dev:devtool
# open http://localhost:8080/
# deep link: http://localhost:8080/?app=wechat-demo&path=page/component/index
```

`dev:devtool` starts one watcher per test app plus the rspack dev server. Editing a
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

Open the printed Vite URL. The host exposes `window.__tinyRuntime` for inspecting
host diagnostics and storage in the devtools console.

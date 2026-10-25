# Devtool Context

## Glossary

- **Devtool**: the browser debugger UI and host adapter for inspecting and controlling the Tiny runtime.
- **Runtime client**: `DevtoolRuntimeClient` from `@tiny/host-browser`; the only permitted boundary between the React UI and the runtime.
- **Host transport**: the explicit message channel between the debugger host, service thread, and each page render thread.
- **Protocol message**: a versioned envelope with kind, domain, method, payload, page identity, and correlation ID.
- **Runtime control**: debugger-originated lifecycle commands such as launch, foreground, background, navigate, back, reload, and terminate.
- **Diagnostic**: structured runtime output for logs, page state, compiler diagnostics, unsupported capabilities, and transport errors.
- **Thread entries**: `runtimeService.js` / `runtimeRender.js`, served as `next-service.html` / `next-render.html`; they boot the threads from `./runtime/apps/<app>/generated`, resolved relative to the thread document.
- **Page frame**: one `next-render.html?pageId=<page-id>` iframe per page. The active page frame is visible; hidden frames stay mounted behind it, preserving DOM, scroll position, timers, and media state. The service thread still has a single iframe.
- **Host chrome**: the simulated status bar and navigation bar rendered around the active app's page frame stack from the page/app `navigationBar*` config. Back calls `navigate.back`; the capsule dots open host controls, and the ring calls `page.hide` then returns to the app launcher. `navigationStyle: "custom"` pages own their bar, so host chrome is not duplicated and a floating debugger ring remains available.
- **TabBar**: native mini-program bottom/top tab bar rendered by the host, outside the page iframe, from `RUNTIME_STATE.tabBar`. Tabs call `navigate.switchTab`; tab pages stay cached as hidden page frames. The content area and `windowHeight` reserve `TAB_BAR_HEIGHT` only while the active page is a tab page and the bar is visible.
- **App session**: one live mini program owned by the devtool: its `DevtoolRuntimeClient`, service/render iframes, DOM surface, latest runtime state, and LRU timestamp. Up to `MAX_LIVE_APPS` (3) sessions stay warm; the least recently used background session is terminated when a fourth app is opened.
- **Launcher**: the default screen when no app is in the foreground. Lists every test app, shows warm/background state and current page, opens/resumes an app, or closes a warm session. It is also where the capsule ring returns.
- **Page stack limit**: each mini program runtime enforces a configurable maximum page stack (default 10). `navigateTo` fails before hiding the current page when the limit is reached; `maxPageStack` is passed from the host through `DevtoolRuntimeClient` / `createStandaloneDualThreadHost`.
- **Lifecycle timeline**: ordered `PAGE_LIFECYCLE` diagnostics projected into the panel. It records `onLoad`, `onShow`, `onReady`, `onHide`, `onUnload`, `onReachBottom`, `onResize`, and `onTabItemTap`; high-frequency `onPageScroll` is delivered to the page but intentionally kept out of the timeline.
- **App registry**: served at `./runtime/apps.json`; the dev server generates `static/runtime/apps.json` by scanning every `tests/apps/*` fixture with an `app.json`, while the website build writes a reduced registry into its own public directory. The launcher uses it for the app list, while the directory name is the `?app=` deep-link value.
- **Projection**: the Redux `runtime` model mirrors the **active** session's page stack, page frames, tabBar, lifecycle timeline, current page, diagnostics, and element tree; background sessions keep their state inside the React session pool. The model never sends protocol messages itself.

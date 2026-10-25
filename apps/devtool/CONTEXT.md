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
- **Host chrome**: the simulated status bar and navigation bar rendered around the page frame stack from the active page/app `navigationBar*` config. Back calls `navigate.back`; the capsule menu drives foreground/background/reload. `navigationStyle: "custom"` pages own their bar, so host chrome is not duplicated and the page stack uses the full screen.
- **TabBar**: native mini-program bottom/top tab bar rendered by the host, outside the page iframe, from `RUNTIME_STATE.tabBar`. Tabs call `navigate.switchTab`; tab pages stay cached as hidden page frames. The content area and `windowHeight` reserve `TAB_BAR_HEIGHT` only while the active page is a tab page and the bar is visible.
- **Preview lifecycle**: host-tracked foreground/background state used for the in-preview dimming overlay and lifecycle controls; it mirrors the service `page.show` / `page.hide` commands. Backgrounding also hides every page frame via `setAppVisible`.
- **Lifecycle timeline**: ordered `PAGE_LIFECYCLE` diagnostics projected into the panel. It records `onLoad`, `onShow`, `onReady`, `onHide`, `onUnload`, `onReachBottom`, `onResize`, and `onTabItemTap`; high-frequency `onPageScroll` is delivered to the page but intentionally kept out of the timeline.
- **App registry**: served at `./runtime/apps.json`; the dev server generates `static/runtime/apps.json` by scanning every `tests/apps/*` fixture with an `app.json`, while the website build writes a reduced registry into its own public directory. The panel uses it to build the app selector, while the directory name is the `?app=` value.
- **Projection**: the Redux `runtime` model mirrors page stack, page frames, lifecycle timeline, current page, diagnostics, and element tree; it never sends protocol messages itself.

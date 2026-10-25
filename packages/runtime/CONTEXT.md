# Runtime Context

## Glossary

- **Runtime**: the Tiny host that starts an application, owns application lifecycle, page stack, routing dispatch, global registration, and platform API dispatch.
- **Glass-easel adapter**: the internal translation layer between the Runtime and glass-easel component APIs. It is not a public dependency for other packages.
- **Render backend**: the pluggable boundary that creates, updates, and receives events for the rendered component tree.
- **Core entry**: `@tiny/runtime`, which must remain free of browser globals.
- **Browser host**: `@tiny/host-browser` (`hosts/browser`), which owns iframes, message ports, DOM canvas, page visibility, and the devtool overlay.
- **Render thread connector**: `RenderThreadConnector` lets a host create one render transport per page. `createTinyRuntime` routes page-scoped messages by page ID, bootstraps each render thread with that page's data, and tears the thread down on `onUnload`. Without a connector, a single render transport serves the whole stack (tests and simple hosts).
- **Page frame**: the host-owned render document for one page. The devtool keeps hidden page frames mounted and only toggles visibility, so back navigation does not rebuild the page from data.
- **Page lifecycle**: service-driven `onLoad/onShow/onReady/onHide/onUnload` plus render-driven `onPageScroll/onReachBottom`, host-driven `onResize`, and tabBar-driven `onTabItemTap`. Every transition is emitted as a `PAGE_LIFECYCLE` diagnostic with page identity and a monotonic sequence; `RUNTIME_STATE` carries the page stack, live/cached pages, tabBar state, and visible flags.
- **TabBar**: `app.json.tabBar` is normalized by the service. Tab pages are cached across `switchTab` (hidden, not unloaded), non-tab pages are destroyed, and `RUNTIME_STATE.tabBar` exposes visibility, selected index, style, icons, badges, and red dots to a host. The service implements `switchTab` and the standard tabBar mutation APIs; the browser host owns rendering.
- **Page stack limit**: `maxPageStack` defaults to 10 and is supplied by the host through the runtime bootstrap. `navigateTo` rejects before hiding the current page when the stack is full; the limit is echoed in `RUNTIME_STATE.maxPageStack`.
- **Bridge**: the transport-only boundary for serialization, batching, timeouts, and errors. It does not define API or rendering behavior.
- **Built-in components**: glass-easel component definitions for mini-program tags such as `view`, `text`, `image`, `button`, and `input`.
- **Asset resolution**: `RenderThreadOptions.resolveAssetUrl` is a host hook that maps app-root-relative asset paths to loadable URLs. The adapter resolves `<image src>` against the owning page/component source path and rewrites local WXSS `url(...)` values before style registration; external/data URLs and paths escaping the app root stay unchanged.
- **Style scope**: glass-easel prefixes class names with the owning page/component style scope. The render thread registers stylesheets before registering component definitions so definitions receive their scope ID; external classes from a page remain scoped to the page. Page/component tag selectors are rewritten to scoped marker classes (`wx-tag-<tag>` by default, configurable via `naming`), so they do not leak into other pages or components. `app.wxss` rules remain global by design; component internals use scoped classes/tag markers.

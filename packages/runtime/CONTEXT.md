# Runtime Context

## Glossary

- **Runtime**: the Tiny host that starts an application, owns application lifecycle, page stack, routing dispatch, global registration, and platform API dispatch.
- **Glass-easel adapter**: the internal translation layer between the Runtime and glass-easel component APIs. It is not a public dependency for other packages.
- **Render backend**: the pluggable boundary that creates, updates, and receives events for the rendered component tree.
- **Core entry**: `@tiny/runtime`, which must remain free of browser globals.
- **Browser host**: `@tiny/host-browser` (`hosts/browser`), which owns iframes, message ports, DOM canvas, and the devtool overlay.
- **Bridge**: the transport-only boundary for serialization, batching, timeouts, and errors. It does not define API or rendering behavior.
- **Built-in components**: glass-easel component definitions for mini-program tags such as `view`, `text`, `image`, `button`, and `input`.
- **Asset resolution**: `RenderThreadOptions.resolveAssetUrl` is a host hook that maps app-root-relative asset paths to loadable URLs. The adapter resolves `<image src>` against the owning page/component source path and rewrites local WXSS `url(...)` values before style registration; external/data URLs and paths escaping the app root stay unchanged.
- **Style scope**: glass-easel prefixes class names with the owning page/component style scope. The render thread registers stylesheets before registering component definitions so definitions receive their scope ID; external classes from a page remain scoped to the page. Page/component tag selectors are rewritten to scoped marker classes (`wx-tag-<tag>` by default, configurable via `naming`), so they do not leak into other pages or components. `app.wxss` rules remain global by design; component internals use scoped classes/tag markers.

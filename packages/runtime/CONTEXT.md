# Runtime Context

## Glossary

- **Runtime**: the Tiny host that starts an application, owns application lifecycle, page stack, routing dispatch, global registration, and platform API dispatch.
- **Glass-easel adapter**: the internal translation layer between the Runtime and glass-easel component APIs. It is not a public dependency for other packages.
- **Render backend**: the pluggable boundary that creates, updates, and receives events for the rendered component tree.
- **Bridge**: the transport-only boundary for serialization, batching, timeouts, and errors. It does not define API or rendering behavior.
- **Built-in components**: glass-easel component definitions for mini-program tags such as `view`, `text`, `image`, `button`, and `input`.
- **Style scope**: glass-easel prefixes class names with the owning page/component style scope. The render thread registers stylesheets before registering component definitions so definitions receive their scope ID; external classes from a page remain scoped to the page. Known limits: tag selectors inside component WXSS still apply globally, and `app.wxss` class rules only match page markup (component internals use scoped classes).

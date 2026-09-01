# Runtime Context

## Glossary

- **Runtime**: the Tiny host that starts an application, owns application lifecycle, page stack, routing dispatch, global registration, and platform API dispatch.
- **Glass-easel adapter**: the internal translation layer between the Runtime and glass-easel component APIs. It is not a public dependency for other packages.
- **Render backend**: the pluggable boundary that creates, updates, and receives events for the rendered component tree.
- **Bridge**: the transport-only boundary for serialization, batching, timeouts, and errors. It does not define API or rendering behavior.
- **Built-in components**: glass-easel component definitions for mini-program tags such as `view`, `text`, `image`, `button`, and `input`.

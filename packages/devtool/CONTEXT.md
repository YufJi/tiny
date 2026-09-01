# Devtool Context

## Glossary

- **Devtool**: the browser debugger UI and host adapter for inspecting and controlling the Tiny runtime.
- **Host transport**: the explicit message channel between the debugger host, service thread, and render thread.
- **Protocol message**: a versioned envelope with kind, domain, method, payload, page identity, and correlation ID.
- **Runtime control**: debugger-originated lifecycle commands such as launch, foreground, background, navigate, back, reload, and terminate.
- **Diagnostic**: structured runtime output for logs, page state, compiler diagnostics, unsupported capabilities, and transport errors.
- **Runtime client**: the typed API and subscription surface used by React; it is the only permitted boundary between UI and runtime.

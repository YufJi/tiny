# Bridge Context

## Glossary

- **Bridge**: the transport-only layer for versioned messages, envelope validation, request correlation, batching, serialization checks, and timeouts.
- **Protocol envelope**: the logical message shape containing protocol version, message ID, kind, domain, method, source, target, payload, optional page ID, optional reply ID, and timestamp.
- **Host**: the process that owns channel setup, page routing, lifecycle controls, diagnostics projection, and message relaying.
- **Service thread**: the thread that runs application logic and sends data/API commands.
- **Render thread**: the thread that runs the render backend and sends user events.
- **Snapshot**: the host-provided system and storage state used to implement synchronous APIs on the service thread.
- **Batch**: an ordered transport frame containing multiple envelopes, preserving per-source/per-page FIFO order.

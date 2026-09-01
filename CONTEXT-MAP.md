# Context Map

Each package is a bounded context. Read only the contexts relevant to the current task; package-level `CONTEXT.md` files are created lazily by `/domain-modeling`.

| Context | Path | Scope |
| --- | --- | --- |
| APIs | `packages/apis` | Mini-program APIs |
| Base | `packages/base` | Core runtime, vdom, web components, and JSBridge |
| Bridge | `packages/bridge` | Versioned runtime protocol, transport, batching, and diagnostics boundary |
| Compiler | `packages/compiler` | Mini-program compiler |
| Compiler Next | `packages/compiler-next` | Active glass-easel compiler and runtime manifest producer |
| Devtool | `packages/devtool` | Web-based debugger and host adapter for the versioned runtime protocol |
| Runtime | `packages/runtime` | Tiny host runtime and internal glass-easel adapter |
| Stylesheet Compiler | `packages/stylesheet-compiler` | Stylesheet compilation |
| Template Compiler | `packages/template-compiler` | Template compilation |
| Utils | `packages/utils` | Shared utilities |

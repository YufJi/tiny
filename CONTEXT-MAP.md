# Context Map

Each package is a bounded context. Read only the contexts relevant to the current task; package-level `CONTEXT.md` files are created lazily by `/domain-modeling`.

| Context | Path | Scope |
| --- | --- | --- |
| APIs | `packages/apis` | Mini-program APIs |
| Base | `packages/base` | Core runtime, vdom, web components, and JSBridge |
| Bridge | `packages/bridge` | Bridge protocol and transport |
| Compiler | `packages/compiler` | Mini-program compiler |
| Devtool | `packages/devtool` | Web-based debugger |
| Runtime | `packages/runtime` | Runtime services |
| Stylesheet Compiler | `packages/stylesheet-compiler` | Stylesheet compilation |
| Template Compiler | `packages/template-compiler` | Template compilation |
| Utils | `packages/utils` | Shared utilities |

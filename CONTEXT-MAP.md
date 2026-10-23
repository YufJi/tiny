# Context Map

Each package is a bounded context. Read only the contexts relevant to the current task; package-level `CONTEXT.md` files are created lazily by `/domain-modeling`.

| Context | Path | Scope |
| --- | --- | --- |
| Bridge | `packages/bridge` | Versioned runtime protocol, transport, batching, and diagnostics boundary |
| Built-in Components | `packages/builtin-components` | Glass-easel implementations of mini-program built-in tags |
| CLI | `packages/cli` | Active glass-easel compiler and runtime manifest producer |
| Devtool | `packages/devtool` | Runtime debugger UI and host orchestration |
| Runtime | `packages/runtime` | Tiny host runtime, glass-easel adapter, and devtool client |
| Stylesheet Compiler | `packages/stylesheet-compiler` | Stylesheet compilation and scoping |
| Template Compiler | `packages/template-compiler` | Template compilation |

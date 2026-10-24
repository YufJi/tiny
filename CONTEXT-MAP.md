# Context Map

Each package is a bounded context. Read only the contexts relevant to the current task; package-level `CONTEXT.md` files are created lazily by `/domain-modeling`.

| Context | Path | Scope |
| --- | --- | --- |
| Bridge | `packages/bridge` | Versioned runtime protocol, transport, batching, and diagnostics boundary |
| Components | `packages/components` | Glass-easel implementations of mini-program built-in tags |
| CLI | `tools/cli` | Active glass-easel compiler and runtime manifest producer |
| Manifest | `packages/manifest` | Artifact/manifest contract shared by compiler and runtime |
| Devtool | `apps/devtool` | Runtime debugger UI and host orchestration |
| Runtime | `packages/runtime` | Tiny host runtime, glass-easel adapter, and devtool client |
| Stylesheet Compiler | `packages/stylesheet-compiler` | Stylesheet compilation and scoping |
| Template Compiler | `packages/template-compiler` | Template compilation |
| Test Host | `tests/host` | Standalone Vite host for test apps and acceptance |
| Test Apps | `tests/apps` | Mini-program fixtures used by acceptance |

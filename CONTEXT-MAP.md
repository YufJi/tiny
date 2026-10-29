# Context Map

Each package is a bounded context. Read only the contexts relevant to the current task; package-level `CONTEXT.md` files are created lazily by `/domain-modeling`.

| Context | Path | Scope |
| --- | --- | --- |
| Bridge | `packages/bridge` | Versioned runtime protocol, transport, batching, and diagnostics boundary |
| CLI | `tools/cli` | Active glass-easel compiler and runtime manifest producer |
| Manifest | `packages/manifest` | Artifact/manifest contract shared by compiler and runtime |
| Devtool | `apps/devtool` | Runtime debugger UI and host orchestration |
| Runtime | `packages/runtime` | Host-independent runtime core: service logic tree, render tree protocol, host orchestration |
| Stylesheet Compiler | `packages/stylesheet-compiler` | Stylesheet compilation and scoping |
| Template Compiler | `packages/template-compiler` | Template compilation |
| Test Host | `tests/host` | Standalone Vite host for test apps and acceptance |
| Test Apps | `tests/apps` | Mini-program fixtures used by acceptance |
| Browser Host | `hosts/browser` | iframe/MessageChannel/DOM canvas host adapters |
| Web Components | `hosts/web-components` | Web/DOM implementations of mini-program built-in tags used by the render tree |
| iOS App | `ios` | SwiftUI/UIKit native app, Xcode project, WKWebView/JSCore bridge, build and simulator scripts |
| iOS Host Package | `hosts/ios` | One Vite package: `src/service` engine + `src/web` host/render entries |
| Website | `website` | React + Vite site shell; page content lives in `docs/site` |

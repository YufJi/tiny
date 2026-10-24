# AGENTS.md

Guidance for AI agents working in the `tiny` repository.

## Project Overview

A mini-program engine built on glass-easel.
- **Monorepo**: pnpm workspaces + Turborepo
- **Language**: TypeScript (packages), JavaScript/JSX (devtool)
- **Runtime**: dual-thread host (service + render iframes) over the versioned Tiny bridge protocol
- **Compiler**: `cli` produces the runtime manifest and artifacts

Legacy `packages/base`, `packages/compiler`, and the old devtool shell were
removed after the glass-easel migration. Do not reintroduce
JSBridge/executeJavaScript-based code. `example/todo` is the Taro 3 compatibility
target and part of acceptance; `example/echarts` remains a historical reference demo.

## Packages

| Package | Scope |
| --- | --- |
| `packages/cli` | Active compiler and manifest producer |
| `packages/template-compiler` | WXML parsing and ProcGen |
| `packages/stylesheet-compiler` | WXSS, rpx, class/tag scoping |
| `packages/runtime` | Host runtime, glass-easel adapter, devtool client |
| `packages/bridge` | Protocol, transport, batching, diagnostics |
| `packages/components` | Mini-program built-in components |
| `packages/devtool` | Browser debugger UI and thread entries |

## Hosts

- `hosts/browser`: standalone Vite browser host used by the examples and acceptance.
  It is not a package and has no mini-program source of its own; compiled apps are
  written to `hosts/browser/generated`.

## Commands

```bash
pnpm install                 # install workspace dependencies
pnpm accept:glass-easel      # full gate: build, tests, browser acceptance
pnpm dev:glass-easel         # P0 demo host on :5173
pnpm dev:devtool             # debugger on :8080 (watches both examples)
pnpm compile:glass-easel     # compile the P0 demo
pnpm compile:devtool:all     # compile demo + example/mini for devtool
pnpm lint                    # biome (only bridge is configured today)
```

Package-level scripts:

```bash
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/runtime build
pnpm --filter @tiny/cli build
pnpm --filter devtool build
```

## Testing

Vitest is used by `bridge`, `template-compiler`, `stylesheet-compiler`,
`cli`, `components`, and `runtime`. There is no global test
runner; use `pnpm --filter <package> test`.

The end-to-end gate is `pnpm accept:glass-easel`, which runs:

1. build of the six active compiler/runtime packages
2. unit tests for all packages
3. P0 demo browser flow
4. `example/mini` browser flow
5. Taro 3 (`example/todo`) browser flow
6. runtime debugger browser flow

`SKIP_BROWSER=1`, `TINY_ACCEPT_PORT`, `TINY_DEVTOOL_PORT`, and `HEADED=1`
control the gate. It requires a Chromium browser (`playwright-core` with system
Chrome, or `PLAYWRIGHT_CHROMIUM_PATH`).

## Code Style

- 2-space indentation, LF, UTF-8 (`.editorconfig`)
- No semicolons in `packages/*` TypeScript; devtool JS follows its existing style
- TypeScript ESM in packages; CommonJS only for devtool config files
- Prefer explicit structured diagnostics over `console.*` in runtime code
- Chinese comments are fine for project-specific concepts

## Local Development Workflow

1. `pnpm install`
2. `pnpm accept:glass-easel` to confirm the baseline
3. `pnpm dev:glass-easel` for the small demo, `pnpm dev:devtool` for the debugger
4. Re-run the gate before committing

## Agent Skills

### Issue tracker

Issues live in GitHub Issues for `YufJi/tiny` and are managed with the `gh` CLI.
See `docs/agents/issue-tracker.md`.

### Triage labels

The tracker uses the five default canonical triage labels. See
`docs/agents/triage-labels.md`.

### Domain docs

The repo uses a multi-context layout rooted at `CONTEXT-MAP.md`, with
package-scoped contexts. See `docs/agents/domain.md`.

# AGENTS.md

Guidance for AI agents working in the `tiny` repository.

## Project Overview

A mini-program engine built on glass-easel.
- **Monorepo**: pnpm workspaces + Turborepo
- **Language**: TypeScript (core packages and tools), JavaScript/JSX (`apps/devtool`)
- **Runtime**: dual-thread host (service + render iframes) over the versioned Tiny bridge protocol
- **Compiler**: `tools/cli` produces the runtime manifest and artifacts

The workspace is split by role. Keep dependencies pointing inward: core packages
must not depend on tools, apps, or tests.

## Workspace layout

| Layer | Path | Scope |
| --- | --- | --- |
| Core | `packages/*` | Libraries consumed by runtime/tools/apps |
| Tools | `tools/*` | Compiler/build tooling |
| Apps | `apps/*` | Runnable applications (debugger) |
| Tests | `tests/*` | Browser host + mini-program fixtures (not workspace packages) |

### Core packages

| Package | Scope |
| --- | --- |
| `packages/manifest` | Artifact/manifest contract shared by compiler and runtime |
| `packages/template-compiler` | WXML parsing and ProcGen |
| `packages/stylesheet-compiler` | WXSS, rpx, class/tag scoping |
| `packages/runtime` | Host runtime, glass-easel adapter, devtool client |
| `packages/bridge` | Protocol, transport, batching, diagnostics |
| `packages/components` | Mini-program built-in components |

### Tools and apps

| Path | Scope |
| --- | --- |
| `tools/cli` | Active compiler and manifest producer |
| `apps/devtool` | Browser debugger UI and thread entries |

### Tests

- `tests/host`: standalone Vite host used for development and Playwright acceptance.
  It has no mini-program source; compiled apps are written to `tests/host/generated`.
- `tests/apps/*`: mini-program fixtures used by acceptance (`demo`, `mini`, `todo`,
  `echarts`).

## Commands

```bash
pnpm install                 # install workspace dependencies
pnpm build                   # build all 8 workspace packages
pnpm accept:glass-easel      # full gate: build, unit tests, 4 browser stages
pnpm dev:glass-easel         # compile tests/apps/demo + host on :5173
pnpm dev:devtool             # debugger on :8080 (watches demo + mini)
pnpm compile:glass-easel     # compile tests/apps/demo -> tests/host/generated
pnpm compile:devtool:all     # compile demo + mini for the debugger
pnpm lint                    # Biome (bridge only is configured today)
```

Package-level scripts:

```bash
pnpm --filter @tiny/manifest build
pnpm --filter @tiny/cli test
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/runtime build
pnpm --filter devtool build
```

## Testing

Vitest is used by `bridge`, `template-compiler`, `stylesheet-compiler`, `cli`,
`components`, and `runtime` (92 tests). There is no global test runner; use
`pnpm --filter <package> test`.

The end-to-end gate is `pnpm accept:glass-easel`:

1. build of the 7 compiler/runtime targets in `build:glass-easel`
2. unit tests for all packages
3. P0 demo browser flow (`tests/apps/demo`)
4. `tests/apps/mini` browser flow
5. Taro 3 (`tests/apps/todo`) browser flow
6. runtime debugger browser flow

`SKIP_BROWSER=1`, `TINY_ACCEPT_PORT`, `TINY_DEVTOOL_PORT`, and `HEADED=1`
control the gate. It requires a Chromium browser (`playwright-core` with system
Chrome, or `PLAYWRIGHT_CHROMIUM_PATH`).

## Repository conventions

- `packages/components/src/generated/`, `tests/host/generated/`, and
  `apps/devtool/static/` are build output and gitignored.
- `tests/apps/*` are complete mini-program fixtures; `tests/apps/todo` is the Taro 3
  compatibility target. `tests/apps/echarts` is historical reference only.
- Do not reintroduce the legacy `packages/base`, `packages/compiler`, or the old
  devtool shell; no JSBridge/`executeJavaScript`-based code.
- The browser test host and devtool both use `createStandaloneDualThreadHost`;
  devtool adds `DevtoolRuntimeClient` for lifecycle control, state projection, and
  element-tree inspection. Do not make the test host depend on the devtool app.

## Code Style

- 2-space indentation, LF, UTF-8 (`.editorconfig`)
- No semicolons in `packages/*` and `tools/cli` TypeScript; devtool JS follows its existing style
- TypeScript ESM in packages/tools; CommonJS only for devtool config files
- Prefer explicit structured diagnostics over `console.*` in runtime code
- Chinese comments are fine for project-specific concepts

## Local Development Workflow

1. `pnpm install`
2. `pnpm accept:glass-easel` to confirm the baseline
3. `pnpm dev:glass-easel` for the demo, `pnpm dev:devtool` for the debugger
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

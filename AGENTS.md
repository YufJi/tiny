# AGENTS.md

Guidance for AI agents working in the `tiny` repository.

## Project Overview

A mini-program engine built on glass-easel.
- **Monorepo**: pnpm workspaces + Turborepo
- **Language**: TypeScript (core packages and tools), JavaScript/JSX (`apps/devtool`, `website`)
- **Runtime**: WeChat-style split trees — service logic tree + host render tree — over the versioned Tiny bridge protocol
- **Compiler**: `tools/cli` produces the runtime manifest and artifacts

The workspace is split by role. Keep dependencies pointing inward: core packages
must not depend on tools, apps, hosts, or tests.

## Workspace layout

| Layer | Path | Scope |
| --- | --- | --- |
| Core | `packages/*` | Libraries consumed by runtime/tools/apps |
| Tools | `tools/*` | Compiler/build tooling |
| Apps | `apps/*` | Runnable applications (debugger) |
| Hosts | `hosts/*` | Browser/environment adapters (not core) |
| Tests | `tests/*` | Browser host + mini-program fixtures (not workspace packages) |
| Website | `website` | React + Vite architecture site (workspace app) |

### Core packages

| Package | Scope |
| --- | --- |
| `packages/manifest` | Artifact/manifest contract shared by compiler and runtime |
| `packages/template-compiler` | WXML parsing and ProcGen |
| `packages/stylesheet-compiler` | WXSS, rpx, class/tag scoping |
| `packages/runtime` | Host-independent runtime core |
| `packages/bridge` | Protocol, transport, batching, diagnostics |

### Tools and apps

| Path | Scope |
| --- | --- |
| `tools/cli` | Active compiler and manifest producer |
| `apps/devtool` | Browser debugger UI and thread entries |

### Tests

- `tests/host`: standalone Vite host used for development and Playwright acceptance.
  It has no mini-program source; compiled apps are written to `tests/host/generated`.
- `tests/apps/*`: mini-program fixtures used by acceptance (`demo`, `mini`, `todo`,
  `wechat-demo`, `echarts`).

### Hosts

| Path | Scope |
| --- | --- |
| `hosts/browser` | `@tiny/host-browser`: iframes, message ports, DOM canvas, devtool overlay |
| `hosts/web-components` | `@tiny/host-web-components`: web/DOM implementations of the built-in tags, mounted by the web render tree |

## Commands

```bash
pnpm install                 # install workspace dependencies
pnpm build                   # build all 10 workspace packages
pnpm accept:glass-easel      # full gate: build, unit tests, 5 browser stages
pnpm dev:glass-easel         # compile tests/apps/demo + host on :5173
pnpm dev:devtool             # debugger on :8080 (watches every tests/apps fixture)
pnpm compile:glass-easel     # compile tests/apps/demo -> tests/host/generated
pnpm compile:devtool:all     # compile every tests/apps fixture for the debugger
pnpm compile:wechat-demo     # compile the WeChat component/API subset
pnpm parity:probe            # compile tests/apps/wechat-demo and probe every page in headless Chrome
pnpm dev:wechat-demo         # WeChat demo host on :5174
pnpm check:runtime-purity    # assert the core runtime has no host globals
pnpm lint                    # Biome (bridge only is configured today)
pnpm site:dev                # build embedded devtool + preview website on :4173
pnpm site:devtool            # rebuild only website/.cache/site-public/devtool
pnpm site:check              # build and validate the site output
```

Package-level scripts:

```bash
pnpm --filter @tiny/manifest build
pnpm --filter @tiny/cli test
pnpm --filter @tiny/runtime test
pnpm --filter @tiny/runtime build
pnpm --filter devtool build
pnpm --filter @tiny/website build
```

## Testing

Vitest is used by `bridge`, `template-compiler`, `stylesheet-compiler`, `cli`,
`host-web-components`, and `runtime`. There is no global test runner; use
`pnpm --filter <package> test`.

The end-to-end gate is `pnpm accept:glass-easel`:

1. build of the 8 compiler/runtime/host targets in `build:glass-easel`
2. core runtime purity check
3. unit tests for all packages
4. P0 demo browser flow (`tests/apps/demo`)
5. `tests/apps/mini` browser flow
6. Taro 3 (`tests/apps/todo`) browser flow
7. WeChat demo (`tests/apps/wechat-demo`) browser flow
8. runtime debugger browser flow

`SKIP_BROWSER=1`, `TINY_ACCEPT_PORT`, `TINY_DEVTOOL_PORT`, and `HEADED=1`
control the gate. It requires a Chromium browser (`playwright-core` with system
Chrome, or `PLAYWRIGHT_CHROMIUM_PATH`).

`pnpm parity:probe` (117 pages) is a separate diagnostic, not part of the gate:
it compiles `tests/apps/wechat-demo`, serves `tests/host` on port 5198 and
records boot state, visible text, page errors and diagnostics per page into
`tests/host/generated/parity-report.json`. Reuse a running host with
`TINY_PROBE_BASE_URL=...`; `--limit`/`--only` narrow the run. It rewrites
`tests/host/generated`, so never run it alongside the gate.

## Repository conventions

- `hosts/web-components/src/generated/`, `tests/host/generated/`, and
  `apps/devtool/static/` are build output and gitignored.
- `tests/apps/*` are complete mini-program fixtures; `tests/apps/todo` is the Taro 3
  compatibility target. `tests/apps/echarts` is historical reference only.
- Site page content lives in `docs/site/*.md` (contract:
  `docs/site/CONTEXT.md`). The filename is the route, `name`/`order` drive the
  navigation, and the build fails on syntax outside the contract; do not add
  page prose back into JSX.
- The site is prerendered (`scripts/prerender.mjs`): every route becomes a
  static `dist/<route>/index.html` plus a `.md` mirror, `llms.txt`,
  `llms-full.txt` and `sitemap.xml`. Build it with `TINY_SITE_BASE=/tiny/` to
  reproduce the GitHub Pages prefix; `devtool` and `assets` are reserved route
  names.
- `website` is a React + Vite app; `pnpm site:build` writes `dist/` including
  the embedded devtool (`dist/devtool/`) built from `.cache/site-devtool/` and
  staged through `website/.cache/site-public/`, and
  `.github/workflows/pages.yml` deploys it.
- Do not reintroduce the legacy `packages/base`, `packages/compiler`, or the old
  devtool shell; no JSBridge/`executeJavaScript`-based code.
- `@tiny/runtime` must stay host-independent. Browser modules live in
  `@tiny/host-browser`; built-in tag implementations live in
  `@tiny/host-web-components` and are mounted by the web render tree
  (`createGlassRenderEntry` / `createGlassRenderTree`). Run
  `pnpm check:runtime-purity` after touching the core entry.
- Host facts (menu-button geometry, performance, device capabilities) are supplied
  by the host through `ServiceThreadOptions.apiExtensions`; canvas is supplied
  through `ServiceThreadOptions.canvas` and the render tree's
  `TreeRenderer.measure` / `measureCanvas` hooks. Do not hardcode them in
  `packages/runtime`'s service API host.
- The browser test host and devtool both use `@tiny/host-browser`’s
  `createStandaloneDualThreadHost`;
  devtool adds `DevtoolRuntimeClient` for lifecycle control, state projection, and
  element-tree inspection. Do not make the test host depend on the devtool app.

## Code Style

- 2-space indentation, LF, UTF-8 (`.editorconfig`)
- No semicolons in `packages/*` and `tools/cli` TypeScript; devtool JS follows its existing style
- TypeScript ESM in packages/tools; bundler configs are ESM (`apps/devtool/vite.config.mjs`, `website/vite.config.js`)
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

The docs tree is indexed in `docs/README.md` (ADRs, acceptance, parity,
known issues, archive). Delete stale docs instead of keeping a second copy of
what the code or `CONTEXT.md` already says.

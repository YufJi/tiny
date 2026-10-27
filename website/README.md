# @tiny/website

React + Vite architecture site for the Tiny mini-program engine. It documents
the real implementation boundaries: compiler artifacts, the dual-thread
runtime, the versioned bridge, host adapters, and the acceptance gate. Deployed
to GitHub Pages.

## Routes

| Route | Page | Content |
| --- | --- | --- |
| `#/` | [docs/site/home.md](../docs/site/home.md) | Engine overview, contracts, host matrix, evidence, quick start |
| `#/architecture` | [docs/site/architecture.md](../docs/site/architecture.md) | Boundaries, real dependency edges, boot sequence, relay matrix, state ownership |
| `#/compiler` | [docs/site/compiler.md](../docs/site/compiler.md) | Discovery, naming config, WXML → ProcGen, scoped CSS, scripts, manifest, output tree, diagnostics |
| `#/runtime` | [docs/site/runtime.md](../docs/site/runtime.md) | Host-independent service thread, naming, setData/observers, events, component semantics, adapter, built-ins, isolation, canvas |
| `#/protocol` | [docs/site/protocol.md](../docs/site/protocol.md) | Envelope, handshake, transport, batching, errors, JSON-safe rules, message catalog |
| `#/hosts` | [docs/site/hosts.md](../docs/site/hosts.md) | Runtime purity, host-browser, host-web-components, startup handshake, thread contract, canvas/asset/API injections, devtool/test hosts, checklist |
| `#/devtool` | [docs/site/devtool.md](../docs/site/devtool.md) | Embedded live debugger, panel/host architecture, build pipeline, relative-path contract, limits |
| `#/testing` | [docs/site/testing.md](../docs/site/testing.md) | Gate, browser flows, unit tests, fixtures, Taro compatibility, uncovered areas |
| `#/status` | [docs/site/status.md](../docs/site/status.md) | Maturity, known gaps, host gaps, roadmap, invariants |

`#/internals` is kept as an alias for `#/architecture`.

## Structure

```text
vite-plugin-docs.js         # compiles docs/site/*.md into React page modules
src/
├── App.jsx                 # hash router + aliases + route table
├── main.jsx                # React entry
├── styles.css              # shared theme: hero, cards, sequence, tables, page nav
├── components/
│   ├── Layout.jsx          # header/nav/footer
│   └── ui.jsx              # Section/Card/Flow/Sequence/Table/CodeBlock/PageNav/Pill
└── content/
    ├── parse.js            # Markdown → page AST, with contract validation
    ├── frontmatter.js      # frontmatter parsing + metadata checks
    └── render.js           # AST → the ui.jsx vocabulary
```

Page prose lives in `../docs/site/*.md`; `src/` only holds the shell and the
renderer.

Navigation uses hash routes (`#/runtime`) so the static build works on a
GitHub Pages project subpath without a 404 fallback. Assets are emitted with a
relative base (`vite.config.js`).

Page content lives in [`docs/site/`](../docs/site/CONTEXT.md) as Markdown and is
the single source for the site; [docs/site/CONTEXT.md](../docs/site/CONTEXT.md)
documents the frontmatter, block and inline contract. The build parses these
files and fails on anything outside that vocabulary, so keep prose in
`docs/site/` and the visual vocabulary in `src/components/ui.jsx`.

Content is written from the source of truth in `packages/*`, `hosts/browser`,
`hosts/web-components`, `tools/cli`, `tests/host`, and `apps/devtool`. When
behavior changes, update the relevant page rather than adding a generic
marketing section.

## Development

From the repo root:

```bash
pnpm site:dev     # build the embedded devtool, then Vite on :4173
pnpm site:build   # build the embedded devtool, then dist/
pnpm site:check   # site:build + output validation
pnpm site:preview # serve the existing dist/
```

`site:devtool` alone rebuilds only the embedded devtool. The website package
scripts are still available, but they do not create `dist/devtool/`:

```bash
pnpm --filter @tiny/website dev
pnpm --filter @tiny/website build
pnpm --filter @tiny/website preview
```

`site:check` verifies that the site shell and `devtool/index.html`,
`devtool/next-service.html`, and `devtool/next-render.html` only reference
relative assets, that every expected runtime manifest exists, and that the
required generated thread artifacts are present.

## Embedded devtool

`#/devtool` embeds a production build of `apps/devtool` in a same-origin
iframe. `pnpm site:devtool` runs `scripts/build-site-devtool.mjs`, which:

1. compiles every fixture under `tests/apps` (restrict with
   `TINY_SITE_DEVTOOL_APPS=demo,mini`) into `.cache/site-devtool/runtime`;
2. builds `apps/devtool` with `NODE_ENV=production`, relative `publicPath`,
   `TINY_DEVTOOL_RUNTIME_ROOT`, and `TINY_DEVTOOL_OUT_DIR`;
3. copies the build to `website/.cache/site-public/devtool`, which is Vite's
   `publicDir`.

The result is `website/dist/devtool/` (~10 MiB with all fixtures; generated
source maps are stripped). It keeps the app selector identical to
`pnpm dev:devtool`: demo, mini, Taro 3, WeChat demo, and ECharts. Generated
files stay in `.cache/site-devtool/`, `website/.cache/site-public/`, or
`website/dist/`; none is tracked by git. The devtool panel resolves its
registry, thread documents, and app artifacts relative to its own document, so
the same build works at `/devtool/` and at a GitHub Pages prefix such as
`/tiny/devtool/`.

## Deploy

`.github/workflows/pages.yml` installs the workspace, builds the workspace
packages, runs `pnpm site:build`, checks the output, and uploads
`website/dist` as the Pages artifact.

1. Push to `next` or run the workflow manually.
2. Set **Pages → Source → GitHub Actions** in repository settings.
3. Expected URL: `https://yufji.github.io/tiny/`.

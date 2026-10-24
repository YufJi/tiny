# @tiny/website

React + Vite architecture site for the Tiny mini-program engine. It documents
the real implementation boundaries: compiler artifacts, the dual-thread
runtime, the versioned bridge, host adapters, and the acceptance gate. Deployed
to GitHub Pages.

## Routes

| Route | Page | Content |
| --- | --- | --- |
| `#/` | `Home` | Engine overview, contracts, host matrix, evidence, quick start |
| `#/architecture` | `Architecture` | Boundaries, real dependency edges, boot sequence, relay matrix, state ownership |
| `#/compiler` | `Compiler` | Discovery, WXML → ProcGen, scoped CSS, scripts, manifest, output tree, diagnostics |
| `#/runtime` | `Runtime` | service thread, setData/event paths, component model, adapter, built-ins, canvas, limits |
| `#/protocol` | `Protocol` | Envelope, handshake, transport, batching, errors, JSON-safe rules, message catalog |
| `#/hosts` | `Hosts` | Host seam, startup handshake, thread contract, API extensions, devtool/test hosts, checklist |
| `#/devtool` | `Devtool` | Embedded live debugger, build pipeline, relative-path contract, limits |
| `#/testing` | `Testing` | Gate, 40 browser steps, 92 unit tests, fixtures, Taro compatibility, uncovered areas |
| `#/status` | `Status` | Maturity, known gaps, host gaps, roadmap, invariants |

`#/internals` is kept as an alias for `#/architecture`.

## Structure

```text
src/
├── App.jsx                 # hash router + aliases + route table
├── main.jsx                # React entry
├── styles.css              # shared theme: hero, cards, sequence, tables, page nav
├── components/
│   ├── Layout.jsx          # header/nav/footer
│   └── ui.jsx              # Section/Card/Flow/Sequence/Table/CodeBlock/PageNav/Pill
└── pages/
    ├── Home.jsx
    ├── Architecture.jsx
    ├── Compiler.jsx
    ├── Runtime.jsx
    ├── Protocol.jsx
    ├── Hosts.jsx
    ├── Devtool.jsx
    ├── Testing.jsx
    └── Status.jsx
```

Navigation uses hash routes (`#/runtime`) so the static build works on a
GitHub Pages project subpath without a 404 fallback. Assets are emitted with a
relative base (`vite.config.js`).

Content is hand-written from the source of truth in `packages/*`, `tools/cli`,
`tests/host`, and `apps/devtool`. When behavior changes, update the relevant
page rather than adding a generic marketing section.

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
relative assets, that the demo runtime manifest exists, and that the required
generated thread artifacts are present.

## Embedded devtool

`#/devtool` embeds a production build of `apps/devtool` in a same-origin
iframe. `pnpm site:devtool` runs `scripts/build-site-devtool.mjs`, which:

1. compiles `tests/apps/demo` (override with
   `TINY_SITE_DEVTOOL_APPS=demo,mini`) into `website/.cache/devtool/runtime`;
2. builds `apps/devtool` with `NODE_ENV=production`, relative `publicPath`,
   `TINY_DEVTOOL_RUNTIME_ROOT`, and `TINY_DEVTOOL_OUT_DIR`;
3. copies the build to `website/.cache/site-public/devtool`, which is Vite's
   `publicDir`.

The result is `website/dist/devtool/`. All generated files live under
`website/.cache/` or `website/dist/`; neither is tracked by git. The devtool
panel resolves its registry, thread documents, and app artifacts relative to
its own document, so the same build works at `/devtool/` and at a GitHub Pages
prefix such as `/tiny/devtool/`.

## Deploy

`.github/workflows/pages.yml` installs the workspace, builds the workspace
packages, runs `pnpm site:build`, checks the output, and uploads
`website/dist` as the Pages artifact.

1. Push to `next` or run the workflow manually.
2. Set **Pages → Source → GitHub Actions** in repository settings.
3. Expected URL: `https://yufji.github.io/tiny/`.

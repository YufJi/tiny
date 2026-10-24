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

```bash
pnpm --filter @tiny/website dev       # http://localhost:4173
pnpm --filter @tiny/website build     # dist/
pnpm --filter @tiny/website preview   # preview the build
```

From the repo root:

```bash
pnpm site:dev
pnpm site:build
pnpm site:check
```

`site:check` builds the site and validates that the emitted HTML has no
root-absolute asset links and that every local asset exists.

## Deploy

`.github/workflows/pages.yml` installs the workspace, builds `@tiny/website`,
checks the output, and uploads `website/dist` as the Pages artifact.

1. Push to `next` or run the workflow manually.
2. Set **Pages → Source → GitHub Actions** in repository settings.
3. Expected URL: `https://yufji.github.io/tiny/`.

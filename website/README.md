# @tiny/website

Prerendered architecture site for the Tiny mini-program engine. Page text lives
in Markdown ([`docs/site/`](../docs/site/CONTEXT.md)); this package only holds
the shell, the renderer, and the build steps. Deployed to GitHub Pages.

## Routes

Every route is a real prerendered document (no hash routing), so it can be
indexed and fetched by tools that do not run JavaScript.

| URL | Source | Content |
| --- | --- | --- |
| `/` | [docs/site/home.md](../docs/site/home.md) | Engine overview, contracts, host matrix, evidence, quick start |
| `/architecture/` | [docs/site/architecture.md](../docs/site/architecture.md) | Boundaries, real dependency edges, boot sequence, relay matrix, state ownership |
| `/compiler/` | [docs/site/compiler.md](../docs/site/compiler.md) | Discovery, naming config, WXML → ProcGen, scoped CSS, scripts, manifest, output tree, diagnostics |
| `/runtime/` | [docs/site/runtime.md](../docs/site/runtime.md) | Host-independent service thread, naming, setData/observers, events, component semantics, adapter, built-ins, isolation, canvas |
| `/protocol/` | [docs/site/protocol.md](../docs/site/protocol.md) | Envelope, handshake, transport, batching, errors, JSON-safe rules, message catalog |
| `/hosts/` | [docs/site/hosts.md](../docs/site/hosts.md) | Runtime purity, host-browser, host-web-components, startup handshake, thread contract, canvas/asset/API injections, devtool/test hosts, checklist |
| `/debugger/` | [docs/site/debugger.md](../docs/site/debugger.md) | Embedded live debugger, panel/host architecture, build pipeline, relative-path contract, limits |
| `/testing/` | [docs/site/testing.md](../docs/site/testing.md) | Gate, browser flows, unit tests, fixtures, Taro compatibility, uncovered areas |
| `/status/` | [docs/site/status.md](../docs/site/status.md) | Maturity, known gaps, host gaps, roadmap, invariants |

The `/debugger/` page embeds the debugger app, which is served from
`/devtool/` (not a page).

## Structure

```text
vite-plugin-docs.js         # compiles docs/site/*.md into React page modules
scripts/prerender.mjs       # SSR pass → static pages + llms.txt/sitemap/markdown
src/
├── entry-client.jsx        # hydrate the prerendered markup
├── entry-server.jsx        # renderToString for the prerender step
├── App.jsx                 # route lookup, titles
├── styles.css              # shared theme: hero, cards, sequence, tables, page nav
├── components/
│   ├── Layout.jsx          # header/nav/footer, derived from frontmatter
│   └── ui.jsx              # Section/Card/Flow/Sequence/Table/CodeBlock/PageNav/Pill
└── content/
    ├── site.js             # base-aware URL helpers
    ├── pages.js            # glob over docs/site, route + nav metadata
    ├── parse.js            # Markdown → page AST, with contract validation
    ├── frontmatter.js      # frontmatter parsing + metadata checks
    └── render.js           # AST → the ui.jsx vocabulary
```

Adding a page means adding `docs/site/<route>.md` with `name` and `order`
frontmatter: routes, navigation, titles, sitemap and `llms.txt` all derive from
it. Nothing in `src/` lists pages by hand.

Content is written from the source of truth in `packages/*`, `hosts/browser`,
`hosts/web-components`, `tools/cli`, `tests/host`, and `apps/devtool`. When
behavior changes, update the relevant page rather than adding a generic
marketing section.

## Build output

`pnpm site:build` produces `dist/`:

- `<route>/index.html` — full markup, hydrated by the same React tree;
- `assets/` — hashed JS/CSS;
- `<route>.md` (and `index.md` for the landing page) — the Markdown source,
  served as-is for agents that prefer text over HTML;
- `llms.txt`, `llms-full.txt` — page index and concatenated content;
- `sitemap.xml` — one entry per route;
- `devtool/` — the embedded debugger (unchanged relative-path contract).

`site:check` verifies that every route has prerendered markup, that assets and
internal links stay under the configured base, that the Markdown mirrors and
AI artifacts exist, and that the devtool still only uses relative URLs.

## Development

From the repo root:

```bash
pnpm site:dev     # build the embedded devtool, then Vite on :4173
pnpm site:build   # build the embedded devtool, then dist/ (client + SSR + prerender)
pnpm site:check   # site:build + output validation
pnpm site:preview # serve the existing dist/
```

Working on content only (no devtool rebuild):

```bash
pnpm --filter @tiny/website dev      # Vite reads docs/site/*.md directly
pnpm --filter @tiny/website build    # client + SSR + prerender
pnpm --filter @tiny/website test     # contract tests (node:test)
```

### Base path

GitHub Pages serves the project site from `/tiny/`, so the build bakes a base
into asset URLs and internal links:

```bash
TINY_SITE_BASE=/tiny/ pnpm site:build   # what CI does
pnpm site:build                          # local, base "/"
TINY_SITE_BASE=/tiny/ pnpm site:preview  # preview at http://127.0.0.1:4173/tiny/
```

`TINY_SITE_URL` (default `https://yufji.github.io/tiny/`) controls the absolute
URLs in `sitemap.xml`, `llms.txt` and canonical tags.

## Embedded devtool

`/debugger/` embeds a production build of `apps/devtool` in a same-origin
iframe at `/devtool/index.html`. `pnpm site:devtool` runs
`scripts/build-site-devtool.mjs`, which:

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

`devtool` and `assets` are reserved route names: the prerender step fails if a
`docs/site/` file would overwrite either directory.

## Deploy

`.github/workflows/pages.yml` installs the workspace, builds the workspace
packages, runs `pnpm site:build` with `TINY_SITE_BASE=/tiny/`, checks the
output, and uploads `website/dist` as the Pages artifact.

1. Push to `next` or run the workflow manually.
2. Set **Pages → Source → GitHub Actions** in repository settings.
3. Expected URL: `https://yufji.github.io/tiny/`.

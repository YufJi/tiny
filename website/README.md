# @tiny/website

React + Vite website for the current architecture, runtime internals, testing
matrix, and roadmap. Deployed to GitHub Pages.

## Structure

```text
src/
├── App.jsx                 # hash router + route table
├── main.jsx                # React entry
├── styles.css              # shared site theme
├── components/
│   ├── Layout.jsx          # header/nav/footer
│   └── ui.jsx              # Section/Card/Flow/Table/CodeBlock/Pill
└── pages/
    ├── Home.jsx
    ├── Internals.jsx
    ├── Testing.jsx
    └── Status.jsx
```

Navigation uses hash routes (`#/internals`) so the static build works on a
GitHub Pages project subpath without a 404 fallback. Assets are emitted with a
relative base (`vite.config.js`).

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

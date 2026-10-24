# Tiny website

Static GitHub Pages site for the current architecture, runtime internals,
testing matrix, and roadmap.

## Preview

```bash
pnpm site:dev
# http://localhost:4173/
```

The site is plain HTML/CSS/JS; there is no build step. All links and asset
paths are relative so the site works under a project Pages base path
(`/tiny/`).

## Check

```bash
pnpm site:check
```

Checks local `href`/`src` targets for missing files.

## Deploy

`.github/workflows/pages.yml` uploads this directory as the Pages artifact.

1. Push to `next` (or run the workflow manually).
2. In GitHub repository settings, set **Pages → Source → GitHub Actions**.
3. The workflow publishes `https://<user>.github.io/<repo>/`.

Expected URL for this repository: `https://yufji.github.io/tiny/`.

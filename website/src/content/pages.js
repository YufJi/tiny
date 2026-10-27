import { siteBase } from './site'

/**
 * Every page of the site is a file in `docs/site/`. The route comes from the
 * file name (`home.md` → `/`, `runtime.md` → `/runtime/`), the nav order from
 * `frontmatter.order`, and the label/title from `name` / `pageTitle`.
 *
 * Adding a page means adding a Markdown file: nothing in `src/` needs editing.
 */

const modules = import.meta.glob(
  // `CONTEXT.md` is the contract for these files, not a page.
  ['../../../docs/site/*.md', '!../../../docs/site/CONTEXT.md'],
  { eager: true },
)

export const pages = Object.entries(modules)
  .map(([file, module]) => {
    const slug = file.split('/').pop().replace(/\.md$/, '')
    return {
      slug,
      route: slug === 'home' ? '' : slug,
      meta: module.meta,
      Component: module.default,
    }
  })
  .sort((left, right) => (left.meta.order ?? 999) - (right.meta.order ?? 999))

export const routes = Object.fromEntries(pages.map((page) => [page.route, page]))

export function pageTitle(page) {
  return page.meta.pageTitle ?? `${page.meta.name} · Tiny`
}

export function pageHref(page) {
  return page.route ? `${siteBase}${page.route}/` : siteBase
}

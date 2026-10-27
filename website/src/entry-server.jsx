import React from 'react'
import { renderToString } from 'react-dom/server.js'
import App from './App'
import { pages, pageTitle } from './content/pages'

/** Metadata consumed by `scripts/prerender.mjs` (head tags, sitemap, llms.txt). */
export function sitePages() {
  return pages.map((page) => ({
    route: page.route,
    slug: page.slug,
    name: page.meta.name,
    title: pageTitle(page),
    description: page.meta.description,
  }))
}

export function renderPage(route) {
  return renderToString(<App route={route} />)
}

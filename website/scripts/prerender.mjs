/**
 * Post-build step: turns the SPA build into a set of static pages and emits
 * the machine-readable artifacts (per-page Markdown, llms.txt, sitemap.xml).
 *
 * Runs after:
 *   vite build                                   → dist/ (+ index.html shell)
 *   vite build --ssr src/entry-server.jsx ...     → .cache/ssr/entry-server.js
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')
const sourceDir = path.join(rootDir, '..', 'docs', 'site')
const serverEntry = path.join(rootDir, '.cache', 'ssr', 'entry-server.js')

const withTrailingSlash = (value) => (value.endsWith('/') ? value : `${value}/`)
const siteBase = withTrailingSlash(process.env.TINY_SITE_BASE || '/')
const siteUrl = withTrailingSlash(process.env.TINY_SITE_URL || 'https://yufji.github.io/tiny/')

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const routeUrl = (route) => (route ? `${siteUrl}${route}/` : siteUrl)
const routeFile = (route) => (route ? `${route}/index.html` : 'index.html')

const { renderPage, sitePages } = await import(pathToFileURL(serverEntry).href)
const pages = sitePages()

// `dist/devtool/` belongs to the embedded debugger, `dist/assets/` to Vite.
const RESERVED = new Set(['devtool', 'assets'])
for (const page of pages) {
  if (RESERVED.has(page.route)) {
    throw new Error(`route "${page.route}" collides with the ${page.route}/ build output`)
  }
}

const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html has no empty #root to hydrate')
}

const produced = []

for (const page of pages) {
  const markup = renderPage(page.route)
  if (!markup.includes('<section')) {
    throw new Error(`prerender produced no sections for route "${page.route}"`)
  }

  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${escapeHtml(page.description)}$2`,
    )
    .replace(
      '</head>',
      `  <link rel="canonical" href="${routeUrl(page.route)}" />\n` +
        `    <meta property="og:url" content="${routeUrl(page.route)}" />\n` +
        `    <meta property="og:title" content="${escapeHtml(page.title)}" />\n` +
        `    <meta property="og:description" content="${escapeHtml(page.description)}" />\n` +
        '  </head>',
    )
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)

  const target = path.join(distDir, routeFile(page.route))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, html, 'utf8')
  produced.push(routeFile(page.route))
}

// Per-page Markdown mirrors: the same source the site renders, addressable on
// its own so agents can fetch one page instead of scraping HTML.
const llmsSections = []
for (const page of pages) {
  const sourcePath = path.join(sourceDir, `${page.slug}.md`)
  const source = await fs.readFile(sourcePath, 'utf8')
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '').trimStart()
  const mirror = page.route ? `${page.route}.md` : 'index.md'
  await fs.writeFile(path.join(distDir, mirror), source, 'utf8')
  llmsSections.push({ page, body, mirror })
}

const llms = [
  '# Tiny · 小程序引擎架构',
  '',
  `> ${pages[0]?.description ?? 'Tiny 是一个基于 glass-easel 的小程序引擎。'}`,
  '',
  '## 页面',
  '',
  ...pages.map((page) => `- [${page.name}](${routeUrl(page.route)}): ${page.description}`),
  '',
  '## Markdown',
  '',
  ...llmsSections.map(({ page, mirror }) => `- [${mirror}](${siteUrl}${mirror})`),
  '',
].join('\n')
await fs.writeFile(path.join(distDir, 'llms.txt'), llms, 'utf8')

const llmsFull = llmsSections
  .map(({ page, body }) => `# ${page.title}\n\n${routeUrl(page.route)}\n\n${body}`)
  .join('\n\n---\n\n')
await fs.writeFile(path.join(distDir, 'llms-full.txt'), llmsFull, 'utf8')

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map((page) => `  <url><loc>${routeUrl(page.route)}</loc></url>`),
  '</urlset>',
  '',
].join('\n')
await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')

console.log(
  `Prerendered ${pages.length} pages (base ${siteBase}) + llms.txt, ` +
    `llms-full.txt, sitemap.xml, ${pages.length} markdown mirrors`,
)
console.log(produced.map((file) => `  ${file}`).join('\n'))

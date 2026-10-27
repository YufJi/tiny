/**
 * Post-build step: turns the SPA build into a set of static pages and emits
 * the machine-readable artifacts (per-page Markdown, llms.txt, sitemap.xml,
 * robots.txt, a styled 404 page).
 *
 * Runs after:
 *   vite build                                   → dist/ (+ index.html shell)
 *   vite build --ssr src/entry-server.jsx ...     → .cache/ssr/entry-server.js
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoDir = path.resolve(rootDir, '..')
const distDir = path.join(rootDir, 'dist')
const sourceDir = path.join(repoDir, 'docs', 'site')
const serverEntry = path.join(rootDir, '.cache', 'ssr', 'entry-server.js')

const SITE_NAME = 'Tiny 小程序引擎'
const REPO_URL = 'https://github.com/YufJi/tiny'

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

/** Last commit date of a page source, used for `<lastmod>` and `dateModified`. */
function gitDate(slug) {
  try {
    const value = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', `docs/site/${slug}.md`],
      { cwd: repoDir },
    )
      .toString()
      .trim()
    return value || undefined
  } catch {
    return undefined
  }
}

const { renderPage, sitePages } = await import(pathToFileURL(serverEntry).href)
const pages = sitePages()
const home = pages[0]
const modified = Object.fromEntries(pages.map((page) => [page.slug, gitDate(page.slug)]))

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

function structuredData(page) {
  const url = routeUrl(page.route)
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      url: siteUrl,
      name: SITE_NAME,
      alternateName: 'Tiny 小程序引擎 / 小程序内核',
      description: home.description,
      inLanguage: 'zh-CN',
    },
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: page.title,
      description: page.description,
      url,
      mainEntityOfPage: url,
      inLanguage: 'zh-CN',
      isPartOf: { '@id': `${siteUrl}#website` },
      author: { '@type': 'Organization', name: 'Tiny', url: REPO_URL },
      ...(modified[page.slug] ? { dateModified: modified[page.slug] } : {}),
    },
  ]
  if (page.route) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: home.name, item: siteUrl },
        { '@type': 'ListItem', position: 2, name: page.name, item: url },
      ],
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

function headTags(page) {
  const url = routeUrl(page.route)
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const jsonLd = JSON.stringify(structuredData(page)).replace(/</g, '\\u003c')
  const mirror = page.route ? `${page.route}.md` : 'index.md'
  return [
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" type="text/markdown" href="${siteUrl}${mirror}" />`,
    '<meta name="robots" content="index,follow,max-image-preview:large" />',
    `<meta property="og:type" content="${page.route ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    '<meta property="og:locale" content="zh_CN" />',
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    '<meta name="twitter:card" content="summary" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ')
}

const produced = []
let homeHtml = ''

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
    .replace('</head>', `    ${headTags(page)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)

  const target = path.join(distDir, routeFile(page.route))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, html, 'utf8')
  if (page.route === '') homeHtml = html
  produced.push(routeFile(page.route))
}

// Per-page Markdown mirrors: the same source the site renders, addressable on
// its own so agents can fetch one page instead of scraping HTML.
const llmsSections = []
for (const page of pages) {
  const source = await fs.readFile(path.join(sourceDir, `${page.slug}.md`), 'utf8')
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '').trimStart()
  const mirror = page.route ? `${page.route}.md` : 'index.md'
  await fs.writeFile(path.join(distDir, mirror), source, 'utf8')
  llmsSections.push({ page, body, mirror })
}

const llms = [
  `# ${SITE_NAME}`,
  '',
  `> ${home.description}`,
  '',
  '## 页面',
  '',
  ...pages.map((page) => `- [${page.name}](${routeUrl(page.route)}): ${page.description}`),
  '',
  '## Markdown',
  '',
  ...llmsSections.map(({ mirror }) => `- [${mirror}](${siteUrl}${mirror})`),
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
  ...pages.map((page) => {
    const lastmod = modified[page.slug]
    return `  <url><loc>${routeUrl(page.route)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
  }),
  '</urlset>',
  '',
].join('\n')
await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')

const robots = [
  'User-agent: *',
  'Allow: /',
  // The embedded debugger is an app shell, not content.
  `Disallow: ${siteBase}devtool/`,
  '',
  `Sitemap: ${siteUrl}sitemap.xml`,
  '',
].join('\n')
await fs.writeFile(path.join(distDir, 'robots.txt'), robots, 'utf8')

// Styled 404: reuse the rendered shell (header/nav/footer) but drop the app
// script so it stays a plain page.
const notFoundMain = [
  '<main id="main" tabindex="-1">',
  '<section class="section"><div class="shell">',
  '<p class="kicker">404</p>',
  '<h1>页面不存在</h1>',
  '<p class="section-intro">链接可能已经过期，或者这一页还没写。</p>',
  '<ul>',
  ...pages.map(
    (page) => `  <li><a href="${routeUrl(page.route).replace(siteUrl, siteBase)}">${page.name}</a></li>`,
  ),
  '</ul>',
  '</div></section>',
  '</main>',
].join('\n')

const notFound = homeHtml
  .replace(/<title>[^<]*<\/title>/, `<title>页面不存在 · ${SITE_NAME}</title>`)
  .replace(/<main id="main"[\s\S]*?<\/main>/, notFoundMain)
  .replace(/<script[^>]*src="[^"]*assets[^"]*"[^>]*><\/script>/g, '')
  .replace(/<link rel="modulepreload"[^>]*>/g, '')
  .replace(/<link rel="canonical"[^>]*>/, '')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
  .replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>')
await fs.writeFile(path.join(distDir, '404.html'), notFound, 'utf8')

// The embedded debugger must not compete with the documentation in search
// results. GitHub Pages cannot set headers, so mark the documents directly.
const devtoolDir = path.join(distDir, 'devtool')
const devtoolPages = (await fs.readdir(devtoolDir).catch(() => [])).filter((file) =>
  file.endsWith('.html'),
)
for (const file of devtoolPages) {
  const target = path.join(devtoolDir, file)
  const html = await fs.readFile(target, 'utf8')
  if (html.includes('name="robots"')) continue
  await fs.writeFile(
    target,
    html.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>'),
    'utf8',
  )
}

console.log(
  `Prerendered ${pages.length} pages (base ${siteBase}) + llms.txt, ` +
    `llms-full.txt, sitemap.xml, robots.txt, 404.html, ${pages.length} markdown mirrors`,
)
console.log(produced.map((file) => `  ${file}`).join('\n'))

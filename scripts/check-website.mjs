import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverTestApps } from './devtool-apps.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../website/dist')
const problems = []
// `site:devtool` ships every fixture by default; the env var is only for a
// deliberately reduced build.
const requestedFixtureIds = (process.env.TINY_SITE_DEVTOOL_APPS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

function readJson(relativePath) {
  const filePath = path.join(rootDir, relativePath)
  if (!fs.existsSync(filePath)) {
    problems.push(`missing ${relativePath}`)
    return null
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    problems.push(`invalid JSON in ${relativePath}: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

function walkFiles(target) {
  const files = []
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const fullPath = path.join(target, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(fullPath))
    else if (entry.isFile()) files.push(fullPath)
  }
  return files
}

const siteBaseRaw = process.env.TINY_SITE_BASE || '/'
const siteBase = siteBaseRaw.endsWith('/') ? siteBaseRaw : `${siteBaseRaw}/`
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * The embedded devtool must stay relocatable: every asset it references has to
 * be relative so the same build works at `/` and at `/<repo>/`.
 */
function checkRelativeHtml(relativePath) {
  const filePath = path.join(rootDir, relativePath)
  if (!fs.existsSync(filePath)) {
    problems.push(`missing ${relativePath}`)
    return ''
  }
  const html = fs.readFileSync(filePath, 'utf8')
  const htmlDir = path.dirname(filePath)

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = match[1]
    if (/^(?:https?:|mailto:|data:|#)/.test(target)) continue
    if (target.startsWith('/')) {
      problems.push(`root-absolute asset path in ${relativePath}: ${target}`)
      continue
    }
    const file = path.resolve(htmlDir, target.split(/[?#]/)[0])
    if (!file.startsWith(rootDir + path.sep)) {
      problems.push(`asset escapes dist in ${relativePath}: ${target}`)
    } else if (!fs.existsSync(file)) {
      problems.push(`missing asset referenced by ${relativePath}: ${target}`)
    }
  }
  return html
}

/**
 * Every site page is prerendered: full markup inside #root, absolute asset
 * URLs under the configured base, and a real title.
 */
function checkSitePage(relativePath) {
  const filePath = path.join(rootDir, relativePath)
  if (!fs.existsSync(filePath)) {
    problems.push(`missing prerendered page ${relativePath}`)
    return
  }
  const html = fs.readFileSync(filePath, 'utf8')
  if (!/<div id="root">\s*</.test(html)) {
    problems.push(`no prerendered markup in ${relativePath}`)
  }
  if (!new RegExp(`<script[^>]+src="${escapeRegExp(siteBase)}assets/`).test(html)) {
    problems.push(`JS entry does not use the site base in ${relativePath}`)
  }
  if (!/<title>[^<]+<\/title>/.test(html)) {
    problems.push(`missing <title> in ${relativePath}`)
  }
  if (!/<link rel="canonical" href="[^"]+" \/>/.test(html)) {
    problems.push(`missing canonical link in ${relativePath}`)
  }
  if (!/<script type="application\/ld\+json">/.test(html)) {
    problems.push(`missing JSON-LD in ${relativePath}`)
  }
  for (const match of html.matchAll(/\b(?:href|src)="(\/[^"]*)"/g)) {
    if (!match[1].startsWith(siteBase)) {
      problems.push(`URL outside the site base in ${relativePath}: ${match[1]}`)
    }
  }
  for (const match of html.matchAll(/<a[^>]+href="(\/[^"]*)"/g)) {
    const target = match[1].split(/[?#]/)[0]
    const file = path.join(rootDir, target.slice(siteBase.length), 'index.html')
    const landing = path.join(rootDir, target.slice(siteBase.length))
    if (!fs.existsSync(file) && !fs.existsSync(landing)) {
      problems.push(`internal link without a page in ${relativePath}: ${match[1]}`)
    }
  }
}

// Site shell + every prerendered route.
checkSitePage('index.html')
const routeDirectories = fs
  .readdirSync(rootDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !['assets', 'devtool'].includes(name))
  .filter((name) => fs.existsSync(path.join(rootDir, name, 'index.html')))
for (const name of routeDirectories) {
  checkSitePage(path.join(name, 'index.html'))
}

// Machine-readable artifacts: one Markdown mirror per page plus the indexes.
for (const name of routeDirectories) {
  if (!fs.existsSync(path.join(rootDir, `${name}.md`))) {
    problems.push(`missing markdown mirror ${name}.md`)
  }
}
for (const file of ['index.md', 'llms.txt', 'llms-full.txt', 'sitemap.xml', 'robots.txt', '404.html']) {
  if (!fs.existsSync(path.join(rootDir, file))) problems.push(`missing ${file}`)
}
if (fs.existsSync(path.join(rootDir, '404.html'))) {
  const notFound = fs.readFileSync(path.join(rootDir, '404.html'), 'utf8')
  if (!/name="robots" content="noindex"/.test(notFound)) {
    problems.push('404.html is not marked noindex')
  }
  if (/<script[^>]+src="[^"]*assets\//.test(notFound)) {
    problems.push('404.html still loads the app bundle')
  }
}
if (fs.existsSync(path.join(rootDir, 'robots.txt'))) {
  const robots = fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf8')
  if (!robots.includes('Sitemap:')) problems.push('robots.txt has no Sitemap entry')
}
if (fs.existsSync(path.join(rootDir, 'sitemap.xml'))) {
  const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8')
  for (const name of routeDirectories) {
    if (!sitemap.includes(`/${name}/<`)) problems.push(`sitemap.xml is missing /${name}/`)
  }
}

for (const file of ['devtool/index.html', 'devtool/service.html', 'devtool/render.html']) {
  const html = checkRelativeHtml(file)
  if (html && !/name="robots" content="noindex"/.test(html)) {
    problems.push(`${file} is not marked noindex`)
  }
}

// HTML staying relative is not enough: a regression in the JS string
// constants would still fetch /runtime/... from the domain root. Vite may
// split shared code into chunks, so every devtool bundle is scanned instead
// of only the three entry files.
const forbiddenDevtoolUrl =
  /["'`]\/(?:runtime\/apps(?:\.json|\/)|service\.html|render\.html)/
const devtoolDistDir = path.join(rootDir, 'devtool')
if (fs.existsSync(devtoolDistDir)) {
  const bundles = walkFiles(devtoolDistDir).filter(
    (file) =>
      file.endsWith('.js') &&
      !path.relative(devtoolDistDir, file).startsWith(`runtime${path.sep}`),
  )
  if (bundles.length === 0) problems.push('devtool has no JS bundles')
  for (const file of bundles) {
    const source = fs.readFileSync(file, 'utf8')
    if (forbiddenDevtoolUrl.test(source)) {
      problems.push(`root-absolute devtool URL in ${path.relative(rootDir, file)}`)
    }
  }
}
for (const file of ['devtool/nextHost.js', 'devtool/nextService.js', 'devtool/nextRender.js']) {
  if (!fs.existsSync(path.join(rootDir, file))) problems.push(`missing ${file}`)
}

const registry = readJson('devtool/runtime/apps.json')
if (registry) {
  if (!Array.isArray(registry.apps) || registry.apps.length === 0) {
    problems.push('devtool/runtime/apps.json has no apps')
  } else {
    const actualIds = new Set(
      registry.apps
        .filter((app) => app && typeof app.id === 'string')
        .map((app) => app.id),
    )
    const expectedIds = requestedFixtureIds.length > 0
      ? requestedFixtureIds
      : discoverTestApps().map((app) => app.id)
    for (const id of expectedIds) {
      if (!actualIds.has(id)) {
        problems.push(`devtool/runtime/apps.json is missing the ${id} fixture`)
      }
    }
  }
  for (const app of registry.apps ?? []) {
    if (!app || typeof app.id !== 'string') continue
    const manifestPath = `devtool/runtime/apps/${app.id}/generated/manifest.json`
    const manifest = readJson(manifestPath)
    if (manifest && (!Array.isArray(manifest.pages) || manifest.pages.length === 0)) {
      problems.push(`devtool runtime manifest for ${app.id} has no pages`)
    }
    if (manifest) {
      const manifestText = fs.readFileSync(path.join(rootDir, manifestPath), 'utf8')
      if (/"(?:lowPriority)?sourceMapPath"/.test(manifestText)) {
        problems.push(`source map path left in ${manifestPath}`)
      }
    }
    for (const file of ['service.js', 'templates.js']) {
      if (!fs.existsSync(path.join(rootDir, `devtool/runtime/apps/${app.id}/generated`, file))) {
        problems.push(`missing devtool runtime artifact: ${app.id}/generated/${file}`)
      }
    }
  }
}

// Source maps are deliberately stripped from published fixtures to keep the
// Pages artifact small and avoid sourceMappingURL 404s in the debugger.
const generatedAppsDir = path.join(rootDir, 'devtool/runtime/apps')
if (fs.existsSync(generatedAppsDir)) {
  for (const file of walkFiles(generatedAppsDir)) {
    const relativePath = path.relative(rootDir, file)
    if (file.endsWith('.map')) {
      problems.push(`source map left in published artifacts: ${relativePath}`)
    } else if (file.endsWith('.js') || file.endsWith('.css')) {
      if (fs.readFileSync(file, 'utf8').includes('sourceMappingURL')) {
        problems.push(`sourceMappingURL left in published artifacts: ${relativePath}`)
      }
    }
  }
}

if (problems.length > 0) {
  console.error('Website build check failed:')
  for (const item of problems) console.error(`- ${item}`)
  process.exit(1)
}
console.log(
  `Website build OK (${routeDirectories.length + 1} prerendered pages at ${siteBase}, ` +
    'markdown mirrors, llms.txt, sitemap, relative devtool artifacts, no source maps)',
)

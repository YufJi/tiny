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

function checkHtml(relativePath, { requireRoot = false } = {}) {
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

  if (requireRoot) {
    if (!/<script[^>]+src="[^"]+"/.test(html)) problems.push('no emitted JS entry')
    if (!/<div id="root"><\/div>/.test(html)) problems.push('missing #root mount point')
  }
  return html
}

// Site shell.
checkHtml('index.html', { requireRoot: true })

// The devtool is served from dist/devtool/ and embedded by the site. Its
// panel and both thread documents must keep relative asset URLs, otherwise
// GitHub Pages' /<repo>/ prefix breaks every fetch.
checkHtml('devtool/index.html')
checkHtml('devtool/next-service.html')
checkHtml('devtool/next-render.html')

// HTML staying relative is not enough: a regression in the JS string
// constants would still fetch /runtime/... from the domain root. Check the
// emitted bundles for root-absolute devtool URLs as well.
function checkBundle(relativePath, forbidden, description) {
  const filePath = path.join(rootDir, relativePath)
  if (!fs.existsSync(filePath)) {
    problems.push(`missing ${relativePath}`)
    return
  }
  const source = fs.readFileSync(filePath, 'utf8')
  if (forbidden.test(source)) {
    problems.push(`${description} in ${relativePath}`)
  }
}

checkBundle(
  'devtool/nextHost.js',
  /["'`]\/(?:runtime\/apps\.json|next-service\.html|next-render\.html)/,
  'root-absolute devtool URL',
)
checkBundle('devtool/nextService.js', /["'`]\/runtime\/apps\//, 'root-absolute runtime URL')
checkBundle('devtool/nextRender.js', /["'`]\/runtime\/apps\//, 'root-absolute runtime URL')

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
    const manifest = readJson(`devtool/runtime/apps/${app.id}/generated/manifest.json`)
    if (manifest && (!Array.isArray(manifest.pages) || manifest.pages.length === 0)) {
      problems.push(`devtool runtime manifest for ${app.id} has no pages`)
    }
    for (const file of ['service.js', 'render.js', 'templates.js']) {
      if (!fs.existsSync(path.join(rootDir, `devtool/runtime/apps/${app.id}/generated`, file))) {
        problems.push(`missing devtool runtime artifact: ${app.id}/generated/${file}`)
      }
    }
  }
}

if (problems.length > 0) {
  console.error('Website build check failed:')
  for (const item of problems) console.error(`- ${item}`)
  process.exit(1)
}
console.log('Website build OK (relative assets, #root, JS entry, devtool artifacts)')

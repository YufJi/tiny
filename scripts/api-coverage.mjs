#!/usr/bin/env node
/**
 * API coverage report against WeChat 3.17.5.
 *
 * Three sources, never mixed:
 *   - `packages/api/src/catalog.ts`  what Tiny installs (and how well it works)
 *   - `packages/api/data/wechat-3.17.5.tsv`  what WeChat expects, by doc category
 *   - `tests/apps/wechat-demo`  what the 125-page official demo actually calls
 *
 * The report is the input of `docs/api-roadmap.md`; the roadmap only quotes it.
 *
 * Usage:
 *   pnpm api:coverage           # print the report
 *   pnpm api:coverage --check   # exit 1 when a tracked number regresses
 *
 * Reads `packages/api/dist`, so run `pnpm --filter @tiny/api build` first
 * (the root script does it for you).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Numbers the roadmap quotes; only raise them as work lands. */
const BASELINE = {
  present: 129,
  semantic: 98,
  demoMissing: 57,
  inert: 0,
}

const EXCLUDED_SCOPES = new Set(['out'])

let catalog
let capabilities
try {
  catalog = await import(pathToFileURL(path.join(rootDir, 'packages/api/dist/catalog.js')).href)
  capabilities = await import(pathToFileURL(path.join(rootDir, 'packages/api/dist/capabilities.js')).href)
} catch (error) {
  console.error('packages/api/dist is missing or stale. Run: pnpm --filter @tiny/api build')
  throw error
}
const { API_CATALOG, API_NAMES, HOST_EXTENSION_APIS, TINY_ONLY_APIS, apiHostKeys } = catalog
const { STUB_APIS } = capabilities

function readWechatList() {
  const file = path.join(rootDir, 'packages/api/data/wechat-3.17.5.tsv')
  return readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => {
      const [name, category, scope, mask] = line.split('\t')
      return { name, category, scope, mask: Number(mask) }
    })
}

function scanFixture(relative) {
  const root = path.join(rootDir, relative)
  const counts = new Map()
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === 'generated' || entry.startsWith('.')) continue
      const full = path.join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (!/\.(js|ts|wxml|json)$/.test(entry)) continue
      const source = readFileSync(full, 'utf8')
      for (const match of source.matchAll(/\bwx\.([a-zA-Z_$][\w$]*)/g)) {
        counts.set(match[1], (counts.get(match[1]) ?? 0) + 1)
      }
    }
  }
  walk(root)
  return counts
}

function readHostHandlers(relative, pattern) {
  const source = readFileSync(path.join(rootDir, relative), 'utf8')
  return new Set([...source.matchAll(pattern)].map((match) => match[1]))
}

function pad(value, width) {
  return String(value).padEnd(width)
}

function padStart(value, width) {
  return String(value).padStart(width)
}

const rows = readWechatList()
const byName = new Map(rows.map((row) => [row.name, row]))
const inScope = rows.filter((row) => !EXCLUDED_SCOPES.has(row.scope))

const presentNames = new Set([
  ...API_NAMES.filter((name) => !TINY_ONLY_APIS.has(name)),
  ...HOST_EXTENSION_APIS,
])
const presentInScope = inScope.filter((row) => presentNames.has(row.name)).length
const missingInScope = inScope.length - presentInScope

const coreInScope = API_NAMES.filter((name) => !TINY_ONLY_APIS.has(name) && byName.has(name)
  && !EXCLUDED_SCOPES.has(byName.get(name).scope))
const graded = coreInScope.map((name) => API_CATALOG[name])
const countStatus = (status) => graded.filter((entry) => entry.status === status).length
const semantic = countStatus('real') + countStatus('partial') + HOST_EXTENSION_APIS.filter(
  (name) => byName.has(name),
).length

const demo = scanFixture('tests/apps/wechat-demo')
const demoMissing = [...demo.keys()]
  .filter((name) => byName.has(name) && !EXCLUDED_SCOPES.has(byName.get(name).scope) && !presentNames.has(name))
  .sort((a, b) => demo.get(b) - demo.get(a))
const demoExcluded = [...demo.keys()]
  .filter((name) => byName.has(name) && EXCLUDED_SCOPES.has(byName.get(name).scope)
    && !presentNames.has(name))

const browserHandlers = new Set([
  ...readHostHandlers('tests/host/src/host-api.ts', /'([a-z][a-zA-Z]*(?:\.[a-zA-Z]+)?)'\s*:/g),
  ...readHostHandlers('native/host-core/src/host/core.rs', /"([a-z][a-zA-Z]*\.[a-zA-Z]+)"/g),
])
const iosHandlers = new Set([
  ...readHostHandlers('ios/TinyHost/HostCoreRuntime.swift', /case "([a-z][a-zA-Z]*\.[a-zA-Z]+)":/g),
  ...readHostHandlers('native/host-core/src/host/core.rs', /"([a-z][a-zA-Z]*\.[a-zA-Z]+)"/g),
])
const declaredHosts = apiHostKeys()
const unhandled = declaredHosts.filter((key) => !browserHandlers.has(key) && !iosHandlers.has(key))
const iosGaps = declaredHosts.filter((key) => browserHandlers.has(key) && !iosHandlers.has(key))

const inertButDeclared = coreInScope.filter(
  (name) => API_CATALOG[name].status === 'stub' && !STUB_APIS.has(name),
)
const implementedButStubbed = coreInScope.filter(
  (name) => API_CATALOG[name].status !== 'stub' && STUB_APIS.has(name),
)

function printCategories() {
  const categories = new Map()
  for (const row of rows) {
    const entry = categories.get(row.category) ?? { total: 0, present: 0, missing: 0, scope: row.scope }
    entry.total++
    if (presentNames.has(row.name)) entry.present++
    else entry.missing++
    categories.set(row.category, entry)
  }
  const sorted = [...categories.entries()].sort((a, b) => b[1].total - a[1].total)
  console.log(`${pad('category', 14)} ${padStart('total', 5)} ${padStart('have', 5)} ${padStart('miss', 5)}  scope`)
  for (const [name, entry] of sorted) {
    console.log(
      `${pad(name, 14)} ${padStart(entry.total, 5)} ${padStart(entry.present, 5)} `
      + `${padStart(entry.missing, 5)}  ${EXCLUDED_SCOPES.has(entry.scope) ? 'out' : 'in'}`,
    )
  }
}

function printDemo() {
  console.log(`unique calls      ${demo.size}`)
  console.log(`missing in scope  ${demoMissing.length}`)
  console.log(`excluded category ${demoExcluded.length}: ${demoExcluded.join(', ') || 'none'}`)
  console.log('')
  for (const name of demoMissing.slice(0, 20)) {
    console.log(`  ${padStart(demo.get(name), 4)}  ${name}  (${byName.get(name).category})`)
  }
  if (demoMissing.length > 20) console.log(`  … ${demoMissing.length - 20} more`)
}

console.log('WeChat 3.17.5 API coverage')
console.log(`wechat ${rows.length} · excluded ${rows.length - inScope.length} · in scope ${inScope.length}`)
console.log(`present ${presentInScope} (${((presentInScope / inScope.length) * 100).toFixed(1)}%)`
  + ` · missing ${missingInScope}`)
console.log(`semantic A ${countStatus('real')} / B ${countStatus('partial')} / C ${countStatus('stub')}`
  + ` + ${HOST_EXTENSION_APIS.length} extensions`
  + ` → ${((semantic / inScope.length) * 100).toFixed(1)}%`)
console.log('')
printCategories()
console.log('')
console.log('official demo (tests/apps/wechat-demo)')
printDemo()
console.log('')
console.log('honesty')
console.log(`  canIUse true but inert (${inertButDeclared.length}): ${inertButDeclared.join(', ') || 'none'}`)
console.log(`  canIUse false but implemented (${implementedButStubbed.length}): `
  + `${implementedButStubbed.join(', ') || 'none'}`)
console.log('')
console.log('host handlers')
console.log(`  declared ${declaredHosts.length} · browser ${browserHandlers.size} · ios ${iosHandlers.size}`)
console.log(`  implemented by no host: ${unhandled.join(', ') || 'none'}`)
console.log(`  missing on iOS (${iosGaps.length}): ${iosGaps.join(', ') || 'none'}`)

if (process.argv.includes('--check')) {
  const failures = []
  if (presentInScope < BASELINE.present) failures.push(`present ${presentInScope} < ${BASELINE.present}`)
  if (semantic < BASELINE.semantic) failures.push(`semantic ${semantic} < ${BASELINE.semantic}`)
  if (demoMissing.length > BASELINE.demoMissing) {
    failures.push(`demo missing ${demoMissing.length} > ${BASELINE.demoMissing}`)
  }
  if (inertButDeclared.length > BASELINE.inert) {
    failures.push(`inert but declared ${inertButDeclared.length} > ${BASELINE.inert}`)
  }
  if (failures.length > 0) {
    console.error(`\ncoverage regression: ${failures.join('; ')}`)
    process.exit(1)
  }
}

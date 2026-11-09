import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appsRootFor, discoverTestApps, writeAppsRegistry } from './devtool-apps.mjs'

/**
 * Compile fixtures into one shared `<out>/apps/<id>/generated` tree.
 *
 * The gate compiles every fixture once and points both the test host and the
 * debugger at the same tree, so no stage rewrites another stage's artifacts.
 * Compiles run in child processes because `compileMiniProgram` is CPU-bound;
 * a plain `Promise.all` in one process would still serialize the work.
 *
 * Usage:
 *   node scripts/compile-apps.mjs                 # every fixture -> tests/host/generated
 *   node scripts/compile-apps.mjs demo mini       # selected fixtures only
 *   node scripts/compile-apps.mjs --out apps/devtool/static/runtime
 *   node scripts/compile-apps.mjs --jobs 4 --all
 */

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)

function takeOption(name, fallback) {
  const index = args.indexOf(`--${name}`)
  if (index < 0) return fallback
  const value = args[index + 1]
  if (value === undefined) {
    console.error(`[compile] --${name} needs a value`)
    process.exit(1)
  }
  args.splice(index, 2)
  return value
}

const outputArg = takeOption('out', 'tests/host/generated')
const outputRoot = path.resolve(rootDir, outputArg)
const jobs = Math.max(
  1,
  Number(takeOption('jobs', '0')) || Math.min(4, os.availableParallelism?.() ?? os.cpus().length),
)
const all = args.includes('--all')
const ids = args.filter((arg) => !arg.startsWith('--'))

const discovered = discoverTestApps()
const knownIds = new Set(discovered.map((app) => app.id))
const unknown = ids.filter((id) => !knownIds.has(id))
if (unknown.length > 0) {
  console.error(`[compile] unknown fixture(s): ${unknown.join(', ')}`)
  console.error(`[compile] available: ${[...knownIds].join(', ')}`)
  process.exit(1)
}

const selected = all || ids.length === 0
  ? discovered
  : ids.map((id) => discovered.find((app) => app.id === id))

if (selected.length === 0) {
  console.error(`[compile] no fixtures found under ${path.join(rootDir, 'tests/apps')}`)
  process.exit(1)
}

const startedAt = Date.now()
let next = 0
let failed = false

function compileApp(app) {
  const outputDir = path.join(appsRootFor(outputRoot), app.id, 'generated')
  return new Promise((resolve) => {
    const started = Date.now()
    const child = spawn(
      process.execPath,
      ['scripts/compile-mini.mjs', app.source, path.relative(rootDir, outputDir)],
      { cwd: rootDir, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    const output = []
    child.stdout.on('data', (chunk) => output.push(chunk.toString()))
    child.stderr.on('data', (chunk) => output.push(chunk.toString()))
    child.on('error', (error) => {
      resolve({ app, ok: false, ms: Date.now() - started, output: String(error) })
    })
    child.on('exit', (code) => {
      resolve({ app, ok: code === 0, ms: Date.now() - started, output: output.join('') })
    })
  })
}

async function worker() {
  while (next < selected.length) {
    const index = next
    next += 1
    const result = await compileApp(selected[index])
    if (!result.ok) {
      failed = true
      console.error(`\n[compile] ✘ ${result.app.source} (${result.ms}ms)`)
      if (result.output.trim()) console.error(result.output.trimEnd())
    } else {
      console.log(`[compile] ✓ ${result.app.source} (${result.ms}ms)`)
    }
  }
}

await Promise.all(Array.from({ length: Math.min(jobs, selected.length) }, () => worker()))

if (failed) {
  process.exit(1)
}

pruneStaleApps(selected)
const registry = writeAppsRegistry(outputRoot, selected)
console.log(
  `[compile] ${selected.length} fixture(s) ready in ${Date.now() - startedAt}ms: ` +
    `${selected.map((app) => app.id).join(', ')}; registry: ${path.relative(rootDir, registry)}`,
)

/**
 * Drop fixtures that are not part of this compile. The test host picks the
 * first registry entry when `?app=` is absent, so a single-fixture workflow
 * (`pnpm dev:wechat-demo`) must not keep yesterday's demo tree around.
 */
function pruneStaleApps(kept) {
  const appsRoot = appsRootFor(outputRoot)
  if (!fs.existsSync(appsRoot)) return
  const keptIds = new Set(kept.map((app) => app.id))
  for (const entry of fs.readdirSync(appsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || keptIds.has(entry.name)) continue
    fs.rmSync(path.join(appsRoot, entry.name), { recursive: true, force: true })
    console.log(`[compile] pruned ${path.relative(rootDir, path.join(appsRoot, entry.name))}`)
  }
}

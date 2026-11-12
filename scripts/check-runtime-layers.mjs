import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(rootDir, 'packages/runtime/src')

function collectFiles(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectFiles(full))
    else if (entry.isFile() && entry.name.endsWith('.ts')) files.push(full)
  }
  return files
}

function resolveLocal(specifier, fromFile) {
  if (!specifier.startsWith('.')) return null
  const base = path.resolve(path.dirname(fromFile), specifier)
  for (const candidate of [`${base}.ts`, path.join(base, 'index.ts')]) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function readImports(file) {
  const source = fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
  const imports = []
  for (const match of source.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)) {
    imports.push(match[1])
  }
  return [...new Set(imports)]
}

const files = collectFiles(srcDir)
const relative = (file) => path.relative(srcDir, file).split(path.sep).join('/')
const graph = new Map()
for (const file of files) {
  const targets = []
  for (const specifier of readImports(file)) {
    const resolved = resolveLocal(specifier, file)
    if (resolved) targets.push(relative(resolved))
  }
  graph.set(relative(file), targets)
}

const rules = [
  {
    name: 'shared primitives must stay below every runtime layer',
    applies: (file) => file.startsWith('shared/'),
    forbidden: (target) => (
      target.startsWith('component/')
      || target.startsWith('tree-protocol/')
      || target.startsWith('service/')
      || target.startsWith('render/')
    ),
  },
  {
    name: 'tree protocol must stay implementation-free',
    applies: (file) => file.startsWith('tree-protocol/'),
    forbidden: (target) => (
      target.startsWith('component/')
      || target.startsWith('service/')
      || target.startsWith('render/')
    ),
  },
  {
    name: 'component domain must not depend on service, render or the wire protocol',
    applies: (file) => file.startsWith('component/'),
    forbidden: (target) => (
      target.startsWith('tree-protocol/')
      || target.startsWith('service/')
      || target.startsWith('render/')
    ),
  },
  {
    name: 'service logic tree must not depend on page runtime, boot or render thread',
    applies: (file) => file.startsWith('service/logic-tree/'),
    forbidden: (target) => (
      target.startsWith('service/page/')
      || target.startsWith('service/app/')
      || target.startsWith('service/api/')
      || target === 'service/boot.ts'
      || target.startsWith('render/')
    ),
  },
  {
    name: 'service render bridge must not depend on page runtime, boot or render thread',
    applies: (file) => file.startsWith('service/render-bridge/'),
    forbidden: (target) => (
      target.startsWith('service/page/')
      || target.startsWith('service/app/')
      || target.startsWith('service/api/')
      || target === 'service/boot.ts'
      || target.startsWith('render/')
    ),
  },
  {
    name: 'service page runtime must use the render port, not logic-tree or protocol internals',
    applies: (file) => file.startsWith('service/page/'),
    forbidden: (target) => (
      target.startsWith('service/logic-tree/')
      || target.startsWith('tree-protocol/')
      || (
        target.startsWith('service/render-bridge/')
        && target !== 'service/render-bridge/port.ts'
      )
      || target.startsWith('render/')
      || target === 'service/boot.ts'
    ),
  },
  {
    name: 'service app helpers must not depend on logic tree, render bridge or boot',
    applies: (file) => file.startsWith('service/app/'),
    forbidden: (target) => (
      target.startsWith('service/logic-tree/')
      || target.startsWith('service/render-bridge/')
      || target === 'service/boot.ts'
      || target.startsWith('render/')
    ),
  },
  {
    name: 'service API globals must not depend on logic tree or render thread',
    applies: (file) => file.startsWith('service/api/'),
    forbidden: (target) => (
      target.startsWith('service/logic-tree/')
      || target.startsWith('service/render-bridge/')
      || (
        target.startsWith('service/app/')
        && target !== 'service/app/types.ts'
        && target !== 'service/app/lifecycle.ts'
      )
      || target === 'service/boot.ts'
      || target.startsWith('render/')
    ),
  },
  {
    name: 'render thread must stay host-only',
    applies: (file) => file.startsWith('render/'),
    forbidden: (target) => (
      target.startsWith('service/')
      || target.startsWith('component/')
    ),
  },
]

// Resolve transitively: a forbidden module may be hidden behind a shared type
// hub or a barrel. Report the shortest import chain so the owner is obvious.
function findForbiddenChain(file, forbidden) {
  const queue = [[file]]
  const seen = new Set([file])
  while (queue.length > 0) {
    const chain = queue.shift()
    const current = chain.at(-1)
    for (const target of graph.get(current) ?? []) {
      if (forbidden(target)) return [...chain, target]
      if (seen.has(target)) continue
      seen.add(target)
      queue.push([...chain, target])
    }
  }
  return null
}

const violations = []
for (const file of graph.keys()) {
  for (const rule of rules) {
    if (!rule.applies(file)) continue
    const chain = findForbiddenChain(file, rule.forbidden)
    if (chain) violations.push(`${chain.join(' -> ')}  (${rule.name})`)
  }
}

if (violations.length > 0) {
  console.error('Runtime layer boundaries are broken:')
  for (const violation of violations) console.error(`  ${violation}`)
  process.exit(1)
}

// The host composes the API table and hands it to the runtime; the API package
// must never look back into the kernel or import its context.
const apiSrcDir = path.join(rootDir, 'packages/api/src')
const apiViolations = []
for (const file of collectFiles(apiSrcDir)) {
  const relativeApi = path.relative(apiSrcDir, file).split(path.sep).join('/')
  for (const specifier of readImports(file)) {
    if (specifier === '@tiny/runtime' || specifier.startsWith('@tiny/runtime/')) {
      apiViolations.push(`${relativeApi} imports ${specifier}`)
    }
  }
}
const apiPackage = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'packages/api/package.json'), 'utf8'),
)
for (const field of ['dependencies', 'devDependencies']) {
  if (apiPackage[field]?.['@tiny/runtime']) {
    apiViolations.push(`packages/api/package.json has @tiny/runtime in ${field}`)
  }
}
if (apiViolations.length > 0) {
  console.error('API boundary is broken (@tiny/api must not depend on @tiny/runtime):')
  for (const violation of apiViolations) console.error(`  ${violation}`)
  process.exit(1)
}

const layers = [
  'shared/                  pure data, assets, events, diagnostics and template types',
  'tree-protocol/           cross-thread tree contract and pure transforms',
  'component/               component definition domain (normalization, behaviors, traits)',
  'service/page/            page stack, navigation, lifecycle and registry',
  'service/app/             App lifecycle helpers, tabBar, preload and subpackages',
  'service/api/             global registration and host-facing API types',
  'service/logic-tree/      service-side glass-easel logic tree',
  'service/render-bridge/   service-side projection, scheduling, WXS and render RPCs',
  'render/                  render-thread entry and pageframe contract',
]
console.log('Runtime layer boundaries OK:')
for (const line of layers) console.log(`  ${line}`)
console.log('API boundary OK: @tiny/api depends on @tiny/bridge + @tiny/manifest only.')

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

const rules = [
  {
    name: 'component domain is shared and must not depend on service or tree',
    applies: (file) => file.startsWith('component/'),
    forbidden: (target) => target.startsWith('service/') || target.startsWith('tree/'),
  },
  {
    name: 'service entry must not import the tree protocol or implementation',
    applies: (file) => file === 'service/thread.ts',
    forbidden: (target) => target.startsWith('tree/'),
  },
  {
    name: 'service runtime (outside service/render) must not import tree modules',
    applies: (file) => file.startsWith('service/') && !file.startsWith('service/render/'),
    forbidden: (target) => target.startsWith('tree/'),
  },
  {
    name: 'service/render is the only layer allowed to depend on tree logic/protocol',
    applies: (file) => file.startsWith('service/render/'),
    forbidden: (target) => (
      target.startsWith('service/') && !target.startsWith('service/render/')
    ),
  },
  {
    name: 'service runtime depends on the render port, not the bridge facade',
    applies: (file) => (
      file.startsWith('service/')
      && !file.startsWith('service/render/')
      && file !== 'service/thread.ts'
    ),
    forbidden: (target) => target === 'service/render/bridge.ts',
  },
  {
    name: 'service render helpers must not depend on the bridge facade',
    applies: (file) => (
      file.startsWith('service/render/')
      && file !== 'service/render/bridge.ts'
      && file !== 'service/render/index.ts'
    ),
    forbidden: (target) => target === 'service/render/bridge.ts',
  },
  {
    name: 'tree/logic must not depend on the service runtime',
    applies: (file) => file.startsWith('tree/logic/'),
    forbidden: (target) => target.startsWith('service/'),
  },
  {
    name: 'tree/render must stay host-only (no service, component or logic internals)',
    applies: (file) => file.startsWith('tree/render/'),
    forbidden: (target) => (
      target.startsWith('service/')
      || target.startsWith('component/')
      || target.startsWith('tree/logic/')
    ),
  },
  {
    name: 'tree protocol helpers must not depend on runtime implementations',
    applies: (file) => [
      'tree/protocol.ts',
      'tree/flow.ts',
      'tree/diff.ts',
      'tree/locator.ts',
      'tree/animation.ts',
    ].includes(file),
    forbidden: (target) => (
      target.startsWith('service/')
      || target.startsWith('tree/logic/')
      || target.startsWith('tree/render/')
    ),
  },
]

const violations = []
for (const file of collectFiles(srcDir)) {
  const relative = path.relative(srcDir, file).split(path.sep).join('/')
  for (const specifier of readImports(file)) {
    const resolved = resolveLocal(specifier, file)
    if (!resolved) continue
    const target = path.relative(srcDir, resolved).split(path.sep).join('/')
    for (const rule of rules) {
      if (!rule.applies(relative) || !rule.forbidden(target)) continue
      violations.push(`${relative} -> ${target}  (${rule.name})`)
    }
  }
}

if (violations.length > 0) {
  console.error('Runtime layer boundaries are broken:')
  for (const violation of violations) console.error(`  ${violation}`)
  process.exit(1)
}

const layers = [
  'service/          application runtime: page stack, routing, tabBar, component tree, API globals',
  'service/render/   service render: logic tree, schemas/definitions, flow/patch, WXS, tree events, RPCs',
  'tree/protocol     wire contract: nodes, patches, message constants',
  'tree/logic/       service-side logic tree internals (glass-easel backend)',
  'tree/render/      host render thread and native renderer',
  'component/        shared component domain: definitions, generics, behaviors, observers',
]
console.log('Runtime layer boundaries OK:')
for (const line of layers) console.log(`  ${line}`)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entries = [
  path.join(rootDir, 'packages/runtime/src/index.ts'),
  path.join(rootDir, 'packages/wxs-runtime/src/index.ts'),
]
const hostModules = new Set(['browser'])
const hostGlobals = [
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'HTMLCanvasElement',
  'HTMLImageElement',
  'Image',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'MessageChannel',
  'postMessage',
  'indexedDB',
  'XMLHttpRequest',
  'WebSocket',
  'fetch',
  'performance',
  'OffscreenCanvas',
  'getComputedStyle',
  'HTMLElement',
  'MessagePort',
  'devicePixelRatio',
  'CustomEvent',
  'process',
  'Buffer',
  'require',
]

function resolveRelative(specifier, fromFile) {
  if (!specifier.startsWith('.')) return null
  const base = path.resolve(path.dirname(fromFile), specifier)
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

const visited = new Set()
const files = []
const hostPackagePrefixes = ['@tiny/host-']
function visit(file) {
  const normalized = path.normalize(file)
  if (visited.has(normalized)) return
  visited.add(normalized)
  files.push(normalized)
  const source = fs.readFileSync(normalized, 'utf8')
  for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const specifier = match[1]
    for (const hostPrefix of hostPackagePrefixes) {
      if (specifier.startsWith(hostPrefix)) {
        throw new Error(`${path.relative(rootDir, normalized)} imports host package "${specifier}"`)
      }
    }
    for (const hostModule of hostModules) {
      if (specifier.includes(hostModule)) {
        throw new Error(`${path.relative(rootDir, normalized)} imports browser module "${specifier}"`)
      }
    }
    const resolved = resolveRelative(specifier, normalized)
    if (resolved) visit(resolved)
  }
}

for (const entry of entries) visit(entry)

const pattern = new RegExp(`\\b(${hostGlobals.join('|')})\\b`)
// `glassEasel.Element` is a framework type; only a bare DOM `Element` is a
// host dependency.
const bareElement = /(?<![.\w$])Element\b/
const violations = []
for (const file of files) {
  const source = stripComments(fs.readFileSync(file, 'utf8'))
  for (const [index, line] of source.split('\n').entries()) {
    const match = line.match(pattern)
    if (match) {
      // WXS modules expose a language-level `require`; this is not Node's
      // CommonJS loader and is implemented inside the host-independent kernel.
      if (match[1] === 'require' && file.includes('packages/wxs-runtime/')) continue
      violations.push(`${path.relative(rootDir, file)}:${index + 1}: ${match[1]} -> ${line.trim()}`)
      continue
    }
    if (bareElement.test(line)) {
      violations.push(`${path.relative(rootDir, file)}:${index + 1}: Element -> ${line.trim()}`)
    }
  }
}

if (violations.length > 0) {
  console.error('Runtime core is not host-independent:')
  for (const violation of violations) console.error(`  ${violation}`)
  process.exit(1)
}

console.log(`Runtime core purity OK (${files.length} modules, no host globals or @tiny/host-* imports).`)

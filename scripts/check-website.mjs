import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../website/dist')
const indexPath = path.join(rootDir, 'index.html')

if (!fs.existsSync(indexPath)) {
  console.error('Website build missing: website/dist/index.html')
  process.exit(1)
}

const html = fs.readFileSync(indexPath, 'utf8')
const problems = []
for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const target = match[1]
  if (/^(?:https?:|mailto:|data:|#)/.test(target)) continue
  if (target.startsWith('/')) {
    problems.push(`root-absolute asset path: ${target}`)
    continue
  }
  const file = path.resolve(path.dirname(indexPath), target.split(/[?#]/)[0])
  if (!file.startsWith(rootDir + path.sep)) {
    problems.push(`asset escapes dist: ${target}`)
  } else if (!fs.existsSync(file)) {
    problems.push(`missing asset: ${target}`)
  }
}

const hasScript = /<script[^>]+src="[^"]+"/.test(html)
const hasRoot = /<div id="root"><\/div>/.test(html)
if (!hasScript) problems.push('no emitted JS entry')
if (!hasRoot) problems.push('missing #root mount point')

if (problems.length > 0) {
  console.error('Website build check failed:')
  for (const item of problems) console.error(`- ${item}`)
  process.exit(1)
}
console.log('Website build OK (relative assets, #root, JS entry)')

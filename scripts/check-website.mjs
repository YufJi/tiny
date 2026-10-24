import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../website')
const htmlFiles = []
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (entry.name.endsWith('.html')) htmlFiles.push(file)
  }
}
walk(rootDir)

const missing = []
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = match[1]
    if (/^(?:https?:|mailto:|data:|#)/.test(target)) continue
    const [relative] = target.split(/[?#]/)
    if (!relative) continue
    const resolved = path.resolve(path.dirname(file), relative)
    if (!fs.existsSync(resolved)) {
      missing.push(`${path.relative(rootDir, file)} -> ${target}`)
    }
  }
}

if (missing.length > 0) {
  console.error('Website link check failed:')
  for (const item of missing) console.error(`- ${item}`)
  process.exitCode = 1
} else {
  console.log(`Website links OK (${htmlFiles.length} pages)`)
}

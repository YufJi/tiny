import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compareTraces } from './parity-trace-normalize.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(repoRoot, 'tests/host/generated/parity')

function runJsonScript(script, env = {}) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, script)], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(
      `${script} exited with ${result.status}\n${result.stdout}\n${result.stderr}`,
    )
  }
  const start = result.stdout.indexOf('{')
  if (start < 0) throw new Error(`${script} returned no JSON:\n${result.stdout}`)
  return JSON.parse(result.stdout.slice(start))
}

function writeJson(name, value) {
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`)
}

const tiny = runJsonScript('scripts/wechat-parity-trace.mjs')
const wechat = runJsonScript('scripts/wechat-parity-oracle.mjs')
const comparison = compareTraces(tiny.trace, wechat.trace)

writeJson('tiny-trace.json', tiny)
writeJson('wechat-trace.json', wechat)
writeJson('tiny-trace.normalized.json', comparison.left)
writeJson('wechat-trace.normalized.json', comparison.right)
writeJson('trace-comparison.json', {
  same: comparison.same,
  differences: comparison.differences ?? [],
})

if (!comparison.same) {
  console.error(JSON.stringify({
    message: 'WeChat/Tiny parity trace differs',
    differences: comparison.differences,
    report: path.join(outputDir, 'trace-comparison.json'),
  }, null, 2))
  process.exitCode = 1
} else {
  console.log(`WeChat/Tiny trace is 1:1 (${comparison.left.length} checkpoints)`)
}

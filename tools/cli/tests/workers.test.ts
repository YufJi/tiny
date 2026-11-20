import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { compileMiniProgram } from '../src'

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures/mini',
)

let sourceDir: string
let outputDir: string

beforeAll(async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-workers-'))
  sourceDir = path.join(root, 'app')
  outputDir = path.join(root, 'out')
  await fs.cp(fixtureDir, sourceDir, { recursive: true })
  const appJson = JSON.parse(await fs.readFile(path.join(sourceDir, 'app.json'), 'utf8'))
  await fs.writeFile(
    path.join(sourceDir, 'app.json'),
    JSON.stringify({ ...appJson, workers: 'workers' }, null, 2),
  )
  await fs.mkdir(path.join(sourceDir, 'workers/fib'), { recursive: true })
  await fs.writeFile(
    path.join(sourceDir, 'workers/fib/index.js'),
    'worker.onMessage(function (msg) { worker.postMessage({ result: msg.n }) })\n',
  )
  await compileMiniProgram({ sourceDir, outputDir, clean: true })
})

afterAll(async () => {
  await fs.rm(path.dirname(sourceDir), { recursive: true, force: true })
})

describe('app.json workers', () => {
  test('records the workers root in the manifest', async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8'))
    expect(manifest.app?.workers).toBe('workers')
    expect(manifest.assets.map((asset: { path: string }) => asset.path)).toContain(
      'workers/fib/index.js',
    )
  })

  test('copies worker scripts verbatim instead of bundling them', async () => {
    const source = await fs.readFile(path.join(outputDir, 'workers/fib/index.js'), 'utf8')
    expect(source).toContain('worker.onMessage')
    expect(source).toContain('worker.postMessage')
  })
})

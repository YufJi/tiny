import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const project = path.join(repoRoot, 'tests/apps/wechat-parity')
const clientName = process.env.WECHATIDE_CLIENT ?? 'Codex'
const wechatide = process.env.WECHATIDE_BIN ?? 'wechatide'
const settleMs = Number(process.env.WECHAT_PARITY_SETTLE_MS ?? 800)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function parseToolOutput(output, tool) {
  const start = output.indexOf('{')
  if (start < 0) throw new Error(`${tool} returned no JSON:\n${output}`)
  const parsed = JSON.parse(output.slice(start))
  if (parsed.ok !== true) {
    throw new Error(`${tool} failed:\n${output}`)
  }
  return parsed.result
}

function runTool(tool, args = []) {
  const result = spawnSync(
    wechatide,
    ['-c', clientName, tool, '--project', project, ...args],
    { encoding: 'utf8' },
  )
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(
      `${tool} exited with ${result.status}\n${result.stdout}\n${result.stderr}`,
    )
  }
  return parseToolOutput(
    result.stdout.includes('{') ? result.stdout : result.stderr,
    tool,
  )
}

function readText(selector) {
  return runTool('automation_element_action', [
    '--action', 'text',
    '--selector', selector,
    '--wait-for-selector', selector,
  ])
}

async function tap(selector) {
  runTool('automation_element_action', [
    '--action', 'tap',
    '--selector', selector,
    '--wait-for-selector', selector,
  ])
  await sleep(settleMs)
}

async function snapshot(label, pageKind) {
  const page = await readText('.page-state')
  if (pageKind === 'b') {
    return {
      label,
      page,
      event: null,
      components: [await readText('.probe-b')],
    }
  }
  return {
    label,
    page,
    event: await readText('.event-state'),
    components: [
      await readText('.probe-one'),
      await readText('.probe-two'),
    ],
  }
}

async function main() {
  runTool('automation_navigate', [
    '--action', 'reLaunch',
    '--url', '/pages/a/a',
    '--wait-for-selector', '.page-state',
  ])
  await sleep(settleMs)

  const trace = []
  trace.push(await snapshot('A-initial', 'a'))
  await tap('.hit-wxs')
  trace.push(await snapshot('A-after-event', 'a'))
  await tap('.to-b')
  trace.push(await snapshot('B-initial', 'b'))
  await tap('.back')
  trace.push(await snapshot('A-back', 'a'))
  await tap('.relaunch')
  trace.push(await snapshot('A-relaunch', 'a'))
  console.log(JSON.stringify({ oracle: 'wechat', trace }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exitCode = 1
})

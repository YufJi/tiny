import { bootServiceThread as bootRealServiceThread } from '../../src/service/thread'
import type { ServiceThreadRuntime } from '../../src/service/types'
import type { TemplateRegistry } from '../../src/types'

type HarnessConfig = {
  templates: TemplateRegistry
  loadStyle: (path: string) => string
}

let active: HarnessConfig | undefined
let waiter: ((config: HarnessConfig) => void) | undefined
let lastTree: unknown

export function provideHarnessConfig(config: HarnessConfig): void {
  active = config
  const resolve = waiter
  waiter = undefined
  resolve?.(config)
}

async function currentConfig(): Promise<HarnessConfig> {
  if (active) return active
  return new Promise((resolve) => {
    waiter = resolve
  })
}

export function lastLogicTree(): Record<string, unknown> {
  return (lastTree ?? {}) as Record<string, unknown>
}

export function bootServiceThread(options: Parameters<typeof bootRealServiceThread>[0]): ServiceThreadRuntime {
  return bootRealServiceThread({
    ...options,
    onLogicTreeCreated: (tree) => {
      lastTree = tree
    },
    loadTemplates: async () => (await currentConfig()).templates,
    loadStyle: (path) => active?.loadStyle(path) ?? '',
  })
}

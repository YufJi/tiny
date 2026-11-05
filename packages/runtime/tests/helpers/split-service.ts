import { createApiHost } from '@tiny/api'
import { bootServiceThread as bootRealServiceThread } from '../../src/service/thread'
import type { ServiceApiFactory, ServiceThreadRuntime } from '../../src/service/types'
import type { TemplateRegistry } from '../../src/types'

type HarnessConfig = {
  templates: TemplateRegistry
  loadStyle: (path: string) => string
}

type ServiceThreadBootOptions = Omit<
  Parameters<typeof bootRealServiceThread>[0],
  'apiHost'
> & {
  /** Defaults to the standard WeChat-compatible API table. */
  apiHost?: ServiceApiFactory
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

export function bootServiceThread(options: ServiceThreadBootOptions): ServiceThreadRuntime {
  return bootRealServiceThread({
    ...options,
    apiHost: options.apiHost ?? createApiHost,
    onLogicTreeCreated: (tree) => {
      lastTree = tree
    },
    loadTemplates: async () => (await currentConfig()).templates,
    loadStyle: (path) => active?.loadStyle(path) ?? '',
  })
}

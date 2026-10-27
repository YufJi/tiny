import { bootTreeThread, type TreeRenderer, type TreeThreadOptions } from '../../src/tree/render/thread'
import type { Manifest } from '@tiny/manifest'
import type { StyleLoader, TemplateRegistry } from '../../src/types'
import { lastLogicTree, provideHarnessConfig } from './split-service'

export type SplitTreeHarnessOptions = {
  transport: TreeThreadOptions['transport']
  manifest: Manifest
  artifacts: { templates: TemplateRegistry }
  initialPath?: string
  loadStyle?: StyleLoader
}

export type RenderThreadRuntime = {
  connection: ReturnType<typeof bootTreeThread>['connection']
  adapter: Record<string, unknown>
  manifest: Manifest
  currentPath: string
}

const noopRenderer: TreeRenderer = {
  mount() {},
  applyPatches() {},
  applyStyles() {},
  setEventSink() {},
  setDiagnosticSink() {},
  setPagePath() {},
  inspectTree: () => null,
  measure: () => ({}),
  query: () => [],
}

export function bootSplitTreeHarness(options: SplitTreeHarnessOptions): RenderThreadRuntime {
  provideHarnessConfig({
    templates: options.artifacts.templates,
    loadStyle: options.loadStyle ?? (() => ''),
  })
  const runtime = bootTreeThread({ transport: options.transport, renderer: noopRenderer })
  return {
    adapter: new Proxy({} as Record<string, unknown>, {
      get: (_target, property: string) => {
        const tree = lastLogicTree()
        const value = tree[property]
        return typeof value === 'function' ? value.bind(tree) : value
      },
    }),
    connection: runtime.connection,
    manifest: options.manifest,
    currentPath: options.initialPath,
  }
}

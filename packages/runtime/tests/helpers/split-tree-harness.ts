import { bootTreeThread, type TreeRenderer } from '../../src/tree-thread'
import type { Manifest } from '@tiny/manifest'
import type { RenderThreadOptions } from '../../src/types'
import { lastLogicTree, provideHarnessConfig } from './split-service'

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

export function bootSplitTreeHarness(options: RenderThreadOptions): RenderThreadRuntime {
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

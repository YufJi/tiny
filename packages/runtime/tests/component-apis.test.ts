import { describe, expect, test, vi } from 'vitest'
import { normalizeComponentDefinition } from '../src/component-definition'
import { MiniProgramComponentInstance } from '../src/service/component-instance'
import type { ComponentRuntimeContext } from '../src/service/types'

function createHarness() {
  const patches: Array<Record<string, unknown>> = []
  const events: Array<{ name: string; options?: Record<string, unknown> }> = []
  const runtime: ComponentRuntimeContext = {
    pageId: 'page-1',
    tree: {} as never,
    relations: {} as never,
    getInstance: () => undefined,
    onDiagnostic: () => undefined,
    createSelectorQuery: (componentId) => ({ scope: componentId }),
    createIntersectionObserver: (componentId, options) => ({ scope: componentId, options }),
    flushDataPatches: vi.fn(),
  }
  const instance = new MiniProgramComponentInstance(
    'component-1',
    'components/probe/index',
    normalizeComponentDefinition({ data: {} }, 'components/probe/index'),
    {},
    runtime,
    {
      onDataPatch: (_componentId, patch) => patches.push(patch),
      onTriggerEvent: (_componentId, name, _detail, options) => events.push({ name, options }),
    },
  )
  return { instance, runtime, patches, events }
}

describe('component instance APIs', () => {
  test('scopes selector queries and intersection observers to the component', () => {
    const { instance } = createHarness()
    expect(instance.createSelectorQuery()).toEqual({ scope: 'component-1' })
    expect(instance.createIntersectionObserver({ thresholds: [0.5], observeAll: true })).toEqual({
      scope: 'component-1',
      options: { thresholds: [0.5], observeAll: true },
    })
  })

  test('groupSetData runs the callback and flushes queued patches', () => {
    const { instance, runtime } = createHarness()
    instance.groupSetData(() => undefined)
    expect(runtime.flushDataPatches).toHaveBeenCalledTimes(1)
  })

  test('triggerEvent drops undefined option values before the bridge', () => {
    const { instance, events } = createHarness()
    instance.triggerEvent('click', { value: 1 }, {
      bubbles: true,
      composed: undefined as unknown as boolean,
    })
    expect(events).toEqual([{ name: 'click', options: { bubbles: true } }])
  })
})

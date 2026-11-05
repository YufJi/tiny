import { afterEach, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { createGlassRenderTree } from '../src/render-tree'

const probeDefinition = {
  'components/probe/probe': {
    path: 'components/probe/probe',
    properties: { label: { type: String, value: '' } },
  },
} as const

function componentNode(extra: Record<string, unknown> = {}): any {
  return {
    type: 'element',
    id: 'probe',
    tag: 'probe',
    component: true,
    componentPath: 'components/probe/probe',
    ...extra,
  }
}

afterEach(() => {
  delete (globalThis as unknown as Record<string, unknown>).__tinyWxsObservations
})

describe('WXS render-side dispatch', () => {
  test('drives custom-component change:prop observers from component data', () => {
    const observations: unknown[] = []
    ;(globalThis as unknown as Record<string, unknown>).__tinyWxsObservations = observations
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.setComponentDefinitions?.(probeDefinition as never)
    tree.setWxsModules?.({
      modules: [{
        id: 'pages/index/index.wxs',
        code: 'module.exports = { observe: function (next, previous) { globalThis.__tinyWxsObservations.push([next, previous]) } }',
      }],
    })
    tree.mount({
      type: 'element',
      id: 'root',
      tag: 'view',
      children: [componentNode({
        props: {
          label: 2,
          [TINY_ENGINE_NAMING.wxsPropsAttribute]: JSON.stringify([
            { prop: 'label', moduleId: 'pages/index/index.wxs', exportPath: ['observe'] },
          ]),
        },
      })],
    })

    tree.setComponentData?.({ probe: { label: 2 } })
    tree.setComponentData?.({ probe: { label: 5 } })

    // One initial call with no previous value, then the changed value. The
    // observer reads component data, not the node attributes.
    expect(observations).toEqual([['2', undefined], ['5', '2']])
  })

  test('drives built-in change:prop observers from node props with shared getState', () => {
    const observations: unknown[] = []
    ;(globalThis as unknown as Record<string, unknown>).__tinyWxsObservations = observations
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.setWxsModules?.({
      modules: [{
        id: 'pages/index/index.wxs',
        code: 'module.exports = { observe: function (next, previous, ins) { var state = ins.getState(); state.calls = (state.calls || 0) + 1; globalThis.__tinyWxsObservations.push([next, previous, state.calls]) } }',
      }],
    })
    tree.mount({
      type: 'element',
      id: 'root',
      tag: 'view',
      children: [{
        type: 'element',
        id: 'target',
        tag: 'view',
        props: {
          prop: 1,
          [TINY_ENGINE_NAMING.wxsPropsAttribute]: JSON.stringify([
            { prop: 'prop', moduleId: 'pages/index/index.wxs', exportPath: ['observe'] },
          ]),
        },
      }],
    })
    tree.applyPatches([{ type: 'props', target: 'target', props: { prop: 2 } }])

    // Initial call with no previous value, then the changed value; getState
    // persists across both calls.
    expect(observations).toEqual([[1, undefined, 1], [2, 1, 2]])
  })

  test('does not forward a service-triggered custom event back to the service', () => {
    const events: unknown[] = []
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.setComponentDefinitions?.(probeDefinition as never)
    tree.setEventSink?.((event) => events.push(event))
    tree.mount({
      type: 'element',
      id: 'root',
      tag: 'view',
      children: [componentNode({ props: {}, events: [{ name: 'probe' }] })],
    })

    // The service already ran these listeners; the render tree must only run
    // WXS handlers and stay silent, otherwise the event loops forever.
    tree.dispatchCustomEvent?.({
      componentId: 'probe',
      name: 'probe',
      detail: { value: 1 },
      options: { bubbles: true, composed: true },
    })

    expect(events).toEqual([])
  })
})

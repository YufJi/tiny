import { describe, expect, test } from 'vitest'
import { BridgeConnection, createInMemoryTransportPair } from '@tiny/bridge'
import { bootTreeThread } from '../src/tree/render/thread'
import { createRenderConnection } from './helpers/render-connection'
import { QUERY_CONTROL, type RenderNode, type RenderPatch } from '../src/tree/protocol'

const tree: RenderNode = {
  type: 'element',
  id: 'page',
  tag: 'page',
  children: [{ type: 'text', id: 'text', text: 'hello' }],
}

describe('tree thread', () => {
  test('builds the render mirror from component-flow messages', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const mounted: RenderNode[] = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mount: (root) => mounted.push(root),
        applyPatches: () => {},
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()
    host.sendEvent('tree', 'flow', {
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      styles: [],
      messages: [
        { type: 'define', path: 'components/card/card', definition: {} },
        {
          type: 'tree',
          root: {
            type: 'element',
            id: 'page',
            tag: 'page',
            children: [{
              type: 'element',
              id: 'view',
              tag: 'view',
              children: [
                { type: 'text', text: 'flow' },
                { type: 'element', tag: 'card', slot: 'refresher', props: { label: 'flow' } },
              ],
            }],
          },
        },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mounted).toHaveLength(1)
    expect(mounted[0]).toMatchObject({
      type: 'element',
      id: 'page',
      children: [{
        type: 'element',
        id: 'view',
        children: [
          { type: 'text', text: 'flow' },
          { type: 'element', tag: 'card', slot: 'refresher', props: { label: 'flow' } },
        ],
      }],
    })
  })

  test('mounts the pageframe from templates and sends data without replaying patches', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const mounted: RenderNode[] = []
    const pageFrames: Array<Record<string, unknown>> = []
    const pageData: Array<Record<string, unknown>> = []
    const pageDataPatches: Array<Array<Record<string, unknown>>> = []
    const componentData: Array<Record<string, Record<string, unknown>>> = []
    const patches: RenderPatch[][] = []
    bootTreeThread({
      pageFrame: true,
      connection: createRenderConnection(renderTransport),
      renderer: {
        mount: (root) => mounted.push(root),
        mountPage: (request) => pageFrames.push(request as unknown as Record<string, unknown>),
        applyPatches: (value) => patches.push(value),
        setPageData: (value) => pageData.push(value),
        applyPageDataPatches: (value) => pageDataPatches.push(value),
        setComponentData: (value) => componentData.push(value),
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()
    host.sendEvent('tree', 'flow', {
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      pageData: { title: 'first' },
      pageUsing: { card: 'components/card/card' },
      pageScope: 'page-scope',
      pageFrame: { methods: ['onTap'], rootViewId: 'view-root' },
      messages: [
        {
          type: 'tree',
          root: {
            type: 'element',
            id: 'page-1',
            tag: 'page',
            children: [{ type: 'text', id: 'text', text: 'first' }],
          },
        },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    host.sendEvent('tree', 'patch', {
      pageId: 'page-1',
      rootViewId: 'view-root',
      pageData: { title: 'second' },
      pageDataPatches: [{ title: 'second' }],
      componentData: { 'component-1': { value: 2 } },
      patches: [{ type: 'text', target: 'text', text: 'second' }],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mounted).toHaveLength(0)
    expect(patches).toHaveLength(0)
    expect(pageFrames[0]).toMatchObject({
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      data: { title: 'first' },
      using: { card: 'components/card/card' },
      scope: 'page-scope',
      methods: ['onTap'],
      renderHints: {
        id: 'page-1',
        children: [{ id: 'text', text: 'first' }],
      },
    })
    expect(pageData).toEqual([{ title: 'first' }])
    expect(pageDataPatches).toEqual([[{ title: 'second' }]])
    expect(componentData).toEqual([{ 'component-1': { value: 2 } }])
  })

  test('mounts and patches an independent tabBar root', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const mounted: RenderNode[] = []
    const mountedTabBar: RenderNode[] = []
    const tabPatches: RenderPatch[][] = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mount: (root) => mounted.push(root),
        mountTabBar: (root) => mountedTabBar.push(root),
        applyPatches: () => {},
        applyTabBarPatches: (patches) => tabPatches.push(patches),
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()
    host.sendEvent('tree', 'flow', {
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      styles: [],
      tabRoot: {
        type: 'element',
        id: 'tab-bar',
        tag: 'custom-tab-bar',
        component: true,
        componentPath: 'custom-tab-bar/index',
      },
      messages: [
        { type: 'tree', root: tree },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    host.sendEvent('tree', 'patch', {
      pageId: 'page-1',
      patches: [],
      tabPatches: [{ type: 'text', target: 'tab-bar#0', text: 'home' }],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mounted).toHaveLength(1)
    expect(mountedTabBar).toHaveLength(1)
    expect(mountedTabBar[0]).toMatchObject({
      component: true,
      componentPath: 'custom-tab-bar/index',
    })
    expect(tabPatches).toEqual([[
      { type: 'text', target: 'tab-bar#0', text: 'home' },
    ]])
  })

  test('replaces an undefined component with its componentPlaceholder', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const mounted: RenderNode[] = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mount: (root) => mounted.push(root),
        applyPatches: () => {},
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()
    host.sendEvent('tree', 'flow', {
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      styles: [],
      placeholders: { 'components/card/card': 'view' },
      messages: [
        {
          type: 'tree',
          root: {
            type: 'element',
            id: 'page',
            tag: 'page',
            children: [{
              type: 'element',
              tag: 'card',
              component: true,
              componentPath: 'components/card/card',
              props: { label: 'loading' },
              children: [{ type: 'text', text: 'placeholder' }],
            }],
          },
        },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mounted).toHaveLength(1)
    const placeholder = (mounted[0] as { children: Array<Record<string, unknown>> }).children[0]!
    expect(placeholder).toMatchObject({
      tag: 'view',
      props: { label: 'loading' },
      children: [{ type: 'text', text: 'placeholder' }],
    })
    expect(placeholder.component).toBeUndefined()
    expect(placeholder.componentPath).toBeUndefined()
  })

  test('receives snapshots/patches and sends render events', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const mounted: RenderNode[] = []
    const patches: RenderPatch[][] = []
    const events: unknown[] = []
    let emit: ((event: unknown) => void) | undefined

    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      initialPageId: 'page-1',
      renderer: {
        mount: (root) => mounted.push(root),
        applyPatches: (value) => patches.push(value),
        setEventSink: (sink) => {
          emit = sink as (event: unknown) => void
        },
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    host.onEvent('tree', 'event', (message) => events.push(message.payload))
    await host.handshake()

    host.sendEvent('tree', 'snapshot', { root: tree }, { pageId: 'page-1' })
    host.sendEvent('tree', 'patch', {
      patches: [{ type: 'text', target: 'text', text: 'bye' }],
    }, { pageId: 'page-1' })
    emit?.({ id: 'button', name: 'tap', native: { clientX: 1 } })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mounted).toHaveLength(1)
    expect(patches[0]).toEqual([{ type: 'text', target: 'text', text: 'bye' }])
    expect(events[0]).toMatchObject({
      id: 'button',
      name: 'tap',
      pageId: 'page-1',
      native: { clientX: 1 },
    })
  })

  test('bridges intersection observers to the renderer', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const entries: unknown[] = []
    let observed: Record<string, unknown> | undefined
    let cleaned = false
    const rect = () => ({ left: 0, top: 0, right: 120, bottom: 40, width: 120, height: 40 })

    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      initialPageId: 'page-1',
      renderer: {
        mount: () => {},
        applyPatches: () => {},
        observeIntersection: (request, emit) => {
          observed = request as unknown as Record<string, unknown>
          emit([{
            viewId: 'view',
            boundingClientRect: rect(),
            intersectionRect: rect(),
            relativeRect: rect(),
            intersectionRatio: 1,
            time: 1,
          }])
          return () => { cleaned = true }
        },
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    host.onEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, (message) => {
      entries.push(message.payload)
    })
    await host.handshake()

    const result = await host.control(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, {
      action: 'observe',
      observerId: 'observer-1',
      viewIds: ['view'],
      thresholds: [0.5],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(result).toMatchObject({ status: 'observing' })
    expect(observed).toMatchObject({ observerId: 'observer-1', viewIds: ['view'], thresholds: [0.5] })
    expect(entries[0]).toMatchObject({
      observerId: 'observer-1',
      entries: [{ viewId: 'view', intersectionRatio: 1 }],
    })

    await host.control(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, {
      action: 'disconnect',
      observerId: 'observer-1',
    }, { pageId: 'page-1' })
    expect(cleaned).toBe(true)
  })

  test('parks flows until templates are installed', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const order: string[] = []
    let release!: (templates: unknown) => void
    const templatesReady = new Promise((resolve) => { release = resolve })
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      loadTemplates: () => templatesReady as never,
      renderer: {
        mount: () => order.push('mount'),
        applyPatches: () => {},
        setTemplates: () => order.push('templates'),
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()
    host.sendEvent('tree', 'flow', {
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      styles: [],
      messages: [
        { type: 'tree', root: { type: 'element', id: 'page', tag: 'page' } },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    // Nothing may mount before the template groups exist.
    expect(order).toEqual([])

    release({ groupList: {}, content: () => ({}) })
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order).toEqual(['templates', 'mount'])
  })

  test('parks patches behind the template gate too', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const order: string[] = []
    let release!: (templates: unknown) => void
    const templatesReady = new Promise((resolve) => { release = resolve })
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      loadTemplates: () => templatesReady as never,
      renderer: {
        mount: () => order.push('mount'),
        applyPatches: () => order.push('patch'),
        setTemplates: () => order.push('templates'),
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()
    host.sendEvent('tree', 'flow', {
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      styles: [],
      messages: [
        { type: 'tree', root: { type: 'element', id: 'page', tag: 'page' } },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    // `onReady` can raise `setData` before the render thread finished loading
    // templates; the patch must wait for the flow that mounts the page, or it
    // is applied to an empty tree and lost.
    host.sendEvent('tree', 'patch', {
      pageId: 'page-1',
      patches: [{ type: 'text', target: 'text', text: 'ready' }],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order).toEqual([])

    release({ groupList: {}, content: () => ({}) })
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order).toEqual(['templates', 'mount', 'patch'])
  })
})

import { describe, expect, test } from 'vitest'
import { BridgeConnection, createInMemoryTransportPair } from '@tiny/bridge'
import { bootTreeThread } from '../src/render/thread'
import { createRenderConnection } from './helpers/render-connection'
import {
  COMPONENT_CONTROL,
  QUERY_CONTROL,
  TREE_PROTOCOL,
  type PageFrameMount,
  type RenderNode,
} from '../src/tree-protocol/protocol'

const tree: RenderNode = {
  type: 'element',
  id: 'page',
  tag: 'page',
  children: [{ type: 'text', id: 'text', text: 'hello' }],
}

describe('tree thread', () => {
  test('mounts pageframe hints from component-flow messages', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const pageFrames: PageFrameMount[] = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mountPage: (request) => pageFrames.push(request),
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
      pageFrame: { rootViewId: 'page' },
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
    expect(pageFrames).toHaveLength(1)
    expect(pageFrames[0]?.renderHints).toMatchObject({
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
    const pageFrames: Array<Record<string, unknown>> = []
    const pageData: Array<Record<string, unknown>> = []
    const pageDataPatches: Array<Array<Record<string, unknown>>> = []
    const componentData: Array<Record<string, Record<string, unknown>>> = []
    const pageFrameHints: RenderNode[] = []
    const componentFlow: Array<Array<{ id: string; path: string }>> = []
    const renderOrder: string[] = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mountPage: (request) => pageFrames.push(request as unknown as Record<string, unknown>),
        setPageData: (value) => pageData.push(value),
        applyPageDataPatches: (value) => {
          pageDataPatches.push(value)
          renderOrder.push('pageDataPatches')
        },
        setComponentData: (value) => {
          componentData.push(value)
          renderOrder.push('componentData')
        },
        setPageFrameHints: (root) => {
          pageFrameHints.push(root)
          renderOrder.push('pageFrameHints')
        },
        setPageFrameComponents: (components) => {
          componentFlow.push(components)
          renderOrder.push('componentFlow')
        },
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
      componentFlow: [{ id: 'component-1', path: 'components/card/card' }],
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
    renderOrder.length = 0
    host.sendEvent('tree', 'patch', {
      pageId: 'page-1',
      rootViewId: 'view-root',
      pageData: { title: 'second' },
      pageDataPatches: [{ title: 'second' }],
      componentData: { 'component-1': { value: 2 } },
      componentFlow: [{ id: 'component-1', path: 'components/card/card' }],
      renderHints: {
        type: 'element',
        id: 'view-root',
        tag: 'page',
        children: [{ type: 'text', id: 'text-2', text: 'second' }],
      },
      patches: [{ type: 'text', target: 'text', text: 'second' }],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(pageFrames[0]).toMatchObject({
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      data: { title: 'first' },
      using: { card: 'components/card/card' },
      scope: 'page-scope',
      componentFlow: [{ id: 'component-1', path: 'components/card/card' }],
      methods: ['onTap'],
      renderHints: {
        id: 'page-1',
        children: [{ id: 'text', text: 'first' }],
      },
    })
    expect(pageData).toEqual([{ title: 'first' }])
    expect(pageDataPatches).toEqual([[{ title: 'second' }]])
    expect(componentData).toEqual([{ 'component-1': { value: 2 } }])
    expect(pageFrameHints).toHaveLength(1)
    expect(pageFrameHints[0]).toMatchObject({
      id: 'view-root',
      children: [{ id: 'text-2', text: 'second' }],
    })
    expect(componentFlow).toEqual([[{ id: 'component-1', path: 'components/card/card' }]])
    expect(renderOrder).toEqual([
      'componentFlow',
      'pageFrameHints',
      'pageDataPatches',
      'componentData',
    ])
  })

  test('mounts and updates the independent tabBar pageframe', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const tabFrames: PageFrameMount[] = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mountPage: () => {},
        mountTabBarPage: (request) => tabFrames.push(request),
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
      pageFrame: { rootViewId: 'page' },
      tabFrame: {
        pageId: 'page-1',
        rootViewId: 'tab-bar',
        pagePath: 'custom-tab-bar/index',
        data: { selected: 0 },
        renderHints: {
          type: 'element',
          id: 'tab-bar',
          tag: 'custom-tab-bar',
          component: true,
          componentPath: 'custom-tab-bar/index',
        },
      },
      messages: [
        { type: 'tree', root: tree },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    host.sendEvent('tree', 'patch', {
      pageId: 'page-1',
      tabFrame: {
        pageId: 'page-1',
        rootViewId: 'tab-bar',
        pagePath: 'custom-tab-bar/index',
        data: { selected: 1 },
      },
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(tabFrames).toHaveLength(2)
    expect(tabFrames[0]).toMatchObject({
      pagePath: 'custom-tab-bar/index',
      data: { selected: 0 },
      renderHints: { component: true, componentPath: 'custom-tab-bar/index' },
    })
    expect(tabFrames[1]).toMatchObject({
      pagePath: 'custom-tab-bar/index',
      data: { selected: 1 },
    })
  })

  test('replaces an undefined component with its componentPlaceholder', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const pageFrames: PageFrameMount[] = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mountPage: (request) => pageFrames.push(request),
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
      pageFrame: { rootViewId: 'page' },
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
    expect(pageFrames).toHaveLength(1)
    const placeholder = (pageFrames[0]!.renderHints as { children: Array<Record<string, unknown>> }).children[0]!
    expect(placeholder).toMatchObject({
      tag: 'view',
      props: { label: 'loading' },
      children: [{ type: 'text', text: 'placeholder' }],
    })
    expect(placeholder.component).toBeUndefined()
    expect(placeholder.componentPath).toBeUndefined()
  })

  test('mounts the pageframe and sends render events', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const pageFrames: PageFrameMount[] = []
    const events: unknown[] = []
    let emit: ((event: unknown) => void) | undefined

    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      initialPageId: 'page-1',
      renderer: {
        mountPage: (request) => pageFrames.push(request),
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

    host.sendEvent('tree', 'flow', {
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      pageFrame: { rootViewId: 'page' },
      messages: [{ type: 'tree', root: tree }, { type: 'ready' }],
    }, { pageId: 'page-1' })
    emit?.({ id: 'button', name: 'tap', detail: { x: 1, y: 2 } })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(pageFrames).toHaveLength(1)
    expect(events[0]).toMatchObject({
      id: 'button',
      name: 'tap',
      pageId: 'page-1',
      detail: { x: 1, y: 2 },
    })
  })

  test('routes opaque listener returns back to the renderer by token', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const returns: Array<{ eventToken: string; result: unknown }> = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      initialPageId: 'page-1',
      renderer: {
        mountPage: () => {},
        applyEventReturn: (request) => returns.push(request),
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()

    host.sendEvent('tree', 'eventReturn', {
      eventToken: 'token-1',
      result: { value: '2' },
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(returns).toEqual([{ eventToken: 'token-1', result: { value: '2' } }])
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
        mountPage: () => {},
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
        mountPage: () => order.push('mountPage'),
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
      pageFrame: { rootViewId: 'page' },
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
    expect(order).toEqual(['templates', 'mountPage'])
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
        mountPage: () => order.push('mountPage'),
        applyPageDataPatches: () => order.push('patch'),
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
      pageFrame: { rootViewId: 'page' },
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
      pageDataPatches: [{ label: 'ready' }],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order).toEqual([])

    release({ groupList: {}, content: () => ({}) })
    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order).toEqual(['templates', 'mountPage', 'patch'])
  })

  test('applies a component flow delta before the data patch', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const order: string[] = []
    const definitions: string[] = []
    const deltas: unknown[] = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mountPage: () => {},
        setComponentDefinitions: (next) => {
          definitions.push(...Object.keys(next))
          order.push('definitions')
        },
        applyComponentFlowDelta: (delta) => {
          deltas.push(delta)
          order.push('delta')
        },
        applyPageDataPatches: () => order.push('patch'),
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
      pageFrame: { rootViewId: 'page' },
      messages: [
        { type: 'tree', root: { type: 'element', id: 'page', tag: 'page' } },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    host.sendEvent('tree', 'patch', {
      pageId: 'page-1',
      pageDataPatches: [{ showCard: true }],
      componentFlowDelta: {
        define: [{ path: 'components/card/card', properties: {} }],
        owners: [{
          id: 'page',
          add: [{ id: 'card-1', path: 'components/card/card', index: 0 }],
        }],
      },
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(definitions).toEqual(['components/card/card'])
    expect(deltas).toEqual([{
      define: [{ path: 'components/card/card', properties: {} }],
      owners: [{
        id: 'page',
        add: [{ id: 'card-1', path: 'components/card/card', index: 0 }],
      }],
    }])
    // A definition must be installed before the instance that needs it, and
    // the data patch is applied after the identity batch.
    expect(order).toEqual(['definitions', 'delta', 'patch'])
  })

  test('defers ack and pageReady until the renderer rendered the batch', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const order: string[] = []
    let release: (() => void) | undefined
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        mountPage: () => order.push('mount'),
        applyPageDataPatches: () => order.push('patch'),
        whenRendered: () => new Promise<void>((resolve) => {
          release = () => resolve()
        }),
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    host.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.ack, () => order.push('ack'))
    host.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.pageReady, () => order.push('pageReady'))
    await host.handshake()

    host.sendEvent('tree', 'patch', {
      pageId: 'page-1',
      pageDataPatches: [{ width: 120 }],
      ack: ['batch-1'],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order).toEqual(['patch'])
    expect(release).toBeTypeOf('function')
    release!()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order).toEqual(['patch', 'ack'])

    release = undefined
    host.sendEvent('tree', 'flow', {
      pageId: 'page-1',
      pagePath: 'pages/index/index',
      pageFrame: { rootViewId: 'page' },
      messages: [{ type: 'ready' }],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order).toContain('mount')
    expect(order).not.toContain('pageReady')
    release!()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(order.at(-1)).toBe('pageReady')
  })

  test('forwards component commands to the renderer', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const requests: Array<{ method: string; selector?: string }> = []
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {
        invokeComponent: (request) => {
          requests.push({ method: request.method, selector: request.selector })
          if (request.method === 'getScale') return { status: 'ok', value: { scale: 16 } }
          return { status: 'unsupported-method', method: request.method }
        },
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()

    await expect(host.control(
      COMPONENT_CONTROL.domain,
      COMPONENT_CONTROL.invoke,
      { selector: '#map', method: 'getScale' },
      { pageId: 'page-1' },
    )).resolves.toEqual({ status: 'ok', value: { scale: 16 } })

    await expect(host.control(
      COMPONENT_CONTROL.domain,
      COMPONENT_CONTROL.invoke,
      { selector: '#map', method: 'takePhoto' },
      { pageId: 'page-1' },
    )).resolves.toEqual({ status: 'unsupported-method', method: 'takePhoto' })

    expect(requests).toEqual([
      { method: 'getScale', selector: '#map' },
      { method: 'takePhoto', selector: '#map' },
    ])
  })

  test('component commands fail honestly without a renderer hook', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    bootTreeThread({
      connection: createRenderConnection(renderTransport),
      renderer: {},
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    await host.handshake()
    await expect(host.control(
      COMPONENT_CONTROL.domain,
      COMPONENT_CONTROL.invoke,
      { selector: '#map', method: 'getScale' },
      { pageId: 'page-1' },
    )).resolves.toEqual({ status: 'unsupported-method', method: 'getScale' })
  })
})

import type * as glassEasel from '@tiny/runtime/glass-easel'

import { bindHostListeners, unbindHostListeners } from './host-listeners'
import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { PositionBox } from './positioningTarget'

type ContainerArgs = {
  canFullScreenByChild: boolean
  containerId: string
  position: PositionBox
  parentId: number
  contentOffsetLeft: number
  contentOffsetTop: number
  fixed: boolean
  visible: number
  innerWidth: number
  innerHeight: number
  animate?: number
}

type ContainerRuntime = {
  _container?: {
    inContainer?: boolean
    id?: string
    element?: unknown
    box?: PositionBox
  }
  _containerId?: string
  _containerArgs?: ContainerArgs
  _parentPositioningContainer?: unknown
  _positioningSyncing?: boolean
  _webContainerReady?: boolean
  _prevScrollLeft?: number
  _prevScrollTop?: number
  getBackendElement?: () => HTMLElement | null
  triggerEvent?: (name: string, detail?: unknown, options?: Record<string, unknown>) => void
}

function backendOf(instance: unknown): HTMLElement | null {
  return (instance as { getBackendElement?: () => HTMLElement | null })
    .getBackendElement?.() ?? null
}

/**
 * Web port of `wx-positioning-container` (WeChat 2.33.0).
 *
 * The reference registers a native container via
 * `wx.invoke("insertPositioningContainer", …)` and coordinates it with
 * `wx-positioning-target`. The web host keeps the container/argument shape,
 * the `positioningContainerReady` document event and the same offset methods,
 * but derives the box from DOM layout. Components consume
 * `_getContainerArguments()` / `getPositioningOffset()` and never measure the
 * container themselves.
 */
export function createPositioningContainerBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.positioningContainer,
    behaviors: [BUILTIN_BEHAVIOR_IDS.positioningTarget],
    lifetimes: {
      created() {
        bindHostListeners(this, {
          wxPositioningTargetReady: (event) => {
            ;(this as unknown as {
              positioningTargetReady?: (event: unknown) => void
            }).positioningTargetReady?.(event)
          },
        })
      },
      detached() {
        unbindHostListeners(this)
        ;(this as unknown as { removePositioningContainer: () => void })
          .removePositioningContainer()
      },
    },
    methods: {
      _addPositionTracker(event: { target?: unknown; detail?: { element?: unknown } }) {
        if (event.target === this) return
        const runtime = this as unknown as ContainerRuntime
        if (!runtime._positioningSyncing) {
          ;(this as unknown as { _requestPositioningContainer?: () => void })
            ._requestPositioningContainer?.()
          if (!runtime._positioningSyncing) {
            ;(this as unknown as { trackPositionInDocument?: () => void })
              .trackPositionInDocument?.()
          }
        }
        ;(event.detail?.element as {
          trackPositionInContainer?: (container: unknown) => void
        } | undefined)?.trackPositionInContainer?.(this)
        return false
      },
      trackPositionInDocument() {
        const runtime = this as unknown as ContainerRuntime
        if (runtime._positioningSyncing) return
        runtime._positioningSyncing = true
        runtime._parentPositioningContainer = typeof document !== 'undefined' ? document : undefined
        ;(this as unknown as { _initPositioningContainer: () => void })
          ._initPositioningContainer()
      },
      trackPositionInContainer(container: unknown) {
        const runtime = this as unknown as ContainerRuntime
        if (runtime._positioningSyncing) return
        runtime._positioningSyncing = true
        runtime._parentPositioningContainer = container
        ;(this as unknown as { _initPositioningContainer: () => void })
          ._initPositioningContainer()
      },
      _initPositioningContainer() {
        const args = (this as unknown as {
          _getContainerArguments: () => ContainerArgs
        })._getContainerArguments()
        const runtime = this as unknown as ContainerRuntime
        runtime._containerArgs = args
        runtime._containerId = args.containerId
        runtime._container ??= {}
        runtime._container.box = args.position
        runtime._container.id = args.containerId
        runtime._webContainerReady = true
        if (typeof document !== 'undefined') {
          document.dispatchEvent(new CustomEvent('positioningContainerReady', {
            detail: { containerId: args.containerId },
          }))
        }
        return args
      },
      getScrollPosition(): {
        scrollLeft: number
        scrollTop: number
        scrollWidth: number
        scrollHeight: number
      } {
        const host = backendOf(this)
        return {
          scrollLeft: host?.scrollLeft ?? 0,
          scrollTop: host?.scrollTop ?? 0,
          scrollWidth: host?.scrollWidth ?? 0,
          scrollHeight: host?.scrollHeight ?? 0,
        }
      },
      positioningTargetReady() {
        const runtime = this as unknown as ContainerRuntime
        const container = runtime._container
        if (container && !container.inContainer) {
          ;(this as unknown as { _initPositioningContainer: () => void })
            ._initPositioningContainer()
        }
      },
      updateScrollPosition(force?: boolean): boolean {
        const runtime = this as unknown as ContainerRuntime
        if (!runtime._positioningSyncing) return false
        const { scrollLeft, scrollTop } = (this as unknown as {
          getScrollPosition: () => { scrollLeft: number; scrollTop: number }
        }).getScrollPosition()
        if (!force && runtime._prevScrollLeft === scrollLeft && runtime._prevScrollTop === scrollTop) {
          return false
        }
        runtime._prevScrollLeft = scrollLeft
        runtime._prevScrollTop = scrollTop
        return true
      },
      triggerPositionChangeEvents() {
        // The reference schedules an intersection update in the native layer.
        if (typeof document !== 'undefined') {
          document.dispatchEvent(new CustomEvent('positioningContainerReady'))
        }
      },
      _getContainerBox(_style?: CSSStyleDeclaration): PositionBox {
        const host = backendOf(this)
        if (!host) return { left: 0, top: 0, width: 0, height: 0 }
        const rect = host.getBoundingClientRect()
        const style = _style ?? (typeof window !== 'undefined' ? window.getComputedStyle(host) : null)
        const px = (name: string): number => Number.parseFloat(style?.getPropertyValue(name) ?? '') || 0
        return {
          left: rect.left + px('border-left-width') + px('padding-left'),
          top: rect.top + px('border-top-width') + px('padding-top'),
          width: Math.max(0, rect.width - px('border-left-width') - px('border-right-width')
            - px('padding-left') - px('padding-right')),
          height: Math.max(0, rect.height - px('border-top-width') - px('border-bottom-width')
            - px('padding-top') - px('padding-bottom')),
        }
      },
      _getContainerArguments(): ContainerArgs {
        const runtime = this as unknown as ContainerRuntime
        const box = (this as unknown as {
          _getContainerBox: () => PositionBox
        })._getContainerBox()
        runtime._container ??= {}
        runtime._container.box = box
        const scroll = (this as unknown as {
          getScrollPosition: () => { scrollLeft: number; scrollTop: number }
        }).getScrollPosition()
        const innerWidth = box.width
        const innerHeight = box.height
        return {
          canFullScreenByChild: false,
          containerId: (this as unknown as {
            getPositioningId: () => string
          }).getPositioningId(),
          position: box,
          parentId: 0,
          contentOffsetLeft: scroll.scrollLeft || 0,
          contentOffsetTop: scroll.scrollTop || 0,
          fixed: false,
          visible: 1,
          innerWidth,
          innerHeight,
        }
      },
      initPositioningContainer() {
        const runtime = this as unknown as ContainerRuntime
        if (runtime._webContainerReady) {
          const args = (this as unknown as {
            _getContainerArguments: () => ContainerArgs
          })._getContainerArguments()
          runtime._containerArgs = args
          runtime._container ??= {}
          runtime._container.box = args.position
          return args
        }
        return (this as unknown as {
          _initPositioningContainer: () => ContainerArgs
        })._initPositioningContainer()
      },
      updatePositioningContainer(args: Partial<ContainerArgs> = {}) {
        const runtime = this as unknown as ContainerRuntime
        runtime._containerArgs ??= (this as unknown as {
          _getContainerArguments: () => ContainerArgs
        })._getContainerArguments()
        Object.assign(runtime._containerArgs, args)
        runtime._container ??= {}
        if (args.position) runtime._container.box = args.position
        if (args.containerId) runtime._container.id = args.containerId
        if (typeof document !== 'undefined') {
          document.dispatchEvent(new CustomEvent('positioningContainerReady', {
            detail: { containerId: runtime._containerId },
          }))
        }
      },
      removePositioningContainer() {
        const runtime = this as unknown as ContainerRuntime
        runtime._container = undefined
        runtime._containerArgs = undefined
        runtime._containerId = undefined
        runtime._webContainerReady = false
      },
      __removeContainerPadding(box: PositionBox, style: CSSStyleDeclaration) {
        const px = (name: string): number => Number.parseFloat(style.getPropertyValue(name) ?? '') || 0
        box.left += px('padding-left')
        box.top += px('padding-top')
        box.width -= px('padding-left') + px('padding-right')
        box.height -= px('padding-top') + px('padding-bottom')
      },
    },
  })
}

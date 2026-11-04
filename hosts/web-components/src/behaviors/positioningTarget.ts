import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

export type PositionBox = {
  left: number
  top: number
  width: number
  height: number
}

export type PositioningContainerHost = {
  _container?: {
    inContainer?: boolean
    id?: string
    element?: unknown
    box?: PositionBox
  }
  _containerId?: string
  _containerArgs?: {
    contentOffsetLeft?: number
    contentOffsetTop?: number
  }
  getBackendElement?: () => HTMLElement | null
  _setPositionTargetOffset?: (box: PositionBox) => void
}

type PositioningTargetRuntime = {
  _positioningId?: string
  _container?: {
    inContainer?: boolean
    id?: string
    element?: unknown
  }
  _parentPositioningContainer?: unknown
  _positioningSyncing?: boolean
  __positioningContainerReady?: (event: Event) => void
  _attachedCb?: () => void
  getBackendElement?: () => HTMLElement | null
  parentNode?: unknown
  triggerEvent?: (name: string, detail?: unknown, options?: Record<string, unknown>) => void
  hasBehavior?: (name: string) => boolean
}

let nextPositioningId = 1

function createPositioningId(): string {
  const id = `tiny-positioning-${nextPositioningId}`
  nextPositioningId += 1
  return id
}

function elementOf(instance: unknown): HTMLElement | null {
  return (instance as { getBackendElement?: () => HTMLElement | null })
    .getBackendElement?.() ?? null
}

/**
 * Web port of `wx-positioning-target` (WeChat 2.30.1).
 *
 * The reference tracks a positioned node inside a parent
 * `wx-positioning-container`. Native hosts register the container through
 * `wx.invoke`; the web host keeps the same ID/ready-event protocol and uses DOM
 * rects. This behavior owns all offset calculations so components never measure
 * parent containers themselves.
 */
export function createPositioningTargetBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.positioningTarget,
    lifetimes: {
      created() {
        ;(this as unknown as PositioningTargetRuntime)._positioningId = createPositioningId()
      },
      attached() {
        const runtime = this as unknown as PositioningTargetRuntime
        runtime.__positioningContainerReady = (event: Event) => {
          ;(this as unknown as {
            __positioningContainerReadyHandler: (event: Event) => void
          }).__positioningContainerReadyHandler(event)
        }
        runtime._container = {}
        ;(this as unknown as {
          __getParentContainerId: (node: unknown) => void
        }).__getParentContainerId(runtime.parentNode)
        const container = runtime._container
        if (container.inContainer && container.id) {
          ;(this as unknown as {
            __positioningContainerReadyHandler: (event: Event) => void
          }).__positioningContainerReadyHandler({
            detail: { containerId: container.id },
          } as unknown as Event)
        } else if (container.inContainer) {
          this.triggerEvent?.('wxPositioningTargetReady', {}, {
            bubbles: true,
            composed: true,
          })
          if (typeof document !== 'undefined' && runtime.__positioningContainerReady) {
            document.addEventListener(
              'positioningContainerReady',
              runtime.__positioningContainerReady,
            )
          }
        }
      },
      detached() {
        const runtime = this as unknown as PositioningTargetRuntime
        if (typeof document !== 'undefined' && runtime.__positioningContainerReady) {
          document.removeEventListener(
            'positioningContainerReady',
            runtime.__positioningContainerReady,
          )
        }
      },
    },
    methods: {
      __positioningContainerReadyHandler(event: Event) {
        const detail = (event as CustomEvent<{ containerId?: string }>).detail
        const container = (this as unknown as PositioningTargetRuntime)._container
        if (!container?.element || !detail?.containerId) return
        const element = container.element as PositioningContainerHost
        if (element._containerId !== detail.containerId) return
        container.id = detail.containerId
        if (typeof document !== 'undefined') {
          document.removeEventListener(
            'positioningContainerReady',
            (this as unknown as PositioningTargetRuntime).__positioningContainerReady!,
          )
        }
        if (this.hasBehavior?.(BUILTIN_BEHAVIOR_IDS.positioningContainer)) {
          ;(this as unknown as { initPositioningContainer?: () => void })
            .initPositioningContainer?.()
        }
        ;(this as unknown as PositioningTargetRuntime)._attachedCb?.()
      },
      __getParentContainerId(node: unknown) {
        const runtime = this as unknown as PositioningTargetRuntime
        const container = runtime._container
        if (!container) return
        let current = node as {
          hasBehavior?: (name: string) => boolean
          _containerId?: string
          parentNode?: unknown
          __wxHost?: unknown
        } | null
        while (current) {
          if (current.hasBehavior?.(BUILTIN_BEHAVIOR_IDS.positioningContainer)) {
            container.inContainer = true
            container.element = current
            if (current._containerId) container.id = current._containerId
            return
          }
          current = (current.parentNode ?? current.__wxHost) as typeof current
        }
        container.inContainer = false
      },
      _setPositionTargetOffset(box: PositionBox) {
        const runtime = this as unknown as PositioningTargetRuntime
        const container = runtime._container
        if (!container?.inContainer) return
        const element = container.element as PositioningContainerHost | undefined
        const parentBox = element?._container?.box
        const args = element?._containerArgs
        if (!parentBox) return
        box.left = box.left - parentBox.left + (args?.contentOffsetLeft ?? 0)
        box.top = box.top - parentBox.top + (args?.contentOffsetTop ?? 0)
        element?._setPositionTargetOffset?.(box)
      },
      isContainerReady(): boolean {
        return Boolean(this.getContainerId?.())
      },
      getContainerId(): string | undefined {
        const container = (this as unknown as PositioningTargetRuntime)._container
        return container?.inContainer ? container.id : undefined
      },
      _requestPositioningContainer() {
        this.triggerEvent?.('wxAddPositionTracker', { element: this }, {
          bubbles: true,
          composed: true,
        })
      },
      trackPositionInDocument() {
        const runtime = this as unknown as PositioningTargetRuntime
        if (runtime._positioningSyncing) return
        runtime._positioningSyncing = true
        runtime._parentPositioningContainer = typeof document !== 'undefined' ? document : undefined
      },
      trackPositionInContainer(container: unknown) {
        const runtime = this as unknown as PositioningTargetRuntime
        if (runtime._positioningSyncing) return
        runtime._positioningSyncing = true
        runtime._parentPositioningContainer = container
      },
      /**
       * Layout offset inside a positioning container, ignoring the target's
       * current transform. Components use this for movable bounds; the
       * behavior owns the parent-box arithmetic.
       */
      getLayoutOffset(parent: unknown): PositionBox {
        const host = elementOf(this)
        const container = parent as PositioningContainerHost | undefined
        const parentHost = container?.getBackendElement?.()
        if (!host || !parentHost) {
          return { left: 0, top: 0, width: host?.offsetWidth ?? 0, height: host?.offsetHeight ?? 0 }
        }
        const style = typeof window !== 'undefined' ? window.getComputedStyle(parentHost) : null
        const px = (name: string): number => Number.parseFloat(style?.getPropertyValue(name) ?? '') || 0
        return {
          left: host.offsetLeft - px('border-left-width') - px('padding-left'),
          top: host.offsetTop - px('border-top-width') - px('padding-top'),
          width: host.offsetWidth,
          height: host.offsetHeight,
        }
      },
      getPositioningOffset(parent?: unknown): PositionBox {
        const runtime = this as unknown as PositioningTargetRuntime
        const host = elementOf(this)
        if (!host) return { left: 0, top: 0, width: 0, height: 0 }
        const rect = host.getBoundingClientRect()
        const parentContainer = parent ?? runtime._parentPositioningContainer
        if (!parentContainer || parentContainer === (typeof document !== 'undefined' ? document : null)) {
          return {
            left: rect.left + (typeof window !== 'undefined' ? window.scrollX : 0),
            top: rect.top + (typeof window !== 'undefined' ? window.scrollY : 0),
            width: host.offsetWidth,
            height: host.offsetHeight,
          }
        }
        const container = parentContainer as PositioningContainerHost
        const parentHost = container.getBackendElement?.()
        const parentBox = container._container?.box
        if (parentBox) {
          return {
            left: rect.left - parentBox.left,
            top: rect.top - parentBox.top,
            width: host.offsetWidth,
            height: host.offsetHeight,
          }
        }
        if (!parentHost) {
          return {
            left: rect.left,
            top: rect.top,
            width: host.offsetWidth,
            height: host.offsetHeight,
          }
        }
        const parentRect = parentHost.getBoundingClientRect()
        return {
          left: rect.left - parentRect.left,
          top: rect.top - parentRect.top,
          width: host.offsetWidth,
          height: host.offsetHeight,
        }
      },
      fetchPositioningParentId(): number {
        return 0
      },
      getPositioningId(): string {
        const runtime = this as unknown as PositioningTargetRuntime
        runtime._positioningId ??= createPositioningId()
        return runtime._positioningId
      },
      regeneratePositioningId(): string {
        const runtime = this as unknown as PositioningTargetRuntime
        runtime._positioningId = createPositioningId()
        return runtime._positioningId
      },
    },
  })
}

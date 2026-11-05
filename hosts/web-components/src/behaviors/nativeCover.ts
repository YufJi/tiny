import type * as glassEasel from 'glass-easel'

import { bindHostListeners, unbindHostListeners } from './host-listeners'
import { BUILTIN_BEHAVIOR_IDS } from './ids'

type CoverRuntime = {
  _attached?: boolean
  _detached?: boolean
  _viewId?: string | null
  _args?: Record<string, unknown>
  _childViews?: unknown[]
  _createdTimeStamp?: number
  _isRoot?: boolean
  _fullscreen?: boolean
  getBackendElement?: () => HTMLElement | null
  triggerEvent?: (name: string, detail?: unknown, options?: Record<string, unknown>) => void
  parentNode?: unknown
}

/**
 * Web port of `wx-native-cover` (WeChat 2.33.0).
 *
 * The reference owns native text/scroll views and forwards touch events to
 * them. The browser host keeps the same method surface and bookkeeping
 * (`_viewId`, `_args`, child views, attach/detach events), but native
 * insert/update/remove are local no-ops with success callbacks. Host event
 * bindings use `bindHostListeners`, not the reference `listeners` block.
 */
export function createNativeCoverBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.nativeCover,
    properties: {
      _fullscreen: { type: Boolean, value: false },
      _isKeyboardAccessoryContainer: { type: Boolean, value: false },
    },
    lifetimes: {
      created() {
        const runtime = this as unknown as CoverRuntime
        runtime._createdTimeStamp = Date.now()
        runtime._isRoot = false
        runtime._args = {}
        runtime._childViews = []
        bindHostListeners(this, {
          tap: (event) => (this as unknown as { stopPropagation: (event: unknown) => void })
            .stopPropagation(event),
          longtap: (event) => (this as unknown as { stopPropagation: (event: unknown) => void })
            .stopPropagation(event),
          longpress: (event) => (this as unknown as { stopPropagation: (event: unknown) => void })
            .stopPropagation(event),
          touchstart: (event) => (this as unknown as { stopPropagation: (event: unknown) => void })
            .stopPropagation(event),
          touchmove: (event) => (this as unknown as { stopPropagation: (event: unknown) => void })
            .stopPropagation(event),
          touchend: (event) => (this as unknown as { stopPropagation: (event: unknown) => void })
            .stopPropagation(event),
          touchcancel: (event) => (this as unknown as { stopPropagation: (event: unknown) => void })
            .stopPropagation(event),
          animationstart: () => (this as unknown as { animationStart: () => void }).animationStart(),
          animationend: () => (this as unknown as { animationEnd: () => void }).animationEnd(),
        })
      },
      attached() {
        ;(this as unknown as { _attachedCb: () => void })._attachedCb()
      },
      detached() {
        const runtime = this as unknown as CoverRuntime
        runtime._attached = false
        runtime._detached = true
        runtime._viewId = null
        unbindHostListeners(this)
        ;(this as unknown as { consumeRemovingNodes: () => void })
          .consumeRemovingNodes()
      },
    },
    methods: {
      _attachedCb() {
        const runtime = this as unknown as CoverRuntime
        if (runtime._attached) return
        runtime._attached = true
        runtime.triggerEvent?.('wxCoverViewAttached', { target: this }, {
          bubbles: true,
          composed: true,
        })
      },
      stopPropagation(event: unknown) {
        ;(event as { stopPropagation?: () => void })?.stopPropagation?.()
        return false
      },
      consumeRemovingNodes() {
        return false
      },
      insertNativeCoverView(
        _parentId: unknown,
        _parentNode: unknown,
        _eventModel: unknown,
        _isRoot: unknown,
        callback?: (view: unknown) => void,
      ) {
        const runtime = this as unknown as CoverRuntime
        runtime._viewId = runtime._viewId ?? `cover-${runtime._createdTimeStamp ?? 0}`
        runtime._args ??= {}
        callback?.call(this, this)
        return runtime._viewId
      },
      updateNativeCoverView(callback?: () => void) {
        callback?.call(this)
      },
      removeNativeCoverView(callback?: () => void) {
        const runtime = this as unknown as CoverRuntime
        runtime._viewId = null
        runtime._args = {}
        callback?.call(this)
      },
      remove(callback?: () => void) {
        ;(this as unknown as { removeNativeCoverView: (callback?: () => void) => void })
          .removeNativeCoverView(callback)
      },
      animateCoverView() {},
      bringToFront() {},
      getCoverViewBox() {
        const host = (this as unknown as CoverRuntime).getBackendElement?.()
        if (!host) return { left: 0, top: 0, width: 0, height: 0 }
        const rect = host.getBoundingClientRect()
        return {
          left: rect.left,
          top: rect.top,
          width: host.offsetWidth,
          height: host.offsetHeight,
        }
      },
      getContainerStyle() {
        const host = (this as unknown as CoverRuntime).getBackendElement?.()
        return host && typeof window !== 'undefined' ? window.getComputedStyle(host) : null
      },
      getHexColor(color: string) {
        return color
      },
      getNodeId() {
        return String((this as unknown as CoverRuntime).getBackendElement?.()?.id ?? '')
      },
      diff(next: Record<string, unknown>, previous: Record<string, unknown>) {
        const keys = new Set([...Object.keys(next ?? {}), ...Object.keys(previous ?? {})])
        return [...keys].filter((key) => next?.[key] !== previous?.[key])
      },
      handleCoverViewTouch() {},
      onFullscreenChange() {},
      animationStart() {},
      animationEnd() {},
      insertNativeViewRecursively(_args: Record<string, unknown> = {}) {
        ;(this as unknown as { insertNativeCoverView: (...args: unknown[]) => void })
          .insertNativeCoverView(0, null, 'bubble', true, () => {})
      },
      removeNativeViewRecursively() {
        ;(this as unknown as { removeNativeCoverView: () => void }).removeNativeCoverView()
      },
      addChildView(view: unknown) {
        const runtime = this as unknown as CoverRuntime
        runtime._childViews ??= []
        runtime._childViews.push(view)
      },
      removeChildView(view: unknown) {
        const runtime = this as unknown as CoverRuntime
        runtime._childViews = (runtime._childViews ?? []).filter((child) => child !== view)
      },
      _handleFlexReverseLayout() {},
      _updateTopByOffset() {},
      _calcFixed() {},
      _calcUsingCustomTabBar() {},
      consoleTips() {},
    },
  })
}

import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

type Box = { left: number; top: number; width: number; height: number }

type NativeRuntime = {
  _viewId?: string
  _args?: Record<string, unknown>
  _containerId?: number
  _isReady?: boolean
  _deferred?: Array<{ callback: string; args: unknown[] }>
  _box?: Box
  _isError?: boolean
  getBackendElement?: () => HTMLElement | null
  _hiddenChanged?: (value: unknown, previous: unknown) => void
  _updatePosition?: (...args: unknown[]) => void
  _updateZIndex?: (value: number) => void
}

let nextContainerId = 1

/**
 * Web port of `wx-native` (WeChat 2.30.1).
 *
 * The reference talks to the native view layer through `wx.invoke`. The browser
 * host has no native layer, so the same API surface is kept as a stateful
 * compatibility behavior: native insert/update/remove calls report success and
 * maintain the view id/args, while the component renders normal DOM.
 */
export function createNativeBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.native,
    properties: {
      hidden: { type: Boolean, value: false, observer: 'hiddenChanged' },
      eventModel: { type: String, value: 'no-bubble' },
      _isReady: { type: Boolean, value: false },
      _deferred: { type: Array, value: [] },
      _isError: { type: Boolean, value: false },
      _box: {
        type: Object,
        value: { left: 0, top: 0, width: 0, height: 0 },
      },
    },
    lifetimes: {
      created() {
        ;(this as unknown as NativeRuntime)._containerId = nextContainerId
        nextContainerId += 1
      },
      detached() {
        const runtime = this as unknown as NativeRuntime
        runtime._viewId = undefined
        runtime._args = undefined
        runtime._deferred = []
      },
    },
    methods: {
      _getBox(style?: CSSStyleDeclaration, skipPositioning = false): Box {
        const runtime = this as unknown as NativeRuntime
        const host = runtime.getBackendElement?.()
        if (!host) return { left: 0, top: 0, width: 0, height: 0 }
        const rect = host.getBoundingClientRect()
        const computed = style ?? (typeof window !== 'undefined' ? window.getComputedStyle(host) : null)
        const px = (name: string): number => Number.parseFloat(computed?.getPropertyValue(name) ?? '') || 0
        const box = {
          left: rect.left + (typeof window !== 'undefined' ? window.scrollX : 0),
          top: rect.top + (typeof window !== 'undefined' ? window.scrollY : 0),
          width: host.offsetWidth,
          height: host.offsetHeight,
        }
        if (!skipPositioning) {
          box.width = Math.max(0, box.width - px('border-left-width') - px('border-right-width'))
          box.height = Math.max(0, box.height - px('border-top-width') - px('border-bottom-width'))
        }
        return box
      },
      _getOffsetPosition(): { left: number; top: number } {
        const host = (this as unknown as NativeRuntime).getBackendElement?.()
        let left = 0
        let top = 0
        let element = host
        while (element?.offsetParent) {
          left += element.offsetLeft
          top += element.offsetTop
          element = element.offsetParent as HTMLElement
        }
        return { left, top }
      },
      _diff(): Box | false {
        const box = (this as unknown as { _getBox: () => Box })._getBox()
        const previous = (this as unknown as NativeRuntime)._box
        for (const key of Object.keys(box) as Array<keyof Box>) {
          if (!previous || box[key] !== previous[key]) return box
        }
        return false
      },
      _delay(callback: string, ...args: unknown[]) {
        const runtime = this as unknown as NativeRuntime
        runtime._deferred ??= []
        runtime._deferred.push({ callback, args })
      },
      _ready() {
        const runtime = this as unknown as NativeRuntime
        runtime._isReady = true
        const deferred = runtime._deferred ?? []
        runtime._deferred = []
        for (const item of deferred) {
          const method = (this as unknown as Record<string, unknown>)[item.callback]
          if (typeof method === 'function') {
            ;(method as (...args: unknown[]) => void).apply(this, item.args)
          }
        }
      },
      _unready() {
        ;(this as unknown as NativeRuntime)._isReady = false
      },
      hiddenChanged(value: unknown, previous: unknown) {
        const runtime = this as unknown as NativeRuntime
        if (runtime._isError) return
        if (runtime._isReady) {
          runtime._hiddenChanged?.(value, previous)
        } else {
          ;(this as unknown as { _delay: (callback: string, ...args: unknown[]) => void })
            ._delay('hiddenChanged', value, previous)
        }
      },
      invoke(name: string, _args: unknown, callback?: (result: { errMsg: string }) => void) {
        callback?.call(this, { errMsg: `${name}:ok` })
      },
      insertNativeView(
        name: string,
        args: Record<string, unknown>,
        callback?: (result: { errMsg: string }) => void,
      ) {
        const runtime = this as unknown as NativeRuntime
        runtime._viewId = String(args.viewId ?? `${name}-${runtime._containerId ?? 0}`)
        runtime._args = args
        ;(this as unknown as { _ready: () => void })._ready()
        callback?.call(this, { errMsg: `${name}:ok` })
      },
      updateNativeView(
        name: string,
        _args: unknown,
        callback?: (result: { errMsg: string }) => void,
      ) {
        callback?.call(this, { errMsg: `${name}:ok` })
      },
      removeNativeView(
        name: string,
        _args: unknown,
        callback?: (result: { errMsg: string }) => void,
      ) {
        const runtime = this as unknown as NativeRuntime
        runtime._viewId = undefined
        runtime._args = undefined
        ;(this as unknown as { _unready: () => void })._unready()
        callback?.call(this, { errMsg: `${name}:ok` })
      },
      insertXWebView(
        name: string,
        _args: unknown,
        callback?: (result: { errMsg: string }) => void,
      ) {
        callback?.call(this, { errMsg: `${name}:ok` })
      },
      updateXWebView(name: string, _args: unknown, callback?: (result: { errMsg: string }) => void) {
        callback?.call(this, { errMsg: `${name}:ok` })
      },
      removeXWebView(name: string, _args: unknown, callback?: (result: { errMsg: string }) => void) {
        callback?.call(this, { errMsg: `${name}:ok` })
      },
      shouldForceUpdate(): boolean {
        const host = (this as unknown as NativeRuntime).getBackendElement?.()
        return Boolean(host && host.offsetWidth !== 0 && host.offsetHeight !== 0)
      },
      checkAncestorHidden(): boolean {
        let element = (this as unknown as NativeRuntime).getBackendElement?.()?.parentElement
        while (element) {
          if (typeof window !== 'undefined' && window.getComputedStyle(element).visibility === 'hidden') {
            return true
          }
          element = element.parentElement
        }
        return false
      },
      updateContainerIfNeeded(): boolean {
        return false
      },
      removeContainer(callback?: () => void) {
        callback?.call(this)
      },
      getContainerBox(): Box {
        return (this as unknown as { _getBox: () => Box })._getBox()
      },
      insertContainer(callback?: (id: number) => void) {
        callback?.call(this, 0)
      },
      updateContainer(_args?: unknown, callback?: () => void) {
        callback?.call(this)
      },
      guardPermissions(callback: () => void) {
        callback.call(this)
      },
      _pageReRenderCallback() {
        return false
      },
      _getCurrentZIndex(): number {
        const host = (this as unknown as NativeRuntime).getBackendElement?.()
        return host && typeof window !== 'undefined'
          ? Math.min(Number(window.getComputedStyle(host).zIndex) || 0, 1_000_000)
          : 0
      },
      _findCoverView() {},
      findCoverView() {},
    },
  })
}

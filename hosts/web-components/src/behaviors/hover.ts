import type * as glassEasel from '@tiny/runtime/glass-easel'
import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { HostEvent, HoverRuntime } from './types'

function hoverClassNames(instance: HoverRuntime): string[] {
  const hoverClass = String(instance.data.hoverClass ?? '').trim()
  if (hoverClass === '' || hoverClass === 'none') return []
  return hoverClass.split(/\s+/).filter(Boolean)
}

function applyHoverClasses(
  instance: HoverRuntime,
  names: string[],
  active: boolean,
): void {
  const classList = instance.classList
  const rawClassList = instance.getBackendElement?.()?.classList
  if (!classList && !rawClassList) return
  if (active) {
    instance._hoverClasses = [...names]
    for (const name of names) {
      // Scoped form matches page/component WXSS hover classes.
      classList?.toggle(name, true)
      // Raw form matches the built-in global stylesheet (`button-hover`).
      rawClassList?.add?.(name)
    }
  } else {
    for (const name of instance._hoverClasses ?? []) {
      classList?.toggle(name, false)
      rawClassList?.remove?.(name)
    }
    instance._hoverClasses = []
  }
}

export function createHoverBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.hover,
    properties: {
      hoverStartTime: { type: Number, value: 50 },
      hoverStayTime: { type: Number, value: 400 },
      hoverClass: { type: String, value: '', observer: 'hoverClassChange' },
      hoverStopPropagation: { type: Boolean, value: false, observer: 'hoverStopChange' },
      hover: { type: Boolean, value: false, observer: 'hoverChanged' },
    },
    data: {
      hovering: false,
    },
    lifetimes: {
      created() {
        const instance = this as unknown as HoverRuntime
        clearHoverTimers(instance)
        instance._defaultHoverClass = ''
        instance._hoverClass = []
        instance._hoverClasses = []
        instance._hoverBound = false
        instance._hoverTouch = false
        instance._hovering = false
      },
      attached() {
        const instance = this as unknown as HoverRuntime
        const hoverClass = String(instance.data.hoverClass ?? '')
        const defaultClass = instance._defaultHoverClass ?? ''
        if ((hoverClass || defaultClass) && hoverClass !== 'none') {
          (this as unknown as { hoverClassChange: () => void }).hoverClassChange()
        }
      },
      detached() {
        (this as unknown as { unbindHover: () => void }).unbindHover()
        const instance = this as unknown as HoverRuntime
        instance._hoverClass = []
        applyHoverClasses(instance, [], false)
      },
    },
    methods: {
      isScrolling(): boolean {
        let node = (this as unknown as { parentNode?: unknown }).parentNode
        for (let depth = 0; node && depth < 100; depth += 1) {
          const target = (node as { __wxElem?: unknown; __wxScrolling?: number; __scrollingUntil?: number })
          const scrollingTarget = (target.__wxElem ?? node) as {
            __wxScrolling?: number
            __scrollingUntil?: number
          }
          const stamped = Number(scrollingTarget.__wxScrolling ?? target.__wxScrolling ?? 0)
          if (stamped > 0 && Date.now() - stamped < 50) return true
          const until = Number(scrollingTarget.__scrollingUntil ?? target.__scrollingUntil ?? 0)
          if (until > Date.now()) return true
          node = (node as { parentNode?: unknown }).parentNode
        }
        return false
      },
      hoverChanged(next: boolean): void {
        if (next) (this as unknown as { bindHover: () => void }).bindHover()
        else (this as unknown as { unbindHover: () => void }).unbindHover()
      },
      hoverClassChange(): void {
        const instance = this as unknown as HoverRuntime
        const raw = String(instance.data.hoverClass ?? '')
        if (raw) instance._defaultHoverClass = ''
        instance._hoverClass = raw.split(/\s+/).filter(Boolean)
        if (raw !== 'none' || instance.data.hoverStopPropagation) {
          (this as unknown as { bindHover: () => void }).bindHover()
        } else {
          (this as unknown as { unbindHover: () => void }).unbindHover()
        }
      },
      hoverStopChange(): void {
        // WeChat binds here regardless of the new boolean; keep the same
        // observable behavior instead of reading it as a boolean toggle.
        ;(this as unknown as { bindHover: () => void }).bindHover()
      },
      bindHover(): void {
        const instance = this as unknown as HoverRuntime
        if (instance._hoverBound) return
        if (typeof instance.addListener !== 'function') return
        instance._hoverBound = true
        instance._hoverListeners = []
        const bind = (name: string, handler: (event: HostEvent) => void): void => {
          const listener = (event: HostEvent) => handler(event)
          instance.addListener?.(name, listener)
          instance._hoverListeners!.push({ name, listener })
        }
        bind('touchstart', (event) => (this as unknown as {
          hoverTouchStart: (e: HostEvent) => void
        }).hoverTouchStart(event))
        bind('canceltap', () => (this as unknown as { hoverCancel: () => void }).hoverCancel())
        bind('touchcancel', () => (this as unknown as { hoverCancel: () => void }).hoverCancel())
        bind('touchend', () => (this as unknown as { hoverTouchEnd: () => void }).hoverTouchEnd())
      },
      unbindHover(): void {
        const instance = this as unknown as HoverRuntime
        if (!instance._hoverBound) return
        instance._hoverBound = false
        for (const { name, listener } of instance._hoverListeners ?? []) {
          instance.removeListener?.(name, listener)
        }
        instance._hoverListeners = []
        clearHoverTimers(instance)
      },
      hoverTouchMove(): void {
        (this as unknown as { hoverCancel: () => void }).hoverCancel()
      },
      hoverTouchStart(event: HostEvent): void {
        const instance = this as unknown as HoverRuntime
        if ((this as unknown as { isScrolling: () => boolean }).isScrolling()) return
        if ((event as unknown as { _hoverPropagationStopped?: boolean })._hoverPropagationStopped) return
        if (instance.data.hoverStopPropagation) {
          ;(event as unknown as { _hoverPropagationStopped?: boolean })._hoverPropagationStopped = true
        }
        instance._hoverTouch = true
        const data = instance.data
        const hoverClass = String(data.hoverClass ?? '')
        if (hoverClass === 'none' || data.disabled) return
        const touches = (event as unknown as { touches?: unknown[] }).touches
        if (Array.isArray(touches) && touches.length > 1) return
        clearHoverTimers(instance)
        const startTime = Number(data.hoverStartTime ?? 50)
        instance._hoverStyleTimeId = setTimeout(() => {
          instance._hoverStyleTimeId = undefined
          if (instance.data.disabled) return
          instance._hovering = true
          instance.setData({ hovering: true })
          const defaultClass = instance._defaultHoverClass ?? ''
          const names = defaultClass ? [defaultClass] : (instance._hoverClass ?? hoverClassNames(instance))
          applyHoverClasses(instance, names, true)
          ;(this as unknown as { _updateNativeCoverHover?: () => void })._updateNativeCoverHover?.()
          if (!instance._hoverTouch) {
            ;(this as unknown as { scheduleHoverReset: () => void }).scheduleHoverReset()
          }
        }, Number.isFinite(startTime) ? Math.max(0, startTime) : 50)
      },
      hoverTouchEnd(): void {
        const instance = this as unknown as HoverRuntime
        instance._hoverTouch = false
        if (!instance._hovering) return
        ;(this as unknown as { scheduleHoverReset: () => void }).scheduleHoverReset()
      },
      hoverCancel(): void {
        const instance = this as unknown as HoverRuntime
        instance._hoverTouch = false
        if (instance._hoverStyleTimeId) {
          clearTimeout(instance._hoverStyleTimeId)
          instance._hoverStyleTimeId = undefined
        }
        ;(this as unknown as { hoverReset: () => void }).hoverReset()
      },
      scheduleHoverReset(): void {
        const instance = this as unknown as HoverRuntime
        const run = (): void => {
          const stayTime = Number(instance.data.hoverStayTime ?? 400)
          instance._hoverStayTimeId = setTimeout(() => {
            instance._hoverStayTimeId = undefined
            ;(this as unknown as { hoverReset: () => void }).hoverReset()
          }, Number.isFinite(stayTime) ? Math.max(0, stayTime) : 400)
        }
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run)
        else setTimeout(run, 0)
      },
      hoverReset(): void {
        const instance = this as unknown as HoverRuntime
        if (!instance._hovering) return
        instance._hovering = false
        instance.setData({ hovering: false })
        applyHoverClasses(instance, [], false)
        ;(this as unknown as { _updateNativeCoverHover?: () => void })._updateNativeCoverHover?.()
      },
    },
  })
}

function clearHoverTimers(instance: HoverRuntime): void {
  for (const key of ['_hoverStartTimer', '_hoverStayTimer', '_hoverStyleTimeId', '_hoverStayTimeId'] as const) {
    const timer = instance[key]
    if (timer) {
      clearTimeout(timer)
      instance[key] = undefined
    }
  }
}

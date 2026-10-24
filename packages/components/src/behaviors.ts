import type * as glassEasel from 'glass-easel'

type HoverTimer = ReturnType<typeof setTimeout>

type HoverRuntime = {
  _hoverStartTimer?: HoverTimer
  _hoverStayTimer?: HoverTimer
  __debouncers?: Record<string, HoverTimer | undefined>
}

/**
 * Internal behaviors shared by the WeChat built-in component implementations.
 *
 * These are intentionally local to the built-in component space: they mirror
 * the generic wx-base / wx-hover / wx-label-target behaviors from the WebView
 * base library without exposing them as user-registerable behaviors.
 */
export function createBuiltinBehaviors(space: glassEasel.ComponentSpace) {
  const base = space.defineBehavior({
    is: 'wx-base',
    properties: {
      hidden: { type: Boolean, value: false },
    },
    methods: {
      getNodeId(): string {
        return ''
      },
      getPluginId(): string {
        return ''
      },
      getRealRoute(route: string): string {
        return route
      },
      debounce(name: string, callback: (() => void) | undefined, wait: number): void {
        const instance = this as unknown as HoverRuntime
        instance.__debouncers ??= {}
        const previous = instance.__debouncers[name]
        if (previous) clearTimeout(previous)
        instance.__debouncers[name] = setTimeout(() => {
          instance.__debouncers![name] = undefined
          callback?.()
        }, wait)
      },
    },
  })

  const hover = space.defineBehavior({
    is: 'wx-hover',
    properties: {
      hoverClass: { type: String, value: '' },
      hoverStartTime: { type: Number, value: 50 },
      hoverStayTime: { type: Number, value: 400 },
      hoverStopPropagation: { type: Boolean, value: false },
    },
    data: {
      hovering: false,
    },
    lifetimes: {
      created() {
        clearHoverTimers(this as unknown as HoverRuntime)
      },
      detached() {
        clearHoverTimers(this as unknown as HoverRuntime)
      },
    },
    methods: {
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as HoverRuntime
        if ((this.data as { disabled?: boolean }).disabled) return
        const hoverClass = String(this.data.hoverClass ?? '')
        if (hoverClass === 'none') return
        const touches = (event as unknown as { touches?: unknown[] }).touches
        if (Array.isArray(touches) && touches.length > 1) return
        if (this.data.hoverStopPropagation) {
          (event as unknown as { stopPropagation?: () => void }).stopPropagation?.()
        }
        clearHoverTimers(instance)
        const hoverStartTime = Number(this.data.hoverStartTime ?? 50)
        instance._hoverStartTimer = setTimeout(() => {
          instance._hoverStartTimer = undefined
          if (!(this.data as { disabled?: boolean }).disabled) this.setData({ hovering: true })
        }, Number.isFinite(hoverStartTime) ? Math.max(0, hoverStartTime) : 50)
      },
      handleTouchEnd() {
        const instance = this as unknown as HoverRuntime
        if (instance._hoverStartTimer) {
          clearTimeout(instance._hoverStartTimer)
          instance._hoverStartTimer = undefined
        }
        if (!this.data.hovering) return
        const hoverStayTime = Number(this.data.hoverStayTime ?? 400)
        instance._hoverStayTimer = setTimeout(() => {
          instance._hoverStayTimer = undefined
          this.setData({ hovering: false })
        }, Number.isFinite(hoverStayTime) ? Math.max(0, hoverStayTime) : 400)
      },
      handleTouchCancel() {
        clearHoverTimers(this as unknown as HoverRuntime)
        if (this.data.hovering) this.setData({ hovering: false })
      },
    },
  })

  const labelTarget = space.defineBehavior({
    is: 'wx-label-target',
    methods: {
      handleLabelTap() {
        // Label activation is dispatched by the label component.
      },
    },
  })

  return { base, hover, labelTarget }
}

export type BuiltinBehaviors = ReturnType<typeof createBuiltinBehaviors>

function clearHoverTimers(instance: HoverRuntime): void {
  if (instance._hoverStartTimer) {
    clearTimeout(instance._hoverStartTimer)
    instance._hoverStartTimer = undefined
  }
  if (instance._hoverStayTimer) {
    clearTimeout(instance._hoverStayTimer)
    instance._hoverStayTimer = undefined
  }
}

import type * as glassEasel from 'glass-easel'

type HoverTimer = ReturnType<typeof setTimeout>

type HoverRuntime = {
  _hoverStartTimer?: HoverTimer
  _hoverStayTimer?: HoverTimer
  __debouncers?: Record<string, HoverTimer | undefined>
}

/** Default id prefix for built-in component behaviors. */
export const DEFAULT_BEHAVIOR_PREFIX = 'wx-'

export type BuiltinBehaviorOptions = {
  /** Behavior id prefix, e.g. `wx-` or `tiny-`. Defaults to `wx-`. */
  prefix?: string
}

/**
 * Internal behaviors shared by the built-in component implementations.
 *
 * These are intentionally local to the built-in component space: they mirror
 * the generic base / hover / label-target behaviors from the native base
 * library without exposing them as user-registerable behaviors. Their ids
 * follow the engine naming prefix (`wx-base` by default, `tiny-base` in custom-namespace builds).
 */
export function createBuiltinBehaviors(
  space: glassEasel.ComponentSpace,
  options: BuiltinBehaviorOptions = {},
) {
  const prefix = options.prefix ?? DEFAULT_BEHAVIOR_PREFIX
  const base = space.defineBehavior({
    is: `${prefix}base`,
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
    is: `${prefix}hover`,
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



  const sizeNormalizer = space.defineBehavior({
    is: `${prefix}size-normalizer`,
    methods: {
      normalizeSize(value: unknown): string {
        if (typeof value === 'number') return `${value}px`
        const text = String(value ?? '')
        return /^\d+(\.\d+)?$/.test(text) ? `${text}px` : text
      },
    },
  })

  const classPrefix = space.defineBehavior({
    is: `${prefix}class-prefix`,
    methods: {
      getClassPrefix(): string {
        return ''
      },
    },
  })

  const disabled = space.defineBehavior({
    is: `${prefix}disabled`,
    properties: {
      disabled: { type: Boolean, value: false },
    },
  })

  const dataComponent = space.defineBehavior({
    is: `${prefix}data-component`,
    properties: {
      name: { type: String, value: '' },
      autoFill: { type: String, value: '' },
    },
    methods: {
      getFormData(): unknown {
        const data = this.data as { value?: unknown; selected?: unknown }
        return data.value ?? data.selected ?? ''
      },
      resetFormData(): void {
        if ('value' in this.data) this.setData({ value: '' })
      },
    },
  })

  const group = space.defineBehavior({
    is: `${prefix}group`,
    methods: {
      applyItemChange(detail: { value?: unknown; checked?: unknown }): string[] {
        const value = String(detail.value ?? '')
        const selected = new Set<string>(((this.data as { selected?: string[] }).selected ?? []))
        if (detail.checked) selected.add(value)
        else selected.delete(value)
        this.setData({ selected: [...selected] })
        return [...selected]
      },
      resetFormData(): void {
        this.setData({ selected: [] })
      },
    },
  })

  const item = space.defineBehavior({
    is: `${prefix}item`,
    methods: {
      changedByTap(): void {},
      resetFormData(): void {
        if ('checked' in this.data) this.setData({ checked: false })
      },
    },
  })

  const labelTarget = space.defineBehavior({
    is: `${prefix}label-target`,
    methods: {
      handleLabelTap() {
        // Label activation is dispatched by the label component.
      },
    },
  })

  return { base, hover, labelTarget, disabled, dataComponent, group, item, sizeNormalizer, classPrefix }
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

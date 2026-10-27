import type * as glassEasel from 'glass-easel'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type CanvasRuntime = {
  __canvasLongTapTimer?: ReturnType<typeof setTimeout>
  __canvasLongTapPayload?: TouchPayload
  __canvasMousePressed?: boolean
  __canvasMouseTouch?: Record<string, unknown>
  __canvasLastTouchAt?: number
}

type TouchOrigin = {
  left: number
  top: number
}

type TouchSource = {
  identifier?: unknown
  clientX?: unknown
  clientY?: unknown
  pageX?: unknown
  pageY?: unknown
  screenX?: unknown
  screenY?: unknown
  force?: unknown
}

type TouchPayload = {
  detail: Record<string, unknown>
  touches: Record<string, unknown>[]
  changedTouches: Record<string, unknown>[]
}

type CanvasHost = {
  querySelector?: (selector: string) => Element | null
  getBoundingClientRect?: () => DOMRect
}

// Browsers fire compatibility mouse events after a touch sequence. Ignore
// those so a tap is not turned into a second synthetic touchstart.
const MOUSE_AFTER_TOUCH_MS = 600

// Shared with `@tiny/runtime`'s render adapter; the symbol registry keeps the
// marker stable even when the two packages are bundled separately.
const HANDLED_NATIVE_EVENT = Symbol.for(TINY_ENGINE_NAMING.handledNativeEventSymbol)

function canvasHost(instance: unknown): CanvasHost | null {
  const backend = (instance as { getBackendElement?: () => unknown }).getBackendElement?.()
  return backend && typeof backend === 'object' ? backend as CanvasHost : null
}

function canvasElement(instance: unknown): CanvasHost | null {
  const host = canvasHost(instance)
  if (!host) return null
  if (typeof host.querySelector === 'function') {
    const native = host.querySelector('canvas')
    if (native) return native as unknown as CanvasHost
  }
  return host
}

function canvasOrigin(instance: unknown): TouchOrigin | undefined {
  const rect = canvasElement(instance)?.getBoundingClientRect?.()
  if (!rect) return undefined
  return { left: rect.left, top: rect.top }
}

function touchList(value: unknown): TouchSource[] {
  if (!value || typeof value !== 'object') return []
  const length = Number((value as { length?: unknown }).length)
  if (!Number.isFinite(length) || length < 0) return []
  return Array.from(value as ArrayLike<TouchSource>)
}

function normalizeTouch(touch: TouchSource, origin?: TouchOrigin): Record<string, unknown> {
  const clientX = Number(touch.clientX ?? 0)
  const clientY = Number(touch.clientY ?? 0)
  return {
    identifier: Number(touch.identifier ?? 0),
    clientX,
    clientY,
    pageX: Number(touch.pageX ?? clientX),
    pageY: Number(touch.pageY ?? clientY),
    screenX: Number(touch.screenX ?? clientX),
    screenY: Number(touch.screenY ?? clientY),
    // WeChat canvas touch objects expose coordinates relative to the canvas.
    x: clientX - (origin?.left ?? 0),
    y: clientY - (origin?.top ?? 0),
    force: Number(touch.force ?? 0),
  }
}

function eventTouchSources(
  event: glassEasel.ShadowedEvent<unknown>,
  key: 'touches' | 'changedTouches',
): TouchSource[] {
  const detail = (event.detail ?? {}) as Record<string, unknown>
  const fromDetail = touchList(detail[key])
  if (fromDetail.length > 0) return fromDetail
  return touchList((event as unknown as Record<string, unknown>)[key])
}

function touchPayload(instance: unknown, event: glassEasel.ShadowedEvent<unknown>): TouchPayload {
  const detail = { ...((event.detail ?? {}) as Record<string, unknown>) }
  // DOM event details include circular node references; the runtime only
  // forwards JSON-safe fields and re-creates target/currentTarget itself.
  delete detail.target
  delete detail.currentTarget
  delete detail.srcElement
  const origin = canvasOrigin(instance)
  const touches = eventTouchSources(event, 'touches').map((touch) => normalizeTouch(touch, origin))
  const changedTouches = eventTouchSources(event, 'changedTouches')
    .map((touch) => normalizeTouch(touch, origin))
  return {
    detail: {
      ...detail,
      touches,
      changedTouches,
    },
    touches,
    changedTouches,
  }
}

function mousePayload(instance: unknown, event: glassEasel.ShadowedEvent<unknown>): {
  touch: Record<string, unknown>
  detail: Record<string, unknown>
} {
  const touch = normalizeTouch((event.detail ?? {}) as TouchSource, canvasOrigin(instance))
  return { touch, detail: { ...touch } }
}

function eventOptions(payload: TouchPayload): Record<string, unknown> {
  return {
    bubbles: true,
    composed: true,
    // Canvas touch handlers in WeChat read `event.touches` and
    // `event.changedTouches` directly instead of looking inside `detail`.
    extraFields: {
      touches: payload.touches,
      changedTouches: payload.changedTouches,
    },
  }
}

function dispatchTouch(
  instance: {
    triggerEvent: (name: string, detail?: unknown, options?: Record<string, unknown>) => void
  },
  name: string,
  payload: TouchPayload,
  event: glassEasel.ShadowedEvent<unknown>,
): void {
  // The native event still travels through the glass-easel tree, where the same
  // `bindtouch*` handler would run a second time with the raw DOM touch list.
  // Mark it so the render adapter only forwards this normalized event.
  if (!name.startsWith('touch')) {
    instance.triggerEvent(name, payload.detail, eventOptions(payload))
    return
  }
  const original = (event as unknown as {
    getOriginalEvent?: () => unknown
  }).getOriginalEvent?.()
  if (String(event.type).startsWith('touch') && original && typeof original === 'object') {
    ;(original as Record<PropertyKey, unknown>)[HANDLED_NATIVE_EVENT] = true
  }
  instance.triggerEvent(name, payload.detail, eventOptions(payload))
}

export function defineCanvas(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('canvas'),
    template: ctx.template('canvas'),
    behaviors: [ctx.behaviors.base],
    properties: {
      canvasId: { type: String, value: '' },
      type: { type: String, value: '' },
      disableScroll: { type: Boolean, value: false },
    },
    lifetimes: {
      created() {
        ctx.options.onDiagnostic?.({
          severity: 'warning',
          code: 'UNSUPPORTED_CANVAS',
          message: 'Canvas rendering is bridged to the service thread; export APIs may be limited.',
          details: { canvasId: this.data.canvasId, type: this.data.type },
        })
      },
      detached() {
        const instance = this as unknown as CanvasRuntime
        if (instance.__canvasLongTapTimer) clearTimeout(instance.__canvasLongTapTimer)
        instance.__canvasLongTapTimer = undefined
        instance.__canvasLongTapPayload = undefined
        instance.__canvasMousePressed = false
        instance.__canvasMouseTouch = undefined
      },
    },
    methods: {
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        instance.__canvasLastTouchAt = Date.now()
        this.preventScrollWhenDisabled(event)
        const payload = touchPayload(this, event)
        this.scheduleLongTap(event, payload)
        dispatchTouch(this, 'touchstart', payload, event)
      },
      handleTouchMove(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        instance.__canvasLastTouchAt = Date.now()
        this.clearLongTap()
        this.preventScrollWhenDisabled(event)
        dispatchTouch(this, 'touchmove', touchPayload(this, event), event)
      },
      handleTouchEnd(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        instance.__canvasLastTouchAt = Date.now()
        this.clearLongTap()
        dispatchTouch(this, 'touchend', touchPayload(this, event), event)
      },
      handleTouchCancel(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        instance.__canvasLastTouchAt = Date.now()
        this.clearLongTap()
        dispatchTouch(this, 'touchcancel', touchPayload(this, event), event)
      },
      handleLongTap(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        const payload = instance.__canvasLongTapPayload ?? touchPayload(this, event)
        instance.__canvasLongTapPayload = undefined
        dispatchTouch(this, 'longtap', payload, event)
      },
      handleMouseDown(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        if (this.isRecentTouch()) return
        const payload = mousePayload(this, event)
        const startPayload = {
          detail: payload.detail,
          touches: [payload.touch],
          changedTouches: [payload.touch],
        }
        instance.__canvasMousePressed = true
        instance.__canvasMouseTouch = payload.touch
        this.scheduleLongTap(event, startPayload)
        dispatchTouch(this, 'touchstart', startPayload, event)
      },
      handleMouseMove(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        if (!instance.__canvasMousePressed || this.isRecentTouch()) return
        const payload = mousePayload(this, event)
        instance.__canvasMouseTouch = payload.touch
        this.clearLongTap()
        dispatchTouch(this, 'touchmove', {
          detail: payload.detail,
          touches: [payload.touch],
          changedTouches: [payload.touch],
        }, event)
      },
      handleMouseUp(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        if (!instance.__canvasMousePressed || this.isRecentTouch()) return
        const payload = mousePayload(this, event)
        instance.__canvasMousePressed = false
        instance.__canvasMouseTouch = undefined
        this.clearLongTap()
        dispatchTouch(this, 'touchend', {
          detail: { ...payload.detail, touches: [], changedTouches: [payload.touch] },
          touches: [],
          changedTouches: [payload.touch],
        }, event)
      },
      handleMouseLeave(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        if (!instance.__canvasMousePressed || this.isRecentTouch()) return
        const touch = instance.__canvasMouseTouch ?? mousePayload(this, event).touch
        instance.__canvasMousePressed = false
        instance.__canvasMouseTouch = undefined
        this.clearLongTap()
        dispatchTouch(this, 'touchend', {
          detail: { touches: [], changedTouches: [touch] },
          touches: [],
          changedTouches: [touch],
        }, event)
      },
      handleError(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('error', event.detail ?? {}, { bubbles: true, composed: true })
      },
      preventScrollWhenDisabled(event: glassEasel.ShadowedEvent<unknown>) {
        if (!this.data.disableScroll) return
        const preventDefault = (event as unknown as { preventDefault?: () => void }).preventDefault
        preventDefault?.call(event)
        const original = (event as unknown as {
          getOriginalEvent?: () => { preventDefault?: () => void } | undefined
        }).getOriginalEvent?.()
        original?.preventDefault?.()
      },
      isRecentTouch(): boolean {
        const instance = this as unknown as CanvasRuntime
        return Date.now() - (instance.__canvasLastTouchAt ?? 0) < MOUSE_AFTER_TOUCH_MS
      },
      clearLongTap() {
        const instance = this as unknown as CanvasRuntime
        if (instance.__canvasLongTapTimer) clearTimeout(instance.__canvasLongTapTimer)
        instance.__canvasLongTapTimer = undefined
        instance.__canvasLongTapPayload = undefined
      },
      scheduleLongTap(event: glassEasel.ShadowedEvent<unknown>, explicitPayload?: TouchPayload) {
        const instance = this as unknown as CanvasRuntime
        this.clearLongTap()
        const payload = explicitPayload ?? touchPayload(this, event)
        instance.__canvasLongTapPayload = payload
        instance.__canvasLongTapTimer = setTimeout(() => {
          instance.__canvasLongTapTimer = undefined
          this.handleLongTap(event)
        }, 350)
      },
    },
    options: ctx.hostOptions('canvas'),
  }).general()
}

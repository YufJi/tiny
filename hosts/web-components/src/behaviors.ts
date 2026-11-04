import type * as glassEasel from 'glass-easel'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { convertRpx } from '@tiny/css-units'

type HoverTimer = ReturnType<typeof setTimeout>

type HostEvent = glassEasel.ShadowedEvent<unknown>

type HostListenable = {
  addListener?: (name: string, listener: (event: HostEvent) => void) => void
  removeListener?: (name: string, listener: (event: HostEvent) => void) => void
}

type HostClassElement = {
  classList?: {
    add?: (name: string) => void
    remove?: (name: string) => void
    contains?: (name: string) => boolean
    toggle?: (name: string, force?: boolean) => boolean
  }
  setAttribute?: (name: string, value: string) => void
  removeAttribute?: (name: string) => void
}

type TouchTrackEvent = {
  target: unknown
  currentTarget: unknown
  preventDefault: () => void
  stopPropagation: () => void
  touches: unknown[]
  changedTouches: unknown[]
  detail: {
    state: 'start' | 'move' | 'end' | 'cancel'
    x: number
    y: number
    dx: number
    dy: number
    ddx: number
    ddy: number
    timeStamp: number
  }
}

type HoverRuntime = {
  _hoverStartTimer?: HoverTimer
  _hoverStayTimer?: HoverTimer
  _hoverStyleTimeId?: HoverTimer
  _hoverStayTimeId?: HoverTimer
  _hostListeners?: Array<{ name: string; listener: (event: HostEvent) => void }>
  _hoverListeners?: Array<{ name: string; listener: (event: HostEvent) => void }>
  _hoverBound?: boolean
  _hovering?: boolean
  _hoverTouch?: boolean
  _defaultHoverClass?: string
  _hoverClass?: string[]
  _hoverClasses?: string[]
  __debouncers?: Record<string, HoverTimer | undefined>
  data: Record<string, unknown>
  setData: (data: Record<string, unknown>) => void
  classList?: { toggle(name: string, force?: boolean): boolean } | null
  getBackendElement?: () => HostClassElement | null
  parentNode?: unknown
  addListener?: (name: string, listener: (event: HostEvent) => void) => void
  removeListener?: (name: string, listener: (event: HostEvent) => void) => void
}

type AriaRuntime = {
  _ariaRoleDefault?: string
  _ariaRoleApplied?: boolean
  getBackendElement?: () => HostClassElement | null
}

type ReloadState = Record<string, unknown> & {
  _compVarList?: string[]
  wxComponents?: Record<string, unknown> & { _custom?: Record<string, unknown> }
}

type LabelAriaRuntime = {
  data: Record<string, unknown>
  is?: string
  getBackendElement?: () => { setAttribute?: (name: string, value: string) => void } | null
  setAriaRoleDefault?: (role: string) => void
  hasBehavior?: (name: string) => boolean
  _relatedLabel?: LabelAriaRuntime
}

type LabelTargetRuntime = {
  _labelTapListener?: (event: HostEvent) => void
  addListener?: (name: string, listener: (event: HostEvent) => void) => void
  removeListener?: (name: string, listener: (event: HostEvent) => void) => void
  handleLabelTap?: (event: HostEvent) => void
}

/** The group surface an item reports to (implemented by checkbox/radio group). */
type GroupHandler = {
  addItem?: (item: unknown) => void
  removeItem?: (item: unknown) => void
  renameItem?: (item: unknown, next: string, previous: string) => void
  changed?: (item: unknown) => void
  changedByTap?: () => void
}

type ItemRuntime = {
  _relatedGroup?: GroupHandler | null
  data: Record<string, unknown>
  setData: (data: Record<string, unknown>) => void
}

/**
 * Attach glass-easel event listeners to the component host node.
 *
 * This mirrors WeChat's `listeners: { "this.tap": ... }`: the real host is the
 * element users style and tap, so built-in behaviors must observe events there.
 * Listeners are installed in `created` and removed in `detached`.
 */
export function bindHostListeners(
  instance: unknown,
  bindings: Record<string, (event: HostEvent) => void>,
): void {
  const target = instance as HostListenable & HoverRuntime
  if (typeof target.addListener !== 'function') return
  target._hostListeners ??= []
  for (const [name, handler] of Object.entries(bindings)) {
    const listener = (event: HostEvent) => handler(event)
    target.addListener(name, listener)
    target._hostListeners.push({ name, listener })
  }
}

/** Remove all host listeners previously installed by `bindHostListeners`. */
export function unbindHostListeners(instance: unknown): void {
  const target = instance as HostListenable & HoverRuntime
  const listeners = target._hostListeners
  if (!listeners || listeners.length === 0) return
  if (typeof target.removeListener === 'function') {
    for (const { name, listener } of listeners) target.removeListener(name, listener)
  }
  target._hostListeners = []
}

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

/**
 * Find the nearest ancestor component that declares a behavior (e.g. the
 * `tiny-group` of a checkbox/radio). Walks the light-DOM parent chain so slot
 * content wrapped in a `<label>` still finds its group.
 */
export function findAncestorWithBehavior(instance: unknown, behavior: string): unknown | null {
  let node = (instance as { parentNode?: unknown }).parentNode
  for (let depth = 0; node && depth < 100; depth += 1) {
    const component = node as { hasBehavior?: (name: string) => boolean; parentNode?: unknown }
    if (typeof component.hasBehavior === 'function' && component.hasBehavior(behavior)) {
      return component
    }
    node = component.parentNode
  }
  return null
}

/** Fixed ids for behaviors shared by Tiny's built-in components. */
export const BUILTIN_BEHAVIOR_IDS = Object.freeze({
  base: `${TINY_ENGINE_NAMING.behaviorPrefix}base`,
  hover: `${TINY_ENGINE_NAMING.behaviorPrefix}hover`,
  reload: `${TINY_ENGINE_NAMING.behaviorPrefix}reload`,
  touchTrack: `${TINY_ENGINE_NAMING.behaviorPrefix}touchtrack`,
  scroller: `${TINY_ENGINE_NAMING.behaviorPrefix}scroller`,
  sizeNormalizer: `${TINY_ENGINE_NAMING.behaviorPrefix}size-normalizer`,
  classPrefix: `${TINY_ENGINE_NAMING.behaviorPrefix}class-prefix`,
  disabled: `${TINY_ENGINE_NAMING.behaviorPrefix}disabled`,
  dataComponent: `${TINY_ENGINE_NAMING.behaviorPrefix}data-component`,
  autofill: `${TINY_ENGINE_NAMING.behaviorPrefix}autofill`,
  group: `${TINY_ENGINE_NAMING.behaviorPrefix}group`,
  item: `${TINY_ENGINE_NAMING.behaviorPrefix}item`,
  labelTarget: `${TINY_ENGINE_NAMING.behaviorPrefix}label-target`,
  labelAria: `${TINY_ENGINE_NAMING.behaviorPrefix}label-aria`,
} as const)

/**
 * Internal behaviors shared by the built-in component implementations.
 *
 * These are intentionally local to the built-in component space: they mirror
 * the generic base / hover / label-target behaviors from the native base
 * library without exposing them as user-registerable behaviors. Their ids
 * use Tiny's fixed internal behavior ids.
 */
export function createBuiltinBehaviors(space: glassEasel.ComponentSpace) {
  const base = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.base,
    properties: {
      hidden: { type: Boolean, value: false },
      // WeChat's wx-base declares the full aria surface; exparser reflects each
      // camelCase name to its kebab-case attribute. ID references use
      // `reflectIdPrefix` so scoped ids stay addressable.
      ariaActivedescendant: { type: String, value: '', reflectIdPrefix: true },
      ariaAtomic: { type: String, value: '' },
      ariaAutocomplete: { type: String, value: '' },
      ariaBusy: { type: String, value: '' },
      ariaChecked: { type: String, value: '' },
      ariaColcount: { type: Number, value: 0 },
      ariaColindex: { type: Number, value: 0 },
      ariaColspan: { type: Number, value: 0 },
      ariaControls: { type: String, value: '', reflectIdPrefix: true },
      ariaCurrent: { type: String, value: '' },
      ariaDescribedby: { type: String, value: '', reflectIdPrefix: true },
      ariaDetails: { type: String, value: '', reflectIdPrefix: true },
      ariaDisabled: { type: String, value: '' },
      ariaDropeffect: { type: String, value: '' },
      ariaErrormessage: { type: String, value: '', reflectIdPrefix: true },
      ariaExpanded: { type: String, value: '' },
      ariaFlowto: { type: String, value: '', reflectIdPrefix: true },
      ariaGrabbed: { type: String, value: '' },
      ariaHaspopup: { type: String, value: '' },
      ariaHidden: { type: String, value: '' },
      ariaInvalid: { type: String, value: '' },
      ariaKeyshortcuts: { type: String, value: '' },
      ariaLabel: { type: String, value: '' },
      ariaLabelledby: { type: String, value: '', reflectIdPrefix: true },
      ariaLevel: { type: Number, value: 0 },
      ariaLive: { type: String, value: '' },
      ariaModal: { type: String, value: '' },
      ariaMultiline: { type: String, value: '' },
      ariaMultiselectable: { type: String, value: '' },
      ariaOrientation: { type: String, value: '' },
      ariaOwns: { type: String, value: '', reflectIdPrefix: true },
      ariaPlaceholder: { type: String, value: '' },
      ariaPosinset: { type: Number, value: 0 },
      ariaPressed: { type: String, value: '' },
      ariaReadonly: { type: String, value: '' },
      ariaRelevant: { type: String, value: '' },
      ariaRequired: { type: String, value: '' },
      ariaRole: { type: String, value: '', observer: 'ariaRoleChanged' },
      ariaRoledescription: { type: String, value: '' },
      ariaRowcount: { type: Number, value: 0 },
      ariaRowindex: { type: Number, value: 0 },
      ariaRowspan: { type: Number, value: 0 },
      ariaSelected: { type: String, value: '' },
      ariaSetsize: { type: Number, value: 0 },
      ariaSort: { type: String, value: '' },
      ariaValuemax: { type: Number, value: 0 },
      ariaValuemin: { type: Number, value: 0 },
      ariaValuenow: { type: Number, value: 0 },
      ariaValuetext: { type: String, value: '' },
      tabindex: { type: Number, value: 0 },
      enableSelection: { type: Boolean, value: false },
      disableSelection: { type: Boolean, value: false },
    },
    lifetimes: {
      attached() {
        (this as unknown as { applyAriaRole?: () => void }).applyAriaRole?.()
      },
    },
    methods: {
      applyAriaRole(): void {
        const runtime = this as unknown as AriaRuntime
        const element = runtime.getBackendElement?.()
        if (!element) return
        const value = String((this as unknown as { data: Record<string, unknown> }).data.ariaRole ?? '')
        const role = value || runtime._ariaRoleDefault || ''
        if (role) {
          element.setAttribute?.('role', role)
          runtime._ariaRoleApplied = true
        } else if (runtime._ariaRoleApplied) {
          element.removeAttribute?.('role')
          runtime._ariaRoleApplied = false
        }
      },
      ariaRoleChanged(): void {
        (this as unknown as { applyAriaRole: () => void }).applyAriaRole()
      },
      setAriaRoleDefault(role: string): void {
        const runtime = this as unknown as AriaRuntime
        runtime._ariaRoleDefault = role
        ;(this as unknown as { applyAriaRole: () => void }).applyAriaRole()
      },
      getNodeId(): string {
        const element = (this as unknown as {
          getBackendElement?: () => { id?: string } | null
        }).getBackendElement?.()
        return String(element?.id ?? '')
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



  const reload = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.reload,
    methods: {
      saveCompVar(state: ReloadState, fields: string[]): void {
        const list = state._compVarList ?? []
        for (let i = list.length - 1; i > 0; i -= 1) {
          for (let j = i - 1; j >= 0; j -= 1) {
            if (list[j] === list[i]) {
              list.splice(i, 1)
              break
            }
          }
        }
        state._compVarList = list.concat(fields)
        fields.forEach((field) => {
          state[field] = (this as unknown as Record<string, unknown>)[field]
        })
      },
      restoreCompVar(state: ReloadState): void {
        ;(state._compVarList ?? []).forEach((field) => {
          ;(this as unknown as Record<string, unknown>)[field] = state[field]
        })
      },
      saveState(target: ReloadState, state: ReloadState): void {
        target.wxComponents ??= {}
        let store = target.wxComponents as Record<string, unknown>
        if ((this as unknown as { ownerShadowRoot?: unknown }).ownerShadowRoot) {
          store._custom ??= {}
          store = store._custom as Record<string, unknown>
        }
        const is = String((this as unknown as { is: string }).is)
        store[is] ??= []
        ;(store[is] as ReloadState[]).push(state)
      },
      restoreState(target: ReloadState): ReloadState | undefined {
        target.wxComponents ??= {}
        let store = target.wxComponents as Record<string, unknown>
        if ((this as unknown as { ownerShadowRoot?: unknown }).ownerShadowRoot) {
          store._custom ??= {}
          store = store._custom as Record<string, unknown>
        }
        const is = String((this as unknown as { is: string }).is)
        store[is] ??= []
        return (store[is] as ReloadState[]).shift()
      },
    },
  })

  const touchTrack = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.touchTrack,
    methods: {
      touchtrack(
        _element: unknown,
        handler: (event: TouchTrackEvent) => boolean | void,
        useCapture = false,
      ): () => void {
        // Track through glass events (not DOM listeners) so native touch and a
        // mouse sequence projected by the event compositor take the same path.
        const instance = this as unknown as {
          addListener?: (name: string, listener: (event: unknown) => void, options?: { capture?: boolean }) => void
          removeListener?: (name: string, listener: (event: unknown) => void, options?: { capture?: boolean }) => void
        }
        if (typeof instance.addListener !== 'function') return () => {}
        type TrackPoint = { clientX: number; clientY: number }
        const listOf = (event: unknown, key: 'touches' | 'changedTouches'): ArrayLike<TrackPoint> => {
          const projected = (event as Record<string, ArrayLike<TrackPoint> | undefined>)[key]
          if (projected) return projected
          const original = (event as { getOriginalEvent?: () => TouchEvent | undefined })
            .getOriginalEvent?.()
          return original?.[key] ?? []
        }
        let active = false
        let startX = 0
        let startY = 0
        let lastX = 0
        let lastY = 0
        let previousX = 0
        let previousY = 0
        const emit = (event: unknown, state: TouchTrackEvent['detail']['state'], x: number, y: number) => {
          const source = event as {
            target?: unknown
            currentTarget?: unknown
            preventDefault?: () => void
            stopPropagation?: () => void
            timeStamp?: number
          }
          const result = handler({
            target: source.target,
            currentTarget: source.currentTarget,
            preventDefault: () => source.preventDefault?.(),
            stopPropagation: () => source.stopPropagation?.(),
            touches: Array.from(listOf(event, 'touches')),
            changedTouches: Array.from(listOf(event, 'changedTouches')),
            detail: {
              state,
              x,
              y,
              dx: x - startX,
              dy: y - startY,
              ddx: x - previousX,
              ddy: y - previousY,
              timeStamp: Number(source.timeStamp ?? Date.now()),
            },
          })
          previousX = x
          previousY = y
          return result
        }
        const onStart = (event: unknown) => {
          const touches = listOf(event, 'touches')
          if (touches.length !== 1 || active) return
          active = true
          const touch = touches[0]!
          startX = lastX = previousX = touch.clientX
          startY = lastY = previousY = touch.clientY
          emit(event, 'start', startX, startY)
        }
        const onMove = (event: unknown) => {
          const touches = listOf(event, 'touches')
          if (!active || touches.length !== 1) return
          const touch = touches[0]!
          lastX = touch.clientX
          lastY = touch.clientY
          emit(event, 'move', lastX, lastY)
        }
        const onEnd = (event: unknown) => {
          if (!active || listOf(event, 'touches').length !== 0) return
          active = false
          const touch = listOf(event, 'changedTouches')[0]
          emit(event, 'end', touch?.clientX ?? lastX, touch?.clientY ?? lastY)
        }
        const onCancel = (event: unknown) => {
          if (!active) return
          active = false
          const touch = listOf(event, 'changedTouches')[0]
          emit(event, 'cancel', touch?.clientX ?? lastX, touch?.clientY ?? lastY)
        }
        instance.addListener('touchstart', onStart, { capture: useCapture })
        instance.addListener('touchmove', onMove, { capture: useCapture })
        instance.addListener('touchend', onEnd, { capture: useCapture })
        instance.addListener('touchcancel', onCancel, { capture: useCapture })

        // Native touch does not reach glass `addListener` callbacks in the web
        // render tree (only projected mouse gestures do), so attach the same
        // state machine to the backend element as well. The glass listeners
        // keep devtool mouse drags working; native touch goes through the DOM.
        const target = (
          (_element as { addEventListener?: unknown } | null | undefined)?.addEventListener
            ? _element
            : (this as unknown as { getBackendElement?: () => unknown }).getBackendElement?.()
        ) as {
          addEventListener?: (name: string, listener: (event: TouchEvent) => void, options?: AddEventListenerOptions) => void
          removeEventListener?: (name: string, listener: (event: TouchEvent) => void, options?: AddEventListenerOptions) => void
        } | null | undefined
        let domActive = false
        let domStartX = 0
        let domStartY = 0
        let domLastX = 0
        let domLastY = 0
        let domPreviousX = 0
        let domPreviousY = 0
        const domEmit = (event: TouchEvent, state: 'start' | 'move' | 'end' | 'cancel', x: number, y: number) => {
          const result = handler({
            target: event.target,
            currentTarget: event.currentTarget,
            preventDefault: () => event.preventDefault(),
            stopPropagation: () => event.stopPropagation(),
            touches: Array.from(event.touches),
            changedTouches: Array.from(event.changedTouches),
            detail: {
              state,
              x,
              y,
              dx: x - domStartX,
              dy: y - domStartY,
              ddx: x - domPreviousX,
              ddy: y - domPreviousY,
              timeStamp: Number(event.timeStamp || Date.now()),
            },
          })
          if (result === false && event.cancelable) event.preventDefault()
          domPreviousX = x
          domPreviousY = y
        }
        const domStart = (event: TouchEvent) => {
          if (event.touches.length !== 1 || domActive) return
          domActive = true
          const touch = event.touches[0]!
          domStartX = domLastX = domPreviousX = touch.clientX
          domStartY = domLastY = domPreviousY = touch.clientY
          domEmit(event, 'start', domStartX, domStartY)
        }
        const domMove = (event: TouchEvent) => {
          if (!domActive || event.touches.length !== 1) return
          const touch = event.touches[0]!
          domLastX = touch.clientX
          domLastY = touch.clientY
          domEmit(event, 'move', domLastX, domLastY)
        }
        const domEnd = (event: TouchEvent) => {
          if (!domActive || event.touches.length !== 0) return
          domActive = false
          const touch = event.changedTouches[0]
          domEmit(event, 'end', touch?.clientX ?? domLastX, touch?.clientY ?? domLastY)
        }
        const domCancel = (event: TouchEvent) => {
          if (!domActive) return
          domActive = false
          const touch = event.changedTouches[0]
          domEmit(event, 'cancel', touch?.clientX ?? domLastX, touch?.clientY ?? domLastY)
        }
        target?.addEventListener?.('touchstart', domStart, { capture: true })
        target?.addEventListener?.('touchmove', domMove, { capture: true })
        target?.addEventListener?.('touchend', domEnd, { capture: true })
        target?.addEventListener?.('touchcancel', domCancel, { capture: true })
        return () => {
          instance.removeListener?.('touchstart', onStart, { capture: useCapture })
          instance.removeListener?.('touchmove', onMove, { capture: useCapture })
          instance.removeListener?.('touchend', onEnd, { capture: useCapture })
          instance.removeListener?.('touchcancel', onCancel, { capture: useCapture })
          target?.removeEventListener?.('touchstart', domStart, { capture: true })
          target?.removeEventListener?.('touchmove', domMove, { capture: true })
          target?.removeEventListener?.('touchend', domEnd, { capture: true })
          target?.removeEventListener?.('touchcancel', domCancel, { capture: true })
        }
      },
    },
  })

  const scroller = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.scroller,
    methods: {
      initScroller(element: unknown) {
        ;(this as unknown as { __scrollerElement?: unknown }).__scrollerElement = element ?? null
      },
      isScrolling() {
        return Date.now() < Number((this as unknown as { __scrollingUntil?: number }).__scrollingUntil ?? 0)
      },
      scrollTo(scrollTop: number, scrollLeft: number, behavior: 'auto' | 'smooth' = 'auto') {
        const element = (this as unknown as {
          __scrollerElement?: {
            scrollTop?: number
            scrollLeft?: number
            scrollTo?: (options: { top: number; left: number; behavior: string }) => void
          } | null
        }).__scrollerElement
        if (!element) return
        if (typeof element.scrollTo === 'function') {
          element.scrollTo({ top: scrollTop, left: scrollLeft, behavior })
        } else {
          element.scrollTop = scrollTop
          element.scrollLeft = scrollLeft
        }
      },
    },
  })

  const sizeNormalizer = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.sizeNormalizer,
    methods: {
      normalizeSize(value: unknown): number {
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0
        const text = String(value ?? '').trim()
        const match = /^(-?\d+(?:\.\d+)?)(?:px)?$/.exec(text)
        return match ? Number(match[1]) : 0
      },
      normalizeSizeStr(value: unknown): string {
        if (typeof value === 'number') return `${value}px`
        const text = String(value ?? '').trim()
        if (text !== '' && parseFloat(text).toString() === text) return `${text}px`
        // WeChat resolves rpx through the WebView width; Tiny uses the shared
        // 750-ratio `vw` conversion so inline sizes follow app WXSS.
        if (/\d(?:\.\d+)?rpx/.test(text)) return convertRpx(text)
        return text
      },
    },
  })

  const classPrefix = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.classPrefix,
    methods: {
      getClassPrefix(): string {
        return ''
      },
    },
  })

  const disabled = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.disabled,
    properties: {
      disabled: { type: Boolean, value: false, observer: 'disabledChanged' },
    },
    methods: {
      disabledChanged(next: boolean): void {
        const runtime = this as unknown as LabelAriaRuntime
        runtime.getBackendElement?.()?.setAttribute?.('aria-disabled', String(Boolean(next)))
        ;(this as unknown as { _setRelatedLabelAria?: () => void })._setRelatedLabelAria?.()
      },
    },
  })

  const dataComponent = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.dataComponent,
    properties: {
      name: { type: String, value: '' },
    },
    methods: {
      getFormData(): unknown {
        return (this.data as { value?: unknown }).value ?? ''
      },
      resetFormData(): void {
        if ('value' in this.data) this.setData({ value: '' })
      },
    },
  })

  /**
   * Shared `wx-autofill` plumbing. The reference behavior owns the `auto-fill`
   * property and parses its `group.field` aliases; components still implement
   * their own `autofillGetValue` / `autofillSetValue` because a picker, input
   * and textarea represent values differently.
   */
  const autofill = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.autofill,
    properties: {
      autoFill: { type: String, value: '', observer: '_onAutoFillChange' },
    },
    lifetimes: {
      attached() {
        const runtime = this as unknown as Record<string, unknown>
        runtime._autofillDropdownOptions = []
        runtime.autofillDropdownVisible = false
        runtime._autofillDropdownRect = {}
        runtime._autofillDropdownTargetElemId = ''
        runtime._autofillSelected = undefined
      },
    },
    methods: {
      _onAutoFillChange(value: string) {
        let key = String(value ?? '')
        if (/^[^.]+\.phone$/.test(key)) key = 'phone_info.phone'
        else if (/^[^.]+\.email$/.test(key)) key = 'email_info.email'
        else if (/^[^.]+\.name$/.test(key)) key = 'base_info.name'
        else if (/^[^.]+\.id_card_num$/.test(key)) key = 'base_info.id_card_num'
        const parts = key.split('.')
        const runtime = this as unknown as Record<string, unknown>
        runtime._autofillGroupKey = parts.length === 2 ? parts[0] : null
        runtime._autofillFieldName = parts.length === 2 ? parts[1] : null
        runtime._autofill = parts.length === 2 ? key : null
      },
      _autofillRequestPreAuth(): Promise<void> {
        return Promise.resolve()
      },
      _autofillGetDropdownOptions(): unknown[] {
        return []
      },
      autofillValueChangeHandler(): void {},
      autofillShowDropdown(): void {},
      autofillHideDropdown(): void {},
    },
  })

  /**
   * The group owns only derived state: child items report membership and
   * selection changes, and the group mirrors them into its output `value`.
   * Nothing here writes back to the items' `checked` — that mirrors WeChat's
   * `wx-group` / `wx-item` split and keeps `checked` owned by the item.
   */
  const group = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.group,
    methods: {
      addItem(_item: unknown): void {},
      removeItem(_item: unknown): void {},
      renameItem(_item: unknown, _newValue: string, _oldValue: string): void {},
      changed(_item: unknown): void {},
      changedByTap(): void {
        const value = (this as unknown as { _value?: unknown })._value
        this.triggerEvent(
          'change',
          { value: Array.isArray(value) ? [...value] : value },
          { bubbles: true, composed: true },
        )
      },
      resetFormData(): void {},
    },
  })

  const item = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.item,
    properties: {
      value: { type: String, value: '', observer: 'valueChange' },
      checked: { type: Boolean, value: false, observer: 'checkedChange' },
    },
    lifetimes: {
      attached() {
        const runtime = this as unknown as ItemRuntime
        const group = findAncestorWithBehavior(this, BUILTIN_BEHAVIOR_IDS.group) as GroupHandler | null
        runtime._relatedGroup = group
        group?.addItem?.(this)
      },
      moved() {
        const runtime = this as unknown as ItemRuntime
        runtime._relatedGroup?.removeItem?.(this)
        const group = findAncestorWithBehavior(this, BUILTIN_BEHAVIOR_IDS.group) as GroupHandler | null
        runtime._relatedGroup = group
        group?.addItem?.(this)
      },
      detached() {
        const runtime = this as unknown as ItemRuntime
        runtime._relatedGroup?.removeItem?.(this)
        runtime._relatedGroup = null
      },
    },
    methods: {
      valueChange(next: unknown, previous: unknown): void {
        if (next === previous) return
        const group = (this as unknown as ItemRuntime)._relatedGroup
        group?.renameItem?.(this, String(next ?? ''), String(previous ?? ''))
      },
      checkedChange(next: unknown, previous: unknown): void {
        const runtime = this as unknown as ItemRuntime & {
          getBackendElement?: () => {
            setAttribute?: (name: string, value: string) => void
          } | null
          _setRelatedLabelAria?: () => void
        }
        runtime.getBackendElement?.()?.setAttribute?.('aria-checked', String(Boolean(next)))
        runtime._setRelatedLabelAria?.()
        if (next === previous) return
        const group = (this as unknown as ItemRuntime)._relatedGroup
        group?.changed?.(this)
      },
      changedByTap(): void {
        const group = (this as unknown as ItemRuntime)._relatedGroup
        group?.changedByTap?.()
      },
      resetFormData(): void {
        ;(this as unknown as ItemRuntime).setData({ checked: false })
      },
    },
  })

  const labelAria = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.labelAria,
    methods: {
      _setAria(role: string): void {
        const runtime = this as unknown as LabelAriaRuntime
        runtime.setAriaRoleDefault?.(role)
        const element = runtime.getBackendElement?.()
        element?.setAttribute?.('aria-disabled', String(Boolean(runtime.data.disabled)))
        if (!isButtonComponent(runtime.is)) {
          element?.setAttribute?.('aria-checked', String(Boolean(runtime.data.checked)))
        }
      },
      _setRelatedLabelAria(role?: string): void {
        const runtime = this as unknown as LabelAriaRuntime
        const label = runtime._relatedLabel
        if (!label) return
        const resolved = role ?? relatedRole(runtime.is)
        if (resolved) label.setAriaRoleDefault?.(resolved)
        const element = label.getBackendElement?.()
        element?.setAttribute?.('aria-disabled', String(Boolean(runtime.data.disabled)))
        if (!isButtonComponent(runtime.is)) {
          element?.setAttribute?.('aria-checked', String(Boolean(runtime.data.checked)))
        }
      },
    },
  })

  const labelTarget = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.labelTarget,
    lifetimes: {
      created() {
        const instance = this as unknown as LabelTargetRuntime
        instance._labelTapListener = (event) => instance.handleLabelTap?.(event)
        instance.addListener?.('labelTap', instance._labelTapListener)
      },
      detached() {
        const instance = this as unknown as LabelTargetRuntime
        if (instance._labelTapListener) {
          instance.removeListener?.('labelTap', instance._labelTapListener)
        }
        instance._labelTapListener = undefined
      },
    },
    methods: {
      handleLabelTap() {
        // Label activation is dispatched by the label component.
      },
    },
  })

  return { base, hover, reload, autofill, labelAria, labelTarget, disabled, dataComponent, group, item, sizeNormalizer, classPrefix, touchTrack, scroller }
}

export type BuiltinBehaviors = ReturnType<typeof createBuiltinBehaviors>


function isButtonComponent(is: string | undefined): boolean {
  return /:button$/.test(String(is ?? ''))
}

function relatedRole(is: string | undefined): string | undefined {
  const value = String(is ?? '')
  if (/:radio$/.test(value)) return 'radio'
  if (/:switch$/.test(value)) return 'checkbox'
  if (/:checkbox$/.test(value)) return 'checkbox'
  if (/:button$/.test(value)) return 'button'
  return undefined
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

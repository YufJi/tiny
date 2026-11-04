import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'
import type { TouchTrackEvent } from '../../behaviors'

type Rect = { left: number; top: number; width: number; height: number }

type MovableAreaLike = {
  _width?: number
  _height?: number
  getBackendElement?: () => HTMLElement | null
}

type MovableViewRuntime = {
  _area?: MovableAreaLike
  _areaWidth: number
  _areaHeight: number
  _width: number
  _height: number
  _offsetX: number
  _offsetY: number
  _scaleOffsetX: number
  _scaleOffsetY: number
  _translateX: number
  _translateY: number
  _scale: number
  _oldScale: number
  _minX: number
  _maxX: number
  _minY: number
  _maxY: number
  _xMove: boolean
  _yMove: boolean
  _isTouching: boolean
  _isScaling: boolean
  _firstMoveDirection: string | null
  _checkCanMove: boolean | null
  _baseX: number
  _baseY: number
  _historyX: [number, number]
  _historyY: [number, number]
  _historyT: [number, number]
  _trackCleanup?: () => void
  _animationFrame?: number
  _tracker?: (event: TouchTrackEvent) => boolean | void
  getBackendElement?: () => HTMLElement | null
  touchtrack?: (
    element: unknown,
    handler: (event: TouchTrackEvent) => boolean | void,
  ) => () => void
}

const MIN_SCALE = 0.1
const MAX_SCALE = 10

function numberValue(value: unknown): number {
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function roundPosition(value: number): number {
  return Number(value.toFixed(1))
}

function roundScale(value: number): number {
  return Number(value.toFixed(3))
}


/**
 * Mirrors `wx-movable-view` in WeChat WebView 2.33.0.
 *
 * Behavior mapping:
 * - `wx-base`            -> `ctx.behaviors.base`
 * - `wx-touchtrack`      -> `ctx.behaviors.touchTrack` (single-finger drag)
 * - `wx-reload`          -> `ctx.behaviors.reload` (saved/restored state)
 * - `wx-positioning-container` -> pending native/Skyline integration; the web
 *   host measures the DOM area directly instead of registering a positioning
 *   container with the native layer.
 */
export function defineMovableView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('movable-view'),
    template: ctx.template('movable-view'),
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.touchTrack,
      ctx.behaviors.positioningContainer,
      ctx.behaviors.reload,
    ],
    properties: {
      x: { value: 0, observer: 'xChanged' },
      y: { value: 0, observer: 'yChanged' },
      direction: { type: String, value: 'none' },
      outOfBounds: { type: Boolean, value: false },
      inertia: { type: Boolean, value: false },
      friction: { type: Number, value: 2 },
      damping: { type: Number, value: 20 },
      disabled: { type: Boolean, value: false, observer: 'disabledChanged' },
      scale: { type: Boolean, value: false },
      scaleMin: { type: Number, value: 0.1, observer: 'scaleRangeChanged' },
      scaleMax: { type: Number, value: 10, observer: 'scaleRangeChanged' },
      scaleValue: { type: Number, value: 1, observer: 'scaleValueChanged' },
      animation: { type: Boolean, value: true },
    },
    options: ctx.hostOptions('movable-view'),
    lifetimes: {
      created() {
        const runtime = this as unknown as MovableViewRuntime
        runtime._areaWidth = 0
        runtime._areaHeight = 0
        runtime._width = 0
        runtime._height = 0
        runtime._offsetX = 0
        runtime._offsetY = 0
        runtime._scaleOffsetX = 0
        runtime._scaleOffsetY = 0
        runtime._translateX = 0
        runtime._translateY = 0
        runtime._scale = 1
        runtime._oldScale = 1
        runtime._minX = 0
        runtime._maxX = 0
        runtime._minY = 0
        runtime._maxY = 0
        runtime._xMove = false
        runtime._yMove = false
        runtime._isTouching = false
        runtime._isScaling = false
        runtime._firstMoveDirection = null
        runtime._checkCanMove = null
        runtime._baseX = 0
        runtime._baseY = 0
        runtime._historyX = [0, 0]
        runtime._historyY = [0, 0]
        runtime._historyT = [0, 0]
        runtime._tracker = (event) => (
          this as unknown as { _onTrack: (event: TouchTrackEvent) => boolean | void }
        )._onTrack(event)
        runtime._trackCleanup = runtime.touchtrack?.(this, runtime._tracker)
      },
      attached() {
        const runtime = this as unknown as MovableViewRuntime
        const host = runtime.getBackendElement?.()
        if (host) {
          host.setAttribute('aria-dropeffect', 'move')
          host.setAttribute('aria-label', '可移动')
          host.style.transformOrigin = 'center'
          host.style.webkitTransformOrigin = 'center'
        }
        const direction = String(this.data.direction ?? 'none')
        runtime._xMove = direction === 'horizontal' || direction === 'all'
        runtime._yMove = direction === 'vertical' || direction === 'all'
        if (numberValue(this.data.friction) <= 0) this.setData({ friction: 2 })
        runtime._scale = 1
        runtime._oldScale = 1
        ;(this as unknown as { measure: () => void }).measure()
        if (this.data.scale && numberValue(this.data.scaleValue) !== 1) {
          ;(this as unknown as { _updateScale: (value: number, animate?: boolean) => void })
            ._updateScale(numberValue(this.data.scaleValue) || 1, false)
          ;(this as unknown as { _updateOldScale: (value: number) => void })
            ._updateOldScale(runtime._scale)
        }
        this.triggerEvent('wxMovableViewChanged', undefined, { bubbles: true })
      },
      detached() {
        const runtime = this as unknown as MovableViewRuntime
        runtime._trackCleanup?.()
        runtime._trackCleanup = undefined
        if (runtime._animationFrame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._animationFrame)
        }
        runtime._animationFrame = undefined
        this.triggerEvent('wxMovableViewChanged', undefined, { bubbles: true })
      },
      saved(state: Record<string, unknown>) {
        const runtime = this as unknown as MovableViewRuntime
        const saved = {
          _savedX: runtime._translateX,
          _savedY: runtime._translateY,
          _savedScale: runtime._scale,
        }
        ;(this as unknown as {
          saveCompVar: (target: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(saved, ['x', 'y', 'scaleValue', '_savedX', '_savedY', '_savedScale'])
        ;(this as unknown as {
          saveState: (target: Record<string, unknown>, value: Record<string, unknown>) => void
        }).saveState(state, saved)
      },
      restored(state: Record<string, unknown>) {
        const restored = (this as unknown as {
          restoreState: (target: Record<string, unknown>) => Record<string, unknown> | undefined
        }).restoreState(state)
        if (!restored) return
        ;(this as unknown as {
          restoreCompVar: (target: Record<string, unknown>) => void
        }).restoreCompVar(restored)
        const runtime = this as unknown as MovableViewRuntime
        const x = numberValue(restored._savedX)
        const y = numberValue(restored._savedY)
        const scale = numberValue(restored._savedScale) || 1
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            ;(this as unknown as {
              _setTransform: (
                x: number, y: number, scale: number, source?: string,
                animate?: boolean, emitScale?: boolean,
              ) => void
            })._setTransform(x, y, scale, '', false, true)
          })
        }
      },
    },
    methods: {
      hostElement(): HTMLElement | null {
        return (this as unknown as MovableViewRuntime).getBackendElement?.() ?? null
      },
      areaElement(): HTMLElement | null {
        const host = (this as unknown as MovableViewRuntime).getBackendElement?.()
        return (host?.closest?.('tiny-movable-area') as HTMLElement | null) ?? null
      },
      measure() {
        const runtime = this as unknown as MovableViewRuntime
        const host = (this as unknown as { hostElement: () => HTMLElement | null }).hostElement()
        if (!host) return
        if (runtime._area?._width !== undefined) {
          ;(this as unknown as { _setParent: (area: MovableAreaLike) => void })
            ._setParent(runtime._area)
          return
        }
        const areaElement = (this as unknown as {
          areaElement: () => HTMLElement | null
        }).areaElement()
        const area = (areaElement as { __wxElement?: MovableAreaLike } | null)?.__wxElement
        if (area) {
          ;(this as unknown as {
            _setParent: (area: MovableAreaLike) => void
          })._setParent(area)
        }
      },
      _updateOffset() {
        const runtime = this as unknown as MovableViewRuntime
        const area = runtime._area
        if (!area) return
        const offset = (this as unknown as {
          getLayoutOffset?: (parent?: unknown) => Rect
          getPositioningOffset?: (parent?: unknown) => Rect
        }).getLayoutOffset?.(area)
          ?? (this as unknown as {
            getPositioningOffset?: (parent?: unknown) => Rect
          }).getPositioningOffset?.(area)
        if (!offset) return
        runtime._offsetX = offset.left
        runtime._offsetY = offset.top
      },
      _updateWH(nextScale?: number) {
        const runtime = this as unknown as MovableViewRuntime
        const host = (this as unknown as { hostElement: () => HTMLElement | null }).hostElement()
        if (!host) return
        const rect = host.getBoundingClientRect()
        const current = runtime._scale || 1
        // offsetWidth/Height are layout dimensions and stay stable while the
        // transform is animating or already scaled.
        runtime._width = Math.max(0, host.offsetWidth || rect.width / current)
        runtime._height = Math.max(0, host.offsetHeight || rect.height / current)
        const scale = (this as unknown as { _adjustScale: (value: number) => number })
          ._adjustScale(nextScale ?? runtime._scale)
        runtime._scaleOffsetX = (runtime._width * scale - runtime._width) / 2
        runtime._scaleOffsetY = (runtime._height * scale - runtime._height) / 2
      },
      _updateBoundary() {
        const runtime = this as unknown as MovableViewRuntime
        const minX = -runtime._offsetX + runtime._scaleOffsetX
        const maxX = runtime._areaWidth - runtime._width - runtime._offsetX - runtime._scaleOffsetX
        const minY = -runtime._offsetY + runtime._scaleOffsetY
        const maxY = runtime._areaHeight - runtime._height - runtime._offsetY - runtime._scaleOffsetY
        runtime._minX = Math.min(minX, maxX)
        runtime._maxX = Math.max(minX, maxX)
        runtime._minY = Math.min(minY, maxY)
        runtime._maxY = Math.max(minY, maxY)
      },
      _adjustScale(value: number): number {
        const runtime = this as unknown as MovableViewRuntime
        const min = Math.max(MIN_SCALE, numberValue(this.data.scaleMin))
        const max = Math.min(MAX_SCALE, numberValue(this.data.scaleMax))
        return clamp(Number.isFinite(value) ? value : runtime._scale, min, Math.max(min, max))
      },
      _updateOldScale(value: number) {
        ;(this as unknown as MovableViewRuntime)._oldScale = value
      },
      _getLimitXY(x: number, y: number): { x: number; y: number; outOfBounds: boolean } {
        const runtime = this as unknown as MovableViewRuntime
        let out = false
        if (x > runtime._maxX) { x = runtime._maxX; out = true }
        else if (x < runtime._minX) { x = runtime._minX; out = true }
        if (y > runtime._maxY) { y = runtime._maxY; out = true }
        else if (y < runtime._minY) { y = runtime._minY; out = true }
        return { x, y, outOfBounds: out }
      },
      _setTransform(
        x: number,
        y: number,
        scale: number,
        source = '',
        animate = false,
        emitScale = false,
        silent = false,
      ) {
        const runtime = this as unknown as MovableViewRuntime
        const host = (this as unknown as { hostElement: () => HTMLElement | null }).hostElement()
        if (!host?.style) return
        x = Number.isFinite(x) ? x : runtime._translateX
        y = Number.isFinite(y) ? y : runtime._translateY
        scale = Number.isFinite(scale) ? scale : runtime._scale
        x = roundPosition(x)
        y = roundPosition(y)
        scale = roundScale((this as unknown as { _adjustScale: (value: number) => number })
          ._adjustScale(scale))
        if (!this.data.scale) scale = runtime._scale
        const eventX = roundPosition(x - runtime._scaleOffsetX)
        const eventY = roundPosition(y - runtime._scaleOffsetY)
        const moved = x !== runtime._translateX || y !== runtime._translateY
        const scaleChanged = scale !== runtime._scale
        host.style.transition = animate ? 'transform 300ms ease-out' : 'none'
        const transform = `translateX(${x}px) translateY(${y}px) translateZ(0px) scale(${scale})`
        host.style.transform = transform
        host.style.webkitTransform = transform
        runtime._translateX = x
        runtime._translateY = y
        runtime._scale = scale
        if (moved && !silent) {
          this.triggerEvent('change', { x: eventX, y: eventY, source })
        }
        if (emitScale && scaleChanged) {
          this.triggerEvent('scale', { scale, x: eventX, y: eventY })
        }
      },
      _updateTransform(x: number, y: number) {
        const runtime = this as unknown as MovableViewRuntime
        if (!runtime._xMove) x = runtime._translateX
        if (!runtime._yMove) y = runtime._translateY
        const limited = (this as unknown as {
          _getLimitXY: (x: number, y: number) => { x: number; y: number }
        })._getLimitXY(x, y)
        ;(this as unknown as {
          _setTransform: (x: number, y: number, scale: number, source?: string, animate?: boolean) => void
        })._setTransform(limited.x, limited.y, runtime._scale, '', true)
      },
      _updateScale(nextScale: number, animate = false) {
        const runtime = this as unknown as MovableViewRuntime
        if (!this.data.scale) return
        const scale = (this as unknown as { _adjustScale: (value: number) => number })
          ._adjustScale(nextScale)
        if (!runtime._isScaling) {
          ;(this as unknown as { _updateWH: (value?: number) => void })._updateWH(scale)
          ;(this as unknown as { _updateBoundary: () => void })._updateBoundary()
        }
        const limited = (this as unknown as {
          _getLimitXY: (x: number, y: number) => { x: number; y: number }
        })._getLimitXY(runtime._translateX, runtime._translateY)
        ;(this as unknown as {
          _setTransform: (x: number, y: number, scale: number, source?: string, animate?: boolean, emitScale?: boolean) => void
        })._setTransform(limited.x, limited.y, scale, '', animate, true)
      },
      _setParent(area: MovableAreaLike) {
        const runtime = this as unknown as MovableViewRuntime
        runtime._area = area
        runtime._areaWidth = numberValue(area._width)
        runtime._areaHeight = numberValue(area._height)
        ;(this as unknown as { _updateOffset: () => void })._updateOffset()
        ;(this as unknown as { _updateWH: (value?: number) => void })._updateWH(runtime._scale)
        ;(this as unknown as { _updateBoundary: () => void })._updateBoundary()
        const x = numberValue(this.data.x) + runtime._scaleOffsetX
        const y = numberValue(this.data.y) + runtime._scaleOffsetY
        const limited = (this as unknown as {
          _getLimitXY: (x: number, y: number) => { x: number; y: number }
        })._getLimitXY(x, y)
        ;(this as unknown as {
          _setTransform: (x: number, y: number, scale: number, source?: string, animate?: boolean, emitScale?: boolean, silent?: boolean) => void
        })._setTransform(limited.x, limited.y, runtime._scale, '', false, false, true)
        ;(this as unknown as { _updateOldScale: (value: number) => void })._updateOldScale(runtime._scale)
      },
      setScale(ratio: number) {
        const runtime = this as unknown as MovableViewRuntime
        if (!this.data.scale || !Number.isFinite(ratio) || ratio === 1) return
        runtime._isScaling = true
        const next = ratio * runtime._oldScale
        ;(this as unknown as {
          _updateScale: (value: number, animate?: boolean) => void
        })._updateScale(next, false)
      },
      endScale() {
        const runtime = this as unknown as MovableViewRuntime
        runtime._isScaling = false
        ;(this as unknown as { _updateOldScale: (value: number) => void })
          ._updateOldScale(runtime._scale)
      },
      xChanged(next: unknown) {
        const runtime = this as unknown as MovableViewRuntime
        if (!runtime._xMove) return
        ;(this as unknown as { measure: () => void }).measure()
        const x = numberValue(next) + runtime._scaleOffsetX
        const y = numberValue(this.data.y) + runtime._scaleOffsetY
        ;(this as unknown as { _updateTransform: (x: number, y: number) => void })
          ._updateTransform(x, y)
      },
      yChanged(next: unknown) {
        const runtime = this as unknown as MovableViewRuntime
        if (!runtime._yMove) return
        ;(this as unknown as { measure: () => void }).measure()
        const x = numberValue(this.data.x) + runtime._scaleOffsetX
        const y = numberValue(next) + runtime._scaleOffsetY
        ;(this as unknown as { _updateTransform: (x: number, y: number) => void })
          ._updateTransform(x, y)
      },
      scaleValueChanged(next: unknown) {
        if (!this.data.scale) return
        ;(this as unknown as { measure: () => void }).measure()
        ;(this as unknown as {
          _updateScale: (value: number, animate?: boolean) => void
        })._updateScale(numberValue(next) || 1, true)
        ;(this as unknown as { _updateOldScale: (value: number) => void })
          ._updateOldScale((this as unknown as MovableViewRuntime)._scale)
      },
      scaleRangeChanged() {
        if (!this.data.scale) return
        const runtime = this as unknown as MovableViewRuntime
        ;(this as unknown as { _updateScale: (value: number, animate?: boolean) => void })
          ._updateScale(runtime._scale, true)
      },
      disabledChanged(next: boolean) {
        if (!next) return
        const runtime = this as unknown as MovableViewRuntime
        runtime._isTouching = false
        if (runtime._animationFrame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._animationFrame)
        }
        runtime._animationFrame = undefined
      },
      _onTrack(event: TouchTrackEvent) {
        const runtime = this as unknown as MovableViewRuntime
        const state = event.detail.state
        if (state === 'start') {
          if (runtime._isScaling || this.data.disabled) return
          if (runtime._animationFrame && typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(runtime._animationFrame)
          }
          runtime._animationFrame = undefined
          runtime._historyX = [0, 0]
          runtime._historyY = [0, 0]
          runtime._historyT = [0, 0]
          runtime._baseX = runtime._translateX
          runtime._baseY = runtime._translateY
          runtime._firstMoveDirection = null
          runtime._checkCanMove = null
          runtime._isTouching = true
          const host = (this as unknown as { hostElement: () => HTMLElement | null }).hostElement()
          if (host) host.style.willChange = 'transform'
          return
        }
        if (state === 'move') {
          if (runtime._isScaling || this.data.disabled || !runtime._isTouching) return
          let x = runtime._translateX
          let y = runtime._translateY
          if (runtime._firstMoveDirection === null) {
            runtime._firstMoveDirection = Math.abs(event.detail.dx / event.detail.dy) > 1
              ? 'htouchmove'
              : 'vtouchmove'
          }
          if (runtime._xMove) {
            x = runtime._baseX + event.detail.dx
            runtime._historyX.shift()
            runtime._historyX.push(x)
            if (!runtime._yMove && runtime._checkCanMove === null) {
              runtime._checkCanMove = Math.abs(event.detail.dx / event.detail.dy) > 1 ? false : true
            }
          }
          if (runtime._yMove) {
            y = runtime._baseY + event.detail.dy
            runtime._historyY.shift()
            runtime._historyY.push(y)
            if (!runtime._xMove && runtime._checkCanMove === null) {
              runtime._checkCanMove = Math.abs(event.detail.dy / event.detail.dx) > 1 ? false : true
            }
          }
          runtime._historyT.shift()
          runtime._historyT.push(event.detail.timeStamp)
          if (runtime._checkCanMove !== true) {
            event.preventDefault()
            let source = 'touch'
            if (x < runtime._minX) {
              if (this.data.outOfBounds) {
                source = 'touch-out-of-bounds'
                x = runtime._minX - (runtime._minX - x) * 0.5
              } else {
                x = runtime._minX
              }
            } else if (x > runtime._maxX) {
              if (this.data.outOfBounds) {
                source = 'touch-out-of-bounds'
                x = runtime._maxX + (x - runtime._maxX) * 0.5
              } else {
                x = runtime._maxX
              }
            }
            if (y < runtime._minY) {
              if (this.data.outOfBounds) {
                source = 'touch-out-of-bounds'
                y = runtime._minY - (runtime._minY - y) * 0.5
              } else {
                y = runtime._minY
              }
            } else if (y > runtime._maxY) {
              if (this.data.outOfBounds) {
                source = 'touch-out-of-bounds'
                y = runtime._maxY + (y - runtime._maxY) * 0.5
              } else {
                y = runtime._maxY
              }
            }
            ;(this as unknown as {
              _setTransform: (x: number, y: number, scale: number, source?: string) => void
            })._setTransform(x, y, runtime._scale, source)
          }
          this.triggerEvent(runtime._firstMoveDirection ?? 'htouchmove', undefined, {
            bubbles: false,
            composed: true,
            extraFields: {
              touches: event.touches,
              changedTouches: event.changedTouches,
            },
          } as never)
          return
        }
        if (state === 'end' || state === 'cancel') {
          if (runtime._isScaling || this.data.disabled || !runtime._isTouching) return
          const host = (this as unknown as { hostElement: () => HTMLElement | null }).hostElement()
          if (host) host.style.willChange = 'auto'
          runtime._isTouching = false
          const outOfBounds = (this as unknown as { _revise: (source: string) => boolean })
            ._revise('out-of-bounds')
          if (!outOfBounds && this.data.inertia && runtime._checkCanMove !== true) {
            ;(this as unknown as { _inertia: () => void })._inertia()
          }
        }
      },
      _revise(source: string): boolean {
        const runtime = this as unknown as MovableViewRuntime
        const limited = (this as unknown as {
          _getLimitXY: (x: number, y: number) => { x: number; y: number; outOfBounds: boolean }
        })._getLimitXY(runtime._translateX, runtime._translateY)
        if (!limited.outOfBounds) return false
        ;(this as unknown as {
          _setTransform: (x: number, y: number, scale: number, source?: string, animate?: boolean) => void
        })._setTransform(limited.x, limited.y, runtime._scale, source, true)
        return true
      },
      _inertia() {
        const runtime = this as unknown as MovableViewRuntime
        const dt = runtime._historyT[1] - runtime._historyT[0]
        if (!(dt > 0)) return
        let vx = ((runtime._historyX[1] - runtime._historyX[0]) / dt) * 1000
        let vy = ((runtime._historyY[1] - runtime._historyY[0]) / dt) * 1000
        if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) return
        const friction = Math.max(1, numberValue(this.data.friction) || 2)
        let last = typeof performance !== 'undefined' ? performance.now() : Date.now()
        const step = (now: number) => {
          const delta = Math.max(1, now - last)
          last = now
          const decay = Math.exp((-friction * delta) / 1000)
          vx *= decay
          vy *= decay
          const limited = (this as unknown as {
            _getLimitXY: (x: number, y: number) => { x: number; y: number; outOfBounds: boolean }
          })._getLimitXY(runtime._translateX + (vx * delta) / 1000, runtime._translateY + (vy * delta) / 1000)
          ;(this as unknown as {
            _setTransform: (x: number, y: number, scale: number, source?: string) => void
          })._setTransform(limited.x, limited.y, runtime._scale, 'friction')
          if (limited.outOfBounds || (Math.abs(vx) < 5 && Math.abs(vy) < 5)) {
            runtime._animationFrame = undefined
            return
          }
          runtime._animationFrame = requestAnimationFrame(step)
        }
        runtime._animationFrame = requestAnimationFrame(step)
      },
    },
  }).general()
}

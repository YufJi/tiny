import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type MovableViewRuntime = {
  _x: number
  _y: number
  _scale: number
  _areaWidth: number
  _areaHeight: number
  _viewWidth: number
  _viewHeight: number
  _dragging: boolean
  _startTouchX: number
  _startTouchY: number
  _startX: number
  _startY: number
  _lastTouchX: number
  _lastTouchY: number
  _lastTime: number
  _velocityX: number
  _velocityY: number
  _pinchStart: number
  _pinchScale: number
  _frame?: number
  _horizontalEmitted?: boolean
  _verticalEmitted?: boolean
  _touchStart?: (event: TouchEvent) => void
  _touchMove?: (event: TouchEvent) => void
  _touchEnd?: (event: TouchEvent) => void
  getBackendElement?: () => HTMLElement | null
}

const DIRECTIONS = new Set(['none', 'all', 'horizontal', 'vertical'])

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function distanceOf(touches: TouchList): number {
  if (touches.length < 2) return 0
  const dx = touches[1]!.pageX - touches[0]!.pageX
  const dy = touches[1]!.pageY - touches[0]!.pageY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Mirrors `wx-movable-view`: absolute positioning inside `movable-area`,
 * touch drag with direction limits and inertia, plus pinch scaling.
 */
export function defineMovableView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('movable-view'),
    template: ctx.template('movable-view'),
    behaviors: [ctx.behaviors.base],
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
      attached() {
        const runtime = this as unknown as MovableViewRuntime
        runtime._x = Number(this.data.x) || 0
        runtime._y = Number(this.data.y) || 0
        runtime._scale = clamp(Number(this.data.scaleValue) || 1, Number(this.data.scaleMin) || 0.1, Number(this.data.scaleMax) || 10)
        runtime._dragging = false
        runtime._pinchStart = 0
        runtime._pinchScale = runtime._scale
        const host = runtime.getBackendElement?.()
        if (!host) return
        host.setAttribute('aria-dropeffect', 'move')
        host.setAttribute('aria-label', '可移动')
        host.style.transformOrigin = 'center'
        runtime._touchStart = (event) => {
          ;(this as unknown as { dragStart: (event: TouchEvent) => void }).dragStart(event)
        }
        runtime._touchMove = (event) => {
          ;(this as unknown as { dragMove: (event: TouchEvent) => void }).dragMove(event)
        }
        runtime._touchEnd = (event) => {
          ;(this as unknown as { dragEnd: (event: TouchEvent) => void }).dragEnd(event)
        }
        host.addEventListener('touchstart', runtime._touchStart, { passive: true })
        host.addEventListener('touchmove', runtime._touchMove, { passive: false })
        host.addEventListener('touchend', runtime._touchEnd, { passive: true })
        host.addEventListener('touchcancel', runtime._touchEnd, { passive: true })
        ;(this as unknown as { measure: () => void }).measure()
        ;(this as unknown as { apply: (animate: boolean) => void }).apply(false)
      },
      detached() {
        const runtime = this as unknown as MovableViewRuntime
        if (runtime._frame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._frame)
        }
        const host = runtime.getBackendElement?.()
        if (host) {
          if (runtime._touchStart) host.removeEventListener('touchstart', runtime._touchStart)
          if (runtime._touchMove) host.removeEventListener('touchmove', runtime._touchMove)
          if (runtime._touchEnd) {
            host.removeEventListener('touchend', runtime._touchEnd)
            host.removeEventListener('touchcancel', runtime._touchEnd)
          }
        }
      },
    },
    methods: {
      area(): HTMLElement | null {
        const host = (this as unknown as MovableViewRuntime).getBackendElement?.()
        return (host?.closest?.('tiny-movable-area') as HTMLElement | null) ?? null
      },
      measure() {
        const runtime = this as unknown as MovableViewRuntime
        const host = runtime.getBackendElement?.()
        const area = (this as unknown as { area: () => HTMLElement | null }).area()
        if (!host || !area) return
        const areaRect = area.getBoundingClientRect()
        runtime._areaWidth = areaRect.width || area.clientWidth || 0
        runtime._areaHeight = areaRect.height || area.clientHeight || 0
        runtime._viewWidth = host.offsetWidth || 0
        runtime._viewHeight = host.offsetHeight || 0
      },
      maxX(): number {
        const runtime = this as unknown as MovableViewRuntime
        return Math.max(0, runtime._areaWidth - runtime._viewWidth * runtime._scale)
      },
      maxY(): number {
        const runtime = this as unknown as MovableViewRuntime
        return Math.max(0, runtime._areaHeight - runtime._viewHeight * runtime._scale)
      },
      apply(animate: boolean) {
        const runtime = this as unknown as MovableViewRuntime
        const host = runtime.getBackendElement?.()
        if (!host?.style) return
        const duration = animate && this.data.animation ? '300ms' : '0ms'
        host.style.transition = `transform ${duration} ease-out`
        host.style.transform = `translate3d(${runtime._x}px, ${runtime._y}px, 0) scale(${runtime._scale})`
      },
      emitChange(source: string) {
        this.triggerEvent('change', {
          x: (this as unknown as MovableViewRuntime)._x,
          y: (this as unknown as MovableViewRuntime)._y,
          source,
        })
      },
      emitScale() {
        const runtime = this as unknown as MovableViewRuntime
        this.triggerEvent('scale', { x: runtime._x, y: runtime._y, scale: runtime._scale })
      },
      setPosition(x: number, y: number, source: string, animate: boolean) {
        const runtime = this as unknown as MovableViewRuntime
        runtime._x = clamp(x, 0, (this as unknown as { maxX: () => number }).maxX())
        runtime._y = clamp(y, 0, (this as unknown as { maxY: () => number }).maxY())
        ;(this as unknown as { apply: (value: boolean) => void }).apply(animate)
        ;(this as unknown as { emitChange: (value: string) => void }).emitChange(source)
      },
      setScale(ratio: number) {
        const runtime = this as unknown as MovableViewRuntime
        if (!Number.isFinite(ratio) || ratio === 1) return
        const min = Number(this.data.scaleMin) || 0.1
        const max = Number(this.data.scaleMax) || 10
        runtime._scale = clamp(runtime._scale * ratio, min, max)
        ;(this as unknown as { apply: (value: boolean) => void }).apply(false)
        ;(this as unknown as { emitScale: () => void }).emitScale()
      },
      xChanged(next: unknown) {
        const runtime = this as unknown as MovableViewRuntime
        const value = Number(next) || 0
        ;(this as unknown as { measure: () => void }).measure()
        runtime._x = clamp(value, 0, (this as unknown as { maxX: () => number }).maxX())
        ;(this as unknown as { apply: (value: boolean) => void }).apply(true)
      },
      yChanged(next: unknown) {
        const runtime = this as unknown as MovableViewRuntime
        const value = Number(next) || 0
        ;(this as unknown as { measure: () => void }).measure()
        runtime._y = clamp(value, 0, (this as unknown as { maxY: () => number }).maxY())
        ;(this as unknown as { apply: (value: boolean) => void }).apply(true)
      },
      scaleValueChanged(next: unknown) {
        const runtime = this as unknown as MovableViewRuntime
        const min = Number(this.data.scaleMin) || 0.1
        const max = Number(this.data.scaleMax) || 10
        runtime._scale = clamp(Number(next) || 1, min, max)
        ;(this as unknown as { apply: (value: boolean) => void }).apply(true)
      },
      scaleRangeChanged() {
        const runtime = this as unknown as MovableViewRuntime
        const min = Number(this.data.scaleMin) || 0.1
        const max = Number(this.data.scaleMax) || 10
        runtime._scale = clamp(runtime._scale, min, max)
        ;(this as unknown as { apply: (value: boolean) => void }).apply(true)
      },
      disabledChanged(next: boolean) {
        if (!next) return
        const runtime = this as unknown as MovableViewRuntime
        runtime._dragging = false
        if (runtime._frame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._frame)
          runtime._frame = undefined
        }
      },
      dragStart(event: TouchEvent) {
        const runtime = this as unknown as MovableViewRuntime
        if (this.data.disabled) return
        if (runtime._frame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._frame)
          runtime._frame = undefined
        }
        const directions = DIRECTIONS.has(String(this.data.direction))
          ? String(this.data.direction)
          : 'none'
        if (directions === 'none') return
        if (event.touches.length >= 2 && this.data.scale) {
          runtime._pinchStart = distanceOf(event.touches)
          runtime._pinchScale = runtime._scale
          return
        }
        const touch = event.touches[0]
        if (!touch) return
        ;(this as unknown as { measure: () => void }).measure()
        runtime._dragging = true
        runtime._startTouchX = touch.pageX
        runtime._startTouchY = touch.pageY
        runtime._startX = runtime._x
        runtime._startY = runtime._y
        runtime._lastTouchX = touch.pageX
        runtime._lastTouchY = touch.pageY
        runtime._lastTime = Date.now()
        runtime._velocityX = 0
        runtime._velocityY = 0
        runtime._horizontalEmitted = false
        runtime._verticalEmitted = false
      },
      dragMove(event: TouchEvent) {
        const runtime = this as unknown as MovableViewRuntime
        if (this.data.disabled) return
        if (event.touches.length >= 2 && this.data.scale && runtime._pinchStart > 0) {
          event.preventDefault()
          const ratio = distanceOf(event.touches) / runtime._pinchStart
          const min = Number(this.data.scaleMin) || 0.1
          const max = Number(this.data.scaleMax) || 10
          runtime._scale = clamp(runtime._pinchScale * ratio, min, max)
          ;(this as unknown as { apply: (value: boolean) => void }).apply(false)
          ;(this as unknown as { emitScale: () => void }).emitScale()
          return
        }
        if (!runtime._dragging) return
        const touch = event.touches[0]
        if (!touch) return
        event.preventDefault()
        const direction = DIRECTIONS.has(String(this.data.direction))
          ? String(this.data.direction)
          : 'none'
        const dx = touch.pageX - runtime._startTouchX
        const dy = touch.pageY - runtime._startTouchY
        const nextX = direction === 'vertical' ? runtime._x : runtime._startX + dx
        const nextY = direction === 'horizontal' ? runtime._y : runtime._startY + dy
        const now = Date.now()
        const elapsed = Math.max(1, now - runtime._lastTime)
        runtime._velocityX = (touch.pageX - runtime._lastTouchX) / elapsed
        runtime._velocityY = (touch.pageY - runtime._lastTouchY) / elapsed
        runtime._lastTouchX = touch.pageX
        runtime._lastTouchY = touch.pageY
        runtime._lastTime = now

        if (!runtime._horizontalEmitted && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
          runtime._horizontalEmitted = true
          this.triggerEvent('htouchmove', { x: nextX, y: nextY })
        }
        if (!runtime._verticalEmitted && Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
          runtime._verticalEmitted = true
          this.triggerEvent('vtouchmove', { x: nextX, y: nextY })
        }
        ;(this as unknown as {
          setPosition: (x: number, y: number, source: string, animate: boolean) => void
        }).setPosition(nextX, nextY, 'touch', false)
      },
      dragEnd() {
        const runtime = this as unknown as MovableViewRuntime
        runtime._pinchStart = 0
        if (!runtime._dragging) return
        runtime._dragging = false
        if (!this.data.inertia) return
        const speed = Math.sqrt(runtime._velocityX ** 2 + runtime._velocityY ** 2)
        if (speed < 0.05) return
        const friction = Math.max(1, Number(this.data.friction) || 2)
        let last = typeof performance !== 'undefined' ? performance.now() : Date.now()
        const step = (now: number) => {
          const delta = Math.max(1, now - last)
          last = now
          runtime._velocityX *= Math.pow(0.94, delta / 16)
          runtime._velocityY *= Math.pow(0.94, delta / 16)
          const nextX = runtime._x + runtime._velocityX * delta
          const nextY = runtime._y + runtime._velocityY * delta
          ;(this as unknown as {
            setPosition: (x: number, y: number, source: string, animate: boolean) => void
          }).setPosition(nextX, nextY, 'friction', false)
          const moving = Math.sqrt(runtime._velocityX ** 2 + runtime._velocityY ** 2) > 0.02
          const inside = runtime._x > 0 && runtime._x < (this as unknown as { maxX: () => number }).maxX()
            && runtime._y > 0 && runtime._y < (this as unknown as { maxY: () => number }).maxY()
          if (moving && inside) {
            runtime._frame = requestAnimationFrame(step)
          } else {
            runtime._frame = undefined
          }
          if (friction <= 0) return
        }
        runtime._frame = requestAnimationFrame(step)
      },
    },
  }).general()
}

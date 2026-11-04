import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type Rect = { left: number; top: number; width: number; height: number }

type MovableViewApi = {
  _setParent?: (area: MovableAreaLike) => void
  setScale?: (ratio: number) => void
  endScale?: () => void
}

type MovableAreaLike = {
  _width: number
  _height: number
  getBackendElement?: () => HTMLElement | null
}

type MovableAreaRuntime = {
  _width: number
  _height: number
  _views: MovableViewApi[]
  _scaleView: MovableViewApi | null
  _pinchStartLen: number
  _gapX: number
  _gapY: number
  _touchStart?: (event: TouchEvent) => void
  _touchMove?: (event: TouchEvent) => void
  _touchEnd?: (event: TouchEvent) => void
  _pageReRender?: () => void
  _observer?: MutationObserver
  _hostListener?: (event: unknown) => void
  getBackendElement?: () => HTMLElement | null
  addListener?: (name: string, listener: (event: unknown) => void) => void
  removeListener?: (name: string, listener: (event: unknown) => void) => void
}

function touchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0
  const dx = touches[1]!.pageX - touches[0]!.pageX
  const dy = touches[1]!.pageY - touches[0]!.pageY
  return Math.sqrt(dx * dx + dy * dy)
}


/**
 * Mirrors `wx-movable-area` in WeChat WebView 2.30.1.
 *
 * Behavior mapping:
 * - `wx-base`                  -> `ctx.behaviors.base`
 * - `wx-positioning-container` -> pending native/Skyline integration; the web
 *   host measures the content box and propagates it to descendant views.
 * - `listeners.this.wxMovableViewChanged` -> host listener registered on the
 *   area so child view attach/detach refreshes the view list.
 */
export function defineMovableArea(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('movable-area'),
    template: ctx.template('movable-area'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.positioningContainer],
    properties: {
      scaleArea: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('movable-area'),
    lifetimes: {
      created() {
        const runtime = this as unknown as MovableAreaRuntime
        runtime._width = 0
        runtime._height = 0
        runtime._views = []
        runtime._scaleView = null
        runtime._pinchStartLen = 0
        runtime._gapX = 0
        runtime._gapY = 0
        runtime._hostListener = () => {
          ;(this as unknown as { _movableViewChanged: () => void })._movableViewChanged()
        }
        runtime.addListener?.('wxMovableViewChanged', runtime._hostListener)
      },
      attached() {
        const runtime = this as unknown as MovableAreaRuntime
        const host = runtime.getBackendElement?.()
        if (host) {
          runtime._touchStart = (event) => {
            ;(this as unknown as {
              _onTouchStart: (event: TouchEvent) => void
            })._onTouchStart(event)
          }
          runtime._touchMove = (event) => {
            ;(this as unknown as {
              _onTouchMove: (event: TouchEvent) => void
            })._onTouchMove(event)
          }
          runtime._touchEnd = (event) => {
            ;(this as unknown as {
              _onTouchEnd: (event: TouchEvent) => void
            })._onTouchEnd(event)
          }
          host.addEventListener('touchstart', runtime._touchStart, { passive: true })
          host.addEventListener('touchmove', runtime._touchMove, { passive: false })
          host.addEventListener('touchend', runtime._touchEnd, { passive: true })
          host.addEventListener('touchcancel', runtime._touchEnd, { passive: true })
          if (typeof MutationObserver !== 'undefined') {
            runtime._observer = new MutationObserver(() => {
              ;(this as unknown as { _performUpdate: () => void })._performUpdate()
            })
            runtime._observer.observe(host, { attributes: true, attributeFilter: ['class', 'style'] })
          }
        }
        runtime._pageReRender = () => {
          ;(this as unknown as { _performUpdate: () => void })._performUpdate()
        }
        if (typeof document !== 'undefined') {
          document.addEventListener('pageReRender', runtime._pageReRender)
        }
        ;(this as unknown as { _movableViewChanged: () => void })._movableViewChanged()
        // Attached runs before the page stylesheet has necessarily been laid
        // out; measure once more on the next frame (the reference observer
        // also reacts to the final class/style application).
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            ;(this as unknown as { _performUpdate: () => void })._performUpdate()
          })
        }
      },
      detached() {
        const runtime = this as unknown as MovableAreaRuntime
        const host = runtime.getBackendElement?.()
        if (host) {
          if (runtime._touchStart) host.removeEventListener('touchstart', runtime._touchStart)
          if (runtime._touchMove) host.removeEventListener('touchmove', runtime._touchMove)
          if (runtime._touchEnd) {
            host.removeEventListener('touchend', runtime._touchEnd)
            host.removeEventListener('touchcancel', runtime._touchEnd)
          }
        }
        runtime._observer?.disconnect()
        runtime._observer = undefined
        if (runtime._pageReRender && typeof document !== 'undefined') {
          document.removeEventListener('pageReRender', runtime._pageReRender)
        }
        runtime._pageReRender = undefined
        if (runtime._hostListener) {
          runtime.removeListener?.('wxMovableViewChanged', runtime._hostListener)
        }
        runtime._hostListener = undefined
        runtime._views = []
      },
    },
    methods: {
      views(): MovableViewApi[] {
        const runtime = this as unknown as MovableAreaRuntime
        const host = runtime.getBackendElement?.()
        if (!host) return []
        return Array.from(host.querySelectorAll('tiny-movable-view'))
          .filter((node) => node.closest?.('tiny-movable-area') === host)
          .map((node) => (node as { __wxElement?: MovableViewApi }).__wxElement)
          .filter((view): view is MovableViewApi => Boolean(view))
      },
      _movableViewChanged() {
        const runtime = this as unknown as MovableAreaRuntime
        runtime._views = (this as unknown as { views: () => MovableViewApi[] }).views()
        ;(this as unknown as { _updateArea: () => void })._updateArea()
        return false
      },
      _updateArea() {
        const runtime = this as unknown as MovableAreaRuntime
        const behavior = this as unknown as {
          initPositioningContainer?: () => { position: Rect }
          _getContainerArguments?: () => { position: Rect }
        }
        const args = behavior.initPositioningContainer?.()
          ?? behavior._getContainerArguments?.()
        if (!args) return false
        runtime._width = args.position.width
        runtime._height = args.position.height
        for (const view of runtime._views) view._setParent?.(runtime)
        return true
      },
      _performUpdate() {
        ;(this as unknown as { _updateArea: () => void })._updateArea()
      },
      _targetView(target: EventTarget | null): MovableViewApi | null {
        let element = target as HTMLElement | null
        const host = (this as unknown as MovableAreaRuntime).getBackendElement?.()
        while (element && element !== host) {
          if (element.tagName === 'TINY-MOVABLE-VIEW') {
            const view = (element as { __wxElement?: MovableViewApi }).__wxElement
            return view && (this as unknown as {
              views: () => MovableViewApi[]
            }).views().includes(view) ? view : null
          }
          element = element.parentElement
        }
        return null
      },
      _onTouchStart(event: TouchEvent) {
        const runtime = this as unknown as MovableAreaRuntime
        if (event.touches.length < 2) return
        runtime._gapX = event.touches[1]!.pageX - event.touches[0]!.pageX
        runtime._gapY = event.touches[1]!.pageY - event.touches[0]!.pageY
        runtime._pinchStartLen = touchDistance(event.touches)
        if (!this.data.scaleArea) {
          const first = (this as unknown as {
            _targetView: (target: EventTarget | null) => MovableViewApi | null
          })._targetView(event.touches[0]!.target)
          const second = (this as unknown as {
            _targetView: (target: EventTarget | null) => MovableViewApi | null
          })._targetView(event.touches[1]!.target)
          runtime._scaleView = first && first === second ? first : null
        }
      },
      _onTouchMove(event: TouchEvent) {
        const runtime = this as unknown as MovableAreaRuntime
        if (event.touches.length < 2 || runtime._pinchStartLen <= 0) return
        event.preventDefault()
        const ratio = touchDistance(event.touches) / runtime._pinchStartLen
        if (ratio > 0 && ratio !== 1) {
          if (this.data.scaleArea) {
            runtime._views.forEach((view) => view.setScale?.(ratio))
          } else {
            runtime._scaleView?.setScale?.(ratio)
          }
        }
      },
      _onTouchEnd(event: TouchEvent) {
        const runtime = this as unknown as MovableAreaRuntime
        if (event.touches.length > 0) return
        runtime._gapX = 0
        runtime._gapY = 0
        runtime._pinchStartLen = 0
        if (this.data.scaleArea) {
          runtime._views.forEach((view) => view.endScale?.())
        } else {
          runtime._scaleView?.endScale?.()
        }
        runtime._scaleView = null
      },
    },
  }).general()
}

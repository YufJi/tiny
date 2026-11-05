import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

const MODE_NAMES = [
  'scaleToFill',
  'aspectFit',
  'aspectFill',
  'top',
  'bottom',
  'center',
  'left',
  'right',
  'top left',
  'top right',
  'bottom left',
  'bottom right',
  'widthFix',
  'heightFix',
]

type DivBackend = {
  style?: {
    backgroundImage?: string
    backgroundSize?: string
    backgroundPosition?: string
    backgroundRepeat?: string
  }
  appendChild?: (node: unknown) => void
  removeChild?: (node: unknown) => void
  childNodes?: ArrayLike<unknown>
  addEventListener?: (type: string, listener: (event: Event) => void) => void
  removeEventListener?: (type: string, listener: (event: Event) => void) => void
  ownerDocument?: Document
  __wxElement?: unknown
}

type HostBackend = {
  style?: { width?: string; height?: string }
  getBoundingClientRect?: () => { width: number; height: number }
  ownerDocument?: Document
}

type ImageRuntime = {
  _attached?: boolean
  _changeId?: number
  _hasBeenShown?: boolean
  _originalWidth?: string
  _originalHeight?: string
  _disableSizePositionRepeat?: boolean
  _ratio?: number
  _width?: number
  _height?: number
  _observer?: { disconnect?: () => void }
  _resizeObserver?: { disconnect?: () => void }
  _contextMenuCleanup?: () => void
  _imageElement?: unknown
  getBackendElement?: () => HostBackend | null
  getShadowRoot?: () => {
    getElementById?: (id: string) => { getBackendElement?: () => DivBackend | null } | null
  } | null
}

function cssUrl(src: string): string {
  return `url("${src.replace(/["\\]/g, (char) => `\\${char}`)}")`
}

/**
 * Mirrors `wx-image`: the template is only `#div` plus the slotted span.
 * Images are preloaded through `new Image()`; the default rendering mode paints
 * `#div` with a CSS background, while `renderingMode="img"` appends a real
 * `<img>` node (WeChat uses a native node for the same slot).
 */
export function defineImage(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('image'),
    template: ctx.template('image'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.reload],
    properties: {
      src: { type: String, value: '', observer: 'srcChanged' },
      mode: { type: String, value: 'scaleToFill', observer: 'modeChanged' },
      webp: { type: Boolean, value: false },
      lazyLoad: { type: Boolean, value: false, observer: 'lazyLoadChanged' },
      backgroundSize: { type: String, value: '100% 100%', observer: 'backgroundSizeChanged' },
      backgroundPosition: { type: String, value: '', observer: 'backgroundPositionChanged' },
      backgroundRepeat: { type: String, value: 'no-repeat', observer: 'backgroundRepeatChanged' },
      showMenuByLongpress: { type: Boolean, value: false },
      renderingMode: { type: String, value: 'backgroundImage', observer: 'renderingModeChanged' },
      lazyLoadMargin: { type: Number, value: 2, observer: 'lazyLoadMarginChanged' },
      referrerPolicy: { type: String, value: 'unsafe-url' },
    },
    data: {
      loaded: false,
      width: 0,
      height: 0,
    },
    lifetimes: {
      created() {
        const runtime = this as unknown as ImageRuntime
        runtime._changeId = 0
        runtime._ratio = -1
        runtime._width = -1
        runtime._height = -1
        runtime._hasBeenShown = false
      },
      attached() {
        const runtime = this as unknown as ImageRuntime
        runtime._attached = true
        ;(this as unknown as { setAriaRoleDefault: (role: string) => void }).setAriaRoleDefault('img')
        const host = runtime.getBackendElement?.()
        runtime._originalWidth = host?.style?.width ?? ''
        runtime._originalHeight = host?.style?.height ?? ''
        ;(this as unknown as { bindContextMenu: () => void }).bindContextMenu()
        ;(this as unknown as {
          backgroundSizeChanged: (value: string) => void
        }).backgroundSizeChanged(String(this.data.backgroundSize ?? '100% 100%'))
        ;(this as unknown as {
          backgroundRepeatChanged: (value: string) => void
        }).backgroundRepeatChanged(String(this.data.backgroundRepeat ?? 'no-repeat'))
        ;(this as unknown as { modeChanged: (value: string) => void })
          .modeChanged(String(this.data.mode ?? 'scaleToFill'))
        if (this.data.src) {
          ;(this as unknown as { _initialize: (lazy: boolean) => void })
            ._initialize(Boolean(this.data.lazyLoad))
        }
      },
      detached() {
        const runtime = this as unknown as ImageRuntime
        runtime._attached = false
        runtime._observer?.disconnect?.()
        runtime._observer = undefined
        runtime._resizeObserver?.disconnect?.()
        runtime._resizeObserver = undefined
        runtime._contextMenuCleanup?.()
        runtime._contextMenuCleanup = undefined
        const div = (this as unknown as { divBackend: () => DivBackend | null }).divBackend()
        if (div && runtime._imageElement) {
          div.removeChild?.(runtime._imageElement)
          runtime._imageElement = undefined
        }
      },
    },
    options: ctx.hostOptions('image'),
    methods: {
      divBackend(): DivBackend | null {
        const runtime = this as unknown as ImageRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('div')?.getBackendElement?.() ?? null
      },
      resolveSrc(value: string): string {
        try {
          return ctx.options.resolveAssetUrl?.(value, this) ?? value
        } catch {
          return value
        }
      },
      srcChanged(next: string, previous: string) {
        const runtime = this as unknown as ImageRuntime
        if (!runtime._attached || next === previous) return
        runtime._changeId = (runtime._changeId ?? 0) + 1
        ;(this as unknown as { _initialize: (lazy: boolean) => void })
          ._initialize(Boolean(this.data.lazyLoad))
      },
      renderingModeChanged() {
        const runtime = this as unknown as ImageRuntime
        if (runtime._attached && runtime._hasBeenShown) {
          ;(this as unknown as { _initialize: (lazy: boolean) => void })
            ._initialize(false)
        }
      },
      lazyLoadChanged(next: boolean, previous: boolean) {
        if (next === previous) return
        const runtime = this as unknown as ImageRuntime
        if (next) {
          if (!runtime._hasBeenShown) {
            ;(this as unknown as { _initialize: (lazy: boolean) => void })._initialize(true)
          }
        } else if (runtime._attached) {
          ;(this as unknown as { _initialize: (lazy: boolean) => void })._initialize(false)
        }
      },
      lazyLoadMarginChanged() {
        const runtime = this as unknown as ImageRuntime
        if (this.data.lazyLoad && !runtime._hasBeenShown) {
          ;(this as unknown as { _initialize: (lazy: boolean) => void })._initialize(true)
        }
      },
      backgroundSizeChanged(value: string) {
        const runtime = this as unknown as ImageRuntime
        if (runtime._disableSizePositionRepeat) return
        const div = (this as unknown as { divBackend: () => DivBackend | null }).divBackend()
        if (div?.style) div.style.backgroundSize = value
      },
      backgroundPositionChanged(value: string) {
        const runtime = this as unknown as ImageRuntime
        if (runtime._disableSizePositionRepeat) return
        const div = (this as unknown as { divBackend: () => DivBackend | null }).divBackend()
        if (div?.style) div.style.backgroundPosition = value
      },
      backgroundRepeatChanged(value: string) {
        const runtime = this as unknown as ImageRuntime
        if (runtime._disableSizePositionRepeat) return
        const div = (this as unknown as { divBackend: () => DivBackend | null }).divBackend()
        if (div?.style) div.style.backgroundRepeat = value
      },
      modeChanged(next: string) {
        const runtime = this as unknown as ImageRuntime
        if (!MODE_NAMES.includes(next)) return
        runtime._disableSizePositionRepeat = true
        const div = (this as unknown as { divBackend: () => DivBackend | null }).divBackend()
        const host = runtime.getBackendElement?.()
        if (host?.style) {
          if (next !== 'widthFix' && next !== 'heightFix') {
            host.style.height = runtime._originalHeight ?? ''
            host.style.width = runtime._originalWidth ?? ''
          }
        }
        if (div?.style) {
          div.style.backgroundSize = 'auto auto'
          div.style.backgroundPosition = '0% 0%'
          div.style.backgroundRepeat = 'no-repeat'
        }
        if (next === 'scaleToFill' || next === 'widthFix' || next === 'heightFix') {
          if (div?.style) div.style.backgroundSize = '100% 100%'
        } else if (next === 'aspectFit') {
          if (div?.style) {
            div.style.backgroundSize = 'contain'
            div.style.backgroundPosition = 'center center'
          }
        } else if (next === 'aspectFill') {
          if (div?.style) {
            div.style.backgroundSize = 'cover'
            div.style.backgroundPosition = 'center center'
          }
        } else {
          const position = {
            top: 'top center',
            bottom: 'bottom center',
            center: 'center center',
            left: 'center left',
            right: 'center right',
            'top left': 'left top',
            'top right': 'right top',
            'bottom left': 'left bottom',
            'bottom right': 'right bottom',
          }[next]
          if (div?.style && position) div.style.backgroundPosition = position
        }
        runtime._resizeObserver?.disconnect?.()
        runtime._resizeObserver = undefined
        if ((next === 'widthFix' || next === 'heightFix') && host) {
          const rect = host.getBoundingClientRect?.()
          runtime._width = rect?.width ?? -1
          runtime._height = rect?.height ?? -1
          if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(() => {
              const rect = host.getBoundingClientRect?.()
              runtime._width = rect?.width ?? -1
              runtime._height = rect?.height ?? -1
              ;(this as unknown as { _resizeWidthOrHeight: () => void })._resizeWidthOrHeight()
            })
            observer.observe(host as unknown as Element)
            runtime._resizeObserver = observer
          }
          ;(this as unknown as { _resizeWidthOrHeight: () => void })._resizeWidthOrHeight()
        }
      },
      _resizeWidthOrHeight() {
        const runtime = this as unknown as ImageRuntime
        const ratio = Number(runtime._ratio)
        const host = runtime.getBackendElement?.()
        if (!host?.style || !(ratio > 0)) return
        const mode = String(this.data.mode)
        if (mode === 'widthFix') {
          const width = Number(runtime._width)
          if (width > 0) host.style.height = `${width / ratio}px`
        } else if (mode === 'heightFix') {
          const height = Number(runtime._height)
          if (height > 0) host.style.width = `${height * ratio}px`
        }
      },
      _initialize(lazy: boolean) {
        const runtime = this as unknown as ImageRuntime
        runtime._observer?.disconnect?.()
        runtime._observer = undefined
        if (lazy && !runtime._hasBeenShown) {
          ;(this as unknown as { bindLazyObserver: () => void }).bindLazyObserver()
          return
        }
        ;(this as unknown as { _showImage: () => void })._showImage()
      },
      bindLazyObserver() {
        const runtime = this as unknown as ImageRuntime
        const host = runtime.getBackendElement?.()
        if (!host || typeof IntersectionObserver === 'undefined') {
          ;(this as unknown as { _showImage: () => void })._showImage()
          return
        }
        const margin = Math.max(0, Number(this.data.lazyLoadMargin) || 0) * 50
        const observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect()
            runtime._observer = undefined
            ;(this as unknown as { _showImage: () => void })._showImage()
          }
        }, { rootMargin: `${margin}px` })
        observer.observe(host as unknown as Element)
        runtime._observer = observer
      },
      _showImage() {
        const runtime = this as unknown as ImageRuntime
        const src = (this as unknown as { resolveSrc: (value: string) => string })
          .resolveSrc(String(this.data.src ?? ''))
        if (src === '') return
        const div = (this as unknown as { divBackend: () => DivBackend | null }).divBackend()
        const doc = div?.ownerDocument ?? runtime.getBackendElement?.()?.ownerDocument
        const ImageCtor = doc?.defaultView?.Image ?? (typeof Image !== 'undefined' ? Image : undefined)
        if (!ImageCtor) return
        const changeId = runtime._changeId ?? 0
        const image = new ImageCtor()
        image.referrerPolicy = String(this.data.referrerPolicy ?? 'unsafe-url')
        image.onload = () => {
          if (changeId !== (runtime._changeId ?? 0)) return
          const width = Number(image.naturalWidth || image.width || 0)
          const height = Number(image.naturalHeight || image.height || 0)
          runtime._ratio = height > 0 ? width / height : -1
          const rect = runtime.getBackendElement?.()?.getBoundingClientRect?.()
          runtime._width = rect?.width ?? -1
          runtime._height = rect?.height ?? -1
          runtime._hasBeenShown = true
          this.setData({ loaded: true, width, height })
          this.triggerEvent('load', { width, height })
          ;(this as unknown as { _resizeWidthOrHeight: () => void })._resizeWidthOrHeight()
          if (String(this.data.renderingMode) === 'img') {
            if (div?.appendChild) {
              while (div.childNodes && div.childNodes.length > 0) {
                div.removeChild?.(div.childNodes[0])
              }
              const element = doc!.createElement('img')
              element.style.width = '100%'
              element.style.display = 'block'
              element.src = src
              runtime._imageElement = element
              div.appendChild(element)
            }
          } else if (div?.style) {
            if (runtime._imageElement) {
              div.removeChild?.(runtime._imageElement)
              runtime._imageElement = undefined
            }
            div.style.backgroundImage = cssUrl(src)
          }
        }
        image.onerror = () => {
          if (changeId !== (runtime._changeId ?? 0)) return
          this.setData({ loaded: false })
          this.triggerEvent('error', { errMsg: `GET ${src} 404 (Not Found)` })
        }
        image.src = src
      },
      bindContextMenu() {
        const div = (this as unknown as { divBackend: () => DivBackend | null }).divBackend()
        if (!div?.addEventListener) return
        const runtime = this as unknown as ImageRuntime
        runtime._contextMenuCleanup?.()
        const onContextMenu = (event: Event) => {
          if (!this.data.showMenuByLongpress) event.preventDefault()
        }
        div.addEventListener('contextmenu', onContextMenu)
        runtime._contextMenuCleanup = () => {
          div.removeEventListener?.('contextmenu', onContextMenu)
        }
      },
      saved(state: Record<string, unknown>) {
        const fields: Record<string, unknown> = {}
        ;(this as unknown as {
          saveCompVar: (state: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(fields, ['_hasBeenShown'])
        ;(this as unknown as {
          saveState: (target: Record<string, unknown>, state: Record<string, unknown>) => void
        }).saveState(state, fields)
      },
      restored(state: Record<string, unknown>) {
        const restored = (this as unknown as {
          restoreState: (target: Record<string, unknown>) => Record<string, unknown> | undefined
        }).restoreState(state)
        if (!restored) return
        ;(this as unknown as {
          restoreCompVar: (state: Record<string, unknown>) => void
        }).restoreCompVar(restored)
      },
    },
  }).general()
}

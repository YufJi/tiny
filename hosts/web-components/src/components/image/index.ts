import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type ImageBackendElement = {
  naturalWidth?: number
  naturalHeight?: number
  style?: { width?: string; height?: string }
  getBoundingClientRect?: () => { width: number; height: number }
}

type ImageHost = {
  getBackendElement?: () => ImageBackendElement | null
}

function cssUrl(src: string): string {
  return `url("${src.replace(/["\\]/g, (char) => `\\${char}`)}")`
}

/** Map WeChat's camelCase mode names to CSS background positions. */
const POSITION_MODES: Record<string, string> = {
  top: 'top center',
  bottom: 'bottom center',
  center: 'center center',
  left: 'center left',
  right: 'center right',
  topLeft: 'left top',
  topRight: 'right top',
  bottomLeft: 'left bottom',
  bottomRight: 'right bottom',
  'top left': 'left top',
  'top right': 'right top',
  'bottom left': 'left bottom',
  'bottom right': 'right bottom',
}

export function defineImage(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('image'),
    template: ctx.template('image'),
    behaviors: [ctx.behaviors.base],
    properties: {
      ariaLabel: { type: String, value: '' },
      src: { type: String, value: '' },
      mode: { type: String, value: 'scaleToFill' },
      lazyLoad: { type: Boolean, value: false },
      webp: { type: Boolean, value: false },
      showMenuByLongpress: { type: Boolean, value: false },
      renderingMode: { type: String, value: 'backgroundImage' },
      backgroundSize: { type: String, value: '100% 100%' },
      backgroundPosition: { type: String, value: '' },
      backgroundRepeat: { type: String, value: 'no-repeat' },
    },
    data: {
      resolvedSrc: '',
      imageStyle: '',
      useImg: false,
      loaded: false,
      inViewport: true,
      naturalWidth: 0,
      naturalHeight: 0,
    },
    observers: {
      src() {
        this.updateResolvedSrc()
      },
      mode() {
        this.resetHostSize()
        this.syncPresentation()
        this.applyIntrinsicSize(this.data.naturalWidth, this.data.naturalHeight)
      },
      renderingMode() {
        this.syncPresentation()
      },
      lazyLoad(value: boolean) {
        if (!value) {
          ;(this as unknown as { _lazyObserver?: { disconnect?: () => void } })._lazyObserver?.disconnect?.()
          ;(this as unknown as { _lazyObserver?: unknown })._lazyObserver = undefined
          this.setData({ inViewport: true })
          this.syncPresentation()
        } else {
          this.setData({ inViewport: false })
          this.bindLazyObserver()
        }
      },
      'backgroundSize, backgroundPosition, backgroundRepeat'() {
        if (!(this as unknown as { _imageReady?: boolean })._imageReady) return
        ;(this as unknown as { _backgroundCustomized?: boolean })._backgroundCustomized = true
        this.syncPresentation()
      },
    },
    lifetimes: {
      attached() {
        ;(this as unknown as { _imageReady?: boolean })._imageReady = true
        const instance = this as unknown as { _backgroundCustomized?: boolean }
        instance._backgroundCustomized =
          String(this.data.backgroundSize ?? '100% 100%') !== '100% 100%' ||
          String(this.data.backgroundPosition ?? '') !== '' ||
          String(this.data.backgroundRepeat ?? 'no-repeat') !== 'no-repeat'
        this.bindContextMenu()
        this.bindLazyObserver()
        this.updateResolvedSrc()
      },
      ready() {
        this.bindContextMenu()
        this.bindLazyObserver()
        this.updateResolvedSrc()
      },
      detached() {
        ;(this as unknown as { _contextMenuCleanup?: () => void })._contextMenuCleanup?.()
      },
    },
    options: ctx.hostOptions('image'),
    methods: {
      bindLazyObserver() {
        const instance = this as unknown as {
          _lazyObserver?: { disconnect?: () => void }
        }
        instance._lazyObserver?.disconnect?.()
        instance._lazyObserver = undefined
        if (!this.data.lazyLoad) {
          if (!this.data.inViewport) this.setData({ inViewport: true })
          return
        }
        const host = (this as unknown as { getBackendElement?: () => ImageBackendElement | null }).getBackendElement?.()
        if (!host || typeof IntersectionObserver === 'undefined') {
          this.setData({ inViewport: true })
          return
        }
        const observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.setData({ inViewport: true })
            observer.disconnect()
            instance._lazyObserver = undefined
          }
        }, { rootMargin: '50px' })
        observer.observe(host as unknown as Element)
        instance._lazyObserver = observer
      },
      bindContextMenu() {
        const element = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => {
            getBackendElement?: () => {
              addEventListener?: (type: string, listener: (event: Event) => void) => void
              removeEventListener?: (type: string, listener: (event: Event) => void) => void
            } | null
          } | null
        } | null)?.getElementById?.('native-image')?.getBackendElement?.()
        if (!element?.addEventListener) return
        const instance = this as unknown as { _contextMenuCleanup?: () => void }
        instance._contextMenuCleanup?.()
        const onContextMenu = (event: Event) => {
          if (!this.data.showMenuByLongpress) event.preventDefault()
        }
        element.addEventListener('contextmenu', onContextMenu)
        instance._contextMenuCleanup = () => {
          element.removeEventListener?.('contextmenu', onContextMenu)
        }
      },
      updateResolvedSrc() {
        const src = typeof this.data.src === 'string' ? this.data.src : ''
        let resolved = src
        try {
          resolved = ctx.options.resolveAssetUrl?.(src, this) ?? src
        } catch {
          resolved = src
        }
        if (resolved !== this.data.resolvedSrc) {
          this.resetHostSize()
          this.setData({ resolvedSrc: resolved, loaded: false, naturalWidth: 0, naturalHeight: 0 })
        }
        this.syncPresentation()
      },
      resetHostSize() {
        const host = (this as unknown as ImageHost).getBackendElement?.()
        if (!host?.style) return
        // Only undo the dimension this component changed. Clearing both would
        // drop author `style="width: ...; height: ..."` on the host element.
        const instance = this as unknown as {
          _managedSize?: { dimension: 'width' | 'height'; original: string }
        }
        const managed = instance._managedSize
        if (!managed) return
        if (managed.dimension === 'height') host.style.height = managed.original
        else host.style.width = managed.original
        instance._managedSize = undefined
      },
      manageHostDimension(dimension: 'width' | 'height'): void {
        const host = (this as unknown as ImageHost).getBackendElement?.()
        if (!host?.style) return
        const instance = this as unknown as {
          _managedSize?: { dimension: 'width' | 'height'; original: string }
        }
        if (instance._managedSize?.dimension === dimension) return
        if (instance._managedSize) this.resetHostSize()
        instance._managedSize = {
          dimension,
          original: (dimension === 'width' ? host.style.width : host.style.height) ?? '',
        }
      },
      syncPresentation() {
        const mode = String(this.data.mode || 'scaleToFill')
        const customFlag = (this as unknown as { _backgroundCustomized?: boolean })._backgroundCustomized
        const customized = customFlag === undefined
          ? String(this.data.backgroundSize ?? '100% 100%') !== '100% 100%' ||
            String(this.data.backgroundPosition ?? '') !== '' ||
            String(this.data.backgroundRepeat ?? 'no-repeat') !== 'no-repeat'
          : customFlag
        let size = '100% 100%'
        let position = '0% 0%'
        if (mode === 'aspectFit') {
          size = 'contain'
          position = 'center center'
        } else if (mode === 'aspectFill') {
          size = 'cover'
          position = 'center center'
        } else if (POSITION_MODES[mode]) {
          size = 'auto auto'
          position = POSITION_MODES[mode]!
        }
        if (customized) {
          size = String(this.data.backgroundSize || size)
          position = String(this.data.backgroundPosition || position)
        }
        const useImg = String(this.data.renderingMode) === 'img'
        const src = String(this.data.resolvedSrc || '')
        const showBackground = !useImg &&
          src !== '' &&
          (!this.data.lazyLoad || (this.data.inViewport && this.data.loaded))
        const repeat = String(this.data.backgroundRepeat || 'no-repeat')
        const imageStyle = showBackground
          ? `background-image: ${cssUrl(src)}; background-size: ${size}; background-position: ${position}; background-repeat: ${repeat};`
          : ''
        this.setData({ imageStyle, useImg })
      },
      applyIntrinsicSize(width: number, height: number): void {
        const host = (this as unknown as ImageHost).getBackendElement?.()
        if (!host?.style || !width || !height) return
        const rect = host.getBoundingClientRect?.()
        if (!rect) return
        const mode = String(this.data.mode)
        if (mode === 'widthFix') {
          this.manageHostDimension('height')
          host.style.height = `${(rect.width || 320) * height / width}px`
        } else if (mode === 'heightFix') {
          this.manageHostDimension('width')
          host.style.width = `${(rect.height || 240) * width / height}px`
        }
      },
      handleLoad(event: glassEasel.ShadowedEvent<unknown>) {
        const target = event.target as unknown as ImageHost
        const element = target.getBackendElement?.()
        const width = Number(element?.naturalWidth ?? 0)
        const height = Number(element?.naturalHeight ?? 0)
        this.setData({ loaded: true, naturalWidth: width, naturalHeight: height })
        this.applyIntrinsicSize(width, height)
        this.syncPresentation()
        this.triggerEvent('load', { width, height }, { bubbles: true, composed: true })
      },
      handleError(event: glassEasel.ShadowedEvent<unknown>) {
        this.setData({ loaded: false })
        this.resetHostSize()
        this.triggerEvent('error', event.detail ?? {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}

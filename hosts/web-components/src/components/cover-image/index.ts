import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type CoverImageRuntime = {
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLImageElement | null
    } | null
  } | null
}

type CoverImageSource = {
  src?: unknown
  referrerPolicy?: unknown
}

/**
 * Mirrors `wx-cover-image`. WeChat paints it in the native cover layer; the
 * browser host uses a real `<img>` stretched to the host box.
 */
export function defineCoverImage(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('cover-image'),
    template: ctx.template('cover-image'),
    behaviors: [ctx.behaviors.base],
    properties: {
      src: { type: String, value: '', observer: 'srcChanged' },
      referrerPolicy: { type: String, value: 'no-referrer', observer: 'referrerPolicyChanged' },
    },
    options: ctx.hostOptions('cover-image'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as CoverImageRuntime & CoverImageSource
        const image = runtime.getShadowRoot?.()?.getElementById?.('image')?.getBackendElement?.()
        if (!image) return
        ;(this as unknown as { srcChanged: (value: string) => void })
          .srcChanged(String(this.data.src ?? ''))
        ;(this as unknown as { referrerPolicyChanged: (value: string) => void })
          .referrerPolicyChanged(String(this.data.referrerPolicy ?? 'no-referrer'))
      },
    },
    methods: {
      resolveSrc(value: string): string {
        try {
          return ctx.options.resolveAssetUrl?.(value, this) ?? value
        } catch {
          return value
        }
      },
      imageElement(): HTMLImageElement | null {
        const runtime = this as unknown as CoverImageRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('image')?.getBackendElement?.() ?? null
      },
      srcChanged(value: string) {
        const image = (this as unknown as { imageElement: () => HTMLImageElement | null }).imageElement()
        if (!image) return
        const src = (this as unknown as { resolveSrc: (value: string) => string }).resolveSrc(value)
        if (src) image.src = src
        else image.removeAttribute('src')
      },
      referrerPolicyChanged(value: string) {
        const image = (this as unknown as { imageElement: () => HTMLImageElement | null }).imageElement()
        if (!image) return
        image.referrerPolicy = value || 'no-referrer'
      },
    },
  }).general()
}

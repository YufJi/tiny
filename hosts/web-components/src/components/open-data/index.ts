import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type OpenDataRuntime = {
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

/**
 * Mirrors `wx-open-data`: WeChat fills it with user/group/game data. The
 * browser host first asks `hostRequest('openData.get', …)`; a host can return
 * a string/object, otherwise `default-text` (or a neutral placeholder) is shown.
 */
export function defineOpenData(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('open-data'),
    template: ctx.template('open-data'),
    behaviors: [ctx.behaviors.base],
    properties: {
      type: { type: String, value: '' },
      openGid: { type: String, value: '' },
      lang: { type: String, value: 'en' },
      defaultText: { type: String, value: '' },
      defaultAvatar: { type: String, value: '' },
    },
    options: ctx.hostOptions('open-data'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as OpenDataRuntime
        const content = runtime.getShadowRoot?.()?.getElementById?.('content')
          ?.getBackendElement?.()
        if (!content) return
        const fallback = String(this.data.defaultText ?? '') || '开放数据'
        content.textContent = fallback
        const request = ctx.options.hostRequest
        if (!request) return
        void request('openData.get', {
          type: this.data.type,
          openGid: this.data.openGid,
          lang: this.data.lang,
        }).then((value) => {
          if (typeof value === 'string') {
            content.textContent = value
            return
          }
          if (value && typeof value === 'object') {
            const data = value as { text?: unknown; avatar?: unknown }
            if (data.text !== undefined) content.textContent = String(data.text)
            if (data.avatar) {
              const image = document.createElement('img')
              image.src = String(data.avatar)
              image.alt = ''
              content.replaceChildren(image)
            }
          }
        }).catch(() => undefined)
      },
    },
  }).general()
}

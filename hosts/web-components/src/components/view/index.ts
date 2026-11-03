import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type ViewRuntime = {
  _scrollTop?: number | null
  _scrollLeft?: number | null
}

type ViewBackendElement = {
  scrollTop: number
  scrollLeft: number
}

/** `<view>` mirrors `wx-view`: slot-only host, hover on the host, reload state. */
export function defineView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('view'),
    template: ctx.template('view'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.hover, ctx.behaviors.reload],
    properties: {
      inline: { type: Boolean, value: false },
      hoverClass: { type: String, value: 'none' },
      hover: { type: Boolean, value: false },
      sessionFrom: { type: String, value: 'wxapp' },
    },
    options: ctx.hostOptions('view'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as ViewRuntime
        const element = (this as unknown as {
          getBackendElement?: () => ViewBackendElement | null
        }).getBackendElement?.()
        if (!element) return
        if (runtime._scrollTop != null) {
          element.scrollTop = runtime._scrollTop
          runtime._scrollTop = null
        }
        if (runtime._scrollLeft != null) {
          element.scrollLeft = runtime._scrollLeft
          runtime._scrollLeft = null
        }
      },
    },
    methods: {
      saved(state: Record<string, unknown>) {
        const runtime = this as unknown as ViewRuntime
        const element = (this as unknown as {
          getBackendElement?: () => ViewBackendElement | null
        }).getBackendElement?.()
        runtime._scrollTop = element?.scrollTop ?? null
        runtime._scrollLeft = element?.scrollLeft ?? null
        const fields: Record<string, unknown> = {}
        ;(this as unknown as {
          saveCompVar: (state: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(fields, ['_scrollTop', '_scrollLeft'])
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
      _pageReRender() {},
    },
  }).general()
}

import type * as glassEasel from 'glass-easel'
import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

type LabelTarget = {
  hasBehavior?: (behavior: string) => boolean
  handleLabelTap?: (event: unknown) => void
  childNodes?: unknown[]
}

export function defineLabel(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:label',
    template: ctx.template('label'),
    behaviors: [ctx.behaviors.base],
    properties: {
      for: { type: String, value: '' },
    },
    options: ctx.hostOptions('label', { multipleSlots: true }),
    lifetimes: {
      created() {
        bindHostListeners(this, {
          tap: (event) => this.handleTap(event),
        })
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    methods: {
      handleLabelTarget(node: unknown, event: unknown): boolean {
        const component = (node as { asGeneralComponent?: () => LabelTarget | null })
          ?.asGeneralComponent?.()
        if (component?.hasBehavior?.('wx-label-target')) {
          component.handleLabelTap?.(event)
          return true
        }
        return false
      },
      handleTap(event: glassEasel.ShadowedEvent<unknown>) {
        const target = event.target as {
          parentNode?: unknown
        } | null
        for (let node = target; node; node = node.parentNode as typeof node) {
          const component = (node as { asGeneralComponent?: () => LabelTarget | null })
            ?.asGeneralComponent?.()
          if (component?.hasBehavior?.('wx-label-target')) return
        }
        const forId = String(this.data.for ?? '')
        if (forId) {
          const owner = (this as unknown as {
            ownerShadowRoot?: { getElementById?: (id: string) => unknown } | null
          }).ownerShadowRoot
          const element = owner?.getElementById?.(forId)
          if (element) this.handleLabelTarget(element, event)
          return
        }
        this.dispatchLabelTarget(this as unknown, event)
      },
      dispatchLabelTarget(node: unknown, event: unknown): boolean {
        const children = (node as { childNodes?: unknown[] }).childNodes ?? []
        const slotChildren = (node as { slotNodes?: unknown[] }).slotNodes ?? []
        for (const child of [...children, ...slotChildren]) {
          if (this.handleLabelTarget(child, event)) return true
          if (this.dispatchLabelTarget(child, event)) return true
        }
        return false
      },
    },
  }).general()
}

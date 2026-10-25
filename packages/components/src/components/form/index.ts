import type * as glassEasel from 'glass-easel'
import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

type FormControl = {
  hasBehavior?: (behavior: string) => boolean
  getFormData?: () => unknown
  resetFormData?: () => void
  data?: Record<string, unknown>
  childNodes?: unknown[]
}

export function defineForm(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:form',
    template: ctx.template('form'),
    behaviors: [ctx.behaviors.base],
    properties: {
      reportSubmit: { type: Boolean, value: false },
      reportSubmitTimeout: { type: Number, value: 0 },
    },
    options: ctx.hostOptions({ multipleSlots: true }),
    lifetimes: {
      created() {
        bindHostListeners(this, {
          formSubmit: (event) => this.handleSubmit(event),
          formReset: (event) => this.handleReset(event),
        })
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    methods: {
      collectControls(nodes: unknown[] | undefined, value: Record<string, unknown>): void {
        for (const node of nodes ?? []) {
          const control = node as FormControl
          if (control.hasBehavior?.('wx-data-component')) {
            const name = String(control.data?.name ?? '')
            if (name) value[name] = control.getFormData?.()
          }
          this.collectControls(control.childNodes, value)
        }
      },
      resetControls(nodes: unknown[] | undefined): void {
        for (const node of nodes ?? []) {
          const control = node as FormControl
          if (control.hasBehavior?.('wx-data-component')) control.resetFormData?.()
          this.resetControls(control.childNodes)
        }
      },
      handleSubmit(event: glassEasel.ShadowedEvent<unknown>) {
        event.stopPropagation()
        const value: Record<string, unknown> = {}
        this.collectControls((this as unknown as { childNodes?: unknown[] }).childNodes, value)
        const detail = event.detail as { formId?: string } | undefined
        this.triggerEvent('submit', { value, formId: detail?.formId ?? '' }, { bubbles: true, composed: true })
      },
      handleReset(event: glassEasel.ShadowedEvent<unknown>) {
        event.stopPropagation()
        this.resetControls((this as unknown as { childNodes?: unknown[] }).childNodes)
        this.triggerEvent('reset', {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}

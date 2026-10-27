import type * as glassEasel from 'glass-easel'
import { bindHostListeners, unbindHostListeners, BUILTIN_BEHAVIOR_IDS } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'

type FormControl = {
  hasBehavior?: (behavior: string) => boolean
  getFormData?: () => unknown
  resetFormData?: () => void
  data?: Record<string, unknown>
  childNodes?: unknown[]
}

export function defineForm(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('form'),
    template: ctx.template('form'),
    behaviors: [ctx.behaviors.base],
    properties: {
      reportSubmit: { type: Boolean, value: false },
      reportSubmitTimeout: { type: Number, value: 0 },
    },
    options: ctx.hostOptions('form', { multipleSlots: true }),
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
          if (control.hasBehavior?.(BUILTIN_BEHAVIOR_IDS.dataComponent)) {
            const name = String(control.data?.name ?? '')
            if (name) value[name] = control.getFormData?.()
          } else if (control.hasBehavior?.(TINY_ENGINE_NAMING.formFieldBehaviorId)) {
            const name = String(control.data?.name ?? '')
            if (name) value[name] = control.data?.value
          }
          this.collectControls(control.childNodes, value)
        }
      },
      resetControls(nodes: unknown[] | undefined): void {
        for (const node of nodes ?? []) {
          const control = node as FormControl
          if (control.hasBehavior?.(BUILTIN_BEHAVIOR_IDS.dataComponent)) control.resetFormData?.()
          this.resetControls(control.childNodes)
        }
      },
      handleSubmit(event: glassEasel.ShadowedEvent<unknown>) {
        event.stopPropagation()
        const value: Record<string, unknown> = {}
        this.collectControls((this as unknown as { childNodes?: unknown[] }).childNodes, value)
        const detail = event.detail as { formId?: string } | undefined
        if (this.data.reportSubmit) {
          this.triggerEvent('beforereportsubmit', { value }, { bubbles: true, composed: true })
        }
        const formId = this.data.reportSubmit
          ? 'the formId is a mock one'
          : detail?.formId ?? ''
        this.triggerEvent('submit', { value, formId }, { bubbles: true, composed: true })
      },
      handleReset(event: glassEasel.ShadowedEvent<unknown>) {
        event.stopPropagation()
        this.resetControls((this as unknown as { childNodes?: unknown[] }).childNodes)
        this.triggerEvent('reset', {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}

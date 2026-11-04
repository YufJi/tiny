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
      controlName(control: FormControl): string {
        const direct = (control as unknown as { name?: unknown }).name
        return String(direct ?? control.data?.name ?? '')
      },
      collectControls(nodes: unknown[] | undefined, value: Record<string, unknown>): void {
        for (const node of nodes ?? []) {
          const control = node as FormControl
          if (control.hasBehavior?.(BUILTIN_BEHAVIOR_IDS.dataComponent)) {
            const name = this.controlName(control)
            if (name) value[name] = control.getFormData?.()
          } else if (control.hasBehavior?.(TINY_ENGINE_NAMING.formFieldBehaviorId)) {
            const name = this.controlName(control)
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
      formTarget(event: glassEasel.ShadowedEvent<unknown>): {
        id: string
        dataset: Record<string, unknown>
        offsetTop: number
        offsetLeft: number
      } {
        const target = event.target as unknown as {
          id?: string
          dataset?: Record<string, unknown>
          getBackendElement?: () => { offsetTop?: number; offsetLeft?: number } | null
        } | null
        const backend = target?.getBackendElement?.()
        return {
          id: String(target?.id ?? ''),
          dataset: target?.dataset ?? {},
          offsetTop: Number(backend?.offsetTop ?? 0),
          offsetLeft: Number(backend?.offsetLeft ?? 0),
        }
      },
      handleSubmit(event: glassEasel.ShadowedEvent<unknown>) {
        event.stopPropagation()
        const value: Record<string, unknown> = {}
        this.collectControls((this as unknown as { childNodes?: unknown[] }).childNodes, value)
        const target = this.formTarget(event)
        const detail = event.detail as { formId?: string } | undefined
        const report = Boolean(this.data.reportSubmit) || Number(this.data.reportSubmitTimeout) > 0
        if (report) {
          this.triggerEvent('beforereportsubmit', { value }, { bubbles: true, composed: true })
        }
        const payload: Record<string, unknown> = { value, target }
        if (this.data.reportSubmit) {
          payload.formId = detail?.formId || 'the formId is a mock one'
        }
        this.triggerEvent('submit', payload, { bubbles: true, composed: true })
      },
      handleReset(event: glassEasel.ShadowedEvent<unknown>) {
        event.stopPropagation()
        const target = this.formTarget(event)
        this.resetControls((this as unknown as { childNodes?: unknown[] }).childNodes)
        this.triggerEvent('reset', { target }, { bubbles: true, composed: true })
      },
    },
  }).general()
}

import type * as glassEasel from 'glass-easel'
import { bindHostListeners, unbindHostListeners, BUILTIN_BEHAVIOR_IDS } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

import { builtinDefinitionName } from '../../tags'

type FormControl = {
  /**
   * glass-easel resolves behavior strings by URL, so a custom component (whose
   * `is` is an artifact path) can only be matched by behavior object identity.
   */
  hasBehavior?: (behavior: unknown) => boolean
  getFormData?: (callback?: (value: unknown) => void) => unknown
  resetFormData?: () => void
  data?: Record<string, unknown>
  childNodes?: unknown[]
  shadowRoot?: { childNodes?: unknown[] }
}

export function defineForm(ctx: BuiltinContext): BuiltinDefinition {
  const nodeProps = (control: FormControl): Record<string, unknown> | undefined => (
    ctx.options.lookupNodeProps?.(control)
  )

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
        // WeChat's form reads node props. Tiny keeps them for both creation
        // paths (snapshot props for page-level nodes, captured template props
        // for render-created components) and falls back to declared data.
        const candidates = [direct, nodeProps(control)?.name, control.data?.name]
        for (const candidate of candidates) {
          if (candidate !== undefined && candidate !== null && String(candidate) !== '') {
            return String(candidate)
          }
        }
        return ''
      },
      controlValue(control: FormControl): unknown {
        // A component-updated value wins; otherwise fall back to the node prop.
        if (control.data && control.data.value !== '' && control.data.value !== undefined) {
          return control.data.value
        }
        const props = nodeProps(control)
        if (props && Object.hasOwn(props, 'value')) return props.value
        return control.data?.value
      },
      collectControls(
        nodes: unknown[] | undefined,
        value: Record<string, unknown>,
        done: () => void,
      ): void {
        const list = nodes ?? []
        let index = 0
        const next = () => {
          if (index >= list.length) {
            done()
            return
          }
          const control = list[index] as FormControl
          index += 1
          // A `wx://form-field-group` wrapper is traversed through its shadow
          // tree, exactly like WeChat's form walks into the group component.
          const descend = () => {
            const shadow = control.hasBehavior?.(ctx.behaviors.formFieldGroup)
              ? control.shadowRoot?.childNodes ?? []
              : []
            this.collectControls(
              [...(control.childNodes ?? []), ...shadow],
              value,
              next,
            )
          }
          if (control.hasBehavior?.(ctx.behaviors.formField)) {
            const name = this.controlName(control)
            if (name) value[name] = this.controlValue(control)
            descend()
            return
          }
          if (!control.hasBehavior?.(BUILTIN_BEHAVIOR_IDS.dataComponent) || !control.getFormData) {
            descend()
            return
          }
          const name = this.controlName(control)
          let settled = false
          const finish = (data: unknown) => {
            if (settled) return
            settled = true
            if (name) value[name] = data
            descend()
          }
          let returned: unknown
          try {
            returned = control.getFormData(finish)
          } catch {
            finish(undefined)
            return
          }
          if (returned !== undefined) finish(returned)
        }
        next()
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
        const target = this.formTarget(event)
        const detail = event.detail as { formId?: string } | undefined
        this.collectControls(
          (this as unknown as { childNodes?: unknown[] }).childNodes,
          value,
          () => {
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
        )
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

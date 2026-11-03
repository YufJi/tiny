import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

/**
 * Mirrors `wx-switch`: both the switch track and the checkbox-type box live in
 * the template, toggled by `type`; tap/labelTap flips `checked` and emits
 * `change` with the new value.
 */
export function defineSwitch(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('switch'),
    template: ctx.template('switch'),
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.disabled,
      ctx.behaviors.dataComponent,
      ctx.behaviors.labelAria,
      ctx.behaviors.labelTarget,
      ctx.behaviors.reload,
    ],
    properties: {
      checked: { type: Boolean, value: false, observer: 'checkedChanged' },
      type: { type: String, value: 'switch' },
      color: { type: String, value: '', observer: 'colorChanged' },
    },
    data: {
      switchColor: '',
    },
    lifetimes: {
      created() {
        bindHostListeners(this, {
          tap: () => this.onInputChange(),
        })
        ;(this as unknown as { syncColor: () => void }).syncColor()
      },
      attached() {
        ;(this as unknown as { _setAria: (role: string) => void })._setAria('checkbox')
        ;(this as unknown as { syncColor: () => void }).syncColor()
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    options: ctx.hostOptions('switch'),
    methods: {
      _getSwitchBorderColor(checked: boolean, color: string): string {
        return checked ? color : ''
      },
      syncColor() {
        this.setData({
          switchColor: (this as unknown as {
            _getSwitchBorderColor: (checked: boolean, color: string) => string
          })._getSwitchBorderColor(Boolean(this.data.checked), String(this.data.color ?? '')),
        })
      },
      colorChanged() {
        ;(this as unknown as { syncColor: () => void }).syncColor()
      },
      checkedChanged(next: boolean) {
        const element = (this as unknown as {
          getBackendElement?: () => {
            setAttribute?: (name: string, value: string) => void
          } | null
        }).getBackendElement?.()
        element?.setAttribute?.('aria-checked', String(Boolean(next)))
        ;(this as unknown as { _setRelatedLabelAria?: (role?: string) => void })
          ._setRelatedLabelAria?.('checkbox')
        ;(this as unknown as { syncColor: () => void }).syncColor()
      },
      isSwitch(type: string): boolean {
        return type !== 'checkbox'
      },
      isCheckbox(type: string): boolean {
        return type === 'checkbox'
      },
      onInputChange() {
        if ((this.data as Record<string, unknown>).disabled) return
        const checked = !this.data.checked
        this.setData({ checked })
        this.triggerEvent('change', { value: checked })
      },
      handleLabelTap() {
        ;(this as unknown as { onInputChange: () => void }).onInputChange()
      },
      getFormData(): boolean {
        return Boolean(this.data.checked)
      },
      resetFormData() {
        this.setData({ checked: false })
      },
      saved(state: Record<string, unknown>) {
        const fields: Record<string, unknown> = {}
        ;(this as unknown as {
          saveCompVar: (state: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(fields, ['checked'])
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

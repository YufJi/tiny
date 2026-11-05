import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

/**
 * Mirrors `wx-radio`: a div-based radio with checked/disabled marker classes,
 * tap/labelTap selecting an unchecked item, and the checked color applied
 * inline only when the item is checked and enabled.
 */
export function defineRadio(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('radio'),
    template: ctx.template('radio'),
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.disabled,
      ctx.behaviors.item,
      ctx.behaviors.labelAria,
      ctx.behaviors.labelTarget,
      ctx.behaviors.reload,
    ],
    properties: {
      color: { type: String, value: '' },
    },
    data: {
      activeColor: '',
    },
    observers: {
      checked() {
        ;(this as unknown as { syncActiveColor: () => void }).syncActiveColor()
      },
      disabled() {
        ;(this as unknown as { syncActiveColor: () => void }).syncActiveColor()
      },
      color() {
        ;(this as unknown as { syncActiveColor: () => void }).syncActiveColor()
      },
    },
    lifetimes: {
      created() {
        bindHostListeners(this, {
          tap: () => this._inputTap(),
        })
        ;(this as unknown as { syncActiveColor: () => void }).syncActiveColor()
      },
      attached() {
        ;(this as unknown as { _setAria: (role: string) => void })._setAria('radio')
        ;(this as unknown as { syncActiveColor: () => void }).syncActiveColor()
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    options: ctx.hostOptions('radio'),
    methods: {
      _getColor(checked: boolean, disabled: boolean, color: string): string {
        return disabled ? '' : checked ? color : ''
      },
      syncActiveColor() {
        const data = this.data as Record<string, unknown>
        this.setData({
          activeColor: (this as unknown as {
            _getColor: (checked: boolean, disabled: boolean, color: string) => string
          })._getColor(Boolean(data.checked), Boolean(data.disabled), String(data.color ?? '')),
        })
      },
      _inputTap() {
        const data = this.data as Record<string, unknown>
        if (data.disabled || data.checked) return false
        this.setData({ checked: true } as never)
        ;(this as unknown as { changedByTap: () => void }).changedByTap()
        return true
      },
      handleLabelTap() {
        ;(this as unknown as { _inputTap: () => boolean })._inputTap()
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

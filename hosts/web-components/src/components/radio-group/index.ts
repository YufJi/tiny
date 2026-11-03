import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type GroupItem = {
  data?: { value?: unknown; checked?: unknown }
  setData?: (data: Record<string, unknown>) => void
}

type RadioGroupRuntime = {
  _value: string
  _selectedItem: GroupItem | null
  setData: (data: Record<string, unknown>) => void
}

const itemValue = (item: unknown): string => String((item as GroupItem).data?.value ?? '')

/**
 * `radio-group` mirrors WeChat: the newest checked item wins, the group
 * unchecks the previously selected item, and `value` is only derived state
 * (never an input that is written back to the items).
 */
export function defineRadioGroup(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('radio-group'),
    template: ctx.template('radio-group'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.group],
    data: {
      value: '',
    },
    lifetimes: {
      created() {
        const runtime = this as unknown as RadioGroupRuntime
        runtime._value = ''
        runtime._selectedItem = null
      },
      attached() {
        const element = (this as unknown as {
          getBackendElement?: () => { setAttribute?: (name: string, value: string) => void } | null
        }).getBackendElement?.()
        element?.setAttribute?.('role', 'radiogroup')
        element?.setAttribute?.('aria-label', '单选区')
        ;(this as unknown as RadioGroupRuntime & { publish: () => void }).publish()
      },
    },
    options: ctx.hostOptions('radio-group', { multipleSlots: true }),
    methods: {
      publish() {
        const runtime = this as unknown as RadioGroupRuntime
        runtime.setData({ value: runtime._value })
      },
      addItem(item: unknown) {
        const runtime = this as unknown as RadioGroupRuntime
        if (!(item as GroupItem).data?.checked) return
        const previous = runtime._selectedItem
        if (previous && previous !== item) previous.setData?.({ checked: false })
        runtime._value = itemValue(item)
        runtime._selectedItem = item as GroupItem
        ;(this as unknown as { publish: () => void }).publish()
      },
      removeItem(item: unknown) {
        const runtime = this as unknown as RadioGroupRuntime
        if (runtime._selectedItem !== item) return
        runtime._value = ''
        runtime._selectedItem = null
        ;(this as unknown as { publish: () => void }).publish()
      },
      renameItem(item: unknown, next: string) {
        const runtime = this as unknown as RadioGroupRuntime
        if (runtime._selectedItem !== item) return
        runtime._value = next
        ;(this as unknown as { publish: () => void }).publish()
      },
      changed(item: unknown) {
        const runtime = this as unknown as RadioGroupRuntime
        const group = this as unknown as {
          addItem: (item: unknown) => void
          removeItem: (item: unknown) => void
        }
        if (runtime._selectedItem === item) group.removeItem(item)
        else group.addItem(item)
      },
      getFormData(): string {
        return (this as unknown as RadioGroupRuntime)._value
      },
      resetFormData() {
        const runtime = this as unknown as RadioGroupRuntime
        runtime._value = ''
        runtime._selectedItem = null
        ;(this as unknown as { publish: () => void }).publish()
      },
    },
  }).general()
}

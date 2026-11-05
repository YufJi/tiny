import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type GroupItem = {
  data?: { value?: unknown; checked?: unknown }
  setData?: (data: Record<string, unknown>) => void
}

type CheckboxGroupRuntime = {
  _value: string[]
  setData: (data: Record<string, unknown>) => void
}

const itemValue = (item: unknown): string => String((item as GroupItem).data?.value ?? '')

/**
 * `checkbox-group` mirrors WeChat: the group owns only the derived `value`,
 * which is maintained from item notifications. It never writes `checked`
 * back to its items.
 */
export function defineCheckboxGroup(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('checkbox-group'),
    template: ctx.template('checkbox-group'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.group],
    data: {
      value: [] as string[],
    },
    lifetimes: {
      created() {
        ;(this as unknown as CheckboxGroupRuntime)._value = []
      },
      attached() {
        ;(this as unknown as CheckboxGroupRuntime & { publish: () => void }).publish()
      },
    },
    options: ctx.hostOptions('checkbox-group'),
    methods: {
      publish() {
        const runtime = this as unknown as CheckboxGroupRuntime
        runtime.setData({ value: [...runtime._value] })
      },
      addItem(item: unknown) {
        const runtime = this as unknown as CheckboxGroupRuntime
        if (!(item as GroupItem).data?.checked) return
        runtime._value.push(itemValue(item))
        ;(this as unknown as { publish: () => void }).publish()
      },
      removeItem(item: unknown) {
        const runtime = this as unknown as CheckboxGroupRuntime
        if (!(item as GroupItem).data?.checked) return
        const index = runtime._value.indexOf(itemValue(item))
        if (index >= 0) runtime._value.splice(index, 1)
        ;(this as unknown as { publish: () => void }).publish()
      },
      renameItem(item: unknown, next: string, previous: string) {
        const runtime = this as unknown as CheckboxGroupRuntime
        if (!(item as GroupItem).data?.checked) return
        const index = runtime._value.indexOf(previous)
        if (index >= 0) runtime._value[index] = next
        ;(this as unknown as { publish: () => void }).publish()
      },
      changed(item: unknown) {
        const runtime = this as unknown as CheckboxGroupRuntime
        const value = itemValue(item)
        if ((item as GroupItem).data?.checked) {
          runtime._value.push(value)
        } else {
          const index = runtime._value.indexOf(value)
          if (index >= 0) runtime._value.splice(index, 1)
        }
        ;(this as unknown as { publish: () => void }).publish()
      },
      getFormData(): string[] {
        return [...(this as unknown as CheckboxGroupRuntime)._value]
      },
      resetFormData() {
        ;(this as unknown as CheckboxGroupRuntime)._value = []
        ;(this as unknown as { publish: () => void }).publish()
      },
    },
  }).general()
}

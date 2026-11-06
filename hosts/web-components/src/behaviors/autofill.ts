import type * as glassEasel from '@tiny/runtime/glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

export function createAutofillBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.autofill,
    properties: {
      autoFill: { type: String, value: '', observer: '_onAutoFillChange' },
    },
    lifetimes: {
      attached() {
        const runtime = this as unknown as Record<string, unknown>
        runtime._autofillDropdownOptions = []
        runtime.autofillDropdownVisible = false
        runtime._autofillDropdownRect = {}
        runtime._autofillDropdownTargetElemId = ''
        runtime._autofillSelected = undefined
      },
    },
    methods: {
      _onAutoFillChange(value: string) {
        let key = String(value ?? '')
        if (/^[^.]+\.phone$/.test(key)) key = 'phone_info.phone'
        else if (/^[^.]+\.email$/.test(key)) key = 'email_info.email'
        else if (/^[^.]+\.name$/.test(key)) key = 'base_info.name'
        else if (/^[^.]+\.id_card_num$/.test(key)) key = 'base_info.id_card_num'
        const parts = key.split('.')
        const runtime = this as unknown as Record<string, unknown>
        runtime._autofillGroupKey = parts.length === 2 ? parts[0] : null
        runtime._autofillFieldName = parts.length === 2 ? parts[1] : null
        runtime._autofill = parts.length === 2 ? key : null
      },
      _autofillRequestPreAuth(): Promise<void> {
        return Promise.resolve()
      },
      _autofillGetDropdownOptions(): unknown[] {
        return []
      },
      autofillValueChangeHandler(): void {},
      autofillShowDropdown(): void {},
      autofillHideDropdown(): void {},
    },
  })
}

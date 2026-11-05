import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { ReloadState } from './types'

export function createReloadBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.reload,
    methods: {
      saveCompVar(state: ReloadState, fields: string[]): void {
        const list = state._compVarList ?? []
        for (let i = list.length - 1; i > 0; i -= 1) {
          for (let j = i - 1; j >= 0; j -= 1) {
            if (list[j] === list[i]) {
              list.splice(i, 1)
              break
            }
          }
        }
        state._compVarList = list.concat(fields)
        fields.forEach((field) => {
          state[field] = (this as unknown as Record<string, unknown>)[field]
        })
      },
      restoreCompVar(state: ReloadState): void {
        ;(state._compVarList ?? []).forEach((field) => {
          ;(this as unknown as Record<string, unknown>)[field] = state[field]
        })
      },
      saveState(target: ReloadState, state: ReloadState): void {
        target.wxComponents ??= {}
        let store = target.wxComponents as Record<string, unknown>
        if ((this as unknown as { ownerShadowRoot?: unknown }).ownerShadowRoot) {
          store._custom ??= {}
          store = store._custom as Record<string, unknown>
        }
        const is = String((this as unknown as { is: string }).is)
        store[is] ??= []
        ;(store[is] as ReloadState[]).push(state)
      },
      restoreState(target: ReloadState): ReloadState | undefined {
        target.wxComponents ??= {}
        let store = target.wxComponents as Record<string, unknown>
        if ((this as unknown as { ownerShadowRoot?: unknown }).ownerShadowRoot) {
          store._custom ??= {}
          store = store._custom as Record<string, unknown>
        }
        const is = String((this as unknown as { is: string }).is)
        store[is] ??= []
        return (store[is] as ReloadState[]).shift()
      },
    },
  })
}

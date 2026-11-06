import type * as glassEasel from '@tiny/runtime/glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { AriaRuntime, HoverRuntime } from './types'

export function createBaseBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.base,
    properties: {
      hidden: { type: Boolean, value: false },
      // WeChat's wx-base declares the full aria surface; exparser reflects each
      // camelCase name to its kebab-case attribute. ID references use
      // `reflectIdPrefix` so scoped ids stay addressable.
      ariaActivedescendant: { type: String, value: '', reflectIdPrefix: true },
      ariaAtomic: { type: String, value: '' },
      ariaAutocomplete: { type: String, value: '' },
      ariaBusy: { type: String, value: '' },
      ariaChecked: { type: String, value: '' },
      ariaColcount: { type: Number, value: 0 },
      ariaColindex: { type: Number, value: 0 },
      ariaColspan: { type: Number, value: 0 },
      ariaControls: { type: String, value: '', reflectIdPrefix: true },
      ariaCurrent: { type: String, value: '' },
      ariaDescribedby: { type: String, value: '', reflectIdPrefix: true },
      ariaDetails: { type: String, value: '', reflectIdPrefix: true },
      ariaDisabled: { type: String, value: '' },
      ariaDropeffect: { type: String, value: '' },
      ariaErrormessage: { type: String, value: '', reflectIdPrefix: true },
      ariaExpanded: { type: String, value: '' },
      ariaFlowto: { type: String, value: '', reflectIdPrefix: true },
      ariaGrabbed: { type: String, value: '' },
      ariaHaspopup: { type: String, value: '' },
      ariaHidden: { type: String, value: '' },
      ariaInvalid: { type: String, value: '' },
      ariaKeyshortcuts: { type: String, value: '' },
      ariaLabel: { type: String, value: '' },
      ariaLabelledby: { type: String, value: '', reflectIdPrefix: true },
      ariaLevel: { type: Number, value: 0 },
      ariaLive: { type: String, value: '' },
      ariaModal: { type: String, value: '' },
      ariaMultiline: { type: String, value: '' },
      ariaMultiselectable: { type: String, value: '' },
      ariaOrientation: { type: String, value: '' },
      ariaOwns: { type: String, value: '', reflectIdPrefix: true },
      ariaPlaceholder: { type: String, value: '' },
      ariaPosinset: { type: Number, value: 0 },
      ariaPressed: { type: String, value: '' },
      ariaReadonly: { type: String, value: '' },
      ariaRelevant: { type: String, value: '' },
      ariaRequired: { type: String, value: '' },
      ariaRole: { type: String, value: '', observer: 'ariaRoleChanged' },
      ariaRoledescription: { type: String, value: '' },
      ariaRowcount: { type: Number, value: 0 },
      ariaRowindex: { type: Number, value: 0 },
      ariaRowspan: { type: Number, value: 0 },
      ariaSelected: { type: String, value: '' },
      ariaSetsize: { type: Number, value: 0 },
      ariaSort: { type: String, value: '' },
      ariaValuemax: { type: Number, value: 0 },
      ariaValuemin: { type: Number, value: 0 },
      ariaValuenow: { type: Number, value: 0 },
      ariaValuetext: { type: String, value: '' },
      tabindex: { type: Number, value: 0 },
      enableSelection: { type: Boolean, value: false },
      disableSelection: { type: Boolean, value: false },
    },
    lifetimes: {
      attached() {
        (this as unknown as { applyAriaRole?: () => void }).applyAriaRole?.()
      },
    },
    methods: {
      applyAriaRole(): void {
        const runtime = this as unknown as AriaRuntime
        const element = runtime.getBackendElement?.()
        if (!element) return
        const value = String((this as unknown as { data: Record<string, unknown> }).data.ariaRole ?? '')
        const role = value || runtime._ariaRoleDefault || ''
        if (role) {
          element.setAttribute?.('role', role)
          runtime._ariaRoleApplied = true
        } else if (runtime._ariaRoleApplied) {
          element.removeAttribute?.('role')
          runtime._ariaRoleApplied = false
        }
      },
      ariaRoleChanged(): void {
        (this as unknown as { applyAriaRole: () => void }).applyAriaRole()
      },
      setAriaRoleDefault(role: string): void {
        const runtime = this as unknown as AriaRuntime
        runtime._ariaRoleDefault = role
        ;(this as unknown as { applyAriaRole: () => void }).applyAriaRole()
      },
      getNodeId(): string {
        const element = (this as unknown as {
          getBackendElement?: () => { id?: string } | null
        }).getBackendElement?.()
        return String(element?.id ?? '')
      },
      getPluginId(): string {
        return ''
      },
      getRealRoute(route: string): string {
        return route
      },
      debounce(name: string, callback: (() => void) | undefined, wait: number): void {
        const instance = this as unknown as HoverRuntime
        instance.__debouncers ??= {}
        const previous = instance.__debouncers[name]
        if (previous) clearTimeout(previous)
        instance.__debouncers[name] = setTimeout(() => {
          instance.__debouncers![name] = undefined
          callback?.()
        }, wait)
      },
    },
  })
}

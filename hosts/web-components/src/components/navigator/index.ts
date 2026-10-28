import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'
import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'

/** `<navigator open-type>` → the render host action it asks for. */
const OPEN_TYPE_ACTIONS = {
  navigate: 'navigateTo',
  redirect: 'redirectTo',
  switchTab: 'switchTab',
  reLaunch: 'reLaunch',
} as const

/**
 * `<navigator>` is the one built-in whose whole job is routing: the page never
 * binds the tap, so the component asks the host to run the equivalent host API
 * (`tree.hostAction`) instead of synthesising a page event.
 */
export function defineNavigator(ctx: BuiltinContext): BuiltinDefinition {
  const report = (code: string, message: string, details?: unknown): void => {
    ctx.options.onDiagnostic?.({ severity: 'warning', code, message, details })
  }

  return ctx.space.defineComponent({
    is: builtinDefinitionName('navigator'),
    template: ctx.template('navigator'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.hover],
    properties: {
      target: { type: String, value: 'self' },
      url: { type: String, value: '' },
      openType: { type: String, value: 'navigate' },
      delta: { type: Number, value: 1 },
      appId: { type: String, value: '' },
      version: { type: String, value: '' },
      extraData: { type: Object, value: {} },
      // WeChat's navigator hovers later and shorter than a button.
      hoverClass: { type: String, value: 'navigator-hover' },
      hoverStartTime: { type: Number, value: 400 },
      hoverStayTime: { type: Number, value: 50 },
      hoverStopPropagation: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('navigator'),
    lifetimes: {
      created() {
        bindHostListeners(this, {
          tap: () => this.handleNavigate(),
        })
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    methods: {
      handleNavigate() {
        const data = this.data as Record<string, unknown>
        const target = String(data.target ?? 'self')
        const openType = String(data.openType || 'navigate')
        const url = String(data.url ?? '').trim()
        if (target !== 'self') {
          // Opening another mini program needs a native host; a browser cannot.
          report(
            DIAGNOSTIC_CODES.UNSUPPORTED_NAVIGATOR_TARGET,
            `<navigator target="${target}"> needs a native host; only target="self" navigates.`,
            { target },
          )
          return
        }
        const action = OPEN_TYPE_ACTIONS[openType as keyof typeof OPEN_TYPE_ACTIONS]
        const needsUrl = action !== undefined
        if (!needsUrl && openType !== 'navigateBack' && openType !== 'exit') {
          report(
            DIAGNOSTIC_CODES.INVALID_NAVIGATOR_OPEN_TYPE,
            `<navigator open-type="${openType}"> is not a valid open-type.`,
            { openType },
          )
          return
        }
        if (needsUrl && url === '') {
          report(
            DIAGNOSTIC_CODES.INVALID_NAVIGATOR_URL,
            `<navigator open-type="${openType}"> needs a non-empty url.`,
            { openType },
          )
          return
        }
        const hostAction = ctx.options.hostAction
        if (!hostAction) {
          report(
            DIAGNOSTIC_CODES.UNSUPPORTED_NAVIGATOR_TARGET,
            '<navigator> has no host routing channel; the host does not expose hostAction.',
            { openType },
          )
          return
        }
        if (action) {
          hostAction({ action, url })
          return
        }
        if (openType === 'navigateBack') {
          const delta = Math.floor(Number(data.delta ?? 1))
          hostAction({ action: 'navigateBack', delta: Number.isFinite(delta) && delta > 0 ? delta : 1 })
          return
        }
        hostAction({ action: 'exit' })
      },
    },
  }).general()
}

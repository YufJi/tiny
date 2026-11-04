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
  return ctx.space.defineComponent({
    is: builtinDefinitionName('navigator'),
    template: ctx.template('navigator'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.hover],
    properties: {
      url: { type: String, value: '' },
      delta: { type: Number, value: 1 },
      redirect: { type: Boolean, value: false },
      target: { type: String, value: 'self' },
      openType: { type: String, value: 'navigate' },
      hoverClass: { type: String, value: '' },
      hover: { type: Boolean, value: true },
      hoverStayTime: { type: Number, value: 600 },
      appId: { type: String, value: '' },
      path: { type: String, value: '' },
      shortLink: { type: String, value: '' },
      extraData: { type: Object, value: '' },
      version: { type: String, value: 'release' },
      scene: { type: Number, value: 1037 },
      sceneNote: { type: String, value: '' },
    },
    options: ctx.hostOptions('navigator'),
    lifetimes: {
      created() {
        ;(this as unknown as { _defaultHoverClass: string })._defaultHoverClass = 'navigator-hover'
        bindHostListeners(this, {
          tap: () => this.handleNavigate(),
        })
      },
      attached() {
        ;(this as unknown as { setAriaRoleDefault: (role: string) => void }).setAriaRoleDefault('link')
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
        if (target === 'miniProgram') {
          if (openType === 'navigate' && !this.data.appId && !this.data.shortLink) {
            this.reportFailure(
              DIAGNOSTIC_CODES.INVALID_NAVIGATOR_URL,
              '<navigator/> should have app-id or short-link attribute when using navigate with miniProgram target',
              { openType },
            )
            return
          }
          // Opening another mini program needs a native host; a browser cannot.
          this.reportFailure(
            DIAGNOSTIC_CODES.UNSUPPORTED_NAVIGATOR_TARGET,
            `<navigator target="${target}"> needs a native host; only target="self" navigates.`,
            { target },
          )
          return
        }
        const action = this.data.redirect
          ? 'redirectTo'
          : OPEN_TYPE_ACTIONS[openType as keyof typeof OPEN_TYPE_ACTIONS]
        const needsUrl = action !== undefined
        if (!needsUrl && openType !== 'navigateBack' && openType !== 'exit') {
          this.reportFailure(
            DIAGNOSTIC_CODES.INVALID_NAVIGATOR_OPEN_TYPE,
            `<navigator/> with invalid openType ${openType}`,
            { openType },
          )
          return
        }
        if (needsUrl && url === '') {
          this.reportFailure(
            DIAGNOSTIC_CODES.INVALID_NAVIGATOR_URL,
            '<navigator/> should have url attribute when using navigateTo, redirectTo or switchTab',
            { openType },
          )
          return
        }
        const hostAction = ctx.options.hostAction
        if (!hostAction) {
          this.reportFailure(
            DIAGNOSTIC_CODES.UNSUPPORTED_NAVIGATOR_TARGET,
            '<navigator> has no host routing channel; the host does not expose hostAction.',
            { openType },
          )
          return
        }
        if (action) {
          hostAction({ action, url })
          this.triggerEvent('success', {})
          this.triggerEvent('complete', {})
          return
        }
        if (openType === 'navigateBack') {
          const delta = Math.floor(Number(data.delta ?? 1))
          hostAction({ action: 'navigateBack', delta: Number.isFinite(delta) && delta > 0 ? delta : 1 })
          return
        }
        hostAction({ action: 'exit' })
        this.triggerEvent('success', {})
        this.triggerEvent('complete', {})
      },
      reportFailure(code: string, errMsg: string, details: Record<string, unknown>) {
        ctx.options.onDiagnostic?.({ severity: 'warning', code, message: errMsg, details })
        this.triggerEvent('fail', { errMsg })
        this.triggerEvent('complete', { errMsg })
      },
    },
  }).general()
}

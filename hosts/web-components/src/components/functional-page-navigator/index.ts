import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'
import { bindHostListeners, unbindHostListeners } from '../../behaviors'

type FunctionalPageNavigatorRuntime = {
  getBackendElement?: () => HTMLElement | null
}

/**
 * Mirrors `wx-functional-page-navigator`: opens a plugin functional page.
 *
 * WeChat routes this through the plugin/native bridge. The browser host offers
 * a generic `hostRequest('functionalPage.navigate', …)` seam; without a host
 * implementation the tap reports `UNSUPPORTED_FUNCTIONAL_PAGE` and emits the
 * same `fail` event shape the reference uses.
 */
export function defineFunctionalPageNavigator(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('functional-page-navigator'),
    template: ctx.template('functional-page-navigator'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.hover],
    properties: {
      name: { type: String, value: '' },
      version: { type: String, value: 'release' },
      args: { type: Object, value: null },
      hoverClass: { type: String, value: '' },
      hover: { type: Boolean, value: true },
      hoverStayTime: { type: Number, value: 600 },
    },
    options: ctx.hostOptions('functional-page-navigator'),
    lifetimes: {
      created() {
        ;(this as unknown as { _defaultHoverClass: string })._defaultHoverClass
          = 'functional-page-navigator-hover'
        bindHostListeners(this, {
          tap: () => this.handleTap(),
        })
      },
      attached() {
        ;(this as unknown as { setAriaRoleDefault: (role: string) => void })
          .setAriaRoleDefault('link')
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    methods: {
      handleTap() {
        const name = String(this.data.name ?? '').trim()
        if (!name) {
          this.fail({ errMsg: 'functional-page-navigator: name is required' })
          return
        }
        const payload = {
          name,
          version: String(this.data.version ?? 'release'),
          args: this.data.args ?? {},
        }
        const request = ctx.options.hostRequest
        if (!request) {
          ctx.options.onDiagnostic?.({
            severity: 'warning',
            code: 'UNSUPPORTED_FUNCTIONAL_PAGE',
            message: 'functional-page-navigator needs a host implementation.',
            details: payload,
          })
          this.fail({ errMsg: 'functional-page-navigator: not supported in this host' })
          return
        }
        void request('functionalPage.navigate', payload).then(
          (res) => this.triggerEvent('success', { res, logDetail: {} }),
          (error) => this.fail({
            errMsg: error instanceof Error
              ? error.message
              : 'functional-page-navigator: navigation failed',
          }),
        )
      },
      fail(res: Record<string, unknown>) {
        this.triggerEvent('fail', { res, logDetail: {} })
      },
    },
  }).general()
}

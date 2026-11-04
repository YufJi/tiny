import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

type FunctionalPageRuntime = {
  _enteredForeground: boolean
  _enteredForegroundCb: (() => void) | null
  data: Record<string, unknown>
  setData(data: Record<string, unknown>): void
  triggerEvent(name: string, detail?: unknown): void
  waitOnShow(callback: () => void): void
  returnSuccess(res: unknown, logDetail?: unknown): void
  returnFail(res: unknown, logDetail?: unknown): void
  returnCancel(logDetail?: unknown): void
  _markForeground(): void
  back(): void
  _showToast(...args: unknown[]): void
  _hideToast(): void
  _showButtonLoading(): void
  _hideButtonLoading(): void
}

/**
 * `wx://functional-page-behavior`
 *
 * The functional-page navigator is a foreground-bound plugin flow: it exposes
 * `waitOnShow`, success/fail/cancel event helpers and a button loading flag.
 *
 * The original behavior subscribes to `wx.onAppEnterForeground`. The runtime
 * core has no platform global, so the same state machine is driven by the
 * component's `pageLifetimes.show` (and treated as already foregrounded after
 * attach). Toast methods are host hooks (`hostShowToast`) because the runtime
 * must not call `wx` directly.
 */
export function createFunctionalPageBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'functional-page-behavior'),
    markers: { functionalPage: true },
    options: {
      is: builtinBehaviorId(compatibility, 'functional-page-behavior'),
      properties: {
        accountInfo: {
          type: Object,
          value: {},
          observer: 'accountInfoChanged',
        },
        pluginInfo: { type: Object, value: {} },
        originAccountInfo: { type: Object, value: {} },
        args: { type: Object, value: {} },
      },
      data: {
        buttonLoading: false,
      },
      attached(this: FunctionalPageRuntime) {
        this._enteredForeground = false
        this._enteredForegroundCb = null
        // A component can only attach below a mounted page, so the entry page is
        // already visible. `pageLifetimes.show` keeps re-entry in sync.
        this._markForeground()
      },
      pageLifetimes: {
        show(this: FunctionalPageRuntime) {
          this._markForeground()
        },
      },
      methods: {
        _markForeground(this: FunctionalPageRuntime) {
          this._enteredForeground = true
          const callback = this._enteredForegroundCb
          if (!callback) return
          this._hideButtonLoading()
          this._enteredForegroundCb = null
          callback()
        },
        waitOnShow(this: FunctionalPageRuntime, ...args: unknown[]) {
          const callback = args[0] as (() => void) | undefined
          if (!callback) return
          if (this._enteredForeground) callback()
          else {
            this._showButtonLoading()
            this._enteredForegroundCb = callback
          }
        },
        init() {},
        accountInfoChanged() {},
        returnSuccess(this: FunctionalPageRuntime, res: unknown, logDetail?: unknown) {
          this.triggerEvent('success', { res, logDetail })
        },
        returnFail(this: FunctionalPageRuntime, res: unknown, logDetail?: unknown) {
          this.triggerEvent('fail', { res, logDetail })
        },
        returnCancel(this: FunctionalPageRuntime, logDetail?: unknown) {
          this.triggerEvent('cancel', { res: {}, logDetail })
        },
        back(this: FunctionalPageRuntime) {
          this.returnCancel('user cancel')
        },
        _showToast(this: FunctionalPageRuntime, ...args: unknown[]) {
          const icon = String(args[0] ?? '')
          const title = typeof args[1] === 'string' ? args[1] : ''
          const duration = typeof args[2] === 'number' ? args[2] : 1e8
          const hook = (this as unknown as {
            hostShowToast?: (options: { icon: string; title: string; duration: number }) => void
          }).hostShowToast
          hook?.({ icon, title, duration })
        },
        _hideToast(this: FunctionalPageRuntime) {
          const hook = (this as unknown as { hostHideToast?: () => void }).hostHideToast
          hook?.()
        },
        _showButtonLoading(this: FunctionalPageRuntime) {
          this.setData({ buttonLoading: true })
        },
        _hideButtonLoading(this: FunctionalPageRuntime) {
          this.setData({ buttonLoading: false })
        },
      },
    },
  }
}

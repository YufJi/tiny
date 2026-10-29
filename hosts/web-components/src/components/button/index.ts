import type * as glassEasel from 'glass-easel'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

const DEFAULT_HOVER_CLASS = 'button-hover'

const OPEN_TYPE_EVENTS: Record<string, string> = {
  contact: 'contact',
  share: 'share',
  getPhoneNumber: 'getphonenumber',
  getRealtimePhoneNumber: 'getrealtimephonenumber',
  getUserInfo: 'getuserinfo',
  openSetting: 'opensetting',
  launchApp: 'launchapp',
  chooseAvatar: 'chooseavatar',
  agreePrivacyAuthorization: 'agreeprivacyauthorization',
  subscribe: 'subscribe',
  realnameAuth: 'realnameauth',
  getRealnameAuthInfo: 'getrealnameauthinfo',
  feedback: 'feedback',
}

export function defineButton(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('button'),
    template: ctx.template('button'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.hover, ctx.behaviors.labelTarget],
    properties: {
      ariaLabel: { type: String, value: '' },
      type: { type: String, value: 'default' },
      size: { type: String, value: 'default' },
      disabled: { type: Boolean, value: false },
      plain: { type: Boolean, value: false },
      loading: { type: Boolean, value: false },
      formType: { type: String, value: '' },
      openType: { type: String, value: '' },
      appParameter: { type: String, value: '' },
      withCredentials: { type: Boolean, value: true },
      lang: { type: String, value: 'en' },
      hoverStartTime: { type: Number, value: 20 },
      hoverStayTime: { type: Number, value: 70 },
      hoverStopPropagation: { type: Boolean, value: false },
      hoverClass: { type: String, value: DEFAULT_HOVER_CLASS },
      sessionFrom: { type: String, value: 'wxapp' },
      businessId: { type: String, value: '' },
      sendMessageTitle: { type: String, value: '' },
      sendMessagePath: { type: String, value: '' },
      sendMessageImg: { type: String, value: '' },
      showMessageCard: { type: Boolean, value: false },
      categoryId: { type: Array, value: [] },
      needPhoneNumber: { type: Boolean, value: false },
      native: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('button'),
    lifetimes: {
      attached() {
        const element = (this as unknown as {
          getBackendElement?: () => { setAttribute?: (name: string, value: string) => void } | null
        }).getBackendElement?.()
        element?.setAttribute?.('role', 'button')
        element?.setAttribute?.('aria-label', String(this.data.ariaLabel ?? ''))
      },
      created() {
        // The host is the button in WeChat. `[disabled] { pointer-events:none }`
        // blocks real taps; programmatic triggerEvent still reaches same-node
        // page listeners, so disabled only suppresses form/open-type semantics.
        bindHostListeners(this, {
          tap: (event) => this.handleTap(event),
          longpress: (event) => this.handleButtonLongPress(event),
          canceltap: () => {
            ;(this as unknown as { _longTapFired?: boolean })._longTapFired = true
          },
          touchstart: (event) => this.handleButtonTouchStart(event),
          touchend: (event) => this.handleButtonTouchEnd(event),
          touchcancel: (event) => this.handleButtonTouchEnd(event),
        })
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    methods: {
      touchPoint(event: glassEasel.ShadowedEvent<unknown>): { x: number; y: number } {
        const detail = (event.detail ?? {}) as {
          touches?: Array<{ clientX?: number; clientY?: number }>
          changedTouches?: Array<{ clientX?: number; clientY?: number }>
        }
        const touch = detail.touches?.[0] ?? detail.changedTouches?.[0]
        return { x: Number(touch?.clientX ?? 0), y: Number(touch?.clientY ?? 0) }
      },
      clearLongTap() {
        const instance = this as unknown as { _longTapTimer?: ReturnType<typeof setTimeout> }
        if (instance._longTapTimer) clearTimeout(instance._longTapTimer)
        instance._longTapTimer = undefined
      },
      handleButtonTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        const instance = this as unknown as {
          _longTapTimer?: ReturnType<typeof setTimeout>
          _longTapStart?: { x: number; y: number }
          _longTapFired?: boolean
        }
        this.clearLongTap()
        instance._longTapStart = this.touchPoint(event)
        instance._longTapFired = false
      },
      handleButtonLongPress(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        const instance = this as unknown as {
          _longTapStart?: { x: number; y: number }
          _longTapFired?: boolean
        }
        instance._longTapFired = true
        const detail = (event.detail ?? {}) as { x?: unknown; y?: unknown }
        // `longpress` is the current WeChat name; `longtap` is kept as the
        // legacy alias on the same synthetic gesture.
        this.triggerEvent('longtap', {
          x: Number(detail.x ?? instance._longTapStart?.x ?? 0),
          y: Number(detail.y ?? instance._longTapStart?.y ?? 0),
        }, { bubbles: true, composed: true })
      },
      handleButtonTouchEnd(_event?: unknown) {
        void _event
        this.clearLongTap()
      },
      handleLabelTap(event: glassEasel.ShadowedEvent<unknown>) {
        this.handleTap(event)
      },
      handleTap(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as { _longTapFired?: boolean }
        if (instance._longTapFired) {
          instance._longTapFired = false
          return
        }
        if (this.data.disabled) {
          event.stopPropagation()
          return
        }
        const formType = String(this.data.formType ?? '')
        if (formType === 'submit') {
          this.triggerEvent('formSubmit', { formId: '', formPluginId: '' }, { bubbles: true, composed: true })
        } else if (formType === 'reset') {
          this.triggerEvent('formReset', undefined, { bubbles: true, composed: true })
        }
        const openType = String(this.data.openType ?? '')
        if (openType !== '') {
          ctx.options.onDiagnostic?.({
            severity: 'warning',
            code: DIAGNOSTIC_CODES.UNSUPPORTED_BUTTON_OPEN_TYPE,
            message: `<button/> open-type "${openType}" is not supported in the P0 runtime.`,
            details: { openType },
          })
          const errMsg = `${openType}:fail not supported by the Tiny runtime`
          const eventName = OPEN_TYPE_EVENTS[openType]
          if (eventName) this.triggerEvent(eventName, { errMsg }, { bubbles: true, composed: true })
          this.triggerEvent('error', { errMsg }, { bubbles: true, composed: true })
        }
      },
    },
  }).general()
}

import type * as glassEasel from '@tiny/runtime/glass-easel'
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
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.hover,
      ctx.behaviors.labelTarget,
      ctx.behaviors.labelAria,
      ctx.behaviors.disabled,
    ],
    properties: {
      type: { type: String, value: 'default' },
      size: { type: String, value: 'default' },
      plain: { type: Boolean, value: false },
      loading: { type: Boolean, value: false },
      formType: { type: String, value: '' },
      openType: { type: String, value: '' },
      appParameter: { type: String, value: '' },
      launchAppid: { type: String, value: '' },
      withCredentials: { type: Boolean, value: true },
      lang: { type: String, value: 'en' },
      hoverStartTime: { type: Number, value: 20 },
      hoverStayTime: { type: Number, value: 70 },
      hoverStopPropagation: { type: Boolean, value: false },
      hoverClass: { type: String, value: '' },
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
        ;(this as unknown as { _setAria: (role: string) => void })._setAria('button')
      },
      created() {
        ;(this as unknown as { _defaultHoverClass: string })._defaultHoverClass = DEFAULT_HOVER_CLASS
        bindHostListeners(this, {
          tap: (event) => {
            if (this.data.disabled) {
              event.stopPropagation()
              return
            }
            ;(this as unknown as { handleTap: (event: unknown) => void }).handleTap(event)
          },
          longpress: (event) => this.handleButtonLongPress(event),
          canceltap: () => {
            ;(this as unknown as { _longTapFired?: boolean })._longTapFired = true
          },
        })
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    methods: {
      handleButtonLongPress(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        const instance = this as unknown as {
          _longTapStart?: { x: number; y: number }
          _longTapFired?: boolean
        }
        instance._longTapFired = true
        const detail = (event.detail ?? {}) as { x?: unknown; y?: unknown }
        // The event compositor reports the gesture as `longpress`; WeChat's
        // legacy page binding is `longtap`, so expose that name here.
        this.triggerEvent('longtap', {
          x: Number(detail.x ?? 0),
          y: Number(detail.y ?? 0),
        }, { bubbles: true, composed: true })
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
          this.triggerEvent('formSubmit', { formId: '', formPluginId: '' }, { bubbles: true })
        } else if (formType === 'reset') {
          this.triggerEvent('formReset', undefined, { bubbles: true })
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

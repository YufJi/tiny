import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

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
    is: 'tiny-builtin:button',
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
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
    methods: {
      handleLabelTap(event: glassEasel.ShadowedEvent<unknown>) {
        this.handleTap(event)
      },
      handleTap(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
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
            code: 'UNSUPPORTED_BUTTON_OPEN_TYPE',
            message: `<button/> open-type "${openType}" is not supported in the P0 runtime.`,
            details: { openType },
          })
          const errMsg = `${openType}:fail not supported by the Tiny runtime`
          const eventName = OPEN_TYPE_EVENTS[openType]
          if (eventName) this.triggerEvent(eventName, { errMsg }, { bubbles: true, composed: true })
          this.triggerEvent('error', { errMsg }, { bubbles: true, composed: true })
        }
        this.triggerEvent('tap', event.detail ?? {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}

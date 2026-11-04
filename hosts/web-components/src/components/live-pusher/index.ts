import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

/**
 * `wx-live-pusher` needs a WebRTC/media-server host. The browser host keeps
 * the tag, attributes and a black preview box, and reports that streaming is
 * unavailable through a diagnostic; `start`/`stop`/`pause` remain no-ops.
 */
export function defineLivePusher(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('live-pusher'),
    template: ctx.template('live-pusher'),
    behaviors: [ctx.behaviors.base],
    properties: {
      url: { type: String, value: '', observer: 'reportUnsupported' },
      mode: { type: String, value: 'RTC' },
      autopush: { type: Boolean, value: false },
      muted: { type: Boolean, value: false },
      enableCamera: { type: Boolean, value: true },
      autoFocus: { type: Boolean, value: true },
      orientation: { type: String, value: 'vertical' },
      beauty: { type: Number, value: 0 },
      whiteness: { type: Number, value: 0 },
      aspect: { type: String, value: '9:16' },
      minBitrate: { type: Number, value: 200 },
      maxBitrate: { type: Number, value: 1000 },
      audioQuality: { type: String, value: 'high' },
      waitingImage: { type: String, value: '' },
      zoom: { type: Boolean, value: false },
      devicePosition: { type: String, value: 'front' },
      backgroundMute: { type: Boolean, value: false },
      mirror: { type: Boolean, value: false },
      enableMic: { type: Boolean, value: true },
      enableAgc: { type: Boolean, value: false },
      enableAns: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('live-pusher'),
    lifetimes: {
      attached() {
        if (this.data.url) {
          ;(this as unknown as { reportUnsupported: () => void }).reportUnsupported()
        }
      },
    },
    methods: {
      reportUnsupported() {
        if (!this.data.url) return
        ctx.options.onDiagnostic?.({
          severity: 'warning',
          code: 'UNSUPPORTED_LIVE_PUSHER',
          message: '<live-pusher> needs a WebRTC media host; streaming is disabled in the browser host.',
          details: { url: this.data.url },
        })
        this.triggerEvent('error', { errMsg: 'live-pusher: not supported in this host' })
      },
      start() {},
      stop() {},
      pause() {},
      resume() {},
      switchCamera() {},
      snapshot() {
        this.triggerEvent('snapshot', {})
      },
    },
  }).general()
}

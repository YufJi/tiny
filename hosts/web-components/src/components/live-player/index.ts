import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type LivePlayerRuntime = {
  _listeners?: Array<[string, EventListener]>
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

const EVENTS = ['play', 'pause', 'ended', 'error', 'waiting', 'timeupdate', 'loadedmetadata', 'fullscreenchange']

/**
 * Browser approximation of `wx-live-player`: a native `<video>` element for
 * HLS/FLV URLs the browser can play. HLS is only natively supported by Safari;
 * Chrome/Edge need MSE and are reported through the `error` event.
 */
export function defineLivePlayer(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('live-player'),
    template: ctx.template('live-player'),
    behaviors: [ctx.behaviors.base],
    properties: {
      src: { type: String, value: '', observer: 'srcChanged' },
      mode: { type: String, value: 'live' },
      autoplay: { type: Boolean, value: false, observer: 'apply' },
      muted: { type: Boolean, value: false, observer: 'apply' },
      loop: { type: Boolean, value: false, observer: 'apply' },
      objectFit: { type: String, value: 'contain', observer: 'apply' },
      orientation: { type: String, value: 'vertical' },
      minCache: { type: Number, value: 1 },
      maxCache: { type: Number, value: 3 },
      soundMode: { type: String, value: 'speaker' },
      backgroundMute: { type: Boolean, value: false },
      autoPauseIfNavigate: { type: Boolean, value: true },
      autoPauseIfOpenNative: { type: Boolean, value: true },
      pictureInPictureMode: { type: String, value: '' },
    },
    options: ctx.hostOptions('live-player'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as LivePlayerRuntime
        const player = (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()
        if (!player) return
        runtime._listeners = EVENTS.map((name) => {
          const listener = (() => {
            ;(this as unknown as { notify: (name: string) => void }).notify(name)
          }) as EventListener
          player.addEventListener(name, listener)
          return [name, listener] as [string, EventListener]
        })
        ;(this as unknown as { apply: () => void }).apply()
        ;(this as unknown as { srcChanged: (value: string) => void })
          .srcChanged(String(this.data.src ?? ''))
      },
      detached() {
        const runtime = this as unknown as LivePlayerRuntime
        const player = (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()
        if (player) {
          player.pause()
          for (const [name, listener] of runtime._listeners ?? []) {
            player.removeEventListener(name, listener)
          }
        }
      },
    },
    methods: {
      playerElement(): HTMLVideoElement | null {
        const runtime = this as unknown as LivePlayerRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('player')
          ?.getBackendElement?.() as HTMLVideoElement | null
      },
      apply() {
        const player = (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()
        if (!player) return
        player.autoplay = Boolean(this.data.autoplay)
        player.muted = Boolean(this.data.muted)
        player.loop = Boolean(this.data.loop)
        player.style.objectFit = String(this.data.objectFit ?? 'contain')
        player.setAttribute('playsinline', '')
      },
      srcChanged(value: string) {
        const player = (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()
        if (!player) return
        const src = String(value ?? '').trim()
        if (!src) {
          player.removeAttribute('src')
          return
        }
        player.src = src
        player.load()
        if (/\.m3u8(\?|#|$)/i.test(src) && !/^((?!chrome|android).)*safari/i.test(
          typeof navigator !== 'undefined' ? navigator.userAgent : '',
        )) {
          ctx.options.onDiagnostic?.({
            severity: 'warning',
            code: 'LIVE_PLAYER_HLS',
            message: '<live-player> HLS needs MSE support in this browser.',
            details: { src },
          })
        }
      },
      notify(name: string) {
        const player = (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()
        if (!player) return
        const detail: Record<string, unknown> = {}
        if (name === 'error') {
          detail.errMsg = player.error?.message ?? 'live-player: media error'
        } else if (name === 'timeupdate') {
          detail.currentTime = player.currentTime
          detail.duration = player.duration
        } else if (name === 'fullscreenchange') {
          detail.fullScreen = typeof document !== 'undefined' && Boolean(document.fullscreenElement)
        }
        this.triggerEvent(name, detail)
      },
      play() {
        return (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()?.play().catch(() => undefined)
      },
      pause() {
        ;(this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()?.pause()
      },
      stop() {
        const player = (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()
        if (!player) return
        player.pause()
        player.currentTime = 0
      },
      seek(time: number) {
        const player = (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()
        if (player && Number.isFinite(time)) player.currentTime = Math.max(0, time)
      },
      requestFullScreen() {
        const player = (this as unknown as { playerElement: () => HTMLVideoElement | null })
          .playerElement()
        return player?.requestFullscreen?.().catch(() => undefined)
      },
      exitFullScreen() {
        if (typeof document === 'undefined' || !document.fullscreenElement) return Promise.resolve()
        return document.exitFullscreen().catch(() => undefined)
      },
    },
  }).general()
}

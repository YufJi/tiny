import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type VideoRuntime = {
  _listeners?: Array<[string, EventListener]>
  _centerPlayListener?: () => void
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

const EVENTS = [
  'play',
  'pause',
  'ended',
  'waiting',
  'error',
  'progress',
  'timeupdate',
  'loadedmetadata',
  'fullscreenchange',
  'seeking',
  'seeked',
  'volumechange',
]

/**
 * Mirrors the core of `wx-video` with a native `<video>` element. Advanced
 * native features (danmu, casting, picture-in-picture, background playback)
 * are accepted as attributes but not implemented yet.
 */
export function defineVideo(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('video'),
    template: ctx.template('video'),
    behaviors: [ctx.behaviors.base],
    properties: {
      src: { type: String, value: '', observer: 'srcChanged' },
      controls: { type: Boolean, value: true, observer: 'apply' },
      autoplay: { type: Boolean, value: false, observer: 'apply' },
      loop: { type: Boolean, value: false, observer: 'apply' },
      muted: { type: Boolean, value: false, observer: 'apply' },
      poster: { type: String, value: '', observer: 'apply' },
      objectFit: { type: String, value: 'contain', observer: 'apply' },
      initialTime: { type: Number, value: 0 },
      showProgress: { type: Boolean, value: true },
      showFullscreenBtn: { type: Boolean, value: true },
      showPlayBtn: { type: Boolean, value: true },
      showCenterPlayBtn: { type: Boolean, value: true, observer: 'centerPlayChanged' },
      showMuteBtn: { type: Boolean, value: false },
      title: { type: String, value: '' },
      playBtnPosition: { type: String, value: 'bottom' },
      enablePlayGesture: { type: Boolean, value: false },
      autoPauseIfNavigate: { type: Boolean, value: true },
      autoPauseIfOpenNative: { type: Boolean, value: true },
      vslideGesture: { type: Boolean, value: true },
      vslideGestureInFullscreen: { type: Boolean, value: true },
      pageGesture: { type: Boolean, value: false },
      direction: { type: Number, value: 0 },
    },
    options: ctx.hostOptions('video'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as VideoRuntime
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video) return
        runtime._listeners = EVENTS.map((name) => {
          const listener = (() => {
            ;(this as unknown as { notify: (name: string) => void }).notify(name)
          }) as EventListener
          video.addEventListener(name, listener)
          return [name, listener] as [string, EventListener]
        })
        const center = (this as unknown as {
          centerElement: () => HTMLElement | null
        }).centerElement()
        runtime._centerPlayListener = () => {
          ;(this as unknown as { play: () => void }).play()
        }
        center?.addEventListener('click', runtime._centerPlayListener)
        ;(this as unknown as { apply: () => void }).apply()
        ;(this as unknown as { centerPlayChanged: (value: boolean) => void })
          .centerPlayChanged(Boolean(this.data.showCenterPlayBtn))
      },
      detached() {
        const runtime = this as unknown as VideoRuntime
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (video) {
          video.pause()
          for (const [name, listener] of runtime._listeners ?? []) {
            video.removeEventListener(name, listener)
          }
        }
        const center = (this as unknown as {
          centerElement: () => HTMLElement | null
        }).centerElement()
        if (center && runtime._centerPlayListener) {
          center.removeEventListener('click', runtime._centerPlayListener)
        }
        runtime._listeners = undefined
      },
    },
    methods: {
      videoElement(): HTMLVideoElement | null {
        const runtime = this as unknown as VideoRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('video')
          ?.getBackendElement?.() as HTMLVideoElement | null
      },
      centerElement(): HTMLElement | null {
        const runtime = this as unknown as VideoRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('center-play')
          ?.getBackendElement?.() ?? null
      },
      resolveSrc(value: string): string {
        try {
          return ctx.options.resolveAssetUrl?.(value, this) ?? value
        } catch {
          return value
        }
      },
      apply() {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video) return
        const controls = Boolean(this.data.controls)
        video.controls = controls
        video.autoplay = Boolean(this.data.autoplay)
        video.loop = Boolean(this.data.loop)
        video.muted = Boolean(this.data.muted)
        video.setAttribute('playsinline', '')
        video.setAttribute('webkit-playsinline', '')
        const poster = String(this.data.poster ?? '')
        if (poster) video.setAttribute('poster', this.resolveSrc(poster))
        else video.removeAttribute('poster')
        video.style.objectFit = String(this.data.objectFit ?? 'contain')
        if (this.data.title) video.setAttribute('title', String(this.data.title))
      },
      srcChanged(value: string) {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video) return
        const src = (this as unknown as { resolveSrc: (value: string) => string })
          .resolveSrc(value)
        if (src) {
          const initial = Number(this.data.initialTime) || 0
          if (initial > 0) {
            const seekOnce = () => {
              video.removeEventListener('loadedmetadata', seekOnce)
              if (Number.isFinite(video.duration) && video.duration > initial) {
                video.currentTime = initial
              }
            }
            video.addEventListener('loadedmetadata', seekOnce)
          }
          video.src = src
          video.load()
        } else {
          video.removeAttribute('src')
          video.load()
        }
      },
      centerPlayChanged(value: boolean) {
        const center = (this as unknown as {
          centerElement: () => HTMLElement | null
        }).centerElement()
        if (center) center.style.display = value ? 'block' : 'none'
      },
      notify(name: string) {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video) return
        if (name === 'play' || name === 'pause' || name === 'ended') {
          const center = (this as unknown as {
            centerElement: () => HTMLElement | null
          }).centerElement()
          if (center && this.data.showCenterPlayBtn) {
            center.style.display = name === 'play' ? 'none' : 'block'
          }
        }
        const detail: Record<string, unknown> = {}
        if (name === 'timeupdate') {
          detail.currentTime = video.currentTime
          detail.duration = video.duration
        } else if (name === 'loadedmetadata') {
          detail.width = video.videoWidth
          detail.height = video.videoHeight
          detail.duration = video.duration
        } else if (name === 'fullscreenchange') {
          detail.fullScreen = typeof document !== 'undefined'
            && Boolean(document.fullscreenElement)
        } else if (name === 'error' && video.error) {
          detail.errMsg = video.error.message
        }
        this.triggerEvent(name, detail)
      },
      play() {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video) return Promise.resolve()
        return video.play().catch(() => undefined)
      },
      pause() {
        ;(this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()?.pause()
      },
      stop() {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video) return
        video.pause()
        video.currentTime = 0
      },
      seek(time: number) {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (video && Number.isFinite(time)) video.currentTime = Math.max(0, time)
      },
      playbackRate(rate: number) {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (video && Number.isFinite(rate)) video.playbackRate = rate
      },
      requestFullScreen() {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video) return Promise.resolve()
        return (video.requestFullscreen?.() ?? Promise.resolve()).catch(() => undefined)
      },
      exitFullScreen() {
        if (typeof document === 'undefined' || !document.fullscreenElement) return Promise.resolve()
        return document.exitFullscreen().catch(() => undefined)
      },
    },
  }).general()
}

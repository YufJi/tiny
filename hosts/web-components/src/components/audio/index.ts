import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type AudioRuntime = {
  _listeners?: Array<[string, EventListener]>
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

const EVENTS = ['play', 'pause', 'ended', 'timeupdate', 'error', 'waiting', 'loadedmetadata']

/**
 * Mirrors the deprecated `<audio>` with a native HTMLAudioElement. WeChat's
 * custom WeUI player skin is replaced by the native controls; the component
 * keeps the documented attributes and media events.
 */
export function defineAudio(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('audio'),
    template: ctx.template('audio'),
    behaviors: [ctx.behaviors.base],
    properties: {
      src: { type: String, value: '', observer: 'srcChanged' },
      loop: { type: Boolean, value: false, observer: 'apply' },
      controls: { type: Boolean, value: false, observer: 'apply' },
      poster: { type: String, value: '' },
      name: { type: String, value: '' },
      author: { type: String, value: '' },
    },
    options: ctx.hostOptions('audio'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as AudioRuntime
        const audio = (this as unknown as { audioElement: () => HTMLAudioElement | null })
          .audioElement()
        if (!audio) return
        audio.controls = true
        runtime._listeners = EVENTS.map((name) => {
          const listener = (() => {
            ;(this as unknown as { notify: (name: string) => void }).notify(name)
          }) as EventListener
          audio.addEventListener(name, listener)
          return [name, listener] as [string, EventListener]
        })
        ;(this as unknown as { apply: () => void }).apply()
      },
      detached() {
        const runtime = this as unknown as AudioRuntime
        const audio = (this as unknown as { audioElement: () => HTMLAudioElement | null })
          .audioElement()
        if (audio) {
          audio.pause()
          for (const [name, listener] of runtime._listeners ?? []) {
            audio.removeEventListener(name, listener)
          }
        }
        runtime._listeners = undefined
      },
    },
    methods: {
      audioElement(): HTMLAudioElement | null {
        const runtime = this as unknown as AudioRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('player')
          ?.getBackendElement?.() as HTMLAudioElement | null
      },
      resolveSrc(value: string): string {
        try {
          return ctx.options.resolveAssetUrl?.(value, this) ?? value
        } catch {
          return value
        }
      },
      apply() {
        const audio = (this as unknown as { audioElement: () => HTMLAudioElement | null })
          .audioElement()
        if (!audio) return
        audio.loop = Boolean(this.data.loop)
        audio.controls = true
        if (this.data.name) audio.setAttribute('title', String(this.data.name))
      },
      srcChanged(value: string) {
        const audio = (this as unknown as { audioElement: () => HTMLAudioElement | null })
          .audioElement()
        if (!audio) return
        const src = (this as unknown as { resolveSrc: (value: string) => string })
          .resolveSrc(value)
        if (src) {
          audio.src = src
          audio.load()
        } else {
          audio.removeAttribute('src')
        }
      },
      notify(name: string) {
        const audio = (this as unknown as { audioElement: () => HTMLAudioElement | null })
          .audioElement()
        if (!audio) return
        const detail: Record<string, unknown> = {}
        if (name === 'timeupdate' || name === 'loadedmetadata') {
          detail.currentTime = audio.currentTime
          detail.duration = audio.duration
        }
        this.triggerEvent(name, detail)
      },
      play() {
        return (this as unknown as { audioElement: () => HTMLAudioElement | null })
          .audioElement()?.play().catch(() => undefined)
      },
      pause() {
        ;(this as unknown as { audioElement: () => HTMLAudioElement | null })
          .audioElement()?.pause()
      },
      seek(time: number) {
        const audio = (this as unknown as { audioElement: () => HTMLAudioElement | null })
          .audioElement()
        if (audio && Number.isFinite(time)) audio.currentTime = Math.max(0, time)
      },
    },
  }).general()
}

import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type CameraRuntime = {
  _stream?: MediaStream
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

const RESOLUTIONS: Record<string, MediaTrackConstraints> = {
  low: { width: { ideal: 320 }, height: { ideal: 240 } },
  medium: { width: { ideal: 640 }, height: { ideal: 480 } },
  high: { width: { ideal: 1280 }, height: { ideal: 720 } },
}

function facingMode(value: unknown): 'user' | 'environment' {
  return String(value ?? '') === 'back' ? 'environment' : 'user'
}

/**
 * Browser approximation of `wx-camera`: a `getUserMedia` preview plus a
 * snapshot helper. Recording/scanCode modes need MediaRecorder and decoding
 * work and are not wired yet.
 */
export function defineCamera(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('camera'),
    template: ctx.template('camera'),
    behaviors: [ctx.behaviors.base],
    properties: {
      mode: { type: String, value: 'normal' },
      resolution: { type: String, value: 'medium', observer: 'restart' },
      devicePosition: { type: String, value: 'back', observer: 'restart' },
      flash: { type: String, value: 'auto' },
      frameSize: { type: String, value: 'medium' },
    },
    options: ctx.hostOptions('camera'),
    lifetimes: {
      attached() {
        ;(this as unknown as { start: () => void }).start()
      },
      detached() {
        const runtime = this as unknown as CameraRuntime
        for (const track of runtime._stream?.getTracks() ?? []) track.stop()
        runtime._stream = undefined
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (video) video.srcObject = null
      },
    },
    methods: {
      videoElement(): HTMLVideoElement | null {
        const runtime = this as unknown as CameraRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('preview')
          ?.getBackendElement?.() as HTMLVideoElement | null
      },
      restart() {
        const runtime = this as unknown as CameraRuntime
        for (const track of runtime._stream?.getTracks() ?? []) track.stop()
        runtime._stream = undefined
        ;(this as unknown as { start: () => void }).start()
      },
      start() {
        const runtime = this as unknown as CameraRuntime
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
          ctx.options.onDiagnostic?.({
            severity: 'warning',
            code: 'UNSUPPORTED_CAMERA',
            message: '<camera> needs navigator.mediaDevices.getUserMedia in this host.',
          })
          return
        }
        const resolution = RESOLUTIONS[String(this.data.resolution ?? 'medium')]
          ?? RESOLUTIONS.medium
        navigator.mediaDevices.getUserMedia({
          video: {
            ...resolution,
            facingMode: facingMode(this.data.devicePosition),
          },
          audio: false,
        }).then((stream) => {
          runtime._stream = stream
          video.srcObject = stream
          void video.play().catch(() => undefined)
          this.triggerEvent('initdone', {})
        }).catch((error) => {
          this.triggerEvent('error', {
            errMsg: error instanceof Error ? error.message : 'camera: permission denied',
          })
        })
      },
      takePhoto() {
        const video = (this as unknown as { videoElement: () => HTMLVideoElement | null })
          .videoElement()
        if (!video || !video.videoWidth) {
          this.triggerEvent('error', { errMsg: 'camera: preview is not ready' })
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext('2d')
        if (!context) {
          this.triggerEvent('error', { errMsg: 'camera: canvas is unavailable' })
          return
        }
        context.drawImage(video, 0, 0)
        this.triggerEvent('takephoto', { tempImagePath: canvas.toDataURL('image/jpeg') })
      },
      startRecord() {
        this.triggerEvent('error', { errMsg: 'camera: startRecord is not supported yet' })
      },
      stopRecord() {
        this.triggerEvent('error', { errMsg: 'camera: stopRecord is not supported yet' })
      },
    },
  }).general()
}

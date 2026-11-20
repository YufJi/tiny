/**
 * `wx.scanCode` through the Barcode Detection API.
 *
 * Chromium exposes `BarcodeDetector`; Safari and desktop Chrome without the
 * flag do not, so the API answers an honest failure there. The camera stream is
 * always released, including on timeout.
 */

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type BarcodeResult = { rawValue?: string; format?: string }
type DetectorLike = { detect(source: unknown): Promise<BarcodeResult[]> }
type StreamLike = { getTracks?: () => Array<{ stop(): void }> }
type VideoLike = {
  srcObject: unknown
  readyState?: number
  play(): Promise<void> | void
}

export type ScanHandlerOptions = {
  getUserMedia?: (constraints: { video: { facingMode?: string } }) => Promise<StreamLike>
  createVideo?: () => VideoLike
  createDetector?: () => DetectorLike | undefined
  pollMs?: number
}

export function createScanHandlers(
  options: ScanHandlerOptions = {},
): Record<string, (params: HandlerParams) => Promise<HandlerResult>> {
  const getUserMedia = options.getUserMedia ?? defaultGetUserMedia()
  const createVideo = options.createVideo ?? defaultCreateVideo()
  const createDetector = options.createDetector ?? defaultCreateDetector()
  const pollMs = options.pollMs ?? 200

  return {
    'device.scanCode': async (params) => {
      if (!getUserMedia || !createVideo) {
        return { errMsg: 'scanCode:fail camera access is not available in this runtime' }
      }
      const detector = createDetector ? createDetector() : undefined
      if (!detector) {
        return { errMsg: 'scanCode:fail barcode detection is not available in this runtime' }
      }
      const timeout = Math.max(1000, Number(params.timeout ?? 10000))
      let stream: StreamLike | undefined
      try {
        stream = await getUserMedia({ video: { facingMode: 'environment' } })
        const video = createVideo()
        video.srcObject = stream
        await video.play()
        const deadline = Date.now() + timeout
        while (Date.now() < deadline) {
          const results = await detector.detect(video)
          const first = results.find((item) => typeof item?.rawValue === 'string')
          if (first?.rawValue) {
            return {
              result: first.rawValue,
              scanType: first.format ?? 'qr_code',
              charSet: 'utf-8',
              errMsg: 'scanCode:ok',
            }
          }
          await new Promise((resolve) => setTimeout(resolve, pollMs))
        }
        return { errMsg: 'scanCode:fail timeout' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { errMsg: `scanCode:fail ${message}` }
      } finally {
        for (const track of stream?.getTracks?.() ?? []) track.stop()
      }
    },
  }
}

function defaultGetUserMedia(): ((constraints: { video: { facingMode?: string } }) => Promise<StreamLike>) | undefined {
  if (typeof navigator === 'undefined') return undefined
  const media = (navigator as unknown as { mediaDevices?: { getUserMedia?: (c: unknown) => Promise<MediaStream> } }).mediaDevices
  const getUserMedia = media?.getUserMedia
  if (!getUserMedia) return undefined
  return (constraints) => getUserMedia.call(media, constraints) as unknown as Promise<StreamLike>
}

function defaultCreateVideo(): (() => VideoLike) | undefined {
  if (typeof document === 'undefined') return undefined
  return () => {
    const video = document.createElement('video')
    video.playsInline = true
    video.muted = true
    return video as unknown as VideoLike
  }
}

function defaultCreateDetector(): (() => DetectorLike) | undefined {
  const Detector = (globalThis as { BarcodeDetector?: new (options?: unknown) => DetectorLike }).BarcodeDetector
  if (!Detector) return undefined
  return () => new Detector({ formats: ['qr_code', 'ean_13', 'code_128'] })
}

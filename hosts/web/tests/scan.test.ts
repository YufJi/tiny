import { describe, expect, test } from 'vitest'
import { createScanHandlers } from '../src/scan'

function createStream() {
  const stopped: number[] = []
  return {
    stopped,
    stream: {
      getTracks: () => [{ stop: () => stopped.push(1) }],
    },
  }
}

describe('scanCode', () => {
  test('returns the first decoded barcode and releases the camera', async () => {
    const { stream, stopped } = createStream()
    const frames: Array<Array<{ rawValue?: string; format?: string }>> = [
      [],
      [{ rawValue: 'https://example.com', format: 'qr_code' }],
    ]
    const handlers = createScanHandlers({
      getUserMedia: async () => stream,
      createVideo: () => ({ srcObject: null, play: () => undefined }),
      createDetector: () => ({ detect: async () => frames.shift() ?? [] }),
      pollMs: 1,
    })
    const result = await handlers['device.scanCode']({ timeout: 5000 })
    expect(result).toEqual({
      result: 'https://example.com',
      scanType: 'qr_code',
      charSet: 'utf-8',
      errMsg: 'scanCode:ok',
    })
    expect(stopped).toHaveLength(1)
  })

  test('times out and still stops the tracks', async () => {
    const { stream, stopped } = createStream()
    const handlers = createScanHandlers({
      getUserMedia: async () => stream,
      createVideo: () => ({ srcObject: null, play: () => undefined }),
      createDetector: () => ({ detect: async () => [] }),
      pollMs: 1,
    })
    const result = await handlers['device.scanCode']({ timeout: 1200 })
    expect(result.errMsg).toBe('scanCode:fail timeout')
    expect(stopped).toHaveLength(1)
  })

  test('fails honestly without a detector or camera', async () => {
    const noDetector = createScanHandlers({
      getUserMedia: async () => ({ getTracks: () => [] }),
      createVideo: () => ({ srcObject: null, play: () => undefined }),
      createDetector: undefined,
    })
    await expect(noDetector['device.scanCode']({})).resolves.toEqual({
      errMsg: 'scanCode:fail barcode detection is not available in this runtime',
    })

    const noCamera = createScanHandlers({
      getUserMedia: undefined,
      createVideo: undefined,
      createDetector: () => ({ detect: async () => [] }),
    })
    await expect(noCamera['device.scanCode']({})).resolves.toEqual({
      errMsg: 'scanCode:fail camera access is not available in this runtime',
    })
  })
})

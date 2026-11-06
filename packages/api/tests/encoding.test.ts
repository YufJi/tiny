import { describe, expect, test } from 'vitest'
import { createApiHost } from '../src'
import type { ApiContext } from '../src'

function createApi() {
  return createApiHost({
    connection: {
      sendDiagnostic: () => undefined,
      call: () => Promise.resolve(undefined),
    },
    apiName: 'wx',
    apiNamespaces: ['wx'],
  } as unknown as ApiContext) as Record<string, (...args: unknown[]) => unknown>
}

function bytes(value: unknown): number[] {
  return [...new Uint8Array(value as ArrayBuffer)]
}

describe('base64 encoding APIs', () => {
  test('base64ToArrayBuffer decodes padded and unpadded input', () => {
    const api = createApi()
    const hello = api.base64ToArrayBuffer('aGVsbG8=')
    expect(hello).toBeInstanceOf(ArrayBuffer)
    expect(new TextDecoder().decode(hello as ArrayBuffer)).toBe('hello')
    expect(bytes(api.base64ToArrayBuffer('aGVsbG8'))).toEqual(bytes(hello))
    expect(new TextDecoder().decode(api.base64ToArrayBuffer('aGVs\nbG8=') as ArrayBuffer)).toBe('hello')
    expect(bytes(api.base64ToArrayBuffer(''))).toEqual([])
  })

  test('base64ToArrayBuffer follows forgiving-base64 rules', () => {
    const api = createApi()
    // Whitespace is ignored and trailing non-zero bits are dropped, matching
    // the browser's `atob`.
    expect(bytes(api.base64ToArrayBuffer(' YQ==\n'))).toEqual([0x61])
    expect(bytes(api.base64ToArrayBuffer('YR'))).toEqual([0x61])
    expect(bytes(api.base64ToArrayBuffer('AB'))).toEqual([0x00])
  })

  test('base64ToArrayBuffer rejects malformed input', () => {
    const api = createApi()
    for (const value of ['A', '!!!!', 'YQ=', 'YQ===', '====', 'aGVsbG8-']) {
      expect(() => api.base64ToArrayBuffer(value)).toThrow(/invalid base64 string/)
    }
    expect(() => api.base64ToArrayBuffer(42)).toThrow(TypeError)
    expect(() => api.base64ToArrayBuffer()).toThrow(TypeError)
  })

  test('arrayBufferToBase64 encodes standard base64 with padding', () => {
    const api = createApi()
    const buffer = (value: number[]) => new Uint8Array(value).buffer
    expect(api.arrayBufferToBase64(buffer([77, 97, 110]))).toBe('TWFu')
    expect(api.arrayBufferToBase64(buffer([77]))).toBe('TQ==')
    expect(api.arrayBufferToBase64(buffer([77, 97]))).toBe('TWE=')
    expect(api.arrayBufferToBase64(buffer([]))).toBe('')
  })

  test('arrayBufferToBase64 rejects non-ArrayBuffer input', () => {
    const api = createApi()
    expect(() => api.arrayBufferToBase64('hello')).toThrow(TypeError)
    expect(() => api.arrayBufferToBase64(new Uint8Array([1, 2]))).toThrow(TypeError)
    expect(() => api.arrayBufferToBase64()).toThrow(TypeError)
  })

  test('round-trips binary data and large buffers', () => {
    const api = createApi()
    const allBytes = Array.from({ length: 256 }, (_, index) => index)
    const encoded = api.arrayBufferToBase64(new Uint8Array(allBytes).buffer)
    expect(encoded).toBe(Buffer.from(allBytes).toString('base64'))
    expect(bytes(api.base64ToArrayBuffer(encoded))).toEqual(allBytes)

    const large = new Uint8Array(200_000)
    for (let index = 0; index < large.length; index++) large[index] = index % 251
    const largeEncoded = api.arrayBufferToBase64(large.buffer)
    expect(largeEncoded).toBe(Buffer.from(large).toString('base64'))
    expect(bytes(api.base64ToArrayBuffer(largeEncoded))).toEqual([...large])
  })

  test('is listed in the installed API table', () => {
    const api = createApi()
    expect(api.canIUse!('base64ToArrayBuffer')).toBe(true)
    expect(api.canIUse!('arrayBufferToBase64')).toBe(true)
  })
})

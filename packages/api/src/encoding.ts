import type { ApiContext, ApiHost } from './context'

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/** `255` marks a non-base64 byte in the 7-bit lookup table. */
const BASE64_CODES = (() => {
  const codes = new Uint8Array(128)
  codes.fill(255)
  for (let index = 0; index < BASE64_ALPHABET.length; index++) {
    codes[BASE64_ALPHABET.charCodeAt(index)] = index
  }
  return codes
})()

/**
 * `wx.base64ToArrayBuffer` / `wx.arrayBufferToBase64`.
 *
 * Both are pure service-realm conversions: no host call, no runtime state, and
 * no dependency on `atob`/`btoa` (JavaScriptCore and test environments do not
 * all expose them). Decoding follows the browser's forgiving-base64 rules:
 * ASCII whitespace is ignored and padding may be omitted.
 */
export function createEncodingApi(_context: ApiContext): ApiHost {
  return {
    base64ToArrayBuffer: (base64: unknown) => {
      if (typeof base64 !== 'string') {
        throw new TypeError(
          'base64ToArrayBuffer:fail parameter error: base64 should be a string',
        )
      }
      return decodeBase64(base64)
    },
    arrayBufferToBase64: (arrayBuffer: unknown) => {
      if (!(arrayBuffer instanceof ArrayBuffer)) {
        throw new TypeError(
          'arrayBufferToBase64:fail parameter error: arrayBuffer should be an ArrayBuffer',
        )
      }
      return encodeBase64(new Uint8Array(arrayBuffer))
    },
  }
}

function decodeBase64(base64: string): ArrayBuffer {
  const cleaned = base64.replace(/[\t\n\f\r ]/g, '')
  if (cleaned.length === 0) return new ArrayBuffer(0)

  let data = cleaned
  if (data.length % 4 === 0) {
    if (data.endsWith('==')) data = data.slice(0, -2)
    else if (data.endsWith('=')) data = data.slice(0, -1)
  }
  if (data.length % 4 === 1) {
    throw new Error('base64ToArrayBuffer:fail invalid base64 string')
  }

  const bytes = new Uint8Array(Math.floor((data.length * 6) / 8))
  let bits = 0
  let value = 0
  let offset = 0
  for (let index = 0; index < data.length; index++) {
    const charCode = data.charCodeAt(index)
    const sextet = charCode < 128 ? BASE64_CODES[charCode]! : 255
    if (sextet === 255) {
      throw new Error('base64ToArrayBuffer:fail invalid base64 string')
    }
    value = (value << 6) | sextet
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes[offset++] = (value >> bits) & 0xff
    }
  }
  return bytes.buffer
}

function encodeBase64(bytes: Uint8Array): string {
  const chunks: string[] = []
  let chunk = ''
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index]!
    const second = index + 1 < bytes.length ? bytes[index + 1]! : undefined
    const third = index + 2 < bytes.length ? bytes[index + 2]! : undefined
    chunk += BASE64_ALPHABET[first >> 2]
    chunk += BASE64_ALPHABET[((first & 0x03) << 4) | ((second ?? 0) >> 4)]
    chunk += second === undefined
      ? '='
      : BASE64_ALPHABET[((second & 0x0f) << 2) | ((third ?? 0) >> 6)]
    chunk += third === undefined ? '=' : BASE64_ALPHABET[third & 0x3f]
    // Keep individual strings small; a single concatenation of a multi-megabyte
    // buffer is much slower in older engines.
    if (chunk.length >= 8192) {
      chunks.push(chunk)
      chunk = ''
    }
  }
  if (chunk.length > 0) chunks.push(chunk)
  return chunks.join('')
}

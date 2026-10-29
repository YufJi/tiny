/**
 * JavaScriptCore host shims for the service (logic) thread.
 *
 * A JSContext has no DOM, no timers, no console, and none of the small web
 * platform helpers the runtime/app code may touch. Everything here is provided
 * by the native host through the `__tiny*` callbacks; this file only adapts the
 * JavaScript surface. Keep this module free of DOM assumptions: it also runs in
 * the `jsc` smoke test and in the browser dev harness.
 */

type HostGlobal = Record<string, any>

function errorText(error: unknown): string {
  if (error instanceof Error) return error.stack || error.message
  return String(error)
}

function reportError(message: string): void {
  const host = globalThis as unknown as HostGlobal
  try {
    host.__tinyError?.(message)
  } catch {
    // The host callback must never make error reporting fail.
  }
}

function formatArg(value: unknown): string {
  if (typeof value === 'string') return value
  if (value instanceof Error) return errorText(value)
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`
  try {
    const serialized = JSON.stringify(value)
    if (serialized !== undefined) return serialized
  } catch {
    // Fall through to String() for cycles and non-JSON values.
  }
  return String(value)
}

function decodeComponent(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

class TinyURLSearchParams {
  private pairs: Array<[string, string]> = []

  constructor(init: string | Record<string, string> | Iterable<[string, string]> = '') {
    if (typeof init === 'string') {
      const source = init.startsWith('?') ? init.slice(1) : init
      if (source.length > 0) {
        for (const part of source.split('&')) {
          if (part.length === 0) continue
          const index = part.indexOf('=')
          const name = index >= 0 ? part.slice(0, index) : part
          const value = index >= 0 ? part.slice(index + 1) : ''
          this.pairs.push([decodeComponent(name), decodeComponent(value)])
        }
      }
      return
    }
    if (init && typeof (init as Iterable<[string, string]>)[Symbol.iterator] === 'function') {
      for (const [name, value] of init as Iterable<[string, string]>) {
        this.pairs.push([String(name), String(value)])
      }
      return
    }
    for (const [name, value] of Object.entries(init as Record<string, string>)) {
      this.pairs.push([String(name), String(value)])
    }
  }

  get size(): number {
    return this.pairs.length
  }

  append(name: unknown, value: unknown): void {
    this.pairs.push([String(name), String(value)])
  }

  delete(name: unknown): void {
    const key = String(name)
    this.pairs = this.pairs.filter(([itemName]) => itemName !== key)
  }

  get(name: unknown): string | null {
    const key = String(name)
    const found = this.pairs.find(([itemName]) => itemName === key)
    return found ? found[1] : null
  }

  getAll(name: unknown): string[] {
    const key = String(name)
    return this.pairs.filter(([itemName]) => itemName === key).map(([, value]) => value)
  }

  has(name: unknown): boolean {
    return this.pairs.some(([itemName]) => itemName === String(name))
  }

  set(name: unknown, value: unknown): void {
    const key = String(name)
    const normalized = String(value)
    const index = this.pairs.findIndex(([itemName]) => itemName === key)
    if (index < 0) {
      this.pairs.push([key, normalized])
      return
    }
    this.pairs[index] = [key, normalized]
    this.pairs = this.pairs.filter(([itemName], itemIndex) => (
      itemIndex === index || itemName !== key
    ))
  }

  sort(): void {
    this.pairs.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
  }

  forEach(callback: (value: string, key: string, params: TinyURLSearchParams) => void, thisArg?: unknown): void {
    for (const [name, value] of this.pairs) {
      callback.call(thisArg, value, name, this)
    }
  }

  *keys(): IterableIterator<string> {
    for (const [name] of this.pairs) yield name
  }

  *values(): IterableIterator<string> {
    for (const [, value] of this.pairs) yield value
  }

  *entries(): IterableIterator<[string, string]> {
    for (const pair of this.pairs) yield [pair[0], pair[1]]
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries()
  }

  toString(): string {
    return this.pairs
      .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
      .join('&')
  }
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function tinyBtoa(input: string): string {
  const source = String(input)
  let output = ''
  for (let index = 0; index < source.length; index += 3) {
    const first = source.charCodeAt(index)
    const second = index + 1 < source.length ? source.charCodeAt(index + 1) : Number.NaN
    const third = index + 2 < source.length ? source.charCodeAt(index + 2) : Number.NaN
    if (first > 255 || second > 255 || third > 255) {
      throw new Error('btoa: the string contains characters outside of the Latin1 range')
    }
    const chunk = (first << 16)
      | ((Number.isNaN(second) ? 0 : second) << 8)
      | (Number.isNaN(third) ? 0 : third)
    output += BASE64_ALPHABET[(chunk >> 18) & 63]
    output += BASE64_ALPHABET[(chunk >> 12) & 63]
    output += Number.isNaN(second) ? '=' : BASE64_ALPHABET[(chunk >> 6) & 63]
    output += Number.isNaN(third) ? '=' : BASE64_ALPHABET[chunk & 63]
  }
  return output
}

function tinyAtob(input: string): string {
  let source = String(input).replace(/[\t\n\f\r ]/g, '')
  if (source.length % 4 === 0) source = source.replace(/={1,2}$/, '')
  if (source.length % 4 === 1) throw new Error('atob: invalid base64 input')
  let output = ''
  let buffer = 0
  let bits = 0
  for (const character of source) {
    const value = BASE64_ALPHABET.indexOf(character)
    if (value < 0) throw new Error('atob: invalid base64 input')
    buffer = (buffer << 6) | value
    bits += 6
    if (bits >= 8) {
      bits -= 8
      output += String.fromCharCode((buffer >> bits) & 255)
    }
  }
  return output
}

class TinyTextEncoder {
  encoding = 'utf-8'

  encode(input = ''): Uint8Array {
    const source = String(input)
    const bytes: number[] = []
    for (const character of source) {
      const codePoint = character.codePointAt(0) ?? 0
      if (codePoint <= 0x7f) {
        bytes.push(codePoint)
      } else if (codePoint <= 0x7ff) {
        bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f))
      } else if (codePoint <= 0xffff) {
        bytes.push(
          0xe0 | (codePoint >> 12),
          0x80 | ((codePoint >> 6) & 0x3f),
          0x80 | (codePoint & 0x3f),
        )
      } else {
        bytes.push(
          0xf0 | (codePoint >> 18),
          0x80 | ((codePoint >> 12) & 0x3f),
          0x80 | ((codePoint >> 6) & 0x3f),
          0x80 | (codePoint & 0x3f),
        )
      }
    }
    return new Uint8Array(bytes)
  }
}

class TinyTextDecoder {
  encoding = 'utf-8'

  decode(input?: ArrayBufferView | ArrayBuffer): string {
    if (!input) return ''
    const bytes = input instanceof Uint8Array
      ? input
      : new Uint8Array(input instanceof ArrayBuffer ? input : input.buffer)
    let output = ''
    let index = 0
    while (index < bytes.length) {
      const first = bytes[index]
      if (first < 0x80) {
        output += String.fromCharCode(first)
        index += 1
        continue
      }
      let codePoint = 0xfffd
      let width = 1
      if ((first & 0xe0) === 0xc0 && index + 1 < bytes.length) {
        codePoint = ((first & 0x1f) << 6) | (bytes[index + 1] & 0x3f)
        width = 2
      } else if ((first & 0xf0) === 0xe0 && index + 2 < bytes.length) {
        codePoint = ((first & 0x0f) << 12)
          | ((bytes[index + 1] & 0x3f) << 6)
          | (bytes[index + 2] & 0x3f)
        width = 3
      } else if ((first & 0xf8) === 0xf0 && index + 3 < bytes.length) {
        codePoint = ((first & 0x07) << 18)
          | ((bytes[index + 1] & 0x3f) << 12)
          | ((bytes[index + 2] & 0x3f) << 6)
          | (bytes[index + 3] & 0x3f)
        width = 4
      }
      output += String.fromCodePoint(codePoint)
      index += width
    }
    return output
  }
}

export function installHostShims(): void {
  const host = globalThis as unknown as HostGlobal
  host.global = host.global ?? host

  if (typeof host.queueMicrotask !== 'function') {
    host.queueMicrotask = (callback: () => void) => {
      Promise.resolve()
        .then(callback)
        .catch((error) => reportError(`queueMicrotask: ${errorText(error)}`))
    }
  }

  if (typeof host.console !== 'object' || host.console === null) {
    const emit = (level: string) => (...args: unknown[]) => {
      try {
        host.__tinyLog?.(level, args.map(formatArg).join(' '))
      } catch {
        // Logging is best effort.
      }
    }
    host.console = {
      log: emit('log'),
      info: emit('info'),
      warn: emit('warn'),
      error: emit('error'),
      debug: emit('debug'),
      trace: emit('trace'),
    }
  }

  const timers = new Map<number, {
    callback: (...args: unknown[]) => void
    args: unknown[]
    repeat: boolean
  }>()
  let nextTimerId = 1

  const schedule = (callback: unknown, delay: unknown, repeat: boolean, args: unknown[]): number => {
    if (typeof callback !== 'function') {
      throw new TypeError(`${repeat ? 'setInterval' : 'setTimeout'} callback must be a function`)
    }
    if (typeof host.__tinySchedule !== 'function') {
      throw new Error('Timers are not available in this JavaScriptCore host')
    }
    const id = nextTimerId
    nextTimerId += 1
    timers.set(id, {
      callback: callback as (...timerArgs: unknown[]) => void,
      args,
      repeat,
    })
    host.__tinySchedule(id, Math.max(0, Number(delay) || 0), repeat)
    return id
  }

  if (typeof host.setTimeout !== 'function') {
    host.setTimeout = (callback: unknown, delay?: unknown, ...args: unknown[]) => (
      schedule(callback, delay, false, args)
    )
  }
  if (typeof host.setInterval !== 'function') {
    host.setInterval = (callback: unknown, delay?: unknown, ...args: unknown[]) => (
      schedule(callback, delay, true, args)
    )
  }
  if (typeof host.clearTimeout !== 'function') {
    host.clearTimeout = (id: unknown) => {
      const normalized = Number(id)
      timers.delete(normalized)
      host.__tinyCancelTimer?.(normalized)
    }
  }
  if (typeof host.clearInterval !== 'function') {
    host.clearInterval = host.clearTimeout
  }

  host.__tinyFireTimer = (rawId: unknown) => {
    const id = Number(rawId)
    const timer = timers.get(id)
    if (!timer) return
    if (!timer.repeat) timers.delete(id)
    try {
      timer.callback(...timer.args)
    } catch (error) {
      reportError(`Timer callback: ${errorText(error)}`)
    }
  }

  if (typeof host.requestAnimationFrame !== 'function') {
    host.requestAnimationFrame = (callback: (time: number) => void) => (
      host.setTimeout(() => callback(Date.now()), 16)
    )
  }
  if (typeof host.cancelAnimationFrame !== 'function') {
    host.cancelAnimationFrame = (id: number) => host.clearTimeout(id)
  }

  if (typeof host.performance !== 'object' || host.performance === null) {
    host.performance = {
      now: () => Date.now(),
      timeOrigin: Date.now(),
      mark() {},
      measure() {},
      clearMarks() {},
      clearMeasures() {},
      getEntries: () => [],
      getEntriesByName: () => [],
      getEntriesByType: () => [],
    }
  }

  if (typeof host.URLSearchParams !== 'function') {
    host.URLSearchParams = TinyURLSearchParams
  }
  if (typeof host.TextEncoder !== 'function') {
    host.TextEncoder = TinyTextEncoder
  }
  if (typeof host.TextDecoder !== 'function') {
    host.TextDecoder = TinyTextDecoder
  }
  if (typeof host.atob !== 'function') {
    host.atob = tinyAtob
  }
  if (typeof host.btoa !== 'function') {
    host.btoa = tinyBtoa
  }
  if (typeof host.structuredClone !== 'function') {
    host.structuredClone = (value: unknown) => {
      if (value === undefined) return undefined
      return JSON.parse(JSON.stringify(value))
    }
  }
}

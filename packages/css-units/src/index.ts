/** The rpx-to-vw ratio is part of the public artifact contract. */
export const RPX_RATIO = 750

/**
 * Convert `rpx` dimension values in a CSS string to `vw`.
 *
 * This is the single implementation shared by the stylesheet compiler, the
 * template's inline-style helper and the render-side WXS `setStyle`
 * descriptor. It is tokenizer-aware (P0-6): quoted strings, `url(...)` and
 * comments keep their text untouched, and only a real numeric token followed by
 * the `rpx` unit is converted.
 *
 * The function body is embedded verbatim into compiled WXML (`toString()`), so
 * it must stay self-contained: no outer constants or helpers.
 */
export function convertRpx(input: string): string {
  // Generated template code may call this with an absent style expression;
  // preserve the previous "nothing to convert" behaviour instead of throwing.
  if (typeof input !== 'string') return input
  const RATIO = 750
  const isIdent = (ch: string | undefined): boolean => {
    if (!ch) return false
    return (ch >= 'a' && ch <= 'z')
      || (ch >= 'A' && ch <= 'Z')
      || (ch >= '0' && ch <= '9')
      || ch === '_' || ch === '-' || ch === '.' || ch === '#'
  }
  const readQuoted = (text: string, start: number): number => {
    const quote = text[start]!
    let i = start + 1
    while (i < text.length) {
      const ch = text[i]!
      if (ch === '\\') { i += 2; continue }
      if (ch === quote) return i + 1
      i += 1
    }
    return i
  }
  const readUrl = (text: string, start: number): number => {
    // `url(` was matched case-insensitively at `start`.
    let i = start + 4
    let depth = 1
    while (i < text.length) {
      const ch = text[i]!
      if (ch === '"' || ch === "'") { i = readQuoted(text, i); continue }
      if (ch === '\\') { i += 2; continue }
      if (ch === '(') depth += 1
      else if (ch === ')') {
        depth -= 1
        if (depth === 0) return i + 1
      }
      i += 1
    }
    return i
  }
  const readNumber = (text: string, start: number): { value: number; end: number } | null => {
    let i = start
    let sign = 1
    if (text[i] === '+' || text[i] === '-') {
      if (text[i] === '-') sign = -1
      i += 1
    }
    const numberStart = i
    let digits = 0
    while (i < text.length && text[i]! >= '0' && text[i]! <= '9') { i += 1; digits += 1 }
    if (text[i] === '.') {
      i += 1
      while (i < text.length && text[i]! >= '0' && text[i]! <= '9') { i += 1; digits += 1 }
    }
    if (digits === 0) return null
    const value = sign * Number.parseFloat(text.slice(numberStart, i))
    return Number.isFinite(value) ? { value, end: i } : null
  }
  const format = (value: number): string => {
    const vw = (value * 100) / RATIO
    return `${Number.parseFloat(vw.toPrecision(6))}vw`
  }

  let output = ''
  let i = 0
  while (i < input.length) {
    const ch = input[i]!
    if (ch === '"' || ch === "'") {
      const end = readQuoted(input, i)
      output += input.slice(i, end)
      i = end
      continue
    }
    if (ch === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2)
      const stop = end < 0 ? input.length : end + 2
      output += input.slice(i, stop)
      i = stop
      continue
    }
    if (
      (ch === 'u' || ch === 'U')
      && input.slice(i, i + 3).toLowerCase() === 'url'
      && input[i + 3] === '('
      && !isIdent(input[i - 1])
    ) {
      const end = readUrl(input, i)
      output += input.slice(i, end)
      i = end
      continue
    }
    const canStartNumber = !isIdent(input[i - 1])
    if (canStartNumber && (ch >= '0' && ch <= '9' || ch === '.' || ch === '+' || ch === '-')) {
      const number = readNumber(input, i)
      if (number && input.slice(number.end, number.end + 3) === 'rpx') {
        const after = input[number.end + 3]
        if (!isIdent(after)) {
          output += format(number.value)
          i = number.end + 3
          continue
        }
      }
    }
    output += ch
    i += 1
  }
  return output
}

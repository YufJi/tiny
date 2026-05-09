// Escape utilities — mirrors src/escape.rs

/** Escape HTML body text (replaces <, ", &). */
export function escapeHtmlBody(s: string): string {
  return s.replace(/[<"&]/g, (ch) => {
    if (ch === '<') return '&lt;'
    if (ch === '"') return '&quot;'
    return '&amp;'
  })
}

/** Escape HTML attribute value (replaces ", &). */
export function escapeHtmlQuote(s: string): string {
  return s.replace(/["&]/g, (ch) => {
    if (ch === '"') return '&quot;'
    return '&amp;'
  })
}

/**
 * Generate a JS literal string with the given quote character.
 * Mirrors gen_lit_str_with_quotes() in escape.rs exactly.
 */
export function genLitStrWithQuotes(s: string, useSingleQuote: boolean): string {
  const quoteChar = useSingleQuote ? "'" : '"'
  const quoteCode = quoteChar.charCodeAt(0)
  let ret = quoteChar
  for (let i = 0; i < s.length; ) {
    const cp = s.codePointAt(i)!
    const ch = String.fromCodePoint(cp)
    const charLen = cp > 0xffff ? 2 : 1
    i += charLen
    if (ch === '\\') {
      ret += '\\\\'
    } else if (ch === '\n') {
      ret += '\\n'
    } else if (ch === '\r') {
      ret += '\\r'
    } else if (ch === '\t') {
      ret += '\\t'
    } else if (ch === '\0') {
      ret += '\\0'
    } else if (cp <= 31) {
      ret += '\\x' + cp.toString(16).toUpperCase().padStart(2, '0')
    } else if (cp === quoteCode) {
      ret += '\\' + ch
    } else {
      ret += ch
    }
  }
  ret += quoteChar
  return ret
}

/** Generate a double-quoted JS literal string. Mirrors gen_lit_str(). */
export function genLitStr(s: string): string {
  return genLitStrWithQuotes(s, false)
}

/** Convert dash-case to camelCase. Mirrors dash_to_camel(). */
export function dashToCamel(s: string): string {
  let result = ''
  let nextUpper = false
  for (const ch of s) {
    if (ch === '-') {
      nextUpper = true
    } else if (nextUpper) {
      nextUpper = false
      result += ch.toUpperCase()
    } else {
      result += ch
    }
  }
  return result
}

/** Convert camelCase to dash-case. Mirrors camel_to_dash(). */
export function camelToDash(s: string): string {
  let result = ''
  for (const ch of s) {
    if (ch >= 'A' && ch <= 'Z') {
      result += '-' + ch.toLowerCase()
    } else {
      result += ch
    }
  }
  return result
}

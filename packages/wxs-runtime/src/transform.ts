// WXS value semantics and source compatibility.
//
// WXS reports type names through .constructor:
//   [].constructor === 'Array'
//   ({}).constructor === 'Object'
// WXS runs in a host JS realm where those properties are the intrinsic
// constructors, so reads are rewritten to `__wxs.ctor(...)`. The scanner skips
// strings and comments so only executable code is changed.

export function wxsCtor(value: unknown): string {
  if (Array.isArray(value)) return 'Array'
  if (value === null) return 'Null'
  if (typeof value === 'object') return 'Object'
  if (typeof value === 'function') return 'Function'
  if (typeof value === 'string') return 'String'
  if (typeof value === 'number') return 'Number'
  if (typeof value === 'boolean') return 'Boolean'
  return 'Undefined'
}

const CONSTRUCTOR_READ =
  /((?:[A-Za-z_$][\w$]*|this|\[\]|\{[^}]*\}|\([^()]*\))(?:\s*(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\]))*)\.constructor\b(?!\s*=(?!=))/g

function rewriteConstructors(chunk: string): string {
  return chunk.replace(CONSTRUCTOR_READ, '__wxs.ctor($1)')
}

export function transformWxsSource(source: string): string {
  let out = ''
  let start = 0
  let index = 0
  const flush = (end: number): void => {
    if (end > start) out += rewriteConstructors(source.slice(start, end))
  }

  while (index < source.length) {
    const char = source[index]
    if (char === '"' || char === "'" || char === '`') {
      flush(index)
      const quote = char
      out += char
      index += 1
      while (index < source.length) {
        const current = source[index]
        out += current
        if (current === '\\') {
          index += 1
          if (index < source.length) out += source[index]
          index += 1
          continue
        }
        index += 1
        if (current === quote) break
      }
      start = index
      continue
    }
    if (char === '/' && source[index + 1] === '/') {
      flush(index)
      let lineEnd = source.indexOf('\n', index)
      if (lineEnd < 0) lineEnd = source.length
      out += source.slice(index, lineEnd)
      index = lineEnd
      start = index
      continue
    }
    if (char === '/' && source[index + 1] === '*') {
      flush(index)
      let blockEnd = source.indexOf('*/', index + 2)
      if (blockEnd < 0) blockEnd = source.length - 2
      blockEnd += 2
      out += source.slice(index, blockEnd)
      index = blockEnd
      start = index
      continue
    }
    index += 1
  }
  flush(source.length)
  return out
}

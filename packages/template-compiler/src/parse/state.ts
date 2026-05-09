// ParseState — mirrors src/parse/mod.rs ParseState<'s>
//
// Maintains a pointer into the source string plus line/utf16_col tracking.
// All "skip" operations advance the cursor and update position metadata.

import { ParseError, ParseErrorKind, Position, Range, positionDefault, range } from '../types'

export { ParseErrorKind, ParseErrorLevel } from '../types'

// ---------------------------------------------------------------------------
// Template whitespace
// ---------------------------------------------------------------------------
export function isTemplateWhitespace(ch: number): boolean {
  // ' ' | '\t' | '\n' | '\v' | '\f' | '\r'
  return ch === 0x20 || (ch >= 0x09 && ch <= 0x0d)
}

// ---------------------------------------------------------------------------
// ParseState
// ---------------------------------------------------------------------------

/** A function that tries to skip whitespace and returns whether it consumed any. */
type AutoSkipFn = (ps: ParseState) => Range<Position> | null

export class ParseState {
  readonly path: string
  private readonly wholeStr: string
  private curIndex: number = 0
  private line: number
  private utf16Col: number
  private autoSkipWhitespace: AutoSkipFn | null = null
  private _warnings: ParseError[] = []

  constructor(path: string, content: string, positionOffset: Position = positionDefault()) {
    this.path = path
    // Rust truncates at u32::MAX - 1; we omit that guard (JS strings can't be that long)
    this.wholeStr = content
    this.line = positionOffset.line
    this.utf16Col = positionOffset.utf16Col
  }

  // -------------------------------------------------------------------------
  // Warnings
  // -------------------------------------------------------------------------

  addWarning(kind: ParseErrorKind, location: Range<Position>): void {
    this._warnings.push({ path: this.path, kind, location })
  }

  addWarningAtCurrentPosition(kind: ParseErrorKind): void {
    const pos = this.position()
    this.addWarning(kind, range(pos, pos))
  }

  warnings(): readonly ParseError[] {
    return this._warnings
  }

  takeWarnings(): ParseError[] {
    const w = this._warnings
    this._warnings = []
    return w
  }

  // -------------------------------------------------------------------------
  // Cursor helpers
  // -------------------------------------------------------------------------

  private curStr(): string {
    return this.wholeStr.slice(this.curIndex)
  }

  ended(): boolean {
    return this.curIndex >= this.wholeStr.length
  }

  position(): Position {
    return { line: this.line, utf16Col: this.utf16Col }
  }

  curByteIndex(): number {
    return this.curIndex
  }

  codeSlice(start: number, end: number): string {
    return this.wholeStr.slice(start, end)
  }

  // -------------------------------------------------------------------------
  // Skip / advance
  // -------------------------------------------------------------------------

  /**
   * Advance the cursor by `count` bytes of the underlying UTF-8 string,
   * updating line/utf16Col tracking.
   *
   * NOTE: JavaScript strings are UTF-16 internally, but the Rust source
   * tracks UTF-8 byte offsets for cursor and UTF-16 code units for columns.
   * We replicate the same tracking: cursor advances by JavaScript char count
   * (UTF-16 code units), and utf16Col counts UTF-16 code units on the
   * current line.
   */
  skipChars(count: number): void {
    // In the JS port we work with JS string indices (UTF-16 code units)
    // rather than UTF-8 byte counts. The variable is renamed `count` but
    // semantically matches the Rust `skip_bytes(count)` API.
    const slice = this.wholeStr.slice(this.curIndex, this.curIndex + count)
    this.curIndex += count
    // Track lines and column
    const lastNl = slice.lastIndexOf('\n')
    if (lastNl !== -1) {
      // Count how many newlines
      let nl = 0
      for (let i = 0; i < slice.length; i++) {
        if (slice.charCodeAt(i) === 0x0a) nl++
      }
      this.line += nl
      // Column resets after the last newline
      this.utf16Col = slice.length - lastNl - 1
    } else {
      this.utf16Col += count
    }
  }

  skipUntilBefore(until: string): string | null {
    const s = this.curStr()
    const idx = s.indexOf(until)
    if (idx !== -1) {
      const ret = s.slice(0, idx)
      this.skipChars(idx)
      return ret
    } else {
      this.skipChars(s.length)
      return null
    }
  }

  skipUntilAfter(until: string): string | null {
    const ret = this.skipUntilBefore(until)
    if (ret !== null) {
      this.skipChars(until.length)
    }
    return ret
  }

  // -------------------------------------------------------------------------
  // Whitespace / comment skipping
  // -------------------------------------------------------------------------

  skipWhitespace(): Range<Position> | null {
    let startPos: Position | null = null
    const str = this.wholeStr
    let i = this.curIndex
    while (i < str.length) {
      const ch = str.charCodeAt(i)
      if (!isTemplateWhitespace(ch)) break
      if (startPos === null) startPos = this.position()
      if (ch === 0x0a /* \n */) {
        this.line++
        this.utf16Col = 0
      } else {
        this.utf16Col++
      }
      i++
    }
    this.curIndex = i
    return startPos !== null ? range(startPos, this.position()) : null
  }

  skipWhitespaceWithJsComments(): Range<Position> | null {
    let startPos: Position | null = null
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const ws = this.skipWhitespace()
      if (ws !== null) {
        if (startPos === null) startPos = ws.start
        continue
      }
      if (this.curStr().startsWith('/*')) {
        if (startPos === null) startPos = this.position()
        this.skipChars(2)
        this.skipUntilAfter('*/')
        continue
      }
      break
    }
    return startPos !== null ? range(startPos, this.position()) : null
  }

  // -------------------------------------------------------------------------
  // Peek helpers
  // -------------------------------------------------------------------------

  private doAutoSkip(): void {
    if (this.autoSkipWhitespace !== null) {
      this.autoSkipWhitespace(this)
    }
  }

  peekStr(s: string): boolean {
    this.doAutoSkip()
    return this.wholeStr.startsWith(s, this.curIndex)
  }

  peek(offset: number = 0): string | null {
    this.doAutoSkip()
    const s = this.curStr()
    let i = 0
    let count = 0
    while (i < s.length) {
      const cp = s.codePointAt(i)!
      if (count === offset) return String.fromCodePoint(cp)
      count++
      i += cp > 0xffff ? 2 : 1
    }
    return null
  }

  peekN(n: number): string[] | null {
    this.doAutoSkip()
    const result: string[] = []
    let i = this.curIndex
    const str = this.wholeStr
    for (let k = 0; k < n; k++) {
      if (i >= str.length) return null
      const cp = str.codePointAt(i)!
      result.push(String.fromCodePoint(cp))
      i += cp > 0xffff ? 2 : 1
    }
    return result
  }

  // -------------------------------------------------------------------------
  // Consume helpers
  // -------------------------------------------------------------------------

  consumeStr(s: string): Range<Position> | null {
    return this.consumeStrExceptFollowed(s, [])
  }

  consumeStrExceptFollowed(s: string, excepts: string[]): Range<Position> | null {
    if (!this.peekStr(s)) return null
    const followed = this.wholeStr.slice(this.curIndex + s.length)
    for (const ex of excepts) {
      if (followed.startsWith(ex)) return null
    }
    const start = this.position()
    this.skipChars(s.length)
    return range(start, this.position())
  }

  consumeStrExceptFollowedChar(s: string, rejectFollowed: (ch: string) => boolean): Range<Position> | null {
    if (!this.peekStr(s)) return null
    const followed = this.wholeStr.slice(this.curIndex + s.length)
    if (followed.length > 0) {
      const cp = followed.codePointAt(0)!
      const ch = String.fromCodePoint(cp)
      if (rejectFollowed(ch)) return null
    }
    const start = this.position()
    this.skipChars(s.length)
    return range(start, this.position())
  }

  /** Consume and return the next codepoint as a string, or '' if at end. */
  nextCharAsStr(): string {
    const s = this.curStr()
    if (s.length === 0) return ''
    const cp = s.codePointAt(0)!
    const len = cp > 0xffff ? 2 : 1
    const ret = s.slice(0, len)
    this.skipChars(len)
    return ret
  }

  /** Consume the next codepoint (with auto-skip-whitespace), returns null at end. */
  next(): string | null {
    this.doAutoSkip()
    const s = this.curStr()
    if (s.length === 0) return null
    const cp = s.codePointAt(0)!
    const ch = String.fromCodePoint(cp)
    const len = cp > 0xffff ? 2 : 1
    this.curIndex += len
    if (ch === '\n') {
      this.line++
      this.utf16Col = 0
    } else {
      this.utf16Col += len // UTF-16 units
    }
    return ch
  }

  // -------------------------------------------------------------------------
  // Auto-skip-whitespace context
  // -------------------------------------------------------------------------

  parseOnAutoWhitespace<T>(whitespaceF: AutoSkipFn, f: (ps: ParseState) => T): T {
    const prev = this.autoSkipWhitespace
    this.autoSkipWhitespace = whitespaceF
    const ret = f(this)
    this.autoSkipWhitespace = prev
    return ret
  }

  parseOffAutoWhitespace<T>(f: (ps: ParseState) => T): T {
    const prev = this.autoSkipWhitespace
    this.autoSkipWhitespace = null
    const ret = f(this)
    this.autoSkipWhitespace = prev
    return ret
  }

  // -------------------------------------------------------------------------
  // Backtracking (try_parse)
  // -------------------------------------------------------------------------

  tryParse<T>(f: (ps: ParseState) => T | null): T | null {
    const savedIndex = this.curIndex
    const savedLine = this.line
    const savedCol = this.utf16Col
    const ret = f(this)
    if (ret === null) {
      this.curIndex = savedIndex
      this.line = savedLine
      this.utf16Col = savedCol
    }
    return ret
  }
}

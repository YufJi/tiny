// Expression AST types and parser — mirrors src/parse/expr.rs

import { BindingMapCollector, BindingMapKeys } from '../binding_map'
import { ParseErrorKind, Position, Range, range } from '../types'
import { ParseState } from './state'

// ---------------------------------------------------------------------------
// AST node types
// ---------------------------------------------------------------------------

export type Expression =
  | { kind: 'ScopeRef'; index: number; location: Range<Position> }
  | { kind: 'DataField'; name: string; location: Range<Position> }
  | { kind: 'ToStringWithoutUndefined'; value: Expression; location: Range<Position> }
  | { kind: 'LitUndefined'; location: Range<Position> }
  | { kind: 'LitNull'; location: Range<Position> }
  | { kind: 'LitStr'; value: string; location: Range<Position> }
  | { kind: 'LitInt'; value: number; location: Range<Position> }
  | { kind: 'LitFloat'; value: number; location: Range<Position> }
  | { kind: 'LitBool'; value: boolean; location: Range<Position> }
  | { kind: 'LitObj'; fields: ObjectFieldKind[]; braceLocation: [Range<Position>, Range<Position>] }
  | { kind: 'LitArr'; fields: ArrayFieldKind[]; bracketLocation: [Range<Position>, Range<Position>] }
  | { kind: 'StaticMember'; obj: Expression; fieldName: string; dotLocation: Range<Position>; fieldLocation: Range<Position> }
  | { kind: 'DynamicMember'; obj: Expression; fieldName: Expression; bracketLocation: [Range<Position>, Range<Position>] }
  | { kind: 'FuncCall'; func: Expression; args: Expression[]; parenLocation: [Range<Position>, Range<Position>] }
  | { kind: 'Reverse'; value: Expression; location: Range<Position> }
  | { kind: 'BitReverse'; value: Expression; location: Range<Position> }
  | { kind: 'Positive'; value: Expression; location: Range<Position> }
  | { kind: 'Negative'; value: Expression; location: Range<Position> }
  | { kind: 'TypeOf'; value: Expression; location: Range<Position> }
  | { kind: 'Void'; value: Expression; location: Range<Position> }
  | { kind: 'Multiply'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Divide'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Remainer'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Plus'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Minus'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'LeftShift'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'RightShift'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'UnsignedRightShift'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Lt'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Gt'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Lte'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Gte'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'InstanceOf'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Eq'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'Ne'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'EqFull'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'NeFull'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'BitAnd'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'BitXor'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'BitOr'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'LogicAnd'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'LogicOr'; left: Expression; right: Expression; location: Range<Position> }
  | { kind: 'NullishCoalescing'; left: Expression; right: Expression; location: Range<Position> }
  | {
      kind: 'Cond'
      cond: Expression
      trueBr: Expression
      falseBr: Expression
      questionLocation: Range<Position>
      colonLocation: Range<Position>
    }

export type ObjectFieldKind =
  | {
      kind: 'Named'
      name: string
      location: Range<Position>
      colonLocation: Range<Position> | null
      value: Expression
    }
  | { kind: 'Spread'; location: Range<Position>; value: Expression }

export type ArrayFieldKind =
  | { kind: 'Normal'; value: Expression }
  | { kind: 'Spread'; location: Range<Position>; value: Expression }
  | { kind: 'EmptySlot' }

// ---------------------------------------------------------------------------
// Location helpers
// ---------------------------------------------------------------------------

export function exprLocationStart(e: Expression): Position {
  switch (e.kind) {
    case 'ScopeRef':
    case 'DataField':
    case 'ToStringWithoutUndefined':
    case 'LitUndefined':
    case 'LitNull':
    case 'LitStr':
    case 'LitInt':
    case 'LitFloat':
    case 'LitBool':
      return e.location.start
    case 'LitObj':
      return e.braceLocation[0].start
    case 'LitArr':
      return e.bracketLocation[0].start
    case 'StaticMember':
    case 'DynamicMember':
    case 'FuncCall':
      return exprLocationStart(e.kind === 'StaticMember' || e.kind === 'DynamicMember' ? e.obj : e.func)
    case 'Reverse':
    case 'BitReverse':
    case 'Positive':
    case 'Negative':
    case 'TypeOf':
    case 'Void':
      return e.location.start
    case 'Cond':
      return exprLocationStart(e.cond)
    default:
      return (e as { left: Expression; location: Range<Position> }).left !== undefined
        ? exprLocationStart((e as { left: Expression }).left)
        : (e as { location: Range<Position> }).location.start
  }
}

export function exprLocationEnd(e: Expression): Position {
  switch (e.kind) {
    case 'ScopeRef':
    case 'DataField':
    case 'ToStringWithoutUndefined':
    case 'LitUndefined':
    case 'LitNull':
    case 'LitStr':
    case 'LitInt':
    case 'LitFloat':
    case 'LitBool':
      return e.location.end
    case 'LitObj':
      return e.braceLocation[1].end
    case 'LitArr':
      return e.bracketLocation[1].end
    case 'StaticMember':
      return e.fieldLocation.end
    case 'DynamicMember':
      return e.bracketLocation[1].end
    case 'FuncCall':
      return e.parenLocation[1].end
    case 'Reverse':
    case 'BitReverse':
    case 'Positive':
    case 'Negative':
    case 'TypeOf':
    case 'Void':
      return exprLocationEnd(e.value)
    case 'Cond':
      return exprLocationEnd(e.falseBr)
    default: {
      const be = e as { right?: Expression; location: Range<Position> }
      return be.right !== undefined ? exprLocationEnd(be.right) : be.location.end
    }
  }
}

export function exprLocation(e: Expression): Range<Position> {
  return range(exprLocationStart(e), exprLocationEnd(e))
}

// ---------------------------------------------------------------------------
// Sub-expression iteration
// ---------------------------------------------------------------------------

export function* subExpressions(e: Expression): Generator<Expression> {
  switch (e.kind) {
    case 'ScopeRef':
    case 'DataField':
    case 'LitUndefined':
    case 'LitNull':
    case 'LitStr':
    case 'LitInt':
    case 'LitFloat':
    case 'LitBool':
      break
    case 'ToStringWithoutUndefined':
      yield e.value
      break
    case 'LitObj':
      for (const f of e.fields) {
        if (f.kind === 'Named' || f.kind === 'Spread') yield f.value
      }
      break
    case 'LitArr':
      for (const f of e.fields) {
        if (f.kind !== 'EmptySlot') yield f.value
      }
      break
    case 'StaticMember':
      yield e.obj
      break
    case 'DynamicMember':
      yield e.obj
      yield e.fieldName
      break
    case 'FuncCall':
      yield e.func
      for (const a of e.args) yield a
      break
    case 'Reverse':
    case 'BitReverse':
    case 'Positive':
    case 'Negative':
    case 'TypeOf':
    case 'Void':
      yield e.value
      break
    case 'Cond':
      yield e.cond
      yield e.trueBr
      yield e.falseBr
      break
    default: {
      const be = e as { left: Expression; right: Expression }
      yield be.left
      yield be.right
    }
  }
}

/** Mutably iterate over direct sub-expressions. Callback receives the current expr and a setter. */
export function forEachSubExprMut(
  e: Expression,
  cb: (sub: Expression, set: (next: Expression) => void) => void,
): void {
  switch (e.kind) {
    case 'ScopeRef':
    case 'DataField':
    case 'LitUndefined':
    case 'LitNull':
    case 'LitStr':
    case 'LitInt':
    case 'LitFloat':
    case 'LitBool':
      break
    case 'ToStringWithoutUndefined':
      cb(e.value, (v) => { (e as { value: Expression }).value = v })
      break
    case 'LitObj':
      for (let i = 0; i < e.fields.length; i++) {
        const f = e.fields[i]!
        if (f.kind === 'Named') {
          const fi = i
          cb(f.value, (v) => { (e.fields[fi] as { value: Expression }).value = v })
        } else if (f.kind === 'Spread') {
          const fi = i
          cb(f.value, (v) => { (e.fields[fi] as { value: Expression }).value = v })
        }
      }
      break
    case 'LitArr':
      for (let i = 0; i < e.fields.length; i++) {
        const f = e.fields[i]!
        if (f.kind !== 'EmptySlot') {
          const fi = i
          cb(f.value, (v) => { (e.fields[fi] as { value: Expression }).value = v })
        }
      }
      break
    case 'StaticMember':
      cb(e.obj, (v) => { (e as { obj: Expression }).obj = v })
      break
    case 'DynamicMember':
      cb(e.obj, (v) => { (e as { obj: Expression }).obj = v })
      cb(e.fieldName, (v) => { (e as { fieldName: Expression }).fieldName = v })
      break
    case 'FuncCall':
      cb(e.func, (v) => { (e as { func: Expression }).func = v })
      for (let i = 0; i < e.args.length; i++) {
        const ai = i
        cb(e.args[i]!, (v) => { e.args[ai] = v })
      }
      break
    case 'Reverse':
    case 'BitReverse':
    case 'Positive':
    case 'Negative':
    case 'TypeOf':
    case 'Void':
      cb(e.value, (v) => { (e as { value: Expression }).value = v })
      break
    case 'Cond':
      cb(e.cond, (v) => { (e as { cond: Expression }).cond = v })
      cb(e.trueBr, (v) => { (e as { trueBr: Expression }).trueBr = v })
      cb(e.falseBr, (v) => { (e as { falseBr: Expression }).falseBr = v })
      break
    default: {
      const be = e as { left: Expression; right: Expression }
      cb(be.left, (v) => { be.left = v })
      cb(be.right, (v) => { be.right = v })
    }
  }
}

// ---------------------------------------------------------------------------
// Scope analysis helpers
// ---------------------------------------------------------------------------

export function convertScopes(
  expr: Expression,
  scopes: Array<[string, Range<Position>]>,
): Expression {
  if (expr.kind === 'DataField') {
    const found = [...scopes].reverse().findIndex(([n]) => n === expr.name)
    if (found !== -1) {
      const index = scopes.length - 1 - found
      return { kind: 'ScopeRef', index, location: expr.location }
    }
    return expr
  }
  forEachSubExprMut(expr, (sub, set) => {
    set(convertScopes(sub, scopes))
  })
  return expr
}

export function validateScopes(
  expr: Expression,
  ps: ParseState,
  scopes: Array<[string, Range<Position>]>,
  limit: number,
): boolean {
  if (expr.kind === 'DataField') {
    const idx = [...scopes].reverse().findIndex(([n]) => n === expr.name)
    if (idx !== -1) {
      const realIdx = scopes.length - 1 - idx
      if (realIdx >= limit) {
        ps.addWarning(ParseErrorKind.UninitializedScope, expr.location)
        return false
      }
      return true
    }
    return true
  }
  for (const sub of subExpressions(expr)) {
    if (!validateScopes(sub, ps, scopes, limit)) return false
  }
  return true
}

export function collectBindingMapKeys(
  expr: Expression,
  bmc: BindingMapCollector,
  bmk: BindingMapKeys,
): void {
  if (expr.kind === 'DataField') {
    const index = bmc.addField(expr.name)
    if (index !== null) bmk.add(expr.name, index)
  }
  for (const sub of subExpressions(expr)) {
    collectBindingMapKeys(sub, bmc, bmk)
  }
}

export function disableBindingMapKeys(expr: Expression, bmc: BindingMapCollector): void {
  if (expr.kind === 'DataField') {
    bmc.disableField(expr.name)
  }
  for (const sub of subExpressions(expr)) {
    disableBindingMapKeys(sub, bmc)
  }
}

// ---------------------------------------------------------------------------
// Static / dynamic part split (mirrors for_each_static_or_dynamic_part)
// ---------------------------------------------------------------------------

export function forEachStaticOrDynamicPart(
  expr: Expression,
  cb: (part: Expression, location: Range<Position>) => void,
): void {
  switch (expr.kind) {
    case 'LitStr':
      cb(expr, expr.location)
      break
    case 'ToStringWithoutUndefined':
      cb(expr.value, expr.location)
      break
    case 'Plus': {
      const leftIsMixed =
        expr.left.kind === 'ToStringWithoutUndefined' || expr.left.kind === 'LitStr'
      const rightIsMixed =
        expr.right.kind === 'ToStringWithoutUndefined' || expr.right.kind === 'LitStr'
      if (leftIsMixed || rightIsMixed) {
        forEachStaticOrDynamicPart(expr.left, cb)
        forEachStaticOrDynamicPart(expr.right, cb)
      } else {
        cb(expr, exprLocation(expr))
      }
      break
    }
    default:
      cb(expr, exprLocation(expr))
  }
}

export function hasMultipleStaticOrDynamicParts(expr: Expression): boolean {
  if (expr.kind === 'Plus') {
    const l = expr.left
    const r = expr.right
    return (
      l.kind === 'ToStringWithoutUndefined' ||
      l.kind === 'LitStr' ||
      r.kind === 'ToStringWithoutUndefined' ||
      r.kind === 'LitStr'
    )
  }
  return false
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function isIdentChar(ch: string): boolean {
  return (
    ch === '_' || ch === '$' ||
    (ch >= 'a' && ch <= 'z') ||
    (ch >= 'A' && ch <= 'Z') ||
    (ch >= '0' && ch <= '9')
  )
}

function isIdentStartChar(ch: string): boolean {
  return ch === '_' || ch === '$' || (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

function tryParseFieldName(ps: ParseState): [string, Range<Position>] | null {
  const peek = ps.peek()
  if (peek === null || !isIdentStartChar(peek)) return null
  return ps.parseOffAutoWhitespace((ps) => {
    const pos = ps.position()
    let name = ''
    while (true) {
      const ch = ps.next()
      if (ch === null) break
      name += ch
      const next = ps.peek()
      if (next === null || !isIdentChar(next)) break
    }
    return [name, range(pos, ps.position())] as [string, Range<Position>]
  })
}

// ---------------------------------------------------------------------------
// Operator parsers (mirrors the define_operator! macro)
// ---------------------------------------------------------------------------

function opStr(ps: ParseState, s: string, excepts: string[]): Range<Position> | null {
  return ps.consumeStrExceptFollowed(s, excepts)
}

function opKeyword(ps: ParseState, s: string): Range<Position> | null {
  return ps.consumeStrExceptFollowedChar(s, isIdentChar)
}

// ---------------------------------------------------------------------------
// Recursive descent parser
// ---------------------------------------------------------------------------

function parseIdentOrKeyword(ps: ParseState): Expression | null {
  const result = tryParseFieldName(ps)
  if (result === null) {
    ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
    return null
  }
  const [name, location] = result
  switch (name) {
    case 'undefined': return { kind: 'LitUndefined', location }
    case 'null': return { kind: 'LitNull', location }
    case 'true': return { kind: 'LitBool', value: true, location }
    case 'false': return { kind: 'LitBool', value: false, location }
    default: return { kind: 'DataField', name, location }
  }
}

function parseObjectInner(ps: ParseState): ObjectFieldKind[] | null {
  const fields: ObjectFieldKind[] = []
  while (true) {
    const peek = ps.peek()
    if (peek === null || peek === '}') break

    // parse `...xxx`
    if (peek === '.') {
      const location = opStr(ps, '...', [])
      if (location === null) {
        ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
        return null
      }
      const value = parseCond(ps)
      if (value === null) return null
      fields.push({ kind: 'Spread', location, value })
      const pk = ps.peek()
      if (pk === null || pk === '}') break
      if (pk === ',') { ps.next(); continue }
      ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
      return null
    }

    // parse field name
    const nameResult = tryParseFieldName(ps)
    if (nameResult === null) {
      ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
      return null
    }
    const [name, location] = nameResult

    // duplicate check
    const dupLoc = fields.reduce<Range<Position> | null>((acc, f) => {
      if (acc !== null) return acc
      return f.kind === 'Named' && f.name === name ? f.location : null
    }, null)
    if (dupLoc !== null) ps.addWarning(ParseErrorKind.DuplicatedName, dupLoc)

    const pk = ps.peek()
    if (pk === ':') {
      const colonLocation = opStr(ps, ':', [])!
      const value = parseCond(ps)
      if (value === null) return null
      fields.push({ kind: 'Named', name, location, colonLocation, value })
      const pk2 = ps.peek()
      if (pk2 === null) return null
      if (pk2 === '}') break
      if (pk2 === ',') { ps.next(); continue }
      ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
      return null
    } else if (pk === null || pk === '}' || pk === ',') {
      const value: Expression = { kind: 'DataField', name, location: { ...location } }
      fields.push({ kind: 'Named', name, location, colonLocation: null, value })
      if (pk === ',') ps.next()
    } else {
      ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
      return null
    }
  }
  return fields
}

function parseLitObject(ps: ParseState): Expression | null {
  const braceStart = opStr(ps, '{', [])
  if (braceStart === null) {
    ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
    return null
  }
  const fields = parseObjectInner(ps)
  if (fields === null) return null
  const braceEnd = opStr(ps, '}', [])
  if (braceEnd === null) {
    ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
    return null
  }
  return { kind: 'LitObj', fields, braceLocation: [braceStart, braceEnd] }
}

function parseArrayInner(ps: ParseState): ArrayFieldKind[] | null {
  const items: ArrayFieldKind[] = []
  while (true) {
    const peek = ps.peek()
    if (peek === null || peek === ']') break
    if (peek === ',') {
      items.push({ kind: 'EmptySlot' })
      ps.next()
      continue
    }
    if (peek === '.') {
      const location = opStr(ps, '...', [])
      if (location === null) {
        ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
        return null
      }
      const value = parseCond(ps)
      if (value === null) return null
      items.push({ kind: 'Spread', location, value })
      const pk = ps.peek()
      if (pk === null) return null
      if (pk === ']') break
      if (pk === ',') { ps.next(); continue }
      ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
      return null
    }
    const value = parseCond(ps)
    if (value === null) return null
    items.push({ kind: 'Normal', value })
    const pk = ps.peek()
    if (pk === null) return null
    if (pk === ']') break
    if (pk === ',') { ps.next(); continue }
    ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
    return null
  }
  return items
}

function parseLitArray(ps: ParseState): Expression | null {
  const bracketStart = opStr(ps, '[', [])
  if (bracketStart === null) {
    ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
    return null
  }
  const fields = parseArrayInner(ps)
  if (fields === null) return null
  const bracketEnd = opStr(ps, ']', [])
  if (bracketEnd === null) {
    ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
    return null
  }
  return { kind: 'LitArr', fields, bracketLocation: [bracketStart, bracketEnd] }
}

function parseLitStr(ps: ParseState): Expression | null {
  const quoteChar = ps.peek()
  if (quoteChar !== '"' && quoteChar !== "'") {
    ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
    return null
  }
  const pos = ps.position()
  ps.next() // consume opening quote
  const result = ps.parseOffAutoWhitespace((ps) => {
    let ret = ''
    while (true) {
      const ch = ps.next()
      if (ch === null) return null
      if (ch === quoteChar) break
      if (ch === '\\') {
        const esc = ps.next()
        if (esc === null) return null
        switch (esc) {
          case 'r': ret += '\r'; break
          case 'n': ret += '\n'; break
          case 't': ret += '\t'; break
          case 'b': ret += '\x08'; break
          case 'f': ret += '\x0C'; break
          case 'v': ret += '\x0B'; break
          case '0': ret += '\0'; break
          case 'x': {
            const escPos = ps.position()
            const parsed = ps.tryParse((ps) => {
              let v = 0
              for (let i = 0; i < 2; i++) {
                const d = ps.next()
                if (d === null) return null
                const x = hexDigit(d)
                if (x === -1) {
                  ps.addWarning(ParseErrorKind.IllegalEscapeSequence, range(escPos, ps.position()))
                  return null
                }
                v = v * 16 + x
              }
              return v
            })
            ret += parsed !== null ? String.fromCodePoint(parsed) : ' '
            break
          }
          case 'u': {
            const escPos = ps.position()
            const parsed = ps.tryParse((ps) => {
              let v = 0
              for (let i = 0; i < 4; i++) {
                const d = ps.next()
                if (d === null) return null
                const x = hexDigit(d)
                if (x === -1) {
                  ps.addWarning(ParseErrorKind.IllegalEscapeSequence, range(escPos, ps.position()))
                  return null
                }
                v = v * 16 + x
              }
              if (v > 0x10ffff) {
                ps.addWarning(ParseErrorKind.IllegalEscapeSequence, range(escPos, ps.position()))
                return null
              }
              return v
            })
            ret += parsed !== null ? String.fromCodePoint(parsed) : ' '
            break
          }
          default:
            ret += esc
        }
      } else {
        ret += ch
      }
    }
    return ret
  })
  if (result === null) return null
  return { kind: 'LitStr', value: result, location: range(pos, ps.position()) }
}

function hexDigit(ch: string): number {
  if (ch >= '0' && ch <= '9') return ch.charCodeAt(0) - 48
  if (ch >= 'a' && ch <= 'f') return ch.charCodeAt(0) - 87
  if (ch >= 'A' && ch <= 'F') return ch.charCodeAt(0) - 55
  return -1
}

function parseNumber(ps: ParseState): Expression | null {
  const peek = ps.peek()
  if (peek === null || (!(peek >= '0' && peek <= '9') && peek !== '.')) {
    ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
    return null
  }
  const pos = ps.position()
  const startIndex = ps.curByteIndex()

  return ps.parseOffAutoWhitespace((ps) => {
    // zero-leading
    if (peek === '0') {
      ps.next() // '0'
      const next = ps.peek()
      if (next !== null && next >= '0' && next <= '7') {
        // octal
        let num = 0
        while (true) {
          const d = ps.next()!
          num = num * 8 + (d.charCodeAt(0) - 48)
          const pk = ps.peek()
          if (pk === null || !isIdentChar(pk)) break
          if (!(pk >= '0' && pk <= '7')) {
            ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
            return null
          }
        }
        return { kind: 'LitInt' as const, value: num, location: range(pos, ps.position()) }
      } else if (next === 'x') {
        // hex
        ps.next() // 'x'
        let num = 0
        const firstHex = ps.peek()
        if (firstHex === null || hexDigit(firstHex) === -1) {
          ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
          return null
        }
        while (true) {
          const ch = ps.next()!
          num = num * 16 + hexDigit(ch)
          const pk = ps.peek()
          if (pk === null || !isIdentChar(pk)) break
          if (hexDigit(pk) === -1) {
            ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
            return null
          }
        }
        return { kind: 'LitInt' as const, value: num, location: range(pos, ps.position()) }
      } else if (next === 'e' || next === '.' || next === '8' || next === '9') {
        // fall through to decimal
      } else if (next !== null && isIdentChar(next)) {
        ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
        return null
      } else {
        return { kind: 'LitInt' as const, value: 0, location: range(pos, ps.position()) }
      }
    }

    // decimal
    let intVal: number | null = 0
    while (true) {
      const ch = ps.next()!
      if (ch === 'e') {
        intVal = null
        ps.consumeStr('-')
        const expPeek = ps.peek()
        if (expPeek === null || !(expPeek >= '0' && expPeek <= '9')) {
          ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
          return null
        }
        while (true) {
          ps.next()
          const pk = ps.peek()
          if (pk === null || !isIdentChar(pk)) break
          if (!(pk >= '0' && pk <= '9')) {
            ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
            return null
          }
        }
        break
      } else if (ch === '.') {
        intVal = null
      } else {
        // '0'-'9'
        if (intVal !== null) {
          intVal = intVal * 10 + (ch.charCodeAt(0) - 48)
        }
      }
      const pk = ps.peek()
      if (pk === null || (!isIdentChar(pk) && pk !== '.')) break
      if ((pk >= '0' && pk <= '9') || (intVal !== null && pk === '.') || pk === 'e') {
        // continue
      } else {
        ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
        return null
      }
    }

    if (intVal === null) {
      const numStr = ps.codeSlice(startIndex, ps.curByteIndex())
      const value = parseFloat(numStr)
      if (isNaN(value)) {
        ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
        return null
      }
      return { kind: 'LitFloat' as const, value, location: range(pos, ps.position()) }
    }
    return { kind: 'LitInt' as const, value: intVal, location: range(pos, ps.position()) }
  })
}

function parseLit(ps: ParseState): Expression | null {
  const ch = ps.peek()
  if (ch === null) return null
  if (isIdentStartChar(ch)) return parseIdentOrKeyword(ps)
  if (ch === '"' || ch === "'") return parseLitStr(ps)
  if ((ch >= '0' && ch <= '9') || ch === '.') return parseNumber(ps)
  if (ch === '(') {
    ps.next()
    const expr = parseCond(ps)
    if (expr === null) return null
    if (ps.consumeStr(')') === null) {
      ps.addWarningAtCurrentPosition(ParseErrorKind.UnmatchedParenthesis)
      return null
    }
    return expr
  }
  if (ch === '{') return parseLitObject(ps)
  if (ch === '[') return parseLitArray(ps)
  ps.addWarningAtCurrentPosition(ParseErrorKind.UnexpectedExpressionCharacter)
  return null
}

function parseMember(ps: ParseState): Expression | null {
  let obj = parseLit(ps)
  if (obj === null) return null
  while (true) {
    const dotLoc = ps.consumeStrExceptFollowed('.', ['..'])
    if (dotLoc !== null) {
      const nameResult = tryParseFieldName(ps)
      if (nameResult === null) {
        ps.addWarningAtCurrentPosition(ParseErrorKind.InvalidIdentifier)
        return null
      }
      const [fieldName, fieldLocation] = nameResult
      obj = { kind: 'StaticMember', obj, fieldName, dotLocation: dotLoc, fieldLocation }
      continue
    }
    const bracketStart = opStr(ps, '[', [])
    if (bracketStart !== null) {
      const fieldName = parseCond(ps)
      if (fieldName === null) return null
      const bracketEnd = opStr(ps, ']', [])
      if (bracketEnd === null) {
        if (!ps.ended()) ps.addWarningAtCurrentPosition(ParseErrorKind.UnmatchedBracket)
        return null
      }
      obj = { kind: 'DynamicMember', obj, fieldName, bracketLocation: [bracketStart, bracketEnd] }
      continue
    }
    const parenStart = opStr(ps, '(', [])
    if (parenStart !== null) {
      const args: Expression[] = []
      while (true) {
        const pk = ps.peek()
        if (pk === null) return null
        if (pk === ')') break
        const arg = parseCond(ps)
        if (arg === null) return null
        args.push(arg)
        if (ps.consumeStr(',') === null) break
      }
      const parenEnd = opStr(ps, ')', [])
      if (parenEnd === null) {
        if (!ps.ended()) ps.addWarningAtCurrentPosition(ParseErrorKind.UnmatchedParenthesis)
        return null
      }
      obj = { kind: 'FuncCall', func: obj, args, parenLocation: [parenStart, parenEnd] }
      continue
    }
    break
  }
  return obj
}

function parseUnary(ps: ParseState): Expression | null {
  const revLoc = opStr(ps, '!', [])
  if (revLoc !== null) {
    const v = parseUnary(ps)
    if (v === null) return null
    return { kind: 'Reverse', value: v, location: revLoc }
  }
  const bitRevLoc = opStr(ps, '~', [])
  if (bitRevLoc !== null) {
    const v = parseUnary(ps)
    if (v === null) return null
    return { kind: 'BitReverse', value: v, location: bitRevLoc }
  }
  const posLoc = ps.consumeStrExceptFollowed('+', ['+', '='])
  if (posLoc !== null) {
    const v = parseUnary(ps)
    if (v === null) return null
    return { kind: 'Positive', value: v, location: posLoc }
  }
  const negLoc = ps.consumeStrExceptFollowed('-', ['-', '='])
  if (negLoc !== null) {
    const v = parseUnary(ps)
    if (v === null) return null
    return { kind: 'Negative', value: v, location: negLoc }
  }
  const typeofLoc = opKeyword(ps, 'typeof')
  if (typeofLoc !== null) {
    const v = parseUnary(ps)
    if (v === null) return null
    return { kind: 'TypeOf', value: v, location: typeofLoc }
  }
  const voidLoc = opKeyword(ps, 'void')
  if (voidLoc !== null) {
    const v = parseUnary(ps)
    if (v === null) return null
    return { kind: 'Void', value: v, location: voidLoc }
  }
  return parseMember(ps)
}

// Binary operator precedence chain
function makeBinParser(
  parseSub: (ps: ParseState) => Expression | null,
  ops: Array<[string, string[], string]>, // [opStr, excepts, kind]
): (ps: ParseState) => Expression | null {
  return (ps) => {
    let left = parseSub(ps)
    if (left === null) return null
    outer: while (true) {
      for (const [s, excepts, kind] of ops) {
        const loc = ps.consumeStrExceptFollowed(s, excepts)
        if (loc !== null) {
          const right = parseSub(ps)
          if (right === null) return null
          left = { kind, left, right, location: loc } as unknown as Expression
          continue outer
        }
      }
      break
    }
    return left
  }
}

function makeBinKeywordParser(
  parseSub: (ps: ParseState) => Expression | null,
  keyword: string,
  kind: string,
): (ps: ParseState) => Expression | null {
  return (ps) => {
    let left = parseSub(ps)
    if (left === null) return null
    while (true) {
      const loc = opKeyword(ps, keyword)
      if (loc === null) break
      const right = parseSub(ps)
      if (right === null) return null
      left = { kind, left, right, location: loc } as unknown as Expression
    }
    return left
  }
}

const parseMultiply = makeBinParser(parseUnary, [
  ['*', ['*', '/', '='], 'Multiply'],
  ['/', ['*', '/', '='], 'Divide'],
  ['%', ['='], 'Remainer'],
])
const parsePlus = makeBinParser(parseMultiply, [
  ['+', ['+', '='], 'Plus'],
  ['-', ['-', '='], 'Minus'],
])
const parseShift = makeBinParser(parsePlus, [
  ['<<', ['='], 'LeftShift'],
  ['>>>', ['='], 'UnsignedRightShift'],
  ['>>', ['>', '='], 'RightShift'],
])

function parseCmp(ps: ParseState): Expression | null {
  let left = parseShift(ps)
  if (left === null) return null
  outer: while (true) {
    for (const [s, excepts, kind] of [
      ['<=', [], 'Lte'],
      ['>=', [], 'Gte'],
      ['<', ['<', '='], 'Lt'],
      ['>', ['>', '='], 'Gt'],
    ] as Array<[string, string[], string]>) {
      const loc = ps.consumeStrExceptFollowed(s, excepts)
      if (loc !== null) {
        const right = parseShift(ps)
        if (right === null) return null
        left = { kind: kind, left, right, location: loc } as unknown as Expression
        continue outer
      }
    }
    const instLoc = opKeyword(ps, 'instanceof')
    if (instLoc !== null) {
      const right = parseShift(ps)
      if (right === null) return null
      left = { kind: 'InstanceOf', left, right, location: instLoc } as unknown as Expression
      continue
    }
    break
  }
  return left
}

const parseEq = makeBinParser(parseCmp, [
  ['===', [], 'EqFull'],
  ['!==', [], 'NeFull'],
  ['==', ['='], 'Eq'],
  ['!=', ['='], 'Ne'],
])
const parseBitAnd = makeBinParser(parseEq, [['&', ['&', '='], 'BitAnd']])
const parseBitXor = makeBinParser(parseBitAnd, [['^', ['='], 'BitXor']])
const parseBitOr = makeBinParser(parseBitXor, [['|', ['|', '='], 'BitOr']])
const parseLogicAnd = makeBinParser(parseBitOr, [['&&', ['='], 'LogicAnd']])

function parseLogicOr(ps: ParseState): Expression | null {
  let left = parseLogicAnd(ps)
  if (left === null) return null
  while (true) {
    const lorLoc = ps.consumeStrExceptFollowed('||', ['='])
    if (lorLoc !== null) {
      const right = parseLogicAnd(ps)
      if (right === null) return null
      left = { kind: 'LogicOr', left, right, location: lorLoc }
      continue
    }
    const nullLoc = ps.consumeStrExceptFollowed('??', ['='])
    if (nullLoc !== null) {
      const right = parseLogicAnd(ps)
      if (right === null) return null
      left = { kind: 'NullishCoalescing', left, right, location: nullLoc }
      continue
    }
    break
  }
  return left
}

function parseCond(ps: ParseState): Expression | null {
  const cond = parseLogicOr(ps)
  if (cond === null) return null

  // condition operator: `?` but not `??` or `?.` (unless followed by digit)
  const questionLoc = (() => {
    const loc = ps.consumeStrExceptFollowed('?', ['?', '.'])
    if (loc !== null) return loc
    // `?.digit` should be treated as `?` + `.digit`
    const chars = ps.peekN(3)
    if (chars !== null && chars[0] === '?' && chars[1] === '.' && (chars[2] ?? '') >= '0' && (chars[2] ?? 'z') <= '9') {
      return ps.consumeStr('?')
    }
    return null
  })()

  if (questionLoc === null) return cond

  const trueBr = parseCond(ps)
  if (trueBr === null) return null

  const colonLoc = ps.consumeStrExceptFollowed(':', [])
  if (colonLoc === null) {
    ps.addWarningAtCurrentPosition(ParseErrorKind.IncompleteConditionExpression)
    return null
  }

  const falseBr = parseCond(ps)
  if (falseBr === null) return null

  return {
    kind: 'Cond',
    cond,
    trueBr,
    falseBr,
    questionLocation: questionLoc,
    colonLocation: colonLoc,
  }
}

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------

/**
 * Parse `{{ expr }}` content (with auto JS-comment whitespace skipping).
 * Also handles the "object inner" shorthand: `{{ a, b: c }}`.
 */
export function parseExpressionOrObjectInner(
  ps: ParseState,
  preferObjectInner: boolean,
): Expression | null {
  return ps.parseOnAutoWhitespace(
    (ps) => ps.skipWhitespaceWithJsComments(),
    (ps) => {
      let isObjectInner = false
      ps.tryParse((ps) => {
        const nameResult = tryParseFieldName(ps)
        if (nameResult !== null) {
          const peek = ps.peek()
          if (peek === ':' || peek === ',') {
            isObjectInner = true
          } else if (preferObjectInner && ps.peekStr('}}')) {
            isObjectInner = true
          }
        } else {
          if (ps.peekStr('...')) isObjectInner = true
        }
        return null // always backtrack
      })

      if (isObjectInner) {
        const pos = ps.position()
        const fields = parseObjectInner(ps)
        if (fields === null) return null
        const endPos = ps.position()
        const fakeLocation = range(pos, pos)
        const fakeEnd = range(endPos, endPos)
        return { kind: 'LitObj', fields, braceLocation: [fakeLocation, fakeEnd] }
      }

      return parseCond(ps)
    },
  )
}

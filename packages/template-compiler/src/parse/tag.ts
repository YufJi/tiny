// Tag AST types and parser — mirrors src/parse/tag.rs
// Implements Template, Node, Element, Value, Ident, StrName, etc.

import { BindingMapCollector, BindingMapKeys } from '../binding_map'
import { dashToCamel } from '../escape'
import * as entities from '../entities'
import { resolve as resolvePath } from '../path'
import { ParseErrorKind, Position, Range, range } from '../types'
import {
  Expression,
  ObjectFieldKind,
  collectBindingMapKeys,
  convertScopes,
  disableBindingMapKeys,
  exprLocation,
  validateScopes,
  parseExpressionOrObjectInner,
} from './expr'
import { ParseState, isTemplateWhitespace } from './state'

export const DEFAULT_FOR_ITEM_SCOPE_NAME = 'item'
export const DEFAULT_FOR_INDEX_SCOPE_NAME = 'index'

// ---------------------------------------------------------------------------
// Tag location
// ---------------------------------------------------------------------------

export interface TagLocation {
  start: [Range<Position>, Range<Position>]
  close: Range<Position>
  end: [Range<Position>, Range<Position>] | null
}

// ---------------------------------------------------------------------------
// AST: Template
// ---------------------------------------------------------------------------

export interface Template {
  path: string
  content: Node[]
  globals: TemplateGlobals
}

export interface TemplateGlobals {
  imports: ImportElement[]
  includes: IncludeElement[]
  subTemplates: TemplateDefinition[]
  scripts: Script[]
  bindingMapCollector: BindingMapCollector
}

export interface ImportElement {
  tagLocation: TagLocation
  srcLocation: Range<Position>
  src: StrName
}

export interface IncludeElement {
  tagLocation: TagLocation
  srcLocation: Range<Position>
  src: StrName
}

export interface TemplateDefinition {
  tagLocation: TagLocation
  nameLocation: Range<Position>
  name: StrName
  content: Node[]
}

// ---------------------------------------------------------------------------
// AST: Script
// ---------------------------------------------------------------------------

export type Script =
  | {
      kind: 'Inline'
      tagLocation: TagLocation
      moduleLocation: Range<Position>
      moduleName: StrName
      content: string
      contentLocation: Range<Position>
    }
  | {
      kind: 'GlobalRef'
      tagLocation: TagLocation
      moduleLocation: Range<Position>
      moduleName: StrName
      srcLocation: Range<Position>
      src: StrName
    }

export function scriptModuleName(s: Script): StrName {
  return s.moduleName
}

export function scriptModuleLocation(s: Script): Range<Position> {
  return s.moduleLocation
}

export function scriptTagLocation(s: Script): TagLocation {
  return s.tagLocation
}

// ---------------------------------------------------------------------------
// AST: Node
// ---------------------------------------------------------------------------

export type Node =
  | { kind: 'Text'; value: Value }
  | { kind: 'Element'; element: Element }
  | { kind: 'Comment'; content: string; location: Range<Position> }
  | { kind: 'UnknownMetaTag'; tagName: Ident[]; attributes: CustomAttribute[]; location: Range<Position> }

export function nodeLocation(n: Node): Range<Position> {
  switch (n.kind) {
    case 'Text': return valueLocation(n.value)
    case 'Element': return elementLocation(n.element)
    case 'Comment': return n.location
    case 'UnknownMetaTag': return n.location
  }
}

// ---------------------------------------------------------------------------
// AST: Element
// ---------------------------------------------------------------------------

export interface Element {
  kind: ElementKind
  tagLocation: TagLocation
}

export function elementLocation(e: Element): Range<Position> {
  const tl = e.tagLocation
  if (tl.end === null) {
    return range(tl.start[0].start, tl.start[1].end)
  }
  return range(tl.start[0].start, tl.end[1].end)
}

export type ElementKind =
  | {
      type: 'Normal'
      tagName: Ident
      attributes: NormalAttribute[]
      class: ClassAttribute
      style: StyleAttribute
      changeAttributes: Attribute[]
      workletAttributes: StaticAttribute[]
      children: Node[]
      generics: StaticAttribute[]
      extraAttr: StaticAttribute[]
      letVars: Attribute[]
      common: CommonElementAttributes
    }
  | {
      type: 'Pure'
      children: Node[]
      letVars: Attribute[]
      slot: [Range<Position>, Value] | null
      slotValueRefs: StaticAttribute[]
    }
  | {
      type: 'For'
      list: [Range<Position>, Value]
      itemName: [Range<Position>, StrName]
      indexName: [Range<Position>, StrName]
      key: [Range<Position>, StrName]
      children: Node[]
    }
  | {
      type: 'If'
      branches: Array<[Range<Position>, Value, Node[]]>
      elseBranch: [Range<Position>, Node[]] | null
    }
  | {
      type: 'TemplateRef'
      target: [Range<Position>, Value]
      data: [Range<Position>, Value]
    }
  | { type: 'Include'; path: [Range<Position>, StrName] }
  | {
      type: 'Slot'
      name: [Range<Position>, Value]
      values: Attribute[]
      common: CommonElementAttributes
    }

// ---------------------------------------------------------------------------
// AST: CommonElementAttributes
// ---------------------------------------------------------------------------

export interface CommonElementAttributes {
  id: [Range<Position>, Value] | null
  slot: [Range<Position>, Value] | null
  slotValueRefs: StaticAttribute[]
  eventBindings: EventBinding[]
  data: Attribute[]
  marks: Attribute[]
}

function defaultCommon(): CommonElementAttributes {
  return { id: null, slot: null, slotValueRefs: [], eventBindings: [], data: [], marks: [] }
}

function commonIsEmpty(c: CommonElementAttributes): boolean {
  return (
    c.id === null &&
    c.slot === null &&
    c.slotValueRefs.length === 0 &&
    c.eventBindings.length === 0 &&
    c.marks.length === 0
  )
}

// ---------------------------------------------------------------------------
// AST: Attributes
// ---------------------------------------------------------------------------

export interface CustomAttribute {
  colonSeparatedName: Ident[]
  value: Value | null
}

export interface NormalAttribute {
  name: Ident
  value: Value | null
  prefix: NormalAttributePrefix
}

export type NormalAttributePrefix = { kind: 'None' } | { kind: 'Model'; location: Range<Position> }

export interface Attribute {
  name: Ident
  value: Value | null
  prefixLocation: Range<Position> | null
}

export interface StaticAttribute {
  name: Ident
  value: StrName
  prefixLocation: Range<Position> | null
}

export type ClassAttribute =
  | { kind: 'None' }
  | { kind: 'String'; location: Range<Position>; value: Value }
  | { kind: 'Multiple'; entries: Array<[Range<Position>, Ident, Value | null]> }

export type StyleAttribute =
  | { kind: 'None' }
  | { kind: 'String'; location: Range<Position>; value: Value }
  | { kind: 'Multiple'; entries: Array<[Range<Position>, Ident, Value]> }

export interface EventBinding {
  name: Ident
  value: Value | null
  isCatch: boolean
  isMut: boolean
  isCapture: boolean
  prefixLocation: Range<Position>
}

// ---------------------------------------------------------------------------
// AST: Ident
// ---------------------------------------------------------------------------

export interface Ident {
  name: string
  location: Range<Position>
}

function identIsStartChar(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_'
}

function identIsFollowingChar(ch: string): boolean {
  return identIsStartChar(ch) || (ch >= '0' && ch <= '9') || ch === '-' || ch === '.'
}

function identHasUppercase(ident: Ident): boolean {
  for (const c of ident.name) {
    if (c >= 'A' && c <= 'Z') return true
  }
  return false
}

function identLocation(ident: Ident): Range<Position> {
  return ident.location
}

function identNameEq(a: Ident, b: Ident): boolean {
  return a.name === b.name
}

function parseColonSeparated(ps: ParseState): Ident[] {
  const peek = ps.peek()
  if (peek === null || !identIsStartChar(peek)) return []

  const ret: Ident[] = []
  const startPos = ps.position()
  let curName = ''
  let curStart = startPos
  let curEnd = startPos

  while (true) {
    const ch = ps.next()!
    if (ch === ':') {
      ret.push({ name: curName, location: range(curStart, curEnd) })
      curName = ''
      curStart = ps.position()
      curEnd = curStart
    } else {
      curName += ch
      curEnd = ps.position()
    }
    const nextCh = ps.peek()
    if (nextCh === null) break
    if (nextCh !== ':' && !identIsFollowingChar(nextCh)) break
  }
  ret.push({ name: curName, location: range(curStart, curEnd) })
  return ret
}

function splitEventShorthand(name: string): [string, string] | null {
  const prefixes = [
    'capture-mut-bind',
    'capture-bind',
    'capture-catch',
    'mut-bind',
    'bind',
    'catch',
  ]
  for (const prefix of prefixes) {
    if (name.startsWith(prefix) && name.length > prefix.length) {
      return [prefix, name.slice(prefix.length)]
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// AST: StrName
// ---------------------------------------------------------------------------

export interface StrName {
  name: string
  location: Range<Position>
}

function strNameNewEmpty(pos: Position): StrName {
  return { name: '', location: range(pos, pos) }
}

function strNameLocation(s: StrName): Range<Position> {
  return s.location
}

function strNameNameEq(a: StrName, b: StrName): boolean {
  return a.name === b.name
}

function strNameIsValidJsIdentifier(s: StrName): boolean {
  if (s.name.length === 0) return false
  const first = s.name[0]!
  if (!identIsStartChar(first) && first !== '$') return false
  for (let i = 1; i < s.name.length; i++) {
    const ch = s.name[i]!
    if (!identIsStartChar(ch) && !(ch >= '0' && ch <= '9') && ch !== '$') return false
  }
  return true
}

/** Parse the next HTML entity or character from the stream (no auto-skip-whitespace). */
function parseNextEntity(ps: ParseState): string {
  if (ps.peekStr('&')) {
    const result = ps.tryParse((ps) => {
      const start = ps.curByteIndex()
      const startPos = ps.position()
      ps.next() // '&'
      const next = ps.next()
      if (next === null) return null
      if (next === '#') {
        const next2 = ps.next()
        if (next2 === null) return null
        if (next2 === 'x') {
          // parse `&#x...;`
          while (true) {
            const ch = ps.next()
            if (ch === null) {
              ps.addWarning(ParseErrorKind.IllegalEntity, range(startPos, ps.position()))
              return null
            }
            if (ch === ';') break
            if (!/[0-9a-fA-F]/.test(ch)) {
              ps.addWarning(ParseErrorKind.IllegalEntity, range(startPos, ps.position()))
              return null
            }
          }
        } else if (next2 >= '0' && next2 <= '9') {
          // parse `&#...;`
          while (true) {
            const ch = ps.next()
            if (ch === null) {
              ps.addWarning(ParseErrorKind.IllegalEntity, range(startPos, ps.position()))
              return null
            }
            if (ch === ';') break
            if (!(ch >= '0' && ch <= '9')) {
              ps.addWarning(ParseErrorKind.IllegalEntity, range(startPos, ps.position()))
              return null
            }
          }
        } else {
          ps.addWarning(ParseErrorKind.IllegalEntity, range(startPos, ps.position()))
          return null
        }
      } else if ((next >= 'a' && next <= 'z') || (next >= 'A' && next <= 'Z')) {
        while (true) {
          const ch = ps.next()
          if (ch === null) return null
          if (ch === ';') break
          if (!((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'))) return null
        }
      } else {
        return null
      }
      const entityStr = ps.codeSlice(start, ps.curByteIndex())
      const decoded = entities.decode(entityStr)
      if (decoded === null) {
        ps.addWarning(ParseErrorKind.IllegalEntity, range(startPos, ps.position()))
        return null
      }
      return decoded
    })
    if (result !== null) return result
  }
  return ps.nextCharAsStr()
}

function strNameParseUntilBefore(ps: ParseState, until: (ps: ParseState) => boolean): StrName {
  let name = ''
  const startPos = ps.position()
  while (!ps.ended() && !until(ps)) {
    name += parseNextEntity(ps)
  }
  return { name, location: range(startPos, ps.position()) }
}

// ---------------------------------------------------------------------------
// AST: Value
// ---------------------------------------------------------------------------

export type Value =
  | { kind: 'Static'; value: string; location: Range<Position> }
  | {
      kind: 'Dynamic'
      expression: Expression
      doubleBraceLocation: [Range<Position>, Range<Position>]
      bindingMapKeys: BindingMapKeys | null
    }

export function valueLocation(v: Value): Range<Position> {
  switch (v.kind) {
    case 'Static': return v.location
    case 'Dynamic':
      return range(v.doubleBraceLocation[0].start, v.doubleBraceLocation[1].end)
  }
}

export function valueNewEmpty(pos: Position): Value {
  return { kind: 'Static', value: '', location: range(pos, pos) }
}

export function valueIsEmpty(v: Value): boolean {
  return v.kind === 'Static' && v.value === ''
}

function wrapToString(expr: Expression, location: Range<Position>): Expression {
  return { kind: 'ToStringWithoutUndefined', value: expr, location }
}

function parseDataBinding(ps: ParseState, isTemplateData: boolean): Value | null {
  const doubleBraceLeft = ps.consumeStr('{{')
  if (doubleBraceLeft === null) return null

  // empty expression check
  const emptyRange = ps.tryParse((ps) => {
    ps.skipWhitespaceWithJsComments()
    return ps.consumeStr('}}')
  })
  if (emptyRange !== null) {
    const emptyPos = range(doubleBraceLeft.start, emptyRange.end)
    ps.addWarning(ParseErrorKind.EmptyExpression, range(doubleBraceLeft.end, doubleBraceLeft.end))
    return { kind: 'Static', value: '', location: emptyPos }
  }

  const expr = parseExpressionOrObjectInner(ps, isTemplateData)
  if (expr === null) {
    if (ps.skipUntilAfter('}}') === null) {
      ps.addWarning(ParseErrorKind.MissingExpressionEnd, doubleBraceLeft)
    }
    return {
      kind: 'Static',
      value: '',
      location: range(doubleBraceLeft.start, ps.position()),
    }
  }

  ps.skipWhitespace()
  const afterExprPos = ps.position()
  const remaining = ps.skipUntilBefore('}}')
  if (remaining === null) {
    ps.addWarning(ParseErrorKind.MissingExpressionEnd, doubleBraceLeft)
    return { kind: 'Static', value: '', location: range(doubleBraceLeft.start, ps.position()) }
  }
  if (remaining.length > 0) {
    ps.addWarning(
      ParseErrorKind.UnexpectedExpressionCharacter,
      range(afterExprPos, afterExprPos),
    )
    ps.consumeStr('}}')
    return { kind: 'Static', value: '', location: range(doubleBraceLeft.start, ps.position()) }
  }

  const doubleBraceRight = ps.consumeStr('}}') ?? (() => {
    const pos = ps.position()
    return range(pos, pos)
  })()
  return {
    kind: 'Dynamic',
    expression: expr,
    doubleBraceLocation: [doubleBraceLeft, doubleBraceRight],
    bindingMapKeys: null,
  }
}

/** Parse a mixed static/dynamic value (like text content or attribute values). */
function parseValueUntilBefore(ps: ParseState, until: (ps: ParseState) => boolean): Value {
  let ret: Value = {
    kind: 'Static',
    value: '',
    location: (() => { const p = ps.position(); return range(p, p) })(),
  }
  let hasWrapToString = false

  while (!until(ps) && !ps.ended()) {
    const startPos = ps.position()

    // try parse `{{ ... }}`
    if (ps.peekStr('{{')) {
      const binding = ps.tryParse((ps) => parseDataBinding(ps, false))
      if (binding !== null && binding.kind === 'Dynamic') {
        const { expression, doubleBraceLocation } = binding
        if (ret.kind === 'Static') {
          if (ret.value === '') {
            ret = { kind: 'Dynamic', expression, doubleBraceLocation, bindingMapKeys: null }
          } else {
            const left: Expression = { kind: 'LitStr', value: ret.value, location: ret.location }
            const right = wrapToString(expression, doubleBraceLocation[1])
            hasWrapToString = true
            const combined: Expression = {
              kind: 'Plus', left, right, location: doubleBraceLocation[0],
            }
            ret = { kind: 'Dynamic', expression: combined, doubleBraceLocation, bindingMapKeys: null }
          }
        } else {
          // ret.kind === 'Dynamic'
          const retDyn = ret as Extract<Value, {kind:'Dynamic'}>
          const retExpr: Expression = retDyn.expression
          const retDbl = retDyn.doubleBraceLocation
          const leftWrapped: Expression = hasWrapToString ? retExpr : wrapToString(retExpr, retDbl[1])
          const rightWrapped = wrapToString(expression, doubleBraceLocation[1])
          hasWrapToString = true
          const combined: Expression = {
            kind: 'Plus', left: leftWrapped, right: rightWrapped, location: doubleBraceLocation[0],
          }
          ret = { kind: 'Dynamic', expression: combined, doubleBraceLocation, bindingMapKeys: null }
        }
        continue
      } else if (binding !== null && binding.kind === 'Static') {
        continue
      }
      // binding === null: fall through
    }

    // Convert Dynamic ret to have trailing LitStr if needed
    if (ret.kind === 'Dynamic') {
      const retDyn = ret as Extract<Value, {kind:'Dynamic'}>
      const retExpr = retDyn.expression
      const retDbl = retDyn.doubleBraceLocation
      const needConvert = (() => {
        if (retExpr.kind === 'Plus') {
          const right = retExpr.right
          if (right.kind === 'LitStr') return false
        }
        return true
      })()
      if (needConvert) {
        const leftWrapped = hasWrapToString ? retExpr : wrapToString(retExpr, retDbl[1])
        const trailingLitStr: Expression = {
          kind: 'LitStr', value: '', location: range(startPos, startPos),
        }
        hasWrapToString = true
        const combined: Expression = {
          kind: 'Plus', left: leftWrapped, right: trailingLitStr, location: retDbl[0],
        }
        ret = { kind: 'Dynamic', expression: combined, doubleBraceLocation: retDbl, bindingMapKeys: null }
      }
    }

    // Determine where to append text
    let appendTarget: { value: string } & { location: Range<Position> }
    if (ret.kind === 'Static') {
      appendTarget = ret
    } else {
      // ret.kind === 'Dynamic' with Plus right LitStr
      const expr = (ret as Extract<Value, {kind:'Dynamic'}>).expression
      if (expr.kind === 'Plus') {
        const right = expr.right
        if (right.kind === 'LitStr') {
          appendTarget = right as { value: string; location: Range<Position> }
        } else {
          // shouldn't happen
          break
        }
      } else {
        break
      }
    }

    // parse characters until `{{` or end
    while (true) {
      appendTarget.value += parseNextEntity(ps)
      if (until(ps) || ps.ended() || ps.peekStr('{{')) break
    }
    appendTarget.location = range(appendTarget.location.start, ps.position())
    if (ret.kind === 'Dynamic') {
      const dyn = ret as Extract<Value, {kind:'Dynamic'}>
      dyn.doubleBraceLocation[1] = range(dyn.doubleBraceLocation[1].start, ps.position())
    }
  }
  return ret
}

// ---------------------------------------------------------------------------
// Attribute value parsing
// ---------------------------------------------------------------------------

type AttrParseResult = 
  | { kind: 'Invalid' }
  | { kind: 'Value'; value: Value | null }
  | { kind: 'StaticStr'; value: StrName }
  | { kind: 'ScopeName'; value: StrName }

function parseAttributeValuePart(
  ps: ParseState,
  attrName: Ident,
  mode: 'value' | 'templateData' | 'staticStr' | 'scopeName',
): { result: AttrParseResult; isValueUnspecified: boolean } {
  const wsBeforeEq = ps.skipWhitespace()
  const eqRange = ps.consumeStr('=')
  let isValueUnspecified = false

  if (eqRange !== null) {
    if (wsBeforeEq !== null) {
      ps.addWarning(ParseErrorKind.UnexpectedWhitespace, wsBeforeEq)
    }
    const wsAfterEq = ps.skipWhitespace()

    const peek = ps.peek()
    if (peek === '"' || peek === "'") {
      // quoted string
      if (wsAfterEq !== null) {
        ps.addWarning(ParseErrorKind.UnexpectedWhitespace, wsAfterEq)
      }
      ps.next() // consume opening quote
      let result: AttrParseResult
      if (mode === 'staticStr' || mode === 'scopeName') {
        const v = strNameParseUntilBefore(ps, (ps) => ps.peek() === peek)
        ps.next() // closing quote
        result = mode === 'scopeName' ? { kind: 'ScopeName', value: v } : { kind: 'StaticStr', value: v }
      } else if (mode === 'templateData') {
        // try parse as data binding
        const bindingAttempt = ps.tryParse((ps) => {
          const v = parseDataBinding(ps, true)
          if (v === null) return null
          const p = ps.peek()
          if (p !== null && p !== peek) return null
          return v
        })
        if (bindingAttempt !== null) {
          ps.next() // closing quote
          result = { kind: 'Value', value: bindingAttempt }
        } else {
          const v = parseValueUntilBefore(ps, (ps) => ps.peek() === peek)
          ps.addWarning(ParseErrorKind.InvalidAttributeValue, valueLocation(v))
          ps.next() // closing quote
          result = { kind: 'Value', value: valueNewEmpty(attrName.location.end) }
        }
      } else {
        // mode === 'value'
        const v = parseValueUntilBefore(ps, (ps) => ps.peek() === peek)
        ps.next() // closing quote
        result = { kind: 'Value', value: v }
      }
      ps.skipWhitespace()
      return { result, isValueUnspecified }
    } else if (ps.peekStr('{{')) {
      // expression binding
      if (wsAfterEq !== null) {
        ps.addWarning(ParseErrorKind.UnexpectedWhitespace, wsAfterEq)
      }
      let result: AttrParseResult
      if (mode === 'staticStr' || mode === 'scopeName') {
        const v = parseDataBinding(ps, false)
        if (v !== null) {
          ps.addWarning(ParseErrorKind.DataBindingNotAllowed, valueLocation(v))
        }
        result = { kind: 'Invalid' }
      } else {
        const v = parseDataBinding(ps, mode === 'templateData')
        result = v !== null ? { kind: 'Value', value: v } : { kind: 'Invalid' }
      }
      ps.skipWhitespace()
      return { result, isValueUnspecified }
    } else if (wsAfterEq === null && peek !== null && identIsFollowingChar(peek)) {
      // unquoted string
      const v = strNameParseUntilBefore(ps, (ps) => {
        const pk = ps.peek()
        return pk === null || !identIsFollowingChar(pk)
      })
      ps.addWarning(ParseErrorKind.ShouldQuoted, v.location)
      let result: AttrParseResult
      if (mode === 'staticStr' || mode === 'scopeName') {
        result = mode === 'scopeName' ? { kind: 'ScopeName', value: v } : { kind: 'StaticStr', value: v }
      } else {
        result = { kind: 'Value', value: { kind: 'Static', value: v.name, location: v.location } }
      }
      ps.skipWhitespace()
      return { result, isValueUnspecified }
    } else {
      ps.addWarning(ParseErrorKind.MissingAttributeValue, eqRange)
      let result: AttrParseResult
      if (mode === 'staticStr') {
        result = { kind: 'StaticStr', value: strNameNewEmpty(attrName.location.end) }
      } else if (mode === 'scopeName') {
        result = { kind: 'ScopeName', value: strNameNewEmpty(attrName.location.end) }
      } else {
        result = { kind: 'Value', value: valueNewEmpty(attrName.location.end) }
      }
      return { result, isValueUnspecified }
    }
  } else {
    // no '=' — value unspecified
    isValueUnspecified = true
    let result: AttrParseResult
    if (mode === 'staticStr') {
      result = { kind: 'StaticStr', value: strNameNewEmpty(attrName.location.end) }
    } else if (mode === 'scopeName') {
      result = { kind: 'ScopeName', value: strNameNewEmpty(attrName.location.end) }
    } else {
      result = { kind: 'Value', value: valueNewEmpty(attrName.location.end) }
    }
    return { result, isValueUnspecified }
  }
}

// ---------------------------------------------------------------------------
// Template parsing entry
// ---------------------------------------------------------------------------

export function parseTemplate(ps: ParseState): Template {
  const globals: TemplateGlobals = {
    imports: [],
    includes: [],
    subTemplates: [],
    scripts: [],
    bindingMapCollector: new BindingMapCollector(),
  }

  // 1st round: parse string into AST
  const content: Node[] = []
  while (!ps.ended()) {
    parseVecNode(ps, globals, content)
    if (ps.peekStr('</')) {
      const pos = ps.position()
      ps.skipUntilAfter('>')
      ps.addWarning(ParseErrorKind.InvalidEndTag, range(pos, ps.position()))
    }
  }

  // 2nd round: scope analysis

  // sub-templates (inside_dynamic_tree starts at 1)
  for (const sub of globals.subTemplates) {
    const sas: ScopeAnalyzeState = {
      scopes: globals.scripts.map((s) => [s.moduleName.name, s.moduleName.location] as [string, Range<Position>]),
      insideDynamicTree: 1,
      bindingMapCollector: new BindingMapCollector(),
    }
    for (const node of sub.content) {
      nodeInitScopes(node, ps, sas)
    }
  }

  const sas: ScopeAnalyzeState = {
    scopes: globals.scripts.map((s) => [s.moduleName.name, s.moduleName.location] as [string, Range<Position>]),
    insideDynamicTree: 0,
    bindingMapCollector: new BindingMapCollector(),
  }
  for (const node of content) {
    nodeInitScopes(node, ps, sas)
  }
  globals.bindingMapCollector = sas.bindingMapCollector

  return { path: ps.path, content, globals }
}

// ---------------------------------------------------------------------------
// Scope analysis
// ---------------------------------------------------------------------------

interface ScopeAnalyzeState {
  scopes: Array<[string, Range<Position>]>
  insideDynamicTree: number
  bindingMapCollector: BindingMapCollector
}

function valueInitScopes(v: Value, sas: ScopeAnalyzeState, disableBindingMap: boolean): void {
  if (v.kind === 'Static') return
  const dyn = v as Extract<Value, {kind:'Dynamic'}>
  dyn.expression = convertScopes(dyn.expression, sas.scopes)
  if (sas.insideDynamicTree > 0 || disableBindingMap) {
    disableBindingMapKeys(dyn.expression, sas.bindingMapCollector)
  } else {
    const bmk = new BindingMapKeys()
    collectBindingMapKeys(dyn.expression, sas.bindingMapCollector, bmk)
    dyn.bindingMapKeys = bmk
  }
}

function nodeInitScopes(node: Node, ps: ParseState, sas: ScopeAnalyzeState): void {
  switch (node.kind) {
    case 'Text':
      valueInitScopes(node.value, sas, false)
      break
    case 'Element':
      elementInitScopes(node.element, ps, sas)
      break
    case 'Comment':
    case 'UnknownMetaTag':
      break
  }
}

function elementInitScopes(elem: Element, ps: ParseState, sas: ScopeAnalyzeState): void {
  const kind = elem.kind

  // disable binding map globally for include
  if (kind.type === 'Include') {
    sas.bindingMapCollector.disableAll()
  }

  // dynamic tree state
  const selfDynamic =
    (kind.type === 'Normal' && kind.letVars.length > 0) ||
    (kind.type === 'Pure' && kind.letVars.length > 0) ||
    kind.type === 'For' ||
    kind.type === 'If' ||
    kind.type === 'TemplateRef' ||
    kind.type === 'Include' ||
    kind.type === 'Slot'
  if (selfDynamic) sas.insideDynamicTree++
  const prevCount = sas.scopes.length

  // scopes from slot value refs
  const slotValueRefs = getSlotValueRefs(kind)
  if (slotValueRefs !== null) {
    for (const attr of slotValueRefs) {
      sas.scopes.push([attr.value.name, attr.value.location])
    }
  }

  // scopes from let vars
  const originalScopeLen = sas.scopes.length
  const letVarRefs = getLetVarRefs(kind)
  if (letVarRefs !== null) {
    for (const attr of letVarRefs) {
      sas.scopes.push([attr.name.name, attr.name.location])
    }
  }
  // validate let var values using scope limit
  if ((kind.type === 'Normal' || kind.type === 'Pure')) {
    const letVars = kind.type === 'Normal' ? kind.letVars : kind.letVars
    for (let i = 0; i < letVars.length; i++) {
      const attr = letVars[i]!
      if (attr.value !== null) {
        if (!valueValidateScopes(attr.value, ps, sas, originalScopeLen + i)) {
          attr.value = null
        }
      }
    }
  }

  // process self values
  elementForEachValueMut(elem, (v, disableBindingMap) => {
    valueInitScopes(v, sas, disableBindingMap)
  })

  // scopes from for loop
  if (kind.type === 'For') {
    sas.scopes.push([kind.itemName[1].name, kind.itemName[1].location])
    sas.scopes.push([kind.indexName[1].name, kind.indexName[1].location])
  }

  // recurse into children
  if (kind.type === 'Normal' || kind.type === 'Pure' || kind.type === 'For') {
    for (const child of kind.children) {
      nodeInitScopes(child, ps, sas)
    }
  } else if (kind.type === 'If') {
    for (const [, , children] of kind.branches) {
      for (const child of children) nodeInitScopes(child, ps, sas)
    }
    if (kind.elseBranch !== null) {
      for (const child of kind.elseBranch[1]) nodeInitScopes(child, ps, sas)
    }
  }

  sas.scopes.length = prevCount
  if (selfDynamic) sas.insideDynamicTree--
}

function valueValidateScopes(
  v: Value,
  ps: ParseState,
  sas: ScopeAnalyzeState,
  limit: number,
): boolean {
  if (v.kind === 'Static') return true
  return validateScopes(v.expression, ps, sas.scopes, limit)
}

function getSlotValueRefs(kind: ElementKind): StaticAttribute[] | null {
  if (kind.type === 'Normal') return kind.common.slotValueRefs
  if (kind.type === 'Slot') return kind.common.slotValueRefs
  if (kind.type === 'Pure') return kind.slotValueRefs
  return null
}

function getLetVarRefs(kind: ElementKind): Attribute[] | null {
  if (kind.type === 'Normal') return kind.letVars
  if (kind.type === 'Pure') return kind.letVars
  return null
}

function elementForEachValueMut(elem: Element, cb: (v: Value, disableBindingMap: boolean) => void): void {
  const kind = elem.kind
  switch (kind.type) {
    case 'Normal': {
      for (const attr of kind.letVars) {
        if (attr.value !== null) cb(attr.value, false)
      }
      for (const attr of kind.attributes) {
        if (attr.value !== null) cb(attr.value, false)
      }
      if (kind.class.kind === 'String') {
        cb(kind.class.value, false)
      } else if (kind.class.kind === 'Multiple') {
        for (const [, , v] of kind.class.entries) {
          if (v !== null) cb(v, false)
        }
      }
      if (kind.style.kind === 'String') {
        cb(kind.style.value, false)
      } else if (kind.style.kind === 'Multiple') {
        for (const [, , v] of kind.style.entries) {
          cb(v, false)
        }
      }
      for (const attr of kind.changeAttributes) {
        if (attr.value !== null) cb(attr.value, false)
      }
      commonForEachValueMut(kind.common, cb)
      break
    }
    case 'Pure': {
      for (const attr of kind.letVars) {
        if (attr.value !== null) cb(attr.value, false)
      }
      if (kind.slot !== null) cb(kind.slot[1], true)
      break
    }
    case 'For': {
      cb(kind.list[1], true)
      break
    }
    case 'If': {
      for (const [, v] of kind.branches) {
        cb(v, true)
      }
      break
    }
    case 'TemplateRef': {
      cb(kind.target[1], true)
      cb(kind.data[1], true)
      break
    }
    case 'Slot': {
      cb(kind.name[1], true)
      for (const attr of kind.values) {
        if (attr.value !== null) cb(attr.value, true)
      }
      commonForEachValueMut(kind.common, cb)
      break
    }
    case 'Include':
      break
  }
}

function commonForEachValueMut(
  common: CommonElementAttributes,
  cb: (v: Value, disable: boolean) => void,
): void {
  if (common.id !== null) cb(common.id[1], false)
  if (common.slot !== null) cb(common.slot[1], false)
  for (const ev of common.eventBindings) {
    if (ev.value !== null) cb(ev.value, false)
  }
  for (const attr of common.data) {
    if (attr.value !== null) cb(attr.value, false)
  }
  for (const attr of common.marks) {
    if (attr.value !== null) cb(attr.value, false)
  }
}

// ---------------------------------------------------------------------------
// Node parsing
// ---------------------------------------------------------------------------

function parseVecNode(ps: ParseState, globals: TemplateGlobals, ret: Node[]): void {
  while (true) {
    if (ps.ended() || ps.peekStr('</')) break

    if (ps.consumeStr('<!') !== null) {
      // special tags
      if (ps.consumeStr('--') !== null) {
        const s = ps.skipUntilAfter('-->') ?? ''
        const location = range(ps.position(), ps.position()) // approximated
        ret.push({ kind: 'Comment', content: s, location })
      } else {
        const peek = ps.peek()
        if (peek !== null && identIsStartChar(peek)) {
          const tagName = parseColonSeparated(ps)
          const attributes = parseCustomAttributesUntilTagEnd(ps)
          const gtRange = ps.consumeStr('>')
          if (gtRange === null) {
            const pos = ps.position()
            ps.addWarning(ParseErrorKind.IncompleteTag, range(pos, pos))
          }
          const endPos = ps.position()
          const loc = range(
            tagName.length > 0 ? tagName[0]!.location.start : endPos,
            endPos,
          )
          ps.addWarning(ParseErrorKind.UnknownMetaTag, loc)
          ret.push({ kind: 'UnknownMetaTag', tagName, attributes, location: loc })
        }
      }
      continue
    }

    const peekTwo = ps.peekN(2)
    const peekTwoFirst = peekTwo !== null ? peekTwo[0] : null
    const peekTwoSecond = peekTwo !== null ? peekTwo[1] ?? null : null
    if (peekTwoFirst === '<' && peekTwoSecond !== null && identIsStartChar(peekTwoSecond)) {
      parseElement(ps, globals, ret)
      continue
    }

    const value = parseValueUntilBefore(ps, (ps) => {
      const pk = ps.peek()
      if (pk !== '<') return false
      const pk2 = ps.peek(1)
      if (pk2 === null) return false
      return pk2 === '/' || pk2 === '!' || identIsStartChar(pk2)
    })

    const isWhitespace = value.kind === 'Static' && value.value.trim() === ''
    if (!isWhitespace) {
      ret.push({ kind: 'Text', value })
    }
  }
}

function parseCustomAttributesUntilTagEnd(ps: ParseState): CustomAttribute[] {
  const ret: CustomAttribute[] = []
  while (true) {
    ps.skipWhitespace()
    const peek = ps.peek()
    if (peek === null || peek === '>') break
    if (identIsStartChar(peek)) {
      const colonSeparatedName = parseColonSeparated(ps)
      if (colonSeparatedName.length > 0) {
        const lastName = colonSeparatedName[colonSeparatedName.length - 1]!
        const { result, isValueUnspecified } = parseAttributeValuePart(ps, lastName, 'value')
        const value =
          !isValueUnspecified && result.kind === 'Value'
            ? result.value
            : null
        ret.push({ colonSeparatedName, value })
      }
    } else {
      const pos = ps.position()
      while (true) {
        const pk = ps.peek()
        if (pk === null || pk === '>' || identIsStartChar(pk) || pk === ' ' || pk === '\t' || pk === '\n' || pk === '\r') break
        ps.next()
      }
      ps.addWarning(ParseErrorKind.InvalidAttributeName, range(pos, ps.position()))
    }
  }
  return ret
}

// ---------------------------------------------------------------------------
// Element parsing
// ---------------------------------------------------------------------------

type IfCondition =
  | { kind: 'None' }
  | { kind: 'If'; location: Range<Position>; value: Value }
  | { kind: 'Elif'; location: Range<Position>; value: Value }
  | { kind: 'Else'; location: Range<Position> }

type ForList =
  | { kind: 'None' }
  | {
      kind: 'For'
      list: [Range<Position>, Value]
      itemName: [Range<Position>, StrName]
      indexName: [Range<Position>, StrName]
      key: [Range<Position>, StrName]
    }

type ExternalTagKind = 'Include' | 'Import' | 'Script'

function parseElement(ps: ParseState, globals: TemplateGlobals, ret: Node[]): void {
  // parse `<xxx`
  const startTagStartLoc = ps.consumeStr('<')!
  let tagNameSlices = parseColonSeparated(ps)
  if (tagNameSlices.length === 0) return

  let tagName: Ident
  if (tagNameSlices.length > 1) {
    const end = tagNameSlices.pop()!
    for (const x of tagNameSlices) {
      ps.addWarning(ParseErrorKind.IllegalNamePrefix, x.location)
    }
    tagName = { name: 'wx-x', location: end.location }
  } else {
    tagName = tagNameSlices[0]!
  }

  if (identHasUppercase(tagName)) {
    ps.addWarning(ParseErrorKind.AvoidUppercaseLetters, tagName.location)
  }

  const defaultAttrPos = tagName.location.end

  const externalTagType: ExternalTagKind =
    tagName.name === 'import' ? 'Import' :
    tagName.name === 'wxs' ? 'Script' :
    'Include'

  let element: ElementKind = (() => {
    switch (tagName.name) {
      case 'block':
        return { type: 'Pure', children: [], letVars: [], slot: null, slotValueRefs: [] } as ElementKind
      case 'template':
        return {
          type: 'TemplateRef',
          target: [range(defaultAttrPos, defaultAttrPos), valueNewEmpty(defaultAttrPos)],
          data: [range(defaultAttrPos, defaultAttrPos), valueNewEmpty(defaultAttrPos)],
        } as ElementKind
      case 'include':
      case 'wxs':
      case 'import':
        return {
          type: 'Include',
          path: [range(defaultAttrPos, defaultAttrPos), strNameNewEmpty(defaultAttrPos)],
        } as ElementKind
      case 'slot':
        return {
          type: 'Slot',
          name: [range(defaultAttrPos, defaultAttrPos), valueNewEmpty(defaultAttrPos)],
          values: [],
          common: defaultCommon(),
        } as ElementKind
      default:
        return {
          type: 'Normal',
          tagName,
          attributes: [],
          class: { kind: 'None' },
          style: { kind: 'None' },
          changeAttributes: [],
          workletAttributes: [],
          children: [],
          generics: [],
          extraAttr: [],
          letVars: [],
          common: defaultCommon(),
        } as ElementKind
    }
  })()

  // parse attributes
  let wxIf: [Range<Position>, Value] | null = null
  let wxElif: [Range<Position>, Value] | null = null
  let wxElse: Range<Position> | null = null
  let wxFor: [Range<Position>, Value] | null = null
  let wxForIndex: [Range<Position>, StrName] | null = null
  let wxForItem: [Range<Position>, StrName] | null = null
  let wxKey: [Range<Position>, StrName] | null = null
  let templateName: [Range<Position>, StrName] | null = null
  let scriptModule: [Range<Position>, StrName] | null = null
  let classAttrs: Array<[Range<Position>, Ident, Value | null]> = []
  let styleAttrs: Array<[Range<Position>, Ident, Value]> = []

  while (true) {
    ps.skipWhitespace()
    const peek = ps.peek()
    if (peek === null || peek === '>') break
    if (peek === '/') {
      if (!ps.peekStr('/>')) {
        const loc = ps.consumeStr('/')!
        ps.addWarning(ParseErrorKind.UnexpectedCharacter, loc)
      } else {
        break
      }
      continue
    }
    if (!identIsStartChar(peek)) {
      const pos = ps.position()
      ps.next()
      ps.addWarning(ParseErrorKind.InvalidAttributeName, range(pos, ps.position()))
      continue
    }

    let segs = parseColonSeparated(ps)
    if (segs.length === 0) break
    let attrNameRaw = segs.pop()!
    if (segs.length === 0) {
      const shorthand = splitEventShorthand(attrNameRaw.name)
      if (shorthand) {
        const [prefixName, eventName] = shorthand
        segs = [{ name: prefixName, location: attrNameRaw.location }]
        attrNameRaw = { name: eventName, location: attrNameRaw.location }
      }
    }

    type AttrKind =
      | 'Normal' | 'Id' | 'Slot' | 'ClassString' | 'StyleString'
      | { t: 'WxIf'; loc: Range<Position> }
      | { t: 'WxElif'; loc: Range<Position> }
      | { t: 'WxElse'; loc: Range<Position> }
      | { t: 'WxFor'; loc: Range<Position> }
      | { t: 'WxForIndex'; loc: Range<Position> }
      | { t: 'WxForItem'; loc: Range<Position> }
      | { t: 'WxKey'; loc: Range<Position> }
      | 'TemplateName' | 'TemplateIs' | 'TemplateData'
      | { t: 'Src'; suffix: string }
      | 'Module' | 'SlotName'
      | { t: 'Model'; loc: Range<Position> }
      | { t: 'Change'; loc: Range<Position> }
      | { t: 'Worklet'; loc: Range<Position> }
      | { t: 'Data'; loc: Range<Position> }
      | 'DataHyphen'
      | { t: 'Class'; loc: Range<Position> }
      | { t: 'Style'; loc: Range<Position> }
      | { t: 'Bind'; loc: Range<Position> }
      | { t: 'MutBind'; loc: Range<Position> }
      | { t: 'Catch'; loc: Range<Position> }
      | { t: 'CaptureBind'; loc: Range<Position> }
      | { t: 'CaptureMutBind'; loc: Range<Position> }
      | { t: 'CaptureCatch'; loc: Range<Position> }
      | { t: 'Mark'; loc: Range<Position> }
      | { t: 'Generic'; loc: Range<Position> }
      | { t: 'ExtraAttr'; loc: Range<Position> }
      | { t: 'SlotDataRef'; loc: Range<Position> }
      | { t: 'LetVar'; loc: Range<Position> }
      | { t: 'Invalid'; loc: Range<Position> }

    let attrKind: AttrKind
    if (segs.length <= 1) {
      const prefix = segs[0]
      if (prefix === undefined) {
        // no prefix
        switch (element.type) {
          case 'TemplateRef':
            if (attrNameRaw.name === 'name') attrKind = 'TemplateName'
            else if (attrNameRaw.name === 'is') attrKind = 'TemplateIs'
            else if (attrNameRaw.name === 'data') attrKind = 'TemplateData'
            else attrKind = 'Normal'
            break
          case 'Include':
            if (attrNameRaw.name === 'src') {
              const suffix = externalTagType === 'Script' ? '.wxs' : '.wxml'
              attrKind = { t: 'Src', suffix }
            } else if (attrNameRaw.name === 'module') {
              attrKind = externalTagType === 'Script' ? 'Module' : 'Normal'
            } else {
              attrKind = 'Normal'
            }
            break
          case 'Slot':
            if (attrNameRaw.name === 'name') attrKind = 'SlotName'
            else if (attrNameRaw.name === 'id') attrKind = 'Id'
            else if (attrNameRaw.name === 'slot') attrKind = 'Slot'
            else attrKind = 'Normal'
            break
          case 'Normal':
            if (attrNameRaw.name === 'id') attrKind = 'Id'
            else if (attrNameRaw.name === 'slot') attrKind = 'Slot'
            else if (attrNameRaw.name === 'class') attrKind = 'ClassString'
            else if (attrNameRaw.name === 'style') attrKind = 'StyleString'
            else if (attrNameRaw.name.startsWith('data-') && attrNameRaw.name !== 'data-') {
              attrKind = 'DataHyphen'
            } else {
              attrKind = 'Normal'
            }
            break
          default:
            attrKind = 'Normal'
        }
      } else {
        // has prefix
        const pn = prefix.name
        switch (pn) {
          case 'wx':
            switch (attrNameRaw.name) {
              case 'if': attrKind = { t: 'WxIf', loc: prefix.location }; break
              case 'elif': attrKind = { t: 'WxElif', loc: prefix.location }; break
              case 'else': attrKind = { t: 'WxElse', loc: prefix.location }; break
              case 'for': attrKind = { t: 'WxFor', loc: prefix.location }; break
              case 'for-index': attrKind = { t: 'WxForIndex', loc: prefix.location }; break
              case 'for-item': attrKind = { t: 'WxForItem', loc: prefix.location }; break
              case 'for-items':
                ps.addWarning(ParseErrorKind.DeprecatedAttribute, prefix.location)
                attrKind = { t: 'WxFor', loc: prefix.location }
                break
              case 'key': attrKind = { t: 'WxKey', loc: prefix.location }; break
              default: attrKind = { t: 'Invalid', loc: prefix.location }
            }
            break
          case 'model': attrKind = { t: 'Model', loc: prefix.location }; break
          case 'change': attrKind = { t: 'Change', loc: prefix.location }; break
          case 'worklet': attrKind = { t: 'Worklet', loc: prefix.location }; break
          case 'data': attrKind = { t: 'Data', loc: prefix.location }; break
          case 'class': attrKind = { t: 'Class', loc: prefix.location }; break
          case 'style': attrKind = { t: 'Style', loc: prefix.location }; break
          case 'bind': attrKind = { t: 'Bind', loc: prefix.location }; break
          case 'mut-bind': attrKind = { t: 'MutBind', loc: prefix.location }; break
          case 'catch': attrKind = { t: 'Catch', loc: prefix.location }; break
          case 'capture-bind': attrKind = { t: 'CaptureBind', loc: prefix.location }; break
          case 'capture-mut-bind': attrKind = { t: 'CaptureMutBind', loc: prefix.location }; break
          case 'capture-catch': attrKind = { t: 'CaptureCatch', loc: prefix.location }; break
          case 'mark': attrKind = { t: 'Mark', loc: prefix.location }; break
          case 'generic': attrKind = { t: 'Generic', loc: prefix.location }; break
          case 'extra-attr': attrKind = { t: 'ExtraAttr', loc: prefix.location }; break
          case 'slot': attrKind = { t: 'SlotDataRef', loc: prefix.location }; break
          case 'let': attrKind = { t: 'LetVar', loc: prefix.location }; break
          default: attrKind = { t: 'Invalid', loc: prefix.location }
        }
      }
    } else {
      attrKind = { t: 'Invalid', loc: segs[0]!.location }
    }

    if (typeof attrKind === 'object' && 't' in attrKind && attrKind.t === 'Invalid') {
      ps.addWarning(ParseErrorKind.InvalidAttributePrefix, (attrKind as {t:'Invalid';loc:Range<Position>}).loc)
    }

    // determine parse mode
    type ParseMode = 'value' | 'templateData' | 'staticStr' | 'scopeName'
    const parseMode: ParseMode = (() => {
      if (typeof attrKind === 'string') {
        switch (attrKind) {
          case 'Normal': case 'Id': case 'Slot': case 'ClassString': case 'StyleString':
          case 'SlotName': case 'TemplateIs': return 'value'
          case 'TemplateName': case 'DataHyphen': case 'Module': return 'staticStr'
          case 'TemplateData': return 'templateData'
          default: return 'value'
        }
      }
      switch (attrKind.t) {
        case 'WxIf': case 'WxElif': case 'WxFor': return 'value'
        case 'WxElse': case 'WxKey': case 'Worklet': case 'Generic': case 'ExtraAttr': case 'Src': return 'staticStr'
        case 'WxForIndex': case 'WxForItem': case 'SlotDataRef': case 'LetVar': return 'scopeName'
        default: return 'value'
      }
    })()

    // compute final attr name (dash-to-camel where needed)
    let finalAttrName: Ident = attrNameRaw
    const needsDashToCamel = (() => {
      if (typeof attrKind === 'object' && 't' in attrKind) {
        const t = (attrKind as {t:string}).t
        if (t === 'Model' || t === 'Change' || t === 'Worklet' || t === 'SlotDataRef' || t === 'LetVar') return true
      }
      if (attrKind === 'Normal' && element.type === 'Slot') return true
      return false
    })()
    if (needsDashToCamel) {
      finalAttrName = { name: dashToCamel(attrNameRaw.name), location: attrNameRaw.location }
    } else if (attrKind === 'DataHyphen') {
      let n = attrNameRaw.name.slice('data-'.length)
      if (/[A-Z]/.test(n)) {
        ps.addWarning(ParseErrorKind.AvoidUppercaseLetters, attrNameRaw.location)
        n = n.toLowerCase()
      }
      finalAttrName = { name: dashToCamel(n.toLowerCase()), location: attrNameRaw.location }
    }

    // parse value
    const { result, isValueUnspecified } = parseAttributeValuePart(ps, finalAttrName, parseMode)

    // unwrap helper
    const unwrapValue = (): Value => {
      if (result.kind === 'Value' && result.value !== null) return result.value
      ps.addWarning(ParseErrorKind.MissingAttributeValue, finalAttrName.location)
      return valueNewEmpty(finalAttrName.location.end)
    }

    // apply attribute
    if (typeof attrKind === 'string') {
      switch (attrKind) {
        case 'Normal': {
          if (element.type === 'Normal') {
            if (element.attributes.find((a) => identNameEq(a.name, finalAttrName))) {
              ps.addWarning(ParseErrorKind.DuplicatedAttribute, finalAttrName.location)
            } else {
              element.attributes.push({ name: finalAttrName, value: isValueUnspecified ? null : (result.kind === 'Value' ? result.value : null), prefix: { kind: 'None' } })
            }
          } else if (element.type === 'Slot') {
            element.values.push({ name: finalAttrName, value: isValueUnspecified ? null : (result.kind === 'Value' ? result.value : null), prefixLocation: null })
          }
          break
        }
        case 'Id': {
          if (element.type === 'Normal') {
            element.common.id = [finalAttrName.location, unwrapValue()]
          } else if (element.type === 'Slot') {
            element.common.id = [finalAttrName.location, unwrapValue()]
          }
          break
        }
        case 'Slot': {
          if (element.type === 'Normal') {
            element.common.slot = [finalAttrName.location, unwrapValue()]
          } else if (element.type === 'Slot') {
            element.common.slot = [finalAttrName.location, unwrapValue()]
          }
          break
        }
        case 'ClassString': {
          if (element.type === 'Normal') {
            element.class = { kind: 'String', location: finalAttrName.location, value: unwrapValue() }
          }
          break
        }
        case 'StyleString': {
          if (element.type === 'Normal') {
            element.style = { kind: 'String', location: finalAttrName.location, value: unwrapValue() }
          }
          break
        }
        case 'TemplateName': {
          if (result.kind === 'StaticStr') {
            templateName = [finalAttrName.location, result.value]
          }
          break
        }
        case 'TemplateIs': {
          if (element.type === 'TemplateRef') {
            element.target = [finalAttrName.location, unwrapValue()]
          }
          break
        }
        case 'TemplateData': {
          if (element.type === 'TemplateRef') {
            element.data = [finalAttrName.location, unwrapValue()]
          }
          break
        }
        case 'SlotName': {
          if (element.type === 'Slot') {
            element.name = [finalAttrName.location, unwrapValue()]
          }
          break
        }
        case 'Module': {
          if (result.kind === 'StaticStr') {
            scriptModule = [finalAttrName.location, result.value]
          }
          break
        }
        case 'DataHyphen': {
          if (element.type === 'Normal') {
            const value = result.kind === 'Value'
              ? result.value
              : result.kind === 'StaticStr'
                ? { kind: 'Static', value: result.value.name, location: finalAttrName.location } as const
                : null
            if (value) {
              element.common.data.push({ name: finalAttrName, value, prefixLocation: null })
            }
          } else if (element.type === 'Slot') {
            const value = result.kind === 'Value'
              ? result.value
              : result.kind === 'StaticStr'
                ? { kind: 'Static', value: result.value.name, location: finalAttrName.location } as const
                : null
            if (value) {
              element.common.data.push({ name: finalAttrName, value, prefixLocation: null })
            }
          }
          break
        }
        default:
          break
      }
    } else {
      const ak = attrKind as { t: string; loc: Range<Position> }
      switch (ak.t) {
        case 'WxIf':
          wxIf = [ak.loc, unwrapValue()]
          break
        case 'WxElif':
          wxElif = [ak.loc, unwrapValue()]
          break
        case 'WxElse':
          wxElse = ak.loc
          break
        case 'WxFor':
          wxFor = [ak.loc, unwrapValue()]
          break
        case 'WxForIndex':
          if (result.kind === 'ScopeName') wxForIndex = [ak.loc, result.value]
          break
        case 'WxForItem':
          if (result.kind === 'ScopeName') wxForItem = [ak.loc, result.value]
          break
        case 'WxKey':
          if (result.kind === 'StaticStr') wxKey = [ak.loc, result.value]
          break
        case 'Src':
          if (element.type === 'Include' && result.kind === 'StaticStr') {
            element.path = [finalAttrName.location, result.value]
          }
          break
        case 'Model':
          if (element.type === 'Normal') {
            element.attributes.push({ name: finalAttrName, value: isValueUnspecified ? null : (result.kind === 'Value' ? result.value : null), prefix: { kind: 'Model', location: ak.loc } })
          }
          break
        case 'Change':
          if (element.type === 'Normal') {
            element.changeAttributes.push({ name: finalAttrName, value: isValueUnspecified ? null : (result.kind === 'Value' ? result.value : null), prefixLocation: ak.loc })
          }
          break
        case 'Worklet':
          if (element.type === 'Normal' && result.kind === 'StaticStr') {
            element.workletAttributes.push({ name: finalAttrName, value: result.value, prefixLocation: ak.loc })
          }
          break
        case 'Data':
          if (element.type === 'Normal' || element.type === 'Slot') {
            const common = element.type === 'Normal' ? element.common : element.common
            common.data.push({ name: finalAttrName, value: isValueUnspecified ? null : (result.kind === 'Value' ? result.value : null), prefixLocation: ak.loc })
          }
          break
        case 'Class':
          if (element.type === 'Normal') {
            classAttrs.push([ak.loc, finalAttrName, isValueUnspecified ? null : (result.kind === 'Value' ? result.value : null)])
          }
          break
        case 'Style':
          if (element.type === 'Normal') {
            styleAttrs.push([ak.loc, finalAttrName, isValueUnspecified ? valueNewEmpty(finalAttrName.location.end) : unwrapValue()])
          }
          break
        case 'Bind':
          addEventBinding(ps, element, finalAttrName, result, false, false, false, ak.loc)
          break
        case 'MutBind':
          addEventBinding(ps, element, finalAttrName, result, false, true, false, ak.loc)
          break
        case 'Catch':
          addEventBinding(ps, element, finalAttrName, result, true, false, false, ak.loc)
          break
        case 'CaptureBind':
          addEventBinding(ps, element, finalAttrName, result, false, false, true, ak.loc)
          break
        case 'CaptureMutBind':
          addEventBinding(ps, element, finalAttrName, result, false, true, true, ak.loc)
          break
        case 'CaptureCatch':
          addEventBinding(ps, element, finalAttrName, result, true, false, true, ak.loc)
          break
        case 'Mark':
          if (element.type === 'Normal' || element.type === 'Slot') {
            const common = element.type === 'Normal' ? element.common : element.common
            common.marks.push({ name: finalAttrName, value: isValueUnspecified ? null : (result.kind === 'Value' ? result.value : null), prefixLocation: ak.loc })
          }
          break
        case 'Generic':
          if (element.type === 'Normal' && result.kind === 'StaticStr') {
            element.generics.push({ name: finalAttrName, value: result.value, prefixLocation: ak.loc })
          }
          break
        case 'ExtraAttr':
          if (element.type === 'Normal' && result.kind === 'StaticStr') {
            element.extraAttr.push({ name: finalAttrName, value: result.value, prefixLocation: ak.loc })
          }
          break
        case 'SlotDataRef':
          if (result.kind === 'ScopeName') {
            if (element.type === 'Normal') {
              element.common.slotValueRefs.push({ name: finalAttrName, value: result.value, prefixLocation: ak.loc })
            } else if (element.type === 'Slot') {
              element.common.slotValueRefs.push({ name: finalAttrName, value: result.value, prefixLocation: ak.loc })
            } else if (element.type === 'Pure') {
              element.slotValueRefs.push({ name: finalAttrName, value: result.value, prefixLocation: ak.loc })
            }
          }
          break
        case 'LetVar':
          if (element.type === 'Normal' || element.type === 'Pure') {
            const letVars = element.type === 'Normal' ? element.letVars : element.letVars
            letVars.push({ name: finalAttrName, value: isValueUnspecified ? null : (result.kind === 'Value' ? result.value : null), prefixLocation: ak.loc })
          }
          break
        default:
          break
      }
    }
  }

  // apply class/style colon attrs
  if (element.type === 'Normal') {
    if (classAttrs.length > 0) {
      element.class = { kind: 'Multiple', entries: classAttrs }
    }
    if (styleAttrs.length > 0) {
      element.style = { kind: 'Multiple', entries: styleAttrs }
    }
  }

  // close tag
  const startTagEndLoc = ps.position()
  const isSelfClose = ps.peekStr('/>')
  const closeLoc = ps.consumeStr('/>') ?? ps.consumeStr('>')
  if (closeLoc === null) {
    // incomplete tag
    ps.addWarning(ParseErrorKind.IncompleteTag, startTagStartLoc)
    return
  }

  // determine script module info
  type ScriptModuleContent = {
    moduleLoc: Range<Position>
    moduleName: StrName
    path: [Range<Position>, StrName]
    content: string
    contentLoc: Range<Position>
  } | null
  let scriptModuleContent: ScriptModuleContent = null

  if (externalTagType === 'Script') {
    const moduleLocAndName = scriptModule
    const modLoc = moduleLocAndName?.[0] ?? range(defaultAttrPos, defaultAttrPos)
    const modName = moduleLocAndName?.[1] ?? strNameNewEmpty(defaultAttrPos)

    const path = element.type === 'Include' ? element.path : [range(defaultAttrPos, defaultAttrPos), strNameNewEmpty(defaultAttrPos)] as [Range<Position>, StrName]
    let content = ''
    let contentLoc = range(ps.position(), ps.position())

    if (!isSelfClose) {
      // read until </wxs>
      const contentStart = ps.position()
      const contentStartIndex = ps.curByteIndex()
      const contentStr = ps.skipUntilBefore('</wxs>')
      if (contentStr !== null) {
        content = contentStr
        contentLoc = range(contentStart, ps.position())
        ps.skipUntilAfter('>')
      } else {
        ps.addWarning(ParseErrorKind.MissingEndTag, tagName.location)
      }
    }

    scriptModuleContent = { moduleLoc: modLoc, moduleName: modName, path, content, contentLoc }
  }

  // parse children (if not self-close and not script)
  let newChildren: Node[] = []
  let closeTagLoc: Range<Position> | null = null
  let endTagLoc: [Range<Position>, Range<Position>] | null = null

  if (!isSelfClose && externalTagType !== 'Script') {
    const result = parseChildren(ps, globals, tagName.name)
    newChildren = result.children
    closeTagLoc = result.closeLoc
    endTagLoc = result.endTagLoc
  }

  const finalCloseLoc = closeTagLoc ?? closeLoc
  const tagLocation: TagLocation = {
    start: [startTagStartLoc, range(startTagEndLoc, ps.position())],
    close: finalCloseLoc,
    end: endTagLoc,
  }

  // write resources list
  if (element.type === 'Include') {
    switch (externalTagType) {
      case 'Include':
        globals.includes.push({
          tagLocation,
          srcLocation: element.path[0],
          src: element.path[1],
        })
        break
      case 'Import':
        globals.imports.push({
          tagLocation,
          srcLocation: element.path[0],
          src: element.path[1],
        })
        break
      case 'Script':
        break
    }
  }

  // write script
  if (scriptModuleContent !== null) {
    const { moduleLoc, moduleName, path, content, contentLoc } = scriptModuleContent
    if (path[1].name === '') {
      globals.scripts.push({
        kind: 'Inline',
        tagLocation,
        moduleLocation: moduleLoc,
        moduleName,
        content,
        contentLocation: contentLoc,
      })
    } else {
      if (content.trim().length > 0) {
        ps.addWarning(ParseErrorKind.ChildNodesNotAllowed, contentLoc)
      }
      globals.scripts.push({
        kind: 'GlobalRef',
        tagLocation,
        moduleLocation: moduleLoc,
        moduleName,
        srcLocation: path[0],
        src: path[1],
      })
    }
    return // script elements are not added to ret
  }

  // write element to output
  if (externalTagType === 'Import') {
    if (newChildren.length > 0) {
      ps.addWarning(ParseErrorKind.ChildNodesNotAllowed, nodeLocation(newChildren[0]!))
    }
    return // import elements are not added to ret
  }

  if (templateName !== null) {
    const [nameLoc, name] = templateName
    if (globals.subTemplates.find((t) => strNameNameEq(t.name, name))) {
      ps.addWarning(ParseErrorKind.DuplicatedName, name.location)
    } else {
      globals.subTemplates.push({
        tagLocation,
        nameLocation: nameLoc,
        name,
        content: newChildren,
      })
    }
    return
  }

  // determine if conditions
  const ifCondition: IfCondition =
    wxIf !== null ? { kind: 'If', location: wxIf[0], value: wxIf[1] } :
    wxElif !== null ? { kind: 'Elif', location: wxElif[0], value: wxElif[1] } :
    wxElse !== null ? { kind: 'Else', location: wxElse } :
    { kind: 'None' }

  // determine for list
  const forList: ForList =
    wxFor !== null ? {
      kind: 'For',
      list: wxFor,
      itemName: wxForItem ?? [range(defaultAttrPos, defaultAttrPos), { name: DEFAULT_FOR_ITEM_SCOPE_NAME, location: range(defaultAttrPos, defaultAttrPos) }],
      indexName: wxForIndex ?? [range(defaultAttrPos, defaultAttrPos), { name: DEFAULT_FOR_INDEX_SCOPE_NAME, location: range(defaultAttrPos, defaultAttrPos) }],
      key: wxKey ?? [range(defaultAttrPos, defaultAttrPos), strNameNewEmpty(defaultAttrPos)],
    } : { kind: 'None' }

  // helper: wrap children for pure block optimization
  const wrapChildren = (wrapped: Element): Node[] => {
    const wk = wrapped.kind
    if (wk.type === 'Pure' && wk.slot === null && wk.slotValueRefs.length === 0 && wk.letVars.length === 0) {
      return wk.children
    }
    return [{ kind: 'Element', element: wrapped }]
  }

  // create the wrapped element
  const wrappedElement: Element = {
    kind: element,
    tagLocation,
  }
  if (wrappedElement.kind.type === 'Normal' ||
    wrappedElement.kind.type === 'Pure' ||
    wrappedElement.kind.type === 'For') {
    wrappedElement.kind.children = newChildren
  } else if (newChildren.length > 0) {
    ps.addWarning(ParseErrorKind.ChildNodesNotAllowed, nodeLocation(newChildren[0]!))
  }

  // handle if/elif/else
  const findIfElementIndex = (nodes: Node[]): number => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]!
      if (n.kind === 'Element' && n.element.kind.type === 'If') return i
      if (n.kind === 'Comment') continue
      break
    }
    return -1
  }

  let finalElement: Element | null = wrappedElement

  if (ifCondition.kind === 'If') {
    const branches: Array<[Range<Position>, Value, Node[]]> = [
      [ifCondition.location, ifCondition.value, wrapChildren(wrappedElement)],
    ]
    finalElement = {
      kind: { type: 'If', branches, elseBranch: null },
      tagLocation,
    }
  } else if (ifCondition.kind === 'Elif') {
    const ifIdx = findIfElementIndex(ret)
    if (ifIdx >= 0) {
      const comments = ret.splice(ifIdx + 1)
      const children = [...comments, ...wrapChildren(wrappedElement)]
      const ifNode = ret[ifIdx]!
      if (ifNode.kind === 'Element' && ifNode.element.kind.type === 'If') {
        ifNode.element.kind.branches.push([ifCondition.location, ifCondition.value, children])
        if (endTagLoc !== null) ifNode.element.tagLocation.end = endTagLoc
        else ifNode.element.tagLocation.end = tagLocation.start
      }
      finalElement = null
    } else {
      ps.addWarning(ParseErrorKind.InvalidAttribute, ifCondition.location)
    }
  } else if (ifCondition.kind === 'Else') {
    const ifIdx = findIfElementIndex(ret)
    if (ifIdx >= 0) {
      const comments = ret.splice(ifIdx + 1)
      const children = [...comments, ...wrapChildren(wrappedElement)]
      const ifNode = ret[ifIdx]!
      if (ifNode.kind === 'Element' && ifNode.element.kind.type === 'If') {
        ifNode.element.kind.elseBranch = [ifCondition.location, children]
        if (endTagLoc !== null) ifNode.element.tagLocation.end = endTagLoc
        else ifNode.element.tagLocation.end = tagLocation.start
      }
      finalElement = null
    } else {
      ps.addWarning(ParseErrorKind.InvalidAttribute, ifCondition.location)
    }
  }

  // wrap for list
  if (forList.kind === 'For' && finalElement !== null) {
    const children = wrapChildren(finalElement)
    finalElement = {
      kind: {
        type: 'For',
        list: forList.list,
        itemName: forList.itemName,
        indexName: forList.indexName,
        key: forList.key,
        children,
      },
      tagLocation,
    }
  }

  if (finalElement !== null) {
    ret.push({ kind: 'Element', element: finalElement })
  }
}

function addEventBinding(
  ps: ParseState,
  element: ElementKind,
  attrName: Ident,
  result: AttrParseResult,
  isCatch: boolean,
  isMut: boolean,
  isCapture: boolean,
  prefixLoc: Range<Position>,
): void {
  if (
    element.type === 'Normal' ||
    element.type === 'Slot'
  ) {
    const value = result.kind === 'Value' ? result.value : null
    element.common.eventBindings.push({
      name: attrName,
      value,
      isCatch,
      isMut,
      isCapture,
      prefixLocation: prefixLoc,
    })
  } else {
    ps.addWarning(ParseErrorKind.InvalidAttribute, attrName.location)
  }
}

interface ParseChildrenResult {
  children: Node[]
  closeLoc: Range<Position>
  endTagLoc: [Range<Position>, Range<Position>] | null
}

function parseChildren(ps: ParseState, globals: TemplateGlobals, parentTagName: string): ParseChildrenResult {
  const children: Node[] = []
  parseVecNode(ps, globals, children)

  const closeLoc = ps.position()
  let endTagLoc: [Range<Position>, Range<Position>] | null = null

  if (ps.peekStr('</')) {
    const endTagStart = ps.consumeStr('</')!
    ps.skipWhitespace()
    const endTagName = parseColonSeparated(ps)
    const endTagEndPos = ps.position()
    const remaining = ps.skipUntilBefore('>')
    if (remaining !== null && remaining.length > 0) {
      ps.addWarning(ParseErrorKind.UnexpectedCharacter, range(endTagEndPos, ps.position()))
    }
    ps.next() // '>'
    endTagLoc = [endTagStart, range(endTagEndPos, ps.position())]
  } else {
    ps.addWarning(ParseErrorKind.MissingEndTag, range(closeLoc, closeLoc))
  }

  return { children, closeLoc: range(closeLoc, closeLoc), endTagLoc }
}

// ---------------------------------------------------------------------------
// Template public helpers
// ---------------------------------------------------------------------------

export function templateGlobalScopes(tmpl: Template): StrName[] {
  return tmpl.globals.scripts.map((s) => s.moduleName)
}

export function templateDirectDependencies(tmpl: Template): string[] {
  return [
    ...tmpl.globals.imports.map((p) => resolvePath(tmpl.path, p.src.name)),
    ...tmpl.globals.includes.map((p) => resolvePath(tmpl.path, p.src.name)),
  ]
}

export function templateScriptDependencies(tmpl: Template): string[] {
  return tmpl.globals.scripts
    .filter((s) => s.kind === 'GlobalRef')
    .map((s) => resolvePath(tmpl.path, (s as Extract<Script, {kind:'GlobalRef'}>).src.name))
}

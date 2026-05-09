// JS code generation writer system — mirrors src/proc_gen/mod.rs
//
// Key design:
//   JsTopScopeWriter — collects top-level `var` declarations (topDeclares) and
//                      statement strings (subStrs), assembled in finish().
//   JsFunctionScopeWriter — writes statement sequences to a shared string buffer.
//   JsExprWriter     — writes expressions to the same buffer; can open nested
//                      functions/parens/blocks.
//
// Variable naming: first 26 slots (A-Z) are reserved for the runtime.
// Generated idents start at slot 26 → 'a', 'b', ..., 'z', 'aA', 'bA', ...
//
// Mirrors the Rust const arrays:
//   VAR_NAME_CHARS        = ['_','0'-'9','A'-'Z','a'-'z'] (63 chars)
//   VAR_NAME_START_CHARS  = ['A'-'Z','a'-'z']              (52 chars)
//   VAR_NAME_INDEX_PRESERVE = 26  (A-Z are reserved)

import { TmplError } from '../types'

// ---------------------------------------------------------------------------
// Character tables for variable name generation
// ---------------------------------------------------------------------------
const VAR_NAME_START_CHARS: string =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' // 52 chars
const VAR_NAME_CHARS: string =
  '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' // 63 chars
const VAR_NAME_INDEX_PRESERVE = 26 // slots 0-25 (A-Z) are reserved

function getVarName(varId: number): string {
  let name = VAR_NAME_START_CHARS[varId % VAR_NAME_START_CHARS.length]!
  varId = Math.floor(varId / VAR_NAME_START_CHARS.length)
  while (varId > 0) {
    name += VAR_NAME_CHARS[varId % VAR_NAME_CHARS.length]!
    varId = Math.floor(varId / VAR_NAME_CHARS.length)
  }
  return name
}

// ---------------------------------------------------------------------------
// JsIdent
// ---------------------------------------------------------------------------
export class JsIdent {
  readonly name: string
  constructor(name: string) {
    this.name = name
  }
  toString(): string {
    return this.name
  }
}

// ---------------------------------------------------------------------------
// BlockState — mirrors JsBlockStat in Rust
// ---------------------------------------------------------------------------
export class BlockState {
  needStatSep: boolean = false
  identIdInc: number = VAR_NAME_INDEX_PRESERVE
  privateIdentIdInc: number = 0

  extend(): BlockState {
    const b = new BlockState()
    b.needStatSep = false
    b.identIdInc = this.identIdInc
    b.privateIdentIdInc = this.privateIdentIdInc
    return b
  }

  align(from: BlockState): void {
    this.identIdInc = from.identIdInc
    this.privateIdentIdInc = from.privateIdentIdInc
  }
}

// ---------------------------------------------------------------------------
// StringBuf — thin mutable wrapper so nested writers share the same buffer
// ---------------------------------------------------------------------------
class StringBuf {
  s: string = ''
  write(chunk: string): void {
    this.s += chunk
  }
}

// ---------------------------------------------------------------------------
// JsTopScopeWriter — mirrors JsTopScopeWriter<W> in Rust
// ---------------------------------------------------------------------------
export class JsTopScopeWriter {
  private topDeclares: string[] = []
  private subStrs: string[] = []
  readonly block: BlockState = new BlockState()

  /** Align this writer's ident counter from a child JsFunctionScopeWriter. */
  align(w: JsFunctionScopeWriter): void {
    this.block.align(w.getBlock())
  }

  finish(): string {
    let ret = ''
    let first = true
    if (this.topDeclares.length > 0) {
      ret += 'var ' + this.topDeclares.join(',')
      first = false
    }
    for (const sub of this.subStrs) {
      if (first) {
        first = false
      } else {
        ret += ';'
      }
      ret += sub
    }
    return ret
  }

  functionScope(f: (w: JsFunctionScopeWriter) => void): void {
    const buf = new StringBuf()
    const savedSep = this.block.needStatSep
    this.block.needStatSep = false
    f(new JsFunctionScopeWriter(buf, null, this))
    this.subStrs.push(buf.s)
    this.block.needStatSep = savedSep
  }

  exprScope(f: (w: JsExprWriter) => void): void {
    this.functionScope((w) => w.exprStmt((ew) => f(ew)))
  }

  declareOnTop(name: string): void {
    this.topDeclares.push(name)
  }

  declareOnTopInit(name: string, init: (w: JsExprWriter) => void): void {
    const buf = new StringBuf()
    buf.write(name + '=')
    const savedSep = this.block.needStatSep
    this.block.needStatSep = false
    init(new JsExprWriter(buf, null, this))
    this.topDeclares.push(buf.s)
    this.block.needStatSep = savedSep
  }
}

// ---------------------------------------------------------------------------
// JsFunctionScopeWriter — mirrors JsFunctionScopeWriter<W> in Rust
// ---------------------------------------------------------------------------
export class JsFunctionScopeWriter {
  private buf: StringBuf
  private block: BlockState | null // null → use top_scope.block
  private topScope: JsTopScopeWriter

  constructor(buf: StringBuf, block: BlockState | null, topScope: JsTopScopeWriter) {
    this.buf = buf
    this.block = block
    this.topScope = topScope
  }

  getBlock(): BlockState {
    return this.block ?? this.topScope.block
  }

  private stat(f: (w: this) => void): void {
    const b = this.getBlock()
    if (b.needStatSep) {
      this.buf.write(';')
    } else {
      b.needStatSep = true
    }
    f(this)
  }

  genIdent(): JsIdent {
    const b = this.getBlock()
    const id = b.identIdInc++
    return new JsIdent(getVarName(id))
  }

  genPrivateIdent(): JsIdent {
    const b = this.getBlock()
    const id = b.privateIdentIdInc++
    return new JsIdent('$' + getVarName(id))
  }

  customStmtStr(content: string): void {
    const b = this.getBlock()
    if (b.needStatSep) {
      b.needStatSep = false
      this.buf.write(';')
    }
    this.buf.write(content)
  }

  exprStmt(f: (w: JsExprWriter) => void): void {
    this.stat((_this) => {
      f(new JsExprWriter(_this.buf, _this.block, _this.topScope))
    })
  }

  setVarOnTopScope(name: string): void {
    this.topScope.declareOnTop(name)
  }

  setVarOnTopScopeInit(name: string, init: (w: JsExprWriter) => void): void {
    this.topScope.declareOnTopInit(name, init)
  }

  declareVarOnTopScope(): JsIdent {
    const b = this.topScope.block
    const id = b.identIdInc++
    const ident = new JsIdent(getVarName(id))
    this.topScope.declareOnTop(ident.name)
    return ident
  }

  declareVarOnTopScopeInit(init: (w: JsExprWriter, ident: JsIdent) => void): JsIdent {
    const b = this.topScope.block
    const id = b.identIdInc++
    const varName = getVarName(id)
    const ident = new JsIdent(varName)
    this.topScope.declareOnTopInit(varName, (w) => init(w, ident))
    return ident
  }

  /** Write to the underlying buffer directly (for use in complex code gen). */
  write(s: string): void {
    this.buf.write(s)
  }
}

// ---------------------------------------------------------------------------
// JsExprWriter — mirrors JsExprWriter<W> in Rust
// ---------------------------------------------------------------------------
export class JsExprWriter {
  private buf: StringBuf
  private block: BlockState | null
  private topScope: JsTopScopeWriter

  constructor(buf: StringBuf, block: BlockState | null, topScope: JsTopScopeWriter) {
    this.buf = buf
    this.block = block
    this.topScope = topScope
  }

  private getBlock(): BlockState {
    return this.block ?? this.topScope.block
  }

  /** Write a raw string fragment into the expression buffer. */
  write(s: string): void {
    this.buf.write(s)
  }

  /** `()=>{<f>}` */
  function(f: (w: JsFunctionScopeWriter) => void): void {
    this.buf.write('()=>{')
    const childBlock = this.getBlock().extend()
    f(new JsFunctionScopeWriter(this.buf, childBlock, this.topScope))
    this.buf.write('}')
  }

  /** `(<args>)=>{<f>}` */
  functionArgs(args: string, f: (w: JsFunctionScopeWriter) => void): void {
    this.buf.write('(' + args + ')=>{')
    const childBlock = this.getBlock().extend()
    f(new JsFunctionScopeWriter(this.buf, childBlock, this.topScope))
    this.buf.write('}')
  }

  /** Same as `functionArgs` but args are generated idents, returned to caller. */
  functionDynArgs(
    argsF: (assigner: JsFunctionArgsAssigner) => JsIdent[],
    f: (w: JsFunctionScopeWriter, args: JsIdent[]) => void,
  ): void {
    const childBlock = this.getBlock().extend()
    const assigner = new JsFunctionArgsAssigner(childBlock, this.topScope)
    const args = argsF(assigner)
    this.buf.write('(' + args.map((a) => a.name).join(',') + ')=>{')
    f(new JsFunctionScopeWriter(this.buf, childBlock, this.topScope), args)
    this.buf.write('}')
  }

  /** `{<f>}` (bare block, no `function` keyword) */
  braceBlock(f: (w: JsFunctionScopeWriter) => void): void {
    this.buf.write('{')
    const childBlock = this.getBlock().extend()
    f(new JsFunctionScopeWriter(this.buf, childBlock, this.topScope))
    this.buf.write('}')
  }

  /** `(<f>)` */
  paren(f: (w: JsExprWriter) => void): void {
    this.buf.write('(')
    f(this)
    this.buf.write(')')
  }

  declareVarOnTopScope(): JsIdent {
    const b = this.topScope.block
    const id = b.identIdInc++
    const ident = new JsIdent(getVarName(id))
    this.topScope.declareOnTop(ident.name)
    return ident
  }

  /** Expose genIdent for cases where we need a fresh ident in an expr context. */
  genIdent(): JsIdent {
    const b = this.getBlock()
    const id = b.identIdInc++
    return new JsIdent(getVarName(id))
  }
}

// ---------------------------------------------------------------------------
// JsFunctionArgsAssigner — mirrors JsFunctionArgsAssigner<W> in Rust
// ---------------------------------------------------------------------------
export class JsFunctionArgsAssigner {
  private block: BlockState | null
  private topScope: JsTopScopeWriter

  constructor(block: BlockState | null, topScope: JsTopScopeWriter) {
    this.block = block
    this.topScope = topScope
  }

  private getBlock(): BlockState {
    return this.block ?? this.topScope.block
  }

  genIdent(): JsIdent {
    const b = this.getBlock()
    const id = b.identIdInc++
    return new JsIdent(getVarName(id))
  }
}

// ---------------------------------------------------------------------------
// ScopeVar / ScopeVarLvaluePath — mirrors the same types in proc_gen/mod.rs
// ---------------------------------------------------------------------------
export type ScopeVarLvaluePath =
  | { kind: 'Invalid' }
  | { kind: 'Var'; varName: JsIdent; fromDataScope: boolean }
  | { kind: 'Script'; absPath: string }
  | { kind: 'InlineScript'; path: string; modName: string }

export interface ScopeVar {
  var: JsIdent
  updatePathTree: JsIdent | null
  lvaluePath: ScopeVarLvaluePath
}

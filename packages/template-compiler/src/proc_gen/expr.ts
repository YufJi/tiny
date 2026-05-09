import { genLitStr } from '../escape'
import type { JsExprWriter, JsFunctionScopeWriter, JsIdent, ScopeVar } from './writer'
import type { Expression } from '../parse/expr'

// Expression precedence levels — mirrors stringify/expr.rs
export const enum ExpressionLevel {
  Lit = 0,
  Member,
  Unary,
  Multiply,
  Plus,
  Shift,
  Comparison,
  Eq,
  BitAnd,
  BitXor,
  BitOr,
  LogicAnd,
  LogicOr,
  Cond,
}

export function expressionLevelFromExpression(expr: Expression): ExpressionLevel {
  switch (expr.kind) {
    case 'ScopeRef': return ExpressionLevel.Lit
    case 'DataField': return ExpressionLevel.Lit
    case 'ToStringWithoutUndefined': return ExpressionLevel.Member
    case 'LitUndefined': return ExpressionLevel.Lit
    case 'LitNull': return ExpressionLevel.Lit
    case 'LitStr': return ExpressionLevel.Lit
    case 'LitInt': return ExpressionLevel.Lit
    case 'LitFloat': return ExpressionLevel.Lit
    case 'LitBool': return ExpressionLevel.Lit
    case 'LitObj': return ExpressionLevel.Lit
    case 'LitArr': return ExpressionLevel.Lit
    case 'StaticMember': return ExpressionLevel.Member
    case 'DynamicMember': return ExpressionLevel.Member
    case 'FuncCall': return ExpressionLevel.Member
    case 'Reverse': return ExpressionLevel.Unary
    case 'BitReverse': return ExpressionLevel.Unary
    case 'Positive': return ExpressionLevel.Unary
    case 'Negative': return ExpressionLevel.Unary
    case 'TypeOf': return ExpressionLevel.Unary
    case 'Void': return ExpressionLevel.Unary
    case 'Multiply': return ExpressionLevel.Multiply
    case 'Divide': return ExpressionLevel.Multiply
    case 'Remainer': return ExpressionLevel.Multiply
    case 'Plus': return ExpressionLevel.Plus
    case 'Minus': return ExpressionLevel.Plus
    case 'LeftShift': return ExpressionLevel.Shift
    case 'RightShift': return ExpressionLevel.Shift
    case 'UnsignedRightShift': return ExpressionLevel.Shift
    case 'Lt': return ExpressionLevel.Comparison
    case 'Gt': return ExpressionLevel.Comparison
    case 'Lte': return ExpressionLevel.Comparison
    case 'Gte': return ExpressionLevel.Comparison
    case 'InstanceOf': return ExpressionLevel.Comparison
    case 'Eq': return ExpressionLevel.Eq
    case 'Ne': return ExpressionLevel.Eq
    case 'EqFull': return ExpressionLevel.Eq
    case 'NeFull': return ExpressionLevel.Eq
    case 'BitAnd': return ExpressionLevel.BitAnd
    case 'BitXor': return ExpressionLevel.BitXor
    case 'BitOr': return ExpressionLevel.BitOr
    case 'LogicAnd': return ExpressionLevel.LogicAnd
    case 'LogicOr': return ExpressionLevel.LogicOr
    case 'NullishCoalescing': return ExpressionLevel.Cond
    case 'Cond': return ExpressionLevel.Cond
    default: return ExpressionLevel.Lit
  }
}

function procGenExpressionLevel(expr: Expression): ExpressionLevel {
  switch (expr.kind) {
    case 'ScopeRef': return ExpressionLevel.Lit
    case 'DataField': return ExpressionLevel.Member
    case 'ToStringWithoutUndefined': return ExpressionLevel.Member
    case 'LitUndefined': return ExpressionLevel.Lit
    case 'LitNull': return ExpressionLevel.Lit
    case 'LitStr': return ExpressionLevel.Lit
    case 'LitInt': return ExpressionLevel.Lit
    case 'LitFloat': return ExpressionLevel.Lit
    case 'LitBool': return ExpressionLevel.Lit
    case 'LitObj': return ExpressionLevel.Member
    case 'LitArr': return ExpressionLevel.Member
    case 'StaticMember': return ExpressionLevel.Member
    case 'DynamicMember': return ExpressionLevel.Member
    case 'FuncCall': return ExpressionLevel.Member
    case 'Reverse': return ExpressionLevel.Unary
    case 'BitReverse': return ExpressionLevel.Unary
    case 'Positive': return ExpressionLevel.Unary
    case 'Negative': return ExpressionLevel.Unary
    case 'TypeOf': return ExpressionLevel.Unary
    case 'Void': return ExpressionLevel.Unary
    case 'Multiply': return ExpressionLevel.Multiply
    case 'Divide': return ExpressionLevel.Multiply
    case 'Remainer': return ExpressionLevel.Multiply
    case 'Plus': return ExpressionLevel.Plus
    case 'Minus': return ExpressionLevel.Plus
    case 'LeftShift': return ExpressionLevel.Shift
    case 'RightShift': return ExpressionLevel.Shift
    case 'UnsignedRightShift': return ExpressionLevel.Shift
    case 'Lt': return ExpressionLevel.Comparison
    case 'Gt': return ExpressionLevel.Comparison
    case 'Lte': return ExpressionLevel.Comparison
    case 'Gte': return ExpressionLevel.Comparison
    case 'InstanceOf': return ExpressionLevel.Comparison
    case 'Eq': return ExpressionLevel.Eq
    case 'Ne': return ExpressionLevel.Eq
    case 'EqFull': return ExpressionLevel.Eq
    case 'NeFull': return ExpressionLevel.Eq
    case 'BitAnd': return ExpressionLevel.BitAnd
    case 'BitXor': return ExpressionLevel.BitXor
    case 'BitOr': return ExpressionLevel.BitOr
    case 'LogicAnd': return ExpressionLevel.LogicAnd
    case 'LogicOr': return ExpressionLevel.LogicOr
    case 'NullishCoalescing': return ExpressionLevel.Cond
    case 'Cond': return ExpressionLevel.Cond
    default: return ExpressionLevel.Lit
  }
}

// PathSlice types — mirrors proc_gen/expr.rs
type PathSlice =
  | { kind: 'Ident'; name: string }
  | { kind: 'ScopeIndex'; index: number }
  | { kind: 'StaticMember'; name: string }
  | { kind: 'IndirectValue'; ident: JsIdent }
  | { kind: 'CombineObj'; fields: Array<[string | null, PathAnalysisState, PathSliceList[]]> }
  | { kind: 'CombineArr'; items: Array<[PathAnalysisState, PathSliceList[]]>; spread: Array<[PathAnalysisState, PathSliceList[]]> }
  | { kind: 'Condition'; ident: JsIdent; trueBr: [PathAnalysisState, PathSliceList[]]; falseBr: [PathAnalysisState, PathSliceList[]] }

class PathSliceList {
  constructor(public slices: PathSlice[]) {}

  static toPathAnalysisStrGroupPrefix(
    list: PathSliceList[],
    scopes: ScopeVar[],
    isTemplateData: boolean,
  ): string {
    if (list.length === 0) return ''
    let w = '!!'
    if (list.length > 1) w += '('
    for (let i = 0; i < list.length; i++) {
      if (i > 0) w += '||'
      w += list[i]!.toPathAnalysisStr(scopes, isTemplateData)
    }
    if (list.length > 1) w += ')'
    w += '||'
    return w
  }

  isLegalLvaluePath(scopes: ScopeVar[], model: boolean | null): boolean {
    if (this.slices.length === 0) return false
    const first = this.slices[0]!
    switch (first.kind) {
      case 'Ident':
        if (model === false) return false
        break
      case 'ScopeIndex': {
        const lp = scopes[first.index]!.lvaluePath
        if (lp.kind === 'Invalid') return false
        if (lp.kind === 'Var') {
          if (model === true && !lp.fromDataScope) return false
          if (model === false && lp.fromDataScope) return false
        } else {
          // Script or InlineScript
          if (model === true) return false
        }
        break
      }
      case 'Condition': {
        const [truePas] = first.trueBr
        const [falsePas] = first.falseBr
        const trueOk = truePas.kind === 'InPath' && truePas.path.isLegalLvaluePath(scopes, model)
        const falseOk = falsePas.kind === 'InPath' && falsePas.path.isLegalLvaluePath(scopes, model)
        if (!trueOk && !falseOk) return false
        break
      }
      default:
        return false
    }
    for (let i = 1; i < this.slices.length; i++) {
      const s = this.slices[i]!
      if (s.kind !== 'StaticMember' && s.kind !== 'IndirectValue') return false
    }
    return true
  }

  toLvaluePathArr(w: JsExprWriter, scopes: ScopeVar[], model: boolean | null): void {
    const writeCondOrBracket = () => {
      const firstSlice = this.slices[0]!
      if (firstSlice.kind === 'Condition' && this.slices.length === 1) {
        w.write(`${firstSlice.ident}?`)
        pasWriteLvaluePath(firstSlice.trueBr[0], w, scopes, model)
        w.write(':')
        pasWriteLvaluePath(firstSlice.falseBr[0], w, scopes, model)
        return
      }
      if (firstSlice.kind === 'Condition') {
        w.write(`${firstSlice.ident}?`)
        const trueRes = pasWriteLvaluePath(firstSlice.trueBr[0], w, scopes, model)
        if (trueRes) {
          w.write('.concat(')
          writeBracket()
          w.write(')')
        }
        w.write(':')
        const falseRes = pasWriteLvaluePath(firstSlice.falseBr[0], w, scopes, model)
        if (falseRes) {
          w.write('.concat(')
          writeBracket()
          w.write(')')
        }
        return
      }
      writeBracket()
    }

    const writeBracket = () => {
      w.write('[')
      let needSlice1 = false
      let needComma = true
      const iter = this.slices[Symbol.iterator]()
      const firstResult = iter.next()
      if (firstResult.done) {
        w.write(']')
        return
      }
      const first = firstResult.value as PathSlice
      if (model === true) {
        switch (first.kind) {
          case 'Ident':
            w.write(`${genLitStr(first.name)}`)
            break
          case 'ScopeIndex': {
            const lp = scopes[first.index]!.lvaluePath
            if (lp.kind === 'Var' && lp.fromDataScope) {
              w.write(`...${lp.varName}`)
              needSlice1 = true
            }
            break
          }
          case 'Condition':
            needComma = false
            break
          default:
            w.write(']')
            return
        }
      } else {
        switch (first.kind) {
          case 'Ident':
            w.write(`0,${genLitStr(first.name)}`)
            break
          case 'ScopeIndex': {
            const lp = scopes[first.index]!.lvaluePath
            if (lp.kind === 'Invalid') { w.write(']'); return }
            if (lp.kind === 'Var') w.write(`...${lp.varName}`)
            else if (lp.kind === 'Script') w.write(`1,${genLitStr(lp.absPath)}`)
            else w.write(`2,${genLitStr(lp.path)},${genLitStr(lp.modName)}`)
            break
          }
          default:
            w.write(']')
            return
        }
      }
      for (const s of iter) {
        if (needComma) w.write(',')
        else needComma = true
        if (s.kind === 'StaticMember') w.write(`${genLitStr(s.name)}`)
        else if (s.kind === 'IndirectValue') w.write(`${s.ident}`)
        else break
      }
      w.write(']')
      if (needSlice1) w.write('.slice(1)')
    }

    writeCondOrBracket()
  }

  toPathAnalysisStr(scopes: ScopeVar[], isTemplateData: boolean): string {
    let ret = ''
    for (const ps of this.slices) {
      switch (ps.kind) {
        case 'Ident':
          ret += `U.${ps.name}`
          break
        case 'ScopeIndex': {
          const upt = scopes[ps.index]!.updatePathTree
          ret += upt !== null ? `${upt}` : 'undefined'
          break
        }
        case 'StaticMember':
          ret = `Z(${ret},${genLitStr(ps.name)})`
          break
        case 'IndirectValue':
          ret = `Z(${ret},${ps.ident})`
          break
        case 'CombineObj': {
          let s = ''
          let prepend = ''
          let needObjectAssign = false
          let nextNeedCommaSep = false
          for (const [key, subPas, subP] of ps.fields) {
            const subS = pasToPathAnalysisStr(subPas, subP, scopes, isTemplateData)
            if (subS !== null) {
              if (key !== null) {
                if (nextNeedCommaSep) s += ','
                s += `${key}:${subS}`
                nextNeedCommaSep = true
              } else {
                prepend += `(${subS})===true||`
                s += `},X(${subS}),{`
                needObjectAssign = true
                nextNeedCommaSep = false
              }
            }
          }
          if (isTemplateData) {
            if (needObjectAssign) ret += `${prepend}Object.assign({${s}})`
            else ret += `${prepend}{${s}}`
          } else {
            if (needObjectAssign) ret += `${prepend}Q.b(Object.assign({${s}}))`
            else ret += `${prepend}Q.b({${s}})`
          }
          break
        }
        case 'CombineArr': {
          for (const [subPas, subP] of ps.spread) {
            const subS = pasToPathAnalysisStr(subPas, subP, scopes, isTemplateData)
            if (subS !== null) {
              ret += `(${subS})!==undefined||`
            }
          }
          ret += 'Q.a(['
          let nextNeedCommaSep = false
          for (const [subPas, subP] of ps.items) {
            if (nextNeedCommaSep) ret += ','
            const s = pasToPathAnalysisStr(subPas, subP, scopes, isTemplateData)
            if (s !== null) {
              ret += s
              nextNeedCommaSep = true
            }
          }
          ret += '])'
          break
        }
        case 'Condition': {
          ret += `(${ps.ident}?`
          const trueRes = pasToPathAnalysisStr(ps.trueBr[0], ps.trueBr[1], scopes, isTemplateData)
          if (trueRes !== null) ret += trueRes
          else ret += 'undefined'
          ret += ':'
          const falseRes = pasToPathAnalysisStr(ps.falseBr[0], ps.falseBr[1], scopes, isTemplateData)
          if (falseRes !== null) ret += falseRes
          else ret += 'undefined'
          ret += ')'
          break
        }
      }
    }
    return ret
  }
}

type PathAnalysisState =
  | { kind: 'InPath'; path: PathSliceList }
  | { kind: 'NotInPath' }

function pasToPathAnalysisStr(
  pas: PathAnalysisState,
  subP: PathSliceList[],
  scopes: ScopeVar[],
  isTemplateData: boolean,
): string | null {
  const prefix = PathSliceList.toPathAnalysisStrGroupPrefix(subP, scopes, isTemplateData)
  let result: string | null = null
  if (pas.kind === 'InPath') {
    result = prefix + pas.path.toPathAnalysisStr(scopes, isTemplateData)
  } else if (subP.length > 0) {
    result = prefix + 'undefined'
  }
  return result
}

function pasWriteLvaluePath(
  pas: PathAnalysisState,
  w: JsExprWriter,
  scopes: ScopeVar[],
  model: boolean | null,
): boolean {
  if (pas.kind === 'InPath' && pas.path.isLegalLvaluePath(scopes, model)) {
    pas.path.toLvaluePathArr(w, scopes, model)
    return true
  } else {
    w.write('null')
    return false
  }
}

// ========================
// Core: to_proc_gen_rec
// ========================

function exprToProcGenRec(
  expr: Expression,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  allowLevel: ExpressionLevel,
  pathCalc: PathSliceList[],
  value: { s: string },
): PathAnalysisState {
  if (procGenExpressionLevel(expr) > allowLevel) {
    value.s += '('
    const ret = exprToProcGenRec(expr, w, scopes, ExpressionLevel.Cond, pathCalc, value)
    value.s += ')'
    return ret
  }

  switch (expr.kind) {
    case 'ScopeRef': {
      const scope = scopes[expr.index]!
      value.s += `${scope.var}`
      const lp = scope.lvaluePath
      if (lp.kind === 'Script' || lp.kind === 'InlineScript') {
        return { kind: 'InPath', path: new PathSliceList([{ kind: 'ScopeIndex', index: expr.index }]) }
      }
      if (scope.updatePathTree !== null) {
        return { kind: 'InPath', path: new PathSliceList([{ kind: 'ScopeIndex', index: expr.index }]) }
      }
      return { kind: 'NotInPath' }
    }

    case 'DataField':
      value.s += `D.${expr.name}`
      return { kind: 'InPath', path: new PathSliceList([{ kind: 'Ident', name: expr.name }]) }

    case 'ToStringWithoutUndefined':
      value.s += 'Y('
      exprToProcGenRecAndEndPath(expr.value, w, scopes, ExpressionLevel.Cond, pathCalc, value)
      value.s += ')'
      return { kind: 'NotInPath' }

    case 'LitUndefined':
      value.s += 'undefined'
      return { kind: 'NotInPath' }

    case 'LitNull':
      value.s += 'null'
      return { kind: 'NotInPath' }

    case 'LitStr':
      value.s += genLitStr(expr.value)
      return { kind: 'NotInPath' }

    case 'LitInt':
      value.s += `${expr.value}`
      return { kind: 'NotInPath' }

    case 'LitFloat':
      value.s += `${expr.value}`
      return { kind: 'NotInPath' }

    case 'LitBool':
      value.s += `${expr.value}`
      return { kind: 'NotInPath' }

    case 'LitObj': {
      let s = ''
      let needObjectAssign = false
      let nextNeedCommaSep = false
      const subPasList: Array<[string | null, PathAnalysisState, PathSliceList[]]> = []
      for (const field of expr.fields) {
        if (field.kind === 'Named') {
          if (nextNeedCommaSep) s += ','
          s += `${field.name}:`
          const sv = { s }
          const [pas, subP] = exprToProcGenRecAndCombinePaths(field.value, w, scopes, ExpressionLevel.Cond, sv)
          s = sv.s
          nextNeedCommaSep = true
          subPasList.push([field.name, pas, subP])
        } else {
          // Spread
          s += '},X('
          const sv = { s }
          const [pas, subP] = exprToProcGenRecAndCombinePaths(field.value, w, scopes, ExpressionLevel.Cond, sv)
          s = sv.s
          s += '),{'
          needObjectAssign = true
          nextNeedCommaSep = false
          subPasList.push([null, pas, subP])
        }
      }
      if (needObjectAssign) {
        value.s += `Object.assign({${s}})`
      } else {
        value.s += `{${s}}`
      }
      return { kind: 'InPath', path: new PathSliceList([{ kind: 'CombineObj', fields: subPasList }]) }
    }

    case 'LitArr': {
      let s = ''
      let needArrayConcat = false
      let nextNeedCommaSep = false
      const subPasList: Array<[PathAnalysisState, PathSliceList[]]> = []
      const spreadSubPasList: Array<[PathAnalysisState, PathSliceList[]]> = []
      for (const field of expr.fields) {
        if (field.kind === 'Normal') {
          if (nextNeedCommaSep) s += ','
          const sv = { s }
          const [pas, subP] = exprToProcGenRecAndCombinePaths(field.value, w, scopes, ExpressionLevel.Cond, sv)
          s = sv.s
          nextNeedCommaSep = true
          const targetList = spreadSubPasList.length > 0 ? spreadSubPasList : subPasList
          targetList.push([pas, subP])
        } else if (field.kind === 'Spread') {
          s += '],'
          const sv = { s }
          const [pas, subP] = exprToProcGenRecAndCombinePaths(field.value, w, scopes, ExpressionLevel.Cond, sv)
          s = sv.s
          s += ',['
          needArrayConcat = true
          nextNeedCommaSep = false
          spreadSubPasList.push([pas, subP])
        } else {
          // EmptySlot
          if (nextNeedCommaSep) s += ','
          s += ','
          nextNeedCommaSep = false
          const targetList = spreadSubPasList.length > 0 ? spreadSubPasList : subPasList
          targetList.push([{ kind: 'NotInPath' }, []])
        }
      }
      if (needArrayConcat) {
        value.s += `[].concat([${s}])`
      } else {
        value.s += `[${s}]`
      }
      return { kind: 'InPath', path: new PathSliceList([{ kind: 'CombineArr', items: subPasList, spread: spreadSubPasList }]) }
    }

    case 'StaticMember': {
      value.s += 'X('
      const pas = exprToProcGenRec(expr.obj, w, scopes, ExpressionLevel.Cond, pathCalc, value)
      value.s += `).${expr.fieldName}`
      if (pas.kind === 'InPath') {
        pas.path.slices.push({ kind: 'StaticMember', name: expr.fieldName })
      }
      return pas
    }

    case 'DynamicMember': {
      const ident = (() => {
        const id = w.genPrivateIdent()
        const sv = { s: '' }
        exprToProcGenRecAndEndPath(expr.fieldName, w, scopes, ExpressionLevel.Cond, pathCalc, sv)
        w.exprStmt((ww) => { ww.write(`var ${id}=${sv.s}`) })
        return id
      })()
      value.s += 'X('
      const pas = exprToProcGenRec(expr.obj, w, scopes, ExpressionLevel.Cond, pathCalc, value)
      value.s += `)[${ident}]`
      if (pas.kind === 'InPath') {
        pas.path.slices.push({ kind: 'IndirectValue', ident })
      }
      return pas
    }

    case 'FuncCall': {
      value.s += 'P('
      exprToProcGenRecAndEndPath(expr.func, w, scopes, ExpressionLevel.Cond, pathCalc, value)
      value.s += ')('
      for (let i = 0; i < expr.args.length; i++) {
        if (i > 0) value.s += ','
        exprToProcGenRecAndEndPath(expr.args[i]!, w, scopes, ExpressionLevel.Cond, pathCalc, value)
      }
      value.s += ')'
      return { kind: 'NotInPath' }
    }

    case 'Reverse':
      value.s += '!'
      exprToProcGenRecAndEndPath(expr.value, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'BitReverse':
      value.s += '~'
      exprToProcGenRecAndEndPath(expr.value, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Positive':
      value.s += ' +'
      exprToProcGenRecAndEndPath(expr.value, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Negative':
      value.s += ' -'
      exprToProcGenRecAndEndPath(expr.value, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'TypeOf':
      value.s += ' typeof '
      exprToProcGenRecAndEndPath(expr.value, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Void':
      value.s += ' void '
      exprToProcGenRecAndEndPath(expr.value, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Multiply':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Multiply, pathCalc, value)
      value.s += '*'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Divide':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Multiply, pathCalc, value)
      value.s += '/'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Remainer':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Multiply, pathCalc, value)
      value.s += '%'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Unary, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Plus':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Plus, pathCalc, value)
      value.s += '+'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Multiply, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Minus':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Plus, pathCalc, value)
      value.s += '-'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Multiply, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'LeftShift':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Shift, pathCalc, value)
      value.s += '<<'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Plus, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'RightShift':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Shift, pathCalc, value)
      value.s += '>>'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Plus, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'UnsignedRightShift':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Shift, pathCalc, value)
      value.s += '>>>'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Plus, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Lt':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      value.s += '<'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Shift, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Gt':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      value.s += '>'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Shift, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Lte':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      value.s += '<='
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Shift, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Gte':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      value.s += '>='
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Shift, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'InstanceOf':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      value.s += ' instanceof '
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Shift, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Eq':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Eq, pathCalc, value)
      value.s += '=='
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'Ne':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Eq, pathCalc, value)
      value.s += '!='
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'EqFull':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Eq, pathCalc, value)
      value.s += '==='
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'NeFull':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Eq, pathCalc, value)
      value.s += '!=='
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Comparison, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'BitAnd':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.BitAnd, pathCalc, value)
      value.s += '&'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Eq, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'BitXor':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.BitOr, pathCalc, value)
      value.s += '^'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.BitAnd, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'BitOr':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.BitOr, pathCalc, value)
      value.s += '|'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.BitXor, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'LogicAnd':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.LogicAnd, pathCalc, value)
      value.s += '&&'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.BitOr, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'LogicOr':
      exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.LogicOr, pathCalc, value)
      value.s += '||'
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.LogicAnd, pathCalc, value)
      return { kind: 'NotInPath' }

    case 'NullishCoalescing': {
      const ident = (() => {
        const id = w.genPrivateIdent()
        const sv = { s: '' }
        exprToProcGenRecAndEndPath(expr.left, w, scopes, ExpressionLevel.Cond, pathCalc, sv)
        w.exprStmt((ww) => { ww.write(`var ${id}=${sv.s}`) })
        return id
      })()
      value.s += `${ident}?${ident}:`
      exprToProcGenRecAndEndPath(expr.right, w, scopes, ExpressionLevel.Cond, pathCalc, value)
      return { kind: 'NotInPath' }
    }

    case 'Cond': {
      const ident = (() => {
        const id = w.genPrivateIdent()
        const sv = { s: '' }
        exprToProcGenRecAndEndPath(expr.cond, w, scopes, ExpressionLevel.Cond, pathCalc, sv)
        w.exprStmt((ww) => { ww.write(`var ${id}=${sv.s}`) })
        return id
      })()
      value.s += `${ident}?`
      const trueBr = exprToProcGenRecAndCombinePaths(expr.trueBr, w, scopes, ExpressionLevel.Cond, value)
      value.s += ':'
      const falseBr = exprToProcGenRecAndCombinePaths(expr.falseBr, w, scopes, ExpressionLevel.Cond, value)
      return { kind: 'InPath', path: new PathSliceList([{ kind: 'Condition', ident, trueBr, falseBr }]) }
    }
  }
}

function exprToProcGenRecAndEndPath(
  expr: Expression,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  allowLevel: ExpressionLevel,
  pathCalc: PathSliceList[],
  value: { s: string },
): void {
  const pas = exprToProcGenRec(expr, w, scopes, allowLevel, pathCalc, value)
  if (pas.kind === 'InPath') {
    pathCalc.push(pas.path)
  }
}

function exprToProcGenRecAndCombinePaths(
  expr: Expression,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  allowLevel: ExpressionLevel,
  value: { s: string },
): [PathAnalysisState, PathSliceList[]] {
  const pathCalc: PathSliceList[] = []
  const pas = exprToProcGenRec(expr, w, scopes, allowLevel, pathCalc, value)
  return [pas, pathCalc]
}

// ========================
// ExpressionProcGen
// ========================

export class ExpressionProcGen {
  private pas: PathAnalysisState
  private subP: PathSliceList[]
  public value: string
  private level: ExpressionLevel

  constructor(pas: PathAnalysisState, subP: PathSliceList[], value: string, level: ExpressionLevel) {
    this.pas = pas
    this.subP = subP
    this.value = value
    this.level = level
  }

  isLvaluePathFromDataScope(scopes: ScopeVar[]): boolean | null {
    const hasModel = this.hasModelLvaluePath(scopes)
    const hasScript = this.hasScriptLvaluePath(scopes)
    if (hasModel && hasScript) return null
    if (hasModel) return true
    if (hasScript) return false
    return null
  }

  hasModelLvaluePath(scopes: ScopeVar[]): boolean {
    return this.pas.kind === 'InPath' && this.pas.path.isLegalLvaluePath(scopes, true)
  }

  hasScriptLvaluePath(scopes: ScopeVar[]): boolean {
    return this.pas.kind === 'InPath' && this.pas.path.isLegalLvaluePath(scopes, false)
  }

  hasGeneralLvaluePath(scopes: ScopeVar[]): boolean {
    return this.pas.kind === 'InPath' && this.pas.path.isLegalLvaluePath(scopes, null)
  }

  lvaluePath(w: JsExprWriter, scopes: ScopeVar[], model: boolean | null): void {
    pasWriteLvaluePath(this.pas, w, scopes, model)
  }

  lvalueStateExpr(w: JsExprWriter, scopes: ScopeVar[], isTemplateData: boolean): void {
    const result = pasToPathAnalysisStr(this.pas, this.subP, scopes, isTemplateData)
    if (result !== null) {
      w.write(result)
    } else {
      w.write('undefined')
    }
  }

  valueExpr(w: JsExprWriter): void {
    w.write(this.value)
  }

  aboveCondExpr(): boolean {
    return this.level >= ExpressionLevel.Cond
  }
}

export function exprToProcGenPrepare(
  expr: Expression,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
): ExpressionProcGen {
  const value = { s: '' }
  const level = expressionLevelFromExpression(expr)
  const [pas, subP] = exprToProcGenRecAndCombinePaths(expr, w, scopes, ExpressionLevel.Cond, value)
  return new ExpressionProcGen(pas, subP, value.s, level)
}

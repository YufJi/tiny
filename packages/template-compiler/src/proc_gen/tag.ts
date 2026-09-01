// proc_gen/tag.ts — mirrors proc_gen/tag.rs
// Generates JavaScript code from parsed template ASTs.

import { JsExprWriter, JsFunctionScopeWriter, JsIdent, JsTopScopeWriter, ScopeVar, ScopeVarLvaluePath } from './writer'
import { BindingMapCollector } from '../binding_map'
import { genLitStr, camelToDash } from '../escape'
import { resolve } from '../path'
import { exprToProcGenPrepare, ExpressionProcGen } from './expr'
import {
  Template, Node, Element, Value, Attribute, EventBinding,
  ClassAttribute, StyleAttribute, CommonElementAttributes, NormalAttribute, StaticAttribute,
} from '../parse/tag'
import type { Expression } from '../parse/expr'
import { BindingMapKeys } from '../binding_map'
import { Position, Range } from '../types'

// TmplGroup-like interface needed for code generation
export interface TmplGroupRef {
  dev(): boolean
  getTmpl(path: string): Template | null
}

// ---------------------------------------------------------------------------
// templateToProcGen — top-level entry point mirrors impl Template { to_proc_gen }
// ---------------------------------------------------------------------------

export function templateToProcGen(
  tmpl: Template,
  w: JsExprWriter,
  group: TmplGroupRef,
): void {
  w.paren((inner) => {
    inner.function((fw) => {
      fw.exprStmt((ww) => { ww.write('var H={}') })
      fw.exprStmt((ww) => { ww.write('var S') })
      fw.exprStmt((ww) => {
        ww.write('var I=')
        ww.functionArgs('P', (iw) => {
          iw.exprStmt((ww) => {
            ww.write('if(!S)S=Object.assign({}')
            for (const imp of tmpl.globals.imports) {
              const p = resolve(tmpl.path, imp.src.name)
              ww.write(`,(G[${genLitStr(p)}]||{})._`)
            }
            ww.write(',H)')
          })
          iw.exprStmt((ww) => { ww.write('return S[P]') })
        })
      })

      // Script scopes (after H/S/I; use genIdent so names are sequential with other vars)
      const scopes: ScopeVar[] = []
      let hasScripts = false
      for (const script of tmpl.globals.scripts) {
        hasScripts = true
        const varIdent = fw.genIdent()
        let lvaluePath: ScopeVarLvaluePath
        if (script.kind === 'GlobalRef') {
          const absPath = resolve(tmpl.path, script.src.name)
          fw.exprStmt((ww) => { ww.write(`var ${varIdent.name}=R[${genLitStr(absPath)}]()`) })
          lvaluePath = { kind: 'Script', absPath }
        } else {
          fw.exprStmt((ww) => {
            ww.write(`var ${varIdent.name}=D(${genLitStr(tmpl.path + '#' + script.moduleName.name)},(require,exports,module)=>{${script.content}})()`)
          })
          lvaluePath = { kind: 'InlineScript', path: tmpl.path, modName: script.moduleName.name }
        }
        scopes.push({ var: varIdent, updatePathTree: null, lvaluePath })
      }

      // Sub-templates
      for (const subTmpl of tmpl.globals.subTemplates) {
        const bmc = new BindingMapCollector()
        writeTemplateItem(subTmpl.name.name, fw, scopes, bmc, subTmpl.content, hasScripts, group, tmpl.path)
      }

      // Main template
      writeTemplateItem('', fw, scopes, tmpl.globals.bindingMapCollector, tmpl.content, hasScripts, group, tmpl.path)

      fw.exprStmt((ww) => {
        ww.write('return Object.assign(function(R){return H[R]},{_:H})')
      })
    })
  })
  // IIFE invocation: (function(){...})()
  w.paren((_) => {})
}

// ---------------------------------------------------------------------------
// writeTemplateItem — internal helper
// ---------------------------------------------------------------------------

export function writeTemplateItem(
  key: string,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
  children: Node[],
  hasScripts: boolean,
  group: TmplGroupRef,
  curPath: string,
): void {
  w.exprStmt((ew) => {
    ew.write(`H[${genLitStr(key)}]=`)
    ew.functionArgs('R,C,D,U,A', (w) => {
      if (hasScripts) {
        w.exprStmt((w) => { w.write('R.setFnFilter(Q.A,Q.B)') })
      }
      w.exprStmt((w) => {
        w.write("if(typeof R.setEventListenerWrapper==='function')R.setEventListenerWrapper(Q.C)")
      })
      const topWriter = new JsTopScopeWriter()
      topWriter.align(w)
      let defineRootIdent!: JsIdent
      topWriter.functionScope((w) => {
        w.setVarOnTopScopeInit('L', (w) => { w.write('R.c') })
        w.setVarOnTopScopeInit('M', (w) => { w.write('R.m') })
        w.setVarOnTopScopeInit('O', (w) => { w.write('R.r') })
        w.setVarOnTopScopeInit('A', (ww) => {
          ww.write('A||{')
          let idx = 0
          for (const [fieldKey, size] of bmc.listFields()) {
            if (idx > 0) ww.write(',')
            ww.write(`${genLitStr(fieldKey)}:new Array(${size})`)
            idx++
          }
          ww.write('}')
        })
        w.setVarOnTopScopeInit('K', (w) => { w.write('U===true') })

        defineRootIdent = w.declareVarOnTopScopeInit((ew, ident) => {
          nodesToProcGenDefineChildren(children, ew, scopes, (args, ew, varSlotMap, innerScopes) => {
            ew.functionArgs(args, (fw) => {
              nodesToProcGenDefineChildrenContent(children, varSlotMap, fw, innerScopes, bmc, group, curPath)
              fw.exprStmt((w) => { w.write('C=!1') })
              fw.exprStmt((w) => { w.write('U=Object.create(null)') })
              fw.exprStmt((w) => { w.write('K=!1') })
            })
          })
          return ident
        })
      })
      w.exprStmt((w) => { w.write(topWriter.finish()) })
      w.exprStmt((w) => { w.write(`return {C:${defineRootIdent},B:A}`) })
    })
  })
}

// ---------------------------------------------------------------------------
// Node code generation helpers
// ---------------------------------------------------------------------------

function nodeToProcGenFunctionArgs(list: Node[], withSlotValues: boolean): string {
  const Lvl = {
    None: 0, Text: 1, Element: 2, If: 3, For: 4, Slot: 5, Pure: 6, WithSlot: 7,
  } as const
  type L = typeof Lvl[keyof typeof Lvl]
  let level: L = Lvl.None

  if (withSlotValues) {
    level = Lvl.WithSlot
  } else {
    for (const c of list) {
      let nodeLevel: L = Lvl.None
      if (c.kind === 'Text') {
        nodeLevel = Lvl.Text
      } else if (c.kind === 'Element') {
        const et = c.element.kind.type
        if (et === 'Normal') nodeLevel = Lvl.Element
        else if (et === 'If') nodeLevel = Lvl.If
        else if (et === 'For') nodeLevel = Lvl.For
        else if (et === 'Slot') nodeLevel = Lvl.Slot
        else nodeLevel = Lvl.Pure  // Pure, Include, TemplateRef
      }
      if (nodeLevel > level) level = nodeLevel
    }
  }

  switch (level) {
    case Lvl.None: return 'C'
    case Lvl.Text: return 'C,T'
    case Lvl.Element: return 'C,T,E'
    case Lvl.If: return 'C,T,E,B'
    case Lvl.For: return 'C,T,E,B,F'
    case Lvl.Slot: return 'C,T,E,B,F,S'
    case Lvl.Pure: return 'C,T,E,B,F,S,J'
    default: return 'C,T,E,B,F,S,J,V,W'
  }
}

function elementSlotValueRefs(elem: Element): StaticAttribute[] | null {
  const kind = elem.kind
  if (kind.type === 'Pure') return kind.slotValueRefs.length > 0 ? kind.slotValueRefs : null
  if (kind.type === 'Normal') return kind.common.slotValueRefs.length > 0 ? kind.common.slotValueRefs : null
  return null
}

function nodesToProcGenDefineChildren(
  list: Node[],
  w: JsExprWriter,
  scopes: ScopeVar[],
  f: (args: string, w: JsExprWriter, varSlotMap: Map<string, JsIdent> | null, scopes: ScopeVar[]) => void,
): void {
  let varSlotMap: Map<string, JsIdent> | null = null
  for (const item of list) {
    if (item.kind === 'Element') {
      const refs = elementSlotValueRefs(item.element)
      if (refs) {
        for (const attr of refs) {
          if (!varSlotMap) varSlotMap = new Map()
          if (!varSlotMap.has(attr.name.name)) {
            varSlotMap.set(attr.name.name, new JsIdent(attr.name.name))
          }
        }
      }
    }
  }

  const args = nodeToProcGenFunctionArgs(list, varSlotMap !== null)
  f(args, w, varSlotMap, scopes)
}

function nodesToProcGenDefineChildrenContent(
  list: Node[],
  varSlotMap: Map<string, JsIdent> | null,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
  group: TmplGroupRef,
  curPath: string,
): void {
  if (varSlotMap !== null && varSlotMap.size > 0) {
    const topWriter = new JsTopScopeWriter()
    topWriter.align(w)
    const slotScopeVars = new Map<string, { scopeVar: JsIdent; uptVar: JsIdent }>()
    topWriter.functionScope((w) => {
      for (const [slotName] of varSlotMap!) {
        const scopeVar = w.declareVarOnTopScopeInit((ww, ident) => {
          ww.write(`X(V).${slotName}`)
          return ident
        })
        const uptVar = w.declareVarOnTopScopeInit((ww, ident) => {
          ww.write(`C?!0:W.${slotName}`)
          return ident
        })
        slotScopeVars.set(slotName, { scopeVar, uptVar })
      }
      nodesToProcGenDefineChildrenContentInner(list, slotScopeVars, w, scopes, bmc, group, curPath)
      for (const [, { uptVar }] of slotScopeVars) {
        w.exprStmt((ww) => { ww.write(`${uptVar}=undefined`) })
      }
    })
    w.exprStmt((ww) => { ww.write(topWriter.finish()) })
  } else {
    nodesToProcGenDefineChildrenContentInner(list, null, w, scopes, bmc, group, curPath)
  }
}

function nodesToProcGenDefineChildrenContentInner(
  list: Node[],
  slotScopeVars: Map<string, { scopeVar: JsIdent; uptVar: JsIdent }> | null,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
  group: TmplGroupRef,
  curPath: string,
): void {
  for (const c of list) {
    if (c.kind === 'Text') {
      const value = c.value
      if (value.kind === 'Static') {
        w.exprStmt((ww) => { ww.write(`C?T(${genLitStr(value.value)}):T()`) })
      } else {
        const p = exprToProcGenPrepare(value.expression, w, scopes)
        w.exprStmt((ww) => {
          ww.write('C||K||')
          p.lvalueStateExpr(ww, scopes, false)
          ww.write('?T(Y(')
          p.valueExpr(ww)
          ww.write(')')
          if (value.bindingMapKeys && !value.bindingMapKeys.isEmpty(bmc)) {
            ww.write(',')
            ww.functionArgs('N', (fw) => {
              value.bindingMapKeys!.toProcGenWriteMap(fw, bmc, (fw) => {
                const p2 = exprToProcGenPrepare(value.expression, fw, scopes)
                fw.exprStmt((ww) => {
                  ww.write('T(N,Y(')
                  p2.valueExpr(ww)
                  ww.write('))')
                })
              })
            })
          }
          ww.write('):T()')
        })
      }
    } else if (c.kind === 'Element') {
      // Push slot scope vars
      let slotVarsAdded = 0
      if (slotScopeVars) {
        const refs = elementSlotValueRefs(c.element)
        if (refs) {
          for (const attr of refs) {
            const entry = slotScopeVars.get(attr.name.name)
            if (entry) {
              scopes.push({
                var: entry.scopeVar,
                updatePathTree: entry.uptVar,
                lvaluePath: { kind: 'Invalid' },
              })
              slotVarsAdded++
            }
          }
        }
      }
      elementToProcGen(c.element, w, scopes, bmc, group, curPath)
      for (let i = 0; i < slotVarsAdded; i++) {
        scopes.pop()
      }
    }
    // Comment, UnknownMetaTag: skip
  }
}

// ---------------------------------------------------------------------------
// Element code generation
// ---------------------------------------------------------------------------

function elementToProcGen(
  elem: Element,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
  group: TmplGroupRef,
  curPath: string,
): void {
  const kind = elem.kind

  if (kind.type === 'Normal') {
    const letVarsCount = writeLetVars(w, scopes, kind.letVars)
    const slotKind = slotKindNew(kind.common.slot, w, scopes)
    let finalVarSlotNames: string[] | null = null

    const childIdent = w.declareVarOnTopScopeInit((ew, ident) => {
      nodesToProcGenDefineChildren(kind.children, ew, scopes, (args, ew, varSlotMap, innerScopes) => {
        if (varSlotMap) {
          finalVarSlotNames = [...varSlotMap.keys()]
        }
        ew.functionArgs(args, (fw) => {
          nodesToProcGenDefineChildrenContent(kind.children, varSlotMap, fw, innerScopes, bmc, group, curPath)
        })
      })
      return ident
    })

    // Extract dynamic slot pg before closures (for TypeScript narrowing safety)
    const dynamicSlotPg = slotKind.kind === 'Dynamic' ? slotKind.pg : null

    w.exprStmt((ew) => {
      ew.write(`E(${genLitStr(kind.tagName.name)},{`)
      for (let i = 0; i < kind.generics.length; i++) {
        if (i > 0) ew.write(',')
        const g = kind.generics[i]!
        ew.write(`${genLitStr(g.name.name)}:${genLitStr(g.value.name)}`)
      }
      ew.write('},')
      ew.functionArgs('N,C', (w) => {
        if (group.dev()) {
          w.exprStmt((ww) => {
            ww.write('R.devArgs(N).A=[')
            collectActiveAttributeNames(elem, (s) => { ww.write(`${s},`) })
            ww.write(']')
          })
        }
        for (const attr of kind.extraAttr) {
          w.exprStmt((ww) => {
            ww.write(`R.a(N,${genLitStr(attr.name.name)},${genLitStr(attr.value.name)})`)
          })
        }
        writeClassAttribute(kind.class, w, scopes, bmc)
        writeStyleAttribute(kind.style, w, scopes, bmc)
        for (const attr of kind.workletAttributes) {
          staticAttrToProcGenWorklet(attr, w)
        }
        for (const attr of kind.changeAttributes) {
          attrToProcGenAsChangeProperty(attr, w, scopes, bmc)
        }
        for (const attr of kind.attributes) {
          normalAttrToProcGenAsNormal(attr, w, scopes, bmc)
        }
        commonAttrsToProcGenWithoutSlot(kind.common, w, scopes, bmc)
        // Bug4: update slot binding map when slot name is dynamic with binding map keys
        if (dynamicSlotPg !== null) {
          const slot = kind.common.slot
          if (slot && slot[1].kind === 'Dynamic' && slot[1].bindingMapKeys && !slot[1].bindingMapKeys.isEmpty(bmc)) {
            slot[1].bindingMapKeys.toProcGenWriteMap(w, bmc, (fw) => {
              fw.exprStmt((ww) => {
                ww.write('R.s(N,')
                dynamicSlotPg.valueExpr(ww)
                ww.write(')')
              })
            })
          }
        }
      })
      ew.write(`,${childIdent}`)
      if (!slotKindIsNone(slotKind) || (finalVarSlotNames !== null && finalVarSlotNames.length > 0)) {
        slotKindWriteAsExtraArg(slotKind, ew)
        if (finalVarSlotNames && finalVarSlotNames.length > 0) {
          ew.write(',[')
          for (let i = 0; i < finalVarSlotNames.length; i++) {
            if (i > 0) ew.write(',')
            ew.write(genLitStr(finalVarSlotNames[i]!))
          }
          ew.write(']')
        }
      }
      ew.write(')')
    })
    clearLetVars(w, scopes, letVarsCount)
    return
  }

  if (kind.type === 'Pure') {
    const letVarsCount = writeLetVars(w, scopes, kind.letVars)
    const slotKind = slotKindNew(kind.slot, w, scopes)

    const childIdent = w.declareVarOnTopScopeInit((ew, ident) => {
      nodesToProcGenDefineChildren(kind.children, ew, scopes, (args, ew, varSlotMap, innerScopes) => {
        ew.functionArgs(args, (fw) => {
          nodesToProcGenDefineChildrenContent(kind.children, varSlotMap, fw, innerScopes, bmc, group, curPath)
        })
      })
      return ident
    })
    w.exprStmt((ew) => {
      ew.write(`J(${childIdent}`)
      slotKindWriteAsExtraArg(slotKind, ew)
      ew.write(')')
    })
    clearLetVars(w, scopes, letVarsCount)
    return
  }

  if (kind.type === 'If') {
    type PgEntry = { kind: 'Static'; v: string } | { kind: 'Dynamic'; p: ExpressionProcGen }
    const condPgs: PgEntry[] = []
    for (const branch of kind.branches) {
      const cond = branch[1]
      if (cond.kind === 'Static') {
        condPgs.push({ kind: 'Static', v: cond.value })
      } else {
        const p = exprToProcGenPrepare(cond.expression, w, scopes)
        condPgs.push({ kind: 'Dynamic', p })
      }
    }

    const varBranchIndex = w.declareVarOnTopScope()
    w.exprStmt((ww) => {
      ww.write(`${varBranchIndex}=`)
      for (let i = 0; i < condPgs.length; i++) {
        const cPg = condPgs[i]!
        if (cPg.kind === 'Static') {
          ww.write(`${genLitStr(cPg.v)}?${i + 1}:`)
        } else {
          if (cPg.p.aboveCondExpr()) {
            ww.write('('); cPg.p.valueExpr(ww); ww.write(')')
          } else {
            cPg.p.valueExpr(ww)
          }
          ww.write(`?${i + 1}:`)
        }
      }
      ww.write('0')
    })

    const allChildren: Node[] = [
      ...kind.branches.flatMap((b) => b[2]),
      ...(kind.elseBranch ? kind.elseBranch[1] : []),
    ]

    const childIdent = w.declareVarOnTopScopeInit((ew, ident) => {
      nodesToProcGenDefineChildren(allChildren, ew, scopes, (args, ew, varSlotMap, innerScopes) => {
        ew.functionArgs(args, (fw) => {
          fw.exprStmt((ww) => {
            for (let i = 0; i < kind.branches.length; i++) {
              if (i > 0) ww.write('else ')
              ww.write(`if(${varBranchIndex}===${i + 1})`)
              ww.braceBlock((fw) => {
                nodesToProcGenDefineChildrenContent(kind.branches[i]![2], varSlotMap, fw, innerScopes, bmc, group, curPath)
              })
            }
            if (kind.elseBranch) {
              ww.write('else')
              ww.braceBlock((fw) => {
                nodesToProcGenDefineChildrenContent(kind.elseBranch![1], varSlotMap, fw, innerScopes, bmc, group, curPath)
              })
            }
          })
        })
      })
      return ident
    })
    w.exprStmt((ww) => { ww.write(`B(${varBranchIndex},${childIdent})`) })
    return
  }

  if (kind.type === 'For') {
    let listPg: ExpressionProcGen | null = null
    let listStatic: string | null = null

    const listVal = kind.list[1]
    if (listVal.kind === 'Static') {
      listStatic = listVal.value
    } else {
      listPg = exprToProcGenPrepare(listVal.expression, w, scopes)
    }

    const lvalueFromDataScope = listPg ? listPg.isLvaluePathFromDataScope(scopes) : null

    const itemName = kind.itemName[1].name
    const indexName = kind.indexName[1].name

    const childIdent = w.declareVarOnTopScopeInit((ew, ident) => {
      nodesToProcGenDefineChildren(kind.children, ew, scopes, (args, ew, varSlotMap, innerScopes) => {
        ew.functionDynArgs(
          (assigner) => {
            // Generate 5 for-scope idents from the same block counter (aligns with Rust)
            const argScopeItem = assigner.genIdent()
            const argScopeIndex = assigner.genIdent()
            const argScopeItemUpt = assigner.genIdent()
            const argScopeIndexUpt = assigner.genIdent()
            const argScopeItemLvalue = assigner.genIdent()
            // Insert the 5 for-scope args after the first arg (C)
            const baseArgs = args.split(',').map((n) => new JsIdent(n))
            baseArgs.splice(1, 0, argScopeItem, argScopeIndex, argScopeItemUpt, argScopeIndexUpt, argScopeItemLvalue)
            return baseArgs
          },
          (fw, allArgs) => {
            const argScopeItem = allArgs[1]!
            const argScopeIndex = allArgs[2]!
            const argScopeItemUpt = allArgs[3]!
            const argScopeIndexUpt = allArgs[4]!
            const argScopeItemLvalue = allArgs[5]!
            const topWriter = new JsTopScopeWriter()
            topWriter.align(fw)
            topWriter.functionScope((w) => {
              innerScopes.push({
                var: argScopeItem,
                updatePathTree: argScopeItemUpt,
                lvaluePath: lvalueFromDataScope !== null
                  ? { kind: 'Var', varName: argScopeItemLvalue, fromDataScope: lvalueFromDataScope }
                  : { kind: 'Invalid' },
              })
              innerScopes.push({
                var: argScopeIndex,
                updatePathTree: argScopeIndexUpt,
                lvaluePath: { kind: 'Invalid' },
              })
              nodesToProcGenDefineChildrenContent(kind.children, varSlotMap, w, innerScopes, bmc, group, curPath)
              popScopeAndResetUpt(w, innerScopes)
              popScopeAndResetUpt(w, innerScopes)
            })
            fw.exprStmt((ww) => { ww.write(topWriter.finish()) })
          },
        )
      })
      return ident
    })

    w.exprStmt((ww) => {
      ww.write('F(')
      if (listStatic !== null) {
        ww.write(`${genLitStr(listStatic)},null,undefined,null,`)
      } else {
        listPg!.valueExpr(ww)
        const keyStr = kind.key[1].name === '' ? 'null' : genLitStr(kind.key[1].name)
        ww.write(`,${keyStr},C||K?undefined:`)
        listPg!.lvalueStateExpr(ww, scopes, false)
        ww.write(',')
        if (lvalueFromDataScope !== null) {
          listPg!.lvaluePath(ww, scopes, null)
        } else {
          ww.write('null')
        }
        ww.write(',')
      }
      ww.write(`${childIdent})`)
    })
    void itemName; void indexName
    return
  }

  if (kind.type === 'TemplateRef') {
    const varKey = w.declareVarOnTopScope()
    if (kind.target[1].kind === 'Static') {
      w.exprStmt((ww) => { ww.write(`${varKey}=${genLitStr((kind.target[1] as {kind:'Static'; value: string}).value)}`) })
    } else {
      const p = exprToProcGenPrepare(kind.target[1].expression, w, scopes)
      w.exprStmt((ww) => { ww.write(`${varKey}=`); p.valueExpr(ww) })
    }

    const childIdent = w.declareVarOnTopScopeInit((ew, ident) => {
      ew.functionArgs('C,T,E,B,F,S,J', (fw) => {
        const varTarget = fw.genPrivateIdent()
        fw.exprStmt((ww) => { ww.write(`var ${varTarget}=I(${varKey})`) })
        const dataVal = kind.data[1]
        if (dataVal.kind === 'Static') {
          fw.exprStmt((ww) => {
            ww.write(`if(${varKey}&&${varTarget})${varTarget}(R,C,${genLitStr(dataVal.value)},Object.create(null)).C(C,T,E,B,F,S,J)`)
          })
        } else {
          const p = exprToProcGenPrepare(dataVal.expression, fw, scopes)
          fw.exprStmt((ww) => {
            ww.write(`if(${varKey}&&${varTarget})${varTarget}(R,C,`)
            p.valueExpr(ww)
            ww.write(',K||(C?Object.create(null):')
            p.lvalueStateExpr(ww, scopes, true)
            ww.write(`)).C(C,T,E,B,F,S,J)`)
          })
        }
      })
      return ident
    })
    w.exprStmt((ww) => { ww.write(`B(${varKey},${childIdent})`) })
    return
  }

  if (kind.type === 'Include') {
    const normalizedPath = resolve(curPath, kind.path[1].name)
    const childIdent = w.declareVarOnTopScopeInit((ew, ident) => {
      ew.functionArgs('C,T,E,B,F,S,J', (fw) => {
        const varRef = fw.genPrivateIdent()
        fw.exprStmt((ww) => { ww.write(`var ${varRef}=G[${genLitStr(normalizedPath)}]`) })
        fw.exprStmt((ww) => {
          ww.write(`if(${varRef})${varRef}('')(R,C,D,U).C(C,T,E,B,F,S,J)`)
        })
      })
      return ident
    })
    w.exprStmt((ww) => { ww.write(`J(${childIdent})`) })
    return
  }

  if (kind.type === 'Slot') {
    const slotKind = slotKindNew(kind.common.slot, w, scopes)
    const name = kind.name
    const namePg = name[1].kind === 'Static' ? null : exprToProcGenPrepare(name[1].expression, w, scopes)

    w.exprStmt((ew) => {
      ew.write('S(')
      if (name[1].kind === 'Static') {
        ew.write(genLitStr(name[1].value))
      } else {
        ew.write('C||K||')
        namePg!.lvalueStateExpr(ew, scopes, false)
        ew.write('?Y(')
        namePg!.valueExpr(ew)
        ew.write('):undefined')
      }
      if (kind.values.length > 0 || !commonAttrsIsEmpty(kind.common)) {
        ew.write(',')
        ew.functionArgs('N', (fw) => {
          if (group.dev()) {
            fw.exprStmt((ww) => {
              ww.write('R.devArgs(N).A=[')
              collectActiveAttributeNames(elem, (s) => { ww.write(`${s},`) })
              ww.write(']')
            })
          }
          commonAttrsToProcGenWithoutSlot(kind.common, fw, scopes, bmc)
          for (const attr of kind.values) {
            slotValueAttrToProcGen(attr, fw, scopes, bmc)
          }
        })
      } else if (!slotKindIsNone(slotKind)) {
        ew.write(',undefined')
      }
      if (!slotKindIsNone(slotKind)) {
        slotKindWriteAsExtraArg(slotKind, ew)
      }
      ew.write(')')
    })
  }
}

// ---------------------------------------------------------------------------
// Attribute helpers
// ---------------------------------------------------------------------------

function writeAttributeValue(
  w: JsFunctionScopeWriter,
  methodName: string,
  value: Value,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  if (value.kind === 'Static') {
    w.exprStmt((ww) => { ww.write(`if(C)${methodName}(N,${genLitStr(value.value)})`) })
  } else {
    const p = exprToProcGenPrepare(value.expression, w, scopes)
    w.exprStmt((ww) => {
      ww.write('if(C||K||')
      p.lvalueStateExpr(ww, scopes, false)
      ww.write(`)${methodName}(N,`)
      p.valueExpr(ww)
      ww.write(')')
    })
    if (value.bindingMapKeys && !value.bindingMapKeys.isEmpty(bmc)) {
      value.bindingMapKeys.toProcGenWriteMap(w, bmc, (fw) => {
        const p2 = exprToProcGenPrepare(value.expression, fw, scopes)
        fw.exprStmt((ww) => {
          ww.write(`${methodName}(N,`)
          p2.valueExpr(ww)
          ww.write(')')
        })
      })
    }
  }
}

function commonAttrsToProcGenWithoutSlot(
  common: CommonElementAttributes,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  for (const attr of common.data) {
    const extra = attr.prefixLocation === null ? '!0' : null
    attrToProcGenWithMethod(attr, w, 'R.d', extra, scopes, bmc)
  }
  for (const mark of common.marks) {
    attrToProcGenWithMethod(mark, w, 'M', null, scopes, bmc)
  }
  for (const ev of common.eventBindings) {
    eventBindingToProcGen(ev, w, scopes, bmc)
  }
  if (common.id) {
    writeAttributeValue(w, 'R.i', common.id[1], scopes, bmc)
  }
}

function normalAttrToProcGenAsNormal(
  attr: NormalAttribute,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  const attrName = genLitStr(attr.name.name)
  if (attr.value === null) {
    w.exprStmt((ww) => { ww.write(`if(C)O(N,${attrName},true)`) })
    return
  }
  if (attr.value.kind === 'Static') {
    w.exprStmt((ww) => { ww.write(`if(C)O(N,${attrName},${genLitStr((attr.value as {kind:'Static'; value: string}).value)})`) })
    return
  }
  const isModel = attr.prefix.kind === 'Model'
  const maybeEvent = !isModel && attrNameMaybeEventBinding(attr.name.name)
  const p = exprToProcGenPrepare(attr.value.expression, w, scopes)
  w.exprStmt((ww) => {
    ww.write('if(C||K||')
    p.lvalueStateExpr(ww, scopes, false)
    ww.write(`)O(N,${attrName},`)
    p.valueExpr(ww)
    if (isModel && p.hasModelLvaluePath(scopes)) {
      ww.write(',')
      p.lvaluePath(ww, scopes, true)
    } else if (maybeEvent && p.hasScriptLvaluePath(scopes)) {
      ww.write(',undefined,')
      p.lvaluePath(ww, scopes, false)
    }
    ww.write(')')
  })
  if (attr.value.bindingMapKeys && !attr.value.bindingMapKeys.isEmpty(bmc)) {
    attr.value.bindingMapKeys.toProcGenWriteMap(w, bmc, (fw) => {
      const dynVal = attr.value as {kind:'Dynamic'; expression: Expression; bindingMapKeys: BindingMapKeys | null}
      const p2 = exprToProcGenPrepare(dynVal.expression, fw, scopes)
      fw.exprStmt((ww) => {
        ww.write(`O(N,${attrName},`)
        p2.valueExpr(ww)
        if (isModel && p2.hasModelLvaluePath(scopes)) {
          ww.write(',')
          p2.lvaluePath(ww, scopes, true)
        } else if (maybeEvent && p2.hasScriptLvaluePath(scopes)) {
          ww.write(',undefined,')
          p2.lvaluePath(ww, scopes, false)
        }
        ww.write(')')
      })
      fw.exprStmt((ww) => { ww.write('E(N)') })
    })
  }
}

function attrToProcGenWithMethod(
  attr: Attribute,
  w: JsFunctionScopeWriter,
  methodName: string,
  extraArg: string | null,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  const n = genLitStr(attr.name.name)
  const ea = extraArg ? `,${extraArg}` : ''
  if (attr.value === null) {
    w.exprStmt((ww) => { ww.write(`if(C)${methodName}(N,${n},true${ea})`) })
    return
  }
  if (attr.value.kind === 'Static') {
    w.exprStmt((ww) => { ww.write(`if(C)${methodName}(N,${n},${genLitStr((attr.value as {kind:'Static'; value: string}).value)}${ea})`) })
    return
  }
  const p = exprToProcGenPrepare((attr.value as {kind:'Dynamic'; expression: Expression}).expression, w, scopes)
  w.exprStmt((ww) => {
    ww.write('if(C||K||')
    p.lvalueStateExpr(ww, scopes, false)
    ww.write(`)${methodName}(N,${n},`)
    p.valueExpr(ww)
    ww.write(`${ea})`)
  })
  if (attr.value.bindingMapKeys && !attr.value.bindingMapKeys.isEmpty(bmc)) {
    attr.value.bindingMapKeys.toProcGenWriteMap(w, bmc, (fw) => {
      const dynVal2 = attr.value as {kind:'Dynamic'; expression: Expression; bindingMapKeys: BindingMapKeys | null}
      const p2 = exprToProcGenPrepare(dynVal2.expression, fw, scopes)
      fw.exprStmt((ww) => {
        ww.write(`${methodName}(N,${n},`)
        p2.valueExpr(ww)
        ww.write(`${ea})`)
      })
      fw.exprStmt((ww) => { ww.write('E(N)') })
    })
  }
}

function attrToProcGenAsChangeProperty(
  attr: Attribute,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  if (!attr.value || attr.value.kind === 'Static') return
  const n = genLitStr(attr.name.name)
  const p = exprToProcGenPrepare(attr.value.expression, w, scopes)
  w.exprStmt((ww) => {
    ww.write('if(C||K||')
    p.lvalueStateExpr(ww, scopes, false)
    ww.write(`)R.p(N,${n},`)
    p.valueExpr(ww)
    if (p.hasScriptLvaluePath(scopes)) {
      ww.write(',')
      p.lvaluePath(ww, scopes, false)
    }
    ww.write(')')
  })
  if (attr.value.bindingMapKeys && !attr.value.bindingMapKeys.isEmpty(bmc)) {
    attr.value.bindingMapKeys.toProcGenWriteMap(w, bmc, (fw) => {
      const dynVal3 = attr.value as {kind:'Dynamic'; expression: Expression; bindingMapKeys: BindingMapKeys | null}
      const p2 = exprToProcGenPrepare(dynVal3.expression, fw, scopes)
      fw.exprStmt((ww) => {
        ww.write(`R.p(N,${n},`)
        p2.valueExpr(ww)
        if (p2.hasScriptLvaluePath(scopes)) {
          ww.write(',')
          p2.lvaluePath(ww, scopes, false)
        }
        ww.write(')')
      })
    })
  }
}

function eventBindingToProcGen(
  ev: EventBinding,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  const n = genLitStr(ev.name.name)
  const isCatch = ev.isCatch ? '!0' : '!1'
  const isMut = ev.isMut ? '!0' : '!1'
  const isCapture = ev.isCapture ? '!0' : '!1'
  if (!ev.value || ev.value.kind === 'Static') {
    const v = genLitStr(ev.value?.value ?? '')
    w.exprStmt((ww) => { ww.write(`if(C)R.v(N,${n},${v},${isCatch},${isMut},${isCapture},!1)`) })
    return
  }
  const p = exprToProcGenPrepare(ev.value.expression, w, scopes)
  w.exprStmt((ww) => {
    ww.write('if(C||K||')
    p.lvalueStateExpr(ww, scopes, false)
    ww.write(`)R.v(N,${n},`)
    p.valueExpr(ww)
    ww.write(`,${isCatch},${isMut},${isCapture},!0`)
    if (p.hasScriptLvaluePath(scopes)) {
      ww.write(',')
      p.lvaluePath(ww, scopes, false)
    }
    ww.write(')')
  })
  if (ev.value.bindingMapKeys && !ev.value.bindingMapKeys.isEmpty(bmc)) {
    ev.value.bindingMapKeys.toProcGenWriteMap(w, bmc, (fw) => {
      const evDyn = ev.value as {kind:'Dynamic'; expression: Expression; bindingMapKeys: BindingMapKeys | null}
      const p2 = exprToProcGenPrepare(evDyn.expression, fw, scopes)
      fw.exprStmt((ww) => {
        ww.write(`R.v(N,${n},`)
        p2.valueExpr(ww)
        ww.write(`,${isCatch},${isMut},${isCapture},!0`)
        if (p2.hasScriptLvaluePath(scopes)) {
          ww.write(',')
          p2.lvaluePath(ww, scopes, false)
        }
        ww.write(')')
      })
    })
  }
}

function staticAttrToProcGenWorklet(attr: StaticAttribute, w: JsFunctionScopeWriter): void {
  w.exprStmt((ww) => {
    ww.write(`if(C)R.wl(N,${genLitStr(attr.name.name)},${genLitStr(attr.value.name)})`)
  })
}

function slotValueAttrToProcGen(
  attr: Attribute,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  const name = attr.name.name
  if (!attr.value || attr.value.kind === 'Static') {
    const v = genLitStr(attr.value?.value ?? '')
    w.exprStmt((ww) => { ww.write(`if(C)R.l(N,${genLitStr(name)},${v})`) })
    return
  }
  const p = exprToProcGenPrepare(attr.value.expression, w, scopes)
  w.exprStmt((ww) => {
    ww.write('if(C||K||')
    p.lvalueStateExpr(ww, scopes, false)
    ww.write(`)R.l(N,${genLitStr(name)},`)
    p.valueExpr(ww)
    if (attrNameMaybeEventBinding(name) && p.hasScriptLvaluePath(scopes)) {
      ww.write(',')
      p.lvaluePath(ww, scopes, false)
    }
    ww.write(')')
  })
}

function writeClassAttribute(
  cls: ClassAttribute,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  if (cls.kind === 'None') return
  if (cls.kind === 'String') {
    writeAttributeValue(w, 'L', cls.value, scopes, bmc)
    return
  }
  // Multiple class bindings
  const pList: Array<ExpressionProcGen | null> = []
  for (const [, , value] of cls.entries) {
    if (value && value.kind === 'Dynamic') {
      pList.push(exprToProcGenPrepare(value.expression, w, scopes))
    } else {
      pList.push(null)
    }
  }
  w.exprStmt((ww) => {
    ww.write('R.e(N,[')
    for (let i = 0; i < cls.entries.length; i++) {
      if (i > 0) ww.write(',')
      const [, name, value] = cls.entries[i]!
      const p = pList[i]!
      if (p) {
        ww.write('C||K||')
        p.lvalueStateExpr(ww, scopes, false)
        ww.write('?')
        p.valueExpr(ww)
        ww.write(`?${genLitStr(name.name)}:"":null`)
      } else {
        const staticName = value && value.kind === 'Static' ? value.value : name.name
        ww.write(genLitStr(staticName))
      }
    }
    ww.write('])')
  })
  for (let i = 0; i < cls.entries.length; i++) {
    const [, name, value] = cls.entries[i]!
    if (value && value.kind === 'Dynamic' && value.bindingMapKeys && !value.bindingMapKeys.isEmpty(bmc)) {
      value.bindingMapKeys.toProcGenWriteMap(w, bmc, (fw: JsFunctionScopeWriter) => {
        const p2 = exprToProcGenPrepare(value.expression, fw, scopes)
        fw.exprStmt((ww) => {
          ww.write(`R.ei(N,${i},`)
          p2.valueExpr(ww)
          ww.write(`?${genLitStr(name.name)}:"")`)
        })
        fw.exprStmt((ww) => { ww.write('E(N)') })
      })
    }
  }
}

function writeStyleAttribute(
  sty: StyleAttribute,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  bmc: BindingMapCollector,
): void {
  if (sty.kind === 'None') return
  if (sty.kind === 'String') {
    writeAttributeValue(w, 'R.y', sty.value, scopes, bmc)
    return
  }
  // Multiple style bindings
  const pList: Array<ExpressionProcGen | string> = []
  for (const [, , value] of sty.entries) {
    if (value.kind === 'Dynamic') {
      pList.push(exprToProcGenPrepare(value.expression, w, scopes))
    } else {
      pList.push(value.value)
    }
  }
  w.exprStmt((ww) => {
    ww.write('R.w(N,[')
    for (let i = 0; i < sty.entries.length; i++) {
      if (i > 0) ww.write(',')
      const [, propName] = sty.entries[i]!
      const item = pList[i]!
      ww.write(genLitStr(propName.name) + ',')
      if (item instanceof ExpressionProcGen) {
        ww.write('C||K||')
        item.lvalueStateExpr(ww, scopes, false)
        ww.write('?Y(')
        item.valueExpr(ww)
        ww.write('):null')
      } else {
        ww.write(genLitStr(item))
      }
    }
    ww.write('])')
  })
  for (let i = 0; i < sty.entries.length; i++) {
    const [, propName, value] = sty.entries[i]!
    if (value.kind === 'Dynamic' && value.bindingMapKeys && !value.bindingMapKeys.isEmpty(bmc)) {
      value.bindingMapKeys.toProcGenWriteMap(w, bmc, (fw: JsFunctionScopeWriter) => {
        const p2 = exprToProcGenPrepare(value.expression, fw, scopes)
        fw.exprStmt((ww) => {
          ww.write(`R.wi(N,${i},Y(`)
          p2.valueExpr(ww)
          ww.write('))')
        })
        fw.exprStmt((ww) => { ww.write('E(N)') })
      })
    }
    void propName
  }
}

// ---------------------------------------------------------------------------
// SlotKind helpers
// ---------------------------------------------------------------------------

type SlotKindResult =
  | { kind: 'None' }
  | { kind: 'Static'; s: string }
  | { kind: 'Dynamic'; pg: ExpressionProcGen }

function slotKindNew(
  slot: [Range<Position>, Value] | null,
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
): SlotKindResult {
  if (!slot) return { kind: 'None' }
  const value = slot[1]
  if (value.kind === 'Static') return { kind: 'Static', s: value.value }
  const p = exprToProcGenPrepare(value.expression, w, scopes)
  return { kind: 'Dynamic', pg: p }
}

function slotKindIsNone(sk: SlotKindResult): boolean {
  return sk.kind === 'None'
}

function slotKindWriteAsExtraArg(sk: SlotKindResult, w: JsExprWriter): void {
  if (sk.kind === 'None') return
  if (sk.kind === 'Static') {
    w.write(`,${genLitStr(sk.s)}`)
  } else {
    w.write(',Y(')
    sk.pg.valueExpr(w)
    w.write(')')
  }
}

// ---------------------------------------------------------------------------
// Other helpers
// ---------------------------------------------------------------------------

function collectActiveAttributeNames(elem: Element, f: (s: string) => void): void {
  const kind = elem.kind
  if (kind.type === 'Normal') {
    if (kind.common.id) f('":id"')
    if (kind.common.slot) f('":slot"')
    if (kind.class.kind !== 'None') f('":class"')
    if (kind.style.kind !== 'None') f('":style"')
    for (const attr of kind.attributes) f(genLitStr(attr.name.name))
    for (const attr of kind.changeAttributes) f(genLitStr(attr.name.name))
    for (const attr of kind.common.data) {
      if (attr.prefixLocation === null) {
        f(genLitStr(`data-${camelToDash(attr.name.name)}`))
      } else {
        f(genLitStr(`data:${attr.name.name}`))
      }
    }
    for (const mark of kind.common.marks) f(genLitStr(`mark:${mark.name.name}`))
  } else if (kind.type === 'Pure') {
    if (kind.slot) f('":slot"')
  } else if (kind.type === 'Slot') {
    if (kind.common.id) f('":id"')
    if (kind.common.slot) f('":slot"')
    f('":name"')
    for (const attr of kind.values) f(genLitStr(attr.name.name))
    for (const attr of kind.common.data) {
      if (attr.prefixLocation === null) f(genLitStr(`data-${camelToDash(attr.name.name)}`))
      else f(genLitStr(`data:${attr.name.name}`))
    }
    for (const mark of kind.common.marks) f(genLitStr(`mark:${mark.name.name}`))
  }
}

function commonAttrsIsEmpty(common: CommonElementAttributes): boolean {
  return !common.id &&
    !common.slot &&
    common.slotValueRefs.length === 0 &&
    common.eventBindings.length === 0 &&
    common.marks.length === 0
}

function writeLetVars(
  w: JsFunctionScopeWriter,
  scopes: ScopeVar[],
  letVars: Attribute[],
): number {
  let count = 0
  for (const letVar of letVars) {
    const varName = w.declareVarOnTopScope()
    if (!letVar.value) {
      w.exprStmt((ww) => { ww.write(`${varName}=undefined`) })
      scopes.push({ var: varName, updatePathTree: null, lvaluePath: { kind: 'Invalid' } })
    } else if (letVar.value.kind === 'Static') {
      w.exprStmt((ww) => { ww.write(`${varName}=${genLitStr((letVar.value! as {kind:'Static'; value: string}).value)}`) })
      scopes.push({ var: varName, updatePathTree: null, lvaluePath: { kind: 'Invalid' } })
    } else {
      const uptVarName = w.declareVarOnTopScope()
      const p = exprToProcGenPrepare(letVar.value.expression, w, scopes)
      const lvalueFromDataScope = p.isLvaluePathFromDataScope(scopes)
      let lvaluePath: ScopeVarLvaluePath = { kind: 'Invalid' }
      let lvalueVarName: JsIdent | null = null
      if (lvalueFromDataScope !== null) {
        lvalueVarName = w.declareVarOnTopScope()
        lvaluePath = { kind: 'Var', varName: lvalueVarName, fromDataScope: lvalueFromDataScope }
      }
      w.exprStmt((ww) => {
        ww.write(`${uptVarName}=C||K?undefined:`)
        p.lvalueStateExpr(ww, scopes, false)
      })
      w.exprStmt((ww) => { ww.write(`${varName}=`); p.valueExpr(ww) })
      if (lvalueVarName && lvalueFromDataScope !== null) {
        w.exprStmt((ww) => {
          ww.write(`${lvalueVarName}=`)
          p.lvaluePath(ww, scopes, null)
        })
      }
      scopes.push({ var: varName, updatePathTree: uptVarName, lvaluePath })
    }
    count++
  }
  return count
}

function clearLetVars(w: JsFunctionScopeWriter, scopes: ScopeVar[], count: number): void {
  for (let i = 0; i < count; i++) {
    popScopeAndResetUpt(w, scopes)
  }
}

function popScopeAndResetUpt(w: JsFunctionScopeWriter, scopes: ScopeVar[]): void {
  const sv = scopes.pop()!
  if (sv.updatePathTree !== null) {
    w.exprStmt((ww) => { ww.write(`${sv.updatePathTree}=undefined`) })
  }
}

function attrNameMaybeEventBinding(name: string): boolean {
  return name.startsWith('bind') || name.startsWith('capture-bind') ||
    name.startsWith('catch') || name.startsWith('capture-catch') ||
    name.startsWith('on')
}

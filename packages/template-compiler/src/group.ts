// group.ts — mirrors group.rs
// The TmplGroup class that manages template trees and generates JS code.

import { JsTopScopeWriter, JsFunctionScopeWriter } from './proc_gen/writer'
import { parseTemplate } from './parse/tag'
import { ParseState } from './parse/state'
import { ParseError, TmplError } from './types'
import { Template, templateDirectDependencies, templateScriptDependencies } from './parse/tag'
import { genLitStr } from './escape'
import { TmplGroupRef, templateToProcGen } from './proc_gen/tag'
import { stringifyTemplate } from './stringify/stringifier'

// ---------------------------------------------------------------------------
// Runtime snippets (mirrors RUNTIME_ITEMS, EXTRA_RUNTIME_ITEMS, WXS_RUNTIME_ITEMS)
// ---------------------------------------------------------------------------

const RUNTIME_ITEMS: [string, string][] = [
  ['X', "function(a){return a==null?Object.create(null):a}"],
  ['Y', "function(a){return a==null?'':String(a)}"],
  ['Z', "function(a,b){if(a===true)return true;if(a)return a[b]}"],
  ['P', "function(a){return typeof a==='function'?a:()=>{}}"],
]

const EXTRA_RUNTIME_ITEMS: [string, string][] = [
  ['a', "function(a){for(var i=0;i<a.length;i++)if(a[i])return a}"],
  ['b', "function(b){var a=Object.values(b);for(var i=0;i<a.length;i++)if(a[i])return a}"],
]

const WXS_RUNTIME_ITEMS: [string, string][] = [
  ['A', "function(a){return a}"],
  ['B', "function(a){return a}"],
]

const WXS_RUNTIME = `
var D = (() => {
    var modules = Object.create(null);
    var load = (filename) => {
        var module = modules[filename];
        if (!module) throw new Error('no such WXS module: ' + filename);
        if (!module.loaded) {
            module.loaded = true;
            var require = (rel) => {
                var slices;
                if (rel[0] === '/') {
                    slices = rel.split('/');
                } else {
                    slices = filename.split('/').slice(0, -1).concat(rel.split('/'));
                }
                var normalized = [];
                slices.forEach((slice) => {
                    if (slice === '' || slice === '.') return;
                    if (slice === '..') {
                        normalized.pop();
                    } else {
                        normalized.push(slice);
                    }
                })
                return load(normalized.join('/'));
            };
            module.loader.call(null, require, module.exports, module);
        }
        return module.exports;
    };
    return (filename, func) => {
        modules[filename] = { exports: {}, loader: func, loaded: false };
        return () => load(filename);
    };
})()`

function runtimeFns(w: JsFunctionScopeWriter, needWxsRuntime: boolean): void {
  for (const [k, v] of RUNTIME_ITEMS) {
    w.exprStmt((ww) => { ww.write(`var ${k}=${v}`) })
  }
  w.exprStmt((ww) => {
    ww.write('var Q={')
    for (let i = 0; i < EXTRA_RUNTIME_ITEMS.length; i++) {
      const [k, v] = EXTRA_RUNTIME_ITEMS[i]!
      if (i > 0) ww.write(',')
      ww.write(`${k}:${v}`)
    }
    if (needWxsRuntime) {
      for (const [k, v] of WXS_RUNTIME_ITEMS) {
        ww.write(`,${k}:${v}`)
      }
    }
    ww.write('}')
  })
  if (needWxsRuntime) {
    w.customStmtStr(WXS_RUNTIME)
  }
}

function runtimeVarList(): string[] {
  return [...RUNTIME_ITEMS.map(([k]) => k), 'Q']
}

// ---------------------------------------------------------------------------
// TmplGroup class
// ---------------------------------------------------------------------------

export class TmplGroup implements TmplGroupRef {
  private trees: Map<string, Template> = new Map()
  private scripts: Map<string, string> = new Map()
  private hasScripts: boolean = false
  private extraRuntimeString: string = ''
  private devMode: boolean = false

  constructor(devMode = false) {
    this.devMode = devMode
  }

  static new(): TmplGroup {
    return new TmplGroup(false)
  }

  static newDev(): TmplGroup {
    return new TmplGroup(true)
  }

  dev(): boolean {
    return this.devMode
  }

  getTmpl(path: string): Template | null {
    return this.trees.get(path) ?? null
  }

  importGroup(other: TmplGroup): void {
    for (const [k, v] of other.trees) this.trees.set(k, v)
    for (const [k, v] of other.scripts) this.scripts.set(k, v)
    this.hasScripts = this.hasScripts || other.hasScripts
    this.extraRuntimeString += other.extraRuntimeString
  }

  getTree(path: string): Template {
    const t = this.trees.get(path)
    if (!t) throw new TmplError(`no template "${path}" found`)
    return t
  }

  getTreeMut(path: string): Template {
    return this.getTree(path)
  }

  addTmpl(path: string, content: string): ParseError[] {
    const ps = new ParseState(path, content)
    const tmpl = parseTemplate(ps)
    if (tmpl.globals.scripts.some((s) => s.kind === 'Inline')) {
      this.hasScripts = true
    }
    const warnings = ps.takeWarnings()
    this.trees.set(tmpl.path, tmpl)
    return warnings
  }

  removeTmpl(path: string): boolean {
    return this.trees.delete(path)
  }

  stringifyTmpl(path: string): string | null {
    const tmpl = this.trees.get(path)
    if (!tmpl) return null
    return stringifyTemplate(tmpl, { minimize: true })
  }

  getScript(path: string): string {
    const s = this.scripts.get(path)
    if (s === undefined) throw new TmplError(`no script "${path}" found`)
    return s
  }

  addScript(path: string, content: string): void {
    this.scripts.set(path, content)
    this.hasScripts = true
  }

  removeScript(path: string): boolean {
    return this.scripts.delete(path)
  }

  setExtraRuntimeScript(content: string): void {
    this.extraRuntimeString = content
  }

  getRuntimeString(): string {
    const w = new JsTopScopeWriter()
    w.functionScope((w) => {
      runtimeFns(w, this.hasScripts)
    })
    return w.finish() + this.extraRuntimeString
  }

  static getRuntimeVarList(): string[] {
    return runtimeVarList()
  }

  getDirectDependencies(path: string): string[] {
    const tmpl = this.getTree(path)
    return templateDirectDependencies(tmpl)
  }

  getScriptDependencies(path: string): string[] {
    const tmpl = this.getTree(path)
    return templateScriptDependencies(tmpl)
  }

  inlineScriptModuleNames(path: string): string[] {
    const tmpl = this.getTree(path)
    return tmpl.globals.scripts
      .filter((s) => s.kind === 'Inline')
      .map((s) => s.moduleName.name)
  }

  inlineScriptStartLine(path: string, moduleName: string): number {
    const tmpl = this.getTree(path)
    for (const s of tmpl.globals.scripts) {
      if (s.kind === 'Inline' && s.moduleName.name === moduleName) {
        return s.contentLocation.start.line
      }
    }
    throw new TmplError(`no inline script "${moduleName}" found in "${path}"`)
  }

  inlineScriptContent(path: string, moduleName: string): string {
    const tmpl = this.getTree(path)
    for (const s of tmpl.globals.scripts) {
      if (s.kind === 'Inline' && s.moduleName.name === moduleName) {
        return s.content
      }
    }
    throw new TmplError(`no inline script "${moduleName}" found in "${path}"`)
  }

  setInlineScriptContent(path: string, moduleName: string, newContent: string): void {
    const tmpl = this.getTree(path)
    for (const s of tmpl.globals.scripts) {
      if (s.kind === 'Inline' && s.moduleName.name === moduleName) {
        s.content = newContent
        return
      }
    }
    throw new TmplError(`no inline script "${moduleName}" found in "${path}"`)
  }

  getTmplGenObject(path: string): string {
    const tree = this.getTree(path)
    const w = new JsTopScopeWriter()
    w.exprScope((ww) => {
      templateToProcGen(tree, ww, this)
    })
    return w.finish()
  }

  private writeGroupGlobalContent(w: JsFunctionScopeWriter): void {
    runtimeFns(w, this.hasScripts)
    if (this.extraRuntimeString.length > 0) {
      w.customStmtStr(this.extraRuntimeString)
    }
    this.writeAllScripts(w)
  }

  private writeAllScripts(w: JsFunctionScopeWriter): void {
    for (const [p, script] of this.scripts) {
      const pathLit = genLitStr(p)
      w.exprStmt((ww) => {
        ww.write(`R[${pathLit}]=D(${pathLit},(require,exports,module)=>{${script}})`)
      })
    }
  }

  getTmplGenObjectGroups(): string {
    const w = new JsTopScopeWriter()
    w.exprScope((ww) => {
      ww.paren((ww) => {
        ww.function((w) => {
          w.exprStmt((ww) => { ww.write('var G={}') })
          w.exprStmt((ww) => { ww.write('var R={}') })
          this.writeGroupGlobalContent(w)
          for (const [path, tree] of this.trees) {
            const pathLit = genLitStr(path)
            w.exprStmt((ww) => {
              ww.write(`G[${pathLit}]=`)
              templateToProcGen(tree, ww, this)
            })
          }
          w.exprStmt((ww) => { ww.write('return G') })
        })
      })
      ww.paren((_) => {})
    })
    return w.finish()
  }

  getWxGenObjectGroups(): string {
    const w = new JsTopScopeWriter()
    w.exprScope((ww) => {
      ww.paren((ww) => {
        ww.function((w) => {
          w.exprStmt((ww) => { ww.write('var G={}') })
          w.exprStmt((ww) => { ww.write('var R={}') })
          this.writeGroupGlobalContent(w)
          for (const [path, tree] of this.trees) {
            const pathLit = genLitStr(path)
            w.exprStmt((ww) => {
              ww.write(`__wxCodeSpace__.addCompiledTemplate(${pathLit},{groupList:G,content:G[${pathLit}]=`)
              templateToProcGen(tree, ww, this)
              ww.write('})')
            })
          }
        })
      })
      ww.paren((_) => {})
    })
    return w.finish()
  }

  exportGlobals(): string {
    const w = new JsTopScopeWriter()
    w.functionScope((fw) => {
      runtimeFns(fw, this.hasScripts)
      if (this.extraRuntimeString.length > 0) {
        fw.customStmtStr(this.extraRuntimeString)
      }
    })
    return w.finish()
  }

  exportAllScripts(): string {
    const w = new JsTopScopeWriter()
    w.functionScope((fw) => {
      this.writeAllScripts(fw)
    })
    return w.finish()
  }

  len(): number {
    return this.trees.size
  }

  containsTemplate(path: string): boolean {
    return this.trees.has(path)
  }

  listTemplateTrees(): [string, Template][] {
    return [...this.trees.entries()]
  }

  free(): void {
    this.trees.clear()
    this.scripts.clear()
  }
}

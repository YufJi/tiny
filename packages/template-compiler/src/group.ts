import { Template, parseTemplate } from './parse/tag';
import { ParseError } from './types';
import { generateCode } from './codegen';

export interface TmplGroupOptions {
  devMode?: boolean;
}

export class TmplGroup {
  private trees: Map<string, Template> = new Map();
  private scripts: Map<string, string> = new Map();
  private hasScripts: boolean = false;
  private devMode: boolean = false;
  private extraRuntimeString: string = '';

  constructor(options: TmplGroupOptions = {}) {
    this.devMode = options.devMode ?? false;
  }

  static newDev(): TmplGroup {
    return new TmplGroup({ devMode: true });
  }

  get dev(): boolean {
    return this.devMode;
  }

  importGroup(group: TmplGroup): void {
    for (const [path, template] of group.trees) {
      this.trees.set(path, template);
    }
    for (const [path, script] of group.scripts) {
      this.scripts.set(path, script);
    }
    this.hasScripts = this.hasScripts || group.hasScripts;
    this.extraRuntimeString += group.extraRuntimeString;
  }

  addTmpl(path: string, tmplStr: string): ParseError[] {
    const normalizedPath = this.normalizePath(path);
    const { template, warnings } = parseTemplate(normalizedPath, tmplStr);
    
    if (template.globals.scripts.length > 0) {
      this.hasScripts = true;
    }
    
    this.trees.set(normalizedPath, template);
    return warnings;
  }

  removeTmpl(path: string): boolean {
    const normalizedPath = this.normalizePath(path);
    return this.trees.delete(normalizedPath);
  }

  getTree(path: string): Template {
    const normalizedPath = this.normalizePath(path);
    const tree = this.trees.get(normalizedPath);
    if (!tree) {
      throw new Error(`no template "${normalizedPath}" found`);
    }
    return tree;
  }

  containsTemplate(path: string): boolean {
    const normalizedPath = this.normalizePath(path);
    return this.trees.has(normalizedPath);
  }

  listTemplateTrees(): Array<[string, Template]> {
    return Array.from(this.trees.entries());
  }

  len(): number {
    return this.trees.size;
  }

  directDependencies(path: string): string[] {
    const template = this.getTree(path);
    const deps: string[] = [];
    
    for (const include of template.globals.includes) {
      const resolved = this.resolvePath(path, include.src);
      if (!deps.includes(resolved)) {
        deps.push(resolved);
      }
    }
    
    for (const imp of template.globals.imports) {
      const resolved = this.resolvePath(path, imp.src);
      if (!deps.includes(resolved)) {
        deps.push(resolved);
      }
    }
    
    return deps;
  }

  indirectDependencies(path: string): string[] {
    const direct = this.directDependencies(path);
    const all = new Set<string>();
    
    const collect = (p: string, visited: Set<string>) => {
      if (visited.has(p)) return;
      visited.add(p);
      all.add(p);
      
      const deps = this.directDependencies(p);
      for (const dep of deps) {
        collect(dep, visited);
      }
    };
    
    for (const dep of direct) {
      collect(dep, new Set());
    }
    
    return Array.from(all);
  }

  getRuntimeString(): string {
    const runtimeItems = [
      ['X', 'function(a){return a==null?Object.create(null):a}'],
      ['Y', 'function(a){return a==null?"":String(a)}'],
      ['Z', 'function(a,b){if(a===true)return true;if(a)return a[b]}'],
      ['P', 'function(a){return typeof a==="function"?a:()=>{}}'],
    ];
    
    let code = '(function() {\n';
    code += '  var Q = {};\n';
    
    for (const [name, fn] of runtimeItems) {
      code += `  Q.${name} = ${fn};\n`;
    }
    
    if (this.extraRuntimeString) {
      code += this.extraRuntimeString + '\n';
    }
    
    code += '  return Q;\n';
    code += '})()';
    
    return code;
  }

  getRuntimeStringWithBom(): string {
    return '\uFEFF' + this.getRuntimeString();
  }

  getWxsRuntimeString(): string {
    return `
var D = (() => {
  var modules = Object.create(null);
  var load = (filename) => {
    var module = modules[filename];
    if (!module) throw new Error('no such WXS module: ' + filename);
    if (!module.loaded) {
      module.loaded = true;
      module.exports = module.loader();
    }
    return module.exports;
  };
  return {
    register: (filename, loader) => {
      modules[filename] = { loader, loaded: false, exports: null };
    },
    require: (filename) => load(filename),
  };
})();
`;
  }

  getWxsRuntimeStringWithBom(): string {
    return '\uFEFF' + this.getWxsRuntimeString();
  }

  getTemplateRuntime(path: string): string {
    const template = this.getTree(path);
    return generateCode(template, { minimize: !this.devMode });
  }

  getAllTemplateRuntime(): string {
    let code = '(function() {\n';
    code += '  var G = {};\n';
    code += '  var H = {};\n';
    code += '  var S = null;\n';
    code += '  var I = function(P) {\n';
    code += '    if (!S) {\n';
    code += '      S = Object.assign({}, H);\n';
    code += '    }\n';
    code += '    return S[P];\n';
    code += '  };\n';
    
    for (const [path, template] of this.trees) {
      const templateCode = generateCode(template, { minimize: !this.devMode });
      code += `  // Template: ${path}\n`;
      code += templateCode + '\n';
    }
    
    code += '  return G;\n';
    code += '})();';
    
    return code;
  }

  exportAllScripts(): string {
    let code = '';
    for (const [path, script] of this.scripts) {
      code += `// Script: ${path}\n`;
      code += script + '\n';
    }
    return code;
  }

  addScript(path: string, content: string): void {
    this.scripts.set(this.normalizePath(path), content);
    this.hasScripts = true;
  }

  scriptDependencies(path: string): string[] {
    const template = this.getTree(path);
    const deps: string[] = [];
    
    for (const script of template.globals.scripts) {
      if (script.type === 'Src' && script.src) {
        const resolved = this.resolvePath(path, script.src);
        if (!deps.includes(resolved)) {
          deps.push(resolved);
        }
      }
    }
    
    return deps;
  }

  inlineScriptModuleNames(path: string): string[] {
    const template = this.getTree(path);
    return template.globals.scripts
      .filter(script => script.type === 'Inline')
      .map(script => script.moduleName);
  }

  inlineScriptContent(path: string, moduleName: string): string | undefined {
    const template = this.getTree(path);
    const script = template.globals.scripts.find(
      s => s.type === 'Inline' && s.moduleName === moduleName
    );
    return script?.content;
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
  }

  private resolvePath(base: string, relative: string): string {
    let parts: string[];
    
    if (relative.startsWith('/')) {
      parts = relative.substring(1).split('/');
    } else {
      const baseDir = base.split('/').slice(0, -1).join('/');
      parts = (baseDir + '/' + relative).split('/');
    }
    
    const resolved: string[] = [];
    
    for (const part of parts) {
      if (part === '..') {
        resolved.pop();
      } else if (part !== '.' && part !== '') {
        resolved.push(part);
      }
    }
    
    return resolved.join('/');
  }
}

export class TmplError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TmplError';
  }
}

export interface TmplConvertedExpr {
  code: string;
  sourceMap: string;
}

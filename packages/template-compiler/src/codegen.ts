import { Template, Node, ElementKind, Value } from './parse/tag';
import { Expression, ObjectField, ArrayField } from './parse/expression';
import { BindingMapCollector, extractBindingPaths } from './binding-map';

export interface CodeGenOptions {
  minimize?: boolean;
  target?: 'es5' | 'es6';
  devMode?: boolean;
}

export class CodeGenerator {
  private options: CodeGenOptions;
  private bindingMap: BindingMapCollector;
  private updateFunctions: Map<string, string> = new Map();

  constructor(options: CodeGenOptions = {}) {
    this.options = options;
    this.bindingMap = BindingMapCollector.new();
  }

  generate(template: Template): string {
    const { minimize = false } = this.options;
    const indent = minimize ? '' : '  ';
    const newline = minimize ? '' : '\n';

    this.analyzeTemplate(template);

    let code = `(function() {${newline}`;
    code += `${indent}var H = {};${newline}`;
    code += `${indent}var S = null;${newline}`;
    code += `${indent}var I = function(P) {${newline}`;
    code += `${indent}${indent}if (!S) {${newline}`;
    code += `${indent}${indent}${indent}S = Object.assign({}, H);${newline}`;
    code += `${indent}${indent}}${newline}`;
    code += `${indent}${indent}return S[P];${newline}`;
    code += `${indent}};${newline}`;
    code += `${indent}H["${template.path}"] = function(R, C, D, U) {${newline}`;
    code += `${indent}${indent}var N = null;${newline}`;
    code += `${indent}${indent}var M = {};${newline}`;
    
    code += this.generateUpdateFunction(indent + indent, minimize);
    code += this.generateCreateFunction(template, indent + indent, minimize);
    
    code += `${indent}};${newline}`;
    code += `${indent}return H;${newline}`;
    code += `})();${newline}`;

    return code;
  }

  private analyzeTemplate(template: Template): void {
    this.analyzeNodes(template.content);
  }

  private analyzeNodes(nodes: Node[]): void {
    for (const node of nodes) {
      if (node.type === 'Element') {
        this.analyzeElement(node.element.kind);
      }
    }
  }

  private analyzeElement(kind: ElementKind): void {
    switch (kind.type) {
      case 'Normal':
        for (const attr of kind.attributes) {
          if (attr.value.type === 'Dynamic') {
            const paths = extractBindingPaths(attr.value.expression);
            for (const path of paths) {
              this.bindingMap.addField(path);
            }
          }
        }
        this.analyzeNodes(kind.children);
        break;
      case 'For':
        if (kind.list.type === 'Dynamic') {
          const paths = extractBindingPaths(kind.list.expression);
          for (const path of paths) {
            this.bindingMap.addField(path);
          }
        }
        this.analyzeNodes(kind.children);
        break;
      case 'If':
        for (const branch of kind.branches) {
          if (branch.condition?.type === 'Dynamic') {
            const paths = extractBindingPaths(branch.condition.expression);
            for (const path of paths) {
              this.bindingMap.addField(path);
            }
          }
          this.analyzeNodes(branch.children);
        }
        break;
      case 'Pure':
        this.analyzeNodes(kind.children);
        break;
    }
  }

  private generateUpdateFunction(indent: string, minimize: boolean): string {
    let code = '';
    const newline = minimize ? '' : '\n';
    const fields = this.bindingMap.listFields();

    if (fields.length === 0) return code;

    code += `${indent}U = function(changed) {${newline}`;
    code += `${indent}${indent}var needUpdate = false;${newline}`;
    
    for (const [field] of fields) {
      code += `${indent}${indent}if (changed["${field}"]) {${newline}`;
      code += `${indent}${indent}${indent}M["${field}"] = D.${field};${newline}`;
      code += `${indent}${indent}${indent}needUpdate = true;${newline}`;
      code += `${indent}${indent}}${newline}`;
    }
    
    code += `${indent}${indent}return needUpdate;${newline}`;
    code += `${indent}};${newline}`;

    return code;
  }

  private generateCreateFunction(template: Template, indent: string, minimize: boolean): string {
    let code = '';
    const newline = minimize ? '' : '\n';

    code += `${indent}C = function() {${newline}`;
    code += this.generateNodes(template.content, indent + indent, minimize);
    code += `${indent}};${newline}`;

    return code;
  }

  private generateNodes(nodes: Node[], indent: string, minimize: boolean): string {
    let code = '';
    const newline = minimize ? '' : '\n';

    for (const node of nodes) {
      switch (node.type) {
        case 'Text':
          if (node.data.trim()) {
            code += `${indent}N = T(Y(${JSON.stringify(node.data)}));${newline}`;
          }
          break;
        case 'Element':
          code += this.generateElement(node.element.kind, indent, minimize);
          break;
        case 'Comment':
          break;
      }
    }

    return code;
  }

  private generateElement(kind: ElementKind, indent: string, minimize: boolean): string {
    switch (kind.type) {
      case 'Normal':
        return this.generateNormalElement(kind, indent, minimize);
      case 'Pure':
        return this.generateNodes(kind.children, indent, minimize);
      case 'For':
        return this.generateForElement(kind, indent, minimize);
      case 'If':
        return this.generateIfElement(kind, indent, minimize);
      case 'TemplateRef':
        return this.generateTemplateRef(kind, indent, minimize);
      case 'Include':
        return `${indent}// include ${kind.src}${minimize ? '' : '\n'}`;
      case 'Slot':
        return this.generateSlotElement(kind, indent, minimize);
      default:
        return '';
    }
  }

  private generateNormalElement(kind: Extract<ElementKind, { type: 'Normal' }>, indent: string, minimize: boolean): string {
    let code = '';
    const newline = minimize ? '' : '\n';
    const nextIndent = minimize ? '' : indent + '  ';

    const tagName = JSON.stringify(kind.tagName);
    code += `${indent}E(${tagName}, function(N) {${newline}`;

    for (const attr of kind.attributes) {
      if (attr.name.startsWith('wx:')) continue;
      
      if (attr.name.startsWith('bind') || attr.name.startsWith('catch') || attr.name.startsWith('capture-')) {
        code += `${nextIndent}N.on(${JSON.stringify(attr.name)}, ${this.generateValue(attr.value)});${newline}`;
      } else {
        code += `${nextIndent}N.attr(${JSON.stringify(attr.name)}, ${this.generateValue(attr.value)});${newline}`;
      }
    }

    if (kind.children.length > 0) {
      code += this.generateNodes(kind.children, nextIndent, minimize);
    }

    code += `${indent}});${newline}`;

    return code;
  }

  private generateForElement(kind: Extract<ElementKind, { type: 'For' }>, indent: string, minimize: boolean): string {
    let code = '';
    const newline = minimize ? '' : '\n';

    const keyArg = kind.key ? `, ${this.generateValue(kind.key)}` : '';
    code += `${indent}F(${this.generateValue(kind.list)}, function(${kind.itemName}, ${kind.indexName}) {${newline}`;
    code += this.generateNodes(kind.children, minimize ? '' : indent + '  ', minimize);
    code += `${indent}}${keyArg});${newline}`;

    return code;
  }

  private generateIfElement(kind: Extract<ElementKind, { type: 'If' }>, indent: string, minimize: boolean): string {
    let code = '';
    const newline = minimize ? '' : '\n';

    for (let i = 0; i < kind.branches.length; i++) {
      const branch = kind.branches[i];
      if (i === 0) {
        code += `${indent}B(${this.generateValue(branch.condition!)}, function() {${newline}`;
      } else if (branch.condition) {
        code += `${indent}}, ${this.generateValue(branch.condition)}, function() {${newline}`;
      } else {
        code += `${indent}}, function() {${newline}`;
      }
      code += this.generateNodes(branch.children, minimize ? '' : indent + '  ', minimize);
    }

    code += `${indent}});${newline}`;

    return code;
  }

  private generateTemplateRef(kind: Extract<ElementKind, { type: 'TemplateRef' }>, indent: string, minimize: boolean): string {
    let code = '';
    const newline = minimize ? '' : '\n';

    code += `${indent}J(${this.generateValue(kind.name)}`;
    if (kind.data) {
      code += `, ${this.generateValue(kind.data)}`;
    }
    code += `);${newline}`;

    return code;
  }

  private generateSlotElement(kind: Extract<ElementKind, { type: 'Slot' }>, indent: string, minimize: boolean): string {
    let code = '';
    const newline = minimize ? '' : '\n';

    const slotName = kind.name ? JSON.stringify(kind.name) : 'null';
    code += `${indent}S(${slotName}, function() {${newline}`;
    code += this.generateNodes(kind.children, minimize ? '' : indent + '  ', minimize);
    code += `${indent}});${newline}`;

    return code;
  }

  private generateValue(value: Value): string {
    switch (value.type) {
      case 'Static':
        return JSON.stringify(value.value);
      case 'Dynamic':
        return this.generateExpression(value.expression);
      default:
        return 'undefined';
    }
  }

  private generateExpression(expr: Expression): string {
    switch (expr.type) {
      case 'ScopeRef':
        return `D[${expr.index}]`;
      case 'DataField':
        return `D.${expr.name}`;
      case 'LitUndefined':
        return 'undefined';
      case 'LitNull':
        return 'null';
      case 'LitStr':
        return JSON.stringify(expr.value);
      case 'LitInt':
      case 'LitFloat':
        return String(expr.value);
      case 'LitBool':
        return String(expr.value);
      case 'LitObj':
        const fields = expr.fields.map((f: ObjectField) => {
          if (f.type === 'Spread') {
            return `...${this.generateExpression(f.value!)}`;
          } else {
            const val = f.value ? this.generateExpression(f.value) : f.name;
            return `${f.name}: ${val}`;
          }
        });
        return `{${fields.join(', ')}}`;
      case 'LitArr':
        const elements = expr.fields.map((f: ArrayField) => {
          if (f.type === 'Spread') {
            return `...${this.generateExpression(f.value!)}`;
          } else {
            return this.generateExpression(f.value!);
          }
        });
        return `[${elements.join(', ')}]`;
      case 'StaticMember':
        return `${this.generateExpression(expr.obj)}.${expr.fieldName}`;
      case 'DynamicMember':
        return `${this.generateExpression(expr.obj)}[${this.generateExpression(expr.fieldName)}]`;
      case 'FuncCall':
        const args = expr.args.map((a: Expression) => this.generateExpression(a));
        return `${this.generateExpression(expr.func)}(${args.join(', ')})`;
      case 'Unary':
        return `${expr.op}${this.generateExpression(expr.operand)}`;
      case 'Binary':
        return `${this.generateExpression(expr.left)} ${expr.op} ${this.generateExpression(expr.right)}`;
      case 'Conditional':
        return `${this.generateExpression(expr.cond)} ? ${this.generateExpression(expr.thenBranch)} : ${this.generateExpression(expr.elseBranch)}`;
      case 'ToStringWithoutUndefined':
        return `Y(${this.generateExpression(expr.value)})`;
      default:
        return 'undefined';
    }
  }
}

export function generateCode(template: Template, options: CodeGenOptions = {}): string {
  const generator = new CodeGenerator(options);
  return generator.generate(template);
}

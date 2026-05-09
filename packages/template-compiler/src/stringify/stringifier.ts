// Minimal stringifier — mirrors stringify/stringifier.rs + stringify/tag.rs
// This is a simplified implementation that handles the most common cases.
// Full source-map support requires the 'source-map' package.

import { StringifyOptions, defaultStringifyOptions } from './options'
import { Template, Node, Element, ElementKind, Value, Attribute, NormalAttribute, EventBinding, ClassAttribute, StyleAttribute } from '../parse/tag'
import { escapeHtmlBody, escapeHtmlQuote } from '../escape'
import { Expression } from '../parse/expr'
import { Position } from '../types'

export interface SourceMapEntry {
  generatedLine: number
  generatedColumn: number
  sourceLine: number
  sourceColumn: number
  name?: string
}

export class Stringifier {
  private output: string = ''
  private line: number = 0
  private col: number = 0
  private sourcePath: string
  private options: StringifyOptions
  private sourceMappings: SourceMapEntry[] = []

  constructor(sourcePath: string, options?: Partial<StringifyOptions>) {
    this.sourcePath = sourcePath
    this.options = { ...defaultStringifyOptions(), ...options }
  }

  private write(s: string): void {
    this.output += s
    const newlines = s.split('\n')
    if (newlines.length > 1) {
      this.line += newlines.length - 1
      this.col = newlines[newlines.length - 1]!.length
    } else {
      this.col += s.length
    }
  }

  private writeIndent(level: number): void {
    if (this.options.minimize) return
    const indent = this.options.useTabCharacter
      ? '\t'.repeat(level)
      : ' '.repeat(this.options.tabSize * level)
    this.write(indent)
  }

  private newline(): void {
    if (!this.options.minimize) {
      this.write('\n')
    }
  }

  private space(): void {
    if (!this.options.minimize) {
      this.write(' ')
    }
  }

  private addToken(loc: { start: Position }, text: string, name?: string): void {
    if (this.options.sourceMap) {
      this.sourceMappings.push({
        generatedLine: this.line,
        generatedColumn: this.col,
        sourceLine: loc.start.line,
        sourceColumn: loc.start.utf16Col,
        name,
      })
    }
    this.write(text)
  }

  stringifyTemplate(tmpl: Template): void {
    this.stringifyNodes(tmpl.content, 0)
  }

  private stringifyNodes(nodes: Node[], indent: number): void {
    for (const node of nodes) {
      this.stringifyNode(node, indent)
    }
  }

  private stringifyNode(node: Node, indent: number): void {
    switch (node.kind) {
      case 'Text':
        this.writeIndent(indent)
        this.write(escapeHtmlBody(this.valueToString(node.value)))
        this.newline()
        break
      case 'Element':
        this.stringifyElement(node.element, indent)
        break
      case 'Comment':
        if (!this.options.minimize) {
          this.writeIndent(indent)
          this.write('<!--')
          this.write(node.content)
          this.write('-->')
          this.newline()
        }
        break
      case 'UnknownMetaTag':
        break
    }
  }

  private valueToString(value: Value): string {
    if (value.kind === 'Static') return value.value
    // Dynamic values need to output `{{ expr }}`
    return `{{${this.exprToString(value.expression)}}}`
  }

  private exprToString(expr: Expression): string {
    // Simple expression stringification — not fully accurate for source mapping
    switch (expr.kind) {
      case 'LitStr': return JSON.stringify(expr.value)
      case 'LitInt': return `${expr.value}`
      case 'LitFloat': return `${expr.value}`
      case 'LitBool': return `${expr.value}`
      case 'LitNull': return 'null'
      case 'LitUndefined': return 'undefined'
      case 'DataField': return expr.name
      case 'ScopeRef': return `__scope_${expr.index}__`
      default: return '...'
    }
  }

  private stringifyElement(elem: Element, indent: number): void {
    this.writeIndent(indent)
    const { kind } = elem

    switch (kind.type) {
      case 'Normal': {
        const tag = kind.tagName.name
        this.write(`<${tag}`)
        this.stringifyAttributes(kind.attributes, kind.common)
        const children = kind.children
        if (children.length === 0) {
          this.write(' />')
          this.newline()
        } else {
          this.write('>')
          this.newline()
          this.stringifyNodes(children, indent + 1)
          this.writeIndent(indent)
          this.write(`</${tag}>`)
          this.newline()
        }
        break
      }
      case 'Pure': {
        this.write('<block>')
        this.newline()
        this.stringifyNodes(kind.children, indent + 1)
        this.writeIndent(indent)
        this.write('</block>')
        this.newline()
        break
      }
      case 'If': {
        this.write('<block wx:if="')
        this.write(escapeHtmlQuote(this.valueToString(kind.branches[0]![1])))
        this.write('">')
        this.newline()
        this.stringifyNodes(kind.branches[0]![2], indent + 1)
        this.writeIndent(indent)
        this.write('</block>')
        this.newline()
        break
      }
      case 'For': {
        this.write('<block wx:for="')
        this.write(escapeHtmlQuote(this.valueToString(kind.list[1])))
        this.write('">')
        this.newline()
        this.stringifyNodes(kind.children, indent + 1)
        this.writeIndent(indent)
        this.write('</block>')
        this.newline()
        break
      }
      case 'TemplateRef': {
        this.write('<template is="')
        this.write(escapeHtmlQuote(this.valueToString(kind.target[1])))
        this.write('" />')
        this.newline()
        break
      }
      case 'Include': {
        this.write('<include src="')
        this.write(escapeHtmlQuote(kind.path[1].name))
        this.write('" />')
        this.newline()
        break
      }
      case 'Slot': {
        this.write('<slot')
        if (kind.name[1].kind === 'Static' && kind.name[1].value) {
          this.write(` name="${escapeHtmlQuote(kind.name[1].value)}"`)
        } else if (kind.name[1].kind === 'Dynamic') {
          this.write(` name="${escapeHtmlQuote(this.valueToString(kind.name[1]))}"`)
        }
        this.write(' />')
        this.newline()
        break
      }
    }
  }

  private stringifyAttributes(attrs: Array<Attribute | NormalAttribute>, common: any): void {
    for (const attr of attrs) {
      this.write(' ')
      this.write(attr.name.name)
      if (attr.value !== null) {
        this.write('="')
        this.write(escapeHtmlQuote(this.valueToString(attr.value)))
        this.write('"')
      }
    }
    if (common) {
      if (common.id) {
        this.write(' id="')
        this.write(escapeHtmlQuote(this.valueToString(common.id[1])))
        this.write('"')
      }
    }
  }

  finish(): { output: string; sourceMappings: SourceMapEntry[] } {
    return { output: this.output, sourceMappings: this.sourceMappings }
  }
}

export function stringifyTemplate(tmpl: Template, options?: Partial<StringifyOptions>): string {
  const s = new Stringifier(tmpl.path, options)
  s.stringifyTemplate(tmpl)
  return s.finish().output
}

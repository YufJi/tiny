import { parse } from 'acorn'
import MagicString from 'magic-string'

// Compile-time WXS transform.
//
// The module factory already gives each WXS module its own scope, so top-level
// names do not need a blanket prefix. The transform only makes references that
// would otherwise resolve through the host realm explicit:
//
//   Math.max(...)        -> __wxs.globals.Math.max(...)
//   getRegExp(...)       -> __wxs.getRegExp(...)
//   list.constructor     -> __wxs.ctor(list)
//
// `require` stays as-is; the kernel resolves it relative to the module id.

const WRAPPER_NAMES = ['require', 'module', 'exports', '__wxs']
const WXS_HELPERS = new Set(['getRegExp', 'getDate'])
const WXS_GLOBALS = new Set([
  'console',
  'Math',
  'JSON',
  'Number',
  'String',
  'Boolean',
  'Array',
  'Object',
  'Date',
  'RegExp',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'NaN',
  'Infinity',
  'undefined',
])

type AstNode = {
  type: string
  start: number
  end: number
  [key: string]: unknown
}

type Scope = {
  names: Set<string>
  parent: Scope | null
}

export type WxsTransformResult = {
  code: string
  map: string
}

function isNode(value: unknown): value is AstNode {
  return Boolean(value)
    && typeof value === 'object'
    && typeof (value as AstNode).type === 'string'
    && typeof (value as AstNode).start === 'number'
    && typeof (value as AstNode).end === 'number'
}

function addPatternNames(pattern: unknown, names: Set<string>): void {
  if (!isNode(pattern)) return
  switch (pattern.type) {
    case 'Identifier':
      names.add(String(pattern.name))
      break
    case 'RestElement':
      addPatternNames(pattern.argument, names)
      break
    case 'AssignmentPattern':
      addPatternNames(pattern.left, names)
      break
    case 'ArrayPattern':
      for (const element of (pattern.elements ?? []) as unknown[]) addPatternNames(element, names)
      break
    case 'ObjectPattern':
      for (const property of (pattern.properties ?? []) as AstNode[]) {
        addPatternNames(property.value, names)
      }
      break
    default:
      break
  }
}

/** Collect `var` / function declarations for one function/program scope. */
function collectDeclarations(node: unknown, names: Set<string>): void {
  if (!isNode(node)) return
  switch (node.type) {
    case 'FunctionDeclaration':
      if (isNode(node.id)) names.add(String(node.id.name))
      return
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      return
    case 'ClassDeclaration':
      if (isNode(node.id)) names.add(String(node.id.name))
      return
    case 'VariableDeclaration':
      for (const declaration of (node.declarations ?? []) as AstNode[]) {
        addPatternNames(declaration.id, names)
        collectDeclarations(declaration.init, names)
      }
      return
    case 'CatchClause':
      addPatternNames(node.param, names)
      collectDeclarations(node.body, names)
      return
    default:
      for (const [key, value] of Object.entries(node)) {
        if (key === 'type' || key === 'start' || key === 'end') continue
        if (Array.isArray(value)) {
          for (const child of value) collectDeclarations(child, names)
        } else {
          collectDeclarations(value, names)
        }
      }
  }
}

function functionScope(node: AstNode, parent: Scope): Scope {
  const names = new Set<string>()
  for (const param of (node.params ?? []) as unknown[]) addPatternNames(param, names)
  if (node.type === 'FunctionExpression' && isNode(node.id)) names.add(String(node.id.name))
  collectDeclarations(node.body, names)
  return { names, parent }
}

function isDeclared(scope: Scope | null, name: string): boolean {
  for (let current = scope; current; current = current.parent) {
    if (current.names.has(name)) return true
  }
  return false
}

export function transformWxsSource(source: string, sourceName = 'wxs'): WxsTransformResult {
  const program = parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'script',
    allowHashBang: true,
  }) as unknown as AstNode

  const programNames = new Set<string>(WRAPPER_NAMES)
  collectDeclarations(program, programNames)
  const programScope: Scope = { names: programNames, parent: null }
  const magic = new MagicString(source)
  const rewritten = new Set<AstNode>()

  const rewriteReference = (node: AstNode, scope: Scope): void => {
    const name = String(node.name)
    if (isDeclared(scope, name) || rewritten.has(node)) return
    if (WXS_HELPERS.has(name)) {
      magic.overwrite(node.start, node.end, `__wxs.${name}`)
      rewritten.add(node)
    } else if (WXS_GLOBALS.has(name)) {
      magic.overwrite(node.start, node.end, `__wxs.globals.${name}`)
      rewritten.add(node)
    }
  }

  const rewriteConstructor = (node: AstNode, parent: AstNode | null): void => {
    if (node.computed) return
    const property = node.property
    if (!isNode(property) || property.type !== 'Identifier' || property.name !== 'constructor') {
      return
    }
    if (parent?.type === 'AssignmentExpression' && parent.left === node) return
    if (parent?.type === 'UpdateExpression' && parent.argument === node) return
    const object = node.object
    if (!isNode(object)) return
    magic.appendLeft(node.start, '__wxs.ctor(')
    // The object range may stop before a closing parenthesis, e.g.
    // `({}).constructor`; remove only the property suffix.
    let dot = property.start - 1
    while (dot > object.end && /\s/.test(source[dot] ?? '')) dot -= 1
    magic.remove(dot, node.end)
    magic.appendLeft(node.end, ')')
  }

  const walk = (node: unknown, scope: Scope, parent: AstNode | null = null): void => {
    if (!isNode(node)) return
    switch (node.type) {
      case 'Program':
        for (const statement of (node.body ?? []) as unknown[]) walk(statement, scope)
        return
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression': {
        const child = functionScope(node, scope)
        if (node.body) walk(node.body, child)
        return
      }
      case 'BlockStatement':
        for (const statement of (node.body ?? []) as unknown[]) walk(statement, scope)
        return
      case 'VariableDeclarator':
        walk(node.init, scope, node)
        return
      case 'Identifier':
        rewriteReference(node, scope)
        return
      case 'MemberExpression':
        walk(node.object, scope, node)
        if (node.computed) walk(node.property, scope, node)
        rewriteConstructor(node, parent)
        return
      case 'Property':
        if (node.computed) walk(node.key, scope, node)
        walk(node.value, scope, node)
        return
      case 'LabeledStatement':
        walk(node.body, scope, node)
        return
      case 'BreakStatement':
      case 'ContinueStatement':
        return
      default:
        for (const [key, value] of Object.entries(node)) {
          if (key === 'type' || key === 'start' || key === 'end') continue
          if (Array.isArray(value)) {
            for (const child of value) walk(child, scope, node)
          } else {
            walk(value, scope, node)
          }
        }
    }
  }

  walk(program, programScope)
  const map = magic.generateMap({
    hires: true,
    includeContent: true,
    source: sourceName,
  })
  return {
    code: magic.toString(),
    map: map.toString(),
  }
}

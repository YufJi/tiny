import { existsSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

/**
 * Native ESM hosts (devtool, static servers) require explicit file
 * extensions. Mini-program sources use extensionless relative imports, so
 * append `.js` (or `/index.js`) when the target script exists.
 */
export function rewriteRelativeModuleSpecifiers(
  code: string,
  sourceFile: string,
  scriptExtensions: readonly string[],
): string {
  const parsed = ts.createSourceFile(sourceFile, code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS)
  const edits: Array<{ start: number; end: number; text: string }> = []
  const consider = (literal: ts.StringLiteralLike) => {
    const next = resolveRuntimeSpecifier(literal.text, sourceFile, scriptExtensions)
    if (!next || next === literal.text) return
    edits.push({ start: literal.getStart(parsed) + 1, end: literal.getEnd() - 1, text: next })
  }
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      && node.moduleSpecifier
      && ts.isStringLiteral(node.moduleSpecifier)
    ) {
      consider(node.moduleSpecifier)
    }
    if (
      ts.isCallExpression(node)
      && node.expression.kind === ts.SyntaxKind.ImportKeyword
      && node.arguments.length === 1
      && ts.isStringLiteral(node.arguments[0]!)
    ) {
      consider(node.arguments[0]!)
    }
    ts.forEachChild(node, visit)
  }
  visit(parsed)
  if (edits.length === 0) return code
  let output = code
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end)
  }
  return output
}

function resolveRuntimeSpecifier(
  specifier: string,
  sourceFile: string,
  scriptExtensions: readonly string[],
): string | null {
  if (!specifier.startsWith('.')) return null
  if (specifier.endsWith('.js') || specifier.endsWith('.json')) return null
  const configured = scriptExtensions.find((extension) => specifier.endsWith(extension))
  if (configured) {
    return `${specifier.slice(0, -configured.length)}.js`
  }
  const base = path.resolve(path.dirname(sourceFile), specifier)
  for (const extension of scriptExtensions) {
    if (existsSync(`${base}${extension}`)) return `${specifier}.js`
  }
  for (const extension of scriptExtensions) {
    if (existsSync(path.join(base, `index${extension}`))) return `${specifier}/index.js`
  }
  return null
}

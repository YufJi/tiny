import ts from 'typescript'

/**
 * Resolve one module specifier to the runtime specifier that must appear in the
 * emitted script. Returning `undefined` leaves the literal untouched.
 */
export type ModuleSpecifierResolver = (
  specifier: string,
  sourceFile: string,
) => string | undefined

/**
 * Rewrites `import` / `export … from` / dynamic `import()` / `require()`
 * specifiers through `resolve`.
 *
 * Native ESM hosts (devtool, static servers) require explicit file extensions,
 * and mini-program npm packages use bare specifiers. The resolver owns both
 * policies; this function only edits string literals without reformatting the
 * rest of the source.
 */
export function rewriteModuleSpecifiers(
  code: string,
  sourceFile: string,
  resolve: ModuleSpecifierResolver,
): string {
  const parsed = ts.createSourceFile(sourceFile, code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS)
  const edits: Array<{ start: number; end: number; text: string }> = []
  const consider = (literal: ts.StringLiteralLike) => {
    const next = resolve(literal.text, sourceFile)
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
    if (
      ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === 'require'
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

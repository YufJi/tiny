import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import type { ScriptArtifact } from '../types'
import { diagnostic, relativeFromTarget, writeFileWithSourceMap } from '../utils'
import { isTypeScriptFile, replaceConfiguredExtension } from './extensions'
import { outputPath, relativePath, type CompilerContext } from './context'
import { rewriteRelativeModuleSpecifiers } from './module-specifiers'
import type { Project } from './project'

/**
 * Transpiles every script reachable from an app/page/component entry, then
 * rewrites its relative imports for native ESM hosts.
 */
export async function compileScripts(
  context: CompilerContext,
  project: Project,
): Promise<void> {
  const entryScriptPaths = [
    ...project.entries.map((entry) => entry.scriptPath),
    ...[...project.components.values()].map((entry) => entry.scriptPath),
  ].filter((value): value is string => Boolean(value))
  const scriptPaths = await collectReachableScripts(context, project.files, entryScriptPaths)

  for (const scriptPath of scriptPaths) {
    const sourcePath = relativePath(context, scriptPath)
    if (context.scripts.has(sourcePath)) continue
    const outputRelativePath = `scripts/${replaceConfiguredExtension(
      sourcePath,
      context.extensions.script,
      '.js',
    )}`
    const source = await fs.readFile(scriptPath, 'utf8')
    const transformed = ts.transpileModule(source, {
      fileName: scriptPath,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        sourceMap: true,
        inlineSources: false,
        esModuleInterop: true,
      },
      reportDiagnostics: true,
    })
    for (const item of transformed.diagnostics ?? []) {
      context.diagnostics.push(diagnostic(
        'error',
        'SCRIPT_TRANSPILE_ERROR',
        ts.flattenDiagnosticMessageText(item.messageText, '\n'),
        scriptPath,
        item.file && item.start !== undefined
          ? {
              line: item.file.getLineAndCharacterOfPosition(item.start).line + 1,
              column: item.file.getLineAndCharacterOfPosition(item.start).character + 1,
            }
          : undefined,
      ))
    }
    let sourceMap: string | undefined
    if (transformed.sourceMapText) {
      const map = JSON.parse(transformed.sourceMapText) as Record<string, unknown>
      const mapPath = outputPath(context, `${outputRelativePath}.map`)
      map.file = path.basename(outputRelativePath)
      map.sources = [relativeFromTarget(mapPath, scriptPath)]
      map.sourcesContent = [source]
      sourceMap = JSON.stringify(map)
    }
    const artifact: ScriptArtifact = {
      path: outputRelativePath,
      sourcePath,
      sourceMapPath: sourceMap ? `${outputRelativePath}.map` : undefined,
    }
    context.scripts.set(sourcePath, artifact)
    await writeFileWithSourceMap(
      outputPath(context, outputRelativePath),
      rewriteRelativeModuleSpecifiers(
        transformed.outputText,
        scriptPath,
        context.extensions.script,
      ),
      sourceMap,
    )
  }
}

/** Breadth-first walk over `import`/`export from`/`require` of local modules. */
async function collectReachableScripts(
  context: CompilerContext,
  byRelative: Map<string, string>,
  entryPaths: string[],
): Promise<string[]> {
  const visited = new Set<string>()
  const queue = [...entryPaths]

  while (queue.length > 0) {
    const current = queue.shift()!
    const currentRelative = relativePath(context, current)
    if (visited.has(currentRelative)) continue
    visited.add(currentRelative)
    const source = await fs.readFile(current, 'utf8')
    const sourceFile = ts.createSourceFile(
      current,
      source,
      ts.ScriptTarget.Latest,
      true,
      isTypeScriptFile(current, context.extensions.script)
        ? ts.ScriptKind.TS
        : ts.ScriptKind.JS,
    )

    const visitNode = (node: ts.Node): void => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        queueLocalScript(context, byRelative, current, node.moduleSpecifier.text, queue)
      }
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require' && node.arguments.length === 1) {
        const argument = node.arguments[0]!
        if (ts.isStringLiteral(argument)) {
          queueLocalScript(context, byRelative, current, argument.text, queue)
        }
      }
      ts.forEachChild(node, visitNode)
    }
    visitNode(sourceFile)
  }

  return [...visited].map((relative) => path.join(context.root, relative))
}

function queueLocalScript(
  context: CompilerContext,
  byRelative: Map<string, string>,
  fromPath: string,
  reference: string,
  queue: string[],
): void {
  if (!reference.startsWith('.') && !reference.startsWith('/')) return
  const fromDirectory = path.dirname(fromPath)
  const absoluteReference = reference.startsWith('/')
    ? path.join(context.root, reference.slice(1))
    : path.resolve(fromDirectory, reference)
  const referenceRelative = relativePath(context, absoluteReference)
  const candidates = [
    referenceRelative,
    ...context.extensions.script.map((extension) => `${referenceRelative}${extension}`),
    ...context.extensions.script.map((extension) => `${referenceRelative}/index${extension}`),
  ]
  const candidate = candidates.map((item) => byRelative.get(item)).find(Boolean)
  if (!candidate) {
    context.diagnostics.push(diagnostic(
      'warning',
      'SCRIPT_IMPORT_NOT_FOUND',
      `Unable to resolve script import "${reference}".`,
      fromPath,
    ))
    return
  }
  queue.push(candidate)
}

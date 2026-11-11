import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import type { ScriptArtifact } from '../types'
import { diagnostic, relativeFromTarget, writeFileWithSourceMap } from '../utils'
import { isTypeScriptFile, replaceConfiguredExtension } from './extensions'
import { outputPath, relativePath, type CompilerContext } from './context'
import { rewriteModuleSpecifiers, type ModuleSpecifierResolver } from './module-specifiers'
import type { Project } from './project'

/**
 * Transpiles every script reachable from an app/page/component entry, then
 * rewrites its module specifiers for native ESM hosts. Reachability follows
 * relative imports and mini-program npm packages, so a package's internal
 * files are compiled and bundled exactly like authored code.
 */
export async function compileScripts(
  context: CompilerContext,
  project: Project,
): Promise<void> {
  const entryScriptPaths = [
    ...project.entries.map((entry) => entry.scriptPath),
    ...[...project.components.values()].map((entry) => entry.scriptPath),
  ].filter((value): value is string => Boolean(value))
  const scriptPaths = await collectReachableScripts(context, project, entryScriptPaths)
  const resolveSpecifier = createSpecifierResolver(context, project.files)
  const pageScriptPaths = new Map<string, string>()
  for (const entry of project.entries) {
    if (entry.path !== 'app' && entry.scriptPath) pageScriptPaths.set(entry.scriptPath, entry.path)
  }
  const componentScriptPaths = new Map<string, string>()
  for (const [path, entry] of project.components) {
    if (entry.scriptPath) componentScriptPaths.set(entry.scriptPath, path)
  }

  for (const scriptPath of scriptPaths) {
    const sourcePath = relativePath(context, scriptPath)
    if (context.scripts.has(sourcePath)) continue
    const outputRelativePath = `scripts/${replaceConfiguredExtension(
      sourcePath,
      context.extensions.script,
      '.js',
    )}`
    const source = await fs.readFile(scriptPath, 'utf8')
    // The compiler only knows which entry a script file belongs to. Whether
    // that entry calls `Page()` or `Component()` is decided at runtime from
    // the actual registration, never from the script text.
    const entryPath = componentScriptPaths.get(scriptPath) ?? pageScriptPaths.get(scriptPath)
    const hint = entryPath && !shadowsGlobalThis(source) ? { path: entryPath } : undefined
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
      // The registration hint is one extra line before the transpiled body.
      if (hint) map.mappings = `;${String(map.mappings ?? '')}`
      sourceMap = JSON.stringify(map)
    }
    const artifact: ScriptArtifact = {
      path: outputRelativePath,
      sourcePath,
      sourceMapPath: sourceMap ? `${outputRelativePath}.map` : undefined,
    }
    context.scripts.set(sourcePath, artifact)
    const code = rewriteModuleSpecifiers(
      transformed.outputText,
      scriptPath,
      resolveSpecifier,
    )
    await writeFileWithSourceMap(
      outputPath(context, outputRelativePath),
      hint ? `${registrationHintSource(hint)}
${code}` : code,
      sourceMap,
    )
  }
}

function registrationHintSource(hint: { path: string }): string {
  return `globalThis.${TINY_ENGINE_NAMING.entryPathHint} = ${JSON.stringify(hint.path)};`
}

/**
 * Some prebuilt npm bundles (notably WeUI's webpack output) declare
 * `var globalThis = this` at module scope. The declaration shadows the real
 * global inside the esbuild CommonJS wrapper, so an injected `globalThis.*`
 * assignment would write to the module scope instead of the runtime. Those
 * scripts fall back to declaration-order registration.
 */
function shadowsGlobalThis(source: string): boolean {
  return /(?:^|[;\n])\s*(?:var|let|const|function)\s+globalThis\b/.test(source)
}

/**
 * Breadth-first walk over `import` / `export … from` / `require` of local and
 * `miniprogram_npm` modules.
 */
async function collectReachableScripts(
  context: CompilerContext,
  project: Project,
  entryPaths: string[],
): Promise<string[]> {
  const byRelative = project.files
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
      const specifier = readModuleSpecifier(node)
      if (specifier === undefined) {
        ts.forEachChild(node, visitNode)
        return
      }
      const target = resolveScriptModule(context, byRelative, current, specifier)
      if (target) {
        queue.push(target)
      } else if (isLocalSpecifier(specifier)) {
        context.diagnostics.push(diagnostic(
          'warning',
          'SCRIPT_IMPORT_NOT_FOUND',
          `Unable to resolve script import "${specifier}".`,
          current,
        ))
      }
      ts.forEachChild(node, visitNode)
    }
    visitNode(sourceFile)
  }

  return [...visited].map((relative) => (
    project.files.get(relative) ?? path.join(context.root, relative)
  ))
}

function readModuleSpecifier(node: ts.Node): string | undefined {
  if (
    (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
    && node.moduleSpecifier
    && ts.isStringLiteral(node.moduleSpecifier)
  ) {
    return node.moduleSpecifier.text
  }
  if (
    ts.isCallExpression(node)
    && node.arguments.length === 1
    && ts.isStringLiteral(node.arguments[0]!)
    && (
      node.expression.kind === ts.SyntaxKind.ImportKeyword
      || (ts.isIdentifier(node.expression) && node.expression.text === 'require')
    )
  ) {
    return node.arguments[0]!.text
  }
  return undefined
}

function isLocalSpecifier(specifier: string): boolean {
  return specifier.startsWith('.') || specifier.startsWith('/')
}

/**
 * Resolve a mini-program module specifier to an absolute source file:
 * - relative/absolute imports inside the app or the generated npm tree;
 * - bare imports against `miniprogram_npm/<specifier>`;
 * - an explicit `miniprogram_npm/...` path.
 *
 * Anything else (a host-provided module) stays unresolved on purpose.
 */
function resolveScriptModule(
  context: CompilerContext,
  byRelative: Map<string, string>,
  fromPath: string,
  specifier: string,
): string | undefined {
  if (/^[a-z]+:/i.test(specifier)) return undefined
  let base: string
  if (specifier.startsWith('.')) {
    base = relativePath(context, path.resolve(path.dirname(fromPath), specifier))
  } else if (specifier.startsWith('/')) {
    base = specifier.slice(1)
  } else if (specifier.startsWith('miniprogram_npm/')) {
    base = specifier
  } else {
    base = `miniprogram_npm/${specifier}`
  }
  const exact = byRelative.get(base)
  if (exact && isScriptFile(context, exact)) return exact
  for (const extension of context.extensions.script) {
    const candidate = byRelative.get(`${base}${extension}`)
    if (candidate) return candidate
  }
  for (const extension of context.extensions.script) {
    const candidate = byRelative.get(`${base}/index${extension}`)
    if (candidate) return candidate
  }
  return undefined
}

function isScriptFile(context: CompilerContext, filePath: string): boolean {
  const lower = filePath.toLowerCase()
  return context.extensions.script.some((extension) => lower.endsWith(extension.toLowerCase()))
}

/** Map source specifiers to the relative `.js` specifiers used at runtime. */
function createSpecifierResolver(
  context: CompilerContext,
  byRelative: Map<string, string>,
): ModuleSpecifierResolver {
  return (specifier, sourceFile) => {
    const target = resolveScriptModule(context, byRelative, sourceFile, specifier)
    if (!target) return undefined
    const fromRelative = relativePath(context, sourceFile)
    const targetRelative = relativePath(context, target)
    const fromOutput = `scripts/${replaceConfiguredExtension(
      fromRelative,
      context.extensions.script,
      '.js',
    )}`
    const targetOutput = `scripts/${replaceConfiguredExtension(
      targetRelative,
      context.extensions.script,
      '.js',
    )}`
    const resolved = path.posix.relative(path.posix.dirname(fromOutput), targetOutput)
    return resolved.startsWith('.') ? resolved : `./${resolved}`
  }
}

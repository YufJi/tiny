import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import { diagnostic, normalizeRelativePath } from '../utils'
import { relativePath, type CompilerContext } from './context'
import type { Project } from './project'

/**
 * Optional TypeScript semantic checking.
 *
 * Transpilation is syntax-only: TypeScript erases types and the compiler never
 * asks for a program, so type errors would otherwise pass silently. When the
 * project enables `typecheck` (or ships a `tsconfig.json`, which this stage
 * treats as intent), the reachable `.ts` files are checked with the project's
 * own options and reported as `SCRIPT_TYPE_ERROR` diagnostics.
 *
 * Mini-program globals are declared when no community typing package is
 * installed, so a fresh project checks application types without requiring an
 * extra dependency.
 */

const AMBIENT_FILE = '__tiny_typecheck_globals.d.ts'

const AMBIENT_SOURCE = `
declare function App(options: Record<string, unknown>): void
declare function Page(options: Record<string, unknown>): unknown
declare function Component(options: Record<string, unknown>): unknown
declare function Behavior(options: Record<string, unknown>): unknown
declare function getApp<T = Record<string, unknown>>(): T
declare function getCurrentPages(): Array<Record<string, unknown>>
declare function require(moduleName: string): unknown
declare const wx: Record<string, (...args: unknown[]) => unknown>
declare const __wxConfig: Record<string, unknown>
declare const module: { exports: unknown }
declare const exports: Record<string, unknown>
`

export async function typecheckScripts(
  context: CompilerContext,
  project: Project,
): Promise<void> {
  const tsFiles = [...project.files]
    .filter(([virtual]) => virtual.toLowerCase().endsWith('.ts'))
    .map(([, absolute]) => absolute)
  if (tsFiles.length === 0) return

  const configPath = path.join(context.root, 'tsconfig.json')
  const hasConfig = await exists(configPath)
  if (!context.options.typecheck && !hasConfig) return
  if (context.options.typecheck === false) return

  const options = readCompilerOptions(context, configPath, hasConfig)
  const ambientPath = path.join(context.options.outputDir, AMBIENT_FILE)
  const rootNames = [...tsFiles]
  if (!hasMiniProgramTypings(context)) {
    await fs.mkdir(context.options.outputDir, { recursive: true })
    await fs.writeFile(ambientPath, AMBIENT_SOURCE, 'utf8')
    rootNames.push(ambientPath)
  }

  const program = ts.createProgram({
    rootNames,
    options: {
      ...options,
      noEmit: true,
      skipLibCheck: true,
      module: options.module ?? ts.ModuleKind.ESNext,
      target: options.target ?? ts.ScriptTarget.ESNext,
      moduleResolution: options.moduleResolution ?? ts.ModuleResolutionKind.Bundler,
    },
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  for (const item of diagnostics) {
    if (!item.file) continue
    const fileName = item.file.fileName
    if (path.basename(fileName) === AMBIENT_FILE) continue
    if (!tsFiles.includes(fileName)) continue
    const position = item.file.getLineAndCharacterOfPosition(item.start ?? 0)
    context.diagnostics.push(diagnostic(
      item.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
      'SCRIPT_TYPE_ERROR',
      ts.flattenDiagnosticMessageText(item.messageText, '\n'),
      context.virtualPaths.get(path.resolve(fileName)) ?? relativePath(context, fileName),
      { line: position.line + 1, column: position.character + 1 },
    ))
  }

  await fs.rm(ambientPath, { force: true })
}

function readCompilerOptions(
  context: CompilerContext,
  configPath: string,
  hasConfig: boolean,
): ts.CompilerOptions {
  if (!hasConfig) return {}
  const read = ts.readConfigFile(configPath, (file) => ts.sys.readFile(file))
  if (read.error) {
    context.diagnostics.push(diagnostic(
      'warning',
      'SCRIPT_TSCONFIG_INVALID',
      ts.flattenDiagnosticMessageText(read.error.messageText, '\n'),
      normalizeRelativePath(path.relative(context.root, configPath)),
    ))
    return {}
  }
  const parsed = ts.parseJsonConfigFileContent(
    read.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath,
  )
  for (const item of parsed.errors) {
    context.diagnostics.push(diagnostic(
      'warning',
      'SCRIPT_TSCONFIG_INVALID',
      ts.flattenDiagnosticMessageText(item.messageText, '\n'),
      normalizeRelativePath(path.relative(context.root, configPath)),
    ))
  }
  return parsed.options
}

function hasMiniProgramTypings(context: CompilerContext): boolean {
  const candidates = [
    'node_modules/miniprogram-api-typings/package.json',
    'node_modules/@types/wechat-miniprogram/package.json',
  ]
  return candidates.some((candidate) => {
    try {
      return ts.sys.fileExists(path.join(context.root, candidate))
    } catch {
      return false
    }
  })
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

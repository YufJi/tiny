import fs from 'node:fs/promises'
import path from 'node:path'
import type { Diagnostic, DiagnosticSeverity, SourceLocation } from './types'

export function toPosixPath(value: string): string {
  return value.split(path.sep).join('/')
}

export function normalizeRelativePath(value: string): string {
  return toPosixPath(path.normalize(value)).replace(/^\.\//, '').replace(/\/+$/, '')
}

export function withoutExtension(value: string): string {
  const parsed = path.parse(value)
  return toPosixPath(path.join(parsed.dir, parsed.name))
}

export function sanitizeScope(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-')
}

/** Compiler-owned service entry for one subpackage (no directory segments). */
export function subpackageServicePath(root: string): string {
  return `service.${sanitizeScope(root).replace(/^-+|-+$/g, '') || 'package'}.js`
}

export async function ensureDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

export async function readJson(filePath: string): Promise<{
  value: Record<string, unknown>
  diagnostics: Diagnostic[]
}> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return { value: JSON.parse(content) as Record<string, unknown>, diagnostics: [] }
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return {
      value: {},
      diagnostics: [{
        severity: 'error',
        code: 'INVALID_JSON',
        message: `Unable to parse JSON file: ${details}`,
        file: filePath,
      }],
    }
  }
}

export function diagnostic(
  severity: DiagnosticSeverity,
  code: string,
  message: string,
  file?: string,
  location?: SourceLocation,
  details?: unknown,
): Diagnostic {
  return { severity, code, message, file, location, details }
}

export async function collectFiles(
  rootDir: string,
  ignoredDirectories: string[] = ['.git', '.cache', 'node_modules'],
  ignored?: (relativePath: string) => boolean,
): Promise<string[]> {
  const output: string[] = []

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name)
      const relative = toPosixPath(path.relative(rootDir, entryPath))
      if (ignored?.(relative)) continue
      if (entry.isDirectory()) {
        if (!ignoredDirectories.includes(entry.name)) await walk(entryPath)
      } else if (entry.isFile()) {
        output.push(entryPath)
      }
    }
  }

  await walk(rootDir)
  return output.sort()
}

type PackIgnoreRule = {
  type?: string
  value?: string
}

/**
 * Compile `project.config.json#packOptions.ignore`. The WeChat devtool accepts
 * both bare glob strings and typed rules; both forms are relative to the
 * mini-program root. Invalid regexps are ignored so a broken ignore rule cannot
 * silently drop the whole project.
 */
export function createIgnoreMatcher(rules: unknown): ((relativePath: string) => boolean) | undefined {
  if (!Array.isArray(rules)) return undefined
  const matchers: Array<(value: string) => boolean> = []
  for (const rule of rules) {
    if (typeof rule === 'string') {
      const regex = globToRegExp(rule)
      if (regex) matchers.push((value) => regex.test(value))
      continue
    }
    if (!rule || typeof rule !== 'object') continue
    const { type, value } = rule as PackIgnoreRule
    if (typeof value !== 'string' || value.length === 0) continue
    const normalizedValue = normalizeRelativePath(value)
    switch (type) {
      case 'file':
        matchers.push((candidate) => candidate === normalizedValue)
        break
      case 'folder':
        matchers.push((candidate) => candidate === normalizedValue
          || candidate.startsWith(`${normalizedValue}/`))
        break
      case 'suffix':
        matchers.push((candidate) => candidate.endsWith(value))
        break
      case 'prefix':
        matchers.push((candidate) => candidate.startsWith(value))
        break
      case 'glob':
      default: {
        const regex = globToRegExp(value)
        if (regex) matchers.push((candidate) => regex.test(candidate))
        break
      }
    }
  }
  if (matchers.length === 0) return undefined
  return (relativePath) => matchers.some((matcher) => matcher(relativePath))
}

function globToRegExp(pattern: string): RegExp | undefined {
  try {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '\u0000')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]')
      .replace(/\u0000/g, '.*')
    return new RegExp(`^${escaped}$`)
  } catch {
    return undefined
  }
}

export async function copyFile(sourcePath: string, outputPath: string): Promise<void> {
  await ensureDir(outputPath)
  await fs.copyFile(sourcePath, outputPath)
}

export async function writeFileWithSourceMap(
  outputPath: string,
  content: string,
  sourceMapContent?: string,
): Promise<void> {
  await ensureDir(outputPath)
  await fs.writeFile(outputPath, content, 'utf8')
  if (sourceMapContent !== undefined) {
    await fs.writeFile(`${outputPath}.map`, sourceMapContent, 'utf8')
  }
}

export function relativeFromTarget(targetPath: string, sourcePath: string): string {
  return toPosixPath(path.relative(path.dirname(targetPath), sourcePath))
}

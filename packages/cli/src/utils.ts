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
  extensions: string[],
  ignoredDirectories: string[] = ['.git', '.cache', 'node_modules'],
): Promise<string[]> {
  const output: string[] = []
  const extensionSet = new Set(extensions)

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        if (!ignoredDirectories.includes(entry.name)) await walk(entryPath)
      } else if (entry.isFile() && extensionSet.has(path.extname(entry.name))) {
        output.push(entryPath)
      }
    }
  }

  await walk(rootDir)
  return output.sort()
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

import { withoutExtension } from '../utils'

/**
 * Extension helpers shared by the entry graph, script and style pipelines.
 * Mini-program sources may omit their extension entirely, so every lookup has
 * to be tolerant of both the configured and the bare form.
 */

export function matchesConfiguredExtension(value: string, extensions: readonly string[]): boolean {
  return extensions.some((extension) => value.endsWith(extension))
}

export function withoutConfiguredExtension(value: string, extensions: readonly string[]): string {
  const extension = extensions.find((candidate) => value.endsWith(candidate))
  return extension ? value.slice(0, -extension.length) : withoutExtension(value)
}

export function replaceConfiguredExtension(
  value: string,
  extensions: readonly string[],
  replacement: string,
): string {
  const extension = extensions.find((candidate) => value.endsWith(candidate))
  return extension ? `${value.slice(0, -extension.length)}${replacement}` : `${value}${replacement}`
}

export function isTypeScriptFile(filePath: string, scriptExtensions: readonly string[]): boolean {
  const lower = filePath.toLowerCase()
  const typescriptExtensions = new Set(
    scriptExtensions
      .map((extension) => extension.toLowerCase())
      .filter((extension) => ['.ts', '.tsx', '.mts', '.cts'].includes(extension)),
  )
  return [...typescriptExtensions].some((extension) => lower.endsWith(extension))
}

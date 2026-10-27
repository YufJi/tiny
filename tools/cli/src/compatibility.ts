import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  resolveCompatibility,
  type CompatibilityConfig,
  type Diagnostic,
  type ResolvedCompatibilityConfig,
} from '@tiny/manifest'
import type { CompileOptions } from './types'
import { diagnostic } from './utils'

export const TINY_CONFIG_FILE = 'tiny.config.json'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function warning(
  diagnostics: Diagnostic[],
  code: string,
  message: string,
  file: string,
): void {
  diagnostics.push(diagnostic('warning', code, message, file))
}

/** Reads the optional Tiny build configuration from the project source root. */
export function readProjectCompatibility(
  sourceDir: string,
  diagnostics: Diagnostic[] = [],
): CompatibilityConfig | undefined {
  const configPath = path.join(sourceDir, TINY_CONFIG_FILE)
  if (!existsSync(configPath)) return undefined
  try {
    const raw = JSON.parse(readFileSync(configPath, 'utf8')) as unknown
    if (!isRecord(raw)) {
      warning(diagnostics, 'TINY_CONFIG_INVALID', `${TINY_CONFIG_FILE} must contain an object.`, configPath)
      return undefined
    }
    if (isRecord(raw.naming)) {
      warning(
        diagnostics,
        'TINY_CONFIG_NAMING_REMOVED',
        '`naming` is no longer supported; use `compatibility` instead.',
        configPath,
      )
    }
    if (!isRecord(raw.compatibility)) return undefined
    return raw.compatibility as CompatibilityConfig
  } catch (error) {
    warning(
      diagnostics,
      'TINY_CONFIG_INVALID',
      `Unable to read ${TINY_CONFIG_FILE}: ${error instanceof Error ? error.message : String(error)}`,
      configPath,
    )
    return undefined
  }
}

function mergeCompatibility(
  base: CompatibilityConfig | undefined,
  override: CompatibilityConfig,
): CompatibilityConfig {
  return {
    ...base,
    ...override,
    extensions: { ...base?.extensions, ...override.extensions },
    files: { ...base?.files, ...override.files },
    api: { ...base?.api, ...override.api },
    globals: { ...base?.globals, ...override.globals },
    opaqueGlobals: override.opaqueGlobals ?? base?.opaqueGlobals,
  }
}

/** Resolves file conventions and explicit compile options against WeChat defaults. */
export function resolveCompatibilityInput(
  options: Pick<CompileOptions, 'sourceDir' | 'compatibility'>,
  diagnostics: Diagnostic[] = [],
): ResolvedCompatibilityConfig {
  const fileConfig = readProjectCompatibility(options.sourceDir, diagnostics)
  const merged = options.compatibility
    ? mergeCompatibility(fileConfig, options.compatibility)
    : fileConfig
  return resolveCompatibility(merged)
}

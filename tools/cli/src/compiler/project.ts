import fs from 'node:fs/promises'
import path from 'node:path'
import type { CompilerContext } from './context'
import { relativePath } from './context'
import { collectFiles, diagnostic, normalizeRelativePath, readJson } from '../utils'

/** One mini-program page, component or the app shell and its sibling files. */
export type SourceEntry = {
  path: string
  scriptPath?: string
  templatePath?: string
  stylePath?: string
  configPath?: string
}

export type AppConfig = {
  path: string
  value: Record<string, unknown>
}

/** Everything discovered from the source tree before any artifact is emitted. */
export type Project = {
  root: string
  appConfig: AppConfig
  /** Source files keyed by mini-program-relative path. */
  files: Map<string, string>
  /** `app` entry followed by every declared page. */
  entries: SourceEntry[]
  /** Components reachable through `usingComponents`, keyed by entry path. */
  components: Map<string, SourceEntry>
}

export async function prepareOutputDir(context: CompilerContext): Promise<void> {
  if (context.options.clean) {
    await fs.rm(context.options.outputDir, { recursive: true, force: true })
  }
  await fs.mkdir(context.options.outputDir, { recursive: true })
}

export async function resolveProject(context: CompilerContext): Promise<Project> {
  context.root = await resolveRoot(context)
  const { root } = context
  const files = await collectFiles(root, [
    ...context.extensions.script,
    ...context.extensions.template,
    ...context.extensions.style,
    ...context.extensions.templateScript,
    ...context.extensions.config,
  ])
  const byRelative = new Map(files.map((file) => [relativePath(context, file), file]))
  const appConfig = await readAppConfig(context)
  const pagePaths = resolvePagePaths(appConfig.value)
  const entries = await resolveEntries(context, byRelative, pagePaths)
  const components = await resolveComponentEntries(context, byRelative, appConfig.value, entries)
  return { root, appConfig, files: byRelative, entries, components }
}

async function resolveRoot(context: CompilerContext): Promise<string> {
  const projectConfigPath = path.join(
    context.options.sourceDir,
    context.compatibility.files.projectConfig,
  )
  try {
    const { value } = await readJson(projectConfigPath)
    const miniProgramRoot = value.miniprogramRoot
    if (typeof miniProgramRoot === 'string' && miniProgramRoot.length > 0) {
      return path.resolve(context.options.sourceDir, miniProgramRoot)
    }
  } catch {
    // A project config file is optional when sourceDir is the mini-program root.
  }
  return context.options.sourceDir
}

async function readAppConfig(context: CompilerContext): Promise<AppConfig> {
  const configPath = path.join(context.root, context.compatibility.files.appConfig)
  const { value, diagnostics } = await readJson(configPath)
  context.diagnostics.push(...diagnostics)
  if (!Array.isArray(value.pages) || value.pages.length === 0) {
    context.diagnostics.push(diagnostic(
      'error',
      'APP_PAGES_REQUIRED',
      `${context.compatibility.files.appConfig} must declare at least one page.`,
      configPath,
    ))
  }
  return { path: configPath, value }
}

function resolvePagePaths(appConfig: Record<string, unknown>): string[] {
  const paths: string[] = []
  const pages = appConfig.pages
  if (Array.isArray(pages)) {
    for (const page of pages) {
      if (typeof page === 'string') paths.push(normalizeRelativePath(page))
    }
  }
  const subPackages = Array.isArray(appConfig.subPackages)
    ? appConfig.subPackages
    : Array.isArray(appConfig.subpackages) ? appConfig.subpackages : []
  for (const packageValue of subPackages) {
    if (!packageValue || typeof packageValue !== 'object') continue
    const pkg = packageValue as Record<string, unknown>
    if (typeof pkg.root !== 'string' || !Array.isArray(pkg.pages)) continue
    const packageRoot = normalizeRelativePath(pkg.root)
    for (const page of pkg.pages) {
      if (typeof page === 'string') {
        paths.push(normalizeRelativePath(path.posix.join(packageRoot, page)))
      }
    }
  }
  return [...new Set(paths)]
}

async function resolveEntries(
  context: CompilerContext,
  byRelative: Map<string, string>,
  pagePaths: string[],
): Promise<SourceEntry[]> {
  const entries: SourceEntry[] = []
  const appEntry = await resolveEntry(context, byRelative, 'app')
  if (appEntry) entries.push(appEntry)
  for (const pagePath of pagePaths) {
    const entry = await resolveEntry(context, byRelative, pagePath)
    if (entry) entries.push(entry)
    else context.diagnostics.push(diagnostic(
      'error',
      'PAGE_NOT_FOUND',
      `Page "${pagePath}" does not have a matching source file.`,
      pagePath,
    ))
  }
  return entries
}

/**
 * Walks `usingComponents` transitively so nested components are compiled too,
 * and records every referenced tag for the stylesheet compiler.
 */
async function resolveComponentEntries(
  context: CompilerContext,
  byRelative: Map<string, string>,
  appConfig: Record<string, unknown>,
  pageEntries: SourceEntry[],
): Promise<Map<string, SourceEntry>> {
  const components = new Map<string, SourceEntry>()
  const appComponents = readUsingComponents(appConfig)
  const visit = async (entry: SourceEntry, componentRefs: Record<string, string>): Promise<void> => {
    for (const tag of Object.keys(componentRefs)) context.customComponentTags.add(tag)
    for (const componentPath of Object.values(componentRefs)) {
      const normalized = resolveEntryReference(context, entry.path, componentPath)
      if (components.has(normalized)) continue
      const component = await resolveEntry(context, byRelative, normalized)
      if (!component) {
        context.diagnostics.push(diagnostic(
          'error',
          'COMPONENT_NOT_FOUND',
          `Component "${componentPath}" does not have a matching source file.`,
          normalized,
        ))
        continue
      }
      components.set(normalized, component)
      const config = await readConfiguration(context, component.configPath)
      await visit(component, readUsingComponents(config))
    }
  }

  const appEntry = pageEntries.find((entry) => entry.path === 'app')
  if (appEntry) await visit(appEntry, appComponents)
  for (const page of pageEntries.filter((entry) => entry.path !== 'app')) {
    const config = await readConfiguration(context, page.configPath)
    await visit(page, readUsingComponents(config))
  }

  return components
}

async function resolveEntry(
  context: CompilerContext,
  byRelative: Map<string, string>,
  entryPath: string,
): Promise<SourceEntry | null> {
  const normalized = normalizeRelativePath(entryPath)
  const findByExtension = (base: string, extensions: readonly string[]) => {
    for (const extension of extensions) {
      const found = byRelative.get(`${base}${extension}`)
      if (found) return found
    }
    return undefined
  }
  const findTemplate = (base: string) => findByExtension(base, context.extensions.template)
  const findStyle = (base: string) => findByExtension(base, context.extensions.style)
  const findScript = (base: string) => findByExtension(base, context.extensions.script)
  const findConfig = (base: string) => findByExtension(base, context.extensions.config)

  // Pages/components may reference a file (`foo`) or a directory with an
  // `index` entry (`foo/index.*`), mirroring the WeChat resolution rules.
  for (const base of [normalized, `${normalized}/index`]) {
    const scriptPath = findScript(base)
    const templatePath = findTemplate(base)
    if (scriptPath || templatePath) {
      return {
        path: normalized,
        scriptPath,
        templatePath,
        stylePath: findStyle(base),
        configPath: findConfig(base),
      }
    }
  }
  return null
}

function resolveEntryReference(
  context: CompilerContext,
  sourceEntryPath: string,
  reference: string,
): string {
  if (reference.startsWith('/')) return normalizeRelativePath(reference.slice(1))
  return normalizeRelativePath(path.relative(
    context.options.sourceDir,
    path.resolve(
      path.dirname(path.join(context.options.sourceDir, sourceEntryPath)),
      reference,
    ),
  ))
}

export function readUsingComponents(config: Record<string, unknown>): Record<string, string> {
  const usingComponents = config.usingComponents
  if (!usingComponents || typeof usingComponents !== 'object') return {}
  return Object.fromEntries(Object.entries(usingComponents).map(([key, value]) => [key, String(value)]))
}

export async function readConfiguration(
  context: CompilerContext,
  configPath?: string,
): Promise<Record<string, unknown>> {
  if (!configPath) return {}
  try {
    const { value, diagnostics } = await readJson(configPath)
    context.diagnostics.push(...diagnostics)
    return value
  } catch {
    return {}
  }
}

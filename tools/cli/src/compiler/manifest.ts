import fs from 'node:fs/promises'
import path from 'node:path'
import { BUILTIN_COMPONENT_TAGS, runtimeCompatibilityFrom } from '@tiny/manifest'
import type {
  AppArtifact,
  ComponentArtifact,
  ConfigurationArtifact,
  Manifest,
  PageArtifact,
} from '../types'
import { diagnostic, ensureDir, subpackageServicePath } from '../utils'
import { withoutConfiguredExtension } from './extensions'
import { relativePath, type CompilerContext } from './context'
import {
  readConfiguration,
  readUsingComponents,
  resolveAppConfigTheme,
  resolveEntryReference,
  resolvePageConfigTheme,
  type Project,
  type SourceEntry,
} from './project'

/**
 * Assembles the versioned manifest that the service/render threads consume.
 * Artifacts were already produced by the script/template/style stages, so this
 * only resolves entries to their emitted counterparts.
 */
export async function createManifest(
  context: CompilerContext,
  project: Project,
): Promise<Manifest> {
  const appEntry = project.entries.find((entry) => entry.path === 'app')
  const app: AppArtifact | undefined = appEntry
    ? {
        path: appEntry.path,
        script: appEntry.scriptPath
          ? context.scripts.get(relativePath(context, appEntry.scriptPath))
          : undefined,
        style: appEntry.stylePath
          ? context.styles.get(relativePath(context, appEntry.stylePath))
          : context.themeStyle,
        configuration: {
          path: 'app',
          sourcePath: relativePath(context, project.appConfig.path),
          effective: resolveAppConfigTheme(
            project.appConfig.value,
            project.appConfig.theme,
            'light',
            context,
            project.appConfig.path,
          ),
          ...(project.appConfig.theme
            ? {
                darkEffective: resolveAppConfigTheme(
                  project.appConfig.value,
                  project.appConfig.theme,
                  'dark',
                  context,
                  project.appConfig.path,
                ),
              }
            : {}),
        },
      }
    : undefined

  const pages: PageArtifact[] = []
  for (const entry of project.entries.filter((item) => item.path !== 'app')) {
    pages.push(await createPageArtifact(context, project, entry))
  }
  const components: ComponentArtifact[] = []
  for (const entry of project.components.values()) {
    components.push(await createPageArtifact(context, project, entry))
  }

  return {
    schemaVersion: 2,
    runtimeCompatibility: runtimeCompatibilityFrom(context.compatibility),
    entries: {
      service: 'service.js',
      templates: 'templates.js',
      serviceBundle: 'service.all.js',
    },
    app,
    pages,
    components,
    subPackages: project.appConfig.subPackages.map((pkg) => {
      const entries = [
        ...project.entries.filter((entry) => entry.subpackage === pkg.root),
        ...[...project.components.values()].filter((entry) => entry.subpackage === pkg.root),
      ]
      const hasScripts = entries.some((entry) => Boolean(entry.scriptPath))
      return {
        root: pkg.root,
        pages: [...pkg.pages],
        ...(pkg.independent ? { independent: true } : {}),
        ...(hasScripts ? { service: subpackageServicePath(pkg.root) } : {}),
      }
    }),
    ...(project.appConfig.preloadRules.length > 0
      ? { preloadRules: project.appConfig.preloadRules }
      : {}),
    ...(project.appConfig.theme ? { theme: project.appConfig.theme } : {}),
    styles: [...context.styles.values()],
    assets: context.assets,
    diagnostics: [...context.diagnostics],
  }
}

/** Writes `manifest.json` and returns its absolute path. */
export async function writeManifest(
  context: CompilerContext,
  manifest: Manifest,
): Promise<string> {
  const manifestPath = path.join(context.options.outputDir, 'manifest.json')
  await ensureDir(manifestPath)
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  return manifestPath
}

async function createPageArtifact(
  context: CompilerContext,
  project: Project,
  entry: SourceEntry,
): Promise<PageArtifact> {
  const config = await readConfiguration(context, entry.configPath)
  const independentPackage = entry.subpackage !== undefined
    && project.appConfig.subPackages.some((pkg) => pkg.root === entry.subpackage && pkg.independent)
  const globalComponents = entry.path === 'app' || independentPackage
    ? {}
    : readUsingComponents(project.appConfig.value)
  const localComponents = readUsingComponents(config)
  const effectiveComponents: Record<string, string> = { ...globalComponents, ...localComponents }
  // The runtime resolves component references against the owning page, so emit
  // root-anchored paths. This also folds npm-style references
  // (`@vant/weapp/button/index`) into the compiled `miniprogram_npm` tree.
  const resolvedComponents = Object.fromEntries(
    Object.entries(effectiveComponents).map(([tag, reference]) => {
      // App-level components are declared relative to the mini-program root;
      // page-level ones are relative to the declaring page.
      const declaringPath = localComponents[tag] ? entry.path : ''
      return [tag, `/${resolveEntryReference(context, project.files, declaringPath, reference)}`]
    }),
  )
  const componentSource: Record<string, 'global' | 'local'> = {}
  for (const tag of Object.keys(effectiveComponents)) {
    componentSource[tag] = localComponents[tag] ? 'local' : 'global'
  }
  const effectiveConfig: Record<string, unknown> = Object.keys(resolvedComponents).length > 0
    ? { ...config, usingComponents: resolvedComponents }
    : config
  const placeholders = resolveComponentPlaceholders(
    context,
    entry,
    config,
    resolvedComponents,
  )
  const theme = project.appConfig.theme
  const configuration: ConfigurationArtifact = {
    path: entry.path,
    sourcePath: entry.configPath
      ? relativePath(context, entry.configPath)
      : `${entry.path}${context.extensions.config[0]}`,
    effective: resolvePageConfigTheme(
      effectiveConfig,
      theme,
      'light',
      context,
      entry.configPath,
    ),
    ...(theme
      ? {
          darkEffective: resolvePageConfigTheme(
            effectiveConfig,
            theme,
            'dark',
            context,
            entry.configPath,
          ),
        }
      : {}),
    usingComponents: resolvedComponents,
    usingComponentsSource: componentSource,
    ...(Object.keys(placeholders).length > 0 ? { placeholders } : {}),
  }

  return {
    path: entry.path,
    ...(entry.subpackage ? { subpackage: entry.subpackage } : {}),
    ...(entry.asyncSubPackages && entry.asyncSubPackages.length > 0
      ? { asyncSubPackages: entry.asyncSubPackages }
      : {}),
    script: entry.scriptPath
      ? context.scripts.get(relativePath(context, entry.scriptPath))
      : undefined,
    template: entry.templatePath
      ? context.templates.get(withoutConfiguredExtension(
        relativePath(context, entry.templatePath),
        context.extensions.template,
      ))
      : undefined,
    style: entry.stylePath
      ? context.styles.get(relativePath(context, entry.stylePath))
      : undefined,
    configuration,
  }
}

/**
 * Resolve `componentPlaceholder` against the effective `usingComponents`.
 *
 * Only built-in tags are accepted as placeholders today: a custom placeholder
 * would need its own async loading/definition lifecycle. Invalid entries emit a
 * structured diagnostic and are dropped instead of failing the page.
 */
function resolveComponentPlaceholders(
  context: CompilerContext,
  entry: SourceEntry,
  config: Record<string, unknown>,
  resolvedComponents: Record<string, string>,
): Record<string, string> {
  const raw = config.componentPlaceholder
  if (raw === undefined) return {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    context.diagnostics.push(diagnostic(
      'error',
      'COMPONENT_PLACEHOLDER_INVALID',
      'componentPlaceholder must be an object keyed by component tag.',
      entry.configPath,
    ))
    return {}
  }
  const placeholders: Record<string, string> = {}
  for (const [tag, rawTarget] of Object.entries(raw as Record<string, unknown>)) {
    const componentPath = resolvedComponents[tag]
    if (!componentPath) {
      context.diagnostics.push(diagnostic(
        'warning',
        'COMPONENT_PLACEHOLDER_UNKNOWN_TAG',
        `componentPlaceholder tag "${tag}" is not declared in usingComponents.`,
        entry.configPath,
      ))
      continue
    }
    if (typeof rawTarget !== 'string' || rawTarget.length === 0) {
      context.diagnostics.push(diagnostic(
        'warning',
        'COMPONENT_PLACEHOLDER_INVALID',
        `componentPlaceholder for "${tag}" must name a built-in tag.`,
        entry.configPath,
      ))
      continue
    }
    if (!BUILTIN_COMPONENT_TAGS.includes(rawTarget as never)) {
      context.diagnostics.push(diagnostic(
        'warning',
        'COMPONENT_PLACEHOLDER_UNKNOWN_TARGET',
        `componentPlaceholder target "${rawTarget}" is not a built-in tag.`,
        entry.configPath,
      ))
      continue
    }
    placeholders[componentPath.replace(/^\//, '')] = rawTarget
  }
  return placeholders
}

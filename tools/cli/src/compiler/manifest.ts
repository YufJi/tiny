import fs from 'node:fs/promises'
import path from 'node:path'
import { runtimeCompatibilityFrom } from '@tiny/manifest'
import type {
  AppArtifact,
  ComponentArtifact,
  ConfigurationArtifact,
  Manifest,
  PageArtifact,
} from '../types'
import { ensureDir } from '../utils'
import { withoutConfiguredExtension } from './extensions'
import { relativePath, type CompilerContext } from './context'
import {
  readConfiguration,
  readUsingComponents,
  resolveEntryReference,
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
          : undefined,
        configuration: {
          path: 'app',
          sourcePath: relativePath(context, project.appConfig.path),
          effective: project.appConfig.value,
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
    },
    app,
    pages,
    components,
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
  const scriptSource = entry.scriptPath ? await fs.readFile(entry.scriptPath, 'utf8') : ''
  const componentGlobal = escapeRegExp(context.compatibility.globals.component)
  const bodyType = new RegExp(`\\b${componentGlobal}\\s*\\(`).test(scriptSource)
    ? 'component' as const
    : 'page' as const
  const globalComponents = entry.path === 'app'
    ? {}
    : readUsingComponents(await readConfiguration(context, project.appConfig.path))
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
  const configuration: ConfigurationArtifact = {
    path: entry.path,
    sourcePath: entry.configPath
      ? relativePath(context, entry.configPath)
      : `${entry.path}${context.extensions.config[0]}`,
    effective: effectiveConfig,
    usingComponents: resolvedComponents,
    usingComponentsSource: componentSource,
  }

  return {
    path: entry.path,
    bodyType,
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

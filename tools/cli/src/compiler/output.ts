import path from 'node:path'
import { build as esbuild } from 'esbuild'
import type { Manifest } from '../types'
import {
  copyFile,
  diagnostic,
  isAssetPath,
  toPosixPath,
  writeFileWithSourceMap,
} from '../utils'
import { outputPath, type CompilerContext } from './context'
import type { Project } from './project'

/** Copies images and fonts to the output directory, preserving paths. */
export async function copyAssets(context: CompilerContext, project: Project): Promise<void> {
  for (const [virtual, sourcePath] of project.files) {
    if (!isAssetPath(virtual)) continue
    await copyFile(sourcePath, outputPath(context, virtual))
    context.assets.push({ path: virtual, sourcePath: virtual })
  }
}

/**
 * Emits the service thread entry point: `service.js` imports every
 * page/component script and is bundled. The split-tree renderer consumes
 * `templates.js` directly, so no `render.js` wrapper is emitted.
 */
export async function writeEntryArtifacts(
  context: CompilerContext,
  manifest: Manifest,
): Promise<void> {
  const mainArtifacts = [
    ...manifest.pages.filter((page) => !page.subpackage),
    ...manifest.components.filter((component) => !component.subpackage),
  ]
  await emitServiceEntry(context, 'service.js', [
    manifest.app?.script?.path,
    ...mainArtifacts.map((artifact) => artifact.script?.path),
  ])

  for (const pkg of manifest.subPackages ?? []) {
    if (!pkg.service) continue
    const packageArtifacts = [
      ...manifest.pages.filter((page) => page.subpackage === pkg.root),
      ...manifest.components.filter((component) => component.subpackage === pkg.root),
    ]
    await emitServiceEntry(context, pkg.service, packageArtifacts.map((artifact) => artifact.script?.path))
  }
}

async function emitServiceEntry(
  context: CompilerContext,
  entryRelativePath: string,
  scripts: Array<string | undefined>,
): Promise<void> {
  const imports = scripts.filter((value): value is string => Boolean(value))
  const content = imports
    .map((scriptPath) => `import './${toPosixPath(scriptPath)}'`)
    .join('\n') + '\n'
  await writeFileWithSourceMap(outputPath(context, entryRelativePath), content)
  await bundleServiceEntry(context, entryRelativePath)
}

async function bundleServiceEntry(
  context: CompilerContext,
  entryRelativePath: string,
): Promise<void> {
  const entry = outputPath(context, entryRelativePath)
  try {
    await esbuild({
      entryPoints: [entry],
      outfile: entry,
      bundle: true,
      allowOverwrite: true,
      format: 'esm',
      platform: 'browser',
      target: 'es2019',
      sourcemap: true,
      logLevel: 'silent',
      absWorkingDir: path.resolve(context.options.outputDir),
    })
  } catch (error) {
    context.diagnostics.push(diagnostic(
      'warning',
      'SCRIPT_BUNDLE_ERROR',
      `Unable to bundle ${entryRelativePath}: ${error instanceof Error ? error.message : String(error)}`,
    ))
  }
}

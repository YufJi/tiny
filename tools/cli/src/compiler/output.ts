import path from 'node:path'
import { build as esbuild } from 'esbuild'
import type { Manifest } from '../types'
import { collectFiles, copyFile, diagnostic, toPosixPath, writeFileWithSourceMap } from '../utils'
import { outputPath, relativePath, type CompilerContext } from './context'

const ASSET_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp',
  '.eot', '.woff', '.woff2', '.ttf', '.otf',
])

/** Copies images and fonts to the output directory, preserving paths. */
export async function copyAssets(context: CompilerContext): Promise<void> {
  const files = await collectFiles(context.root, [...ASSET_EXTENSIONS])
  for (const sourcePath of files) {
    const relative = relativePath(context, sourcePath)
    await copyFile(sourcePath, outputPath(context, relative))
    context.assets.push({ path: relative, sourcePath: relative })
  }
}

/**
 * Emits the two thread entry points: `service.js` imports every page/component
 * script and is bundled, `render.js` exposes the shared template group.
 */
export async function writeEntryArtifacts(
  context: CompilerContext,
  manifest: Manifest,
): Promise<void> {
  const serviceImports = [
    manifest.app?.script?.path,
    ...manifest.pages.map((page) => page.script?.path),
    ...manifest.components.map((component) => component.script?.path),
  ].filter((value): value is string => Boolean(value))
  const serviceContent = serviceImports
    .map((scriptPath) => `import './${toPosixPath(scriptPath)}'`)
    .join('\n') + '\n'
  await writeFileWithSourceMap(outputPath(context, 'service.js'), serviceContent)
  await bundleServiceEntry(context)

  const renderContent = [
    "import templates from './templates.js'",
    '',
    'export default { templates }',
    '',
  ].join('\n')
  await writeFileWithSourceMap(outputPath(context, 'render.js'), renderContent)
}

async function bundleServiceEntry(context: CompilerContext): Promise<void> {
  const entry = outputPath(context, 'service.js')
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
      `Unable to bundle service scripts: ${error instanceof Error ? error.message : String(error)}`,
    ))
  }
}

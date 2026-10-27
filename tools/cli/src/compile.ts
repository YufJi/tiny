import type { CompileOptions, CompileResult } from './types'
import { createCompilerContext } from './compiler/context'
import { prepareOutputDir, resolveProject } from './compiler/project'
import { compileScripts } from './compiler/scripts'
import { compileTemplates } from './compiler/templates'
import { compileStyles } from './compiler/styles'
import { copyAssets, writeEntryArtifacts } from './compiler/output'
import { createManifest, writeManifest } from './compiler/manifest'

/**
 * Compiles a mini-program source tree into `outputDir`.
 *
 * Stages stay ordered because each one reads what the previous produced:
 * project discovery -> scripts -> templates -> styles -> assets -> manifest ->
 * thread entry points. All diagnostics from every stage end up in
 * `CompileResult.diagnostics`.
 */
export async function compileMiniProgram(options: CompileOptions): Promise<CompileResult> {
  const context = createCompilerContext(options)
  await prepareOutputDir(context)
  const project = await resolveProject(context)

  await compileScripts(context, project)
  await compileTemplates(context, project)
  await compileStyles(context, project)
  await copyAssets(context)

  const manifest = await createManifest(context, project)
  await writeEntryArtifacts(context, manifest)
  const manifestPath = await writeManifest(context, manifest)

  return {
    outputDir: context.options.outputDir,
    manifestPath,
    manifest,
    diagnostics: context.diagnostics,
    outputPath: context.options.outputDir,
  }
}

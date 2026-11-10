import fs from 'node:fs/promises'
import path from 'node:path'
import { diagnostic } from '../utils'
import type { CompilerContext } from './context'

/**
 * WeChat-compatible npm build.
 *
 * The mini-program compiler does not run a package manager. It consumes the
 * `node_modules` tree that the project already installed and mirrors every
 * declared dependency into `miniprogram_npm/<name>` exactly like the WeChat
 * devtool "构建 npm" step. Packages may select a published entry directory with
 * the `miniprogram` field (`"dist"`, `"miniprogram_dist"`, …); everything below
 * that directory is part of the mini-program package.
 *
 * The mirror is staged under the output directory and registered as virtual
 * source files, so the existing script/template/style stages compile it with
 * the same rules as authored files. `miniprogram_npm` is only generated when
 * the source tree does not already contain one: a checked-in prebuilt tree
 * keeps working and wins over `node_modules`.
 */

const IGNORED_DIRECTORIES = new Set(['.git', '.github', 'node_modules'])
const PACKAGE_JSON = 'package.json'

export type NpmBuildResult = {
  /** Virtual `miniprogram_npm/...` path -> staged absolute path. */
  files: Map<string, string>
  /** Package names that were mirrored, in discovery order. */
  packages: string[]
}

type ResolvedPackage = {
  name: string
  directory: string
  sourceRoot: string
}

export async function buildNpmPackages(context: CompilerContext): Promise<NpmBuildResult> {
  const root = context.root
  const empty: NpmBuildResult = { files: new Map(), packages: [] }
  const rootManifest = await readPackageJson(root)
  const dependencies = readDependencies(rootManifest)
  if (dependencies.length === 0) return empty

  // A checked-in `miniprogram_npm` is a prebuilt tree (the fixtures and many
  // real projects ship one). It is authoritative; do not mix it with a
  // generated tree.
  if (await isDirectory(path.join(root, 'miniprogram_npm'))) {
    context.diagnostics.push(diagnostic(
      'info',
      'NPM_PREBUILT_SOURCE',
      'Using the existing miniprogram_npm tree; npm packages were not rebuilt from node_modules.',
      path.join(root, 'miniprogram_npm'),
    ))
    return empty
  }

  const packages = await collectPackages(context, root, dependencies)
  if (packages.size === 0) {
    context.diagnostics.push(diagnostic(
      'warning',
      'NPM_BUILD_EMPTY',
      'package.json declares dependencies but none could be resolved from node_modules.',
      path.join(root, PACKAGE_JSON),
    ))
    return empty
  }

  const stagingRoot = path.join(context.options.outputDir, '.tiny-npm')
  await fs.rm(stagingRoot, { recursive: true, force: true })
  context.npmStagingRoot = stagingRoot

  const files = new Map<string, string>()
  const mirrored: string[] = []
  for (const pkg of packages.values()) {
    const copied = await mirrorPackage(stagingRoot, pkg, context)
    for (const [virtual, staged] of copied) {
      if (files.has(virtual)) continue
      files.set(virtual, staged)
      context.virtualPaths.set(path.resolve(staged), virtual)
    }
    mirrored.push(pkg.name)
  }
  return { files, packages: mirrored }
}

async function collectPackages(
  context: CompilerContext,
  root: string,
  rootDependencies: string[],
): Promise<Map<string, ResolvedPackage>> {
  const packages = new Map<string, ResolvedPackage>()
  const visitedDirectories = new Set<string>()
  const queue = rootDependencies.map((name) => ({ name, from: root }))

  while (queue.length > 0) {
    const { name, from } = queue.shift()!
    if (packages.has(name)) continue
    const directory = await resolvePackageDirectory(context, name, from)
    if (!directory) continue
    const realDirectory = await fs.realpath(directory).catch(() => directory)
    if (visitedDirectories.has(realDirectory)) continue
    visitedDirectories.add(realDirectory)
    const manifest = await readPackageJson(realDirectory)
    const sourceRoot = await resolveMiniProgramRoot(realDirectory, manifest)
    packages.set(name, { name, directory: realDirectory, sourceRoot })
    for (const dependency of readDependencies(manifest)) {
      if (!packages.has(dependency)) queue.push({ name: dependency, from: realDirectory })
    }
  }
  return packages
}

/**
 * Resolve a package the way Node does, but without executing package code:
 * walk `node_modules/<name>` from the importer upwards. Bare names only; npm
 * aliases and git URLs are already materialized under `node_modules`.
 */
async function resolvePackageDirectory(
  context: CompilerContext,
  name: string,
  from: string,
): Promise<string | undefined> {
  if (!isSafePackageName(name)) return undefined
  let current = from
  for (;;) {
    const candidate = path.join(current, 'node_modules', ...name.split('/'))
    if (await isDirectory(candidate)) return candidate
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  context.diagnostics.push(diagnostic(
    'warning',
    'NPM_PACKAGE_NOT_FOUND',
    `Declared npm dependency "${name}" was not found under node_modules.`,
    path.join(context.root, PACKAGE_JSON),
  ))
  return undefined
}

/** `package.json#miniprogram` (or the `miniprogram_dist` convention). */
async function resolveMiniProgramRoot(
  directory: string,
  manifest: Record<string, unknown> | undefined,
): Promise<string> {
  const declared = manifest?.miniprogram
  if (typeof declared === 'string' && declared.length > 0) {
    const candidate = path.resolve(directory, declared)
    if (await isDirectory(candidate)) return candidate
  }
  const distribution = path.join(directory, 'miniprogram_dist')
  if (await isDirectory(distribution)) return distribution
  return directory
}

async function mirrorPackage(
  stagingRoot: string,
  pkg: ResolvedPackage,
  context: CompilerContext,
): Promise<Map<string, string>> {
  const files = new Map<string, string>()
  const outputRoot = path.join(stagingRoot, ...pkg.name.split('/'))
  const entries = await listFiles(pkg.sourceRoot)
  for (const absolute of entries) {
    const relative = path.relative(pkg.sourceRoot, absolute)
    if (relative.startsWith('..') || path.isAbsolute(relative)) continue
    const virtual = toPosixPath(path.posix.join('miniprogram_npm', pkg.name, relative))
    const staged = path.join(outputRoot, relative)
    try {
      await fs.mkdir(path.dirname(staged), { recursive: true })
      await fs.copyFile(absolute, staged)
      files.set(virtual, staged)
    } catch (error) {
      context.diagnostics.push(diagnostic(
        'warning',
        'NPM_COPY_FAILED',
        `Unable to copy npm file "${virtual}": ${error instanceof Error ? error.message : String(error)}`,
        absolute,
      ))
    }
  }
  if (files.size === 0) {
    context.diagnostics.push(diagnostic(
      'warning',
      'NPM_PACKAGE_EMPTY',
      `npm package "${pkg.name}" has no files under ${pkg.sourceRoot}.`,
      pkg.directory,
    ))
  }
  return files
}

async function listFiles(directory: string): Promise<string[]> {
  const output: string[] = []
  const walk = async (current: string): Promise<void> => {
    let entries: import('node:fs').Dirent[]
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue
        await walk(path.join(current, entry.name))
        continue
      }
      // Follow file symlinks (pnpm workspaces link package payloads).
      if (entry.isFile() || entry.isSymbolicLink()) output.push(path.join(current, entry.name))
    }
  }
  await walk(directory)
  return output.sort()
}

async function readPackageJson(directory: string): Promise<Record<string, unknown> | undefined> {
  try {
    const content = await fs.readFile(path.join(directory, PACKAGE_JSON), 'utf8')
    const value = JSON.parse(content) as unknown
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : undefined
  } catch {
    return undefined
  }
}

function readDependencies(manifest: Record<string, unknown> | undefined): string[] {
  const dependencies = manifest?.dependencies
  if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies)) return []
  return Object.keys(dependencies).filter(isSafePackageName)
}

function isSafePackageName(name: string): boolean {
  if (!name || name.startsWith('.') || name.startsWith('/') || name.includes('\\')) return false
  if (name.includes('..')) return false
  return /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/i.test(name)
}

async function isDirectory(value: string): Promise<boolean> {
  try {
    return (await fs.stat(value)).isDirectory()
  } catch {
    return false
  }
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/')
}

/** Removes the temporary staging tree once every compiler stage has read it. */
export async function cleanupNpmBuild(context: CompilerContext): Promise<void> {
  if (!context.npmStagingRoot) return
  await fs.rm(context.npmStagingRoot, { recursive: true, force: true })
  context.npmStagingRoot = undefined
}

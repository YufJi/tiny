import type { TemplateRegistry, TreeRenderer } from '@tiny/runtime'
import {
  BUILTIN_BASE_STYLES,
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
} from '@tiny/host-web-components'
import { createGlassRenderTree } from './tree'

export type GlassRenderEntryOptions = {
  /** DOM container for the page root. Defaults to `#app`, then `<body>`. */
  container?: HTMLElement
  /** Host hook mapping app asset paths to loadable URLs. */
  resolveAssetUrl?: (src: string, sourcePath?: string) => string | undefined
  /** Page id when the render document was created for a specific page. */
  pageId?: string
  /** Document used to install built-in styles; defaults to the current one. */
  document?: Document
  /**
   * Compiled template groups. The render thread installs them through
   * `setTemplates` before the first mount.
   */
  loadTemplates?: () => Promise<TemplateRegistry> | TemplateRegistry
  /** Let the render pageframe evaluate page WXML instead of replaying a tree. */
  pageFrame?: boolean
}

/** Renderer factory a host can boot over any transport. */
export type GlassRenderEntry = {
  /** Install the host-owned built-in styles; run before the thread says ready. */
  prepare: () => void
  createRenderer: () => TreeRenderer
  pageId?: string
  /** Forwarded to `bootTreeThread`, which parks flows until templates load. */
  loadTemplates?: () => Promise<TemplateRegistry> | TemplateRegistry
  /** Forwarded to `bootTreeThread`; the pageframe owns the page WXML render. */
  pageFrame?: boolean
}

/**
 * Install the host-owned built-in styles. Page, component and app styles are
 * delivered per page by the service tree flow, never injected globally here.
 */
export function installBuiltinStyles(document: Document = globalThis.document): void {
  const style = document.createElement('style')
  style.textContent = [
    BUILTIN_BASE_STYLES,
    BUILTIN_HOST_STYLES,
    ...BUILTIN_COMPONENT_STYLES.map((item) => (
      typeof item === 'string' ? item : item.content
    )),
  ].join('\n')
  document.head.appendChild(style)
}

/**
 * Bind the Web render tree to a renderer factory.
 *
 * `bootRenderEntry` composes this internally for iframe/MessageChannel
 * hosts. Keep this factory public for WebView hosts that provide their own
 * transport (see `hosts/ios/src/web/render.ts`).
 */
export function createGlassRenderEntry(options: GlassRenderEntryOptions = {}): GlassRenderEntry {
  const document = options.document ?? globalThis.document
  return {
    prepare: () => installBuiltinStyles(document),
    createRenderer: () => createGlassRenderTree({
      container: options.container ?? document.getElementById('app') ?? document.body,
      ...(options.resolveAssetUrl ? { resolveAssetUrl: options.resolveAssetUrl } : {}),
    }),
    ...(options.pageId ? { pageId: options.pageId } : {}),
    ...(options.loadTemplates ? { loadTemplates: options.loadTemplates } : {}),
    ...(options.pageFrame ? { pageFrame: true } : {}),
  }
}

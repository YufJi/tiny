import type { TreeRenderer } from '@tiny/runtime'
import { createGlassRenderTree } from './render-tree'
import {
  BUILTIN_BASE_STYLES,
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
} from './generated/styles'

export type RenderEntryOptions = {
  /** DOM container for the page root. Defaults to `#app`, then `<body>`. */
  container?: HTMLElement
  /** Host hook mapping app asset paths to loadable URLs. */
  resolveAssetUrl?: (src: string, sourcePath?: string) => string | undefined
  /** Page id when the render document was created for a specific page. */
  pageId?: string
  /** Document used to install built-in styles; defaults to the current one. */
  document?: Document
}

/** Renderer factory a host can boot over any transport. */
export type GlassRenderEntry = {
  /** Install the host-owned built-in styles; run before the thread says ready. */
  prepare: () => void
  createRenderer: () => TreeRenderer
  pageId?: string
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
 * Bind the Web render tree to a renderer factory. `prepare` installs the
 * built-in styles before the thread announces readiness; the tree itself is
 * only created when the host asks for the renderer, so a browser entry can
 * hand this to `bootBrowserRenderEntry` and keep the port handshake in the
 * host package.
 */
export function createGlassRenderEntry(options: RenderEntryOptions = {}): GlassRenderEntry {
  const document = options.document ?? globalThis.document
  return {
    prepare: () => installBuiltinStyles(document),
    createRenderer: () => createGlassRenderTree({
      container: options.container ?? document.getElementById('app') ?? document.body,
      ...(options.resolveAssetUrl ? { resolveAssetUrl: options.resolveAssetUrl } : {}),
    }),
    ...(options.pageId ? { pageId: options.pageId } : {}),
  }
}

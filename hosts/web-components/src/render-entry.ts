import { bootTreeThread } from '@tiny/runtime'
import type { TreeThreadOptions } from '@tiny/runtime'
import { createGlassRenderTree } from './render-tree'
import {
  BUILTIN_BASE_STYLES,
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
} from './generated/styles'

export type RenderEntryOptions = {
  transport: TreeThreadOptions['transport']
  /** DOM container for the page root. Defaults to `#app`, then `<body>`. */
  container?: HTMLElement
  /** Host hook mapping app asset paths to loadable URLs. */
  resolveAssetUrl?: (src: string, sourcePath?: string) => string | undefined
  /** Page id when the render document was created for a specific page. */
  pageId?: string
  /** Document used to install built-in styles; defaults to the current one. */
  document?: Document
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

/** Boot a web render thread from a host transport. */
export function bootGlassRenderEntry(options: RenderEntryOptions): void {
  const document = options.document ?? globalThis.document
  installBuiltinStyles(document)
  const renderer = createGlassRenderTree({
    container: options.container ?? document.getElementById('app') ?? document.body,
    resolveAssetUrl: options.resolveAssetUrl,
  })
  bootTreeThread({
    transport: options.transport,
    renderer,
    ...(options.pageId ? { initialPageId: options.pageId } : {}),
  })
}

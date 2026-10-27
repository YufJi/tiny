import path from 'node:path'
import { parseDocument } from './src/content/parse.js'

/**
 * Vite plugin that turns `docs/site/*.md` into React page modules.
 *
 * Parsing happens at build time, so contract violations fail `vite build` (and
 * surface as an overlay in dev) instead of shipping a silently wrong page.
 */
export function docsPlugin({ root }) {
  return {
    name: 'tiny-docs',
    enforce: 'pre',
    transform(source, id) {
      if (!id.endsWith('.md') || !id.includes(`${path.sep}docs${path.sep}site${path.sep}`)) {
        return null
      }
      const file = path.relative(root, id)
      const doc = parseDocument(source, { file })
      this.addWatchFile?.(id)
      return {
        code: [
          "import { renderPage } from '/src/content/render.js'",
          `const doc = ${JSON.stringify({ meta: doc.meta, blocks: doc.blocks })}`,
          'export const meta = doc.meta',
          'export default function ContentPage() {',
          '  return renderPage(doc.meta, doc.blocks)',
          '}',
          '',
        ].join('\n'),
        map: null,
      }
    },
  }
}

import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

/**
 * Source-level rewrites applied to every WXML file before it reaches
 * `@tiny/template-compiler`. They translate mini-program semantics that the
 * browser host cannot express into plain CSS/DOM concepts.
 */

const IMAGE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
}

const INLINE_IMAGE_LIMIT = 200 * 1024

/**
 * Mini-program image paths are relative to the page/component file. Browser
 * hosts would resolve them against the thread document instead, so inline
 * small local images as data URIs. Large assets are left untouched for the
 * host asset pipeline.
 */
export function inlineLocalImages(source: string, templateFile: string, rootDir: string): string {
  const imagePattern = /(['"])([^'"]+\.(?:png|jpe?g|gif|svg|webp|bmp))\1/gi
  return source.replace(imagePattern, (match, quote: string, value: string) => {
    if (/^(?:[a-z]+:|data:)/i.test(value)) return match
    const absolute = value.startsWith('/')
      ? path.join(rootDir, value.slice(1))
      : path.resolve(path.dirname(templateFile), value)
    const relative = path.relative(rootDir, absolute)
    if (relative.startsWith('..') || path.isAbsolute(relative)) return match
    const extension = path.extname(absolute).toLowerCase()
    const mime = IMAGE_MIME_TYPES[extension]
    if (!mime) return match
    try {
      if (!existsSync(absolute)) return match
      const { size } = statSync(absolute)
      if (size > INLINE_IMAGE_LIMIT) return match
      const data = readFileSync(absolute).toString('base64')
      return `${quote}data:${mime};base64,${data}${quote}`
    } catch {
      return match
    }
  })
}

/**
 * Mini-program `animation="{{data}}"` attributes become inline styles. The
 * runtime animation API exports a CSS declaration string, so rewriting the
 * attribute lets the browser run the transition without a dedicated backend
 * animation channel.
 */
export function rewriteAnimationAttributes(source: string): string {
  return source.replace(
    /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)\/?>/g,
    (match, tag: string, attributes: string) => {
      const animation = attributes.match(/\sanimation\s*=\s*(["'])([\s\S]*?)\1/)
      if (!animation) return match
      const value = animation[2]!
      let nextAttributes = attributes.replace(animation[0], '')
      const style = nextAttributes.match(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/)
      if (style) {
        const existing = style[2]!
        const separator = existing.trimEnd().endsWith(';') ? '' : ';'
        nextAttributes = nextAttributes.replace(style[0], ` style="${existing}${separator}${value}"`)
      } else {
        nextAttributes = `${nextAttributes} style="${value}"`
      }
      return `<${tag}${nextAttributes}>`
    },
  )
}

const TAG_CLASS_SKIP = new Set(['import', 'include', 'template', 'block', 'wxs', 'slot'])

/**
 * Adds the generic scope marker and a tag-specific marker to every rendered
 * element. Glass-easel prefixes both with the template's style scope at render
 * time. The stylesheet compiler uses them to keep tag and anchorless selectors
 * inside their page/component instead of leaking globally.
 */
export function injectScopeClasses(
  source: string,
  tagClassPrefix: string,
  scopeMarkerClass: string,
): string {
  return source.replace(
    /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g,
    (match, rawTag: string, attributes: string, selfClose: string) => {
      const tag = rawTag.toLowerCase()
      if (TAG_CLASS_SKIP.has(tag)) return match
      const markers = `${tagClassPrefix}${tag} ${scopeMarkerClass}`
      const classMatch = attributes.match(/\sclass\s*=\s*(["'])([\s\S]*?)\1/)
      let nextAttributes = attributes
      if (classMatch) {
        const quote = classMatch[1]!
        const value = classMatch[2]!
        const separator = value.length === 0 || /\s$/.test(value) ? '' : ' '
        nextAttributes = attributes.replace(classMatch[0], ` class=${quote}${value}${separator}${markers}${quote}`)
      } else {
        nextAttributes = `${attributes} class="${markers}"`
      }
      return `<${rawTag}${nextAttributes}${selfClose}>`
    },
  )
}

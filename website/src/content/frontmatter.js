import YAML from 'yaml'

const FENCE = '---'
const TONES = new Set(['good', 'warn', 'bad', 'violet'])
const LAYOUTS = new Set(['home'])
const BUTTON_VARIANTS = new Set(['primary', 'ghost'])

/**
 * Splits `docs/site/*.md` frontmatter from the body and validates the page
 * metadata. Frontmatter is plain YAML, so editors and agents can treat it as
 * ordinary YAML; the shape below is the part that is checked.
 */
export function splitFrontmatter(source, file) {
  const normalized = source.replace(/\r\n/g, '\n')
  if (!normalized.startsWith(`${FENCE}\n`)) {
    fail(file, 1, `文件必须以 ${FENCE} 开头并提供 frontmatter`)
  }
  const closing = normalized.indexOf(`\n${FENCE}\n`, FENCE.length)
  if (closing < 0) fail(file, 1, 'frontmatter 没有闭合')

  const header = normalized.slice(FENCE.length + 1, closing)
  const body = normalized.slice(closing + FENCE.length + 2)
  const headerLines = header.split('\n').length

  let meta
  try {
    meta = YAML.parse(header) ?? {}
  } catch (error) {
    fail(file, 2, `frontmatter 不是合法 YAML：${error instanceof Error ? error.message : error}`)
  }
  if (typeof meta !== 'object' || Array.isArray(meta)) {
    fail(file, 2, 'frontmatter 必须是一个映射')
  }
  validateMeta(meta, file)
  return { meta, body, lineOffset: headerLines + 2 }
}

function validateMeta(meta, file) {
  for (const key of ['title', 'eyebrow', 'lede', 'description']) {
    if (typeof meta[key] !== 'string' || meta[key].length === 0) {
      fail(file, 1, `frontmatter 缺少必填字段：${key}（非空字符串）`)
    }
  }
  if (meta.highlight !== undefined && typeof meta.highlight !== 'string') {
    fail(file, 1, 'frontmatter 字段 highlight 必须是字符串')
  }
  if (meta.order !== undefined && typeof meta.order !== 'number') {
    fail(file, 1, 'frontmatter 字段 order 必须是数字')
  }
  if (meta.layout !== undefined) {
    if (!LAYOUTS.has(meta.layout)) {
      fail(file, 1, `frontmatter 字段 layout 只能是 ${[...LAYOUTS].join(' / ')}`)
    }
    if (meta.layout === 'home') validateActions(meta.actions, file)
  } else if (meta.actions !== undefined) {
    fail(file, 1, 'frontmatter 字段 actions 只用于 layout: home')
  }
  validatePairs(meta.stats, 'stats', file, 2)
  validatePairs(meta.pills, 'pills', file, 2)
  for (const [, tone] of meta.pills ?? []) {
    if (tone !== undefined && tone !== '' && !TONES.has(tone)) {
      fail(file, 1, `pill 的 tone 不合法：${tone}`)
    }
  }
}

function validateActions(actions, file) {
  if (!Array.isArray(actions) || actions.length === 0) {
    fail(file, 1, 'layout: home 需要 actions: [[文案, 链接, primary|ghost], …]')
  }
  for (const entry of actions) {
    if (!Array.isArray(entry) || entry.length !== 3) {
      fail(file, 1, 'actions 的每一项必须是 [文案, 链接, primary|ghost]')
    }
    const [label, href, variant] = entry
    if (typeof label !== 'string' || typeof href !== 'string' || !href) {
      fail(file, 1, 'actions 的文案和链接必须是非空字符串')
    }
    if (!BUTTON_VARIANTS.has(variant)) {
      fail(file, 1, `actions 的 variant 只能是 ${[...BUTTON_VARIANTS].join(' / ')}：${variant}`)
    }
  }
}

function validatePairs(value, key, file, width) {
  if (value === undefined) return
  if (!Array.isArray(value)) fail(file, 1, `frontmatter 字段 ${key} 必须是数组`)
  for (const entry of value) {
    if (!Array.isArray(entry) || entry.length !== width) {
      fail(file, 1, `frontmatter 字段 ${key} 的每一项必须是 ${width} 元组`)
    }
  }
}

export function fail(file, line, message) {
  const error = new Error(`${file}:${line}: ${message}`)
  error.name = 'DocsContractError'
  throw error
}

export { TONES }

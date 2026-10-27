import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import { fail, splitFrontmatter, TONES } from './frontmatter.js'

/**
 * Turns the restricted Markdown used in `docs/site/*.md` into the small
 * serializable AST the site renders.
 *
 * Body syntax is plain CommonMark + GFM (tables, autolinks), plus
 * `remark-directive` containers for the UI vocabulary. Everything outside that
 * vocabulary fails the build, so pages cannot drift from the contract in
 * `docs/site/CONTEXT.md`.
 */

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective)

const CONTAINERS = new Set([
  'callout',
  'cards',
  'card',
  'split',
  'stack',
  'group',
  'actions',
  'pill-row',
  'sequence',
  'flow',
  'embed',
])

const BUTTON_VARIANTS = new Set(['primary', 'ghost'])

const CARDS_LAYOUTS = new Set(['three'])

const BLOCK_NODES = new Set([
  'paragraph',
  'list',
  'table',
  'code',
  'heading',
  'thematicBreak',
  'blockquote',
  'html',
  'containerDirective',
  'leafDirective',
  'textDirective',
  'listItem',
])

export function parseDocument(source, { file = '<markdown>' } = {}) {
  const { meta, body, lineOffset } = splitFrontmatter(source, file)
  const tree = processor.parse(body)
  const state = { file, lineOffset, sectionIds: new Set() }

  const blocks = transformBlocks(tree.children, state)
  assertAnchorConsistency(blocks, file)
  return { meta: { ...meta, nav: buildNav(blocks) }, blocks }
}

function buildNav(blocks) {
  return blocks
    .filter((block) => block.type === 'section' && block.id)
    .map((block) => [block.id, block.nav ?? block.kicker ?? block.title])
}

/**
 * A page either anchors every section (it wants the in-page nav) or anchors
 * none of them (a landing page). Mixing the two is almost always a mistake.
 */
function assertAnchorConsistency(blocks, file) {
  const sections = blocks.filter((block) => block.type === 'section')
  const anchored = sections.filter((block) => block.id).length
  if (anchored !== 0 && anchored !== sections.length) {
    fail(file, 1, '同一页面的 ## 标题必须都带 {#anchor}，或者都不带')
  }
}

// ---------------------------------------------------------------------- blocks

function transformBlocks(nodes, state, allowEmpty = false) {
  const blocks = []
  let index = 0
  while (index < nodes.length) {
    const node = nodes[index]
    if (node.type === 'heading' && node.depth === 2) {
      const end = findNextSection(nodes, index + 1)
      blocks.push(parseSection(nodes.slice(index + 1, end), node, state))
      index = end
      continue
    }
    const block = transformBlock(node, state)
    if (block) blocks.push(block)
    index++
  }
  if (blocks.length === 0 && !allowEmpty) fail(state.file, 1, '正文为空')
  return blocks
}

function findNextSection(nodes, from) {
  for (let index = from; index < nodes.length; index++) {
    const node = nodes[index]
    if (node.type === 'heading' && node.depth === 2) return index
  }
  return nodes.length
}

function parseSection(children, heading, state) {
  const { title, attrs } = parseHeading(heading, state)
  if (attrs.id) {
    if (state.sectionIds.has(attrs.id)) {
      fail(state.file, lineOf(heading, state), `锚点重复：${attrs.id}`)
    }
    state.sectionIds.add(attrs.id)
  }

  const blocks = transformBlocks(children, state)
  // The first paragraph renders as the section intro.
  const intro = blocks[0]?.type === 'paragraph' ? blocks[0].content : null
  return {
    type: 'section',
    id: attrs.id,
    title,
    kicker: attrs.kicker,
    nav: attrs.nav,
    intro,
    children: intro ? blocks.slice(1) : blocks,
  }
}

function transformBlock(node, state) {
  const line = lineOf(node, state)
  switch (node.type) {
    case 'heading':
      if (node.depth !== 3) fail(state.file, line, `只支持 ## 和 ###，收到 ${'#'.repeat(node.depth)}`)
      return { type: 'subheading', content: transformInline(node.children, state) }
    case 'paragraph':
      return { type: 'paragraph', content: transformInline(node.children, state) }
    case 'list':
      return parseList(node, state)
    case 'table':
      return parseTable(node, state)
    case 'code':
      return { type: 'code', lang: node.lang ?? '', value: node.value }
    case 'containerDirective':
      return parseContainer(node, state)
    case 'thematicBreak':
      fail(state.file, line, '不支持水平分割线')
      break
    case 'html':
      fail(state.file, line, '不支持原始 HTML；请使用契约里的指令块或行内语法')
      break
    case 'blockquote':
      fail(state.file, line, '不支持引用块；请使用 :::callout')
      break
    case 'leafDirective':
    case 'textDirective':
      fail(state.file, line, `行内指令只能出现在段落或表格单元里：${node.name}`)
      break
    default:
      if (BLOCK_NODES.has(node.type)) {
        fail(state.file, line, `不支持的块级语法：${node.type}`)
      }
      fail(state.file, line, `无法识别的块：${node.type}`)
  }
}

function parseList(node, state) {
  const items = node.children.map((item, index) => {
    const paragraphs = item.children.filter((child) => child.type === 'paragraph')
    if (paragraphs.length !== 1 || item.children.length !== 1) {
      fail(state.file, lineOf(item, state), `列表第 ${index + 1} 项只能是单行文本`)
    }
    return transformInline(paragraphs[0].children, state)
  })
  return { type: 'list', ordered: Boolean(node.ordered), items }
}

function parseTable(node, state) {
  const line = lineOf(node, state)
  const head = node.children[0]
  const width = head.children.length
  const rows = node.children.slice(1).map((row) => {
    if (row.children.length !== width) {
      fail(
        state.file,
        lineOf(row, state),
        `表格列数不一致：表头 ${width} 列，这一行 ${row.children.length} 列`,
      )
    }
    return row.children.map((cell) => transformInline(cell.children, state))
  })
  if (rows.length === 0) fail(state.file, line, '表格没有数据行')
  return {
    type: 'table',
    head: head.children.map((cell) => transformInline(cell.children, state)),
    rows,
  }
}

function parseContainer(node, state) {
  const line = lineOf(node, state)
  const name = node.name
  if (!CONTAINERS.has(name)) fail(state.file, line, `未知指令块：:::${name}`)
  const attrs = node.attributes ?? {}
  // `:::embed` is a leaf-like block: it renders an iframe and takes no body.
  if (name === 'embed') {
    if ((node.children ?? []).length > 0) fail(state.file, line, ':::embed 不能包含内容')
    if (!attrs.src) fail(state.file, line, ':::embed 缺少 src')
    return {
      type: 'embed',
      src: attrs.src,
      title: attrs.title ?? '',
      label: attrs.label,
      badge: attrs.badge,
      open: attrs.open,
    }
  }
  const children = transformBlocks(node.children, state)
  const tone = readTone(attrs, state, line)

  switch (name) {
    case 'callout':
      if (children.length === 0) fail(state.file, line, ':::callout 不能为空')
      return { type: 'callout', title: attrs.title, tone, children }
    case 'cards': {
      if (children.some((child) => child.type !== 'card')) {
        fail(state.file, line, ':::cards 里只能放 :::card')
      }
      const layout = attrs.layout
      if (layout !== undefined && !CARDS_LAYOUTS.has(layout)) {
        fail(state.file, line, `:::cards 的 layout 只能是 ${[...CARDS_LAYOUTS].join(' / ')}`)
      }
      return { type: 'cards', layout, children }
    }
    case 'card':
      if (children.length === 0) fail(state.file, line, ':::card 不能为空')
      return { type: 'card', tag: attrs.tag, title: attrs.title, tone, children }
    case 'split':
    case 'stack':
    case 'group':
    case 'actions':
    case 'pill-row':
      if (children.length === 0) fail(state.file, line, `:::${name} 不能为空`)
      return { type: name, children }
    case 'sequence':
      return { type: 'sequence', steps: parseSteps(children, state, line) }
    case 'flow':
      return { type: 'flow', nodes: parseFlow(children, state, line) }
    default:
      fail(state.file, line, `未知指令块：:::${name}`)
  }
}

function readTone(attrs, state, line) {
  const tone = attrs.tone
  if (tone === undefined || tone === '') return undefined
  if (!TONES.has(tone)) fail(state.file, line, `tone 不合法：${tone}`)
  return tone
}

function singleTable(children, directive, state, line) {
  if (children.length !== 1 || children[0].type !== 'table') {
    fail(state.file, line, `:::${directive} 里必须且只能放一张表格`)
  }
  return children[0]
}

function columnsOf(table) {
  return table.head.map(textOf)
}

function parseSteps(children, state, line) {
  const table = singleTable(children, 'sequence', state, line)
  const columns = columnsOf(table)
  if (!columns.includes('title')) {
    fail(state.file, line, ':::sequence 的表格缺少 title 列')
  }
  return table.rows.map((row) => {
    const cells = Object.fromEntries(columns.map((column, index) => [column, row[index]]))
    return {
      title: textOf(cells.title),
      actor: optionalText(cells.actor),
      detail: optionalText(cells.detail),
      code: optionalText(cells.code),
    }
  })
}

function parseFlow(children, state, line) {
  const table = singleTable(children, 'flow', state, line)
  const columns = columnsOf(table)
  for (const required of ['step', 'title']) {
    if (!columns.includes(required)) fail(state.file, line, `:::flow 的表格缺少 ${required} 列`)
  }
  return table.rows.map((row) => {
    const cells = Object.fromEntries(columns.map((column, index) => [column, row[index]]))
    return {
      step: textOf(cells.step),
      title: textOf(cells.title),
      detail: optionalText(cells.detail),
      accent: optionalText(cells.accent) === 'yes',
    }
  })
}

function optionalText(nodes) {
  const value = textOf(nodes)
  return value.length > 0 ? value : undefined
}

/** Sequence/flow props are plain strings, so inline styling is flattened. */
function textOf(nodes) {
  if (!Array.isArray(nodes)) return ''
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'code':
          return node.value
        case 'strong':
        case 'link':
          return textOf(node.children)
        default:
          return ''
      }
    })
    .join('')
}

// ---------------------------------------------------------------------- inline

function transformInline(nodes, state) {
  const output = []
  for (const node of nodes) {
    const line = lineOf(node, state)
    switch (node.type) {
      case 'text':
        output.push({ type: 'text', value: node.value })
        break
      case 'inlineCode':
        output.push({ type: 'code', value: node.value })
        break
      case 'strong':
        output.push({ type: 'strong', children: transformInline(node.children, state) })
        break
      case 'link':
        output.push({ type: 'link', href: node.url, children: transformInline(node.children, state) })
        break
      case 'break':
        output.push({ type: 'br' })
        break
      case 'textDirective': {
        // `remark-directive` also turns prose like `ok:false` into a text
        // directive with no label; treat those as literal text.
        if (node.name !== 'pill' && node.name !== 'button' && (node.children ?? []).length === 0) {
          output.push({ type: 'text', value: `:${node.name}` })
          break
        }
        output.push(node.name === 'button' ? parseButton(node, state, line) : parsePill(node, state, line))
        break
      }
      case 'emphasis':
        fail(state.file, line, '不支持斜体；请使用 **加粗** 或行内代码')
        break
      default:
        fail(state.file, line, `不支持的行内语法：${node.type}`)
    }
  }
  return output
}

function parseButton(node, state, line) {
  const attrs = node.attributes ?? {}
  if (!attrs.href) fail(state.file, line, ':button 缺少 href')
  const variant = attrs.variant ?? 'ghost'
  if (!BUTTON_VARIANTS.has(variant)) {
    fail(state.file, line, `:button 的 variant 只能是 ${[...BUTTON_VARIANTS].join(' / ')}`)
  }
  const text = textOf(transformInline(node.children, state))
  if (!text) fail(state.file, line, ':button 不能为空')
  return { type: 'button', href: attrs.href, variant, text }
}

function parsePill(node, state, line) {
  if (node.name !== 'pill') fail(state.file, line, `未知行内指令：:${node.name}`)
  const attrs = node.attributes ?? {}
  const tone = attrs.tone
  if (tone !== undefined && tone !== '' && !TONES.has(tone)) {
    fail(state.file, line, `pill 的 tone 不合法：${tone}`)
  }
  const text = textOf(transformInline(node.children, state))
  if (!text) fail(state.file, line, 'pill 不能为空')
  return { type: 'pill', tone: tone || undefined, text }
}

// ------------------------------------------------------------------- utilities

/**
 * `## 标题 {#anchor kicker="职责"}` — remark does not parse heading attributes,
 * so the trailing brace group is read off the last text node.
 */
function parseHeading(heading, state) {
  const children = [...heading.children]
  const last = children[children.length - 1]
  if (!last || last.type !== 'text') {
    fail(state.file, lineOf(heading, state), '标题末尾必须带 {#anchor} 属性组')
  }
  const match = /\s*\{([^}]*)\}\s*$/.exec(last.value)
  if (!match) {
    return { title: textOf(transformInline(children, state)), attrs: {} }
  }
  last.value = last.value.slice(0, match.index)
  return {
    title: textOf(transformInline(children, state)).trim(),
    attrs: parseAttributes(match[1]),
  }
}

function parseAttributes(source) {
  const attrs = {}
  const pattern = /(#[a-zA-Z][\w-]*|[a-zA-Z][\w-]*)(?:\s*=\s*"([^"]*)")?/g
  let match
  while ((match = pattern.exec(source)) !== null) {
    const [, key, value] = match
    if (key.startsWith('#')) attrs.id = key.slice(1)
    else attrs[key] = value ?? true
  }
  return attrs
}

function lineOf(node, state) {
  return state.lineOffset + (node.position?.start.line ?? 0)
}

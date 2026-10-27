import React from 'react'
import {
  Callout,
  Card,
  Cards,
  CodeBlock,
  Flow,
  PageHero,
  PageNav,
  Section,
  Sequence,
  Table,
} from '../components/ui'

/**
 * Renders the AST produced by `parse.js` with the shared UI components.
 * This file is the only place that maps document semantics to the visual
 * vocabulary, so pages cannot introduce new looks on their own.
 */

const h = React.createElement

export function renderPage(meta, blocks) {
  const hero = meta.layout === 'home' ? renderLandingHero(meta) : renderPageHero(meta)
  return h(
    React.Fragment,
    null,
    hero,
    meta.nav?.length ? h(PageNav, { items: meta.nav }) : null,
    ...blocks.map(renderBlock),
  )
}

function heroTitle(meta) {
  return meta.highlight
    ? h(
        React.Fragment,
        null,
        meta.title,
        h('br'),
        h('span', { className: 'gradient' }, meta.highlight),
      )
    : meta.title
}

function renderPageHero(meta) {
  return h(PageHero, {
    eyebrow: meta.eyebrow,
    title: heroTitle(meta),
    lede: meta.lede,
    stats: meta.stats ?? [],
    pills: meta.pills ?? [],
  })
}

/** The landing page keeps its own hero layout (`.hero`, not `.page-hero`). */
function renderLandingHero(meta) {
  return h(
    'section',
    { className: 'hero' },
    h(
      'div',
      { className: 'shell' },
      h('p', { className: 'eyebrow' }, meta.eyebrow),
      h('h1', null, heroTitle(meta)),
      h('p', { className: 'lede' }, meta.lede),
      h(
        'div',
        { className: 'hero-actions' },
        ...meta.actions.map(([label, href, variant], index) =>
          h('a', { key: index, className: `button ${variant}`, href }, label),
        ),
      ),
      h(
        'ul',
        { className: 'hero-stats' },
        ...(meta.stats ?? []).map(([value, label], index) =>
          h('li', { key: index }, h('strong', null, value), h('span', null, label)),
        ),
      ),
    ),
  )
}

function renderBlock(block, index) {
  const key = `${block.type}-${index}`
  switch (block.type) {
    case 'section':
      return h(
        Section,
        {
          key,
          id: block.id,
          kicker: block.kicker,
          title: block.title,
          intro: block.intro ? renderInline(block.intro) : undefined,
        },
        ...block.children.map(renderBlock),
      )
    case 'subheading':
      return h('h3', { key }, renderInline(block.content))
    case 'paragraph':
      return h('p', { key }, renderInline(block.content))
    case 'list':
      return h(
        block.ordered ? 'ol' : 'ul',
        { key },
        ...block.items.map((item, itemIndex) => h('li', { key: itemIndex }, renderInline(item))),
      )
    case 'table':
      return h(Table, {
        key,
        head: block.head.map((cell) => renderInline(cell)),
        rows: block.rows.map((row) => row.map((cell) => renderInline(cell))),
      })
    case 'code':
      return h(CodeBlock, { key }, block.value)
    case 'callout':
      return h(
        Callout,
        { key, title: block.title, tone: block.tone ?? '' },
        ...block.children.map(renderBlock),
      )
    case 'cards':
      return h(Cards, { key, className: block.layout }, ...block.children.map(renderBlock))
    case 'card':
      return h(
        Card,
        { key, tag: block.tag, title: block.title, tone: block.tone },
        ...block.children.map(renderBlock),
      )
    case 'split':
    case 'stack':
      return h('div', { key, className: block.type }, ...block.children.map(renderBlock))
    case 'group':
      return h('div', { key }, ...block.children.map(renderBlock))
    case 'actions':
      return h('div', { key, className: 'hero-actions' }, renderInlineBlocks(block.children, key))
    case 'pill-row':
      return h('div', { key, className: 'pill-row' }, renderInlineBlocks(block.children, key))
    case 'sequence':
      return h(Sequence, { key, steps: block.steps })
    case 'flow':
      return h(Flow, { key, nodes: block.nodes })
    case 'embed': {
      const frame = h(
        'div',
        { key: `${key}-frame`, className: 'devtool-frame' },
        h('iframe', {
          src: block.src,
          title: block.title,
          loading: 'lazy',
          allow: 'fullscreen',
        }),
      )
      if (!block.label) return frame
      return h(
        React.Fragment,
        { key },
        h(
          'div',
          { className: 'devtool-bar' },
          h(
            'div',
            { className: 'devtool-bar-copy' },
            h('span', { className: 'devtool-dot', 'aria-hidden': 'true' }),
            h('strong', null, block.label),
            block.badge ? h('code', null, block.badge) : null,
          ),
          block.open
            ? h(
                'a',
                { className: 'button ghost', href: block.src, target: '_blank', rel: 'noreferrer' },
                block.open,
              )
            : null,
        ),
        frame,
      )
    }
    default:
      throw new Error(`unknown block: ${block.type}`)
  }
}

/** Containers like `:::actions` hold one paragraph of inline nodes. */
function renderInlineBlocks(blocks, prefix) {
  if (blocks.length === 1 && blocks[0].type === 'paragraph') {
    return renderInline(blocks[0].content, prefix)
  }
  return blocks.map(renderBlock)
}

function renderInline(nodes, prefix = 'inline') {
  return nodes.map((node, index) => {
    const key = `${prefix}-${index}`
    switch (node.type) {
      case 'text':
        return node.value
      case 'code':
        return h('code', { key }, node.value)
      case 'strong':
        return h('strong', { key }, renderInline(node.children, key))
      case 'link':
        return h('a', { key, href: node.href }, renderInline(node.children, key))
      case 'pill':
        return h(
          'span',
          { key, className: `pill${node.tone ? ` ${node.tone}` : ''}` },
          node.text,
        )
      case 'button':
        return h(
          'a',
          { key, className: `button ${node.variant}`, href: node.href },
          node.text,
        )
      case 'br':
        return h('br', { key })
      default:
        throw new Error(`unknown inline node: ${node.type}`)
    }
  })
}

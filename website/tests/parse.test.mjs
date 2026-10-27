import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { parseDocument } from '../src/content/parse.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const protocolPath = path.join(here, '..', '..', 'docs', 'site', 'protocol.md')

const page = (body) => `---
name: '页面'
title: '标题'
eyebrow: '标签'
lede: '导语'
description: '摘要'
---

${body}`

const parse = (body) => parseDocument(page(body), { file: 'test.md' })

function rejection(body) {
  try {
    parse(body)
  } catch (error) {
    return error.message
  }
  return null
}

test('protocol page keeps its structure', async () => {
  const doc = parseDocument(await readFile(protocolPath, 'utf8'), { file: 'protocol.md' })

  assert.deepEqual(
    doc.blocks.map((block) => block.id),
    ['role', 'envelope', 'handshake', 'transport', 'batching', 'errors', 'json', 'catalog', 'relay', 'extend'],
  )
  assert.equal(doc.meta.nav.length, 10)
  assert.deepEqual(doc.meta.nav[0], ['role', '职责'])
  assert.deepEqual(doc.meta.stats, [['1', '协议版本'], ['4', '消息类型'], ['7', '消息域'], ['30s', '默认调用超时']])

  const children = doc.blocks.flatMap((block) => block.children)
  const tables = children.filter((child) => child.type === 'table')
  assert.equal(tables.length, 5)
  const catalog = tables.find((table) => table.head[0][0]?.value === 'Domain')
  assert.equal(catalog.rows.length, 37)

  const sequence = children.find((child) => child.type === 'sequence')
  assert.equal(sequence.steps.length, 5)
  assert.equal(sequence.steps[0].code, "onCall('runtime', 'hello')")
})

test('the first paragraph becomes the section intro', () => {
  const doc = parse('## 标题一 {#one kicker="导航"}\n\n导语段落。\n\n正文段落。\n')
  const section = doc.blocks[0]
  assert.equal(section.intro.length, 1)
  assert.deepEqual(section.children.map((child) => child.type), ['paragraph'])
})

test('pills parse with and without a tone', () => {
  const doc = parse('## 标题一 {#one}\n\n状态 :pill[可用]{tone="good"} 和 :pill[未知]。\n')
  const inline = doc.blocks[0].intro
  assert.deepEqual(
    inline.filter((node) => node.type === 'pill'),
    [{ type: 'pill', tone: 'good', text: '可用' }, { type: 'pill', tone: undefined, text: '未知' }],
  )
})

test('prose colons such as ok:false stay literal text', () => {
  const doc = parse('## 标题一 {#one}\n\n自动回复 ok:false 就结束。\n')
  const text = doc.blocks[0].intro.map((node) => node.value ?? '').join('')
  assert.match(text, /ok:false/)
})

test('directives nest by colon count', () => {
  const doc = parse(
    '## 标题一 {#one}\n\n::::split\n:::card{title="卡片"}\n内容\n:::\n::::\n',
  )
  const split = doc.blocks[0].children[0]
  assert.equal(split.type, 'split')
  assert.equal(split.children[0].type, 'card')
  assert.equal(split.children[0].title, '卡片')
})

test('rejects raw HTML', () => {
  assert.match(rejection('## 标题一 {#one}\n\n<div>x</div>\n'), /不支持原始 HTML/)
})

test('rejects blockquotes', () => {
  assert.match(rejection('## 标题一 {#one}\n\n> 引用\n'), /不支持引用块/)
})

test('rejects unknown directives', () => {
  assert.match(rejection('## 标题一 {#one}\n\n:::note\n内容\n:::\n'), /未知指令块/)
})

test('rejects duplicate anchors', () => {
  assert.match(
    rejection('## 标题一 {#one}\n\nA\n\n## 标题二 {#one}\n\nB\n'),
    /锚点重复/,
  )
})

test('anchors are optional when the whole page omits them', () => {
  const doc = parse('## 没有锚点\n\nA\n\n## 也没有\n\nB\n')
  assert.equal(doc.meta.nav.length, 0)
  assert.equal(doc.blocks.length, 2)
})

test('rejects pages that mix anchored and unanchored sections', () => {
  assert.match(rejection('## 有锚点 {#one}\n\nA\n\n## 没有锚点\n\nB\n'), /必须都带/ )
})

test('rejects ragged tables', () => {
  assert.match(
    rejection('## 标题一 {#one}\n\n| a | b |\n| --- | --- |\n| 1 |\n'),
    /表格列数不一致|表格没有数据行|Unexpected/,
  )
})

test('cards accept the three-column layout', () => {
  const doc = parse('## 标题一 {#one}\n\n::::cards{layout="three"}\n:::card{title="A"}\n内容\n:::\n::::\n')
  assert.equal(doc.blocks[0].children[0].layout, 'three')
})

test('rejects unknown card layouts', () => {
  assert.match(
    rejection('## 标题一 {#one}\n\n::::cards{layout="five"}\n:::card{title="A"}\n内容\n:::\n::::\n'),
    /layout 只能是/,
  )
})

test('rejects leaf directives', () => {
  assert.match(rejection('## 标题一 {#one}\n\n::embed{src="a"}\n'), /未知|行内指令|无法识别/)
})

test('rejects empty pills', () => {
  assert.match(rejection('## 标题一 {#one}\n\n状态 :pill[]{tone="good"}\n'), /pill 不能为空/)
})

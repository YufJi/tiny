# Site content contract

`docs/site/*.md` is the single source for the architecture site. The website
parses these files at build time with the small vocabulary below; anything
outside it fails `vite build` with a `file:line` error. Editing content means
editing Markdown only — never the renderer.

Each file is one page. The file name is the route (`protocol.md` → `/protocol/`;
`home.md` → `/`). The site is prerendered, so every page is a real HTML
document; adding a file is all it takes to add a page.

Internal links keep the readable `#/hosts` form in Markdown and are rewritten
to real routes at render time.

## Frontmatter

Every field is required unless marked optional.

```yaml
---
title: '跨线程通信：'          # hero 第一行
highlight: '消息格式、握手和错误处理'  # optional，hero 第二行，带渐变样式
eyebrow: 'Bridge 协议'         # hero 上方的小标签
lede: >-                       # hero 导语
  packages/bridge 不关心 wx API……
stats:                         # optional，hero 下的数字条
  - ['1', '协议版本']
pills:                         # optional，hero 下的彩色标签
  - ['内核不依赖宿主', 'good']  # tone: good | warn | bad | violet
name: '协议'                   # 导航标签，也用于默认浏览器标题
pageTitle: 'Bridge 协议 · Tiny 小程序引擎'   # optional，浏览器标题（≤ 30 字）
description: '一句话摘要，用于 meta description、og:description 与 llms.txt'
order: 5                       # optional，站点导航顺序
# 下面两个只用于首页（layout: home）：自定义 hero 的按钮行
layout: 'home'                 # optional，只有 home 页使用
actions:                       # layout: home 时必填
  - ['先看整体架构', '#/architecture', 'primary']   # [文案, 链接, primary|ghost]
---
```

`pageTitle` and `description` are indexed: keep the target terms（小程序引擎 /
小程序内核）where they read naturally and skip keyword stuffing. The build
turns them into `<title>`, meta description, Open Graph tags, canonical URL,
JSON-LD (`WebSite` / `TechArticle` / `BreadcrumbList`) and the sitemap entry.

## Sections

`##` starts a section. `kicker` is the small label above the heading and, by
default, also the in-page nav label. Use `nav="…"` when the two differ.

```markdown
## Bridge 只负责传输 {#role kicker="职责"}

这一段会成为 section intro（`.section-intro`）；再往后的段落是正文。
```

The first paragraph after the heading is always the intro. `###` renders a
plain `<h3>` inside the section.

Anchors are optional per page, but a page must be consistent: either every
section has `{#id}` (the page gets an in-page nav) or none does (a landing
page like `home.md`). Falling back to the section title is allowed only for
pages without anchors.

## Blocks

| 语法 | 渲染 |
| --- | --- |
| Markdown 表格 | 表格（表头 + 数据行，列数必须一致） |
| 围栏代码块 | 带复制按钮的代码块 |
| `- 列表` | 无序列表 |
| `:::callout{title="…" tone="warn"}` | 提示框 |
| `:::cards` + `:::card{tag="01" title="…"}` | 卡片网格（`{layout="three"}` 为三列） |
| `:::split` / `:::stack` | 两栏 / 竖排容器 |
| `:::group` | 无样式分组（只用于分栏里包住多个块） |
| `:::actions` | 按钮行（内含 `:button`） |
| `:::pill-row` | 标签行（内含 `:pill`） |
| `:::sequence` | 执行时序，内部只能是一张 `title/detail/code` 表 |
| `:::flow` | 架构流程，内部只能是一张 `step/title/detail/accent` 表 |
| `:::embed{src="…" title="…" label="…" badge="…" open="…"}` | 同源 iframe（带 `label` 时渲染顶部工具条和「新标签页打开」链接） |

Container directives nest like code fences: the outer block needs **more
colons** than the inner one, and each block closes with the same number it
opened with.

````markdown
::::split
:::card{title="Bridge 负责"}
- 版本化的消息信封
:::
::::
````

## Inline

| 语法 | 渲染 |
| --- | --- |
| `` `code` `` | 行内代码 |
| `**粗体**` | 加粗 |
| `[文案](#/hosts)` | 链接（站内锚点或绝对 URL） |
| `:pill[可用]{tone="good"}` | 行内状态标签 |
| `:button[打开调试器]{href="#/debugger" variant="primary"}` | 按钮（`primary` / `ghost`，默认 ghost） |

## Rules

- No raw HTML, blockquotes, images, footnotes, or emphasis (`_斜体_`).
  Use the blocks above instead; the parser rejects them.
- Anchors must be unique per page, and a page must either anchor every
  section or none; the build fails otherwise.
- Table rows must have exactly as many cells as the header.
- `:::sequence` / `:::flow` cells are flattened to plain strings, so inline
  styling inside them is not rendered.
- Prose is Chinese by default, matching the rest of the repository.

## Preview

```bash
pnpm site:dev      # Vite on :4173, edit docs/site/*.md and reload
pnpm site:check    # build + validate the published output
```

`website/tests/parse.test.mjs` covers the parser contract; run it with
`pnpm --filter @tiny/website test`.

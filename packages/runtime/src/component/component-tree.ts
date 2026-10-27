import { TINY_ENGINE_NAMING } from '@tiny/manifest'

export type ComponentTreeNode = {
  componentId: string
  pageId: string
  path: string
  tag: string
  id: string
  className: string
  parentId: string | null
  children: Set<string>
  order: number
  attached: boolean
}

export type AddComponentInput = {
  componentId: string
  pageId: string
  path: string
  tag?: string
  id?: string
  className?: string
  parentId?: string | null
}

type CompoundSelector = {
  id?: string
  classes: string[]
  tag?: string
}

type SelectorPart = {
  compounds: CompoundSelector[]
  combinators: Array<'' | '>' | '>>>'>
}

export class ComponentTree {
  private readonly nodes = new Map<string, ComponentTreeNode>()
  private readonly nodesByPath = new Map<string, Set<string>>()
  private readonly pageRoots = new Map<string, string>()
  private order = 0

  ensurePage(pageId: string, path: string): ComponentTreeNode {
    const rootId = pageRootId(pageId)
    const existing = this.nodes.get(rootId)
    if (existing) return existing
    const root: ComponentTreeNode = {
      componentId: rootId,
      pageId,
      path,
      tag: TINY_ENGINE_NAMING.pageTag,
      id: '',
      className: '',
      parentId: null,
      children: new Set(),
      order: 0,
      attached: true,
    }
    this.nodes.set(rootId, root)
    this.pageRoots.set(pageId, rootId)
    return root
  }

  add(input: AddComponentInput): ComponentTreeNode {
    const pageRoot = this.ensurePage(input.pageId, input.path)
    const existing = this.nodes.get(input.componentId)
    if (existing) {
      this.applyMetadata(existing, input)
      if (input.parentId && input.parentId !== existing.parentId) {
        this.move(existing.componentId, input.parentId)
      }
      return existing
    }
    let parentId = input.parentId ?? null
    if (!parentId || !this.nodes.has(parentId)) parentId = pageRoot.componentId
    const parent = this.nodes.get(parentId)
    if (!parent) parentId = pageRoot.componentId
    const node: ComponentTreeNode = {
      componentId: input.componentId,
      pageId: input.pageId,
      path: input.path,
      tag: input.tag ?? input.path,
      id: input.id ?? '',
      className: input.className ?? '',
      parentId,
      children: new Set(),
      order: ++this.order,
      attached: true,
    }
    this.nodes.set(node.componentId, node)
    this.nodes.get(parentId)?.children.add(node.componentId)
    let pathSet = this.nodesByPath.get(node.path)
    if (!pathSet) {
      pathSet = new Set()
      this.nodesByPath.set(node.path, pathSet)
    }
    pathSet.add(node.componentId)
    return node
  }

  move(componentId: string, parentId: string | null | undefined): boolean {
    const node = this.nodes.get(componentId)
    if (!node) return false
    const pageRoot = this.pageRoots.get(node.pageId)
    let nextParentId = parentId ?? pageRoot ?? null
    if (!nextParentId || !this.nodes.has(nextParentId)) nextParentId = pageRoot ?? null
    if (nextParentId === node.parentId) return false
    if (node.parentId) this.nodes.get(node.parentId)?.children.delete(componentId)
    node.parentId = nextParentId
    if (nextParentId) this.nodes.get(nextParentId)?.children.add(componentId)
    return true
  }

  updateMetadata(componentId: string, input: Partial<AddComponentInput>): void {
    const node = this.nodes.get(componentId)
    if (!node) return
    this.applyMetadata(node, input)
  }

  private applyMetadata(node: ComponentTreeNode, input: Partial<AddComponentInput>): void {
    if (input.tag !== undefined) node.tag = input.tag
    if (input.id !== undefined) node.id = input.id
    if (input.className !== undefined) node.className = input.className
    if (input.path !== undefined) node.path = input.path
  }

  get(componentId: string): ComponentTreeNode | undefined {
    return this.nodes.get(componentId)
  }

  pageRoot(pageId: string): ComponentTreeNode | undefined {
    const rootId = this.pageRoots.get(pageId)
    return rootId ? this.nodes.get(rootId) : undefined
  }

  owner(componentId: string): ComponentTreeNode | undefined {
    const node = this.nodes.get(componentId)
    if (!node || !node.parentId) return undefined
    const parent = this.nodes.get(node.parentId)
    if (!parent || parent.tag === TINY_ENGINE_NAMING.pageTag) return undefined
    return parent
  }

  ancestors(componentId: string): ComponentTreeNode[] {
    const result: ComponentTreeNode[] = []
    let node = this.nodes.get(componentId)
    while (node?.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (!parent) break
      if (parent.tag !== TINY_ENGINE_NAMING.pageTag) result.push(parent)
      node = parent
    }
    return result
  }

  descendants(componentId: string): ComponentTreeNode[] {
    const result: ComponentTreeNode[] = []
    const root = this.nodes.get(componentId)
    if (!root) return result
    const visit = (node: ComponentTreeNode) => {
      for (const childId of node.children) {
        const child = this.nodes.get(childId)
        if (!child) continue
        result.push(child)
        visit(child)
      }
    }
    visit(root)
    return result
  }

  remove(componentId: string): string[] {
    const node = this.nodes.get(componentId)
    if (!node) return []
    const removed: string[] = []
    const collect = (id: string) => {
      const current = this.nodes.get(id)
      if (!current) return
      for (const child of current.children) collect(child)
      removed.push(id)
    }
    collect(componentId)
    for (const id of removed) {
      const current = this.nodes.get(id)
      if (!current) continue
      if (current.parentId) this.nodes.get(current.parentId)?.children.delete(id)
      this.nodes.delete(id)
      const pathSet = this.nodesByPath.get(current.path)
      pathSet?.delete(id)
      if (pathSet && pathSet.size === 0) this.nodesByPath.delete(current.path)
    }
    return removed
  }

  removePage(pageId: string): string[] {
    const rootId = this.pageRoots.get(pageId)
    if (!rootId) return []
    const removed = this.remove(rootId)
    this.pageRoots.delete(pageId)
    return removed
  }

  select(scopeId: string, selector: string, all: boolean): ComponentTreeNode[] {
    const parts = parseSelector(selector)
    if (!parts) return []
    const scope = this.nodes.get(scopeId)
    if (!scope) return []
    const candidates = this.descendants(scopeId)
    const matched = candidates.filter((node) => parts.some((part) => matchSelectorPart(node, part, scopeId, this)))
    return all ? matched : matched.slice(0, 1)
  }
}

function pageRootId(pageId: string): string {
  return `page:${pageId}`
}

function parseSelector(selector: string): SelectorPart[] | null {
  if (typeof selector !== 'string' || selector.trim().length === 0) return null
  const parts: SelectorPart[] = []
  for (const raw of selector.split(',')) {
    const part = parseSelectorPart(raw.trim())
    if (!part) return null
    parts.push(part)
  }
  return parts.length > 0 ? parts : null
}

function parseSelectorPart(source: string): SelectorPart | null {
  if (!source) return null
  const normalized = source
    .replace(/>>>/g, '\u0000')
    .replace(/>/g, ' > ')
    .replace(/\u0000/g, ' >>> ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return null
  const tokens = normalized.split(' ')
  const compounds: CompoundSelector[] = []
  const combinators: Array<'' | '>' | '>>>'> = []
  let pendingCombinator: '' | '>' | '>>>' = ''
  for (const token of tokens) {
    if (token === '>' || token === '>>>') {
      pendingCombinator = token
      continue
    }
    const compound = parseCompound(token)
    if (!compound) return null
    if (compounds.length > 0) combinators.push(pendingCombinator)
    compounds.push(compound)
    pendingCombinator = ''
  }
  if (compounds.length === 0) return null
  return { compounds, combinators }
}

function parseCompound(token: string): CompoundSelector | null {
  if (!token) return null
  const compound: CompoundSelector = { classes: [] }
  let index = 0
  let matched = false
  while (index < token.length) {
    const marker = token[index]
    if (marker === '#') {
      index += 1
      const start = index
      while (index < token.length && !'#.'.includes(token[index]!)) index += 1
      if (index === start) return null
      compound.id = token.slice(start, index)
      matched = true
    } else if (marker === '.') {
      index += 1
      const start = index
      while (index < token.length && !'#.'.includes(token[index]!)) index += 1
      if (index === start) return null
      compound.classes.push(token.slice(start, index))
      matched = true
    } else {
      const start = index
      while (index < token.length && !'#.'.includes(token[index]!)) index += 1
      const tag = token.slice(start, index)
      if (!tag) return null
      compound.tag = tag
      matched = true
    }
  }
  return matched ? compound : null
}

function matchSelectorPart(
  node: ComponentTreeNode,
  part: SelectorPart,
  scopeId: string,
  tree: ComponentTree,
): boolean {
  let current: ComponentTreeNode = node
  if (!matchCompound(current, part.compounds.at(-1)!)) return false
  for (let index = part.compounds.length - 2; index >= 0; index -= 1) {
    const combinator = part.combinators[index] ?? ''
    const compound = part.compounds[index]!
    if (combinator === '>>>') {
      let ancestor = current.parentId ? tree.get(current.parentId) : undefined
      let found: ComponentTreeNode | undefined
      while (ancestor) {
        if (ancestor.tag !== TINY_ENGINE_NAMING.pageTag && matchCompound(ancestor, compound)) {
          found = ancestor
          break
        }
        ancestor = ancestor.parentId ? tree.get(ancestor.parentId) : undefined
      }
      if (!found) return false
      current = found
    } else {
      const parent = current.parentId ? tree.get(current.parentId) : undefined
      if (!parent || parent.tag === TINY_ENGINE_NAMING.pageTag || !matchCompound(parent, compound)) return false
      current = parent
    }
  }
  const scope = tree.get(scopeId)
  if (!scope) return false
  if (scope.tag === TINY_ENGINE_NAMING.pageTag) {
    if (node.pageId !== scope.pageId) return false
  } else if (!isDescendantOf(node, scopeId, tree)) {
    return false
  }
  if (!part.combinators.includes('>>>') && node.parentId !== scopeId) return false
  return true
}

function isDescendantOf(node: ComponentTreeNode, ancestorId: string, tree: ComponentTree): boolean {
  let current = node.parentId ? tree.get(node.parentId) : undefined
  while (current) {
    if (current.componentId === ancestorId) return true
    current = current.parentId ? tree.get(current.parentId) : undefined
  }
  return false
}

function matchCompound(node: ComponentTreeNode, compound: CompoundSelector): boolean {
  if (compound.id && node.id !== compound.id) return false
  if (compound.tag && node.tag !== compound.tag) return false
  if (compound.classes.length > 0) {
    const classes = new Set(node.className.split(/\s+/).filter(Boolean))
    for (const name of compound.classes) {
      if (!classes.has(name)) return false
    }
  }
  return true
}

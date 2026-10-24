import type { NormalizedRelation, RelationType } from './component-definition'
import type { ComponentTree, ComponentTreeNode } from './component-tree'

export type RelationInstance = {
  componentId: string
  path: string
  invokeMethod: (name: string, args?: unknown[]) => unknown
}

export type RelationManagerOptions = {
  tree: ComponentTree
  getInstance: (componentId: string) => RelationInstance | undefined
  getRelations: (componentId: string) => NormalizedRelation[]
  onError: (code: string, message: string, details?: unknown) => void
}

type LinkTarget = {
  targetId: string
  targetKey: string
}

type PendingLink = {
  sourceId: string
  sourceKey: string
  targetId: string
  targetKey: string
}

export class RelationManager {
  private readonly links = new Map<string, Map<string, Set<string>>>()
  private readonly failed = new Set<string>()
  private pendingLinks: PendingLink[] = []

  constructor(private readonly options: RelationManagerOptions) {}

  getRelationNodes(componentId: string, relationKey: string): RelationInstance[] {
    const targets = this.links.get(componentId)?.get(relationKey)
    if (!targets || targets.size === 0) return []
    return [...targets]
      .map((targetId) => this.options.getInstance(targetId))
      .filter((target): target is RelationInstance => Boolean(target))
      .sort((a, b) => {
        const left = this.options.tree.get(a.componentId)?.order ?? 0
        const right = this.options.tree.get(b.componentId)?.order ?? 0
        return left - right
      })
  }

  handleAttach(componentId: string, invokeCallbacks = true): void {
    const node = this.options.tree.get(componentId)
    if (!node) return
    const targets = new Set<string>([componentId])
    for (const ancestor of this.options.tree.ancestors(componentId)) targets.add(ancestor.componentId)
    for (const descendant of this.options.tree.descendants(componentId)) targets.add(descendant.componentId)
    for (const id of targets) this.refreshComponent(id, 'attach', undefined, invokeCallbacks)
  }

  flushLinked(): void {
    const pending = this.pendingLinks
    this.pendingLinks = []
    for (const link of pending) {
      this.callHandler(link.sourceId, this.findRelation(link.sourceId, link.sourceKey)?.linked, link.targetId)
      this.callHandler(link.targetId, this.findReciprocalByKey(link.targetId, link.targetKey)?.linked, link.sourceId)
    }
  }

  handleMove(componentId: string): void {
    const node = this.options.tree.get(componentId)
    if (!node) return
    const targets = new Set<string>([componentId])
    for (const ancestor of this.options.tree.ancestors(componentId)) targets.add(ancestor.componentId)
    for (const descendant of this.options.tree.descendants(componentId)) targets.add(descendant.componentId)
    const linkChanged = new Set<string>()
    for (const id of targets) this.refreshComponent(id, 'move', linkChanged)
  }

  handleDetach(componentId: string): void {
    const node = this.options.tree.get(componentId)
    if (!node) return
    const sourceLinks = this.links.get(componentId)
    if (sourceLinks) {
      for (const [relationKey, targetIds] of [...sourceLinks.entries()]) {
        for (const targetId of [...targetIds]) {
          this.removeLink(componentId, relationKey, targetId)
        }
      }
      this.links.delete(componentId)
    }
    // Links are symmetric, but be defensive in case a one-sided link exists.
    for (const [sourceId, relationMap] of [...this.links.entries()]) {
      for (const [relationKey, targetIds] of [...relationMap.entries()]) {
        if (targetIds.delete(componentId)) {
          if (targetIds.size === 0) relationMap.delete(relationKey)
        }
      }
      if (relationMap.size === 0) this.links.delete(sourceId)
    }
    this.pendingLinks = this.pendingLinks.filter(
      (link) => link.sourceId !== componentId && link.targetId !== componentId,
    )
    for (const key of [...this.failed]) {
      if (key.startsWith(`${componentId}:`)) this.failed.delete(key)
    }
  }

  removePage(pageId: string): void {
    const root = this.options.tree.pageRoot(pageId)
    if (!root) return
    for (const node of [root, ...this.options.tree.descendants(root.componentId)]) {
      this.handleDetach(node.componentId)
    }
  }

  private refreshComponent(
    componentId: string,
    mode: 'attach' | 'move',
    linkChanged?: Set<string>,
    invokeCallbacks = true,
  ): void {
    const node = this.options.tree.get(componentId)
    if (!node) return
    const relations = this.options.getRelations(componentId)
    for (const relation of relations) {
      const candidates = this.findCandidates(node, relation)
      const desired = new Map<string, LinkTarget>()
      for (const candidate of candidates) {
        const reciprocal = this.findReciprocal(candidate, node.path, relation.type)
        if (!reciprocal) continue
        desired.set(candidate.componentId, {
          targetId: candidate.componentId,
          targetKey: reciprocal.key,
        })
      }
      const current = this.links.get(componentId)?.get(relation.key)
      if (current) {
        for (const targetId of [...current]) {
          if (desired.has(targetId)) continue
          this.removeLink(componentId, relation.key, targetId)
        }
      }
      for (const [targetId, target] of desired) {
        const exists = this.links.get(componentId)?.get(relation.key)?.has(targetId) ?? false
        if (!exists) {
          this.addLink(componentId, relation, targetId, target.targetKey, invokeCallbacks)
        } else if (mode === 'move' && linkChanged) {
          const key = `${componentId}:${relation.key}:${targetId}`
          if (!linkChanged.has(key)) {
            linkChanged.add(key)
            this.callHandler(componentId, relation.linkChanged, targetId)
            this.callHandler(targetId, this.findReciprocalByKey(targetId, target.targetKey)?.linkChanged, componentId)
          }
        }
      }
      if (mode === 'attach' && desired.size === 0) {
        if (relation.type === 'parent' || relation.type === 'ancestor') {
          const failureKey = `${componentId}:${relation.key}`
          if (!this.failed.has(failureKey)) {
            this.failed.add(failureKey)
            this.callHandler(componentId, relation.linkFailed, undefined)
          }
        }
      }
    }
  }

  private findCandidates(node: ComponentTreeNode, relation: NormalizedRelation): ComponentTreeNode[] {
    const tree = this.options.tree
    switch (relation.type) {
      case 'parent': {
        let current = node.parentId ? tree.get(node.parentId) : undefined
        while (current) {
          if (current.tag !== 'page' && current.path === relation.targetPath) return [current]
          current = current.parentId ? tree.get(current.parentId) : undefined
        }
        return []
      }
      case 'ancestor':
        return tree.ancestors(node.componentId).filter((item) => item.path === relation.targetPath)
      case 'child':
        return [...node.children]
          .map((id) => tree.get(id))
          .filter((item): item is ComponentTreeNode => item !== undefined && item.path === relation.targetPath)
      case 'descendant':
        return tree.descendants(node.componentId).filter((item) => item.path === relation.targetPath)
      default:
        return []
    }
  }

  private findReciprocal(
    target: ComponentTreeNode,
    sourcePath: string,
    type: RelationType,
  ): NormalizedRelation | undefined {
    const reciprocalType = reciprocal(type)
    return this.options.getRelations(target.componentId).find(
      (relation) => relation.targetPath === sourcePath && relation.type === reciprocalType,
    )
  }

  private findReciprocalByKey(targetId: string, key: string): NormalizedRelation | undefined {
    return this.options.getRelations(targetId).find((relation) => relation.key === key)
  }

  private addLink(
    sourceId: string,
    sourceRelation: NormalizedRelation,
    targetId: string,
    targetKey: string,
    invokeCallbacks = true,
  ): void {
    if (!this.links.has(sourceId)) this.links.set(sourceId, new Map())
    if (!this.links.has(targetId)) this.links.set(targetId, new Map())
    const sourceMap = this.links.get(sourceId)!
    const targetMap = this.links.get(targetId)!
    let sourceSet = sourceMap.get(sourceRelation.key)
    if (!sourceSet) {
      sourceSet = new Set()
      sourceMap.set(sourceRelation.key, sourceSet)
    }
    let targetSet = targetMap.get(targetKey)
    if (!targetSet) {
      targetSet = new Set()
      targetMap.set(targetKey, targetSet)
    }
    if (sourceSet.has(targetId) && targetSet.has(sourceId)) return
    sourceSet.add(targetId)
    targetSet.add(sourceId)
    if (!invokeCallbacks) {
      this.pendingLinks.push({ sourceId, sourceKey: sourceRelation.key, targetId, targetKey })
      return
    }
    this.callHandler(sourceId, sourceRelation.linked, targetId)
    const targetRelation = this.findReciprocalByKey(targetId, targetKey)
    this.callHandler(targetId, targetRelation?.linked, sourceId)
  }

  private removeLink(sourceId: string, sourceKey: string, targetId: string): void {
    const sourceMap = this.links.get(sourceId)
    const targetMap = this.links.get(targetId)
    const targetRelation = this.findReciprocalForLink(sourceId, sourceKey, targetId)
    const targetKey = targetRelation?.key
    sourceMap?.get(sourceKey)?.delete(targetId)
    if (sourceMap?.get(sourceKey)?.size === 0) sourceMap.delete(sourceKey)
    if (targetKey && targetMap) {
      targetMap.get(targetKey)?.delete(sourceId)
      if (targetMap.get(targetKey)?.size === 0) targetMap.delete(targetKey)
    }
    this.pendingLinks = this.pendingLinks.filter(
      (link) => !(link.sourceId === sourceId && link.sourceKey === sourceKey && link.targetId === targetId),
    )
    this.callHandler(sourceId, this.findRelation(sourceId, sourceKey)?.unlinked, targetId)
    if (targetKey) this.callHandler(targetId, targetRelation?.unlinked, sourceId)
  }

  private findReciprocalForLink(
    sourceId: string,
    sourceKey: string,
    targetId: string,
  ): NormalizedRelation | undefined {
    const sourceNode = this.options.tree.get(sourceId)
    const targetNode = this.options.tree.get(targetId)
    if (!sourceNode || !targetNode) return undefined
    const sourceRelation = this.findRelation(sourceId, sourceKey)
    if (!sourceRelation) return undefined
    return this.findReciprocal(targetNode, sourceNode.path, sourceRelation.type)
  }

  private findRelation(componentId: string, key: string): NormalizedRelation | undefined {
    return this.options.getRelations(componentId).find((relation) => relation.key === key)
  }

  private callHandler(
    componentId: string,
    handler: string | ((target: unknown) => void) | undefined,
    targetId: string | undefined,
  ): void {
    if (!handler) return
    const instance = this.options.getInstance(componentId)
    if (!instance) return
    const target = targetId ? this.options.getInstance(targetId) : undefined
    try {
      if (typeof handler === 'string') {
        instance.invokeMethod(handler, [target])
      } else {
        handler.call(instance, target)
      }
    } catch (error) {
      this.options.onError('RELATION_CALLBACK_ERROR', error instanceof Error ? error.message : String(error), {
        componentId,
        targetId,
      })
    }
  }
}

function reciprocal(type: RelationType): RelationType {
  switch (type) {
    case 'parent':
      return 'child'
    case 'child':
      return 'parent'
    case 'ancestor':
      return 'descendant'
    case 'descendant':
      return 'ancestor'
  }
}

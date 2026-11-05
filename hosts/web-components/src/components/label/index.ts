import type * as glassEasel from 'glass-easel'
import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type LabelTarget = {
  hasBehavior?: (behavior: unknown) => boolean
  handleLabelTap?: (event: unknown) => void
  _relatedLabel?: unknown
  _setRelatedLabelAria?: () => void
  triggerEvent?: (
    name: string,
    detail?: unknown,
    options?: {
      bubbles?: boolean
      composed?: boolean
      originalEvent?: unknown
      extraFields?: Record<string, unknown>
    },
  ) => void
  childNodes?: unknown[]
  slotNodes?: unknown[]
}

function asLabelTarget(node: unknown): LabelTarget | null {
  if (!node) return null
  return (node as { asGeneralComponent?: () => LabelTarget | null })
    .asGeneralComponent?.() ?? null
}

/**
 * A label target may be a custom component whose `is` is an artifact path, and
 * glass-easel resolves behavior strings by URL, so match by object identity.
 */
function isLabelTarget(node: unknown, marker: glassEasel.GeneralBehavior): boolean {
  return asLabelTarget(node)?.hasBehavior?.(marker) === true
}

function childNodesOf(node: unknown): unknown[] {
  const value = node as { childNodes?: unknown[]; slotNodes?: unknown[] }
  return [...(value.childNodes ?? []), ...(value.slotNodes ?? [])]
}

/**
 * Mirrors WeChat's `wx-label`: a slot-only host with no styles of its own.
 * `for` (or the first descendant label target) links the activation target,
 * and a tap dispatches a composed `labelTap` event to that target.
 */
export function defineLabel(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('label'),
    template: ctx.template('label'),
    behaviors: [ctx.behaviors.base],
    properties: {
      for: { type: String, value: '' },
    },
    options: ctx.hostOptions('label'),
    lifetimes: {
      created() {
        bindHostListeners(this, {
          tap: (event) => this.onTap(event),
        })
      },
      attached() {
        ;(this as unknown as { _findRelatedNode: () => void })._findRelatedNode()
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    methods: {
      _findRelatedNode() {
        const forId = String(this.data.for ?? '')
        let target: LabelTarget | null = null
        if (forId) {
          const owner = (this as unknown as {
            ownerShadowRoot?: { getElementById?: (id: string) => unknown } | null
          }).ownerShadowRoot
          target = asLabelTarget(owner?.getElementById?.(forId))
        } else {
          target = (this as unknown as { dfs2: (node: unknown) => LabelTarget | null })
            .dfs2(this)
        }
        if (target?.hasBehavior?.(ctx.behaviors.labelTarget)) {
          target._relatedLabel = this
          target._setRelatedLabelAria?.()
        }
      },
      _handleNode(node: unknown, event: unknown): boolean {
        const target = asLabelTarget(node)
        if (target?.hasBehavior?.(ctx.behaviors.labelTarget)) {
          const source = event as {
            detail?: unknown
            touches?: unknown
            changedTouches?: unknown
            __originalEvent?: unknown
          }
          target.triggerEvent?.('labelTap', source.detail, {
            bubbles: false,
            composed: true,
            originalEvent: source.__originalEvent ?? event,
            extraFields: {
              touches: source.touches,
              changedTouches: source.changedTouches,
              __labelEvents: true,
            },
          })
          return true
        }
        return false
      },
      dfs2(node: unknown): LabelTarget | null {
        if (isLabelTarget(node, ctx.behaviors.labelTarget)) return asLabelTarget(node)
        for (const child of childNodesOf(node)) {
          const found = (this as unknown as {
            dfs2: (child: unknown) => LabelTarget | null
          }).dfs2(child)
          if (found) return found
        }
        return null
      },
      dfs(node: unknown, event: unknown): boolean {
        if ((this as unknown as {
          _handleNode: (node: unknown, event: unknown) => boolean
        })._handleNode(node, event)) return true
        for (const child of childNodesOf(node)) {
          if ((this as unknown as {
            dfs: (child: unknown, event: unknown) => boolean
          }).dfs(child, event)) return true
        }
        return false
      },
      onTap(event: glassEasel.ShadowedEvent<unknown>) {
        for (
          let node = event.target as { parentNode?: unknown } | null;
          node && node !== (this as unknown as object);
          node = node.parentNode as { parentNode?: unknown } | null
        ) {
          if (isLabelTarget(node, ctx.behaviors.labelTarget)) return
        }
        const forId = String(this.data.for ?? '')
        if (forId) {
          const owner = (this as unknown as {
            ownerShadowRoot?: { getElementById?: (id: string) => unknown } | null
          }).ownerShadowRoot
          const element = owner?.getElementById?.(forId)
          if (element) {
            ;(this as unknown as { _handleNode: (node: unknown, event: unknown) => boolean })
              ._handleNode(element, event)
          }
          return
        }
        ;(this as unknown as {
          dfs: (node: unknown, event: unknown) => boolean
        }).dfs(this, event)
      },
    },
  }).general()
}

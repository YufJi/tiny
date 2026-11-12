import { describe, expect, test } from 'vitest'
import {
  normalizeComponentDefinition,
  registerBehavior,
  registerTraitBehavior,
} from '../src/component'

const PARENT = 'components/trait-parent/trait-parent'
const CHILD = 'components/trait-child/trait-child'

describe('trait behaviors', () => {
  test('normalizes implementations and trait relation targets', () => {
    const ParentFeature = registerTraitBehavior<{ name: string }, {
      name: string
      upperName: () => string
    }>((impl) => ({
      name: impl.name,
      upperName: () => impl.name.toUpperCase(),
    }))
    const ChildFeature = registerTraitBehavior<{ name: string }>()
    const parentBehavior = registerBehavior({
      relations: {
        child: {
          type: 'descendant',
          target: ChildFeature,
        },
      },
    }) as ReturnType<typeof registerBehavior> & {
      implement: (trait: unknown, impl: Record<string, unknown>) => unknown
    }
    parentBehavior.implement(ParentFeature, { name: 'parent' })
    const childBehavior = registerBehavior({
      relations: {
        parent: {
          type: 'ancestor',
          target: ParentFeature,
        },
      },
    }) as ReturnType<typeof registerBehavior> & {
      implement: (trait: unknown, impl: Record<string, unknown>) => unknown
    }
    childBehavior.implement(ChildFeature, { name: 'child' })

    const parent = normalizeComponentDefinition(
      { behaviors: [parentBehavior] },
      PARENT,
    )
    const child = normalizeComponentDefinition(
      { behaviors: [childBehavior] },
      CHILD,
    )

    expect(parent.traits.map(({ trait }) => trait)).toEqual([ParentFeature])
    expect(child.traits.map(({ trait }) => trait)).toEqual([ChildFeature])
    expect(parent.relations[0]).toMatchObject({
      key: 'child',
      type: 'descendant',
      trait: ChildFeature,
    })
    expect(child.relations[0]).toMatchObject({
      key: 'parent',
      type: 'ancestor',
      trait: ParentFeature,
    })
    const transformed = child.traits[0]?.trait.transform?.({ name: 'x' })
    expect(transformed).toBeUndefined()
    expect(parent.traits[0]?.impl).toEqual({ name: 'parent' })
  })
})

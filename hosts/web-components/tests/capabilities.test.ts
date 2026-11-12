import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { createBuiltinComponents } from '../src'
import {
  BUILTIN_COMPONENT_ATTRIBUTES,
  BUILTIN_COMPONENT_COMMON_ATTRIBUTES,
} from '../../../packages/manifest/src/builtin-capabilities'

/**
 * The `wx.canIUse` component inventory in `@tiny/manifest` mirrors the real
 * built-in component definitions. Run this suite with
 * `UPDATE_BUILTIN_CAPABILITIES=1 pnpm --filter @tiny/host-web-components test`
 * after changing a definition, then rebuild `@tiny/manifest`.
 */
const inventoryPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../packages/manifest/src/builtin-capabilities.ts',
)

/** Properties glass-easel or the components expose internally. */
const INTERNAL_PROPERTIES = new Set(['eventModel', 'curPercent'])

function attributeName(property: string): string {
  return property.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

type Inventory = {
  tags: string[]
  common: string[]
  attributes: Record<string, string[]>
}

function collect(): Inventory {
  const space = new glassEasel.ComponentSpace()
  space.updateComponentOptions({
    hostNodeTagName: TINY_ENGINE_NAMING.hostNodeTagName,
    reflectToAttributes: true,
  })
  const definitions = createBuiltinComponents(space)
  const tags = Object.keys(definitions).sort()
  const attributes: Record<string, string[]> = {}
  for (const tag of tags) {
    const definition = definitions[tag as keyof typeof definitions] as unknown as {
      behavior: { prepare(): void; listProperties(): string[] }
    }
    definition.behavior.prepare()
    attributes[tag] = [...new Set(
      definition.behavior.listProperties()
        .filter((property) => !property.startsWith('_') && !INTERNAL_PROPERTIES.has(property))
        .map(attributeName),
    )].sort()
  }
  const common = tags.length > 0
    ? attributes[tags[0]!]!.filter((attribute) => tags.every((tag) => attributes[tag]!.includes(attribute)))
    : []
  return { tags, common: [...common].sort(), attributes }
}

function renderInventory(inventory: Inventory): string {
  const lines: string[] = [
    '/**',
    ' * Built-in component attribute inventory for `wx.canIUse` (generated data).',
    ' *',
    " * WeChat answers `canIUse('text.selectable')` / `canIUse('button.open-type')`",
    ' * from its own component table. Tiny derives the same answers from the real',
    ' * built-in component definitions: `@tiny/host-web-components` owns the glass',
    ' * definitions, and this file mirrors their WXML attribute names. A probe',
    ' * means "the built-in component defines this attribute", exactly like',
    ' * WeChat answering from its component table; per-attribute visual parity is',
    ' * tracked in docs/archive/component-reference-diff-2.33.0.md instead.',
    ' *',
    ' * Regenerate with `UPDATE_BUILTIN_CAPABILITIES=1 pnpm --filter @tiny/host-web-components test`',
    ' * (the guard test in that package compares this file with the definitions and',
    ' * fails when they drift). Attribute names are kebab-case; option lists are not',
    ' * tracked yet, so `component.attribute.option` answers `false`.',
    ' */',
    '',
    '/** Attributes every built-in component accepts (shared behaviors). */',
    'export const BUILTIN_COMPONENT_COMMON_ATTRIBUTES: readonly string[] = [',
    ...inventory.common.map((name) => `  '${name}',`),
    ']',
    '',
    '/** Tag-specific attributes; the common list applies to every tag. */',
    'export const BUILTIN_COMPONENT_ATTRIBUTES: Readonly<Record<string, readonly string[]>> = {',
  ]
  for (const tag of inventory.tags) {
    const extra = inventory.attributes[tag]!.filter((name) => !inventory.common.includes(name))
    if (extra.length === 0) {
      lines.push(`  '${tag}': [],`)
      continue
    }
    lines.push(`  '${tag}': [`, ...extra.map((name) => `    '${name}',`), '  ],')
  }
  lines.push('}')
  return `${lines.join('\n')}\n`
}

const inventory = collect()
const expected = renderInventory(inventory)

if (process.env.UPDATE_BUILTIN_CAPABILITIES === '1') {
  fs.writeFileSync(inventoryPath, expected)
}

describe('built-in component capability inventory', () => {
  test('covers every registered built-in tag', () => {
    expect(inventory.tags.length).toBeGreaterThan(0)
    expect(Object.keys(BUILTIN_COMPONENT_ATTRIBUTES).sort()).toEqual(inventory.tags)
  })

  test('matches the generated inventory in @tiny/manifest', () => {
    if (process.env.UPDATE_BUILTIN_CAPABILITIES === '1') return
    const current = fs.readFileSync(inventoryPath, 'utf8')
    if (current !== expected) {
      const detail = [
        'The generated inventory is stale.',
        'Run: UPDATE_BUILTIN_CAPABILITIES=1 pnpm --filter @tiny/host-web-components test',
        'Then rebuild @tiny/manifest.',
      ].join('\n')
      expect(current, detail).toBe(expected)
    }
    expect(new Set(BUILTIN_COMPONENT_COMMON_ATTRIBUTES)).toEqual(new Set(inventory.common))
  })
})

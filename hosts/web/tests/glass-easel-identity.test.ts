import { describe, expect, test } from 'vitest'
import * as direct from 'glass-easel'
import * as viaRuntime from '@tiny/runtime/glass-easel'

describe('glass-easel identity', () => {
  test('host code and runtime share the same module instance', () => {
    expect(viaRuntime.ComponentSpace).toBe(direct.ComponentSpace)
    expect(viaRuntime.Element).toBe(direct.Element)
  })
})

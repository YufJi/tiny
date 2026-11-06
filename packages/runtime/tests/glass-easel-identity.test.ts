import { describe, expect, test } from 'vitest'
import * as direct from 'glass-easel'
import * as viaRuntime from '../src/glass-easel'

describe('glass-easel entry', () => {
  test('re-exports the same module instance as a direct import', () => {
    expect(viaRuntime.ComponentSpace).toBe(direct.ComponentSpace)
    expect(viaRuntime.Element).toBe(direct.Element)
  })
})

import { describe, expect, test } from 'vitest'
import { createKeyboardHandlers } from '../src/keyboard-events'

type Listener = (event: unknown) => void

function createFrame() {
  const listeners = new Map<string, Listener[]>()
  const document = {
    addEventListener(type: string, listener: Listener) {
      const list = listeners.get(type) ?? []
      list.push(listener)
      listeners.set(type, list)
    },
  }
  return {
    frame: { contentDocument: document },
    dispatch(type: string, event: unknown) {
      for (const listener of listeners.get(type) ?? []) listener(event)
    },
  }
}

describe('keyboard events', () => {
  test('forwards keydown and keyup from render frames', () => {
    const { frame, dispatch } = createFrame()
    const emitted: Array<{ name: string; payload?: unknown }> = []
    const handlers = createKeyboardHandlers({
      emit: (name, payload) => emitted.push({ name, payload }),
      frames: () => [frame],
      intervalMs: 0,
    })
    handlers['keyboard.refresh']({})
    dispatch('keydown', { key: 'a', code: 'KeyA', keyCode: 65 })
    dispatch('keyup', { key: 'a', code: 'KeyA', keyCode: 65 })
    expect(emitted).toEqual([
      { name: 'keyDown', payload: { key: 'a', code: 'KeyA', keyCode: 65 } },
      { name: 'keyUp', payload: { key: 'a', code: 'KeyA', keyCode: 65 } },
    ])
  })

  test('attaches each document once', () => {
    const { frame, dispatch } = createFrame()
    let attached = 0
    const document = frame.contentDocument
    const original = document.addEventListener
    document.addEventListener = (type: string, listener: Listener) => {
      attached += 1
      original(type, listener)
    }
    const handlers = createKeyboardHandlers({ emit: () => undefined, frames: () => [frame], intervalMs: 0 })
    handlers['keyboard.refresh']({})
    handlers['keyboard.refresh']({})
    expect(attached).toBe(2)
    expect(typeof dispatch).toBe('function')
  })

  test('a cross-origin frame is skipped', () => {
    const handlers = createKeyboardHandlers({
      emit: () => undefined,
      frames: () => [{
        get contentDocument(): never {
          throw new Error('cross-origin')
        },
      }],
      intervalMs: 0,
    })
    expect(() => handlers['keyboard.refresh']({})).not.toThrow()
  })
})

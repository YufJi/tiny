import { describe, expect, test } from 'vitest'
import { COMPONENT_COMMANDS, invokeComponentCommand } from '../src/render/component-commands'

const MAP_TAG = 'tiny-map'

function createElement(tagName: string, reply?: (detail: Record<string, any>) => void) {
  return {
    tagName,
    lastEvent: undefined as unknown,
    dispatchEvent(event: unknown) {
      this.lastEvent = event
      reply?.((event as { detail: Record<string, any> }).detail)
      return true
    },
  }
}

describe('component commands', () => {
  test('whitelists the map methods', () => {
    expect(COMPONENT_COMMANDS[MAP_TAG]).toEqual(['getCenterLocation', 'moveToLocation', 'getScale'])
    expect(COMPONENT_COMMANDS['tiny-video']).toBeUndefined()
  })

  test('dispatches a whitelisted command and returns its reply', () => {
    const element = createElement(MAP_TAG, (detail) => detail.reply({ scale: 16 }))
    expect(invokeComponentCommand(element, { method: 'getScale' })).toEqual({
      status: 'ok',
      value: { scale: 16 },
    })
    expect((element.lastEvent as { type: string }).type).toBe('tiny:command')
  })

  test('rejects methods outside the whitelist and unknown components', () => {
    expect(invokeComponentCommand(createElement(MAP_TAG), { method: 'takePhoto' })).toEqual({
      status: 'unsupported-method',
      method: 'takePhoto',
    })
    expect(invokeComponentCommand(null, { method: 'getScale' })).toEqual({ status: 'not-found' })
  })

  test('a component failure becomes an error status', () => {
    const element = createElement(MAP_TAG, (detail) => detail.fail('latitude and longitude are required'))
    expect(invokeComponentCommand(element, { method: 'moveToLocation' })).toEqual({
      status: 'error',
      message: 'latitude and longitude are required',
    })
  })

  test('an element that never replies is reported as unsupported', () => {
    expect(invokeComponentCommand(createElement(MAP_TAG), { method: 'getScale' })).toEqual({
      status: 'unsupported-method',
      method: 'getScale',
    })
  })
})

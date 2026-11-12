import { describe, expect, test } from 'vitest'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { MiniProgramPageInstance } from '../src/service/page/instance'

describe('pageLifetimes', () => {
  test('normalizes resize alongside show and hide', () => {
    const definition = normalizeComponentDefinition({
      pageLifetimes: {
        show() {},
        hide() {},
        resize() {},
      },
    }, 'components/resizable')
    expect(definition.pageLifetimeHandlers.show).toHaveLength(1)
    expect(definition.pageLifetimeHandlers.hide).toHaveLength(1)
    expect(definition.pageLifetimeHandlers.resize).toHaveLength(1)
  })

  test('delivers the resize event to the page root and component handlers', () => {
    const calls: unknown[] = []
    const definition = normalizeComponentDefinition({
      pageLifetimes: {
        resize(event: unknown) {
          calls.push(event)
        },
      },
    }, 'pages/index/index')
    const page = new MiniProgramPageInstance({
      pageId: 'page-1',
      path: 'pages/index/index',
      options: {},
      definition,
    })
    page.triggerPageLifetime('resize', { size: { windowWidth: 390, windowHeight: 844 } })
    page.triggerPageLifetime('show')
    expect(calls).toEqual([{ size: { windowWidth: 390, windowHeight: 844 } }])
  })
})

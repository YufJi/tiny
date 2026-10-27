import { describe, expect, test } from 'vitest'
import { LogicBackendContext } from '../src/logic/backend'

describe('logic backend style roles', () => {
  test('classifies sheets by role instead of output path', () => {
    const backend = new LogicBackendContext()
    backend.registerStyleSheetContent('styles/main.css', '.app { color: red }')
    backend.appendStyleSheetPath('styles/main.css', undefined, {
      role: 'app',
      ownerPath: 'app',
    })
    backend.registerStyleSheetContent('styles/page.css', '.page { color: blue }')
    backend.appendStyleSheetPath('styles/page.css', 1, {
      role: 'page',
      ownerPath: 'pages/index/index',
    })
    backend.registerStyleSheetContent('styles/main.css@page:1', '.page .app { color: blue }')
    backend.appendStyleSheetPath('styles/main.css@page:1', 1, {
      role: 'page-scope',
      ownerPath: 'pages/index/index',
    })

    expect(backend.hasAppPageScope()).toBe(true)
    // The app sheet is global; only its page-scoped copy is sent to the view.
    expect(backend.getAppendedStyleTexts()).toEqual([
      '.page { color: blue }',
      '.page .app { color: blue }',
    ])
  })

  test('keeps built-in styles host-owned', () => {
    const backend = new LogicBackendContext()
    backend.registerStyleSheetContent('tiny-builtin:view', 'tiny-view { display: block }')
    backend.appendStyleSheetPath('tiny-builtin:view', undefined, { role: 'builtin' })
    backend.registerStyleSheetContent('styles/component.css', '.badge { color: red }')
    backend.appendStyleSheetPath('styles/component.css', 2, {
      role: 'component',
      ownerPath: 'components/badge/badge',
    })

    expect(backend.getAppendedStyleTexts()).toEqual(['.badge { color: red }'])
    const entries = backend.styleEntriesSince(0)
    expect(entries.map((entry) => entry.role)).toEqual(['builtin', 'component'])
    expect(entries[1]?.ownerPath).toBe('components/badge/badge')
  })
})

import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import type { Manifest, PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { bootRenderThread } from '../src/render'
import type { BuiltinComponentFactoryContext, BuiltinComponents } from '../src/types'

const PAGE_PATH = 'pages/index/index'

function compileTemplate(source: string): glassEasel.template.ComponentTemplate {
  const group = TmplGroup.newDev()
  group.addTmpl('', source)
  const generated = group.getTmplGenObjectGroups()
  const groupList = new Function(`return ${generated}`)() as Record<string, unknown>
  return {
    groupList,
    content: (name = '') => {
      const group = groupList[name]
      if (!group) throw new Error(`template not found: ${name}`)
      return group(name)
    },
  }
}

function createTemplateRegistry() {
  const group = TmplGroup.newDev()
  group.addTmpl(PAGE_PATH, '<probe id="probe" label="{{label}}" />')
  const generated = group.getTmplGenObjectGroups()
  const groupList = new Function(`return ${generated}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const pageGroup = groupList[path]
      if (!pageGroup) throw new Error(`template not found: ${path}`)
      return pageGroup(name)
    },
  }
}

function createManifest(): Manifest {
  const page: PageArtifact = {
    path: PAGE_PATH,
    template: {
      path: PAGE_PATH,
      outputPath: 'templates.js',
      sourcePath: `${PAGE_PATH}.wxml`,
    },
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: {},
    },
  }
  return {
    schemaVersion: 1,
    naming: { prefix: 'tiny-' },
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [page],
    components: [],
    styles: [],
    assets: [],
  }
}

class RecordingBackend extends glassEasel.EmptyBackendContext {
  readonly styleSheets = new Map<string, unknown>()
  readonly styleSheetPaths: Array<{ path: string; scope?: number }> = []

  registerStyleSheetContent(path: string, content: unknown): void {
    this.styleSheets.set(path, content)
  }

  appendStyleSheetPath(path: string, styleScope?: number): number {
    this.styleSheetPaths.push({ path, scope: styleScope })
    return super.appendStyleSheetPath(path, styleScope)
  }
}

describe('host-provided built-in components', () => {
  test('receive the manifest naming prefix and own scoped built-in styles', async () => {
    const manifest = createManifest()
    const [, renderTransport] = createInMemoryTransportPair()
    const backend = new RecordingBackend()
    const contexts: BuiltinComponentFactoryContext[] = []
    let probeScope: number | undefined
    const builtinComponents: BuiltinComponents = {
      create(space, context) {
        contexts.push(context)
        const scope = context.registerStyleScope('tiny-builtin-probe')
        probeScope = scope
        return {
          probe: space.defineComponent({
            is: 'test:probe',
            options: { styleScope: scope },
            properties: {
              label: { type: String, value: '' },
            },
            template: compileTemplate('<text>{{label}}!</text>'),
          }).general(),
        }
      },
      styles: [
        {
          path: 'host-base.css',
          content: 'tiny-probe { display: block; }',
        },
        {
          path: 'probe-internal.css',
          content: '.tiny-builtin-probe--inner { color: red; }',
          scope: 'tiny-builtin-probe',
        },
      ],
    }
    const render = bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      backend,
      builtinComponents,
      initialPath: PAGE_PATH,
    })

    expect(contexts).toHaveLength(1)
    expect(contexts[0]?.prefix).toBe('tiny-')
    expect(typeof contexts[0]?.onDiagnostic).toBe('function')

    render.adapter.registerStyles(manifest)
    expect(backend.styleSheets.get('host-base.css')).toBe('tiny-probe { display: block; }')
    expect(backend.styleSheetPaths.map((item) => item.path)).toContain('host-base.css')
    expect(backend.styleSheets.get('probe-internal.css')).toBe('.tiny-builtin-probe--inner { color: red; }')
    expect(backend.styleSheetPaths.find((item) => item.path === 'probe-internal.css')?.scope)
      .toBe(probeScope)

    render.adapter.registerPageArtifact(manifest.pages[0]!)
    const instance = render.adapter.mountPage(PAGE_PATH, { label: 'injected' })
    await render.adapter.whenRendered()
    expect(glassEasel.dumpElementToString(instance, true)).toContain('injected!')
  })

  test('stay optional for hosts without a component library', () => {
    const manifest = createManifest()
    const [, renderTransport] = createInMemoryTransportPair()
    const backend = new RecordingBackend()
    const render = bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      backend,
      initialPath: PAGE_PATH,
    })

    render.adapter.registerStyles(manifest)
    expect(backend.styleSheets.size).toBe(0)
    expect(backend.styleSheetPaths).toHaveLength(0)
  })
})

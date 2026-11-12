import type { Manifest } from '@tiny/manifest'
import type { RuntimeTabBarState } from '../../shared/diagnostics'
import type { TabBarApi } from '../api/types'
import { normalizeRoutePath } from '../page/route'

export type TabBarItemModel = {
  pagePath: string
  text: string
  iconPath?: string
  selectedIconPath?: string
  badge?: string
  redDot: boolean
}

export type TabBarModel = {
  custom: boolean
  position: 'bottom' | 'top'
  color: string
  selectedColor: string
  backgroundColor: string
  borderStyle: 'black' | 'white'
  items: TabBarItemModel[]
}

/**
 * Normalize `app.json.tabBar` into the service model.
 *
 * The host renders the tab bar; the service only owns the item list, style
 * state, badge/red-dot mutations and the selected index projected through
 * `RUNTIME_STATE`.
 */
export function normalizeTabBar(manifest: Manifest): TabBarModel | null {
  const raw = manifest.app?.configuration?.effective?.tabBar
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  const list = Array.isArray(value.list) ? value.list : []
  const items: TabBarItemModel[] = []
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const item = entry as Record<string, unknown>
    const pagePath = normalizeRoutePath(String(item.pagePath ?? '').replace(/^\//, ''))
    if (!pagePath) continue
    items.push({
      pagePath,
      text: typeof item.text === 'string' ? item.text : '',
      ...(typeof item.iconPath === 'string' && item.iconPath
        ? { iconPath: item.iconPath }
        : {}),
      ...(typeof item.selectedIconPath === 'string' && item.selectedIconPath
        ? { selectedIconPath: item.selectedIconPath }
        : {}),
      redDot: false,
    })
  }
  if (items.length === 0) return null
  return {
    custom: value.custom === true,
    position: value.position === 'top' ? 'top' : 'bottom',
    color: typeof value.color === 'string' ? value.color : '#7A7E83',
    selectedColor: typeof value.selectedColor === 'string' ? value.selectedColor : '#3CC51F',
    backgroundColor: typeof value.backgroundColor === 'string'
      ? value.backgroundColor
      : '#FFFFFF',
    borderStyle: value.borderStyle === 'white' ? 'white' : 'black',
    items,
  }
}

/**
 * Service-side tabBar state and mutation API.
 *
 * This class is the single owner of badge/style/visibility mutations; it emits
 * one change notification per mutation so the page stack can re-project
 * `RUNTIME_STATE` without knowing tabBar internals.
 */
export class ServiceTabBar {
  readonly model: TabBarModel | null
  readonly pagePaths: Set<string>
  readonly api: TabBarApi
  private visiblePreference = true

  constructor(manifest: Manifest, private readonly onChange: () => void) {
    this.model = normalizeTabBar(manifest)
    this.pagePaths = new Set((this.model?.items ?? []).map((item) => item.pagePath))
    this.api = {
      setStyle: (params) => {
        const model = this.requireModel()
        if (typeof params.color === 'string') model.color = params.color
        if (typeof params.selectedColor === 'string') model.selectedColor = params.selectedColor
        if (typeof params.backgroundColor === 'string') {
          model.backgroundColor = params.backgroundColor
        }
        if (params.borderStyle === 'white' || params.borderStyle === 'black') {
          model.borderStyle = params.borderStyle
        }
        this.notify()
      },
      setItem: (params) => {
        const item = this.requireModel().items[this.readIndex(params)]
        if (typeof params.text === 'string') item.text = params.text
        if (typeof params.iconPath === 'string') {
          if (params.iconPath) item.iconPath = params.iconPath
          else delete item.iconPath
        }
        if (typeof params.selectedIconPath === 'string') {
          if (params.selectedIconPath) item.selectedIconPath = params.selectedIconPath
          else delete item.selectedIconPath
        }
        this.notify()
      },
      setBadge: (params) => {
        const item = this.requireModel().items[this.readIndex(params)]
        const text = String(params.text ?? '').slice(0, 4)
        if (text) item.badge = text
        else delete item.badge
        this.notify()
      },
      removeBadge: (params) => {
        delete this.requireModel().items[this.readIndex(params)].badge
        this.notify()
      },
      showRedDot: (params) => {
        this.requireModel().items[this.readIndex(params)].redDot = true
        this.notify()
      },
      hideRedDot: (params) => {
        this.requireModel().items[this.readIndex(params)].redDot = false
        this.notify()
      },
      setVisible: (visible) => {
        this.requireModel()
        this.visiblePreference = visible
        this.notify()
      },
    }
  }

  /** Throw when the app did not declare a tabBar (same error as the runtime). */
  requireModel(): TabBarModel {
    if (!this.model) throw new Error('tabBar is not configured')
    return this.model
  }

  readIndex(params: Record<string, unknown>): number {
    const model = this.requireModel()
    const index = Number(params.index)
    if (!Number.isInteger(index) || index < 0 || index >= model.items.length) {
      throw new Error(`invalid tabBar index: ${String(params.index)}`)
    }
    return index
  }

  /** Project the current tabBar state for `RUNTIME_STATE`. */
  state(activePagePath: string | undefined): RuntimeTabBarState | null {
    if (!this.model) return null
    const selectedIndex = activePagePath
      ? this.model.items.findIndex((item) => item.pagePath === activePagePath)
      : -1
    return {
      visible: this.visiblePreference && !this.model.custom && selectedIndex >= 0,
      custom: this.model.custom,
      position: this.model.position,
      color: this.model.color,
      selectedColor: this.model.selectedColor,
      backgroundColor: this.model.backgroundColor,
      borderStyle: this.model.borderStyle,
      selectedIndex,
      items: this.model.items.map((item, index) => ({ ...item, index })),
    }
  }

  private notify(): void {
    this.onChange()
  }
}

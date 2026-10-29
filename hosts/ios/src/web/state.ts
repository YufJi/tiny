import type { RuntimeManifest, RuntimeTabBarState } from '@tiny/runtime'

export type AppMeta = {
  id: string
  label: string
  title: string
  pages: number
  firstPage: string
  manifest: RuntimeManifest
}

export type RuntimeStateDetails = {
  pageStack?: string[]
  currentPage?: string
  pages?: Array<{ pageId: string; path: string; visible: boolean; cached?: boolean }>
  appVisible?: boolean
  tabBar?: RuntimeTabBarState
  maxPageStack?: number
  transport?: 'connected' | 'closed'
}

export type NavState = {
  custom: boolean
  backgroundColor: string
  textStyle: 'black' | 'white'
}

export type TabBarItemState = {
  index: number
  pagePath: string
  text: string
  iconPath?: string
  selectedIconPath?: string
  badge?: string
  redDot: boolean
}

export type HostTabBarState = {
  position: 'top' | 'bottom'
  color: string
  selectedColor: string
  backgroundColor: string
  borderStyle: 'black' | 'white'
  selectedIndex: number
  items: TabBarItemState[]
}

export type HostUIState = {
  appId: string
  pageId: string | null
  path: string
  title: string
  canBack: boolean
  nav: NavState
  tabBar: HostTabBarState | null
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

/**
 * Project the runtime state into the small state surface the native chrome
 * needs. The native side never reads the manifest or the protocol itself; it
 * only renders title/nav/tabBar and sends intents back.
 */
export function buildUIState(meta: AppMeta, details: RuntimeStateDetails): HostUIState {
  const pageStack = details.pageStack ?? []
  const currentPath = details.currentPage ?? ''
  const pageArtifact = meta.manifest.pages.find((page) => page.path === currentPath)
  const appWindow = (meta.manifest.app?.configuration?.effective?.window ?? {}) as Record<string, unknown>
  const pageConfig = (pageArtifact?.configuration?.effective ?? {}) as Record<string, unknown>
  const merged = { ...appWindow, ...pageConfig }
  const title = stringValue(merged.navigationBarTitleText, meta.title || meta.label)
  const nav: NavState = {
    custom: merged.navigationStyle === 'custom',
    backgroundColor: stringValue(merged.navigationBarBackgroundColor, '#ffffff'),
    textStyle: merged.navigationBarTextStyle === 'white' ? 'white' : 'black',
  }

  const runtimeTabBar = details.tabBar
  let tabBar: HostTabBarState | null = null
  if (runtimeTabBar?.visible) {
    tabBar = {
      position: runtimeTabBar.position === 'top' ? 'top' : 'bottom',
      color: runtimeTabBar.color,
      selectedColor: runtimeTabBar.selectedColor,
      backgroundColor: runtimeTabBar.backgroundColor,
      borderStyle: runtimeTabBar.borderStyle === 'white' ? 'white' : 'black',
      selectedIndex: runtimeTabBar.selectedIndex,
      items: runtimeTabBar.items.map((item) => ({
        index: item.index,
        pagePath: item.pagePath,
        text: item.text,
        ...(item.iconPath ? { iconPath: item.iconPath } : {}),
        ...(item.selectedIconPath ? { selectedIconPath: item.selectedIconPath } : {}),
        ...(item.badge ? { badge: item.badge } : {}),
        redDot: Boolean(item.redDot),
      })),
    }
  }

  return {
    appId: meta.id,
    pageId: pageStack.at(-1) ?? null,
    path: currentPath,
    title,
    canBack: pageStack.length > 1,
    nav,
    tabBar,
  }
}

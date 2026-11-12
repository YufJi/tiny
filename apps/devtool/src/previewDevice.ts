export type PreviewRect = {
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
}

export type PreviewSafeArea = {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

export type PreviewContentOptions = {
  customNavigation?: boolean
  tabBarVisible?: boolean
  tabBarPosition?: 'bottom' | 'top'
}

export type PreviewContentInsets = {
  top: number
  bottom: number
}

export const PREVIEW_DEVICE = {
  screenWidth: 375,
  screenHeight: 812,
  statusBarHeight: 44,
  navigationBarHeight: 44,
  hostChromeHeight: 88,
  tabBarHeight: 50,
  homeIndicatorHeight: 34,
  pixelRatio: 2,
  model: 'iPhone X',
  system: 'iOS 16.0',
  brand: 'devtools',
  platform: 'devtools',
  SDKVersion: '3.0.0',
  language: 'zh_CN',
  version: '8.0.0',
  theme: 'light',
  host: 'WeChat',
  safeArea: {
    top: 44,
    bottom: 778,
    left: 0,
    right: 375,
    width: 375,
    height: 734,
  } satisfies PreviewSafeArea,
  safeAreaInset: {
    top: 44,
    right: 0,
    bottom: 34,
    left: 0,
  },
  menuButton: {
    width: 87,
    height: 32,
    top: 48,
    right: 365,
    bottom: 80,
    left: 278,
  } satisfies PreviewRect,
}

export function previewContentInsets({
  customNavigation = false,
  tabBarVisible = false,
  tabBarPosition = 'bottom',
}: PreviewContentOptions = {}): PreviewContentInsets {
  const tabBarAtTop = tabBarVisible && tabBarPosition === 'top'
  return {
    top: (customNavigation ? 0 : PREVIEW_DEVICE.hostChromeHeight)
      + (tabBarAtTop ? PREVIEW_DEVICE.tabBarHeight : 0),
    bottom: tabBarVisible && !tabBarAtTop ? PREVIEW_DEVICE.tabBarHeight : 0,
  }
}

export function previewContentHeight(options: PreviewContentOptions = {}): number {
  const insets = previewContentInsets(options)
  return PREVIEW_DEVICE.screenHeight - insets.top - insets.bottom
}

export function previewSystemInfo(windowHeight: number) {
  return {
    SDKVersion: PREVIEW_DEVICE.SDKVersion,
    brand: PREVIEW_DEVICE.brand,
    model: PREVIEW_DEVICE.model,
    system: PREVIEW_DEVICE.system,
    platform: PREVIEW_DEVICE.platform,
    pixelRatio: PREVIEW_DEVICE.pixelRatio,
    screenWidth: PREVIEW_DEVICE.screenWidth,
    screenHeight: PREVIEW_DEVICE.screenHeight,
    windowWidth: PREVIEW_DEVICE.screenWidth,
    windowHeight,
    statusBarHeight: PREVIEW_DEVICE.statusBarHeight,
    language: PREVIEW_DEVICE.language,
    version: PREVIEW_DEVICE.version,
    theme: PREVIEW_DEVICE.theme,
    host: PREVIEW_DEVICE.host,
    enableDebug: false,
    safeArea: { ...PREVIEW_DEVICE.safeArea },
  }
}

export function previewMenuButtonRect(): PreviewRect {
  return { ...PREVIEW_DEVICE.menuButton }
}

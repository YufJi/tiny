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

export type PreviewCutout = 'island' | 'notch' | 'none'
export type PreviewOrientation = 'landscape' | 'portrait'

export type PreviewDeviceProfile = {
  id: string
  label: string
  model: string
  system: string
  orientation: PreviewOrientation
  screenWidth: number
  screenHeight: number
  frameWidth: number
  frameHeight: number
  frameRadius: number
  screenRadius: number
  framePadding: number
  pixelRatio: number
  statusBarHeight: number
  navigationBarHeight: number
  hostChromeHeight: number
  tabBarHeight: number
  homeIndicatorHeight: number
  homeIndicatorWidth: number
  homeIndicatorBottom: number
  cutout: PreviewCutout
  cutoutWidth: number
  cutoutHeight: number
  cutoutTop: number
  cutoutLeft: number
  safeArea: PreviewSafeArea
  safeAreaInset: {
    top: number
    right: number
    bottom: number
    left: number
  }
  menuButton: PreviewRect
}

const DEVICE_FRAME_PADDING = 12
const HOME_INDICATOR_HEIGHT = 34
const TAB_BAR_HEIGHT = 50
/**
 * WeChat DevTools' simulated keyboard reports this logical height to the
 * mini-program (`showKeyboard` success). Keep it device-independent so the
 * focus/keyboardheightchange details match the reference simulator.
 */
export const PREVIEW_KEYBOARD_HEIGHT = 200

function device(profile: Omit<
  PreviewDeviceProfile,
  | 'frameWidth'
  | 'frameHeight'
  | 'hostChromeHeight'
  | 'homeIndicatorHeight'
  | 'framePadding'
  | 'cutoutLeft'
  | 'orientation'
  | 'safeArea'
  | 'safeAreaInset'
>): PreviewDeviceProfile {
  const safeTop = profile.statusBarHeight
  const safeBottom = profile.screenHeight - HOME_INDICATOR_HEIGHT
  return {
    ...profile,
    orientation: 'portrait',
    cutoutLeft: 0,
    framePadding: DEVICE_FRAME_PADDING,
    frameWidth: profile.screenWidth + DEVICE_FRAME_PADDING * 2,
    frameHeight: profile.screenHeight + DEVICE_FRAME_PADDING * 2,
    hostChromeHeight: profile.statusBarHeight + profile.navigationBarHeight,
    homeIndicatorHeight: HOME_INDICATOR_HEIGHT,
    safeArea: {
      top: safeTop,
      bottom: safeBottom,
      left: 0,
      right: profile.screenWidth,
      width: profile.screenWidth,
      height: safeBottom - safeTop,
    },
    safeAreaInset: {
      top: safeTop,
      right: 0,
      bottom: HOME_INDICATOR_HEIGHT,
      left: 0,
    },
  }
}

export const PREVIEW_DEVICES: readonly PreviewDeviceProfile[] = [
  device({
    id: 'iphone-x',
    label: 'iPhone X',
    model: 'iPhone X',
    system: 'iOS 16.0',
    screenWidth: 375,
    screenHeight: 812,
    frameRadius: 54,
    screenRadius: 42,
    pixelRatio: 2,
    statusBarHeight: 44,
    navigationBarHeight: 44,
    tabBarHeight: TAB_BAR_HEIGHT,
    homeIndicatorWidth: 134,
    homeIndicatorBottom: 8,
    cutout: 'notch',
    cutoutWidth: 156,
    cutoutHeight: 30,
    cutoutTop: 0,
    menuButton: {
      width: 87,
      height: 32,
      top: 48,
      right: 365,
      bottom: 80,
      left: 278,
    },
  }),
  device({
    id: 'iphone-13',
    label: 'iPhone 13',
    model: 'iPhone 13',
    system: 'iOS 16.0',
    screenWidth: 390,
    screenHeight: 844,
    frameRadius: 58,
    screenRadius: 47,
    pixelRatio: 3,
    statusBarHeight: 47,
    navigationBarHeight: 44,
    tabBarHeight: TAB_BAR_HEIGHT,
    homeIndicatorWidth: 134,
    homeIndicatorBottom: 8,
    cutout: 'notch',
    cutoutWidth: 162,
    cutoutHeight: 30,
    cutoutTop: 0,
    menuButton: {
      width: 87,
      height: 32,
      top: 50,
      right: 380,
      bottom: 82,
      left: 293,
    },
  }),
  device({
    id: 'iphone-14-pro-max',
    label: 'iPhone 14 Pro Max',
    model: 'iPhone 14 Pro Max',
    system: 'iOS 16.0',
    screenWidth: 430,
    screenHeight: 932,
    frameRadius: 64,
    screenRadius: 55,
    pixelRatio: 3,
    statusBarHeight: 59,
    navigationBarHeight: 44,
    tabBarHeight: TAB_BAR_HEIGHT,
    homeIndicatorWidth: 148,
    homeIndicatorBottom: 8,
    cutout: 'island',
    cutoutWidth: 126,
    cutoutHeight: 37,
    cutoutTop: 10,
    menuButton: {
      width: 87,
      height: 32,
      top: 62,
      right: 423,
      bottom: 94,
      left: 336,
    },
  }),
]

export const DEFAULT_PREVIEW_DEVICE_ID = PREVIEW_DEVICES[0]!.id
export const PREVIEW_DEVICE = PREVIEW_DEVICES[0]!

export function getPreviewDevice(id?: string | null): PreviewDeviceProfile {
  return PREVIEW_DEVICES.find((deviceProfile) => deviceProfile.id === id) ?? PREVIEW_DEVICE
}

export function orientPreviewDevice(
  deviceProfile: PreviewDeviceProfile,
  orientation: PreviewOrientation,
): PreviewDeviceProfile {
  if (orientation === 'portrait') return deviceProfile
  const screenWidth = deviceProfile.screenHeight
  const screenHeight = deviceProfile.screenWidth
  const safeAreaInset = {
    top: 0,
    right: 44,
    bottom: 21,
    left: 44,
  }
  return {
    ...deviceProfile,
    orientation: 'landscape',
    screenWidth,
    screenHeight,
    frameWidth: screenWidth + deviceProfile.framePadding * 2,
    frameHeight: screenHeight + deviceProfile.framePadding * 2,
    statusBarHeight: 0,
    hostChromeHeight: deviceProfile.navigationBarHeight,
    cutoutWidth: deviceProfile.cutoutHeight,
    cutoutHeight: deviceProfile.cutoutWidth,
    cutoutTop: 0,
    cutoutLeft: 0,
    safeArea: {
      top: safeAreaInset.top,
      right: screenWidth - safeAreaInset.right,
      bottom: screenHeight - safeAreaInset.bottom,
      left: safeAreaInset.left,
      width: screenWidth - safeAreaInset.left - safeAreaInset.right,
      height: screenHeight - safeAreaInset.top - safeAreaInset.bottom,
    },
    safeAreaInset,
    menuButton: {
      width: 87,
      height: 32,
      top: 4,
      right: screenWidth - safeAreaInset.right - 10,
      bottom: 36,
      left: screenWidth - safeAreaInset.right - 97,
    },
  }
}

export function resolvePreviewDevice(
  id?: string | null,
  orientation: PreviewOrientation = 'portrait',
): PreviewDeviceProfile {
  return orientPreviewDevice(getPreviewDevice(id), orientation)
}

export const PREVIEW_DEVICE_META = {
  language: 'zh_CN',
  version: '8.0.0',
  theme: 'light',
  brand: 'devtools',
  platform: 'devtools',
  SDKVersion: '3.0.0',
  host: 'WeChat',
  enableDebug: false,
} as const

export function previewContentInsets(
  {
    customNavigation = false,
    tabBarVisible = false,
    tabBarPosition = 'bottom',
  }: PreviewContentOptions = {},
  deviceProfile: PreviewDeviceProfile = PREVIEW_DEVICE,
): PreviewContentInsets {
  const tabBarAtTop = tabBarVisible && tabBarPosition === 'top'
  return {
    top: (customNavigation ? 0 : deviceProfile.hostChromeHeight)
      + (tabBarAtTop ? deviceProfile.tabBarHeight : 0),
    bottom: tabBarVisible && !tabBarAtTop ? deviceProfile.tabBarHeight : 0,
  }
}

export function previewContentHeight(
  options: PreviewContentOptions = {},
  deviceProfile: PreviewDeviceProfile = PREVIEW_DEVICE,
): number {
  const insets = previewContentInsets(options, deviceProfile)
  return deviceProfile.screenHeight - insets.top - insets.bottom
}

export function previewSystemInfo(
  windowHeight: number,
  deviceProfile: PreviewDeviceProfile = PREVIEW_DEVICE,
) {
  return {
    SDKVersion: PREVIEW_DEVICE_META.SDKVersion,
    brand: PREVIEW_DEVICE_META.brand,
    model: deviceProfile.model,
    system: deviceProfile.system,
    platform: PREVIEW_DEVICE_META.platform,
    pixelRatio: deviceProfile.pixelRatio,
    screenWidth: deviceProfile.screenWidth,
    screenHeight: deviceProfile.screenHeight,
    windowWidth: deviceProfile.screenWidth,
    windowHeight,
    statusBarHeight: deviceProfile.statusBarHeight,
    language: PREVIEW_DEVICE_META.language,
    version: PREVIEW_DEVICE_META.version,
    theme: PREVIEW_DEVICE_META.theme,
    host: PREVIEW_DEVICE_META.host,
    enableDebug: PREVIEW_DEVICE_META.enableDebug,
    safeArea: { ...deviceProfile.safeArea },
  }
}

export function previewMenuButtonRect(
  deviceProfile: PreviewDeviceProfile = PREVIEW_DEVICE,
): PreviewRect {
  return { ...deviceProfile.menuButton }
}

export function previewKeyboardHeight(
  _deviceProfile: PreviewDeviceProfile = PREVIEW_DEVICE,
): number {
  return PREVIEW_KEYBOARD_HEIGHT
}

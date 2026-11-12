// Keep every devtool URL document-relative: the same build is served at `/`
// by `vite`, at `/devtool/` by the website, and under a GitHub Pages
// repository prefix such as `/tiny/devtool/`.
import { PREVIEW_DEVICE } from './previewDevice';

export const APPS_REGISTRY_URL = './runtime/apps.json';
export const DEVICE_SCREEN_WIDTH = PREVIEW_DEVICE.screenWidth;
export const DEVICE_SCREEN_HEIGHT = PREVIEW_DEVICE.screenHeight;
export const DEVICE_FRAME_WIDTH = DEVICE_SCREEN_WIDTH + 24;
export const DEVICE_FRAME_HEIGHT = DEVICE_SCREEN_HEIGHT + 24;
export const STATUS_BAR_HEIGHT = PREVIEW_DEVICE.statusBarHeight;
export const NAV_BAR_HEIGHT = PREVIEW_DEVICE.navigationBarHeight;
export const HOST_CHROME_HEIGHT = PREVIEW_DEVICE.hostChromeHeight;
export const TAB_BAR_HEIGHT = PREVIEW_DEVICE.tabBarHeight;
export const MAX_LIVE_APPS = 3;
export const MAX_PAGE_STACK = 10;

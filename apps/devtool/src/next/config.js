// Keep every devtool URL document-relative: the same build is served at `/`
// by `rspack serve`, at `/devtool/` by the website, and under a GitHub Pages
// repository prefix such as `/tiny/devtool/`.
export const APPS_REGISTRY_URL = './runtime/apps.json';
export const DEFAULT_APP_ID = 'demo';
export const DEVICE_SCREEN_WIDTH = 375;
export const DEVICE_SCREEN_HEIGHT = 812;
export const DEVICE_FRAME_WIDTH = DEVICE_SCREEN_WIDTH + 24;
export const DEVICE_FRAME_HEIGHT = DEVICE_SCREEN_HEIGHT + 24;
export const STATUS_BAR_HEIGHT = 44;
export const NAV_BAR_HEIGHT = 44;
export const HOST_CHROME_HEIGHT = STATUS_BAR_HEIGHT + NAV_BAR_HEIGHT;

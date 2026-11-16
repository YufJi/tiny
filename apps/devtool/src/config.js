// Keep every devtool URL document-relative: the same build is served at `/`
// by `vite`, at `/devtool/` by the website, and under a GitHub Pages
// repository prefix such as `/tiny/devtool/`.
export const APPS_REGISTRY_URL = './runtime/apps.json';
export const MAX_LIVE_APPS = 3;
export const MAX_PAGE_STACK = 10;

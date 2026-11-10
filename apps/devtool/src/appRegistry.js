import { APPS_REGISTRY_URL } from './config';

export function generatedBaseFor(appId) {
  // Resolve against the current document so the same helper works in the
  // panel (`/devtool/`), in the thread iframes (`service.html`), and
  // under an arbitrary deployment prefix.
  return new URL(
    `./runtime/apps/${encodeURIComponent(appId)}/generated`,
    window.location.href,
  ).href;
}

export async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${url} responded with HTTP ${response.status}`);
  }
  return response.json();
}

export function normalizeApps(payload) {
  if (!payload || !Array.isArray(payload.apps)) {
    throw new Error(`${APPS_REGISTRY_URL} must contain an "apps" array`);
  }
  return payload.apps
    .filter((app) => app && typeof app.id === 'string' && app.id.length > 0)
    .map((app) => ({
      id: app.id,
      label: typeof app.label === 'string' && app.label ? app.label : `tests/apps/${app.id}`,
      title: typeof app.title === 'string' ? app.title : '',
      pages: Number(app.pages) || 0,
      firstPage: typeof app.firstPage === 'string' ? app.firstPage : '',
    }));
}

function systemTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function effectiveConfig(manifest, theme) {
  const configuration = manifest?.app?.configuration;
  if (theme === 'dark' && configuration?.darkEffective) return configuration.darkEffective;
  return configuration?.effective ?? {};
}

export function resolveNavigationConfig(manifest, pagePath, fallbackTitle = '', theme = systemTheme()) {
  const appWindow = effectiveConfig(manifest, theme).window ?? {};
  const pageArtifact = manifest?.pages?.find((page) => page.path === pagePath);
  const pageConfiguration = pageArtifact?.configuration;
  const pageConfig = (theme === 'dark' && pageConfiguration?.darkEffective)
    ? pageConfiguration.darkEffective
    : pageConfiguration?.effective ?? {};
  const merged = { ...appWindow, ...pageConfig };
  return {
    title: typeof merged.navigationBarTitleText === 'string' && merged.navigationBarTitleText
      ? merged.navigationBarTitleText
      : fallbackTitle,
    backgroundColor: typeof merged.navigationBarBackgroundColor === 'string' && merged.navigationBarBackgroundColor
      ? merged.navigationBarBackgroundColor
      : '#f7f7f7',
    textStyle: merged.navigationBarTextStyle === 'white' ? 'white' : 'black',
    custom: merged.navigationStyle === 'custom',
  };
}

function normalizePagePath(value) {
  return String(value || '').replace(/^\/+/, '');
}

export function resolveTabBarPage(manifest, pagePath) {
  const tabBar = manifest?.app?.configuration?.effective?.tabBar;
  if (!tabBar || typeof tabBar !== 'object' || tabBar.custom) return false;
  const list = Array.isArray(tabBar.list) ? tabBar.list : [];
  const path = normalizePagePath(pagePath);
  return list.some((item) => item && normalizePagePath(item.pagePath) === path);
}

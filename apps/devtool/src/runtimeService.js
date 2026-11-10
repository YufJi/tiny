import { bootServiceEntry } from '@tiny/host-web';
import { generatedBaseFor } from './appRegistry';

const search = new URLSearchParams(window.location.search);
const appId = search.get('app') || 'demo';
const generatedBase = generatedBaseFor(appId);
const resolveAssetUrl = (assetPath) => (
  `${generatedBase}/${assetPath.split('/').map(encodeURIComponent).join('/')}`
);
// The preview is an iPhone X. The service iframe is 0x0, so window.innerWidth
// cannot provide the host geometry; mirror the capsule used by the panel.
const PREVIEW_WIDTH = 375;
const PREVIEW_HEIGHT = 812;
// Host facts the preview reports to the mini program (WeChat always has them).
const DEVICE_INFO = {
  SDKVersion: '3.0.0',
  brand: 'devtools',
  model: 'iPhone X',
  system: 'iOS 16.0',
  platform: 'devtools',
  statusBarHeight: 44,
};
const manifestPromise = fetch(`${generatedBase}/manifest.json`, { cache: 'no-store' })
  .then((response) => response.json());
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

const createHostApiExtensions = () => ({
  getDeviceInfo: () => ({ ...DEVICE_INFO }),
  getWindowInfo: () => ({
    ...DEVICE_INFO,
    pixelRatio: 2,
    screenWidth: PREVIEW_WIDTH,
    screenHeight: PREVIEW_HEIGHT,
    windowWidth: PREVIEW_WIDTH,
    windowHeight: PREVIEW_HEIGHT,
    safeArea: {
      top: DEVICE_INFO.statusBarHeight,
      bottom: PREVIEW_HEIGHT,
      left: 0,
      right: PREVIEW_WIDTH,
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT - DEVICE_INFO.statusBarHeight,
    },
  }),
  getAppBaseInfo: () => ({
    SDKVersion: DEVICE_INFO.SDKVersion,
    language: 'zh_CN',
    version: '8.0.0',
    theme: 'light',
    host: 'WeChat',
    enableDebug: false,
  }),
  getMenuButtonBoundingClientRect: () => ({
    width: 87,
    height: 32,
    top: 48,
    right: PREVIEW_WIDTH - 10,
    bottom: 80,
    left: PREVIEW_WIDTH - 97,
  }),
  getPerformance: () => ({
    createObserver: () => ({
      observe() {},
      disconnect() {},
      connect() {},
    }),
    now: () => (typeof performance === 'undefined' ? Date.now() : performance.now()),
    mark() {},
    measure() {},
    clearMarks() {},
    clearMeasures() {},
    getEntries: () => [],
    getEntriesByName: () => [],
    getEntriesByType: () => [],
  }),
});

// Wait for the manifest before announcing readiness: the host delivers the
// message port as soon as it sees the ready message, and any frame that
// arrives before the service entry installs its connection is lost.
manifestPromise.then(async (manifest) => {
  const stylePaths = [...new Set(manifest.styles.flatMap((style) => [
    style.outputPath,
    ...(style.lowPriorityPath ? [style.lowPriorityPath] : []),
  ]))];
  const styles = Object.fromEntries(await Promise.all(
    stylePaths.map(async (stylePath) => {
      const response = await fetch(`${generatedBase}/${stylePath}`);
      return [stylePath, await response.text()];
    }),
  ));
  bootServiceEntry({
    manifest,
    initialPath: manifest.pages[0].path,
    apiExtensions: createHostApiExtensions(),
    resolveAssetUrl,
    loadTemplates: async () => (await importGenerated(`${generatedBase}/templates.js`)).default,
    loadStyle: (stylePath) => styles[stylePath] ?? '',
    loadArtifacts: () => importGenerated(`${generatedBase}/service.js`),
    loadSubPackage: async (root) => {
      const pkg = manifest.subPackages?.find((item) => item.root === root);
      if (!pkg?.service) return;
      await importGenerated(`${generatedBase}/${pkg.service}`);
    },
  });
});

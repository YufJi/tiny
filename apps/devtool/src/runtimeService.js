import { bootServiceEntry } from '@tiny/host-web';
import { createApiHost } from '@tiny/api';
import { generatedBaseFor } from './appRegistry';
import { resolvePreviewSafeArea } from './previewStyles';

const search = new URLSearchParams(window.location.search);
const appId = search.get('app') || 'demo';
const generatedBase = generatedBaseFor(appId);
const resolveAssetUrl = (assetPath) => (
  `${generatedBase}/${assetPath.split('/').map(encodeURIComponent).join('/')}`
);
const manifestPromise = fetch(`${generatedBase}/manifest.json`, { cache: 'no-store' })
  .then((response) => response.json());
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

// The service iframe is 0x0, so device facts and the live window box come from
// the host through the synchronous API channel.
const systemInfo = (context) => {
  const info = context.connection.callSync('api', 'system.info');
  if (!info || typeof info !== 'object') {
    throw new Error('the devtool host did not provide system info');
  }
  return info;
};

const createHostApiExtensions = (context) => ({
  getDeviceInfo: () => {
    const info = systemInfo(context);
    return {
      brand: info.brand,
      model: info.model,
      system: info.system,
      platform: info.platform,
      pixelRatio: info.pixelRatio,
    };
  },
  getWindowInfo: () => {
    const info = systemInfo(context);
    return {
      pixelRatio: info.pixelRatio,
      screenWidth: info.screenWidth,
      screenHeight: info.screenHeight,
      windowWidth: info.windowWidth,
      windowHeight: info.windowHeight,
      statusBarHeight: info.statusBarHeight,
      safeArea: info.safeArea,
      screenTop: 0,
    };
  },
  getAppBaseInfo: () => {
    const info = systemInfo(context);
    return {
      SDKVersion: info.SDKVersion,
      language: info.language,
      version: info.version,
      theme: info.theme,
      host: info.host,
      enableDebug: info.enableDebug,
    };
  },
  getMenuButtonBoundingClientRect: () => (
    context.connection.callSync('api', 'system.menuButton')
  ),
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
      return [stylePath, resolvePreviewSafeArea(await response.text())];
    }),
  ));
  bootServiceEntry({
    manifest,
    initialPath: manifest.pages[0].path,
    apiHost: (context) => createApiHost(context, createHostApiExtensions(context)),
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

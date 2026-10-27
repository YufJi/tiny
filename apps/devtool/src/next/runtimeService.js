import { bootServiceThread } from '@tiny/runtime';
import {
  createBrowserCanvasAdapter,
  installBrowserCanvasCompat,
  listenForRuntimePort,
} from '@tiny/host-browser';
import { generatedBaseFor } from './appRegistry';

const search = new URLSearchParams(window.location.search);
const appId = search.get('app') || 'demo';
const logicLayer = search.get('logic') === 'service' ? 'service' : undefined;
const generatedBase = generatedBaseFor(appId);
const resolveAssetUrl = (assetPath) => (
  `${generatedBase}/${assetPath.split('/').map(encodeURIComponent).join('/')}`
);
// The preview is an iPhone X. The service iframe is 0x0, so window.innerWidth
// cannot provide the host geometry; mirror the capsule used by the panel.
const PREVIEW_WIDTH = 375;
const manifestPromise = fetch(`${generatedBase}/manifest.json`, { cache: 'no-store' })
  .then((response) => response.json());
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

const createHostApiExtensions = () => ({
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
// arrives before `bootServiceThread` installs its connection is lost.
installBrowserCanvasCompat();

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
  listenForRuntimePort('service', (transport) => {
    bootServiceThread({
      transport,
      manifest,
      initialPath: manifest.pages[0].path,
      apiExtensions: createHostApiExtensions(),
      resolveAssetUrl,
      canvas: createBrowserCanvasAdapter(),
      ...(logicLayer ? {
        logicLayer,
        loadTemplates: async () => (await importGenerated(`${generatedBase}/templates.js`)).default,
        loadStyle: (stylePath) => styles[stylePath] ?? '',
      } : {}),
      loadArtifacts: () => importGenerated(`${generatedBase}/service.js`),
    });
  });
});

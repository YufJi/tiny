import { bootServiceThread } from '@tiny/runtime';
import {
  createBridgedCanvas,
  createLegacyCanvasContext,
  installBrowserCanvasCompat,
  listenForRuntimePort,
} from '@tiny/host-browser';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = `/runtime/apps/${encodeURIComponent(appId)}/generated`;
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

manifestPromise.then((manifest) => {
  listenForRuntimePort('service', (transport) => {
    bootServiceThread({
      transport,
      manifest,
      initialPath: manifest.pages[0].path,
      apiExtensions: createHostApiExtensions(),
      canvas: {
        createLegacyCanvasContext,
        createCanvasNode: (width, height, canvasId, send) => {
          const bridged = createBridgedCanvas(width, height, canvasId, send);
          return bridged ? bridged.canvas : null;
        },
      },
      loadArtifacts: () => importGenerated(`${generatedBase}/service.js`),
    });
  });
});

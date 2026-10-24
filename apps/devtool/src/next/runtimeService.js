import { bootServiceThread } from '@tiny/runtime';
import {
  createBridgedCanvas,
  createLegacyCanvasContext,
  installBrowserCanvasCompat,
  listenForRuntimePort,
} from '@tiny/host-browser';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = `/runtime/apps/${appId}/generated`;
const manifestPromise = fetch(`${generatedBase}/manifest.json`).then((response) => response.json());
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

const createHostApiExtensions = () => ({
  getMenuButtonBoundingClientRect: () => {
    const width = typeof window === 'undefined' ? 375 : window.innerWidth;
    return {
      width: 87,
      height: 32,
      top: 24,
      right: width - 10,
      bottom: 56,
      left: Math.max(0, width - 97),
    };
  },
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

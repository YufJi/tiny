import * as glassEasel from 'glass-easel';
import { CurrentWindowBackendContext } from 'glass-easel';
import { bootRenderThread } from '@tiny/runtime';
import {
  installOffscreenCanvasResponder,
  installPageLifecycleBridge,
  listenForRuntimePort,
  measureBrowserCanvas,
} from '@tiny/host-browser';
import { webBuiltinComponents } from '@tiny/host-web-components';
import { generatedBaseFor } from './appRegistry';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = generatedBaseFor(appId);
const importGenerated = (url) => new Function('url', 'return import(url)')(url);
const resolveAssetUrl = (assetPath) => (
  `${generatedBase}/${assetPath.split('/').map(encodeURIComponent).join('/')}`
);

installOffscreenCanvasResponder();

const assetsPromise = (async () => {
  const manifest = await fetch(`${generatedBase}/manifest.json`, { cache: 'no-store' })
    .then((response) => response.json());
  const renderModule = await importGenerated(`${generatedBase}/render.js`);
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
  return { manifest, templates: renderModule.default.templates, styles };
})();

// Announce readiness only after all artifacts are ready, so the host cannot
// deliver the message port before the render connection is installed.
assetsPromise.then(({ manifest, templates, styles }) => {
  listenForRuntimePort('render', (transport) => {
    const backend = new CurrentWindowBackendContext();
    backend.onEvent(glassEasel.Event.triggerBackendEvent);
    const runtime = bootRenderThread({
      transport,
      manifest,
      artifacts: { templates },
      backend,
      builtinComponents: webBuiltinComponents,
      initialPath: manifest.pages[0].path,
      loadStyle: (path) => styles[path] ?? '',
      resolveAssetUrl,
      canvas: {
        measure: measureBrowserCanvas,
      },
      mountComponent: (component) => {
        const container = document.getElementById('app') ?? document.body;
        const placeholder = document.createElement('div');
        container.appendChild(placeholder);
        glassEasel.Element.replaceDocumentElement(component, container, placeholder);
      },
      unmountComponent: (component) => {
        const element = component.getBackendElement ? component.getBackendElement() : null;
        if (element && element.remove) element.remove();
      },
    });
    // Each page owns this iframe, so its scroll container drives the page
    // lifecycle events (onPageScroll / onReachBottom) instead of the host.
    installPageLifecycleBridge(runtime.connection);
  });
});

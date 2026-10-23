import * as glassEasel from 'glass-easel';
import { CurrentWindowBackendContext } from 'glass-easel';
import { bootRenderThread, listenForRuntimePort } from '@tiny/runtime';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = `/runtime/apps/${appId}/generated`;
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

const assetsPromise = (async () => {
  const manifest = await fetch(`${generatedBase}/manifest.json`).then((response) => response.json());
  const renderModule = await importGenerated(`${generatedBase}/render.js`);
  const styles = Object.fromEntries(await Promise.all(
    manifest.styles.map(async (style) => {
      const response = await fetch(`${generatedBase}/${style.outputPath}`);
      return [style.outputPath, await response.text()];
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
    bootRenderThread({
      transport,
      manifest,
      artifacts: { templates },
      backend,
      initialPath: manifest.pages[0].path,
      loadStyle: (path) => styles[path] ?? '',
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
  });
});

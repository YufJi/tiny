import { resolveAssetReference } from '@tiny/runtime';
import { bootRenderEntry } from '@tiny/host-web';
import { generatedBaseFor } from './appRegistry';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = generatedBaseFor(appId);
// Keep the dynamic import out of Vite's static analysis, like the service entry.
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

bootRenderEntry({
  // Two-evaluation: the render thread owns the component shadow trees, so it
  // loads the same compiled template bundle as the service.
  loadTemplates: async () => (await importGenerated(`${generatedBase}/templates.js`)).default,
  resolveAssetUrl: (src, sourcePath) => {
    const reference = resolveAssetReference(sourcePath || '', src);
    return reference ? `${generatedBase}/${reference.path}${reference.suffix}` : undefined;
  },
});

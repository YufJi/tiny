import { resolveAssetPath } from '@tiny/runtime';
import { bootBrowserRenderEntry } from '@tiny/host-browser';
import { createGlassRenderEntry } from '@tiny/host-web-components';
import { generatedBaseFor } from './appRegistry';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = generatedBaseFor(appId);
// Keep the dynamic import out of Vite's static analysis, like the service entry.
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

bootBrowserRenderEntry(createGlassRenderEntry({
  // Two-evaluation: the render thread owns the component shadow trees, so it
  // loads the same compiled template bundle as the service.
  loadTemplates: async () => (await importGenerated(`${generatedBase}/templates.js`)).default,
  resolveAssetUrl: (src, sourcePath) => {
    const resolved = resolveAssetPath(sourcePath || '', src);
    return resolved ? `${generatedBase}/${resolved}` : undefined;
  },
}));

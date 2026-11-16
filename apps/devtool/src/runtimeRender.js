import { resolveAssetReference } from '@tiny/runtime';
import { bootRenderEntry } from '@tiny/host-web';
import { generatedBaseFor } from './appRegistry';
import { getPreviewDevice } from './previewDevice';
import { installPreviewSafeAreaVariables } from './previewStyles';

const search = new URLSearchParams(window.location.search);
const appId = search.get('app') || 'demo';
const device = getPreviewDevice(search.get('device'));
const generatedBase = generatedBaseFor(appId);
// Keep the dynamic import out of Vite's static analysis, like the service entry.
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

installPreviewSafeAreaVariables(device);

bootRenderEntry({
  // The render pageframe owns WXML, so it loads the compiled template bundle.
  loadTemplates: async () => (await importGenerated(`${generatedBase}/templates.js`)).default,
  resolveAssetUrl: (src, sourcePath) => {
    const reference = resolveAssetReference(sourcePath || '', src);
    return reference ? `${generatedBase}/${reference.path}${reference.suffix}` : undefined;
  },
});

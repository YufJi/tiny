import { resolveAssetPath } from '@tiny/runtime';
import { bootBrowserRenderEntry } from '@tiny/host-browser';
import { createGlassRenderEntry } from '@tiny/host-web-components';
import { generatedBaseFor } from './appRegistry';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = generatedBaseFor(appId);

bootBrowserRenderEntry(createGlassRenderEntry({
  resolveAssetUrl: (src, sourcePath) => {
    const resolved = resolveAssetPath(sourcePath || '', src);
    return resolved ? `${generatedBase}/${resolved}` : undefined;
  },
}));

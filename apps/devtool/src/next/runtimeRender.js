import { resolveAssetPath } from '@tiny/runtime';
import {
  installOffscreenCanvasResponder,
  listenForRuntimePort,
} from '@tiny/host-browser';
import { bootGlassRenderEntry } from '@tiny/host-web-components';
import { generatedBaseFor } from './appRegistry';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = generatedBaseFor(appId);

installOffscreenCanvasResponder();

listenForRuntimePort('render', (transport) => {
  bootGlassRenderEntry({
    transport,
    resolveAssetUrl: (src, sourcePath) => {
      const resolved = resolveAssetPath(sourcePath || '', src);
      return resolved ? `${generatedBase}/${resolved}` : undefined;
    },
  });
});

import { bootTreeThread, resolveAssetPath } from '@tiny/runtime';
import {
  installOffscreenCanvasResponder,
  listenForRuntimePort,
} from '@tiny/host-browser';
import {
  BUILTIN_BASE_STYLES,
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
  createGlassRenderTree,
} from '@tiny/host-web-components';
import { generatedBaseFor } from './appRegistry';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = generatedBaseFor(appId);

installOffscreenCanvasResponder();

listenForRuntimePort('render', (transport) => {
  const style = document.createElement('style');
  style.setAttribute('data-tiny-tree-styles', '');
  style.textContent = [
    BUILTIN_BASE_STYLES,
    BUILTIN_HOST_STYLES,
    ...BUILTIN_COMPONENT_STYLES.map((item) => (
      typeof item === 'string' ? item : item.content
    )),
  ].join('\n');
  document.head.appendChild(style);
  const renderer = createGlassRenderTree({
    container: document.getElementById('app') ?? document.body,
    resolveAssetUrl: (src, sourcePath) => {
      const resolved = resolveAssetPath(sourcePath || '', src);
      return resolved ? `${generatedBase}/${resolved}` : undefined;
    },
  });
  bootTreeThread({ transport, renderer });
});

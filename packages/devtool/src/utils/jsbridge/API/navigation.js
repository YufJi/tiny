import global from '@/utils/global';
import { createRenderIframe } from '@/utils/createIframe';
import { createGuid } from '@/utils/';
import store from '@/store';

const { dispatch } = store;

export function pushWindow(params) {
  const { launchParamsTag, param, url } = params;

  doPushWindow(url, launchParamsTag);
}

export function doPushWindow(url, tag) {
  const src = `render.html${url}`;
  const guid = createGuid('render');
  const pageIframe = createRenderIframe({
    guid,
    src,
    onload: (iframe) => {
      iframe.setAttribute('path', tag);
      iframe.path = tag;
    },
  });
  global.currentRender = pageIframe;
  global.renders[guid] = pageIframe;
  global.pagesStack.push(guid);

  // setNavConfig
  const { launchParams } = global.appConfig;
  dispatch.nav.setNavConfig(launchParams[tag] || {});
}

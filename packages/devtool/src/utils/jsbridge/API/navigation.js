/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * @Author: YufJ
 * @Date: 2021-04-20 13:54:09
 * @LastEditTime: 2021-08-13 17:43:35
 * @Description:
 * @FilePath: /tiny-v1/packages/devtool/src/utils/jsbridge/API/navigation.js
 */
import global from '@/utils/global';
import { createRenderIframe, precreateRenderIframe } from '@/utils/createIframe';
import { createGuid } from '@/utils/';
import store from '@/store';

const { dispatch } = store;

export function pushWindow(params) {
  const { launchParamsTag, param, url } = params;

  doPushWindow(url, launchParamsTag);
}

export function popTo(params) {
  console.log('params', params);
  const { delta } = params;

  // todo popWebview
  console.log(global.renders, global.pagesStack);
}

export async function doPushWindow(tag, callback) {
  let iframe;

  if (global.preloadRenders.length) {
    iframe = global.preloadRenders.shift();

    iframe.setAttribute('path', tag);
    iframe.path = tag;

    const container = document.getElementById('pageFrames');
    container.appendChild(iframe);

    const generateFunc = iframe.contentWindow.generateFunc[tag];
    generateFunc(guid);
  } else {
    iframe = await createRenderIframe({
      guid: createGuid('render'),
      src: 'render.html?debug=framework',
      onload: (frame) => {
        frame.setAttribute('path', tag);
        frame.path = tag;

        const generateFunc = frame.contentWindow.generateFunc[tag];
        generateFunc(frame.id);

        if (typeof callback === 'function') {
          callback(frame);
        }
      },
    });
  }

  global.currentRender = iframe;
  global.renders[iframe.id] = iframe;
  global.pagesStack.push(iframe.id);

  // setNavConfig
  const { launchParams } = global.appConfig;
  dispatch.nav.setNavConfig(launchParams[tag] || {});

  preloadWindow();

  return iframe;
}

function preloadWindow() {
  const guid = createGuid('render');
  const iframe = precreateRenderIframe({
    guid,
    src: 'render.html?debug=framework',
  });

  global.preloadRenders.push(iframe);
}

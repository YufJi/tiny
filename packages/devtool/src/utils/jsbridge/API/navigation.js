/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * @Author: YufJ
 * @Date: 2021-04-20 13:54:09
 * @LastEditTime: 2021-08-13 17:43:35
 * @Description:
 * @FilePath: /tiny-v1/packages/devtool/src/utils/jsbridge/API/navigation.js
 */
import global from '@/utils/global';
import { createRenderIframe, precreateRenderIframe, removeRenderIframeById } from '@/utils/createIframe';
import { createGuid } from '@/utils/';
import store from '@/store';

const { dispatch } = store;

export function navigateTo(params) {
  const { paramsString } = params;
  const { url } = JSON.parse(paramsString);

  pushWindow(url).then((iframe) => {
    global.worker.contentWindow.JSBridge.subscribeHandler('onAppRoute', JSON.stringify({
      path: iframe.path,
      openType: 'navigateTo',
    }), iframe.id);
  });
}

export function navigateBack(params) {
  const { paramsString } = params;
  const { delta } = JSON.parse(paramsString);

  const lastIframe = popWindow(delta);

  global.worker.contentWindow.JSBridge.subscribeHandler('onAppRoute', JSON.stringify({
    path: lastIframe.path,
    openType: 'navigateBack',
  }), lastIframe.id);
}

export async function pushWindow(url, callback) {
  let iframe;

  if (global.preloadRenders.length) {
    iframe = global.preloadRenders.shift();

    iframe.setAttribute('path', url);
    iframe.path = url;

    const generateFunc = iframe.contentWindow.generateFunc[url];
    generateFunc(guid);

    const container = document.getElementById('pageFrames');
    container.appendChild(iframe);
  } else {
    iframe = await createRenderIframe({
      guid: createGuid('render'),
      src: 'render.html?debug=framework',
      onload: (frame) => {
        frame.setAttribute('path', url);
        frame.path = url;

        const generateFunc = frame.contentWindow.generateFunc[url];
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
  dispatch.nav.setNavConfig(launchParams[url] || {});

  preloadWindow();

  return iframe;
}

export function popWindow(delta = 1) {
  if (!delta) return;

  if (delta >= global.pagesStack.length) {
    delta = global.pagesStack.length - 1;
  }
  const deletePages = global.pagesStack.slice(global.pagesStack.length - delta);
  // 删除iframe
  deletePages.forEach((id) => {
    if (global.renders[id]) {
      removeRenderIframeById(id);
    }
  });

  global.pagesStack = global.pagesStack.slice(0, -1 * delta);
  global.currentRender = global.renders[global.pagesStack[global.pagesStack.length - 1]];

  return global.currentRender;
}

// 预初始化iframe
async function preloadWindow() {
  const guid = createGuid('render');
  const iframe = await precreateRenderIframe({
    guid,
    src: 'render.html?debug=framework',
  });

  global.preloadRenders.push(iframe);
}

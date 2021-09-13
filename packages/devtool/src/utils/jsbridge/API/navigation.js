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
  const { url } = params;
  pushWindow(url).then((iframe) => {
    global.worker.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('onAppRoute', '${JSON.stringify({
      path: iframe.path,
      openType: 'navigateTo',
    })}', '${iframe.id}')`);
  });
}

export function navigateBack(params = {}) {
  if (global.pageStack.length > 1) {
    const { delta } = params;

    const lastIframe = popWindow(delta);
  }
}

// 预初始化iframe
async function preloadWindow() {
  const guid = createGuid('webview');
  let iframe;
  try {
    iframe = await precreateRenderIframe({
      guid,
      src: 'biz/webview.html?debug=framework',
    });
    global.preloadRenders.push(iframe);

    console.log('预加载iframe成功:', global.preloadRenders);
  } catch (error) {
    console.log(error);
  }
}

export async function pushWindow(url, callback) {
  let iframe;

  if (global.preloadRenders.length > 0) {
    iframe = global.preloadRenders.shift();
  } else {
    iframe = await createRenderIframe({
      guid: createGuid('webview'),
      src: 'biz/webview.html?debug=framework',
    });
  }

  iframe.setAttribute('path', url);
  iframe.path = url;
  iframe.className = 'frame in';
  iframe.contentWindow.executeJavaScript(`window.generateFunc['${url}']('${iframe.id}')`);

  global.currentRender = iframe;
  global.webviews.set(iframe.id, iframe);
  global.pageStack.push(iframe.id);

  if (typeof callback === 'function') {
    callback(iframe);
  }

  // setNavConfig
  const { launchParams } = global.appConfig;
  dispatch.nav.setNavConfig(launchParams[url] || {});

  preloadWindow();

  return iframe;
}

export function popWindow(delta = 1) {
  if (!delta) return;

  if (delta >= global.pageStack.length) {
    delta = global.pageStack.length - 1;
  }
  const deletePages = global.pageStack.slice(global.pageStack.length - delta);
  // 删除iframe
  deletePages.forEach((id) => {
    if (global.webviews.get(id)) {
      removeRenderIframeById(id);
    }
  });

  global.pageStack = global.pageStack.slice(0, -1 * delta);
  global.currentRender = global.webviews.get(global.pageStack[global.pageStack.length - 1]);

  global.worker.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('onAppRoute', '${JSON.stringify({
    path: global.currentRender.path,
    openType: 'navigateBack',
  })}', '${global.currentRender.id}')`);

  return global.currentRender;
}

/* eslint-disable @typescript-eslint/no-use-before-define */
import global from '@/utils/global';
import { createRenderIframe, removeRenderIframeById } from '@/utils/createIframe';
import { createGuid } from '@/utils/';
import store from '@/store';

const { dispatch } = store;

const navigateToEventMap = new Map();

export function navigateToDone(params) {
  const { openerWebviewId } = params;
  const callback = navigateToEventMap.get(openerWebviewId);

  if (typeof callback === 'function') {
    callback({
      errMsg: 'navigateTo:ok',
    });

    navigateToEventMap.delete(openerWebviewId);
  }
}

export function navigateTo(params, webviewIds, callbackId) {
  const { url, pageWebviewId } = params;

  navigateToEventMap.set(pageWebviewId, (data) => {
    global.service.contentWindow.JSBridge.invokeHandler(callbackId, data);
  });

  pushWindow(url).then((iframe) => {
    global.service.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('appRoute', '${JSON.stringify({
      path: iframe.path,
      openType: 'navigateTo',
    })}', '${iframe.id}')`);
  });
}

export function navigateBack(params = {}) {
  const { pageStack } = store.getState().global;
  if (pageStack.length > 1) {
    const { delta } = params;

    const lastIframe = popWindow(delta);
  }
}

let preloadLock = false;
// 预初始化iframe
async function preloadWindow() {
  if (preloadLock) return;

  preloadLock = true;
  const guid = createGuid();
  let iframe;
  try {
    iframe = await createRenderIframe({
      guid,
      src: 'biz/webview.html?debug=framework',
    });
    global.preloadRenders.push(iframe.id);
    preloadLock = false;
    console.log('预加载iframe成功:', global.preloadRenders);
  } catch (error) {
    preloadLock = false;
    console.log(error);
  }
}

export async function pushWindow(url, callback) {
  let iframe;

  if (global.preloadRenders.length > 0) {
    const webviewId = global.preloadRenders.shift();
    iframe = global.webviews.get(webviewId);
  } else {
    try {
      iframe = await createRenderIframe({
        guid: createGuid(),
        src: 'biz/webview.html?debug=framework',
      });
    } catch (error) {
      console.log(error);
    }
  }

  iframe.contentWindow.executeJavaScript(`window.generateFunc['${url}']('${iframe.id}')`);
  iframe.setAttribute('class', 'frame in');
  iframe.setAttribute('path', url);
  iframe.path = url;

  global.currentRender = iframe;

  /* 调试器同步更新 */
  const { pageStack, appConfig } = store.getState().global;
  const { launchParams } = appConfig;
  pageStack.push(iframe.id);
  dispatch.nav.setNavConfig(launchParams[url] || {});
  dispatch.global.setPageStack(pageStack);

  if (typeof callback === 'function') {
    callback(iframe);
  }

  preloadWindow();

  return iframe;
}

export function popWindow(delta = 1) {
  if (!delta) return;

  let { pageStack } = store.getState().global;
  if (delta >= pageStack.length) {
    delta = pageStack.length - 1;
  }

  const deletePages = pageStack.slice(pageStack.length - delta);
  // 删除iframe
  deletePages.forEach((id) => {
    if (global.webviews.get(id)) {
      removeRenderIframeById(id);
    }
  });

  pageStack = pageStack.slice(0, -1 * delta);
  global.currentRender = global.webviews.get(pageStack[pageStack.length - 1]);

  global.service.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('appRoute', '${JSON.stringify({
    path: global.currentRender.path,
    openType: 'navigateBack',
  })}', '${global.currentRender.id}')`);

  /* 调试器同步更新 */
  const { appConfig } = store.getState().global;
  const { launchParams } = appConfig;

  dispatch.nav.setNavConfig(launchParams[global.currentRender.path] || {});
  dispatch.global.setPageStack(pageStack);

  return global.currentRender;
}

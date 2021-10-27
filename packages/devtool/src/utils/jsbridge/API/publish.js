import gloabl from '@/utils/global';
import { forEachWebviewIds } from './util';

export function messageToWorker(method, params, webviewIds) {
  webviewIds.forEach((viewId) => {
    if (gloabl.service) {
      try {
        // gloabl.service.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('${method}', '${params}', '${viewId}')`);
        gloabl.service.contentWindow.JSBridge.subscribeHandler(method, params, viewId);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

export function messageToRender(method, params, webviewIds) {
  forEachWebviewIds(webviewIds, (render) => {
    try {
      render.contentWindow.JSBridge.subscribeHandler(method, params);
    } catch (error) {
      console.error(error);
    }
  });
}
/* publish的webviewIds都是对应的renderId */
export function publish(method, params, webviewIds = [], __IS_SERVICE__) {
  if (__IS_SERVICE__) {
    return messageToRender(method, params, webviewIds);
  } else {
    return messageToWorker(method, params, webviewIds);
  }
}

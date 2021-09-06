import gloabl from '@/utils/global';
import { forEachWebviewIds } from './util';

export function messageToWorker(method, paramsString, webviewIds) {
  webviewIds.forEach((viewId) => {
    if (gloabl.worker) {
      try {
        gloabl.worker.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('${method}', '${paramsString}', '${viewId}')`);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

export function messageToRender(method, paramsString, webviewIds) {
  forEachWebviewIds(webviewIds, (render) => {
    try {
      render.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('${method}', '${paramsString}')`);
    } catch (error) {
      console.error(error);
    }
  });
}
/* publish的webviewIds都是对应的renderId */
export function publish(method, paramsString, webviewIds = [], __IS_WORKER__) {
  if (__IS_WORKER__) {
    return messageToRender(method, paramsString, webviewIds);
  } else {
    return messageToWorker(method, paramsString, webviewIds);
  }
}
